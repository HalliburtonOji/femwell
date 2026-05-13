# FemWell — Master Plan

_Authored by Ms Strategy 2026-05-13. **This is a living document** — update on every brainstorm pass, every shipped MP, every memory consolidation, and every time the user has a "crazy idea" worth keeping. Treat the version line below as the contract: bump the date and add a changelog line whenever you touch this file._

**Version:** 2026-05-13 (rev 3)
**Last updated:** 2026-05-13 — dual-mode Cowork+Code workspace set up; Lifestyle close-out partly shipped; Sessions removal locked; Podcast curation strategy locked.

## Changelog
- **2026-05-13 rev 3** — Dual-mode workspace built: `CLAUDE.md` at repo root, `.claude/memory/` (40 files), `claude-state/` (planning docs), `claude-handoff/` (cross-Claude comms). Code in VS Code now owns LC-3/4/5; Cowork owns strategy + master plan. LC-1 on main (`7795c90`..`3aa5a04` — PodcastRail + seedPodcasts + bonus Horoscope additions including HoroscopeToast, SectionSkeleton, GlossaryTip, BirthDataSheet Nominatim autocomplete, Compatibility rewrite). LC-2 on main (`ea185fe` — Atelier letter writes published-by-default per D6, banner removed). Publish stalled in Cowork's MCP session; Code will retry from VS Code. Sessions removal locked — user said "shouldnt even be a section in the app." Podcast curation locked at 12 UK podcasts (Maintenance Phase, Adam Buxton, This Is Dating, Modern Love, Sentimental Garbage, You're Wrong About, Esther Perel, On Being, The High Low, Slow Burn, How To Fail, Hilarious World of Depression). Mr Lucha status remains PAUSED (not retired). Hybrid build rule temporarily off for LC-2 through LC-5 (direct repo edits, no MP-paste).
- **2026-05-13 rev 2** — User answered §12 open questions. Lifted the content-pipeline hard gate (locked 2026-05-06; H2 shipped on top of it anyway and nothing exploded). Planner locked as Phase B priority. Atelier Reading AI-final for now (no human sign-off bottleneck). Sale timeline: 6-month aim, 9-month soft cap. Master-plan-as-living-doc protocol added.
- **2026-05-13 rev 1** — Initial authoring by Ms Strategy.

## How to update this doc
- **Whenever a new feature idea lands** (user crazy idea, deep-search find, agent brainstorm): add it to §6 Engagement layer or §10 Roadmap with a "(captured YYYY-MM-DD)" tag, don't lose it in chat.
- **Whenever an MP ships:** strike the relevant Phase A/B/C/D row, move it to a "Shipped" subsection with the commit SHA.
- **Whenever the user makes a strategic decision** (yes/no on an open question, pivot, scope cut): update the relevant section, bump the version, log it in the Changelog.
- **Every 2-4 weeks:** read the whole doc, prune what's now wrong, surface contradictions to the user.
- **Bibliography (§13) is append-only** — every doc that touches the plan gets a row.

---

## 0. TL;DR

FemWell is a UK women's wellness companion built on base44 at `femwells.com`. It is not "a cycle tracker with content." It is a **pattern-recognition companion** that holds the cycle as the structural spine, a named-astrologer (Astra Cole, MA, FAS) Horoscope as the cultural hook, an editorial Lifestyle magazine as the engagement loop, and an AI assistant (Jess) as the conversational interface layer beneath every screen. The brand voice is Fraunces + Inter, cream + plum + rose + gold — closer to a New Yorker science feature than to a woo app. No emoji codepoints anywhere.

As of 2026-05-13 the app is past its visual MVP. Horoscope v2 ("H2") shipped this morning in eight commits with four paid surfaces wired (Atelier Reading subscription, £19 Year Ahead PDF, £29 Birth Chart Atelier, £55 Choose The Day). Today, Lifestyle, Nutrition, Pulse, Planner, Programs, Community v1, Journal v1, Jess v2, and the unified-bottom-nav are signed off and largely shipped. Sealed Letters (end-to-end encryption primitive) and the three engagement mirrors (OnThisDay, Friend6Months, PhaseInbox) are live. The Lifestyle content pipeline — the engine that feeds For You / Browse / Listen — has multiple known bugs (ingestRSS field mismatch, `created_at` null, YouTube decoupled from `LifestyleSources`, 0 Podcast + 0 TikTok rows, Sessions chip mixes four content types) and is the largest internal risk to a buyer demo.

The path to a £1M valuation runs through three doors in this order: (1) finish the surface redesigns we have demos for so the app reads as one consistent magazine across all 17 pages; (2) ship the engagement-layer features (Cycle Mirror, Echo Wall, Witness, Phase Twin) that make the data moat hard to copy; (3) instrument tracking, harden a11y/perf, and assemble a due-diligence pack. The closest comparable products — Flo, Clue, Stardust, Pattern, Co-Star — each own one moat. FemWell is the only product positioned to claim cycle + content + astrology + journal in one place under a named-author brand. That is the sale-deck headline.

---

## 1. Vision

**Who it's for.** UK women, primarily 27-45, English-first, smartphone-led, who track their cycle but resent the gamified-tracker category. The sharpest psychographic isn't an age band — it is *women who quietly read The Pool, Aeon, the LRB, or The New Yorker on their phone at night, and who think the existing cycle apps look childish and over-bright.* Secondary: women approaching or inside perimenopause (~45-55) who are HRT-curious and want a calm, evidence-cited place to track flashes, sleep, and mood without a "wellness influencer" tone. Tertiary: post-secondary-school women (20-26) discovering astrology and looking for a credible voice rather than Co-Star's caustic one-liners.

**What job it does.** FemWell mirrors your body and your sky back to you, in the voice of a senior friend with a science degree. It tracks the cycle, surfaces phase-aware content, runs a named-astrologer Horoscope, holds journals safely, and lets Jess (the AI assistant) draw quiet patterns across all of it. The brand sentence: *"It pays attention so you don't have to."*

**What makes it sellable.** Four pillars:
1. **Named authorship moats.** Astra Cole, MA, FAS (Horoscope) and (planned) clinician voices give the app an editorial brand that scrapers and template apps cannot reproduce. Co-Star is anonymous-algorithmic; FemWell is signed-by-a-human, and the signature is the moat.
2. **One unified experience across mobile + tablet + desktop.** Same 5-slot bottom nav (Today · Lifestyle · Jess · Profile · Menu) at every viewport. No desktop sidebar. Tablets and laptops are first-class citizens in the field — most cycle apps treat them as mobile mistakes.
3. **Subscription + one-shot + B2B revenue layers.** £8.99/mo FemWell Plus, three one-shot products (£19 / £29 / £55), and Care Bridge as a B2B clinician portal (designed, not yet shipped). A buyer sees three revenue rails, not one.
4. **Defensible content moat.** Editorial Lifestyle pipeline pulls from RSS, longreads, podcasts, YouTube, and a Project Gutenberg in-app reader; Horoscope ships category-original asteroid astrology + Annual Profections + Red/White Moon classifier; Daily Story is a 30-chapter serialised fiction (The Long Room).

