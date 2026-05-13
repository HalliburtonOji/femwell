# Cowork → Code, 2026-05-13: pick up Lifestyle close-out (LC-3 onwards)

## What's done

- **LC-1 code** is on `main` (commits `7795c90`..`3aa5a04` by base44 bot). Listen tab adds PodcastRail, `seedPodcasts` cron, schema adds `audio_url`/`episode_url` to LifestyleItems + `PODCAST` to source_type enum. **Bonus base44 additions you should be aware of:** Nominatim location autocomplete in BirthDataSheet, HoroscopeToast, SectionSkeleton, GlossaryTip, big Compatibility rewrite — these weren't in the LC-1 spec; base44 went off-script. They look reasonable on first read but aren't formally reviewed.
- **LC-2 code** is on `main` (`ea185fe` by Cowork). Atelier letters now `draft:false, published_at:now()`; "Awaiting Astra's sign-off" banner removed. Per `claude-state/H2_DECISIONS.md` D6.

## What's NOT done

- **Publish stalled.** I clicked Publish in base44 twice. Both attempts hung at `publishing: true` for >13 min, live bundle stayed at `index-aaRjDCOM.js` (pre-LC-1). Per `feedback_mcp_stuck_recovery.md` I should close-tab + reopen rather than wait — your turn to try. The user said publish from your own browser may go through where mine doesn't (their session may not match the MCP session).
- **LC-1 live verification** owed — once published, walk femwells.com/Lifestyle?tab=listen at mobile/tablet/desktop. Expected: PodcastRail eyebrow `PODCASTS WE'RE LISTENING TO` above TikTok, ≥10 cards (after invoking the `seedPodcasts` function), tap → sheet with Play or external link.
- **`seedPodcasts` needs invoking once** to populate ~60 podcast rows. The function exists; it just needs to be called from base44's function panel with body `{}`.

## What's next

LC-3, LC-4, LC-5 in `claude-state/base44_mps/2026-05-13_lifestyle_closeout/`. **User explicitly said these go as direct repo edits, NOT paste-MPs.** Quoting: "we are doing the other lc without prompts, so live verify and stuff, previous set up i will say when to switch again, just be really detailed this time."

So for each:
1. Read the MP file as a spec, but don't paste it anywhere
2. Make the edits directly in the repo
3. `git push origin main`
4. Trigger publish in base44 from your browser
5. Walk live at mobile/tablet/desktop, take screenshots, save them
6. Only declare done after live verification

### LC-3 — Remove Sessions (highest priority)

Spec: `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-3_remove_sessions.md`.

User said about Sessions: "i am confused by sessions its nowhere in my lifestyle page and shouldnt even be a section in the app, it has stuff but they lead nowhere." So the directive is **remove**, not fix.

Footprint (greped from current `main`):
- `src/pages/Sessions.jsx` (delete the file)
- `src/App.jsx` lines 26 + 135 (remove import + route)
- `src/components/layout/MenuSheet.jsx` lines 15 + 45 (remove from Menu nav)
- `src/components/lifestyle/listen/SessionCard.jsx` (delete — replaced by PracticeCard inside the new PracticeRail)
- `src/components/lifestyle/listen/ListenFilterChips.jsx` (kill "SESSIONS" chip)
- `src/components/lifestyle/listen/ListenTab.jsx` (drop SessionCard usage; add PracticeRail mount)
- `src/components/lifestyle/listen/ListenGrid.jsx` (if it imports SessionCard, drop)
- `src/components/sessions/SessionDetailDialog.jsx` (audit — may be reused elsewhere)
- Check `src/pages/Track.jsx`, `Settings.jsx`, `ProgramDetail.jsx`, `ProgramsHub.jsx`, `Saved.jsx`, `ContentPlayer.jsx`, `AdminMigrations.jsx`, `BreathworkAudioManager.jsx`, `Explore.jsx` for cross-references — most are probably unrelated uses of the word "Sessions"

Migration plan for audio rows: meditation / breath / body scan content_type rows go to `media_type='practice'` (add to enum) and render in a new `PracticeRail.jsx` below `PodcastRail` on Listen. Drop everything else.

Acceptance test:
- `/Sessions` returns 404 (or redirects to Lifestyle)
- Menu sheet has no "Sessions" item
- Listen tab — no "SESSIONS" chip
- Listen tab — "Practice" shelf renders with audio rows ONLY (no zodiac, no news, no fiction)
- All three viewports clean

### LC-4 — TikTok ingest emoji strip

Spec: `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-4_tiktok_emoji_strip.md`. Small scope. Add `stripEmoji` helper to `base44/functions/ingestSocial/entry.ts` + a one-shot backfill for existing TikTok rows that have emoji in titles.

### LC-5 — Sweep (hybrid)

Spec: `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-5_closeout_sweep.md`. Three sections:
- A. Verify 7 pending Lifestyle phase tasks (#147, #151, #156, #157, #158, #161, #162) — Chrome MCP walk OR you do it in your browser
- B. Replace placeholder Spotify URLs in `TodaysWeather.jsx` with real curated ones
- C. Re-run image_url backfill on ~80 empty Longreads rows via devtools loop

## Operating notes

- `CLAUDE.md` at repo root has the full operating manual — read it first.
- Master plan at `claude-state/master-plan.md` is the heartbeat. Update its changelog when LC-3/4/5 ship.
- All 11 agents at `.claude/agents/*.md` — dispatch by name. Ms Verify is universal exit gate.
- Memory at `.claude/memory/` — skim MEMORY.md index first.
- **Live-walk-on-three-viewports is mandatory** before declaring done. See `.claude/memory/feedback_live_walk_after_every_build.md`.
- **No emoji codepoints anywhere** — Lucide icons + SVG only. See `.claude/memory/feedback_no_emoji_in_femwell.md`.

## Reply back via a `from-code-to-cowork-*.md` when

- LC-3 ships (commit SHA, screenshot paths, any deviations)
- LC-4 ships
- LC-5 sections A/B/C each complete
- Anything blocks
- You spot a master-plan-worthy decision (folded into the master plan with a changelog line)

Good luck. Apologies in advance for any base44 publish slowness — that's the one part you can't control from VS Code.

— Cowork (2026-05-13 ~20:00 UTC)
