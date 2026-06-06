import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X, ChefHat, CalendarDays, Plus, CheckCircle, Copy, BookmarkPlus, ChevronDown, ChevronUp } from "lucide-react";

const WELLNESS_GOALS = [
  { id: "energy",     label: "Boost Energy"     },
  { id: "digestion",  label: "Digestion"         },
  { id: "sleep",      label: "Better Sleep"      },
  { id: "mood",       label: "Mood Support"      },
  { id: "hydration",  label: "Hydration"         },
  { id: "hormone",    label: "Hormone Balance"   },
];

const DURATION_OPTIONS = [
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
  { value: 7, label: "Full week" },
];

const DIFFICULTY_STYLES = {
  Easy:     { backgroundColor: "rgba(122,158,142,0.12)", color: "var(--sage)" },
  Medium:   { backgroundColor: "rgba(168,137,63,0.12)", color: "var(--gold)" },
  Advanced: { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
};

const MEAL_LABELS_PLAN = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

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
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 12, fontWeight: 500 }}>
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, outline: "none" }}
          onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={add} disabled={!input.trim()} style={{ padding: "8px 12px", borderRadius: 12, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "none", cursor: "pointer" }}>
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
      recipe.recipe_name,
      `\nIngredients:\n${recipe.ingredients?.map(i => `- ${i.quantity} ${i.unit} ${i.name}${i.optional ? " (optional)" : ""}`).join("\n")}`,
      `\nInstructions:\n${recipe.instructions?.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      `\nNutrition: ${recipe.nutritional_summary?.calories}kcal | P: ${recipe.nutritional_summary?.protein_g}g | C: ${recipe.nutritional_summary?.carbs_g}g | F: ${recipe.nutritional_summary?.fat_g}g`,
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--plum)", padding: 16, color: "white" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "white", margin: 0 }}>{recipe.recipe_name}</p>
            {recipe.tagline && <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>{recipe.tagline}</p>}
          </div>
          <span style={{ ...(DIFFICULTY_STYLES[recipe.difficulty] || { backgroundColor: "rgba(255,255,255,0.2)", color: "white" }), fontSize: 10, padding: "3px 8px", borderRadius: 9999, fontWeight: 600, flexShrink: 0 }}>
            {recipe.difficulty}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
          {recipe.prep_time_minutes > 0 && <span>Prep {recipe.prep_time_minutes}m</span>}
          {recipe.cook_time_minutes > 0 && <span>Cook {recipe.cook_time_minutes}m</span>}
          {recipe.servings && <span>Serves {recipe.servings}</span>}
          {recipe.cuisine_type && <span>{recipe.cuisine_type}</span>}
        </div>
      </div>

      <div style={{ padding: 16 }} className="space-y-4">
        {/* Nutrition summary */}
        {recipe.nutritional_summary && (
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: "Kcal",   val: recipe.nutritional_summary.calories,  bg: "rgba(168,137,63,0.12)", fg: "var(--gold)" },
              { label: "Protein",val: `${recipe.nutritional_summary.protein_g}g`, bg: "rgba(46,38,27,0.08)", fg: "var(--mauve)" },
              { label: "Carbs",  val: `${recipe.nutritional_summary.carbs_g}g`,   bg: "rgba(168,137,63,0.12)", fg: "var(--gold)" },
              { label: "Fat",    val: `${recipe.nutritional_summary.fat_g}g`,     bg: "rgba(46,38,27,0.08)", fg: "var(--mauve)" },
              { label: "Fibre",  val: `${recipe.nutritional_summary.fiber_g}g`,   bg: "rgba(122,158,142,0.12)", fg: "var(--sage)" },
            ].map((n) => (
              <div key={n.label} style={{ backgroundColor: n.bg, borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: n.fg, margin: 0 }}>{n.val}</p>
                <p style={{ fontSize: 9, color: n.fg, opacity: 0.7, margin: 0 }}>{n.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Wellness benefits */}
        {recipe.wellness_benefits?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 6 }}>Wellness Benefits</p>
            <div className="space-y-1">
              {recipe.wellness_benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--mauve)" }}>
                  <CheckCircle style={{ width: 14, height: 14, color: "var(--sage)", flexShrink: 0, marginTop: 1 }} />
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable details */}
        <button onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", width: "100%" }}>
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
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--plum)", marginBottom: 8 }}>Ingredients</p>
                  <div className="space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--mauve)" }}>
                        <div style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: "var(--rose-dust-light)", flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{ing.quantity} {ing.unit}</span>
                        <span>{ing.name}</span>
                        {ing.optional && <span style={{ color: "var(--border)" }}>(optional)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {recipe.instructions?.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--plum)", marginBottom: 8 }}>Instructions</p>
                  <div className="space-y-2">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--mauve)" }}>
                        <span style={{ width: 20, height: 20, borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>{i + 1}</span>
                        <p style={{ lineHeight: 1.5, paddingTop: 2, margin: 0 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tip */}
              {recipe.tip && (
                <div style={{ backgroundColor: "rgba(168,137,63,0.12)", borderRadius: 12, padding: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--gold)", margin: 0 }}><span style={{ fontWeight: 700 }}>Chef tip:</span> {recipe.tip}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add-on suggestions */}
        {recipe.addon_suggestions?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 6 }}>Add-On Suggestions</p>
            <div className="space-y-1.5">
              {recipe.addon_suggestions.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, backgroundColor: "var(--sage-subtle)", borderRadius: 12, padding: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sage)", margin: 0 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: "var(--mauve)", margin: 0 }}>{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={copyRecipe}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 12, backgroundColor: "var(--ivory)", color: "var(--mauve)", fontSize: 12, fontWeight: 500, border: "1px solid var(--border)", cursor: "pointer" }}>
            {copied ? <CheckCircle style={{ width: 14, height: 14, color: "var(--sage)" }} /> : <Copy style={{ width: 14, height: 14 }} />}
            {copied ? "Copied" : "Copy recipe"}
          </button>
          <button onClick={handleSaveTemplate} disabled={saving}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 12, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 12, fontWeight: 500, border: "1px solid var(--rose-dust-light)", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <BookmarkPlus style={{ width: 14, height: 14 }} />}
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ backgroundColor: "var(--sage)", padding: 16, color: "white" }}>
        <p style={{ fontWeight: 800, fontSize: 15, color: "white", margin: 0 }}>{mealPlan.plan_name}</p>
        {mealPlan.wellness_focus && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>{mealPlan.wellness_focus}</p>}
        {mealPlan.weekly_tip && (
          <div style={{ marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", margin: 0 }}>{mealPlan.weekly_tip}</p>
          </div>
        )}
      </div>

      <div style={{ padding: 16 }} className="space-y-3">
        {/* Day tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {mealPlan.days?.map((d, i) => (
            <button key={i} onClick={() => setExpandedDay(i)}
              style={{ padding: "6px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, flexShrink: 0, cursor: "pointer", border: "none",
                backgroundColor: expandedDay === i ? "var(--sage)" : "var(--ivory)",
                color: expandedDay === i ? "white" : "var(--mauve)" }}>
              {d.day_label?.slice(0, 3) || `Day ${d.day_number}`}
            </button>
          ))}
        </div>

        {/* Active day meals */}
        {mealPlan.days?.[expandedDay] && (
          <div className="space-y-2">
            {Object.entries(mealPlan.days[expandedDay].meals || {}).map(([type, meal]) => (
              <div key={type} style={{ backgroundColor: "var(--ivory)", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--mauve)", textTransform: "capitalize", margin: 0 }}>{MEAL_LABELS_PLAN[type] || type}</p>
                  {meal.prep_minutes > 0 && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--mauve)" }}>{meal.prep_minutes}m</span>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", margin: 0 }}>{meal.name}</p>
                {meal.description && <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 2 }}>{meal.description}</p>}
              </div>
            ))}
            {mealPlan.days[expandedDay].daily_wellness_tip && (
              <div style={{ backgroundColor: "var(--sage-subtle)", borderRadius: 12, padding: 10 }}>
                <p style={{ fontSize: 12, color: "var(--sage)", margin: 0 }}>{mealPlan.days[expandedDay].daily_wellness_tip}</p>
              </div>
            )}
          </div>
        )}

        {/* Add-on suggestions */}
        {mealPlan.addon_suggestions?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 6 }}>Add-On Suggestions</p>
            <div className="space-y-1.5">
              {mealPlan.addon_suggestions.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, backgroundColor: "var(--sage-subtle)", borderRadius: 12, padding: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sage)", margin: 0 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: "var(--mauve)", margin: 0 }}>{s.reason} {s.applies_to !== "all" ? `(best for ${s.applies_to})` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping list */}
        {mealPlan.shopping_list?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 6 }}>Shopping List</p>
            <div className="flex flex-wrap gap-1.5">
              {mealPlan.shopping_list.map((item, i) => (
                <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--ivory)", color: "var(--mauve)", border: "1px solid var(--border)" }}>{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={copyPlan}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 12, backgroundColor: "var(--ivory)", color: "var(--mauve)", fontSize: 12, fontWeight: 500, border: "1px solid var(--border)", cursor: "pointer" }}>
            {copied ? <CheckCircle style={{ width: 14, height: 14, color: "var(--sage)" }} /> : <Copy style={{ width: 14, height: 14 }} />}
            {copied ? "Copied" : "Copy plan"}
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 12, backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontSize: 12, fontWeight: 500, border: "1px solid var(--sage-light)", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <BookmarkPlus style={{ width: 14, height: 14 }} />}
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
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      {/* Toggle header */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left">
        <div style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Sparkles style={{ width: 16, height: 16, color: "var(--rose-dust)" }} />
        </div>
        <div className="flex-1">
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", margin: 0 }}>AI Recipe and Meal Plan Generator</p>
          <p style={{ fontSize: 12, color: "var(--mauve)", margin: 0 }}>Tell the AI what you have, get a personalised plan</p>
        </div>
        {open ? <ChevronUp style={{ width: 16, height: 16, color: "var(--mauve)" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "var(--mauve)" }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div style={{ padding: "0 16px 16px" }} className="space-y-4" style={{ borderTop: "1px solid var(--border-subtle)", padding: "0 16px 16px" }}>
              {/* Mode toggle */}
              <div className="flex gap-1.5 mt-4">
                {[
                  { id: "recipe", label: "Single Recipe", icon: ChefHat },
                  { id: "meal_plan", label: "Meal Plan", icon: CalendarDays },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setMode(id)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                      backgroundColor: mode === id ? "var(--rose-dust)" : "var(--ivory)",
                      color: mode === id ? "white" : "var(--mauve)" }}>
                    <Icon style={{ width: 14, height: 14 }} /> {label}
                  </button>
                ))}
              </div>

              {/* Duration (meal plan only) */}
              {mode === "meal_plan" && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 8 }}>Duration</p>
                  <div className="flex gap-1.5">
                    {DURATION_OPTIONS.map((d) => (
                      <button key={d.value} onClick={() => setDuration(d.value)}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                          backgroundColor: duration === d.value ? "var(--rose-dust)" : "var(--ivory)",
                          color: duration === d.value ? "white" : "var(--mauve)" }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wellness goal */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 8 }}>Wellness Goal</p>
                <div className="flex flex-wrap gap-1.5">
                  {WELLNESS_GOALS.map((g) => (
                    <button key={g.id} onClick={() => setGoal(goal === g.id ? "" : g.id)}
                      style={{ padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none",
                        backgroundColor: goal === g.id ? "var(--rose-dust)" : "var(--ivory)",
                        color: goal === g.id ? "white" : "var(--mauve)" }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 4 }}>Ingredients I have</p>
                <p style={{ fontSize: 10, color: "var(--mauve)", opacity: 0.7, marginBottom: 8 }}>Type and press Enter, or tap a suggestion</p>
                <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. chicken, spinach..." />
                <div className="flex flex-wrap gap-1 mt-2">
                  {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).slice(0, 8).map((q) => (
                    <button key={q} onClick={() => setIngredients([...ingredients, q])}
                      style={{ fontSize: 10, padding: "4px 8px", borderRadius: 9999, backgroundColor: "var(--ivory)", color: "var(--mauve)", border: "1px solid var(--border)", cursor: "pointer" }}>
                      + {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Usual meals */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--mauve)", marginBottom: 4 }}>Meals I usually eat</p>
                <p style={{ fontSize: 10, color: "var(--mauve)", opacity: 0.7, marginBottom: 8 }}>The AI will incorporate these into your plan</p>
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

              {error && <p style={{ fontSize: 12, color: "var(--rose-dust)", textAlign: "center" }}>{error}</p>}
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