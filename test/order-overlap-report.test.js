import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildComparisonReport, compareIssueSets, issueIdsFromValue } from '../scripts/lib/cbh-overlap.mjs';
import { buildReportForMapping } from '../scripts/report-order-overlap.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

test('generated payload roots do not overwrite real item issue ids', () => {
  const payload = {
    id: 101,
    items: [{ issueId: 202 }, { issueId: 303 }],
  };

  assert.deepEqual(issueIdsFromValue(payload), ['202', '303']);

  const report = buildComparisonReport({
    candidateIds: ['101'],
    orders: [{ orderId: 'generated', issueIds: payload }],
  });

  assert.equal(report.comparisons[0].relationship, 'none');
  assert.deepEqual(report.comparisons[0].sharedIds, []);
});

test('buildComparisonReport rejects duplicate selected issue sequences across candidate and peer orders', () => {
  assert.throws(() => buildComparisonReport({
    candidateIds: ['10', '11'],
    orders: [{ orderId: 'existing', issueIds: ['10', '11'] }],
    peerOrders: [{ orderId: 'peer', issueIds: ['10', '11'] }],
  }), /Duplicate selected issue sequence/i);
});

test('buildReportForMapping rejects unresolved mappings before writing a report', async () => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'cbh-overlap-'));
  const mappingPath = path.join(tempDir, 'mapping.json');
  writeFileSync(mappingPath, JSON.stringify({
    rows: [{
      selectedIssueId: null,
      resolutionStatus: 'unmatched',
      candidateIssueIds: ['9001'],
      normalizedSeriesTitle: 'Ghosted',
      issueNumber: '2',
      seriesYear: '2015',
    }],
  }, null, 2), 'utf8');

  await assert.rejects(() => buildReportForMapping(mappingPath), /unresolved|exact|status/i);

  const validPath = path.join(tempDir, 'valid.json');
  writeFileSync(validPath, JSON.stringify({
    rows: [{
      selectedIssueId: 101,
      resolutionStatus: 'exact',
      candidateIssueIds: ['101'],
      normalizedSeriesTitle: 'House of M',
      issueNumber: '1',
      seriesYear: '2005',
    }],
  }, null, 2), 'utf8');
  const report = await buildReportForMapping(validPath);
  assert.equal(report.candidateCount, 1);
  assert.ok(report.comparisons.length > 0);
});

test('buildReportForMapping regenerates shipped reports without duplicate self or peer comparisons', async () => {
  const mappingsDir = path.join(root, 'scripts', 'data', 'cbh-mappings');
  const report = await buildReportForMapping(
    path.join(mappingsDir, 'secret-war.json'),
    [path.join(mappingsDir, 'spider-man-the-other.json')],
  );
  const comparedIds = report.comparisons.map((comparison) => comparison.orderId);

  assert.equal(report.candidateCount, 5);
  assert.equal(report.comparisonCount, 45);
  assert.equal(new Set(comparedIds).size, 45);
  assert.equal(comparedIds.includes('secret-war'), false);
  assert.equal(comparedIds.filter((id) => id === 'spider-man-the-other').length, 1);
});
