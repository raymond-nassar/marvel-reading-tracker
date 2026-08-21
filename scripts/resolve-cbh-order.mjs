import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveRow, validateResolvedMapping } from './lib/cbh-resolution.mjs';

export async function resolveMapping(mapping) {
  if (!mapping || !Array.isArray(mapping.rows)) {
    throw new Error('The mapping file must contain a rows array');
  }

  const resolvedRows = mapping.rows.map((row) => {
    const candidates = Array.isArray(row.candidateIssueIds)
      ? row.candidateIssueIds.map((issueId) => ({
        id: issueId,
        title: row.normalizedSeriesTitle ?? row.seriesTitle ?? row.title ?? '',
        issueNumber: row.issueNumber ?? row.number ?? row.issue ?? null,
        seriesYear: row.seriesYear ?? row.year ?? null,
      }))
      : [];

    const settlement = resolveRow(row, candidates);
    return {
      ...row,
      ...settlement,
      candidateIssueIds: settlement.candidateIssueIds ?? row.candidateIssueIds ?? [],
      selectedIssueId: settlement.selectedIssueId ?? row.selectedIssueId ?? null,
      selectedIssueIds: settlement.selectedIssueIds ?? row.selectedIssueIds ?? [],
      note: settlement.note ?? row.note ?? '',
      resolutionStatus: settlement.resolutionStatus ?? row.resolutionStatus ?? 'unmatched',
    };
  });

  validateResolvedMapping(resolvedRows);
  return { ...mapping, rows: resolvedRows };
}

async function main() {
  const mappingPath = process.argv[2];
  if (!mappingPath) {
    console.error('Usage: npm run cbh:resolve -- <mapping-path>');
    process.exitCode = 1;
    return;
  }

  const text = await readFile(mappingPath, 'utf8');
  const mapping = JSON.parse(text);
  const resolved = await resolveMapping(mapping);
  await writeFile(mappingPath, `${JSON.stringify(resolved, null, 2)}\n`, 'utf8');
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
