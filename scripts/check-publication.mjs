#!/usr/bin/env node
// The publication gate. This repository is private, and several of the things that would make it
// safe to publish are decisions rather than code: which working artifacts are public evidence and
// which stay on one machine, and whether anything personal is already committed. A decision that
// lives in someone's head is not one, so this is where both are written down and checked.
//
// Two halves, with two different populations, because conflating them is the mistake this script
// was written after making.
//
//   Boundary   The ignore rules that keep local-only content local are actually in force. Reads the
//              working tree, so it holds on any clone including a shallow one.
//   History    Nothing personal or credential-shaped is committed anywhere a reader could reach.
//              Needs history, so on a shallow clone it says so rather than passing quietly.
//
// Run it with no arguments for both halves against whatever history is present. `--surface`
// scans what a clone of the remote would receive rather than the local object store, which is the
// distinction the header comment on PATTERNS explains and the reason this script exists at all.

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SURFACE = process.argv.includes('--surface');

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 512e6, ...opts });
}

// Roots whose contents are working evidence for one session rather than product documentation.
// Naming the roots is not the enumeration this repository warns about: the rule is "nothing new
// under here", and git ignores have no effect on a file that is already tracked, so the six
// artifacts committed under the first of these keep working untouched while everything added
// later is held out by construction. Nobody has to keep a list of filenames complete.
export const PROTECTED = [
  ['.copilot-tracking/', 'working artifacts for one session, kept out of the product record'],
  ['.github/prompts/', 'spent instructions to an agent, which BL-060 parked rather than commit'],
];

