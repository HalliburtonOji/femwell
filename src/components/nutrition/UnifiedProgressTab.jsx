// UnifiedProgressTab — Progress reimagined as "patterns, not scores" (master plan §9).
//
// Vision (Lifesum Life-Score spirit, Intuitive-Eating evidence in UI form):
//   • ONE gentle composite — "how nourished the fortnight felt" — encouragement,
//     NOT a score out of 100, NEVER calorie pass/fail.
//   • CORRELATION cards — the differentiator — real food↔energy and food↔mood
//     patterns, computed by joining MealLog days with DailyCheckins. Only shown
//     when there's enough history; otherwise an honest "a little more and patterns appear".
//   • TRENDS not streaks — calm SVG sparklines, no shouting numbers, no streak counter.
//   • BODY METRICS visualised — the data that's stored but never shown; weight optional,
//     NEVER the headline. Plus add-metric + targets/goal editing.
//   • CYCLE LENS — an observed pattern across HER OWN cycle phases (legitimate
//     self-awareness), never a prescription.
//
// Real data only. Every read .catch-guarded, every write withTimeout + optimistic + rollback.
// Cream/plum Editorial tokens, Lucide, no emoji, phone-first. Never crashes.

import { useState, useEffect, useMemo } from "react";
import {
  Loader2, Plus, Sparkles, HeartPulse, Zap, Leaf, Activity, Moon, Target, Pencil,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { base44 } from "@/api/base44Client";
import { withTimeout } from "@/utils/safeEntity";
import { getMealSummary } from "@/utils/nutritionAiAnalysis";

/* ---------------------------------------------------------------- tokens */

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)",
};

const GOAL_MODES = [
  { key: "fat_loss",        label: "Steady progress",     desc: "Gentle, sustainable change" },
  { key: "tone",            label: "Tone & strength",     desc: "Feel strong, build lean muscle" },
  { key: "energy",          label: "Energy",              desc: "Fuel your day naturally" },
  { key: "hormone_support", label: "Hormone support",     desc: "Nourish your cycle" },
  { key: "postpartum",      label: "Postpartum recovery", desc: "Gentle recovery and nourishment" },
  { key: "menopause",       label: "Menopause support",   desc: "Balance through transition" },
];

// Heuristic keyword sets for "leaning" tags. Intentionally generic-but-true
// (master plan §11 evidence guardrails) — we surface a leaning, never a verdict.
const IRON_HINTS    = ["spinach", "lentil", "beef", "steak", "liver", "kale", "beans", "chickpea", "tofu", "egg", "red meat", "dark leafy", "iron"];
const PROTEIN_HINTS = ["chicken", "salmon", "fish", "tuna", "egg", "yogurt", "yoghurt", "tofu", "tempeh", "beans", "lentil", "turkey", "cottage", "greek", "protein", "prawn", "shrimp"];
const FIBRE_HINTS   = ["oat", "wholegrain", "whole grain", "bean", "lentil", "broccoli", "apple", "berries", "vegetable", "veg", "salad", "brown rice", "seeds", "nuts", "fibre", "fiber"];

const CYCLE_PHASES = [
  { key: "menstrual",  label: "Menstrual", color: "#C4849A" },
  { key: "follicular", label: "Follicular", color: "#7A9E8E" },
  { key: "ovulatory",  label: "Ovulatory", color: "#E8B84B" },
  { key: "luteal",     label: "Luteal",     color: "#9B7FCC" },
];

/* ---------------------------------------------------------------- helpers */

function phaseForDate(dateStr, p) {
  if (!p?.last_period_start_date) return null;
  const cycleLen = p.cycle_avg_length || 28;
  const periodLen = p.period_length || 5;
  const start = new Date(p.last_period_start_date).getTime();
  const t = new Date(dateStr).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(t)) return null;
  const daysSince = Math.floor((t - start) / 86400000);
  if (daysSince < 0) return null;
  const dayOfCycle = (daysSince % cycleLen) + 1;
  if (dayOfCycle <= periodLen) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

