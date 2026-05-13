# Nurse section brainstorm — FemWell clinician-adjacent surface

_Captured 2026-05-13 by Cowork following the Pacing Bank YES decision. Companion to `claude-state/research_planner_2026-05-13.md` §7 #6 (Pacing Bank)._

## 0. TL;DR

A "Nurse" layer for FemWell — clinician-adjacent content + algorithmic NHS-aware routing — is the cheapest, highest-trust differentiator from Flo / Clue / Stardust **provided we never give 1:1 medical advice.** The right shape is **editorial + routing + programs**, not symptom-triage or live Q&A. Done right it becomes the sale-readiness moat that turns FemWell from "another cycle app" into "the app your actual GP would point you at." Done wrong it triggers MHRA / CQC scrutiny that kills a sale.

**Recommendation:** ship as a new Lifestyle sub-tab called **"Care"** (or fold into Menu as a top-level destination), seeded with three components — Nurse Notebook (editorial), NHS Pathway Helper (routing), Nurse-led Programs (existing Programs entity, new authored content). Pacing Bank lives inside Care, not just Planner-B, because pacing is a clinical concept that needs clinical framing.

## 1. The Pacing Bank decision (YES — locked 2026-05-13)

User confirmed: include Pacing Bank in Planner-B scope. The positioning bet on PCOS / endometriosis / long COVID alongside cycling women is on.

### What Pacing Bank is

Per Ms Deep Search Planner research §7 #6: an energy-budgeting surface borrowed from chronic-illness pacing frameworks (NICE 2021 ME/CFS guidelines, Royal College of GPs long COVID pathways). User has a daily "spoons" / energy bank visible on Planner. Phase-aware capacity ceiling (luteal week shows a lower ceiling than follicular). Logged exertion subtracts from the bank. The day's "Plan-with-Jess" output respects the remaining balance — won't pile high-cost tasks on a low-bank day.

### Why this matters

- **Category-original.** No mainstream cycle app has chronic-illness pacing as a primary surface. Visible Health and Bearable do pacing but aren't cycle-aware.
- **Speaks to under-served users.** PCOS affects ~10% of UK women of reproductive age. Endometriosis ~10%. Long COVID lingers in ~6% of UK adults (ONS 2024) and women are 2× more likely to have it. That's a sizeable Venn the cycle-tracker category ignores.
- **Brand fit.** Calm-but-substantive. Pacing language is permissive ("you have 4 spoons left, this task costs 2") not prescriptive ("luteal = rest"). Sidesteps the R9 cycle-syncing strong-claim trap from the master plan.

### What Pacing Bank is NOT

- Not a diagnosis tool. Doesn't say "you have PCOS." Doesn't replace a clinician.
- Not a strict budget. The user can override and spend past zero — the app just logs the overspend and feeds it into the next day's recommendation.
- Not gamified. No streak, no badge for hitting zero. Calm. The bank refills overnight at a phase-aware rate. That's it.

## 2. The Nurse-section play — five options + recommendation

### Option A: Editorial nurse layer ("Nurse Notebook")
Monthly long-form notes from a named NHS-trained nurse on perimenopause / HRT / PCOS / contraception / pacing. Mirrors the Atelier Reading pattern from Horoscope. Sits in Lifestyle or new "Care" tab.

**Build cost:** S — uses existing `ContentItems` / Programs entities. ~£200-400/month if commissioned from a real nurse (BANT / NMC freelancer); £0 if AI-drafted and reviewed by a contracted clinical advisor on retainer.

**Regulatory exposure:** Low. Editorial content with named clinical advisor is the same pattern as `Drinks Magazine`, `Easy Living`, `The Pool` — content, not advice. Disclaimer: "general information, not personal medical advice."

**Sale-readiness:** Highest. Buyer sees a named clinical advisor in the masthead. DD-friendly.

### Option B: NHS Pathway Helper (algorithmic routing)
User describes a situation ("heavy bleed three weeks in a row"); app routes them to the right NHS surface (GP / 111 / sexual health clinic / pharmacist Pill check / fast-track gynaecology referral). **Never gives advice.** Just routes.

