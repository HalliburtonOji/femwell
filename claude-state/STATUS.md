# FemWell — current status (the shared baton)

> **This file is the source of truth for "where we are and what's next."** Both Claudes read it on session start and write to it after every commit. Halli should never have to copy status between Cowork and Code — they coordinate through this file.

**Last updated:** 2026-05-14 by Cowork

---

## Just shipped (most recent first)

| Commit | Author | What it did |
|---|---|---|
| `30a645f` | Cowork | Introduced `claude-state/STATUS.md` (this file) as the shared baton between Cowork and Code. CLAUDE.md now makes reading + updating it binding on session start and after every commit. |
| `bbc60e1` | Cowork | `ONE_SHOT_PHASES` in orchestrator — migrations fire once on next daily cron, lock closed after. Wires `migrateSessionsToPractice`. Halli no longer needs to manually invoke base44 Functions for migrations. |
| `88c28f0` | Cowork | Spotify CTA on Horoscope page redesigned as obvious green play-chip (Play+Headphones icons, "SPOTIFY · {SIGN} MOON" meta) — was a tiny text link before. |
| `9225b2e` | Cowork | Curated 12 zodiac Spotify URLs in `TodaysWeather.jsx`. 7 Spotify-official zodiac playlists + 5 vibe-matched editorial mood playlists (Soft Pop Hits / Acoustic Hits / Deep Focus / mint / Dreampop). |
| `b344c1e` | Cowork | Handoff: green-lit Code's Playfair sweep + seedPodcasts cascade + backfillLongreadsImages. |
| `b14da4e` | Code | Handoff: Profile font fix analysis + Podcasts empty-rail hypothesis + Playfair systemic flag. |
| `02b5c68` | Code | Fix Profile "CHECK-INS: o / STREAK: od" — Playfair Display zero glyph reads as lowercase 'o'. Swapped to Fraunces. |
| `85ab800` | Cowork | Handoff: publish catch-up — told Code-me that LC-1/2/3/4 are already live + manual invokes no longer needed. |
| `a5d064f` | Cowork | Desktop sizing pass — Today/Track/Profile/Insights widen to 1024px at `lg:` breakpoint (was 512–768). |
| `cee11be` | Cowork | Orchestrator self-bootstraps new phases on next daily cron — no more manual `?run_phase=` after deploy. |

All live on **femwells.com**.

---

## In flight — split by owner

### On **Code** (VS Code Claude)

Three commits queued, all green-lit by Cowork at `b344c1e`:

1. **Playfair Display → Fraunces sweep.** 165 inline JSX `fontFamily` declarations + 3 `src/index.css` refs (Google Fonts import line 1, `--font-serif-heading` token line 33, raw `font-family` line 163). Single chore commit. Per `CLAUDE.md §2`.
2. **`seedPodcasts` image-resolution cascade.** Replace the naive skip-if-no-itunes-image with: episode itunes:image → episode media:content → episode media:thumbnail → channel itunes:image → channel image.url → placeholder. Never skip. Separate commit from #1.
3. **`backfillLongreadsImages` server-side function.** Mirror LC-4 / `backfillYouTubeEmbeddability` / `backfillTikTokEmoji` pattern. Sweep `LifestyleItems` where `content_type='longread'` AND `image_url` is null/empty. Resolve via og:image / twitter:image / first article img. Idempotent. Add to `WEEKLY_PHASES` set in `pipelineOrchestrator/entry.ts`. Will auto-bootstrap on first daily cron.

### On **Cowork** (web Claude)

Passive waits:
- **After next daily cron tick:** verify `migrateSessionsToPractice :ok` row in `IngestErrorLog`, confirm Practice rail populates on Listen tab.
- **Same tick:** auto-fire of `seedPodcasts` + `backfillYouTubeEmbeddability` + `backfillTikTokEmoji` from yesterday's self-bootstrap commit. Verify each `:ok` lands and the corresponding UI surface fills.
- **After Code's Playfair sweep ships:** 3-viewport walk across `Onboarding`, `Privacy`, `Terms`, `Upgrade`, `Pulse`, `ProgramsHub`. Confirm no heading falls back to system serif.
- **LC-5A:** 7 pending Lifestyle phase verifications (tasks #147, #151, #156–158, #161, #162 in conversation TaskList — these are post-build verifies for Phase 4-A/4-B/5-A/5-B1/5-B2/6/Listen tab).

### On **Halli** (you)

**Nothing pending in base44.** All manual-invoke obligations have been wired into the orchestrator. Going forward, if Cowork or Code says "Halli, run X in the Functions panel," call it out — that work should be in ONE_SHOT_PHASES instead.

### On **the cron** (passive)

Next daily orchestrator tick will fire (via first-run self-bootstrap):
- `seedPodcasts` — populates Podcasts shelf on Listen tab
- `backfillYouTubeEmbeddability` — marks existing YT rows true/false for is_embeddable
- `backfillTikTokEmoji` — strips emoji from existing TikTok titles
- `migrateSessionsToPractice` — one-shot LC-3 migration

After they log `:ok`, the weekly cadence kicks in (except migrate which locks closed).

---

## What's next — candidate moves

Pick one. Default if nothing chosen: option 1.

1. **Let the cron tick + verify tomorrow.** Tomorrow's app state will look very different — Podcasts shelf populated, Practice rail with migrated audio, fewer Error-153 YT rows, no TikTok emoji. Cowork does a 3-viewport walk after the tick and reports.
2. **Hand to Code** to ship the Playfair sweep + seedPodcasts cascade + backfillLongreadsImages. Cowork verifies after each commit publishes.
3. **Planner Phase 2 spec.** Task #193, #194 still pending — Mr Lead Manager spec + Ms Atelier craft review for Planner's second phase. Last touched 2026-05-13.
4. **Care surface scoping decisions.** Multi-stage research from 2026-05-13 (`claude-state/research_care_multi_stage_2026-05-13.md`) has 5 open scoping questions in §5.6. Need decisions before building.

---

## Open follow-up tasks (lower priority, parked)

- `#180` Answer: write 13 remaining fiction books directly vs LLM-generate
- `#181` Extend remaining 13 fiction books to multi-chapter
- `#187` Backfill empty `image_url` on existing rows (will be auto-solved once Code's `backfillLongreadsImages` ships)
- `#189` Reader v2 + Horo-B verify post-publish (live walk)
- `#229` LC-1 live verification — Podcasts + TikTok shelves at 3 viewports (will be auto-solved by next cron + Cowork's verify walk)
- `#233` LC-5 direct work — 7 pending verifies + Spotify URLs + image_url backfill (mostly done now; remaining is the 7 verifies)
- Saved.jsx "Sessions" chip rename to "Audio" (Code's LC-3 open question #2)

---

## How this file gets updated

**On every commit:** the Claude that pushed must add a row to "Just shipped" (top of table) before moving on.

**On every meaningful decision:** the Claude that made the call updates "In flight" — moves task between owners, adds new items, removes finished ones.

**On every session start:** read this file first. If you're starting from cold context, this + `git log --oneline -10` is the full picture of where the repo is.

**When updating, also:**
- Bump the `Last updated` line at top with date + author (Cowork / Code).
- If you're rewriting a major chunk, append a one-line note at the very bottom under "Recent edits to this file" with what changed.

---

## Recent edits to this file

- 2026-05-14 — Cowork: created the file. Captured today's 9 commits + current in-flight queue.
- 2026-05-14 — Cowork: added `30a645f` row (the commit that introduced this file).
