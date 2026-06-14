// UnifiedInsightsTab — Insights reimagined as Jess's WEEKLY STORY, not a report card.
// (Master plan §10 "Insights & the weekly story" + §11 "Women's nutrition intelligence".)
//
// Four calm sections, all built from REAL Base44 data only — no mock numbers:
//   1. THE WEEKLY STORY — a short warm narrative in Jess's Analyst voice, composed
//      LOCALLY from this week's real data (meals logged, variety of foods, hydration,
//      the dominant mood/energy rhythm). Optionally a guarded LLM pass polishes the
//      phrasing, but a fully-formed LOCAL story is computed first and used as the
//      fallback — the LLM can only ever make it nicer, never gate it, never hang it.
//      Sparse week → an honest, gentle day-one version.
//   2. PATTERNS — 1–2 real mood-food / energy-food observations from MealLog ×
//      DailyCheckins (do the iron-leaning foods track with steadier energy? does a
//      logged day track with brighter mood?). Only shown when the data supports it;
//      otherwise an honest "patterns appear as you log" line. Never a verdict.
//   3. FOR YOUR STAGE — the women's micronutrient layer as warm "foods rich in…"
//      cards per life stage (iron / folate / calcium+D / protein / fibre), mirroring
//      the hub's stageNudges content + the master-plan UK evidence. Gentle, never a
//      number target, never a scoreboard, never deficiency-shaming.
//   4. SAVED MEAL NOTES — the real NutritionInsight rows, reframed gently, with the
//      existing helpful/not-really feedback.
//
// CONSTRAINTS honoured: real data only; every read .catch-guarded; the LLM call is
// withTimeout-wrapped with a local fallback so it can NEVER hang; the one write
// (WeeklyInsights + feedback update) is withTimeout-wrapped; never crashes (empty
// states everywhere); NO scoreboards / streaks / pass-fail. Editorial cream/plum
// tokens, Lucide only, NO EMOJI, phone-first, bigger-card-inline feel. Jess's
// Analyst voice is always labelled "not medical advice".
//
// HONESTY GUARDRAILS (master plan §11): the stage layer uses only the STRONG-evidence
// nutrients (iron for menstruation, folate pre-conception, calcium+D+protein for
// peri/menopause/postpartum, fibre all stages) as gentle nudges. It does NOT prescribe
// cycle-syncing macros and does NOT overclaim microbiome / personalisation — the
// patterns section is explicitly framed as "a pattern in your data, not a rule."
//
// Touches only this file. Orchestrator (NutritionHub) wires it; the legacy
// NutritionInsightsTab.jsx is left in the repo untouched.

import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Leaf, ChevronDown, ChevronUp, Sparkles, RefreshCw, Loader2,
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { T, UI, SERIF, Eyebrow, Hand, Rule } from "@/components/journal/Editorial";
import { getMealSummary } from "@/utils/nutritionAiAnalysis";
import { rangeNutrition, microNudgeForStage } from "@/utils/foodModel";
import { learnedPatternLine } from "@/utils/personalisation";
import { withTimeout } from "@/utils/safeEntity";
import AiDisclaimer from "@/components/compliance/AiDisclaimer";

