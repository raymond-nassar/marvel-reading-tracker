// Durable state persistence.
//
// User state (lists, read progress, overrides) lives in localStorage and must never fail to
// write because the response cache grew. The cache is in IndexedDB precisely so the two
// cannot compete for the same quota.

import { createEmptyState, migrate, exportBackup, validateBackup } from './lib/model.js';

export const KEY = 'mrt.state.v2';
const TEMP_KEY = 'mrt.state.restore.tmp';
const PRERESTORE_KEY = 'mrt.state.prerestore';

export class Store {
  constructor({ storage = globalThis.localStorage, onChange = () => {} } = {}) {
    this.storage = storage;
    this.onChange = onChange;
    this.state = createEmptyState();
    this.lastError = null;
  }

  load() {
    try {
      const raw = this.storage?.getItem(KEY);
      this.state = raw ? migrate(JSON.parse(raw)) : createEmptyState();
    } catch (err) {
      this.lastError = `Could not read saved data (${err.message}). Starting empty; your old data was left untouched.`;
      this.state = createEmptyState();
    }
    return this.state;
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
