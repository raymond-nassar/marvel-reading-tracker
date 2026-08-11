import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The workflow had no deadline of any kind, so every job inherited the platform default of
// six hours. A hung install or a wedged step would have burned that before anyone was told.
// The fix is deadlines, and the interesting part is where they go.
//
// Measured on a probe workflow run on 2026-08-11 rather than read anywhere: the same overrun
// under a job-level `timeout-minutes` ends the job with conclusion `cancelled`, and under a
// step-level one it ends with `failure` and marks the step. That difference decides the whole
// design here, because this repository's concurrency group cancels superseded runs and its own
// contributor guide teaches readers that a cancelled job means nothing is broken. A deadline
// reporting `cancelled` would be a real failure wearing the one costume everyone here is
// trained to dismiss.
//
// So the deadline that fires has to be the step's, and the job's exists only as a backstop for
// time spent outside any step. That ordering is not visible in the file; it is an arithmetic
// relationship between numbers written eighty lines apart, which is exactly the kind of thing
// that decays quietly. Hence this.

// YAML by hand, because a parser is a dependency and runtime dependencies stay at zero here.
// It only has to read one file that this repository controls, and the last test below is what
// makes that safe: it holds the parser to the file's own count of deadlines, so a step the
// parser silently failed to see cannot pass as a step that has one.
function parseWorkflow(yml) {
  const jobs = [];
  let inJobs = false;
  let job = null;
  let inSteps = false;
  let step = null;

  for (const line of yml.split(/\r?\n/)) {
    if (line.trim() === '' || /^\s*#/.test(line)) continue;

    if (/^jobs:\s*$/.test(line)) {
      inJobs = true;
      continue;
    }
    if (/^\S/.test(line)) {
      inJobs = false;
      continue;
    }
    if (!inJobs) continue;

    const header = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (header) {
      job = { name: header[1], timeout: null, steps: [] };
      jobs.push(job);
      inSteps = false;
      step = null;
      continue;
    }
    if (!job) continue;

    const jobKey = /^ {4}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (jobKey) {
      inSteps = jobKey[1] === 'steps';
      step = null;
      if (jobKey[1] === 'timeout-minutes') job.timeout = Number(jobKey[2].trim());
      continue;
    }
    if (!inSteps) continue;

    const opener = /^ {6}- (.*)$/.exec(line);
    if (opener) {
      step = { label: null, timeout: null };
      job.steps.push(step);
      readStepKey(step, opener[1]);
      continue;
    }

    const body = /^ {8}(\S.*)$/.exec(line);
    if (body && step) readStepKey(step, body[1]);
  }

  return jobs;
}

function readStepKey(step, text) {
  const pair = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(text);
  if (!pair) return;
  if (pair[1] === 'timeout-minutes') step.timeout = Number(pair[2].trim());
  if ((pair[1] === 'name' || pair[1] === 'uses') && step.label === null) step.label = pair[2].trim();
}

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const jobs = parseWorkflow(workflow);

// Time the runner spends inside the job but outside any declared step: setting the job up,
// running each action's post phase, and cleaning up. Measured across 676 successful jobs it
// totals eight seconds at its worst, so a minute is the margin with two orders of magnitude
// of room. The point of the margin is not the eight seconds; it is that the job deadline must
// be unreachable while a step still has allowance left.
const RUNNER_OVERHEAD_MINUTES = 1;

test('every job in the workflow declares a deadline', () => {
  assert.deepEqual(jobs.map((j) => j.name), ['test', 'lint'], 'and the parser found the jobs to check');
  for (const job of jobs) {
    assert.ok(
      Number.isInteger(job.timeout) && job.timeout > 0,
      `job ${job.name} has no deadline, so it inherits the six hour platform default`,
    );
  }
});

test('every step in every job declares its own deadline', () => {
  for (const job of jobs) {
    assert.ok(job.steps.length >= 4, `the parser found steps in job ${job.name}`);
    for (const step of job.steps) {
      assert.ok(
        Number.isInteger(step.timeout) && step.timeout > 0,
        `step "${step.label}" in job ${job.name} has no deadline, so an overrun there reports cancelled rather than failure`,
      );
    }
  }
});

test('each job deadline stays out of the way until every step has used its own', () => {
  for (const job of jobs) {
    const declared = job.steps.reduce((total, step) => total + step.timeout, 0);
    assert.ok(
      job.timeout >= declared + RUNNER_OVERHEAD_MINUTES,
      `job ${job.name} allows ${job.timeout} minutes but its steps allow ${declared}, `
        + 'so the job deadline can fire first and report the overrun as cancelled',
    );
  }
});

// The three tests above are only worth their run time if the parser sees the whole file. A
// parser that quietly stopped at the first job would report every step it found as compliant
// and say nothing about the rest, which is the shape of vacuity that has already cost this
// repository one test. Counting the raw declarations is the cheapest thing that cannot be
// fooled that way: it is derived from the text rather than from the parse.
test('the parser accounts for every deadline the file declares', () => {
  const declared = workflow
    .split(/\r?\n/)
    .filter((line) => /^\s*timeout-minutes:/.test(line)).length;
  const found = jobs.reduce(
    (total, job) => total + (job.timeout === null ? 0 : 1) + job.steps.filter((s) => s.timeout !== null).length,
    0,
  );
  assert.ok(declared > 0, 'the file declares deadlines at all');
  assert.equal(found, declared, 'every deadline written in the file was attributed to a job or a step');
});
