import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, Plus, Flame, Droplets } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";

const GOAL_MODES = [
  { key: "fat_loss",         label: "Fat Loss",              desc: "Steady, sustainable progress" },
  { key: "tone",             label: "Tone & Strength",       desc: "Build lean muscle, feel strong" },
  { key: "energy",           label: "Energy",                desc: "Fuel your day naturally" },
  { key: "hormone_support",  label: "Hormone Support",       desc: "Nourish your cycle" },
  { key: "postpartum",       label: "Postpartum Recovery",   desc: "Gentle recovery and nourishment" },
  { key: "menopause",        label: "Menopause Support",     desc: "Balance through transition" },
];

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function NutritionProgressTab({ user, nutritionProfile, onProfileUpdated }) {
  const [metrics, setMetrics]         = useState([]);
  const [mealLogs, setMealLogs]       = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [addingMetric, setAddingMetric] = useState(false);
  const [metricForm, setMetricForm]   = useState({ weight_kg: "", waist_cm: "", hips_cm: "", bust_cm: "", notes: "" });
  const [savingMetric, setSavingMetric] = useState(false);
  const [savingGoal, setSavingGoal]   = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(nutritionProfile?.goal_mode || "");
  const [showGoalPicker, setShowGoalPicker] = useState(!nutritionProfile?.goal_mode);
  const [editingTargets, setEditingTargets] = useState(false);
  const [targetForm, setTargetForm] = useState({
    calories_target: nutritionProfile?.calories_target || 2000,
    protein_target_g: nutritionProfile?.protein_target_g || 120,
    carbs_target_g: nutritionProfile?.carbs_target_g || 200,
    fat_target_g: nutritionProfile?.fat_target_g || 65,
    hydration_target_ml: nutritionProfile?.hydration_target_ml || 2000,
  });
  const [savingTargets, setSavingTargets] = useState(false);

  useEffect(() => { loadData(); }, []);

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

  const saveTargets = async () => {
    setSavingTargets(true);
    const payload = {
      calories_target: parseInt(targetForm.calories_target) || 2000,
      protein_target_g: parseInt(targetForm.protein_target_g) || 120,
      carbs_target_g: parseInt(targetForm.carbs_target_g) || 200,
      fat_target_g: parseInt(targetForm.fat_target_g) || 65,
      hydration_target_ml: parseInt(targetForm.hydration_target_ml) || 2000,
    };
    if (nutritionProfile?.id) {
      await base44.entities.NutritionProfile.update(nutritionProfile.id, payload);
    } else {
      await base44.entities.NutritionProfile.create({ user_id: user.id, ...payload });
    }
    onProfileUpdated?.();
    setEditingTargets(false);
    setSavingTargets(false);
  };

  const saveMetric = async () => {
    const payload = { user_id: user.id, day_key: format(new Date(), "yyyy-MM-dd"), notes: metricForm.notes || undefined };
    if (metricForm.weight_kg) payload.weight_kg = parseFloat(metricForm.weight_kg);
    if (metricForm.waist_cm)  payload.waist_cm  = parseFloat(metricForm.waist_cm);
    if (metricForm.hips_cm)   payload.hips_cm   = parseFloat(metricForm.hips_cm);
    if (metricForm.bust_cm)   payload.bust_cm   = parseFloat(metricForm.bust_cm);
    setSavingMetric(true);
    await base44.entities.BodyMetrics.create(payload);
    await loadData();
    setAddingMetric(false);
    setMetricForm({ weight_kg: "", waist_cm: "", hips_cm: "", bust_cm: "", notes: "" });
    setSavingMetric(false);
  };

  const dayKeysWithMeals = [...new Set(mealLogs.map((m) => m.day_key))];
  const hydrationTarget  = 2000;
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

  const mealStreak      = calcStreak(dayKeysWithMeals);
  const hydrationStreak = calcStreak(dayKeysWithHydration);
  const weightData      = metrics.filter(m => m.weight_kg).map(m => ({ date: format(parseISO(m.day_key), "MMM d"), weight: m.weight_kg }));
  const waistData       = metrics.filter(m => m.waist_cm).map(m => ({ date: format(parseISO(m.day_key), "MMM d"), waist: m.waist_cm, hips: m.hips_cm }));
  const goalInfo        = GOAL_MODES.find((g) => g.key === (nutritionProfile?.goal_mode || selectedGoal));

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Goal card */}
      {showGoalPicker ? (
        <div className="rounded-[24px] p-5" style={card}>
          <p className="font-semibold mb-1" style={{ color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>What's your goal?</p>
          <p className="text-xs mb-5" style={{ color: "var(--mauve)" }}>Choose what feels right for you right now. You can change this any time.</p>
          <div className="space-y-2 mb-5">
            {GOAL_MODES.map((g) => (
              <button key={g.key} onClick={() => setSelectedGoal(g.key)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  border: `1.5px solid ${selectedGoal === g.key ? "var(--rose-dust)" : "var(--border)"}`,
                  backgroundColor: selectedGoal === g.key ? "var(--rose-dust-subtle)" : "var(--ivory)",
                }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{g.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--mauve)" }}>{g.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={saveGoal} disabled={!selectedGoal || savingGoal}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "var(--plum)", color: "white", opacity: (!selectedGoal || savingGoal) ? 0.5 : 1 }}>
            {savingGoal ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Set Goal"}
          </button>
        </div>
      ) : (
        <div className="rounded-[24px] p-5 flex items-center gap-4" style={card}>
          <div className="flex-1">
            <p style={sLabel} className="mb-0.5">Current Goal</p>
            <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {goalInfo?.label || "Not set"}
            </p>
            {goalInfo?.desc && <p className="text-xs mt-0.5" style={{ color: "var(--mauve)" }}>{goalInfo.desc}</p>}
          </div>
          <button onClick={() => setShowGoalPicker(true)}
            className="text-xs font-semibold transition-colors"
            style={{ color: "var(--rose-dust)" }}>
            Change
          </button>
        </div>
      )}

      {/* Daily targets */}
      <div className="rounded-[20px] p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={sLabel}>Daily targets</p>
          <button
            onClick={() => setEditingTargets(!editingTargets)}
            style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", background: "none", border: "none", cursor: "pointer" }}
          >
            {editingTargets ? "Cancel" : "Edit"}
          </button>
        </div>
        {editingTargets ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "calories_target",     label: "Calories",   unit: "kcal" },
              { key: "protein_target_g",    label: "Protein",    unit: "g" },
              { key: "carbs_target_g",      label: "Carbs",      unit: "g" },
              { key: "fat_target_g",        label: "Fat",        unit: "g" },
              { key: "hydration_target_ml", label: "Hydration",  unit: "ml" },
            ].map(({ key, label, unit }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", width: 80, flexShrink: 0 }}>{label}</label>
                <input
                  type="number"
                  value={targetForm[key]}
                  onChange={(e) => setTargetForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
                <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", width: 28, flexShrink: 0 }}>{unit}</span>
              </div>
            ))}
            <button
              onClick={saveTargets}
              disabled={savingTargets}
              style={{ marginTop: 4, padding: "10px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer", opacity: savingTargets ? 0.6 : 1 }}
            >
              {savingTargets ? "Saving..." : "Save targets"}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {[
              { label: "Cal",  value: nutritionProfile?.calories_target || 2000,     unit: "kcal" },
              { label: "Prot", value: nutritionProfile?.protein_target_g || 120,      unit: "g" },
              { label: "Carbs",value: nutritionProfile?.carbs_target_g || 200,        unit: "g" },
              { label: "Fat",  value: nutritionProfile?.fat_target_g || 65,           unit: "g" },
              { label: "H\u2082O",  value: nutritionProfile?.hydration_target_ml || 2000, unit: "ml" },
            ].map(({ label, value, unit }) => (
              <div key={label} style={{ textAlign: "center", backgroundColor: "var(--ivory)", borderRadius: 12, padding: "10px 4px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>{value}</p>
                <p style={{ fontSize: 9, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 9, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", opacity: 0.7 }}>{unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habit streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[24px] p-5 text-center" style={card}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
            <Flame className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--rose-dust)", fontFamily: "'Fraunces', serif" }}>{mealStreak}</p>
          <p className="text-xs mt-1" style={{ color: "var(--mauve)" }}>Days logging meals</p>
        </div>
        <div className="rounded-[24px] p-5 text-center" style={card}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "var(--sage-subtle)" }}>
            <Droplets className="w-4 h-4" style={{ color: "var(--sage)" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "var(--sage)", fontFamily: "'Fraunces', serif" }}>{hydrationStreak}</p>
          <p className="text-xs mt-1" style={{ color: "var(--mauve)" }}>Days hitting water goal</p>
        </div>
      </div>

      {/* Weight chart */}
      {weightData.length > 1 && (
        <div className="rounded-[24px] p-5" style={card}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            <p style={sLabel}>Body Trend</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--mauve)" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--mauve)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontFamily: "'Inter', sans-serif", fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="var(--rose-dust)" strokeWidth={2} dot={{ r: 3, fill: "var(--rose-dust)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Measurements chart */}
      {waistData.length > 1 && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-4">Measurements Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={waistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--mauve)" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--mauve)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontFamily: "'Inter', sans-serif", fontSize: 12 }} />
              <Line type="monotone" dataKey="waist" stroke="var(--rose-dust)" strokeWidth={2} dot={{ r: 3 }} name="Waist (cm)" />
              <Line type="monotone" dataKey="hips"  stroke="var(--sage)"      strokeWidth={2} dot={{ r: 3 }} name="Hips (cm)"  />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log measurements */}
      {addingMetric ? (
        <div className="rounded-[24px] p-5 space-y-4" style={card}>
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Log today's measurements</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>All fields optional — log only what you're comfortable with.</p>
          </div>
          {[
            { key: "weight_kg", label: "Weight (kg)" },
            { key: "waist_cm",  label: "Waist (cm)"  },
            { key: "hips_cm",   label: "Hips (cm)"   },
            { key: "bust_cm",   label: "Bust (cm)"   },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{label}</label>
              <input type="number" value={metricForm[key]}
                onChange={(e) => setMetricForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder="Optional" step="0.1"
                className="w-full p-3 rounded-2xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
          ))}
          <textarea placeholder="Notes (e.g. start of cycle, post-holiday)"
            value={metricForm.notes}
            onChange={(e) => setMetricForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full p-3 rounded-2xl text-sm resize-none focus:outline-none transition-all"
            style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }} />
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
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--surface)"}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
            <Plus className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
            Log measurements today
          </p>
        </button>
      )}
    </div>
  );
}