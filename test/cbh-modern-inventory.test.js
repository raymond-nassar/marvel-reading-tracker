import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateInventory } from '../scripts/lib/cbh-inventory.mjs';

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
