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
  // Three rules matter here. A previous incident's copy must never be clobbered, so if the main
  // slot already holds different bytes this one is archived under a name nothing else holds, chosen
  // by freeArchiveKey(), otherwise a second corruption months later would be left with no copy at
  // all while salvagedRaw() served the stale blob as if it were the user's data. A copy that already
  // holds these exact bytes is adopted rather than written again, because the archive key carries
  // the time of the write, so recomputing it per call made every reload of a blocked page write
  // the identical bytes under a new name, and startFresh() salvages before clearing, so the button
  // the banner points at added one more. Measured in Edge: two incidents, two reloads and one
  // Start fresh left five keys where two were needed. That is not merely wasteful. Near the quota,
  // where copying the whole state throws but writing a small empty state still succeeds, the
  // second boot could not write its duplicate and reported that no copy survived, so startFresh()
  // refused and told the reader nothing had been set aside while the previous boot's copy sat on
  // disk. Whether a copy exists is a different question from whether one can be written now, and
  // this asks the first. And the write is read back rather than assumed, because copying the state
  // doubles this origin's footprint, so the near-quota case is exactly when setItem throws and the
  // copy silently never lands.
  salvage() {
    try {
      const raw = this.storage?.getItem(KEY);
      if (!raw) {
        this.salvageKey = null;
        return true; // nothing on disk to lose
      }
      // The main slot is asked directly rather than through the walk, so that a storage which
      // cannot be enumerated still recognises the copy it is already holding. The walk is an
      // addition to this question, never a replacement for it: routing the whole question through
      // it regressed the fallback from the shipped behaviour, writing a duplicate where the shipped
      // code wrote none, and near quota that failed write is what makes this return false and
      // startFresh() refuse the reader the way out. Measured at 1 write against 0 before the fix.
      const held = this.storage.getItem(SALVAGE_KEY) === raw ? SALVAGE_KEY : this.existingCopyOf(raw);
      if (held) {
        this.salvageKey = held;
        return true;
      }
      const key = this.freeArchiveKey();
      this.storage.setItem(key, raw);
      const ok = this.storage.getItem(key) === raw;
      this.salvageKey = ok ? key : null;
      return ok;
    } catch {
      this.salvageKey = null;
      return false;
    }
  }

  // A name this copy can take without destroying one already held.
  //
  // existingCopyOf() has already ruled out a slot holding these bytes, so every occupied salvage
  // key holds a different incident's and must not be overwritten. The timestamp alone is not enough
  // to guarantee that. startFresh() salvages before it clears, so a tab whose live key is rewritten
  // by another tab between boot and the button reaches a second write inside the same millisecond,
  // and the identical name clobbered the copy taken moments earlier. Measured with a fake storage
  // rather than reasoned about, after the opposite was asserted and proved false. The loop
  // terminates because each pass tries a name no earlier pass tried.
  freeArchiveKey() {
    if (this.storage.getItem(SALVAGE_KEY) === null) return SALVAGE_KEY;
    const stamp = Date.now();
    let key = `${SALVAGE_KEY}.${stamp}`;
    for (let n = 1; this.storage.getItem(key) !== null; n += 1) key = `${SALVAGE_KEY}.${stamp}.${n}`;
    return key;
  }

  // Which archived salvage slot, if any, already holds exactly these bytes.
  //
  // Asking storage rather than tracking the answer in a slot of its own is deliberate: a pointer
  // is bookkeeping that can drift from what is actually there, and this question has a true answer
  // storage can be asked directly. Only the salvage family is considered, because nothing but
  // salvage() writes those keys, whereas restore() overwrites the pre-restore slot.
  //
  // The caller checks the main slot before calling this, and must keep doing so. A storage that
  // cannot be enumerated, or that throws part way through, answers "none" here, and "none" is only
  // safe because that direct read has already happened: without it the fallback stopped recognising
  // the copy in the main slot and wrote a duplicate the shipped code never wrote, which near quota
  // is the failed write that refuses the reader startFresh().
  existingCopyOf(raw) {
    try {
      const total = this.storage?.length ?? 0;
      for (let i = 0; i < total; i += 1) {
        const key = this.storage.key(i);
        if (key?.startsWith(SALVAGE_KEY) && this.storage.getItem(key) === raw) return key;
      }
    } catch {
      /* unreadable is indistinguishable from empty here, and both mean "write one" */
    }
    return null;
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

  // What is being kept aside on the reader's behalf, newest first.
  //
  // Returns null rather than [] when storage cannot be enumerated, because "there is nothing" and
  // "this browser will not say" are different answers and only one of them means the reader is
  // carrying nothing. Collapsing them would put an empty list in front of someone whose copies are
  // all still there. Reads only; a screen that reports on the near-quota budget must not spend it.
  //
  // The copy in the undated slot carries no date because freeArchiveKey() gives the first free
  // slot the bare name, and only the copies that find it occupied are stamped. That is a property
  // of the naming rather than of the copy, so it is reported as absent rather than guessed at.
  //
  // live is asked of storage rather than of this instance's own flags, for the reason
  // existingCopyOf() gives: a pointer is bookkeeping that can drift, and this question has an
  // answer storage can be asked directly. The flags are per tab, and a tab that read the data
  // before it became unreadable has blocked false and salvageKey null, so it alone would offer
  // Remove on the copy another tab is blocked on. Measured with two Store instances over one
  // storage: the second tab saw live true, the first saw live false, forgetSalvage() agreed with
  // the first because its backstop reads the same two fields, and one ordinary edit in that tab
  // then overwrote the original the copy was the last record of. The in-memory term is kept as
  // well, so a store holding a key storage has since lost still protects it.
  salvageCopies() {
    const out = [];
    try {
      const current = this.storage?.getItem(KEY) ?? null;
      const total = this.storage?.length ?? 0;
      for (let i = 0; i < total; i += 1) {
        const key = this.storage.key(i);
        if (!key?.startsWith(SALVAGE_KEY)) continue;
        const raw = this.storage.getItem(key);
        if (raw === null) continue;
        const stamp = /^\.(\d+)(?:\.\d+)?$/.exec(key.slice(SALVAGE_KEY.length));
        out.push({
          key,
          chars: raw.length,
          at: stamp ? Number(stamp[1]) : null,
          live: (this.blocked && key === this.salvageKey) || (current !== null && raw === current),
        });
      }
    } catch {
      return null;
    }
    // Undated last rather than first: it is the only one whose position cannot be argued for, and
    // putting an unknown at the top would claim it is the newest.
    return out.sort((a, b) => (b.at ?? -Infinity) - (a.at ?? -Infinity));
  }

  // Reads back one named copy, for the reader who wants the file rather than the row. Guarded the
  // same way forgetSalvage() is, and for the same reason: the key comes from the screen, and
  // without the family check this hands back mrt.state.v2 to anything that asks for it.
  salvageRawAt(key) {
    if (typeof key !== 'string' || !key.startsWith(SALVAGE_KEY)) return null;
    try {
      return this.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  // Removes one copy, at the reader's explicit request. Nothing else in this module removes one:
  // not startFresh(), not restore(), not a later incident. A rule for when a copy stops being
  // worth keeping would have to know whether the reader still wants data this app could not read,
  // and it cannot, so the only rule is that they say so.
  //
  // The key arrives from the UI rather than from this module, so the family check is a guard on
  // untrusted input and not a tidiness test: without it this method removes mrt.state.v2 or the
  // pre-restore snapshot for any caller that asks. A copy of what the main slot still holds is
  // refused, because the banner is at that moment telling the reader to download it or start fresh
  // and both need it to be there. That is a backstop; the screen withdraws the offer instead of
  // presenting one that will be refused.
  forgetSalvage(key) {
    if (typeof key !== 'string' || !key.startsWith(SALVAGE_KEY)) return false;
    if (this.blocked && key === this.salvageKey) return false;
    try {
      // The same question salvageCopies() asks, and asked here rather than only there because a
      // backstop that reads the same two per-tab flags as the screen fails in the same case the
      // screen does. A copy holding exactly what the main slot holds is the second of two records
      // of that data, and the main slot is the one an unblocked tab overwrites on its next edit.
      const current = this.storage.getItem(KEY);
      if (current !== null && this.storage.getItem(key) === current) return false;
      this.storage.removeItem(key);
      // Read back for the same reason the write is: removeItem can be a no-op behind a storage
      // that reports success it did not have, and telling the reader a copy is gone when it is
      // not is the one error this screen must not make in that direction.
      if (this.storage.getItem(key) !== null) return false;
    } catch {
      return false;
    }
    if (key === this.salvageKey) this.salvageKey = null;
    return true;
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

  // Validate, stage, snapshot, swap, clean up. A malformed backup mutates nothing.
  //
  // Only the first three of those five stages can fail without the saved data changing, and the
  // shipped code reported all five alike: one catch, one sentence, "Nothing was changed". A
  // storage probe drove the cleanup removal to throw and got that sentence back while the main key
  // already held the replacement and the screen still showed the data it had replaced, so the next
  // ordinary edit wrote the stale screen over the restore the reader had been told did not happen.
  // Hence `changed`, which every return now carries: false when the saved data is as it was, true
  // when it holds the backup, and null when storage will not say which. The message describes that
  // outcome instead of asserting one.
  restore(rawJson) {
    let parsed;
    try {
      parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    } catch (err) {
      return { ok: false, changed: false, errors: [`Not valid JSON: ${err.message}`] };
    }

    const { ok, errors, state } = validateBackup(parsed);
    if (!ok) return { ok: false, changed: false, errors };

    const serialized = JSON.stringify(exportBackup(state));
    // Read before anything is written, because a restore that turns out not to have happened has
    // to put this slot back as it found it, and a slot cannot be put back to a value nobody read.
    // undefined is that third answer, "this storage would not say", and rewindSnapshot() declines
    // it rather than treating it as the absence null means.
    let heldSnapshot;
    try {
      heldSnapshot = this.storage?.getItem(PRERESTORE_KEY) ?? null;
    } catch {
      heldSnapshot = undefined;
    }

    // Set between the snapshot and the swap, so it answers the one question the catch cannot
    // answer for itself: whether the throw arrived before the main key was ever addressed.
    let swapReached = false;
    try {
      this.storage?.setItem(TEMP_KEY, serialized);
      this.storage?.setItem(PRERESTORE_KEY, this.storage.getItem(KEY) ?? '');
      swapReached = true;
      this.storage?.setItem(KEY, serialized);
      this.storage?.removeItem(TEMP_KEY);
    } catch (err) {
      this.discardStaging();
      if (!swapReached) {
        // setItem throws instead of writing, so a throw here leaves the snapshot slot untouched
        // as well as the main key. Nothing to rewind, and nothing to reconcile.
        return {
          ok: false,
          changed: false,
          errors: [`Could not write the restored data: ${err.message}. Nothing was changed.`],
        };
      }
      return this.settleAfterSwap({ serialized, state, heldSnapshot, err });
    }

    return this.adoptRestored(state);
  }

  // What the saved data actually holds, once a failure has left that in doubt.
  //
  // Asked of storage rather than inferred from which call threw, because the two failures that
  // reach here are indistinguishable from the outside: a swap that threw and a cleanup that threw
  // after the swap landed both arrive as one exception. Storage has the answer, so it is asked.
  settleAfterSwap({ serialized, state, heldSnapshot, err }) {
    let durable;
    try {
      durable = this.storage?.getItem(KEY) ?? null;
    } catch (readErr) {
      // Neither reconcilable nor safely writable: latch instead of guessing, which is what the
      // store already does whenever it cannot read what it would be overwriting.
      this.blocked = true;
      this.blockedReason = `Could not read your saved data (${readErr.message}).`;
      this.onChange(this.state, this.lastError);
      return {
        ok: false,
        changed: null,
        errors: [`Could not finish restoring (${err.message}), and this browser will not say what your saved data now holds.`],
      };
    }

    // The swap landed and the cleanup is what failed. The reader asked for their backup and their
    // backup is what is saved, so this is a success with a staging key left behind, which the next
    // restore overwrites and nothing reads in the meantime.
    if (durable === serialized) return this.adoptRestored(state);

    this.rewindSnapshot(heldSnapshot);
    // Reconciled from storage rather than assumed to be the state this instance already held: the
    // swap is known not to have produced the backup, which is not the same as knowing it produced
    // nothing. load() re-reads, and latches if what it finds cannot be read.
    this.load();
    this.onChange(this.state, this.lastError);
    return {
      ok: false,
      changed: false,
      errors: [`Could not write the restored data: ${err.message}. Nothing was changed.`],
    };
  }

  // A successful restore is a deliberate overwrite, so it also clears the block.
  adoptRestored(state) {
    this.blocked = false;
    this.lastError = null;
    this.blockedReason = null;
    this.state = state;
    this.onChange(state, null);
    return { ok: true, changed: true, errors: [] };
  }

  discardStaging() {
    try {
      this.storage?.removeItem(TEMP_KEY);
    } catch {
      /* the staging key is overwritten by the next restore and read by nothing before then */
    }
  }

  // Puts the undo slot back as the restore found it.
  //
  // A restore that did not happen must not spend the one undo the reader had. Without this, a
  // failed second restore left the slot holding the current data, so the button offered to undo
  // the first restore and would have swapped in what was already on screen.
  rewindSnapshot(held) {
    if (held === undefined) return;
    try {
      if (held === null) this.storage?.removeItem(PRERESTORE_KEY);
      else this.storage?.setItem(PRERESTORE_KEY, held);
    } catch {
      /* the slot keeps a snapshot of live data, which undoRestore() applies as a no-op */
    }
  }

  undoRestore() {
    const prev = this.storage?.getItem(PRERESTORE_KEY);
    if (!prev) return { ok: false, changed: false, errors: ['No pre-restore snapshot available.'] };
    return this.restore(prev);
  }

  hasPreRestoreSnapshot() {
    return Boolean(this.storage?.getItem(PRERESTORE_KEY));
  }
}
