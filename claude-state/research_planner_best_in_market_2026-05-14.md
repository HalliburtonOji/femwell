# Planner — best-in-market research + brainstorm (2026-05-14)

_Authored by Ms Deep Search for FemWell, building on `research_planner_2026-05-13.md`. UK English, en-GB dates, £. No emoji. All claims cited inline. Brief escalated by Halli on 2026-05-14: "make the Planner the best the market has to offer and provide a final detailed demo with specs." Aim: a paste-into-Lead-Manager research artefact, with the depth a buyer-DD analyst would expect._

---

## Executive summary (≈420 words)

The 2026-05-13 brief got the floor right: data unification, Smart View retargeting, phase-tense forecast, Plan-with-Jess, ritual bundles, Tonight's Window with HRT, Pacing Bank, shutdown ritual. That ten is sound. What it under-weighted, and what this refresh corrects, is the **moat layer**. The market in May 2026 is consolidating around two things buyers actually pay for: (a) the longitudinal symptom-cycle record as a *clinically usable instrument*, validated against the NICE NG23 / RCOG green-top / Renewed Women's Health Strategy for England (April 2026), and (b) AI orchestration that turns that record into next-action care — which is exactly what Maven Intelligence rolled out as a B2B feature in late April 2026 ([Maven Intelligence — PRNewswire](https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html), [TIME 2026 health-tech list](https://time.com/article/2026/03/10/maven-clinic-digital-womens-health-services/)). FemWell's Planner is the closest consumer surface in the UK that could *prove* both moats simultaneously, because Planner is the entity-richest page in the app and the daily-return surface for a UK consumer who pays £.

"Best in market" therefore is not "more features than Flo/Clue/Balance." It is: **the only UK women's-wellness Planner that doubles as a NICE-aligned diary, a permission-giving capacity model, and a single-tap weekly orchestration** — three claims none of the live category make together in May 2026 ([Renewed Women's Health Strategy for England, CP1558, April 2026](https://assets.publishing.service.gov.uk/media/69df5d7261d2e8e9b9e42d2e/renewed-womens-health-strategy-for-england-web-accessible.pdf), [ORCHA DTAC simplified Feb 2026](https://info.orchahealth.com/digital-technology-assessment-criteria-dtac), [NICE NG23 last-reviewed April 2026](https://www.nice.org.uk/guidance/ng23)).

The three novel mechanics that earn that title — all new versus the 2026-05-13 brief — are: (1) the **Capacity Tax** (predicted next-week load shown against predicted capacity, with a one-tap "defer reschedulable" move; nobody ships this for women's bodies); (2) the **Doctor-Ready Diary**, an always-on NICE-NG23-aligned export already proven by Balance but never married to a capacity-aware planner; and (3) the **Quiet Mode auto-pull-back**, where the Planner reads a composite low-day signal and proactively pulls down commitments before the user logs them, the inverse of Motion's auto-schedule logic and a direct answer to perimenopause fatigue threads ([Mumsnet — crushing fatigue perimenopause](https://www.mumsnet.com/talk/menopause/4642140-crushing-fatigue-perimenopause)).

The three risks: (a) over-promising the cycle-syncing frame and tripping the McNulty/Pfender evidence trap; (b) building loss-aversion streaks that hurt the chronic-illness segment FemWell already serves; (c) shipping ten features when three would close the sale ([McNulty 2020](https://link.springer.com/article/10.1007/s40279-020-01319-3), [Pfender 2025 — Sage](https://journals.sagepub.com/doi/10.1177/10497323241297683), [Smashing Magazine — streak UX Feb 2026](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/)).

Planner-A scope (next 2 weeks, sale-ready demo): the 2026-05-13 top-3 + the Capacity Tax + Doctor-Ready Diary v1. Planner-B (weeks 3–6, engagement moat): Quiet Mode + Cycle-Mirror weekly recap + Reframe Engine + Pacing Bank. Planner-C (Plus / post-sale): calendar export, partner sync surface on the Planner, cervical-screening row, lunar/horoscope sidecar.

---

## Part A — Landscape refresh (depth pass)

### A1 — 2026 product launches not covered by the 2026-05-13 brief

The 2026-05-13 brief named Flo, Clue, Stardust, Maven, Hormona, Wild.ai, Balance, Sunsama, Reclaim, Notion Calendar, Finch. It missed at least five material launches.

**Oura — Menopause Insights + Hormonal Birth Control in Cycle Insights (rolled out 6 May 2026; Gen3 + Ring 4 members).** Oura shipped two integrated experiences inside the Cycle Insights surface: a Menopause Impact Scale (MIS) 22-symptom research-backed questionnaire that quantifies symptom impact on quality of life, and a first-of-its-kind hormonal-birth-control track that pairs the user's selected method (pill / patch / IUD / implant) with continuous Oura metrics ([Oura — new hormonal health features May 2026](https://ouraring.com/blog/hormonal-health-features/), [Oura Perimenopause Check-In help doc](https://support.ouraring.com/hc/en-us/articles/43647048134035-Perimenopause-Check-In)). In Nov 2025 they updated the Cycle Insights algorithm to improve accuracy for irregular cyclers and women in perimenopause and extended period predictions to a 12-month forecast ([Oura — Cycle Insights update](https://ouraring.com/blog/oura-cycle-insights-update/)). Implication: the *forecast-strip-with-confidence* idea in §3 of the 2026-05-13 brief is now table stakes among wearable-adjacent apps; FemWell ships it without a ring by leaning on Apple Health + manual logs.

**Samsung Galaxy Ring — cycle tracking via Samsung Health (no subscription).** Cycle tracking via skin-temperature sensing during sleep, with a Galaxy Ring 2 expected to slip to early 2027 ([Samsung UK Galaxy Ring product page](https://www.samsung.com/uk/rings/galaxy-ring/galaxy-ring-titanium-black-size-10-sm-q500nzkaeub/), [Tom's Guide — Galaxy Ring cycle](https://www.tomsguide.com/wellness/fitness/samsung-galaxy-ring-is-changing-the-game-for-cycle-tracking-heres-how)). The interesting note is the explicit "NOT INTENDED FOR CONTRACEPTION" disclaimer — clinical-honesty pattern Samsung embeds into the cycle tile. FemWell can mirror this tone on every prediction.

**Apple Health redesign in iOS 26.4 (announced for late 2026).** Major Health-app overhaul: simplified scan-friendly design, native nutrition/calorie tracking, professional medical video content, AI-powered insights via Apple Intelligence, and a premium "Health Plus" tier hinted at ([Wareable — iOS 26.4 Health overhaul](https://www.wareable.com/health-and-wellbeing/apple-health-ios-26-4-update-nutrition-tracking-health-plus-tier), [Apple support — Cycle Tracking iOS guide](https://support.apple.com/guide/iphone/view-menstrual-cycle-predictions-and-history-iph1a4a00aa0/ios)). Apple's existing Cycle Deviation feature (irregular / infrequent / prolonged / persistent spotting) ships a 12-month PDF export for clinicians from iOS 16 onwards ([Apple — Findings from Apple Women's Health Study 2023](https://www.apple.com/newsroom/2023/03/findings-from-apple-womens-health-study-advance-science-around-menstrual-cycles/)). Implication for FemWell: an Apple-Health-write integration becomes a defensible bridge — read the user's cycle/symptom log from Apple Health, write FemWell's daily aggregates back, and the Planner becomes the iPhone Health app's smart layer rather than its competitor.

**Maven Clinic Intelligence (rolled out late April 2026).** AI-powered orchestration layer across the Maven clinic, care programs and benefits platform: integrates agentic AI with longitudinal clinical and outcomes data; surfaces evidence-based intervention with clinician review; supports adherence to care plans ([Maven Intelligence — PRNewswire late April 2026](https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html), [Fierce Healthcare — Maven Clinic genAI](https://www.fiercehealthcare.com/health-tech/maven-clinic-expands-ai-capabilities-generative-ai-openai-google), [Femtech Insider — Maven Intelligence](https://femtechinsider.com/maven-clinic-introduces-maven-intelligence-an-ai-orchestration-layer-for-womens-and-family-health/)). This is the closest published analogue to Plan-with-Jess; Maven does it B2B-clinical, FemWell can do it B2C-daily. TIME's March 2026 article confirms Maven is now D2C nationwide in the US, opening a direct competitive front ([TIME — Maven goes nationwide](https://time.com/article/2026/03/10/maven-clinic-digital-womens-health-services/)).

**UK Renewed Women's Health Strategy for England, CP 1558 (April 2026).** Single Patient Record via NHS App by 2028. Menstrual + menopause-related problems are two of the first nine pathways under the new virtual hospital NHS Online. £1.5m FemTech fund launched as part of the renewed strategy ([Renewed Women's Health Strategy PDF, April 2026](https://assets.publishing.service.gov.uk/media/69df5d7261d2e8e9b9e42d2e/renewed-womens-health-strategy-for-england-web-accessible.pdf), [HTN Health Tech News — strategy summary](https://htn.co.uk/2026/04/20/data-digital-and-experiences-outlined-in-renewed-womens-health-strategy-for-england/), [digitalhealth.net — £1.5m FemTech fund April 2026](https://www.digitalhealth.net/2026/04/1-5m-femtech-fund-launched-under-womens-health-strategy/)). The Planner can position itself as the layer that *exports into* the NHS App-bound Single Patient Record — a UK-specific moat no US tracker can credibly claim.

Smaller-than-expected category news worth noting: Hormona's CE-marked hormone-test kit is in early-access for early 2026 ([Hormona perimenopause tracker product page](https://www.hormona.io/product/perimenopause-tracker-app/)); Balance has reintroduced the Balance+ annual plan and made the Health Report autopilot from journal logs ([Balance app — Google Play UK listing](https://play.google.com/store/apps/details?id=com.balance_app.app&hl=en_GB)); Health & Her's UK longitudinal cohort study (published Dec 2023 in *Menopause*) showed measurable symptom improvement with app use, a clinical-evidence asset FemWell does not yet have ([Health & Her — PubMed cohort study](https://pubmed.ncbi.nlm.nih.gov/38159963/)).

### A2 — Productivity / planner crossover (deeper)

**Motion (the AI scheduler).** $19/mo Pro AI (annual) or $29/user/mo Business AI, both with shared AI scheduling engine; 7,500 AI credits/seat/month on Pro ([Motion pricing 2026 — Alfred](https://get-alfred.ai/blog/motion-pricing), [Motion App Review — Ellie 2026](https://ellieplanner.com/comparisons/motion-app-review)). User-side complaints are consistent: opaque pricing, steep learning curve, card-required 7-day trial with reports of pre-trial charges ([Motion App Review 2026 — Efficient App](https://efficient.app/apps/motion)). The mechanic FemWell can lift: **deadline + duration + dependency-aware auto-shuffle**. The mechanic FemWell must *not* lift: the relentless cram-everything-in scheduling logic. Motion solves "I have too many tasks for too few hours"; FemWell solves "I have a body whose capacity changes and I have a calendar that does not know."

**Akiflow vs TickTick vs Todoist.** Todoist won 2026 on AI — Todoist Assist (sub-task generation) and Ramble voice-to-task (38 languages, TechCrunch Jan 2026 launch). TickTick wins on bundle (Pomodoro + habit tracker + Eisenhower matrix) at £36/yr vs Todoist £60/yr. Akiflow has no habit tracker — it's calendar-aggregator-first ([Akiflow vs TickTick 2026 comparison](https://toolfinder.com/comparisons/akiflow-vs-ticktick), [TickTick vs Todoist 2026 — 2sync](https://2sync.com/blog/ticktick-vs-todoist), [Akiflow alternatives 2026](https://get-alfred.ai/blog/best-akiflow-alternatives)). Pattern: the productivity category has converged on a 4-axis grid (AI assist × habits × calendar aggregation × command-bar quick-add). FemWell already has habits (HabitLogs); the missing axis is the command-bar/quick-add (a Jess speak-it-and-it-becomes-a-task pattern would lift directly from Ramble).

**Granola + Vimcal.** Granola is meeting-notes AI (transcribes, summarises, calendar-aware) and *complementary* to scheduling; Vimcal is the keyboard-first fastest-calendar product with natural-language event creation and AI Time Finder ([Vimcal product page](https://www.vimcal.com/), [Granola vs Google Calendar 2026](https://toolfinder.com/comparisons/granola-vs-google-calendar)). Two seeds worth borrowing: (i) Vimcal's "type 'lunch with Sam tomorrow noon'" creates a calendar event — Jess's quick-add should accept similarly free-form input; (ii) Granola's quiet-recording-then-summarise pattern suggests a Planner end-of-day "auto-summary" Jess can produce from journal entries the user already wrote.

**Habit-tracker category specifically.**

- *Finch.* Confirms gentleness wins: missed days do not punish or break streaks; the virtual bird waits; users report easier re-engagement after a slip. Most anxiety-friendly habit app in the category ([Apps Like Finch 2026 — Calmevo](https://calmevo.com/apps-like-finch/), [Finch app review 2026](https://calmevo.com/finch-app-review/)).
- *Habitica.* Gamified RPG progression; users engaged with social/party features show 40% higher D30 retention than solo trackers ([Habitica Review 2026 — Calmevo](https://calmevo.com/habitica-review/), [Habitica vs Finch 2026](https://calmevo.com/habitica-vs-finch/)). Implication for FemWell: a gentle social layer (Care Bridge / partner / Atelier-author follower) is a measurable retention lever — but only if it's invited-in by the user (Theme 6 from the 2026-05-13 brief).
- *Streaks (Apple-ecosystem-only).* Minimal, Apple-Health-native — the upgrade target for Finch users who "matured past needing the emotional safety net" ([Best habit-tracker apps 2026 — Habi](https://habi.app/insights/best-habit-tracker-apps/)). The pattern matters for FemWell: don't position gentleness as forever; provide a graceful upgrade ramp.
- *Smashing Magazine's Feb 2026 streak-system UX piece* lays out the design grammar: streak freezes leverage Kahneman loss aversion *for* the user, not against; track "consistency over time" not "uninterrupted runs" ([Smashing Magazine — designing streak systems Feb 2026](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/)). FemWell's "a missed day isn't a loss" copy is already on the right side; the *streak freeze* mechanic is the structural protection.

**Bottom line:** the productivity layer has settled on a clear vocabulary — AI-assist, capacity-aware, gentle-streak, command-bar. FemWell's Planner needs every one of those, *expressed in the FemWell voice*, plus the cycle/HRT/care layer none of them have.

### A3 — Women's body cycle science (2026 publications + NICE/RCOG/ACOG)

**Pfender 2025 (second paper).** Beyond the SAGE *Qualitative Health Research* paper cited in the 2026-05-13 brief, Pfender et al. published *Sync or Swim: Navigating the Tides of Menstrual Cycle Messaging on TikTok* in Wiley's *Perspectives on Sexual and Reproductive Health* (online 2025; PubMed indexed) — same critical-feminist lens, broader content analysis ([Sync or Swim — Wiley 2025](https://onlinelibrary.wiley.com/doi/10.1111/psrh.70004), [Sync or Swim — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12204122/), [Pfender — Sage Cycle Syncing](https://journals.sagepub.com/doi/10.1177/10497323241297683)). Researchers analysed 100 top TikTok cycle-syncing videos: only 4% cited research, 30% provided creator credentials. Compounding the McNulty 2020 evidence-thinness, this is the *credentialing* evidence-thinness. Implication for Planner copy: every phase-keyed line should be self-citable, with a "what this is based on" tap that surfaces the underlying claim — a clinical-tone Atelier moat against influencer apps.

**News-Medical March 2025 review** echoed the same conclusion in mainstream press: clinical research inconclusive, harms potential — financial/social consequence to female athletes who skip play during phases ([News-Medical — TikTok cycle syncing March 2025](https://www.news-medical.net/news/20250318/TikTok-influencers-promote-cycle-syncing-but-wheree28099s-the-evidence.aspx)).

**NICE NG23 menopause guideline.** Updated November 2024; last reviewed 15 April 2026 ([NICE NG23 overview, last-reviewed April 2026](https://www.nice.org.uk/guidance/ng23), [NICE NG23 recommendations chapter](https://www.nice.org.uk/guidance/ng23/chapter/recommendations), [British Menopause Society — NICE NG23 update](https://thebms.org.uk/publications/nice-guideline/), [The Menopause Charity — 2024 NICE guideline](https://themenopausecharity.org/information-and-support/what-can-help/2024-nice-menopause-guideline/)). Core relevant clauses: diagnose perimenopause and menopause on symptoms in those 45+ without bloods; FSH only for those 40–45 or under 40; HRT response is monitored on *symptom control*, not blood oestrogen. The exportable diary remains the structural moat — and the April 2026 last-review confirms the guideline is still the live UK standard.

**RCOG Green-top No. 24 (endometriosis) + Green-top No. 41 (chronic pelvic pain).** Both UK clinical references emphasise symptom-pattern documentation as core to specialist referral ([RCOG Green-top 24 — endometriosis](https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/endometriosis-investigation-and-management-green-top-guideline-no-24/), [RCOG Green-top 41 — chronic pelvic pain](https://www.rcog.org.uk/media/muab2gj2/gtg_41.pdf)).

**ACOG 2026 endometriosis clinical guidance (Feb 2026).** First major US guideline to formally endorse clinical diagnosis from symptom-based assessment — empiric medical treatment from a symptom-led clinical diagnosis without requiring laparoscopy ([ACOG 2026 endometriosis guidance — news release](https://www.acog.org/news/news-releases/2026/02/acog-publishes-new-endometriosis-clinical-guidance-aiming-shorten-time-diagnosis-improve-access-care), [ACOG 2026 endometriosis CPG full text](https://www.acog.org/clinical/clinical-guidance/clinical-practice-guideline/articles/2026/03/diagnosis-of-endometriosis), [Endocrinology Advisor — ACOG 2026 review](https://www.endocrinologyadvisor.com/features/acog-endometriosis-guidelines/)). Implication for FemWell's Planner: the symptom diary is now a *primary clinical instrument* in two of the three major Anglophone guideline bodies. Doctor-Ready Diary becomes a substantially stronger feature claim post-Feb 2026.

**Spoon Theory (Miserandino 2003) + chronic illness pacing.** Cited in the 2026-05-13 brief; remains the right vocabulary frame for PCOS/endo/peri/ME-CFS. The 2026 NICE chronic-pain refresh and the ACOG endo update both restate the need for pattern-tracking — making the Pacing Bank tile not just brand-aligned but guideline-aligned ([Spoon Theory — Cleveland Clinic](https://health.clevelandclinic.org/spoon-theory-chronic-illness), [Spoon Theory for endometriosis — Dr Seckin](https://drseckin.com/the-spoon-theory-for-endometriosis-patients/)).

**PMDD / luteal pacing literature.** The 2024 PMC user-centred design study on a mood + menstrual tracking app for PMDD users (BMC Med Inform Decis Mak) found participants wanted (i) prediction with explicit confidence, (ii) symptom tracking that "knows" the luteal phase rather than treating it as plain calendar time, and (iii) export to a clinician ([PMC11687174 — PMDD app UCD study](https://pmc.ncbi.nlm.nih.gov/articles/PMC11687174/)). The 2025 *Scientific Reports* analysis of PMDD on Reddit (17,332 participants, 12-year corpus) confirms peer-support communities have become the de-facto support layer where formal care is absent ([Scientific Reports — PMDD Reddit 2025](https://www.nature.com/articles/s41598-025-19220-2), [PMC12488957 — same study](https://pmc.ncbi.nlm.nih.gov/articles/PMC12488957/)). Implication for FemWell: a PMDD-aware Smart View variant — luteal-honest, confidence-labelled, doctor-export-ready — is a tractable wedge into a fiercely underserved segment, with Belle, Symcycle and IAPMD's free tracker as the comparable surface ([Belle Health PMDD](https://bellehealth.co/), [Symcycle PMDD C-PASS](https://symcycle.app/), [IAPMD free tracker](https://www.iapmd.org/shop/p/iapmd-pmds-symptom-tracker), [Me v PMDD](https://mevpmdd.com/)).

**Lunar / moon / cycle-syncing TikTok category.** Pfender 2025 quantified it, but the lived-experience side matters too: Stardust (women-built, encrypted, free, modern-witches positioning) is the closest cultural-aesthetic competitor and is praised explicitly for "daily horoscope updates and mood tracking" with "moon calendar and symbolism" ([Stardust app product page](https://stardust.app/), [Stardust App review — Creati.ai](https://creati.ai/ai-tools/stardust/), [Stardust review — DeClom](https://declom.com/stardust-app/), [Stardust review — The C Word Mag UK](https://www.thecwordmag.co.uk/c-word-loves/stardust-app-review-the-period-tracking-app-for-modern-witches)). FemWell already plans to ship Plum Night horoscope authorship + the lunar overlay as a Lifestyle-tab feature; the Planner can *quietly* allude to a moon phase tile *only* for users who opt in via Lifestyle, never as a default — keeping the clinical-credibility frame intact while serving a real cultural cohort.

### A4 — Behavioural psychology underused by the category

**Implementation intentions (Gollwitzer 1999; Sheeran-Listrom-Gollwitzer 2024 meta-analysis on 642 tests).** The 2024 meta-analysis confirms implementation intentions ("I will [behaviour] when [context]") drive effects sized .27–.66 across cognitive, affective and behavioural outcomes — medium-to-large in goal-attainment terms ([Sheeran-Listrom-Gollwitzer 2024 meta-analysis — Tandfonline](https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563), [Same meta-analysis — ResearchGate](https://www.researchgate.net/publication/378870694_The_When_and_How_of_Planning_Meta-Analysis_of_the_Scope_and_Components_of_Implementation_Intentions_in_642_Tests), [Implementation intentions at work, JOOP 2024](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/joop.12540)). Moderators: high goal-commitment and stable motivation amplify; volatile intentions damp. PMC 2024 study on imagery-reinforced implementation intentions found stronger habit-strength gains when the if-then is *mentally rehearsed* ([PMC11920387 — implementation intentions + imagery 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11920387/)). Implication: Plan-with-Jess shouldn't just produce a "tomorrow do X" plan — it should produce explicit if-thens ("when I sit down for breakfast tomorrow I will drink magnesium-rich water") and prompt mental rehearsal.

**Wendy Wood — habits as context-response associations (2024 update in *Current Directions in Psychological Science*).** Habits form when actions repeat in stable contexts; the context cue activates the response — motivation has limited effect once a habit forms ([Wood 2024 — Sage Current Directions](https://journals.sagepub.com/doi/abs/10.1177/09637214241246480), [APA Monitor — Wendy Wood Jan-Feb 2026](https://www.apa.org/monitor/2026/01-02/wendy-wood-habits-behavior-change)). The 2023 Labrecque/Lee/Wood study on measuring context-response associations directly validates this with a sushi-making task and habit-strength tests ([PubMed 38047612 — Wood context-response measurement](https://pubmed.ncbi.nlm.nih.gov/38047612/)). Implication: the Planner's morning + evening *ritual stacks* are exactly the context-cue framing the science endorses. The current rituals are good; the addition Wood's work suggests is **anchoring** — every ritual must be anchored to a stable cue (alarm dismiss → 2-min routine; toothbrush rinse → magnesium tonight), not just placed on a time-of-day chip.

**Fresh start effect (Dai, Milkman, Riis 2014; Milkman Wharton 2024 follow-ups).** People are 33% more likely to exercise at the start of a week, 47% more likely at the start of a semester; "temporal landmarks" create psychological distance from past failures ([Dai-Milkman-Riis SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2204126), [Fresh Start Effect — Management Science](https://pubsonline.informs.org/doi/10.1287/mnsc.2014.1901), [Katy Milkman — Fresh Start Effect](https://www.katymilkman.com/journal-articles/the-fresh-start-effect-temporal-landmarks-motivate-aspirational-behavior), [Psychology Today — Fresh Start Sep 2025](https://www.psychologytoday.com/us/blog/leading-for-success/202509/harnessing-the-fresh-start-effect), [Wharton Magazine — Milkman perennial favourite](https://magazine.wharton.upenn.edu/digital/katherine-milkmans-fresh-start-study-becomes-perennial-media-favorite/)). Women's cycles offer **the only sex-specific temporal landmark in the literature**: cycle Day 1, post-period day, ovulation day, first day of new cycle. FemWell is the unique app that can wire fresh-start prompts to *biological* landmarks not just calendar ones. Implication: a "today is your fresh-start day" gentle prompt on cycle Day 1 (or post-period day for users who find Day 1 too heavy) is a defensible, novel mechanic.

**Identity-based habits (James Clear, *Atomic Habits*).** Three-layer model: outcome change → process change → identity change; lasting change runs through identity ("I am the kind of person who…"). Atoms is Clear's official app ([James Clear — identity-based habits](https://jamesclear.com/identity-based-habits), [QuickStart Guide PDF](https://jamesclear.com/wp-content/uploads/2016/05/CU-Identity-Based-Habits.pdf), [Atoms — Atomic Habits app](https://atoms.jamesclear.com/), [Hinge Health on identity-based habits](https://www.hingehealth.com/resources/articles/identity-and-habits/)). The 2025 mini-review in *World Journal of Advanced Research and Reviews* synthesised identity-based habits with Fogg's Tiny Habits and Kaizen ([WJARR 2025 mini-review on habit formation](https://wjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1333.pdf)). Implication for FemWell: every Smart View card can carry a *gentle identity affirmation* — "you tend to walk after lunch on Wednesdays" → "you're someone whose afternoon energy comes from a 15-min walk." Not aspirational identity ("be more disciplined"); observed identity from the user's own data.

**Variable-ratio reinforcement (Skinner) and the ethics line.** VR schedules drive the strongest persistence of behaviour but are also the substrate of slot-machine and social-media addiction ([Reinforcement Schedule in the Digital Age — ResearchGate 2025](https://www.researchgate.net/publication/395115230_Reinforcement_Schedule_in_the_Digital_Age), [Variable ratio in social media — Unplugged Psych](https://www.unpluggedpsych.com/the-power-of-variable-ratio-reinforcement-in-social-media/), [Dopamine loops and player retention — JCOMA 2025](https://jcoma.com/index.php/JCM/article/download/352/192), [Dark patterns regulation review 2025 — Tandfonline](https://www.tandfonline.com/doi/full/10.1080/13600834.2025.2461958)). The mechanic FemWell can use ethically: **occasional surprise gifts inside Plus** (a free Atelier chapter the user wasn't expecting, an Astra Cole bonus reading), variable in timing and content, *not* tied to opening the app or completing tasks. The mechanic FemWell must not use: pull-to-refresh content delivery, randomised reward badges for streak length, or hidden achievements.

**Loss aversion (Kahneman/Tversky) applied to streaks.** Losing a streak feels twice as bad as gaining one of equivalent length ([The Decision Lab — loss aversion](https://thedecisionlab.com/biases/loss-aversion), [Yu-kai Chou — prospect theory](https://yukaichou.com/behavioral-analysis/prospect-theory-loss-aversion-kahneman-tversky/), [Streaks UX Smashing Magazine Feb 2026](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/), [Psychology of Streaks — Cohorty blog](https://blog.cohorty.app/the-psychology-of-streaks-why-they-work-and-when-they-backfire/), [Why streaks lie — DEV Community](https://dev.to/eastkap/why-streaks-are-lying-to-you-and-what-to-track-instead-4hci)). FemWell's "missed day isn't a loss" copy is the right counter-narrative; the structural protection is **streak freezes by default** (auto-applied on cycle days 1–2 or any day with Pacing Bank "low spoons" flag).

**Social commitment + identity reframing.** Habitica's 40% D30 retention lift from social/party play ([Habitica review 2026](https://calmevo.com/habitica-review/)) is the clearest numeric evidence in the consumer category. Implication: Partner Sync and Care Bridge are not just emotional features — they're measurable retention multipliers when implemented as identity-affirming, *invited* surfaces.

### A5 — Forum / Reddit / Mumsnet refresh (new themes)

Beyond the eight themes in the 2026-05-13 brief, four new themes surface from the May 2026 sweep.

**Theme 9 — "the app keeps changing the layout and breaking my history."** Balance app users on Google Play UK in May 2026 reported their period information disappeared after a format change, making month-as-a-whole views impossible — developers apologised and routed users to support ([Balance — Google Play UK reviews](https://play.google.com/store/apps/details?id=com.balance_app.app&hl=en_GB)). Implication for FemWell: any month-ribbon redesign must preserve and migrate prior cycle data with explicit visible reassurance. The "Shape C ribbon" is a UI change — the underlying CycleLogs entity must not regress.

**Theme 10 — "I cancelled and got charged anyway."** PCOS Tracker App users reported being charged $100 three months after cancellation; described the app as "false advertisement to exploit women with PCOS" ([PCOS Tracker App — App Store reviews](https://apps.apple.com/us/app/6739416655?see-all=reviews&platform=iphone)). Implication for FemWell's Plus tier: in-app cancellation, transparent £-billed receipts, no hidden auto-renew. The MHRA/ORCHA DTAC clinical-safety lens has only sharpened in 2026 ([ORCHA DTAC simplified Feb 2026](https://info.orchahealth.com/digital-technology-assessment-criteria-dtac), [NHS Transformation Directorate — DTAC](https://transform.england.nhs.uk/key-tools-and-info/digital-technology-assessment-criteria-dtac/)); Plus billing trust is now table stakes.

**Theme 11 — "the app's algorithm doesn't work for my body."** Health & Her users describing the app as "completely useless" because perimenopause cycles of 2–3 days every 2 weeks weren't recognised as periods ([Best menopause apps 2026 — The Flow Space](https://www.theflowspace.com/reproductive-health/menopause/best-menopause-apps-2941944/)); same complaint reappears in r/Perimenopause ([Best perimenopause app 2026 — Go Go Gaia](https://www.go-go-gaia.com/blog/best-perimenopause-tracking-app.html)). Implication: the Planner must surface an *unreadable cycle* state honestly — "your cycle isn't readable this month" — and switch to capacity-and-sleep-driven framing without forcing the user into a phase-keyed mode that doesn't fit.

**Theme 12 — "where can I track HRT alongside my actual life?"** Recurring Mumsnet thread: women on cyclical or sequential HRT need a daily diary that captures the patch swap, the progesterone day-in-cycle, AND their fatigue, AND their sleep, AND their period (or breakthrough bleed) — and existing trackers split that across 3 apps ([Mumsnet menopause — perimenopause what helped you](https://www.mumsnet.com/talk/general_health/5242677-perimenopause-what-helped-you), [Mumsnet — has anyone used a peri/menopause app](https://www.mumsnet.com/talk/_chat/4568193-has-anyone-used-a-perimenopause-app), [Mumsnet — crushing fatigue perimenopause](https://www.mumsnet.com/talk/menopause/4642140-crushing-fatigue-perimenopause)). The Tonight's Window with HRT row in the 2026-05-13 brief is the right answer; this refresh validates urgency.

**Theme 13 — "PMDD-specific, luteal-honest, doctor-export-ready, free."** From r/PMDD and the IAPMD community ([Scientific Reports — PMDD Reddit case study 2025](https://www.nature.com/articles/s41598-025-19220-2), [IAPMD free PMDS tracker](https://www.iapmd.org/shop/p/iapmd-pmds-symptom-tracker), [Symcycle PMDD C-PASS](https://symcycle.app/)). The Pacing Bank tile + Doctor-Ready Diary together cover this need.

### A6 — UK-local specifics (deeper than the 2026-05-13 brief)

**Renewed Women's Health Strategy for England, April 2026 (CP1558).** Full document published as accessible PDF; published also on GOV.UK as a policy paper ([Strategy PDF — assets.publishing.service.gov.uk April 2026](https://assets.publishing.service.gov.uk/media/69df5d7261d2e8e9b9e42d2e/renewed-womens-health-strategy-for-england-web-accessible.pdf), [Strategy paper landing — GOV.UK](https://www.gov.uk/government/publications/womens-health-strategy-for-england/womens-health-strategy-for-england), [NHE — women at heart of care April 2026](https://www.nationalhealthexecutive.com/articles/women-put-heart-care-renewed-womens-health-strategy), [HTN — strategy summary April 2026](https://htn.co.uk/2026/04/20/data-digital-and-experiences-outlined-in-renewed-womens-health-strategy-for-england/), [VWV — strategy commentary April 2026](https://www.vwv.co.uk/insights/articles/the-renewed-womens-health-strategy-for-england-a-catalyst-for-change/), [Future Femhealth — £1.5m FemTech fund](https://www.futurefemhealth.com/p/englands-womens-health-strategy-to)). Key planner-relevant clauses:

1. **Single Patient Record via NHS App by 2028.** FemWell's Doctor-Ready Diary becomes the *export pipe* into the SPR — high alignment, low build cost (PDF + iCal feeds first; FHIR R4 export later).
2. **Menstrual and menopause problems are 2 of 9 inaugural NHS Online virtual-hospital pathways.** FemWell's Planner can position as "the diary the NHS Online clinician opens before the consultation."
3. **My Choices service in NHS App** lets users compare providers on patient experience — a Care Bridge interface point.
4. **£1.5m FemTech fund + female-founder accelerator** within 12 months — direct strategic capital for evidence-backed UK FemTech players. FemWell qualifies on positioning if not yet on evidence.

**ORCHA DTAC (Digital Technology Assessment Criteria).** ORCHA has been NHS's app-assessment partner since 2015 ([ORCHA — DTAC overview](https://www.orchahealth.com/resources/assessment-frameworks/dtac), [ORCHA — new DTAC for health and social care](https://orchahealth.com/new-digital-technology-assessment-criteria-for-health-and-social-care-dtac/), [NHS Transformation Directorate — DTAC](https://transform.england.nhs.uk/key-tools-and-info/digital-technology-assessment-criteria-dtac/), [ORCHA — 100% DTAC compliance support](https://info.orchahealth.com/digital-technology-assessment-criteria-dtac-nhs-compliance-support)). As of February 2026 the DTAC form is 25% shorter; the previous version becomes invalid from 6 April 2026. Listing in the ORCHA digital health library reaches 70% of NHS regions. **Planner-relevant signal:** Balance is ORCHA-certified, Health & Her is "no.1 rated menopause app by Orcha" ([Health & Her app product page](https://healthandher.com/en-us/pages/menopause-perimenopause-app)). FemWell has a 90-day window to file a simplified DTAC submission and shift from "consumer wellness app" to "DTAC-aligned wellbeing app."

**MHRA app classification.** Class I medical device classification kicks in only when the app makes diagnostic or therapeutic claims. FemWell's Planner copy guardrails (no imperative phase claims, no prescriptive medication advice, permissive cycle framing) keep the app below the MHRA threshold — but the Doctor-Ready Diary is *adjacent* to a Class I claim if the export PDF says "this user has X." Diary copy must say "this user logged X over Y days," not "the app concludes X." Guard the wording.

**UK-specific competitors deeper than Balance.**

- *Health & Her.* Longitudinal cohort study (Dec 2023, *Menopause*) showed app use associated with measurable symptom improvement ([Health & Her cohort study — PubMed](https://pubmed.ncbi.nlm.nih.gov/38159963/), [Health & Her — Google Play UK](https://play.google.com/store/apps/details?id=com.healthandher&hl=en_GB), [Health & Her — Apple App Store UK](https://apps.apple.com/gb/app/health-her-menopause-app/id1519199698)). UK-rooted, free, ORCHA-rated. Strong, mature competitor in the menopause-only lane.
- *Mpwr / Stella by Vira Health* (Cambridge / Gates Cambridge). Personalised holistic treatment plan, learning modules, coaching, community ([Vira Health × Stella — Innovate UK](https://iuk-business-connect.org.uk/projects/healthy-ageing-challenge-community-of-practice/vira-health-stella-managing-menopause-for-healthy-ageing/), [Stella menopause — Gates Cambridge news](https://www.gatescambridge.org/about/news/new-app-aims-to-help-women-through-the-menopause/)). Clinical-academic positioning; weaker daily-return surface — opportunity.
- *mySysters.* UK perimenopause-and-menopause symptom tracker + forum; long-established, very community-led ([mySysters](https://mysysters.com/)).
- *Midday* (UK-aware but US-rooted, Mayo Clinic partnership, telehealth) — clinical access positioning ([Midday — perimenopause symptoms tracker](https://www.joinmidi.com/post/perimenopause-symptoms-tracker)). Not a direct UK competitor today but a likely entrant.

**UK-specific opportunity:** the menopause lane is crowded with strong UK-rooted apps. FemWell's broader positioning — cycle + life-stage + planner + lifestyle/horoscope + clinician-grade-content — is *not* matched by any single UK player in May 2026.

### A7 — "Best in market" reframed as defensibility moats (for a £1M sale)

A buyer (Hims&Hers, ŌURA, Apple/iCloud Health, P&G Ventures, AccelerateHER, Maven, Talkspace, Babylon, or a UK NHS-aligned acquirer) does not pay £1M for "Planner features." They pay for moats. Five moats matter, in roughly the order of how directly the Planner contributes.

**1. Engagement moat — D30 retention above category baseline.** Habit-tracker category D30 baseline is widely modelled around 20–25% for solo trackers; gentleness apps (Finch) and gamified-with-social (Habitica party play) clear ~30–35% with the 40% lift cited above ([Habitica review 2026 — Calmevo](https://calmevo.com/habitica-review/)). The Planner — when fully wired with Phase 2 — owns the daily-return moment. **Planner-contributed moat strength: very high.**

**2. Data moat — longitudinal symptom-cycle data with clinical-grade quality.** Apple Health Study, Maven Intelligence, Hormona and Wild.ai all chase this; Maven Intelligence uses EHR + wearable + member-history fusion ([Maven Intelligence — PRNewswire](https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html)). FemWell's Planner is the unique surface that captures both *what the body does* (HabitLogs, MealPlans, Tonight's Window) and *what the woman did with that* (PersonalTasks/Plan-with-Jess plan). The combined record is what makes the data scientifically interesting; the Doctor-Ready Diary is what makes it clinically usable. **Planner-contributed moat strength: very high.**

**3. Regulatory moat — ORCHA / DTAC / NHS pathway alignment.** ORCHA-certified is the explicit UK clinical-recognition badge; DTAC has been simplified Feb 2026 ([ORCHA DTAC](https://www.orchahealth.com/resources/assessment-frameworks/dtac)). Balance has it; FemWell does not yet. The Planner is the *single feature* that makes a DTAC submission compelling because it is the cross-evidence locus — cycle + HRT + symptoms + program adherence + content engagement, all in one place. **Planner-contributed moat strength: very high.**

**4. Content moat — Atelier-grade clinician-authored copy layered into rituals + Smart View + Tonight's Window.** Pfender 2025's TikTok analysis (only 4% cite research, 30% provide credentials) names the moat: be the app where every claim is citable, every author is credentialed, and the planner phrases the content as the user moves through their day ([Pfender 2025](https://onlinelibrary.wiley.com/doi/10.1111/psrh.70004)). **Planner-contributed moat strength: high — the planner surfaces the content; Lifestyle authors it.**

**5. Network moat — Partner Sync, Care Bridge clinician portal, Atelier-author following.** Habitica social retention data ([Habitica review 2026](https://calmevo.com/habitica-review/)) shows the lift is measurable. The Planner is the dependency-graph surface — every other moat plugs into it. **Planner-contributed moat strength: medium today, high once Care Bridge surfaces.**

**Bottom-line acquirer pitch (sale-readiness one-liner):** "FemWell is the UK's only women's-wellness app where the same Planner page is the daily-return surface, the NICE-NG23-aligned clinical diary, and the capacity-aware AI orchestration layer for a women's body across cycle and life stage — and our active-user base already lets a clinician open one PDF and see what to do." Every clause maps to a feature: daily-return = data unification + Smart View; clinical diary = Doctor-Ready Diary; AI orchestration = Plan-with-Jess + Capacity Tax + Quiet Mode.

---

## Part B — Brainstorm: 10+ novel mechanics

Ranked by impact-on-sale × (1 / build-cost), with the 2026-05-13 brief's ten as the floor. **Bold = not in the 2026-05-13 brief.** Numbers refer to the Phase-2 page composition in `femwell_planner_final.html`.

| # | Mechanic | Why it matters | Cost | Rank | Origin | Slot |
|---|---|---|---|---|---|---|
| 1 | Data unification (HabitLogs + UserPrograms + DailyPlan + MealPlans) | Empty-state collapse kills D7; data exists, surface it | S | 10 | 2026-05-13 brief #2 | Morning Stack, Today's Program, Meals, Commitments |
| 2 | Smart View retargeting (idle / streaky / stuck / drifting) | Calm horizon vs backward log; addresses Theme 9 layout-break tolerance | S | 10 | 2026-05-13 brief #1 | Existing Smart View |
| 3 | **Capacity Tax (Look-ahead friction)** | Shows predicted next-week load vs predicted capacity; 1-tap "defer reschedulable"; category-original; inverse of Motion | M | 9 | Halli example + Motion analysis (A2) | New section between Month Ribbon and Smart View |
| 4 | **Doctor-Ready Diary (always-on, NICE-NG23-aligned)** | Single moat-strongest feature against Balance; aligns to Renewed Strategy April 2026 + NHS App SPR pipeline | M | 9 | A6 + Balance comparison | Settings + a "Share with GP" tile in Tonight's Window |
| 5 | Plan-with-Jess weekly draft (LLM orchestration) | Maven Intelligence is the precedent; nobody does B2C-daily; identity-based affirmation per day | M | 8 | 2026-05-13 brief #4 + identity-based habits | Existing Plan-with-Jess card |
| 6 | Ritual bundles write-path (tap-to-add → HabitLogs) | Category-original; bundles bind FemWell content + planner | M | 8 | 2026-05-13 brief #5 + Wood context-response | Existing carousel |
| 7 | **Quiet Mode auto-pull-back** | When (cycle phase + sleep + mood + last 3 days adherence) cross a threshold, Planner proactively dims commitments before user logs; structural answer to perimenopause fatigue | M | 8 | Mumsnet Theme 12 + capacity science | Smart View top card; subscriber-toggled |
| 8 | Phase-tense forecast strip with explicit confidence label | Honesty differentiates from Hormona over-promise; Oura now ships 12-mo forecasts | M | 8 | 2026-05-13 brief #3 + Oura Cycle Insights | Above day chips |
| 9 | Tonight's Window — HRT row | Theme 12; NICE NG23 makes diary the clinical instrument | S | 8 | 2026-05-13 brief #7 | Existing Tonight's Window |
| 10 | **Reframe Engine (when-missed copy)** | When user marks habit missed, surface a specific reframe before empty checkbox ("a missed magnesium isn't a loss"); operationalises gentle-streak | S | 8 | Halli example + Finch behavioural evidence | Behind each habit row; non-blocking |
| 11 | **Cycle-Mirror weekly recap (5-min Sunday-night ritual)** | Jess shows what worked this cycle vs last; identity-based gentle data mirror; fresh-start trigger for next cycle | M | 7 | Halli example + fresh-start effect (A4) | New Sunday-only card below evening stack |
| 12 | Shutdown ritual (mood + 1-line note → JessMemory) | Sunsama move in FemWell voice; closes engagement loop | S | 7 | 2026-05-13 brief #8 + Sunsama analysis | Below evening stack |
| 13 | **Fresh-Start Day prompt (cycle-Day-1 or post-period day)** | First app to anchor fresh-start to biological landmark; soft, opt-out | S | 7 | Dai-Milkman 2014 + FemWell uniqueness | Smart View top card on the eligible day |
| 14 | Pacing Bank (Low Spoons toggle) | First wellness planner with native spoon theory; serves chronic-illness segment | M | 7 | 2026-05-13 brief #6 + spoon theory | After day head, opt-in |
| 15 | **Anchored ritual stacks (cue-binding for each ritual)** | Wood 2024 — habit = context-response; explicit cue ("after alarm dismiss") not just clock time | S | 7 | A4 Wood research | Existing morning/evening stacks; cue field added |
| 16 | **Streak Freezes by default on cycle Day 1–2 & low-spoons days** | Loss-aversion turned protective; structurally prevents shame on biologically-honest days | S | 7 | A4 Kahneman + Smashing Magazine Feb 2026 | Gentle streaks card |
| 17 | **Identity-affirmation micro-line on Smart View cards** | "You're someone who walks Wednesday afternoons" — observed identity not aspirational; from user's own data | S | 6 | Atomic Habits + A4 | Smart View |
| 18 | **"What this day is good for" — capacity, not phase, primary** | The 2026-05-13 demo already shows chips; refresh: drive chips from capacity composite (cycle + sleep + commitments) with phase as one of N inputs, not THE input | S | 6 | A3 McNulty + Pfender + Halli example | Existing chips section |
| 19 | **Apple Health two-way sync** | Read sleep/HRV/cycle; write FemWell DailyAggregates; positions FemWell as the smart layer above iOS 26.4 Health rather than competing | L | 6 | A1 Apple iOS 26.4 + UK Single Patient Record alignment | Settings; surfaces metrics across Planner |
| 20 | **Jess quick-add (Ramble-style natural language → PersonalTasks)** | Lifts the productivity-category pattern; "I need to do PT exercises Thursday at 8pm" → entity | S | 5 | A2 Todoist Ramble + Vimcal | FAB upgrade |
| 21 | Cervical screening row (UK-local) | NHS-aligned; uses age + cycle the planner already knows; quietly responsible | S | 5 | 2026-05-13 brief #9 + UK Strategy A6 | Conditional Health-Admin tile |
| 22 | Calendar export (read-only iCal/Apple/Google) | Loud Reddit unmet need; positions FemWell as layer not competitor | L | 4 | 2026-05-13 brief #10 | Settings; Plus-gated |
| 23 | **Astra Cole horoscope sidecar (Lifestyle-opt-in)** | Quiet allusion to user's daily horoscope on the Planner; serves Stardust cohort culturally without compromising clinical frame | S | 4 | A3 Pfender + Stardust cultural analysis | Below Plan-with-Jess; only shows if Lifestyle Horoscope is opted-in |
| 24 | **Borrowed-time mode (HRT-symptom-flare auto-reschedule)** | When symptom diary shows flare, pre-populate next-week recovery slots; Care Bridge feeder | M | 5 | Halli example + Theme 12 | Tonight's Window + Smart View |

The top 12 (Rank 7+) define Planner-A and Planner-B scope. Items 13–24 fold into Planner-C or are absorbed.

---

## Part C — Demo spec (structured handoff to Cowork-the-builder)

The Cowork builder will produce `femwell_planner_v3_best_in_market_demo.html` from these section-by-section directives. The visual language stays exactly what was signed off in `femwell_planner_final.html`: cream/plum/rose/gold, Fraunces hero italics, Inter UI, Lucide SVG only, no emoji. Width-constrain to a unified 5-slot bottom nav at every viewport (no desktop sidebar).

| # | Section | Phase 2 status | Delta | Why this beats the old version |
|---|---|---|---|---|
| 1 | Page head ("Tuesday 21 April · Day 23 luteal") | Unchanged | Add a confidence pill next to "Day 23 luteal" reading "estimated · 84% from last 4 cycles" | Addresses the Hormona over-promise + Oura honesty pattern (A1) |
| 2 | Month ribbon (Shape C, phase-gradient weeks, today outlined) | Unchanged | Add a quiet `< · today · >` text affordance underneath for keyboard accessibility | DTAC accessibility compliance (A6) |
| 3 | **NEW — Capacity Tax bar** | New section | Inserted between Month ribbon and Smart View. A horizontal strip showing this week vs predicted capacity; a single "Defer reschedulable" pill on the right pulls down reschedulable PersonalTasks one tap | Mechanic #3, A4 + Motion analysis; category-original |
| 4 | Smart View card stack (NOW / WEEK AHEAD / WHAT'S UNFINISHED) | Modified | Adaptive state: 5 states now (idle / streaky / stuck / drifting / **quiet-mode**). Quiet-mode card replaces NOW when composite capacity score < threshold | Mechanic #2 + #7; Quiet Mode is the structural answer to Theme 12 |
| 5 | "What this day is good for" chips | Modified | Drive chips from capacity composite (cycle + sleep + last 3 days adherence + commitments), with phase as one of four inputs; show a small `i` for "why these" tap-out | Mechanic #18; defuses the McNulty/Pfender phase-syncing trap (A3) |
| 6 | Morning ritual stack | Modified | Each ritual row carries a small cue chip ("after alarm dismiss · 2 mins") and a Reframe shimmer on the empty checkbox | Mechanics #15 (Wood 2024) + #10 |
| 7 | Today's Program card (UserPrograms) | Unchanged | None — already wired in Phase 1 | Phase 1 |
| 8 | Today's Meals (MealPlans) | Unchanged | None | Phase 1 |
| 9 | Tonight's Window | Modified | Add an HRT row when MedicationReminders include cyclical HRT; add a "Share tonight's notes with my GP" link that opens the Doctor-Ready Diary export with current month selected | Mechanic #9 + #4 |
| 10 | Evening ritual stack | Modified | Same Reframe + cue treatment as Morning | Mechanics #10 + #15 |
| 11 | **NEW — Shutdown ritual (collapsed by default)** | New section | Below evening stack: "How did today feel?" — 4 mood pills + a single-line note → writes to JessMemory + DailyAggregates | Mechanic #12 + Sunsama |
| 12 | Ritual bundles carousel | Modified | Each bundle now has a "Build into my week" CTA (writes 5–7 rituals into HabitLogs); Pacing Bank "Low Spoons" bundle added as a 6th option | Mechanics #6 + #14 |
| 13 | Gentle streaks card | Modified | Display "consistency over 28 days" not "uninterrupted run"; show streak freezes auto-applied on biologically-honest days | Mechanic #16 + Smashing Magazine Feb 2026 |
| 14 | **NEW — Cycle-Mirror tile (Sunday-only)** | New section | Appears only on Sunday evening: "5 minutes with Jess — what worked this cycle vs last." A small chart + 3 observed-identity affirmations + a "next cycle, lean into…" line | Mechanic #11; fresh-start primer |
| 15 | Plan-with-Jess CTA | Modified | The card now also offers "Plan my next cycle" (a deeper, cycle-scoped Plan, not just weekly) — gated by Plus | Mechanic #5 deepened |
| 16 | **NEW — Fresh-Start Day banner (cycle Day 1 or post-period day, opt-out)** | Conditional | A soft "you're on Day 1 — gentle invitation to set one small thing for this cycle" prompt; opt-out lives in Settings | Mechanic #13 |
| 17 | **NEW — Doctor-Ready Diary export tile** | Conditional | Below Tonight's Window on the last weekday of the month: a "Your monthly diary is ready" card with the export PDF preview | Mechanic #4 |
| 18 | **NEW — Astra Cole horoscope sidecar (Lifestyle-opt-in only)** | Conditional | Below Plan-with-Jess; only renders when the user has opted into Horoscope in Lifestyle. One line of today's reading; tap goes to Lifestyle | Mechanic #23 |

The new sections (3, 11, 14, 16, 17, 18) all live inside the established vertical order; none break the signed-off composition; the Cowork builder treats them as conditional inserts rather than re-arrangements. **No emoji anywhere.** All copy in Atelier voice. Confidence pills, cue chips, Reframe shimmer and capacity bar use the existing brand tokens (plum 800/600, rose 500, gold 400, cream 50/100).

---

## Part D — Sequenced MP spec

### Planner-A — Sale-readiness path (2–3 MPs, weeks 1–2)

Goal: by end of week 2, a buyer demo with Planner-A live on `femwells.com/Planner` shows every Smart View state, the Capacity Tax, the Doctor-Ready Diary v1, and a populated forecast strip. **Mr Lead Manager owns scope; Ms Atelier reviews; Ms Verify lives-walks.**

**MP-A1 — Data Unification + Cycle Confidence + Day-Heading polish (S/M cost).**
- Novel mechanic shipped: #1, #8.
- Schema additions: `DailyPlan.confidence_score` (float 0–1, computed nightly), `CycleLogs.estimation_method` (enum: own_data | population_default).
- LLM calls: none. Confidence is computed (variance of last 4 cycle lengths). Forecast labels are deterministic templates ("estimated · X% based on Y cycles").
- Acceptance criteria:
  1. Live walk on operator account shows Morning Stack + Today's Program + Meals + Tonight's Window populated (no empty state).
  2. Confidence pill appears next to phase label with calibrated text.
  3. PlannerItems vs PersonalTasks two-task gotcha resolved — single source of truth confirmed in the codebase.
  4. Mobile + tablet + desktop all bottom-nav unified.
- Atelier guardrails: no imperative phase claims; phase pill never says "do" or "should"; confidence labels never claim more than the data supports.

**MP-A2 — Smart View retargeting (4 states + Quiet Mode v0) (M cost).**
- Novel mechanics shipped: #2, partial #7 (v0 = manual Quiet Mode toggle in settings; auto-activation lands in Planner-B).
- Schema: `UserState.smart_view_state` (enum: idle | streaky | stuck | drifting | quiet), computed by a nightly aggregator from `HabitLogs` + `UserPrograms` + `DailyPlan` + `JessMemory`.
- LLM calls: none for the state inference (deterministic rules); the *copy* per state lives in an Atelier-authored static JSON map.
- Acceptance criteria:
  1. Each of the 5 states demonstrable on 5 seed accounts.
  2. State refreshes nightly and on app-open.
  3. Empty state is *not* a possible state (idle is the gentlest version; never "nothing here").
- Atelier guardrails: drifting copy never reads as "you missed"; quiet-mode copy never reads as "you're failing."

**MP-A3 — Capacity Tax + Doctor-Ready Diary v1 (M cost).**
- Novel mechanics shipped: #3, #4.
- Schema: `CapacityComposite` (daily, derived from cycle phase + sleep × 1 if available + last-3-days adherence + commitments count); `DiaryExport` entity (period covered, generated PDF URL, generated_at).
- LLM calls: one per generated diary — assembles a NICE-NG23-aligned summary from `CycleLogs + SymptomLogs + MedicationReminders + JournalEntries`. System-prompt outline:
  > "You generate a one-page UK clinical diary excerpt for the named user. Output medical-grade English; never diagnostic ("the user logged X" not "the user has X"); align to NICE NG23. Include: cycle pattern over last 28/56/84 days, top 5 symptoms by frequency, HRT adherence if logged, sleep average, mood average, free-text journal patterns ≥3x occurrence. Reject hallucinations: only summarise logged data."

  Cadence: monthly (last weekday) + on-demand. Cost estimate per user per month: 1 LLM call × ~2k tokens output × £0.001/1k tokens = ~£0.002/user/month at scale. Negligible.
- Acceptance criteria:
  1. Capacity Tax bar visible above Smart View on every day; "Defer reschedulable" action reshuffles PersonalTasks into open future days within the same cycle phase.
  2. Doctor-Ready Diary PDF generates from the operator account; opens to a Newson-Health-comparable format; printable.
  3. Diary export logged in `DiaryExport`; user can re-download for any prior month.
- Atelier guardrails: diary PDF carries an "exported by FemWell · not a medical diagnosis" footer; capacity tax copy is descriptive ("this week has more on it than your usual luteal week"), never imperative.

### Planner-B — Engagement-moat path (3–4 MPs, weeks 3–6)

Goal: drive D30 from category-baseline ~25% to Finch-and-Habitica-territory 30–35%. Ms Atelier reviews every voice surface; Ms Verify live-walks each MP; Mr Fix-it patches.

**MP-B1 — Quiet Mode auto-activation + Reframe Engine + Streak Freezes (M cost).**
- Novel mechanics shipped: #7 (auto), #10, #16.
- Schema: `QuietMode.auto_threshold` (configurable composite score), `ReframeLibrary` (Atelier-authored per-ritual reframe strings), `StreakFreezes` (auto-granted credits log).
- LLM calls: optional weekly summary email "you used quiet mode 3 days this cycle — here's what you protected"; one call/user/week.
- Acceptance criteria:
  1. Quiet Mode auto-activates on cycle Day 1–2 and any day where composite < threshold; user can override.
  2. Missed-ritual rows surface a Reframe pre-emptively, before the empty checkbox is clicked.
  3. Streak freezes auto-apply on cycle Day 1–2; the "missed day" never breaks the gentle-streak count.
- Atelier guardrails: never "you missed"; always "I noticed."

**MP-B2 — Plan-with-Jess weekly + cycle-scoped + identity micro-line (M cost).**
- Novel mechanics shipped: #5 deepened, #17.
- Schema: `JessPlan` (weekly + cycle), `JessIdentityObservation` (the observed-identity affirmations).
- LLM calls: 1 weekly per user (Sunday) + 1 cycle-scoped per user (cycle Day 1) + 1 quick rewrite when user edits a day. Cost estimate: ~3 calls × 3k tokens average × £0.001/1k ≈ £0.009/user/month. Still trivial.
- Acceptance criteria:
  1. Sunday Plan generates by Sunday 18:00 BST; user reviews 7 cards, edits inline, accepts to write into `DailyPlan` × 7.
  2. Cycle-scoped Plan (Plus-gated) generates on cycle Day 1 with 28–35 daily prompts, softer in luteal.
  3. Smart View cards carry observed-identity micro-lines.
- Atelier guardrails: identity affirmations must come *from user data*, never aspirational; no "be more disciplined."

**MP-B3 — Cycle-Mirror Sunday tile + Fresh-Start Day banner + Anchored cues (M cost).**
- Novel mechanics shipped: #11, #13, #15.
- Schema: `CycleSummary` (per cycle, computed at next cycle's Day 1: what worked, what didn't); `RitualCue` (each ritual row carries a context-cue string).
- LLM calls: 1 per user per cycle (Sunday-before-Day-1) for Cycle-Mirror copy; deterministic rest.
- Acceptance criteria:
  1. Cycle-Mirror tile appears Sunday evening only; shows 3-bar chart + 3 affirmations + 1 next-cycle invitation.
  2. Fresh-Start banner appears on cycle Day 1 (opt-out in settings).
  3. Every ritual row in Morning + Evening stacks displays a cue chip pulled from `RitualCue`.
- Atelier guardrails: Fresh-Start copy never references "the new you" (loaded language); reads as gentle invitation.

**MP-B4 — Ritual bundles write-path + Pacing Bank + Shutdown ritual + Tonight's Window HRT (S/M cost).**
- Novel mechanics shipped: #6, #9, #12, #14.
- Schema: `HabitBundle.write_set` (5–7 ritual templates per bundle), `DailyPlan.pacing_mode` (normal | low_spoons | recovery), `ShutdownEntry` (mood + note).
- LLM calls: 1 per Shutdown entry to generate a one-sentence Jess reply (~150 tokens). Cost: ~£0.0001/entry; trivial.
- Acceptance criteria:
  1. Tap "Build into my week" on a bundle writes 5–7 rituals into `HabitLogs` transactionally.
  2. Low Spoons toggle collapses commitments and surfaces lightest rituals only.
  3. Shutdown ritual writes mood + note + Jess reply into `JessMemory` and `DailyAggregates`.
  4. Tonight's Window HRT row renders when `MedicationReminders` include cyclical HRT.
- Atelier guardrails: Pacing Bank copy never medicalises; bundles never override user choice; Shutdown reply never assesses, only acknowledges.

### Planner-C — Plus tier / post-sale (2–3 MPs)

**MP-C1 — Apple Health two-way sync + Calendar export.** Mechanics #19, #22. Plus-gated. Sets up the iOS 26.4 Health Plus integration path (A1). L cost.

**MP-C2 — Cervical screening row + Astra Cole horoscope sidecar + Borrowed-time mode.** Mechanics #21, #23, #24. Each S–M cost; cherry-pick into Planner-B if cheap.

**MP-C3 — DTAC simplified submission package.** Not a feature MP; a regulatory MP. Compile the evidence (Doctor-Ready Diary, brand-voice guardrails, content-moat audit, security review). ORCHA badge on the marketing site is a sale-readiness multiplier.

---

## Open questions for Halli

1. **DTAC submission window — yes/no/when?** The Feb 2026 ORCHA refresh is the cheapest moment to file. If yes, fold into Planner-C as MP-C3. If no, why not — is the buyer pre-DTAC by design?
2. **Plus tier scope — is the cycle-scoped Plan-with-Jess Plus, or free?** The MP-B2 spec assumes Plus-gated; this is the single highest-value paywall feature in the brainstorm and worth pressure-testing.
3. **Pacing Bank visibility — opt-in default, or opt-out?** The brief says opt-in; user research could argue otherwise for the chronic-illness segment. Recommend a one-line in onboarding ("do you live with PCOS, endo, peri or another condition where energy varies day-to-day? → turn on Pacing Bank") rather than a binary in Settings.
4. **Apple Health two-way sync — Planner-C or Planner-B?** Question is whether the buyer demo benefits more from "FemWell is the smart layer on iOS 26.4 Health" or from a fuller engagement-moat suite. My recommendation: Planner-C if buyer is UK-NHS-aligned; Planner-B if buyer is US-consumer-aligned.
5. **Horoscope sidecar on Planner — yes/no?** The 2026-05-14 memory note locks Horoscope to Lifestyle. The sidecar respects that (only renders if Lifestyle-opted-in) but is a category-original mechanic. Decision: ship the sidecar conditional, or hold?
6. **Capacity Tax exposure — does the user see the predicted capacity score numerically, or only qualitatively?** Wild.ai's Readiness Score (0–100) is the precedent for numeric; Stardust + Finch are the precedent for qualitative. My recommendation: qualitative ("steadier today, softer tomorrow") on the surface; the numeric is exposed only inside Plus.
7. **Voice rehearsal for the Reframe Engine — Atelier or LLM?** Costs nothing either way; the question is consistency. My recommendation: Atelier-authored library, LLM only on edge cases the library doesn't cover, with an Atelier review of every LLM-emitted reframe before it joins the library.

---

## Sources

### 2026 product launches + competitors

- [Maven Intelligence — PRNewswire late April 2026](https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html)
- [Maven Clinic goes nationwide D2C — TIME March 2026](https://time.com/article/2026/03/10/maven-clinic-digital-womens-health-services/)
- [Maven Clinic genAI on OpenAI + Google LLMs — Fierce Healthcare](https://www.fiercehealthcare.com/health-tech/maven-clinic-expands-ai-capabilities-generative-ai-openai-google)
- [Maven Intelligence overview — Femtech Insider](https://femtechinsider.com/maven-clinic-introduces-maven-intelligence-an-ai-orchestration-layer-for-womens-and-family-health/)
- [Maven Clinic — fragmented benefits report](https://www.prnewswire.com/news-releases/more-benefits-less-confidence-maven-clinics-fifth-annual-report-examines-the-impact-of-fragmented-womens-and-family-health-benefits-302695598.html)
- [Maven for Health Plans](https://www.mavenclinic.com/for-health-plans)
- [Maven Fertility expansion 2026](https://www.prnewswire.com/news-releases/maven-clinic-expands-fertility-and-family-building-program-to-deliver-earlier-answers-and-more-efficient-fertility-spend-302741388.html)
- [Maven open D2C nationwide](https://www.prnewswire.com/news-releases/maven-is-opening-its-doors-to-women-nationwide-302710779.html)
- [Manulife × Maven partnership](https://www.manulife.com/ca/en/about-us/news/manulife-partners-with-maven-clinic-to-bring-womens-and-family-health-to-members)
- [Oura — new hormonal-health features May 2026](https://ouraring.com/blog/hormonal-health-features/)
- [Oura — perimenopause overview](https://ouraring.com/blog/perimenopause/)
- [Oura Perimenopause Check-In help doc](https://support.ouraring.com/hc/en-us/articles/43647048134035-Perimenopause-Check-In)
- [Oura — Cycle Insights algorithm Nov 2025 update](https://ouraring.com/blog/oura-cycle-insights-update/)
- [Oura — women's health hub](https://ouraring.com/womens-health)
- [Oura — perimenopause insights](https://ouraring.com/perimenopause)
- [Tom's Guide — Oura new women's-health features](https://www.tomsguide.com/wellness/smart-rings/your-oura-ring-is-getting-a-bunch-of-new-womens-health-features-heres-what-you-need-to-know)
- [Cycle Insights help — Oura](https://support.ouraring.com/hc/en-us/articles/4410663885331-Cycle-Insights)
- [Oura menopause + US Open partnership — MobiHealthNews](https://www.mobihealthnews.com/news/oura-unveils-menopause-insights-birth-control-tools-us-open-partnership)
- [Apple — Findings from Apple Women's Health Study 2023](https://www.apple.com/newsroom/2023/03/findings-from-apple-womens-health-study-advance-science-around-menstrual-cycles/)
- [Apple — Cycle Tracking iPhone guide](https://support.apple.com/guide/iphone/view-menstrual-cycle-predictions-and-history-iph1a4a00aa0/ios)
- [Apple — Cycle Tracking overview](https://support.apple.com/en-us/120356)
- [Apple — Apple Watch Cycle Tracking](https://support.apple.com/guide/watch/use-cycle-tracking-apd26429adf0/watchos)
- [Apple Health product page](https://www.apple.com/health/)
- [Wareable — iOS 26.4 Health redesign + Health Plus tier](https://www.wareable.com/health-and-wellbeing/apple-health-ios-26-4-update-nutrition-tracking-health-plus-tier)
- [Zeera Wireless — iOS 26.4 Health redesign](https://zeerawireless.com/blogs/news/apple-ios-26-4-health-app-2026-major-redesign-4-new-features-release-dat)
- [Tom's Guide — Apple Cycle Tracking explainer](https://www.tomsguide.com/phones/iphones/apples-cycle-tracking-will-change-your-life-heres-how-it-works)
- [Apple Health on MacRumors](https://www.macrumors.com/guide/apple-health/)
- [Samsung Galaxy Ring product page UK](https://www.samsung.com/uk/rings/galaxy-ring/galaxy-ring-titanium-black-size-10-sm-q500nzkaeub/)
- [Tom's Guide — Galaxy Ring cycle tracking](https://www.tomsguide.com/wellness/fitness/samsung-galaxy-ring-is-changing-the-game-for-cycle-tracking-heres-how)
- [Tom's Guide — Galaxy Ring vs Oura](https://www.tomsguide.com/wellness/fitness-trackers/samsung-galaxy-ring-vs-oura-ring-everything-we-know-so-far)
- [Samsung HK — Galaxy Ring](https://www.samsung.com/hk_en/news/product/samsungs-new-galaxy-ring/)
- [Samsung wearables expansion](https://news.samsung.com/global/samsungs-expanded-wearables-portfolio-unlocks-intelligent-health-experiences-for-all)
- [Digital Trends — Galaxy Ring 2 delay](https://www.digitaltrends.com/wearables/samsungs-next-smart-ring-is-running-late-but-youll-appreciate-the-planned-upgrades/)
- [Galaxy Ring US product page](https://www.samsung.com/us/rings/galaxy-ring/)
- [Hormona perimenopause tracker app](https://www.hormona.io/product/perimenopause-tracker-app/)
- [Hormona Apple App Store](https://apps.apple.com/us/app/hormona-period-hormones/id1589458330)
- [Hormona product](https://www.hormona.io/)
- [Balance app marketing page](https://balance-app.com/)
- [Balance — Apple App Store US](https://apps.apple.com/us/app/balance-menopause-hormones/id1503345959)
- [Balance — Apple App Store UK](https://apps.apple.com/gb/app/balance-menopause-hormones/id1503345959)
- [Balance — Google Play UK](https://play.google.com/store/apps/details?id=com.balance_app.app&hl=en_GB)
- [Balance — Google Play US](https://play.google.com/store/apps/details?id=com.balance_app.app&hl=en_US)
- [Balance — main website](https://www.balance-menopause.com/)
- [Balance — Dr Newson reveal](https://www.menopausedoctor.co.uk/news/its-here-balance-the-new-menopause-app-thats-designed-to-empower)
- [Balance app product page](https://www.balance-menopause.com/balance-new-2/)
- [Balance — Jane Oglesby + Dr Newson podcast](https://www.drlouisenewson.co.uk/podcasts/balance-menopause-app---jane-oglesby-and-dr-louise-newson)
- [Balance app product overview](https://www.balance-menopause.com/balance-app/)
- [Health & Her app — main](https://healthandher.com/en-us/pages/menopause-perimenopause-app)
- [Health & Her — homepage](https://healthandher.com/en-us)
- [Health & Her — Google Play UK](https://play.google.com/store/apps/details?id=com.healthandher&hl=en_GB)
- [Health & Her — App Store UK](https://apps.apple.com/gb/app/health-her-menopause-app/id1519199698)
- [Health & Her longitudinal cohort study — PubMed Dec 2023](https://pubmed.ncbi.nlm.nih.gov/38159963/)
- [Health & Her — PMC mirror](https://pmc.ncbi.nlm.nih.gov/articles/PMC10759107/)
- [Stella by Vira Health — Innovate UK](https://iuk-business-connect.org.uk/projects/healthy-ageing-challenge-community-of-practice/vira-health-stella-managing-menopause-for-healthy-ageing/)
- [Stella — Gates Cambridge announcement](https://www.gatescambridge.org/about/news/new-app-aims-to-help-women-through-the-menopause/)
- [mySysters](https://mysysters.com/)
- [Midi — perimenopause symptom tracker piece](https://www.joinmidi.com/post/perimenopause-symptoms-tracker)
- [Best perimenopause app 2026 — Go Go Gaia](https://www.go-go-gaia.com/blog/best-perimenopause-tracking-app.html)
- [Best perimenopause apps 2026 — pregnancyapp.com](https://pregnancyapp.com/best-perimenopause-app/)
- [Best menopause apps 2026 — Femtech World](https://www.femtechworld.co.uk/insight/best-menopause-apps-and-products-for-2026/)
- [Best menopause apps — The Flow Space](https://www.theflowspace.com/reproductive-health/menopause/best-menopause-apps-2941944/)
- [HealthyWomen — menopause apps](https://www.healthywomen.org/your-health/menopause-aging-well/app-for-menopause)
- [Systematic review of menopause apps — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10542256/)
- [PCOS Tracker App reviews — App Store](https://apps.apple.com/us/app/6739416655?see-all=reviews&platform=iphone)
- [PCOS Tracker App listing](https://apps.apple.com/us/app/pcos-tracker-app/id6739416655)
- [Best ovulation tracker apps for PCOS 2025](https://app.pcosmealplanner.com/knowledge-articles/any/best-ovulation-tracker-for-pcos-app-reviews-2025)
- [AskPCOS app — Monash](https://www.monash.edu/medicine/mchri/pcos/resources-monash/askpcos-app-monash)
- [AskPCOS](https://www.askpcos.org/)
- [Oana — best PCOS apps for weight loss](https://www.oanahealth.com/post/best-pcos-apps-tracking-weight-loss-progress)
- [Stardust app](https://stardust.app/)
- [Stardust — Google Play](https://play.google.com/store/apps/details?id=com.stardust.app)
- [Stardust — Creati.ai overview](https://creati.ai/ai-tools/stardust/)
- [Stardust — DeClom review](https://declom.com/stardust.app)
- [Stardust — C Word Mag UK review](https://www.thecwordmag.co.uk/c-word-loves/stardust-app-review-the-period-tracking-app-for-modern-witches)
- [Stardust — index page](https://stardust.app/index.html)
- [Belle Health — PMDD tracker](https://bellehealth.co/)
- [Me v PMDD](https://mevpmdd.com/)
- [Symcycle — PMDD C-PASS](https://symcycle.app/)
- [IAPMD — free PMDS tracker](https://www.iapmd.org/shop/p/iapmd-pmds-symptom-tracker)
- [PMDD app UCD study — PMC11687174](https://pmc.ncbi.nlm.nih.gov/articles/PMC11687174/)
- [PMDD Reddit case study — Scientific Reports 2025](https://www.nature.com/articles/s41598-025-19220-2)
- [PMDD Reddit case study — PMC12488957](https://pmc.ncbi.nlm.nih.gov/articles/PMC12488957/)
- [Managing PMDD — Legacy for Women OB-GYN](https://legacyforwomenobgyn.com/guide-to-managing-pmdd/)
- [PMDD treatment update — PMC2440788](https://pmc.ncbi.nlm.nih.gov/articles/PMC2440788/)

### Productivity / planner crossover

- [Motion app review — Efficient App 2026](https://efficient.app/apps/motion)
- [Motion pricing — Alfred 2026](https://get-alfred.ai/blog/motion-pricing)
- [Motion pricing — Morgen.so](https://www.morgen.so/blog-posts/motion-pricing)
- [Motion reviews — G2 2026](https://www.g2.com/products/motionapp/reviews)
- [Motion AI review — Rimo 2026](https://rimo.app/en/blogs/motion-ai_en-US)
- [Motion app review — Ellie 2026](https://ellieplanner.com/comparisons/motion-app-review)
- [Motion 2026 — GetApp](https://www.getapp.com/emerging-technology-software/a/motion/)
- [Motion App Review — The Business Dive](https://thebusinessdive.com/motion-app-review)
- [Motion pricing 2026 — CheckThat.ai](https://checkthat.ai/brands/motion/pricing)
- [Motion AI review — Max Productive](https://max-productive.ai/ai-tools/motion-ai/)
- [Akiflow vs TickTick 2026](https://toolfinder.com/comparisons/akiflow-vs-ticktick)
- [Akiflow alternatives 2026](https://sintra.ai/blog/akiflow-alternatives)
- [Best to-do apps 2026](https://toolfinder.com/best/to-do-list-apps)
- [TickTick vs Todoist 2026 — 2sync](https://2sync.com/blog/ticktick-vs-todoist)
- [TickTick alternatives 2026](https://toolfinder.vercel.app/alternatives/ticktick)
- [Akiflow alternatives 2026 — Alfred](https://get-alfred.ai/blog/best-akiflow-alternatives)
- [TickTick vs Todoist 2026 — Rambox](https://rambox.app/blog/ticktick-vs-todoist/)
- [Todoist alternatives 2025 — Akiflow](https://akiflow.com/blog/top-todoist-alternative-2025)
- [Task planner apps 2026 — onplanners](https://onplanners.com/apps/task-planners)
- [Todoist vs TickTick — Akiflow](https://akiflow.com/blog/todoist-vs-ticktick)
- [Vimcal](https://www.vimcal.com/)
- [Vimcal EA](https://www.vimcal.com/ea)
- [Vimcal App Store](https://apps.apple.com/us/app/vimcal-calendar-and-schedule/id1608841561)
- [Vimcal — Aiquiks profile](https://aiquiks.com/ai-tools/vimcal)
- [Granola vs Google Calendar 2026](https://toolfinder.com/comparisons/granola-vs-google-calendar)
- [13 best AI schedule makers 2026 — Taskade](https://www.taskade.com/blog/ai-schedule-makers)
- [6 best calendar apps 2026 — Toolfinder](https://toolfinder.com/best/calendar-apps)
- [Best AI scheduling assistants 2026 — Ayari](https://ayari.io/article/best-ai-scheduling-assistants)
- [7 best AI calendar assistants 2026 — Alfred](https://get-alfred.ai/blog/best-ai-calendar-assistants)
- [Best AI scheduling tools 2026 — Boldly](https://boldly.com/blog/the-best-ai-scheduling-tools/)
- [Apps Like Finch 2026 — Calmevo](https://calmevo.com/apps-like-finch/)
- [Finch app review 2026 — Calmevo](https://calmevo.com/finch-app-review/)
- [Finch alternatives 2026 — Habi](https://habi.app/insights/finch-alternatives/)
- [Best habit-tracker apps 2026 — Habi](https://habi.app/insights/best-habit-tracker-apps/)
- [Best apps for habit tracking 2026 — Porto](https://www.portotheme.com/best-apps-for-habit-tracking-in-2026/)
- [Best habit-tracker apps 2026 — Expirel](https://expirel.com/best-apps-for-habit-tracking)
- [Best habit-tracker apps 2026 — Mindful Suite](https://www.mindfulsuite.com/reviews/best-habit-tracker-apps)
- [Finch review — CLT Counseling](https://www.cltcounseling.com/resources/finch-habit-tracker-app-review)
- [Habitica review 2026 — Calmevo](https://calmevo.com/habitica-review/)
- [Habitica vs Finch 2026 — Calmevo](https://calmevo.com/habitica-vs-finch/)

### Behavioural science

- [Sheeran-Listrom-Gollwitzer meta-analysis 642 tests — Tandfonline 2024](https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563)
- [Sheeran-Listrom-Gollwitzer meta-analysis — ResearchGate 2024](https://www.researchgate.net/publication/378870694_The_When_and_How_of_Planning_Meta-Analysis_of_the_Scope_and_Components_of_Implementation_Intentions_in_642_Tests)
- [Gollwitzer-Sheeran 2006 meta-analysis — APA PsycNet](https://psycnet.apa.org/record/2007-19538-002)
- [Implementation intentions + imagery — PMC11920387 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11920387/)
- [Implementation intentions meta-analysis pro-environmental — ScienceDirect 2025](https://www.sciencedirect.com/science/article/abs/pii/S2352550925000260)
- [Implementation intentions at work — JOOP Wiley 2024](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/joop.12540)
- [Implementation intentions meta-analysis original — ResearchGate](https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes)
- [Implementation intentions behavioural + physiological — PMC4500900](https://pmc.ncbi.nlm.nih.gov/articles/PMC4500900/)
- [Implementation intentions in physical activity students — MDPI](https://www.mdpi.com/2071-1050/15/16/12457)
- [Mental contrasting + implementation intentions meta-analysis — PMC8149892](https://pmc.ncbi.nlm.nih.gov/articles/PMC8149892/)
- [Fresh Start Effect — SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2204126)
- [Fresh Start Effect — RePEc](https://ideas.repec.org/a/inm/ormnsc/v60y2014i10p2563-2582.html)
- [Fresh Start Effect — Management Science INFORMS](https://pubsonline.informs.org/doi/10.1287/mnsc.2014.1901)
- [Put your imperfections behind you — PMC4839284](https://pmc.ncbi.nlm.nih.gov/articles/PMC4839284/)
- [Fresh Start Effect — Semantic Scholar PDF](https://www.semanticscholar.org/paper/The-Fresh-Start-Effect:-Temporal-Landmarks-Motivate-Dai-Milkman/f2d7b7a5c53fa4ae79bc1ab03fe7be928de908db)
- [Fresh Start Effect — Learning Loop](https://learningloop.io/plays/psychology/fresh-start-effect)
- [Fresh Start Effect — Katy Milkman site](https://www.katymilkman.com/journal-articles/the-fresh-start-effect-temporal-landmarks-motivate-aspirational-behavior)
- [Fresh Start Effect PDF — Milkman site](https://katherinemilkman.squarespace.com/s/the-fresh-start-effect-motivational-boosts-beyond-new-years-resolutions.pdf)
- [Fresh Start Effect — Wharton Magazine](https://magazine.wharton.upenn.edu/digital/katherine-milkmans-fresh-start-study-becomes-perennial-media-favorite/)
- [Harnessing Fresh Start — Psychology Today Sep 2025](https://www.psychologytoday.com/us/blog/leading-for-success/202509/harnessing-the-fresh-start-effect)
- [James Clear — identity-based habits](https://jamesclear.com/identity-based-habits)
- [James Clear — QuickStart Guide PDF](https://jamesclear.com/wp-content/uploads/2016/05/CU-Identity-Based-Habits.pdf)
- [James Clear — identity & votes](https://jamesclear.com/identity-votes)
- [Atoms — Atomic Habits app](https://atoms.jamesclear.com/)
- [Hinge Health — identity & habits](https://www.hingehealth.com/resources/articles/identity-and-habits/)
- [Identity-based habits blueprint — Moore Momentum](https://mooremomentum.com/blog/the-identity-based-habits-blueprint/)
- [True behaviour change is identity change](https://strongbodygreenplanet.com/james-clear-and-atomic-habits-true-behaviour-change-is-identity-change/)
- [Atomic Habits — Medium repost](https://medium.com/@jamesclear/identity-based-habits-how-to-actually-stick-to-your-goals-bc8cde3c8e22)
- [Atomic Habits — Who Am I overview](https://www.healingheartsccaz.com/edu/atomic-habits-who-am-i-true-behavior-change-is-identity-change)
- [Why identity-based habits work — Dr Paul McCarthy](https://www.drpaulmccarthy.com/post/why-identity-based-habits-work-when-everything-else-fails)
- [Atomic Habits for Studying — SDSU](https://www.sdstate.edu/sites/default/files/file-archive/2025-06/Atomic-Habits-for-Studying.pdf)
- [Mini review of habit formation — WJARR 2025](https://wjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1333.pdf)
- [Wendy Wood 2024 — Sage Current Directions](https://journals.sagepub.com/doi/abs/10.1177/09637214241246480)
- [APA Monitor — Wendy Wood Jan-Feb 2026](https://www.apa.org/monitor/2026/01-02/wendy-wood-habits-behavior-change)
- [Measuring context-response associations — PubMed 38047612](https://pubmed.ncbi.nlm.nih.gov/38047612/)
- [Psychology of Habit — PubMed 26361052](https://pubmed.ncbi.nlm.nih.gov/26361052/)
- [Habits triggers — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S002210311100254X)
- [Habits triggers PDF — USC Dornsife](https://dornsife.usc.edu/wendy-wood/wp-content/uploads/sites/183/2024/01/neal.wood_.labrecque.lally_.2012.pdf)
- [Good Habits, Bad Habits — Shortform](https://www.shortform.com/blog/good-habits-bad-habits-book/)
- [Habits-goal interface — ResearchGate](https://www.researchgate.net/publication/5936907_A_New_Look_at_Habits_and_the_Habit-Goal_Interface)
- [Habits — A Repeat Performance — Sage 2006](https://journals.sagepub.com/doi/abs/10.1111/j.1467-8721.2006.00435.x)
- [Wendy Wood site](https://wood.socialpsychology.org/)
- [Reinforcement Schedule in the Digital Age — ResearchGate 2025](https://www.researchgate.net/publication/395115230_Reinforcement_Schedule_in_the_Digital_Age)
- [Variable ratio examples — Adina ABA](https://www.adinaaba.com/post/variable-ratio-schedule-examples)
- [Variable ratio beyond Skinner — Bootcamp Medium](https://medium.com/design-bootcamp/variable-ratio-reinforcement-beyond-the-skinner-box-191d3e86d86f)
- [Schedules of reinforcement quick guide — Idaho TC Oct 2025](https://idahotc.com/Portals/0/ResourceFiles/1398/Schedules%20of%20Reinforcement%20Quick%20Guide.pdf)
- [Variable ratio examples — Hidden Gems ABA](https://www.hiddengemsaba.com/articles/variable-ratio-schedule-examples)
- [Variable ratio in social media — Unplugged Psych](https://www.unpluggedpsych.com/the-power-of-variable-ratio-reinforcement-in-social-media/)
- [Dopamine loops and player retention — JCOMA 2025](https://jcoma.com/index.php/JCM/article/download/352/192)
- [Variable rewards — Umbrex Tools for Thinking](https://umbrex.com/resources/tools-for-thinking/what-is-variable-rewards/)
- [Dark patterns under EU law — Tandfonline 2025](https://www.tandfonline.com/doi/full/10.1080/13600834.2025.2461958)
- [Mapping scholarship of dark-pattern regulation — ScienceDirect 2025](https://www.sciencedirect.com/science/article/pii/S2212473X25000975)
- [Loss aversion — The Decision Lab](https://thedecisionlab.com/biases/loss-aversion)
- [Prospect Theory — Yu-kai Chou](https://yukaichou.com/behavioral-analysis/prospect-theory-loss-aversion-kahneman-tversky/)
- [Streaks Nudges and Behavioral Science of Showing Up — Product Coalition](https://www.productcoalition.com/p/streaks-nudges-and-the-behavioral)
- [Why streaks are lying — DEV Community](https://dev.to/eastkap/why-streaks-are-lying-to-you-and-what-to-track-instead-4hci)
- [How streaks engineer habit loops — Bootcamp Medium](https://medium.com/design-bootcamp/streaks-and-daily-rewards-as-habit-forming-systems-dab7f5a34539)
- [Loss aversion — Wikipedia](https://en.wikipedia.org/wiki/Loss_aversion)
- [Designing a streak system — Smashing Magazine Feb 2026](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/)
- [Dark psychology behind apps — The Brink](https://www.thebrink.me/gamified-life-dark-psychology-app-addiction/)
- [Psychology of streaks — Cohorty](https://blog.cohorty.app/the-psychology-of-streaks-why-they-work-and-when-they-backfire/)
- [Loss aversion guide — Made Up Mind](https://madeupmind.org/blog/loss-aversion-psychology-guide)

### Cycle science / clinical

- [McNulty 2020 Sports Medicine](https://link.springer.com/article/10.1007/s40279-020-01319-3)
- [Davidsen 1995 PubMed](https://pubmed.ncbi.nlm.nih.gov/7825535/)
- [Dietary energy intake across menstrual cycle — PMC10251302](https://pmc.ncbi.nlm.nih.gov/articles/PMC10251302/)
- [Pfender 2025 — Sage Qualitative Health Research](https://journals.sagepub.com/doi/10.1177/10497323241297683)
- [Pfender 2025 — PubMed 39576887](https://pubmed.ncbi.nlm.nih.gov/39576887/)
- [Pfender 2025 — Sage PMC12308043](https://pmc.ncbi.nlm.nih.gov/articles/PMC12308043/)
- [Sync or Swim — Wiley 2025](https://onlinelibrary.wiley.com/doi/10.1111/psrh.70004)
- [Sync or Swim — PMC12204122](https://pmc.ncbi.nlm.nih.gov/articles/PMC12204122/)
- [Sync or Swim — PubMed 40091514](https://pubmed.ncbi.nlm.nih.gov/40091514/)
- [News-Medical — TikTok cycle syncing March 2025](https://www.news-medical.net/news/20250318/TikTok-influencers-promote-cycle-syncing-but-wheree28099s-the-evidence.aspx)
- [TIME — Cycle Syncing is All Vibes](https://time.com/6315797/cycle-syncing-womens-heath/)
- [Wu Tsai — metabolism stable across cycle](https://humanperformancealliance.org/news/study-challenges-cycle-syncing-finds-metabolism-consistent-during-menstrual-cycle/)
- [NICE NG23 overview](https://www.nice.org.uk/guidance/ng23)
- [NICE NG23 recommendations chapter](https://www.nice.org.uk/guidance/ng23/chapter/recommendations)
- [British Menopause Society — NICE NG23](https://thebms.org.uk/publications/nice-guideline/)
- [The Menopause Charity — 2024 NICE guideline](https://themenopausecharity.org/information-and-support/what-can-help/2024-nice-menopause-guideline/)
- [NICE Menopause guideline PDF — SOM](https://www.som.org.uk/sites/som.org.uk/files/NICE_guideline_menopause.pdf)
- [NICE Menopause — Guideline Central](https://www.guidelinecentral.com/guideline/4543751/)
- [NICE NG23 PDF resource](https://www.nice.org.uk/guidance/ng23/resources/menopause-identification-and-management-pdf-1837330217413)
- [NICE Menopause — PubMed 27558301](https://pubmed.ncbi.nlm.nih.gov/27558301/)
- [Diagnosis of menopause: NICE — Sage](https://journals.sagepub.com/doi/10.1177/0004563217706381)
- [Perimenopause — NICE + BMS guidelines](https://www.menopausespecialists.com/post/diagnosing-perimenopause-symptoms-diagnosis-blood-tests)
- [RCOG Green-top 24 — endometriosis](https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/endometriosis-investigation-and-management-green-top-guideline-no-24/)
- [RCOG Green-top 41 — chronic pelvic pain PDF](https://www.rcog.org.uk/media/muab2gj2/gtg_41.pdf)
- [Endometriozisdernegi — RCOG endometriosis guideline PDF](http://endometriozisdernegi.org/konu/dosyalar/files/kilavuzlar/RCOG-Endometriozis-Guideline.pdf)
- [Endometriosis and Adenomyosis Society — guidelines](https://www.endometriozisdernegi.org/en/guidelines/)
- [ACOG 2026 endometriosis clinical guidance — news release](https://www.acog.org/news/news-releases/2026/02/acog-publishes-new-endometriosis-clinical-guidance-aiming-shorten-time-diagnosis-improve-access-care)
- [ACOG 2026 endometriosis CPG full text](https://www.acog.org/clinical/clinical-guidance/clinical-practice-guideline/articles/2026/03/diagnosis-of-endometriosis)
- [Endocrinology Advisor — ACOG 2026 endometriosis](https://www.endocrinologyadvisor.com/features/acog-endometriosis-guidelines/)
- [ACOG 2026 — surgeon's review](https://internationalendo.com/acog-2026-endometriosis-guidelines-review-dr-vidali/)
- [ACOG 2026 diagnosis of endo — O&G journal](https://journals.lww.com/greenjournal/fulltext/2026/03000/diagnosis_of_endometriosis__acog_clinical_practice.25.aspx)
- [Hackensack Meridian — new endo guidelines](https://www.hackensackmeridianhealth.org/en/healthier-you/2026/04/16/new-guidelines-could-change-how-endometriosis-is-diagnosed-heres-what-you-need-to-know)
- [Spoon Theory for endometriosis — Dr Seckin](https://drseckin.com/the-spoon-theory-for-endometriosis-patients/)
- [Spoon Theory — Cleveland Clinic](https://health.clevelandclinic.org/spoon-theory-chronic-illness)

### UK / NHS / regulatory

- [Renewed Women's Health Strategy for England, April 2026 — PDF CP1558](https://assets.publishing.service.gov.uk/media/69df5d7261d2e8e9b9e42d2e/renewed-womens-health-strategy-for-england-web-accessible.pdf)
- [Renewed Strategy — NHE article](https://www.nationalhealthexecutive.com/articles/women-put-heart-care-renewed-womens-health-strategy)
- [Women's Health Strategy — GOV.UK landing](https://www.gov.uk/government/publications/womens-health-strategy-for-england/womens-health-strategy-for-england)
- [Renewed Strategy — HTN coverage April 2026](https://htn.co.uk/2026/04/20/data-digital-and-experiences-outlined-in-renewed-womens-health-strategy-for-england/)
- [Strategy renewed announcement — GOV.UK](https://www.gov.uk/government/news/government-announces-womens-health-strategy-to-be-renewed)
- [WHS as part of NHS Long Term Plan — WMS](https://www.wms.co.uk/womens-health-strategy)
- [Mid and South Essex ICS — WHS local implementation 2024-25](https://www.midandsouthessex.ics.nhs.uk/publications/local-implementation-of-the-national-womens-health-strategy-for-2024-2025/)
- [Future Femhealth — £1.5m FemTech fund](https://www.futurefemhealth.com/p/englands-womens-health-strategy-to)
- [King's Fund — NHS digitalisation & women's health](https://www.kingsfund.org.uk/insight-and-analysis/blogs/nhs-digitalisation-improve-womens-health)
- [VWV — renewed strategy commentary April 2026](https://www.vwv.co.uk/insights/articles/the-renewed-womens-health-strategy-for-england-a-catalyst-for-change/)
- [£1.5m FemTech fund — digitalhealth.net](https://www.digitalhealth.net/2026/04/1-5m-femtech-fund-launched-under-womens-health-strategy/)
- [ORCHA — DTAC apply](https://info.orchahealth.com/digital-technology-assessment-criteria-dtac)
- [ORCHA — DTAC overview](https://www.orchahealth.com/resources/assessment-frameworks/dtac)
- [ORCHA — new DTAC for health and social care](https://orchahealth.com/new-digital-technology-assessment-criteria-for-health-and-social-care-dtac/)
- [ORCHA — DTAC ready at HETT 10% off](https://orchahealth.com/get-dtac-ready-at-hett-and-save-10-percent/)
- [NHS CEP — Passing the DTAC with ORCHA](https://nhscep.com/2021/11/05/passing-the-dtac-with-orcha/)
- [NHS Transformation Directorate — DTAC guidance](https://transform.england.nhs.uk/key-tools-and-info/digital-technology-assessment-criteria-dtac/)
- [ORCHA — 100% DTAC compliance](https://info.orchahealth.com/digital-technology-assessment-criteria-dtac-nhs-compliance-support)
- [ORCHA — National Health Bodies](https://orchahealth.com/industries/national-health-bodies/)
- [ORCHA — Assessment Frameworks](https://orchahealth.com/our-products/assessment-frameworks/)
- [ORCHA — Digital Health Compliance Portal](https://orchahealth.com/launch-of-the-digital-health-compliance-portal/)

### Forum / Reddit / Mumsnet

- [Mumsnet — Crushing fatigue perimenopause](https://www.mumsnet.com/talk/menopause/4642140-crushing-fatigue-perimenopause)
- [Mumsnet — has anyone used a peri/menopause app](https://www.mumsnet.com/talk/_chat/4568193-has-anyone-used-a-perimenopause-app)
- [Mumsnet — Perimenopause what helped you](https://www.mumsnet.com/talk/general_health/5242677-perimenopause-what-helped-you)
- [Mumsnet — menopause discover](https://www.mumsnet.com/discover/menopause)
- [Perimenopause at 40 Reddit — Menopause Mastery synthesis](https://mlrb.net/perimenopause-40-reddit/)
- [Perimenopause + fatigue Reddit synthesis](https://mlrb.net/perimenopause-and-fatigue-reddit/)
- [Reddit Favorites — Clue period tracker](https://redditfavorites.com/android_apps/period-tracker-clue-period-ovulation-tracker)
- [Intimina — Women's support groups on Reddit](https://www.intimina.com/blog/best-womens-groups-on-reddit/)
- [Bearable — best period trackers 2025](https://bearable.app/the-best-period-tracker-apps-of-2025/)
- [All About Cookies — period tracker privacy 2026](https://allaboutcookies.org/safe-period-tracking-apps)
- [Flo reviews — justuseapp](https://justuseapp.com/en/app/1038369065/flo-period-tracker-ovulation/reviews)
- [Best period tracker 2026 — Go Go Gaia comparison](https://www.go-go-gaia.com/blog/how-to-choose-period-tracker-app.html)
- [Clue vs Flo vs Glow — Longevity Advice](https://www.longevityadvice.com/best-free-period-tracker/)
- [Period tracking privacy case study — Bhatta1](https://anupamabhatta.github.io/docs/period-tracking-privacy.pdf)
- [VICE — period tracking app data](https://www.vice.com/en/article/period-tracking-apps-data-privacy-safety/)
- [Ladyblogging — deleting data from period apps](https://what-the-phoenix.tumblr.com/post/688053416919007232/deleting-data-from-period-tracker-apps-flo-clue)
- [Is Flo safe? — Lemon8 Stardust](https://www.lemon8-app.com/ellahanson/7280521200995238406?region=us)
- [TechCrunch — Should you delete period app post-Roe](https://techcrunch.com/2022/05/05/roe-wade-privacy-period-tracking/)
- [Mozilla — Glow & Eve privacy](https://www.mozillafoundation.org/en/privacynotincluded/glow-eve-by-glow/)

### Non-app / market context

- [FemTech Trends May 2026 — Startup Edition Mean.ceo](https://blog.mean.ceo/femtech-trends-may-2026/)
- [Women's health enters new era — FemTechWorld 2026](https://www.femtechworld.co.uk/insight/womens-health-enters-a-new-era-the-trends-shaping-femtech-in-2026-ftai26/)
- [FemTech News May 2026 — Mean.ceo](https://blog.mean.ceo/femtech-news-may-2026/)
- [19 experts predict FemTech 2026 — Future Femhealth](https://www.futurefemhealth.com/p/19-experts-predict-whats-in-store)
- [Business Upturn — FemTech 2026 major trend](https://www.businessupturn.com/sectors/health/womens-health-is-finally-becoming-a-major-tech-trend-in-2026-and-menopause-care-is-leading-the-shift/)
- [InventUM — UM FemTech program](https://news.med.miami.edu/femtech-program-set-to-revolutionize-womens-health-through-technology/)
- [FemTech 2026 Trends — Business Outstanders](https://businessoutstanders.com/artificial-intelligence/ai-powered-femtech-trends)
- [World Health Expo — what's trending FemTech 2026](https://www.worldhealthexpo.com/insights/medical-technology/what-s-trending-in-femtech-in-2026-)
- [World Health Expo — tech improving women's health](https://www.worldhealthexpo.com/insights/healthcare-management/what-s-trending-in-femtech-in-2026-)
- [Digital Health Net — Women's Digital Health Challenge Dec 2025](https://www.digitalhealth.net/2025/12/mental-health-apps-win-global-womens-digital-health-challenge/)
- [Lancet Digital Health 2025 — transforming women's health](https://www.thelancet.com/journals/landig/article/PIIS2589-7500(25)00022-6/fulltext)
- [Lancet OG&W 2026 systematic review](https://www.thelancet.com/journals/lanogw/article/PIIS3050-5038(26)00006-3/abstract)
- [Lancet OG&W — FemTech future](https://thelancet.com/journals/lanogw/article/PIIS3050-5038(25)00125-6/fulltext)
- [Lancet OG&W home](https://www.thelancet.com/journals/lanogw/home)
- [Lancet OG&W about](https://www.thelancet.com/lanogw/about)
- [Lancet collections — OG&W](https://www.thelancet.com/collections/obstetrics-gynaecology-womens-health?parent=001603)
- [Lancet — digital health collections](https://www.thelancet.com/collections/digital-health?parent=011947)
- [Lancet OG&W on ScienceDirect](https://www.sciencedirect.com/journal/the-lancet-obstetrics-gynaecology-and-womens-health)
- [Elsevier — Lancet OG&W subscription](https://shop.elsevier.com/journals/the-lancet-obstetrics-gynaecology-and-women-s-health/3050-5038)
- [Lancet OG&W online first](https://www.thelancet.com/journals/lanogw/onlinefirst)
- [Digital health interventions for women — PMC12509992](https://pmc.ncbi.nlm.nih.gov/articles/PMC12509992/)
- [Bridging gender health gaps — PMC12245537](https://pmc.ncbi.nlm.nih.gov/articles/PMC12245537/)
- [JMIR — 25-year synthesis of digital health 2025](https://www.jmir.org/2025/1/e59027)
- [Women's Health App Market — media.market.us](https://media.market.us/global-womens-health-app-market-news/)
- [Capabilities approach — PMC12371188](https://pmc.ncbi.nlm.nih.gov/articles/PMC12371188/)
- [Digital Family Planning — Contraceptive Tech](https://contraceptivetechnology.org/digital-family-planning-the-future-is-now/)

---

_End of brief, 2026-05-14. Next deliverable: Cowork-the-builder produces `femwell_planner_v3_best_in_market_demo.html` from Part C; Mr Lead Manager scopes MP-A1 against Part D._