---

## 2. Brand + Voice (one page)

**Type.** Fraunces (display + italic accents) and Inter (UI). No third font. Italic Fraunces for reflection, Jess voice, felt-sense lines. Inter for facts, labels, data.

**Palette.** Cream `#f7f0e6` and ivory `#fbf7f0` as page backgrounds; ink `#2b1e16` and ink-soft `#4a3a30` for text; rose `#d4a5a0`, rose-deep `#b67d77`, clay `#c98a6b`, gold `#c9a961`, plum `#7a4a5e`, lavender `#b9a4c9`, moss `#7d8668`, night `#1a1522`, star `#f5e6d3` for accents and section themes. Plum Night (`#1a1522` page with cream/star content cards) is reserved for the Horoscope and any "fragile thing being held" surface (Panic Mode, Sealed Letters, Witness, end-of-life data flows).

**Tone.** Calm-but-substantive. Closer to a New Yorker science feature than a wellness influencer reel. UK English ("realise", "favourite", "specialised"). £ everywhere. en-GB dates ("14 Jun 1999", "13 May 2026"). Honest about uncertainty — confidence percentages are exposed in TTC Mode, "we don't know enough yet" is preferred over a false specific.

**Iconography.** Lucide line icons exclusively. **No emoji codepoints anywhere** — this includes moon phases (replaced by `<MoonPhaseGlyph>` SVG), planet/zodiac glyphs (replaced by Lucide), reaction icons (replaced by lucide `Heart`, `HandHeart`, `Ear`, `Bookmark`), and any "✨ / 🌑 / ✦" decorations the agent may try to add. This is the single most-violated rule in the codebase; pre-flight grep for emoji codepoints on every MP.

**Named authorship.** Astra Cole, MA, FAS is the Horoscope's resident astrologer; the Atelier Reading paywall is "Backed by Astra Cole, MA, FAS" (never "Backed by Skyfield" — the Swiss Ephemeris credential is deferred to H3). Future named voices on the roadmap: a UK BMS-accredited GP for Life Stage, a BACP therapist for Panic Mode, a BDA-registered dietitian for Nutrition. Each is positioning, not yet contracted — see §11 Risks.

**Layout.** Same 5-slot bottom nav at all viewports. Width-constrain the nav at tablet/desktop (max-width ~600-720px, centred); never substitute a sidebar. The `DesktopSidebar` function in `src/components/layout/FloatingSidebar.jsx` is intentionally dead code.

---

## 3. Architecture (live state)

The bottom nav has five slots. Below is what each does *today on `femwells.com`* (verify by walking each live before shipping any change).

### 3.1 Today
The morning landing. Renders a phase pill, a one-liner morning card (one phase-tagged Lifestyle item via a single query), Calm Cards + Panic tiles in the QuickActionsRow, and an evolving set of pillars (Sleep, Energy, Mood, Skin) per the signed-off `femwell_today_demo.html`. Pulls from `UserProfile`, `DailyAggregates`, `CycleEvents`, `PanicSessions`, `LifestyleItems` (one phase-tagged item), and `JessMemory`. **Status:** signed off as a demo; the live page is partially aligned with the demo — some sections (the pillars concept) are designed-only. The Today redesign is one of the highest-impact remaining MPs (see §10 Phase B).

### 3.2 Lifestyle
The editorial spine. Five sub-tabs — For You · Browse · Listen · Daily Story · Horoscope. Locked architecture as of 2026-05-06 (memory: `project_femwell_lifestyle_architecture.md`). Hybrid magazine + data-mirror: editorial craft on top, phase-aware ranking underneath. Pulls from `LifestyleItems` (the unified content table), `LifestyleSources` (27 source rows; ~10 dead per the Phase 5 re-vet), `DailyStory` (30 active rows, The Long Room arc), `AstroProfile` + `HoroscopeReading` + `AtelierLetters`, `WeeklyBookPick` + `FictionWork`. Sealed Letters key infrastructure for any cross-encrypted-feature reuse. **Status:** the chrome is live and substantial — see §4.

### 3.3 Jess (FAB centre)
The AI assistant. Renders as a centre-FAB on the bottom nav; opens an assistant overlay anywhere in the app. Built around two base44 agents in `base44/agents/`: `personal_assistant.jsonc` (general) and `womens_health_coach.jsonc` (health-specific). Has tool access to ~30 entities (read + write where appropriate) plus voice. **Status:** Jess v1 is live, Jess v2 design is signed off (12 phones across three groups + four appendices — see `femwell_jess_v2_demo.html`), but the v2 redesign has not yet been built into the codebase. Two key v2 features — Morning Digest and Pre-Panic check — are Q2-targeted in the ship sequence.

