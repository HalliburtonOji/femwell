# Cowork → Code, 2026-05-14: three calls (Playfair sweep · seedPodcasts skip-relax · status acks)

## TL;DR for Code-me

Three answers to your handoff at `b14da4e`. Profile font fix at `02b5c68` reviewed and clean — nice diagnosis on the Playfair zero-glyph. Both pending decisions land as **green light to ship**, with shape notes below. Plus a couple of acks.

## Call 1 — Playfair Display → Fraunces sweep: GREEN LIGHT, single commit

Ship as one targeted chore commit. I checked the scope: 168 hits across the codebase, with this categorisation:

- **165 inline `fontFamily: "'Playfair Display', serif"` declarations in JSX style props** — straight find-and-replace to `"'Fraunces', serif"`. No ambiguity. The brand-voice rule is unconditional.
- **3 CSS references in `src/index.css`** — these need slightly more care:
  - **Line 1**, the Google Fonts `@import url(...family=Playfair+Display...)` — replace with the Fraunces import. We're already loading Fraunces somewhere (it's referenced in Lifestyle.jsx, Today.jsx etc.) so verify there's no duplicate; if Fraunces is already imported elsewhere in the bundle, just remove the Playfair part of the import URL rather than adding a redundant Fraunces fetch.
  - **Line 33**, `--font-serif-heading: 'Playfair Display', 'DM Serif Display', Georgia, serif;` — change to `'Fraunces', 'DM Serif Display', Georgia, serif`. Keep the fallback chain intact.
  - **Line 163**, raw `font-family: 'Playfair Display', Georgia, serif;` — change to `'Fraunces', Georgia, serif`.

**Commit message shape:** `chore(brand): swap Playfair Display → Fraunces across 73 files (brand-voice rule)`. Mention the count in the body and reference `CLAUDE.md §2`.

**Test plan after build clean:**
- 3-viewport Chrome-MCP walk of /Onboarding (14 hits — most impacted), /ProgramsHub (5 hits), /Privacy (7 hits), /Terms (7 hits), /Upgrade (6 hits), /Pulse (7 hits).
- Verify no heading drops to fallback serif (visual confirmation that Fraunces is loading).
- I (Cowork) will do the live walk after you publish.

**Why I'm OK with this being one commit instead of split per page:** the find-and-replace is mechanical, the brand rule is binding, and splitting per file just adds churn. One commit, clean diff, reviewable in a single pass.

## Call 2 — seedPodcasts skip-relax: GREEN LIGHT with cascade fallback (not just relax)

Don't just remove the skip — replace it with a cascade. Empty rail is bad, but pure-text podcast cards with no thumbnail are also bad. The fix should be:

**Image resolution cascade (try in order, take first non-empty):**
1. Episode-level `<itunes:image href="...">` (current behaviour)
2. Episode-level `<media:content medium="image">` or `<media:thumbnail>` (RSS Media Extension — some feeds use this instead of itunes:image)
3. **Channel-level `<itunes:image href="...">`** (almost always populated — the show artwork)
4. **Channel-level `<image><url>...</url></image>`** (RSS 2.0 standard — universal fallback)
5. A fixed default placeholder path — `/podcast-placeholder.svg` or similar. Whatever exists in `public/`. If nothing exists, generate a flat colour SVG inline as a data URI: a 200×200 plum-tinted square with the first letter of the podcast name centered. Do NOT skip — every podcast must render.

Code shape:

```ts
function resolvePodcastImage(item, channel) {
  return (
    item?.['itunes:image']?.['@_href']
    ?? item?.['media:content']?.['@_url']
    ?? item?.['media:thumbnail']?.['@_url']
    ?? channel?.['itunes:image']?.['@_href']
    ?? channel?.image?.url
    ?? null  // caller falls back to placeholder
  );
}
```

Then in the seed loop, if `resolvePodcastImage` returns null, use `/podcast-placeholder.svg` or the inline data-URI fallback. The current skip becomes a log line: `console.warn('podcast episode image missing, using placeholder', { feed: feed.url, title: item.title })` — that way the data still lands but we have telemetry on which feeds are misbehaving.

**Why cascade not just relax:** the rail is shoulder-to-shoulder thumbnails. Six podcasts where two have art and four are flat plum boxes looks unfinished. Channel-level artwork is essentially universal in podcast RSS — fall through to that and the rail looks intentional even when episodes are stingy with metadata.

**Don't ship this in the same commit as the Playfair sweep.** Keep them separate so if either regresses, the revert is targeted.

## Call 3 — backfillLongreadsImages

Confirmed yes (from my last handoff). Mirror `backfillTikTokEmoji` / `backfillYouTubeEmbeddability`. Weekly phase, idempotent. With `cee11be` self-bootstrap it auto-fires on the next daily cron after deploy, then drops to weekly.

## Acks

- **Tombstone convention** — adopted both sides. Going forward both Claudes drop a `from-{me}-to-{them}-YYYY-MM-DD-{topic}.md` after any shipped commit the other side would care about. Both files exist on main now (`b14da4e` from you, `85ab800` and this one from me).
- **Spotify URLs** — I'm not generating them, Halli needs to supply curated UK-friendly playlist URLs. Possibly 6 phases × 2-3 playlists each. When he gives me the list, I'll patch `TodaysWeather.jsx` directly from Cowork; you don't need to wait on this.
- **`_shared/` import risk on LC-4** — still unverified. Live walk of `/Listen?filter=videos` will surface emoji presence; if titles still have them, that's the signal to try the fallbacks documented in your LC-4 handoff.

## What's next for you

1. **Playfair sweep** — one commit, clean diff.
2. **seedPodcasts cascade** — separate commit. Verify locally that channel artwork resolution returns valid URLs for the 12 curated feeds. If a feed has neither episode nor channel art (unlikely but possible), placeholder is fine.
3. **`backfillLongreadsImages`** — proceed.
4. **Wait on Spotify URLs from Halli.**

## What's next for me (Cowork)

1. **Chrome-MCP live walk after Playfair sweep publishes** — 3 viewports across the impacted pages.
2. **Force-trigger `pipelineOrchestrator?run_phase=seedPodcasts`** once your skip-relax ships — verify the rail populates with the cascade in place.
3. **LC-5A 7 pending phase verifications** — same Chrome-MCP walk. Will surface results as a separate handoff.

— Cowork (2026-05-14 ~00:50 UTC)
