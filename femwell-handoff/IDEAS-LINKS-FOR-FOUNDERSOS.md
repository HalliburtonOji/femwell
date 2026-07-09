# IDEAS LINKS — plan/brainstorm docs to keep wired into FoundersOS (IDEAS pill)

> Per CLAUDE.md Standing Rule #1: every plan/brainstorm ships as a phone-readable styled-HTML doc to `C:\Users\Halli\femwell-handoff\` **and** is linked into the FoundersOS "Ideas" page so Halli reaches it via the floating IDEAS pill (never a dead route).
> Mechanism (established): copy the HTML into `src/components/founders/brandDocs/<slug>.html`, `import …?raw` in `FoundersOS.jsx`, add a `{ kind:"doc", key:"…" }` CATALOG entry, and a `{tab === "…" && <BrandDocFrame html={…} title="…" />}` render branch. Then build + `npx base44 site deploy -y`.

## ⭐ TO WIRE — Personal Flora Identity ("Bloomprint") brainstorm + DEMO (2026-07-08, flora session) → Ideas → Current
> Deep brainstorm for Halli's "make each user feel UNIQUE" feature: a personal signature flower + garden that grows with real activity, gently-earned petals/rare-blooms/stars/seasons (collection not score, additive-only, never grindy), her anonymous-but-unique presence in Community (3 disclosure tiers — veiled/my-flower/named — reconciled with the botanical-alias system), and her Profile/Today/Garden avatar. Built ON the existing companion + milestones + chapters + Meadow. Doc + a live demo BOTH need wiring. This flora session can't safely edit `FoundersOS.jsx` — please wire.
>
> **Two entries** — a DOC and a ROUTE (the route needs only ONE catalog line; no import/render branch).

**(a) The brainstorm DOC** — phone HTML in `femwell-handoff/PERSONAL-FLORA-IDENTITY.html`; copied to `brandDocs/personal-flora-identity.html`.

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| PERSONAL-FLORA-IDENTITY.html | personal-flora-identity.html | "Bloomprint" | Current | sage |

Wiring (3 edits):
- import: `import bloomprintHtml from "@/components/founders/brandDocs/personal-flora-identity.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Bloomprint", group: CAT.CURRENT, sub:"Identity & garden", status:"new", accent:"sage", title:"Your Bloomprint — personal flora identity", desc:"Deep brainstorm: each woman's signature flower + garden that grows with real activity; gently-earned petals/rare-blooms/stars/seasons (collection not score, additive-only, never wilts); her anonymous-but-unique presence in Community across 3 disclosure tiers (veiled/my-flower/named) reconciled with the Talk-rooms botanical alias; and her Profile/Today/Garden avatar. Identity model + earning mechanics + anonymity reconciliation + kind-growth guardrails + mockups + phased build plan + open questions. Built ON the existing companion + milestones + chapters." }`
- render branch: `{tab === "Bloomprint" && <BrandDocFrame html={bloomprintHtml} title="FemWell — Your Bloomprint: the personal flora identity" />}`

**(b) The DEMO route** — `/BloomprintDemo` (already registered in `pages.config.js` + `src/pages/BloomprintDemo.jsx`). Add ONE catalog entry to Ideas → **Current**:
> `{ kind:"route", href:"/BloomprintDemo", group: CAT.CURRENT, status:"new", accent:"sage", title:"Bloomprint — identity ★", desc:"Tappable demo of the personal flora identity: her signature-bloom hero (species+colour+stage, tinted with her fingerprint colourway), the four identity facts, all four earned layers (petals with a working 'leave a line → +1 petal', rare-bloom shelf, stars, seasons), the 3 Community tiers (tap Veiled/My-flower/Named to switch the post's face), cross-pollination teaser, Profile+Today avatar previews, and the kind-growth promise. Reads REAL Garden data (companion + milestones + chapters) with a seeded fallback; read-only, no writes; live pages untouched." }`
> Verified: clean vite build 0 errors · renders on preview (1161 gradient petal paths, no blanks) · tier toggle switches the post identity · 'leave a line' increments petals correctly (fixed a stateful-seededRng-in-render drift). Live via `npx base44 site deploy -y`.

## ⭐ TO WIRE FIRST — Universal Calendar + Logger plan doc (2026-07-05, content session) → Ideas → Current
> Deep brainstorm+plan for Halli's app-wide change: ONE universal calendar everywhere (replacing the OLD photo-bg `MonthlyCalendarCard.jsx`), the calendar icon replacing the "+" FAB as the single logging entry, tap-a-day-to-log with date/time prefill, Planner time-slot prefill, and a rebuilt log sheet. Plan only — no live calendar/logger code changed. Phone HTML in `femwell-handoff/UNIVERSAL-CALENDAR-LOGGER.html`; copied to `brandDocs/universal-calendar-logger.html`. Content session can't safely edit `FoundersOS.jsx` — please wire (3 edits, pattern below).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| UNIVERSAL-CALENDAR-LOGGER.html | universal-calendar-logger.html | "Universal Calendar" | Current | gold |

Wiring (3 edits):
- import: `import universalCalendarHtml from "@/components/founders/brandDocs/universal-calendar-logger.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Universal Calendar", group: CAT.CURRENT, sub:"Calendar + logger plans", status:"new", accent:"gold", title:"Universal Calendar + Logger", desc:"One universal cream/flora/oxblood calendar everywhere (replaces the OLD photo-bg month grid + 3 other one-off calendars); the calendar ICON replaces the + FAB as the single logging entry; tap a day to log for that day (date prefilled, editable); Planner time-slot prefills date+time; general 'Log for today' button vs day-specific flow; rebuilt opaque log sheet keeping every capability (meals/water/mood/symptom/note/habit/med/event + OFF/scan/voice/photo). Deep brainstorm w/ options+recommendations+mockups. Plan only." }`
- render branch: `{tab === "Universal Calendar" && <BrandDocFrame html={universalCalendarHtml} title="FemWell — One Universal Calendar + Logger" />}`