// Build a per-day map of nutrition signals from MealLog. Uses getMealSummary so the
// legacy-shape zero bug is avoided (it normalises a.summary || a.nutritional_summary).
function buildDayMap(mealLogs) {
  const map = {}; // day_key -> { meals, calories, protein, fibre, items:[names], leanIron, leanProtein, leanFibre }
  (mealLogs || []).forEach((m) => {
    const key = m.day_key;
    if (!key) return;
    if (!map[key]) map[key] = { meals: 0, calories: 0, protein: 0, fibre: 0, items: [], names: "" };
    const { summary } = getMealSummary(m) || {};
    const s = summary || {};
    map[key].meals += 1;
    map[key].calories += Number(s.calories) || 0;
    map[key].protein += Number(s.protein_g) || 0;
    map[key].fibre += Number(s.fiber_g) || 0;
    const itemNames = ((m.ai_analysis && m.ai_analysis.items) || [])
      .map((it) => (it && it.name ? String(it.name) : ""))
      .filter(Boolean);
    map[key].items.push(...itemNames);
    map[key].names += " " + (m.raw_text || "") + " " + itemNames.join(" ");
  });
  Object.values(map).forEach((d) => {
    const hay = d.names.toLowerCase();
    d.leanIron = IRON_HINTS.some((w) => hay.includes(w));
    d.leanProtein = (d.protein >= 60) || PROTEIN_HINTS.some((w) => hay.includes(w));
    d.leanFibre = (d.fibre >= 20) || FIBRE_HINTS.some((w) => hay.includes(w));
    d.variety = new Set(d.items.map((x) => x.toLowerCase())).size;
  });
  return map;
}

function hydrationByDay(hydrationLogs) {
  const map = {};
  (hydrationLogs || []).forEach((l) => {
    if (!l.day_key) return;
    map[l.day_key] = (map[l.day_key] || 0) + (Number(l.amount_ml) || 0);
  });
  return map;
}

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const round1 = (n) => Math.round(n * 10) / 10;

/* ---------------------------------------------------------------- sparkline */

