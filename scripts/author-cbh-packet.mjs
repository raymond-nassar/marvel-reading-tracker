#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseManifest } from '../src/js/lib/curated.js';
import { escapeLinkText } from '../src/js/lib/markdown.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAPPINGS_DIR = path.join(ROOT, 'scripts', 'data', 'cbh-mappings');
const OVERLAPS_DIR = path.join(ROOT, 'scripts', 'data', 'cbh-overlaps');
const ORDERS_DIR = path.join(ROOT, 'src', 'data', 'orders');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'curated-lists.json');

export const PACKET_IDS = Object.freeze([
  'secret-war',
  'spider-man-the-other',
  'world-war-hulk-aftersmash',
  'shadowland',
  'chaos-war',
  'axis',
  'spider-verse',
  'apocalypse-wars',
  'clone-conspiracy',
  'inhumans-vs-x-men',
]);

const MANIFEST_FIELDS = new Set([
  'id',
  'name',
  'description',
  'type',
  'depth',
  'beginner',
  'coverIssueId',
  'group',
  'groupName',
  'variant',
  'sourceUrl',
  'sourcePage',
  'sourceOrigin',
  'sourceLicense',
  'out',
  'characters',
  'keywords',
  'expect',
  'timeline',
  'sourceFile',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function manifestEntryForMapping(mapping) {
  assert(mapping?.reviewStatus === 'approved', `${mapping?.id ?? 'mapping'} is not approved`);
  assert(mapping?.packetReview, `${mapping.id} has no packet review`);
  const approved = mapping.approvedManifest;
  assert(approved && typeof approved === 'object', `${mapping.id} has no approved manifest`);

  const entry = { ...approved };
  delete entry.coverSourcePosition;
  delete entry.coverSourceReference;
  const unexpected = Object.keys(entry).filter((key) => !MANIFEST_FIELDS.has(key));
  assert(unexpected.length === 0, `${mapping.id} has unsupported manifest fields: ${unexpected.join(', ')}`);
  assert(entry.sourceOrigin === "Compiled for this project from Comic Book Herald's guide", `${mapping.id} has the wrong source origin`);
  assert(entry.sourceLicense === null, `${mapping.id} must keep sourceLicense null`);
  assert(entry.sourcePage === mapping.sourceUrl, `${mapping.id} source page differs from its mapping`);
  assert(entry.expect === mapping.rows.length, `${mapping.id} expected count differs from its mapping`);
  return entry;
}

export function selectedIssueIds(mapping) {
  const rows = Array.isArray(mapping?.rows) ? mapping.rows : [];
  return rows.map((row, index) => {
    assert(row?.resolutionStatus === 'exact', `${mapping.id} row ${index + 1} is not exact`);
    assert(Number.isInteger(Number(row.selectedIssueId)), `${mapping.id} row ${index + 1} has no selected issue id`);
    assert(/^https:\/\/www\.marvel\.com\/comics\/issue\/\d+\//.test(String(row.marvelIssueUrl)), `${mapping.id} row ${index + 1} has no exact Marvel issue URL`);
    assert(typeof row.resolvedIssueTitle === 'string' && row.resolvedIssueTitle.trim(), `${mapping.id} row ${index + 1} has no resolved title`);
    return String(row.selectedIssueId);
  });
}

export function buildMarkdown(mapping) {
  const manifest = manifestEntryForMapping(mapping);
  selectedIssueIds(mapping);
  const trail = [
    `Generated for this project by scripts/author-cbh-packet.mjs from the independently reviewed ${mapping.id} issue mapping.`,
    `The mapping transcribes only issue-bearing references from Comic Book Herald's exact guide, expands its ranges, and preserves its source order.`,
    'No source commentary or images are copied. Issue identities, titles, and exact links come from Marvel metadata after the packet resolution and overlap gates passed.',
    'See [the data provenance record](../../../docs/DATA_PROVENANCE.md) for the permission boundary and review method.',
  ].join('\n');
  const checklist = mapping.rows.map((row) => (
    `- [ ] [${escapeLinkText(row.resolvedIssueTitle)}](${row.marvelIssueUrl})`
  ));
  return `# ${manifest.name}: Issue-by-Issue Reading Checklist\n\n${trail}\n\n${checklist.join('\n')}\n`;
}

function assertNoDuplicates(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export function existingEntriesForPacket(lists) {
  const packetIds = new Set(PACKET_IDS);
  return (Array.isArray(lists) ? lists : []).filter((entry) => !packetIds.has(entry.id));
}

export async function authorPacket() {
  const current = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const currentLists = Array.isArray(current.lists) ? current.lists : [];
  const existing = existingEntriesForPacket(currentLists);
  const mappings = [];
  const entries = [];
  const issueIds = [];

  for (const id of PACKET_IDS) {
    const mapping = JSON.parse(await readFile(path.join(MAPPINGS_DIR, `${id}.json`), 'utf8'));
    const report = JSON.parse(await readFile(path.join(OVERLAPS_DIR, `${id}.json`), 'utf8'));
    assert(mapping.id === id, `${id} mapping id changed`);
    const ids = selectedIssueIds(mapping);
    assert(new Set(ids).size === ids.length, `${id} contains a duplicate selected issue id`);
    assert(report.candidateCount === ids.length, `${id} overlap count differs from its mapping`);
    assert(report.comparisonCount === existing.length + PACKET_IDS.length - 1, `${id} overlap report is incomplete`);
    assert(report.comparisons.every((comparison) => comparison.relationship === 'none'), `${id} has an unapproved overlap`);
    mappings.push(mapping);
    entries.push(manifestEntryForMapping(mapping));
    issueIds.push(...ids);
  }

  assertNoDuplicates(issueIds, 'packet issue id');
  assertNoDuplicates(entries.map((entry) => entry.id), 'packet catalog id');
  assertNoDuplicates(entries.map((entry) => entry.sourcePage), 'packet source page');
  assertNoDuplicates(entries.map((entry) => entry.out), 'packet output');
  assertNoDuplicates(entries.map((entry) => entry.sourceFile), 'packet source file');

  const existingIds = new Set(existing.map((entry) => entry.id));
  const existingPages = new Set(existing.map((entry) => entry.sourcePage).filter(Boolean));
  const existingOutputs = new Set(existing.map((entry) => entry.out));
  const existingSources = new Set(existing.map((entry) => entry.sourceFile).filter(Boolean));
  for (const entry of entries) {
    assert(!existingIds.has(entry.id), `${entry.id} duplicates a shipped catalog id`);
    assert(!existingPages.has(entry.sourcePage), `${entry.id} duplicates a shipped source page`);
    assert(!existingOutputs.has(entry.out), `${entry.id} duplicates a shipped output`);
    assert(!existingSources.has(entry.sourceFile), `${entry.id} duplicates a shipped source file`);
  }

  const nextManifest = { ...current, lists: [...existing, ...entries] };
  const parsed = parseManifest(nextManifest);
  assert(parsed.errors.length === 0, `Authored manifest is invalid:\n${parsed.errors.join('\n')}`);
  assert(parsed.entries.length === existing.length + PACKET_IDS.length, 'Authored manifest lost an order');

  await mkdir(ORDERS_DIR, { recursive: true });
  for (const mapping of mappings) {
    const entry = entries.find((candidate) => candidate.id === mapping.id);
    await writeFile(path.join(ORDERS_DIR, entry.sourceFile), buildMarkdown(mapping), 'utf8');
  }
  await writeFile(MANIFEST_PATH, `${JSON.stringify(nextManifest, null, 2)}\n`, 'utf8');
  return {
    guides: mappings.length,
    rows: issueIds.length,
    manifestEntries: nextManifest.lists.length,
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  authorPacket().then((summary) => {
    console.log(`Authored ${summary.guides} guides with ${summary.rows} rows; manifest now has ${summary.manifestEntries} entries.`);
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
