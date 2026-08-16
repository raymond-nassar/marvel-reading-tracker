# Publication runbook

Twenty-one passages in this repository are true only while it is private, spread over ten files. They
say so plainly, which was the right way to write them: a security policy that describes a reporting
route nobody can use is more use than one that pretends the route is there. The cost is that
publishing makes all of them false in the same moment, and none of them is a `path:line` claim, so
no gate will notice.

This document names every one of them rather than counting them, and it carries the search that
finds them, because that list has been incomplete twice. Treat the count as a floor and the search
as the instrument. It exists so the flip is something to work through rather than something to
remember, and so the person doing it is not also the person who has to find out what it touches.

Nothing here is a legal opinion, and nothing here says the repository should be published. The first
section is what has to be settled before it is.

## Before anything is flipped

Two things have to be settled here. Neither is a setting, and both are one-way.

The first is BL-099. Its fifth acceptance item asks for legal review before the committed data tree
can be described as MIT-licensed, and it is deliberately unticked. The provenance record names that
review as the reason for the current state at `docs/DATA_PROVENANCE.md:11-13`, and sets out the four
questions such a review would have to answer. On 2026-08-15 the owner recorded being satisfied with
BL-099 and chose to move ahead without commissioning it. That is an accepted risk rather than an
answered question, it is written into the provenance document in those terms, and the acceptance
item stays unticked because no review took place. Nothing here is a legal opinion and that has not
changed.

The second was found on 2026-08-15 while removing Marvel's description text under BL-130, and it is
the sharper of the two because it expires. The working tree no longer carries that prose, but git
history does: 243 of the 246 commits then on `main` hold it, and 455 distinct descriptions and
89,558 characters are recoverable from them. A clone of a public repository carries the whole
history rather than only its tip, so the removal does not reach anybody who goes looking. Rewriting
history would reach it, this repository has never been public and has no forks so the rewrite will
never be cheaper than it is now, and the flip is the moment that stops being true. Settle it before
publishing or accept it permanently. There is no third option afterwards.

Everything below assumes both have been settled.

## Settings that only become available on the day

Three things this project wants are free on any public repository and cannot be turned on at all
today. Each was checked against the GitHub API rather than assumed, which is why each has a backlog
item recording a refusal rather than an omission.

Do them in this order. The first pair has a real dependency and the third does not.

1. **Secret scanning, and then push protection**, closing BL-089. Push protection depends on secret
   scanning, and asking for push protection on its own is accepted and quietly does nothing, which
   is the trap recorded at `SECURITY.md:132-138`. Turn on scanning first, confirm its alerts
   endpoint stops answering 404, and only then turn on protection.
2. **Private vulnerability reporting**, closing BL-096. This is the one with a user-visible
   consequence: until it is on, the security policy sends a reporter to a public issue.
3. **Branch protection on `main`**, closing BL-098. Both endpoints that would report the current
   rules answer 403 on this plan, so the state cannot be read today, let alone set. Verify after
   setting rather than assuming the write took.

One thing changes with nobody touching it. Every `required: true` in the issue forms is inert while
the repository is private and starts being enforced on publication, which is recorded with its
reasoning at `PRODUCT_BACKLOG.md:6911-6915`. The forms do not need editing. It is listed here
because a form that suddenly rejects a submission looks like a regression to whoever hits it first.

## The prose that stops being true

Each of these is a live statement about the present, not a record of the past. The right rewrite is
a judgement about tone and is left to whoever makes the change, so this table says what becomes
false rather than what to write instead.

| Where | What it asserts today | Why publication breaks it |
|---|---|---|
| `SECURITY.md:37-42` | Private reporting cannot be turned on here, so a reporter should open a public issue asking for a channel and put no detail in it | The fallback stops being the live route once BL-096 is on. The paragraph still needs its other half, for a reporter who does not find the option because it was never enabled |
| `SECURITY.md:132-138` | Secret scanning is not on and cannot be, with the exact refusal GitHub gives | Both halves of that become wrong once BL-089 is done, including the note that push protection accepts a request and changes nothing |
| `CONTRIBUTING.md:7-11` | Nobody outside can see the code, open an issue or send a change, so the guide describes contributing rather than reporting it | The whole paragraph is about a condition that has ended. It also points at the security policy's private route as a parallel case, so the two want editing together |
| `CODE_OF_CONDUCT.md:40-43` | There is no private channel to the maintainer, and GitHub's private reporting features are unavailable | This one asks for its own revision in its last sentence. Whether a private channel now exists is a decision, not an automatic consequence |
| `.github/ISSUE_TEMPLATE/config.yml:1-7` | Blank issues must stay on because the security policy's fallback is the live route rather than a spare one | The reason weakens, but read the rest of that comment before acting on it. Turning blank issues off would still leave a reporter with three forms that all ask for detail and no way to ask for a channel |
| `docs/DATA_PROVENANCE.md:11-13` | The open legal question is the reason this repository has not been published | Only edit this once the first section of this document is genuinely closed, and record what the answer was |
| `scripts/check-publication.mjs:2-5` | The gate's own opening comment states the repository is private | The gate keeps working and keeps being worth running. The comment describes a condition that has changed |
| `test/publication-gate.test.js:11-15` | The gate answers a question asked once, on the day someone publishes | Written for the day before. Worth a sentence saying the day happened, because the tests still defend the boundary afterwards |
| `.github/CODEOWNERS:5-8` | Code owner approval cannot be required, quoting GitHub's 403 and its "make this repository public" remedy | The obstacle is gone once step 3 below is done. The sentence before it, that the file routes nothing because there is one collaborator, is about headcount and stays true |

