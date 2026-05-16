# Femwell: From Cycle Tracker to Complete Life Planner for UK Women

**Strategic product research, May 2026**
**Author: Cowork research, for the Femwell roadmap**
**Status: Working draft. Living doc. Updates expected as MPs ship and live-walks reshape priors.**

---

## 0. Why this document exists

Femwell today ships as a cycle-anchored wellness app for UK women. The Today + Cycle Planner, Lifestyle, Track, Nutrition, Programs, Community, Journal, Care Bridge and Jess together describe a coherent product — but a product whose centre of gravity is "what phase am I in this month?" That is enough to win a 25-to-38-year-old urban professional with a textbook 28-day cycle and a non-clinical mental health load. It is **not** enough to win the rest of the female lifespan.

The female user base Femwell is implicitly walking past every day:

- A 14-year-old in Year 10 whose first period landed five months ago and is still completely irregular, who has no language for the mood crash before a bleed, and whose mother is afraid to download a "fertility app" onto her child's phone.
- A 31-year-old who has been trying to conceive for 14 months and is on her second IUI cycle. Her cycle ribbon now means something completely different — it's a clinical timeline, not a vibe forecast.
- A 27-week pregnant 33-year-old who opens Femwell, sees a menstrual cycle wheel, and feels invisible.
- A 47-year-old in early perimenopause whose cycles range from 19 to 62 days. The phase ribbon is a lie. The "follicular" colour is now an insult.
- A 28-year-old with PCOS who has not bled in 113 days. The wheel says she is "late." She knows she is not late. She is PCOS.
- A 62-year-old post-menopausal woman with a husband on the spectrum, a mother with dementia, joint pain creeping into her hands, and a real fear of osteoporosis. She does not exist in Femwell at all.

These six women are not a fringe. They are the **majority of the UK female population**. ONS puts the UK female population at roughly 34 million; only about 9-10 million of them are in the 18–35 "standard cycling adult" band Femwell is currently optimised for. The other roughly 24 million are teenagers, TTC, pregnant, postpartum, perimenopausal, post-menopausal, or living with a cycle-altering condition — and Femwell either ignores them or treats them as edge cases.

The strategic question this document tries to answer is therefore not "what features should we add next?" It is: **what would Femwell look like if its job were to be the wellness planner across the entire female lifespan, and how do we ship enough of that to clear the 6-month sale window without bricking the product or the brand?**

This is not a feature list dressed up as strategy. It is a map of where the product needs to grow, what already exists in the market we can learn from, what the live competitors do well, where the genuine gaps are, and what we should and should not try to build in the runway we have.

---

## 1. Life stages: the full female lifespan

Femwell needs to think in **life stages**, not "the cycle." The cycle is one input among many. The life stage is the lens through which every input is interpreted. A 17 mm endometrium reading means something completely different in a TTC user and a perimenopausal user. A 4 a.m. wake-up means something completely different to a postpartum mother and a teenager. Below: each stage, what the user is actually doing, what hurts, and what Femwell would have to do to genuinely serve her.

### 1.1 Teenage years — menarche to 18

**Population**: ONS estimates roughly 2 million UK girls aged 9–17. Menarche in the UK now averages around 12 years 6 months, with a tail back to 9 and forward to 16. Many girls in this band are not yet sexually active, are still in school, and are using a phone heavily supervised by parents.

**What the user is doing**: trying to figure out if her cycle is "normal" when it's been six months and she's only had two periods. Working out whether the cramp she has right now is "should I take paracetamol" or "should I tell mum." Living with a mood crash the day before her period and not connecting the dots. Sometimes — and this is the dark band of this stage — developing disordered eating, anxiety, depression, or self-harm patterns that an attentive app could surface earlier than the GP ever will.

**What hurts most**:

1. **Irregularity anxiety**. The NHS guidance is that cycles can stay irregular for up to two years post-menarche, but no one tells the 14-year-old that. She googles it at midnight, lands on a fertility forum, and panics.
2. **Pain dismissal**. UK girls report period pain so severe it interferes with school, but the cultural default is "everyone gets cramps." Early endometriosis and adenomyosis are routinely missed for 7–9 years. The app could be the first place the pattern is named.
3. **Mood + period overlap**. PMDD onset can be as early as 13–14, but the diagnostic pathway requires two months of structured tracking that almost no teenager keeps. The app could be the structured tracking.
4. **Body image landmines**. Phase-aware "fuel your body" content is delicate territory in this age band — the same words that empower a 28-year-old can be a calorie-counting trigger for a 15-year-old. The brand voice rule "permissive, body-aware, not body-negative" applies here at maximum strictness.
5. **Privacy + parental visibility**. The hardest design problem in the teen stage. A 14-year-old with a controlling parent must be able to use Femwell with discretion. A 13-year-old whose mum *is* engaged and supportive should be able to share selectively. Both are real and need different defaults.

**What Femwell should DO for teenage users**:

- **Teen Mode** with a different visual treatment — softer copy, no fertility-window content gated behind a switch, no contraception talk by default, no pregnancy mode access. Activated by self-declared age at signup (under 18 → Teen Mode by default; reversible at 18+).
- **"Still learning your cycle" honesty band**. Femwell's existing confidence-honesty pattern (says "still learning" when sample size < 4 cycles) maps perfectly here. A teenager often only has 1–3 cycles. Lean into that. Tell her the chart is not a prediction, it is a learning record.
- **Parent Bridge** (opt-in, never default-on). A separate read-only view a teenager can grant to one parent. The teenager controls what's visible: just dates? Dates + symptoms? Mood? She can revoke at any time. The teenager owns the data; the parent is a guest.
- **GP-ready summary**. NHS GP appointments are 10 minutes. A teenager has no language and no chart. A one-page PDF that says "Here are her last six cycles, mean length 41 days, max 73, pain scores trending up months 3–6, GCSE mocks correlate with cycle disruption" would change the appointment.
- **Mental-health soft floor**. PHQ-9 / GAD-7 prompts repurposed for teens, but ONLY surfaced after enough trust is built and only as a "would you like to check in?" — never pushed. Crisis links to Childline, Samaritans, NHS 111, and YoungMinds, surfaced when crisis language is detected. This must be designed with a clinical advisor; it is the single highest-stakes feature in the product.

### 1.2 Reproductive years — 18 to 35

**Population**: roughly 7 million UK women. This is Femwell's current sweet spot.

**What the user is doing**: tracking cycles, planning life around them, making contraception decisions, navigating partner relationships, building a career, managing the social load of mid-20s and early 30s, and increasingly making the TTC-or-not decision in her 30s. The cycle is genuinely a "vibe forecast" for many of these users — it's a lens on energy, mood, productivity, libido, social capacity.

**What hurts most**:

1. **Cycle vs. life mismatch**. A board presentation lands in luteal week. A wedding in PMS week. A holiday clashes with the bleed. The planner has no power over the calendar but should give the user *agency* — heads-up, swap suggestions, partner-sync.
2. **Contraception decisions are made blind**. The pill, the coil, the implant, the patch, the ring — UK women rotate through these without anywhere to log what each one did to their mood, weight, libido, skin. Femwell could be the first place that decision actually has a memory.
3. **Career stress without language**. Cyclical capacity exists; corporate culture pretends it doesn't. Femwell can give the user the *internal* language ("I am at 70% executive function this week") without forcing her to disclose it externally.
4. **Partner sync is half-done in every app**. Including Femwell. The partner-sync surface should be more than "he sees your phase." It should be a tool for two people to coordinate a life.
5. **Pre-TTC drift**. The 32-year-old who is *thinking* about TTC but is not yet trying. There is no mode for her in any app on the market. She is just a "regular cycling adult" until she clicks the TTC switch. That is a wasted year of preparation data.

**What Femwell should DO**:

