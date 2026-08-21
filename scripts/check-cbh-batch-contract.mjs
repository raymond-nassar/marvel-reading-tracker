#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKET_IDS } from './author-cbh-packet.mjs';
import { createJsonFetcher } from './lib/fetch-json.mjs';
import { lookupIssues } from './lib/lookup-issues.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://marvel.emreparker.com/v1';

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

async function main() {
  const manifest = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'curated-lists.json'), 'utf8'));
  const packetSet = new Set(PACKET_IDS);
  const entries = manifest.lists.filter((entry) => packetSet.has(entry.id));
  if (entries.length !== PACKET_IDS.length) {
    throw new Error(`Manifest contains ${entries.length} of ${PACKET_IDS.length} packet entries`);
  }

  const items = [];
  const expectedById = new Map();
  let expectedTotal = 0;
  for (const entry of entries) {
    const payload = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', entry.out), 'utf8'));
    const mapping = JSON.parse(await readFile(path.join(ROOT, 'scripts', 'data', 'cbh-mappings', `${entry.id}.json`), 'utf8'));
    const mappedIds = mapping.rows.map((row) => String(row.selectedIssueId));
    expectedTotal += mappedIds.length;
    const payloadIds = payload.items.map((item) => String(item.issueId));
    if (mappedIds.join('|') !== payloadIds.join('|')) {
      throw new Error(`${entry.id} generated sequence differs from its approved mapping`);
    }
    for (const [index, row] of mapping.rows.entries()) {
      if (String(payload.items[index]?.number) !== String(row.issueNumber)) {
        throw new Error(`${entry.id} generated issue number differs at source position ${index + 1}`);
      }
      expectedById.set(Number(row.selectedIssueId), row);
    }
    items.push(...payload.items);
  }
  if (items.length !== expectedTotal || new Set(items.map((item) => item.issueId)).size !== expectedTotal) {
    throw new Error(`Expected ${expectedTotal} distinct packet issues, found ${items.length}`);
  }

  const { getJson } = createJsonFetcher();
  const getJsonWithNetworkRetry = async (url) => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await getJson(url);
      } catch (error) {
        if (error?.status != null || attempt >= 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };
  const { meta, refused } = await lookupIssues(items.map((item) => item.issueId), {
    getJson: getJsonWithNetworkRetry,
    url: (id) => `${API}/issues/${id}`,
    onProgress: ({ done, total }) => {
      if (done % 25 === 0 || done === total) console.log(`${done}/${total}`);
    },
  });
  if (refused.size > 0) throw new Error(`${refused.size} packet issue ids returned 404`);

  const problems = [];
  for (const item of items) {
    const live = meta.get(item.issueId);
    if (!live) {
      problems.push(`${item.issueId}: no live metadata`);
      continue;
    }
    if (Number(live.id) !== item.issueId) problems.push(`${item.issueId}: live id is ${live.id}`);
    if (cleanText(live.title) !== item.title) problems.push(`${item.issueId}: title changed`);
    if (live.detailUrl !== item.url) problems.push(`${item.issueId}: detail URL changed`);
    if (Number(live.seriesId) !== item.seriesId) problems.push(`${item.issueId}: series changed`);
    if (String(live.issueNumber) !== String(expectedById.get(item.issueId)?.issueNumber)) {
      problems.push(`${item.issueId}: issue number changed`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`Packet contract found ${problems.length} mismatch(es):\n  - ${problems.join('\n  - ')}`);
  }
  console.log(`Packet contract passed for ${items.length} of ${items.length} added issue ids.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
