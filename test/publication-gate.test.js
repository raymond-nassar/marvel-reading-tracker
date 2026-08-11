import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { PROTECTED, PATTERNS, EXEMPT, boundaryFaults, findings } from '../scripts/check-publication.mjs';

// The publication gate answers a question that only gets asked once, on the day someone decides to
// make this repository public, and by then every answer is already fixed. So the checks below are
// about keeping today's answer true rather than about producing it: that the ignore rules holding
// local-only content local are still in force, that the shapes the gate looks for are shapes it can
// actually find, and that the tracked tree is clean of them right now.
//
// Every credential-shaped fixture here is assembled from pieces rather than written out. A literal
// one would be a real string of that shape in a real file, which is precisely what push protection
// and the gate itself exist to stop, and a check that cannot be committed is not a check.

const root = new URL('../', import.meta.url);

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64e6, ...opts });
}

// One `git cat-file --batch` rather than a `git show` per file. The difference is not a nicety:
// spawning git 187 times took ten seconds, which is more than the rest of the suite together, and a
// check that slow is one somebody eventually stops running.
function trackedText() {
  const entries = git(['ls-tree', '-r', '-z', 'HEAD'])
    .split('\u0000')
    .filter(Boolean)
    .map((row) => {
      const tab = row.indexOf('\t');
      return { sha: row.slice(0, tab).split(' ')[2], file: row.slice(tab + 1) };
    })
    .filter(({ file }) => !EXEMPT.has(file));
  const raw = execFileSync('git', ['cat-file', '--batch'], {
    cwd: fileURLToPath(root),
    input: entries.map(({ sha }) => sha).join('\n'),
    maxBuffer: 512e6,
  });
  const out = [];
  let at = 0;
  for (const { file } of entries) {
    const nl = raw.indexOf(0x0a, at);
    const size = Number(raw.toString('utf8', at, nl).trim().split(' ')[2]);
    const body = raw.subarray(nl + 1, nl + 1 + size);
    at = nl + 1 + size + 1;
    out.push({ file, body });
  }
  return out;
}

function match(text) {
  const sink = new Map();
  findings('fixture', text, sink);
  return [...sink.keys()];
}

// One positive and one negative per pattern. The negative is the point: a pattern that matches its
// own example proves nothing if it also matches ordinary prose, and the ones most likely to do that
// are the loose ones, the assignment shape and the home-directory path.
const FIXTURES = [
  ["a path inside one machine's user profile", 'C:' + '\\Users\\somebody\\projects', 'the user profile directory'],
  ["a path inside one machine's home directory", ' /home/somebody/projects', 'a file under the home directory'],
  ['a session or workspace identifier', '577facd0-f9e4-4c0a-a5ff-77182d49c2c5', 'session 577facd0 and its workspace'],
  ['an AWS access key id', 'AKIA' + 'QRSTUVWX23456789', 'the AKIA prefix marks an access key id'],
  ['a GitHub token', 'gh' + 'p_' + 'x'.repeat(36), 'a token issued by GitHub'],
  ['a private key block', '-----BEGIN RSA PRIVATE KEY-----', 'a private key never belongs here'],
  ['a bearer token written out', 'Bearer ' + 'y'.repeat(24), 'send it as a bearer token'],
  ['a secret assigned in code', 'api_key = ' + '"' + 'z'.repeat(16) + '"', 'the api_key is read from the environment'],
  ['a Slack token', 'xox' + 'b-' + '2'.repeat(14), 'a Slack app token'],
];

test('every shape the gate looks for is a shape it can find, and none of them fires on ordinary prose', () => {
  assert.equal(FIXTURES.length, PATTERNS.length, 'each pattern carries a fixture');
  const named = new Set(PATTERNS.map(([name]) => name));
  for (const [name, positive, negative] of FIXTURES) {
    assert.ok(named.has(name), `${name} is a pattern the gate carries`);
    assert.ok(match(positive).includes(name), `${name} matches the shape it describes`);
    assert.deepEqual(match(negative), [], `${name}: prose describing the shape is not the shape`);
  }
});

test('the roots holding one session\'s working artifacts are still ignored', () => {
  const faults = boundaryFaults();
  assert.deepEqual(faults, [], faults.join('\n'));
  // Named rather than counted, because the failure this guards is a rule quietly disappearing and a
  // count of zero faults is equally true of a list that has been emptied.
  const roots = PROTECTED.map(([dir]) => dir);
  assert.ok(roots.includes('.copilot-tracking/'), 'the tracking root is protected');
  assert.ok(roots.includes('.github/prompts/'), 'the prompts root is protected');
});

test('no tracked file carries a credential or one machine\'s private detail', () => {
  const files = trackedText();
  assert.ok(files.length > 100, 'the tracked tree was actually enumerated');
  const sink = new Map();
  for (const { file, body } of files) {
    if (body.includes(0)) continue;
    findings(file, body.toString('utf8'), sink);
  }
  const report = [...sink].map(([name, list]) => `${name}: ${list.map((h) => `${h.hit} in ${h.label}`).join(', ')}`);
  assert.deepEqual(report, [], report.join('\n'));
});

test('the exemption covers the two files that carry these shapes deliberately, and nothing else', () => {
  assert.deepEqual([...EXEMPT].sort(), ['scripts/check-publication.mjs', 'test/publication-gate.test.js']);
  // An exemption for a file that has since been renamed or deleted is an exemption that silently
  // stops covering anything, and the gate cannot tell that from one that was never needed.
  const tracked = new Set(git(['ls-files']).split('\n').map((s) => s.trim()).filter(Boolean));
  for (const file of EXEMPT) assert.ok(tracked.has(file), `${file} is tracked, so the exemption still names something`);
});
