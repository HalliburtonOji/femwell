import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, X } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_EMOJIS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

const SUGGESTED_MEALS = {
  breakfast: ["Greek yoghurt + berries + granola", "Oats with banana + nut butter", "Scrambled eggs + wholegrain toast", "Smoothie + seeds + protein"],
  lunch: ["Chicken wrap + salad", "Lentil soup + bread", "Salmon + quinoa + veg", "Prawn stir-fry + rice"],
  dinner: ["Grilled salmon + roasted veg", "Chicken + sweet potato + greens", "Pasta + tomato + turkey mince", "Tofu stir-fry + brown rice"],
  snack: ["Apple + almond butter", "Rice cakes + hummus", "Mixed nuts + dark chocolate", "Boiled eggs + fruit"],
};

const WELLNESS_GOALS = [
  { id: "energy", label: "Boost Energy", emoji: "⚡" },
  { id: "digestion", label: "Improve Digestion", emoji: "🌿" },
  { id: "sleep", label: "Better Sleep", emoji: "💤" },
  { id: "mood", label: "Mood Support", emoji: "😊" },
  { id: "hydration", label: "Stay Hydrated", emoji: "💧" },
  { id: "hormone", label: "Hormone Balance", emoji: "🌸" },
];

export default function NutritionPlanTab({ user, nutritionProfile }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [addingSlot, setAddingSlot] = useState(null); // { dayIndex, mealType }
  const [mealInput, setMealInput] = useState("");
  const [templates, setTemplates] = useState([]);
  const [planGoal, setPlanGoal] = useState(null);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekKey = format(weekStart, "yyyy-MM-dd");

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    const [plans, tmpl] = await Promise.all([
      base44.entities.MealPlans.filter({ user_id: user.id, week_start: weekKey }),
      base44.entities.MealTemplates.filter({ user_id: user.id }),
    ]);
    setTemplates(tmpl);
    if (plans[0]) {
      setPlan(plans[0]);
      if (plans[0].wellness_goal) setPlanGoal(plans[0].wellness_goal);
    } else {
      const newPlan = await base44.entities.MealPlans.create({
        user_id: user.id,
        week_start: weekKey,
        plan_json: JSON.stringify({}),
        shopping_list_json: JSON.stringify([]),
        is_active: true,
      });
      setPlan(newPlan);
    }
    setLoading(false);
  };

  const getPlanData = () => {
    try { return JSON.parse(plan?.plan_json || "{}"); } catch { return {}; }
  };

  const addMealToSlot = async (dayIndex, mealType, text) => {
    if (!text.trim() || !plan) return;
    const data = getPlanData();
    const key = `${dayIndex}_${mealType}`;
    if (!data[key]) data[key] = [];
    data[key].push(text.trim());
    const updated = await base44.entities.MealPlans.update(plan.id, { plan_json: JSON.stringify(data) });
    setPlan(updated);
    setMealInput("");
    setAddingSlot(null);
  };

  const removeMealFromSlot = async (dayIndex, mealType, idx) => {
    if (!plan) return;
    const data = getPlanData();
    const key = `${dayIndex}_${mealType}`;
    if (!data[key]) return;
    data[key].splice(idx, 1);
    const updated = await base44.entities.MealPlans.update(plan.id, { plan_json: JSON.stringify(data) });
    setPlan(updated);
  };

  const generateShoppingList = () => {
    const data = getPlanData();
    const items = Object.values(data).flat();
    // Simple extraction: split by commas and "+"
    const all = items.flatMap((m) => m.split(/[+,&]/).map((s) => s.trim()).filter(Boolean));
    const unique = [...new Set(all)];
    return unique;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
    </div>
  );

  const savePlanGoal = async (goalId) => {
    if (!plan) return;
    const updated = await base44.entities.MealPlans.update(plan.id, { wellness_goal: goalId });
    setPlan(updated);
    setPlanGoal(goalId);
  };

  const planData = getPlanData();
  const shoppingItems = generateShoppingList();

  return (
    <div className="space-y-4">
      {/* Wellness goal for this week's plan */}
      <div className="card-glass rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-600 mb-2">🎯 This week's focus</p>
        <div className="flex flex-wrap gap-1.5">
          {WELLNESS_GOALS.map((g) => (
            <button key={g.id} onClick={() => savePlanGoal(g.id)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${planGoal === g.id ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600 border border-rose-100 hover:bg-rose-50"}`}>
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((day, i) => (
          <button key={i} onClick={() => setActiveDay(i)}
            className={`flex flex-col items-center px-3 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${activeDay === i ? "bg-rose-500 text-white" : "bg-white/70 text-gray-500 hover:bg-rose-50"}`}>
            <span>{format(day, "EEE")}</span>
            <span className={`text-lg font-bold ${activeDay === i ? "text-white" : "text-gray-700"}`}>{format(day, "d")}</span>
          </button>
        ))}
      </div>

      {/* Meal slots for active day */}
      <div className="space-y-3">
        {MEAL_TYPES.map((mealType) => {
          const key = `${activeDay}_${mealType}`;
          const items = planData[key] || [];
          const isAdding = addingSlot?.dayIndex === activeDay && addingSlot?.mealType === mealType;

          return (
            <div key={mealType} className="card-glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{MEAL_EMOJIS[mealType]}</span>
                <p className="text-sm font-bold text-gray-800 capitalize">{mealType}</p>
              </div>
              {items.length > 0 ? (
                <div className="space-y-1.5 mb-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2">
                      <p className="text-sm text-gray-700">{item}</p>
                      <button onClick={() => removeMealFromSlot(activeDay, mealType, idx)}
                        className="text-gray-300 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-2">Nothing planned yet</p>
              )}

              {isAdding ? (
                <div className="space-y-2">
                  <input value={mealInput} onChange={(e) => setMealInput(e.target.value)}
                    placeholder={`Add ${mealType}…`} autoFocus
                    className="w-full p-2.5 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_MEALS[mealType].map((s) => (
                      <button key={s} onClick={() => setMealInput(s)}
                        className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100">{s}</button>
                    ))}
                    {templates.filter((t) => t.default_meal_type === mealType).map((t) => (
                      <button key={t.id} onClick={() => setMealInput(t.title)}
                        className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100">⭐ {t.title}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingSlot(null); setMealInput(""); }}
                      className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
                    <button onClick={() => addMealToSlot(activeDay, mealType, mealInput)}
                      disabled={!mealInput.trim()}
                      className="btn-primary flex-1 py-2 text-xs">Add</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAddingSlot({ dayIndex: activeDay, mealType }); setMealInput(""); }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-600 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add meal
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Shopping List */}
      {shoppingItems.length > 0 && (
        <div className="card-glass rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">🛒 Shopping List</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {shoppingItems.map((item, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/70 text-gray-700 border border-gray-100">{item}</span>
            ))}
          </div>
          <button onClick={() => {
            const text = shoppingItems.join("\n");
            navigator.clipboard.writeText(text);
          }} className="text-xs text-rose-400 font-medium hover:text-rose-600">📋 Copy list</button>
        </div>
      )}
    </div>
  );
}