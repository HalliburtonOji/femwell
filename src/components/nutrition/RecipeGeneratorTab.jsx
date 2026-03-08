import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, X, ChefHat, Plus, CheckCircle,
  Copy, BookmarkPlus, ChevronDown, ChevronUp, Shuffle
} from "lucide-react";

const WELLNESS_GOALS = [
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "digestion", label: "Digestion", emoji: "🌿" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "mood", label: "Mood", emoji: "😊" },
  { id: "hydration", label: "Hydration", emoji: "💧" },
  { id: "hormone", label: "Hormones", emoji: "🌸" },
];

const DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "High-Protein"];
const CUISINES = ["Any", "Italian", "Asian", "Mediterranean", "Mexican", "Middle Eastern", "British", "West African", "Indian"];
const DIFFICULTY_COLORS = {
  Easy: "bg-green-50 text-green-600",
  Medium: "bg-amber-50 text-amber-600",
  Advanced: "bg-rose-50 text-rose-600",
};
const QUICK_INGREDIENTS = ["chicken", "eggs", "oats", "spinach", "sweet potato", "salmon", "lentils", "chickpeas", "avocado", "banana", "Greek yoghurt", "brown rice", "broccoli", "tofu"];

function TagInput({ tags, setTags, placeholder, color = "rose" }) {
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
          <span key={t} className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-${color}-50 text-${color}-600 text-xs font-medium`}>
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 p-2.5 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
        <button onClick={add} disabled={!input.trim()}
          className="px-3 py-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors disabled:opacity-40">
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
  const [rating, setRating] = useState(null);

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

  const handleSave = async () => {
    setSaving(true);
    await onSaveAsTemplate(recipe.recipe_name);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-2xl overflow-hidden">
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
        <div className="flex gap-3 mt-3 text-xs text-white/90 flex-wrap">
          {recipe.prep_time_minutes > 0 && <span>⏱ Prep: {recipe.prep_time_minutes}m</span>}
          {recipe.cook_time_minutes > 0 && <span>🔥 Cook: {recipe.cook_time_minutes}m</span>}
          {recipe.servings && <span>🍽 Serves {recipe.servings}</span>}
          {recipe.cuisine_type && <span>🌍 {recipe.cuisine_type}</span>}
        </div>
      </div>

      <div className="p-4 space-y-4">
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

        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold w-full">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide" : "Show"} full recipe
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">
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
              {recipe.tip && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-700"><span className="font-bold">💡 Chef tip:</span> {recipe.tip}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Star rating */}
        <div className="flex items-center justify-between py-1 border-t border-gray-50">
          <p className="text-xs text-gray-400">Rate this recipe</p>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)}
                className={`text-xl transition-transform hover:scale-110 ${rating >= star ? "text-amber-400" : "text-gray-200"}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={copyRecipe}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/70 text-gray-600 text-xs font-medium border border-gray-100 hover:bg-gray-50">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Recipe"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-rose-500 text-xs font-medium border border-rose-100 hover:bg-rose-100">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            Save Favourite
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RecipeGeneratorTab({ user }) {
  const [goal, setGoal] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [usualMeals, setUsualMeals] = useState([]);
  const [dietary, setDietary] = useState([]);
  const [cuisine, setCuisine] = useState("Any");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const toggleDietary = (d) => setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const generate = async (surpriseMe = false) => {
    setGenerating(true);
    setResult(null);
    setError(null);
    const res = await base44.functions.invoke("generateMealPlan", {
      mode: "recipe",
      wellness_goal: goal || undefined,
      ingredients: surpriseMe ? [] : ingredients,
      usual_meals: surpriseMe ? [] : usualMeals,
      dietary_preferences: dietary,
      cuisine_preference: cuisine !== "Any" ? cuisine : undefined,
      surprise_me: surpriseMe,
    });
    if (res.data?.error) setError(res.data.error);
    else setResult(res.data);
    setGenerating(false);
  };

  const handleSaveTemplate = async (name) => {
    await base44.entities.MealTemplates.create({ user_id: user.id, title: name, default_meal_type: "lunch" });
  };

  return (
    <div className="space-y-4">
      <div className="card-glass rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Recipe Generator</p>
            <p className="text-xs text-gray-400">AI-crafted recipes tailored to you</p>
          </div>
        </div>

        {/* Wellness Goal */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">🎯 Wellness Goal</p>
          <div className="flex flex-wrap gap-1.5">
            {WELLNESS_GOALS.map((g) => (
              <button key={g.id} onClick={() => setGoal(goal === g.id ? "" : g.id)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${goal === g.id ? "bg-rose-500 text-white shadow-sm" : "bg-white/70 text-gray-600 border border-rose-100 hover:bg-rose-50"}`}>
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
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${dietary.includes(d) ? "bg-emerald-500 text-white shadow-sm" : "bg-white/70 text-gray-600 border border-gray-100 hover:bg-emerald-50"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">🌍 Cuisine</p>
          <div className="flex flex-wrap gap-1.5">
            {CUISINES.map((c) => (
              <button key={c} onClick={() => setCuisine(c)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${cuisine === c ? "bg-amber-500 text-white shadow-sm" : "bg-white/70 text-gray-600 border border-gray-100 hover:bg-amber-50"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">🥦 Ingredients I have</p>
          <p className="text-[10px] text-gray-400 mb-2">Type & press Enter, or tap a suggestion</p>
          <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. chicken, spinach…" />
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).slice(0, 8).map((q) => (
              <button key={q} onClick={() => setIngredients([...ingredients, q])}
                className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                + {q}
              </button>
            ))}
          </div>
        </div>

        {/* Usual meals */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-1">🍽️ Meals I usually enjoy</p>
          <p className="text-[10px] text-gray-400 mb-2">The AI will take inspiration from these</p>
          <TagInput tags={usualMeals} setTags={setUsualMeals} placeholder="e.g. jollof rice, pasta…" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={() => generate(true)} disabled={generating}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50">
            <Shuffle className="w-4 h-4" /> Surprise Me
          </button>
          <button onClick={() => generate(false)} disabled={generating}
            className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><Sparkles className="w-4 h-4" /> Generate Recipe</>}
          </button>
        </div>

        {error && <p className="text-xs text-red-400 text-center bg-red-50 rounded-xl p-2">{error}</p>}
      </div>

      {result?.data && (
        <RecipeCard recipe={result.data} onSaveAsTemplate={handleSaveTemplate} />
      )}
    </div>
  );
}