# FemWell — current status (the shared baton)

> **This file is the source of truth for "where we are and what's next."** Both Claudes read it on session start and write to it after every commit. Halli should never have to copy status between Cowork and Code — they coordinate through this file.

**Last updated:** 2026-05-14 by Cowork (Planner Phase 2 v2 — best-in-market research drop + demo + spec v2. 9 new mechanics layered on signed-off canvas. Supersedes earlier 3-surface spec. Handoff to Code at `claude-handoff/from-cowork-to-code-2026-05-14-planner-phase2-v2-best-in-market.md`. Rebased onto Code's seedPodcasts URL hotfix + Playfair→Fraunces sweep.)

---

## Just shipped (most recent first)

| Commit | Author | What it did |
|---|---|---|
| (pending) | Cowork | **Planner Phase 2 v2 — best-in-market.** Halli pushed back on the earlier 3-surface spec ("do detailed research and brainstorming to actually make the planner the best the market has to offer"). Fresh 10K-word research drop at `claude-state/research_planner_best_in_market_2026-05-14.md` identifies 9 mechanics no UK women's wellness app currently combines: Capacity Tax, Doctor-Ready Diary (NICE-NG23 PDF), Quiet Mode auto, 5-state Smart View, capacity-composite good-for chips, identity-anchor cue chips, Fresh-Start banner, Cycle-Mirror Sunday tile, Astra Cole horoscope sidecar. Demo at `mnt/femwell/femwell_planner_phase2_demo.html` rebuilt from signed-off canvas (`femwell_planner_final.html`) — every Phase-1 section preserved, 9 deltas inline-marked `ⓟ2 NEW`. Spec v2 at `claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md` (9-commit Planner-A sequence C1-C9, schema additions, LLM cost estimates ~£60-80/mo at 5k MAU, 7 open questions). UK locale + no-emoji compliance fixed in demo (was Naija meals + emoji thumbs from old canvas). **Supersedes earlier `spec.md`.** |
| (pending) | Code | **seedPodcasts URL hotfix.** Halli reported "only ~4 podcasts from a single source" post-publish. Code-side diagnosis via `base44 exec` direct-fetch from base44 edge runtime: 8 of 12 hardcoded seed URLs return 404 — Acast/Simplecast/Megaphone all rotated slugs since the original seeds were authored. Resolved canonical URLs via iTunes Search API matched on trackName; verified all 12 candidates return 200 + valid RSS body. Patched `SEED_PODCASTS` array in `base44/functions/seedPodcasts/entry.ts` with the new URLs (e.g. `feeds.acast.com/public/shows/adam-buxton` → `…/18dcd5db-f898-42c6-ab31-3a1853c1a645`). Also added drift-healing to the `else { sourcesExisting += 1 }` branch — if a row's `feed_url` differs from the seed, it patches the row so the DB doesn't lag behind the seed config. After Cowork publishes, an invoke should add ~11 sources × ~5 episodes each. The UA fix shipped earlier (`cde30a7`) was treating the wrong symptom; the URLs were the actual blocker. |
| `7b896f4` | Code | **Playfair → Fraunces brand sweep.** 73 files / 168 inline JSX `fontFamily` swaps + 3 CSS refs in `src/index.css` (var token + body fallback + the Google Fonts @import). The `@import url(fonts.googleapis.com/...)` line is rewritten to load **Fraunces** (`ital,wght@0,300..700;1,400..500`) instead of Playfair Display — previously Fraunces was referenced in inline styles all over the codebase but never actually loaded as a webfont (silently falling back to system serif everywhere). Bug-fixes a quiet brand violation that's been there since the rev-to-Fraunces decision. Inter import preserved (UI font, untouched). Build clean (`dist/assets/index-B9-_kdIr.js` + `index-CCA0b6yM.css`). Cowork's `b344c1e` handoff green-lit this sweep; deferred until this commit because it would conflict with any in-flight branch-touching Cowork pushed concurrently. |
| `853a843` | Code | **Podcast Phase 2 — C7 tombstone.** Handoff at `claude-handoff/from-code-to-cowork-2026-05-14-podcast-phase-2-ready.md`. Itemises C4 (`794c033`) + C5 (`90fbf75`) + C6 (`50cb948`). Walks Cowork through publish + 3-viewport walk + iOS/Android MediaSession verification per spec §2.6. Phase 2 player complete from Code's side. |
| `50cb948` | Code | **Podcast Phase 2 — C6 polish + persistence.** Extends `PodcastPlayerProvider`: playbackRate cycling `[0.8, 1.0, 1.25, 1.5, 1.75, 2.0]` persisted to localStorage; sleep timer with `[5, 15, 30, 45, 60]` presets + countdown + auto-pause on expiry; `PodcastListens` upsert debounced ~5s during playback, immediate persist on pause/close/ended, resume-from-position on play. ExpandedPlayer adds speed + sleep pills with live mm:ss countdown. |
| `90fbf75` | Code | **Podcast Phase 2 — C5 player UI.** `MiniPlayer.jsx` (56px pill bottom-of-viewport; ≥768px floats right) + `ExpandedPlayer.jsx` (full-screen modal, range scrubber w/ rose accent, ±15s/±30s skips, big play, "Open in your app" footer link, full a11y). Layout.jsx mounts both inside PodcastPlayerProvider. PodcastCard rewired per spec §2.5: primary tap → `player.play(item)`; ExternalLink "↗" opens Phase 1 listen sheet as secondary. |
| (pending) | Cowork | **Planner Phase 2 spec + visual demo — ATELIER SIGNED OFF by Halli.** Spec at `claude-state/base44_mps/2026-05-14_planner_phase2/spec.md` (3 MPs: A1 Smart View retargeting · A2 forecast strip + confidence · A3 Week Ahead Jess card). Visual sign-off demo at `mnt/femwell/femwell_planner_phase2_demo.html`. Halli pointed at Section 4 (full stack) as the build target — locks composition order: day chips → forecast strip → Smart View → Week Ahead → programme → morning rhythm → meals/commitments/tonight. **Handoff to Code at `claude-handoff/from-cowork-to-code-2026-05-14-planner-phase2-greenlit.md` — green-lit to ship C1.** |
| `794c033` | Code | **Podcast Phase 2 — C4 foundation.** New `base44/entities/PodcastListens.jsonc` + `PodcastPlayerProvider.jsx` React Context owning singleton `<audio>` element (no Web Audio per spec §2.3). MediaSession scaffold + `usePodcastPlayer` consumer hook + Layout.jsx wrap. |
| `c74eaf8` | Code | **LC-5C — `backfillLongreadsImages` function.** New `base44/functions/backfillLongreadsImages/entry.ts` — admin-invoked sweep for ARTICLE rows where `image_url` is empty/null. Fetches `content_url` with Chrome UA, parses og:image / twitter:image / first `<img>` inside `<article>`, rejects 1x1 trackers + .svg + blank-pixel placeholders, persists onto image_url. Idempotent. Paginates 100/page up to 2000-row cap. Wired into `pipelineOrchestrator` `WEEKLY_PHASES` (Sundays); first-run bootstrap fires it on the next daily cron after deploy — ~80 image-less ARTICLE rows backfilled in ~3 minutes without waiting for Sunday. |
| `0c1d491`, `41acd1b`, `1a94c2a` | Code/Cowork | **Podcast Phase 1 C2 + C3 PUBLISHED live.** C2 ships `PodcastListenSheet` (3-button slide-up: Spotify / Apple / Pocket Casts + brand-coloured pills + a11y + Pocket Casts web fallback) + `PodcastCard` smart-shortcut (first tap → sheet; subsequent tap with `fw_podcast_preferred_app` → deep-link to preferred app; `MoreHorizontal` "..." always opens sheet). C3 is the tombstone. Verified live on `/Lifestyle?tab=listen` — 29 cards rendered. Phase 1 complete. |
| (pending) | Code | **Podcast Phase 1 — C3.** Tombstone handoff `claude-handoff/from-code-to-cowork-2026-05-14-podcast-phase-1-ready.md` — itemises C1 + C2, walks Cowork through publish + ONE_SHOT cron + 3-viewport verification per spec §1.6, acceptance-criteria matrix with my-side ticks + your-side TODO. Flags known scope notes: no platform-shaped SVGs (using Lucide ExternalLink uniformly + brand colour for differentiation), no analytics event yet, Apple buttons render disabled until `resolveApplePodcastId` cron fires, PRACTICE rows orphaned by Cowork's `8fa3e6f` removal. Phase 1 complete from Code's side. |
| `1a94c2a` | Code | **Podcast Phase 1 — C2.** New `src/components/lifestyle/listen/PodcastListenSheet.jsx` — 3-button slide-up sheet (centred modal on desktop ≥768px via CSS media query). Brand-coloured pills: Spotify #1DB954, Apple Podcasts #832BC1, Pocket Casts #F43E37. Full a11y: `role=dialog`, focus trap, Escape closes, backdrop click closes, body scroll-lock, focus restore on close. Disabled state when a link can't be built (e.g. no apple_collection_id resolved yet). Pocket Casts web fallback (`pca.st`) surfaced as a subtle secondary link below the buttons. Wired into `PodcastCard.handleClick` (spec §1.5): first tap with no preference opens sheet; subsequent tap with `fw_podcast_preferred_app` set deep-links straight to the preferred app and bypasses the sheet; a `MoreHorizontal` (Lucide) "..." button top-right of card body always opens the sheet so the user can change preference. Build clean (`dist/assets/index-v_0eH_sd.js`). **Awaits next publish.** |
| `058f19c` | Code | **Podcast Phase 1 — C1.** Schema fields added: `apple_collection_id` + `apple_collection_url` on `LifestyleSources`, plus `apple_collection_id` + `feed_url` on `LifestyleItems`. New `base44/functions/resolveApplePodcastId/entry.ts` — admin function with backfill + single-source modes via free iTunes Search API. Matches via feedUrl exact → name substring → no_match log. Wired into orchestrator ONE_SHOT_PHASES (Phase 14, fires once on next daily cron) + inline in `seedPodcasts` after new source creation. New `src/utils/podcastLinks.js` exporting `derivePodcastLinks` + `getPreferredPodcastApp` + `setPreferredPodcastApp` + `clearPreferredPodcastApp`. **Now PUBLISHED on femwells.com (in same publish bundle as Cowork's `f2dcf71`).** |
| `8fa3e6f` | Cowork | **Lifestyle refactor per Halli's screenshots:** (1) Filter chips + Filter dropdown now share a single sticky row in the page header (was two rows); chips scroll horizontally with auto-centring on tap, Filter button collapses to icon-only inline. (2) Rename "Browse" tab → "Read"; URL id changes too (`?tab=read`). Legacy `?tab=browse` URLs auto-redirect via `LEGACY_TAB_REDIRECTS`. (3) Remove Practice entirely from Listen tab — chip, `PracticeRail` component, `media_type='PRACTICE'` filter all gone. The 9 PRACTICE rows in `LifestyleItems` are orphaned (no destination/surface); Code can delete them via `npx base44-cli delete` when convenient. activeChip state lifted from individual tab bodies up to `Lifestyle.jsx` so it lives in same scope as tab + sticky header. |
| `f0fbad9` | Code | **STATUS.md hygiene fix.** Acknowledging the protocol gap Halli flagged. Adopting per-commit STATUS-row + Last-updated-bump going forward. Re-prioritised queue to podcast Phase 1. Flagged: Cloudflare 403 hit my CLI reads after the earlier burst — Cowork's `dd908fe` row noting "Podcasts rail visible" was visual; my CLI count for `media_type=PODCAST` was `0` pre-publish. |
| `1b1299f` | Cowork | **Podcast build spec authored** — Phase 1 (link-out sheet) + Phase 2 (in-app player) in `claude-state/base44_mps/2026-05-14_podcast/spec.md`. Decision record in `claude-state/decisions/2026-05-14_podcast_strategy.md`. Capacitor + Apple paywall constraint logged in memory. Halli's 4 decisions: all 3 destinations (Spotify + Apple + Pocket Casts), no Spotify dev app yet (pod.link fallback), both phases in parallel, Capacitor flagged for future. Handoff to Code at `claude-handoff/from-cowork-to-code-2026-05-14-podcast-spec.md`. |
| `82c9320` | Cowork | **Research drop:** `claude-state/research_podcast_strategy_2026-05-14.md` — 5,360 words on podcast link-outs (Spotify / Apple / Pocket Casts) + in-app player (legal, stack, MVP feature set, Podcasting 2.0). Phase 1 ship recommended. 7 open questions for Halli. |
| `dd908fe` | Cowork | docs(state): sync STATUS.md after Code's 3 commits + publish. |
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

Code has autonomous function-invocation via `npx base44 exec` + `scripts/base44-cli.mjs` for reads.

**Already done this session by Code (post-publish):**
- ✅ `migrateSessionsToPractice {}` invoked → 9 PRACTICE rows. Practice rail visible.

**Queued — in priority order:**

1. **🔥🔥 Planner-A best-in-market (Phase 2 v2)** — spec v2 at `claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md`. Supersedes earlier `spec.md`. **C1-C9 sequence:** C1 schema (CapacityTaxLog + UserProfile additions) → C2 confidence pill → C3 Capacity Tax bar + Defer pill → C4 Doctor-Ready Diary v1 (NICE-NG23 PDF) → C5 Smart View 3→5 state shell → C6 Quiet Mode auto-pull-back → C7 Reframe shimmer + 28-day consistency → C8 Cycle-Mirror Sunday tile → C9 warmth bundle (HRT row + Shutdown ritual + Pacing Bank Low-Spoons + Astra sidecar + Jess-nudge CTA). LLM cost ~£60-80/mo at 5k MAU. 7 open questions in spec §"Open questions" — defaults documented; Code drops handoff only if a decision is needed. **Demo target:** `mnt/femwell/femwell_planner_phase2_demo.html` (3-viewport walk after each commit). Start whenever Phase 2 podcast publishes.
2. **🔥 Podcast Phase 1 (link-out sheet)** — spec at `claude-state/base44_mps/2026-05-14_podcast/spec.md`. C1 (`058f19c`) + C2 (`1a94c2a`) + C3 (tombstone) all shipped. **Awaiting Cowork publish + ONE_SHOT cron tick (resolveApplePodcastId) + 3-viewport walk.** Acceptance criteria §1.6 — my-side rows ticked, Cowork's verification fills the live walk + count-after-cron columns.
3. **🔥 Podcast Phase 2 (in-app player)** — spec same file. Parallel with Phase 1 per Halli's decision. ~1-2 weeks. New `PodcastListens` entity, `usePodcastPlayer` hook, MiniPlayer in Layout, MediaSession API, MVP feature set. Acceptance criteria §2.6.
4. **Invoke `seedPodcasts {}` etc.** via `npx base44 exec` — **temporarily blocked: Cloudflare 403 challenge on the base44 API** (managed challenge requires JS+cookies; SDK can't solve). Hit it after the burst of invokes earlier this session. Will retest before each invoke; if cf gate persists, fall back to letting the daily cron handle it (orchestrator self-bootstrap is wired; phases will fire on next tick). Don't block Phase 1 work waiting on these.
5. **Build `backfillLongreadsImages`** (LC-5 part C) — mirror LC-4 pattern.

**Lower priority:**
5. **Playfair → Fraunces sweep** — 165 inline JSX `fontFamily` + 3 `src/index.css` refs.

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

1. **Decide on the 7 podcast-strategy open questions** in `claude-state/research_podcast_strategy_2026-05-14.md` (bottom of file). Halli's input unlocks Phase 1 ship spec (Spotify/Apple/Pocket Casts deep-links on PodcastCard) — Cowork can draft an MP-spec next, Code can ship.
2. **Switch to Code for the post-publish invokes** — three CLI invokes (`seedPodcasts`, `backfillTikTokEmoji`, `backfillYouTubeEmbeddability`). Code drops tombstone with counts. Cowork visual-walks after.
3. **Cowork does the visual walk now** — Podcasts rail already populated. Can do 3-viewport screenshot pass for the parts that are live.
4. **Code builds `backfillLongreadsImages`** while in VS Code. ~15 minutes.
5. **Planner Phase 2 spec.** Task #193, #194 — Mr Lead Manager spec + Ms Atelier craft review.
6. **Care surface scoping decisions.** Multi-stage research has 5 open scoping questions in §5.6.

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
- 2026-05-14 — Cowork: added `82c9320` row for the podcast strategy research drop. Added new "decide podcast strategy open questions" as the new #1 candidate next move.
- 2026-05-14 — Cowork: Halli decided all 4 podcast questions. Authored Phase 1 + Phase 2 build spec at `claude-state/base44_mps/2026-05-14_podcast/spec.md`. Decision record at `claude-state/decisions/2026-05-14_podcast_strategy.md`. Capacitor + Stripe paywall constraint logged in memory (`project_capacitor_stripe_paywall.md`). Reordered Code's queue — podcast Phase 1 + Phase 2 are now top priority.
- 2026-05-14 — Code: caught up on the protocol — STATUS.md is binding on every commit and I'd been missing it (kept writing `from-code-to-cowork-*.md` tombstones instead). Acknowledging the gap, adopting the protocol going forward. Added a "Just shipped" row for this hygiene fix + flagged Cloudflare 403 on CLI reads + re-prioritised "In flight" to put podcast Phase 1 at the top per Cowork's spec. Halli's escalation noted; expect a `Just shipped` row from me on every push from here on.
- 2026-05-14 — Code: Podcast Phase 1 C1 shipped — schema additions on LifestyleSources + LifestyleItems, new `resolveApplePodcastId` function with backfill + single-source modes, wired into orchestrator ONE_SHOT_PHASES, inline call from seedPodcasts after new-source create, new `src/utils/podcastLinks.js` util with `derivePodcastLinks` + localStorage preference helpers. Build clean. C2 (sheet + card wiring) next in the same session.
- 2026-05-14 — Code: Podcast Phase 1 C2 shipped — `PodcastListenSheet` component (3-button sheet with brand colours, mobile slide-up / desktop centred modal, full a11y) + `PodcastCard` wired (smart shortcut: first tap opens sheet, subsequent tap deep-links to saved preference, "..." button always re-opens). Build clean. C3 (handoff to Cowork for publish + 3-viewport walk) next.
- 2026-05-14 — Code: Podcast Phase 1 C3 — tombstone handoff written for Cowork. Phase 1 done from my side; await Cowork publish + ONE_SHOT cron + walk. Next on Code: Phase 2 OR LC-5C `backfillLongreadsImages` OR Playfair sweep — Cowork's call.
- 2026-05-14 — Code: Halli said "do all". Sequencing: 1) `backfillLongreadsImages` (shipped this commit), 2) Phase 2 C4-C7, 3) Playfair sweep. backfillLongreadsImages is a server-side function — admin invoke or auto-fire via orchestrator's first-run bootstrap on next daily cron after publish. Mirrors the LC-4 backfillTikTokEmoji pattern.
- 2026-05-14 — Code: Phase 2 C4 shipped — PodcastListens entity (new), PodcastPlayerProvider + usePodcastPlayer hook (Context-based singleton, single `<audio>` element on body, MediaSession metadata + action handlers), Layout.jsx wrapped so player survives navigation. Foundation only — UI in C5, persistence in C6.
- 2026-05-14 — Code: Phase 2 C5 shipped — MiniPlayer (56px pill, bottom-of-viewport, persists across navigation) + ExpandedPlayer (full-screen modal, scrubber, ±15/30s, "Open in your app" link). PodcastCard primary tap now plays in-app via the singleton player; link-out sheet downgraded to the secondary `↗` affordance per spec §2.5. Layout.jsx mounts both UI components inside PodcastPlayerProvider.
- 2026-05-14 — Cowork: **Planner Phase 2 v2 best-in-market.** Halli rejected the 3-surface spec ("this is the final we agreed to before and you were meant to build on that"), then escalated to "best the market has to offer". Saved memory rule `feedback_signed_off_demo_is_canvas.md`. Dispatched deep-research agent — 10K-word return covering Maven Intelligence, Oura Menopause Insights, iOS 26.4 Health, UK Women's Health Strategy 2026 CP1558, and 20+ novel mechanics. Rebuilt `mnt/femwell/femwell_planner_phase2_demo.html` from signed-off canvas (no parallel visual — built on top) layering 9 mechanics. UK locale + no-emoji compliance fixed in demo (canvas had Naija meals + emoji thumbs leaked through). Authored `spec_v2.md` with 9-commit Planner-A sequence. Top "in-flight" item bumped to Planner-A above podcast phases.
- 2026-05-14 — Code: Phase 2 C6 shipped — speed control (cycle through 6 rates, localStorage-persisted), sleep timer (5/15/30/45/60 min presets with live countdown + cancel), PodcastListens upsert (debounced ~5s during play, immediate on pause/close/ended), resume-from-position on play(episode) lookup. ExpandedPlayer surface adds Gauge speed pill + Moon sleep pill with dropdown menu. Player feature-complete; C7 tombstone next.
- 2026-05-14 — Code: Phase 2 C7 tombstone written. Phase 2 complete from Code's side — six commits (C4 794c033 + C5 90fbf75 + C6 50cb948 + STATUS rows in between). Awaits Cowork publish + walk + iOS/Android lock-screen verification. Last item on "do all" run: Playfair → Fraunces sweep across 73 files.
- 2026-05-14 — Code: Playfair → Fraunces sweep landed. 73 files / 168 swaps via `sed -i`. Google Fonts @import in index.css updated to load Fraunces (real, not falling-back-to-system). Build clean. **All Code-side items from Halli's "do all" run shipped:** backfillLongreadsImages + Podcast Phase 2 C4-C7 + Playfair sweep. Code-side queue empty pending Cowork's verify walks.
- 2026-05-14 — Code: Halli reported "still only ~4 podcasts from one source" after publish. Diagnosis via `base44 exec` direct-fetch from base44 edge: 8 of 12 hardcoded seed URLs return 404 (Acast/Simplecast/Megaphone rotated slugs since seeds were authored — Adam Buxton, This Is Dating, Modern Love, Sentimental Garbage, Where Should We Begin, The Hilarious World of Depression, Slow Burn, How To Fail). Resolved canonical URLs via iTunes Search API matched on trackName; verified all 12 candidates return 200 + valid RSS. Patched `SEED_PODCASTS` array. Added drift-healing to the existing-source path so DB rows pick up the new feed_url. **The earlier UA fix (`cde30a7`) was treating the wrong symptom — the URLs were dead, not the User-Agent.** Awaits Cowork publish + invoke.