// ── stage-aware micronutrient nudges (mirrors NutritionHub.stageNudges) ───────
// STRONG-evidence nutrients only, framed as warm foods+why, never as targets.
function stageNudges(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    teen: [
      { key: "iron",    label: "Iron",    foods: "lentils · leafy greens · red meat", why: "growing years and periods ask a little more" },
      { key: "calcium", label: "Calcium", foods: "yoghurt · milk · fortified plant milk", why: "bones are still building their store" },
      { key: "fibre",   label: "Fibre",   foods: "oats · fruit · wholegrains",        why: "kind to digestion and steady energy" },
    ],
    reproductive: [
      { key: "iron",   label: "Iron",   foods: "lentils · greens · red meat", why: "monthly bleeds quietly draw on your stores" },
      { key: "fibre",  label: "Fibre",  foods: "oats · beans · wholegrains",  why: "helps hormones clear and digestion settle" },
      { key: "protein",label: "Protein",foods: "eggs · fish · beans",         why: "keeps energy level through the day" },
    ],
    "pre-ttc": [
      { key: "folate", label: "Folate",  foods: "leafy greens · beans · fortified grains", why: "the foundation as you prepare to conceive" },
      { key: "iron",   label: "Iron",    foods: "lentils · greens · red meat",            why: "topping up stores before they're shared" },
      { key: "fats",   label: "Healthy fats", foods: "avocado · olive oil · oily fish",   why: "quietly doing a lot this season" },
    ],
    ttc: [
      { key: "folate",label: "Folate",      foods: "leafy greens · beans · fortified grains", why: "the single most-evidenced prompt right now" },
      { key: "iron",  label: "Iron",        foods: "lentils · greens · red meat",  why: "supports a regular cycle" },
      { key: "fibre", label: "Fibre",       foods: "wholegrains · beans · fruit",  why: "helps hormones clear well" },
    ],
    pregnant: [
      { key: "folate", label: "Folate", foods: "leafy greens · beans · fortified grains", why: "especially through the early weeks" },
      { key: "iron",   label: "Iron",   foods: "red meat · lentils · spinach", why: "your blood volume is rising" },
      { key: "calcium",label: "Calcium",foods: "milk · yoghurt · cheese",      why: "building baby's bones" },
    ],
    "pregnant-t1": [
      { key: "folate", label: "Folate", foods: "leafy greens · beans · fortified grains", why: "most protective through the first trimester" },
      { key: "iron",   label: "Iron",   foods: "lentils · spinach · red meat", why: "leans in gently when you fancy it" },
      { key: "fibre",  label: "Fibre",  foods: "fruit · veg · wholegrains",    why: "eases the slower digestion" },
    ],
    "pregnant-t2": [
      { key: "iron",   label: "Iron",   foods: "red meat · lentils · spinach", why: "your blood volume keeps rising" },
      { key: "calcium",label: "Calcium",foods: "milk · yoghurt · cheese",      why: "building baby's bones" },
      { key: "fibre",  label: "Fibre",  foods: "fruit · veg · wholegrains",    why: "eases the slower digestion" },
    ],
    "pregnant-t3": [
      { key: "iron",   label: "Iron",   foods: "red meat · lentils · spinach", why: "small, steady plates carry it best now" },
      { key: "calcium",label: "Calcium",foods: "milk · yoghurt · cheese",      why: "still building baby's bones" },
      { key: "fibre",  label: "Fibre",  foods: "fruit · veg · wholegrains",    why: "kind to digestion in the last stretch" },
    ],
    postpartum: [
      { key: "iron",    label: "Iron",    foods: "red meat · lentils · greens",  why: "replenishing after birth" },
      { key: "protein", label: "Protein", foods: "eggs · chicken · beans",       why: "for recovery and feeding" },
      { key: "fibre",   label: "Fibre",   foods: "oats · fruit · wholegrains",   why: "gentle on a healing gut" },
    ],
    perimenopause: [
      { key: "iron",    label: "Iron",    foods: "lentils · leafy greens · red meat", why: "heavier cycles can dip your stores" },
      { key: "protein", label: "Protein", foods: "eggs · fish · beans",                why: "steadies energy through the swings" },
      { key: "calcium", label: "Calcium", foods: "yoghurt · tinned sardines · tofu",   why: "bones need a little more from here (with vitamin D)" },
    ],
    menopause: [
      { key: "calcium", label: "Calcium", foods: "dairy · fortified plant milk · greens", why: "protective as oestrogen settles (with vitamin D)" },
      { key: "protein", label: "Protein", foods: "fish · eggs · pulses",                  why: "helps hold onto muscle" },
      { key: "fibre",   label: "Fibre",   foods: "oats · beans · wholegrains",            why: "kind to digestion and heart" },
    ],
    "post-menopause": [
      { key: "calcium", label: "Calcium", foods: "dairy · fortified plant milk · greens", why: "kind to bones (paired with vitamin D)" },
      { key: "protein", label: "Protein", foods: "fish · eggs · pulses",                  why: "helps hold onto muscle and strength" },
      { key: "fibre",   label: "Fibre",   foods: "oats · beans · wholegrains",            why: "kind to digestion and heart" },
    ],
  };
  return byStage[stage] || [
    { key: "protein", label: "Protein", foods: "eggs · fish · beans",        why: "keeps energy steady" },
    { key: "fibre",   label: "Fibre",   foods: "oats · veg · wholegrains",   why: "kind to digestion" },
    { key: "iron",    label: "Iron",    foods: "leafy greens · lentils",     why: "supports energy" },
  ];
}

