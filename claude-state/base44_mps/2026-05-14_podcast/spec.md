# Podcast strategy build spec — Phase 1 + Phase 2

**Author:** Cowork (Mr Lead Manager hat). **Audience:** Code. **Status:** Green-lit by Halli 2026-05-14.
**Background:** `claude-state/research_podcast_strategy_2026-05-14.md` (full research) + `claude-state/decisions/2026-05-14_podcast_strategy.md` (4 decisions).

---

## Phase 1 — "Listen in your app" bottom sheet

**Goal:** When user taps a `PodcastCard`, show a bottom sheet with three buttons — Spotify, Apple Podcasts, Pocket Casts. Remember choice in localStorage; on subsequent tap surface that choice as the primary CTA with the others tucked behind a chevron.

### 1.1 Schema additions

Add to `base44/entities/LifestyleSources.jsonc`:

```jsonc
"apple_collection_id": {
  "type": "string",
  "description": "iTunes collectionId for the show. Resolved at ingest via iTunes Search API. Empty if resolution failed or show isn't on Apple Podcasts."
},
"apple_collection_url": {
  "type": "string",
  "description": "Full https://podcasts.apple.com/.../id{collectionId} URL. Stored derived for convenience."
}
```

Add to `base44/entities/LifestyleItems.jsonc` (only PODCAST media_type uses these):

```jsonc
"apple_collection_id": {
  "type": "string",
  "description": "Denormalised from LifestyleSources for fast render. Optional."
},
"feed_url": {
  "type": "string",
  "description": "The RSS feed URL for the show. Used to derive pod.link + Pocket Casts subscribe URLs at render time."
}
```

(If `LifestyleItems.feed_url` already exists, reuse it — check before adding.)

### 1.2 New function: `resolveApplePodcastId`

`base44/functions/resolveApplePodcastId/entry.ts` — given a feed URL, query iTunes Search API and persist `apple_collection_id` + `apple_collection_url` on the matching `LifestyleSources` row.

```ts
// 1. Receive { source_id, name, feed_url } via POST.
// 2. GET https://itunes.apple.com/search?media=podcast&entity=podcast&term=${encodeURIComponent(name)}&limit=10
//    (Free, no auth, ~20 req/min courteous rate limit.)
// 3. Match result by feedUrl equality (preferred) OR by name fuzzy match if feedUrl missing.
// 4. If match: update LifestyleSources with collectionId + collectionViewUrl.
// 5. Log :ok or :fail row to IngestErrorLog with function_name='resolveApplePodcastId'.
```

Wire into `pipelineOrchestrator/entry.ts`:
- Add `'resolveApplePodcastId'` to **`ONE_SHOT_PHASES`** initially (to backfill the existing 12 curated podcast sources).
- Also call it inside `seedPodcasts` immediately after a new source row is created — so future ingests resolve at creation, not on next cron.

### 1.3 New util: `derivePodcastLinks`

`src/utils/podcastLinks.js`:

```js
/**
 * Given an item + its source, return { spotify, apple, pocketCasts, primary, fallback }.
 *
 * - Spotify: pod.link fallback because we don't have a Spotify dev app yet.
 *   Format: `https://pod.link/${base64UrlSafe(feedUrl)}/spotify`
 *   pod.link's /spotify suffix routes straight to Spotify if it has the show, else shows the picker.
 * - Apple Podcasts: derived from apple_collection_id if present, else null.
 *   Format: `https://podcasts.apple.com/gb/podcast/id${collectionId}` (slug optional).
 *   On iOS this auto-opens the Apple Podcasts app via Universal Link.
 * - Pocket Casts: direct from feed URL, no resolution needed.
 *   Format: `pktc://subscribe/${feedUrl.replace(/^https?:\/\//, '')}` for the native scheme.
 *   Web fallback: `https://pca.st/import/${encodeURIComponent(feedUrl)}`.
 */
