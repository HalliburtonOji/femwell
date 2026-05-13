# claude-handoff/

Cross-Claude communication zone. Two Claudes work on FemWell — **Cowork** (web app, strategy + planning) and **Code** (local terminal / VS Code, shipping). They can't talk to each other directly. They communicate by dropping files here.

## File naming

```
from-<source>-to-<target>-<YYYY-MM-DD>-<short-topic>.md
```

Examples:
- `from-cowork-to-code-2026-05-13-lc3-sessions-removal.md` — Cowork hands off a spec for Code to ship
- `from-code-to-cowork-2026-05-13-lc1-verified.md` — Code reports a build is verified, Cowork updates the master plan
- `from-cowork-to-code-2026-05-14-planner-spec.md` — Cowork drops the Planner build spec

## Etiquette

1. **Dated, not numbered.** Multiple handoffs per day get distinct topics.
2. **Mark as read by moving to `archive/`** after the other Claude has acted on it. Don't delete — the audit trail is the trail.
3. **Append, don't overwrite.** If a handoff needs a reply, write a new file rather than editing the original.
4. **Reference commits, MP file paths, task IDs.** The other Claude doesn't have your chat context — give them the artefacts.
5. **State the ask precisely.** "Please ship LC-3 per `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-3_remove_sessions.md`. Acceptance: /Sessions returns 404, Listen Practice shelf renders, screenshot saved." Not "do the Sessions thing."

## What lives here, what doesn't

**Here:** asynchronous handoffs, status reports between Claudes, "please pick this up" notes.

**Not here:** master plan (`claude-state/master-plan.md`), specs (`claude-state/base44_mps/`), memory (`.claude/memory/`), agent specs (`.claude/agents/`), or any artefact that has its own canonical home.

Keep this folder small — it's a mailbox, not a wiki.
