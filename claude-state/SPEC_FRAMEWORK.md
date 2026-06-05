# FemWell — SPEC FRAMEWORK (the depth standard every feature spec must meet) — v1

_Owner: Mr Lead Manager. Research: Ms Deep Search. Craft gate: Ms Atelier. Verification gate: Ms Verify._
_v1 2026-06-05 — codifies the bar set by `JOURNAL_BUILD_SPEC.md` v3 so that **no feature ever ships from a lightweight spec again.** This is the reusable template + quality checklist. Read it before writing any new `*_BUILD_SPEC.md`; grade every spec against §12 before it is called done._

> **WHY THIS EXISTS.** The Journal was specced to real depth — the FoundersOS master plan captured word-for-word, an evidence base, a nine-app competitive read, a thirteen-surface inventory with states + data wiring, a risk register, a rollout ladder, a source map, and a list of open decisions for Halli. The Community v1 spec was thinner. Halli's instruction: bring Community up to the Journal's depth, **and** write down the standard so the depth is repeatable. This file is that standard. A spec that does not meet it is not finished — it is a draft.
>
> **THE ONE-LINE TEST.** A FemWell build spec is done when an unfamiliar engineer or a reset Claude session could build the feature **correctly, safely, and on-brand from the spec alone** — without re-reading the source demos, without guessing a data model, without inventing copy, and without tripping a UK-compliance or brand landmine the spec failed to flag.

---

# §0 — HOW TO USE THIS FRAMEWORK

1. **Before research:** read this file. Note the 12 required sections (§1–§12 below) and the depth bar for each.
2. **Research first, format second (the skills rule).** Gather every fact, source, demo, entity, and decision the feature needs BEFORE you start formatting the deliverable. Dispatch **Ms Deep Search** for the external research pass; read every internal source doc in full (word for word — see §2).
3. **Draft against the template in §13.** Fill every section. A section that genuinely does not apply gets a one-line "N/A because…", never silent omission.
4. **Self-grade against the §12 Definition-of-Done checklist.** Every box must be ticked or explicitly waived with a reason.
5. **Gate:** Ms Verify confirms the checklist; Ms Atelier confirms the craft bar (§6 of the spec) for anything visual. Then it is done.

**Naming + placement:** specs live at `claude-state/<FEATURE>_BUILD_SPEC.md`, versioned in the title (`v1`, `v2`, …). The master plan / authoritative source always wins any conflict; where the spec adds research or production detail the master plan doesn't spell out, mark it as a supplement. Update the spec on every shipped pass and every decision resolved.

**Brand floor every spec inherits (never re-litigate, always honour):** UK market (NHS, GMC/NMC/HCPC, £, UK GDPR/DPA 2018) · **no emoji anywhere** (Lucide + custom SVG only) · the Editorial type kit · one unified bottom nav at all viewports · no scoreboards (no likes/follows/handles/karma/leaderboards/streak-shame) · evidence-informed, never a clinical promise.

---

# THE 12 REQUIRED SECTIONS (and the depth bar for each)

Every `*_BUILD_SPEC.md` MUST contain all twelve. Below, each section states **what it is**, **the depth bar** (what "deep enough" means, drawn from how the Journal spec did it), and the **failure mode** that means it is too lightweight.

## §1 — VISION & PRINCIPLES
**What:** the thesis in one locked sentence, the design philosophy, and the non-negotiable principles for this feature (the "what's locked" list).
**Depth bar:** a quotable thesis line; a numbered list of locked principles (the Journal spec had 8) each with a one-line rationale; the runway/strategic framing (e.g. "6-month sale window, 9-month soft cap"); the brand floor restated where feature-specific. Principles must be *decisions*, not aspirations — each should be able to settle an argument.
**Failure mode:** vague mission language ("a place for women to connect") with nothing that could reject a proposed design.

