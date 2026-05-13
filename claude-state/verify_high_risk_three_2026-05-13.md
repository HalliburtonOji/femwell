# Verify — Three High-Risk Features (2026-05-13)

**Verifier:** Ms Verify
**Repo state:** `main` @ commit `0aff029` (clean working tree)
**Live URL base:** https://femwells.com
**Test account:** ojihalliburton57 (signed-in via base44_access_token in tab 1748604589)
**Profile completion:** INCOMPLETE — banner reads "COMPLETE YOUR PROFILE — Unlock cycle predictions and daily guidance". `cycle_avg_length` and `last_period_start_date` both unset for this user.

---

## Top-line summary table

| Feature | Verdict | One-line reason | Next action |
|---|---|---|---|
| MP-Eng-1 mirrors (OnThisDay + Friend6m + PhaseInbox) | CAN'T TELL | Code path mounts; cards correctly return null because test user has no past check-ins / journal / cycle profile to mirror. No positive proof renderer works on real data. | Either seed a profile with `last_period_start_date` plus 30-day-old + 6-month-old DailyCheckins/JournalEntries, OR have a real long-tenured user verify visually. |
| Listen Seed (Podcasts + TikTok shelves) | SILENTLY BROKEN | 0 PODCAST and 0 TIKTOK items in LifestyleItems for this account. Empty-state copy is correct ("No podcasts here yet"); TRENDING ON TIKTOK rail is absent. Videos shelf has 24 items, Sessions has 28. The seed never landed for podcast/tiktok media types. | MP-Eng or a one-off ingest task. Mr Lead Manager: write an MP that either (a) reseeds 12 podcast rows + 12 tiktok rows directly into LifestyleItems, or (b) wires up the podcast/tiktok RSS+oEmbed ingestor that the Listen Seed MP was supposed to provide. Also: Sessions chip is mixing zodiac horoscopes + news articles + fiction episodes under one "SESSION" label — separate cleanup issue. |
| Sealed Letters (MP-Eng-2) | OK (partial) | Page renders, empty state correct, compose sheet opens, three preset chips (1mo/6mo/1yr) + Custom + Cancel + Seal it all present. Letters are user-to-self per schema; brief's "friend-to-friend / recipient" description does not match what shipped. | Confirm with user whether self-to-self was the intended design (current implementation) or whether friend-to-friend was the actual spec. If friend-to-friend, scope a recipient_user_id schema change + delivery flow as new MP. |

---

## Pre-flight

- `git status`: clean.
- `git log -5`: latest is `0aff029 team: upgrade all 11 agent specs by 3 levels…`. The MPs for these three features predate the agent-spec commit, so they should be on live.
- Chrome MCP connected. Working tab: 1748604589 (signed-in). Frozen tab: 1748604563 (stuck on "Loading…" because no auth — this is a SECOND browser session that never completed login).
- **Screenshot tool: BROKEN this session.** Every `computer.screenshot` call (with or without `save_to_disk`) timed out. I tried six times across two tabs at two viewport sizes. DOM evidence below is from `javascript_tool`. The user should re-run Verify in a fresh Chrome MCP session if screenshot artefacts are needed for sign-off. (Possible cause: extension side panel waiting on a permission prompt — visible from Chrome MCP error message itself.)

---

## Feature 1 — MP-Eng-1: OnThisDay + Friend6m + PhaseInbox

### Code map

| Component | File | Mount site | Render gate |
|---|---|---|---|
| OnThisDayLastCycleCard | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/today/OnThisDayLastCycleCard.jsx` | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/pages/Today.jsx` line 498 | Returns null if no DailyCheckins or JournalEntries in last-cycle date window. |
| FriendFrom6MonthsAgoCard | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/today/FriendFrom6MonthsAgoCard.jsx` | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/pages/Today.jsx` line 557 | Returns null if no DailyCheckins or JournalEntries 6 months ago. |
| PhaseInboxRail | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/lifestyle/foryou/PhaseInboxRail.jsx` | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/lifestyle/foryou/ForYouTab.jsx` line 348 | Returns null if `currentPhase` not in `['menstrual','follicular','ovulatory','luteal']`. `currentPhase` is derived from `last_period_start_date` (see `src/utils/cyclePhase.js`) — null if profile incomplete. |

Naming note: the brief called the second card "Friend6Months" but it's actually a self-reflection ("Six months ago YOU wrote…") — not a friend card. There IS no friend-activity surface in this MP. If the user actually wanted a friend-six-months surface, it was never built.

### Live walk evidence

**URL:** https://femwells.com/Today (viewport 380x844, signed-in)

