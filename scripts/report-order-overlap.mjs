import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildComparisonReport, issueIdsFromValue } from './lib/cbh-overlap.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function loadManifest(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const lists = Array.isArray(manifest.lists) ? manifest.lists : [];
  return lists;
}

export async function buildReportForMapping(mappingPath, peerPaths = []) {
  const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
  const rows = Array.isArray(mapping.rows) ? mapping.rows : [];
  const candidateIds = rows
    .map((row) => row.selectedIssueId ?? row.issueId ?? null)
    .filter((value) => value != null)
    .map(String);

  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error('Duplicate candidate issue ids in the mapping');
  }

  const manifest = await loadManifest(path.join(rootDir, 'src', 'data', 'curated-lists.json'));
  const orders = await Promise.all(manifest.map(async (item) => {
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

  const peers = await Promise.all(peerPaths.map(async (peerPath) => {
    const peer = JSON.parse(await readFile(peerPath, 'utf8'));
    const peerRows = Array.isArray(peer.rows) ? peer.rows : [];
    const ids = peerRows.map((row) => row.selectedIssueId ?? row.issueId ?? null).filter((value) => value != null).map(String);
    return { orderId: peer.id ?? path.basename(peerPath, path.extname(peerPath)), issueIds: ids };
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