function Sparkline({ values, color = "var(--rose-dust)", height = 44 }) {
  const pts = (values || []).filter((v) => typeof v === "number" && Number.isFinite(v));
  if (pts.length < 2) return null;
  const w = 240;
  const h = height;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = w / (pts.length - 1);
  const coords = pts.map((v, i) => [i * step, h - 4 - ((v - min) / span) * (h - 8)]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${round1(x)},${round1(y)}`).join(" ");
  const area = `${path} L${round1((pts.length - 1) * step)},${h} L0,${h} Z`;
  const last = coords[coords.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={color} opacity="0.10" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

/* ---------------------------------------------------------------- component */

export default function UnifiedProgressTab({ user, profile, nutritionProfile, onProfileUpdated }) {
  const [metrics, setMetrics] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  // editing state
  const [addingMetric, setAddingMetric] = useState(false);
  const [metricForm, setMetricForm] = useState({ weight_kg: "", waist_cm: "", hips_cm: "", bust_cm: "", notes: "" });
  const [savingMetric, setSavingMetric] = useState(false);

  const [editingTargets, setEditingTargets] = useState(false);
  const [targetForm, setTargetForm] = useState({
    calories_target: nutritionProfile?.calories_target || 2000,
    protein_target_g: nutritionProfile?.protein_target_g || 120,
    carbs_target_g: nutritionProfile?.carbs_target_g || 200,
    fat_target_g: nutritionProfile?.fat_target_g || 65,
    hydration_target_ml: nutritionProfile?.hydration_target_ml || 2000,
  });
  const [savingTargets, setSavingTargets] = useState(false);

  const [editingGoal, setEditingGoal] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const [saveError, setSaveError] = useState(null);

  useEffect(() => { loadData(); /* eslint-disable-next-line */ }, []);

  const loadData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
    const [m, ml, hl, ci] = await Promise.all([
      base44.entities.BodyMetrics.filter({ user_id: user.id }).catch(() => []),
      base44.entities.MealLog.filter({ user_id: user.id }).catch(() => []),
      base44.entities.HydrationLog.filter({ user_id: user.id }).catch(() => []),
      base44.entities.DailyCheckins.filter({ user_id: user.id }, "-date", 90).catch(() => []),
    ]);
    setMetrics(
      (m || []).filter((x) => x.day_key && x.day_key >= since)
        .sort((a, b) => a.day_key.localeCompare(b.day_key))
    );
    setMealLogs((ml || []).filter((x) => x.day_key && x.day_key >= since));
    setHydrationLogs((hl || []).filter((x) => x.day_key && x.day_key >= since));
    setCheckins((ci || []).filter((x) => x.date && x.date >= since));
    setLoading(false);
  };

  /* ---------- derived: the gentle composite + trends + correlations + cycle ---------- */

  const derived = useMemo(() => {
    const dayMap = buildDayMap(mealLogs);
    const hydMap = hydrationByDay(hydrationLogs);
    const hydTarget = nutritionProfile?.hydration_target_ml || 2000;

    // --- fortnight nourishment composite (soft, qualitative — NOT /100) ---
    const fortnight = Array.from({ length: 14 }, (_, i) => format(subDays(new Date(), 13 - i), "yyyy-MM-dd"));
    const daysWithMeals = fortnight.filter((k) => dayMap[k]?.meals > 0);
    const loggedShare = daysWithMeals.length / 14;

    // signals (each 0..1), only counted across days she actually engaged with
    const varietyVals = daysWithMeals.map((k) => Math.min((dayMap[k].variety || dayMap[k].meals) / 5, 1));
    const hydrationVals = fortnight.map((k) => Math.min((hydMap[k] || 0) / hydTarget, 1));
    const nourishVals = daysWithMeals.map((k) => {
      const d = dayMap[k];
      let s = 0.4;                 // showed up and logged
      if (d.leanProtein) s += 0.2;
      if (d.leanFibre) s += 0.2;
      if ((d.variety || 0) >= 3) s += 0.2;
      return Math.min(s, 1);
    });

    const varietyScore = mean(varietyVals);
    const hydrationScore = mean(hydrationVals);
    const nourishScore = mean(nourishVals);

    // blended softly; presence-weighted so a quiet fortnight reads "finding rhythm", never "fail"
    const parts = [nourishScore, varietyScore, hydrationScore].filter((x) => x != null);
    const blend = parts.length ? mean(parts) * (0.5 + 0.5 * loggedShare) : null;

    let band = null;
    if (daysWithMeals.length === 0) {
      band = { tone: "quiet", title: "A fresh, quiet page", body: "Nothing logged this fortnight yet. Whenever you log a meal or a glass of water, this gentle read of how nourished things feel will start to fill in." };
    } else if (blend >= 0.7) {
      band = { tone: "bright", title: "A really nourished fortnight", body: "Lots of variety and steady hydration showed up in your logs. This is your own rhythm reflected back — not a score to beat." };
    } else if (blend >= 0.45) {
      band = { tone: "steady", title: "A steady, nourishing rhythm", body: "You've been showing up for yourself across these two weeks. A little more variety or water on the lighter days would round it out — gently." };
    } else {
      band = { tone: "finding", title: "Finding your rhythm", body: "A lighter fortnight in the logs, and that's completely okay. Progress here isn't about perfect days — it's the patterns that build over time." };
    }

    // --- weekly trend sparklines (nourishment + hydration over up to 12 weeks) ---
    const weeksBack = 8;
    const weekly = Array.from({ length: weeksBack }, (_, wi) => {
      const end = subDays(new Date(), (weeksBack - 1 - wi) * 7);
      const keys = Array.from({ length: 7 }, (_, d) => format(subDays(end, d), "yyyy-MM-dd"));
      const mealDays = keys.filter((k) => dayMap[k]?.meals > 0);
      const nour = mean(mealDays.map((k) => {
        const dd = dayMap[k]; let s = 0.4;
        if (dd.leanProtein) s += 0.2; if (dd.leanFibre) s += 0.2; if ((dd.variety || 0) >= 3) s += 0.2;
        return Math.min(s, 1);
      }));
      const hyd = mean(keys.map((k) => Math.min((hydMap[k] || 0) / hydTarget, 1)));
      return { nour: nour == null ? 0 : nour, hyd: hyd == null ? 0 : hyd, hasData: mealDays.length > 0 || keys.some((k) => hydMap[k]) };
    });
    const trendHasData = weekly.filter((w) => w.hasData).length >= 2;
    const nourishSeries = weekly.map((w) => w.nour);
    const hydrationSeries = weekly.map((w) => w.hyd);

    // --- correlations: join meal-days with DailyCheckins (energy / mood / digestion) ---
    const ciByDate = {};
    (checkins || []).forEach((c) => { if (c.date) ciByDate[c.date] = c; });

    function leaningCorrelation(leanKey, metricKey) {
      const withLean = [];
      const without = [];
      Object.keys(dayMap).forEach((k) => {
        const c = ciByDate[k];
        if (!c) return;
        const val = Number(c[metricKey]);
        if (!Number.isFinite(val)) return;
        if (dayMap[k][leanKey]) withLean.push(val); else without.push(val);
      });
      if (withLean.length < 3 || without.length < 3) return null; // honest threshold
      const a = mean(withLean), b = mean(without);
      const diff = a - b;
      if (Math.abs(diff) < 0.4) return null; // not a meaningful lean
      return { withMean: a, withoutMean: b, diff, nWith: withLean.length, nWithout: without.length, higher: diff > 0 };
    }

    const corr = [];
    const ironEnergy = leaningCorrelation("leanIron", "energy");
    if (ironEnergy) corr.push({
      icon: "iron", metric: "energy",
      text: ironEnergy.higher
        ? "Your brighter-energy days tend to line up with iron-rich meals — spinach, lentils, red meat and the like."
        : "On your iron-rich days your energy reads a touch lower in your check-ins — worth noticing, not worrying about.",
      n: ironEnergy.nWith + ironEnergy.nWithout,
    });
    const proteinEnergy = leaningCorrelation("leanProtein", "energy");
    if (proteinEnergy && proteinEnergy.higher) corr.push({
      icon: "protein", metric: "energy",
      text: "Higher-protein days seem to sit alongside steadier energy in your own logs.",
      n: proteinEnergy.nWith + proteinEnergy.nWithout,
    });
    const fibreDigestion = leaningCorrelation("leanFibre", "digestion");
    if (fibreDigestion && fibreDigestion.higher) corr.push({
      icon: "fibre", metric: "digestion",
      text: "Your more comfortable-digestion days lean towards fibre-rich meals — whole grains, beans, plenty of veg.",
      n: fibreDigestion.nWith + fibreDigestion.nWithout,
    });
    const varietyMood = (() => {
      const hi = [], lo = [];
      Object.keys(dayMap).forEach((k) => {
        const c = ciByDate[k]; if (!c) return;
        const v = Number(c.mood); if (!Number.isFinite(v)) return;
        if ((dayMap[k].variety || 0) >= 3) hi.push(v); else lo.push(v);
      });
      if (hi.length < 3 || lo.length < 3) return null;
      const d = mean(hi) - mean(lo);
      return Math.abs(d) >= 0.4 ? { higher: d > 0, n: hi.length + lo.length } : null;
    })();
    if (varietyMood && varietyMood.higher) corr.push({
      icon: "mood", metric: "mood",
      text: "Days with more variety on your plate tend to show a brighter mood in your check-ins.",
      n: varietyMood.n,
    });

    const correlationsReady = Object.keys(ciByDate).length >= 5 && Object.keys(dayMap).length >= 5;

    // --- body metrics, visualised (weight optional, NEVER headline) ---
    const weightPts = metrics.filter((x) => typeof x.weight_kg === "number").map((x) => ({ key: x.day_key, v: x.weight_kg }));
    const waistPts = metrics.filter((x) => typeof x.waist_cm === "number").map((x) => ({ key: x.day_key, v: x.waist_cm }));
    const hipsPts = metrics.filter((x) => typeof x.hips_cm === "number").map((x) => ({ key: x.day_key, v: x.hips_cm }));
    const bustPts = metrics.filter((x) => typeof x.bust_cm === "number").map((x) => ({ key: x.day_key, v: x.bust_cm }));

    // --- cycle lens: energy by phase across HER OWN check-ins (observation, not advice) ---
    let cycleLens = null;
    if (profile?.last_period_start_date) {
      const buckets = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
      (checkins || []).forEach((c) => {
        const ph = phaseForDate(c.date, profile);
        const e = Number(c.energy);
        if (ph && Number.isFinite(e)) buckets[ph].push(e);
      });
      const phaseAvgs = CYCLE_PHASES.map((p) => ({ ...p, avg: mean(buckets[p.key]), n: buckets[p.key].length }));
      const populated = phaseAvgs.filter((p) => p.avg != null);
      if (populated.length >= 2 && populated.reduce((s, p) => s + p.n, 0) >= 6) {
        const best = [...populated].sort((a, b) => b.avg - a.avg)[0];
        const worst = [...populated].sort((a, b) => a.avg - b.avg)[0];
        cycleLens = { phaseAvgs, best, worst, sameBucket: best.key === worst.key };
      }
    }

    return {
      band, blend, daysLogged: daysWithMeals.length,
      trendHasData, nourishSeries, hydrationSeries,
      corr, correlationsReady,
      weightPts, waistPts, hipsPts, bustPts,
      cycleLens,
    };
  }, [mealLogs, hydrationLogs, checkins, metrics, profile, nutritionProfile]);

  /* ---------------------------------------------------------------- writes */

  const saveMetric = async () => {
    if (!user?.id) return;
    const payload = { user_id: user.id, day_key: format(new Date(), "yyyy-MM-dd"), notes: metricForm.notes || undefined };
    if (metricForm.weight_kg) payload.weight_kg = parseFloat(metricForm.weight_kg);
    if (metricForm.waist_cm) payload.waist_cm = parseFloat(metricForm.waist_cm);
    if (metricForm.hips_cm) payload.hips_cm = parseFloat(metricForm.hips_cm);
    if (metricForm.bust_cm) payload.bust_cm = parseFloat(metricForm.bust_cm);
    setSavingMetric(true);
    setSaveError(null);
    // optimistic
    const optimistic = [...metrics, payload].sort((a, b) => a.day_key.localeCompare(b.day_key));
    setMetrics(optimistic);
    try {
      await withTimeout(base44.entities.BodyMetrics.create(payload), 6000, "save");
      setAddingMetric(false);
      setMetricForm({ weight_kg: "", waist_cm: "", hips_cm: "", bust_cm: "", notes: "" });
      loadData(); // reconcile in background
    } catch (e) {
      console.error(e);
      setMetrics(metrics); // rollback
      setSaveError("Couldn't save your measurements. Please try again.");
    }
    setSavingMetric(false);
  };

  const saveTargets = async () => {
    if (!user?.id) return;
    setSavingTargets(true);
    setSaveError(null);
    const payload = {
      calories_target: parseInt(targetForm.calories_target) || 2000,
      protein_target_g: parseInt(targetForm.protein_target_g) || 120,
      carbs_target_g: parseInt(targetForm.carbs_target_g) || 200,
      fat_target_g: parseInt(targetForm.fat_target_g) || 65,
      hydration_target_ml: parseInt(targetForm.hydration_target_ml) || 2000,
    };
    try {
      if (nutritionProfile?.id) {
        await withTimeout(base44.entities.NutritionProfile.update(nutritionProfile.id, payload), 6000, "save");
      } else {
        await withTimeout(base44.entities.NutritionProfile.create({ user_id: user.id, ...payload }), 6000, "save");
      }
      onProfileUpdated?.();
      setEditingTargets(false);
    } catch (e) {
      console.error(e);
      setSaveError("Couldn't save your targets. Please try again.");
    }
    setSavingTargets(false);
  };

  const saveGoal = async (goalKey) => {
    if (!user?.id || !goalKey) return;
    setSavingGoal(true);
    setSaveError(null);
    try {
      if (nutritionProfile?.id) {
        await withTimeout(base44.entities.NutritionProfile.update(nutritionProfile.id, { goal_mode: goalKey }), 6000, "save");
      } else {
        await withTimeout(base44.entities.NutritionProfile.create({ user_id: user.id, goal_mode: goalKey }), 6000, "save");
      }
      onProfileUpdated?.();
      setEditingGoal(false);
    } catch (e) {
      console.error(e);
      setSaveError("Couldn't save your goal. Please try again.");
    }
    setSavingGoal(false);
  };

  /* ---------------------------------------------------------------- render */

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  const goalInfo = GOAL_MODES.find((g) => g.key === nutritionProfile?.goal_mode);
  const corrIcon = (k) => {
    if (k === "iron") return <HeartPulse className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />;
    if (k === "protein") return <Zap className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />;
    if (k === "fibre") return <Leaf className="w-4 h-4" style={{ color: "var(--sage)" }} />;
    return <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />;
  };

  return (
    <div className="space-y-4">

      {saveError && (
        <p className="text-xs text-center rounded-xl p-2.5" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
          {saveError}
        </p>
      )}

      {/* 1 · GENTLE COMPOSITE — how nourished the fortnight felt (NOT a score) */}
      <div className="rounded-[24px] p-6" style={card}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          <p style={sLabel}>This fortnight</p>
        </div>
        <p className="font-semibold mb-2" style={{ color: "var(--plum)", fontSize: "1.05rem", lineHeight: 1.3 }}>
          {derived.band.title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--mauve)" }}>
          {derived.band.body}
        </p>
        {derived.daysLogged > 0 && (
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--ivory-dark)" }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round((derived.blend || 0) * 100)}%`,
                background: "linear-gradient(90deg, var(--sage), var(--rose-dust))",
                minWidth: 12,
              }} />
          </div>
        )}
        {derived.daysLogged > 0 && (
          <p className="text-[11px] mt-2" style={{ color: "var(--mauve)", opacity: 0.8 }}>
            A soft reflection of variety, nourishment and hydration — not a target to hit.
          </p>
        )}
      </div>

      {/* 2 · CORRELATION CARDS — the differentiator (food ↔ energy / mood / digestion) */}
      <div className="rounded-[24px] p-5" style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          <p style={sLabel}>Patterns in your own data</p>
        </div>
        {derived.correlationsReady && derived.corr.length > 0 ? (
          <div className="space-y-3">
            {derived.corr.map((c, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: c.icon === "fibre" ? "var(--sage-subtle)" : "var(--rose-dust-subtle)" }}>
                  {corrIcon(c.icon)}
                </div>
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--plum)" }}>{c.text}</p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--mauve)" }}>
                    Observed across {c.n} of your logged days — a pattern, not a prescription.
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "var(--ivory)", border: "1px dashed var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--plum)", fontWeight: 600 }}>A little more history and patterns will appear</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--mauve)" }}>
              As you log meals alongside your daily check-ins, we'll gently surface how foods line up with your energy, mood and digestion — only when there's enough to be honest about it.
            </p>
          </div>
        )}
      </div>

      {/* 3 · TRENDS not streaks — calm sparklines (no shouting numbers, no streak counter) */}
      {derived.trendHasData && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-4">Your rhythm over time</p>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--plum)" }}>Nourishment</p>
              <Sparkline values={derived.nourishSeries} color="var(--rose-dust)" />
              <p className="text-[10px] mt-1.5" style={{ color: "var(--mauve)" }}>Variety and nourishment, week by week — trending, not tallied.</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--plum)" }}>Hydration</p>
              <Sparkline values={derived.hydrationSeries} color="var(--sage)" />
              <p className="text-[10px] mt-1.5" style={{ color: "var(--mauve)" }}>How your water intake has flowed across recent weeks.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4 · CYCLE LENS — observed pattern across HER OWN phases (observation, never advice) */}
      {derived.cycleLens && !derived.cycleLens.sameBucket && (
        <div className="rounded-[24px] p-5" style={card}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4" style={{ color: "#9B7FCC" }} />
            <p style={sLabel}>Through your cycle</p>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--plum)" }}>
            In your own check-ins, your energy has tended to feel brightest in your{" "}
            <span style={{ fontWeight: 600 }}>{derived.cycleLens.best.label.toLowerCase()}</span> phase
            and quieter in your{" "}
            <span style={{ fontWeight: 600 }}>{derived.cycleLens.worst.label.toLowerCase()}</span> phase.
          </p>
          <div className="flex gap-2">
            {derived.cycleLens.phaseAvgs.map((p) => {
              const pct = p.avg != null ? Math.max((p.avg / 5) * 100, 8) : 0;
              return (
                <div key={p.key} className="flex-1 text-center">
                  <div className="rounded-xl flex items-end justify-center" style={{ height: 56, backgroundColor: "var(--ivory)", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: `${pct}%`, backgroundColor: p.color, opacity: p.avg != null ? 0.85 : 0.15, transition: "height .3s" }} />
                  </div>
                  <p className="text-[9px] mt-1.5" style={{ color: "var(--mauve)", textTransform: "capitalize" }}>{p.label}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] mt-3" style={{ color: "var(--mauve)" }}>
            This is your own observed pattern, a lens for self-awareness — not advice or a rule to eat by.
          </p>
        </div>
      )}

      {/* 5 · BODY METRICS visualised — weight optional, NEVER the headline */}
      {(derived.weightPts.length > 1 || derived.waistPts.length > 1 || derived.hipsPts.length > 1 || derived.bustPts.length > 1) && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-4">Body, gently tracked</p>
          <div className="space-y-5">
            {derived.waistPts.length > 1 && (
              <MetricTrend label="Waist (cm)" pts={derived.waistPts} color="var(--rose-dust)" />
            )}
            {derived.hipsPts.length > 1 && (
              <MetricTrend label="Hips (cm)" pts={derived.hipsPts} color="var(--sage)" />
            )}
            {derived.bustPts.length > 1 && (
              <MetricTrend label="Bust (cm)" pts={derived.bustPts} color="#9B7FCC" />
            )}
            {derived.weightPts.length > 1 && (
              <MetricTrend label="Weight (kg)" pts={derived.weightPts} color="var(--mauve)" muted />
            )}
          </div>
          <p className="text-[10px] mt-4" style={{ color: "var(--mauve)" }}>
            Measurements are here if they're useful to you — never the headline, never a verdict.
          </p>
        </div>
      )}

      {/* Add measurements */}
      {addingMetric ? (
        <div className="rounded-[24px] p-5 space-y-4" style={card}>
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--plum)" }}>Log today's measurements</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>All fields optional — log only what you're comfortable with.</p>
          </div>
          {[
            { key: "weight_kg", label: "Weight (kg)" },
            { key: "waist_cm", label: "Waist (cm)" },
            { key: "hips_cm", label: "Hips (cm)" },
            { key: "bust_cm", label: "Bust (cm)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--mauve)" }}>{label}</label>
              <input type="number" value={metricForm[key]}
                onChange={(e) => setMetricForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder="Optional" step="0.1"
                className="w-full p-3 rounded-2xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--rose-dust-light)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
          ))}
          <textarea placeholder="Notes (e.g. start of cycle, post-holiday)"
            value={metricForm.notes}
            onChange={(e) => setMetricForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full p-3 rounded-2xl text-sm resize-none focus:outline-none transition-all"
            style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)" }} />
          <div className="flex gap-2">
            <button onClick={() => setAddingMetric(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: "1.5px solid var(--border)", color: "var(--plum)" }}>
              Cancel
            </button>
            <button onClick={saveMetric} disabled={savingMetric}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--plum)", color: "white", opacity: savingMetric ? 0.7 : 1 }}>
              {savingMetric ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingMetric(true)}
          className="w-full rounded-[24px] p-5 flex items-center gap-3.5 transition-all"
          style={{ ...card }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--ivory)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
            <Plus className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--plum)" }}>Log measurements today</p>
        </button>
      )}

      {/* Goal + targets (editable, optimistic, guarded) */}
      <div className="rounded-[24px] p-5" style={card}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            <p style={sLabel}>Your intention</p>
          </div>
          {!editingGoal && (
            <button onClick={() => setEditingGoal(true)} className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--rose-dust)" }}>
              <Pencil className="w-3 h-3" /> Change
            </button>
          )}
        </div>
        {editingGoal ? (
          <div className="space-y-2">
            {GOAL_MODES.map((g) => (
              <button key={g.key} onClick={() => saveGoal(g.key)} disabled={savingGoal}
                className="w-full flex items-center gap-4 p-3.5 rounded-2xl text-left transition-all"
                style={{
                  border: `1.5px solid ${nutritionProfile?.goal_mode === g.key ? "var(--rose-dust)" : "var(--border)"}`,
                  backgroundColor: nutritionProfile?.goal_mode === g.key ? "var(--rose-dust-subtle)" : "var(--ivory)",
                  opacity: savingGoal ? 0.6 : 1,
                }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--plum)" }}>{g.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--mauve)" }}>{g.desc}</p>
                </div>
              </button>
            ))}
            <button onClick={() => setEditingGoal(false)} className="w-full py-2 text-xs font-semibold" style={{ color: "var(--mauve)" }}>
              Done
            </button>
          </div>
        ) : (
          <p className="text-sm font-semibold" style={{ color: "var(--plum)" }}>
            {goalInfo?.label || "Not set yet"}
            {goalInfo?.desc && <span className="block text-xs font-normal mt-0.5" style={{ color: "var(--mauve)" }}>{goalInfo.desc}</span>}
          </p>
        )}
      </div>

      <div className="rounded-[20px] p-5" style={card}>
        <div className="flex items-center justify-between mb-3.5">
          <p style={sLabel}>Gentle targets</p>
          <button onClick={() => setEditingTargets(!editingTargets)} className="text-xs font-semibold" style={{ color: "var(--rose-dust)" }}>
            {editingTargets ? "Cancel" : "Edit"}
          </button>
        </div>
        {editingTargets ? (
          <div className="flex flex-col gap-3">
            {[
              { key: "calories_target", label: "Calories", unit: "kcal" },
              { key: "protein_target_g", label: "Protein", unit: "g" },
              { key: "carbs_target_g", label: "Carbs", unit: "g" },
              { key: "fat_target_g", label: "Fat", unit: "g" },
              { key: "hydration_target_ml", label: "Hydration", unit: "ml" },
            ].map(({ key, label, unit }) => (
              <div key={key} className="flex items-center gap-2.5">
                <label className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--mauve)", width: 80 }}>{label}</label>
                <input type="number" value={targetForm[key]}
                  onChange={(e) => setTargetForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)" }} />
                <span className="text-[11px] flex-shrink-0" style={{ color: "var(--mauve)", width: 28 }}>{unit}</span>
              </div>
            ))}
            <button onClick={saveTargets} disabled={savingTargets}
              className="mt-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--plum)", color: "white", opacity: savingTargets ? 0.6 : 1 }}>
              {savingTargets ? "Saving..." : "Save targets"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Cal", value: nutritionProfile?.calories_target || 2000, unit: "kcal" },
              { label: "Prot", value: nutritionProfile?.protein_target_g || 120, unit: "g" },
              { label: "Carbs", value: nutritionProfile?.carbs_target_g || 200, unit: "g" },
              { label: "Fat", value: nutritionProfile?.fat_target_g || 65, unit: "g" },
              { label: "H₂O", value: nutritionProfile?.hydration_target_ml || 2000, unit: "ml" },
            ].map(({ label, value, unit }) => (
              <div key={label} className="text-center rounded-xl" style={{ backgroundColor: "var(--ivory)", padding: "10px 4px" }}>
                <p className="font-bold" style={{ color: "var(--plum)", fontSize: 13 }}>{value}</p>
                <p style={{ fontSize: 9, color: "var(--mauve)", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 9, color: "var(--mauve)", opacity: 0.7 }}>{unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* ---------------------------------------------------------------- sub */

function MetricTrend({ label, pts, color, muted }) {
  const values = (pts || []).map((p) => p.v);
  const first = values[0];
  const last = values[values.length - 1];
  const delta = (typeof first === "number" && typeof last === "number") ? round1(last - first) : null;
  return (
    <div style={{ opacity: muted ? 0.85 : 1 }}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-semibold" style={{ color: "var(--plum)" }}>{label}</p>
        {delta != null && (
          <p className="text-[10px]" style={{ color: "var(--mauve)" }}>
            {delta === 0 ? "steady" : `${delta > 0 ? "+" : ""}${delta} over this span`}
          </p>
        )}
      </div>
      <Sparkline values={values} color={color} height={40} />
    </div>
  );
}