### ⭐ ALSO — the DEMO route for the above (built + live 2026-07-05, Halli's 5 decisions applied)
> `/UniversalCalendarDemo` — the tappable/testable demo of the whole flow (built on the plan). Seeded, NO base44 writes; live pages/logger UNTOUCHED. **It's a ROUTE** (resolves via `pages.config` — already registered), so it needs only ONE catalog entry (no import / no render branch). Add to Ideas → **Current**:
> `{ kind:"route", href:"/UniversalCalendarDemo", group: CAT.CURRENT, status:"new", accent:"gold", title:"Universal Calendar — demo ★", desc:"Tappable demo of the one-calendar system: calendar ICON top-bar-right entry (no + FAB), one cream/flora/oxblood FwCalendar, 'Log for today', tap PAST/TODAY → LOG (all types) / FUTURE → PLAN (retrospective health blocked, gate by data type), Planner time-slot → date+TIME prefill, rebuilt LOG/PLAN modal (Voice+Type primary, Photo secondary w/ library pick). PLUS: one-flow 'run/plan the whole day' (sectioned, skippable, one save) + smart Photo→schedule (reads a rota screenshot → reviewable plan entries; extends the existing analyzeMealPhoto vision fn, no new function/key)." }`
> Verified live on femwells.com (Browser 1): route 200 · PLAN-gate blocks health logging on future days · LOG shows all types on past days · Planner 10 AM slot → "Tue 7 Jul · 10:00" prefilled · Voice/Type primary + Photo library pick · one-flow captures across sections + one save drops dots on the day. NOTE: the Photo→schedule live OCR parse needs an AUTHENTICATED session (Browser 2 / on-device) — this session's browser was anonymous so the vision call returns the fn's own 503 auth-guard (request reaches the extended fn; parse pending authed verify).

## ⭐ TO WIRE — Calendar Sync (Google + Apple) research+plan doc (2026-07-08, content session) → Ideas → Current
> Research + PLAN only (no integration built). Current state: FemWell has NO calendar sync of any kind (only community-event discovery via refreshEvents; only OAuth pattern is Stripe API-key; PlannerItems has no external_id/timezone). Doc covers: Google (OAuth + Calendar API, two-way), Apple (webcal/.ics one-way + CalDAV later), import vs export, Planner=two-way / Logger=export-opt-in, data-model deltas, edge cases (dupes/timezones/overnight/recurrence/revoke/GDPR), phased plan. **Flags the build gate clearly: needs a NEW base44 function + external OAuth creds + Google verification → Halli sign-off required before any build.** Phone HTML in `femwell-handoff/CALENDAR-SYNC-PLAN.html`; copied to `brandDocs/calendar-sync-plan.html`. Content session can't edit `FoundersOS.jsx` — please wire (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| CALENDAR-SYNC-PLAN.html | calendar-sync-plan.html | "Calendar Sync" | Current | plum |

Wiring (3 edits):
- import: `import calendarSyncHtml from "@/components/founders/brandDocs/calendar-sync-plan.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Calendar Sync", group: CAT.CURRENT, sub:"Calendar + logger plans", status:"new", accent:"plum", title:"Calendar Sync — Google + Apple (research + plan)", desc:"How the Planner + Logger could two-way sync with Google (OAuth + Calendar API) and Apple (webcal/.ics, CalDAV later). Current state = NONE. Import vs export, data-model deltas (external_event_id/source/tz + a CalendarConnection entity), edge cases (dupes/timezones/overnight/recurrence/revoke/GDPR), phased plan. GATED: needs a NEW base44 fn + external OAuth creds + Google verification → sign-off before build." }`
- render branch: `{tab === "Calendar Sync" && <BrandDocFrame html={calendarSyncHtml} title="FemWell — Calendar Sync (Google + Apple): research + plan" />}`

## Wired (in-app, reachable via IDEAS pill)
> CONSOLIDATED 2026-06-20: there is now **exactly ONE brand entry** ("Brand Bible"). The old "Living Ecosystem", "Brand Identity" and "Flora & Meaning" entries are **folded into it and removed** (`living-ecosystem.html` deleted; `BrandIdentityDoc.jsx`/`FloraMeaningDoc.jsx` unwired). The brand bible is edited IN PLACE — do not re-add parallel brand docs. Feature PLANS stay separate under Specs & Plans.
| Doc (phone HTML in femwell-handoff/) | in-app brandDocs slug | FoundersOS key | group |
|---|---|---|---|
| BRAND-BIBLE.html (the ONE consolidated bible) | brand-bible.html | "Brand Bible" | Brand identity |
| INTENTIONS-GOALS-BRAINSTORM.html | intentions-goals.html | "Intentions & Goals" | Specs & Plans |
| CONNECTION-DAYS-MISSIONS-BRAINSTORM.html | connect-days-missions.html | "Connect, Days & Missions" | Specs & Plans |
| (Per-Page Brand Audit, Bottom-Nav Plan) | page-brand-audit.html / component | "Page Brand Audit" / "Bottom-Nav Plan" | Specs & Plans |

## ⏳ TO WIRE — new LEVEL-UP plan docs (2026-06-29 planning phase)
> These are the next-2-levels plan docs for live pages. Halli wants each in the **Ideas pill → Current** group. The HTML is already copied into `brandDocs/`; the content session can't safely edit `FoundersOS.jsx` while you declutter it — please wire from here. (The original now-built `nutrition-plan.html` / `lifestyle-plan.html` entries can be moved to an "Archive/Built" group or retired — your call.)

| Doc (femwell-handoff/) | brandDocs slug | suggested FoundersOS key | group | accent |
|---|---|---|---|---|
| NUTRITION-LEVELUP.html | nutrition-levelup.html | "Nutrition +2" | Current | crimson |
| LIFESTYLE-LEVELUP.html | lifestyle-levelup.html | "Lifestyle +2" | Current | plum |
| HEALTH-PLAN.html | health-plan.html | "Health Plan" | Current | sage |
| COMMUNITY-PLAN.html | community-plan.html | "Community +2" | Current | crimson |

### ⏳ Batch 2 — per-page LEVEL-UP plan docs (2026-06-29, content session producing one at a time)
> Same template as Nutrition/Lifestyle +2. Each is a deep-research, per-page plan for going DEEPER on the live-elite pages. HTML copied into `brandDocs/`; wire each from here (3 edits each, pattern below).
| Doc (femwell-handoff/) | brandDocs slug | suggested FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-PLAN.html | community-plan.html | "Community +2" | Current | crimson |
| PULSE-PLAN.html | pulse-plan.html | "Pulse +2" | Current | plum |
| DOCTOR-EXPORT-PLAN.html | doctor-export-plan.html | "Doctor Export +2" | Current | sage |
| PROGRAMS-PLAN.html | programs-plan.html | "Programs +2" | Current | plum |
| GARDEN-PLAN.html | garden-plan.html | "Garden +2" | Current | sage |
| JESS-PLAN.html | jess-plan.html | "Jess +2" | Current | crimson |

