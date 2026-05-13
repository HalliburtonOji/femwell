---
name: FemWell Lifestyle architecture (locked 2026-05-06)
description: The Lifestyle page's locked tab structure (5 tabs) and job-to-be-done (hybrid magazine + data mirror). Source of truth for all rebuild MPs.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
User locked these two foundational decisions for the Lifestyle real-rebuild on 2026-05-06.

**Job-to-be-done — HYBRID (magazine + data mirror).**
Lifestyle is BOTH editorial (magazine craft, hand-picked reads, voice, tone, author relationships) AND data-mirror (cycle phase as a real organizing principle — phase-aware ranking, phase-tagged content, "save for luteal" smart saves, articles that surface relevance to the current phase). Ms Deep Search flagged the risk that "both" can dilute; user accepted that risk. **Mitigation:** every Lifestyle MP must hold a single clear voice. The data mirror layer sits *underneath* the magazine experience as a structural signal, not a visible chrome layer.

**Tab structure — 5 tabs (locked).**
1. **For You** — personalised hero + bento + Saved rail snippet + Try-this rail + categories. Phase-aware ranking. Editorial hero on top.
2. **Browse** — collapses Read + Fiction + Stories + Books into one searchable, filterable surface. Type filter chips at top: All · Articles · Fiction · Stories · Books · Guides. Filter by `LifestyleItems.content_type`.
3. **Listen** *(NEW)* — audio shelf. TTS-played articles, meditations (ContentItems with audio), podcasts. Listen-queue as a real surface.
4. **Daily Story** — daily-segmented story with streak, this-week's-mornings bento, tone picker. Uses DailyStory entity.
5. **Horoscope** — real horoscope (deferred to MP-Horoscope). New entities AstroProfile + HoroscopeReading + daily LLM cron. Sun-sign-only first; Moon/Rising/Compatibility later.

**No longer planned as separate Lifestyle tabs:** Read · Fiction · Stories · Books (collapsed into Browse), Watch · Saved · Sources · News·today (deferred or absorbed elsewhere — Saved becomes a Profile-level surface, Sources moves to Settings, Watch is part of Listen if video).

**Two cross-cutting features that should ship across the rebuild (NOT tab-specific):**
- **Audio mode (TTS)** — every article gets a "Listen to this" affordance. Powers the Listen tab's queue.
- **Cycle-aware smart saves** — when saving an item, user can tag it for a phase ("save for luteal") and the Saved view surfaces phase-relevant saves at the right time.

**Cross-page hooks (no-stale-features rule):**
- Today's morning card pulls one phase-tagged Lifestyle item (one query, one source of truth).
- Jess can recommend from the user's Saved + reading history.
- Profile shows reading streak + saved-by-phase counts.
- Smart Nudges flag when the user's followed_categories haven't been engaged with in N days.
- Cycle Settings show phase_tags as a soft personalisation lever.

**Where this lives:**
- Atelier's per-tab gap doc — `/mnt/femwell/lifestyle_per_tab_gap.md` (was sequenced as 7 MPs; now needs a re-sequence to 5 MPs after this decision).
- Deep Search's brainstorm — `/mnt/femwell/research_lifestyle_whole_setup.md`.
- Master demo — `/mnt/femwell/femwell_lifestyle_demo.html` (proposed 9 tabs; this architecture supersedes that).
