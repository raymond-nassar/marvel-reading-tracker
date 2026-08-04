// Durable state persistence.
//
// User state (lists, read progress, overrides) lives in localStorage and must never fail to
// write because the response cache grew. The cache is in IndexedDB precisely so the two
// cannot compete for the same quota.

import { createEmptyState, migrate, exportBackup, validateBackup } from './lib/model.js';

export const KEY = 'mrt.state.v2';
const TEMP_KEY = 'mrt.state.restore.tmp';
const PRERESTORE_KEY = 'mrt.state.prerestore';
const SALVAGE_KEY = 'mrt.state.salvage';

export class Store {
  constructor({ storage = globalThis.localStorage, onChange = () => {} } = {}) {
    this.storage = storage;
    this.onChange = onChange;
    this.state = createEmptyState();
    this.lastError = null;
    // Set when saved data exists but could not be read. While it is set the store refuses to
    // write, so the unreadable-but-recoverable data on disk is never overwritten.
    this.blocked = false;
  }

  // A failed load must never lead to data loss. Previously this fell back to empty state and
  // the very next user action persisted that empty state over the intact original — most
  // likely to happen on a schema downgrade, which migrate() deliberately throws on. Now the
  // raw value is copied aside and the store is latched read-only until the user decides.
  load() {
    try {
      const raw = this.storage?.getItem(KEY);
      this.state = raw ? migrate(JSON.parse(raw)) : createEmptyState();
      this.blocked = false;
    } catch (err) {
      this.state = createEmptyState();
      this.blocked = true;
      this.salvage();
      this.lastError =
        `Could not read your saved data (${err.message}). It has NOT been changed or deleted. `
        + 'Saving is paused so it cannot be overwritten — download a copy, then choose to start fresh.';
    }
    return this.state;
  }

  // Keeps the first unreadable value. Never overwrites an existing salvage copy: a second
  // failed load must not clobber the good original with something already degraded.
  salvage() {
    try {
      const raw = this.storage?.getItem(KEY);
      if (raw && !this.storage.getItem(SALVAGE_KEY)) this.storage.setItem(SALVAGE_KEY, raw);
    } catch {
      /* salvage is best-effort; never let it throw during boot */
    }
  }

  salvagedRaw() {
    try {
      return this.storage?.getItem(SALVAGE_KEY) ?? this.storage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }

  // Deliberate, user-initiated escape hatch from the blocked state.
  startFresh() {
    this.salvage();
    this.blocked = false;
    this.state = createEmptyState();
    const ok = this.persist(this.state);
    if (ok) this.lastError = null;
    this.onChange(this.state, this.lastError);
    return ok;
  }

  // Applies a pure transformation. If persistence fails, the in-memory state is rolled back
  // so the UI never displays progress that was not actually saved.
  update(fn) {
    const previous = this.state;
    const next = fn(previous);
    if (next === previous) return previous;
    this.state = next;
    if (!this.persist(next)) {
      this.state = previous;
      this.onChange(previous, this.lastError);
      return previous;
    }
    this.lastError = null;
    this.onChange(next, null);
    return next;
  }

  persist(state = this.state) {
    if (this.blocked) {
      this.lastError =
        'Saving is paused because your existing saved data could not be read. '
        + 'Download a copy of it, then choose "Start fresh" to begin saving again.';
      return false;
    }
    if (!this.storage) return true;
    try {
      this.storage.setItem(KEY, JSON.stringify(exportBackup(state)));
      return true;
    } catch (err) {
      this.lastError =
        err?.name === 'QuotaExceededError'
          ? 'Browser storage is full, so that change was not saved. Export a backup, then clear the cache from Settings.'
          : `Could not save that change (${err.message}). It has been undone.`;
      return false;
    }
  }

  // Atomic: validate, stage, snapshot, swap. A malformed backup mutates nothing.
  restore(rawJson) {
    let parsed;
    try {
      parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    } catch (err) {
      return { ok: false, errors: [`Not valid JSON: ${err.message}`] };
    }

    const { ok, errors, state } = validateBackup(parsed);
    if (!ok) return { ok: false, errors };

    const serialized = JSON.stringify(exportBackup(state));
    try {
      this.storage?.setItem(TEMP_KEY, serialized);
      this.storage?.setItem(PRERESTORE_KEY, this.storage.getItem(KEY) ?? '');
      this.storage?.setItem(KEY, serialized);
      this.storage?.removeItem(TEMP_KEY);
    } catch (err) {
      try {
        this.storage?.removeItem(TEMP_KEY);
      } catch {
        /* ignore */
      }
      return { ok: false, errors: [`Could not write the restored data: ${err.message}. Nothing was changed.`] };
    }

    // A successful restore is a deliberate overwrite, so it also clears the block.
    this.blocked = false;
    this.lastError = null;
    this.state = state;
    this.onChange(state, null);
    return { ok: true, errors: [] };
  }

  undoRestore() {
    const prev = this.storage?.getItem(PRERESTORE_KEY);
    if (!prev) return { ok: false, errors: ['No pre-restore snapshot available.'] };
    return this.restore(prev);
  }

  hasPreRestoreSnapshot() {
    return Boolean(this.storage?.getItem(PRERESTORE_KEY));
  }
}