**Build cost:** M — needs a decision tree authored by a clinician, JSON-encoded, dropped into a new `nhsPathwayRoute` entity. Logic is `if symptom X + duration Y → suggest pathway Z`. Looks like the NHS app's "Where to get help" with cycle-awareness.

**Regulatory exposure:** Low if framed as signposting. NHS Digital does exactly this. Disclaimer: "We don't diagnose. We point you at NHS resources."

**Sale-readiness:** High. Differentiator vs Flo (US-centric, no UK pathway sense), Clue (German-built, no NHS hooks).

### Option C: Nurse-led Programs (use existing Programs entity)
4-8 week courses authored by a nurse. Topics: "Your first six months on HRT" / "PCOS pacing: the calm version" / "Perimenopause without panic" / "Coming off the pill — what actually happens." Folds into the existing Programs feature.

**Build cost:** S — entity exists, content cost is the only new spend. ~£500-1500/programme if commissioned externally; pair with Nurse Notebook editor.

**Regulatory exposure:** Low. Educational content, not personal advice. Programmes are structured editorial, like `Couch to 5k`.

**Sale-readiness:** Medium-High. Programmes are bookable in DD as "intellectual property."

### Option D: Live "Ask a Nurse" Q&A
User posts a question; a real nurse replies within 24-48h. Anonymised.

**Build cost:** L. Need contracted nurses on retainer + insurance + GDPR-compliant Q&A queue + answer review process. ~£3-5k/month minimum staffing.

**Regulatory exposure:** **HIGH.** This is personal advice. Falls under MHRA medical-device regulations if it influences clinical decisions. Could need CQC registration as a healthcare provider. **DO NOT SHIP in the 6-month sale window.**

**Sale-readiness:** Would be a moat IF properly regulated. Too heavy for our runway.

### Option E: AI symptom-triage chatbot
AI suggests likely causes from symptoms. Like Babylon Health's old chatbot.

**Build cost:** L. Need a custom-trained or vetted clinical model + UI + escalation logic.

**Regulatory exposure:** **VERY HIGH.** MHRA recently tightened rules on Software as a Medical Device (SaMD). Babylon ceased UK operations August 2023 partly because of triage liability. Push-button regulatory complexity.

**Sale-readiness:** Negative — adds risk to DD, doesn't add value.

### Recommendation

**Ship A + B + C** as the "Care" surface. Skip D and E.

| | Cost | Risk | Sale value | Ship now? |
|---|---|---|---|---|
| A. Nurse Notebook | S | Low | Highest | ✅ Phase B |
| B. NHS Pathway Helper | M | Low | High | ✅ Phase C |
| C. Nurse-led Programmes | S | Low | Medium-high | ✅ Phase B (uses existing Programs entity) |
| D. Live Ask a Nurse | L | **HIGH** | Mixed | ❌ post-sale |
| E. AI symptom triage | L | **VERY HIGH** | Negative | ❌ never |

## 3. Architecture — where does Care live?

Three options:

**Option 1: Lifestyle 6th sub-tab "Care"**
- Lifestyle currently has 5: For You / Browse / Listen / Daily Story / Horoscope
- Add Care as 6th. Same width-constrained 820px wrapper.
- **Risk:** Lifestyle is "the magazine." Care is more "the clinical companion." Different psychological mode.

**Option 2: New top-level destination at `/Care` reached via Menu**
- Menu drawer adds Care row. Not in the 5-slot bottom nav.
- Standalone page like Programs.
- **Risk:** Discovery low — Menu drawer is the back-of-the-app.

**Option 3: Care surfaces folded into Profile**
- Profile already has user-account stuff (subscriptions, settings). Add a "Your Care" section: HRT log, nurse notebook subscription, pathway history.
- **Risk:** Profile is for self-management metadata, not editorial. Mixing modes.