function stageLabel(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const map = {
    teen: "Teen", reproductive: "Reproductive years", "pre-ttc": "Preparing to conceive",
    ttc: "Trying to conceive", pregnant: "Pregnancy", "pregnant-t1": "Pregnancy · first trimester",
    "pregnant-t2": "Pregnancy · second trimester", "pregnant-t3": "Pregnancy · third trimester",
    postpartum: "Postpartum", perimenopause: "Perimenopause", menopause: "Menopause",
    "post-menopause": "Post-menopause",
  };
  return (stage && map[stage]) || "Your stage";
}

// Foods that lean iron-rich — used ONLY for a self-awareness pattern, never a diagnosis.
const IRON_TERMS = ["spinach", "lentil", "lentils", "red meat", "beef", "steak", "liver",
  "kale", "chard", "beans", "chickpea", "tofu", "greens", "broccoli", "sardine", "egg"];

// ── shared card shell (Editorial paper inset) ────────────────────────────────
const cardStyle = {
  background: T.paperHi,
  border: `1px solid ${T.paperDeep}`,
  borderRadius: 18,
  padding: 18,
};

// ── THE WEEKLY STORY (computed locally from real data) ───────────────────────
// Returns { tier, paragraphs:[...], meta } — paragraphs are plain strings so the
// LLM-polished string and the local fallback render the SAME way.
function buildLocalStory({ weekMeals, weekHydration, weekCheckins, profile }) {
  const mealCount = weekMeals.length;
  const loggedDays = new Set(weekMeals.map((m) => m.day_key)).size;

  // variety: distinct lowercase meal texts logged this week
  const distinctFoods = new Set(
    weekMeals.map((m) => (m.raw_text || "").trim().toLowerCase()).filter(Boolean)
  ).size;

  // how many meals carried real nutrition data this week — read through
  // getMealSummary so BOTH the new `summary` shape and the legacy
  // `nutritional_summary` shape count (fixes the legacy-shape calorie bug:
  // never JSON.parse `nutritional_summary` directly). We use this only as a
  // soft "you logged some real detail" signal — never as a calorie scoreboard.
  const mealsWithDetail = weekMeals.filter(
    (m) => (getMealSummary(m).summary?.calories || 0) > 0
  ).length;

  // hydration: mean over days that actually have a hydration log (no fake /7)
  const hydroByDay = {};
  weekHydration.forEach((h) => {
    hydroByDay[h.day_key] = (hydroByDay[h.day_key] || 0) + (h.amount_ml || 0);
  });
  const hydroDays = Object.keys(hydroByDay).length;
  const avgHydration = hydroDays
    ? Math.round(Object.values(hydroByDay).reduce((s, v) => s + v, 0) / hydroDays)
    : 0;

  // energy / mood rhythm (only from days that were checked in)
  const energyVals = weekCheckins.map((c) => c.energy).filter((v) => typeof v === "number");
  const moodVals = weekCheckins.map((c) => c.mood).filter((v) => typeof v === "number");
  const avgEnergy = energyVals.length
    ? energyVals.reduce((s, v) => s + v, 0) / energyVals.length : null;
  const avgMood = moodVals.length
    ? moodVals.reduce((s, v) => s + v, 0) / moodVals.length : null;

  const stage = stageLabel(profile);
  const paragraphs = [];

  // Tier 1 — day-one / sparse: honest and gentle, no invented patterns.
  if (mealCount === 0) {
    return {
      tier: 1,
      paragraphs: [
        "Your week is a clean page so far. When you log a meal or two, I'll start to notice the small rhythms — the days you cooked, the foods that turn up when your energy is steady — and tell that story back to you here.",
        "There's no score to chase. Just log what's true, and the picture fills in gently over the weeks.",
      ],
      meta: { mealCount, loggedDays, distinctFoods, avgHydration, hydroDays, avgEnergy, avgMood, stage },
    };
  }

  if (mealCount < 4 || loggedDays < 2) {
    paragraphs.push(
      `A gentle start this week — ${mealCount} meal${mealCount === 1 ? "" : "s"} logged across ${loggedDays} day${loggedDays === 1 ? "" : "s"}. That's plenty to begin with. As the days add up, I'll start to spot the patterns worth telling you about.`
    );
    if (avgHydration) {
      paragraphs.push(
        `On the day${hydroDays === 1 ? "" : "s"} you tracked water you were around ${avgHydration}ml — a small thing that often shows up in how steady your energy feels.`
      );
    }
    return {
      tier: 1,
      paragraphs,
      meta: { mealCount, loggedDays, distinctFoods, avgHydration, hydroDays, avgEnergy, avgMood, stage },
    };
  }

  // Tier 2+ — a real, warm narrative built from the week's true data.
  const varietyPhrase =
    distinctFoods >= 6 ? "a real spread of different foods"
    : distinctFoods >= 3 ? "a few different things"
    : "a familiar handful of favourites";
  let openingLine = `This week you logged ${mealCount} meals across ${loggedDays} day${loggedDays === 1 ? "" : "s"}, with ${varietyPhrase} on your plate.`;
  if (mealsWithDetail >= 3) {
    openingLine += " You also took the time to capture the detail on several of them — that quiet effort is what lets the picture sharpen.";
  } else {
    openingLine += " Showing up to log is the quiet work — and you did it.";
  }
  paragraphs.push(openingLine);

  if (avgEnergy != null) {
    const energyTone =
      avgEnergy >= 7 ? "your energy mostly held steady"
      : avgEnergy >= 4 ? "your energy moved up and down, which is completely normal"
      : "your energy ran a little low";
    let line = `On the days you checked in, ${energyTone}`;
    if (avgHydration) {
      line += `, and you were around ${avgHydration}ml of water on the days you tracked it`;
    }
    line += ".";
    paragraphs.push(line);
  } else if (avgHydration) {
    paragraphs.push(
      `On the days you tracked water you sat around ${avgHydration}ml — worth keeping an eye on, since it often shows up in energy.`
    );
  }

  // a single forward-looking, MI-style invitation (not an instruction)
  paragraphs.push(
    `For your ${stage.toLowerCase()} season, you might gently weight one iron- or protein-rich plate this week and notice how the afternoons feel. No rule — just curiosity.`
  );

  return {
    tier: 2,
    paragraphs,
    meta: { mealCount, loggedDays, distinctFoods, avgHydration, hydroDays, avgEnergy, avgMood, stage },
  };
}

