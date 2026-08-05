// Background metadata hydration for issues imported from Markdown.
//
// A Markdown checklist only carries a title and an issue id. Everything the UI needs
// (digitalId, series, dates) requires one /v1/issues/{id} call each, and the rate limiter
// caps that at 45/minute, roughly five minutes for a 219-issue order. So hydration is
// incremental, cancellable, resumable, and prioritises whatever you are about to read.

import { hydrationOrder, upsertIssue } from './lib/model.js';

export class Hydrator {
  constructor({ api, store, onProgress = () => {} } = {}) {
    this.api = api;
    this.store = store;
    this.onProgress = onProgress;
    this.controller = null;
    this.running = false;
    this.done = 0;
    this.total = 0;
  }

  get active() {
    return this.running;
  }

  cancel() {
    this.controller?.abort();
    this.controller = null;
    this.running = false;
    this.onProgress(this.status('cancelled'));
  }

  status(phase) {
    return { phase, done: this.done, total: this.total, running: this.running };
  }

  async start(listId, { lookahead = 5 } = {}) {
    if (this.running) return;
    const queue = hydrationOrder(this.store.state, listId, lookahead);
    if (!queue.length) {
      this.onProgress(this.status('idle'));
      return;
    }

    const controller = new AbortController();
    this.controller = controller;
    const { signal } = controller;
    this.running = true;
    this.done = 0;
    this.total = queue.length;
    this.onProgress(this.status('running'));

    for (const issueId of queue) {
      if (signal.aborted) break;
      try {
        const full = await this.api.issue(issueId, { signal });
        if (full) {
          // Partial progress is persisted as we go, so cancelling or closing the tab
          // never throws away work already paid for in rate limit.
          this.store.update((s) => upsertIssue(s, { ...full, hydrated: true }));
        }
      } catch (err) {
        if (err?.name === 'AbortError') break;
        // A single failed lookup must not stall the queue; it stays pending and will be
        // retried the next time hydration runs.
      }
      // A cancelled run may still be unwinding a long rate-limit wait when the user starts a
      // new one. Without this guard its teardown would clear the *new* run's fields, leaving
      // that run invisible to the UI and impossible to cancel.
      if (this.controller !== controller) return;
      this.done += 1;
      this.onProgress(this.status('running'));
    }

    if (this.controller !== controller) return;
    this.running = false;
    this.controller = null;
    this.onProgress(this.status(signal.aborted ? 'cancelled' : 'complete'));
  }
}