export function derivePodcastLinks({ feedUrl, applePodcastsCollectionId }) { ... }
```

### 1.4 New component: `PodcastListenSheet`

`src/components/lifestyle/listen/PodcastListenSheet.jsx`:

- Slide-up bottom sheet (use existing FemWell sheet pattern if one exists; otherwise vanilla `<div>` with `position: fixed; bottom: 0; transform: translateY(...)`).
- 3 buttons stacked vertically: **Spotify** (green #1DB954, white text), **Apple Podcasts** (Apple purple #832BC1 gradient, white text), **Pocket Casts** (red #F43E37, white text).
- Each button: icon (use Lucide `ExternalLink` or platform-shaped SVG — see brand guidelines, no emoji), platform name, "open in app" subtitle.
- Tap = `window.open(url, '_blank', 'noopener,noreferrer')` + localStorage write of choice + close sheet.
- A11y: `role="dialog"`, focus trap, Escape to close, backdrop click to close.
- Position: bottom sheet on mobile, centred modal on desktop.

### 1.5 Wire into `PodcastCard`

Replace the current `handleClick` that calls `window.open(item.content_url)` with:

```jsx
const [sheetOpen, setSheetOpen] = useState(false);
const handleClick = () => setSheetOpen(true);
// ...
{sheetOpen && <PodcastListenSheet item={item} source={source} onClose={() => setSheetOpen(false)} />}
```

If the user has a stored preference in localStorage (`fw_podcast_preferred_app`), skip the sheet on subsequent taps and open directly — but show a tiny "change" affordance on the card.

### 1.6 Acceptance criteria for Phase 1

1. Tap a Podcast card on `/Lifestyle?tab=listen` → sheet slides up with 3 buttons.
2. Tap Spotify → opens pod.link/spotify in new tab. If Spotify mobile app installed, it deep-links into the app.
3. Tap Apple Podcasts → opens podcasts.apple.com URL. On iOS Safari, Apple Podcasts app opens directly.
4. Tap Pocket Casts → opens `pktc://subscribe/...` (opens Pocket Casts app if installed) with `https://pca.st/import/...` web fallback.
5. localStorage `fw_podcast_preferred_app` persists choice; second tap of any card on the same device goes straight to the preferred app (with a 3-dot menu or chevron to re-open the sheet).
6. After publishing, `resolveApplePodcastId` runs as a ONE_SHOT phase and backfills all 12 curated sources within 1 minute.
7. Visual: 3-viewport pass (mobile 390×844, tablet 768×1024, desktop 1440×900). On desktop, sheet renders as centred modal not slide-up.

---

## Phase 2 — in-app HTML5 podcast player

**Goal:** Tap a PodcastCard primary action → episode plays inside FemWell. Sheet remains accessible via secondary affordance ("open in your app" link from inside the player).

### 2.1 Schema additions

`base44/entities/PodcastListens.jsonc` (new entity):

```jsonc
{
  "name": "PodcastListens",
  "type": "object",
  "properties": {
    "user_id": { "type": "string" },
    "lifestyle_item_id": { "type": "string", "description": "FK to LifestyleItems where media_type=PODCAST" },
    "position_sec": { "type": "number", "description": "Resume position in seconds." },
    "duration_sec": { "type": "number" },
    "completed": { "type": "boolean", "default": false },
    "last_played_at": { "type": "string", "format": "date-time" }
  },
  "required": ["user_id", "lifestyle_item_id"]
}
```

(Server-side compound unique on `(user_id, lifestyle_item_id)` enforces single row per user/episode.)

### 2.2 Player component

`src/components/lifestyle/listen/PodcastPlayer.jsx` — mini-player rendered in the app shell (Layout.jsx). Full-screen detail when expanded.

**Mini-player (always present at bottom of viewport when a podcast is active):**
- 56px tall above the bottom nav.
- Album art (40px square) + title (1 line, truncate) + show name (1 line, mauve, truncate) + play/pause + ×.
- Tap anywhere except controls → expand to full-screen detail.

**Expanded player (full-screen modal):**
- Large album art (or category gradient if missing).
- Title + show name.
- Scrubber (current time / remaining / total).
- Skip back 15s ⏮, Play/Pause (large center button), Skip forward 30s ⏭.
- Speed pill: 0.8× / 1.0× / 1.25× / 1.5× / 1.75× / 2.0× (cycle on tap, or popover).
- Sleep timer button (5/15/30/45/60 min options + "end of episode").
- "Open in your app" link → opens the PodcastListenSheet (Phase 1 reuse).
- Close × → collapses to mini-player.

### 2.3 Audio + MediaSession plumbing

`src/hooks/usePodcastPlayer.js`:

```js
// Singleton-ish via context. Manages:
//   - audioRef (single HTMLAudioElement appended to document.body for lifetime).
//   - currentEpisode, currentPosition, duration, playbackRate, sleepTimerRemaining.
//   - play(episode), pause(), resume(), seek(sec), seekBy(delta), setRate(rate), setSleepTimer(min).
//   - persistPosition() debounced to ~5s — POST to PodcastListens.upsert.
//   - On mount of episode: GET PodcastListens for (user, episode) and seek to resume position.
// MediaSession API:
//   - navigator.mediaSession.metadata = { title, artist: showName, album, artwork: [{src: imgUrl}] }.
//   - mediaSession.setActionHandler('play' | 'pause' | 'seekbackward' | 'seekforward' | 'seekto', cb).
//   - mediaSession.playbackState = 'playing' | 'paused'.
//   - Surfaces controls to OS lock screen + Bluetooth on mobile, MPRIS on Linux, Mac Now Playing.
```

