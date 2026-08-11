# Security policy

## What this project is, because it decides what a vulnerability can be here

Marvel Reading Tracker is a static site that runs from your own machine. There is no server to
attack, no account to take over and no database holding anyone else's data. The app has no runtime
dependencies at all, so nothing in `package.json` reaches the browser: the three packages listed at
`package.json:26-28` are the lint tooling and run only on a maintainer's machine and in CI.
Your reading progress lives in one browser storage key and never leaves the machine it was made on.

That shape rules most classic vulnerability categories out and leaves a smaller set that matters a
great deal. Anything that silently loses or corrupts the reading progress a person has spent months
building is the most serious thing that can go wrong here, and it is treated as a security issue
rather than an ordinary defect.

## What is supported

The current state of the default branch. There are no releases, no tags and no published packages,
so there is nothing older to patch and no back-porting to do. If you are running a copy you cloned
some time ago, pull before reporting: the fix may already be in.

Version numbers here describe stored data rather than features. The rule is written in full at
`src/js/lib/version.js:5-9`, and the part that matters for upgrading is that a MAJOR change means an
older build cannot read this build's saved data. Export a backup before crossing one.

## Reporting a vulnerability

**Do not open a public issue, discussion or pull request for a suspected vulnerability.** A public
report is a disclosure, and it is one you cannot take back. That applies even when you are not sure
it is a real issue: report it privately and let it be assessed.

Use GitHub's private vulnerability reporting, on the repository's **Security** tab, under **Report a
vulnerability**. That route creates a private draft advisory that only you and the maintainer can
see, and it is the only channel this project accepts.

If that option is not visible on the Security tab, the repository is not yet public and the setting
cannot be enabled, because GitHub offers private vulnerability reporting on public repositories.
While that is the case there are no external users to be at risk and no report to make.

Please include what you would want if you were on the other side of it: what you did, what happened,
what you expected, which browser and version, and whether any saved reading data was affected. A
minimal reproduction is worth more than a long description. If a fix is obvious to you, say so, but
do not send a pull request that reveals the issue before it is fixed.

## What to expect

This is a single-maintainer project worked on in bursts, so what follows is a target rather than a
guarantee, and saying so plainly is more use to you than a number nobody is on call to meet.

- An acknowledgement that the report has been read, aimed at within seven days.
- An assessment of whether it is in scope and how serious it is, with the reasoning, not just a
  verdict.
- A fix on the default branch for anything accepted, and a note in `CHANGELOG.md` describing it in
  the terms a person using the app would notice.
- Credit in that entry if you want it, and none if you would rather not. Ask either way.

Please hold off on public disclosure until a fix is on the default branch, or until ninety days have
passed, whichever comes first. If the report is declined you are free to publish immediately, and
the reasoning you were given is yours to quote.

## In scope

- **Loss or corruption of saved reading progress**, including anything that makes a backup, a
  restore or an undo report an outcome that is not what actually happened. This is the highest
  severity category in this project.
- **The development server**, `server.mjs`, which serves the app on the loopback origin. Path
  traversal out of the served directory, or a response that would let a page from elsewhere read
  what it serves, are both in scope.
- **The metadata endpoint allowlist** at `src/js/lib/apiBase.js:26-38`. It exists so a stored
  setting cannot put a reader's requests on the network in the clear, and a way past it is in
  scope.
- **Generated and vendored data.** The files under `src/data/` are produced by the scripts in
  `scripts/`, and content in them that could execute, exfiltrate or mislead when rendered is in
  scope, as is anything in the generators that would let an upstream response do that.
- **Dependencies**, meaning the lint tooling and the GitHub Actions used by the workflow. They do
  not reach the browser, but they do run against a maintainer's checkout and in CI.
- **The workflows** in `.github/workflows/`. The CI workflow reads the repository and nothing else,
  declared at `.github/workflows/ci.yml:18-19`, and anything that would give it more than that is in
  scope.

## Out of scope

- **Marvel's own services**, including `marvel.com`, `read.marvel.com` and the Marvel Unlimited
  reader. This app links out to them and never scrapes them. Report issues there to Marvel.
- **The third-party metadata API** the app reads from. Its availability, its correctness and its
  rate limits are not this project's to fix, and the app is written to degrade rather than break
  when it is unavailable.
- **The end of the metadata snapshot in 2025.** That is a documented boundary with a manual entry
  form as its mitigation, not a defect.
- **The fault harness** at `src/dev-faults.html`. It damages saved reading data deliberately, says
  so in the page before any button, and exists so the recovery paths can be exercised. Reporting
  that it destroys data is reporting what it is for.
- **Anything that requires an attacker to already have the reader's browser profile or their
  machine.** At that point they have the data directly, and no change here would help.
- **Missing hardening that has no reachable consequence.** A recommendation from a scanner is
  welcome as an ordinary issue; it is not a vulnerability report.

## What already reduces risk here

Recorded so a report can start from what is true rather than from what a scanner assumed.

- The app sends no data anywhere. No accounts, no cloud services, no analytics, no telemetry.
- The development server sends a content security policy on every response, built at
  `server.mjs:43-54`, alongside `nosniff`, `no-referrer` and `X-Frame-Options: DENY`, set at
  `server.mjs:112-122`.
- The repository holds no secrets. Nothing in the scripts or the workflow reads a credential, and
  the metadata API needs no key.
- CI runs on every pull request with `contents: read` and nothing else.
- Every claim of the form `path:line` in every tracked file is fingerprinted against the lines it
  names, so documentation that has drifted from the code fails the build rather than misleading a
  reader.
