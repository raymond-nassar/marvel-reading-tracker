// The issue-lookup pass of a vendoring run, kept apart from the writer so it can be driven
// directly by a test. scripts/vendor-orders.mjs runs main() on import, so nothing inside it can
// be exercised without performing a real vendoring run.
//
// Build-time only, like the fetcher it is given: nothing here is served to the browser.

import { hasMetadata } from '../../src/js/lib/model.js';

// Three outcomes, where the run this replaced had two.
//
// A lookup that comes back carrying metadata puts it in the map. A lookup the service answers
// with 404 is a settled refusal: it has told us it holds no such issue, and asking again spends
// request budget to receive the same answer. Everything else is not an answer at all, whether it
// arrived as a thrown failure or as a body holding nothing.
//
// The old pass caught four unlike failures alike and only warned, then built the item from
// whatever the map held: a 404, an exhausted retry budget, a lost connection and a body that
// would not parse all produced the same item with every field null. That matters because the app
// reads such an item as a settled refusal: it tells the reader the snapshot holds no record of
// the issue, drops it from the hydration queue, and never asks again. An outage during a run
// would therefore be written into the file as a permanent fact about the issue.
//
// So an indeterminate outcome aborts, and it aborts from here rather than at the call site,
// which is what makes "before anything is written" a property of the shape rather than of the
// order two statements happen to be in. The whole list is collected first, because a run that
// stopped at the first failure would report one lost issue per re-run of a job that costs several
// minutes.
export async function lookupIssues(ids, { getJson, url, onProgress = () => {} }) {
  const meta = new Map();
  const refused = new Set();
  const indeterminate = [];
  let done = 0;
  for (const id of ids) {
    try {
      const body = await getJson(url(id));
      // A body that resolves and carries nothing is the same permanent falsehood as a failure
      // nobody classified, reached without an error to catch. hasMetadata is the app's own test,
      // imported rather than restated because an item failing it is exactly what refusedOnArrival
      // reads as a settled refusal, so a producer with its own copy of the rule could drift from
      // the consumer silently. The runtime path already guards this at src/js/hydrate.js, where a
      // falsy body leaves the issue pending for the next run; the import path has no next run, so
      // the only guard available to it is declining to write the file.
      if (hasMetadata(body)) meta.set(id, body);
      else indeterminate.push({ id, reason: 'answered with a body carrying no metadata' });
    } catch (err) {
      // The status is read off the error rather than out of its message. 404 is the only status
      // that is an answer; a 429 or 5xx that outlived the retry budget carries its own status and
      // is correctly excluded, and a lost connection or an unparseable body carries none at all.
      if (err?.status === 404) refused.add(id);
      else indeterminate.push({ id, reason: err?.message ?? String(err) });
    }
    done += 1;
    onProgress({ done, total: ids.length, id, refused: refused.has(id) });
  }
  if (indeterminate.length) throw new Error(describeIndeterminate(indeterminate, ids.length));
  return { meta, refused };
}

// Every id is named, not a count. The operator's next move is to re-run for the orders those
// issues belong to, and a count does not say which those are.
export function describeIndeterminate(indeterminate, total) {
  return `${indeterminate.length} of ${total} issue lookups never got an answer, so no file was written. `
    + 'An item built from one of these is indistinguishable from an issue upstream does not hold, which the app '
    + 'reads as settled and never asks about again. Re-run when the service is reachable:\n  - '
    + indeterminate.map((f) => `${f.id}: ${f.reason}`).join('\n  - ');
}