// ── PATTERNS (real mood-food / energy-food observations) ─────────────────────
// Honesty guardrail: only surfaced when the paired data actually supports it, and
// always framed as "a pattern in YOUR data," never a rule or a diagnosis.
function buildPatterns({ meals, checkins }) {
  const out = [];
  if (!meals.length || !checkins.length) return out;

  // map day -> that day's checkin
  const checkinByDay = {};
  checkins.forEach((c) => { if (c.date) checkinByDay[c.date] = c; });

  // pair each logged-meal day with its checkin
  const mealDays = [...new Set(meals.map((m) => m.day_key))].filter((d) => checkinByDay[d]);
  if (mealDays.length < 4) return out;

  // 1) IRON-leaning foods × energy (the strongest, most-evidenced cycle angle)
  const ironDays = [];
  const nonIronDays = [];
  mealDays.forEach((d) => {
    const dayText = meals.filter((m) => m.day_key === d)
      .map((m) => (m.raw_text || "").toLowerCase()).join(" ");
    const hasIron = IRON_TERMS.some((t) => dayText.includes(t));
    const energy = checkinByDay[d]?.energy;
    if (typeof energy === "number") (hasIron ? ironDays : nonIronDays).push(energy);
  });
  if (ironDays.length >= 2 && nonIronDays.length >= 2) {
    const avgIron = ironDays.reduce((s, v) => s + v, 0) / ironDays.length;
    const avgNon = nonIronDays.reduce((s, v) => s + v, 0) / nonIronDays.length;
    if (avgIron - avgNon >= 0.8) {
      out.push(
        "Your energy tended to read a little higher on the days iron-rich foods — greens, lentils, red meat — turned up in your log. It's a pattern in your data, not a rule, but a kind one to lean into."
      );
    }
  }

  // 2) logged days × mood (gentle behaviour-change reflection, never a scoreboard)
  const moodWithMeals = [];
  const moodWithout = [];
  const allCheckinDays = Object.keys(checkinByDay);
  allCheckinDays.forEach((d) => {
    const mood = checkinByDay[d]?.mood;
    if (typeof mood !== "number") return;
    const logged = meals.some((m) => m.day_key === d);
    (logged ? moodWithMeals : moodWithout).push(mood);
  });
  if (out.length < 2 && moodWithMeals.length >= 3 && moodWithout.length >= 2) {
    const avgWith = moodWithMeals.reduce((s, v) => s + v, 0) / moodWithMeals.length;
    const avgWithout = moodWithout.reduce((s, v) => s + v, 0) / moodWithout.length;
    if (avgWith - avgWithout >= 0.8) {
      out.push(
        "The days you paused to log a meal also tended to be brighter-mood days. That's often less about the food and more about the small act of tuning in — worth noticing."
      );
    }
  }

  return out.slice(0, 2);
}

