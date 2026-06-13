import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Copy } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { toast } from "sonner";
import { withTimeout } from "@/utils/safeEntity";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = { breakfast: "Morning", lunch: "Midday", dinner: "Evening", snack: "Snack" };

const SUGGESTED_MEALS = {
  breakfast: ["Greek yoghurt + berries + granola", "Oats with banana + nut butter", "Scrambled eggs + wholegrain toast", "Smoothie + seeds + protein"],
  lunch:     ["Chicken wrap + salad", "Lentil soup + bread", "Salmon + quinoa + veg", "Prawn stir-fry + rice"],
  dinner:    ["Grilled salmon + roasted veg", "Chicken + sweet potato + greens", "Pasta + tomato + turkey mince", "Tofu stir-fry + brown rice"],
  snack:     ["Apple + almond butter", "Rice cakes + hummus", "Mixed nuts + dark chocolate", "Boiled eggs + fruit"],
};

const WELLNESS_GOALS = [
  { id: "energy",    label: "Energy"           },
  { id: "digestion", label: "Digestion"        },
  { id: "sleep",     label: "Sleep"            },
  { id: "mood",      label: "Mood"             },
  { id: "hydration", label: "Hydration"        },
  { id: "hormone",   label: "Hormone Balance"  },
];

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

export default function NutritionPlanTab({ user, nutritionProfile }) {
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [addingSlot, setAddingSlot] = useState(null);
  const [mealInput, setMealInput] = useState("");
  const [templates, setTemplates] = useState([]);
  const [planGoal, setPlanGoal]   = useState(null);
  const [copiedShopping, setCopiedShopping] = useState(false);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekKey   = format(weekStart, "yyyy-MM-dd");

  useEffect(() => { loadPlan(); }, []);

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
      try {
        const newPlan = await withTimeout(base44.entities.MealPlans.create({
          user_id: user.id, week_start: weekKey,
          plan_days: [], is_active: true,
          created_at: new Date().toISOString(),
        }), 6000, "save");
        setPlan(newPlan);
      } catch (e) {
        console.error(e);
        toast.error("Couldn't save — try again");
      }
    }
    setLoading(false);
  };

  // plan_days is an array of { day, breakfast, lunch, dinner, snack }
  // Convert to a flat map { "0_breakfast": [...], ... } for easy lookup in the UI
  const getPlanData = () => {
    const days = plan?.plan_days || [];
    const map = {};
    for (const d of days) {
      for (const mt of ["breakfast", "lunch", "dinner", "snack"]) {
        map[`${d.day}_${mt}`] = d[mt] || [];
      }
    }
    return map;
  };

  const updatePlanDays = (data) => {
    // Rebuild plan_days from the flat map
    const dayMap = {};
    for (const [key, meals] of Object.entries(data)) {
      const match = key.match(/^(\d+)_(.+)$/);
      if (!match) continue;
      const dayIdx = parseInt(match[1], 10);
      const mealType = match[2];
      if (!dayMap[dayIdx]) dayMap[dayIdx] = { day: dayIdx, breakfast: [], lunch: [], dinner: [], snack: [] };
      dayMap[dayIdx][mealType] = meals;
    }
    return Object.values(dayMap).sort((a, b) => a.day - b.day);
  };

  const addMealToSlot = async (dayIndex, mealType, text) => {
    if (!text.trim() || !plan) return;
    const data = getPlanData();
    const key = `${dayIndex}_${mealType}`;
    if (!data[key]) data[key] = [];
    data[key].push(text.trim());
    try {
      const updated = await withTimeout(base44.entities.MealPlans.update(plan.id, {
        plan_days: updatePlanDays(data),
        updated_at: new Date().toISOString(),
      }), 6000, "save");
      setPlan(updated); setMealInput(""); setAddingSlot(null);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
    }
  };

  const removeMealFromSlot = async (dayIndex, mealType, idx) => {
    if (!plan) return;
    const data = getPlanData();
    const key = `${dayIndex}_${mealType}`;
    if (!data[key]) return;
    data[key].splice(idx, 1);
    try {
      const updated = await withTimeout(base44.entities.MealPlans.update(plan.id, {
        plan_days: updatePlanDays(data),
        updated_at: new Date().toISOString(),
      }), 6000, "save");
      setPlan(updated);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
    }
  };

  const savePlanGoal = async (goalId) => {
    if (!plan) return;
    try {
      const updated = await withTimeout(base44.entities.MealPlans.update(plan.id, { wellness_goal: goalId }), 6000, "save");
      setPlan(updated); setPlanGoal(goalId);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
    }
  };

  const generateShoppingList = () => {
    const data = getPlanData();
    const items = Object.values(data).flat();
    const all   = items.flatMap((m) => m.split(/[+,&]/).map((s) => s.trim()).filter(Boolean));
    return [...new Set(all)];
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  const planData      = getPlanData();
  const shoppingItems = generateShoppingList();
  const isCurrentWeek = format(new Date(), "yyyy-MM-dd") >= weekKey;
  const todayIndex    = isCurrentWeek ? Math.min(6, new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) : 0;

  return (
    <div className="space-y-4">
      {/* Weekly focus */}
      <div className="rounded-[24px] p-5" style={card}>
        <p style={sLabel} className="mb-3">This Week's Focus</p>
        <div className="flex flex-wrap gap-1.5">
          {WELLNESS_GOALS.map((g) => (
            <button key={g.id} onClick={() => savePlanGoal(g.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: planGoal === g.id ? "var(--plum)" : "var(--ivory)",
                color: planGoal === g.id ? "white" : "var(--mauve)",
                border: `1px solid ${planGoal === g.id ? "var(--plum)" : "var(--border)"}`,
              }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {days.map((day, i) => {
          const isActive  = activeDay === i;
          const isToday   = i === todayIndex;
          return (
            <button key={i} onClick={() => setActiveDay(i)}
              className="flex flex-col items-center px-3 py-2.5 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all"
              style={{
                backgroundColor: isActive ? "var(--plum)" : "var(--surface)",
                color: isActive ? "white" : "var(--mauve)",
                border: `1px solid ${isToday && !isActive ? "var(--rose-dust-light)" : isActive ? "var(--plum)" : "var(--border)"}`,
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
              }}>
              <span style={{ }}>{format(day, "EEE")}</span>
              <span className="text-base font-bold mt-0.5" style={{ color: isActive ? "white" : "var(--plum)" }}>
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Meal slots */}
      <div className="space-y-3">
        {MEAL_TYPES.map((mealType) => {
          const key      = `${activeDay}_${mealType}`;
          const items    = planData[key] || [];
          const isAdding = addingSlot?.dayIndex === activeDay && addingSlot?.mealType === mealType;

          return (
            <div key={mealType} className="rounded-[24px] p-5" style={card}>
              <div className="flex items-center justify-between mb-3">
                <p style={sLabel}>{MEAL_LABELS[mealType]}</p>
                {items.length > 0 && (
                  <span className="text-[10px]" style={{ color: "var(--mauve)" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {items.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl px-4 py-3"
                      style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                      <p className="text-sm" style={{ color: "var(--plum)", }}>{item}</p>
                      <button onClick={() => removeMealFromSlot(activeDay, mealType, idx)}
                        style={{ color: "var(--border)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--rose-dust)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--border)"}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs mb-3" style={{ color: "var(--mauve)" }}>Nothing planned — add a meal below</p>
              )}

              {isAdding ? (
                <div className="space-y-3">
                  <input value={mealInput} onChange={(e) => setMealInput(e.target.value)}
                    placeholder={`Add ${MEAL_LABELS[mealType].toLowerCase()}…`} autoFocus
                    className="w-full p-3.5 rounded-2xl text-sm focus:outline-none transition-all"
                    style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", }}
                    onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"} />
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_MEALS[mealType].map((s) => (
                      <button key={s} onClick={() => setMealInput(s)}
                        className="text-xs px-2.5 py-1 rounded-full transition-colors"
                        style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" }}>
                        {s}
                      </button>
                    ))}
                    {templates.filter((t) => t.default_meal_type === mealType).map((t) => (
                      <button key={t.id} onClick={() => setMealInput(t.title)}
                        className="text-xs px-2.5 py-1 rounded-full transition-colors"
                        style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)", border: "1px solid var(--mauve-light)" }}>
                        {t.title}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingSlot(null); setMealInput(""); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ border: "1.5px solid var(--border)", color: "var(--plum)" }}>
                      Cancel
                    </button>
                    <button onClick={() => addMealToSlot(activeDay, mealType, mealInput)} disabled={!mealInput.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ backgroundColor: "var(--plum)", color: "white", opacity: !mealInput.trim() ? 0.5 : 1 }}>
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAddingSlot({ dayIndex: activeDay, mealType }); setMealInput(""); }}
                  className="flex items-center gap-2 text-xs font-medium transition-colors"
                  style={{ color: "var(--mauve)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--rose-dust)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--mauve)"}>
                  <Plus className="w-3.5 h-3.5" /> Add meal
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Shopping preview */}
      {shoppingItems.length > 0 && (
        <div className="rounded-[24px] p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <p style={sLabel}>Shopping from this week</p>
            <button onClick={() => { navigator.clipboard.writeText(shoppingItems.join("\n")); setCopiedShopping(true); setTimeout(() => setCopiedShopping(false), 2000); }}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: "var(--mauve)" }}>
              <Copy className="w-3.5 h-3.5" />
              {copiedShopping ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {shoppingItems.map((item, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "var(--ivory)", color: "var(--plum)", border: "1px solid var(--border)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}