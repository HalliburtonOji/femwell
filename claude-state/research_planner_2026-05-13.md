# Planner — research refresh (2026-05-13)

_Authored by Ms Deep Search for the upcoming Planner v2 build (Phase B). Sources verified against fresh web searches between 2026-05-13 09:00 and 11:00 BST. UK English, en-GB dates, £. No emoji. Drafted to inform Mr Lead Manager's spec, not to author it._

## 0. TL;DR

The Planner build needs to be the page where everything FemWell already knows about the user — cycle, active program, habits, AI-generated focus, meals, journal threads — lines up in time-order on one calm canvas. The signed-off v2 demo (`femwell_planner_final.html`, Shape C ribbons + Smart View) is the right visual starting point; the unfinished work is mostly wiring to live entities, retargeting the Smart View to the user's current state (idle / streaky / stuck / drifting), and replacing the single "8 days to your period" sentence with a future-tense forecast strip so the Planner functions as a quiet horizon rather than a backward log. Most peer apps fail this brief — they ship a 7-day scroller on top of an empty entity table and call it a planner.

The three sharpest ideas this refresh surfaces: (1) a "what this day is good for" card grounded in cycle + sleep + commitments rather than influencer cycle-syncing; (2) a phase-aware shutdown rhythm — Sunsama's closing ritual rebuilt in Jess's voice for women whose energy genuinely fluctuates; (3) a Pacing Bank for the chronic-illness segment (PCOS, endo, peri) that lets users mark a day "low spoons" and watch Planner reshuffle without guilt. The single trap: building the Planner as a public statement of *strong* cycle-syncing physiology. The 2025 peer-reviewed evidence base is unkind to that thesis; FemWell needs the soft version — capacity-aware, permission-giving, not prescriptive — and needs to own the distinction explicitly so a clinician in DD does not flinch.

Build phasing in §9: Planner-A (data unification + Smart View retargeting, 2-3 MPs) and Planner-B (rituals, bundles, Plan-with-Jess, Pacing Bank, 3-4 MPs).

## 1. What we already have

Five Planner demos live in `mnt/femwell/`. `femwell_planner_demo.html` (Sunday 19 April, Day 18 luteal) locks the visual language: cream/plum/rose/gold, Fraunces hero italics, Inter UI, Lucide icons; daily intention; ritual-stack framing; ritual bundles; gentle streaks. `femwell_planner_calendar_options.html` + `_month_shapes.html` explored calendar shapes. `femwell_planner_retargeting.html` introduced the "NOW / WEEK AHEAD / WHAT'S UNFINISHED" Smart View stack. `femwell_planner_final.html` is the signed-off composition: page head; month ribbon (Shape C — week-rows with phase-gradient backgrounds, today outlined); Smart View; what-this-day-is-good-for chips; morning stack; today's program; meals; tonight's window; evening stack; ritual bundles carousel; gentle streaks; Plan-with-Jess CTA.

The April 2026 research brief — `femwell_planner_redesign_research.md` — remains accurate. Central diagnosis: live page is a 7-day scroller + FAB; backend has cycle phase, an active program, recurring habit logs, AI-generated DailyPlan, and a MealPlan all one layer away.

Phase 1 of the unify-and-brand-sweep MP shipped on main (commit `6b2bfb0`). Remaining: adaptive Smart View retargeting + future-tense forecast.

## 2. What's live today on femwells.com/Planner

Per the 2026-04-19 audit + `project_femwell_2026-05-11_state.md`: page head, 7-day chips with phase dot + cycle-day index (Phase 1 added), day heading, empty state ("Nothing planned · Tap + to add something for this day"), FAB. The brand sweep is in. Smart View retargeting and the future-tense forecast strip are not yet in production.

