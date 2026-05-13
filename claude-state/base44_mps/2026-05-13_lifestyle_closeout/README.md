# 2026-05-13 — Lifestyle Closeout MP series (LC-1 to LC-5)

Closes the master plan §10 Phase A items so the Lifestyle tab is fully shipped before Planner Phase 2 (master plan §10 Phase B item 3) becomes the next sprint.

Authoritative cross-references:
- Master plan: `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_master_plan_2026-05-13.md` §10 Phase A.
- H2 decisions (LC-2 implements D6): `/sessions/relaxed-loving-brahmagupta/mnt/femwell/H2_DECISIONS.md`.
- Last verify diagnosis (drives LC-1 + LC-3): `/sessions/relaxed-loving-brahmagupta/mnt/femwell/verify_high_risk_three_2026-05-13.md`.
- Base44 platform context: `/sessions/relaxed-loving-brahmagupta/mnt/femwell/research_base44_platform.md`.
- Last shipped commit: `dd5eec9` (heart codepoint swap).

## The five MPs

| # | File | One-line goal | Ownership |
|---|---|---|---|
| 1 | `LC-1_listen_seed_rerun.md` | Seed 12 UK podcasts + fix TikTok seed write + add PodcastRail to Listen | USER pastes into base44 |
| 2 | `LC-2_atelier_ai_final.md` | Auto-publish Atelier letters (H2_DECISIONS.md D6); drop "Awaiting sign-off" banner | USER pastes into base44 |
| 3 | `LC-3_remove_sessions.md` | Delete Sessions route + Listen chip + migrate audio rows to PracticeRail | USER pastes into base44 |
| 4 | `LC-4_tiktok_emoji_strip.md` | Scrub emoji codepoints at all ingest write sites + backfill existing rows | USER pastes into base44 |
| 5 | `LC-5_closeout_sweep.md` | HYBRID — 7 verifies (Ms Verify), Spotify URL swap (user paste), image backfill (operator devtools) | MIXED — see below |

## Paste order

Strict sequence: **LC-1 → LC-2 → LC-3 → LC-4 → LC-5**.

Reasoning:
- **LC-1 first** because it adds the `audio_url` / `episode_url` fields and the `PodcastRail` component that LC-3 mirrors.
- **LC-2 anywhere before LC-5** but cleanest right after LC-1 — Horoscope tab clean, Listen tab clean.
- **LC-3 after LC-1** because LC-3's `PracticeRail.jsx` is a mirror of LC-1's `PodcastRail.jsx`, and the `media_type='PRACTICE'` enum widening complements LC-1's `audio_url` field.
- **LC-4 after LC-1 + LC-3** because the new ingest write sites added by LC-1 (and LC-3's migration function) should already use the shared `stripEmoji` helper LC-4 introduces; running the backfill loop is most useful once those write sites exist.
- **LC-5 last** — Section A's seven verifies span the work done in LC-1 through LC-4 (specifically Task #162 covers the Listen tab post-LC-1+LC-3).

Each base44 paste should be the full content of the MP from below the `---` rule onwards (skip the title + paste-warning header). Wait for the build to finish, walk the live page on all three viewports (mobile / tablet / desktop), then push the next MP.

## User-paste vs direct-work breakdown

| MP | Pasted into base44 by user? | Direct work? |
|---|---|---|
| LC-1 | YES — entire MP | No |
| LC-2 | YES — entire MP | No |
| LC-3 | YES — entire MP (large; expect ~2 build credits) | No |
| LC-4 | YES — entire MP | No |
| LC-5 §A (verifies) | No | YES — Ms Verify runs Chrome MCP walks |
| LC-5 §B (Spotify URLs) | YES — only the Section B block | No |
| LC-5 §C (image backfill) | No | YES — operator runs the devtools script |

## Cross-MP constraints (restated in every §3)

- UK English. £. en-GB dates ("14 Jun 1999"). No emoji codepoints anywhere.
- Lucide icons + SVG only. Fraunces (display) + Inter (UI). No Playfair, no `#C084FC`.
- Plum Night palette inside Horoscope only; cream `#FFFAF5` page default everywhere else.
- Same 5-slot unified bottom nav at mobile + tablet + desktop. NO desktop sidebar substitution.
- Live-walk-on-three-viewports per `feedback_live_walk_after_every_build.md` is the exit gate.
- No new npm dependencies unless absolutely required (each MP's §9 risks must justify it).
- One base44 build = one MP. If any MP exceeds the prompt size cap (~25KB), the user should split before paste — but each LC-* MP was authored to fit in one prompt.

## Verification gates (per MP)

Each MP ends with a §7 visual acceptance test that names mobile / tablet / desktop expectations distinctly. Ms Verify executes that block via Chrome MCP after each build lands. Screenshots are saved under `workspace/walk_lc{N}_20260513/`.

## What this series closes from the master plan

After LC-1 through LC-5 ship, master plan §10 Phase A reduces from seven open items to zero:

- [closed by LC-1] **Listen seed re-run for podcasts + TikTok**.
- [closed by LC-4] **TikTok ingest emoji strip**.
- [closed by LC-3] **Sessions chip taxonomy cleanup**.
- [DEFERRED] **Test profile populate** — not in this series; surfaces in Section A.6 of LC-5 as a verify-side question (will be a follow-up Ms Data task if needed).
- [closed by LC-5 §B] **Real Spotify URLs for moon-sign playlists**.
- [DEFERRED] **Real Stripe price IDs for the three one-shots** — not in this series; env config, no code change.
- [closed by LC-5 §A.7] **Horoscope live walk**.

After this series ships and the two DEFERRED items get separate attention, the Lifestyle tab is sale-ready and Phase B (Planner first, then Profile v2) becomes the next sprint per master plan §10 Phase B.

## Follow-up not in this series

- **LC-2 legal exposure (R3 in master plan §11).** The "Astra Cole, MA, FAS" credentials need to hold up at DD time. Re-ask 4-6 weeks before the sale window opens — swap attribution to "Backed by FemWell's editorial astrology team" if no contracted astrologer is in place.
- **Phase 4-A pipeline fix.** Memory `project_femwell_pipeline_hidden_bugs.md` flagged `created_at` null on every row and `ingestRSS` `rss_url` vs `feed_url` mismatch. Pre-flight reading of `ingestRSS/entry.ts` shows `feed_url` is now in use (lines 209, 235) — the bug may be resolved. LC-5 §A.1 (Task #147) verifies. If still broken, a Phase 4-A MP is the next priority.
- **Content auditor agent.** Memory `project_femwell_standards_verifier.md` requested a `content_auditor` to replace the deleted `godAgent`. Scheduled post-pipeline-fix per the master plan.
- **`Test profile populate`** — generate a fixture user with ≥1 cycle of history + journal entries to verify OnThisDay / Friend6Months / PhaseInbox render. Ms Data task; not in this series.

## After the series ships

Update the master plan changelog:
- Strike LC-1 through LC-5 from §10 Phase A.
- Move them to a "Shipped" subsection with their commit SHAs.
- Bump version line + add a changelog row.
- Surface the post-LC-5 priority (Planner Phase 2 — master plan §10 Phase B item 3) to the user at next session start.