**Important — NO Web Audio.** Stick to `<audio>` direct. CORS isn't required for `<audio>` playback of cross-origin URLs (most podcast hosts don't send `Access-Control-Allow-Origin`).

### 2.4 Provider in Layout

```jsx
// src/Layout.jsx
import PodcastPlayerProvider from '@/components/lifestyle/listen/PodcastPlayerProvider';
import MiniPlayer from '@/components/lifestyle/listen/MiniPlayer';

<PodcastPlayerProvider>
  <main>{children}</main>
  <MiniPlayer />  // null-renders when no episode loaded
  {showNav && <MobileBottomNav />}
</PodcastPlayerProvider>
```

### 2.5 PodcastCard tap behaviour after Phase 2 ships

- **Primary tap (anywhere on card except heart):** play in-app player. Episode starts streaming, mini-player appears.
- **Secondary affordance (small "↗ open in app" link on card or in player):** opens PodcastListenSheet.

This means we shift Phase 1's sheet from primary CTA → secondary affordance once Phase 2 ships. Acceptable per Halli's decision to build both in parallel.

### 2.6 Acceptance criteria for Phase 2

1. Tap Podcast card → episode begins playing within 1.5s on a good connection.
2. Mini-player visible at bottom of viewport above bottom nav. Persists across page navigation.
3. Audio continues playing when navigating between tabs.
4. iOS Safari: lock screen shows title + show name + artwork. Lock-screen play/pause works.
5. Android Chrome: MediaSession notification with controls.
6. Skip back 15s, skip forward 30s work; speed control cycles through 6 values.
7. Sleep timer counts down; episode pauses (fade out over 3s) when timer hits 0.
8. Close browser tab and reopen 10 minutes later → resume from saved position (±2s tolerance).
9. Premium feeds (returning 401/403): degrade to "Listen on Spotify" CTA via PodcastListenSheet.
10. 3-viewport pass.

### 2.7 Known risks (per research §B1, §B6)

- **iOS Safari PWA background audio** — historically broken (WebKit 198277). Plan: mini-player keeps tab foreground; if user reports it failing, the in-app player gracefully degrades with a "open in Spotify for background playback" CTA.
- **CORS** — only matters if we ever use Web Audio. Don't. `<audio>` direct works.
- **Bandwidth** — episode files 20-100MB. Stream-only in v1 (no download). Future: opt-in download.

---

## Phasing

**Phase 1 ship first** because it's smaller (~2 days) and unblocks the immediate UX gap (cards currently `window.open` the raw enclosure URL — bad UX). Phase 2 (~1-2 weeks) ships after Phase 1 lands and Cowork verifies.

**Suggested commit boundaries:**
- C1: Phase 1 — schema + resolveApplePodcastId + derivePodcastLinks util.
- C2: Phase 1 — PodcastListenSheet component + PodcastCard wiring + localStorage choice persistence.
- C3: Phase 1 — verify on 3 viewports, drop tombstone.
- C4: Phase 2 — schema (PodcastListens entity) + usePodcastPlayer hook + MediaSession scaffold.
- C5: Phase 2 — MiniPlayer + expanded player UI.
- C6: Phase 2 — sleep timer + speed control + resume-from-position.
- C7: Phase 2 — verify on 3 viewports, drop tombstone.

After each commit, Code pushes; Cowork publishes; Cowork verifies; Cowork updates STATUS.md.

---

## Out of scope for v1 (deferred)

- Transcripts (`<podcast:transcript>`) — honour if present, no UI for it yet.
- Chapter markers (`<podcast:chapters>`) — same.
- Episode downloads for offline.
- Smart Speed (Overcast's silence-removal).
- Video podcasts.
- Spotify dev app + native Spotify deep links (revisit when we register).
- Patreon premium-feed auth flow.
- Listening history page / continue-listening section on Today.
- Capacitor wrap (see `feedback_capacitor_stripe_paywall.md` — separate strategic track).

These all become candidate v2 features once Phase 1 + 2 stabilise.

---

## Open questions for Code while building

If anything in this spec is unclear, drop a `claude-handoff/from-code-to-cowork-*.md` and Cowork will clarify. Otherwise default to the research doc + this spec.

— Cowork, 2026-05-14
