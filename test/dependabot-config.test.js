import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Dependabot fails open. A config that omits an ecosystem is not rejected and reports nothing,
// so the repository looks monitored while a whole class of dependency goes unwatched, and the
// only visible symptom is an absence of pull requests, which is also what a healthy week looks
// like. That is why the expectations below are derived from the repository rather than read out
// of the config: the check has to know what ought to be covered without being told by the file
// it is checking.

const root = new URL('../', import.meta.url);
const config = readFileSync(new URL('.github/dependabot.yml', root), 'utf8');

// Enough of a reader for a file of this shape, and deliberately no more: adding a YAML parser
// would mean adding a dependency, and Repository Constraint 4 puts runtime dependencies at zero
// while the dev graph is the thing this very config exists to watch.
function parseUpdates(text) {
  const lines = text.split(/\r?\n/).filter((line) => !/^\s*#/.test(line));
  const unquote = (value) => value.trim().replace(/^["']|["']$/g, '');
  const entries = [];
  for (const line of lines) {
    const start = /^\s*-\s*package-ecosystem:\s*(\S+)\s*$/.exec(line);
    if (start) {
      entries.push({ ecosystem: unquote(start[1]), directory: null, interval: null });
      continue;
    }
    if (entries.length === 0) continue;
    const current = entries[entries.length - 1];
    const directory = /^\s*directory:\s*(\S+)\s*$/.exec(line);
    if (directory) current.directory = unquote(directory[1]);
    const interval = /^\s*interval:\s*(\S+)\s*$/.exec(line);
    if (interval) current.interval = unquote(interval[1]);
  }
  return entries;
}

function expectedEcosystems() {
  const expected = new Set();
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  // Keyed on the manifest being a real npm project rather than on the file merely existing, so
  // this stays honest if package.json is ever reduced to a scripts holder.
  if (pkg.devDependencies || pkg.dependencies) expected.add('npm');

  const workflowDir = new URL('.github/workflows/', root);
  const workflows = readdirSync(fileURLToPath(workflowDir)).filter((name) => /\.ya?ml$/.test(name));
  // `uses:` rather than the presence of a workflow file, because a workflow that calls no action
  // has nothing for this ecosystem to update and would make the entry the stale kind.
  const usesActions = workflows.some((name) =>
    /^\s*(-\s*)?uses:\s*\S/m.test(readFileSync(new URL(name, workflowDir), 'utf8')));
  if (usesActions) expected.add('github-actions');

  return expected;
}

test('every dependency ecosystem in this repository is one Dependabot is configured to watch', () => {
  const configured = new Set(parseUpdates(config).map((entry) => entry.ecosystem));
  const expected = expectedEcosystems();

  const missing = [...expected].filter((name) => !configured.has(name));
  assert.deepEqual(missing, [], `ecosystems present but unwatched: ${missing.join(', ')}`);

  // The other direction matters as much and is quieter: an entry for something the repository no
  // longer contains never opens a pull request, so it reads as coverage forever.
  const stale = [...configured].filter((name) => !expected.has(name));
  assert.deepEqual(stale, [], `ecosystems watched but absent: ${stale.join(', ')}`);
});

test('each watched ecosystem names a directory and a schedule, which Dependabot requires', () => {
  const entries = parseUpdates(config);
  assert.ok(entries.length > 0, 'no update entries parsed out of the config');
  for (const entry of entries) {
    assert.equal(entry.directory, '/', `${entry.ecosystem} watches ${entry.directory}, not the root`);
    assert.ok(entry.interval, `${entry.ecosystem} declares no schedule interval`);
  }
});
