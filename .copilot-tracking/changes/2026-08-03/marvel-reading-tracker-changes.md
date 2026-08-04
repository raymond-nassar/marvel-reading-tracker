<!-- markdownlint-disable-file -->
# Changes Record: marvel-reading-tracker

Task ID: MRT-001 · Plan: .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md (v2, approved)

## CHG-001 — P00-T01 reader deep-link contract verified

* Date: 2026-08-03
* Phase/task: P00-T01
* Outcome: **PASS**

User verified, while logged into Marvel Unlimited, that `https://read.marvel.com/#/book/<digitalId>`
opens the correct issue for all three sampled eras:

| Expected issue | issueId | digitalId | Result |
|---|---|---|---|
| The Amazing Spider-Man (1963) #1 | 6482 | 1067 | correct |
| Secret Wars (2015) #1 | 52447 | 38164 | correct |
| Marvel Rivals: King in Black (2025) #1 | 132785 | 76967 | correct |

Significance: case 2 is the issue where the upstream README documents `38866` while the live API
returns `38164`. The **live API value is authoritative**; the upstream README is stale. The app must
therefore always resolve `digitalId` from `/v1/issues/{id}` and never from vendored upstream docs.

Canonical contract recorded:

* Reader deep link: `https://read.marvel.com/#/book/{digitalId}` where `digitalId` comes from
  `GET /v1/issues/{issueId}`.
* Fallback: `detailUrl` (`https://www.marvel.com/comics/issue/{issueId}/{slug}`).

Supporting evidence gathered during preparation:

* `digitalId` is near-universally populated — 10 of 10 randomly sampled 2025 issues had one. The
  null-`digitalId` fallback path still ships but is an edge case, not a common path.
* `unlimitedDate` is **not** trustworthy as availability proof — issue 6482 reports `1963-03-01`,
  predating Marvel Unlimited's 2007 launch. Confirms CR-007; the four-state availability model stays.

CR-001 is closed. P02 is unblocked.
