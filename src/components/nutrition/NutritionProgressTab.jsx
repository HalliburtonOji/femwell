import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, Target, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";

const GOAL_MODES = [
  { key: "fat_loss", label: "Fat Loss", emoji: "🔥", desc: "Steady, sustainable progress" },
  { key: "tone", label: "Tone & Strength", emoji: "💪", desc: "Build lean muscle, feel strong" },
  { key: "energy", label: "Energy", emoji: "⚡", desc: "Fuel your day naturally" },
  { key: "hormone_support", label: "Hormone Support", emoji: "🌸", desc: "Nourish your cycle" },
  { key: "postpartum", label: "Postpartum Recovery", emoji: "🤱", desc: "Gentle recovery & nourishment" },
  { key: "menopause", label: "Menopause Support", emoji: "🧡", desc: "Balance through transition" },
];

export default function NutritionProgressTab({ user, nutritionProfile, onProfileUpdated }) {
  const [metrics, setMetrics] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMetric, setAddingMetric] = useState(false);
  const [metricForm, setMetricForm] = useState({ weight_kg: "", waist_cm: "", hips_cm: "", bust_cm: "", notes: "" });
  const [savingMetric, setSavingMetric] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(nutritionProfile?.goal_mode || "");
  const [showGoalPicker, setShowGoalPicker] = useState(!nutritionProfile?.goal_mode);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
    const [m, ml, hl] = await Promise.all([
      base44.entities.BodyMetrics.filter({ user_id: user.id }),
      base44.entities.MealLog.filter({ user_id: user.id }),
      base44.entities.HydrationLog.filter({ user_id: user.id }),
    ]);
    setMetrics(m.filter((x) => x.day_key >= since).sort((a, b) => a.day_key.localeCompare(b.day_key)));
    setMealLogs(ml.filter((x) => x.day_key >= since));
    setHydrationLogs(hl.filter((x) => x.day_key >= since));
    setLoading(false);
  };

  const saveGoal = async () => {
    if (!selectedGoal) return;
    setSavingGoal(true);
    if (nutritionProfile?.id) {
      await base44.entities.NutritionProfile.update(nutritionProfile.id, { goal_mode: selectedGoal });
    } else {
      await base44.entities.NutritionProfile.create({ user_id: user.id, goal_mode: selectedGoal });
    }
    onProfileUpdated?.();
    setShowGoalPicker(false);
    setSavingGoal(false);
  };

  const saveMetric = async () => {
    const payload = {
      user_id: user.id,
      day_key: format(new Date(), "yyyy-MM-dd"),
      notes: metricForm.notes || undefined,
    };
    if (metricForm.weight_kg) payload.weight_kg = parseFloat(metricForm.weight_kg);
    if (metricForm.waist_cm) payload.waist_cm = parseFloat(metricForm.waist_cm);
    if (metricForm.hips_cm) payload.hips_cm = parseFloat(metricForm.hips_cm);
    if (metricForm.bust_cm) payload.bust_cm = parseFloat(metricForm.bust_cm);
    setSavingMetric(true);
    await base44.entities.BodyMetrics.create(payload);
    await loadData();
    setAddingMetric(false);
    setMetricForm({ weight_kg: "", waist_cm: "", hips_cm: "", bust_cm: "", notes: "" });
    setSavingMetric(false);
  };

  // Streak calculations
  const dayKeysWithMeals = [...new Set(mealLogs.map((m) => m.day_key))];
  const hydrationTarget = 2000;
  const dayKeysWithHydration = [...new Set(
    hydrationLogs.reduce((acc, l) => {
      const existing = acc.find((a) => a.day_key === l.day_key);
      if (existing) existing.total += l.amount_ml;
      else acc.push({ day_key: l.day_key, total: l.amount_ml });
      return acc;
    }, []).filter((d) => d.total >= hydrationTarget).map((d) => d.day_key)
  )];

  const calcStreak = (dayKeys) => {
    let count = 0;
    const check = new Date();
    while (count < 365) {
      const key = format(check, "yyyy-MM-dd");
      if (!dayKeys.includes(key)) break;
      count++;
      check.setDate(check.getDate() - 1);
    }
    return count;
  };

  const mealStreak = calcStreak(dayKeysWithMeals);
  const hydrationStreak = calcStreak(dayKeysWithHydration);

  const weightData = metrics.filter((m) => m.weight_kg).map((m) => ({ date: format(parseISO(m.day_key), "MMM d"), weight: m.weight_kg }));
  const waistData = metrics.filter((m) => m.waist_cm).map((m) => ({ date: format(parseISO(m.day_key), "MMM d"), waist: m.waist_cm, hips: m.hips_cm }));

  const goalInfo = GOAL_MODES.find((g) => g.key === (nutritionProfile?.goal_mode || selectedGoal));

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Goal card */}
      {showGoalPicker ? (
        <div className="card-glass rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-1">What's your goal?</p>
          <p className="text-xs text-gray-400 mb-4">Choose what feels right for you right now.</p>
          <div className="space-y-2 mb-4">
            {GOAL_MODES.map((g) => (
              <button key={g.key} onClick={() => setSelectedGoal(g.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedGoal === g.key ? "bg-rose-50 border-2 border-rose-300" : "bg-white/60 border border-gray-100"}`}>
                <span className="text-xl">{g.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{g.label}</p>
                  <p className="text-xs text-gray-500">{g.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={saveGoal} disabled={!selectedGoal || savingGoal} className="btn-primary w-full py-3 text-sm">
            {savingGoal ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Set Goal"}
          </button>
        </div>
      ) : (
        <div className="card-glass rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">{goalInfo?.emoji || "🎯"}</span>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Current goal</p>
            <p className="text-sm font-bold text-gray-800">{goalInfo?.label || "Not set"}</p>
          </div>
          <button onClick={() => setShowGoalPicker(true)} className="text-xs text-rose-400 font-medium">Change</button>
        </div>
      )}

      {/* Habit streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-rose-500">{mealStreak}</p>
          <p className="text-xs text-gray-500 mt-1">Days logging meals</p>
          <p className="text-base mt-1">🍽️</p>
        </div>
        <div className="card-glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-blue-500">{hydrationStreak}</p>
          <p className="text-xs text-gray-500 mt-1">Days hitting water goal</p>
          <p className="text-base mt-1">💧</p>
        </div>
      </div>

      {/* Body metrics chart */}
      {weightData.length > 1 && (
        <div className="card-glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <p className="text-sm font-bold text-gray-800">Weight trend</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #fce7f3" }} />
              <Line type="monotone" dataKey="weight" stroke="#e07a8a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {waistData.length > 1 && (
        <div className="card-glass rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-4">Measurements trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={waistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #fce7f3" }} />
              <Line type="monotone" dataKey="waist" stroke="#c97b8a" strokeWidth={2} dot={{ r: 3 }} name="Waist (cm)" />
              <Line type="monotone" dataKey="hips" stroke="#8fada0" strokeWidth={2} dot={{ r: 3 }} name="Hips (cm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log body metric */}
      {addingMetric ? (
        <div className="card-glass rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">Log today's measurements</p>
          <p className="text-xs text-gray-400">All fields optional — log only what you're comfortable with.</p>
          {[
            { key: "weight_kg", label: "Weight (kg)" },
            { key: "waist_cm", label: "Waist (cm)" },
            { key: "hips_cm", label: "Hips (cm)" },
            { key: "bust_cm", label: "Bust (cm)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input type="number" value={metricForm[key]} onChange={(e) => setMetricForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder="Optional" step="0.1"
                className="w-full p-2.5 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
          ))}
          <textarea placeholder="Notes (e.g. start of cycle, post-holiday)" value={metricForm.notes}
            onChange={(e) => setMetricForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full p-2.5 rounded-xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <div className="flex gap-2">
            <button onClick={() => setAddingMetric(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button onClick={saveMetric} disabled={savingMetric} className="btn-primary flex-1 py-2.5 text-sm">
              {savingMetric ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingMetric(true)}
          className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
            <Plus className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">Log measurements today</p>
        </button>
      )}
    </div>
  );
}