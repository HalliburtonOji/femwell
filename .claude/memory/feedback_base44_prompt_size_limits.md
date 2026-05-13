---
name: base44 chat agent gets stuck on multi-invoke + build prompts
description: Don't combine "invoke external function" + "schema change" + "code edit" + "re-invoke" in one base44 prompt — agent hangs mid-turn. Split into separate prompts.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
**Rule:** in base44 mega-prompts, don't combine MORE THAN ONE OF:
- Invoking an external function that calls many slow URLs (ingestRSS hits 27 feeds; ingestYouTubeChannels hits 19 YouTube channels via API)
- Schema changes (entity field add)
- Multi-file code edits
- Re-invoking the same function for verification

**Why:** Observed 2026-05-10. The Phase 4-B combined prompt asked base44's chat agent to (1) invoke ingestRSS, (2) query LifestyleItems, (3) invoke ingestYouTubeChannels, (4) add schema field, (5) edit two function files, (6) re-invoke ingestRSS, (7) report. Agent hung mid-turn for hours. The schema change landed early. The code edits did not. Manual invocations of slow network-bound functions are the most likely culprit — RSS feed fetches can timeout or stream slowly, and the agent doesn't recover gracefully.

**How to apply:**
1. Build prompts that ONLY do code changes + schema changes. No manual invocations.
2. If verification needs a fresh ingest cycle, either wait for the scheduled cron OR have the user manually click "Run" on the function in base44's admin UI (not the chat).
3. If a build needs to run AFTER another build verifies, ship them as TWO sequential prompts. User pastes one, confirms done, then pastes the next.
4. If the agent does get stuck: cancel the chat (close & reopen base44 chat), then re-paste a SLIM prompt covering only what didn't land. Schema/code state from the partial run is usually preserved — verify via grep + entity schema query before re-pasting.

**Recovery pattern:**
- Use `git pull` + grep on key tokens (e.g., `daily_item_cap`, `cap_reached`) to see what code landed
- Use base44 MCP `list_entity_schemas` to confirm schema changes
- Use base44 MCP `query_entities` to see if data flows match expectations
- Diff against the original spec; write a slim "remaining work" prompt

**ADDITIONAL RULE (added 2026-05-10):** inline data-seed scripts in base44 prompts are unreliable — observed in Listen Seed MP where the prompt contained code+inline-seed and ONLY the code change landed; the inline `entities.create()` loops never executed (base44 treated the prompt as code-only). The diffstat tells the truth: a "1 file changed" stat on a prompt that was supposed to also create 9 entity rows means the seed didn't run.

**How to apply:**
- For SEED DATA (creating entity rows): use base44 MCP `create_entities` directly from Claude, NOT inline scripts in the build prompt.
- For SCHEMA changes + CODE changes: still fine to bundle in one base44 prompt.
- Build prompts can describe entity rows that "should exist" so the user understands intent, but the actual creation should happen via MCP after the code+schema lands.
- Recovery shape: pull repo, query entity counts, if seed data missing, recreate via MCP `create_entities` — no need to re-paste the whole prompt.
