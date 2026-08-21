import test from 'node:test';
import assert from 'node:assert/strict';
import { buildComparisonReport, compareIssueSets } from '../scripts/lib/cbh-overlap.mjs';

test('relationship classification matches the contract', () => {
  assert.deepEqual(compareIssueSets([1, 2, 3], [3, 4]), {
    relationship: 'partial',
    sharedCount: 1,
    sharedIds: ['3'],
  });
  assert.deepEqual(compareIssueSets([1, 2], [1, 2]), {
    relationship: 'exact',
    sharedCount: 2,
    sharedIds: ['1', '2'],
  });
  assert.deepEqual(compareIssueSets([1, 2], [1, 2, 3]), {
    relationship: 'candidate-subset',
    sharedCount: 2,
    sharedIds: ['1', '2'],
  });
  assert.deepEqual(compareIssueSets([1, 2, 3], [2, 3]), {
    relationship: 'existing-subset',
    sharedCount: 2,
    sharedIds: ['2', '3'],
  });
  assert.deepEqual(compareIssueSets([1, 2], [3, 4]), {
    relationship: 'none',
    sharedCount: 0,
    sharedIds: [],
  });
});

test('comparison records preserve candidate order and sort by compared order id', () => {
  const report = buildComparisonReport({
    candidateIds: ['10', '11', '12'],
    orders: [
      { orderId: 'b', issueIds: ['11', '99'] },
      { orderId: 'a', issueIds: ['10', '12', '20'] },
    ],
    peerOrders: [
      { orderId: 'c', issueIds: ['15', '16'] },
    ],
  });

  assert.equal(report.candidateCount, 3);
  assert.equal(report.comparisonCount, 3);
  assert.deepEqual(report.comparisons.map((entry) => entry.orderId), ['a', 'b', 'c']);
  assert.equal(report.comparisons[0].relationship, 'partial');
  assert.deepEqual(report.comparisons[0].sharedIds, ['10', '12']);
});
