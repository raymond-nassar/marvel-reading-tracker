import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildComparisonReport, issueIdsFromValue } from './lib/cbh-overlap.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function normalizeIssueId(value) {
  if (value == null) return null;
  const string = String(value).trim();
  return string.length === 0 ? null : string;
}

function validateMappingRows(rows, label) {
  if (!Array.isArray(rows)) {
    throw new Error(`${label} must contain a rows array`);
  }

  const seenIds = new Set();
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== 'object') {
      throw new Error(`${label} row ${index + 1} is not an object`);
    }

    const status = row.resolutionStatus ?? row.status ?? null;
    const selectedIssueId = normalizeIssueId(row.selectedIssueId ?? row.issueId ?? null);
    if (status === 'approved-exception' || row.status === 'approved-exception') {
      throw new Error(`${label} row ${index + 1} uses an approved exception, which MRT-004 rejects`);
    }

    if (status === 'exact') {
      if (!selectedIssueId) {
        throw new Error(`${label} row ${index + 1} is exact but has no selected issue id`);
      }
      if (seenIds.has(selectedIssueId)) {
        throw new Error(`Duplicate selected issue id in ${label}: ${selectedIssueId}`);
      }
      seenIds.add(selectedIssueId);
      continue;
    }

    if (status === 'ambiguous' || status === 'unmatched') {
      throw new Error(`${label} row ${index + 1} is unresolved (${status}) and cannot produce a report`);
    }

    if (status != null && !['exact', 'ambiguous', 'unmatched', 'approved-exception'].includes(status)) {
      throw new Error(`${label} row ${index + 1} has an invalid resolution status: ${status}`);
    }

    if (selectedIssueId != null && status == null) {
      throw new Error(`${label} row ${index + 1} is missing a resolution status`);
    }

    if (status == null && selectedIssueId == null) {
      throw new Error(`${label} row ${index + 1} is missing both a selected issue id and a resolution status`);
    }
  }
}

export async function loadManifest(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const lists = Array.isArray(manifest.lists) ? manifest.lists : [];
  return lists;
}

export async function buildReportForMapping(mappingPath, peerPaths = []) {
  const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
  const rows = Array.isArray(mapping.rows) ? mapping.rows : [];
  validateMappingRows(rows, 'candidate mapping');

  const candidateIds = rows
    .map((row) => normalizeIssueId(row.selectedIssueId ?? row.issueId ?? null))
    .filter((value) => value != null);

  if (candidateIds.length === 0) {
    throw new Error('Candidate mapping is empty or has no exact selected issue ids');
  }

  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error('Duplicate candidate issue ids in the mapping');
  }

  const peers = await Promise.all(peerPaths.map(async (peerPath) => {
    const peer = JSON.parse(await readFile(peerPath, 'utf8'));
    const peerRows = Array.isArray(peer.rows) ? peer.rows : [];
    validateMappingRows(peerRows, `peer mapping ${path.basename(peerPath)}`);
    const ids = peerRows
      .map((row) => normalizeIssueId(row.selectedIssueId ?? row.issueId ?? null))
      .filter((value) => value != null);
    if (ids.length === 0) {
      throw new Error(`Peer mapping ${path.basename(peerPath)} is empty or has no exact selected issue ids`);
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error(`Duplicate comparison ids in peer mapping ${path.basename(peerPath)}`);
    }
    return { orderId: peer.id ?? path.basename(peerPath, path.extname(peerPath)), issueIds: ids };
  }));

  const candidateOrderId = String(mapping.id ?? path.basename(mappingPath, path.extname(mappingPath)));
  const peerOrderIds = new Set(peers.map((peer) => String(peer.orderId)));
  const manifest = await loadManifest(path.join(rootDir, 'src', 'data', 'curated-lists.json'));
  const orders = await Promise.all(manifest
    .filter((item) => item.id !== candidateOrderId && !peerOrderIds.has(String(item.id)))
    .map(async (item) => {
      const filePath = path.join(rootDir, 'src', 'data', item.out || `${item.id}.json`);
      let payload;
      try {
        payload = JSON.parse(await readFile(filePath, 'utf8'));
      } catch (error) {
        throw new Error(`Missing generated payload for ${item.id}: ${error.message}`, { cause: error });
      }
      const issueIds = issueIdsFromValue(payload);
      return { orderId: item.id, issueIds };
    }));

  return buildComparisonReport({ candidateIds, orders, peerOrders: peers });
}

async function main() {
  const mappingPath = process.argv[2];
  if (!mappingPath) {
    console.error('Usage: npm run orders:overlap -- <mapping-path> [peer-mapping-path...]');
    process.exitCode = 1;
    return;
  }

  const peerPaths = process.argv.slice(3);
  const report = await buildReportForMapping(mappingPath, peerPaths);
  const outputDir = path.join(rootDir, 'scripts', 'data', 'cbh-overlaps');
  const outPath = path.join(outputDir, `${path.basename(mappingPath, path.extname(mappingPath))}.json`);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
