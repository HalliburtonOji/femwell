import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, ChefHat, Plus, CheckCircle, Copy, BookmarkPlus, ChevronDown, ChevronUp, Shuffle, Star } from "lucide-react";
import { toast } from "sonner";
import { withTimeout } from "@/utils/safeEntity";

const WELLNESS_GOALS = [
  { id: "energy",    label: "Energy"          },
  { id: "digestion", label: "Digestion"       },
  { id: "sleep",     label: "Sleep"           },
  { id: "mood",      label: "Mood"            },
  { id: "hydration", label: "Hydration"       },
  { id: "hormone",   label: "Hormone Balance" },
];

const DIETARY          = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "High-Protein"];
const CUISINES         = ["Any", "Italian", "Asian", "Mediterranean", "Mexican", "Middle Eastern", "British", "West African", "Indian"];
const QUICK_INGREDIENTS = ["chicken", "eggs", "oats", "spinach", "sweet potato", "salmon", "lentils", "chickpeas", "avocado", "banana", "Greek yoghurt", "brown rice", "broccoli", "tofu"];

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

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
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" }}>
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ color: "var(--rose-dust)" }}>
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
          style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", }}
          onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"} />
        <button onClick={add} disabled={!input.trim()}
          className="px-3 py-2 rounded-2xl transition-colors disabled:opacity-40"
          style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onSaveAsTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [rating, setRating]     = useState(null);

  const copyRecipe = () => {
    const text = [
      recipe.recipe_name,
      `\nIngredients:\n${recipe.ingredients?.map(i => `• ${i.quantity} ${i.unit} ${i.name}${i.optional ? " (optional)" : ""}`).join("\n")}`,
      `\nInstructions:\n${recipe.instructions?.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      `\nNutrition: ${recipe.nutritional_summary?.calories}kcal | P: ${recipe.nutritional_summary?.protein_g}g | C: ${recipe.nutritional_summary?.carbs_g}g | F: ${recipe.nutritional_summary?.fat_g}g`,
    ].join("");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSaveAsTemplate(recipe.recipe_name);
    setSaving(false);
  };

  const difficultyStyle = {
    Easy:     { backgroundColor: "var(--sage-subtle)",      color: "var(--sage)" },
    Medium:   { backgroundColor: "rgba(168,137,63,0.12)",   color: "var(--gold)" },
    Advanced: { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  }[recipe.difficulty] || { backgroundColor: "var(--ivory)", color: "var(--mauve)" };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] overflow-hidden" style={card}>
      {/* Recipe header */}
      <div className="p-5" style={{ backgroundColor: "var(--plum)" }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-base leading-snug" style={{ color: "white", }}>
              {recipe.recipe_name}
            </p>
            {recipe.tagline && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{recipe.tagline}</p>}
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent((recipe.recipe_name || '') + ' recipe how to make')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.75)", textDecoration: "none", display: "inline-block", marginTop: 4 }}
            >
              Watch how to make it
            </a>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0" style={difficultyStyle}>
            {recipe.difficulty}
          </span>
        </div>
        <div className="flex gap-3 text-xs flex-wrap" style={{ color: "rgba(255,255,255,0.7)" }}>
          {recipe.prep_time_minutes > 0 && <span>Prep {recipe.prep_time_minutes}m</span>}
          {recipe.cook_time_minutes > 0 && <span>Cook {recipe.cook_time_minutes}m</span>}
          {recipe.servings && <span>Serves {recipe.servings}</span>}
          {recipe.cuisine_type && <span>{recipe.cuisine_type}</span>}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Macros */}
        {recipe.nutritional_summary && (
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: "kcal",    val: recipe.nutritional_summary.calories,   bg: "rgba(168,137,63,0.12)", fg: "var(--gold)" },
              { label: "Protein", val: `${recipe.nutritional_summary.protein_g}g`, bg: "var(--rose-dust-subtle)", fg: "var(--rose-dust)" },
              { label: "Carbs",   val: `${recipe.nutritional_summary.carbs_g}g`,   bg: "var(--mauve-subtle)", fg: "var(--mauve)" },
              { label: "Fat",     val: `${recipe.nutritional_summary.fat_g}g`,     bg: "var(--ivory-dark)", fg: "var(--plum)" },
              { label: "Fibre",   val: `${recipe.nutritional_summary.fiber_g}g`,   bg: "var(--sage-subtle)", fg: "var(--sage)" },
            ].map((n) => (
              <div key={n.label} className="rounded-xl p-2 text-center" style={{ backgroundColor: n.bg }}>
                <p className="font-bold text-xs" style={{ color: n.fg }}>{n.val}</p>
                <p className="text-[9px] mt-0.5" style={{ color: n.fg, opacity: 0.7 }}>{n.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Wellness benefits */}
        {recipe.wellness_benefits?.length > 0 && (
          <div>
            <p style={sLabel} className="mb-2">Wellness Benefits</p>
            <div className="space-y-1.5">
              {recipe.wellness_benefits.map((b, i) => (
                <div key={i} className="flex gap-2 text-xs" style={{ color: "var(--plum)" }}>
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--sage)" }} />
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold w-full transition-colors"
          style={{ color: "var(--rose-dust)" }}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide" : "Show"} full recipe
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">
              {recipe.ingredients?.length > 0 && (
                <div>
                  <p style={sLabel} className="mb-2">Ingredients</p>
                  <div className="space-y-1.5">
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--plum)" }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--rose-dust)" }} />
                        <span className="font-medium">{ing.quantity} {ing.unit}</span>
                        <span>{ing.name}</span>
                        {ing.optional && <span style={{ color: "var(--mauve)" }}>(optional)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {recipe.instructions?.length > 0 && (
                <div>
                  <p style={sLabel} className="mb-2">Instructions</p>
                  <div className="space-y-2.5">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-3 text-xs" style={{ color: "var(--plum)" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                          style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                          {i + 1}
                        </span>
                        <p className="leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {recipe.tip && (
                <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(168,137,63,0.12)", border: "1px solid rgba(168,137,63,0.3)" }}>
                  <p className="text-xs" style={{ color: "var(--gold)" }}>
                    <span className="font-semibold">Chef tip: </span>{recipe.tip}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {recipe.addon_suggestions?.length > 0 && (
          <div>
            <p style={sLabel} className="mb-2">Add-On Ideas</p>
            <div className="space-y-2">
              {recipe.addon_suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 rounded-xl p-3" style={{ backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--sage)" }}>{s.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--mauve)" }}>{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p style={sLabel}>Rate this recipe</p>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((star) => (
              <button key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                className="transition-transform hover:scale-110"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Star className="w-4 h-4" style={{ color: rating >= star ? "var(--gold)" : "var(--border)", fill: rating >= star ? "var(--gold)" : "none" }} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={copyRecipe}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ border: "1.5px solid var(--border)", color: "var(--plum)" }}>
            {copied ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Recipe"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            Save Favourite
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RecipeGeneratorTab({ user }) {
  const [goal, setGoal]               = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [usualMeals, setUsualMeals]   = useState([]);
  const [dietary, setDietary]         = useState([]);
  const [cuisine, setCuisine]         = useState("Any");
  const [generating, setGenerating]   = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);

  const toggleDietary = (d) => setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const generate = async (surpriseMe = false) => {
    setGenerating(true); setResult(null); setError(null);
    try {
      const res = await withTimeout(base44.functions.invoke("generateMealPlan", {
        mode: "recipe", wellness_goal: goal || undefined,
        ingredients: surpriseMe ? [] : ingredients,
        usual_meals: surpriseMe ? [] : usualMeals,
        dietary_preferences: dietary,
        cuisine_preference: cuisine !== "Any" ? cuisine : undefined,
        surprise_me: surpriseMe,
      }), 18000, "recipe");
      if (res.data?.error) setError(res.data.error);
      else setResult(res.data);
    } catch (e) {
      console.error(e);
      setError("Couldn't generate your recipe just now. Please try again.");
    }
    setGenerating(false);
  };

  const handleSaveTemplate = async (name) => {
    try {
      await withTimeout(base44.entities.MealTemplates.create({ user_id: user.id, title: name, default_meal_type: "lunch" }), 6000, "save");
      toast.success("Saved to favourites");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] p-5 space-y-5" style={card}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--plum)" }}>
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--plum)", }}>Recipe Generator</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>AI-crafted recipes tailored to you</p>
          </div>
        </div>

        {/* Goal */}
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
                  backgroundColor: dietary.includes(d) ? "var(--sage)" : "var(--ivory)",
                  color: dietary.includes(d) ? "white" : "var(--mauve)",
                  border: `1px solid ${dietary.includes(d) ? "var(--sage)" : "var(--border)"}`,
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <p style={sLabel} className="mb-2">Cuisine</p>
          <div className="flex flex-wrap gap-1.5">
            {CUISINES.map((c) => (
              <button key={c} onClick={() => setCuisine(c)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: cuisine === c ? "var(--gold)" : "var(--ivory)",
                  color: cuisine === c ? "white" : "var(--mauve)",
                  border: `1px solid ${cuisine === c ? "var(--gold)" : "var(--border)"}`,
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p style={sLabel} className="mb-1">Ingredients I Have</p>
          <p className="text-[10px] mb-2" style={{ color: "var(--mauve)" }}>Type and press Enter, or tap a suggestion</p>
          <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. chicken, spinach…" />
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).slice(0, 8).map((q) => (
              <button key={q} onClick={() => setIngredients([...ingredients, q])}
                className="text-[10px] px-2 py-1 rounded-full transition-colors"
                style={{ backgroundColor: "var(--ivory)", color: "var(--mauve)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--rose-dust-subtle)"; e.currentTarget.style.color = "var(--rose-dust)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--ivory)"; e.currentTarget.style.color = "var(--mauve)"; }}>
                + {q}
              </button>
            ))}
          </div>
        </div>

        {/* Usual meals */}
        <div>
          <p style={sLabel} className="mb-1">Meals I Usually Enjoy</p>
          <p className="text-[10px] mb-2" style={{ color: "var(--mauve)" }}>The AI will draw inspiration from these</p>
          <TagInput tags={usualMeals} setTags={setUsualMeals} placeholder="e.g. jollof rice, pasta…" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={() => generate(true)} disabled={generating}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: "rgba(168,137,63,0.12)", color: "var(--gold)", border: "1px solid rgba(168,137,63,0.3)" }}>
            <Shuffle className="w-4 h-4" /> Surprise Me
          </button>
          <button onClick={() => generate(false)} disabled={generating}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: "var(--plum)", color: "white", opacity: generating ? 0.7 : 1 }}>
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "Generate Recipe"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-center rounded-xl p-3" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            {error}
          </p>
        )}
      </div>

      {result?.data && <RecipeCard recipe={result.data} onSaveAsTemplate={handleSaveTemplate} />}
    </div>
  );
}