- **Capacity-aware planner**. The current Today tab is well placed for this. Each day gets a soft capacity hint, not a hard label. A 9 a.m. meeting load is overlaid with the cycle ribbon. The user can flag "this is a heavy week, can you suggest swaps?" — Jess pulls in the next-week forecast and proposes which deadlines fall in lower-capacity windows.
- **Contraception Memory**. A first-class entity. Date started, type, dose, route. Side effects logged daily and aggregated. At 3, 6, 12 months: "your mood baseline dropped 0.4 points after starting Cerelle. Worth a chat with your GP?" Most relationship apps log birthdays; no app logs the most consequential medical decision millions of UK women make annually.
- **Pre-TTC mode**. A "thinking about it" tier. Switches on AMH conversation prompts, folic acid nudges (NHS recommends 400 mcg daily from before conception), partner conversation prompts. Doesn't pretend she is TTC; just primes her with three months of better data when she does decide.
- **Partner Sync 2.0**. Currently most likely a one-way visibility share. Should be a true two-sided surface — calendar overlay, conversation prompts ("she's in late luteal this week, here are three things that historically help"), an actual shared "us" view.

### 1.3 TTC — trying to conceive

**Population**: roughly 1 in 7 UK couples experience fertility difficulty. Active TTC at any moment in the UK is on the order of 500k–800k women.

