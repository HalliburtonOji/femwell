# IDEAS LINKS — plan/brainstorm docs to keep wired into FoundersOS (IDEAS pill)

> Per CLAUDE.md Standing Rule #1: every plan/brainstorm ships as a phone-readable styled-HTML doc to `C:\Users\Halli\femwell-handoff\` **and** is linked into the FoundersOS "Ideas" page so Halli reaches it via the floating IDEAS pill (never a dead route).
> Mechanism (established): copy the HTML into `src/components/founders/brandDocs/<slug>.html`, `import …?raw` in `FoundersOS.jsx`, add a `{ kind:"doc", key:"…" }` CATALOG entry, and a `{tab === "…" && <BrandDocFrame html={…} title="…" />}` render branch. Then build + `npx base44 site deploy -y`.

## ⭐ TO WIRE FIRST — Universal Calendar + Logger plan doc (2026-07-05, content session) → Ideas → Current
> Deep brainstorm+plan for Halli's app-wide change: ONE universal calendar everywhere (replacing the OLD photo-bg `MonthlyCalendarCard.jsx`), the calendar icon replacing the "+" FAB as the single logging entry, tap-a-day-to-log with date/time prefill, Planner time-slot prefill, and a rebuilt log sheet. Plan only — no live calendar/logger code changed. Phone HTML in `femwell-handoff/UNIVERSAL-CALENDAR-LOGGER.html`; copied to `brandDocs/universal-calendar-logger.html`. Content session can't safely edit `FoundersOS.jsx` — please wire (3 edits, pattern below).

| Doc (femwell-handoff/) | brandDocs slug | FoundersOS key | group | accent |
|---|---|---|---|---|
| UNIVERSAL-CALENDAR-LOGGER.html | universal-calendar-logger.html | "Universal Calendar" | Current | gold |

Wiring (3 edits):
- import: `import universalCalendarHtml from "@/components/founders/brandDocs/universal-calendar-logger.html?raw";`
- CATALOG entry: `{ kind:"doc", key:"Universal Calendar", group: CAT.CURRENT, sub:"Calendar + logger plans", status:"new", accent:"gold", title:"Universal Calendar + Logger", desc:"One universal cream/flora/oxblood calendar everywhere (replaces the OLD photo-bg month grid + 3 other one-off calendars); the calendar ICON replaces the + FAB as the single logging entry; tap a day to log for that day (date prefilled, editable); Planner time-slot prefills date+time; general 'Log for today' button vs day-specific flow; rebuilt opaque log sheet keeping every capability (meals/water/mood/symptom/note/habit/med/event + OFF/scan/voice/photo). Deep brainstorm w/ options+recommendations+mockups. Plan only." }`
- render branch: `{tab === "Universal Calendar" && <BrandDocFrame html={universalCalendarHtml} title="FemWell — One Universal Calendar + Logger" />}`

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