**Recommendation: Option 2.** Top-level `/Care` reached via Menu. Same shape as Programs. Has its own URL so it can be deep-linked from Jess ("Ask the nurse about that — `/Care/ask`"), from Today phase strip ("Heavy bleed three weeks running? Check the Care pathway"), from Horoscope ("Saturn in your 6th house — your nurse-led HRT programme starts next week"), from email campaigns to lapsed users.

Discovery problem solved by **deep-linking everywhere** — Care doesn't need its own bottom-nav slot if every other surface points users at it.

## 4. The clinical advisor question (R3 escalation)

Master plan R3 already flags Astra Cole's MA/FAS credentials as positioning, not contracted. Adding a Nurse layer **forces this to a head** — you can fake an astrologer credential, you cannot fake a nurse. NMC (Nursing and Midwifery Council) registration is public; buyers will check.

Three honest paths:

**Path 1: Contract one real UK NMC-registered nurse on retainer.** ~£800-2,000/month for 8-12h/week of editorial advisory work — drafting Nurse Notebook, reviewing AI-drafted content, approving pathway tree updates, taking by-line credit. Sustainable. DD-clean. Recommended.

**Path 2: Editorial board, not single name.** Three or four NHS-trained advisors named on the site (one nurse, one GP, one pharmacist, one mental health practitioner). Smaller per-person commitment. Lower-risk for any one advisor. More DD-impressive ("clinical advisory board" reads better than "one freelancer").

**Path 3: Anonymous nurse content, no by-line.** Cheapest. AI-drafted, light human review by anyone. **Don't do this — buyers will assume AI-only and discount the moat to zero.**

**Recommendation: Path 1 first, evolve to Path 2 pre-sale.** Engaging the first nurse is a 2-3 week process (LinkedIn outreach + interview + small paid trial brief). Worth starting in week 2-3 of Phase B if Care is on the roadmap.

## 5. Names — who's the "Astra Cole" of the Nurse layer?

Astra Cole worked as the astrology persona because astrology has a long history of named-author authority (Susan Miller, Chani Nicholas, Aliza Kelly). Nursing doesn't carry the same celebrity-author pattern. Three options:

**Option α: Single named nurse, "Hattie Reynolds, RGN" or similar.** Personal, warm, on-brand. Matches the Astra pattern. Needs to be a real contracted person (R3).

**Option β: A nurse-team handle, "The FemWell Practice Nurses."** Plural, no single face. Pairs well with Path 2 editorial board. Less personal but lower legal exposure for any individual.

**Option γ: An invented archetype handle like "Practice Nurse" or "Nurse Practitioner."** No personal name. Reads as branded role. Risks reading impersonal — "from the desk of the Practice Nurse" beats "from the desk of NurseBot."

**Recommendation: α with a real contracted nurse.** Brand resonance comes from a name + a face. Buyers DD-check easily.

## 6. Pacing Bank inside Care

The Pacing Bank decision sits naturally inside Care, not Planner-B alone:

- **Planner** shows the bank as a today-view spoon counter at top of the day.
- **Care** owns the bank's *framing* — the nurse-authored explanation of what pacing is, why it works for cycling women, PCOS, endometriosis, long COVID, perimenopause.
- **Today** surfaces a one-line pacing nudge when the bank is low ("low-bank day today; the nurse's pacing programme is in Care if useful").

So Pacing Bank ships in **two MPs**:
1. **Planner-B-1** — the bank widget on Planner, capacity ceiling math, exertion subtraction. ~Medium build.
2. **Care-A-1** — the nurse-authored "What is pacing?" notebook entry that lives in Care, links to the Planner widget, links to the Pacing nurse-led Programme. ~Small build, content-heavy.

## 7. Sequencing — Care vs the rest of Phase B

Current Phase B per master plan §10: Planner first (now in flight), then Profile, then Sessions removal (now LC-3 done), then Skin & Hair / Life Stage / Community v2 / Journal v2 / Onboarding / Settings / Panic Mode.

**Where does Care slot?** Two options:

**Option 1: Care between Planner and Profile.** Phase B becomes: Planner → Care → Profile → … Care benefits from Pacing Bank being live (it gets a real surface to reference). Care's clinical-credibility moat lands in the buyer's view earlier in the sale window.

