import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRow, validateResolvedMapping } from '../scripts/lib/cbh-resolution.mjs';
import { shouldPreserveApprovedMapping } from '../scripts/prepare-cbh-batch.mjs';
import { resolveMapping } from '../scripts/resolve-cbh-order.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('a single exact normalized candidate is selected', () => {
  const row = { normalizedSeriesTitle: 'Civil War', issueNumber: '2', seriesYear: '2006' };
  const candidates = [
    { id: 101, title: 'Civil War', issueNumber: '2', seriesYear: '2006' },
    { id: 102, title: 'Civil War', issueNumber: '1', seriesYear: '2006' },
  ];

  const result = resolveRow(row, candidates);
  assert.equal(result.status, 'exact');
  assert.equal(result.selectedIssueId, '101');
  assert.deepEqual(result.candidateIssueIds, ['101']);
});

test('similar but non-exact candidates stay unresolved', () => {
  const row = { normalizedSeriesTitle: 'Spider-Verse', issueNumber: '1', seriesYear: '2014' };
  const candidates = [
    { id: 201, title: 'Spider-Verse', issueNumber: '2', seriesYear: '2014' },
    { id: 202, title: 'Spider-Man: Spider-Verse', issueNumber: '1', seriesYear: '2014' },
  ];

  const result = resolveRow(row, candidates);
  assert.equal(result.status, 'unmatched');
  assert.deepEqual(result.candidateIssueIds, ['201', '202']);
});

test('series ids are checked instead of trusting row-derived candidate titles', () => {
  const row = {
    normalizedSeriesTitle: 'Secret War',
    issueNumber: '1',
    seriesYear: '2004',
    seriesId: 418,
    note: '',
  };
  const wrongSeries = [{
    id: 203,
    title: 'Secret War',
    issueNumber: '1',
    seriesYear: '2004',
    seriesId: 999,
  }];

  assert.equal(resolveRow(row, wrongSeries).status, 'unmatched');
});

test('a reviewed title mismatch requires explicit approval, the same series id, and a note', () => {
  const candidate = {
    id: 17212,
    title: 'Hulk',
    issueNumber: '112',
    seriesYear: '1999',
    seriesId: 465,
    manualSeriesSelection: true,
    manualSeriesSelectionApproved: true,
  };
  const reviewed = {
    normalizedSeriesTitle: 'Incredible Hercules',
    issueNumber: '112',
    seriesYear: '1999',
    seriesId: 465,
    manualSeriesSelectionApproved: true,
    note: 'Marvel indexes this transition issue in Hulk before Incredible Hercules #113.',
  };

  const result = resolveRow(reviewed, [candidate]);
  assert.equal(result.status, 'exact');
  assert.equal(result.selectedIssueId, '17212');
  assert.equal(resolveRow({ ...reviewed, manualSeriesSelectionApproved: false }, [candidate]).status, 'unmatched');
  assert.equal(resolveRow(reviewed, [{ ...candidate, manualSeriesSelectionApproved: false }]).status, 'unmatched');
  assert.equal(resolveRow({ ...reviewed, note: '' }, [candidate]).status, 'unmatched');
  assert.equal(resolveRow({ ...reviewed, seriesId: 466 }, [candidate]).status, 'unmatched');
});

test('multiple exact title matches are ambiguous and stop the run', () => {
  const row = { normalizedSeriesTitle: 'Fear Itself', issueNumber: '1', seriesYear: '2011' };
  const candidates = [
    { id: 301, title: 'Fear Itself', issueNumber: '1', seriesYear: '2011' },
    { id: 302, title: 'Fear Itself', issueNumber: '1', seriesYear: '2011' },
  ];

  const result = resolveRow(row, candidates);
  assert.equal(result.status, 'ambiguous');
  assert.deepEqual(result.candidateIssueIds, ['301', '302']);
});

test('a year mismatch is filtered out before selection', () => {
  const row = { normalizedSeriesTitle: 'Avengers Vs X-Men', issueNumber: '1', seriesYear: '2012' };
  const candidates = [
    { id: 401, title: 'Avengers Vs X-Men', issueNumber: '1', seriesYear: '2011' },
    { id: 402, title: 'Avengers Vs X-Men', issueNumber: '1', seriesYear: '2012' },
  ];

  const result = resolveRow(row, candidates);
  assert.equal(result.status, 'exact');
  assert.equal(result.selectedIssueId, '402');
});

test('approved exceptions are preserved without selection change', () => {
  const row = {
    normalizedSeriesTitle: 'Secret War',
    issueNumber: '1',
    resolutionStatus: 'approved-exception',
    selectedIssueId: 777,
    candidateIssueIds: [777],
    note: 'manual override',
  };

  const result = resolveRow(row, []);
  assert.equal(result.status, 'approved-exception');
  assert.equal(result.selectedIssueId, 777);
});

test('duplicate selected ids fail validation before writing', () => {
  assert.throws(() => validateResolvedMapping([
    { resolutionStatus: 'exact', selectedIssueId: 500 },
    { resolutionStatus: 'exact', selectedIssueId: 500 },
  ]), /Duplicate selected issue id/);
});

test('preparation preserves approved mappings unless an explicit refresh mode is selected', () => {
  const approved = { reviewStatus: 'approved' };
  assert.equal(shouldPreserveApprovedMapping(approved), true);
  assert.equal(shouldPreserveApprovedMapping(approved, { forceApproved: true }), false);
  assert.equal(shouldPreserveApprovedMapping(approved, { refreshApproved: true }), false);
  assert.equal(shouldPreserveApprovedMapping({ reviewStatus: 'pending-independent-review' }), false);
});

test('resolveMapping requires real metadata and rejects unresolved rows', async () => {
  const mapping = {
    rows: [{
      candidateIssueIds: ['9001'],
      normalizedSeriesTitle: 'Ghosted',
      issueNumber: '2',
      seriesYear: '2015',
      note: '',
    }],
  };

  await assert.rejects(
    () => resolveMapping(mapping, {
      metadataLookup: () => null,
    }), /unresolved|metadata|candidate/i,
  );

  const resolved = await resolveMapping({
    rows: [{
      candidateIssueIds: ['9002'],
      normalizedSeriesTitle: 'Fear Itself',
      issueNumber: '1',
      seriesYear: '2011',
      note: '',
    }],
  }, {
    metadataLookup: (issueId) => (issueId === '9002' ? {
      id: 9002,
      title: 'Fear Itself',
      issueNumber: '1',
      seriesYear: '2011',
    } : null),
  });

  assert.equal(resolved.rows[0].resolutionStatus, 'exact');
  assert.equal(resolved.rows[0].selectedIssueId, 9002);
});

test('the CLI exits nonzero and keeps the mapping unchanged when resolution is unresolved', () => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'cbh-resolve-'));
  const mappingPath = path.join(tempDir, 'mapping.json');
  const original = {
    rows: [{
      candidateIssueIds: ['9001'],
      normalizedSeriesTitle: 'Ghosted',
      issueNumber: '2',
      seriesYear: '2015',
      note: '',
    }],
  };
  writeFileSync(mappingPath, `${JSON.stringify(original, null, 2)}\n`, 'utf8');

  const proc = spawnSync(process.execPath, ['scripts/resolve-cbh-order.mjs', mappingPath], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.notEqual(proc.status, 0, proc.stderr || proc.stdout || 'expected a failing exit code');
  assert.deepEqual(JSON.parse(readFileSync(mappingPath, 'utf8')), original);
});
