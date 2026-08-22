import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FIRST_PACKET_IDS,
  assertCompleteOverlapReport,
  existingEntriesForPacket,
  manifestEntryForMapping,
} from '../scripts/author-cbh-packet.mjs';
import { validateBatchNoDuplicates } from '../scripts/lib/cbh-inventory.mjs';
import { parseChecklist } from '../src/js/lib/markdown.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'data');
const mappingsDir = path.join(root, 'scripts', 'data', 'cbh-mappings');
const overlapsDir = path.join(root, 'scripts', 'data', 'cbh-overlaps');
const PACKET_IDS = FIRST_PACKET_IDS;

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function mappingIds(mapping) {
  return mapping.rows.map((row) => String(row.selectedIssueId));
}

test('the approved Comic Book Herald packet stays exact through every generated surface', async () => {
  const manifest = await readJson(path.join(dataDir, 'curated-lists.json'));
  const catalog = await readJson(path.join(dataDir, 'catalog.json'));
  const inventory = await readJson(path.join(root, 'scripts', 'data', 'cbh-modern-inventory.json'));
  assert.equal(existingEntriesForPacket(manifest.lists, PACKET_IDS).length, 56);

  for (const id of PACKET_IDS) {
    const mapping = await readJson(path.join(mappingsDir, `${id}.json`));
    const approved = manifestEntryForMapping(mapping);
    const manifestEntry = manifest.lists.find((entry) => entry.id === id);
    const catalogEntry = catalog.lists.find((entry) => entry.id === id);
    const markdown = await readFile(path.join(dataDir, 'orders', approved.sourceFile), 'utf8');
    const parsed = parseChecklist(markdown);
    const generated = await readJson(path.join(dataDir, approved.out));
    const expectedIds = mappingIds(mapping);
    const inventoryEntry = inventory.find((entry) => entry.id === id);
    const candidatesById = new Map(mapping.candidateMetadata.map((candidate) => (
      [String(candidate.id), candidate]
    )));

    assert.ok(manifestEntry, `${id} is missing from the curated manifest`);
    assert.ok(catalogEntry, `${id} is missing from the generated catalog`);
    assert.equal(mapping.reviewStatus, 'approved');
    assert.equal(inventoryEntry.deliveryStatus, 'shipped');
    assert.deepEqual(inventoryEntry.catalogIds, [id]);
    assert.deepEqual(inventoryEntry.overlapIds, []);
    assert.match(inventoryEntry.reason, /^Shipped:/);
    for (const row of mapping.rows) {
      const candidate = candidatesById.get(String(row.selectedIssueId));
      if (!candidate?.manualSeriesSelection) continue;
      assert.equal(candidate.manualSeriesSelectionApproved, true, `${id} has an unapproved series-title mismatch`);
      assert.equal(row.manualSeriesSelectionApproved, true, `${id} row lacks explicit manual series approval`);
      assert.ok(row.note.trim(), `${id} manual series selection has no note`);
    }
    assert.equal(mapping.packetReview, '.copilot-tracking/reviews/logs/2026-08-21/modern-marvel-continuity-guides-packet-review.md');
    assert.deepEqual(manifestEntry, approved, `${id} manifest fields differ from the approved packet`);
    assert.equal(Object.hasOwn(manifestEntry, 'coverSourcePosition'), false);
    assert.equal(Object.hasOwn(manifestEntry, 'coverSourceReference'), false);
    assert.equal(parsed.unresolved.length, 0, `${id} has unresolved Markdown rows`);
    assert.equal(/^## /m.test(markdown), false, `${id} invents an unapproved grouping heading`);
    assert.deepEqual(parsed.entries.map((entry) => String(entry.issueId)), expectedIds, `${id} Markdown sequence drifted`);
    assert.deepEqual(generated.items.map((item) => String(item.issueId)), expectedIds, `${id} generated sequence drifted`);
    assert.equal(generated.count, expectedIds.length);
    assert.equal(generated.placeholders, 0);
    assert.deepEqual(generated.unresolved, []);
    assert.deepEqual(
      generated.items.map((item) => String(item.number)),
      mapping.rows.map((row) => String(row.issueNumber)),
      `${id} generated issue numbers differ from the approved mapping`,
    );
    assert.equal(catalogEntry.count, expectedIds.length);
    assert.equal(catalogEntry.source, mapping.sourceUrl);
    assert.equal(catalogEntry.sourceOrigin, "Compiled for this project from Comic Book Herald's guide");
    assert.equal(catalogEntry.sourceLicense, null);
    assert.equal(catalogEntry.coverIssueId, approved.coverIssueId);
  }
});

test('authoring requires one clean overlap row for every expected order identity', () => {
  const expectedOrderIds = ['existing-order', 'packet-peer'];
  const valid = {
    candidateCount: 1,
    comparisonCount: 2,
    comparisons: expectedOrderIds.map((orderId) => ({
      orderId,
      relationship: 'none',
      sharedCount: 0,
      sharedIds: [],
    })),
  };

  assert.doesNotThrow(() => assertCompleteOverlapReport(valid, {
    candidateId: 'candidate',
    candidateCount: 1,
    expectedOrderIds,
  }));
  assert.throws(() => assertCompleteOverlapReport({
    ...valid,
    comparisons: [],
  }, {
    candidateId: 'candidate',
    candidateCount: 1,
    expectedOrderIds,
  }), /overlap report is incomplete/i);
  assert.throws(() => assertCompleteOverlapReport({
    ...valid,
    comparisons: [
      valid.comparisons[0],
      { ...valid.comparisons[1], orderId: 'unexpected-order' },
    ],
  }, {
    candidateId: 'candidate',
    candidateCount: 1,
    expectedOrderIds,
  }), /overlap report is incomplete/i);
});

test('the authored packet has no aggregate identity, sequence, or issue overlap', async () => {
  const manifest = await readJson(path.join(dataDir, 'curated-lists.json'));
  const packetSet = new Set(PACKET_IDS);
  const packetRecords = [];
  const existingRecords = [];
  const packetIssueIds = [];

  for (const entry of manifest.lists) {
    const generated = await readJson(path.join(dataDir, entry.out));
    const record = {
      id: entry.id,
      url: entry.sourcePage,
      selectedIssueIds: generated.items.map((item) => String(item.issueId)),
      catalogIds: [entry.id],
    };
    if (packetSet.has(entry.id)) {
      packetRecords.push(record);
      packetIssueIds.push(...record.selectedIssueIds);
    } else {
      existingRecords.push(record);
    }
  }

  assert.equal(packetRecords.length, 10);
  assert.equal(packetIssueIds.length, 238);
  assert.equal(new Set(packetIssueIds).size, 238);
  assert.doesNotThrow(() => validateBatchNoDuplicates(packetRecords, existingRecords));

  const existingIssueIds = new Set(existingRecords.flatMap((record) => record.selectedIssueIds));
  assert.deepEqual(packetIssueIds.filter((id) => existingIssueIds.has(id)), []);

  for (const id of PACKET_IDS) {
    const report = await readJson(path.join(overlapsDir, `${id}.json`));
    assert.equal(report.comparisonCount, 35, `${id} overlap boundary changed`);
    assert.equal(report.candidateCount, packetRecords.find((record) => record.id === id).selectedIssueIds.length);
    assert.equal(report.comparisons.length, 35);
    assert.ok(report.comparisons.every((comparison) => (
      comparison.relationship === 'none'
      && comparison.sharedCount === 0
      && comparison.sharedIds.length === 0
    )), `${id} has an unapproved semantic overlap`);
  }
});
