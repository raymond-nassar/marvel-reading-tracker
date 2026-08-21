import test from 'node:test';
import assert from 'node:assert/strict';

import { heldCount } from '../src/js/lib/model.js';

// The Add view marks a search result the tracker already knows. Every one of these describes a
// state the app can genuinely be in when a search returns, which is why none of them is a
// defensive check for its own sake: a first run has no issue store at all, a restored backup can
// arrive without one, and the metadata API is free to return the same issue twice in one page.

test('nothing is held when the tracker has never stored an issue', () => {
  assert.equal(heldCount({ issues: {} }, [{ issueId: 1 }, { issueId: 2 }]), 0);
});

test('a state with no issues map holds nothing rather than throwing', () => {
  assert.equal(heldCount({}, [{ issueId: 1 }]), 0);
  assert.equal(heldCount(null, [{ issueId: 1 }]), 0);
  assert.equal(heldCount(undefined, [{ issueId: 1 }]), 0);
});

test('an empty or missing result set holds nothing', () => {
  const state = { issues: { 1: { issueId: 1 } } };
  assert.equal(heldCount(state, []), 0);
  assert.equal(heldCount(state, null), 0);
  assert.equal(heldCount(state, undefined), 0);
});

test('only the results the store already knows are counted', () => {
  const state = { issues: { 1: { issueId: 1 }, 3: { issueId: 3 } } };
  assert.equal(heldCount(state, [{ issueId: 1 }, { issueId: 2 }, { issueId: 3 }]), 2);
});

test('every result can be held', () => {
  const state = { issues: { 1: { issueId: 1 }, 2: { issueId: 2 } } };
  assert.equal(heldCount(state, [{ issueId: 1 }, { issueId: 2 }]), 2);
});

// The count sits beside a row count on screen, so one that could exceed the number of rows would
// describe something the reader cannot see.
test('a repeated id is counted once, so the count can never exceed the rows shown', () => {
  const state = { issues: { 7: { issueId: 7 } } };
  assert.equal(heldCount(state, [{ issueId: 7 }, { issueId: 7 }, { issueId: 7 }]), 1);
});

test('a result carrying no id is skipped rather than counted', () => {
  const state = { issues: { 1: { issueId: 1 } } };
  assert.equal(heldCount(state, [{ title: 'no id at all' }, { issueId: null }, { issueId: 1 }]), 1);
});

// Hand-added entries carry a negative synthetic id, and a pasted address can supply a real one,
// so the store's keys are not all positive and the count must not assume they are.
test('a negative synthetic id from a hand-added entry is held like any other', () => {
  const state = { issues: { '-1755000000000': { issueId: -1755000000000 } } };
  assert.equal(heldCount(state, [{ issueId: -1755000000000 }]), 1);
});
