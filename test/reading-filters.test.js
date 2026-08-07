import test from 'node:test';
import assert from 'node:assert/strict';

import {
  READING_FILTERS, DEFAULT_FILTER, readingFilter, matchesReadingFilter, filterListProblems,
} from '../src/js/lib/readingFilters.js';
import { STATE } from '../src/js/lib/availability.js';

// The shape listItems() hands the renderer: the issue record, plus the read flag and the override
// resolved out of their own maps. Only the five fields the predicates read are named here.
const item = (extra = {}) => ({
  issueId: 1, title: 'Issue 1', read: false, hydrated: true, source: 'catalog', override: null, ...extra,
});

// Far enough either side of today that the test does not change answer overnight.
const past = '2001-01-01';
const future = '2999-01-01';

test('the list is what the radios are built from, so it has to be self-consistent', () => {
  assert.deepEqual(filterListProblems(READING_FILTERS), []);
  assert.equal(READING_FILTERS.some((f) => f.value === DEFAULT_FILTER), true);
});

test('a filter that names a value and does not decide one is reported, not accepted', () => {
  // The single failure the one list can still express. It used to be a whole class: a radio in
  // index.html with no matching branch in main.js reached a trailing "return true" and filtered
  // nothing, saying nothing.
  assert.deepEqual(
    filterListProblems([{ value: 'all', label: 'All', match: () => true }, { value: 'crossovers', label: 'Crossovers' }]),
    ['Filter 1 has no match function.'],
  );
  assert.deepEqual(
    filterListProblems([{ value: 'all', label: 'All', match: () => true }, { value: 'all', label: 'Again', match: () => true }]),
    ['Filter 1 repeats the value "all".'],
  );
  assert.deepEqual(
    filterListProblems([{ value: 'unread', label: 'Unread', match: () => true }]),
    ['No filter offers the default value "all".'],
  );
  assert.deepEqual(filterListProblems([]), ['The filter list is empty.']);
});

test('an unknown filter throws rather than quietly matching everything', () => {
  assert.throws(() => matchesReadingFilter('crossovers', item()), /Unknown reading filter: "crossovers"/);
  assert.throws(() => matchesReadingFilter(undefined, item()), /Unknown reading filter/);
  assert.equal(readingFilter('crossovers'), null);
});

test('All matches every row, which is what makes it the way back', () => {
  assert.equal(matchesReadingFilter('all', item()), true);
  assert.equal(matchesReadingFilter('all', item({ read: true })), true);
});

test('Read and Unread partition the list between them', () => {
  for (const row of [item(), item({ read: true })]) {
    assert.equal(matchesReadingFilter('read', row) !== matchesReadingFilter('unread', row), true);
  }
  assert.equal(matchesReadingFilter('read', item({ read: true })), true);
  assert.equal(matchesReadingFilter('unread', item()), true);
});

test('Details pending means waiting on the API, so a manual issue is never pending', () => {
  assert.equal(matchesReadingFilter('pending', item({ hydrated: false })), true);
  assert.equal(matchesReadingFilter('pending', item({ hydrated: true })), false);
  // Nothing upstream is coming for one of these, so it would otherwise sit in this list forever.
  assert.equal(matchesReadingFilter('pending', item({ hydrated: false, source: 'manual' })), false);
});

test('In Unlimited keeps the five availability states distinct', () => {
  // Constraint 6. Two of the five are shown and three are not, and each of the three is withheld
  // for its own reason: scheduled is a date that has not arrived, unknown is no date at all, and
  // override-unavailable is the reader saying they looked and it was not there. Collapsing any of
  // them into the filter would turn a hedge into a claim.
  const shown = { expected: item({ mu: past }), overrideAvailable: item({ mu: null, override: 'available' }) };
  const hidden = {
    scheduled: item({ mu: future }),
    unknown: item({ mu: null }),
    overrideUnavailable: item({ mu: past, override: 'unavailable' }),
  };
  for (const [name, row] of Object.entries(shown)) {
    assert.equal(matchesReadingFilter('unlimited', row), true, `${name} should match`);
  }
  for (const [name, row] of Object.entries(hidden)) {
    assert.equal(matchesReadingFilter('unlimited', row), false, `${name} should not match`);
  }
  // Named against the model rather than only against dates, so a renamed state fails here too.
  assert.equal(STATE.EXPECTED, 'expected');
  assert.equal(STATE.OVERRIDE_AVAILABLE, 'override-available');
});

test('an override wins over the date, in both directions', () => {
  // The date says expected and the reader says no, so the row is not in Unlimited.
  assert.equal(matchesReadingFilter('unlimited', item({ mu: past, override: 'unavailable' })), false);
  // The date says nothing and the reader says yes, so it is.
  assert.equal(matchesReadingFilter('unlimited', item({ mu: null, override: 'available' })), true);
});

test('every filter answers every row, so no radio can render without a predicate behind it', () => {
  const rows = [item(), item({ read: true }), item({ hydrated: false }), item({ mu: past }), item({ mu: future })];
  for (const f of READING_FILTERS) {
    for (const row of rows) {
      assert.equal(typeof matchesReadingFilter(f.value, row), 'boolean', `${f.value} should decide every row`);
    }
    assert.equal(typeof f.label, 'string');
    assert.notEqual(f.label, '');
  }
});
