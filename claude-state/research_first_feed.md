# FemWell Feature Research: First Feed — 8 Ideas

## Headline Read
**Strongest 2–3 ideas:** (1) **Contraception Side-Effect Audit** — FemWell can become the clinical record for switching history; early research shows women abandon hormonal methods due to mood/cognitive side effects that apps don't track. (2) **Brain Fog Timeline Tracker** — Perimenopause cognitive decline is research-proven, measurable, and a major unmet need (31%→44% prevalence), but existing apps ignore it; wiring to Jess + Today page makes it actionable. Both hit regulatory-safe clinical legitimacy and fill genuine data gaps.

---

## 1. Contraception Side-Effect Audit Trail

**Tagline:** Switch history + mood/cognitive mapping for hormonal contraceptives.

**Source / Origin:**
- UCLA study (Brain, Behavior, and Immunity, 2025): Hormonal contraceptive users show blunted reward response and dysregulated stress response vs. naturally cycling women.
- PMC review (2025): Negative mood effects linked to younger age, previous side effects, preexisting psychiatric disorders; responses highly heterogeneous.
- [MyTherapy symptom tracker](https://www.mytherapyapp.com/contraceptive-pill-reminder-app) — existing feature set precedent; Clue already logs symptoms but not *contraceptive transitions*.

**The Seed:**
Women report switching pills 3-5 times before finding one that works, but have no structured record of what failed and why. Current apps (Clue, Flo) log general mood/symptoms but don't link them to *which pill* or provide a "before/after" audit trail. A woman on pill A reporting depression, switching to pill B, then ring of mood improvement—that's clinical evidence she can show her GP and reuse if symptoms recur on a future method.

**Why This Hasn't Been Done Well Yet:**
Period-tracking apps avoid clinical territory (contraceptive side effects = medical claims). Building this requires legal audit of adverse event reporting language, close alignment with NHS guidelines on patient-reported outcomes, and willingness to position FemWell as a clinical tool (not just wellness). Most apps stay decorative to avoid liability.

**FemWell Slot-In:**
**Primary:** Jess (AI layer asks "thinking of switching?" → prompts structured side-effect audit). **Secondary touch:** Today (daily mood + physical symptoms already logged; reframe as "how is your current method working?"). **Cross-page:** Planner (mark pill change dates; alert user to re-log mood for 2 cycles post-switch to build switching decision support).

**Risk Flag:**
- **UK regulatory:** MHRA/NICE may require disclaimers that app data is not clinical diagnosis; ensure wording doesn't imply replacement of GP consultation.
- **Content quality:** High — must be medically accurate (side-effect list sourced from BNF, NHS guidelines) and avoid anti-contraceptive bias.
- **Harm-adjacent:** Low — purely observational. However, flag that some users may use side-effect data to pressure themselves into unsafe methods (e.g., hormonal-averse users).

---

## 2. Brain Fog Timeline (Perimenopause Cognitive Tracking)

**Tagline:** Measure forgetfulness, processing speed, attention—linked to hormonal transition.

**Source / Origin:**
- Study of Women's Health Across the Nation (SWAN): 31% premenopausal → 44% early perimenopause report cognitive complaints (forgetfulness, attention, memory). PMC 2024.
- 2025 neuroimaging research (Frontiers): Perimenopause associated with documented gray matter reduction in prefrontal cortex and hippocampus.
- [mySysters](https://mysysters.com/) (Newcastle-built, 2017) — already tracks perimenopause symptoms but does *not* isolate cognitive metrics.

**The Seed:**
Women in their 40s–50s report cognitive changes so profound they worry about early dementia—but current apps (Balance, Health & Her) focus on vasomotor symptoms (hot flashes, night sweats), not cognitive decline. FemWell can offer structured logging of "*brain fog days*"—attention span at work, memory for names/tasks, processing speed self-rated—plotted against cycle stage (perimenopause phase). Over 2–3 months, a user sees if cognitive dip correlates with late luteal phase or early perimenopause, validates her experience, and has data for her GP.

**Why This Hasn't Been Done Well Yet:**
Cognitive symptoms are *subjective* and hard to monetize (no pill to sell). Most menopause apps sell hormone replacement therapy (HRT) or behavioural content (sleep hygiene, exercise). Apps that do track mood miss the *cognitive specificity*—they log "energy" or "mood" but not "*I forgot three meetings today*" or "*processing a spreadsheet took 2x longer*." Requires designing a UX that captures nuanced daily cognitive experience without feeling like a clinical neuropsych battery.

**FemWell Slot-In:**
**Primary:** Today (4-question daily checklist: attention focus, memory clarity, processing speed self-rate, brain fog severity; tie to cycle phase automatically). **Secondary:** Jess (AI trend analysis: "your brain fog peaks mid-luteal; here's evidence-based strategies"). **Cross-page:** Lifestyle (link to sleep quality, stress tracking—confounders of brain fog).

**Risk Flag:**
- **Content quality:** Must emphasize this is *not* cognitive testing / clinical diagnosis for dementia. Frame as pattern recognition, not pathology.
- **Harm-adjacent:** Low risk if framed supportively; could cause health anxiety if woman sees she's in the 44% reporting cognition change. Mitigate with NHS-aligned reassurance language (transient, reversible with HRT, etc.).

---

## 3. Rage Tracker (Emotion Granularity Beyond "Mood")

**Tagline:** Log anger/irritability intensity and triggers; identify if hormonal or situational.

**Source / Origin:**
- Sphera emotion-tracking app framework (6 basic emotions including anger/irritability). Search results show emotion trackers use Plutchik's wheel.
- Moody Month (iPhone) tracks "moods" but not discrete negative emotion types (rage, shame, despair).
- Unmet need signal: Reddit/Mumsnet women report "inexplicable rage" in luteal phase but feel dismissed; no app designed specifically for *anger patterns*.

**The Seed:**
Women report luteal-phase rage disproportionate to triggers. FemWell can offer a daily 1–5 rage/irritability scale + optional trigger log ("partner said X," "work deadline," "intrusive thought," "no trigger"). Over cycles, user sees if rage clusters in late luteal, enabling her to depersonalize outbursts ("it's hormonal, not character flaw") and plan coping strategies (communication with partner, solo time, therapy timing). Reframes rage as *data* rather than shame.

**Why This Hasn't Been Done Well Yet:**
Emotion granularity is rare in wellness apps; most use generic "mood" slider. Period-app designers avoid negative emotions (fear of marketing negative stereotypes of women). However, Moody Month proved women *want* hormone-tied emotion tracking. The gap is that no app dives deep into *anger specifically* or offers non-judgmental rage logging. Requires destigmatizing anger for women (not "bitchy," not "hysterical") and framing it as valid cycle data.

**FemWell Slot-In:**
**Primary:** Today (daily check-in splits "mood" into joy, calm, sadness, anger—let user select emotion *then* intensity). **Secondary:** Jess (pattern analysis: "you report 3x higher rage on days 20–26; here are evidence-based coping strategies for luteal dysphoria"). **Cross-page:** Community (potential future: peer support threads "managing luteal rage," normalize the experience).

**Risk Flag:**
- **Content quality:** High — must avoid perpetuating "hysteria" stereotype. Frame as legitimate symptom of PMDD/PME, not personality flaw.
- **Regulatory:** Low — tracking emotions is not a medical claim.
- **Harm-adjacent:** Moderate — risk of shame-spiralling if woman uses rage log to self-blame. Mitigation: AI reassurance language, links to IAPMD resources, NHS facts about PMDD.

---

## 4. PMDD Diagnostic Tracker (DRSP-Aligned Daily Severity Log)

**Tagline:** Clinically-validated daily severity log for PMDD diagnosis (NHS-aligned).

**Source / Origin:**
- Cardiff University (2024): "No current menstrual and mood tracking app has the full capabilities to accurately capture PMDD symptoms for diagnosis."
- IAPMD (International Association for Premenstrual Disorders): Daily Record of Severity of Problems (DRSP) is the gold-standard diagnostic tool; requires 2+ cycles of daily logging.
- NHS/NICE: PMDD diagnosed only through structured daily tracking; misdiagnosis is common due to poor tracking tools.
- [Me v PMDD](https://mevpmdd.com/) and [Belle PMDD Tracker](https://bellehealth.co/) exist but are not NHS-integrated or GP-compatible.

**The Seed:**
~3–5% of menstruating women have PMDD (not PMS). Diagnosis requires daily severity logging for 2+ cycles on specific criteria (mood, anxiety, energy, concentration, sleep, appetite, physical symptoms). Current commercial apps don't enforce this rigor; GPs don't have a standard, interoperable tool. FemWell can become the *clinical record*—app logs DRSP criteria daily, exports PDF summary for GP consultation, supports PMDD diagnosis pathway. Positions FemWell as a clinical-grade tool, not just wellness.

**Why This Hasn't Been Done Well Yet:**
Building a clinical-grade tool requires MHRA approval (or explicit disclaimer of clinical intent), NHS integration for data export, and liability management. Most apps avoid clinical positioning to stay lightweight. However, NICE guidelines *recommend* structured tracking, creating a genuine clinical gap. Belle is building this but US-first; no UK-native PMDD diagnostic app exists that's NHS-compatible.

**FemWell Slot-In:**
**Primary:** Today (DRSP-aligned daily checklist: mood, anxiety, energy, concentration, sleep, appetite, physical symptoms—pre-filled from existing Today logs, added PMDD-specific granularity). **Secondary:** Jess (alerts user "you're eligible for PMDD diagnosis consideration; share this report with your GP"). **Cross-page:** Planner (mark PMDD diagnosis appointments; track medication trials post-diagnosis).

**Risk Flag:**
- **UK regulatory:** CRITICAL — must clarify that app is "diagnostic support tool" not "diagnostic device." Require MHRA guidance or explicit disclaimers. Legal review essential.
- **Content quality:** High — DRSP criteria must be sourced directly from IAPMD/NICE. No simplification or rewording.
- **Harm-adjacent:** Low if scoped to information-gathering. High if user misinterprets as diagnosis (mitigate with "share with GP" flow).

---

## 5. Contraceptive Switching Decision Support (Method Comparison Post-Switch)

**Tagline:** Side-effect profiles compared across pills/IUDs you've tried; data-driven method selection.

**Source / Origin:**
- PMC (2025 review): Heterogeneous response to hormonal contraceptives; factors predicting negative mood effects include younger age, prior side effects, psychiatric history.
- MyTherapy contraceptive reminder app; Clue mood/symptom tracking; Natual Cycles (FDA-cleared fertility app) — all track usage but not *comparative effectiveness* across methods.
- Unmet need: Women report cycling through 3–5 methods without data on *which worked best for what symptoms*.

**The Seed:**
Unlike Idea 1 (audit trail), this is *decision support*—FemWell aggregates a user's side-effect data across 2+ contraceptive methods and displays: "Pill A: 8-week mood dip (started week 2, resolved week 8). Pill B: stable mood, breakthrough bleeding. Copper IUD: no hormonal side effects, 2x cramping." User can show GP this comparison, ask "can we try the method I tolerated best?" or "explore non-hormonal options?" Enables faster method-switching (currently trial-and-error).

**Why This Hasn't Been Done Well Yet:**
Personal contraceptive history is scattered across GP records, pharmacy notes, memory. No consumer app aggregates user's own historical side-effect data to compare methods. Building this requires ensuring data privacy (contraceptive history is sensitive) and disclaiming that app is not a prescribing tool—only a personal record. Also requires UX that doesn't overwhelm user with 20 method options; focus on user's tried methods only.

**FemWell Slot-In:**
**Primary:** Jess (AI layer: "You've tried 3 pills and an IUD. Let me help you compare side-effect patterns."). **Secondary:** Today (ongoing side-effect logging; compare to prior method automatically). **Cross-page:** Planner (schedule GP revisit with comparison report pre-written).

**Risk Flag:**
- **UK regulatory:** Medium — ensure disclaimers that app is personal record-keeping, not medical advice or prescription support.
- **Content quality:** Moderate — requires accurate BNF/NHS side-effect info; user entries are subjective.
- **Harm-adjacent:** Low if framed as patient empowerment. Risk if users abandon methods based on comparison without GP input; mitigate with "discuss with GP" callouts.

---

## 6. Lunar Cycle + Menstrual Cycle Sync (Spiritual + Scientific Hybrid)

**Tagline:** Moon phase alignment with menstrual cycle; mythology + evidence-based wellness.

**Source / Origin:**
- [28 Wellness app](https://womens-wellness.com) — lunar cycle energy tracking for cycle phases.
- [Lunar Guide app](https://www.lunarguideapp.com/blog/top-rated-astrology-health-apps-2025-comprehensive-wellness-guide) — astrology + wellness integration.
- Spiritual app ecosystem: Saged (tarot/astrology), Mystic Mondays (daily tarot + journaling), 40% of US women read horoscopes monthly.
- Adjacent inspiration: Headspace, Calm integrated meditation/spiritual content; FemWell Lifestyle already has horoscopes.

**The Seed:**
Many women *feel* connected to lunar cycles (no clinical basis, but culturally powerful). FemWell can offer optional lunar overlay on Lifestyle feed: "You're in your menstrual phase (new moon energy: introspection, rest)" or "You're ovulating (full moon energy: social, outward)." Pairs mythology with science (follicular = daytime energy, luteal = night energy, metaphorically moon-aligned). Reframes cycle as *connected to cosmos*, not isolated pathology. Low-cost add-on to Lifestyle; taps spiritual wellness market without compromising clinical credibility.

**Why This Hasn't Been Done Well Yet:**
Period-tracking apps are defensive about clinical legitimacy and avoid "woo." Spiritual apps (tarot, astrology) don't integrate menstrual data. The gap is a hybrid that honors *both* the cultural/spiritual meaning of cycles and the biology. Requires permission from FemWell team to be playful/spiritual (not all product teams embrace this).

**FemWell Slot-In:**
**Primary:** Lifestyle (existing horoscopes section; add "Moon Phase Diary" toggle: optional lunar-cycle alignment text + journal prompts tied to moon phase + menstrual cycle stage). **Secondary:** Today (visual: moon phase icon alongside cycle day). **Cross-page:** Community (potential peer threads on lunar cycle experiences; optional for users).

**Risk Flag:**
- **Content quality:** Low — purely optional, non-clinical. If claims are avoided ("moon affects tides, metaphorically your cycle"), no regulatory risk.
- **Regulatory:** Minimal if framed as cultural/wellness, not medical.
- **Harm-adjacent:** Very low; purely inspirational. Risk only if user abandons evidence-based care for astrology (mitigate with "this is for fun, not diagnosis").

---

## 7. Period Poverty & Menstrual Product Access (UK Community Care)

**Tagline:** Connect users to free/subsidized menstrual products; peer support for period poverty.

**Source / Origin:**
- Period Angels app / Gift Wellness Foundation: UK campaign to eliminate period poverty by 2025; connects users to free products via local GP practices.
- Plan International UK: "See My Pain" campaign; peer-led menstrual health community.
- [PeriodPoverty.uk](https://periodpoverty.uk/) and ActionAid UK: 1 in 10 UK girls have missed school due to period poverty; inadequate education persists.
- Research (PMC): Unmet menstrual health needs poorly researched in high-income countries, but UK data shows 51% experience severe period pain; 97% aged 16–40 report period pain.

**The Seed:**
FemWell serves UK women across socioeconomic spectrum. Some users lack safe access to menstrual products (cost, shame, disability, homelessness). Period Angels proved *demand* exists for product-access features. FemWell could integrate: (a) map of local GP practices / community centres offering free products (via Period Angels API or NHS data), (b) peer-support thread "managing period on a budget," (c) educational content on period poverty (destigmatize asking for help). Positions FemWell as *care bridge*, not just tracking app.

**Why This Hasn't Been Done Well Yet:**
Commercial period apps focus on affluent users who buy premium subscriptions. Period poverty = low purchasing power. Building product-access features requires partnerships (with Period Angels, local councils, NHS trusts) and content curation (localized product lists, opening hours). Most apps avoid this because ROI is low and operational overhead is high. However, it's a *differentiation opportunity* for FemWell: genuine care positioning vs. wellness extraction.

**FemWell Slot-In:**
**Primary:** Community (new section: "Period Essentials" → map to nearby free products + peer support threads). **Secondary:** Today (optional prompt: "Do you have access to menstrual products? We can help."). **Cross-page:** Jess (AI: "I noticed you've tracked pain but limited product variety; let me help you find options").

**Risk Flag:**
- **Content quality:** Moderate — requires accurate, up-to-date product availability data; partnering with local services introduces dependency.
- **Regulatory:** Very low — informational only, no medical claims.
- **Harm-adjacent:** Low; entirely supportive. Risk only if product map becomes outdated or barriers (e.g., users feel unsafe accessing listed locations); mitigate with reviews/feedback loop.

---

## 8. Medication + Supplement Interaction Timeline (Hormonal Contraceptive ↔ Psychiatric/Pain Meds)

**Tagline:** Flag drug interactions and efficacy loss when adding/removing meds alongside hormonal contraceptives.

**Source / Origins:**
- BNF (British National Formulary): Many psychiatric medications (SSRIs, anticonvulsants) interact with hormonal contraceptives, reducing pill efficacy or altering antidepressant levels.
- MyTherapy pill reminder app: Existing precedent for medication logging + reminders.
- Unmet need: Women on SSRIs or pain meds who start/switch contraceptives report unexpected symptom changes (e.g., depression worsens, pain relief drops) with no app connecting the dots to drug interaction.

**The Seed:**
A woman on sertraline + Pill A reports good mood. She switches to Pill B (different progestin). SSRI efficacy drops (pill B reduces SSRI levels), mood crashes. She blames the new pill. If FemWell logs both contraceptive *and* psychiatric medications + mood, an AI alert flags: "Your sertraline may be less effective with Pill B; ask your GP about pill–drug interactions." Enables faster root-cause diagnosis (interaction, not pill failure) and faster resolution (switch pill back or increase SSRI dose).

**Why This Hasn't Been Done Well Yet:**
Most period apps avoid medication territory (liability, scope creep). Psychiatric medication tracking is the domain of mental-health apps (Mindstrong, Bearable). Connecting the two—contraceptive ↔ psych med interactions—requires cross-domain expertise and legal vetting. However, MHRA/BNF provides published interaction data; FemWell would not be *advising*, only *flagging published interactions* ("talk to your GP"). Low risk if carefully scoped.

**FemWell Slot-In:**
**Primary:** Jess (user logs "I'm on sertraline"; Jess asks "are you on a hormonal contraceptive?" → flags interaction if yes, with BNF link and "discuss with GP" prompt). **Secondary:** Today (optional medication logger: pill, SSRI, pain meds, etc.; mood/pain linked automatically). **Cross-page:** Planner (remind user to mention interaction at GP visit).

**Risk Flag:**
- **UK regulatory:** CRITICAL — must use only published BNF interactions, not clinical judgment. Require legal review to ensure "flagging" is not "advising." MHRA guidance may be needed.
- **Content quality:** High — must source from BNF, NHS, not generic sources. Requires maintaining interaction database as BNF updates.
- **Harm-adjacent:** Moderate — risk that user stops medication based on interaction flag without GP input; mitigate with mandatory "discuss with GP" language and no "stop taking" advice.

---

## Summary: Research Dead-Ends & Notes

1. **Failed startups thesis:** Glow, Clue, Eve, Flo have not shut down (as of 2025); they've consolidated or pivoted. Clue cut 25% workforce (2023); Glow faced privacy fines (2020). Rather than studying "failures," I sourced their *feature deprecations* and unmet needs (e.g., Flo paywalled pregnancy data; Clue has no contraceptive-switching audit).

2. **"Sounds dumb but has a seed":** Ideas 3 (Rage Tracker) and 6 (Lunar Sync) fit this category—initially feel fluff, but rest on real unmet needs (emotion granularity, cultural meaning-making).

3. **Clinical positioning threshold:** Ideas 1, 4, 8 require UK regulatory caution (MHRA, NICE alignment, disclaimers). Ideas 2, 3, 5, 6, 7 are lower-risk (wellness, supportive, informational).

4. **Adjacent-app crossovers identified:**
   - Sleep apps (Balance, Headspace) → Brain Fog tracker (sleep is confounder; integrate sleep + cognition tracking).
   - Mental-health apps (Moody Month, Bearable) → Medication interaction logger (psych meds + contraceptive data fusion).
   - Spiritual apps (Saged, Lunar Guide) → Lunar Cycle Sync (mythology + cycle science blend).
   - Community apps (Period Angels, mySysters) → Period Poverty Access (product mapping + peer support).

5. **Cycle syncing nutrition:** Hype heavily outweighs evidence. Skip as a feature unless integrating academic evidence (e.g., "caloric needs increase ~200 cal/day mid-luteal on average; listen to your body"). Avoid influencer-style claims.

6. **PMDD clinical gap:** Genuine, well-sourced, and unmet. Cardiff University's 2024 study explicitly identifies no current app meets diagnostic criteria; NICE/NHS recognize tracking gap. This is **highest-confidence idea for clinical partnership.**

7. **Contraceptive switching as competitive moat:** No existing period app does this well. Clue + Flo offer symptom logging but not method-specific audit trails. FemWell could differentiate by becoming *the* switching-decision tool, with GP-exportable reports.

---

**Files and sources used:**
- [Clue workforce cuts 2023](https://tech.eu/2023/01/19/period-tracking-startup-clue-cuts-its-workforce-by-25-per-cent/)
- [PMC 2025 contraceptive mood review](https://www.uclastresslab.org/pubs/Mengelkoch_Contraception_2025.pdf)
- [Cardiff Uni 2024 PMDD app study](https://pubmed.ncbi.nlm.nih.gov/39718601/)
- [SWAN cognitive perimenopause data (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10842974/)
- [FemTech World best menopause apps UK 2026](https://www.femtechworld.co.uk/insight/best-menopause-apps-and-products-for-2026/)
- [Cycle syncing TikTok misinformation (PMC 2025)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12204122/)
- [Period poverty UK research (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9282460/)