**Option 2: Care folded into Profile rebuild.** Profile already has "your subscriptions" / "your data export" / "your settings." Add "Your Care" as a Profile section. **Less coherent** — Care is editorial-plus-routing, not metadata.

**Recommendation: Option 1.** Care is its own destination, not a Profile sub-section. Estimate 3-4 MPs to ship (Care-A: shell + Nurse Notebook entity + first 3 articles · Care-B: NHS Pathway Helper · Care-C: Nurse-led Programmes integration with existing Programs · Care-D: Pacing Bank framing entry).

## 8. The trap

Same trap as Planner R9, escalated: **never frame Care as "the nurse says do this."** Always frame as "here's information; here's a pathway to a real clinician; you decide." The line between editorial signposting (legal, sale-friendly) and personal medical advice (regulated, sale-killing) is wafer-thin and buyers' lawyers know exactly where it is.

Bind a copy rule: every Care article ends with one paragraph that says *"This is general information from a nurse-trained writer. It is not personal medical advice. If [symptom] persists / worsens / concerns you, [specific NHS pathway] is the right next step."* That paragraph is non-negotiable. Style-guide it. Have the contracted nurse sign off on the rule itself, not just individual articles.

## 9. Budget impact

If the recommendation lands as proposed:

- **One-off:** Care-A through Care-D builds: ~10-15 development hours total (mostly UI shells + entity scaffolding). Within Phase B's existing scope.
- **Monthly recurring:** Contracted nurse advisor £800-2,000/month (Path 1) or editorial-board ~£2,000-4,000/month (Path 2). Editorial commissions £500-1,500/programme + £200-400/notebook entry.
- **One-off content backfill:** ~12 notebook entries + 3 programmes for launch. ~£4,000-8,000 commissioned.

Total Year 1 Care budget: £15,000-30,000. **At a £1M valuation with ~2,500 Plus subscribers @ £8.99/month, that's 8-15% of subscription revenue.** Heavy as a percentage but justified if Care is the difference between a £1M acquirer and walking away.

## 10. Five captured ideas for the master plan

Add these to master plan §6 Engagement Layer or §10 Roadmap (captured 2026-05-13):

1. **Care — new top-level surface at `/Care`.** Editorial + routing + programmes. Three components (Nurse Notebook + NHS Pathway Helper + Nurse-led Programmes). Slots between Planner and Profile in Phase B.
2. **Pacing Bank — Planner-B widget + Care-A framing.** Confirmed YES. Phase-aware spoon counter; chronic-illness-aware; permissive not prescriptive; sidesteps R9 trap.
3. **Contracted clinical advisor — Path 1 first.** One UK NMC-registered nurse on retainer, named by-line on Care content. Engage in Phase B week 2-3.
4. **Pathway data: JSON-encoded NHS routing tree.** New `nhsPathwayRoute` entity. Authored once with contracted nurse, refreshed quarterly.
5. **Care deep-linking everywhere.** Jess, Today phase strip, Horoscope, email campaigns all surface Care pathways. Replaces the discovery problem of Care not being on bottom nav.

## 11. Open questions for the user

1. **Single contracted nurse (Path 1) or editorial board (Path 2)?** Path 1 is cheaper + faster; Path 2 reads better at DD.
2. **Care as Lifestyle 6th sub-tab or top-level `/Care`?** I recommended top-level — confirm.
3. **Pacing Bank framing — single name (e.g. "Hattie Reynolds, RGN") or anonymous editorial?** I recommended named.
4. **Care launch date — between Planner and Profile in Phase B (~week 6-8 of sale runway), or after Profile?** I recommended earlier.
5. **Are we willing to spend £15-30k/year on Care content + clinical advisor?** That's the binding constraint. Without funded content, Care is empty shelves.

---

_End brainstorm. If user picks up on any of items 1-5 in §10, fold into master plan with "(captured 2026-05-13)" tag and update §10 Roadmap phasing._
