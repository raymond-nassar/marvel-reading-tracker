import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  completionState,
  seriesWord,
  orderWord,
  progressSummary,
  progressGroups,
  orderStates,
} from '../src/js/lib/model.js';

test('empty inputs stay empty and zero totals stay unstarted', () => {
  assert.equal(completionState(0, 0), 'unstarted');
  assert.equal(completionState(1, 0), 'active');
  assert.equal(seriesWord('unstarted'), 'Not started');
  assert.equal(orderWord('unstarted'), 'Not started');
  assert.equal(seriesWord('active'), 'Reading');
  assert.equal(orderWord('active'), 'Reading');
  assert.deepEqual(progressSummary([]), { series: 0, read: 0, tracked: 0, done: 0 });
  assert.deepEqual(progressGroups([]), []);
  assert.deepEqual(orderStates([]), { orders: 0, active: 0, done: 0, unstarted: 0 });
});

test('progress helpers keep done distinct from active and preserve group order', () => {
  const rows = [
    { seriesName: 'Finished', read: 2, tracked: 1 },
    { seriesName: 'Zero total', read: 1, tracked: 0 },
    { seriesName: 'No start', read: 0, tracked: 2 },
    { seriesName: 'Active', read: 1, tracked: 3 },
  ];

  assert.equal(completionState(2, 1), 'done');
  assert.equal(seriesWord('done'), 'Fully read');
  assert.equal(orderWord('done'), 'Finished');
  assert.deepEqual(progressSummary(rows), { series: 4, read: 4, tracked: 6, done: 1 });
  assert.deepEqual(progressGroups(rows).map((group) => ({
    key: group.key,
    label: group.label,
    rows: group.rows.map((row) => row.seriesName),
  })), [
    { key: 'active', label: 'In progress', rows: ['Zero total', 'Active'] },
    { key: 'unstarted', label: 'Not started', rows: ['No start'] },
    { key: 'done', label: 'Fully read', rows: ['Finished'] },
  ]);
  assert.deepEqual(orderStates(rows.map((row) => ({ read: row.read, total: row.tracked }))), {
    orders: 4,
    active: 2,
    done: 1,
    unstarted: 1,
  });
});