// ── SAVED MEAL NOTE card (real NutritionInsight row, reframed gently) ─────────
function SavedNoteCard({ insight, onFeedback }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {insight.headline && (
            <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 2 }}>
              {insight.headline}
            </div>
          )}
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {insight.meal_description}
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse note" : "Expand note"}
          style={{ flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", color: T.muted, marginTop: 2 }}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {expanded && (
        <div style={{ marginTop: 12, display: "grid", gap: 9 }}>
          {insight.wellness_impact && (
            <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.55, color: T.inkSoft, margin: 0 }}>
              {insight.wellness_impact}
            </p>
          )}
          {insight.smart_swap && (
            <p style={{ fontFamily: UI, fontSize: 11.5, lineHeight: 1.5, color: T.muted, margin: 0 }}>
              <span style={{ fontWeight: 700, color: T.inkSoft }}>A gentle swap to try · </span>
              {insight.smart_swap}
            </p>
          )}
          {insight.user_feedback === "none" || !insight.user_feedback ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>Did this land?</span>
              <button
                onClick={() => onFeedback(insight, "positive")}
                style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 999, border: `1px solid ${T.sage}`, background: "transparent", color: T.sage, cursor: "pointer" }}
              >
                Yes
              </button>
              <button
                onClick={() => onFeedback(insight, "negative")}
                style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: "transparent", color: T.muted, cursor: "pointer" }}
              >
                Not really
              </button>
            </div>
          ) : (
            <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>
              {insight.user_feedback === "positive" ? "Glad it helped." : "Noted — thank you."}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────
// Map the derived target set (deriveTargets) → the spine's nutrient-key reference
// shape, so the women's micronutrient layer can lean on the DERIVED guides (which
// already fold in stage + body + any user override) rather than the flat
// STAGE_MICRO_TARGETS constants. Only the nutrients the stage layer cares about.
function refsFromTargets(targets) {
  if (!targets) return null;
  const refs = {};
  if (targets.iron_mg) refs.iron_mg = targets.iron_mg;
  if (targets.folate_ug) refs.folate_ug = targets.folate_ug;
  if (targets.calcium_mg) refs.calcium_mg = targets.calcium_mg;
  if (targets.protein_g) refs.protein_g = targets.protein_g;
  if (targets.fibre_g) refs.fiber_g = targets.fibre_g; // spine key is fiber_g
  return Object.keys(refs).length ? refs : null;
}

// Recompute which of this stage's reference nutrients are leaning light, using the
// DERIVED refs as the soft reference. Mirrors microNudgeForStage's honesty rule
// (macros reliable; micros only "count" when real data backed them; lean < ~70% of
// the soft ref). Used only when `targets` is supplied; otherwise we keep the
// STAGE_MICRO_TARGETS-based microNudgeForStage result as the fallback.
const DERIVED_MICRO_KEYS = ["iron_mg", "folate_ug", "calcium_mg"];
const DERIVED_FOODS = {
  iron_mg: { label: "Iron" }, folate_ug: { label: "Folate" }, calcium_mg: { label: "Calcium" },
  protein_g: { label: "Protein" }, fiber_g: { label: "Fibre" },
};
function microNudgeFromRefs(refs, nutrition) {
  const n = nutrition || {};
  const perDay = n.perDay || {};
  const microDays = n.microDays || {};
  const loggedDays = n.loggedDays != null ? n.loggedDays : 0;
  if (!loggedDays) return { hasData: false, leaning: [] };
  const leaning = [];
  for (const key of Object.keys(refs)) {
    const target = Number(refs[key]);
    if (!Number.isFinite(target) || target <= 0) continue;
    const isMicro = DERIVED_MICRO_KEYS.includes(key);
    // micros only count when some real micro value backed them this week
    if (isMicro && !(microDays[key] > 0)) continue;
    const had = Number(perDay[key]) || 0;
    if (had > 0 && had < target * 0.7) {
      leaning.push({ key, ...(DERIVED_FOODS[key] || { label: key }) });
    }
  }
  return { hasData: true, leaning };
}

export default function UnifiedInsightsTab({ user, profile, nutritionProfile, targets }) {
  const [loading, setLoading] = useState(true);
  const [polishing, setPolishing] = useState(false);
  const [mealLogs, setMealLogs] = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [savedInsights, setSavedInsights] = useState([]);
  // polishedStory: the optional LLM-improved narrative string (null = use local)
  const [polishedStory, setPolishedStory] = useState(null);

  // week bounds (Mon–Sun)
  const { weekStartKey, weekEndKey, sinceKey } = useMemo(() => {
    const now = new Date();
    return {
      weekStartKey: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      weekEndKey: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      sinceKey: format(subDays(now, 30), "yyyy-MM-dd"),
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    // every read is guarded — a stalled/failed read yields [] and never crashes
    const [ml, hl, ci, ins] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: user.id }).catch(() => []),
      base44.entities.HydrationLog.filter({ user_id: user.id }).catch(() => []),
      base44.entities.DailyCheckins.filter({ user_id: user.id }).catch(() => []),
      base44.entities.NutritionInsight.filter({ user_id: user.id }).catch(() => []),
    ]);
    const safe = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
    setMealLogs(safe(ml).filter((x) => x.day_key && x.day_key >= sinceKey));
    setHydrationLogs(safe(hl).filter((x) => x.day_key && x.day_key >= sinceKey));
    setCheckins(safe(ci).filter((x) => x.date && x.date >= sinceKey));
    setSavedInsights(
      safe(ins)
        .filter((x) => x.day_key && x.day_key >= sinceKey)
        .sort((a, b) => (b.day_key || "").localeCompare(a.day_key || ""))
    );
    // a previously-polished story for this week, if one was saved (guarded)
    const saved = await base44.entities.WeeklyInsights
      .filter({ user_id: user.id, week_start: weekStartKey })
      .catch(() => []);
    if (Array.isArray(saved) && saved[0]?.insight_text) setPolishedStory(saved[0].insight_text);
    setLoading(false);
  }, [user?.id, sinceKey, weekStartKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // this week's slices (real)
  const weekMeals = useMemo(
    () => mealLogs.filter((m) => m.day_key >= weekStartKey && m.day_key <= weekEndKey),
    [mealLogs, weekStartKey, weekEndKey]
  );
  const weekHydration = useMemo(
    () => hydrationLogs.filter((h) => h.day_key >= weekStartKey && h.day_key <= weekEndKey),
    [hydrationLogs, weekStartKey, weekEndKey]
  );
  const weekCheckins = useMemo(
    () => checkins.filter((c) => c.date >= weekStartKey && c.date <= weekEndKey),
    [checkins, weekStartKey, weekEndKey]
  );

  // THE local story — always computed from real data, used as the LLM fallback
  const localStory = useMemo(
    () => buildLocalStory({ weekMeals, weekHydration, weekCheckins, profile }),
    [weekMeals, weekHydration, weekCheckins, profile]
  );

  // PATTERNS — 30-day window for enough paired days, real only
  const patterns = useMemo(
    () => buildPatterns({ meals: mealLogs, checkins }),
    [mealLogs, checkins]
  );

  const nudges = useMemo(() => stageNudges(profile), [profile]);

  // MEMORY: ONE warm "what you reach for" line from the user's own logged habits
  // (30-day window). Real, or null when too sparse to honestly say — never a verdict,
  // never a count shown as a score. Shown gently alongside the weekly story.
  const memoryLine = useMemo(() => learnedPatternLine(mealLogs), [mealLogs]);

  // DATA-DRIVEN women's layer: this week's real totals (macros + micros) from the
  // nutrition spine, then which of this stage's reference nutrients are leaning light.
  // A picture, not a target — microNudgeForStage only flags a lean when real data
  // backs it (missing micros = a gap, not a lean), and never returns a number to show.
  const weekNutrition = useMemo(
    () => rangeNutrition(weekMeals, 7),
    [weekMeals]
  );
  // Prefer the DERIVED targets as the soft reference (they fold in stage + body +
  // any user override); fall back to the STAGE_MICRO_TARGETS-based nudge when no
  // derived targets were passed. Still gentle, still a picture — never a number shoved
  // at the user. We keep the stage-set's foods/why copy via orderedNudges below.
  const derivedRefs = useMemo(() => refsFromTargets(targets), [targets]);
  const microNudge = useMemo(
    () => (derivedRefs
      ? microNudgeFromRefs(derivedRefs, weekNutrition)
      : microNudgeForStage(profile, weekNutrition)),
    [derivedRefs, profile, weekNutrition]
  );
  // which stage cards to lead with: the leaning ones (by real data) first, then the
  // rest of the stage set; falls back to the full gentle generic set when no data yet.
  // map spine nutrient keys (iron_mg…) → stageNudges card keys (iron / fibre…)
  const SPINE_TO_NUDGE = { iron_mg: "iron", folate_ug: "folate", calcium_mg: "calcium", protein_g: "protein", fiber_g: "fibre" };
  const orderedNudges = useMemo(() => {
    if (!microNudge.hasData || microNudge.leaning.length === 0) return nudges;
    const leaningKeys = new Set(microNudge.leaning.map((l) => SPINE_TO_NUDGE[l.key] || l.key));
    const lead = nudges.filter((m) => leaningKeys.has(m.key));
    const rest = nudges.filter((m) => !leaningKeys.has(m.key));
    return [...lead, ...rest];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microNudge, nudges]);
  const leaningCardKeys = useMemo(
    () => new Set((microNudge.leaning || []).map((l) => SPINE_TO_NUDGE[l.key] || l.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [microNudge]
  );

  // Optional guarded LLM polish of the story phrasing. The LOCAL story is the source
  // of truth + fallback; the LLM only restyles it. withTimeout means it can never
  // hang; any failure silently keeps the local story. Honesty guardrail baked into
  // the prompt: no targets, no diagnoses, no cycle-syncing claims.
  const polishStory = useCallback(async () => {
    if (polishing) return;
    setPolishing(true);
    const localText = localStory.paragraphs.join("\n\n");
    const prompt = `You are Jess, a warm, plain-spoken UK women's wellness companion (NOT a clinician).
Rewrite the weekly nutrition story below so it reads naturally and kindly, in British English.
STRICT RULES:
- Keep every factual claim EXACTLY as given — invent no numbers, foods, patterns, or advice.
- Motivational-interviewing tone: curious and encouraging, never a verdict, never a score.
- No calorie/weight talk, no numeric targets, no "should". No medical claims or diagnoses.
- Do NOT mention cycle-syncing macros or microbiome personalisation.
- 110 words max. Plain paragraphs separated by a blank line. No headings, no lists, no emoji.

Story to rewrite:
${localText}`;
    try {
      const res = await withTimeout(
        base44.integrations.Core.InvokeLLM({ prompt }),
        15000,
        "weekly story"
      );
      const text = typeof res === "string" ? res : res?.text || res?.output;
      if (text && text.trim()) {
        setPolishedStory(text.trim());
        // persist (guarded) so a refresh doesn't re-spend the call — never blocks UI
        try {
          const existing = await withTimeout(
            base44.entities.WeeklyInsights.filter({ user_id: user.id, week_start: weekStartKey }),
            6000, "story load"
          ).catch(() => []);
          if (Array.isArray(existing) && existing[0]?.id) {
            await withTimeout(
              base44.entities.WeeklyInsights.update(existing[0].id, {
                insight_text: text.trim(), generated_at: new Date().toISOString(),
              }), 6000, "story save"
            );
          } else {
            await withTimeout(
              base44.entities.WeeklyInsights.create({
                user_id: user.id, week_start: weekStartKey, week_end: weekEndKey,
                insight_text: text.trim(), generated_at: new Date().toISOString(),
              }), 6000, "story save"
            );
          }
        } catch { /* persistence is best-effort; the polished story still shows */ }
      }
    } catch {
      /* LLM stalled or failed — silently keep the local story, never hang */
    } finally {
      setPolishing(false);
    }
  }, [polishing, localStory, user?.id, weekStartKey, weekEndKey]);

  const handleFeedback = useCallback(async (insight, feedback) => {
    // optimistic; guarded write with rollback so a stalled write can't hang the UI
    setSavedInsights((prev) => prev.map((i) => (i.id === insight.id ? { ...i, user_feedback: feedback } : i)));
    try {
      await withTimeout(
        base44.entities.NutritionInsight.update(insight.id, { user_feedback: feedback }),
        6000, "feedback"
      );
    } catch {
      setSavedInsights((prev) => prev.map((i) => (i.id === insight.id ? { ...i, user_feedback: insight.user_feedback || "none" } : i)));
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: T.gold }} />
      </div>
    );
  }

  // the story paragraphs to render: polished (if present) split on blank lines, else local
  const storyParagraphs = polishedStory
    ? polishedStory.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
    : localStory.paragraphs;

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* 1 · THE WEEKLY STORY */}
      <section style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={15} color={T.gold} />
            <Eyebrow color={T.gold}>Jess · your week, in a few words</Eyebrow>
          </div>
          <button
            onClick={polishStory}
            disabled={polishing}
            aria-label="Refine wording"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
              border: "none", cursor: polishing ? "default" : "pointer", color: T.gold,
              fontFamily: UI, fontSize: 11, fontWeight: 700, opacity: polishing ? 0.6 : 1,
            }}
          >
            {polishing
              ? <Loader2 size={13} className="animate-spin" />
              : <RefreshCw size={13} />}
            {polishing ? "Refining" : "Refine wording"}
          </button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {storyParagraphs.map((p, i) => (
            <Hand key={i} size={16} color={T.ink}>{p}</Hand>
          ))}
        </div>

        {/* MEMORY: a gentle "what you reach for" line from real logged habits — a warm
            observation, not a verdict. Hidden entirely when the data is too sparse. */}
        {memoryLine && (
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.paperDeep}` }}>
            <Leaf size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 3 }} />
            <p style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", lineHeight: 1.55, color: T.inkSoft, margin: 0 }}>
              {memoryLine}
            </p>
          </div>
        )}

        {/* honesty / compliance line — Jess is never clinical */}
        <AiDisclaimer
          label={
            polishedStory
              ? "Jess's reflection, polished by AI. This is not medical advice — always consult a healthcare professional."
              : "A gentle reflection, not medical advice. Always consult a healthcare professional."
          }
        />
      </section>

      {/* 2 · PATTERNS */}
      <section style={cardStyle}>
        <Eyebrow mb={10}>Patterns I'm noticing</Eyebrow>
        {patterns.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {patterns.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: T.sage, flexShrink: 0, marginTop: 7 }} />
                <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: T.inkSoft, margin: 0 }}>{p}</p>
              </div>
            ))}
            <p style={{ fontFamily: UI, fontSize: 10.5, fontStyle: "italic", color: T.muted, margin: "2px 0 0" }}>
              These are patterns in your own logs — a prompt for curiosity, never a diagnosis.
            </p>
          </div>
        ) : (
          <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: T.muted, fontStyle: "italic", margin: 0 }}>
            Patterns appear here as you log. A handful of days with both meals and a daily check-in is all it takes for me to start noticing the gentle connections between your food and how you feel.
          </p>
        )}
      </section>

      {/* 3 · WOMEN'S MICRONUTRIENT LAYER — "For your stage" */}
      <section style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Leaf size={15} color={T.sage} />
          <Eyebrow color={T.sage}>For your stage · {stageLabel(profile)}</Eyebrow>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: T.muted, fontStyle: "italic", margin: "0 0 14px" }}>
          {microNudge.hasData && microNudge.leaning.length > 0
            // DATA-DRIVEN: name the nutrient(s) leaning light in this week's real logs,
            // gently — a picture, never a target or a deficiency verdict.
            ? `Reading your week so far, you've been a little lighter on ${microNudge.leaning.map((l) => l.label.toLowerCase()).join(" and ")} — the foods below would gently round that out. A picture, not a target.`
            : microNudge.hasData
              // logged, but nothing leaning low — affirm rather than nag.
              ? "Your week's looking nicely balanced for your stage. These are simply the foods worth keeping close — gentle leans grounded in UK guidance, never targets to hit."
              // no logged data yet — gentle generic copy.
              : "Foods to lean toward this week — gentle leans grounded in UK guidance, never targets to hit. Log a few meals and this will start to read from your own week."}
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {orderedNudges.map((m) => {
            const leaning = leaningCardKeys.has(m.key);
            return (
              <div key={m.key} style={{ borderLeft: `2px solid ${leaning ? T.sage : T.paperDeep}`, paddingLeft: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{m.label}</span>
                  {leaning && (
                    <span style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.sage }}>
                      lighter this week
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2 }}>{m.foods}</div>
                <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 1 }}>{m.why}</div>
              </div>
            );
          })}
        </div>
        <Rule mt={14} mb={10} />
        <p style={{ fontFamily: UI, fontSize: 10.5, fontStyle: "italic", color: T.muted, margin: 0, lineHeight: 1.5 }}>
          Gentle guidance, not medical advice. If you're pregnant, planning pregnancy, or managing a health condition, your midwife, GP or pharmacist can advise on supplements such as folic acid or vitamin D.
        </p>
      </section>

      {/* 4 · SAVED MEAL NOTES (real NutritionInsight rows) */}
      {savedInsights.length > 0 && (
        <section style={cardStyle}>
          <Eyebrow mb={12}>Notes from your meals · last 30 days</Eyebrow>
          <div style={{ display: "grid", gap: 10 }}>
            {savedInsights.slice(0, 10).map((ins) => (
              <SavedNoteCard key={ins.id} insight={ins} onFeedback={handleFeedback} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
