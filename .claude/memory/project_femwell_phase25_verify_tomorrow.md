---
name: Tomorrow — verify Phase 2.5 phase_tags population
description: First task on next FemWell session: re-sample LifestyleItems to confirm Phase 2.5 (phase_tags auto-population in summarizeLifestyleItem) is actually working. User said "check it when we talk tomorrow as i will forget."
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
User asked on 2026-05-06 evening: "lets continue for now, check it when we talk tomorrow as i will forget."

**The unfinished verification:** TWO phases need verifying tomorrow:
- Phase 2.5 (phase_tags auto-population) deployed at 2026-05-06 19:50 UTC
- Phase 3 (try_this_content_key validation) deployed at 2026-05-06 20:25 UTC

Both are code-verified but data-unverified — no ingest cycle has run since either deploy. All sampled items as of 2026-05-06 evening were updated at 17:47 UTC or earlier (pre-both-phases).

**On next session, BEFORE doing anything else:**

1. `git pull` the femwell-repo. Confirm latest commit is `186384b` or later (Phase 3 ship).
2. Query LifestyleItems via base44 MCP: `query_entities` on `LifestyleItems` with `sort: "-updated_at"`, `limit: 20`, fields: `id, title, media_type, status, phase_tags, try_this_content_key, category, updated_at`.
3. Confirm at least some items have `updated_at > 2026-05-06T20:25:00Z` — means an ingest cycle ran post-Phase-3.
4. For those post-20:25 items, verify BOTH:
   **Phase 2.5 (phase_tags):**
   - Is an ARRAY (not null, not string)
   - At least SOME items have non-empty arrays (proves real LLM inference)
   - Enum values exactly `["menstrual", "follicular", "ovulatory", "luteal"]` (no "ovulation" variants)
   - Empty arrays land on general content; non-empty on phase-relevant
   **Phase 3 (try_this_content_key):**
   - Is either empty string `""` OR a value that resolves to a real ContentItems row (verify via `query_entities` on ContentItems with `{content_key: <value>}`)
   - At least SOME items have non-empty keys (proves LLM is picking from the 16 real keys, not always defaulting empty)
   - Zero NEW orphaned values — every non-empty key MUST match a ContentItems row
5. If both verify clean → bank. Move to next phase or engagement MP per user's call.
6. If issues → patch via careful workflow.

**Critical reminder:** the user said "i will forget" — surface this proactively at the start of the next session, before anything else.

**What's queued for tomorrow after Phase 2.5 verifies:**
- Phase 3 spec/MP (ContentItems seeding — unblocks Try-this rail in MP 1)
- Then Phase 4, 5, 6 in order
- Engagement MPs in parallel (MP-Eng-1, Daily Chapter UI, etc)
