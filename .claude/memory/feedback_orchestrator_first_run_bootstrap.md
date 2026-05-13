---
name: Orchestrator must self-bootstrap on first run after deploy — never wait for next cadence tick
description: User 2026-05-13 "this should be done to run straight away after every build, we also talked about this before". Phases that have never run successfully fire on the next daily cron, regardless of weekly/monthly cadence gate.
type: feedback
---

When a new phase ships in `pipelineOrchestrator`, **it must fire on the next daily cron**, even if its normal cadence is weekly (Sunday UTC) or monthly (1st UTC). Operators should never have to manually call `?run_phase=<name>` to bootstrap a new phase. That was the symptom this rule fixes.

**Implementation pattern (binding, in `pipelineOrchestrator/entry.ts`):**

1. At the top of the handler, read recent `IngestErrorLog` rows where `function_name='pipelineOrchestrator'`.
2. Build a `phaseHasRunOk` Set from rows whose `stage` matches `phase:<name>:ok`.
3. `wantsPhase(name)` returns `true` if `!phaseHasRunOk.has(name)` — overrides the cadence gate.
4. After the first successful run logs (the `runPhase` helper writes a `:ok` row on success), the normal weekly/monthly gate takes over.

**Why this matters:** I've shipped scheduled phases three times now (Phase 4-A pipeline fix, LC-1 seedPodcasts, LC-3 migrateSessionsToPractice, the YouTube 153 / TikTok-emoji backfills) and each time the user has had to manually invoke them after publish. That's a sign the orchestrator design is wrong, not that the operator forgot. **Self-bootstrap is the correct shape.**

**Don't break the cadence for already-bootstrapped phases.** If a phase has at least one `:ok` row, the cadence gate still applies — we don't want `seedPodcasts` running daily once it's been bootstrapped (12 RSS fetches × 365 = too many). The first-run override fires exactly once per phase, then steady-state schedule kicks in.

**`IngestErrorLog` is the bootstrap log.** The orchestrator's `runPhase` helper writes a `phase:<name>:ok` row on success and `phase:<name>:fail` on failure. That table is the source of truth for "has this phase ever succeeded." If you change the logging convention, update the bootstrap detector here too.

**Edge cases handled:**
- Failed first-run keeps re-trying daily until success (good — surfaces broken phases fast).
- `IngestErrorLog` truncation: we sample the most recent 300 rows. For a healthy app this covers >90 days. If the log churn rate climbs, bump the limit.
- Schema migrations: if a phase changes name, the old `:ok` row doesn't carry over. The new name will bootstrap once. Correct behaviour.

**Where this rule applies beyond the orchestrator:** any future automation layer (per-user cron, content-auditor agent, scheduled MP-Eng features) should follow the same pattern — never require manual bootstrap, log first-success, fall into cadence after that.