**What the user is doing**: tracking ovulation with sometimes obsessive precision, taking BBT each morning, timing intercourse, taking folic acid + vitamin D + prenatal supplements, increasingly seeing private clinics (Femwell's UK context makes this important — NHS IVF access varies dramatically by ICB; many couples go private at £5–8k a cycle), navigating miscarriage, navigating IUI/IVF cycles, navigating the months between IVF attempts.

**What hurts most**:

1. **The two-week wait**. The hardest 14 days in TTC. Every twinge is interpreted. Most apps offer nothing here. Femwell could.
2. **Confirmation bias in fertile-window prediction**. Apps that confidently draw a fertile-window box are often wrong. Natural Cycles' position — "we measure, we don't predict" — is the gold standard here. Femwell should not pretend to know.
3. **Miscarriage**. Miscarriage rates are roughly 1 in 4 known pregnancies in the UK. The app needs a "I lost it" path that is gentle, that does not erase the data, that does not start playing pregnancy-week emails to a grieving woman, and that surfaces UK-specific resources (Tommy's, Miscarriage Association, NHS bereavement midwives).
4. **IVF / IUI cycle logistics**. Stim cycles run on a clock most apps cannot model. Trigger shot timing. Egg collection date. Embryo transfer date. Beta hCG dates. The cycle calendar is replaced by a clinical calendar.
5. **Partner intimacy under schedule**. "Sex on demand" is one of the documented hardest parts of TTC for couples. The app should hold this with humour and tenderness, not as a checklist.

**What Femwell should DO**:

- **TTC Mode** as a true mode shift (not just a colour change). Replaces the cycle ribbon with an ovulation prediction band built on BBT + symptoms + (optional) OPK photo logging à la Premom. Surfaces the fertile window with a confidence-honest tone ("most likely fertile Tues–Fri; lower confidence because BBT not yet logged this cycle"). Adds a two-week-wait companion that does NOT pretend to know whether she is pregnant.
- **Cycle Day Math** with clinical labels. CD1, CD8, CD14, etc. Visible. Because that is what the clinic uses.
- **IVF / IUI sub-mode**. Add the clinical milestones — stim start, scan dates, trigger, retrieval, transfer, beta. Replaces the entire phase ribbon with the active clinical timeline.
- **Pregnancy loss path**. A dignified mode switch that retains data, pauses pregnancy-week content, offers resource links, and asks once (only once) whether she wants to switch back to TTC, take a break, or move to a memorial mode.
- **Supplement stack** as a first-class tracker. Folic acid, vit D, iron, CoQ10, omega-3, inositol, NAC. With UK pricing context (£/month) and links to NHS-approved guidance rather than supplement-industry marketing.

### 1.4 Pregnancy — T1, T2, T3

**Population**: roughly 600k–700k UK pregnancies annually.

**What the user is doing**: monitoring symptoms week-by-week, attending NHS scan appointments (12-week dating, 20-week anomaly), navigating the consultant-vs-midwife pathway, deciding hospital vs. birth-centre vs. home birth, building a birth plan, packing a hospital bag, fearing a miscarriage in T1, fearing pre-eclampsia and gestational diabetes in T2-T3, counting kicks in T3.

**What hurts most**:

1. **Information asymmetry around scans**. NHS scan reports come back with abbreviations (BPD, HC, AC, FL, EFW) and a terse summary that often *underspecifies* what the parent should worry about and what is fine. There is a real product opportunity here.
2. **Symptom navigation**. Is this normal? Is this reduced movement? Should I call the day-assessment unit? Apps that just say "you might feel tired" do not help her at 2 a.m.
3. **Appointment cadence is opaque**. The NHS antenatal schedule is not consistent across trusts. Women miss appointments they didn't realise they had. The app could mirror the trust's schedule.
4. **Birth planning is mostly done badly**. A birth plan written by a 36-week pregnant woman after a long shift, copy-pasted from a Mumsnet template, that her midwife glances at once.
5. **Mental health in pregnancy**. Antenatal depression is under-recognised. PHQ-9/GAD-7 monitoring with a low threshold for offering perinatal mental health team referral would be transformative.

**What Femwell should DO**:

- **Pregnancy Mode** as a complete mode replacement. The cycle ribbon becomes the pregnancy week ribbon, T1/T2/T3 instead of menstrual/follicular/ovulatory/luteal. Daily content rewires to the pregnancy week.
- **Scan-result decoder**. Photo the NHS scan report → it reads back the abbreviations in plain English. EFW = estimated fetal weight; centile bands explained; what would prompt a re-scan; what is reassurance vs. monitoring vs. concern. Built with an NHS obstetrician on the advisory side. (Liability section below — this is the highest-medical-liability feature in this whole document and must be designed with care.)
- **NHS appointment mirror**. User enters her trust; the app maps the standard schedule (booking, 12-wk, 16-wk, 20-wk, 25-wk if primip, 28-wk, 31-wk if primip, 34-wk, 36-wk, 38-wk, 40-wk, 41-wk). She can sync her actual letters.
- **Kick counter**. Standard from week 24-28 onwards. Trends, not single readings — RCOG guidance is that *change* matters more than absolute count.
- **Birth-plan composer**. Not a free-text box. A structured walkthrough — pain relief preferences, monitoring preferences, who's in the room, immediate skin-to-skin, vitamin K, cord clamping, photography, the unexpected-section section. Outputs a one-page PDF her midwife will actually read.
- **Hospital bag list** dynamic to UK trust norms.
- **Care Bridge for pregnancy**. Femwell's existing clinician handoff surface, repurposed to share with the community midwife.

### 1.5 Postpartum — the fourth trimester and beyond

**Population**: every one of the 600k–700k UK pregnancies that progress to birth.

**What the user is doing**: surviving. The fourth trimester is brutal. She is healing physically (vaginal birth tear, episiotomy, c-section incision, lochia, pelvic floor, diastasis), recovering emotionally (baby blues that may become PND), breastfeeding or formula-feeding (each with its own load), sleep-deprived, and trying to work out whether her body will ever feel like her own again. Then, at some point in the next 3–24 months, her period comes back and the cycle re-emerges into a completely different life.

**What hurts most**:

1. **Pelvic floor neglect**. NHS guidance is universal pelvic floor work post-birth; reality is most women do not get adequate physio. Apps like Squeezy (NHS-developed) exist; Femwell could embed.
2. **PND under-detection**. Edinburgh Postnatal Depression Scale (EPDS) is the standard but rarely repeated at home.
3. **Breastfeeding without support**. Feed timing, side-switching, latch, supply. Not Femwell's core skill, but a missing tracker layer is a gap.
4. **Return of period prediction**. Lactational amenorrhea makes this hard. The user wants a heads-up, not a precise date.
5. **Sex, again**. The 6-week check rarely meaningfully addresses postpartum sex and libido. The app can.

**What Femwell should DO**:

- **Postpartum Mode** that lasts as long as the user wants. Default 12 months, extendable. Centres healing, sleep, mood, feeding.
- **EPDS at 2, 4, 6, 8, 12 weeks**, with low-threshold "this score warrants a GP conversation; here is a one-page summary you can take."
- **Pelvic-floor program** built on NHS-aligned protocols. Daily nudges. Phase-of-healing aware (no week-1 reverse crunches).
- **Feeding tracker** — minimal, not Huckleberry-clone but enough.
- **Return-of-period prediction** as a confidence-banded forecast, not a date.
- **Care Bridge for health visitor and GP**. The 6-week check is a single conversation; the data Femwell holds could make it 10x more useful.

### 1.6 Perimenopause — typically 40 to 52

**Population**: roughly 5 million UK women at any given time are in perimenopause.

**What the user is doing**: noticing things. Cycles getting shorter then longer then missing. Hot flushes, especially at night. Sleep disruption. Mood changes — anxiety often more than depression in this band. Cognitive complaints (the much-talked-about "brain fog"). Weight redistribution. Joint pain. Hair changes. Vaginal dryness. Libido changes. Some of these are HRT-responsive; some are not. The decision-making landscape is dense and the NHS GP appointment is 10 minutes.

**What hurts most**:

1. **The cycle ribbon is meaningless**. Phase prediction collapses. Femwell currently has no answer.
2. **Symptom load is invisible to others**. Partners, employers, GPs. She experiences it; no one else does. Tracking gives it shape.
3. **HRT decision support is genuinely hard**. Type (oestradiol patch vs gel vs tablet), progesterone (utrogestan vs Mirena vs combined), testosterone (off-label in the UK but increasingly prescribed), local vaginal oestrogen. Plus the breast cancer / cardiovascular conversation. Plus cost — many UK women now go private at £200-400/year because the NHS pathway is so slow.
4. **The GP appointment**. The same problem as every other stage but more so. A 47-year-old goes in with "I'm tired and a bit moody," and the 10-minute slot ends with antidepressants instead of HRT. NICE guidance allows symptom-based diagnosis; many GPs still order FSH bloods that NICE says are unreliable in this band.

**What Femwell should DO**:

- **Perimenopause Mode** that replaces the menstrual ribbon with a **symptom-pattern ribbon** — hot flush count, sleep score, mood score, brain-fog self-report.
- **Symptom-to-GP report**. A monthly one-page PDF: top 3 symptoms by frequency, severity trends, any night-sweat-driven sleep loss, mood score baseline, any vaginal/urinary symptoms (often the under-reported lever).
- **HRT decision support**. Not "what should you take" — that is a clinician's job. **"Here are the questions to ask your GP."** With UK-specific framing: NHS prescription cost (£9.90/item or a PPC, or HRT-specific prescription certificate at £19.80/yr); private clinic context if NHS is gridlocked.
- **HRT log** as a first-class entity. Type, dose, route, start date. Symptom score correlated against the start. At 3 months: "since starting your oestradiol patch, hot flush frequency is down 60%, sleep score up 18%, mood unchanged. Are you due a review?"
- **Bone + cardiovascular context**. Perimenopause is the entry to lifelong bone density risk. Femwell can prompt the DEXA conversation at the right time.

### 1.7 Menopause and post-menopause

**Population**: roughly 13 million UK women are post-menopausal at any time (12 months since last period). This stage lasts the rest of her life — 30+ years for most.

**What the user is doing**: managing long-term consequences. Bone density. Cardiovascular risk (which after menopause matches male risk and overtakes it within a decade). Cognitive health and dementia risk. Vaginal atrophy and genitourinary syndrome of menopause (GSM) — the single most undertreated condition in this band. Libido. Weight. The pivot of life — empty nest, ageing parents, career late-stage, retirement planning.

**What hurts most**:

1. **The "you're done now" framing**. Every cycle app drops her at 55. Femwell can pick her up.
2. **GSM is the silent epidemic**. Local vaginal oestrogen is safe, effective, cheap, and dramatically under-prescribed. The app can name it.
3. **Bone + heart**. Both are silent until they aren't. DEXA, lipids, blood pressure — all become app-relevant.
4. **The pivot**. She is rethinking everything. The "life planner" framing has never been more apt.

**What Femwell should DO**:

- **Post-Menopause Mode**. Drops the cycle entirely. Centres on health monitoring, GSM, sleep, mood, bone, heart, and life-planning.
- **GSM self-screen and treatment tracker**. UK-specific — local oestrogen is over-the-counter as Gina (estradiol 10mcg pessary) for women 50+ post-menopausal who have been without HRT for 12 months. Femwell can be the first place she discovers this exists.
- **Annual health rhythm**. DEXA reminder cadence, smear test cadence (NHS now extends to 5-yearly for HPV-negative results), breast screening cadence (NHS Breast Screening Programme invites every 3 years from 50–71).
- **Life-pivot planning**. The app's "complete life planner" claim earns its keep here. Sleep, movement, nutrition, mental wellbeing, family planning (the *care* kind — eldercare, grandchild support), finances, creative projects.

---

## 2. Medical conditions — what cycle-tracking misses

| Condition | UK prevalence (approx) | How the cycle differs | What the app should DO | Hooks needed |
|---|---|---|---|---|
| **PCOS** | 1 in 10 women of repro age (~3M UK) | Cycles long (35+ days) or absent. Ovulation absent or rare. Phase prediction fails. | PCOS Mode replaces ribbon with **symptom + metabolic** view: hirsutism, acne, weight, insulin (HOMA-IR if logged), mood. Cycle treated as *event-based*, not phase-based. Surface lifestyle interventions evidence-graded. | Free-text "no period" path that doesn't pathologise. Lab import (HbA1c, fasting insulin, free testosterone, SHBG). |
| **Endometriosis** | 1 in 10 women (~3M UK); avg dx delay 8 years | Heavy, painful periods; mid-cycle pain; deep dyspareunia; bowel/bladder symptoms cyclical with bleed. | Pain-mapping body diagram (à la **Phendo**). Severity scoring. Pattern correlation with bowel/bladder/sex/mood. Pre-laparoscopy and post-surgery sub-modes. | Pain location entity. Surgery log. Surgical outcomes ("did surgery help" check-ins). |
| **PMDD** | ~5–8% of menstruating women (~700k UK) | Severe cyclical mood disorder, luteal-locked, remits with bleed. Diagnosis requires 2-month prospective DRSP-style tracking. | Built-in **Daily Record of Severity of Problems (DRSP)** tracking. After 2 cycles, generate a DRSP report a UK GP can use to refer to specialist services. | DRSP-format daily check-in. Crisis-language detection. Specialist referral resource list (UK has limited PMDD specialist clinics — Hammersmith, Newson Health, NAPS). |
| **Fibroids** | 20–40% of women by 50; symptomatic ~10–15% | Heavy menstrual bleeding (HMB), longer bleeds, anaemia symptoms. | Period flow scoring with NHS-aligned thresholds for HMB (>80ml/cycle, soaking pads/tampons hourly, clots). Anaemia symptom watch. Pre/post-Mirena/myomectomy/UFE/hysterectomy modes. | Flow tracking with volume mapping. Hb/ferritin lab import. |
| **Adenomyosis** | Often co-occurs with fibroids; under-recognised | Heavy bleeding + severe cramping + bulky tender uterus | Same as fibroids + pelvic pain map. Tracking helps build the case for MRI referral. | Same as endo + fibroids. |
| **POI** (Premature Ovarian Insufficiency) | 1% by 40 | Cycles cease before 40. HRT recommended until natural menopause age (51). | Different framing entirely — POI Mode is *young person on HRT*. Bone, heart, fertility, mental health (POI is associated with high anxiety/depression). Care Bridge to specialist endocrinologist. | HRT log. AMH/FSH lab import. Specialist clinician contact. |
| **Hypothyroid / Hyperthyroid** | 2-3% UK women hypo, 1% hyper | Cycle length altered, heavier/lighter, mood and energy strongly affected | Cross-correlate cycle with TSH/free T4 readings. Surface "your cycle changed when your TSH crossed 4 — talk to your GP about dose." | Lab import (TSH, free T4, free T3, antibodies). Medication log (levothyroxine, etc.). |
| **Hashimoto's / Lupus / RA** | 1-2% UK women | Cycle disruption + autoimmune flare patterns often cycle-coupled (luteal flares common) | Flare tracking + cycle overlay. Surface to user when pattern emerges. | Flare entity. Medication log including DMARDs, hydroxychloroquine, methotrexate, biologics. |
| **HRT users (any age)** | Growing population. ~2.6M UK on HRT (2024 figures) | Cycle either suppressed, regulated, or replaced. | HRT Mode (cuts across life stages). Type, dose, route, side-effect tracking, breakthrough bleed log, GP review reminders. | HRT entity. Symptom-to-dose-change correlation. UK-specific HRT product list (utrogestan, oestrogel, sandrena, evorel, mirena IUS used as progesterone arm, AndroFeme/Testogel for testosterone). |
| **Cancer survivors** | Cycle-affecting cancers (breast, ovarian, endometrial, cervical) | Cycle disrupted by chemo, surgery, tamoxifen/AI's. Often *induced menopause* in 30s/40s. | Cancer-survivor mode. Sensitive content gating ("we won't show fertility content"). Treatment-side-effect tracker. Long-term lymphoedema, bone, mood, libido. | Treatment timeline entity. Sensitive-content flags. |
| **Hypothalamic Amenorrhea / eating disorders** | Hard to estimate; significant in athletic + restrictive eating populations | No period for months. Phase ribbon dangerously meaningless. | This is the most sensitive section in this whole document. Femwell should **NEVER pretend to predict a cycle in HA**. The right move is a recovery-supporting mode that does not gamify eating, weight, or training. Care Bridge to GP and ideally to a specialist (UK orgs: Beat, FEAST). | Recovery-mode flag that suppresses all calorie/macro content. Crisis-language detection. UK helpline directory. |

Every condition has the same architectural ask: **the cycle ribbon is the wrong metaphor for these users**. They need their *condition* as the dominant frame, with the cycle as one input among many.

---

## 3. Life planning dimensions beyond the cycle

A "complete life planner for women" is a real thing if Femwell treats the cycle as one **lens** on a larger life, not as the trunk of the product. Here are the dimensions a complete life planner covers, and how each plugs into Femwell.

### 3.1 Sleep
- Track total sleep, wake count, perceived quality (1-10), partner snore (a lever many women under-recognise as their *own* problem).
- Hooks: phase-aware (luteal sleep often worse), perimenopause-aware (night sweats), postpartum-aware (fragmented).
- Surface: "your sleep score drops 20% on average in late luteal — try the wind-down ritual from Daily Story tonight?"

### 3.2 Nutrition — cycle-synced eating
- Femwell already has Nutrition. The opportunity is to make it **phase-aware without dogma**. Cycle-synced eating is genuinely under-evidenced; Femwell should be honest about that.
- The strongest claims: iron + B12 in/around menses; carbohydrate tolerance varies across the cycle for some women; sodium restriction late luteal can blunt bloat.
- Avoid: hard rules. "Eat seeds on day 14" is unevidenced and reads as silly to medical users.

### 3.3 Movement — phase-aware training
- Steal directly from **FitrWoman** and **Wild.AI**: training recommendations as gentle *suggestions* tied to phase + symptoms, not prescriptions.
- For perimenopausal users, resistance training emerges as the single highest-impact intervention. Femwell should know that and lean in.
- For postpartum users, return-to-running protocols (the NHS-aligned "Returning to running postnatal" guidelines from Goom/Donnelly et al.) should be available.

### 3.4 Mental health
- PHQ-9, GAD-7, EPDS, DRSP — Femwell should have all four as opt-in surveys at the right life-stage triggers.
- Mood + cycle correlation already exists; deepen it.
- Therapy logging — many UK women self-fund therapy at £60-100/session. A simple "session date + topic + how I felt after" tracker is genuinely useful.
- Crisis flow: Samaritans, NHS 111, NHS Talking Therapies self-referral.

### 3.5 Relationships
- Partner Sync — covered above.
- Friend / family bandwidth: "I have capacity for one social plan this week" — a soft self-report that the planner respects.

### 3.6 Work / productivity
- Capacity-aware day view. Already discussed.
- Calendar integration (read-only, opt-in). Femwell sees the meeting load; it doesn't read content. It just sees density.
- "Heavy weeks ahead" briefing on Sunday night.

### 3.7 Finances
- Period-product budget — £8-15/month average across the UK, £80-180/year. Add up over a lifetime — it matters.
- HRT cost — NHS prescription certificate at £19.80/year for HRT, or private at £200-400/year. The app can flag the saving.
- Supplement spend — easy to drift to £30-60/month. Femwell can be honest about which the user logs vs. which she'd really benefit from.
- Cycle-aware spending — there is real data that late luteal correlates with discretionary spend spikes for some women. A gentle self-awareness surface, not a finger-wag.

### 3.8 Creative projects
- Phase-aware ideation prompts. Follicular for divergent thinking, luteal for editing and finishing. Soft, not prescriptive.
- "Project shelf" — three things she's working on, light-touch tracking.

### 3.9 Spirituality
- Femwell already has Horoscope on Lifestyle. Don't expand it elsewhere — the memory note is explicit on this.
- Lunar phase overlay (already lightly there) as an optional layer.
- Daily Story as the prose-poetic layer of the product.

### 3.10 Medical appointments + medications + supplements
- Calendar of upcoming UK appointments (GP, dentist, optician, smear, breast screen, DEXA, antenatal, postnatal, fertility, mental health).
- Medication tracker with refill reminders. NHS repeat prescription cadence.
- Supplement stack with cost.

### 3.11 Family planning (TTC + contraception + decisions)
- Contraception Memory (above).
- TTC Mode (above).
- Decision support: "thinking about coming off the pill" walkthrough; "thinking about TTC" walkthrough; "thinking about another baby" walkthrough.

### 3.12 Career
- Cycle-aware goal setting — quarterly OKRs that respect cyclical capacity.
- Maternity leave planning (UK-specific: SMP, occupational maternity pay, KIT days, return-to-work timing, childcare ratios).
- Menopause + work — the under-served bit. UK employers are slowly waking up; Femwell can give the user the language to ask for what she needs.

### 3.13 Personal development
- Reading log (this is where the Long Room and Daily Story plug in beautifully).
- Skill-building soft tracking.
- Phase-aware learning suggestion: "your focus tends to peak follicular — bookmark that course for next week?"

---

## 4. Adjacent-space app benchmarks — what each does well, what to steal

### 4.1 Pregnancy

**Ovia** — the strongest pregnancy app. Steals: week-by-week 3D fetal illustrations; **kick counter + contraction timer** with NHS-aligned thresholds; **family share** read-only view (partner sees daily updates without seeing logs). Note: Ovia's standalone Pregnancy app sunsets March 2026, with the experience folded into the main Ovia app — a hint that the market is consolidating around all-life-stage apps. Confirms Femwell's strategic direction.

**The Bump** — strong content library and a registry/shopping side. Femwell should not enter retail. Steal: structured **birth-plan composer**.

**BabyCentre UK** — UK-specific NHS-aligned content, "your week" updates with weight in grams not pounds. Steal: UK-specific antenatal schedule mirror.

**Peanut** — community for women across TTC, pregnancy, motherhood, menopause. Steal: **Bump Buddies** (matched by due date); **Pods** (live audio without video pressure — perfect for postpartum 3 a.m. solidarity). Peanut Track is their pregnancy tracking layer.

**Flo Pregnancy mode** — Flo's biggest competitive advantage is the seamless menstrual→pregnancy→postpartum transition. Femwell should match this and exceed it on UK-context.

### 4.2 Menopause

**Balance** (Dr Louise Newson) — the UK-default menopause app. Steal: **Health Report** generated from journal logs (the 2026 update made this much smoother — no separate questionnaire); evidence-based content from clinicians; **Partner View** so partners can read about hormone health without snooping; **Balance+** as a model for paid tier (in-depth collections, live Q&A sessions). Note: Femwell directly competes here; the strategic move is not to copy Balance but to be the *cycle-to-menopause continuum* that Balance is not.

**Caria** — Siri-shortcut voice logging; daily symptom scoring; CBT for menopause; community. Steal: **voice-log via Siri**.

**Elektra Health** — clinician-paired model (US-only, currently). Now bundled into Oscar Health's HelloMeno insurance plan. Not directly replicable in UK NHS context, but the **coach-paired symptom log** model is strong. Femwell's Care Bridge is the equivalent surface.

**Stella** — UK-based menopause platform with clinician access, symptom tracking, and HRT prescribing. Direct competitor. Femwell should observe Stella's pricing (£99/year for digital, £x for clinician access) and content depth.

### 4.3 Fertility / TTC

**Natural Cycles** — the only FDA-cleared birth control app, Class II medical device. Now (March 2026) integrates Garmin smartwatches for overnight skin-temp tracking; previously had Apple Watch integration. Five modes: NC° Birth Control, NC° Plan Pregnancy, NC° Follow Pregnancy, NC° Postpartum, NC° Perimenopause. **The most directly relevant competitor for the all-life-stage architecture.** Steal: the **mode switching** UX and the **measurement-over-prediction** stance.

**Glow** — older school but solid TTC; Glow Premium has more aggressive ovulation prediction. Steal: nothing especially; observe for community pattern.

**Ava** — wristband-based fertility tracker. Hardware play; not Femwell's lane.

**Premom** — **photo-based OPK reading** with AI quantification of test line darkness. Cheap competitive advantage. Steal: the OPK photo logger as a feature; PCOS-aware BBT interpretation.

**Mira** — hormone monitor with quantitative LH/FSH/E3G/PdG; algorithm trained on 30M+ data points. Hardware play. Steal: the **multi-hormone view** as a thinking model for what data Femwell could ingest from connected devices.

### 4.4 General planning

**Notion** — flexible but not opinionated. Steal: nothing directly; observe how some users build "cycle dashboards" in Notion as a signal of unmet need Femwell should meet.

**Structured** — timeline-based day planner. Steal: the **timeline view** as a different way to render a day with cycle context overlaid.

**Things 3** — beloved for clean task design. Steal: the **inbox + today + upcoming** pattern; the restraint.

**Sunsama** — calendar + task + reflection. Steal: the **end-of-day reflection** ritual.

**Motion** — AI-rescheduling. Aggressive. Femwell should not auto-reschedule, but **suggest reschedule** based on cycle + capacity is a good fit.

### 4.5 Mental health

**Headspace / Calm** — meditation libraries. Steal: the **session-length granularity** (3 min, 10 min, 20 min) and the **streak without shame** mechanic.

**Woebot** — CBT chatbot. Pursuing FDA De Novo classification. Steal: the **CBT-conversation framing** for Jess when the user surfaces mood concerns.

**BetterHelp** — therapy marketplace. Femwell should not become a marketplace; should signpost to NHS Talking Therapies.

**Wysa** — FDA Breakthrough Device Designation; CBT + DBT + mindfulness chat; built-in escalation to human support. Steal: the **escalation pathway** — when the conversation gets to crisis language, the app hands off cleanly. This is the model for Jess + crisis.

**Bloom** — therapy-style guided sessions. Steal: nothing essential; observe the production quality.

### 4.6 Women's health holistic

**Maven Clinic** — virtual women's and family health (US-only direct, B2B globally). Just launched **Maven Intelligence** — agentic AI embedded in care delivery. Steal: the **conversational AI as a care orchestrator** framing for Jess. Femwell can't be a clinic; it can be the daily companion that prepares users for NHS / private clinic visits.

**Tia** — hybrid digital + physical clinics in major US cities. Not replicable for Femwell. Observation: hybrid models are winning the high end of the US market; the UK equivalent would partner with private GP networks (Babylon-era is over, but the model is moving toward bespoke memberships).

**Hers** (US) — telehealth + prescribing. UK reg model doesn't allow easy direct replication. Steal: the **branded care packaging** — taking the chaos out of "which supplement, which dose."

**Wild AI** — cycle/perimenopause/menopause-aware training plans. Already discussed.

**FitrWoman** — Already discussed.

**28 by Brittany Mahomes** — cycle-synced training program. Celebrity-fronted. Femwell does not need celebrity but does need the structured **28-day program** unit — challenges anchored to one full cycle.

---

## 5. The gaps — what no app does well yet

After mapping the landscape, the genuine gaps — what Femwell could *uniquely* be — are:

1. **The continuum**. No UK app gracefully follows a woman from menarche to post-menopause. Flo and Natural Cycles get close but stop at menopause. Balance starts at perimenopause. Femwell is positioned to be the **lifelong continuum**.

2. **Confidence honesty**. Femwell's existing "still learning when n < 4 cycles" pattern is a brand differentiator most apps don't have. Flo confidently predicts cycles that have never been regular. Natural Cycles is honest only about ovulation. Femwell can be honest about everything.

3. **UK NHS context**. Every app above is either US-built or US-bigger-than-UK. Femwell is UK-native. The NHS rhythms (booking visit, 12-wk and 20-wk scans, 6-wk postnatal check, 3-yearly smear / 5-yearly HPV-negative, 3-yearly mammogram, 7-yearly DEXA, antenatal-class week 28, perinatal-mental-health-team threshold) are a genuine moat.

4. **Condition-first vs cycle-first**. PCOS users, endo users, fibroids users, HA users — none get a good experience in cycle-first apps. Femwell can lead here with mode switching that doesn't treat them as edge cases.

5. **The teen-to-adult handover**. No app gracefully transitions a 17-year-old to an 18-year-old account with carry-over of data, settings, and trust. Femwell can build this.

6. **The grief-aware modes**. Miscarriage, stillbirth, infertility, induced menopause from cancer treatment, surgical menopause from oophorectomy. The app industry handles these clumsily or not at all. Femwell can be the one that does it right.

7. **The clinician handoff**. Care Bridge is a real product surface that very few apps have built well. A one-page PDF the GP will actually read is the unlock.

8. **Partner sync as actual product, not vanity feature**. Most partner-sync features are one-way "he sees your phase." Femwell can build a **co-planning** surface.

9. **Brand voice as accessibility**. The brand voice rules (no emoji, Fraunces + Inter, plum/rose/sage/gold, permissive not pathologising) describe a product that *feels* unlike any of the competitors. That is a real differentiator that maps to retention.

---

## 6. Top features by life stage

### 6.1 Teenager (menarche to 18) — top 7

1. **Teen Mode toggle** with safe-default content (no fertility windows, no contraception talk gated).
2. **Cycle-learning honesty** — "you've logged 3 cycles; the pattern is still emerging" copy throughout, no false predictions.
3. **Parent Bridge** — opt-in, granular, revocable. Selectively share dates, symptoms, mood with one named parent.
4. **GCSE/A-level exam-week overlay** — cycle ribbon overlaid with UK exam dates; soft heads-up before key dates.
5. **GP-ready summary PDF** for the first real period conversation with the family GP.
6. **PMS-vs-PMDD self-screen** — 2-cycle DRSP-format check-in with referral resource if score warrants.
7. **Crisis routing to Childline / YoungMinds / Samaritans / NHS 111** with clear UK-specific copy and a one-tap call action.

### 6.2 Reproductive adult (18-35) — top 7

1. **Capacity-aware planner** — overlay cycle ribbon on calendar density; soft heads-up for likely low-capacity days.
2. **Contraception Memory** as a first-class entity — type, dose, side effects, what it did to mood/weight/skin/libido.
3. **Partner Sync 2.0** — true two-sided view with shared rituals, not one-way visibility.
4. **Pre-TTC mode** for the "thinking about it" 32-year-old who isn't trying yet.
5. **Holiday + life-event smart overlay** — wedding planned → "your bleed is forecast for that week, here are options" (Norethisterone is a UK GP conversation point; mention it).
6. **Cycle-aware therapy session prep** — for users in private therapy, a "what to bring up this week" prompt that reflects current phase data.
7. **Smear/mammogram cadence reminders** with NHS letter import.

### 6.3 TTC — top 7

1. **TTC Mode** as a clean mode switch with BBT + OPK photo logger + fertile-window confidence band.
2. **Two-week-wait companion** that holds the user without pretending to predict.
3. **Miscarriage path** — gentle, data-preserving, content-pausing, resource-routing.
4. **IVF/IUI sub-mode** — clinical milestones replace the phase ribbon.
5. **Supplement stack** with UK pricing and NHS-aligned guidance.
6. **Partner intimacy under schedule** — a humour-aware feature that holds the load.
7. **Care Bridge to fertility clinic** — one-page printable for the IVF coordinator.

### 6.4 Pregnancy — top 7

1. **NHS scan-result decoder** (photo of the report → plain English).
2. **NHS antenatal schedule mirror** with trust-aware variation.
3. **Kick counter** with RCOG-aligned change-not-absolute logic.
4. **Birth-plan composer** that outputs a one-page PDF.
5. **Pregnancy-week content stream** that replaces the menstrual ribbon entirely.
6. **PHQ-9 / EPDS antenatal mental health soft floor** with perinatal mental health team referral threshold.
7. **Hospital bag list** dynamic to UK trust + birth-plan choices.

### 6.5 Postpartum — top 7

1. **EPDS at 2, 4, 6, 8, 12 weeks** with GP-ready summary if score warrants.
2. **Pelvic-floor program** built on NHS-aligned protocols, phase-of-healing aware.
3. **Feeding tracker** — light-touch, not a full Huckleberry replacement.
4. **Sleep-fragmentation tracker** that doesn't shame the user for waking 6 times.
5. **Return-of-period prediction** as a confidence band, not a date.
6. **Diastasis self-screen** with pathway to NHS women's health physio.
7. **6-week check prep** with one-page summary of mood, pain, bleeding, feeding, libido for the GP.

### 6.6 Perimenopause — top 7

1. **Perimenopause Mode** that replaces the cycle ribbon with a symptom-pattern ribbon.
2. **HRT decision support** — "questions to ask your GP" not "what should you take."
3. **HRT log** as a first-class entity with type/dose/route/symptom correlation.
4. **GP-ready perimenopause symptom report** — top 3 symptoms, severity trends, sleep impact, mood, GSM symptoms.
5. **Hot flush logger** — quick-tap, time-stamped, severity-scored.
6. **Sleep + night-sweat correlation** view.
7. **Workplace conversation prep** — language for asking for adjustments under the UK Equality Act / Worker Protection framework.

### 6.7 Menopause + post-menopause — top 7

1. **Post-Menopause Mode** that drops the cycle entirely.
2. **GSM screen + treatment tracker** including UK-specific Gina OTC option.
3. **Bone health rhythm** — DEXA cadence, weight-bearing exercise nudge.
4. **Cardiovascular check rhythm** — BP, lipids, NHS Health Check at 40-74.
5. **Vaginal health + libido** tracking with destigmatised language.
6. **Long-term HRT review** — annual GP review prep.
7. **Life-pivot planning** — empty nest, eldercare, financial transition prompts.

---

## 7. How the Planner page changes by user state

This is where the strategic argument becomes concrete. Femwell's Today + Cycle planner — the surface Halli signed off as the canvas — must respond to user state. Below: four concrete redesigns.

### 7.1 Pregnant user, T2 (20 weeks)

**Today tab**:
- Top ribbon: **Pregnancy week ribbon** — 20w 3d, "your baby is the size of a banana, ~25cm and ~300g."
- Today's primary card: **20-week anomaly scan reminder** (if upcoming) or scan-result decoder access (if just had).
- Symptoms card: pregnancy-relevant — back pain, swelling, baby movement first felt around now.
- Movement card: lighter "anything counts" copy; pelvic-girdle-pain awareness.
- Nutrition card: T2-specific — calcium, choline, omega-3, what to avoid.
- Mood: PHQ-9 antenatal check-in if due.

**Cycle tab (renamed in this mode to "Journey")**:
- Replaces the menstrual cycle ribbon with **the 40-week pregnancy timeline** — booking visit, 12-week scan (done), 16-week MW visit (done), **20-week anomaly scan (this week)**, glucose tolerance test at 24-28 if indicated, MW visits, 36-week scan if breech, term.
- The "phase" colours: T1 / T2 / T3 instead of menstrual / follicular / ovulatory / luteal.
- Kick counter shows from week 24 onwards.
- Care Bridge surface: share with community midwife.

**What disappears**: contraception, ovulation, fertile window, period prediction. Horoscope can stay (Lifestyle is unchanged). Daily Story stays. Listen stays.

### 7.2 Teenager (15, 8th cycle)

**Today tab**:
- Top ribbon: **honest cycle ribbon** — "Day 12 of an estimated 34-day cycle. We're still learning your pattern (8 cycles tracked)."
- Today's primary card: **mood + cramp check-in**, written in soft conversational copy ("how's your day going?").
- Symptoms card: only the ones a 15-year-old needs — cramps, mood, sleep, skin.
- Movement card: school PE-aware ("got PE today? Here's a quick warm-up").
- Nutrition card: deliberately **not** calorie-focused. Iron-rich foods around menses, framed as energy.
- **Parent Bridge** indicator visible at top: "Mum can see: dates only. Edit." (Or "Parent Bridge: off. Set up.")

**Cycle tab**:
- The ribbon is rendered but de-emphasised, with the honesty copy front-and-centre.
- No fertile window. No conception language.
- A **"learn about your cycle"** mini-program slot — Femwell's existing Programs surface, scoped for teens.
- GP-ready summary one-tap export.

**What disappears**: contraception (gated; appears at 16+ as opt-in), TTC, pregnancy, partner sync, HRT.

### 7.3 Perimenopausal user (49, on HRT, cycles irregular, hot flushes daily)

**Today tab**:
- Top ribbon: **symptom-pattern ribbon** — "3 hot flushes yesterday, 2 night sweats, sleep score 62/100. Symptom load: moderate."
- The cycle ribbon is **not removed but de-emphasised** — there is still a period eventually, but it is no longer the primary lens.
- Today's primary card: **HRT log** — patch change due today? Utrogestan tonight (if sequential)?
- Symptoms card: hot flushes, night sweats, mood, brain fog, joint pain, vaginal dryness.
- Sleep card: night-sweat correlation surfaced.
- Movement card: resistance-training-forward.
- Nutrition card: protein-forward, calcium-aware.

**Cycle tab (renamed "Patterns" in this mode)**:
- Replaces the menstrual ribbon with a **symptom heatmap** across the last 90 days.
- HRT timeline overlay: "you started oestradiol patch 75mcg on March 3. Hot flush frequency down 58% since."
- GP-ready perimenopause symptom report export.
- Cycle data is still tracked (irregular bleeds need logging) but is one band in a wider view, not the main visual.

**What disappears**: fertile window prediction (irrelevant). What appears: HRT log, hot flush quick-tap, GSM screen.

### 7.4 PCOS user (28, no period in 80+ days)

**Today tab**:
- Top ribbon: **NO menstrual cycle ribbon**. Instead: **"Day 84 since last bleed. PCOS Mode is on; we are not predicting your next period."**
- The user's PCOS-relevant metrics ribbon: weight trend, mood, hair/skin notes, HbA1c if logged, fasting insulin if logged.
- Today's primary card: **lifestyle anchor** — protein at breakfast, strength session, walk after lunch (the strongest-evidence levers in PCOS).
- Symptoms card: PCOS-relevant — acne, hirsutism, mood, energy, bloating.
- Nutrition card: lower-GI-leaning, anti-inflammatory framing without dogma.
- Movement card: resistance-training-forward + zone-2 cardio.
- Care Bridge: link to endocrinology / specialist gynae if user is on a referral pathway.

**Cycle tab (renamed "Hormones")**:
- The cycle ribbon is replaced with a **bleed-events list** — when bleeds happened, length, flow. Not predicting the next one.
- Lab import view — most recent HbA1c, fasting insulin, HOMA-IR if computed, free testosterone, SHBG, AMH.
- Symptom trend view across PCOS-relevant axes.
- Surface: "you haven't bled in 80 days. NHS guidance on PCOS suggests inducing a withdrawal bleed every 3-4 months to protect the endometrium. Worth a GP conversation."

**What disappears**: fertile window (meaningless). Cycle phase colours (meaningless). What appears: PCOS-relevant symptom set, lab import, bleed-event log.

---

## 8. Strategic implications — what to ship in 3 / 6 / 9 months

Femwell's runway is constrained: a 6-month sale window, 9-month soft cap. Not every life-stage expansion is shippable in that window. Here is the call.

### 8.1 Ship in 3 months (highest leverage, lowest risk)

These features extend the existing product surface without new clinical liabilities or new entities the team can't support:

1. **Pre-TTC mode** — three months of better data primes the eventual TTC switch. Existing entities. Low risk.
2. **TTC Mode v1** — BBT + OPK photo logger (the Premom-style feature). Existing Track entity extended. Confidence-banded fertile window.
3. **Perimenopause Mode v1** — symptom-pattern ribbon replaces cycle ribbon when user self-declares peri. HRT log entity added. Hot flush quick-tap.
4. **Contraception Memory** — new entity, no clinical advice, just structured logging.
5. **GP-ready PDF export** — one feature, three modes (teen, perimenopause, postpartum), big win.
6. **Confidence honesty extension** — the "still learning" pattern surfaced across more states.
7. **Care Bridge expansion** — already a surface; extend the share recipients (midwife, fertility coordinator, perinatal MH team).

### 8.2 Ship in 6 months (medium leverage, medium effort, real clinical care)

1. **Pregnancy Mode** — full mode replacement with week ribbon, content stream, NHS antenatal mirror, kick counter, birth-plan composer. This is a major build and the clinical liability is real. Needs an obstetrics advisor on the team.
2. **Postpartum Mode** — EPDS, pelvic-floor program (Squeezy-aligned), return-of-period band, 6-week check prep. Needs perinatal mental health advisor.
3. **Teen Mode** with Parent Bridge. Privacy + safeguarding design must be airtight. Needs adolescent mental health advisor and a UK safeguarding policy.
4. **PCOS Mode v1** — bleed-events, lab import, symptom set, lifestyle anchor cards.
5. **HRT decision support** — questions-to-ask-your-GP content, not prescribing advice. Needs a UK menopause specialist on the advisory side.

### 8.3 Ship in 9 months or beyond — needs partnerships, clinical sign-off, or new infrastructure

1. **NHS scan-result decoder** — the highest-liability feature in this whole document. Needs obstetrician sign-off and an MHRA assessment of whether this crosses into medical-device territory (Section 9 below).
2. **IVF / IUI sub-mode** — needs partnership with one or more fertility clinics to get clinical-timeline-import right.
3. **Endometriosis pain mapping** — Phendo-style. Doable but the user research needed to do it well is at least 3 months of qualitative work.
4. **PMDD DRSP-format** with specialist referral — needs UK PMDD specialist advisor.
5. **Crisis-language detection** + escalation to Samaritans/Childline — this is genuinely safety-critical; do not rush.
6. **Full menopause mode + GSM treatment tracker + bone/heart rhythm** — feasible but deep. The post-menopause user is a long-tail retention play; not the first 6-month win.
7. **Capacitor + StoreKit paywall via RevenueCat** — the App Store monetisation path. Memory note flags this for later; honour that.

### 8.4 Path to "complete life planner" vs "cycle tracker"

The MVP shift from "cycle tracker" to "complete life planner" is not about adding 47 features. It is about three architectural moves:

1. **Life Stage as a first-class concept**. The user has a current life stage (teen, reproductive, pre-TTC, TTC, pregnant T1/T2/T3, postpartum 0-12mo, perimenopause, menopause, post-menopause). The Today + Cycle planner adapts to her stage. Lifestyle, Nutrition, Track, Journal all consult life stage.
2. **Condition as a cross-cutting modifier**. PCOS, endo, PMDD, fibroids, thyroid, autoimmune, HRT, cancer survivor, HA. Cross-cuts life stage. A perimenopausal user can also be a fibroids user. The product respects both.
3. **Confidence honesty as a brand-wide rule**. The "still learning" pattern extends from "we don't know your cycle yet" to "we don't know if you're pregnant yet" to "we don't know what HRT will do for you yet." The brand becomes the trusted one because it doesn't lie.

That is the MVP of the complete life planner. The features in 8.1 ship this. The features in 8.2 deepen it. The features in 8.3 specialise it.

### 8.5 Monetisation linkage to the sale window

The sale window argument is: a buyer values Femwell on the **breadth of TAM it can credibly serve** and the **retention curve** that breadth produces. A cycle-tracker app with 25-35 stickiness loses users at 35 to Balance and at 30 to Ovia. A life-stage continuum app retains them.

For the 6-month window, the demonstrable shifts should be:

- A live continuum: a user signing up at 16 should see a coherent product at 16, and the same account at 32, 40, 50 should still feel native.
- A growth surface in the older bands: perimenopause + post-menopause are where UK women have disposable income, are already paying for Balance / Stella / private menopause clinics, and are demonstrably underserved by Flo/Clue. This is where Femwell's revenue ceiling lives.
- A retention story: cohort curves that show users staying engaged across a stage transition (TTC→pregnancy, pregnancy→postpartum, late-reproductive→perimenopause). One stage transition retained is worth ten new sign-ups.

The features in 8.1 are not the highest-revenue features; they are the **proof-of-architecture** features. The features in 8.2 are the highest-revenue features. The features in 8.3 are the moat-building features.

---

## 9. Risk register

What could go wrong as Femwell expands beyond the cycle. Each row is a risk Halli should track on the master plan.

### 9.1 Medical liability for non-cycle advice

**Risk**: the NHS scan-result decoder, the HRT log with correlation surfaces, the GP-ready PDF exports — each blurs the line between "tracking" and "advice." If a user acts on a Femwell surface and is harmed, the question of whether Femwell was a wellbeing app or a medical device gets asked in court.

**Mitigation**:
- Stay clearly on the *tracking + information* side of MHRA's medical device line. Femwell does not diagnose, does not prescribe, does not recommend a treatment. It logs, summarises, prepares for clinician conversations.
- Every clinical-adjacent feature has an attached UK clinician advisor.
- Crisis language detection is built and tested with a real safeguarding policy.
- Terms of service, privacy policy, and clinical disclaimer reviewed by a UK health-tech-experienced solicitor.

### 9.2 MHRA medical device classification

**Risk**: certain features (scan-result decoder; any algorithm that quantifies hormone test results to a fertility status à la Natural Cycles; any algorithm that recommends a treatment) push Femwell into Class I or Class IIa medical device territory under the new MHRA framework expected from mid-2026.

**Mitigation**:
- Pre-decode features (the scan-result decoder, especially) with a regulatory advisor before building.
- Consider whether becoming a registered medical device is a moat or a millstone — for the 6-month sale window, probably a millstone; for the 5-year defensibility story, possibly a moat.
- Watch the draft Medical Devices (Amendment) Regulations 2026 progress.

### 9.3 Brand confusion / dilution

**Risk**: Femwell becomes "everything for everyone" and means nothing to anyone. The user who arrived for cycle tracking is confused by perimenopause content; the perimenopausal user thinks it's a Gen Z app.

**Mitigation**:
- Life Stage as first-class — the product literally looks different to a teen vs a perimenopausal user. The brand is *the same*; the surface is contextual.
- Marketing per life stage in distinct campaigns. The Femwell ad to a 28-year-old TTC user is not the same ad as to a 49-year-old perimenopause user.
- Brand voice rules (Fraunces + Inter, plum/rose/sage/gold, permissive, body-aware, no emoji) hold across all stages — they are the connective tissue.

### 9.4 Feature creep + team capacity

**Risk**: this document describes a 3-year product. The team has 6-9 months. Trying to ship all of it ends in a half-shipped mess.

**Mitigation**:
- The 3/6/9 month split in Section 8 is the discipline. Anything outside it is parked.
- "No stale features" memory rule applies — every shipped feature must do work. No decorative additions.
- Lead Manager agent scopes each MP carefully. Atelier reviews each surface. Verify confirms each ship.

### 9.5 Pregnancy + sensitive-data sensitivity

**Risk**: pregnancy data is more sensitive than cycle data — particularly post-Dobbs in the US, but also in the UK with respect to insurance, employment, and partner disclosure. A data breach in pregnancy mode is materially worse than a breach in cycle mode. A miscarriage handled poorly by the app is reputationally catastrophic.

**Mitigation**:
- Pregnancy data encrypted at rest with a clear retention policy.
- Miscarriage flow user-tested with bereaved users before ship.
- No sharing with third parties of pregnancy-state data; partner sync is user-controlled.
- UK GDPR + Caldicott principles reviewed for any feature that imports NHS-source data.

### 9.6 Teen mode + safeguarding

**Risk**: a 14-year-old in distress, a crisis-language conversation handled wrong, an inappropriate parental access leak. Any of these is reputationally and legally catastrophic.

**Mitigation**:
- Teen Mode is opted in at signup by self-declared age, but Femwell must have a "user appears to be under 13" detection and an account-pause path.
- Parent Bridge is granular, revocable, transparent (the teen sees what the parent sees).
- Crisis language routed to NHS 111 / Samaritans / Childline / YoungMinds with a one-tap call action.
- UK safeguarding policy in place; advisor with adolescent mental health experience on the team.
- KSCIE-aware (Keeping Children Safe in Education) language in the policy.

### 9.7 Clinical-partnership dependency

**Risk**: features like the NHS antenatal schedule mirror, the IVF/IUI clinical-timeline integration, and the Care Bridge to specialist clinics depend on clinician relationships and possibly data sharing agreements. If Femwell builds these without partnerships, they will be janky; if it tries to build the partnerships first, it slows down.

**Mitigation**:
- Soft-launch the schedule mirror as user-entered first; partner with one NHS trust later for direct import.
- Care Bridge stays user-driven (user shares PDF / link with clinician); no direct data-sharing agreements needed in MVP.
- Build clinician advisor roster early — one obstetrician, one menopause specialist, one fertility specialist, one adolescent mental health specialist, one perinatal mental health specialist. They are paid; budget accordingly.

### 9.8 Competitive response

**Risk**: Flo announces Flo Menopause; Balance announces Balance Reproductive; Natural Cycles already has five modes. Femwell's "lifelong continuum" claim is contestable.

**Mitigation**:
- Confidence honesty + UK NHS context are not contestable in the short term. Flo would have to rebuild its prediction engine; Balance would have to build a cycle product; Natural Cycles would have to leave its medical-device lane.
- The brand voice is genuinely differentiated. Move quickly on the surfaces (Today + Cycle adaptations in Section 7) so that the product *looks* different in each stage.
- Don't try to win on AI — every player has AI now. Win on care, context, and confidence.

### 9.9 Monetisation pressure

**Risk**: with the 6-month sale window, there is pressure to ship paywall features. The memory note is explicit: paywall is parked. Doctor-Ready Diary ships free. But the broader question — when does the buyer care more about revenue than reach? — looms.

**Mitigation**:
- The 6-month strategy is **reach + retention proof**, not revenue. The buyer values the curve, not the MRR.
- The paywall design work is done in parallel as a reference but not built into the product until the sale window opens or closes.
- If the sale window closes without a buyer, the 9-month soft cap is the moment to ship the paywall; not before.

---

## 10. Strategic recommendation — headline

If Femwell ships only what's in Section 8.1 (three-month list) and nothing else, Femwell stops being a cycle tracker and becomes a credible *complete life planner* on architecture alone. Adding the contraception memory, the pre-TTC and TTC v1 modes, the perimenopause v1 mode, the GP-ready exports, and confidence honesty extended across the product is enough to tell the **continuum** story to a buyer. The features in Section 8.2 turn that story into revenue. The features in Section 8.3 build the moat that justifies a higher multiple.

The single highest-leverage move is **Life Stage as a first-class concept** in the data model, with Today + Cycle adapting to stage via the four redesigns in Section 7. Every other expansion in this document follows from that one architectural decision. Without it, every new feature is a duct-tape add-on; with it, Femwell becomes the lifelong product no UK competitor currently is.

---

## 11. Open questions for next session

These are the questions this document leaves open and that Halli + the agent team should resolve in the next planning cycle:

1. **Which life stage expansion is the first MP after the planner tab shell ships?** The three-month list has seven items; one of them goes first. Recommendation in this doc: Perimenopause Mode v1, on the argument that it is the highest-revenue band and the most underserved by Femwell today.
2. **Who is on the clinician advisor roster?** Names, day rates, scopes. Five specialists needed; sourcing them is a 4-6 week task.
3. **What does the "Life Stage" entity look like in base44?** A simple enum vs a transition history; whether stage transitions are user-driven (toggle) or inferred (from data); whether the user can be in multiple modes (PCOS + reproductive adult).
4. **How does the data model handle the teen-to-adult handover?** A 17-year-old turning 18 — does her account auto-transition, prompt her, or stay teen-mode by default until she opts out?
5. **What is the right voice for the miscarriage path, and who tests it?** Bereaved-user testing is essential; how do we recruit and pay them ethically?
6. **What does the App Store / Play Store positioning look like across life stages?** One Femwell listing or multiple? Almost certainly one, but the screenshots and copy must speak to many.
7. **Where does the brand voice (no emoji, Fraunces + Inter, etc.) push back on the medical / clinical needs of the older user bands?** A perimenopausal user wants slightly different copy density than a 22-year-old. The voice flexes within rails — what are the rails?
8. **What's the right partnership posture with the NHS itself?** Some life-stage expansions (antenatal schedule, smear cadence, breast screening cadence) become much stronger if Femwell can ingest NHS letters via the NHS app integration that is being rolled out through 2026. This is a partnership decision worth scoping early.
9. **Is there a "Femwell Family" account model in the future?** Mother + teenage daughter sharing an account family — Parent Bridge is the seed of this. Could it become a household plan?
10. **What is the post-9-month soft cap plan if no sale closes?** The features in Section 8.3 only make sense if Femwell continues past the 9-month mark. That has runway implications that aren't in this document but should be on the master plan.

---

## 12. Appendix: research sources

This document draws on a mix of in-house Femwell memory (live walks, brand voice rules, prior MP outcomes) and external app + clinical research. Key external sources, May 2026:

- **Balance / Dr Louise Newson** — feature reference for UK menopause app; balance-menopause.com and the App Store listing.
- **Natural Cycles** — five-mode architecture (Birth Control / Plan Pregnancy / Follow Pregnancy / Postpartum / Perimenopause), Garmin and Apple Watch integration for skin-temp tracking.
- **Ovia Health** — pregnancy mode features; standalone Pregnancy app sunsetting March 2026 with the experience folded into the main Ovia app.
- **Peanut** — Bump Buddies, Pods, life-stage matching, Peanut Track.
- **Caria** — Siri-shortcut voice logging, daily symptom scoring, CBT-for-menopause.
- **Elektra Health** — clinician-paired model, HelloMeno insurance bundle with Oscar Health.
- **Maven Clinic** — Maven Intelligence agentic AI; direct-to-consumer launch 2026.
- **Allara Health** — PCOS-focused, multi-state US insurance coverage, dedicated care team model.
- **Phendo** — endometriosis pain-location tracking, self-management strategies, Citizen Endo research provenance.
- **FitrWoman / Wild.AI** — cycle-aware training recommendations across menstrual + peri + menopause phases.
- **Wysa / Woebot** — CBT chatbots, FDA Breakthrough Device Designation (Wysa), FDA De Novo path (Woebot), built-in escalation to human support as model for Jess + crisis.
- **Premom / Mira** — OPK photo reading; multi-hormone wand readings.
- **Moody Month** — hormone forecasts; AI-generated insights doctor-reviewed.
- **NHS UK** — perimenopause and HRT guidance (NICE NG23), UK Women's Health Strategy renewed April 2026, RCOG kick-count guidance, NHS Breast Screening Programme cadence, NHS cervical screening 5-yearly HPV-negative pathway.
- **MHRA** — UK medical device classification framework, draft Medical Devices (Amendment) Regulations 2026, mental health app user guidance January 2026.
- **UK statutory school guidance** — menstrual and gynaecological health teaching mandatory from September 2026.

---

*End of document. Living draft. Next update due after the first life-stage MP (Perimenopause Mode v1) ships and live-walks reshape Section 7.3.*