DOM probe results:
```json
{
  "hasOnThisDayDOM": false,    // .fw-mirror-cycle-card absent
  "hasFriend6mDOM": false,     // .fw-mirror-6m-card absent
  "hasUnsealedDOM": false,     // .fw-unsealed-card absent
  "text_noteFromLastCycle": false,
  "text_sixMonthsBack": false,
  "text_letterOpened": false,
  "scrollH": 3324
}
```

Page text shows 3324px of normal Today content rendered (DailyChapter, mood selector, quick actions, recommendations, etc.). No JS errors visible. Page sample text confirms the user-state diagnosis: "This week had no check-ins logged, which makes it difficult to analyze your mood, energy, and sleep compared to the prev…"

**URL:** https://femwells.com/Lifestyle?tab=for_you (viewport 380x844)

DOM probe results:
```json
{
  "hasPhaseInboxAria": false,         // [aria-label="Phase inbox"] absent
  "hasHeldForSlowDays": false,        // menstrual title absent
  "hasForWhileRising": false,         // follicular title absent
  "hasForBrightStretch": false,       // ovulatory title absent
  "hasForSoftenPhase": false,         // luteal title absent
  "scrollH": 7951
}
```

For-You renders 7951px of content (EditorialHero, 12 article cards in BentoGrid) — so the tab itself works; PhaseInboxRail just returns null because currentPhase is null.

### Verdict: CAN'T TELL

