import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import {
  seriesKey,
  readSummary,
  manualSummary,
  dayOrdinal,
  readGroups,
  titleGroups,
} from '../src/js/lib/librarySummary.js';
import { createEmptyState, createList, addIssuesToList, seriesProgress } from '../src/js/lib/model.js';

function makeState(rows) {
  let state = createEmptyState();
  state = createList(state, { id: 'l1', name: 'List' });
  state = addIssuesToList(state, 'l1', rows, {}).state;
  return state;
}

test('empty inputs stay empty and the key helper has the fallback it needs', () => {
  assert.equal(seriesKey({}), 'unknown:Unsorted');
  assert.deepEqual(readSummary([]), { issues: 0, series: 0, orphans: 0 });
  assert.deepEqual(manualSummary([]), { issues: 0, read: 0, orphans: 0 });
  assert.ok(Number.isNaN(dayOrdinal()));
  assert.deepEqual(readGroups([], Date.now()), []);
  assert.deepEqual(titleGroups([]), []);
});

test('series keys match progress grouping for the three supported shapes', () => {
  const cases = [
    {
      rows: [
        { issueId: 101, title: 'Alpha 1', seriesId: 7, seriesName: 'Alpha', source: 'curated', hydrated: true },
        { issueId: 102, title: 'Alpha 2', seriesId: 7, seriesName: 'Alpha', source: 'curated', hydrated: true },
      ],
      expected: [{ seriesId: 7, seriesName: 'Alpha', tracked: 2, read: 0 }],
    },
    {
      rows: [
        { issueId: 201, title: 'Beta 1', seriesName: 'Beta', source: 'curated', hydrated: true },
        { issueId: 202, title: 'Beta 2', seriesName: 'Beta', source: 'curated', hydrated: true },
      ],
      expected: [{ seriesId: null, seriesName: 'Beta', tracked: 2, read: 0 }],
    },
    {
      rows: [
        { issueId: 301, title: 'Mystery 1', source: 'curated', hydrated: true },
        { issueId: 302, title: 'Mystery 2', source: 'curated', hydrated: true },
      ],
      expected: [{ seriesId: null, seriesName: 'Unknown series', tracked: 2, read: 0 }],
    },
  ];

  for (const { rows, expected } of cases) {
    const state = makeState(rows);
    const actual = seriesProgress(state).map(({ seriesId, seriesName, tracked, read }) => ({
      seriesId,
      seriesName,
      tracked,
      read,
    }));
    assert.deepEqual(actual, expected);
    assert.equal(seriesKey(rows[0]), seriesKey(rows[1]));
  }
});

test('read summaries count orphan rows and groups keep their labels', () => {
  const rows = [
    { issueId: 1, title: 'Alpha 1', seriesId: 10, seriesName: 'Alpha', lists: ['One'], read: true },
    { issueId: 2, title: 'Beta 1', seriesName: 'Beta', lists: [], read: false },
    { issueId: 3, title: 'Gamma 1', lists: ['Two'], read: false },
    { issueId: 4, title: 'Delta 1', lists: [], read: true },
  ];

  assert.deepEqual(readSummary(rows), { issues: 4, series: 3, orphans: 2 });
  assert.deepEqual(manualSummary(rows), { issues: 4, read: 2, orphans: 2 });
});

test('read groups keep all six labels and the week boundary is exact', () => {
  const now = Date.parse('2026-07-15T12:00:00');
  const rows = [
    { issueId: 1, title: 'Today', readAt: Date.parse('2026-07-15T09:00:00') },
    { issueId: 2, title: 'No date 1', readAt: null },
    { issueId: 3, title: 'Yesterday', readAt: Date.parse('2026-07-14T09:00:00') },
    { issueId: 4, title: 'No date 2', readAt: true },
    { issueId: 5, title: 'Past week', readAt: Date.parse('2026-07-09T09:00:00') },
    { issueId: 6, title: 'Earlier this month', readAt: Date.parse('2026-07-08T09:00:00') },
    { issueId: 7, title: 'June 2026', readAt: Date.parse('2026-06-15T09:00:00') },
  ];

  assert.deepEqual(readGroups(rows, now).map((group) => ({
    key: group.key,
    label: group.label,
    rows: group.rows.map((row) => row.issueId),
  })), [
    { key: 'today', label: 'Today', rows: [1] },
    { key: 'nodate', label: 'No date', rows: [2, 4] },
    { key: 'yesterday', label: 'Yesterday', rows: [3] },
    { key: 'past-week', label: 'In the past week', rows: [5] },
    { key: 'earlier-this-month', label: 'Earlier this month', rows: [6] },
    { key: '2026-06', label: 'June 2026', rows: [7] },
  ]);
});

test('dayOrdinal keeps the day count stable across a DST jump', () => {
  const moduleUrl = new URL('../src/js/lib/librarySummary.js', import.meta.url).href;
  const script = `
    import { dayOrdinal } from '${moduleUrl}';
    const a = dayOrdinal(Date.parse('2026-03-08T12:00:00'));
    const b = dayOrdinal(Date.parse('2026-03-09T12:00:00'));
    console.log(String(b - a));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...process.env, TZ: 'America/New_York' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), '1');
});

test('title groups put digits under # and keep first-met order', () => {
  const rows = [
    { title: '1st issue' },
    { title: 'alpha' },
    { title: 'Another issue' },
    { title: '2nd issue' },
    { title: 'bravo' },
  ];

  assert.deepEqual(titleGroups(rows).map((group) => ({
    key: group.key,
    label: group.label,
    rows: group.rows.map((row) => row.title),
  })), [
    { key: '#', label: '#', rows: ['1st issue', '2nd issue'] },
    { key: 'A', label: 'A', rows: ['alpha', 'Another issue'] },
    { key: 'B', label: 'B', rows: ['bravo'] },
  ]);
});