The gap between live and the signed-off demo is wide and easy to articulate: live is an empty calendar; the demo is a populated rhythm. Every entity the demo references — `HabitLogs`, `UserPrograms`, `DailyPlan.focus_for_today`, `MealPlans`, `PersonalTasks` — already exists and is populated for the operator's account. Unification is a wiring job, not a design job. The two-task-entity gotcha (`PlannerItems` vs `PersonalTasks`) remains unresolved and is a hard prerequisite. (web_fetch is provenance-restricted; live walk should be the first step in Mr Lead Manager's spec.)

## 3. The category — competitors + adjacent

### Direct competitors

**Flo (Insights tab + cycle widgets, 2026 refresh).** Insights redesigned into a phase-aware multimedia library across mood / fitness / sleep / diet; a phase-selector lets users browse any phase, not just the current one. Pattern is a content-library overlay, not a calendar. No time-order canvas; content is generic per phase, not per user. FemWell sharpens by anchoring the same phase-aware framing in time order with the user's own commitments (source: [Flo redesign](https://www.emisandoval.com/flo-health-redesign)).

**Clue (Conceive + Pregnancy + Perimenopause, £24.99/yr UK).** Mode-specific planning surfaces, each with a clinically-validated algorithm. The category-defining strength is honesty — Clue says "prediction confidence is low this cycle" rather than feigning precision. The planner-as-calendar is thin; Clue is a tracker that surfaces content, not a tool you live in (source: [Clue Plus features](https://support.helloclue.com/hc/en-us/articles/15007319214493-What-premium-features-are-part-of-Clue-Period-Tracking)). Borrow: the confidence-honest tone and the mode-specific planning lens.

**Stardust (Daily Decode + Cycle Recap, v2 late 2025).** A daily "hormonal weather report" overlaid with moon phase and zodiac. The astrology is shallow templated content; the lens is "what does today feel like?" not "what does today need to do?" Better for reflection than execution (source: [Stardust](https://stardust.app/)). Borrow: the morning daily-decode framing — FemWell can ship this with Astra Cole authorship credibility.

**Maven Clinic.** Care-plan-led, not calendar-led. Members work with a Care Advocate; Maven Intelligence (2025) draws on member history + wearables + EHR for guidance. B2B benefits product; the "planner" is a care-plan tracker. Borrow: the Care Advocate framing for Care Bridge; Maven Intelligence as precedent for Plan-with-Jess (source: [Maven Intelligence announcement](https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html)).

**Hormona (PMS programme; app updated Feb 2026).** AI-predicts PMS symptoms ahead of luteal; tailored nutrition/lifestyle programme. Closest direct competitor to FemWell's "Luteal Softness" bundle. Predictions are confidence-thin and the voice over-promises ("know which symptoms you are likely to experience, before they happen") (source: [Hormona](https://www.hormona.io/)). Differentiate: confidence-honest framing + planner-as-primary-surface.

**Wild.ai (Readiness Score; acquired by Zepp Health 2024).** Readiness Score blends resting HR + symptoms + training + cycle into 0–100; Low/Moderate/High bands. Built on Dr Stacy Sims's research. Single legible number is a credible scientific anchor but risks gamifying a body that resists gamification. Borrow: a *qualitative* version ("steady today, soft tomorrow") — already in the Smart View (source: [Wild Readiness Score](https://www.wild.ai/blog/the-wild-readiness-score)).

**Balance (Dr Louise Newson, UK NHS-recognised, ORCHA-certified).** Symptom tracker + content + doctor-ready downloadable reports + community. Credibility moat is strong (Newson is a recognised UK menopause physician; NHS validation). Voice is competent-medical, not the New-Yorker-science register FemWell sits in. Borrow: the doctor-ready report (slots into Care Bridge); pursue NHS/ORCHA validation as a sale-readiness lever (source: [Balance app](https://www.balance-menopause.com/balance-app/)).

### Adjacent — productivity / planner apps the wellness category should learn from

**Sunsama (~£16/mo annual, Wirecutter's best scheduling app 2025).** Category-defining "intentional planner": morning planning, timeboxing, capacity check, evening shutdown. The shutdown ritual is the move — users *close* their day rather than stopping work. The rhythm is the product. Built for knowledge workers with full calendar autonomy; ignores fluctuating capacity. FemWell should borrow the morning-and-evening ritual framing (already in demo) plus an *explicit* Jess-signed shutdown (source: [Sunsama review](https://calmevo.com/sunsama-review/)).

**Reclaim.ai (~£6.50/mo Starter).** AI scheduler that runs on Google/Outlook Calendar; auto-protects focus time and habits; reshuffles when meetings change. Continuous re-optimisation is the move — exactly the behaviour the Smart View's "what's unfinished" state needs. Robotic-corporate voice should not be copied (source: [Sunsama vs Reclaim](https://reclaim.ai/blog/sunsama-vs-reclaim)).

**Notion Calendar (formerly Cron, 2024).** Keyboard-first, beautiful default, two-way Notion sync. A calendar, not a planner — no capacity, ritual, or shutdown concept. Borrow the typographic restraint and keyboard quick-add pattern (source: [Notion Calendar announcement](https://www.notion.com/blog/introducing-notion-calendar)).

**Finch (gentle self-care app).** Virtual baby bird grows when you self-care; no missed-day punishment. The 2026 review consensus: D1/D7/D30 retention is strong because missing a day is reframed as data, not failure. Already enshrined in FemWell copy ("a missed day isn't a loss, it's information") — hold the line (source: [Finch 2026 review](https://calmevo.com/finch-app-review/)).

### Failed / abandoned attempts

**Glow / Eve by Glow.** Once a category leader; now a Mozilla "Privacy Not Included" red flag and a feature-shrinkage story (previously-free features paywalled). Lesson: a women's-health app that monetises by retracting free features generates the loudest user backlash in the category. FemWell's Plus tier must *add* (Atelier Reading, Pro programmes), not *retract* (source: [Mozilla Foundation — Glow & Eve privacy](https://www.mozillafoundation.org/en/privacynotincluded/glow-eve-by-glow/)).

**MyLittleEden (UK).** Once a credible UK direct comparator; profile slipped; no discoverable 2026 product news. Lesson: in this category, a year of silence equals a year of erosion. Ship at least one user-visible signal per quarter.

**Period planners that drifted into ad-heavy trackers** (Period Calendar Pink, Pink Pad, etc.) — Reddit users call out "tired of the notifications and emails." Lesson: notification budget is part of brand.

### Non-app references that nail the feel

**Moleskine Weekly Planner.** Two-page spread: week-on-the-left + ruled-notes-on-the-right. The right page is the move — an open canvas beside the structured one. FemWell could echo with a "today's open notes" tile alongside the ritual stacks (source: [Moleskine 2026-2027 weekly planners](https://www.moleskine.com/shop/planners/weekly-planner/)).

**Hermès Ulysse agenda.** Perpetual refill, leather cover — the planner is an object you live with; refills change, the cover does not. Transposition: the cream-and-plum ribbons are the cover, the rituals and bundles are the refills.

## 4. Forum / Reddit mining

Reddit + Mumsnet searches surfaced thematic complaints across menstrual planning. Search caveat: WebSearch returned summaries rather than direct quoted threads in some cases; specific named quotes below are paraphrased from search-result summaries, all with source URLs verifiable.

**Theme 1 — "The app doesn't know my cycle is irregular."** Loudest complaint across perimenopause, PCOS, post-pill cohorts. A 2026 menopause-tracker roundup captures a Health & Her user calling it "completely useless" because perimenopause cycles of 2–3 days every 2 weeks weren't recognised as periods, so no insights generated (source: [Best menopause apps — The Flow Space](https://www.theflowspace.com/reproductive-health/menopause/best-menopause-apps-2941944/)). The opportunity: an irregular-cycle mode that says "your cycle isn't readable this month — here's what *is* known (sleep, mood, commitments) and what we'll watch for."

**Theme 2 — "I'm too tired to fill in another app."** Fatigue dominates both symptom and friction in r/Menopause and r/Perimenopause threads; women report "profound exhaustion that doesn't resolve with rest" plus social dismissal (source: [Perimenopause and Fatigue Reddit synthesis](https://mlrb.net/perimenopause-and-fatigue-reddit/)). The Planner's daily data-entry budget must be near zero — pre-populate from entities, let the user *edit*, not *enter*.

**Theme 3 — "I want to plan around my cycle but the apps make me feel broken."** Common across r/PCOS, r/Endo, r/birthcontrol. The "low energy = problem to fix" framing is itself fatiguing. Users want capacity-aware planning, not fix-it-here-is-a-supplement nudges. FemWell voice already lands this ("softer day, inward day, never 'low day'").

**Theme 4 — "The streak guilt is its own stress."** Punitive streaks generate user shame, which reduces D7/D30 retention. Finch is the category proof point that gentleness wins. Hold the line on FemWell's "a missed day isn't a loss" copy.

**Theme 5 — "Why can't it pre-empt my luteal week?"** Recurrent in PMS/PMDD threads. Users want a 5–7 day heads-up. Hormona pitches this but the predictions are confidence-thin. FemWell can do this with calibrated honesty ("two of your last three cycles, you crashed on day 23 — want me to pull back commitments on day 22-23 next week?"). The honesty is the moat.

**Theme 6 — "I don't want my partner to see this."** From r/birthcontrol, r/TTC, Mumsnet menopause threads. Hard per-field control needed; Partner Sync's contract-of-consent already designs for this. The Planner must respect by default.

**Theme 7 — "Notifications fatigue."** Reddit threads cite "tired of the notifications" from Clue and Flo as the uninstall reason (source: [Reddit Favorites — Clue](https://redditfavorites.com/android_apps/period-tracker-clue-period-ovulation-tracker)). The Planner ships under a strict daily-nudge budget; Smart Nudges' auto-mute-below-(-0.50)-weight rule is the structural protection.

**Theme 8 — "Where do I track HRT alongside my cycle?"** Recurring across r/Menopause. Balance app addresses this. NICE NG23 (Nov 2024) confirms HRT response is monitored "on symptom control" rather than bloods — meaning the user's own diary IS the clinical instrument (source: [NICE NG23](https://www.nice.org.uk/guidance/ng23/chapter/recommendations)). Tonight's Window should expose tonight's HRT row for users on a cyclical regime. Cleanest entry to Care Bridge: the Planner generates the diary the GP needs.

## 5. Academic + clinician research

The science needs handling with care. The popular "cycle syncing" narrative — Alisa Vitti, infradian rhythm, four-phase prescriptive food/fitness — is **not** well-supported in the peer-reviewed literature, and naming this honestly in the Planner is a competitive moat against influencer-physiology apps.

**McNulty et al. (2020), Sports Medicine — exercise performance meta-analysis.** Network meta-analysis of 73 studies, 954 participants, 220 outcome measures. Trivial effect sizes (ES 0.01–0.14); largest difference was a trivial 0.14 between early and late follicular. Authors state phase-based performance recommendations "could and should not be made" (source: [McNulty 2020](https://link.springer.com/article/10.1007/s40279-020-01319-3)). Implication: the demo's "Steady strength is good for today" is fine as *permissive* nudge; unsupportable as *prescription*.

**Davidsen 1995 + Gorczyca 2016 + PMC10251302 narrative review — luteal-phase energy intake.** Energy intake is higher in luteal (mean ~529 kcal/day increase from follicular). Personal variation huge (source: [PMC10251302](https://pmc.ncbi.nlm.nih.gov/articles/PMC10251302/)). Implication: Nutrition + Planner Meals integration is well-grounded for the luteal week; the demo's "magnesium helps luteal tension" line is supportable.

**Pfender et al. (2025), Qualitative Health Research — cycle syncing on TikTok.** Content rarely cited evidence, frequently created by unverified influencers, drew from fragmented interpretations (source: [Pfender 2025](https://journals.sagepub.com/doi/10.1177/10497323241297683)). Implication: FemWell's Atelier-grade content moat is the structural antidote — and the Planner is where that antidote gets felt.

**NICE NG23 (November 2024 update).** Aged 45+: diagnose on symptoms, no bloods needed. FSH only 40–45 or under 40. HRT response monitored on symptom control, not blood oestrogen (source: [NICE NG23](https://www.nice.org.uk/guidance/ng23/chapter/recommendations)). Implication: the Planner's symptom diary IS the clinical instrument — exportable-to-GP PDF is a category-original Planner feature.

**Miserandino's Spoon Theory (2003) + chronic-illness pacing reviews.** Pacing means distributing energy across less-busy days; same activity costs different "spoons" on different days. Endometriosis + PCOS + ME/CFS communities speak this language natively (sources: [Dr Seckin](https://drseckin.com/the-spoon-theory-for-endometriosis-patients/), [Cleveland Clinic](https://health.clevelandclinic.org/spoon-theory-chronic-illness)). Implication: the Pacing Bank idea in §7 lands on-brand vocabulary already in use.

## 6. Failed ideas with seeds worth keeping

Three ideas that sound dumb but have a real seed. Each tagged **(captured 2026-05-13)**.

**Lunar gardening calendar overlay. (captured 2026-05-13)** Folk-tradition planting by moon phase — as horticultural science, laughable. As FemWell *content*: a quiet seasonal layer for Lifestyle / Daily Story, and a metaphor for Planner pacing ("a waning-moon week — time to harvest, not plant"). Jess copy only, never a rule. Seed: waxing/waning *alongside* follicular/luteal, especially for women between cycles or post-meno where the cycle frame breaks.

**Moon-phase haircare scheduling. (captured 2026-05-13)** Folk practice with no evidence. Reframed: a Planner micro-card that suggests slow personal-care rituals on calm phase days ("a Sunday in late luteal — a good day for the small slow things: a haircut, a long bath, an unread chapter"). Seed: phase-aware *slowness*, not phase-aware tasks. Lands as a "Slow Sunday" bundle.

**Pap smear reminder via the cycle widget. (captured 2026-05-13)** Sounds bureaucratic / NHS-portal-grim. But: UK women aged 25–49 invited every 3 years, 50–64 every 5 years; timing matters (avoid first 2 days of period for sample quality). The Planner is the only FemWell surface that already knows age + cycle + life stage. Seed: low-key cervical screening prompt — every 3 years, on a non-bleeding day, with a Care Bridge surface to book locally. Unusual moat; unambiguously NHS-aligned. Folds into UK-local.

## 7. The 8-10 features Planner v2 should consider

Ranked by impact-on-sale × (1 / build-cost). The signed-off demo (`femwell_planner_final.html`) already represents the visual language for most of these; the question for each is *which entity is the source of truth* and *which Smart View state surfaces it*.

### 1. Smart View retargeting (NOW / WEEK AHEAD / WHAT'S UNFINISHED, adaptive)
The Smart View exists in the demo; missing piece is *content* that adapts to user state — IDLE (no commitments → surface ritual bundles), STREAKY (3+ habits hit → surface gentle-streak rhythm), STUCK (program paused 7+ days → surface Continue Day N), DRIFTING (no engagement 3+ days → surface a soft re-entry). Reframes Planner as a quiet horizon rather than a backward log. **Cost:** S (one component, 4 retargeting states; logic lives in `DailyPlan` aggregator). **Entities:** existing only. **Slot:** existing Smart View card stack.

### 2. Data unification — pull HabitLogs + UserPrograms + DailyPlan + MealPlans onto each day
April research's #1 finding; remains the highest-leverage move. The data exists; surface it. Resolves the empty-state collapse that kills D7 retention. **Cost:** S (4 queries + 4 components; no new entities). **Slot:** Morning Stack, Today's Program, Today's Meals, Commitments (already drawn in demo).

### 3. Phase-tense forecast strip with confidence label
Replace the demo's single-sentence "Week Ahead" with the colour-blocked week-ribbon from the original demo, plus a confidence label ("estimated, 78% confidence based on your last 4 cycles"). The honesty differentiates from Hormona's over-promise. **Cost:** M (compute confidence + render; one new computed field). **Slot:** above day chips.

### 4. Plan-with-Jess (weekly draft)
The demo's highest-emotional-leverage CTA. One tap → personalised week, softer in luteal, brighter post-period, one program task per day. First time Jess registers as a *planner*, not a chatbot. Maven Intelligence does this for clinical care; nobody does it for daily life. **Cost:** M (one LLM call + review UI; reuses `personal_assistant.jsonc`). **Entities:** writes into `DailyPlan` × 7. **Slot:** existing Plan-with-Jess card.

### 5. Ritual bundles carousel — write path
Demo ships five bundles (Luteal Softness, Period Rest, Follicular Focus, Ovulation Power, Workday). Missing piece is the *write* — tap-to-add injects the bundle's rituals into HabitLogs. Category-original; nobody else ships phase-keyed bundles that adapt the planner in one tap. **Cost:** M (transactional add-rituals-to-day function). **Slot:** existing carousel.

### 6. Pacing Bank (the spoon-theory tile)
For PCOS / endo / peri / chronic-illness segments — meaningful, underserved, clinically vocabulary-aligned. A "Low Spoons" toggle collapses commitments into a single-row rest view, surfaces only the lightest rituals, defers everything reschedulable. First wellness planner to adopt spoon theory natively without medicalising. **Cost:** M (new enum on `DailyPlan` — normal | low_spoons | recovery). **Slot:** after day head; opt-in; off by default.

### 7. Tonight's Window — HRT row (Life Stage integration)
For HRT users (perimenopause is FemWell's secondary persona): "patch swap, 9pm; cyclical progesterone day 14 of 28." Turns the Planner into the diary NICE NG23 says drives HRT management. Massive Care Bridge feeder. **Cost:** S (read `MedicationReminders`; render conditionally). **Slot:** existing Tonight's Window card.

### 8. Shutdown ritual (the Sunsama move, in FemWell voice)
A Jess-signed "How did today feel?" pulldown at the foot of the evening stack — 1-tap mood + 1-line note → writes to `JessMemory` + `DailyAggregates`. The explicit shutdown closes the engagement loop. **Cost:** S (one component, two writes). **Slot:** below evening stack.

### 9. Cervical screening row (UK-local; folded item)
NHS Cervical Screening Programme alignment — quietly responsible; no consumer app ships this well. Gives the UK-local layer a concrete planner surface. **Cost:** S (one row when in screening window). **Entities:** `UserProfile.last_cervical_screening` new field. **Slot:** conditional "Health admin this month" tile.

### 10. Calendar export (read-only iCal / Apple Calendar / Google Calendar)
Loud Reddit unmet need: FemWell as a layer on the user's *real* calendar, not a competing one. **Cost:** L (iCal feed; secure URL; Plus-gated). **Slot:** settings, not day view.

**Ranking (priority order):**
1. Data unification (#2)
2. Smart View retargeting (#1)
3. Plan-with-Jess (#4)
4. Ritual bundles write-path (#5)
5. Phase-tense forecast strip with confidence (#3)
6. Tonight's window with HRT (#7)
7. Shutdown ritual (#8)
8. Pacing Bank (#6)
9. Cervical screening row (#9)
10. Calendar export (#10)

The top 3 are the Planner-A scope. 4–7 are Planner-B. 8–10 are Planner-C (post-sale or selectively pulled into Planner-B if cheap).

## 8. The one trap

**The trap is building the Planner as a public statement of strong cycle-syncing physiology.** That is, building it as if the science said "luteal = rest, follicular = brainstorm, ovulation = pitch meetings, period = retreat" — Alisa Vitti's prescriptive frame.

The 2020 McNulty meta-analysis and the 2025 Pfender critical-feminist analysis say plainly: that strong frame is not supported. Performance differences across phases are trivial. Cycle-syncing TikTok content is largely uncited and fragmented. A clinician sitting in DD with a buyer will flag this immediately — and FemWell's named-clinician roadmap (UK BMS-accredited GP, BACP therapist, BDA dietitian) means a clinician *will* be in DD eventually.

The mitigation is to ship the *soft version*: phase-aware as a permissive lens, not a prescriptive rule. "This is a steady day, lean into rhythm" — fine. "You should not lift heavy in luteal" — not fine. Every Planner copy line that touches phase must pass a permissiveness audit: replace any imperative with an invitation, replace any deterministic claim with a probabilistic one ("often", "tends to", "many women report"), and lead with the user's own data ("two of your last three cycles, you crashed on day 23") rather than population averages.

The secondary trap, weaker but still real: building the Planner as a productivity app with a cycle skin. The Planner must hold the *whole* day, including the un-cycle-able parts (work meetings, school runs, GP appointments) without making the cycle the loudest voice in every room. Cycle is the spine; it is not the song.

## 9. Recommendation to Mr Lead Manager

Split Planner v2 into two MP sequences, both reusing the signed-off visual language in `femwell_planner_final.html`.

**Planner-A — Data Unification + Smart View Retargeting (2-3 MPs, sale-readiness path).** MP-A1: wire the four data sources (HabitLogs, UserPrograms, DailyPlan, MealPlans) into the day view; resolve `PlannerItems` vs `PersonalTasks` (keep `PlannerItems`, migrate the two `PersonalTasks` records — April research stands). MP-A2: Smart View retargeting logic — 4 states (idle / streaky / stuck / drifting) computed from the existing aggregator. MP-A3: phase-tense forecast strip with confidence labels, replacing the Week Ahead sentence. Exit gate: live walk at mobile + tablet + desktop on `femwells.com/Planner`; every Smart View state demonstrable; no empty state for the operator account.

**Planner-B — Rituals, Bundles, Jess (3-4 MPs, engagement-moat path).** MP-B1: ritual bundle write-path (tap-to-add → HabitLogs transactional). MP-B2: Plan-with-Jess weekly draft (LLM-generated 7-day plan with review/edit; one program task per day; softer in luteal). MP-B3: Tonight's Window HRT row (reads MedicationReminders). MP-B4 (optional): shutdown ritual + Pacing Bank tile. Exit gate: test PCOS account demonstrating the luteal-week experience; test peri-on-HRT account demonstrating the HRT-row + Care-Bridge export pathway.

Planner-A should ship before Profile v2 — Profile is what the buyer lands on, but Planner is what the user comes back for, and Planner-A is finishing work, not greenfield. Planner-B can interleave. Cervical screening (#9) + calendar export (#10) defer to Planner-C or absorb into UK-local + Settings MPs. Pacing Bank (#6) is category-original and chronic-illness-positioning — flag to user for explicit yes/no before scoping.

Legal cover: as long as Planner-A copy follows the brand-voice guardrails in `femwell_planner_redesign_research.md` §7 (no imperative phase claims, no "you missed" framing, no body-negative luteal language), the strong-cycle-syncing trap is structurally avoided. Lead Manager restates the guardrails in the MP §6.

## 10. Sources

All URLs verified via WebSearch 2026-05-13. Where WebSearch surfaced summaries rather than full pages, the URL points to the source the summary cited.

**Direct competitors.** [Flo Insights redesign](https://www.emisandoval.com/flo-health-redesign) · [Clue Plus features](https://support.helloclue.com/hc/en-us/articles/15007319214493-What-premium-features-are-part-of-Clue-Period-Tracking) · [Clue Conceive](https://helloclue.com/clue-conceive-fertility-tracker-app) · [Clue Plus worth it? — The Lowdown UK](https://thelowdown.com/blog/is-clue-plus-worth-it) · [Stardust](https://stardust.app/) · [Stardust review — The C Word Mag UK](https://www.thecwordmag.co.uk/c-word-loves/stardust-app-review-the-period-tracking-app-for-modern-witches) · [Maven Intelligence — PRNewswire](https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html) · [Hormona](https://www.hormona.io/) · [Wild.AI Readiness Score](https://www.wild.ai/blog/the-wild-readiness-score) · [Balance app — Dr Louise Newson](https://www.balance-menopause.com/balance-app/) · [Balance on Marie Claire UK](https://www.marieclaire.co.uk/life/health-fitness/this-womens-health-app-is-democratising-access-to-menopause-specialists-771354).

**Adjacent / productivity.** [Sunsama 2026 review](https://calmevo.com/sunsama-review/) · [Sunsama vs Reclaim.ai](https://reclaim.ai/blog/sunsama-vs-reclaim) · [Notion Calendar announcement](https://www.notion.com/blog/introducing-notion-calendar) · [Finch 2026 review](https://calmevo.com/finch-app-review/).

**Failed / abandoned.** [Mozilla — Glow & Eve privacy](https://www.mozillafoundation.org/en/privacynotincluded/glow-eve-by-glow/).

**Non-app references.** [Moleskine 2026-2027 weekly planners](https://www.moleskine.com/shop/planners/weekly-planner/) · [Hermès Ulysse refill](https://www.hermes.com/us/en/product/ulysse-calendar-refill-small-model-H325260Av00/).

**Forum / Reddit / sentiment.** [Perimenopause + Fatigue Reddit synthesis](https://mlrb.net/perimenopause-and-fatigue-reddit/) · [Best menopause apps — The Flow Space](https://www.theflowspace.com/reproductive-health/menopause/best-menopause-apps-2941944/) · [Reddit Favorites — Clue](https://redditfavorites.com/android_apps/period-tracker-clue-period-ovulation-tracker) · [Women's support groups on Reddit — Intimina](https://www.intimina.com/blog/best-womens-groups-on-reddit/).

**Academic + clinical.** [McNulty 2020 — Sports Medicine](https://link.springer.com/article/10.1007/s40279-020-01319-3) · [Davidsen 1995 — PubMed](https://pubmed.ncbi.nlm.nih.gov/7825535/) · [Dietary energy intake across the menstrual cycle — PMC10251302](https://pmc.ncbi.nlm.nih.gov/articles/PMC10251302/) · [Pfender 2025 — Sage](https://journals.sagepub.com/doi/10.1177/10497323241297683) · [Time — Cycle Syncing is All Vibes](https://time.com/6315797/cycle-syncing-womens-heath/) · [Wu Tsai — metabolism stable across cycle](https://humanperformancealliance.org/news/study-challenges-cycle-syncing-finds-metabolism-consistent-during-menstrual-cycle/) · [NICE NG23 — Menopause](https://www.nice.org.uk/guidance/ng23/chapter/recommendations).

**Chronic illness / pacing.** [Spoon Theory for endometriosis — Dr Seckin](https://drseckin.com/the-spoon-theory-for-endometriosis-patients/) · [Spoon Theory — Cleveland Clinic](https://health.clevelandclinic.org/spoon-theory-chronic-illness).

**From previous research.** [Phase App calendar extension](https://www.phaseapp.io/blog/introducing-the-phase-calendar-extension) · [Kilova planners](https://kilova.app/blog/best-planners/) · [RITUAL routine planner](https://www.ritualroutineplanner.com/) · [Marie Claire — wellness stacking](https://www.marieclaire.co.uk/life/health-fitness/wellness-stacking).

---

_End of brief. Authored under the binding spec at `.claude/agents/ms-deep-search.md`. Next deliverable belongs to Mr Lead Manager — translate the §7 ranking and §9 phasing into a `/sessions/relaxed-loving-brahmagupta/femwell-repo/claude-state/spec_planner_A_2026-05-13.md`._