// Shapes that must not reach a published tree. Each is a signature rather than a guess at a value:
// a match is a thing that looks like a credential or like one machine's private detail, and the
// gate's answer to a match is to stop rather than to judge.
export const PATTERNS = [
  ['a path inside one machine\'s user profile', /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+/g],
  ['a path inside one machine\'s home directory', /(?:^|[\s"'(])\/(?:home|Users)\/[A-Za-z0-9._-]+\//gm],
  ['a session or workspace identifier', /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi],
  ['an AWS access key id', /\bAKIA[0-9A-Z]{16}\b/g],
  ['a GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g],
  ['a private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ['a bearer token written out', /\bBearer\s+[A-Za-z0-9._~+/-]{20,}/g],
  ['a secret assigned in code', /\b(?:api[_-]?key|secret|password|passwd|token|credential)s?\s*[:=]\s*["'][^"'\s]{12,}["']/gi],
  ['a Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g],
];

// Written into the tree deliberately, as the example of the thing being looked for. A gate that
// cannot be told about its own documentation fails on the sentence that explains it, which is a
// failure nobody can act on and everybody learns to ignore.
export const EXEMPT = new Set(['scripts/check-publication.mjs', 'test/publication-gate.test.js']);

export function findings(label, text, sink) {
  for (const [name, re] of PATTERNS) {
    const hits = text.match(re);
    if (!hits) continue;
    if (!sink.has(name)) sink.set(name, []);
    for (const hit of new Set(hits)) sink.get(name).push({ label, hit: hit.trim().slice(0, 80) });
  }
}

// ------------------------------------------------------------------ the boundary half

export function boundaryFaults() {
  const faults = [];
  for (const [root, why] of PROTECTED) {
    // A path that does not exist, so the answer is about the rule rather than about a file. `git
    // check-ignore` exits 1 when the path is not ignored, which is the fault this is looking for.
    const probe = `${root}2099-01-01/would-a-new-artifact-be-held-out.md`;
    let ignored = false;
    try {
      git(['check-ignore', '--quiet', '--no-index', '--', probe]);
      ignored = true;
    } catch {
      ignored = false;
    }
    if (!ignored) faults.push(`${root} is not ignored, so a new file there would be committed by an ordinary \`git add -A\`. It holds ${why}.`);
  }
  return faults;
}

// ------------------------------------------------------------------ the content half

function trackedBlobs() {
  const files = git(['ls-files']).split('\n').map((s) => s.trim()).filter(Boolean);
  return files.map((file) => {
    let text = null;
    try {
      text = git(['show', `HEAD:${file}`]);
    } catch {
      text = null;
    }
    return { file, text };
  });
}

// The population a clone would receive, rather than every object this machine happens to hold.
// The difference is not academic: the local store carries a tooling namespace of checkpoint refs
// whose commit messages are all session identifiers, and scanning it reported 316 of them. None is
// advertised by the remote, so none would ever be published, and a gate built on `--all` would
// have been permanently red over content no one could remove.
function surfaceObjects() {
  const tracking = git(['for-each-ref', '--format=%(refname)', 'refs/remotes/origin'])
    .split('\n').map((s) => s.trim()).filter(Boolean).filter((r) => !r.endsWith('/HEAD'));
  if (tracking.length === 0) return null;
  return tracking;
}

function scanCommits(refs, sink) {
  const log = git(['log', ...refs, '--format=%H%n%B%n=====END=====']);
  let count = 0;
  for (const entry of log.split('=====END=====')) {
    const trimmed = entry.replace(/^\s+/, '');
    const nl = trimmed.indexOf('\n');
    if (nl < 0) continue;
    count += 1;
    findings(`commit ${trimmed.slice(0, nl).trim().slice(0, 8)}`, trimmed.slice(nl + 1), sink);
  }
  return count;
}

function scanBlobs(refs, sink) {
  const objects = git(['rev-list', '--objects', ...refs]).split('\n').map((s) => s.trim()).filter(Boolean);
  const names = new Map();
  for (const line of objects) {
    const sp = line.indexOf(' ');
    names.set(sp > 0 ? line.slice(0, sp) : line, sp > 0 ? line.slice(sp + 1) : '');
  }
  const check = git(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], {
    input: [...names.keys()].join('\n'),
  });
  const wanted = [];
  for (const line of check.split('\n')) {
    const [sha, type, size] = line.trim().split(' ');
    if (type !== 'blob' || Number(size) >= 4e6) continue;
    const name = names.get(sha) || sha.slice(0, 8);
    if (EXEMPT.has(name)) continue;
    wanted.push({ sha, name });
  }
  // One `git cat-file --batch` for every blob rather than one spawn each. At a thousand blobs the
  // per-spawn cost was most of the runtime, and a gate slow enough to notice is one that gets moved
  // out of the pipeline eventually.
  const raw = execFileSync('git', ['cat-file', '--batch'], {
    cwd: ROOT,
    input: wanted.map(({ sha }) => sha).join('\n'),
    maxBuffer: 512e6,
  });
  let at = 0;
  let scanned = 0;
  for (const { name } of wanted) {
    const nl = raw.indexOf(0x0a, at);
    if (nl < 0) break;
    const size = Number(raw.toString('utf8', at, nl).trim().split(' ')[2]);
    const body = raw.subarray(nl + 1, nl + 1 + size);
    at = nl + 1 + size + 1;
    if (body.includes(0)) continue;
    scanned += 1;
    findings(name, body.toString('utf8'), sink);
  }
  return scanned;
}

function isShallow() {
  try { return git(['rev-parse', '--is-shallow-repository']).trim() === 'true'; } catch { return false; }
}

// ------------------------------------------------------------------ report

function main() {
  const faults = boundaryFaults();
  const sink = new Map();
  let population;

  if (SURFACE) {
    const refs = surfaceObjects();
    if (refs === null) {
      console.error('No remote-tracking refs. --surface scans what a clone of the remote would receive, so there is nothing to scan.');
      return 2;
    }
    const blobs = scanBlobs(refs, sink);
    const commits = scanCommits(refs, sink);
    population = `${refs.length} branch(es) the remote advertises, ${blobs} blob(s) and ${commits} commit message(s)`;
  } else if (isShallow()) {
    for (const { file, text } of trackedBlobs()) {
      if (text === null || EXEMPT.has(file) || text.includes('\u0000')) continue;
      findings(file, text, sink);
    }
    population = 'the tracked working tree only, because this clone is shallow and has no history to read';
  } else {
    const blobs = scanBlobs(['HEAD'], sink);
    const commits = scanCommits(['HEAD'], sink);
    population = `every commit reachable from HEAD, ${blobs} blob(s) and ${commits} commit message(s)`;
  }

  const revision = git(['rev-parse', 'HEAD']).trim();
  const total = [...sink.values()].reduce((n, list) => n + list.length, 0);
  console.log(`Publication gate at ${revision}`);
  console.log(`Scanned ${population}.`);
  console.log(`${PROTECTED.length} protected root(s), ${faults.length} not in force. ${total} content finding(s).`);

  for (const fault of faults) console.log(`\nBOUNDARY  ${fault}`);
  for (const [name, list] of sink) {
    console.log(`\nCONTENT   ${name}: ${list.length} occurrence(s)`);
    let shown = 0;
    for (const { label, hit } of list) {
      if (shown++ >= 10) { console.log(`            ... and ${list.length - 10} more`); break; }
      console.log(`            ${JSON.stringify(hit)}  in ${label}`);
    }
  }

  if (faults.length === 0 && total === 0) {
    console.log('\nNothing to remediate. Record this revision and this population beside any claim that the history is clean.');
    return 0;
  }
  console.log('\nA finding here is not automatically a leak. Read each one: the answer is either to remove it,');
  console.log('or to record why it is deliberate, and a shape that is deliberate everywhere belongs in EXEMPT.');
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