### 3.4 Profile
User-facing settings, garden, seasons, data, and practice surfaces. The signed-off `femwell_profile_demo.html` is five phones: P1 Home (hero + Garden-first + Cycle summary + Community gentle mark + Pro), P2 Connections (wearables + calendars + partner + clinician — Dr Siobhan Jenkins, GMC 6115847, NHS GP, consent-gated), P3 Seasons (12-week named arcs), P4 Data (3 export formats + UK emergency footer with Samaritans 116 123 and Shout 85258), P5 Practice (life stage + rituals + Jess's voice + Smart Nudges stats + Panic preset + Living Wisdom saved words). **Status:** signed off as a demo; live page is the older simpler Profile. This is one of the top sale-readiness MPs — the buyer will land here.

### 3.5 Menu (bottom sheet)
Drag-handle bottom sheet with 28px top corners that opens via `open-nav-drawer` event from `FloatingSidebar.jsx`'s exported component. Overflow destinations: Nutrition, Programs, Planner, Sessions, Community, Journal, Pulse, Skin & Hair, Life Stage, Settings, Panic Mode, Onboarding (re-run). **Status:** live and functional.

**Cross-cutting note.** Jess is not a tab; she is an interface layer. Every page can call `jess.pickForPhase()`, `jess.companion()`, `jess.draft()`. Her closer ("Jess-noticed" line) bookends pages where it fits (Sessions, Profile, Pulse) and is intentionally absent from pages where the user's own content is the lead (Journal, Community).

---

## 4. Lifestyle Deep Dive

Lifestyle is the page that does the most work in FemWell. It is where the magazine moat lives.

### 4.1 For You
**Live state:** editorial hero on top, bento of phase-tagged picks, Saved rail snippet, Try-this rail, categories. Phase-aware ranking via `LifestyleItems.phase_tags`. MP 1 For-You shipped clean (per `project_femwell_content_pipeline_broken.md` — "the hero, bento, save heart, smart-save phase chooser, phase pill, cycle utility are all live and rendering correctly").

**Pipeline:** reads from `LifestyleItems` after ingest crons populate. Phase-aware sort + smart-save phase chooser are wired.

**Signature features:** EditorialHero with og:image extraction (commit `8717da6`); first-load empty-flash fix (`80a2dcc`); FemWell-generated article body with markdown leaks fixed (`5cbc399`, `cbe3e54`).

### 4.2 Browse
**Live state:** Type filter chips (All · Articles · Fiction · Stories · Books · Guides) shipped (`a20f8f4`). Collapses Read + Fiction + Stories + Books into one surface. Bookshop.org UK link replaces the Goodreads tap (`a45bb0e`).

**Pipeline:** same `LifestyleItems` table filtered by `content_type`. Books surface mixes FemWell originals + Project Gutenberg.

**Signature features:** in-app Gutenberg book reader with Kindle UI (`f234be3`); FictionReader + book cover art + back-nav fixes (`96385a5`); article hero + expandContent prompt + 3D card depth + filter Option B (`787e638`); book card synopsis + drop Fiction tab + genre tags + chapters_json support (`8d8d5dd`).

### 4.3 Listen
**Live state:** audio shelf surface with TTS-played articles, meditations, podcasts. The seed cron is wired but as of last audit returned 0 Podcast + 0 TikTok rows (the seed never landed).

**Pipeline:** same `LifestyleItems` filtered to `content_type in ('audio', 'podcast', 'tts')` — but the chip taxonomy currently mixes four content types under one Sessions label. See §11 Risks.

**Signature features:** Listen queue as a real surface; cycle-aware smart save ("save for luteal"); regional UK voice variants (RP, Glasgow, Scouse, Welsh, Yorkshire, Belfast, Multicultural London — see §3.4 Profile).

### 4.4 Daily Story
**Live state:** 30 chapters of The Long Room are live in the `DailyStory` entity (`series_key === 'the_long_room'`, days 1-30, published 2026-05-11 → 2026-06-09, each ~500 words). Borrowed Light arc rows remain in the table but `is_active === false`.

**Pipeline:** custom — operator-authored, not ingest. Kindle reader with flip mechanic, cliffhanger lock, countdown, 3D page-curl shipped (`8ab89e7`). Reader v4 (a-d) added immersive chrome, settings drawer, themes, bookmarks, position restore (`62221c0`, `8347ea1`, `e76a9a0`, `43a183b`, `02ee821`).

**Signature features:** the daily flip + cliffhanger lock + countdown is genuinely category-original. This is one of the cleanest moats in the app.

### 4.5 Horoscope (H2 shipped 2026-05-13)
**Live state:** the freshest surface. Eight commits shipped this morning; verification deferred per user. Plum Night theme on a cream page (each section in a SectionWrap card per `36def9f`). Sections:
- **Twilight Hero** (one Fraunces sentence with name + climbing-moon verb italic + three meta chips).
- **Triad** (Sun · Moon · Rising with Lucide icons; tap-to-expand 80-120 word reading).
- **Today's Weather** signed by Astra (Power / Pressure / Trouble keep data shape; Astra-signed micro-sentence + Spotify "Astra's sound for today" deep link, A5).
- **Cycle×Moon dial** (outer 29.5d lunar ring + inner 28d cycle ring + two discs marking today).
- **Goddess Bench** (Ceres / Pallas / Juno / Vesta / Chiron / Black Moon Lilith — six orbs + dashed-rule italic read).
- **Sky Diary** (12-cycle timeline + Right Now card + Void-of-Course Moon pip in en-GB BST, A4).
- **Red/White Moon classifier** (auto-detected from last six cycles vs moon phase at bleed start; monthly cron `computeRedWhiteMoon`).
- **Annual Profections** with **Saturn Return Letter** (free birthday unlock, ages 27-30; A1).
- **Compatibility** (Talk / Touch / Trust / Time — UI label is "Time"; DB field stays `grow_score`; D1).
- **Ask The Sky** (chart-grounded Q&A, persistence on fail via `IngestErrorLog`).
- **Quiet Mode** + **Soft Sky sub-tier** (hide retrogrades; A3).
- **Atelier Reading paywall** with monthly draft cron, operator sign-off panel, "Backed by Astra Cole, MA, FAS" attribution (D2).
- **Paid Shelf** (£19 Year Ahead PDF / £29 Birth Chart Atelier / £55 Choose The Day) with simulated checkout fallback when Stripe env price IDs are unset.
- **Science footer** (Helfrich-Förster 2021 + Cajochen 2013 + LSA / Frank Clifford lineage chip, A2).
- **Privacy line** at the foot of every render.

**Pipeline:** `generateHoroscopeReading/entry.ts` runs the daily LLM job. New entities shipped in H2: `AstroProfile.asteroid_signs`, `HoroscopeReading.astra_signoff`, `HoroscopeReading.goddess_read`, `HoroscopeReading.weather_energy`, `HoroscopeReading.weather_mood`, `HoroscopePersistedClassification`, `AtelierLetters`, `OneShotPurchases`.

**Open items:** live verification walk (deferred), real Spotify playlist URLs for moon-sign playlists (currently placeholders), real Stripe price IDs for the three one-shots (env config, not code), `deliverOneShot` PDF generator (H3 work).

### Cross-cutting Lifestyle features (signature, ride across sub-tabs)
- **TTS audio mode.** Every article gets a "Listen to this" affordance; powers the Listen tab's queue.
- **Cycle-aware smart saves.** When saving an item, user can tag it for a phase ("save for luteal"); the Saved view surfaces phase-relevant saves at the right time.
- **og:image + free multi-source image finder.** Pulls publisher hero images from Wikipedia + Wikimedia Commons + og:image fallback before resorting to Unsplash.

---

## 5. Surfaces Shipped vs Designed-Only (the inventory)

This is the table that tells a buyer what they're buying. Each row maps a surface to its demo file, its current live state, and the gap.

| # | Surface | Demo file | Shipped state | Gap |
|---|---|---|---|---|
| 1 | Today | `femwell_today_demo.html`, `femwell_today_full_concept.html`, `femwell_today_horizontal_concept.html`, `femwell_today_pillars_concept.html` | Live but older shape; Calm Cards + Panic tiles wired | Demo redesign not yet built — pillars + Jess-narrative hero |
| 2 | Lifestyle (shell + tabs) | `femwell_lifestyle_demo.html` | Live with 5 sub-tabs as architected 2026-05-06 | Demo proposed 9 tabs; locked 5 supersedes |
| 3 | Lifestyle / For You | (within Lifestyle demo) | Live (MP 1 shipped clean) | None — chrome OK; pipeline gaps are content not UI |
| 4 | Lifestyle / Browse | (within Lifestyle demo) | Live (Type chips + Books surface shipped `a20f8f4`) | None — but books-dead-links issue from pipeline |
| 5 | Lifestyle / Listen | `lifestyle_listen_spec.md` | Live shell | Podcast + TikTok rows = 0; Sessions chip mixes content types |
| 6 | Lifestyle / Daily Story | (Kindle reader shipped) | 30 chapters live; reader v4d shipped | Reader is craft-complete; arc beyond ch.30 is editorial work |
| 7 | Lifestyle / Horoscope (H2) | `femwell_horoscope_v2_demo.html` | **SHIPPED 2026-05-13** — 8 commits on main | Verification walk deferred; Spotify URLs + Stripe IDs to wire |
| 8 | Nutrition | `femwell_nutrition_demo.html` | Signed off; built | Wired to MealLog, HydrationLog, etc. |
| 9 | Pulse | `femwell_pulse_demo.html` | Signed off; built | Wearable source switcher live |
| 10 | Planner | `femwell_planner_final.html` (+ `femwell_planner_calendar_options.html`, `_month_shapes.html`, `_retargeting.html`) | Shape C signed off; **Phase 1 partial shipped** (`6b2bfb0`, planner MP Phase 1 unify + brand sweep) | Adaptive smart view retargeting + future-tense forecast not yet finished |
| 11 | Programs | `femwell_programs_demo.html` | Signed off; built | Continue-journey + picked-for-luteal + Pro-locked surfaces |
| 12 | Community v1 | `femwell_community_demo.html` | Signed off; built | Anonymous-first composer, gentle reactions |
| 13 | Community v2 (integrated w/ Journal) | `femwell_journal_community_v2.html` | Signed off — Q2-Q4 rollout staged | Echo Wall (Q2), Witness (Q3), Phase Twin (Q4) — none shipped |
| 14 | Journal v1 | `femwell_journal_demo.html` | Signed off; built | 4-mode composer, voice waveform, Unpack-with-Jess |
| 15 | Journal v2 (integrated) | `femwell_journal_community_v2.html` | Signed off — Cycle Mirror + Sealed Letters rail + Anniversary card | Sealed Letters infra shipped (MP-Eng-2); rest staged Q2 |
| 16 | Jess v1 | `femwell_jess_demo.html` | Retired (replaced by v2 demo) | n/a |
| 17 | Jess v2 | `femwell_jess_v2_demo.html`, supporting: `femwell_jess_hero_variants.html`, `femwell_jess_roadmap_deep.html` | Signed off demo; ship order Q2-Q4 | Morning Digest + Pre-Panic + Draft (Q2); Ambient + Teach + Witness + Relational (Q3); Companion + Week Shaper + Presence (Q4) — none shipped |
| 18 | Sessions | `femwell_sessions_demo.html` | Awaiting sign-off; demo built 2026-04-20 | Player + afterglow Q3; Garden Q3; voice switcher Q3 |
| 19 | Skin & Hair | `femwell_skin_hair_demo.html` | Awaiting sign-off | Quick log + phase map Q3; encrypted timeline Q3 (reuses Sealed Letters); routines Q3 |
| 20 | Life Stage | `femwell_life_stage_demo.html` | Awaiting sign-off | Peri + HRT Q3; TTC Q3 Pro; post-meno Q4 |
| 21 | Profile | `femwell_profile_demo.html` (v2 iterated 2026-04-21) | Awaiting sign-off | 5-phone redesign — top sale-readiness MP |
| 22 | Settings | `femwell_settings_demo.html` | Awaiting sign-off | 4 phones — Jess memory budget slider, language & region (UK regional accent toggles), accessibility |
| 23 | Onboarding | `femwell_onboarding_demo.html` | Awaiting sign-off | 10-screen flow, no BMI/orientation, stage→language table |
| 24 | Panic Mode | `femwell_panic_demo.html` | Awaiting sign-off | 5 phones; no countdowns/red/alarm; UK regional voices; Samaritans 116 123 + Shout 85258 |
| 25 | Explore v2 | `femwell_explore_v2_demo.html` (replaces archived `femwell_explore_demo.html`) | Awaiting sign-off | UK regional Voices-from-home; AMA sessions; no horoscopes (Lifestyle only) |
| 26 | Care Bridge v2 (clinician portal — B2B) | `femwell_care_bridge_v2_demo.html` | Awaiting sign-off | Dual-side: 3 phones her-side + desktop clinician portal. GMC verification + HRT + Flash + async note + audit. Q3/26 launch with London endo cohort ≤30 |
| 27 | Partner Sync | `femwell_partner_sync_demo.html` | Awaiting sign-off | 6 phones dual-side. PWA-only partner at `with.femwells.com`. Q2-Q4 staged |
| 28 | Living Wisdom (Echo Wall × Jess flywheel) | `femwell_living_wisdom_demo.html` | Awaiting sign-off | 4 phones. Surfaces in Today + Journal + Panic afterglow + Jess drawer. Never in Explore/Community/Partner/Care Bridge. Q3-Q4 |
| 29 | Rituals (not streaks) | `femwell_rituals_demo.html` | Awaiting sign-off | Garden home with 6-plant state machine (sprouting/steady/thriving/resting; never "broken"). Q3-Q4 |
| 30 | Smart Nudges | `femwell_smart_nudges_demo.html` | Awaiting sign-off | Rule engine + per-category controls + post-nudge felt-sense. Auto-mute below -0.50 weight. Q3-Q4 |
| 31 | Offline Retreat Mode | `femwell_offline_retreat_demo.html` | Awaiting sign-off | Pre-flight pack + offline Today + reconnect sync. Reuses Sealed Letters cipher. Q2-Q4 2027 |
| 32 | TTC Mode (Pro overlay) | `femwell_ttc_mode_demo.html` | Awaiting sign-off | Planner band + Pulse 3-logs + Jess window coach + partner on-ramp. Q3 2027 onwards |
| 33 | UK-local layer | `femwell_uk_local_demo.html` (replaces archived `femwell_naija_local_demo.html`) | Awaiting sign-off | NHS practitioners directory + foods-by-phase + UK regional Jess voices + wellbeing moments. Q1 2027 |

**Supporting design system assets (not pages):**
- `femwell_garden_seasons_library.html` — 12 named seasons with gradients + tile shapes + trigger signals + Jess close-lines
- `femwell_jess_hero_variants.html` — 7 hero card shapes mapped to page verbs (Narrative / Player / Chip-card / Continue / Plate / Pull / Retargeting)
- `femwell_component_library.html` — generic component reference

**Count.** 33 surface rows. **Signed off (built or partly built):** 13. **Signed off as demo only:** 6 (Today redesign, Profile v2, Planner not yet finished, Journal v2 staged, Community v2 staged, Jess v2 staged). **Awaiting sign-off demo:** 14 (Sessions, Skin & Hair, Life Stage, Settings, Onboarding, Panic, Explore v2, Care Bridge v2, Partner Sync, Living Wisdom, Rituals, Smart Nudges, Offline Retreat, TTC Mode, UK-local).

---

## 6. Engagement Layer (cross-cutting)

These are the features that ride across multiple surfaces. They are the part of the app a buyer's diligence team will spend the most time on, because they are the part competitors cannot trivially clone.

### 6.1 Cycle Mirror (past-self witness)
**Concept.** When a user is at cycle day 18 luteal, the app can surface their own journal/log entries from the same day in past cycles. Not as "compare yourself" — as "your past self is sitting with you." Lives in Journal v2 (signed off in `femwell_journal_community_v2.html`).

**Status.** Designed. Not shipped. Q2 target per `femwell_2026_2028_ship_sequence.md`.

### 6.2 Sealed Letters (solo time-travel)
**Concept.** A user writes a letter to her future self (or to a past self). Client-encrypted via a per-device key. Surfaces back on a date/phase trigger. The crypto primitive ("FemWell SecureStore") is designed to be reused across every Tier-3 encrypted feature (Body Photos, Panic afterglow notes, Witness requests, Offline Retreat journal queue).

**Status.** **SHIPPED** per MP-Eng-2. Lives as the substrate beneath Journal v2, Panic Mode, Skin & Hair photo timeline, Offline Retreat, and Care Bridge async-notes. The single most-leveraged piece of infra in the app.

### 6.3 Echo Wall (anonymous sharing)
**Concept.** Same-phase anonymous one-liners with "hold" reactions and 48-hour fade. Replaces the Community feed's algorithmic surface with a deliberately ephemeral one. Lives in Community v2 (signed off).

**Status.** Designed. Not shipped. Q2 target.

### 6.4 Witness Mode (one-shot pair)
**Concept.** A locked entry — the user writes something hard, four fixed responses ("I heard you", "I'm with you", "you're not alone", "thank you for trusting me"). 3-strike policy: if a witness ghosts or responds inappropriately, the relationship ends. Designed to be safe-by-default. Lives in Community v2 dock.

**Status.** Designed. Not shipped. Q3 target.

### 6.5 Phase Twin (12-day pair)
**Concept.** Anonymous 1:1 pairing between two users in the same cycle phase. 12-day arc. ∞ monogram. No public profile, no ranking, no leaderboard. Replaces the leaderboard mechanic with a 1:1 anonymous witness.

**Status.** Designed. Not shipped. Q4 target.

### 6.6 OnThisDay / Friend6Months / PhaseInbox (the three mirrors)
**Concept.** Three lightweight Jess-surfaced cards: "on this day last cycle…", "your friend pattern from six months ago…", and a phase-tagged inbox of items Jess held quietly for the right moment.

**Status.** **SHIPPED** per MP-Eng-1. Mount correctly, gated by user data (won't render until ≥1 cycle of history exists). The "test profile populate for engagement-card render verification" is on the Phase-A follow-up list (see §10).

### 6.7 Living Wisdom (Echo × Jess flywheel)
**Concept.** Echoes that earned ≥3 holds get re-surfaced by Jess as quiet company at matching phase-days for other users. Six transparency rules ensure it never becomes a viral mechanic. Surfaces: Today / Journal / Panic afterglow / Jess drawer. **Never** in Explore / Community feed / Partner Sync / Care Bridge / during Panic / Onboarding first 14 days.

**Status.** Designed (`femwell_living_wisdom_demo.html`). Not shipped. Q3-Q4 target. Depends on Echo Wall having ≥30 days of accumulated entries before surfacing makes sense.

---

## 7. Content Pipeline (the engine room)

Lifestyle's For You / Browse / Listen tabs are powered by the `LifestyleItems` entity, which is populated by a fleet of ingest crons. This is the most fragile and most-leveraged system in the app — when it works, Lifestyle reads as a magazine; when it doesn't, every UI polish makes the brokenness more visible.

### 7.1 The six ingest paths
1. **`ingestRSS`** — pulls from `LifestyleSources` where `category === 'RSS'`. Reads `source.feed_url` (originally `source.rss_url` — see Bug 1 below).
2. **`ingestYouTubeChannels`** — pulls from a hardcoded `YOUTUBE_CHANNELS` array (19 channels). Currently decoupled from `LifestyleSources` rows entirely (Bug 3).
3. **`ingestPodcasts`** — design-staged; in practice 0 rows ingested as of last audit.
4. **`ingestTikTok`** — design-staged; same, 0 rows; titles when present import emoji from source captions (UK no-emoji rule violation).
5. **`ingestLongreads`** — pulls long-form articles (Aeon, The Atlantic, LRB-via-RSS, longreads.com, etc.) — partially functional via `ingestRSS` pathway.
6. **`ingestGutenberg`** — pulls Project Gutenberg books for the Browse / Books surface; in-app reader is shipped (`f234be3`).

### 7.2 Phase 1-6 history
- **Phase 1** — base For You shipped, hero + bento + saves wired.
- **Phase 1.5** — patch on the For You ranker.
- **Phase 2** — Browse surface architecture decision.
- **Phase 2.5** — LLM phase-tag inference on ingest. Verification of phase-tag populating with real LLM inferences is queued for the next ingest cycle (`project_femwell_phase25_verify_tomorrow.md`).
- **Phase 3** — Listen surface initial wire-up; podcasts seed planned but not landed.
- **Phase 4** — daily caps. The Phase 4-A pipeline-fixup MP was supposed to ship before 4-B cap logic (per `project_femwell_pipeline_hidden_bugs.md`); 4-A is still pending.
- **Phase 5** — UK source list expansion; >10 of original 27 sources are dead and need re-vetting.
- **Phase 6** — image backfill folded into `pipelineOrchestrator` so og:image + Wikipedia + Wikimedia Commons run nightly without manual invoke (`88b4231`).

### 7.3 Open issues
- **Bug 1 (HIGH).** `ingestRSS` reads `source.rss_url` (lines 91, 94) but the schema field is `source.feed_url` — every RSS source has `feed_url` populated, zero have `rss_url`. The function skips every source. Fix: rename in the function, not the schema.
- **Bug 2 (HIGH).** `created_at` is null on every `LifestyleItems` row. base44 is not auto-populating. `updated_at` works. Any time-window query (Phase 4 caps, "items in last 24h") must use `updated_at` until fixed.
- **Bug 3 (MEDIUM).** YouTube ingest is decoupled from `LifestyleSources`. The 19 YOUTUBE_CHANNEL rows in `LifestyleSources` are orphaned data. Caps applied via `LifestyleSources.daily_item_cap` will not affect YouTube unless refactored.
- **Bug 4 (suspected).** True source ingestion mix is unclear because the deep-dive sorted by `updated_at`, which reflects re-summarize not first-ingest. Psychology Today's apparent 35-49% dominance may be re-touch noise, not real flow.
- **Content quality.** Books with dead "Read more" destinations; News tab sparse; videos where the app-side summary describes longer content than the YouTube Short actually contains; automations failing partial-write.
- **Listen pipeline.** 0 podcast rows, 0 TikTok rows. Sessions chip mixes four content types under one label.

### 7.4 Future: standards verifier / content auditor agent
The user has explicitly requested a lean replacement for the deleted `godAgent` — a `content_auditor` that runs on every ingest and flags brand-voice drift, emoji codepoints, dead links, summary/duration mismatch, and source dominance imbalances. See memory `project_femwell_standards_verifier.md`. **Not built.** Scheduled for a later MP after the Phase 4-A pipeline fix ships.

---

## 8. Paid + Commerce

The £1M sale story needs three rails, not one. As of 2026-05-13 we have shipped or designed all three.

### 8.1 Subscription — FemWell Plus
**Price.** £8.99/mo (live), £79/yr planned.
**What it unlocks.** Atelier Reading monthly letter (the long-form Astra Cole letter, locked on free); Pro features in Programs (PCOS / PMDD / Peri / Meno-Pro programs are Pro-locked); Cycle Settings advanced (custom cycle length, irregular-cycle mode); future TTC Mode (free for clinician-led Care-Bridge-active users); Skin & Hair encrypted timeline (Q3/27); Sessions Garden tab (Q1/27).
**Status.** Stripe wired. `Entitlements.plan` flag drives the unlocked state.

### 8.2 One-shot purchases (shipped 2026-05-13)
- **£19 Year Ahead PDF.** A personalised year-ahead reading signed by Astra. PDF generator queued in `deliverOneShot` orchestrator phase but generator itself is H3 work.
- **£29 Birth Chart Atelier.** A full natal-chart reading.
- **£55 Choose The Day.** An electional service — pick the auspicious date for a launch / wedding / signing / interview. Three days delivered, with Astra's reasoning.

All three have UI live with simulated checkout when `STRIPE_*` env price IDs are unset; `stripeWebhook` handles the three SKUs and writes `OneShotPurchase.status = 'paid'`. **Status:** UI shipped; real Stripe price IDs need to be wired in the env config (not code) to flip from simulated to live.

### 8.3 B2B — Care Bridge clinician portal
**Concept.** Desktop-only, read-only, single-patient-per-session, async-note-only, 14-day hard-expire portal where a UK clinician (GMC-verified) can see the patient's HRT timeline, Flash heat-map, and symptom trajectory, and leave an async note. UK GDPR + DPA 2018 compliant. Single-patient render contract — no batch endpoint, no "get_all_user_data" function.
**Revenue model.** Per-clinician-seat subscription (priced higher than consumer, e.g. £25-50/mo per clinician) or per-patient-window fee. Not yet priced.
**Status.** Designed, not shipped. Q3/26 launch target with London endo cohort ≤30 (King's + UCLH partners). Long-lead item: NHS Digital partner-agreement for e-Referral deep-links.

### 8.4 Future revenue lanes (signalled, not built)
- Book deal — The Long Room's 30-chapter arc has clear book-of-the-app potential.
- Partnership royalty — a Mooncup / Daye / Wild AI / NHS-trust co-branded surface.
- Care Bridge international (Ireland MC / US AMA / CA CPSO / AU AHPRA) — Q2/27.
- Family-gathering planner Pro add-on (Q2/27 — multi-faith, UK calendar-aware).

---

## 9. £1M Sale Path — What Makes This Saleable

A £1M acquisition price needs three things to be true at diligence: (a) a category position with a defensible thesis, (b) defensibility that an acquirer can see and measure, (c) more than one revenue rail. FemWell has all three on paper; the work of the next 6-12 months is to make them visible.

### 9.1 Category position
UK women's wellness is a crowded category but a stratified one. **Flo** owns the global mass-market with 380M+ downloads and a Series C raise; their app is feature-rich but visually generic and tone-bland. **Clue** owns the European mid-market with a clinical-research moat; their UI is clean but minimalist to the point of editorial absence. **Stardust** owns the cycle + astrology cross-over, but the astrology is shallow and templated. **Pattern** + **Co-Star** own algorithmic astrology with no cycle layer. **Wild.ai** owns the athletic angle, smaller TAM. **MyLittleEden** is the closest UK direct comparator but has slipped in profile. **Hormona** is early-stage and hardware-adjacent.

FemWell's category position is: *the only product that ships cycle + content + named-astrologer astrology + journal under one UK-anchored editorial brand with no scoreboards.* That sentence is not yet on the home page. It needs to be.

### 9.2 Defensibility
Three moats — content, data, brand.
- **Content moat.** 30 chapters of original fiction (The Long Room) + Daily Story Kindle reader is genuinely category-original. Horoscope's asteroid astrology + Annual Profections + Red/White Moon classifier + Atelier Reading paywall are also category-original (research v2 §2 found nobody else ships these). A scraper-built clone cannot reproduce the editorial voice without paying someone.
- **Data moat.** The cycle × content × astrology × journal × Pulse × Programs × Sealed Letters cross-product is the actual machine. After 6 months of consistent use, a user's Living Wisdom feed + Phase Twin pairings + Cycle Mirror + smart-save phase library is not portable to any other product. The switching cost is measured in months of accumulated personal data — not in download buttons.
- **Brand moat.** Fraunces + Inter + cream-plum-rose-gold is the only women's wellness app in the UK that reads like a Sunday-supplement long-read instead of a Pinterest mood board. Astra Cole's named authorship + the planned UK clinician voices give the brand a face that templates and code-clones cannot reproduce.

### 9.3 Multiple revenue streams
Subscription (£8.99/mo Plus) + one-shots (£19 / £29 / £55, shipped) + B2B (Care Bridge, designed) + future (book deal, partnership royalty). At a £1M valuation against the typical 3-5x ARR multiple for consumer subscription apps, the implicit target is roughly £200-330k ARR, achievable at ~2,000-3,500 paying Plus subscribers + some one-shot velocity. That is a tractable 12-18 month target with a working app and a credible distribution plan. The distribution plan is the missing piece — see §11 Risks.

---

## 10. Sequenced Roadmap (next 6 months)

### Phase A — Close H2 follow-ups (1-2 weeks)
The Horoscope shipped this morning but five threads dangle. Close them.
- **Listen seed re-run for podcasts + TikTok.** MP — paste into base44 chat, re-run the seed crons, verify rows ≥ 30 each.
- **TikTok ingest emoji strip.** MP — add an emoji-codepoint scrubber to the TikTok title ingest path before write.
- **Sessions chip taxonomy cleanup.** MP — separate the four mixed content types under the Sessions label into distinct chips (or fold up under Listen sub-chips).
- **Test profile populate.** Generate a test user with ≥1 cycle of history + journal entries; verify OnThisDay, Friend6Months, PhaseInbox engagement cards render correctly.
- **Real Spotify URLs for moon-sign playlists.** Data MP — replace placeholder URLs in `TodaysWeather.jsx` static map with real Astra-curated public Spotify URIs.
- **Real Stripe price IDs for the three one-shots.** Env config in `Dashboard → Settings → Secrets` (not code) — flip from simulated to live.
- **Horoscope live walk.** Per `feedback_live_walk_after_every_build.md` — verification at mobile / tablet / desktop on `femwells.com`.

### Phase B — Ship the next big tab redesigns (4 MPs each max)
Order by **(impact-on-sale) × (1 / shipping-cost)**. Estimating both subjectively, the top five are:

1. **Profile v2** — sale-readiness top. Buyers land here. 4 MPs (Home + Connections + Seasons + Data + Practice).
2. **Today redesign (Pillars + Jess narrative hero)** — first thing a returning user sees. 3 MPs.
3. **Planner Phase 2-3** — already started (`6b2bfb0`), needs finishing. Tasks #192-#194 mentioned in the user's task list. 2-3 MPs to land Shape C smart-view retargeting.
4. **Settings v2** — Jess memory budget slider + UK regional accent toggles + accessibility. Mitigates the pattern-notes risks A (regional exclusion) and B (memory creep). 2 MPs.
5. **Onboarding v2** — first-impression critical for retention. 10-screen flow. 3 MPs.

After top 5: Sessions, Skin & Hair, Life Stage, Community v2, Journal v2, Panic Mode, Explore v2.

### Phase C — Engagement layer build-out
The cross-cutting features that aren't shipped yet, in dependency order:
1. **Echo Wall** (Q2). Foundation — must accumulate ≥30 days of entries before Living Wisdom can surface.
2. **Cycle Mirror** (Q2). Lives in Journal v2; depends on the v2 build.
3. **Witness Mode** (Q3). Depends on Echo Wall.
4. **Living Wisdom surfacing** (Q3-Q4). Depends on Echo Wall + 90-day lockout window.
5. **Phase Twin** (Q4). Depends on Witness's 3-strike infra.

### Phase D — Pre-sale polish
- **A11y final pass** (Ms Accessibility) — WCAG 2.1 AA. 44px tap targets, 4.5:1 contrast, reduced-motion variants, plain-language mode.
- **Perf final pass** (Mr Performance) — Lighthouse mobile ≥ 90; bundle audit; image lazy-load; route-level code-split.
- **Tracking instrumentation** (`product-tracking-skills`) — events + identity + group calls; produce a tracking plan; SDK wrapper functions; integration guidance.
- **DD pack assembly** (Ms Strategy) — one-pager, roadmap, competitive matrix, scorecard, DD pack, sale-readiness audit. Buyer-ready.
- **Brand voice consolidation** — 30+ demos compiled into one style guide; phrase bank for Jess; voice/tone rules for content authors.

---

## 11. Risks (honest)

**R1 — Single-operator shipping.** Halliburton ships everything alone via base44 builder + GitHub + Chrome MCP. A reviewer at sale time will ask: "what happens if you get hit by a bus?" Needs CI gates + a test suite (vitest reader regression gates exist but are narrow), and a written runbook for the build-publish-verify loop. Mr Tester role exists in the agent roster; needs to be dispatched at every MP exit gate.

**R2 — LLM-content-heavy.** `generateHoroscopeReading`, `draftAtelierLetter`, `goddess_read`, `weather_energy`, `weather_mood`, the For You ranker, the article expandContent prompt — these all call out to LLMs. Moderation risk and brand-voice drift risk are real. The content auditor agent (memory `project_femwell_standards_verifier.md`) is the planned mitigation, but it isn't built.

**R3 — Astra Cole authorship.** This is positioning, not contracted. If buyers check, they will find no contracted MA/FAS astrologer named Astra Cole. The brand voice is internal-AI-generated. Legal cover: never claim qualifications she does not have ("trained in the London School of Astrology tradition" per A2 must be factually true — the user has not yet engaged a real astrologer). Same risk applies to "Dr Siobhan Jenkins GMC 6115847 NHS GP" in Profile and "Dr Aisha Patel GMC 7421903 King's College Hospital" in UK-local — these are placeholders. Diligence will catch them.

**R4 — Skyfield deferred.** Real Swiss Ephemeris is H3 territory and the current Horoscope math is deterministic-estimator-based (asteroid signs, profections, red/white moon). Per D2 in `H2_DECISIONS.md`, the Atelier card says "Backed by Astra Cole, MA, FAS" not "Backed by Skyfield." An astrologically literate user can catch the difference. Mitigation: ship real ephemeris before sale diligence or accept the tradeoff and document it.

**R5 — Pipeline silent breakage.** ingestRSS skipping every source (Bug 1), `created_at` null on every row (Bug 2), YouTube decoupled (Bug 3) all went undetected for unknown duration. The Phase 4-A pipeline-fixup MP is pending and gates Phase 5-A UK source expansion. A content auditor agent is the structural fix; in the meantime, manual weekly sampling.

**R6 — Memory contradictions.** Reading the memory index revealed several stale notes — flagged here:
- `project_femwell_app.md` is 22 days old and still describes some entity counts loosely.
- `project_femwell_design_status.md` is 22 days old and lists Sessions, Skin & Hair, Life Stage, Profile, Settings, Onboarding, Panic, Explore v2 all as "Awaiting sign-off" — but the wider design refresh has paused on these while Horoscope shipped; the design status should be updated to "demo signed off, build pending."
- `project_femwell_roadmap_brainstorm.md` still lists slot #6 as "Naija-local layer" — has been corrected in the demo (`femwell_uk_local_demo.html`) and in `feedback_femwell_is_uk.md`, but the brainstorm itself wasn't rewritten. Drift hazard.
- `project_femwell_content_pipeline_broken.md` (2026-05-06) declared a "hard gate: no more Lifestyle visual MPs until pipeline audited" — H2 shipped anyway today (2026-05-13). Either the gate was lifted (and not recorded), or the gate was bypassed (and should be re-recorded). Worth confirming with the user.
- `project_femwell_phase25_verify_tomorrow.md` ("TOMORROW: verify Phase 2.5") — date is unclear; should be surfaced and resolved.

**R7 — Distribution.** £1M valuation needs ~2,000-3,500 paying subscribers. The current go-to-market plan is implicit, not explicit. SEO content (longreads on cycle + perimenopause), TikTok creator partnerships, Instagram editorial, NHS partner outreach, podcast tour are all plausible — none are scoped. Without a distribution plan the rest of this roadmap is shadow-boxing.

**R8 — Single-app concentration on base44.** base44 was acquired by Wix in June 2025 for $80M. If Wix sunsets base44 or changes the pricing model, FemWell would face a code-portability migration. The repo at `github.com/HalliburtonOji/femwell.git` mitigates this somewhat (the React/Vite frontend is portable; the base44 SDK and entity schema would need replacing). Worth a paragraph in the DD pack.

**R9 — Cycle-syncing strong-claim trap (captured 2026-05-13, surfaced by Ms Deep Search in Planner research).** Building the Planner (or any cycle-aware copy across the app) as a *prescriptive* physiology claim — "luteal = rest, follicular = brainstorm, ovulation = pitch, period = retreat" — is indefensible at DD. The 2020 McNulty meta-analysis found trivial effect sizes across cycle phases and explicitly stated *"general recommendations could and should not be made."* The 2025 Pfender critical-feminist analysis showed TikTok cycle-syncing content rarely cites evidence. A clinician on the buyer's side will flag this in five minutes. **Mitigation (binding):** ship the *soft version* — phase-aware as a permissive lens, not a prescriptive rule. Every Planner copy line that touches phase must pass a permissiveness audit (invitations not imperatives, probabilistic not deterministic claims, the user's own data leading not population averages). Apply this rule to the Planner build, Today phase strip, Lifestyle For You phase chooser, Horoscope, Smart Nudges, Rituals — everywhere phase informs language. See `claude-state/research_planner_2026-05-13.md` §8.

---

## 12. Open Questions — answered 2026-05-13

User's locked answers below. Anything not explicitly answered stays open and surfaces here on the next review.

1. **★ Phase B priority — Profile vs Planner?** → **Planner.** Tasks #192-#194 already in flight. Profile slots later in Phase B sequence.
2. **★ Atelier Reading monthly letter — human-signed-off or AI-final?** → **AI-final for now, pivot later.** No human-in-the-loop bottleneck. Implication for follow-up MP: change `draftAtelierLetter` to write `draft: false, published_at: now()` so the user-facing "Awaiting Astra's sign-off" banner never renders. Operator panel stays in case of future curation. Logged in `H2_DECISIONS.md` D6 (to be added).
3. **★ £1M sale timeline?** → **User delegated to me.** Locked aim: **6 months from today** (target 2026-11-13) with a **9-month soft cap** (2027-02-13). Implication: Phase D pre-sale polish (a11y / perf / tracking / DD pack) starts in parallel with Phase C engagement-layer build, not after, so the runway lines up.
4. Hiring before sale or solo + AI? → **Solo + AI** (implied by #2 answer; locked).
5. TTC Mode launch or post-sale? → **Post-sale** (not in 6-month plan unless promoted on a later review).
6. Care Bridge B2B clinician portal — sales channel or aspirational? → **Aspirational diligence-pack material** for now. No active King's / UCLH outreach this window.
7. **★ Lift the content-pipeline hard gate?** → **Lifted, 2026-05-13.** H2 shipped on top of it without anything exploding; the gate is no longer in force. Pipeline fixes (Listen Seed, ingestRSS field-mismatch, created_at, Sessions taxonomy) become Phase A items, not blockers. `project_femwell_content_pipeline_broken.md` is updated to record the lift.
8. Skyfield / real ephemeris timeline? → **Deferred indefinitely.** H3 territory. Astra Cole MA FAS attribution (D2 from H2) is the cover until then.
9. Real Stripe price IDs for one-shots? → **Simulated is acceptable for now.** Wire when first real customer signals demand.
10. Content auditor agent (`project_femwell_standards_verifier.md`)? → **Phase A item.** Builds confidence in the pipeline ahead of the next visual MPs. Slot after Listen Seed re-run.

### Open at next review
- Will the Atelier letter eventually need a contracted human astrologer for the "Astra Cole, MA, FAS" credentials claim to hold up at DD? (Legal risk R3 — re-ask before sale window opens.)
- Does Planner build need to fold any of the engagement-layer features (Rituals, Smart Nudges) or stay scoped to calendar + retargeting?

---

## 13. Source Materials Referenced

### Memory (read in full)
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/MEMORY.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_app.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_design_status.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_lifestyle_architecture.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_h2_shipped.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_2026-05-11_state.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_roadmap_brainstorm.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_content_pipeline_broken.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_pipeline_hidden_bugs.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/project_femwell_phase25_verify_tomorrow.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/feedback_femwell_is_uk.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/feedback_no_emoji_in_femwell.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/.auto-memory/feedback_femwell_multiplatform.md`

### Specs + decisions (read in full or skimmed)
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/research_base44_platform.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/horoscope_v2_spec.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/H2_DECISIONS.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_strategic_synthesis.md`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_2026_2028_ship_sequence.md`

### Demos (referenced by name; opened selectively)
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_horoscope_v2_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_today_demo.html` (+ three concept variants)
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_lifestyle_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_nutrition_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_pulse_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_planner_final.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_programs_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_community_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_journal_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_journal_community_v2.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_jess_v2_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_sessions_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_skin_hair_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_life_stage_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_profile_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_settings_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_onboarding_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_panic_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_explore_v2_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_care_bridge_v2_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_partner_sync_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_living_wisdom_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_rituals_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_smart_nudges_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_offline_retreat_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_ttc_mode_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_uk_local_demo.html`
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_garden_seasons_library.html` (asset)
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_jess_hero_variants.html` (asset)
- `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_component_library.html` (asset)

### Git
- `github.com/HalliburtonOji/femwell.git` — last 60 commits inspected; specific commits cited inline (`8e915ee`, `b62ed7d`, `36def9f`, `6b2bfb0`, `8ab89e7`, `a20f8f4`, `f234be3`, `8717da6`, `88b4231`, `cbe3e54`, `5cbc399`, `787e638`, `96385a5`, `8d8d5dd`, `dd5eec9`).

---

_End of master plan. Anchored to £1M sale by giving every later MP, sprint, and sale-deck slide a single source of truth that maps live state to designed state to commercial outcome. Next deliverable: the one-pager at `workspace/strategy/onepager_2026-05-13.md` derived from §0 + §9._
