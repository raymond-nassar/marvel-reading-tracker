# Publication runbook

Sixteen passages in this repository are true only while it is private, spread over nine files. They
say so plainly, which was the right way to write them: a security policy that describes a reporting
route nobody can use is more use than one that pretends the route is there. The cost is that
publishing makes all sixteen false in the same moment, and none of them is a `path:line` claim, so
no gate will notice.

This document is the list, and every one of the sixteen is named below rather than counted. It
exists so the flip is something to work through rather than something to remember, and so the
person doing it is not also the person who has to find out what it touches.

Nothing here is a legal opinion, and nothing here says the repository should be published. The first
section says why it has not been.

## Before anything is flipped

One item gates the whole thing, and it is not a setting. The fifth acceptance item of BL-099 asks
for legal review before the committed data tree can be described as MIT-licensed, and it is
deliberately unticked. The provenance record names that review as the reason for the current state
at `docs/DATA_PROVENANCE.md:11-13`, and sets out the four questions such a review would have to
answer.

That item is the only entry in this document that cannot be closed by anyone reading it. Everything
below assumes it has been answered.

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
reasoning at `PRODUCT_BACKLOG.md:6909-6913`. The forms do not need editing. It is listed here
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

The eight rows above are the live passages outside the two records, and the records are the
exception. Six of the sixteen are in `PRODUCT_BACKLOG.md` and two more are in `CHANGELOG.md`. Seven
of those eight say what was true when a piece of work was delivered, and they are history that must
not be rewritten, for the same reason the dated tracking artifacts are not re-aimed:

- `PRODUCT_BACKLOG.md:6682-6685`, why the private reporting task was left open.
- `PRODUCT_BACKLOG.md:6744-6746`, what the changelog entry beside it was corrected to say.
- `PRODUCT_BACKLOG.md:6767-6771`, why the contribution guide is written in the future tense.
- `PRODUCT_BACKLOG.md:6774-6780`, why the code of conduct offers no private channel.
- `PRODUCT_BACKLOG.md:6909-6913`, why `required: true` collects nothing today.
- `CHANGELOG.md:1262-1265`, the released note that secret scanning cannot be turned on.
- `CHANGELOG.md:1274-1277`, the released note that the private channel is not switched on.

The eighth is live and does have to change: the introduction at `PRODUCT_BACKLOG.md:36-40` lists
BL-089, BL-096 and BL-098 among the items whose acceptance could not be met, and once they are met
that sentence is describing a state that no longer holds.

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
runs them, because six of the nine files above are documents the counts gate reads and the anchors
gate reads all nine.

The honest summary of this section: nothing in this runbook is enforced. The checklist is the
enforcement, which is the argument for writing it down before the day rather than during it.
