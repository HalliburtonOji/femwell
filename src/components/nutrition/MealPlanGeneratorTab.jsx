import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, CalendarDays, Plus, CheckCircle, Copy, BookmarkPlus } from "lucide-react";
import { format, startOfWeek } from "date-fns";

const WELLNESS_GOALS = [
  { id: "energy",    label: "Energy"          },
  { id: "digestion", label: "Digestion"       },
  { id: "sleep",     label: "Sleep"           },
  { id: "mood",      label: "Mood"            },
  { id: "hydration", label: "Hydration"       },
  { id: "hormone",   label: "Hormone Balance" },
];

const DURATION_OPTIONS = [
  { value: 3, label: "3 Days"    },
  { value: 5, label: "5 Days"    },
  { value: 7, label: "Full Week" },
];

const MEAL_TYPES   = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS  = { breakfast: "Morning", lunch: "Midday", dinner: "Evening", snack: "Snack" };
const DIETARY      = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "High-Protein"];
const QUICK_INGREDIENTS = ["chicken", "eggs", "oats", "spinach", "sweet potato", "salmon", "lentils", "chickpeas", "avocado", "banana", "Greek yoghurt", "brown rice", "broccoli", "tofu"];
const SHOPPING_CATEGORIES = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Frozen", "Bakery", "Beverages", "Snacks", "Other"];

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

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
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", border: "1px solid var(--sage-light)" }}>
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ color: "var(--sage)" }}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 p-3 rounded-2xl text-sm focus:outline-none transition-all"
          style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
          onFocus={e => e.target.style.borderColor = "var(--sage-light)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"} />
        <button onClick={add} disabled={!input.trim()}
          className="px-3 py-2 rounded-2xl transition-colors disabled:opacity-40"
          style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MealPlanCard({ mealPlan, onSaveToPlan, saving }) {
  const [expandedDay, setExpandedDay] = useState(0);
  const [copied, setCopied]           = useState(false);

  const copyPlan = () => {
    const text = mealPlan.days?.map(d =>
      `${d.day_label}:\n  B: ${d.meals?.breakfast?.name || "-"}\n  L: ${d.meals?.lunch?.name || "-"}\n  D: ${d.meals?.dinner?.name || "-"}\n  S: ${d.meals?.snack?.name || "-"}`
    ).join("\n\n");
    navigator.clipboard.writeText(`${mealPlan.plan_name}\n\n${text}\n\nShopping:\n${mealPlan.shopping_list?.join(", ")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] overflow-hidden" style={card}>
      <div className="p-5" style={{ backgroundColor: "var(--plum)" }}>
        <p className="font-bold text-base" style={{ color: "white", fontFamily: "'Playfair Display', serif" }}>{mealPlan.plan_name}</p>
        {mealPlan.wellness_focus && (
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>Focus: {mealPlan.wellness_focus}</p>
        )}
        {mealPlan.weekly_tip && (
          <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{mealPlan.weekly_tip}</p>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Day tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {mealPlan.days?.map((d, i) => (
            <button key={i} onClick={() => setExpandedDay(i)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
              style={{
                backgroundColor: expandedDay === i ? "var(--plum)" : "var(--ivory)",
                color: expandedDay === i ? "white" : "var(--mauve)",
                border: `1px solid ${expandedDay === i ? "var(--plum)" : "var(--border)"}`,
              }}>
              {d.day_label?.slice(0, 3) || `Day ${d.day_number}`}
            </button>
          ))}
        </div>

        {/* Day meals */}
        {mealPlan.days?.[expandedDay] && (
          <div className="space-y-2.5">
            {Object.entries(mealPlan.days[expandedDay].meals || {}).map(([type, meal]) => (
              <div key={type} className="rounded-2xl p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p style={sLabel}>{MEAL_LABELS[type] || type}</p>
                  {meal.prep_minutes > 0 && (
                    <span className="text-[10px]" style={{ color: "var(--mauve)" }}>{meal.prep_minutes}m prep</span>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{meal.name}</p>
                {meal.description && <p className="text-xs mt-0.5" style={{ color: "var(--mauve)" }}>{meal.description}</p>}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent((meal.name || '') + ' recipe how to make')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, fontWeight: 500, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "inline-block", marginTop: 4 }}
                >
                  Watch how to make it
                </a>
              </div>
            ))}
            {mealPlan.days[expandedDay].daily_wellness_tip && (
              <div className="rounded-xl p-3" style={{ backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
                <p className="text-xs leading-relaxed" style={{ color: "var(--sage)" }}>
                  {mealPlan.days[expandedDay].daily_wellness_tip}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add-on suggestions */}
        {mealPlan.addon_suggestions?.length > 0 && (
          <div>
            <p style={sLabel} className="mb-2">Add-On Ideas</p>
            <div className="space-y-2">
              {mealPlan.addon_suggestions.map((s, i) => (
                <div key={i} className="rounded-xl p-3" style={{ backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--sage)" }}>{s.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--mauve)" }}>
                    {s.reason}{s.applies_to !== "all" ? ` (best for ${s.applies_to})` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping preview */}
        {mealPlan.shopping_list?.length > 0 && (
          <div>
            <p style={sLabel} className="mb-2">Shopping Preview</p>
            <div className="flex flex-wrap gap-1.5">
              {mealPlan.shopping_list.slice(0, 10).map((item, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--ivory)", color: "var(--plum)", border: "1px solid var(--border)" }}>
                  {item}
                </span>
              ))}
              {mealPlan.shopping_list.length > 10 && (
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--ivory)", color: "var(--mauve)" }}>
                  +{mealPlan.shopping_list.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={copyPlan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ border: "1.5px solid var(--border)", color: "var(--plum)" }}>
            {copied ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Plan"}
          </button>
          <button onClick={() => onSaveToPlan(mealPlan)} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", border: "1px solid var(--sage-light)" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save to My Plan"}
          </button>
        </div>

        {saving && (
          <p className="text-[10px] text-center" style={{ color: "var(--sage)" }}>Syncing to your Shopping List…</p>
        )}
      </div>
    </motion.div>
  );
}

export default function MealPlanGeneratorTab({ user, nutritionProfile }) {
  const [goal, setGoal]                     = useState("");
  const [ingredients, setIngredients]       = useState([]);
  const [usualMeals, setUsualMeals]         = useState([]);
  const [duration, setDuration]             = useState(7);
  const [dietary, setDietary]               = useState([]);
  const [includedMeals, setIncludedMeals]   = useState(["breakfast", "lunch", "dinner", "snack"]);
  const [generating, setGenerating]         = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [result, setResult]                 = useState(null);
  const [error, setError]                   = useState(null);
  const [saved, setSaved]                   = useState(false);

  const toggleDietary = (d) => setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleMeal    = (m) => setIncludedMeals(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const generate = async () => {
    setGenerating(true); setResult(null); setSaved(false); setError(null);
    const res = await base44.functions.invoke("generateMealPlan", {
      mode: "meal_plan", wellness_goal: goal || undefined,
      ingredients, usual_meals: usualMeals,
      duration_days: duration, dietary_preferences: dietary,
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
    const planData  = {};
    mealPlan.days?.forEach((d) => {
      const dayIdx = (d.day_number - 1) % 7;
      Object.entries(d.meals || {}).forEach(([type, meal]) => {
        planData[`${dayIdx}_${type}`] = [meal.name];
      });
    });
    const existing = await base44.entities.MealPlans.filter({ user_id: user.id, week_start: weekStart });
    let planId;
    if (existing[0]) {
      const updated = await base44.entities.MealPlans.update(existing[0].id, {
        plan_json: JSON.stringify(planData),
        shopping_list_json: JSON.stringify(mealPlan.shopping_list || []),
        wellness_goal: goal || undefined, is_active: true,
      });
      planId = updated.id;
    } else {
      const created = await base44.entities.MealPlans.create({
        user_id: user.id, week_start: weekStart,
        plan_json: JSON.stringify(planData),
        shopping_list_json: JSON.stringify(mealPlan.shopping_list || []),
        wellness_goal: goal || undefined, is_active: true,
      });
      planId = created.id;
    }
    const shoppingItems = mealPlan.shopping_list || [];
    if (shoppingItems.length > 0) {
      let categorized = shoppingItems.map(i => ({ ingredient: i, category: "Other", quantity: "" }));
      try {
        const catRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Categorize these grocery items into: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Frozen, Bakery, Beverages, Snacks, Other.
Items: ${shoppingItems.join(", ")}
Return JSON: {"items": [{"ingredient": "name", "category": "CategoryName", "quantity": "estimated amount or empty"}]}`,
          response_json_schema: { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, category: { type: "string" }, quantity: { type: "string" } } } } } }
        });
        if (catRes.items?.length) categorized = catRes.items;
      } catch {}
      const oldItems = await base44.entities.ShoppingList.filter({ user_id: user.id, week_start: weekStart, source: "meal_plan" });
      await Promise.all(oldItems.map(i => base44.entities.ShoppingList.delete(i.id)));
      await base44.entities.ShoppingList.bulkCreate(
        categorized.map(ci => ({
          user_id: user.id, week_start: weekStart,
          ingredient_name: ci.ingredient, quantity_text: ci.quantity || "",
          category: SHOPPING_CATEGORIES.includes(ci.category) ? ci.category : "Other",
          is_checked: false, source: "meal_plan", meal_plan_id: planId,
        }))
      );
    }
    setSaving(false); setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] p-5 space-y-5" style={card}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--sage)" }}>
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Meal Plan Generator</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Your personalised weekly eating plan</p>
          </div>
        </div>

        {/* Calorie context */}
        {nutritionProfile?.calories_target && (
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
            <p className="text-xs" style={{ color: "var(--sage)" }}>
              Your target: <span className="font-bold">{nutritionProfile.calories_target} kcal/day</span>
              {nutritionProfile.protein_target_g ? ` · ${nutritionProfile.protein_target_g}g protein` : ""}
            </p>
          </div>
        )}

        {/* Duration */}
        <div>
          <p style={sLabel} className="mb-2">Duration</p>
          <div className="flex gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: duration === d.value ? "var(--sage)" : "var(--ivory)",
                  color: duration === d.value ? "white" : "var(--mauve)",
                  border: `1px solid ${duration === d.value ? "var(--sage)" : "var(--border)"}`,
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Include meals */}
        <div>
          <p style={sLabel} className="mb-2">Include Meals</p>
          <div className="flex gap-1.5">
            {MEAL_TYPES.map((m) => (
              <button key={m} onClick={() => toggleMeal(m)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: includedMeals.includes(m) ? "var(--sage)" : "var(--ivory)",
                  color: includedMeals.includes(m) ? "white" : "var(--mauve)",
                  border: `1px solid ${includedMeals.includes(m) ? "var(--sage)" : "var(--border)"}`,
                }}>
                {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Wellness goal */}
        <div>
          <p style={sLabel} className="mb-2">Wellness Goal</p>
          <div className="flex flex-wrap gap-1.5">
            {WELLNESS_GOALS.map((g) => (
              <button key={g.id} onClick={() => setGoal(goal === g.id ? "" : g.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: goal === g.id ? "var(--plum)" : "var(--ivory)",
                  color: goal === g.id ? "white" : "var(--mauve)",
                  border: `1px solid ${goal === g.id ? "var(--plum)" : "var(--border)"}`,
                }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary */}
        <div>
          <p style={sLabel} className="mb-2">Dietary Preferences</p>
          <div className="flex flex-wrap gap-1.5">
            {DIETARY.map((d) => (
              <button key={d} onClick={() => toggleDietary(d)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: dietary.includes(d) ? "var(--mauve)" : "var(--ivory)",
                  color: dietary.includes(d) ? "white" : "var(--mauve)",
                  border: `1px solid ${dietary.includes(d) ? "var(--mauve)" : "var(--border)"}`,
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p style={sLabel} className="mb-1">Ingredients I Have</p>
          <p className="text-[10px] mb-2" style={{ color: "var(--mauve)" }}>The AI will build your plan around these</p>
          <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. chicken, spinach…" />
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).slice(0, 8).map((q) => (
              <button key={q} onClick={() => setIngredients([...ingredients, q])}
                className="text-[10px] px-2 py-1 rounded-full transition-colors"
                style={{ backgroundColor: "var(--ivory)", color: "var(--mauve)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--sage-subtle)"; e.currentTarget.style.color = "var(--sage)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--ivory)"; e.currentTarget.style.color = "var(--mauve)"; }}>
                + {q}
              </button>
            ))}
          </div>
        </div>

        {/* Usual meals */}
        <div>
          <p style={sLabel} className="mb-1">Meals I Usually Have</p>
          <p className="text-[10px] mb-2" style={{ color: "var(--mauve)" }}>The AI will weave these into your plan</p>
          <TagInput tags={usualMeals} setTags={setUsualMeals} placeholder="e.g. jollof rice, pasta…" />
        </div>

        <button onClick={generate} disabled={generating}
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: "var(--plum)", color: "white", opacity: generating ? 0.7 : 1 }}>
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan…</>
            : `Generate ${duration}-Day Plan`}
        </button>

        {error && (
          <p className="text-xs text-center rounded-xl p-3" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>{error}</p>
        )}
        {saved && (
          <p className="text-xs text-center rounded-xl p-3" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
            Saved — your shopping list has been updated.
          </p>
        )}
      </div>

      {result?.data && <MealPlanCard mealPlan={result.data} onSaveToPlan={handleSaveMealPlan} saving={saving} />}
    </div>
  );
}