**Batch 2 COMPLETE (all 6):** Community · Pulse · Doctor Export · Programs · Garden · Jess — each a deep-research per-page level-up plan, HTML in femwell-handoff/ + brandDocs/, ready to wire into FoundersOS Current group.

---
## 🟢 BATCH 2 — LEVEL-UP DEMOS (approved → demo-first; LIVE pages untouched) — wire these as `kind:"route"` in Current
> Halli approved the plans → these are the buildable DEMOS applying each plan's +1/+2 features on the page's elite card language. Non-gated features are real/seeded; gated ones are clearly-labelled "needs sign-off" stubs. Reachable via IDEAS pill once wired.

| Demo route | applies plan | catalog (kind:"route") | group |
|---|---|---|---|
| `/NutritionL2Demo` | nutrition-levelup.html | `{ kind:"route", key:"Nutrition +2 DEMO", href:"/NutritionL2Demo", group: CAT.CURRENT, status:"new", accent:"crimson", desc:"Nutrition +2 demo — composite real-meal accuracy, ED-safe numbers-off, cook-video log, condition watch-lists, GLP-1 guardian, share-to-table (photo→macros = labelled gated stub)" }` | Current |
| `/LifestyleL2Demo` | lifestyle-levelup.html | `{ kind:"route", key:"Lifestyle +2 DEMO", href:"/LifestyleL2Demo", group: CAT.CURRENT, status:"new", accent:"gold", desc:"Lifestyle +2 demo — fed players (LibriVox audio + embedded video + Standard Ebooks + TTS), awe/make/rest/joy evidence lanes, kept-intentions read-back, learn/lounge/library-card, sanctioned-rest spine (auto verify-sweep = labelled gated stub)" }` | Current |
| `/HealthLettersDemo` | health-plan.html | `{ kind:"route", key:"Health letters DEMO", href:"/HealthLettersDemo", group: CAT.CURRENT, status:"new", accent:"crimson", desc:"Health demo — the 7 beloved letters as sliding cards (letter + Jess line + key-facts + GP-prep/Ask-Jess/red-flag actions), hub growth (heart-health + endo/PCOS/fibroids/PMDD), safe-by-design screening/red-flags, Health→Pulse→Doctor-Export loop, privacy-as-feature" }` | Current |
| `/CommunityL2Demo` | community-plan.html | `{ kind:"route", key:"Community +2 DEMO", href:"/CommunityL2Demo", group: CAT.CURRENT, status:"new", accent:"crimson", desc:"Community +2 demo — expert-verified answers + Ask-the-NHS-clinician AMA, no-post-unanswered first-responder, intergenerational mentorship, life-stage rooms, healthy me-too reactions, mute-keywords, OSA-2023 spine (moderated DM · local/IRL bridge · live audio = labelled gated stubs)" }` | Current |

**Batch-2 DEMOS COMPLETE (this set of 4):** /NutritionL2Demo · /LifestyleL2Demo · /HealthLettersDemo · /CommunityL2Demo — all live (HTTP 200), demo-first, live pages untouched, gated features labelled. Ready for FoundersOS Current wiring.

Route demos only need the CATALOG `kind:"route"` entry (the `href` resolves to the live route after `npx base44 site deploy -y`) — no import / no render branch needed (unlike the doc entries above).

Jess render branch: `{tab === "Jess +2" && <BrandDocFrame html={jessPlanHtml} title="FemWell — Jess Level Up (+2)" />}` · import `import jessPlanHtml from "@/components/founders/brandDocs/jess-plan.html?raw";` · desc "Jess — next-2-levels plan (women-tuned guideline grounding, anti-sycophancy, hardened crisis rails, transparent memory, talk-to-Jess everywhere)".

Garden render branch: `{tab === "Garden +2" && <BrandDocFrame html={gardenPlanHtml} title="FemWell — Garden Level Up (+2)" />}` · import `import gardenPlanHtml from "@/components/founders/brandDocs/garden-plan.html?raw";` · desc "Garden — next-2-levels plan (responsive never-dies companion, felt-that ledger, self-compassion reflection, WOOP goals, collective kindness garden)".

Programs render branch: `{tab === "Programs +2" && <BrandDocFrame html={programsPlanHtml} title="FemWell — Programs Level Up (+2)" />}` · import `import programsPlanHtml from "@/components/founders/brandDocs/programs-plan.html?raw";` · desc "Programs — next-2-levels plan (Jess guide/cohorts/catch-up/habit graduation/PROMs/whole-life breadth)".

Doctor Export render branch: `{tab === "Doctor Export +2" && <BrandDocFrame html={doctorExportPlanHtml} title="FemWell — Doctor Export Level Up (+2)" />}` · import `import doctorExportPlanHtml from "@/components/founders/brandDocs/doctor-export-plan.html?raw";` · desc "Doctor Export — next-2-levels plan (condition templates + validated PROMs, symptom timeline, red-flag→NHS net, post-appointment loop)".

Pulse render branch: `{tab === "Pulse +2" && <BrandDocFrame html={pulsePlanHtml} title="FemWell — Pulse Level Up (+2)" />}` · import `import pulsePlanHtml from "@/components/founders/brandDocs/pulse-plan.html?raw";` · desc "Pulse page — next-2-levels plan (own-median predictions, correlation engine, anomaly→NHS flag, wearable import)".

Wiring per Batch-2 doc (3 edits each): e.g. `import communityPlanHtml from "@/components/founders/brandDocs/community-plan.html?raw";` · a `{ kind:"doc", key:"Community +2", group: CAT.CURRENT, status:"new", accent:"crimson", desc:"Community page — next-2-levels plan (trust layer, moderated DMs, IRL bridge, OSA compliance)" }` CATALOG entry · a `{tab === "Community +2" && <BrandDocFrame html={communityPlanHtml} title="FemWell — Community Level Up (+2)" />}` render branch.

Wiring per doc (3 edits each): `import nutritionLevelupHtml from "@/components/founders/brandDocs/nutrition-levelup.html?raw";` · a `{ kind:"doc", key:"Nutrition +2", group: CAT.CURRENT, status:"new", accent:"crimson", … }` CATALOG entry · a `{tab === "Nutrition +2" && <BrandDocFrame html={nutritionLevelupHtml} title="FemWell — Nutrition Level Up (+2)" />}` render branch. Then build + `npx base44 site deploy -y`.