All three components are correctly mounted; their gates fire silently when input data is absent. To get positive verification we need either:
1. A test user with `last_period_start_date` set AND ≥1 DailyCheckin from ~30 days ago AND ≥1 DailyCheckin from ~6 months ago AND ≥1 LifestyleItem with `phase_tags` covering whatever phase the cycle math returns; OR
2. A real long-tenured user (e.g. the user's own account if their profile is complete) to spot-check at next login.

I would recommend Ms Verify run this again after Ms Data seeds an integration-test fixture or after the user logs in with their own profile.

---

## Feature 2 — Listen Seed (Podcasts + TikTok shelves)

### Code map

`src/components/lifestyle/listen/ListenTab.jsx` (lines 9-35, 98-111). Queries:
- `LifestyleItems.filter({media_type: 'PODCAST', status: 'PUBLISHED'}, '-published_at', 24)` for Podcasts chip
- `LifestyleItems.filter({media_type: 'TIKTOK', is_embeddable: true, status: 'PUBLISHED'}, '-published_at', 12)` for the TikTok rail
- `LifestyleItems.filter({media_type: 'VIDEO', status: 'PUBLISHED'}, '-published_at', 24)` for Videos
- `ContentItems.filter({}, '-created_date', 24)` for Sessions

### Live walk evidence

**URL:** https://femwells.com/Lifestyle?tab=listen&filter=all

```json
{
  "videoMatches": 24,
  "podcastMatches": 0,
  "tiktokRailPresent": false,    // "TRENDING ON TIKTOK" eyebrow absent
  "scrollH": 13085
}
```

**URL:** https://femwells.com/Lifestyle?tab=listen&filter=podcasts

Page text:
> "Filter / All / Videos / Podcasts / Sessions / **No podcasts here yet** / We add a few episodes a week. They'll appear here."

`scrollH` collapses to 765 — empty state correct.

**URL:** https://femwells.com/Lifestyle?tab=listen&filter=videos

24 VIDEO items render (Abby Pollock, Dr Hazel Wallace, Women's Health Mag, etc.). Note: many video titles contain emoji (`💪 🫶 😴`) imported from source captions — this violates the brand's no-emoji rule from `feedback_no_emoji_in_femwell.md`. Separate cleanup needed.

**URL:** https://femwells.com/Lifestyle?tab=listen&filter=sessions

Page renders 28 items labelled "SESSION":
- 12 zodiac horoscopes (Aries, Taurus, …, Pisces) — should not be in Listen at all
- 5 news articles (NHS framework, gut microbiome, etc.)
- 4 fiction episodes (Episode 1-4 of "The Wrong Door")
- 3 actual audio sessions (Grounding Calm 6 MIN, Sleep Deep 20 MIN, Anxiety Reset 3 MIN)

So `ContentItems` is being used as a kitchen-sink and the Sessions chip displays 25 non-session items mixed with 3 real ones.

### Verdict: SILENTLY BROKEN

The Listen Seed MP did NOT populate Podcasts or TikTok content. The shelves and rail render-paths work (Videos shelf is full, Podcasts empty state is correct copy, Sessions chip pulls a too-broad ContentItems set). What's broken:

1. **0 LifestyleItems with `media_type=PODCAST`.** Either the seed script never ran, ran against the wrong environment, or wrote rows that don't pass the `status='PUBLISHED'` filter. Mr Lead Manager — next MP should investigate (was it a one-off seed or an ongoing ingest?). If one-off: write a `seed_podcasts` job. If ongoing ingest: it's silently failing — check IngestErrorLog and the ingestRSS / ingestPodcast function for the same `rss_url` vs `feed_url` bug noted in `project_femwell_pipeline_hidden_bugs.md`.
2. **0 LifestyleItems with `media_type=TIKTOK` AND `is_embeddable=true`.** Same root cause. TikTokRail returns null when items is empty (line 16 of TikTokRail.jsx) so there is no error surface — just silent absence.
3. **Sessions chip leakage** — `ContentItems` filter has no media-type guard. Out of scope for this verify, but flag to Mr Lead Manager for a separate small MP.

### What I'd need for a CAN-TELL on the render side

Even with 0 podcast/tiktok rows, the empty-state for Podcasts proves the chip filter routes correctly. To prove the Podcasts shelf renders when populated, seed 3+ rows with `media_type='PODCAST', status='PUBLISHED', published_at='2026-05-12'` and re-walk.

---

## Feature 3 — Sealed Letters (MP-Eng-2)

### Code map

| Component | File |
|---|---|
| SealedLetters page | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/pages/SealedLetters.jsx` |
| Compose sheet | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/sealedLetters/SealedLetterComposeSheet.jsx` |
| Empty state | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/sealedLetters/SealedLettersEmptyState.jsx` |
| Letter list | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/sealedLetters/SealedLetterList.jsx` |
| Letter row | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/sealedLetters/SealedLetterRow.jsx` |
| Reader | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/sealedLetters/UnsealedLetterReader.jsx` |
| Today-page surface | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/today/UnsealedLetterCard.jsx` (mounted in Today.jsx line 558) |
| Entity schema | `/sessions/relaxed-loving-brahmagupta/femwell-repo/base44/entities/SealedLetters.jsonc` |
| Profile nav link | `/sessions/relaxed-loving-brahmagupta/femwell-repo/src/components/profile/ProfileNavLinks.jsx` line 58 |

### Schema diagnosis

The SealedLetters entity has **no `recipient_user_id` field**. Properties: `body`, `seal_date`, `unsealed_at`, `unseal_seen_at`, `title`. Indexed on `user_id` only. Page H1: "Letters to yourself". Today-card copy: "You wrote yourself a letter."

**This is letters TO SELF, not friend-to-friend.** The brief described "send a sealed letter, recipient gets it" — but what shipped is "write a letter to your future self, your future self gets it on a date you pick." This needs reconciliation with the user.

### Live walk evidence

**URL:** https://femwells.com/SealedLetters (viewport 380x844, signed-in)

Empty state rendered correctly:
> Letters to yourself
> Held in private until the date you picked.
> No letters yet.
> Write something to a future you. We'll hold it until the date you pick.
> [Write your first letter]

After clicking "Write your first letter":
- Compose sheet opens. Buttons present: Cancel, Seal it, "In 1 month", "In 6 months", "In 1 year", Custom.
- 1 textarea visible.
- Heading: "A letter to a future you / Write what you want her to know. Pick when she gets to read it."

Send/submit not exercised (would mutate state).

### Verdict: OK (with two caveats)

The page mounts, empty state is correct, compose sheet opens with all expected affordances, schema is sound for the self-to-self model. Caveats:

1. **Scope mismatch** with the brief's "friend-to-friend / recipient" framing. The user should confirm whether self-to-self was the intended design or whether a recipient model was lost in translation between spec and build.
2. **End-to-end send/seal flow not exercised.** Submitting "Seal it" would create a SealedLetters row. To verify post-creation: needs an in-app create with seal_date=tomorrow, then wait 24h, navigate to /Today, confirm the UnsealedLetterCard renders, then click to /SealedLetters?open=... and confirm reader opens. Solo-account verifiable but takes a day of elapsed time.

### Heart-symbol "♥" violation

Both /SealedLetters and /Lifestyle pages emit `Made with ♥` in the footer. The character `U+2665` falls inside the `[\u{2600}-\u{27BF}]` range defined as emoji in `feedback_no_emoji_in_femwell.md`. Strictly speaking this violates the no-emoji rule. Flag separately — probably a Mr Fix-it trivial swap to a Lucide `<Heart />` SVG.

---

## Notes

- The base44 SDK is not exposed on `window` (Vite-bundled module), and direct REST calls from `javascript_tool` against `app.base44.com/api/apps/.../entities/...` hung the renderer. So I could not peek entity row counts directly from devtools — the verdicts above rely on UI-state inference (empty-state copy + absence of rendered cards) rather than entity row counts. Ms Data can confirm via base44 MCP if a tighter count is needed.
- Two Chrome MCP renderer freezes during this walk (auth-gate timeouts on tab 1748604563 and one during a re-navigation on tab 1748604589). Each cleared by navigating to a known-good URL.
- The phrase "I cannot give the user…" doesn't apply — I have what I need to diagnose; the gating is purely test-data, not capability.
