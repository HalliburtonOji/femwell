---
name: FemWell standards verifier — future MP (don't forget)
description: Build a new content_auditor / standards-verifier agent to replace the deleted dormant godAgent. Audits ingested content for URL health, summary quality, embed status, tone. Future MP after pipeline phases ship.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
User locked on 2026-05-06: "delete and create new standard verifier in future build (remember)."

The dormant `godAgent` function (3 LLMs/day if activated, 0 references — pure cost trap) is being deleted in Phase 1+2 of the pipeline rebuild. The user explicitly wants a **replacement standards verifier** built in a future MP. This memory exists so we don't forget.

**What it should do:**
- Run as a scheduled audit (daily? weekly?) over recently PUBLISHED LifestyleItems
- Validate: URL health (HEAD), embed status (re-verify), summary quality (LLM critique against title + description), tone consistency with FemWell brand voice, phase-tag accuracy, source diversity
- Push failures to `IngestErrorLog` (new entity from Phase 1+2) with stage="audit"
- Auto-HIDE items that fail multiple criteria
- Surface a daily / weekly admin digest of issues found
- LEAN — not 3 LLMs per item; one LLM call per audit batch with multiple items in context

**What it should NOT do:**
- Don't replicate ingest-time validation (Phase 1+2 already does that)
- Don't auto-rewrite content (only flag / HIDE)
- Don't bombard with LLM calls — cost discipline rule

**Naming preference:** Call this agent `content_auditor` (or whatever fits the team naming pattern in `base44/agents/`). NOT godAgent — that name is buried.

**Sequence position:** After Phase 1+2 ships AND at least one engagement MP ships (so audit catches real PUBLISHED items in production-like state). Estimate: MP-Audit-1, slotted between Phase 5 (source diversity) and Phase 6 (orchestrator).

**When to surface this memory:** When user says "what's next" after Phase 5 ships, OR when they ask about quality / standards / verification / curation.
