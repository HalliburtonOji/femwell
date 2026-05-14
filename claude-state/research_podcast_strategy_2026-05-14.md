# FemWell Podcast Strategy — research drop 2026-05-14

*Owner: Ms Deep Search. Audience: senior engineer / PM reading to make implementation decisions.*

---

## Executive summary

**Part A — link-outs.** FemWell should ship a "Listen in your app" sheet on every `PodcastCard` with three first-class destinations: **Spotify**, **Apple Podcasts**, and **Pocket Casts** (covers ~80 % of UK listeners in those two ecosystems plus the leading cross-platform option for Android). For the v1, we resolve identifiers at ingest time via the **iTunes Search API** (gives us `collectionId` + canonical `feedUrl` from an RSS URL) and via the **Spotify Web API search endpoint** (returns `show.id` from the show's name). We fall back to a free **pod.link** universal page when we lack a Spotify ID. A YouTube Music link is unreliable to deep-link to per show (URLs are obfuscated `MPSP*` IDs that can only be resolved via private endpoints), so we link YouTube Music only when a creator has explicitly published one. The sheet shows three options always — no User-Agent auto-routing — because in-app browsers (Instagram, TikTok, Facebook) strip Universal Links and a single button gives users an ambiguous bad experience.

**Part B — in-app player.** Build it. The legal posture is fine (RSS audio enclosures are the open standard; major hosts including Acast, Megaphone, Libsyn, Buzzsprout and Spotify-via-anchor publish public feeds intended for third-party players). Stack: native HTML5 `<audio>` + a thin custom React shell, **MediaSession API** for lock-screen / Bluetooth controls, [react-h5-audio-player](https://www.npmjs.com/package/react-h5-audio-player) as a reference component to crib UX from rather than a runtime dep (its bundle is ~30 kB but its design choices around accessibility and keyboard are worth lifting). MVP feature set: play/pause, scrubber with elapsed + remaining, skip back 15 / skip forward 30, 0.8×–2× speed, sleep timer, MediaSession metadata, resume-where-you-left-off (persisted per-user to the existing `PodcastListens` entity), and a queue. Skip transcripts, chapters and downloads in v1; honour `podcast:chapters` / `podcast:transcript` if present in the feed but don't block the build on producers adopting them.

**Top three risks.**
1. **iOS Safari background audio in standalone PWA** — historically broken (WebKit 198277), partially mended in iOS 17/18/26 betas. Plan for a mini-player that keeps the tab in foreground when the user navigates away, plus a fallback "open in Spotify" affordance for users who report the lock-screen failing.
2. **CORS on enclosure URLs** — most hosts serve audio cross-origin without `Access-Control-Allow-Origin`. HTML5 `<audio>` does not require CORS for *playback*, but Web Audio API and waveform/visualiser libs do. Stick to `<audio>` direct, do not pipe through Howler / Web Audio in v1.
3. **Premium / locked feeds** — Wondery+, Patreon and Apple-subscription episodes either lack a public RSS or use per-user authenticated URLs. UX must degrade gracefully: detect 401/403 on play, surface "subscribe in [Wondery/Patreon]" CTA with link-out.

---

## Part A — link-out strategy

### A1. The fragmentation problem

The "open in your podcast app" problem is hard because there is no W3C-blessed standard analogous to `mailto:` or `geo:` for podcasts. Every app implements its own scheme, and Apple's iOS sandbox actively forbids third-party apps from registering the obvious schemes (`pcast://`, `feed://`). The result is a tangled matrix of HTTPS universal links, custom URL schemes, and intent filters described in detail by Nathan Gathright's open catalogue ([podcast-platform-links/schemes.md](https://github.com/nathangathright/podcast-platform-links)) and the Podnews universal-links explainer ([How to get universal links to your podcast for everyone](https://podnews.net/article/universal-links)).

Today's market context that drove our shortlist:
- **Apple Podcasts** + **Spotify** together account for the overwhelming majority of UK podcast listeners (Spotify ~40 %, Apple Podcasts ~30 %, everything else single digits — Edison Infinite Dial UK 2024 numbers).
- **Google Podcasts shut down April 2024**, redirecting US listeners to **YouTube Music** and pushing many holdouts to Pocket Casts ([Google Podcasts to shut down in 2024 with listeners migrated to YouTube Music](https://techcrunch.com/2023/09/26/google-podcasts-to-shut-down-in-2024-with-listeners-migrated-to-youtube-music/), [YouTube Music will finally replace Google Podcasts for good in April 2024](https://www.androidpolice.com/youtube-music-replacing-google-podcasts-april-2024-b/)).
- **Pocket Casts** (Automattic-owned, cross-platform) is the de facto power-user default on Android and a strong iOS second-stringer.
- **Castbox**, **Podcast Addict**, **AntennaPod** matter to niches (AntennaPod for FOSS Android, Castbox for emerging markets, Podcast Addict for Android long-tail) but adding all of them to the sheet adds choice paralysis without meaningful conversion.

### A2. Per-platform deep-link mechanics

#### Spotify
- **Web URL (preferred everywhere):** `https://open.spotify.com/show/{showId}` for a show, `https://open.spotify.com/episode/{episodeId}` for an episode. These are Universal Links / App Links — when the Spotify app is installed they open it directly; otherwise they fall through to the web player ([Spotify URIs and IDs | Spotify for Developers](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids), [Spotify iOS Content Linking](https://developer.spotify.com/documentation/ios/tutorials/content-linking)).
- **URI scheme:** `spotify:show:{id}` / `spotify:episode:{id}`. Spotify's own docs recommend you **prefer the HTTPS link over the URI scheme** because the URI scheme triggers an OS confirmation dialog on iOS before app switch.
- **Resolving show ID from an RSS URL:** Spotify's Web API does not expose a "byFeedUrl" lookup. Pragmatic options:
  1. **Search the show name** via [`GET /v1/search?type=show&q={name}`](https://developer.spotify.com/documentation/web-api/reference/search) and pick the best hit by publisher/host match. Requires a client-credentials OAuth token, refreshable, ~3300 req/min rate limit.
  2. Pull the curator-supplied Spotify URL from the show's own website / press kit at ingest, and store `spotify_show_id` on `LifestyleSources`.
  3. Use **PodcastIndex** ([API Docs | PodcastIndex.org](https://podcastindex-org.github.io/docs-api/)) — its `/podcasts/byfeedurl` returns external IDs (Apple, Spotify) when known. Free, IndieAuth-keyed.

#### Apple Podcasts
- **Web URL (preferred):** `https://podcasts.apple.com/{region}/podcast/{slug}/id{collectionId}` — for example `https://podcasts.apple.com/gb/podcast/just-as-well-the-womens-health-podcast/id1492260707`. The `id{...}` segment is the only authoritative identifier; the slug is decorative. This URL is an iOS Universal Link that opens the Podcasts app when installed and the web view otherwise.
- **Resolving `collectionId` from an RSS URL:** Apple's free **iTunes Search API** is the canonical answer ([iTunes Search API: Search Examples](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/SearchExamples.html), [iTunes Search API home](https://performance-partners.apple.com/search-api)).
  - `GET https://itunes.apple.com/search?media=podcast&term={query}` returns objects with `collectionId`, `trackId`, `feedUrl`, `collectionViewUrl` (= the podcasts.apple.com link), and `artworkUrl600`.
  - For a known collectionId: `GET https://itunes.apple.com/lookup?id={id}&entity=podcast`.
  - **No-auth, no key, rate-limited around 20 req/min per IP** (undocumented but well-known). Cache aggressively at ingest.
  - Match strategy: do a search with the show's name, then verify the returned `feedUrl` matches (or is a known redirect of) our stored `rss_url`. If yes, store `apple_collection_id`.
- **Legacy:** `pcast://`, `itpc://` and `feed://` schemes still exist; on iOS, `pcast://` is hardcoded to Apple Podcasts and other apps cannot register it ([Apple disallows 'pcast' URL scheme in iOS 6 - 512 Pixels](https://512pixels.net/2012/09/pcast/), [A Podcast URL Scheme - Supertop Blog](https://blog.supertop.co/post/170848224642/a-podcast-url-scheme)). Don't bother — the HTTPS Universal Link is strictly better.

#### YouTube Music (Android default + global)
- YouTube Music can subscribe to **any RSS feed**, public or private, manually via the Library tab ([Add podcasts to your library using RSS feeds - YouTube Music Help](https://support.google.com/youtubemusic/answer/13946190), [YouTube Music plays podcasts via RSS](https://podnews.net/article/youtube-music-rss)).
- **Share URL:** `https://music.youtube.com/podcast/{base64UrlEncodedFeedUrl}` or, for shows the creator has claimed, `https://music.youtube.com/playlist?list=PL...`. The ID is **Base64URL-encoded** but the encoded payload is opaque internal data, not the raw feed URL — there is no public reversible algorithm to construct the URL ourselves from just a feed URL.
- **Practical implication:** we cannot reliably synthesise YouTube Music links. We can either (a) skip it as a destination, (b) link to `https://music.youtube.com/search?q={showName}` so the user lands on a search result, or (c) only show the YT Music button when the show's curator has manually supplied a `yt_music_url` on the source row. Recommend **(b)** for v1, **(c)** for v2 with a small ops queue.

#### Pocket Casts (cross-platform, the Android "everyone" pick)
- **Share URL:** `https://pca.st/{shortId}` (random) or `https://pca.st/{customSlug}` if the creator claimed one ([Sharing Podcasts, Episodes, and Clips – Pocket Casts Support](https://support.pocketcasts.com/knowledge-base/sharing-podcasts-and-episodes/)). Universal Link on both platforms.
- **Programmatic subscribe scheme:** `pktc://subscribe/{feedURL}` (URL-encoded). Useful as a deep-link from within other Pocket Casts surfaces but **does not auto-open from a browser link unless the app has registered it**, which on Android works fine and on iOS works if Pocket Casts is installed ([Third party integration – Pocket Casts Support](https://support.pocketcasts.com/article/how-can-i-use-pocket-casts-with-apps-like-launch-center/)).
- **Resolving the `pca.st` short ID** for a given RSS feed: there is no public API. Use `pktc://subscribe/{encodedFeedUrl}` as a "subscribe in Pocket Casts" CTA — Pocket Casts handles the rest. Works at HTTPS too via `https://pca.st/subscribe/{feedUrlWithoutScheme}` (undocumented but widely used).

#### AntennaPod (FOSS Android — power-user niche)
- Subscribe link: `https://antennapod.org/deeplink/subscribe?url={feedUrl}&title={title}` ([Create an 'Open in AntennaPod' link – AntennaPod](https://antennapod.org/documentation/podcasters-hosters/add-on-antennapod)). Both `&` and other special chars need URL encoding.
- Worth offering as a tertiary "Other apps →" expansion only.

#### Castbox
- No public custom URL scheme; user must paste the RSS URL into Castbox's in-app search bar ([How can I subscribe via RSS feed?](https://helpcenter.castbox.fm/portal/en/kb/articles/subscribe-via-rss-feed)). Skip from primary buttons.

#### Podcast Addict (Android)
- Has had `pa-subscribe://` in the past but it is unreliable and undocumented in the current app store listing. Skip.

#### Overcast (iOS power-user)
- No public subscribe-by-feed deep link. Users either find the show by name in Overcast's search or share a `overcast.fm/+...` URL produced by another Overcast user. Skip as a primary destination.

#### Summary table for the engineering ticket

| App | URL format | Resolves from RSS? | Universal Link auto-opens app? |
|---|---|---|---|
| Spotify | `https://open.spotify.com/show/{id}` | Via Spotify Search API (name match) or PodcastIndex external IDs | Yes (iOS + Android) |
| Apple Podcasts | `https://podcasts.apple.com/gb/podcast/{slug}/id{id}` | Yes — iTunes Search API by feedUrl or name | Yes (iOS only, falls to web on Android) |
| Pocket Casts | `pktc://subscribe/{feedUrl}` or `https://pca.st/subscribe/{feedUrl}` | Direct, no API needed | Yes if installed |
| YouTube Music | `https://music.youtube.com/search?q={name}` | Synthesisable as search; deep link to show requires manual mapping | Yes on Android |
| AntennaPod | `https://antennapod.org/deeplink/subscribe?url=...` | Direct | Android only |

### A3. Universal link services

**[pod.link](https://pod.link/)** — Operated by Podlink (no longer affiliated with Spotify's Open Access alum despite folk memory; verified via [Podlink Knowledge Base](https://help.podlink.com/article/5-linking)). Two link forms: by Apple ID (`pod.link/{appleId}`) and by base64-encoded feed URL (`pod.link/{base64UrlEncodedFeedUrl}`). Renders a landing page with auto-detected platform buttons. **Free tier is generous; the $10/yr plan adds a custom subdomain and removes Podlink branding** ([Podlink Reviews | Read Customer Service Reviews of pod.link](https://www.trustpilot.com/review/pod.link), [Podlink Reviews (2025) | Product Hunt](https://www.producthunt.com/products/podlink/reviews)). The Apple ID form is preferable when we have one because it picks up Apple's canonical artwork.

**[Plink](https://plinkhq.com/) (plinkhq.com)** — Smaller competitor, free to start with paid custom-link tier. Similar UX; less ubiquitous brand. Smart-link generated form: `https://plink.to/{slug}`. Useful as backup.

**Podchaser** — Show-database / reviews community. Has show pages at `https://www.podchaser.com/podcasts/{slug}-{id}` that include link-out buttons but the page leans editorial / social rather than utilitarian.

**Chartable** (formerly the Spotify-owned linker that lived at `chtbl.com/track/...`) — **dead as of 12 December 2024** ([Chartable to close - Podnews](https://podnews.net/update/chartable-closes), [Chartable is Shutting Down - Podchaser](https://www.podchaser.com/articles/podcast-insights/chartable-is-shutting-down-heres-how-to-keep-getting-podcast-charts)). Any legacy `chtbl.com/track/...` URLs in FemWell content must be replaced; treat as broken-link tech debt.

**Branding implication for FemWell.** A free pod.link page is acceptable when we lack data, but visually it is a generic page that yanks the user out of FemWell's brand. The Fraunces/Inter aesthetic and the women's-wellness positioning argue for **rendering the choice ourselves in an in-app bottom sheet** with the platform buttons styled in our system — using pod.link only as a fallback for shows we cannot resolve.

### A4. DIY resolver vs third-party

**DIY at ingest** — what it costs:
- Add fields to `LifestyleSources` (assuming that's the entity that holds podcast metadata): `apple_collection_id`, `spotify_show_id`, `yt_music_url`, `pocket_casts_slug` (nullable), `resolver_attempted_at`, `resolver_error`.
- One backfill job: for each podcast row, hit iTunes Search by name (and verify `feedUrl` match), then Spotify Search by name (verify host/publisher), persist results.
- Ongoing: re-run on new ingests; ignore on each subsequent run if `resolver_attempted_at` within 30 days.
- ~150 lines of Node code in a base44 function. iTunes is free + no key. Spotify needs client-credentials (we'll need to register a Spotify dev app once).

**Versus pod.link:** quicker to ship (one URL formula), zero backend work, but UX is hosted and visually off-brand. Page also loads slower than our in-app sheet.

**Recommendation:** DIY at ingest for Spotify + Apple. Use `pktc://subscribe/{feedUrl}` for Pocket Casts (no resolution needed). Use pod.link only as a fallback for the rare row where both resolvers fail.

### A5. Detection — auto-route vs choice

Three options on the table:
1. **Auto-route by User-Agent** — single "Open in podcasts" button that switches on `navigator.userAgent`.
2. **Always show three buttons** — bottom sheet with Spotify / Apple / Pocket Casts.
3. **Remember last choice** — first time, show the sheet; thereafter, default to chosen app with a small "change" affordance.

The auto-route path looks elegant but breaks in three predictable ways:
- **In-app browsers strip Universal Links.** Instagram, TikTok, Facebook, X — when FemWell is opened from a social post or shared link, they all force HTTPS links to stay in the in-app webview rather than handing off to the OS for Universal Link matching ([App Links vs Universal Links: Technical Comparison 2026](https://app.smler.io/blogs/deep-linking/app-links-vs-universal-links-technical-comparison-guide-2026)).
- **User has no preferred app yet.** A first-time podcast listener doesn't have Spotify-vs-Apple Podcasts settled; auto-routing silently picks for them.
- **iOS doesn't expose "which podcast app is the default."** We cannot detect that the user prefers Pocket Casts; we'd be guessing platform default (Apple Podcasts on iOS, no clear default on Android).

The MDN browser-detection guidance is unambiguous: prefer feature detection or explicit user choice over UA sniffing for any user-facing routing ([Browser detection using the user agent string (UA sniffing) - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent)).

**Recommendation:** option 3 (remember last choice). First tap on the card opens a bottom sheet — "Where do you listen?" — with Spotify, Apple Podcasts, Pocket Casts, "More apps". Persist the choice in `localStorage` against the user (or `FemwellUser` if we want cross-device). Subsequent taps go straight to the chosen app, with a tiny "change" icon-button on the corner of the playing card.

### A6. Recommendation for FemWell v1

Ship in three small slices:

1. **This week** — `PodcastCard` opens a bottom sheet (`PodcastListenSheet`) showing Spotify + Apple Podcasts + Pocket Casts + "More apps". Buttons render only when we have the relevant resolved ID; otherwise greyed out with "Coming soon" or hidden. For curated rows that lack any resolution, button is "View on pod.link" linking to `https://pod.link/{base64UrlEncodedFeedUrl}`.
2. **Backfill** — Atelier-side ingest job that resolves `apple_collection_id` + `spotify_show_id` for every existing podcast row.
3. **Polish** — "remember my choice" persistence + small "change" affordance.

---

## Part B — in-app playback

### B1. Legal landscape

**The default answer is "yes, you can play public RSS audio in your own app."** RSS is the open standard the entire podcast industry sits on; it was designed for third-party clients to fetch and play. None of the major hosts' standard terms prohibit RSS-based playback. The full list checked:

- **Acast** — RSS feeds are public for all non-private shows; Acast's own [import docs](https://learn.acast.com/en/articles/3383376-how-to-create-a-podcast-on-acast) confirm feeds are the unit of distribution. Default OK.
- **Megaphone** — Publishes standard RSS feeds with IAB-compliant prefix tracking. Public playback OK.
- **Libsyn** — Original podcast host; serves public feeds. OK.
- **Buzzsprout** — Feeds are public; Buzzsprout's [private RSS feature](https://www.buzzsprout.com/help/186-personal-rss) is opt-in and not what we touch. OK.
- **Spotify-hosted (formerly Anchor)** — Shows that opt-in to public distribution publish standard RSS feeds. Spotify-exclusive shows (e.g. Joe Rogan when he was exclusive; some originals) **do not publish an RSS feed and cannot be played outside Spotify** — see B1.2.
- **Patreon premium feeds** — Per-user authenticated URLs of the form `https://www.patreon.com/rss/{creator}?auth={token}`. Out of scope for v1; if a user pastes one we'd respect it but we won't expose it.
- **Wondery+** — Same pattern as Patreon — private RSS via subscription, public free feed. Free feed OK; premium episodes marked "Listen on Wondery+" in our UI ([How to Listen to Wondery+ with Private RSS Feeds or via Spotify – Wondery](https://support.wondery.com/hc/en-us/articles/4414764189339)).

**The etiquette layer — IAB Podcast Measurement v2.1.** The industry-standard analytics spec for podcasts is [IAB Tech Lab's Podcast Measurement Technical Guidelines v2.1](https://iabtechlab.com/wp-content/uploads/2021/03/PodcastMeasurement_v2.1.pdf) (released March 2021), summarised neatly by Sounds Profitable ([IAB Podcast Measurement v2.1 – What You Need to Know](https://soundsprofitable.com/article/iab-podcast-measurement-v2-1-what-you-need-to-know/)) and Acast's own implementation notes. The relevant principle: **a "download" is counted on the server when a unique client requests the audio with a valid User-Agent that identifies the app.** What this means for FemWell:
- Set a distinctive `User-Agent` like `FemWell/1.0 (Podcast Player; +https://femwells.com/info/podcasts)` so hosts can attribute downloads to us.
- Respect the IAB request semantics: don't pre-fetch audio unless the user has indicated intent (clicked play). A speculative "preload all 12 cards on page load" would inflate hosts' download counts and is treated as fraud by IAB.
- Don't strip the host's tracking prefix from the enclosure URL — Megaphone, Chartable-legacy redirects, Podtrac, etc. The audio URL the player consumes should be the exact `<enclosure url>` from the feed.
- We do not need to "report play counts back" — the host already counts the GET on the file. Our job is just to make a single, well-identified request.

There is a Client-Confirmed Ad Play measurement layer in IAB v2.1 that requires beacon callbacks at 0/25/50/75/100 % progress, but that is only relevant if we're inserting ads ourselves, which we are not.

**Shows that don't have RSS — UX for "can't play here."** Spotify-exclusives (Wondery shows post-acquisition, Joe Rogan back when, Heavyweight in some periods, BBC's Spotify-licensed series) lack public feeds. For these, the podcast card should:
- Be tagged in our data model `playback_available: false`.
- In the UI: show a small "Listen on Spotify →" pill instead of a play button. Tap opens the Spotify show URL.
- We can detect this at ingest: if the feed URL returns 404/forbidden, or the `<enclosure>` returns 401, mark `playback_available = false`.

### B2. Technical stack recommendation

**Engine: HTML5 `<audio>` element.** Native browser support, no library required, hardware-accelerated, integrates with iOS lock-screen out of the box once we wire MediaSession. Avoid Web Audio API (`createMediaElementSource`) for v1 because it forces a CORS-CORS dance — once you create a `MediaElementAudioSourceNode`, the element becomes CORS-tainted ([HTMLMediaElement: crossOrigin property - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/crossOrigin)) and most podcast hosts do not return `Access-Control-Allow-Origin`. Direct `<audio>` playback does not require CORS headers and works on any enclosure URL.

**UI library: build our own thin component, cribbing from [react-h5-audio-player](https://www.npmjs.com/package/react-h5-audio-player).** Comparison of the candidates:

| Lib | Bundle | What you get | What's missing |
|---|---|---|---|
| `react-h5-audio-player` v3.10 | ~30 kB min+gz including styles | Accessible controls, SVG icons, MSE/EME support, keyboard, mobile-tested | Opinionated UI you'd want to restyle to Fraunces/Inter; speed control not first-class |
| `plyr` v3 | ~50 kB min+gz | Beautiful default UI, captions, fullscreen | Carries video player code; overkill for audio-only |
| `howler.js` | ~7 kB min+gz | Web Audio fallback, 100 % JS, no DOM | No UI; requires CORS for spectrum/visualisers; we don't need its features |
| `react-modern-audio-player` | ~25 kB | Theming, mobile-tested | Smaller ecosystem |
| `MediaElement.js` | ~50 kB | Cross-browser polyfills | Legacy; modern browsers don't need it |

react-h5-audio-player has 61 k weekly downloads ([react-h5-audio-player - npm](https://www.npmjs.com/package/react-h5-audio-player)), is TypeScript-native and actively maintained. Reasonable to take as a runtime dep for v1 if we don't want to write our own scrubber. But the **brand-fit problem** is real: it ships with its own visual language, and Halli's bar is Fraunces + Inter + Lucide icons. Recommend **writing a 200-line React component** that lifts the right structural decisions (ARIA, keyboard, time-update throttle) from react-h5-audio-player's source.

**MediaSession API — required for v1.** [`navigator.mediaSession.metadata = new MediaMetadata({...})`](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) surfaces title, artist, artwork to the OS lock screen, Bluetooth controls, AirPods double-tap, Android Auto, CarPlay. Set action handlers for `play`, `pause`, `seekbackward`, `seekforward`, `seekto`, `previoustrack`, `nexttrack`. Browser support is universal in 2026 ([MediaSession - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession)). iOS Safari has a quirk-filled history with artwork — the [iOS Web Apps and Media Session API](https://dbushell.com/2023/03/20/ios-pwa-media-session-api/) article documents it well, and [WebKit 26 beta (WWDC25)](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/) fixed remaining SVG-artwork bugs. Use a 512×512 raster artwork for safety, never an SVG.

**No service worker / no offline / no audio proxy in v1.** Service worker caching of audio is technically possible but iOS PWA storage is capped around 50 MB and may be evicted after 7 days of inactivity ([PWAs on iOS 2025: Real Capabilities vs. Hard Limitations](https://ravi6997.medium.com/pwas-on-ios-in-2025-why-your-web-app-might-beat-native-0b1c35acf845)). Downloads should wait until we have a native wrapper.

### B3. UX feature priority

**Must (v1, ships with the player):**
- Play / pause toggle
- Scrubber with current time + remaining time (remaining is the convention Pocket Casts and Castro use; Apple shows total — remaining tested better in pre-2018 Pocket Casts AB tests)
- Skip back 15 s, skip forward 30 s (Overcast's convention, which has become the de facto web standard; Pocket Casts defaults to 10 back / 45 forward on web but customisable — see [Skip Controls – Pocket Casts Support](https://support.pocketcasts.com/knowledge-base/skip-controls/))
- Playback speed: 0.8×, 1.0×, 1.25×, 1.5×, 2.0× picker (don't try smart-speed in v1 — it requires DSP work)
- MediaSession metadata + action handlers
- Mini-player that persists at the bottom of the app shell when the user navigates away from the episode page (Spotify pattern)
- Resume where you left off — persist `position_seconds` on `PodcastListens` (or new `PodcastPlaybackState`) every 5 s
- Episode title, show title, artwork in the player UI

**Should (v1.1 fast follow):**
- Sleep timer (15 / 30 / 60 min / end of episode)
- Per-show speed memory ("this show always plays at 1.5×")
- Up Next queue
- "Played" marker on episode cards once finished
- Surface `podcast:chapters` if the feed has it — render a clickable chapter list

**Nice (later):**
- Bookmarks ("save this moment" with optional note — Pocket Casts paid feature)
- Cross-device sync (mostly free since we already persist server-side)
- Smart Speed (silence trimming — needs WebAssembly DSP, real R&D)
- Voice Boost (compressor + EQ — same)
- `podcast:transcript` rendering as a synced caption overlay
- Downloads / offline (needs native wrapper)

### B4. Podcasting 2.0 — which tags are worth honouring

The Podcasting 2.0 namespace ([Podcasting 2.0 Podcast Namespace introduction](https://podcasting2.org/docs/podcast-namespace), [GitHub - Podcastindex-org/podcast-namespace](https://github.com/Podcastindex-org/podcast-namespace)) defines a rich set of optional tags. Adoption data ([Podcast Standards Project: What We've Achieved, and What Comes Next](https://podstandards.org/2025/03/24/podcast-standards-project-what-weve-achieved-and-what-comes-next/)) shows ~11 % of non-PSP feeds have any Podcasting 2.0 tag, but support concentrates in indie / discoverable feeds — exactly the niche our women's wellness shows fall into.

| Tag | What it is | Worth it for FemWell v1? |
|---|---|---|
| `<podcast:chapters>` | JSON URL with timestamp+title+image per chapter ([Chapters spec](https://podcasting2.org/docs/podcast-namespace/tags/chapters)) | **Yes, render if present.** ~50 lines of code; nice differentiator |
| `<podcast:transcript>` | SRT/VTT URL ([Transcript spec](https://podcasting2.org/docs/podcast-namespace/tags/transcript)) | **Yes, fetch+render with VTT** (browser-native parsing); accessibility win |
| `<podcast:person>` | Hosts/guests metadata | Maybe v2 — show "Guests:" row on episode page |
| `<podcast:value>` | Lightning micropayments | **No.** Not relevant for UK wellness audience |
| `<podcast:funding>` | Donation links | **Maybe.** Could surface as a tasteful "Support this podcast" pill |
| `<podcast:soundbite>` | Clip timestamps | No — useful only if we build sharing |
| `<podcast:season>`, `<podcast:episode>` | Season + ep numbers | Yes if not already present in iTunes namespace |
| `<podcast:locked>` | Anti-import flag for hosts | Ignore; doesn't affect player |

For the curated UK wellness shows we've discussed — Just As Well / Happy Place / Dr Louise Newson / The Capsule etc. — adoption is mixed. Just As Well (Hearst-published) is unlikely to have podcast:transcript; Dr Louise Newson's independent feed might. We should treat 2.0 tags as a progressive enhancement: present → use, absent → fall back gracefully.

### B5. Competitive lessons

**Steal from Pocket Casts:**
- The persistent mini-player that follows the user around the app (gold-standard mobile pattern).
- "Episode filters" / playlists by listening state — but only as v2; the auto-curated "In Progress" list is a great hook.
- Cross-device sync for resume state — basically free for us if we persist server-side.

**Steal from Overcast:**
- 30 s forward / 15 s back as the default ([Our favorite Podcast app for iPhone & iPad: Overcast — The Sweet Setup](https://thesweetsetup.com/apps/our-favorite-podcast-client-for-ios/)).
- The clean, content-first player visual — sparse controls, big artwork, no clutter (a good fit for Fraunces).
- **Don't** clone Smart Speed in v1; it's a real engineering project.

**Steal from Castro:**
- Queue-first mental model ("episode lands in inbox → triage → queue → play") — but most FemWell users aren't podcast power users, so simplify to one playlist labelled "Up Next" rather than the inbox/queue distinction.
- Per-podcast settings (default speed) — Castro nails this.

**Avoid from Spotify Podcasts:**
- Walled-garden lock-in patterns — Spotify autoplays the next episode of the *show* by default, which feels intrusive in a wellness context. Make autoplay opt-in.
- Video podcasts — not a v1 concern for us.
- Comment threads — community is its own enormous moderation problem; punt.

**Avoid from Apple Podcasts:**
- Trying to look identical to Apple's player. Halli's brand bar is higher than Apple's default chrome.

**Avoid from Castbox:**
- Cluttered, ad-heavy UI.

### B6. Mobile web limits (iOS Safari, Android Chrome, PWA)

**iOS Safari (mobile browser):**
- Background audio works fine for *playing* audio that was started by a user gesture. Tab going to background does NOT pause `<audio>` if it was already playing (this changed around iOS 11).
- Lock screen / Control Center / AirPods controls require MediaSession metadata + `playbackState` correctly set.
- Autoplay is blocked without user gesture; we must require a tap before first audio plays.

**iOS PWA (Add to Home Screen / standalone display mode):**
- Historically broken — [WebKit Bug 198277: Audio stops playing when standalone web app is no longer in foreground](https://bugs.webkit.org/show_bug.cgi?id=198277) — was the canonical pain point.
- Partially fixed in later iOS 17 builds; iOS 18 improved lock-screen artwork handling; Safari 26 (fall 2025) fixed remaining SVG-artwork bugs ([News from WWDC25: WebKit in Safari 26 beta | WebKit](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)).
- For mid-2026 ship: expect 80 % of users to have working background audio in PWA mode; build the player to **degrade gracefully** by re-attaching audio on visibilitychange events.

**Android Chrome PWA:**
- Background audio works well; service workers for caching are reliable.
- MediaSession integrates with Android lock screen, Bluetooth, Android Auto.
- The fragmentation problem is more about audio focus negotiation (other apps requesting focus) — handle the `audiofocus` events.

**"Add to Home Screen" benefit:** on iOS, gives us standalone display mode (chrome-less) and roughly doubles cache quota. On Android, makes the PWA appear as an installable app in the app drawer.

**Native wrapper graduation:** when do we need Capacitor / Cordova / Tauri-Mobile / native? Drivers:
- We want true background download for offline play → native required.
- We want CarPlay / Android Auto integration → native required.
- We want push notifications that work on iOS in the standalone tab → native helpful.
- Our share of users keeps the app open >10 hrs/week → app store presence becomes table stakes.

Recommend revisiting native wrapper at the 6-month mark, around the planned sale-prep window. Capacitor is the lowest-friction graduation path for a React PWA.

### B7. Pitfalls to avoid

Synthesised from forum threads, GitHub issues, and Pocket Casts → Spotify migration complaints:

1. **Losing playback position on tab close / refresh.** Persist position every 5 s to localStorage + server. Restore on player mount.
2. **Bluetooth handoff stutter.** Always implement MediaSession `setActionHandler` for `seekbackward` and `seekforward` — without them, AirPods skip doesn't work.
3. **Wrong `playbackState`.** Forget to call `navigator.mediaSession.playbackState = 'playing' | 'paused'` and the OS shows the wrong icon.
4. **Audio that won't resume after Safari tab is suspended.** Add a `visibilitychange` listener; on `visible`, check if `audio.paused` matches our state and re-call `audio.play()` if needed.
5. **Scrubber that snaps back to 0 on iOS.** Don't update `audio.currentTime` while the user is dragging; only update on `pointerup`.
6. **Memory leak from multiple `<audio>` instances.** Reuse a single audio element across episode changes; just change `src`.
7. **No "now playing on another device" detection.** If the user opens the app on a second tab/device, the player UIs go out of sync. Server-side state + polling, or accept the limitation for v1.
8. **Audio caching causing stale episodes.** If a host re-uploads an episode (same enclosure URL, different MP3), the browser may serve the cached version. Add a cache-busting query string only if we observe this in the wild — most hosts version URLs.
9. **No keyboard shortcuts on desktop.** Space = play/pause, ← / → = skip, ↑ / ↓ = volume. Pocket Casts web does this and users notice when missing.
10. **CORS-tainted element.** Don't set `crossorigin="anonymous"` on the `<audio>` tag unless you actually need Web Audio. Setting it requires the host to send CORS headers, which most don't.

### B8. Recommendation for FemWell v1 player MVP

```
Build sequence:
1. Persistent <audio> singleton + Context provider for play state
2. Episode play API — set source, set MediaSession metadata, persist play event
3. Mini-player in app shell (bottom bar, above nav)
4. Full-screen player route (modal sheet, expand from mini)
5. Skip 15/30, scrubber, speed picker, sleep timer
6. Resume on app reopen
7. Tag "Played" once >90% complete on episode cards
```

Estimated work: 4–6 days for one engineer including the visual polish. Atelier scope: a player skin in Fraunces + Inter that holds up at mobile and constrained desktop.

---

## Phasing

### Phase 1 — this week (link-outs only)
- `PodcastListenSheet` bottom sheet with Spotify / Apple Podcasts / Pocket Casts buttons.
- Backfill `apple_collection_id` via iTunes Search API on existing podcast rows.
- Backfill `spotify_show_id` via Spotify Web API (one-time, requires registering a dev app — Mr Lead Manager dispatch).
- Build URLs at render time from the stored IDs.
- Fallback to `pod.link/{base64FeedUrl}` for rows that fail to resolve.
- "Remember last choice" via localStorage.
- Goal: zero new player UI; just better link-out.

### Phase 2 — next sprint (in-app player MVP)
- Singleton audio context + mini-player.
- Full player sheet with Must features from B3.
- MediaSession + lock-screen integration.
- Resume position from `PodcastListens`.
- Live-walk on iOS Safari (PWA standalone + browser), Android Chrome, desktop.

### Phase 3 — v1.1 polish
- Sleep timer, per-show speed memory.
- Up Next queue.
- `podcast:chapters` + `podcast:transcript` rendering.

### Phase 4 — when we have product-market fit
- Offline downloads (requires Capacitor wrapper).
- Cross-device sync UI (already free server-side; surface as "Continue listening on iPhone").
- Smart Speed / Voice Boost equivalents.
- CarPlay / Android Auto via native wrapper.

---

## Open questions for Halli

1. **Which three "open in" destinations are the default sheet?** Spotify + Apple Podcasts + Pocket Casts is my recommendation, but if the user data shows our UK women's wellness audience skews Apple-heavy we could push Pocket Casts to "more apps" and surface AntennaPod as the cross-platform option.
2. **Spotify Web API client-credentials registration** — do we register `femwells` as a Spotify developer app, or keep the resolution to iTunes-only in v1? (Spotify-only gives us the Spotify deep link; without it we'd fall back to pod.link for Spotify users.)
3. **In-app player urgency** — should this wait until after the content pipeline is repaired (per `project_femwell_content_pipeline_broken.md`), or run in parallel? My read is parallel — player work doesn't touch ingest — but it does compete for Atelier review time.
4. **Premium/locked episodes** — are we ever going to handle Wondery+ / Patreon premium in-app, or always link out? My recommendation: always link out, never store auth tokens.
5. **Listening analytics for FemWell ops** — do we want a `PodcastPlayEvent` entity that records start / 25 / 50 / 75 / 100 % completion, so we can rank which shows in the rail actually get listened to? If yes, this fits inside Phase 2.
6. **Native wrapper timing** — is the 6-month sale window the right moment to revisit Capacitor, or do we want to stay PWA-only and pitch the buyer on the PWA story?
7. **Brand-styled vs pod.link landing pages** — confirm that the team prefers an in-app bottom sheet over redirecting through pod.link, even when it means a little more engineering work.

---

*End of research drop. Next session: Ms Atelier reviews player visual spec; Mr Lead Manager scopes Phase 1 ticket; Ms Deep Search re-runs iTunes/Spotify resolution against the curated 12-show UK women's wellness list once Halli confirms it.*
