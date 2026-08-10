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
    // Why saving is paused, held apart from lastError because that slot carries whatever failed
    // most recently and every write attempted while blocked is refused. Set when the read fails
    // and cleared only when the block is genuinely resolved, so it outlives the refusals.
    this.blockedReason = null;
    // Where this incident's copy actually landed, or null if no copy exists. Read back from
    // storage rather than assumed, because setItem can fail silently under quota pressure.
    this.salvageKey = null;
    this.lastUpdateOk = true;
  }

  // A failed load must never lead to data loss. Previously this fell back to empty state and
  // the very next user action persisted that empty state over the intact original. Most
  // likely to happen on a schema downgrade, which migrate() deliberately throws on. Now the
  // raw value is copied aside and the store is latched read-only until the user decides.
  load() {
    try {
      const raw = this.storage?.getItem(KEY);
      this.state = raw ? migrate(JSON.parse(raw)) : createEmptyState();
      this.blocked = false;
      // A read that works is a genuine resolution, so the reason goes with the latch rather than
      // outliving it. Left behind, it would be preferred by the ??= in startFresh over the write
      // error that actually re-latched the store, and the banner would name a schema fault that
      // had already been read past while the real full-quota failure sat only in the save report.
      this.blockedReason = null;
    } catch (err) {
      this.state = createEmptyState();
      this.blocked = true;
      this.salvage();
      // The reason and nothing else. What to do about it is the banner's own paragraph, which
      // said the same three sentences over again: measured in Edge against a schema-version
      // failure, every one of them was on screen three times, because this string was rendered
      // into the banner and into the assertive save pane at once and the paragraph repeats it.
      //
      // Its own slot rather than lastError, because the banner repaints on every render and
      // lastError holds the newest failure. Sharing the slot meant one refused write replaced
      // the reason saving was paused, in the banner and the save report in the same instant, so
      // nothing on screen said why the reader was on that screen at all.
      this.blockedReason = `Could not read your saved data (${err.message}).`;
    }
    return this.state;
  }

  // Sets this incident's value aside and reports whether a copy verifiably exists.
  //
  // Two rules matter here. A previous incident's copy must never be clobbered, so if the main
  // slot already holds different bytes this one is archived under its own key instead of being
  // dropped, otherwise a second corruption months later would be left with no copy at all
  // while salvagedRaw() served the stale blob as if it were the user's data. And the write is
  // read back rather than assumed, because copying the state doubles this origin's footprint,
  // so the near-quota case is exactly when setItem throws and the copy silently never lands.
  salvage() {
    try {
      const raw = this.storage?.getItem(KEY);
      if (!raw) {
        this.salvageKey = null;
        return true; // nothing on disk to lose
      }
      const existing = this.storage.getItem(SALVAGE_KEY);
      const key = !existing || existing === raw ? SALVAGE_KEY : `${SALVAGE_KEY}.${Date.now()}`;
      if (existing !== raw) this.storage.setItem(key, raw);
      const ok = this.storage.getItem(key) === raw;
      this.salvageKey = ok ? key : null;
      return ok;
    } catch {
      this.salvageKey = null;
      return false;
    }
  }

  // Offers this incident's copy, falling back to the live value, which, while blocked, is
  // still the untouched original. Deliberately does not reach for SALVAGE_KEY blindly: that
  // would hand back an older incident's blob while presenting it as the current data.
  salvagedRaw() {
    try {
      if (this.salvageKey) {
        const copy = this.storage?.getItem(this.salvageKey);
        if (copy) return copy;
      }
      return this.storage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }

  // Deliberate, user-initiated escape hatch from the blocked state. Refuses unless a copy of
  // the unreadable data verifiably survives somewhere, so the button the banner tells the user
  // to press cannot destroy their only copy. confirmedDownloaded is the way out when storage is
  // too full to hold a copy: the user has already saved the file to disk themselves.
  startFresh({ confirmedDownloaded = false } = {}) {
    if (!this.salvage() && !confirmedDownloaded) {
      this.lastError =
        'Nothing was cleared: a copy of your unreadable data could not be set aside '
        + '(browser storage is probably full). Use "Download a copy" first, then try again.';
      this.onChange(this.state, this.lastError);
      return false;
    }
    this.blocked = false;
    this.state = createEmptyState();
    const ok = this.persist(this.state);
    if (ok) {
      this.lastError = null;
      // Saving works again, so the reason it was paused is no longer true. Cleared here rather
      // than on the way in, because the write below can fail and leave the store latched, and
      // the read failure would still be the reason.
      this.blockedReason = null;
    } else {
      this.blocked = true; // could not write the empty state; stay latched
      // Kept, not replaced: the data still cannot be read, which is why saving is paused, while
      // the write that just failed is news for the save report. Falls back to that write only
      // when there is no read failure to keep, so a latched store is never left with a banner
      // and nothing to put in it.
      this.blockedReason ??= this.lastError;
    }
    this.onChange(this.state, this.lastError);
    return ok;
  }

  // Applies a pure transformation. If persistence fails, the in-memory state is rolled back
  // so the UI never displays progress that was not actually saved. lastUpdateOk lets callers
  // gate their success messages and navigation on the write actually having happened.
  update(fn) {
    const previous = this.state;
    const next = fn(previous);
    if (next === previous) {
      this.lastUpdateOk = true;
      return previous;
    }
    this.state = next;
    if (!this.persist(next)) {
      this.state = previous;
      this.lastUpdateOk = false;
      this.onChange(previous, this.lastError);
      return previous;
    }
    this.lastError = null;
    this.lastUpdateOk = true;
    this.onChange(next, null);
    return next;
  }

  persist(state = this.state) {
    if (this.blocked) {
      // The news, and not the two steps out, which the banner states already. It goes to the
      // save report alone now: the banner carries the reason saving is paused, which this is
      // not, and which a refused write must no longer be able to overwrite. Saying the pause
      // ends on a choice is what this one adds and the standing copy cannot: it answers what
      // happened to the change that was just attempted.
      this.lastError =
        'That change was not saved. Choose what to do about the data that could not be read, '
        + 'and saving will start again.';
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
    this.blockedReason = null;
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
