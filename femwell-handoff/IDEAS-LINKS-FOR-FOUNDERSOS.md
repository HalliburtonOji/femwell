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
<!-- DOCTOR-EXPORT-PLAN, PROGRAMS-PLAN, GARDEN-PLAN, JESS-PLAN to follow -->

Pulse render branch: `{tab === "Pulse +2" && <BrandDocFrame html={pulsePlanHtml} title="FemWell — Pulse Level Up (+2)" />}` · import `import pulsePlanHtml from "@/components/founders/brandDocs/pulse-plan.html?raw";` · desc "Pulse page — next-2-levels plan (own-median predictions, correlation engine, anomaly→NHS flag, wearable import)".

Wiring per Batch-2 doc (3 edits each): e.g. `import communityPlanHtml from "@/components/founders/brandDocs/community-plan.html?raw";` · a `{ kind:"doc", key:"Community +2", group: CAT.CURRENT, status:"new", accent:"crimson", desc:"Community page — next-2-levels plan (trust layer, moderated DMs, IRL bridge, OSA compliance)" }` CATALOG entry · a `{tab === "Community +2" && <BrandDocFrame html={communityPlanHtml} title="FemWell — Community Level Up (+2)" />}` render branch.

Wiring per doc (3 edits each): `import nutritionLevelupHtml from "@/components/founders/brandDocs/nutrition-levelup.html?raw";` · a `{ kind:"doc", key:"Nutrition +2", group: CAT.CURRENT, status:"new", accent:"crimson", … }` CATALOG entry · a `{tab === "Nutrition +2" && <BrandDocFrame html={nutritionLevelupHtml} title="FemWell — Nutrition Level Up (+2)" />}` render branch. Then build + `npx base44 site deploy -y`.

## Notes for the FoundersOS session
- If I (a brand/feature session) add a new plan doc, I copy it into `brandDocs/` and wire it myself when `FoundersOS.jsx` is clean; if you hold the file, wire from this list.
- Keep the in-app `brandDocs/*.html` copies in sync with the latest femwell-handoff/ version when the content session updates a doc (the content session owns the HTML; you own the catalog wiring).