## Notes for the FoundersOS session
- If I (a brand/feature session) add a new plan doc, I copy it into `brandDocs/` and wire it myself when `FoundersOS.jsx` is clean; if you hold the file, wire from this list.
- Keep the in-app `brandDocs/*.html` copies in sync with the latest femwell-handoff/ version when the content session updates a doc (the content session owns the HTML; you own the catalog wiring).

## ⏳ TO WIRE — LEVEL-UP DEMO ROUTES (2026-06-29, standalone preview pages, NOT BrandDocFrame docs)
> Halli approved the level-up plans → a DEMO route per page (applies the +1/+2 features on the page's elite design; gated features as labelled "Needs sign-off" stubs). These are **routes** (`kind:"route"`), add to FoundersOS Ideas → **Current**. Live pages UNTOUCHED. All HTTP 200. Routes resolve via pages.config, so each needs only ONE catalog entry (no import / render branch):
> `{ kind:"route", href:"/PulseL2Demo", group: CAT.CURRENT, status:"new", accent:"plum", title:"Pulse +2 — demo ★", desc:"own-median predictions + error bars, symptom forecasting, cross-life correlation engine (causation guardrails), this-cycle-is-different→NHS anomaly flag, anxiety-safe dial, clinician export→Doctor Export, year-in-patterns retrospective, wearable import stub (needs sign-off)" }`

| Demo route | FoundersOS key | accent | status |
|---|---|---|---|
| /PulseL2Demo | "Pulse +2" | plum | built · HTTP 200 |
| /DoctorExportL2Demo | "Doctor Export +2" | crimson | built · HTTP 200 — condition templates (NICE-mapped) · validated PROM (Greene/PBAC) · most-bothersome + Ask-3/BRAN · red-flag→NHS 2-week-wait · freq×severity timeline · plain↔clinical toggle · two-tier export · post-appointment loop · secure-share flagged not-recommended |
| /ProgramsL2Demo | "Programs +2" | sage | built · HTTP 200 — light Jess guide (day-1/wobble/graduation) · catch-up & rest no-guilt · programme→habit graduation · pre/post PROMs (ISI/GAD-7) · start-together cohorts + anonymous progress wall · whole-life journeys (money/dating/friendship/style/creative) · adaptive pacing · gated: push delivery + human coaching (needs sign-off) |
| /GardenL2Demo | "Garden +2" | crimson | built · HTTP 200 — responsive companion states + Jess dialogue (wilts softly, never dies) · "felt that" cross-surface emotional ledger · self-compassion/gratitude reflection prompts · WOOP/if-then/savouring goals · cyclical & seasonal tinting · garden-of-gardens + anonymous kindness acts + "we're tending today" presence · NO gated function (care-not-guilt rule) |
| /JessL2Demo | "Jess +2" | plum | built · HTTP 200 — guideline-anchored women's-health answers + honest uncertainty + "here's the NHS" · anti-sycophancy persona (warm but gently challenges) · hardened UK crisis hard-route (Samaritans 116 123 / Shout 85258 / NHS 111 / 999) · transparent user-editable memory · "talk to Jess" from every surface · Pulse-tied proactive noticing (consented) · voice-as-utility · CBT-style guided flows (support not treatment) · GATED: the women-tuned guideline-GROUNDING layer (RAG + model choice) — needs sign-off |

---
## ⏳ TO WIRE — CARD STYLES plan doc (2026-07-01, content session) → Ideas → Current
> A plan doc (BrandDocFrame, like the +2 plans) expanding our card-style library (bento · media-hero + carousel · category shelf · rich-stat · dismissible nudge · expandable · spotlight/stat-tile/letter). Phone HTML in `femwell-handoff/CARD-STYLES-EXPANSION.html`; copied to `brandDocs/card-styles-expansion.html`. Content session can't safely edit `FoundersOS.jsx` — please wire (3 edits). Feeds a bible §6.7.0 card-language update after Halli approves.

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| CARD-STYLES-EXPANSION.html | card-styles-expansion.html | "Card Styles" | Current | gold |

Wiring (3 edits):
- import: `import cardStylesHtml from "@/components/founders/brandDocs/card-styles-expansion.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Card Styles", group: CAT.CURRENT, sub:"Card language plans", status:"new", accent:"gold", title:"Card Styles — research + expansion", desc:"Expanded card-style library — bento mixed-size tiles · media/hero card + category carousel · category shelf · rich-stat card (progress ring + flora + inline actions + status badge + … menu) · dismissible suggestion card · expandable card · spotlight/stat-tile/letter — all adapted to our cream/flora/oxblood brand (not dark fintech). Cited research; live on-brand mockups. Plan only; feeds a bible §6.7.0 update after approval." }`
- render branch: `{tab === "Card Styles" && <BrandDocFrame html={cardStylesHtml} title="FemWell — Card Styles: research + expansion" />}`

---
## ⏳ TO WIRE — NUTRITION HERO tap-to-bloom brainstorm (2026-07-07) → Ideas → Current
> Short phone-readable brainstorm for merging the tap-to-promote interaction INTO the floral hero on /NutritionV2Demo (same flower, different bloom stage per tapped card). Phone HTML in `femwell-handoff/NUTRITION-HERO-BLOOM-TAP.html`; copied to `brandDocs/nutrition-hero-bloom-tap.html`. Already BUILT + live on /NutritionV2Demo — this doc records the model/rationale. Please wire (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| NUTRITION-HERO-BLOOM-TAP.html | nutrition-hero-bloom-tap.html | "Hero Bloom Tap" | Current | crimson |

Wiring (3 edits):
- import: `import heroBloomTapHtml from "@/components/founders/brandDocs/nutrition-hero-bloom-tap.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Hero Bloom Tap", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"crimson", title:"Nutrition hero — tap-to-bloom", desc:"Merges the tap-to-promote cards INTO the floral hero: the small cards become the hero's controller; tapping re-writes the header AND re-blooms the same flower to a different STAGE (bud → opening → full) + mood tint + companion. Recommended model + card→bloom map. Built + live on /NutritionV2Demo." }`
- render branch: `{tab === "Hero Bloom Tap" && <BrandDocFrame html={heroBloomTapHtml} title="Nutrition hero — one flower, blooming through the day" />}`

---
## ⏳ TO WIRE — FLORA HEADER redesign DEMO (2026-07-03) → Ideas → Current
> Halli: the flower header (`FwFloraHero`) looks **thin — one stem, sparse**, inside a **dashed ring**; wants it **fuller, like part of a plant/tree**, ring **removed**. This demo shows **6 fuller treatments** of the hero, each rendered with the **REAL bloom** (SSR'd `RichBloomV2` — same species, mood tint, companion bee) on the **real card chrome**, **no dashed ring**, and each **still reblooms on tap** (bud → full; tap a header). Halli picks one → it folds into `BRAND_IDENTITY.md` as the canonical flora hero. Phone HTML in `femwell-handoff/FLORA-HEADER-DEMO.html`; copied to `brandDocs/flora-header-demo.html`. This session must not edit `FoundersOS.jsx` — please wire (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| FLORA-HEADER-DEMO.html | flora-header-demo.html | "Flora Header" | Current | sage |

The 6 styles: **1 Gathered bouquet** (bloom + 2 companions + buds on a leaf fan) · **2 Blossoming branch** (a woody bough, bloom at a node) · **3 Little tree** (trunk + layered canopy, bloom nested in the crown) · **4 Foliage nest** (a fan of leaves cradling the bloom) · **5 Flowering bush** (a low mound, 3 blooms at different heights) · **6 Living wreath** (the removed ring reborn as a leafy vine around the bloom).

Wiring (3 edits):
- import: `import floraHeaderDemoHtml from "@/components/founders/brandDocs/flora-header-demo.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Flora Header", group: CAT.CURRENT, sub:"Brand + card language", status:"new", accent:"sage", title:"Flora header — fuller redesign (pick one)", desc:"6 fuller treatments of the flower header (FwFloraHero) — bouquet · branch · little tree · foliage nest · flowering bush · living wreath. No dashed ring; same real bloom (species + mood tint + companion bee); every style still reblooms on tap (bud→full). Pick one → folds into the bible as the canonical flora hero. Demo only." }`
- render branch: `{tab === "Flora Header" && <BrandDocFrame html={floraHeaderDemoHtml} title="FemWell — the flora header, fuller (redesign)" />}`

---
## ⏳ TO WIRE — FLORA HEADER · BLOSSOMING BRANCH variations (2026-07-03, follow-up) → Ideas → Current
> **Halli picked style 2 (the "Blossoming branch")** from the Flora Header demo above — "looks great but needs MORE." This follow-up demo focuses on that branch and brainstorms **6 richer variations**: more blooms & petals, more leaves framing the wood, a **bed of grass at the base** (grounded, not floating), and real depth. Each uses the **REAL bloom** (SSR'd `RichBloomV2` — same species, mood tint, companion bee/butterfly), **no dashed ring**, real card chrome, and **still reblooms on tap** (bud→full). Halli picks a variation → folds into the bible as the canonical flora hero. Phone HTML in `femwell-handoff/FLORA-BRANCH-DEMO.html`; copied to `brandDocs/flora-branch-demo.html`. Don't edit `FoundersOS.jsx` — please wire (3 edits). (This supersedes the multi-style "Flora Header" entry above as the active pick — you can keep or retire that one.)

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| FLORA-BRANCH-DEMO.html | flora-branch-demo.html | "Branch Header" | Current | sage |

The 6 variations: **1 Bough in bloom** (dense 3-bloom cluster + buds + leaves + grass at the foot) · **2 Arching garland** (an arc grounded on a grass bed) · **3 Grounded branch** (upright, rising from a full grass bed) · **4 Layered depth** (a soft back bough behind a crisp front branch) · **5 Blossom spray** (many smaller blooms + buds + a butterfly, a spring spray) · **6 Peony bough** (the fuller, many-petalled bloom for maximum petal richness).

Wiring (3 edits):
- import: `import floraBranchDemoHtml from "@/components/founders/brandDocs/flora-branch-demo.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Branch Header", group: CAT.CURRENT, sub:"Brand + card language", status:"new", accent:"sage", title:"Flora header — the blossoming branch, richer", desc:"Halli picked the branch → 6 richer variations: bough in bloom · arching garland · grounded branch · layered depth · blossom spray · peony bough. More blooms/petals, more leaves, grass at the base, real depth. Same real bloom + mood tint + companion; no dashed ring; still reblooms on tap. Pick one → canonical flora hero. Demo only." }`
- render branch: `{tab === "Branch Header" && <BrandDocFrame html={floraBranchDemoHtml} title="FemWell — the blossoming branch, richer" />}`

---
## ⏳ TO WIRE — FLORA HERO · REALISTIC BRANCH (2026-07-03, craft/realism pass) → Ideas → Current
> **Halli saw the rotating branch hero LIVE and it looks artificial** — flat/geometric sticks (his BAD example = the "Your day" hero, a thin awkward cross/Y stick; the "Health" hero = the CORRECT diagonal direction). New direction (supersedes the 6-orientation rotation): **ONE fixed diagonal bough** (lower-left → upper-right), **realistic tapered/curved bark with nodes**, believable **leaves on petioles**, grounded in **grass** — vary ONLY the **side twig** + the **flower**. This demo shows **5 realistic variations** (rose · peony · coral rose · magnolia · hibiscus) on the SAME bough, each with the **real `RichBloomV2` bloom**, **no dashed ring**, real card chrome, still **reblooms on tap** (bud→full) + mood tint + companion creature. Phone HTML in `femwell-handoff/FLORA-BRANCH-REALISM.html`; copied to `brandDocs/flora-branch-realism.html`. Don't edit `FoundersOS.jsx` — please wire (3 edits). **Once Halli picks, the realistic bough replaces the live rotation (`floraBranch.js`/`PageTop.jsx`) + folds into bible §6.8.**

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| FLORA-BRANCH-REALISM.html | flora-branch-realism.html | "Realistic Branch" | Current | sage |

The 5 variations (SAME diagonal bough; only the side twig + flower change): **1 Rose** (twig lifting up-left) · **2 Peony** (fuller petals, low offshoot) · **3 Coral rose** (warm, short crown twig) · **4 Magnolia** (cream, low bough) · **5 Hibiscus** (crimson heart-colour, forked twig).

Wiring (3 edits):
- import: `import floraRealismHtml from "@/components/founders/brandDocs/flora-branch-realism.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Realistic Branch", group: CAT.CURRENT, sub:"Brand + card language", status:"new", accent:"sage", title:"Flora hero — grown from a dusk meadow (realism)", desc:"Realism/craft pass: ONE fixed diagonal bough (tapered curved bark, real leaves) rising out of a researched DUSK WILDFLOWER-MEADOW patch — layered back grasses, yarrow (flat white umbels), cow-parsley lace, seed-grasses catching light, dense tuft at the foot, muted dusk palette. No dashed ring. Only the side twig + flower vary (5 flowers: rose/peony/coral/magnolia/hibiscus). Real bloom, still reblooms on tap + mood tint + creature. Pick one → replaces the live rotation. Demo only." }`
- render branch: `{tab === "Realistic Branch" && <BrandDocFrame html={floraRealismHtml} title="FemWell — the branch, done properly (realism)" />}`

---
## ⭐ TO WIRE — COMMUNITY: deep audit + REDESIGN plan (2026-07-08) → Ideas → Current
> Halli finds Community confusing — the rooms/chats/circles/clubs/corners feel disorganised. This is a **deep audit of the CURRENT Community IA** (mapped exactly as built) + a **clear redesign PLAN** on the canonical page structure (Nutrition template: flora hero → summary → sliding rows → clipboard shelves → one Jump map). **Plan-first — NO live Community code changed.** Core finding: Community uses 3 fuzzy grouping words (Rooms/Circles/Clubs) + shows the same places 4 different ways (door grid · daily-rotating slot · sticky tabs · Jump sheet); books lives in 4 places, creativity in 2. Fix = ONE hierarchy, FOUR named shelves (**Talk · Circles · Together · Quietly**), one map (hero switcher = clipboard boards = Jump sheet), rituals move into a swipeable "Today" deck instead of a lottery slot. Every feature KEPT + all safety rails untouched (18+, crisis check, anon posting, moderation, k-anon, no scoreboards). Phone HTML in `femwell-handoff/COMMUNITY-REDESIGN.html`; copied to `brandDocs/community-redesign.html`. This session didn't edit `FoundersOS.jsx` — please wire (3 edits). (Distinct from the existing "Community +2" FEATURE plan — this one is the STRUCTURE/IA fix.)

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-REDESIGN.html | community-redesign.html | "Community Redesign" | Current | crimson |

Wiring (3 edits):
- import: `import communityRedesignHtml from "@/components/founders/brandDocs/community-redesign.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Community Redesign", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"crimson", title:"Community — deep audit + redesign (clearer IA)", desc:"Halli finds Community confusing. Deep audit of the CURRENT information architecture (exactly as built) + a redesign PLAN on the canonical page structure. Diagnosis: 3 fuzzy grouping words (Rooms/Circles/Clubs) + the same places shown 4 different ways (door grid · daily slot · sticky tabs · Jump sheet); books in 4 places, creativity in 2; doors behave 3 different ways; Echo/Witness/Twin pretend to be Community but live in the Journal. Fix: ONE hierarchy, FOUR named shelves (Talk · Circles · Together · Quietly) on the Nutrition page language (flora hero → summary → Today sliding deck → clipboard shelves → one Jump map). Every feature kept, all safety rails untouched. Plan-first — no live change." }`
- render branch: `{tab === "Community Redesign" && <BrandDocFrame html={communityRedesignHtml} title="FemWell — Community: deep audit + redesign plan" />}`

---
## ⭐ TO WIRE — COMMUNITY REDESIGN DEMO (route) + TALK-ROOMS brainstorm (doc) (2026-07-08) → Ideas → Current
> Halli greenlit the 4-shelf redesign (Talk/Circles/Together/Quietly) AND raised the bar: each feature must be genuinely ROBUST, not an empty shell — built ONE FEATURE AT A TIME. **(A)** the Phase-1 redesign SHELL is built as a demo route `/CommunityRedesignDemo` (the real Community with the new canonical §6.8.2 home: flora hero + tap-to-rebloom shelf switcher, summary card, glance⇆Jess sliding row, clipboard shelf-boards, handy row; reuses EVERY existing feature view, all safety rails intact; live /Community untouched). **(B)** FEATURE #1 = the TALK ROOMS made robust IN the demo (botanical alias per anon hash · daily life-tinted room prompt · hide-a-voice · mute-a-word · per-room presence — real, safety-woven, demo-gated), with a deep-research brainstorm doc. Please wire BOTH.

### (A) The DEMO ROUTE (kind:"route" — resolves via pages.config, no import/render branch)
> `{ kind:"route", key:"Community Redesign — demo ★", href:"/CommunityRedesignDemo", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"crimson", title:"Community Redesign — demo ★", desc:"Phase-1 redesign SHELL on the canonical §6.8.2 page template: flora hero (bouquet = many women) + tap-to-rebloom shelf switcher (Talk · Circles · Together · Quietly) · summary card · glance⇆Community-Jess sliding row w/ upward inner sheet · clipboard slider of the 4 shelf-boards · handy row · resonance. Reuses every real feature (rooms/circles/clubs/library/games/echo/rituals). PLUS feature #1 = robust TALK ROOMS (botanical alias per anon hash · daily life-tinted room prompt · hide-a-voice · mute-a-word · per-room presence — real reads/writes). All safety rails intact (18+/crisis/moderation/report→hide/k-anon). Live /Community untouched." }`

### (B) The TALK-ROOMS brainstorm DOC (3 edits — import + kind:"doc" + render branch)
| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-TALK-ROOMS.html | community-talk-rooms.html | "Talk Rooms" | Current | sage |

- import: `import communityTalkRoomsHtml from "@/components/founders/brandDocs/community-talk-rooms.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Talk Rooms", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"sage", title:"Talk rooms — robust, safe & fun (feature #1)", desc:"Feature #1 of 6 in the Community robustness program. Deep-research brainstorm (Peanut/Elpha/Mumsnet/Yik-Yak lessons, SDT relatedness, OSA 2023, all cited) + what's BUILT this pass: botanical alias per anon hash · daily life-tinted room prompt · hide-a-voice · mute-a-word · per-room presence. Roadmap (safety floor: no-woman-unheard/rate-limit/thread-lock; then warmth: first-post bloom/weekly threads). Two gates flagged for Halli: age-assurance (Ofcom 'highly effective' bar) + women-only wording (post-For-Women-Scotland legal review)." }`
- render branch: `{tab === "Talk Rooms" && <BrandDocFrame html={communityTalkRoomsHtml} title="FemWell — Talk rooms: robust, safe & fun" />}`

---
## ⭐ TO WIRE — COMMUNITY FEATURE #2 = TOGETHER / EVENTS brainstorm (doc) (2026-07-08) → Ideas → Current
> Feature #2 of the Community robustness program: real EVENTS women can attend TOGETHER, made robust + SAFE, built INTO the Community redesign demo (Together shelf → Events). Deep-research brainstorm (Bumble/Meetup/Peanut/GGI safety, OSA 2023, API reality — all cited) + what's BUILT: browse/discover real events (EventsItems), ticket link-out + meet-safe interstitial, "I'm going" (device-local, PRIVATE), Save (SavedItems), bring-a-friend, report, verified/organiser trust signals, a numbered SAFETY MODEL (venue-level only · going-status private · public venues · tell-a-friend · trust signals · report · no in-app payment). GATED/flagged: who's-going + go-together PODS (new entity+fn), get-home-safe check-in, host verification, live external feeds (Ticketmaster+Skiddle only — Eventbrite/Meetup APIs are CLOSED). The build lives in `src/components/community/EventsTogether.jsx` (already shipped in the demo). Please wire the doc (3 edits). The demo route "Community Redesign — demo ★" (already listed above) now also surfaces Events.

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-EVENTS.html | community-events.html | "Events Together" | Current | crimson |

- import: `import communityEventsHtml from "@/components/founders/brandDocs/community-events.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Events Together", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"crimson", title:"Together / Events — robust & safe (feature #2)", desc:"Feature #2 of 6. Real events women attend TOGETHER, built into the Community demo (Together→Events). Browse/discover real EventsItems · ticket link-out + meet-safe interstitial · 'I'm going' (device-local, PRIVATE) · Save · bring-a-friend · report · verified/organiser trust · a numbered SAFETY MODEL (venue-level only, going private, public venues, tell-a-friend, no in-app payment). Cited research (Bumble/Meetup/Peanut/GGI, OSA 2023). GATED: who's-going + go-together PODS (new entity+fn), get-home-safe check-in, host verification, live feeds (Ticketmaster+Skiddle — Eventbrite/Meetup APIs closed). Real-now vs sign-off table inside." }`
- render branch: `{tab === "Events Together" && <BrandDocFrame html={communityEventsHtml} title="FemWell — Together / Events: robust & safe" />}`

---
## ⭐ TO WIRE — COMMUNITY FEATURE #3 = LIBRARY / BOOK CLUB brainstorm (doc) (2026-07-09) → Ideas → Current
> Feature #3: "attach a book, others talk about it" — a robust Library built into the LIVE Community (Together → The Library). Deep-research brainstorm (StoryGraph/Fable/Open Library/spoiler-locking, all cited) + what's BUILT: attach-a-book (LIVE Open Library search + manual + curated, on-brand flora covers), a personal shelf (Reading/Want/Finished, device-local v1), per-book DISCUSSION via the moderated readers'-corner (report/block "…" menu + aliases + background moderation), the season's read + spoiler-safe checkpoints + "I'm reading this too" (real ReadingActivity cohort), and whole-life discovery. No counts/goals/streaks; "Set aside" ethos. Reuses existing infra (BookClubPick/checkpoints/readers'-corner/ReadingActivity/BookReader) — nothing duplicated/stripped; reversible. GATED: persistent cross-device shelf = a new UserBook + Book cache entity (no external creds); Google Books deferred. Please wire the doc (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-LIBRARY.html | community-library.html | "Library Book Club" | Current | crimson |

- import: `import communityLibraryHtml from "@/components/founders/brandDocs/community-library.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Library Book Club", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"crimson", title:"Library / Book Club — attach a book, others talk (feature #3)", desc:"Robust Library in the LIVE Community (Together→The Library). Cited research (StoryGraph/Fable/Open Library/spoiler-locking). BUILT: attach-a-book (LIVE Open Library search + manual + curated, on-brand flora covers) · personal shelf Reading/Want/Finished (device-local v1) · per-book DISCUSSION via the moderated readers'-corner (report/block '…' + aliases + background moderation) · the season's read + spoiler-safe checkpoints + 'I''m reading this too' (real ReadingActivity cohort) · whole-life discovery. NO counts/goals/streaks; 'Set aside' not DNF. Reuses existing infra, reversible. GATED: persistent x-device shelf = new UserBook + Book cache entity (no external creds); Google Books deferred. CSP caveat: OL search degrades to manual if blocked." }`
- render branch: `{tab === "Library Book Club" && <BrandDocFrame html={communityLibraryHtml} title="FemWell — Library / Book Club: robust" />}`

---
## ⭐ TO WIRE — COMMUNITY: SAFETY PRINCIPLE + holistic TOGETHER shelf (2026-07-08) → Ideas → Current
> Two Halli corrections applied. **(A) SAFETY too in-your-face → reworked to "calm on the surface"** (proportionate, woven-in): backend moderation silent, report/hide tucked into a "…" menu, crisis contextual-only, disclaimers removed from the wall → one quiet Support corner. Retrofitted the Talk rooms + Events; set as the Community-wide principle every feature inherits. **(B) TOGETHER is holistic, not just events** — the whole "what you do together" shelf (rituals · read-along · challenges · daily game · watch-along · live circles · events). Built a real Together HUB in the demo. Both live in the redesign demo (`/CommunityRedesignDemo` → Together). Please wire BOTH docs (3 edits each).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-SAFETY-PRINCIPLE.html | community-safety-principle.html | "Safety Principle" | Current | sage |
| COMMUNITY-TOGETHER.html | community-together.html | "Together Shelf" | Current | crimson |

Safety Principle (3 edits):
- import: `import communitySafetyHtml from "@/components/founders/brandDocs/community-safety-principle.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Safety Principle", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"sage", title:"Community safety — calm on the surface", desc:"Halli: safety was too in-your-face (helpline on every post, disclaimers everywhere). New Community-wide principle: safe by design, calm on the surface — backend moderation silent, report/hide tucked into a '…' menu, crisis help contextual-only + one quiet Support corner, no disclaimer walls, meet-safe reminders in-context. Protection unchanged (moderation/crisis/report/k-anon/18+/in-person safety); only surface noise removed. Retrofitted to Talk + Events; every future feature inherits it." }`
- render branch: `{tab === "Safety Principle" && <BrandDocFrame html={communitySafetyHtml} title="FemWell — Community safety: calm on the surface" />}`

Together Shelf (3 edits):
- import: `import communityTogetherHtml from "@/components/founders/brandDocs/community-together.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Together Shelf", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"crimson", title:"The Together shelf — things we do together (feature #2, holistic)", desc:"Events was just one example — Together is the whole shelf: everything women DO together. Cited research (synchrony/collective-effervescence, the Wordle no-leaderboard lesson, anti-ghost-town structure). 7 pillars: weekly rituals · read-along · together challenges · daily game · watch-along · live circles · events. BUILT this pass: a real Together HUB (rotating 'this week together' shared moment w/ soft 'I'm in' + join-the-chat · pillar tiles deep-linking real surfaces · the REAL collective-pool aggregate + close-the-week inline). Async-first, aggregate 'we' not scoreboards, seeded so nothing shows zero. Next: a TogetherActivity entity+fn unlocks full challenges/read-along/watch-along; live circles = sign-off." }`
- render branch: `{tab === "Together Shelf" && <BrandDocFrame html={communityTogetherHtml} title="FemWell — the Together shelf: things we do together" />}`

---
## ⭐ TO WIRE — ENTITY AUDIT & REMOVAL PLAN (doc) (2026-07-09) → Ideas → Current
> Read-only deep audit of ALL 149 base44 entities: which are still wired into the app vs dead weight from an earlier era. Cross-referenced every entity name (whole-word) across `src` / `base44/functions` / `base44/agents`. Result: **149 total · 121 active (frontend) · 12 backend-only · 15 removal candidates** (13 with zero code refs, 2 superseded duplicates). Full ledger table (entity · class · used-where · recommendation) + tiered shortlists + a "back up before any deletion" gate. **NO deletions were made — Halli approves per-item first.** Live row counts are pending data-API access (the data MCP isn't connected + the platform deploy token 403s on reads). Please wire the doc (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| ENTITY-AUDIT.html | entity-audit.html | "Entity Audit" | Current | crimson |

- import: `import entityAuditHtml from "@/components/founders/brandDocs/entity-audit.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Entity Audit", group: CAT.CURRENT, sub:"Data hygiene", status:"new", accent:"crimson", title:"Entity Audit & Removal Plan — cull the dead weight", desc:"Read-only deep audit of all 149 base44 entities. 121 active (frontend) · 12 backend-only · 15 removal candidates: 13 with ZERO code refs (AnonymousSession, BookContentCache, ConditionProfiles, DailyAggregates, DayTaskOverrides, DealsProducts, DealsSources, DischargeLogs, EvidenceRefs, InsightSnapshots, MediaAssets, SexualHealthLogs, VoiceCache) + 2 superseded duplicates (CommunityPosts, Posts). Full ledger table + tiered shortlists + a back-up-before-deletion gate. Live row counts pending data access. NO deletions made — approve per-item." }`
- render branch: `{tab === "Entity Audit" && <BrandDocFrame html={entityAuditHtml} title="FemWell — Entity Audit & Removal Plan" />}`

---
## ⭐ TO WIRE — COMMUNITY FEATURE #4 = CIRCLES brainstorm (doc; build PAUSED for Halli) (2026-07-09) → Ideas → Current
> Deep-brainstorm for making Circles (life-stage / condition / interest cohorts) robust, warm + safe. Cited research (Peanut/Mumsnet/HealthUnlocked/PCOS study/JMIR misinfo review/ACM critical-mass). 7-pillar v1: seed every circle (never empty) · per-circle Jess host + no-post-unanswered · warm first-post welcome ("believed here") · per-condition NHS info anchor · "a few circles for you" whole-life discovery (condition circles last, never inferred from symptoms) · author-set content-warning veil · circle ritual of the week. Almost all buildable now on existing entities (CIRCLES catalogue, CircleMembership, circle-scoped CommunityPost, Jess, suggestedCircles) — only ONE small schema field needs sign-off (CommunityPost.content_warning); do NOT add a Circle entity. Build PAUSED for Halli's reaction to the prior 4-part pass. Phone HTML in femwell-handoff/COMMUNITY-CIRCLES.html; copied to brandDocs/community-circles.html. Please wire (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-CIRCLES.html | community-circles.html | "Circles" | Current | plum |

- import: `import communityCirclesHtml from "@/components/founders/brandDocs/community-circles.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Circles", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"plum", title:"Circles — robust cohorts (feature #4, brainstorm)", desc:"Making Circles (life-stage/condition/interest cohorts) robust, warm + safe. Cited research (Peanut/Mumsnet/HealthUnlocked/PCOS study/JMIR/ACM). 7-pillar v1: seed every circle (never empty) · per-circle Jess host + no-post-unanswered · warm first-post welcome ('believed here') · per-condition NHS info anchor · whole-life 'a few circles for you' discovery (condition circles last, never from symptoms) · author-set content-warning veil · circle ritual of the week. Buildable now on existing entities; only CommunityPost.content_warning needs a small schema add. Build PAUSED for reaction." }`
- render branch: `{tab === "Circles" && <BrandDocFrame html={communityCirclesHtml} title="FemWell — Circles: robust cohorts" />}`

---
## ⭐ TO WIRE — COMMUNITY FEATURE #5 = GAMES (The Games Room) brainstorm (doc) (2026-07-09) → Ideas → Current
> Brief brainstorm + build for the Games Room (Together shelf). Built ON the existing games engine (openGameRoundV2/submitGameResponse/finalizeGameRound + GameRound/GameResponse) — NO new entity/function. The Wordle lesson: one shared round, spoiler-safe, NO leaderboard; aggregate the room ("we"), never rank people. Shipped: Jess's nightly round + 6 named games made robust/inviting, k-anon "the room's playing" warmth, a gentle social hook (chat about it in the Lighter Side), on-brand canonical top-level page (oxblood title, Jump-left chrome, back-nav to Community home). Phone HTML in femwell-handoff/COMMUNITY-GAMES.html; copied to brandDocs/community-games.html. Please wire (3 edits).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| COMMUNITY-GAMES.html | community-games.html | "Games Room" | Current | gold |

- import: `import communityGamesHtml from "@/components/founders/brandDocs/community-games.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Games Room", group: CAT.CURRENT, sub:"Page level-up plans + demos", status:"new", accent:"gold", title:"The Games Room — play lightly (feature #5)", desc:"Games made robust + social + safe. Built ON the existing games engine (no new entity/function). Wordle lesson: one shared round, spoiler-safe, NO leaderboard — aggregate the room ('we'), never rank people. Jess's nightly round + 6 named games (This or That/One Word/Caption/One-Line Story/Tiny Confession/Comfort Pick) inviting + quick; k-anon 'room's playing' warmth; gentle social hook to the Lighter Side; on-brand canonical top-level page + back-nav. Live in Together → The Games Room." }`
- render branch: `{tab === "Games Room" && <BrandDocFrame html={communityGamesHtml} title="FemWell — The Games Room: play lightly" />}`
