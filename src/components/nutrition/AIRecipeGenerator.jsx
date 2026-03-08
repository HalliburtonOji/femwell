import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X, ChefHat, CalendarDays, Plus, CheckCircle, Copy, BookmarkPlus, ChevronDown, ChevronUp } from "lucide-react";

const WELLNESS_GOALS = [
  { id: "energy", label: "Boost Energy", emoji: "⚡" },
  { id: "digestion", label: "Digestion", emoji: "🌿" },
  { id: "sleep", label: "Better Sleep", emoji: "💤" },
  { id: "mood", label: "Mood Support", emoji: "😊" },
  { id: "hydration", label: "Hydration", emoji: "💧" },
  { id: "hormone", label: "Hormone Balance", emoji: "🌸" },
];

const DURATION_OPTIONS = [
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
  { value: 7, label: "Full week" },
];

const DIFFICULTY_COLORS = {
  Easy: "bg-green-50 text-green-600",
  Medium: "bg-amber-50 text-amber-600",
  Advanced: "bg-rose-50 text-rose-600",
};

const MEAL_EMOJIS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

function TagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput("");
  };
  return (
    <div className="w-full">
      <div className="flex gap-1.5 flex-wrap mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium">
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="flex-1 p-2.5 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
        <button onClick={add} disabled={!input.trim()} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onSaveAsTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const copyRecipe = () => {
    const text = [
      `🍳 ${recipe.recipe_name}`,
      `\n📋 Ingredients:\n${recipe.ingredients?.map(i => `• ${i.quantity} ${i.unit} ${i.name}${i.optional ? " (optional)" : ""}`).join("\n")}`,
      `\n👩‍🍳 Instructions:\n${recipe.instructions?.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      `\n📊 Nutrition: ${recipe.nutritional_summary?.calories}kcal | P: ${recipe.nutritional_summary?.protein_g}g | C: ${recipe.nutritional_summary?.carbs_g}g | F: ${recipe.nutritional_summary?.fat_g}g`,
    ].join("");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    await onSaveAsTemplate(recipe.recipe_name);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-black text-base">{recipe.recipe_name}</p>
            {recipe.tagline && <p className="text-white/80 text-xs mt-0.5">{recipe.tagline}</p>}
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0 ${DIFFICULTY_COLORS[recipe.difficulty] || "bg-white/20 text-white"}`}>
            {recipe.difficulty}
          </span>
        </div>
        <div className="flex gap-3 mt-3 text-xs text-white/90">
          {recipe.prep_time_minutes > 0 && <span>⏱ Prep: {recipe.prep_time_minutes}m</span>}
          {recipe.cook_time_minutes > 0 && <span>🔥 Cook: {recipe.cook_time_minutes}m</span>}
          {recipe.servings && <span>🍽 Serves {recipe.servings}</span>}
          {recipe.cuisine_type && <span>🌍 {recipe.cuisine_type}</span>}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Nutrition summary */}
        {recipe.nutritional_summary && (
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: "Kcal", val: recipe.nutritional_summary.calories, color: "bg-amber-50 text-amber-700" },
              { label: "Protein", val: `${recipe.nutritional_summary.protein_g}g`, color: "bg-blue-50 text-blue-700" },
              { label: "Carbs", val: `${recipe.nutritional_summary.carbs_g}g`, color: "bg-orange-50 text-orange-700" },
              { label: "Fat", val: `${recipe.nutritional_summary.fat_g}g`, color: "bg-purple-50 text-purple-700" },
              { label: "Fibre", val: `${recipe.nutritional_summary.fiber_g}g`, color: "bg-green-50 text-green-700" },
            ].map((n) => (
              <div key={n.label} className={`${n.color} rounded-xl p-2 text-center`}>
                <p className="font-bold text-xs">{n.val}</p>
                <p className="text-[9px] opacity-70">{n.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Wellness benefits */}
        {recipe.wellness_benefits?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1.5">✨ Wellness Benefits</p>
            <div className="space-y-1">
              {recipe.wellness_benefits.map((b, i) => (
                <div key={i} className="flex gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable details */}
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold w-full">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide" : "Show"} full recipe
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">
              {/* Ingredients */}
              {recipe.ingredients?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">📋 Ingredients</p>
                  <div className="space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-300 flex-shrink-0" />
                        <span className="font-medium">{ing.quantity} {ing.unit}</span>
                        <span>{ing.name}</span>
                        {ing.optional && <span className="text-gray-400">(optional)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {recipe.instructions?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">👩‍🍳 Instructions</p>
                  <div className="space-y-2">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-2.5 text-xs text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">{i + 1}</span>
                        <p className="leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tip */}
              {recipe.tip && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-700"><span className="font-bold">💡 Chef tip:</span> {recipe.tip}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add-on suggestions */}
        {recipe.addon_suggestions?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1.5">🌟 Add-On Suggestions</p>
            <div className="space-y-1.5">
              {recipe.addon_suggestions.map((s, i) => (
                <div key={i} className="flex gap-2 bg-emerald-50/60 rounded-xl p-2.5">
                  <span className="text-sm flex-shrink-0">➕</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">{s.name}</p>
                    <p className="text-[11px] text-gray-500">{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={copyRecipe}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/70 text-gray-600 text-xs font-medium border border-gray-100 hover:bg-gray-50">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy recipe"}
          </button>
          <button onClick={handleSaveTemplate} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-medium border border-rose-100 hover:bg-rose-100">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            Save as favourite
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MealPlanCard({ mealPlan, onSaveToPlan }) {
  const [expandedDay, setExpandedDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSaveToPlan(mealPlan);
    setSaving(false);
  };

  const copyPlan = () => {
    const text = mealPlan.days?.map(d =>
      `${d.day_label}:\n  🌅 B: ${d.meals?.breakfast?.name}\n  ☀️ L: ${d.meals?.lunch?.name}\n  🌙 D: ${d.meals?.dinner?.name}\n  🍎 S: ${d.meals?.snack?.name}`
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${expandedDay === i ? "bg-emerald-500 text-white" : "bg-white/70 text-gray-500 border border-gray-100"}`}>
              {d.day_label?.slice(0, 3) || `Day ${d.day_number}`}
            </button>
          ))}
        </div>

        {/* Active day meals */}
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
                    <p className="text-[11px] text-gray-500">{s.reason} {s.applies_to !== "all" ? `(best for ${s.applies_to})` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping list */}
        {mealPlan.shopping_list?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1.5">🛒 Shopping List</p>
            <div className="flex flex-wrap gap-1.5">
              {mealPlan.shopping_list.map((item, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/70 text-gray-600 border border-gray-100">{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={copyPlan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/70 text-gray-600 text-xs font-medium border border-gray-100 hover:bg-gray-50">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100 hover:bg-emerald-100">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            Save to my plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIRecipeGenerator({ user, planGoal, plan, setPlan, onSaveTemplate }) {
  const [mode, setMode] = useState("recipe");
  const [goal, setGoal] = useState(planGoal || "");
  const [ingredients, setIngredients] = useState([]);
  const [usualMeals, setUsualMeals] = useState([]);
  const [duration, setDuration] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    setError(null);
    const res = await base44.functions.invoke("generateMealPlan", {
      mode,
      wellness_goal: goal || undefined,
      ingredients,
      usual_meals: usualMeals,
      duration_days: duration,
    });
    if (res.data?.error) { setError(res.data.error); }
    else { setResult(res.data); }
    setGenerating(false);
  };

  const handleSaveTemplate = async (name) => {
    await base44.entities.MealTemplates.create({ user_id: user.id, title: name, default_meal_type: "lunch" });
    if (onSaveTemplate) onSaveTemplate();
  };

  const handleSaveMealPlan = async (mealPlan) => {
    if (!plan) return;
    const planData = {};
    mealPlan.days?.forEach((d) => {
      const dayIdx = (d.day_number - 1) % 7;
      Object.entries(d.meals || {}).forEach(([type, meal]) => {
        const key = `${dayIdx}_${type}`;
        planData[key] = [meal.name];
      });
    });
    const shoppingList = mealPlan.shopping_list || [];
    const updated = await base44.entities.MealPlans.update(plan.id, {
      plan_json: JSON.stringify(planData),
      shopping_list_json: JSON.stringify(shoppingList),
      wellness_goal: goal || undefined,
    });
    setPlan(updated);
  };

  const QUICK_INGREDIENTS = ["chicken", "eggs", "oats", "spinach", "sweet potato", "salmon", "lentils", "chickpeas", "avocado", "banana", "Greek yoghurt", "brown rice", "broccoli", "tofu"];

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      {/* Toggle header */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">AI Recipe & Meal Plan Generator</p>
          <p className="text-xs text-gray-400">Tell the AI what you have, get a personalised plan</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-rose-50">
              {/* Mode toggle */}
              <div className="flex gap-1.5 mt-4">
                {[
                  { id: "recipe", label: "Single Recipe", icon: ChefHat },
                  { id: "meal_plan", label: "Meal Plan", icon: CalendarDays },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setMode(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${mode === id ? "bg-rose-500 text-white shadow-sm" : "bg-white/70 text-gray-500 border border-rose-100"}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              {/* Duration (meal plan only) */}
              {mode === "meal_plan" && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">📅 Duration</p>
                  <div className="flex gap-1.5">
                    {DURATION_OPTIONS.map((d) => (
                      <button key={d.value} onClick={() => setDuration(d.value)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${duration === d.value ? "bg-rose-500 text-white" : "bg-white/70 text-gray-500 border border-rose-100"}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wellness goal */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">🎯 Wellness Goal</p>
                <div className="flex flex-wrap gap-1.5">
                  {WELLNESS_GOALS.map((g) => (
                    <button key={g.id} onClick={() => setGoal(goal === g.id ? "" : g.id)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${goal === g.id ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600 border border-rose-100 hover:bg-rose-50"}`}>
                      {g.emoji} {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1">🥦 Ingredients I have</p>
                <p className="text-[10px] text-gray-400 mb-2">Type & press Enter, or tap a suggestion</p>
                <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. chicken, spinach..." />
                <div className="flex flex-wrap gap-1 mt-2">
                  {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).slice(0, 8).map((q) => (
                    <button key={q} onClick={() => setIngredients([...ingredients, q])}
                      className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 hover:bg-rose-50 hover:text-rose-500">
                      + {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Usual meals */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1">🍽️ Meals I usually eat</p>
                <p className="text-[10px] text-gray-400 mb-2">The AI will incorporate these into your plan</p>
                <TagInput tags={usualMeals} setTags={setUsualMeals} placeholder="e.g. jollof rice, pasta, stir fry..." />
              </div>

              {/* Generate button */}
              <button onClick={generate} disabled={generating}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating with AI…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate {mode === "recipe" ? "Recipe" : `${duration}-Day Plan`}</>
                )}
              </button>

              {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — shown outside the collapsible so they persist */}
      {result && (
        <div className="px-4 pb-4">
          {result.mode === "recipe" && result.data && (
            <RecipeCard recipe={result.data} onSaveAsTemplate={handleSaveTemplate} />
          )}
          {result.mode === "meal_plan" && result.data && (
            <MealPlanCard mealPlan={result.data} onSaveToPlan={handleSaveMealPlan} />
          )}
        </div>
      )}
    </div>
  );
}