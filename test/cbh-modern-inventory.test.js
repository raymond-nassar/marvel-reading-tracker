import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateInventory, validateLiveInventory } from '../scripts/lib/cbh-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(root, 'scripts', 'data', 'cbh-modern-inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

test('the maintained inventory matches the P01 contract', () => {
  const counts = validateInventory(inventory);

  assert.equal(inventory.length, 86);
  assert.deepEqual(inventory.map((record) => record.position), Array.from({ length: 86 }, (_, index) => index + 1));

  const ids = inventory.map((record) => record.id);
  const urls = inventory.map((record) => record.url);
  assert.equal(new Set(ids).size, 86);
  assert.equal(new Set(urls).size, 86);

  assert.deepEqual(counts, {
    event: 42,
    era: 14,
    'sub-guide': 14,
    bridge: 10,
    'fast-track': 3,
    commerce: 3,
  });

  assert.ok(inventory.every((record) => record.reason && record.reason.trim().length > 0));
  assert.ok(inventory.every((record) => /^\d{4}-\d{2}-\d{2}$/.test(record.sourceRetrievedAt)));
  assert.ok(inventory.filter((record) => record.guideType === 'commerce').every((record) => record.disposition === 'excluded'));
  assert.equal(inventory.find((record) => record.id === 'armageddon-2026')?.disposition, 'deferred');
  assert.ok(inventory.every((record) => Array.isArray(record.overlapIds) && record.overlapIds.length === 0));
  assert.ok(inventory.every((record) => Array.isArray(record.catalogIds) && record.catalogIds.length === 0));
  assert.ok(inventory.filter((record) => record.disposition === 'new-order').every((record) => record.deliveryStatus === 'pending'));
  assert.ok(inventory.filter((record) => record.disposition !== 'new-order').every((record) => record.deliveryStatus === 'not-applicable'));
});

test('live inventory validation accepts a guarded lifecycle and rejects invalid transitions', () => {
  const liveRecords = [
    {
      position: 1,
      id: 'ready-order',
      title: 'Ready Order',
      url: 'https://example.com/ready',
      guideType: 'event',
      window: 'Q1',
      disposition: 'new-order',
      reason: 'Awaiting approval',
      sourceRetrievedAt: '2026-08-20',
      overlapIds: ['101'],
      catalogIds: ['catalog-1'],
      deliveryStatus: 'ready',
    },
    {
      position: 2,
      id: 'shipped-order',
      title: 'Shipped Order',
      url: 'https://example.com/shipped',
      guideType: 'event',
      window: 'Q1',
      disposition: 'new-order',
      reason: 'Approved and published',
      sourceRetrievedAt: '2026-08-20',
      overlapIds: ['101', '102'],
      catalogIds: ['catalog-1', 'catalog-2'],
      deliveryStatus: 'shipped',
    },
    {
      position: 3,
      id: 'blocked-order',
      title: 'Blocked Order',
      url: 'https://example.com/blocked',
      guideType: 'event',
      window: 'Q1',
      disposition: 'new-order',
      reason: 'Blocked by unresolved overlap',
      sourceRetrievedAt: '2026-08-20',
      overlapIds: [],
      catalogIds: ['catalog-3'],
      deliveryStatus: 'blocked',
    },
    {
      position: 4,
      id: 'reused-order',
      title: 'Reused Order',
      url: 'https://example.com/reused',
      guideType: 'era',
      window: 'Q2',
      disposition: 'reuse-existing',
      reason: 'Already published',
      sourceRetrievedAt: '2026-08-20',
      overlapIds: [],
      catalogIds: [],
      deliveryStatus: 'not-applicable',
    },
  ];

  assert.doesNotThrow(() => validateLiveInventory(liveRecords));

  const invalid = {
    ...liveRecords[0],
    deliveryStatus: 'not-applicable',
    disposition: 'new-order',
  };
  assert.throws(() => validateLiveInventory([invalid]), /deliveryStatus/i);
});
