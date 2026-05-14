# FemWell — current status (the shared baton)

> **This file is the source of truth for "where we are and what's next."** Both Claudes read it on session start and write to it after every commit. Halli should never have to copy status between Cowork and Code — they coordinate through this file.

**Last updated:** 2026-05-14 by Cowork (after publish of `0ec5402`)

---

## Just shipped (most recent first)

| Commit | Author | What it did |
|---|---|---|
| `0ec5402` | Code | Handoff: 4 items queued for next publish + Code's post-publish invoke plan. **Now PUBLISHED on femwells.com.** Podcasts rail visible on `/Lifestyle?tab=listen`. Practice rail visible (9 rows from Code's earlier `migrateSessionsToPractice` invoke). |
| `cde30a7` | Code | `seedPodcasts` fix — browser User-Agent + relaxed image-skip. Replaces episodes that lack `<itunes:image>` with channel-level artwork instead of skipping. Code also unlocked autonomous function invocation via `npx base44 exec` + `scripts/base44-cli.mjs`. |
| `59fa0b8` | Code | New `scripts/base44-cli.mjs` — read-only diagnostics CLI for both Claudes. Wraps `@base44/sdk` around Halli's admin api_key (stored gitignored in `.env.local`). Commands: `whoami`, `count`, `list`, `logs`, `orchestrator-phases`. |
| `33fc578` | Cowork | docs(state): update STATUS with `30a645f` row + recent edits note. |
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

Code now has autonomous function-invocation via `npx base44 exec` + `scripts/base44-cli.mjs` for reads. Halli ran `base44 login` once + Deno installed; Code can invoke any deployed admin function without UI.

**Already done this session by Code (post-publish):**
- ✅ `migrateSessionsToPractice {}` invoked → 9 PRACTICE rows in `LifestyleItems`. Practice rail visible on `/Lifestyle?tab=listen`.

**Queued for Code's next session (post-publish of `cde30a7`):**
1. **Invoke `seedPodcasts {}`** via `npx base44 exec` — expects 12-60 podcast rows now that UA + image-skip relax + cascade-fallback are live. Drop tombstone with counts.
2. **Invoke `backfillTikTokEmoji {}`** — expects ~24 emoji-dirty rows cleaned.
3. **Invoke `backfillYouTubeEmbeddability {}`** — expects 5–10 unembeddable YT rows marked.
4. **Build `backfillLongreadsImages`** (LC-5 part C, green-lit) — server-side function mirroring LC-4 pattern. Wire into `WEEKLY_PHASES`. Then invoke once via CLI.

**Lower priority (still green-lit, lower priority than the invokes above):**
5. **Playfair → Fraunces sweep** — 165 inline JSX `fontFamily` + 3 `src/index.css` refs. Single chore commit.

### On **Cowork** (web Claude)

- ✅ Publish bundle landed on femwells.com (this session). Verified: Podcasts rail visible on `/Lifestyle?tab=listen`, Practice rail visible.
- **After Code's invoke tombstones:** 3-viewport visual walk across `/Lifestyle?tab=listen` (Podcasts cards + thumbnails + emoji-clean TikTok titles) + `/Profile` (CHECK-INS / STREAK render as numbers, not "o" / "od").
- **After Code's Playfair sweep ships:** 3-viewport walk across `Onboarding`, `Privacy`, `Terms`, `Upgrade`, `Pulse`, `ProgramsHub`.
- **LC-5A:** 7 pending Lifestyle phase verifications (Phase 4-A/4-B/5-A/5-B1/5-B2/6/Listen tab) — pending Cowork live walk.

### On **Halli** (you)

**Nothing pending.** Code's CLI plus my publish pipeline = no manual base44 Functions work for you. If either Claude asks you to run something in the base44 UI, push back — it should be either Code's `npx base44 exec` or a ONE_SHOT_PHASES entry.

### On **the cron** (passive)

Next daily tick will fire (via first-run self-bootstrap if Code hasn't already invoked):
- `seedPodcasts` (Code will invoke first — but if not, cron picks it up)
- `backfillYouTubeEmbeddability` (same)
- `backfillTikTokEmoji` (same)
- `migrateSessionsToPractice` → **WON'T fire because Code already invoked it (:ok row exists, gate locked)**

---

## What's next — candidate moves

Pick one. Default if nothing chosen: option 1.

1. **Switch to Code for the post-publish invokes** — three CLI invokes (`seedPodcasts`, `backfillTikTokEmoji`, `backfillYouTubeEmbeddability`) take ~30 seconds each. Code drops a tombstone with counts, then Cowork does the visual walk.
2. **Cowork does the visual walk now** — Podcasts rail is already populated (just looked). Cowork can do the 3-viewport screenshot pass even without the other two invokes. Captures progress, even if TikTok emoji + YT embeddability won't reflect yet.
3. **Code builds `backfillLongreadsImages`** while you're in VS Code anyway. Adds it to ONE_SHOT_PHASES, then `npx base44 exec` once. ~15 minutes.
4. **Planner Phase 2 spec.** Task #193, #194 — Mr Lead Manager spec + Ms Atelier craft review. Last touched 2026-05-13.
5. **Care surface scoping decisions.** Multi-stage research has 5 open scoping questions in §5.6.

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
- 2026-05-14 — Cowork: published Code's bundle (`cde30a7` + `59fa0b8` + `0ec5402`). Updated "Just shipped" with Code's 3 new commits. Rewrote "In flight" to reflect Code's autonomous-invoke capability + already-completed `migrateSessionsToPractice` (9 PRACTICE rows). Confirmed Podcasts rail live on `/Lifestyle?tab=listen`.
