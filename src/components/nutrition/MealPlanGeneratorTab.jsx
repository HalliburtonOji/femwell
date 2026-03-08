import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, X, CalendarDays, Plus,
  CheckCircle, Copy, BookmarkPlus, ChevronDown, ChevronUp
} from "lucide-react";
import { format, startOfWeek } from "date-fns";

const WELLNESS_GOALS = [
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "digestion", label: "Digestion", emoji: "🌿" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "mood", label: "Mood", emoji: "😊" },
  { id: "hydration", label: "Hydration", emoji: "💧" },
  { id: "hormone", label: "Hormones", emoji: "🌸" },
];

const DURATION_OPTIONS = [
  { value: 3, label: "3 Days" },
  { value: 5, label: "5 Days" },
  { value: 7, label: "Full Week" },
];

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_EMOJIS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };
const DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "High-Protein"];
const QUICK_INGREDIENTS = ["chicken", "eggs", "oats", "spinach", "sweet potato", "salmon", "lentils", "chickpeas", "avocado", "banana", "Greek yoghurt", "brown rice", "broccoli", "tofu"];
const SHOPPING_CATEGORIES = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Frozen", "Bakery", "Beverages", "Snacks", "Other"];

function TagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput("");
  };
  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 p-2.5 rounded-xl border border-emerald-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200" />
        <button onClick={add} disabled={!input.trim()}
          className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors disabled:opacity-40">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MealPlanCard({ mealPlan, onSaveToPlan, saving }) {
  const [expandedDay, setExpandedDay] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyPlan = () => {
    const text = mealPlan.days?.map(d =>
      `${d.day_label}:\n  🌅 B: ${d.meals?.breakfast?.name || "-"}\n  ☀️ L: ${d.meals?.lunch?.name || "-"}\n  🌙 D: ${d.meals?.dinner?.name || "-"}\n  🍎 S: ${d.meals?.snack?.name || "-"}`
    ).join("\n\n");
    navigator.clipboard.writeText(`${mealPlan.plan_name}\n\n${text}\n\n🛒 Shopping:\n${mealPlan.shopping_list?.join(", ")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-4 text-white">
        <p className="font-black text-base">{mealPlan.plan_name}</p>
        {mealPlan.wellness_focus && <p className="text-white/80 text-xs mt-0.5">🎯 {mealPlan.wellness_focus}</p>}
        {mealPlan.weekly_tip && (
          <div className="mt-2 bg-white/20 rounded-xl p-2.5">
            <p className="text-xs text-white/90">💡 {mealPlan.weekly_tip}</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Day tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {mealPlan.days?.map((d, i) => (
            <button key={i} onClick={() => setExpandedDay(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${expandedDay === i ? "bg-emerald-500 text-white shadow-sm" : "bg-white/70 text-gray-500 border border-gray-100"}`}>
              {d.day_label?.slice(0, 3) || `Day ${d.day_number}`}
            </button>
          ))}
        </div>

        {/* Day meals */}
        {mealPlan.days?.[expandedDay] && (
          <div className="space-y-2">
            {Object.entries(mealPlan.days[expandedDay].meals || {}).map(([type, meal]) => (
              <div key={type} className="bg-white/60 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{MEAL_EMOJIS[type]}</span>
                  <p className="text-xs font-bold text-gray-700 capitalize">{type}</p>
                  {meal.prep_minutes > 0 && <span className="ml-auto text-[10px] text-gray-400">⏱ {meal.prep_minutes}m</span>}
                </div>
                <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
                {meal.description && <p className="text-xs text-gray-500 mt-0.5">{meal.description}</p>}
              </div>
            ))}
            {mealPlan.days[expandedDay].daily_wellness_tip && (
              <div className="bg-teal-50 rounded-xl p-2.5">
                <p className="text-xs text-teal-700">🌿 {mealPlan.days[expandedDay].daily_wellness_tip}</p>
              </div>
            )}
          </div>
        )}

        {/* Add-on suggestions */}
        {mealPlan.addon_suggestions?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1.5">🌟 Add-On Suggestions</p>
            <div className="space-y-1.5">
              {mealPlan.addon_suggestions.map((s, i) => (
                <div key={i} className="flex gap-2 bg-emerald-50/60 rounded-xl p-2.5">
                  <span className="text-sm flex-shrink-0">➕</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">{s.name}</p>
                    <p className="text-[11px] text-gray-500">{s.reason}{s.applies_to !== "all" ? ` (best for ${s.applies_to})` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping preview */}
        {mealPlan.shopping_list?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1.5">🛒 Shopping Preview</p>
            <div className="flex flex-wrap gap-1.5">
              {mealPlan.shopping_list.slice(0, 10).map((item, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/70 text-gray-600 border border-gray-100">{item}</span>
              ))}
              {mealPlan.shopping_list.length > 10 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-400">+{mealPlan.shopping_list.length - 10} more</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={copyPlan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/70 text-gray-600 text-xs font-medium border border-gray-100 hover:bg-gray-50">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Plan"}
          </button>
          <button onClick={() => onSaveToPlan(mealPlan)} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100 hover:bg-emerald-100">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save to My Plan"}
          </button>
        </div>

        {saving && (
          <p className="text-[10px] text-emerald-600 text-center">Also syncing to your Shopping List…</p>
        )}
      </div>
    </motion.div>
  );
}

export default function MealPlanGeneratorTab({ user, nutritionProfile }) {
  const [goal, setGoal] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [usualMeals, setUsualMeals] = useState([]);
  const [duration, setDuration] = useState(7);
  const [dietary, setDietary] = useState([]);
  const [includedMeals, setIncludedMeals] = useState(["breakfast", "lunch", "dinner", "snack"]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const toggleDietary = (d) => setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleMeal = (m) => setIncludedMeals(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    setSaved(false);
    setError(null);
    const res = await base44.functions.invoke("generateMealPlan", {
      mode: "meal_plan",
      wellness_goal: goal || undefined,
      ingredients,
      usual_meals: usualMeals,
      duration_days: duration,
      dietary_preferences: dietary,
      included_meal_types: includedMeals,
      calorie_target: nutritionProfile?.calories_target,
      protein_target: nutritionProfile?.protein_target_g,
    });
    if (res.data?.error) setError(res.data.error);
    else setResult(res.data);
    setGenerating(false);
  };

  const handleSaveMealPlan = async (mealPlan) => {
    setSaving(true);
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    // Build plan_json
    const planData = {};
    mealPlan.days?.forEach((d) => {
      const dayIdx = (d.day_number - 1) % 7;
      Object.entries(d.meals || {}).forEach(([type, meal]) => {
        const key = `${dayIdx}_${type}`;
        planData[key] = [meal.name];
      });
    });

    // Upsert MealPlan record
    const existing = await base44.entities.MealPlans.filter({ user_id: user.id, week_start: weekStart });
    let planId;
    if (existing[0]) {
      const updated = await base44.entities.MealPlans.update(existing[0].id, {
        plan_json: JSON.stringify(planData),
        shopping_list_json: JSON.stringify(mealPlan.shopping_list || []),
        wellness_goal: goal || undefined,
        is_active: true,
      });
      planId = updated.id;
    } else {
      const created = await base44.entities.MealPlans.create({
        user_id: user.id,
        week_start: weekStart,
        plan_json: JSON.stringify(planData),
        shopping_list_json: JSON.stringify(mealPlan.shopping_list || []),
        wellness_goal: goal || undefined,
        is_active: true,
      });
      planId = created.id;
    }

    // Populate ShoppingList entity — remove old meal_plan items first
    const shoppingItems = mealPlan.shopping_list || [];
    if (shoppingItems.length > 0) {
      const oldItems = await base44.entities.ShoppingList.filter({ user_id: user.id, week_start: weekStart, source: "meal_plan" });
      await Promise.all(oldItems.map(i => base44.entities.ShoppingList.delete(i.id)));

      // Use AI to categorize
      let categorized = shoppingItems.map(i => ({ ingredient: i, category: "Other", quantity: "" }));
      try {
        const catRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Categorize these grocery items into: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Frozen, Bakery, Beverages, Snacks, Other.
Items: ${shoppingItems.join(", ")}
Return JSON: {"items": [{"ingredient": "name", "category": "CategoryName", "quantity": "estimated amount or empty"}]}`,
          response_json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    ingredient: { type: "string" },
                    category: { type: "string" },
                    quantity: { type: "string" }
                  }
                }
              }
            }
          }
        });
        if (catRes.items?.length) categorized = catRes.items;
      } catch {}

      await base44.entities.ShoppingList.bulkCreate(
        categorized.map(ci => ({
          user_id: user.id,
          week_start: weekStart,
          ingredient_name: ci.ingredient,
          quantity_text: ci.quantity || "",
          category: SHOPPING_CATEGORIES.includes(ci.category) ? ci.category : "Other",
          is_checked: false,
          source: "meal_plan",
          meal_plan_id: planId,
        }))
      );
    }

    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="card-glass rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Meal Plan Generator</p>
            <p className="text-xs text-gray-400">Your personalised weekly eating plan</p>
          </div>
        </div>

        {/* Nutrition targets from profile */}
        {nutritionProfile?.calories_target && (
          <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
            <span className="text-blue-400">🎯</span>
            <p className="text-xs text-blue-700">
              Target: <span className="font-bold">{nutritionProfile.calories_target} kcal/day</span>
              {nutritionProfile.protein_target_g ? ` • ${nutritionProfile.protein_target_g}g protein` : ""}
            </p>
          </div>
        )}

        {/* Duration */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">📅 Duration</p>
          <div className="flex gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${duration === d.value ? "bg-emerald-500 text-white shadow-sm" : "bg-white/70 text-gray-500 border border-emerald-100"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meal types */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">🍽️ Include Meals</p>
          <div className="flex gap-1.5">
            {MEAL_TYPES.map((m) => (
              <button key={m} onClick={() => toggleMeal(m)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-all ${includedMeals.includes(m) ? "bg-emerald-500 text-white shadow-sm" : "bg-white/70 text-gray-500 border border-gray-100"}`}>
                <span className="text-base">{MEAL_EMOJIS[m]}</span>
                <span className="capitalize text-[10px] mt-0.5">{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wellness goal */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">🎯 Wellness Goal</p>
          <div className="flex flex-wrap gap-1.5">
            {WELLNESS_GOALS.map((g) => (
              <button key={g.id} onClick={() => setGoal(goal === g.id ? "" : g.id)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${goal === g.id ? "bg-emerald-500 text-white shadow-sm" : "bg-white/70 text-gray-600 border border-emerald-100 hover:bg-emerald-50"}`}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">🥗 Dietary Preferences</p>
          <div className="flex flex-wrap gap-1.5">
            {DIETARY.map((d) => (
              <button key={d} onClick={() => toggleDietary(d)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${dietary.includes(d) ? "bg-teal-500 text-white shadow-sm" : "bg-white/70 text-gray-600 border border-gray-100 hover:bg-teal-50"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">🥦 Ingredients I have</p>
          <p className="text-[10px] text-gray-400 mb-2">The AI will build your plan around these</p>
          <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. chicken, spinach…" />
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).slice(0, 8).map((q) => (
              <button key={q} onClick={() => setIngredients([...ingredients, q])}
                className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 hover:bg-emerald-50 hover:text-emerald-500 transition-colors">
                + {q}
              </button>
            ))}
          </div>
        </div>

        {/* Usual meals */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">🍴 Meals I usually have</p>
          <p className="text-[10px] text-gray-400 mb-2">The AI will incorporate these into your plan</p>
          <TagInput tags={usualMeals} setTags={setUsualMeals} placeholder="e.g. jollof rice, pasta…" />
        </div>

        <button onClick={generate} disabled={generating}
          className="w-full py-3 text-sm rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md"
          style={{ background: "linear-gradient(135deg, #34d399 0%, #0d9488 100%)" }}>
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan…</>
            : <><Sparkles className="w-4 h-4" /> Generate {duration}-Day Plan</>}
        </button>

        {error && <p className="text-xs text-red-400 text-center bg-red-50 rounded-xl p-2">{error}</p>}
        {saved && <p className="text-xs text-emerald-600 text-center bg-emerald-50 rounded-xl p-2">✅ Saved! Your shopping list has been updated.</p>}
      </div>

      {result?.data && (
        <MealPlanCard mealPlan={result.data} onSaveToPlan={handleSaveMealPlan} saving={saving} />
      )}
    </div>
  );
}