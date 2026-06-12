// NutritionPlanDoc — FoundersOS mirror of claude-state/NUTRITION_PLAN.html.
// A whole-life, non-scoreboard, women-aware nutrition build PLAN (nothing built).
// Inventory of the 7 Nutrition tabs + cited research + themed feature superset +
// prioritized roadmap + connectivity + headline. Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Badge, Table, Foot } from "@/components/founders/DocKit";

const P0 = <Badge tone="red">P0</Badge>;
const P1 = <Badge tone="amber">P1</Badge>;
const P2 = <Badge tone="green">P2</Badge>;
const FUT = <Badge tone="plum">FUTURE</Badge>;
const SOLID = <Badge tone="green">SOLID</Badge>;
const WEAK = <Badge tone="amber">WEAK</Badge>;
const BUG = <Badge tone="red">BUG</Badge>;

export default function NutritionPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Nutrition · Build Plan (for approval)</Eyebrow>
      <Title sub="2026-06-12 · PLAN only — nothing built. Inventory of the 7 Nutrition tabs + cited research (best-in-class apps, logging-friction harm evidence, women-specific UK nutrition) + a themed feature superset and a prioritized roadmap. No emoji.">
        Nutrition — the whole-life, non-scoreboard, women-aware layer
      </Title>

      <Card accent="#4A2A3A">
        <P><b>Headline:</b> the biggest opportunity is to be the whole-life, non-scoreboard, women-aware nutrition layer that the calorie apps and the period apps both miss. Lead with frictionless logging + a real food database + intuitive/whole-life framing + evidence-based (not faddy) women's nutrition. Treat cycle-syncing macro prescriptions and microbiome "personalization" as flagged/optional, never the spine.</P>
      </Card>

      <H2>1. Where Nutrition is today (honest inventory)</H2>
      <P>Seven tabs: Today · My Plan · Recipes · AI Plan · Shop · Progress · Insights. There is real, working machinery here — more than most v1 modules — but it leans <b>clinical / macro-heavy with a wellness veneer</b>. Cycle-awareness lives in tips, not adaptive targets, and the joy / culture / intuitive-eating dimension isn't first-class UI.</P>

      <P><b>SOLID</b> {SOLID}</P>
      <Table rows={[
        ["Capability", "Detail"],
        ["Free-text meal log + AI macros", "analyzeMeal on gpt-4o-mini: cycle-phase-aware, meal_score, smart-swaps. On-brand conversational flow."],
        ["Hydration + drinks loggers", "Water + other drinks tracked."],
        ["AI meal-plan + recipe generators", "Generate plan and recipes on demand."],
        ["Shopping list", "Full CRUD + email-the-list."],
        ["Body metrics + charts", "Captured and charted over time."],
        ["AI weekly summary", "Generated read of how eating went."],
      ]} />

      <P><b>HALF-BUILT / WEAK</b> {WEAK}</P>
      <Table rows={[
        ["Gap", "Why it matters"],
        ["No real food DB", "Only a 28-item hardcoded FOOD_DB. No food API — everything else round-trips the LLM."],
        ["No barcode / photo / voice", "Schema hints exist but no UI — exactly the friction-reducers the evidence backs."],
        ["Macro accuracy = LLM round-trip", "Slow, variably accurate, no deterministic floor."],
        ["Targets are guessed defaults", "No TDEE / no derivation from body metrics + stage — the number is arbitrary."],
        ["Two disconnected planners", "Manual My Plan vs AI Plan don't talk — duplicated mental model."],
        ["Recipes don't persist", "Ratings + full recipes not saved."],
        ["MealItems written, never read", "Data captured and orphaned."],
        ["Orphan AIRecipeGenerator.jsx", "Stale schema, dead component."],
      ]} />

      <Card accent="#C4849A">
        <P><b>A real bug (P0).</b> {BUG} NutritionInsightsTab's 7-day calorie trend reads the legacy field <code>ai_analysis.nutritional_summary</code>. New-shape meals lack it, so they <b>read as 0</b> — the trend silently undercounts every recent meal. Foundation fix, not a feature.</P>
      </Card>

      <H2>2. Research synthesis (cited)</H2>
      <P><b>Best-in-class apps — what they nail / miss.</b></P>
      <Table rows={[
        ["App", "Signal"],
        ["MyFitnessPal", "14M crowdsourced DB but ~37% of entries >20% energy error. Real speed driver is recents/favourites, not DB size. Barcode now paywalled."],
        ["Cronometer", "Lab-verified USDA/NCCDB, 82 micronutrients, ~3-5% accuracy. The accuracy benchmark."],
        ["Noom", "The product is human coaching + psychology lessons, not the tracker."],
        ["Yazio / Lifesum", "Structured plans; Lifesum 'Life Score' reframes away from raw calories."],
        ["ZOE", "Gut-biome 0-100 food scores; scrapped CGM 2025; £268 bundle; Which?: personalization claims run ahead of the evidence."],
        ["WeightWatchers", "Photo Food Scanner; 'Connect' judgment-free community."],
        ["Lose It!", "Snap It photo + voice logging."],
        ["Fastic", "AI scanner + generous free — but streak-for-reward gamification (anti-pattern for us)."],
        ["Foodnoms", "Label/barcode/photo/text, privacy-first."],
        ["SnapCalorie", "AI photo/voice — good for simple foods; complex meals need correction."],
        ["Flo / Clue", "Community + cycle data but essentially NO nutrition feature — genuine whitespace."],
      ]} />
      <P><small>Sources: calorie-trackers.com · fitia.app · Which? ZOE review · eathealthy365 · weightwatchers.com · nutriscan.app · tribe.ai · wondershare.</small></P>

      <Card accent="#C4849A">
        <P><b>Logging-friction &amp; harm evidence (a hard ethical constraint).</b></P>
        <Bullets items={[
          ">70% find logging burdensome (PMC5537862).",
          "Guilt/shame drives discontinuation (Lindgreen 2021, Brain & Behavior).",
          "2026 systematic review (Wallace et al., SAGE J Health Psychology): tracking may increase disordered-eating risk — ~half reported increased self-consciousness/guilt after a month; ~40% of male MFP users perceived it as contributing to ED symptoms.",
          "Works: recents/favourites + photo/voice/natural-language + 'good enough' editable estimates. AVOID: daily pass/fail and calorie scoreboards.",
        ]} />
      </Card>

      <P><b>Women-specific — STRONG UK evidence (British Nutrition Foundation / BDA).</b></P>
      <Table rows={[
        ["Need", "Evidence"],
        ["Iron", "14.8mg/day menstruating vs 8.7mg at 50+; >1/4 of women inadequate; pair with vit C. The one solid cycle angle: iron during menstruation."],
        ["Fibre", "30g target vs ~17g actual."],
        ["Calcium + vit D", "700mg calcium + 10µg vit D."],
        ["Folic acid", "400µg pre-conception → week 12."],
        ["Peri / menopause", "~1.2g/kg protein + calcium + vit D + resistance for bone/muscle (BDA, ESPEN). Hot-flush triggers: caffeine/alcohol/spicy (BDA); phytoestrogens emerging."],
        ["Postpartum", "Protein / iron / omega-3 / fibre."],
      ]} />

      <Card accent="#C4849A">
        <P><b>CONTESTED — flag clearly.</b> Cycle-syncing macro prescriptions have weak dietitian consensus — position as self-awareness only (iron-during-menstruation is the solid bit). ZOE-style 'truly personalized' claims overreach (Which?). Intuitive Eating IS evidence-based (Tribole &amp; Resch; Cedars-Sinai; PubMed 28619668) — it validates the no-scoreboard stance.</P>
      </Card>

      <Card accent="#6B8F5A">
        <P><b>WHOLE-LIFE / joy evidence (under-used by every competitor).</b></P>
        <Bullets items={[
          "Cooking confidence ↔ lower depression / higher wellbeing (Frontiers).",
          "Cooking brings joy to 58% across 142 countries; cooking together +232% joy; eating with someone cuts rejection feelings 23.5% (Gallup).",
          "Budget/skills programs (Cooking Matters, Jamie's Ministry of Food) raise veg intake + cut food insecurity.",
        ]} />
      </Card>

      <H2>3. Deep brainstorm — themed superset</H2>
      <Card accent="#A6862B"><P><b>(a) Frictionless logging</b> — recents/favourites; 'repeat yesterday'; photo AI log; voice/natural-language; quick-add; barcode via Open Food Facts (free).</P></Card>
      <Card accent="#A6862B"><P><b>(b) A real food database</b> — replace the 28-item FOOD_DB. Open Food Facts (free, barcode-rich, UK-strong, variable) and/or USDA FDC (free, lab-verified, generic, US-centric) as a deterministic floor, with the LLM as fallback/parser for free-text — not the only source. Cache hot lookups.</P></Card>
      <Card accent="#A6862B"><P><b>(c) Whole-life &amp; joy</b> — a 'how did it feel' non-macro log; cooking-confidence prompts; cultural/world-cuisine celebration; budget mode; cook-together/social; Community food-room ties. The differentiator.</P></Card>
      <Card accent="#A6862B"><P><b>(d) Evidence-based women's nutrition done right</b> — iron/protein/fibre/calcium as gentle nudges, never scoreboards; menopause/peri/pregnancy/postpartum modes; the honest cycle-aware framing (iron is solid; the rest is self-awareness, labelled).</P></Card>
      <Card accent="#A6862B"><P><b>(e) Intuitive / non-diet framing</b> — qualitative reflection instead of calorie pass/fail; hunger/fullness check-ins; anti-diet-culture copy throughout.</P></Card>
      <Card accent="#A6862B"><P><b>(f) Smarter insights</b> — fix the legacy-shape bug first; mood-food / energy-food patterns from DailyCheckins; a gentle weekly story in Jess's voice, not a report card.</P></Card>
      <Card accent="#A6862B"><P><b>(g) Planning &amp; shopping</b> — unify the two planners; smarter shopping (auto-build from plan, de-dupe); a pantry layer.</P></Card>
      <Card accent="#A6862B"><P><b>(h) Jess as nutrition companion</b> — ask-Jess about food; gentle opt-in nudges; 'what could I make with this' meal ideas. Voice continuity, not a separate bot.</P></Card>
      <Card accent="#A6862B"><P><b>(i) Hydration / drinks polish</b> — keep what works; fold into the daily snapshot rather than a separate chore.</P></Card>

      <H2>4. Prioritized roadmap</H2>
      <Table rows={[
        ["Item", "Pri", "Rationale / FemWell-fit", "Cx", "Gated dep"],
        ["Fix legacy-shape calorie bug", P0, "Trend reads 0 for new meals — silent loss. No UX change.", "S", "None"],
        ["TDEE / target derivation", P0, "Real estimate from metrics + stage, not guessed default. Quiet, not a goal screen.", "S", "None (formula)"],
        ["Recents / favourites", P0, "#1 logging-speed driver. Anonymity-safe, no vanity.", "M", "None"],
        ["Real food DB (Open Food Facts)", P0, "Deterministic floor under the LLM. UK-strong, free. On-palette wrapper.", "L", "Free API; caching; attribution"],
        ["Unify the two planners", P0, "Manual + AI into one model. Calmer surface.", "M", "None"],
        ["Photo AI logging", P1, "Top friction-reducer; edit-to-correct. Jess-warm, 'good enough'.", "L", "Vision model cost"],
        ["Voice / natural-language log", P1, "Speak a meal; reuses analyzeMeal. Jess voice continuity.", "M", "LLM (in use)"],
        ["Women's micronutrient nudges", P1, "Iron/fibre/protein/calcium — STRONG evidence. Nudge, never scoreboard; per stage.", "M", "Copy/claims review"],
        ["'How it felt' + intuitive framing", P1, "Qualitative reflection replaces pass/fail — the harm-evidence response. The differentiator.", "M", "Copy review"],
        ["Insights upgrade (mood-food story)", P1, "Gentle weekly story from DailyCheckins. Jess voice, no vanity.", "M", "Depends on bug fix"],
        ["Stage modes (meno/preg/postpartum)", P1, "Protein + calcium + vit D + right framing per stage. Whole-life spine.", "M", "Claims review"],
        ["Persist recipes + ratings", P2, "Stop dropping generated recipes/ratings. Quiet quality.", "S", "None"],
        ["Budget mode", P2, "Cost-aware swaps + batch-cook; food-security evidence. Inclusive.", "M", "None"],
        ["Pantry / 'what's in the cupboard'", P2, "Plan + shop from what you have. Practical, calm.", "M", "None"],
        ["Hydration/drinks UI polish", P2, "Fold into daily snapshot; lighten. Less chore.", "S", "None"],
        ["Retire orphans (AIRecipeGen, MealItems)", P2, "Remove dead/stale code + orphaned writes. Hygiene.", "S", "None"],
        ["Barcode at scale", FUT, "Great once DB proven; needs robust scanning UX.", "L", "OFF coverage; camera UX"],
        ["Social cook-together", FUT, "+232% joy — but needs Community maturity + moderation.", "L", "Community; moderation; legal"],
        ["Microbiome / ZOE-style personalization", FUT, "Evidence runs ahead of claims (Which?). Optional, flagged.", "L", "Paid APIs; claims/legal"],
        ["Cycle-syncing macro prescriptions", FUT, "Weak consensus — self-awareness framing only, never targets.", "M", "Claims review; positioning"],
      ]} />
      <P><small>Complexity: S small · M medium · L large. Anything touching micronutrient or stage copy gets a light medical-claims pass before ship.</small></P>

      <H2>5. Connectivity — wire ALL surfaces</H2>
      <Table rows={[
        ["Surface", "Tie-in"],
        ["Community", "A food/nutrition room: share a recipe or a small win anonymously; budget tips; the cook-together future hook."],
        ["Journal", "Reflect on eating + mood-food; the 'how it felt' log flows into a journal prompt."],
        ["Today", "The daily nutrition snapshot (a glance, not a score) + coupled to the daily check-in so energy/mood and food sit together."],
        ["Lifestyle daily-read", "Food articles + recipes in the daily read; seasonal/cultural cuisine."],
        ["Planner", "Drop the unified meal plan into the week; shopping list builds from it."],
      ]} />

      <H2>6. Headline recommendation</H2>
      <Card accent="#4A2A3A">
        <P><b>Be the whole-life, non-scoreboard, women-aware nutrition layer</b> the calorie apps and period apps both miss — Flo/Clue have women + community and no nutrition; MyFitnessPal/ZOE have the tracking and the diet-culture baggage (and ZOE's over-claimed personalization). <b>Lead with</b> frictionless logging (recents/favourites + photo/voice), a real food DB (Open Food Facts under the LLM), intuitive/whole-life framing (qualitative reflection, joy, budget, cultural cooking), and evidence-based — not faddy — women's nutrition (iron/fibre/protein/calcium as gentle nudges per stage). <b>Treat</b> cycle-syncing macro prescriptions and microbiome 'personalization' as flagged, optional extras — never the spine. <b>Do first:</b> fix the legacy-shape calorie bug, derive real targets, ship recents/favourites, and put a real food database under the whole thing.</P>
      </Card>

      <Foot>FemWell — Nutrition Build Plan · 2026-06-12 · PLAN only, nothing built. Source-of-truth mirror: claude-state/NUTRITION_PLAN.html. Awaiting Halli's approval to scope P0.</Foot>
    </DocShell>
  );
}
