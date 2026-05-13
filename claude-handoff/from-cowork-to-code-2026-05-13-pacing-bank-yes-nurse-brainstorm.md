# Cowork → Code, 2026-05-13: Pacing Bank YES + Nurse section brainstormed + LC-3 logged

## TL;DR

LC-3 shipped from your side at `75507a8` — Sessions route + chip gone, Practice rail in, WellnessSessions → LifestyleItems migration function ready. Halli needs to publish + invoke `migrateSessionsToPractice` + verify live; my MCP couldn't drive it.

While you ship LC-4 / LC-5, user came back with two strategic answers worth folding into the Planner work:

1. **Pacing Bank: YES** — confirmed for Planner-B. Phase-aware spoons counter, chronic-illness-aware (PCOS / endometriosis / long COVID), permissive language only (sidesteps R9 cycle-syncing strong-claim trap).
2. **Nurse section: brainstormed** — full doc at `claude-state/research_nurse_section_2026-05-13.md`. Recommendation: new top-level `/Care` surface (not bottom nav) with three components — Nurse Notebook (editorial), NHS Pathway Helper (algorithmic routing, never advice), Nurse-led Programmes (uses existing Programs entity). Pacing Bank's clinical framing lives in Care; the widget lives in Planner.

Master plan bumped to rev 4 with §6.8 Pacing Bank and §6.9 Care surface added. Top of changelog has the summary.

## What you need to know for the Planner spec (when Mr Lead Manager picks it up)

- **Phase the Planner build into Planner-A and Planner-B**, per `research_planner_2026-05-13.md` §9 phasing recommendation. Planner-A = data unification + Smart View retargeting + forecast ribbon (2-3 MPs). Planner-B = Plan-with-Jess + Pacing Bank widget + ritual bundle write-path + Tonight's Window HRT row (3-4 MPs).
- **Pacing Bank widget** goes on Planner-B. The bank's *framing* (what pacing is, why it works for cycling women + PCOS + endo + long COVID, the nurse-authored explainer) lives in Care-A, not Planner. Planner shows the spoons + capacity ceiling + Plan-with-Jess respecting it. Care explains it.
- **R9 binding mitigation** — every Planner copy line that touches phase must pass a permissiveness audit. Invitations not imperatives, probabilistic not deterministic, the user's own data leading, not population averages. Apply to Today phase strip, For You phase chooser, Horoscope, Smart Nudges, Rituals, all Planner copy, all Pacing Bank copy. Style-guide it before Planner-B copy is drafted.
- **Cervical screening row (§7 #9 of Planner research) + calendar export (§7 #10)** are deferred. Cervical screening folds into the UK-local layer roadmap (a separate later MP). Calendar export folds into Settings (much later). Don't include in Planner-A or Planner-B.

## Care surface notes (when you get there)

Five user-decision items still open in `research_nurse_section_2026-05-13.md` §11. You don't need to wait for answers to start Phase A close-out (LC-4 + LC-5), but Care-A scoping needs them:

1. Single contracted nurse vs editorial board?
2. Care as Lifestyle 6th sub-tab vs top-level `/Care`? (I recommended top-level.)
3. Pacing Bank named by-line ("Hattie Reynolds, RGN") vs anonymous editorial? (I recommended named.)
4. Care launch between Planner and Profile vs after Profile?
5. £15-30k Year 1 budget approval for nurse advisor + commissioned content?

Hold these for the next user touchpoint. Care is Phase B late, not Phase A urgent.

## Your open questions from LC-3 — my answers

1. **LC-3.5 (the deferred ContentItems → LifestyleItems audio-row migration)?** — Leave as accepted tech debt for now. It's confusing-but-not-broken; the broader Lifestyle pipeline cleanup (Bug 1-4 from master plan §7.3) will absorb it when it ships. Don't open a new MP yet.
2. **`src/pages/Saved.jsx:9` chip label "Sessions"** — rename to "Audio" in a small Mr Fix-it pass (≤2 files trivial envelope). Do it inside LC-4 or LC-5 if you're touching nearby files; otherwise leave for the broader Phase A close-out sweep.
3. **`src/components/today/TrackTab.jsx:53` Sessions sub-tab** — different feature, audit needed before deciding. **Don't touch** in LC-3/4/5. Flag for the next Today rebuild MP.
4. **`src/pages/Explore.jsx` 3 descriptive uses** — cosmetic, defer to whenever Explore gets rebuilt (Phase B Explore MP).

## Next on your queue

1. **LC-4** — TikTok ingest emoji strip (spec at `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-4_tiktok_emoji_strip.md`)
2. **LC-5** — closeout sweep (verify 7 pending Lifestyle phase tasks, real Spotify URLs, image_url backfill)
3. **Halli's live verification** of LC-1 + LC-2 + LC-3 after they publish from their browser — they may flag regressions for fix-it follow-up
4. Then **Planner-A spec** via Mr Lead Manager, building on `research_planner_2026-05-13.md` + the rev-4 master plan

## Files I touched on this side

- `claude-state/research_nurse_section_2026-05-13.md` — NEW, the brainstorm
- `claude-state/master-plan.md` — added §6.8 Pacing Bank + §6.9 Care surface; bumped to rev 4 with full changelog entry

## Repo state when I wrote this

HEAD: `2aabf33` after `git pull origin main` (your LC-3 handoff commit). Will push my rev-4 commit + Care brainstorm right after this handoff lands.

— Cowork (2026-05-13)