The nine rows above are the live passages outside the two records, and the records are the
exception. Ten of the twenty-one are in `PRODUCT_BACKLOG.md` and two more are in `CHANGELOG.md`.
Eleven of those twelve say what was true when a piece of work was delivered, and they are history
that must not be rewritten, for the same reason the dated tracking artifacts are not re-aimed:

- `PRODUCT_BACKLOG.md:6279-6292`, why secret scanning was left unticked, and what push protection
  does when asked for without it.
- `PRODUCT_BACKLOG.md:6684-6687`, why the private reporting task was left open.
- `PRODUCT_BACKLOG.md:6746-6748`, what the changelog entry beside it was corrected to say.
- `PRODUCT_BACKLOG.md:6769-6773`, why the contribution guide is written in the future tense.
- `PRODUCT_BACKLOG.md:6776-6782`, why the code of conduct offers no private channel.
- `PRODUCT_BACKLOG.md:6843-6849`, why the branch rules task was left open and could not be read.
- `PRODUCT_BACKLOG.md:6868-6873`, why blank issues stay enabled.
- `PRODUCT_BACKLOG.md:6911-6915`, why `required: true` collects nothing today.
- `PRODUCT_BACKLOG.md:9015-9020`, the three settings named as refused on this repository today.
- `CHANGELOG.md:1295-1298`, the released note that secret scanning cannot be turned on.
- `CHANGELOG.md:1307-1310`, the released note that the private channel is not switched on.

The twelfth is live and does have to change: the introduction at `PRODUCT_BACKLOG.md:36-40` lists
BL-089, BL-096 and BL-098 among the items whose acceptance could not be met, and once they are met
that sentence is describing a state that no longer holds.

This document is not on its own list. It says in its own second section that three settings cannot
be turned on today, which publication falsifies as surely as anything above, but a runbook is spent
by the event it describes and rewriting it would be pointless. Read it as dated the day it is used.

## How the list was found, and how to check it

A passage belongs here when publication makes it false or takes away its reason. That rule is easy
to state and hard to search for, because the passages are written from both sides. Some say this
repository is private. Others quote GitHub refusing something and telling you to make the repository
public. A sweep keyed on one side misses the other, and that is not a hypothetical: the first
enumeration matched single lines against a pattern requiring the word "repository" and missed both
changelog entries, and the second read whole passages but still keyed on the private side and missed
five more, including the ownership file quoting the public-side phrasing verbatim.

So re-derive the list rather than trusting it:

```
git --no-pager grep -n -I -i -E "is (still )?private|private repositor|private reporting|is not public|not been published|make this (repository|one) public|repository public to enable|not available for this repository|Upgrade to GitHub Pro|while it is private|on (a|any) public repositor|visible to the public|cannot be (enabled|switched on|turned on)" -- . ":(exclude).copilot-tracking" ":(exclude)docs/anchors.lock.json" ":(exclude)docs/PUBLICATION_RUNBOOK.md"
```

Measured against the twenty-one above, that finds every one of them, on 42 matching lines across 12
files. The two files that are not on the list are false positives of a kind worth recognising: they
are sentences about the list rather than members of it, one in `README.md` and one in the comment on
the test that holds the security policy and the issue forms together. A block recording a defect
already fixed is the other shape to expect, and it stays true after publication.

Read every hit as a passage rather than as a line. Counting lines is what went wrong the first time.

## Verifying afterwards

The two publication gates answer questions about history and about what is advertised, not about
prose, so a clean run does not mean this list has been worked through.

```
git fetch --prune
npm run publication
npm run publication:surface
```

Run the surface gate after fetching, since it reads what the remote advertises and a stale copy
will report on branches that no longer exist. Then run the full set of checks the way any change
runs them, because six of the ten files above are documents the counts gate reads and the anchors
gate reads all ten.

The honest summary of this section: nothing in this runbook is enforced. The checklist is the
enforcement, which is the argument for writing it down before the day rather than during it.
