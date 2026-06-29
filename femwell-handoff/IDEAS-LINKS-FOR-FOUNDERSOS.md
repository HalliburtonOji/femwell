# IDEAS LINKS — plan/brainstorm docs to keep wired into FoundersOS (IDEAS pill)

> Per CLAUDE.md Standing Rule #1: every plan/brainstorm ships as a phone-readable styled-HTML doc to `C:\Users\Halli\femwell-handoff\` **and** is linked into the FoundersOS "Ideas" page so Halli reaches it via the floating IDEAS pill (never a dead route).
> Mechanism (established): copy the HTML into `src/components/founders/brandDocs/<slug>.html`, `import …?raw` in `FoundersOS.jsx`, add a `{ kind:"doc", key:"…" }` CATALOG entry, and a `{tab === "…" && <BrandDocFrame html={…} title="…" />}` render branch. Then build + `npx base44 site deploy -y`.

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
<!-- CommunityL2Demo to follow -->

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
