---
name: Use a lead-manager agent to coordinate base44 builds
description: For each base44 mega-prompt, dispatch a Plan/general-purpose subagent as "lead manager" to scope, sequence, and verify the build before and after.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
For each FemWell base44 mega-prompt, lean on a subagent (Plan or general-purpose) acting as "Mr Lead Manager." Don't just hand-write the prompt and ship — use the agent to enforce the rules of engagement.

**Why:** User explicitly asked: "make use of agent mr lead manager." Builds had been getting drafted ad-hoc which let stale/duplicate stuff slip through. A coordinator agent that holds the rules and the spec is the way to keep coherence across many MPs on a constrained budget.

**How to apply:**
The lead-manager agent's job per MP:
1. Pull the live page (DOM + screenshot) AND walk the actual base44 codebase for the affected route — list the component files, responsive variants (e.g. MobileBottomNav vs FloatingSidebar), and which scaffolds the nav/layout uses. The signed-off demo + memory is NOT enough; you must confirm component count and breakpoint variants from the source.
2. **MANDATORY — call base44 MCP `list_entity_schemas` for every entity the spec references.** Verify EVERY field name actually exists. Save the verified schema to `/mnt/femwell/base44_schema_<domain>.md` so the team has a source of truth. Never invent field names from the demo (e.g. "featured", "personalised_score", "phase_match" don't exist; the real fields are `is_editor_pick`, `engagement_score`, `phase_tags`).
3. Enumerate every existing element on live; every element in the demo.
3. Produce a diff — what to REPLACE, what to ADD, what to DELETE.
4. Spec the entity/flow plumbing: which entities read, which write, which other pages get touched.
5. Draft the base44 mega-prompt with explicit "replace existing X" framing.
6. After build + publish, verify on femwells.com — screenshot, grep, click through.
7. Hand back a signed-off report or a punch-list.

Use `Plan` agent for the scoping/spec phase; `general-purpose` for the post-build verification phase. Keep prompts self-contained — the agent has no memory of prior MPs.
