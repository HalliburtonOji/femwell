// NutritionMasterPlanDoc — FoundersOS mirror of claude-state/NUTRITION_MASTER_PLAN.html.
// The per-feature, feature-depth master plan: each Nutrition feature reimagined ~4x
// better — its own layout (a), interaction logic (b), data/AI/computation logic (c),
// whole-life fit (d), build size + gated deps (e), priority (f). The doc Halli builds
// from. Cream/ink editorial via DocKit only. No emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Badge, Table, Pull, Foot } from "@/components/founders/DocKit";

const P0 = <Badge tone="red">P0</Badge>;
const P1 = <Badge tone="amber">P1</Badge>;
const P2 = <Badge tone="green">P2</Badge>;
const FUT = <Badge tone="plum">FUTURE</Badge>;
const S = <Badge tone="gold">S</Badge>;
const M = <Badge tone="gold">M</Badge>;
const L = <Badge tone="gold">L</Badge>;
const GATE = <Badge tone="plum">GATED</Badge>;

export default function NutritionMasterPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Nutrition · Feature-Depth Master Plan (for approval)</Eyebrow>
      <Title sub="2026-06-13 · PLAN only — nothing built; the per-feature 4× plan. Method: full Founders-Corner read + honest per-feature code inventory + cited per-feature research (best-in-class layout, interaction AND underlying logic) + women-aware / whole-life synthesis. Approve, then we build one feature at a time. No emoji.">
        Nutrition — Feature-Depth Master Plan
      </Title>

      <Card accent="#4A2A3A">
        <P><b>What changed since the last plan.</b> The first Nutrition plan was <i>page-level</i> — a roadmap of what to add. The Hub we shipped delivered the <b>shell</b> (Daily-Hub + Hero-Card-Slider) but it re-wrapped the <b>existing</b> feature components unchanged. This plan is the missing half: each individual feature reimagined to be ~<b>4× better</b> — its own layout, its own interaction logic, and its own data/AI/computation logic. The bar is the one the Founders Corner sets for the Journal: <i>"the feature no competitor can copy because it requires months of relationship, not months of data."</i></P>
      </Card>

      <Card accent="#4A2A3A">
        <P><b>Legend.</b> Priority: {P0} foundation · {P1} the 4× work · {P2} deepen · {FUT} future / gated. Build size: {S} {M} {L} (small / medium / large). {GATE} = needs key / API / legal / Halli.</P>
      </Card>

      {/* ============ 0 · PHILOSOPHY ============ */}
      <H2>0 · The philosophy — what the Founders Corner demands</H2>
      <Card accent="#4A2A3A">
        <P>Straight from the Founders Corner, these are non-negotiable for every feature below:</P>
        <Bullets items={[
          <span><b>"Health is one room, not the house."</b> RULE 1: span life, not just health — life-stage gently <i>tints</i>, never dominates. Nutrition's whole-life face is <b>food-as-joy &amp; culture</b> (Recipe Joy Swap, dining-out, cooking-for-friends, £ filters, a community cookbook). <b>Macros are opt-in</b>, never the spine.</span>,
          <span><b>No scoreboard — an ethical line, not a taste.</b> No daily pass/fail, no calorie "budget remaining" gate, no streaks, no good/bad food colouring. Backed by hard evidence (below) and the thing that separates us from MyFitnessPal/ZOE.</span>,
          <span><b>Jess is a companion, never clinical.</b> Mirror the Journal's three-role model: <b>Prompter</b> (gentle, stage-aware nudges), <b>Witness</b> (a weekly observation, not a verdict), <b>Analyst</b> (patterns, always labelled, always "not medical advice").</span>,
          <span><b>RULE 2: wire ALL surfaces.</b> Every feature names a tie to Today, Journal, Community, Lifestyle, Planner, Jess, Doctor Export. Shared entities are sacred (hydration/meals logged on Today AND Nutrition hit the SAME tables).</span>,
          <span><b>11 life stages</b> (teen → post-menopause) reshape every screen. <b>UK market</b> (NHS/BDA/BNF figures, £, UK GDPR). Cream/plum, Ephesis + Cormorant, Lucide/SVG, zero emoji.</span>,
        ]} />
      </Card>

      {/* ============ 1 · SPINE ============ */}
      <H2>1 · The spine — one connected model (why depth needs this first)</H2>
      <Card>
        <P>Today the features are <b>islands</b>: two planners that don't talk, a shopping list that re-derives by naive text-split, <code>MealItems</code> written but never read, recipes that vanish, insights from 4 hardcoded if-rules. "4× per feature" only works if they share one spine:</P>
        <Bullets items={[
          <span><b>One food/item model.</b> A logged meal, a recipe ingredient, a plan slot and a shopping line are all the <i>same</i> normalised food row (name → canonical food → macros + micros + portion). This is what lets logging, recipes, plan and shop finally talk.</span>,
          <span><b>One plan object.</b> Manual edits and AI generation are both edits to the same <code>plan</code>; the shopping list and pantry derive from it; locked slots survive regeneration.</span>,
          <span><b>One intelligence loop.</b> Logging → targets → progress → insights → Jess, all reading the same history. Fix the orphans (read <code>MealItems</code>; persist recipes; surface subscores).</span>,
        ]} />
        <P>This spine is the real reason the current page feels thin: the data is captured then dropped. Building it is {P0} and unlocks every feature.</P>
      </Card>

      {/* ============ 2 · LOGGING ============ */}
      <H2>2 · Logging — the heart of the page</H2>
      <P><b>Frictionless Logging</b> · {P0} {P1} {L}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> a 2-row textarea + meal-type + portion buttons; every estimate round-trips the <code>analyzeMeal</code> LLM (slow, ~±20% error); a 28-item hardcoded <code>FOOD_DB</code> behind a card-deck modal; <b>no photo, voice, or barcode UI</b>; recents/favourites don't exist; portion is regex-parsed from a string.</P>
      </Card>
      <H3>a · New layout</H3>
      <P><b>Camera-first, search-second.</b> The primary affordance is a big "Log" that opens a calm sheet with one row of methods — <b>Snap · Say · Scan · Search · Recents</b> — recents/favourites as one-tap chips right there (the single biggest speed driver in the evidence). The result of any method renders as an <b>editable line-item list</b> (a confirmable draft), never a locked verdict. A "no-numbers" journal mode is available for users who never want to see calories.</P>
      <H3>b · New interaction logic</H3>
      <P>The four fast paths, each one or two taps:</P>
      <Bullets items={[
        <span><b>Snap</b> — photo → AI proposes items + portions → user adjusts/removes/swaps → confirm. The correction <i>is</i> the training signal (SnapCalorie pattern).</span>,
        <span><b>Say / natural language</b> — "two eggs and toast with butter" parsed into editable items (~6s/meal — the lowest-friction method).</span>,
        <span><b>Scan</b> — barcode → exact DB match.</span>,
        <span><b>Recents / Favourites / "Repeat yesterday"</b> — one tap to re-log; "copy yesterday's lunch."</span>,
      ]} />
      <P>Every result is "good-enough, one tap from edit." Lose It! measured 3.5× faster logging and 2× more foods logged from exactly this.</P>
      <H3>c · New data / AI / computation logic</H3>
      <P><b>DB-first, LLM-as-fallback</b> (see §3): a barcode or search hit returns deterministic macros instantly; the LLM is only the <i>parser</i> for free-text/voice/photo and maps its output back onto DB rows where it can. Photo uses a vision model with volumetric portion estimation, always returned as an estimate. <b>Stop the data loss:</b> persist the item breakdown and actually <i>read</i> <code>MealItems</code>; keep meal_score subscores instead of crunching them to one number. Learn the user's top ~30 foods to rank recents.</P>
      <H3>d · Whole-life + FemWell-fit</H3>
      <P>After a log, surface a <b>nutrient relevant to her stage</b>, not a calorie tally — iron after a meal during menstruation, folate in pre-TTC/TTC, calcium+protein in peri/menopause. Optional "<b>how did it feel?</b>" (satisfied / rushed / with people) — qualitative, never scored. Calories opt-in; no good/bad colour. This is the harm-evidence response, made warm.</P>
      <H3>e · Build size + gated deps</H3>
      <P>{L} overall, but shippable in slices. {GATE} Vision model cost (photo); {GATE} food-DB API (scan/search); voice via Web Speech API (no third-party — matches Sprint 7). Recents/favourites + natural-language reuse what exists = {M} and first.</P>
      <H3>f · Priority</H3>
      <P>{P0} recents/favourites + the editable-draft pattern + read MealItems. {P1} photo + voice + barcode.</P>
      <P><small>Evidence: Lose It! Snap It (TechCrunch); SnapCalorie + Nutrition5k (CVPR 2021), independent ±19.8% MAPE; Passio voice ~6s/meal; WW Food Scanner editable-list. Harm: Levinson et al. (Int. J. Eating Disorders) ~75% of an ED sample used MFP, 73% felt it contributed; Flinders review of 38 studies; balanced by a low-risk-user RCT (PubMed 34427188) — so: opt-in numbers, no scoreboard, no shame.</small></P>

      {/* ============ 3 · FOOD DB ============ */}
      <H2>3 · The food database — the deterministic floor</H2>
      <P><b>Real Food Database</b> · {P0} {L} {GATE} API + attribution</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> a <b>28-item hardcoded array</b>. Everything else round-trips the LLM. No barcode, no UK foods, no micronutrients, no personal history.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>Invisible by design — it powers Search/Scan/Recents (§2). A clean result row: food name, brand if any, portion picker (sensible UK units, not regex), macro + key-micro chips, "add."</P>
      <H3>b/c · Logic &amp; architecture (the important part)</H3>
      <P><b>Three layers:</b></P>
      <Bullets items={[
        <span><b>1. UK CoFID lab floor</b> (McCance &amp; Widdowson, ~3,300 UK generic foods, Crown-open, free) — the trusted generic-food base, and it already carries <b>iron, folate, calcium</b> per food, so the women's-nutrition layer (§11) comes for free.</span>,
        <span><b>2. Barcode → Open Food Facts</b> (2.5M+ products, UK-strong, free, barcode-native) for packaged foods.</span>,
        <span><b>3. LLM parser only on a miss</b>, mapped back onto DB rows; free-form text only as last resort, always editable.</span>,
      ]} />
      <P><b>Cache hot lookups</b> from Open Food Facts' nightly bulk dumps so we don't hammer the API. This is the architecture that gives Cronometer its accuracy edge (lab-sourced) over MyFitnessPal (crowdsourced, ~37% of entries &gt;20% energy error).</P>
      <H3>d · Whole-life + fit</H3>
      <P>UK-first foods (CoFID) make it feel local and trustworthy; micronutrient fields enable stage-aware surfacing without a paid add-on.</P>
      <H3>e · Gated</H3>
      <P>{GATE} Open Food Facts = ODbL attribution + share-alike; images CC-BY-SA — must credit. CoFID is Crown-open (safest, no fee). Caching/rate-limit eng. {L}.</P>
      <H3>f · Priority</H3>
      <P>{P0} — the floor under logging, recipes, plan and insights. Build CoFID + a barcode source first; LLM stays as the parser.</P>
      <P><small>Open Food Facts data/licensing; gov.uk CoFID; FatSecret/Nutritionix (paid barcode alts); Macronutrient-calculator Cronometer 30/30 vs MFP 11/30 (indicative).</small></P>

      {/* ============ 4 · TARGETS ============ */}
      <H2>4 · Targets &amp; the gentle engine</H2>
      <P><b>Targets / Macro Engine</b> · {P0} {S}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> calorie target is a <b>hardcoded 2000 default</b> (with a dual-key bug <code>calories_target</code> vs <code>calorie_target</code>); macro targets are flat constants; "goal mode" is a label that changes nothing; phase-awareness is cosmetic tips.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>Not a goal screen. A <b>quiet, derived default</b> that lives behind the day-glance; editable, framed as "a gentle guide, not a cap."</P>
      <H3>b/c · Logic</H3>
      <P>Derive a real estimate from body metrics + activity + life stage (a transparent TDEE-style formula, no external API), expressed as a <b>range</b> (e.g. 1800–2200) not a single number. Stage tilts it: +protein and calcium/vit-D weighting in peri/menopause; folate emphasis pre-conception; gentle iron focus during menstruation. <b>Fix the dual-key + the legacy-shape calorie bug</b> so history reads correctly.</P>
      <H3>d · Fit</H3>
      <P>Targets are <b>opt-in and de-emphasised</b> — the no-scoreboard line. They tune nudges underneath; they never gate the day.</P>
      <H3>e · Gated</H3>
      <P>Formula only — none. {GATE} Light medical-claims pass on stage copy. {S}.</P>
      <H3>f · Priority</H3>
      <P>{P0} — without real targets, every macro/progress number is arbitrary.</P>

      {/* ============ 5 · HYDRATION ============ */}
      <H2>5 · Hydration &amp; drinks</H2>
      <P><b>Hydration &amp; Drinks</b> · {P1} {P2} {S}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> works, but it's a separate chore — progress bar + glass dots + +250/500/750 buttons; drink calories are blanket hardcoded constants; flat 2000ml target.</P>
      </Card>
      <H3>a · Layout</H3>
      <P><b>Glance, not chore.</b> One fill-level ring folded into the daily snapshot (WaterMinder/Waterllama pattern), one-tap preset cups, a warm recap rather than a deficit tally.</P>
      <H3>b/c · Logic</H3>
      <P>Personalised goal from weight + activity + <b>life stage</b> (higher in pregnancy T1–T3 and breastfeeding/postpartum, per BNF/NHS), not flat 2L. <b>Count all fluids</b> (NHS Eatwell: 6–8 glasses of fluids incl. teas/milk) — don't penalise non-water; gentle note on caffeine/alcohol rather than fake "dehydration maths." Schedule-aware reminders.</P>
      <H3>d · Fit</H3>
      <P>Framed as care/energy ("a glass for you"), tied to the joy framing — never a quota to fail.</P>
      <H3>e/f</H3>
      <P>None gated. {S}. {P1} fold-into-snapshot + stage goal; {P2} reminders/recap.</P>
      <P><small>WaterMinder; Waterllama; Hydro Coach (weight/activity/weather goal); BNF "Hydration and pregnancy"; NHS Eatwell.</small></P>

      {/* ============ 6 · PLANNER ============ */}
      <H2>6 · The unified planner (manual + AI = one model)</H2>
      <P><b>Meal Planning</b> · {P0} {P1} {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> <b>two disconnected planners</b> — "My Plan" (manual, 4 hardcoded suggestion strings per slot, no macros, dumb text-split shopping) and "AI Plan" (generates, but <b>save overwrites the whole week</b> and clobbers manual work). No locking, no pantry awareness.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>One <b>week grid</b> (days × slots), each cell a tappable recipe/meal card, a persistent preference rail, a single "regenerate." "Doable in real life," not a maximal grid (Mealime).</P>
      <H3>b/c · Logic</H3>
      <P><b>Manual and AI are edits to the SAME plan object.</b> AI proposes; the user drags/swaps/<b>locks</b> cells; locked cells survive regeneration. Per-cell swap and per-day regenerate (Eat This Much / Mealime granularity). Allergies = hard constraints; budget + preferences + stage = soft weights. <b>Pantry-aware</b> generation (uses what you already own). A live macro/nutrient preview so you see the week before committing.</P>
      <H3>d · Fit</H3>
      <P>Stage-aware as a <b>soft nudge</b> (gently weight iron-rich meals when menstruating; calcium/protein peri/menopause) — never a calorie engine. Lead with "an enjoyable, doable week," £-filter available.</P>
      <H3>e/f</H3>
      <P>None gated (reuses the generate fn). {M}. {P0} unify into one model (kills the duplicate mental model); {P1} lock/swap/pantry-aware + macro preview.</P>
      <P><small>Mealime (doable weeks, per-meal swap); Eat This Much (target-driven, lock/regenerate); PlateJoy (preference + pantry-aware; service discontinued Jul 2025 — historical).</small></P>

      {/* ============ 7 · RECIPES ============ */}
      <H2>7 · Recipes &amp; cook-from-what-you-have</H2>
      <P><b>Recipes</b> · {P1} {P2} {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> two recipe generators (one a stale orphan, <code>AIRecipeGenerator</code>); <b>recipes aren't persisted</b> (lost unless copy-pasted); no scaling, no photo, no ratings, no history, ingredients not cross-referenced with plan/shop.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>A single scrollable recipe object: hero block → time/servings/difficulty chips → ingredient list (toggleable against your pantry) → <b>per-step "guided mode" cards</b> with timers (SideChef pattern). One saved library, ratings, collections.</P>
      <H3>b/c · Logic</H3>
      <P><b>Photo-to-recipe:</b> snap the fridge → AI returns a recipe + a shopping list for only the <b>missing</b> items. <b>Non-destructive single-ingredient swaps</b> ("swap this, keep the flavour/nutrient profile"). <b>Persist recipes as a real entity</b> (ingredients + steps + nutrition), <b>scale to servings</b>, rate, and feed ratings into future suggestions. Ingredients are the shared food model, so they cross-reference plan + shop automatically.</P>
      <H3>d · Fit — the differentiator</H3>
      <P>This is the whole-life face: <b>cooking confidence as the outcome, not weight</b>. "You tried something new" moments; cultural/world-cuisine celebration; cook-for-friends; a community cookbook hook. The cooking-RCT evidence supports <i>joy &amp; confidence</i> claims (do NOT claim "cooking improves your diet" — it didn't move intake in the trial).</P>
      <H3>e/f</H3>
      <P>{GATE} Vision model for photo-to-recipe. Persistence/scaling = {M}. {P1} persist + scale + save/rate + swaps; {P2} photo-to-recipe + guided mode.</P>
      <P><small>SideChef AI (guided steps, RecipeGen, MySubstitution); Samsung Food (import/normalise/collections, Vision AI); cooking-confidence RCT Begley et al. (PMC8970183) — confidence/wellbeing up, diet unchanged.</small></P>

      {/* ============ 8 · SHOPPING ============ */}
      <H2>8 · Shopping &amp; pantry</H2>
      <P><b>Shopping &amp; Pantry</b> · {P1} {P2} {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> list groups by category but is built by a <b>naive text-split + an LLM categorise call</b> ("Chicken + sweet potato &amp; greens" → 3 items); sync is destructive; quantities are rough guesses; no pantry; "sorted by aisle" is copy, not built.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>Auto-generated list <b>grouped by aisle</b> so the store path is linear; manual vs plan-sourced items distinguished; a pantry view.</P>
      <H3>b/c · Logic</H3>
      <P>Built from the <b>shared plan/food model</b> (no text-splitting): ingredient normalise → <b>unit-aware merge</b> (Monday's + Tuesday's onions → "2 onions") → <b>set-subtract the pantry</b> (what you already own, added by type or camera-scan) → aisle classify. Re-syncs non-destructively when the plan changes.</P>
      <H3>d · Fit</H3>
      <P><b>Budget mode</b>: cheaper-swap suggestions framed as <i>money-saving</i> (not calorie-cutting), tied to UK budget-cooking guidance — inclusive, whole-life, opt-in.</P>
      <H3>e/f</H3>
      <P>None gated (heuristics). {M}. {P1} auto-build + merge + aisle from the shared model; {P2} pantry set-subtract + budget swaps.</P>
      <P><small>Fond (auto-build, merge, pantry set-subtract); Samsung Food pantry/Food-List; Meal2Shop (aisle order, price compare).</small></P>

      {/* ============ 9 · PROGRESS ============ */}
      <H2>9 · Progress — patterns, not scores</H2>
      <P><b>Progress / Metrics</b> · {P1} {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> body metrics are <b>stored but never visualised</b>; "progress" is a 7-day calorie line + hydration bar; the legacy-shape bug makes recent meals read 0; phase colour is cosmetic; goal mode does nothing.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>A single <b>gentle composite</b> ("how nourished has the week felt") in the spirit of Lifesum's Life Score — positive reinforcement, not a calorie verdict — plus <b>correlation cards</b>: food↔mood, food↔energy.</P>
      <H3>b/c · Logic</H3>
      <P>Compute <b>correlations over time</b> from the shared history + <code>DailyCheckins</code> (energy/mood/digestion) — "your brightest-energy days line up with iron-rich meals." Show trends, not streaks. Cycle as an <b>observed-pattern lens</b> for <i>her own</i> data (legitimate), never a prescription. Visualise the body metrics that exist; let weight be optional and never the headline.</P>
      <H3>d · Fit — what we NEVER show</H3>
      <P>No calorie pass/fail, no weight-as-headline, no streaks that punish a missed day, no "you failed." Progress-not-perfection. This is the intuitive-eating evidence in UI form.</P>
      <H3>e/f</H3>
      <P>Depends on the {P0} bug fix + the spine. {M}. {P1}.</P>
      <P><small>Lifesum Life Score (Scientific Reports 2025 — self-monitoring → mindfulness); Intuitive Eating evidence (Tribole &amp; Resch; PubMed 28619668).</small></P>

      {/* ============ 10 · INSIGHTS ============ */}
      <H2>10 · Insights &amp; the weekly story</H2>
      <P><b>Insights (Jess's Analyst voice)</b> · {P1} {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> "Today's Signals" is <b>4 hardcoded if-rules</b>; per-meal insights are saved but there's no weekly rollup, no pattern detection, no narrative.</P>
      </Card>
      <H3>a · Layout</H3>
      <P>A <b>weekly story</b> in Jess's warm voice — "this week you cooked something new; your energy dipped on the low-iron days" — not a report card. 1–2 surfaced patterns, never a wall of metrics.</P>
      <H3>b/c · Logic</H3>
      <P>Mirror the Journal's <b>tiered insight</b> model: Tier 1 from day one (gentle rhythm), richer tiers as history accrues. Surface real <b>mood-food / energy-food</b> patterns (Noom's psychology-first, motivational-interviewing tone — minus the scoreboard). Layer stage-aware micronutrient nudges (§11) as gentle prompts.</P>
      <H3>d · Fit</H3>
      <P>Jess's Analyst role: always labelled, always "not medical advice," never a verdict. Flows into a Journal prompt and the Doctor Export when consented.</P>
      <H3>e/f</H3>
      <P>{GATE} Light medical-claims pass. Depends on the spine + bug fix. {M}. {P1}.</P>
      <P><small>Noom 4-Cs / behaviour-change science (narrative, MI voice); FemWell Journal master-plan tiered-insight convention.</small></P>

      {/* ============ 11 · WOMEN ============ */}
      <H2>11 · Women's nutrition intelligence (cross-cutting)</H2>
      <P><b>The stage-aware micronutrient layer</b> · {P1} {GATE} medical-claims {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> cycle-awareness lives in a few hardcoded tips; no real per-stage nutrient intelligence; nothing uses the food DB's micros (because there is no real DB yet).</P>
      </Card>
      <H3>The intelligence (grounded in UK evidence — gentle nudges, NEVER scoreboards)</H3>
      <Table rows={[
        ["Nutrient", "UK figure", "Stage relevance"],
        ["Iron", "RNI 14.8 mg/day (19–50) vs 8.7 at 50+", "Menstruating / teen — the single most solid cycle angle"],
        ["Folate / folic acid", "200µg base; 400µg pre-conception→wk12", "pre-TTC, TTC, pregnant-T1"],
        ["Calcium (+vit D)", "700 mg (1000–1200 if Rx); vit D 10µg", "peri/menopause — bone as oestrogen falls"],
        ["Fibre", "30 g vs ~17g actual", "all stages"],
        ["Protein", "~1.2 g/kg (qualitative)", "peri/menopause + postpartum — muscle/bone"],
      ]} />
      <P>Surfaced as warm "foods rich in iron this week" prompts after logging and in the weekly story; the food DB's CoFID micros make it computable, not guessed.</P>
      <Card accent="#BC2E27">
        <P><b>EVIDENCE GUARDRAILS — honesty as a feature</b></P>
        <Bullets items={[
          <span><b>Strong / ship it:</b> iron (menstruation), folate (pre-conception), calcium+vit-D+protein (peri/menopause) — established BDA/NHS guidance, as gentle nudges.</span>,
          <span><b>Weak — do NOT prescribe:</b> <b>cycle-syncing macros</b>. A systematic review found "lack of consistency to confidently advise" and no macro↔symptom correlation; an expert panel "unanimously agreed the evidence isn't there." Frame as self-awareness only.</span>,
          <span><b>Weak — do NOT overclaim:</b> <b>microbiome / ZOE-style personalisation</b>. Which? was "not convinced it offered truly personalised advice"; ZOE dropped its CGM in 2025. Generic-but-true nudges beat fake precision — and that honesty is a UK-market trust differentiator.</span>,
        ]} />
      </Card>
      <H3>Priority</H3>
      <P>{P1}, riding on the food DB (§3) + insights (§10). {GATE} Medical-claims copy review before ship.</P>
      <P><small>BDA Food Fact Sheets (menopause, fibre, calcium); BNF women's nutrition; NHS DRVs; Cambridge Core systematic review (cycle-syncing); Which? ZOE review. <b>Verify exact RNIs against SACN/BNF before shipping copy.</b></small></P>

      {/* ============ 12 · JOY ============ */}
      <H2>12 · The whole-life &amp; joy layer (the thing no competitor has)</H2>
      <P><b>Food as joy &amp; culture</b> · {P2} {FUT} {M}</P>
      <Card accent="#BC2E27">
        <P><b>Today:</b> essentially absent — the module is macro-first with a wellness veneer; joy/culture/social isn't first-class UI. Yet the Founders Corner names this as nutrition's whole-life face.</P>
      </Card>
      <H3>The layer (Founders-Corner aligned)</H3>
      <Bullets items={[
        <span><b>"How did it feel" log</b> — satisfied / rushed / with people — a non-macro reflection that can flow into a Journal prompt.</span>,
        <span><b>Recipe Joy Swap</b>, dining-out mode, <b>cook-for-friends</b>, cultural/world-cuisine celebration.</span>,
        <span><b>Budget (£) filters</b> and batch-cook — inclusive, food-security-aware.</span>,
        <span><b>Community cookbook</b> — share a recipe or a small win anonymously; the cook-together future hook (+232% joy when cooking together — Gallup).</span>,
      ]} />
      <P>This is the differentiator: Flo/Clue have women + community but no nutrition; MFP/ZOE have tracking + diet-culture baggage. <b>No one owns food-as-joy for women across 11 life stages.</b></P>
      <H3>Priority</H3>
      <P>{P2} for the solo joy bits (how-it-felt, joy swap, £ filters); {FUT} for social cook-together (gated on Community maturity + moderation + legal).</P>
      <P><small>WholeLifeDoc ("food-as-joy &amp; culture… macros opt-in"); Gallup cooking-joy; cooking-confidence↔wellbeing (Frontiers).</small></P>

      {/* ============ 13 · JESS ============ */}
      <H2>13 · Jess as nutrition companion (cross-cutting)</H2>
      <Card accent="#4A2A3A">
        <P>Not a separate chatbot — the same Jess, three roles (mirroring the Journal):</P>
        <Bullets items={[
          <span><b>Prompter</b> — gentle, opt-in, stage-aware nudges ("a little iron at dinner would round today out"); never nags, never scores.</span>,
          <span><b>Witness</b> — a warm weekly observation from how you ate, not interpreted into a verdict.</span>,
          <span><b>Analyst</b> — the weekly story + pattern surfacing (§10), always labelled, always "not medical advice," never clinical (MHRA risk if she sounds diagnostic).</span>,
        ]} />
        <P>"Ask Jess about food" / "what could I make with this" reuses the <code>fw_open_assistant</code> connectivity event — voice continuity, not a new surface. Any new nutrition entity MUST be exposed to Jess's context (critical data rule).</P>
      </Card>

      {/* ============ 14 · CONNECTIVITY ============ */}
      <H2>14 · Connectivity — wire every surface (RULE 2)</H2>
      <Table rows={[
        ["Surface", "Nutrition's tie-in"],
        ["Today", <span>The daily nutrition <b>glance</b> (not a score) sits beside the check-in so food + energy/mood read together; shared HydrationLog/MealLog.</span>],
        ["Journal", <span>"How it felt" + mood-food flows into a Journal prompt (<code>/Journal?compose=1&amp;seed=…</code>); eating reflection is whole-life, not clinical.</span>],
        ["Community", "A food room: share a recipe / small win anonymously, trade budget tips, the cook-together hook (the community cookbook)."],
        ["Lifestyle (daily read)", "Seasonal/cultural recipes + food articles surfaced in the daily read."],
        ["Planner", "The unified plan drops into the week; the shopping list builds from it."],
        ["Doctor Export", "Consented nutrition patterns (e.g. iron trend) can feed the GP report — isolated, never auto-shared to peers."],
        ["Jess", "Reads the whole nutrition history for prompts/insights; new entities exposed to her context."],
      ]} />
      <Card>
        <P>The Founders Corner's <b>"Reflect · Discuss · Ask Jess"</b> keystone bar should sit on recipes, insights and the weekly story — one component unlocks most of these ties.</P>
      </Card>

      {/* ============ 15 · BUILD SEQUENCE ============ */}
      <H2>15 · Build sequence (one feature at a time)</H2>
      <Table rows={[
        ["Phase", "What ships", "Why this order"],
        [<span><b>P0 — Foundation</b></span>, "The shared spine (one food/item + one plan model; read MealItems; persist recipes) · real food DB (CoFID + barcode) · derived targets + fix the calorie bugs · recents/favourites + editable-draft logging", "Every \"4×\" feature depends on the spine + a real DB + real targets. Nothing deep is possible until the data stops being dropped."],
        [<span><b>P1 — The 4× work</b></span>, "Photo + voice + barcode logging · unified planner (lock/swap/pantry-aware) · recipes (persist/scale/rate/swap) · smart shopping (merge/aisle) · progress (patterns) · weekly-story insights · women's micronutrient layer · hydration fold-in", "The features themselves, each reimagined on top of the foundation."],
        [<span><b>P2 — Deepen</b></span>, "Pantry set-subtract · budget mode · guided-cook + photo-to-recipe · the joy layer (how-it-felt, joy swap, cookbook) · reminders/recap", "The whole-life differentiators once the core is excellent."],
        [<span><b>FUTURE — gated</b></span>, "Barcode-at-scale · social cook-together · (explicitly NOT cycle-syncing macros / microbiome precision — flagged, optional, honesty-gated)", "Needs Community maturity, moderation, legal, or runs ahead of the evidence."],
      ]} />

      {/* ============ 16 · GATED DEPS ============ */}
      <H2>16 · Gated dependencies &amp; compliance (the Halli calls)</H2>
      <Card accent="#4A2A3A">
        <Bullets items={[
          <span><b>Food DB</b> — Open Food Facts (free, ODbL attribution + share-alike, CC-BY-SA images) + UK CoFID (Crown-open). Caching infra. <b>Decision:</b> approve the DB architecture + attribution.</span>,
          <span><b>Vision model</b> (photo logging + photo-to-recipe) — cost per call. <b>Decision:</b> approve a vision model + budget.</span>,
          <span><b>Voice</b> — Web Speech API (no third-party, matches Sprint 7) — no gate.</span>,
          <span><b>Medical-claims pass</b> — any micronutrient / stage / cycle copy gets a light legal/claims review before ship (MHRA: Jess must never read clinical).</span>,
          <span><b>Honesty guardrails</b> — cycle-syncing macros + microbiome personalisation stay flagged/optional, never the spine (the evidence doesn't support selling them as truth; saying so is a trust differentiator).</span>,
        ]} />
      </Card>

      <Pull><b>Headline.</b> Build the spine first so the data stops being dropped; put a real UK food database under everything; make logging frictionless and kind (snap/say/scan/recents, editable drafts, no scoreboard); then reimagine each feature on top — a unified planner, a real recipe library with joy at its centre, smart shopping, pattern-not-score progress, a Jess weekly story, and a gentle stage-aware micronutrient layer grounded in BDA/NHS. Lead with the thing no competitor has: <b>food as joy &amp; culture for women across 11 life stages</b>, macros opt-in. That is the nutrition feature "no competitor can copy."</Pull>

      <Foot>FemWell — Nutrition Feature-Depth Master Plan · 2026-06-13 · PLAN only, nothing built. Sources: full Founders-Corner read (FoundersOS.jsx + founders/*Doc) · per-feature code inventory · cited research (NHS/BDA/BNF/CoFID, Open Food Facts, SnapCalorie/Nutrition5k, Lose It!, Lifesum, Noom, SideChef/Samsung Food, Mealime/Eat This Much, Cambridge systematic review, Which? ZOE, ED-harm literature). In-app mirror: FoundersOS → "Nutrition Master Plan" tab. Awaiting Halli's approval to scope P0.</Foot>
    </DocShell>
  );
}