## §2 — FAITHFUL 1:1 CAPTURE OF THE SOURCE MATERIAL
**What:** every existing master-plan / demo / prior-spec source read **word for word** and captured so the spec is self-contained. Nothing flattened, nothing paraphrased away.
**Depth bar:** name each source and capture it section-by-section — tables reproduced as tables, verbatim copy preserved in quotes, concept bodies/moats/voice/quarter kept intact (the Journal spec captured the master plan's hero, 8 principles, 13-surface table, 5 concepts, 5 reconciliations, evidence base, competitive table, rollout ladder, 8 open questions, 6 risks, and 10 hero quotes — all 1:1). Mark where the spec *supplements* the source vs *reproduces* it. Flag every conflict between sources and state which wins.
**Failure mode:** "see the demo for details," summarising a rich source in two bullets, or capturing the pretty copy but dropping the entities/rails buried in an appendix.

## §3 — EXHAUSTIVE FEATURE INVENTORY (the build queue)
**What:** every surface/feature the feature comprises, each fully specified.
**Depth bar — for EVERY feature, all of:**
- **Purpose** (one line: the job it does for the user).
- **IA placement** (which page/route/tab/overlay it lives in; entry points).
- **All states:** empty · loading · error · partial · populated — plus any surface-specific states (cooling, matched, sealed, expired, blocked, rate-limited…). State every one.
- **Data wiring + exact base44 entities:** which entity/entities, which fields, which query (filter/sort/limit), what's computed on-device vs server-side.
- **Interactions:** the taps, the flows, what each control does.
- **Edge cases:** the awkward states (no cycle anchor, cohort too small, key not on this device, offline, first-run).
- **Phase tag:** Live / Patch-ready / Demo / Plan (define the legend), plus the rollout phase it belongs to.
**Failure mode:** a feature list without states; "wired to the database" with no entity named; ignoring empty/error states; no edge cases.

## §4 — EXTERNAL RESEARCH WITH CITATIONS (multi-point, ≥ several credible sources)
**What:** a real cited research pass — the evidence base + domain research that justifies and de-risks the design.
**Depth bar:** **at least several credible, resolving sources** (the Journal spec leaned on Pennebaker/Neff/NET/CHI/contagion literature; a feature touching peers/health/safety should cite considerably more). Each material claim carries a source (title + URL). Separate the **evidence base** (why this helps) from **domain/market research** (how others do it). Note confidence per finding (high for statutory/peer-reviewed; directional for vendor stats). End with concrete **design implications** — research that doesn't change the design isn't pulling its weight. Dispatch Ms Deep Search; do not invent citations.
**Failure mode:** zero or one source; "research shows…" with no link; citations that don't resolve; research with no design consequence.

## §5 — COMPETITIVE ANALYSIS (multiple comparable products)
**What:** how comparable products solve this, what to emulate, what to avoid.
**Depth bar:** **multiple named competitors** (the Journal spec compared 9 apps) in a borrow/avoid or EMULATE/AVOID table, with concrete mechanics (not "it's social"). Include at least one **cautionary tale** dissected in detail (the failure that kills products in this category). Name the **opportunity** — the gap no competitor occupies that this feature can own. Cite the competitive claims (ties to §4).
**Failure mode:** one or two competitors; generic "they have a feed too"; no cautionary analysis; no stated wedge.

## §6 — CROSS-APP / CROSS-FEATURE RELATIONSHIPS
**What:** how this feature connects to **every other surface** in FemWell — its own substantial section, not an afterthought.
**Depth bar:** for each relevant surface (Journal, Today, Planner, Health/Pulse, Lifestyle, Jess, Doctor-export, Community, Horoscope, Rituals, Programs, onboarding, Settings, notifications…), state the exact interlock: what data/affordance flows which way, the entry points, the shared primitives (e.g. SecureStore, the reading engine), and any contract (e.g. "what's excluded from the Doctor export"). Distinguish **shipped** crossovers from **planned** ones. The Journal spec's §2.8 is the model — extend it to a full section.
**Failure mode:** "integrates with the rest of the app" with no specifics; forgetting Doctor-export/Jess/notifications; no data-flow direction.

## §7 — SAFETY / PRIVACY / COMPLIANCE MODEL
**What:** the spine for any feature touching personal, health, peer, or shared data.
**Depth bar:** the anonymity/identity model (with **honest limits** flagged, not hidden); the data-handling pipeline (on-device vs server, what's encrypted, what's stored, what's never stored); the sensitivity tier (Tier 1 public / Tier 2 server-encrypted / Tier 3 E2E client-only) + deletion cascade; the moderation/abuse model where relevant; and the **UK legal floor** made explicit (UK GDPR special-category consent + Appropriate Policy Document where applicable; Online Safety Act 2023 duties for any user-to-user surface; age assurance where a teen stage can reach it). State what is a **legal requirement** vs a nice-to-have, and name the owner of any required legal artefact.
**Failure mode:** "data is encrypted" with no tier/limit/owner; ignoring OSA/ICO for a social feature; claiming anonymity the architecture doesn't deliver.

## §8 — RISK REGISTER
**What:** what could go wrong, and the guardrail for each.
**Depth bar:** a numbered register (the Journal spec had 6) covering product risk (feature creep, drift), trust risk (privacy theatre, de-anonymisation), brand risk (emoji, US/Naija register, streak shame), clinical/regulatory risk (clinical over-claim, OSA/ICO), and dependency risk (native capability, platform field). Each risk states the **failure it prevents** and the **specific countermeasure** in the design. Tie back to research where a risk is evidence-based.
**Failure mode:** "risks: privacy, moderation" with no countermeasures; risks that aren't actually addressed anywhere in the spec.

## §9 — PHASED ROLLOUT ROADMAP
**What:** the build sequence, each phase shippable and verifiable.
**Depth bar:** phases mapped onto FemWell's existing phase numbering; **each phase is a reviewable, live-walked pass** with a clear scope, its entities/functions, its moderation/risk cost, and an exit gate. State dependencies between phases (what must exist first) and what is explicitly **not done by design** in each phase. Note where the paywall/Plus tier is parked. Ms Atelier crafts → Ms Verify gates → a STATUS SHIP LOG line per commit.
**Failure mode:** "build it in phases" with no phase contents; phases that can't ship independently; no exit gate.

## §10 — SOURCE MAP
**What:** which doc each piece of the spec came from — the provenance table.
**Depth bar:** a table mapping every major area of the spec to its source file(s) (master plan / demo HTML / prior spec / live code path / research pass). Include the **research source URLs** in full (so citations resolve later). The live-code paths read line-by-line are named. Anyone can trace any claim back to its origin.
**Failure mode:** no source map; "various docs"; research URLs missing so citations can't be re-checked.

## §11 — OPEN DECISIONS FOR HALLI
**What:** the questions only Halli can answer, surfaced — not buried, not silently decided.
**Depth bar:** a numbered list separating the **source's own open questions** (carried forward) from **spec-level decisions** the research surfaced. Each decision states the options, the trade-off, and a **recommendation** where the spec has a view. Flag the **blocking** ones (deploy can't proceed without an answer) distinctly from the deferrable ones.
**Failure mode:** no open-decisions list (implying everything's decided when it isn't); decisions stated without options or a recommendation; burying a deploy-blocker mid-paragraph.

## §12 — DEFINITION OF DONE / DEPTH CHECKLIST
**What:** the self-grade gate — the spec includes its own checklist and ticks it.
**Depth bar:** reproduce the checklist below (§12 of THIS framework), tick every box or waive with a reason. A spec that hasn't run its own checklist is not done.
**Failure mode:** no checklist; a checklist with unticked boxes and no waiver reason.

---

# §12 — THE DEFINITION-OF-DONE CHECKLIST (copy into every spec and tick it)

**Structure & capture**
- [ ] All 12 sections present (none silently omitted; any N/A justified in one line).
- [ ] Every source doc read **word for word** and captured 1:1 (§2); verbatim copy preserved in quotes; tables reproduced.
- [ ] Every source-vs-source conflict flagged with a "which wins" ruling.

**Feature inventory**
- [ ] Every feature has: purpose · IA placement · ALL states (empty/loading/error/partial/populated + surface-specific) · data wiring with named base44 entities + fields · interactions · edge cases · phase tag.
- [ ] No feature is "wired to the database" without a named entity.
- [ ] A legend defines the phase tags (Live / Patch / Demo / Plan).

**Research & competition**
- [ ] ≥ several credible, **resolving** sources cited (title + URL); confidence flagged per finding.
- [ ] Evidence base (why it helps) separated from domain/market research (how others do it).
- [ ] Every research finding ends in a concrete design implication.
- [ ] ≥ multiple named competitors in an EMULATE/AVOID table with concrete mechanics.
- [ ] ≥ one cautionary tale dissected; the opportunity/wedge named.

**Cross-app & data**
- [ ] Cross-app relationships are their **own substantial section**, covering every relevant surface with data-flow direction + entry points + shared primitives.
- [ ] Doctor-export / Jess / notifications interlocks explicitly addressed (the commonly-forgotten three).

**Safety, risk, compliance**
- [ ] Anonymity/identity model stated **with honest limits**.
- [ ] Sensitivity tier + deletion cascade stated.
- [ ] UK legal floor explicit: special-category consent + APD where applicable; OSA 2023 duties for any user-to-user surface; age assurance where teen-reachable. Legal requirements vs nice-to-haves distinguished; owner named for each required artefact.
- [ ] Risk register: each risk has a countermeasure that actually appears in the design.

**Rollout, provenance, decisions**
- [ ] Each rollout phase is independently shippable + live-walked, with an exit gate and "not done by design" list.
- [ ] Source map traces every area to its origin; research URLs included in full.
- [ ] Open decisions listed with options + recommendation; blocking decisions flagged distinctly.

**Brand & craft**
- [ ] No emoji anywhere in the spec's specified UI (Lucide + SVG only).
- [ ] UK locale throughout (NHS/Samaritans/Mind, GP, £, en-GB); no US/Naija register.
- [ ] No scoreboards / streak-shame in any specified mechanic.
- [ ] Craft bar stated for visual surfaces; Ms Atelier → Ms Verify gate named.

**Self-grade**
- [ ] This checklist is reproduced in the spec and every box ticked or waived-with-reason.

---

# §13 — THE TEMPLATE (scaffold a new spec from this)

```
# FemWell <Feature> — BUILD SPEC (production, Editorial direction) — v<n>
_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_v<n> <date> — <how it was built: every source read word for word; live code read line by line; fresh cited research pass folded in>._

> THESIS (locked): <one quotable sentence>.
> WHERE WE ARE (<date>): <live anchor commit + bundle; what's Live/Patch/Demo/Plan; the one blocking action if any>.
> Hard brand rules: <UK · no emoji · Editorial kit · one bottom nav · no scoreboards · evidence-informed>.

# §0 — HOW TO READ THIS DOC   (section map)

# §1 — VISION & PRINCIPLES
  1.x thesis · design philosophy · numbered locked principles (each with rationale) · strategic framing

# §2 — SOURCE MATERIAL, CAPTURED 1:1
  2.x per-source faithful capture (verbatim copy in quotes; tables reproduced) · conflicts flagged with "which wins"

# §3 — FULL FEATURE INVENTORY (the build queue)
  Legend: Live / Patch / Demo / Plan. States checked for every surface.
  3.x per feature: What · IA placement/entry points · States (empty/loading/error/partial/populated + surface-specific) · Data wiring + base44 entities/fields · Interactions · Edge cases · Phase

# §4 — EXTERNAL RESEARCH (cited)
  4.x evidence base · domain/market research · per-finding confidence · design implications · full source URLs (mirror in §10)

# §5 — COMPETITIVE READ
  EMULATE/AVOID table (multiple products, concrete mechanics) · cautionary tale dissected · the wedge

# §6 — CROSS-APP / CROSS-FEATURE RELATIONSHIPS
  6.x one block per surface (Journal/Today/Planner/Health/Jess/Doctor/Community/Horoscope/Rituals/onboarding/Settings/notifications): data-flow direction · entry points · shared primitives · contracts · shipped vs planned

# §7 — SAFETY · PRIVACY · COMPLIANCE
  anonymity/identity model + honest limits · data pipeline (on-device/server/encrypted/never-stored) · sensitivity tier + deletion cascade · moderation/abuse model · UK legal floor (GDPR special-category + APD · OSA 2023 · age assurance) · requirement vs nice-to-have · owners

# §8 — RISK REGISTER
  numbered: failure prevented + specific countermeasure (tie to research)

# §9 — PHASED ROLLOUT ROADMAP
  phases mapped to FemWell numbering · per phase: scope · entities/functions · mod/risk cost · exit gate · dependencies · "not done by design" · paywall parking

# §10 — SOURCE MAP
  area → source(s) table · live-code paths read · full research URLs

# §11 — OPEN DECISIONS FOR HALLI
  source's own questions + spec-level decisions · options + trade-off + recommendation · blocking flagged

# §12 — DEFINITION OF DONE / DEPTH CHECKLIST
  reproduce §12 of SPEC_FRAMEWORK; tick every box or waive-with-reason

# APPENDIX (as needed): base44 entities needing UI creation · server functions to add · copy deck
```

---

# §14 — DEPTH HEURISTICS (how to tell "deep" from "lightweight" at a glance)

- **The reconstruction test:** could someone rebuild the feature from the spec without the demos open? If they'd have to go back to the source HTML for copy, states, or the data model, §2/§3 are too thin.
- **The argument test:** can each principle in §1 actually *reject* a proposed design? If not, they're slogans.
- **The "so what" test:** does every research finding in §4 change a design choice? Unused research is decoration.
- **The forgotten-three test:** does §6 explicitly cover Doctor-export, Jess, and notifications? These are the interlocks specs always drop.
- **The landmine test:** does §7 name the UK-compliance landmines (OSA/ICO) and say who defuses each? A social/health spec that doesn't is dangerous, not just thin.
- **The honesty test:** does the spec flag its own limits (anonymity gaps, client-only enforcement, platform fields) rather than overclaiming? Honest limits are a depth signal; their absence is a red flag.
- **The blocking-decision test:** is the one thing that blocks deploy surfaced at the top and in §11 — not buried?
- **The provenance test:** can any claim be traced to a source via §10? If not, it may be invention.

---

# §15 — ROLES (who does what on a spec)
- **Mr Lead Manager** — owns the spec: scopes it, structures it, captures sources 1:1, holds the §12 gate.
- **Ms Deep Search** — the §4/§5 cited research + competitive pass; provides resolving URLs and confidence flags.
- **Ms Atelier** — the craft bar for any visual surface; reviews §6 of the spec (craft) before build.
- **Ms Verify** — confirms the §12 Definition-of-Done is fully ticked; gates the build that follows.
- **Mr Fix-it** — trivial spec corrections (≤2 sections).

_End of v1. This framework is the standard `COMMUNITY_BUILD_SPEC.md` v2 and every future `*_BUILD_SPEC.md` is written and graded against. Update it whenever the Journal/Community specs teach us a new depth requirement worth making permanent._
