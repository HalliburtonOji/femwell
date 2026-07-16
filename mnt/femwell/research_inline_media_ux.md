# Research — Inline media UX (video · audio · visualisation) — 16/07/2026

## Question
FemWell shipped v1 of inline media in expandable cards (`src/components/brand/expandCards.jsx`): tap-to-play `<video>` with a `FloraCover` poster + native `controls` + `preload="metadata"`; `<audio>` with a time-driven flora visualiser (seeded swaying stems). What to ADD. Anchors: warm, calm, non-gamified, mobile-first, reduced-motion-safe, **arbitrary remote media URLs**. URLs fetched 16/07/2026.

---

## What good looks like

**Video — autoplay, poster, preload**
1. **Tap-to-play is right for editorial content; v1 got this right.** NN/g: "Users don't appreciate being surprised by video or audio content that begins playing without their consent"; "Users should have control over what content they listen to or watch" (source: https://www.nngroup.com/articles/video-usability/). web.dev: "Avoiding autoplaying videos is usually best practice as it leaves the control with the user" (source: https://web.dev/learn/performance/video-performance).
2. **Muted autoplay is only defensible as a GIF-replacement** (`autoplay muted loop playsinline`) — decorative, soundless, short; never for narrative content (source: https://web.dev/articles/lazy-loading-video).
3. **iOS defeats muted autoplay anyway.** "`<video autoplay>` elements will pause if they become non-visible"; "If a `<video>` element gains an audio track or becomes un-muted without a user gesture, playback will pause" (source: https://webkit.org/blog/6784/new-video-policies-for-ios/). Autoplay is also off in Low Power Mode, so poster + play affordance is the only consistent experience (source: https://bitmovin.com/blog/autoplay-policies-safari-14-chrome-64/).
4. **`playsinline` is mandatory** or iPhone forces fullscreen on play (source: https://webkit.org/blog/6784/new-video-policies-for-ios/). v1 has it — keep.
5. **`preload="metadata"` (v1's value) is NOT the cheap option.** "the best chance of avoiding loading the video is with using `preload=\"none\"`"; the default metadata fetch causes "unwanted data consumption because browsers cannot predict metadata location within the file". Fix: `loading="lazy"` — "both the media and any poster image are automatically lazy-loaded just by adding the `loading=\"lazy\"` attribute" (source: https://web.dev/articles/lazy-loading-video).
6. **Poster quality is spec, not decoration.** Thumbnail "should be representative… and should be an image that scales well"; the card must give "the topic, relevant information about the presenter… and the length of the video" (source: https://www.nngroup.com/articles/video-usability/). `FloraCover` is generative — pretty, not *representative*; duration is missing from the card face.
7. **Native `controls` beats custom** inline: free fullscreen, PiP, AirPlay, OS caption styling, keyboard. "Native HTML elements should be your first choice whenever possible rather than custom ARIA controls" (source: https://www.a11y-collective.com/blog/aria-button/).

**Captions + transcripts (biggest v1 gap)**
8. **SC 1.2.2, Level A:** "Captions are provided for all prerecorded audio content in synchronized media"; captions include "who is speaking and… non-speech information conveyed through sound" (source: https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html). **Our inline video ships zero `<track>` → a Level A fail.**
9. **Audio-only is a different criterion.** SC 1.2.1 (Level A) requires "An alternative for time-based media… for prerecorded audio-only content" — a **transcript**, not captions (source: https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html). Video → `<track kind="captions">`; podcast/sleep story → transcript.
10. **`<track>` has a CORS gotcha:** the VTT URL "must have the same origin as the document — unless the `<audio>` or `<video>` parent element… has a `crossorigin` attribute" (source: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track). Pattern: `<track default kind="captions" srclang="en" label="English" src="…vtt">`. Beyond compliance, a transcript "allows users to pick and choose the content that is relevant… without having to watch an entire video" (source: https://www.nngroup.com/articles/video-usability/) — in bed, beside a sleeping partner, on mute, captions are a *primary* use case here, not an a11y tax.

**Motion + audio safety**
11. **SC 1.4.2 (Level A):** audio auto-playing >3s needs a pause/stop mechanism (source: https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html). v1 is tap-to-play → compliant.
12. **`prefers-reduced-motion` alone does not discharge SC 2.2.2** (motion >5s needs pause/stop/hide). Hidde de Vries: it "could meet it if those moving parts are removed under the condition of `prefers-reduced-motion`… In terms of actual usability… it only actually works if real users find this setting on their device" (source: https://hidde.blog/meeting-2-22-pause-stop-hide-with-prefers-reduced-motion/). Our visualiser runs only while audio plays and pause stops it — that likely satisfies 2.2.2. Document the reasoning; don't assume it.

---

## Audio visualisation — the decisive finding

**Do NOT use `AnalyserNode` with arbitrary remote URLs. Not a preference — a one-way trap.**

13. Web Audio spec §1.22.4: cross-origin playback is allowed "but `MediaElementAudioSourceNode` outputs zeroes for such media" — **the audio goes silent**. Firefox outputs silence, Chrome zeroes (sources: https://github.com/WebAudio/web-audio-api/issues/2453, https://bugzilla.mozilla.org/show_bug.cgi?id=937718).
14. **Undetectable and irreversible:** "when you call `createMediaElementSource` for such media it simply gets muted with no conservative way to revert it" — the open spec issue exists because you cannot test first or undo after (source: https://github.com/WebAudio/web-audio-api/issues/2453).
15. Mitigation needs `crossOrigin="anonymous"` **and** the origin returning `Access-Control-Allow-Origin` (source: https://github.com/katspaugh/wavesurfer.js/issues/2014) — unguaranteeable for third-party media. **Failure mode = a sleep story that plays silently.**
16. **Verdict: keep the time-driven visualiser** — v1 was right for a bigger reason than taste. For true amplitude later, use **pre-computed peaks**: peaks + duration let a player "skip audio decoding for improved performance" and render with no decode (source: https://wavesurfer.xyz/docs/core-concepts/; generate via https://github.com/bbc/audiowaveform). Peaks are same-origin JSON — no CORS trap.
17. **Canvas beats DOM only at scale:** "Canvas drawing is vastly more efficient than manipulating the DOM, with the difference becoming enormous when you have hundreds of elements" (source: https://web.dev/articles/canvas-performance). At ~5-9 stems, CSS transforms on a promoted layer are GPU-composited and cheaper (source: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance). **Stay on CSS — no canvas, no rAF** (rAF pauses in background tabs "to improve performance and battery life" — https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame — but CSS needs no JS loop at all).
18. **Organic-visualiser craft rule** (only citable one found): ambient design uses "multiple asynchronous (unsynced) and very slow modulation sources… that run at different, unrelated speeds" so it "shifts and breathes" (source: https://artistsindsp.com/ambient-sound-design-7-advanced-techniques-for-evolving-drones-and-textures/). Exactly v1's per-stem seeded phase offsets — instinct validated. Gimmicky = beat-locked, uniform, fast. Tasteful = slow, unsynced, drifting. **No** citable precedent found for plant/petal visualisers in a shipped wellness app — ours is differentiated, not derivative.

---

## Comparative table (fetched 16/07/2026)

| Library | Stars | Last push | Pattern | Notable |
|---|---|---|---|---|
| video.js | 39,825 | 29/06/2026 | Full custom skin | Too heavy |
| plyr | 29,901 | 03/01/2026 | Light custom controls | **Stale ~6mo** — de-risk |
| hls.js | 16,823 | 15/07/2026 | HLS | Only if we stream |
| wavesurfer.js | 10,340 | 15/07/2026 | Waveform + peaks | **Copy the peaks model, not the dep** |
| media-chrome | 2,711 | 01/07/2026 | Web-component controls | Closest to "native + brandable" |
| Able Player | 824 | 06/07/2026 | A11y-first player | Caption/transcript UX reference |

---

## What most apps miss
- **They caption video and forget the transcript for audio** — different criteria; captions-only on a podcast still fails Level A. She may want to *read* a sleep story.
- **They build a custom player for brand and lose fullscreen, PiP, AirPlay, OS captions, keyboard.** Native + a brand-shaped poster: 90% of the look, 5% of the risk.
- **They ship `preload="metadata"` and quietly bill users** — every card in a feed fetches a range on mobile data (source: https://web.dev/articles/lazy-loading-video).
- **They treat a sleep timer as a hard stop.** A meditation cut off mid-breath is a jolt in the exact moment the app promised calm.
- **They assume `prefers-reduced-motion` is the finish line** — it only helps users who found an OS toggle.

## Recommended ADD list (for Mr Lead Manager)

**A. Captions + transcript (Level A gate — first).** `<track default kind="captions" srclang="en" label="English">` on `FloraVideo`; `crossorigin` when the VTT is remote. Transcript disclosure ("Read it instead") on `FloraAudio`. Schema: `captionsSrc?`, `transcript?`.

**B. Data discipline.** `FloraVideo` → `preload="none"` + `loading="lazy"`. Keep the FloraCover poster (generative SVG — no fetch). Add duration to the card face (§6).

**C. Media Session (the sleep-story unlock).** `metadata` + artwork (**ship 512×512 AND a small size — iOS shows a grey box if only a large one is given**, source: https://apurvkhare.com/articles/frontend/web-platform-apis/media-session/) + play/pause/seekbackward/seekforward handlers + `setPositionState()` on `timeupdate`: "position state is not automatic; you must call setPositionState as playback progresses, or the lock-screen scrubber stays frozen" (source: https://web.dev/articles/media-session). Feature-detect `if ("mediaSession" in navigator)` — MDN flags it **not Baseline** (source: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API). Right call for a sleep story: it puts FemWell on the lock screen when the phone goes dark.

**D. Control set.** Skip **back 15 / forward 30** (Apple Podcasts defaults; customisable 10/15/30/45/60 — source: https://www.makeuseof.com/how-to-use-apple-podcasts-playback-controls/); speed **0.5x–3x** (Pocket Casts range — source: https://support.pocketcasts.com/knowledge-base/playback-effects/). Media Session seek handlers should honour `seekOffset` "or a sensible time (for example 10-30 seconds)" (source: https://web.dev/articles/media-session).

**E. Sleep timer, FemWell-flavoured.** Spotify's set: **5, 10, 15, 30, 45 min, 1 hour, or end of the current track/episode** (source: https://newsroom.spotify.com/2022-08-02/how-to-make-spotifys-sleep-timer-part-of-any-bedtime-routine/); audiobooks add "End of chapter". Fade-out is an *open user request* on Spotify — a gap we can beat (source: https://community.spotify.com/t5/Live-Ideas/Add-a-smooth-fade-out-when-Sleep-Timer-ends/idi-p/7386757). **Ramp volume over the last ~20s, never a hard stop** — and let the flora fold closed as it fades. Call it "End of story".

**F. Resume where she left off.** Persist `currentTime` per item; rewind proportionally to time away — Pocket Casts' intelligent resumption: back 30s if >24h, 15s if >1h, 10s if >5min. ⚠️ **Verify before speccing** — secondary source only (https://freeyourmusic.com/blog/how-to-set-spotify-sleep-timer roundups); Pocket Casts' own playback-effects page does not list it.

**G. Reduced motion.** `@media (prefers-reduced-motion: reduce)` → flora holds a still, open bloom (not hidden — stillness is brand-right), plus keep pause as the on-screen 2.2.2 mechanism.

**Do NOT build:** an `AnalyserNode` visualiser (§13-15), a custom video control bar (§7), a canvas port of the flora (§17).

## Sentiment quotes
**Deliberately omitted** — no forum quotes with verifiable handle + date found within budget; per the spec's failure-mode rule, dropping beats fabricating. If Mx Storyteller needs tone calibration for sleep/meditation audio, commission a dedicated r/Headspace + r/podcasts sentiment pass.
