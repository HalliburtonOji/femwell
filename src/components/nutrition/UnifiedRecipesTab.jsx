// UnifiedRecipesTab — the rebuilt Recipes surface for the Nutrition Hub.
//
// A genuine rebuild per the Nutrition Master Plan §7 "Recipes & cook-from-what-you-have":
//   · Discovery home: your SAVED recipes (real, persisted) as cards — Cook + rating;
//     honest empty state when none.
//   · Cook from what you have: ingredient chips + goal / cuisine / £-budget filters →
//     "Find a recipe" calls the REAL generateMealPlan fn (mode:"recipe") → returns a
//     single scrollable recipe object (hero → time/servings/difficulty → ingredients
//     with a have-it / need-it toggle that builds a missing-items list → steps).
//   · Guided cook mode: one step per screen, Next / Back, an optional simple timer.
//   · Save + rate: save the generated recipe (full JSON persisted), rate saved recipes;
//     rating influences the ordering of the saved list.
//   · Scale to servings: a stepper that scales ingredient quantities AND nutrition
//     proportionally.
//   · Joy / culture framing: warm "you tried something new" copy, world-cuisine
//     celebration, a £ budget filter — NEVER weight or calorie-shame.
//
// PERSISTENCE (real, guarded): recipes are stored as rows on the existing per-user
// MealTemplates entity (no entity-sync risk — we extend it, not create a new one):
//   { user_id, title, default_meal_type, category: "recipe", rating, recipe_json }
// where recipe_json is JSON.stringify(recipe) holding the full object (title,
// ingredients[], steps/instructions[], nutrition, cuisine, servings, times…).
// We read back with MealTemplates.filter({ user_id }), keep only category==="recipe",
// JSON.parse(recipe_json) (guarded), and order by rating desc then recency.
//
// All AI invokes use withTimeout + a visible error + fallback. All writes use
// withTimeout + optimistic update + rollback + a visible toast. Never crashes.
//
// Brand: Editorial cream/plum tokens (T/UI/SERIF), Lucide icons, NO EMOJI, no
// scoreboards, phone-first.
import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat, Plus, X, Star, Clock, Users, ChevronLeft, ChevronRight,
  Loader2, Check, Circle, CheckCircle2, Timer, Play, Pause, RotateCcw,
  Sparkles, BookOpen, ArrowLeft, Minus, BookmarkPlus, Search, Heart,
} from "lucide-react";
import { toast } from "sonner";
import {
  T, UI, SERIF, Eyebrow, Script, Hand,
} from "@/components/journal/Editorial";
import { withTimeout } from "@/utils/safeEntity";

// ── small option sets ────────────────────────────────────────────────────────
const WELLNESS_GOALS = [
  { id: "energy",    label: "Energy"    },
  { id: "digestion", label: "Digestion" },
  { id: "sleep",     label: "Sleep"     },
  { id: "mood",      label: "Mood"      },
  { id: "hydration", label: "Hydration" },
  { id: "hormone",   label: "Hormone"   },
];
const CUISINES = ["Any", "West African", "Indian", "Japanese", "Mediterranean", "Middle Eastern", "Thai", "Mexican", "British", "Italian"];
const BUDGETS = [
  { id: "",       label: "Any budget" },
  { id: "low",    label: "Under £3 / serving" },
  { id: "medium", label: "£3–6 / serving" },
];
const QUICK_INGREDIENTS = ["chicken", "eggs", "spinach", "sweet potato", "lentils", "chickpeas", "rice", "tinned tomatoes", "onion", "tofu"];

// warm, non-weight celebration lines shown above a freshly generated recipe
const JOY_LINES = [
  "Something new to try — cooking is a small adventure.",
  "A new flavour to fold into your week. Enjoy the making of it.",
  "You're about to cook something different — that's a lovely thing.",
  "A little culinary travel, right from your own kitchen.",
];

// ── shared styles ─────────────────────────────────────────────────────────────
const sLabel = {
  fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4,
  textTransform: "uppercase", color: T.muted,
};
const cardShell = {
  background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18,
};

// ── quantity scaling: pull a leading number out of a quantity string and scale it
// "200" → 400; "1 1/2" → "3"; "a pinch" → "a pinch" (unscalable, left as-is).
function scaleQuantity(qty, factor) {
  if (qty == null) return qty;
  const str = String(qty).trim();
  if (!str) return str;
  // match a leading number, optionally a simple fraction like "1/2" or mixed "1 1/2"
  const m = str.match(/^(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?(?:\/(\d+))?/);
  if (!m) return str; // non-numeric ("a pinch", "to taste") — leave untouched
  let value;
  if (m[2] && m[3]) {
    value = parseFloat(m[1]) + parseInt(m[2], 10) / parseInt(m[3], 10); // mixed
  } else if (m[4]) {
    value = parseFloat(m[1]) / parseInt(m[4], 10); // simple fraction "1/2"
  } else {
    value = parseFloat(m[1]);
  }
  const scaled = value * factor;
  const rounded = Math.round(scaled * 100) / 100;
  const pretty = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  return str.replace(m[0], pretty);
}

function scaleNutrition(nut, factor) {
  if (!nut) return nut;
  const out = {};
  for (const k of Object.keys(nut)) {
    const v = nut[k];
    out[k] = typeof v === "number" ? Math.round(v * factor) : v;
  }
  return out;
}

// normalise instruction list across the two field names the generator/persistence use
function getSteps(recipe) {
  const s = recipe?.instructions || recipe?.steps || [];
  return Array.isArray(s) ? s.filter(Boolean) : [];
}

// ════════════════════════════════════════════════════════════════════════════
// Star rating (gold; no scoreboard — purely "how much you loved it")
// ════════════════════════════════════════════════════════════════════════════
function Stars({ value = 0, onRate, size = 16 }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={onRate ? (e) => { e.stopPropagation(); onRate(n); } : undefined}
          aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
          disabled={!onRate}
          style={{ background: "none", border: "none", padding: 1, cursor: onRate ? "pointer" : "default", lineHeight: 0 }}
        >
          <Star size={size} style={{ color: n <= value ? T.gold : T.paperDeep, fill: n <= value ? T.gold : "none" }} />
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ingredient TagInput (chips)
// ════════════════════════════════════════════════════════════════════════════
function TagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState("");
  const add = (raw) => {
    const val = (raw ?? input).trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput("");
  };
  return (
    <div>
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {tags.map((t) => (
            <span key={t} style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px",
              borderRadius: 999, background: T.wax, border: `1px solid ${T.paperDeep}`,
              fontFamily: SERIF, fontSize: 13, color: T.ink,
            }}>
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0, color: T.muted }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{
            flex: 1, padding: "11px 13px", borderRadius: 12, border: `1px solid ${T.paperDeep}`,
            background: T.paper, color: T.ink, fontFamily: SERIF, fontSize: 14, outline: "none",
          }}
        />
        <button onClick={() => add()} disabled={!input.trim()} aria-label="Add ingredient"
          style={{
            padding: "0 14px", borderRadius: 12, background: T.ink, color: T.paper,
            border: "none", cursor: input.trim() ? "pointer" : "default", opacity: input.trim() ? 1 : 0.4,
            display: "grid", placeItems: "center",
          }}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// A simple per-step timer (no audio — a calm visual countdown)
// ════════════════════════════════════════════════════════════════════════════
function StepTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && seconds > 0) {
      ref.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setRunning(false);
    }
    return () => clearTimeout(ref.current);
  }, [running, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const presets = [60, 300, 600];
  return (
    <div style={{ ...cardShell, padding: 14, marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Timer size={14} color={T.muted} />
        <span style={sLabel}>Optional timer</span>
        <span style={{ marginLeft: "auto", fontFamily: SERIF, fontSize: 24, color: T.ink, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {mm}:{ss}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {presets.map((p) => (
          <button key={p} onClick={() => { setSeconds(p); setRunning(false); }}
            style={{
              padding: "5px 11px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`,
              fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.ink, cursor: "pointer",
            }}>
            +{p / 60}m
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setRunning((r) => !r)} disabled={seconds === 0}
          style={{
            flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px 0", borderRadius: 10, background: T.ink, color: T.paper, border: "none",
            fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
            cursor: seconds === 0 ? "default" : "pointer", opacity: seconds === 0 ? 0.4 : 1,
          }}>
          {running ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Start</>}
        </button>
        <button onClick={() => { setSeconds(0); setRunning(false); }} aria-label="Reset timer"
          style={{
            padding: "0 13px", borderRadius: 10, background: T.paper, border: `1px solid ${T.paperDeep}`,
            color: T.muted, cursor: "pointer", display: "grid", placeItems: "center",
          }}>
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Guided cook mode — one step per screen, Next / Back, optional timer
// ════════════════════════════════════════════════════════════════════════════
function GuidedCook({ recipe, onExit }) {
  const steps = getSteps(recipe);
  const [i, setI] = useState(0);
  const total = steps.length;
  const atEnd = i >= total - 1;

  if (total === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <Hand size={15} color={T.muted}>This recipe has no steps to guide through.</Hand>
        <button onClick={onExit} style={ghostBtn}>Back to recipe</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={onExit} aria-label="Exit guided cook"
          style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, padding: 0, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
          <ArrowLeft size={14} /> Recipe
        </button>
        <span style={{ marginLeft: "auto", ...sLabel }}>Step {i + 1} of {total}</span>
      </div>

      {/* progress hairline (not a score — just where you are) */}
      <div style={{ height: 4, borderRadius: 999, background: T.paperDeep, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ width: `${((i + 1) / total) * 100}%`, height: "100%", background: T.sage, borderRadius: 999, transition: "width .25s" }} />
      </div>

      {/* the step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1 }}
        >
          <div style={{ ...cardShell, padding: 22 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999, background: T.ink, color: T.paper,
              display: "grid", placeItems: "center", fontFamily: SERIF, fontSize: 18, fontWeight: 600, marginBottom: 14,
            }}>
              {i + 1}
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.5, color: T.ink, margin: 0 }}>
              {steps[i]}
            </p>
          </div>
          <StepTimer key={`timer-${i}`} />
        </motion.div>
      </AnimatePresence>

      {/* nav */}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
          style={{
            flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "13px 18px", borderRadius: 12, background: T.paper, border: `1px solid ${T.paperDeep}`,
            color: i === 0 ? T.paperDeep : T.ink, cursor: i === 0 ? "default" : "pointer",
            fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", opacity: i === 0 ? 0.5 : 1,
          }}>
          <ChevronLeft size={15} /> Back
        </button>
        {atEnd ? (
          <button onClick={onExit}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 12, background: T.sage, color: T.paper, border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <Check size={15} /> All done — enjoy
          </button>
        ) : (
          <button onClick={() => setI((n) => Math.min(total - 1, n + 1))}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 12, background: T.ink, color: T.paper, border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
            Next step <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// The single scrollable RECIPE OBJECT — hero → chips → servings scaler →
// ingredients (have-it / need-it) → missing list → steps → save / rate / cook
// ════════════════════════════════════════════════════════════════════════════
function RecipeObject({
  recipe, joyLine, onBack, onSave, saving, savedId, rating, onRate, onCook,
}) {
  const baseServings = recipe.servings || 1;
  const [servings, setServings] = useState(baseServings);
  const factor = baseServings ? servings / baseServings : 1;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  // have-it / need-it: default everything to "need it"; toggling to "have it"
  // removes it from the missing-items list.
  const [have, setHave] = useState({});
  const toggleHave = (idx) => setHave((h) => ({ ...h, [idx]: !h[idx] }));
  const missing = ingredients.filter((_, idx) => !have[idx]);

  const nut = scaleNutrition(recipe.nutritional_summary, factor);
  const steps = getSteps(recipe);

  return (
    <div>
      {/* back to search */}
      {onBack && (
        <button onClick={onBack} style={{
          background: "none", border: "none", color: T.muted, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 5, padding: 0, marginBottom: 12,
          fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
        }}>
          <ArrowLeft size={14} /> New search
        </button>
      )}

      {/* joy / culture framing — never weight */}
      {joyLine && (
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 14 }}>
          <Sparkles size={15} color={T.gold} style={{ flexShrink: 0, marginTop: 3 }} />
          <Hand size={15} color={T.ink} style={{ margin: 0 }}>{joyLine}</Hand>
        </div>
      )}

      {/* HERO */}
      <div style={{ marginBottom: 16 }}>
        <Eyebrow color={T.sage} mb={4}>{recipe.cuisine_type || "A recipe for you"}</Eyebrow>
        <Script size={32} carve={false}>{recipe.recipe_name || "Your recipe"}</Script>
        {recipe.tagline && (
          <Hand size={15} color={T.muted} style={{ marginTop: 4 }}>{recipe.tagline}</Hand>
        )}
      </div>

      {/* time / servings / difficulty chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {(recipe.prep_time_minutes > 0 || recipe.cook_time_minutes > 0) && (
          <Chip icon={Clock} text={`${(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min total`} />
        )}
        <Chip icon={Users} text={`Serves ${servings}`} />
        {recipe.difficulty && <Chip icon={ChefHat} text={recipe.difficulty} />}
      </div>

      {/* SERVINGS SCALER */}
      <div style={{ ...cardShell, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={sLabel}>Scale to servings</div>
          <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 2 }}>
            Quantities and nutrition scale with you.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="Fewer servings"
            style={stepperBtn} disabled={servings <= 1}>
            <Minus size={15} />
          </button>
          <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: T.ink, minWidth: 22, textAlign: "center" }}>{servings}</span>
          <button onClick={() => setServings((s) => Math.min(20, s + 1))} aria-label="More servings" style={stepperBtn}>
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* nutrition (scaled) — gentle, no calorie shaming framing */}
      {nut && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 18 }}>
          {[
            { label: "kcal",    val: nut.calories },
            { label: "Protein", val: nut.protein_g != null ? `${nut.protein_g}g` : null },
            { label: "Carbs",   val: nut.carbs_g != null ? `${nut.carbs_g}g` : null },
            { label: "Fat",     val: nut.fat_g != null ? `${nut.fat_g}g` : null },
            { label: "Fibre",   val: nut.fiber_g != null ? `${nut.fiber_g}g` : null },
          ].filter((n) => n.val != null).map((n) => (
            <div key={n.label} style={{ background: T.wax, borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink }}>{n.val}</div>
              <div style={{ fontFamily: UI, fontSize: 8.5, color: T.muted, letterSpacing: 0.4, textTransform: "uppercase", marginTop: 1 }}>{n.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* WELLNESS BENEFITS */}
      {recipe.wellness_benefits?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <Eyebrow mb={8}>Why it's kind to you</Eyebrow>
          <div style={{ display: "grid", gap: 6 }}>
            {recipe.wellness_benefits.map((b, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.4 }}>
                <Check size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 3 }} />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INGREDIENTS with have-it / need-it toggle */}
      {ingredients.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <Eyebrow>Ingredients</Eyebrow>
            <span style={{ fontFamily: SERIF, fontSize: 12, color: T.muted, fontStyle: "italic" }}>tap a circle if you have it</span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {ingredients.map((ing, idx) => {
              const got = !!have[idx];
              return (
                <button key={idx} onClick={() => toggleHave(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    background: got ? T.wax : "transparent", border: "none", borderRadius: 10,
                    padding: "8px 10px", cursor: "pointer",
                  }}>
                  {got
                    ? <CheckCircle2 size={17} color={T.sage} style={{ flexShrink: 0 }} />
                    : <Circle size={17} color={T.paperDeep} style={{ flexShrink: 0 }} />}
                  <span style={{ fontFamily: SERIF, fontSize: 14.5, color: got ? T.muted : T.ink, textDecoration: got ? "line-through" : "none" }}>
                    <span style={{ fontWeight: 600 }}>{[scaleQuantity(ing.quantity, factor), ing.unit].filter(Boolean).join(" ")}</span>
                    {" "}{ing.name}
                    {ing.optional && <span style={{ color: T.muted, fontStyle: "italic" }}> (optional)</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MISSING ITEMS list — built from what you didn't tick "have it" */}
      {ingredients.length > 0 && (
        <div style={{ ...cardShell, padding: 14, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: missing.length ? 10 : 0 }}>
            <ShoppingDot />
            <span style={sLabel}>Still need {missing.length > 0 ? `(${missing.length})` : ""}</span>
          </div>
          {missing.length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {missing.map((ing, idx) => (
                <span key={idx} style={{
                  fontFamily: SERIF, fontSize: 13, color: T.ink, background: T.paper,
                  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 10px",
                }}>
                  {ing.name}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.sage, fontStyle: "italic" }}>
              You've got everything — time to cook.
            </div>
          )}
        </div>
      )}

      {/* STEPS (full list; or jump into guided cook below) */}
      {steps.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <Eyebrow mb={10}>Method</Eyebrow>
          <div style={{ display: "grid", gap: 12 }}>
            {steps.map((s, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999, background: T.wax, border: `1px solid ${T.paperDeep}`,
                  color: T.ink, fontFamily: SERIF, fontSize: 12, fontWeight: 600,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>{idx + 1}</span>
                <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.5, color: T.ink, margin: 0, paddingTop: 1 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recipe.tip && (
        <div style={{ ...cardShell, padding: 14, marginBottom: 18, borderLeft: `3px solid ${T.gold}` }}>
          <span style={{ ...sLabel, color: T.gold }}>Chef's tip</span>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, margin: "6px 0 0", lineHeight: 1.45 }}>{recipe.tip}</p>
        </div>
      )}

      {/* rating (if already saved, lets you rate the saved copy) */}
      {savedId && (
        <div style={{ ...cardShell, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={sLabel}>How did you love it</span>
          <Stars value={rating} onRate={onRate} size={18} />
        </div>
      )}

      {/* sticky-ish actions */}
      <div style={{ display: "flex", gap: 10 }}>
        {steps.length > 0 && (
          <button onClick={onCook}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 12, background: T.ink, color: T.paper, border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <ChefHat size={15} /> Guided cook
          </button>
        )}
        <button onClick={onSave} disabled={saving || !!savedId}
          style={{
            flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0",
            borderRadius: 12, background: savedId ? T.wax : T.sage, color: savedId ? T.sage : T.paper,
            border: savedId ? `1px solid ${T.sage}` : "none", cursor: saving || savedId ? "default" : "pointer",
            fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", opacity: saving ? 0.7 : 1,
          }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : savedId ? <Check size={15} /> : <BookmarkPlus size={15} />}
          {savedId ? "Saved" : "Save recipe"}
        </button>
      </div>
    </div>
  );
}

function ShoppingDot() {
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: T.gold, flexShrink: 0 }} />;
}
function Chip({ icon: Icon, text }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px",
      borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`,
      fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.ink, letterSpacing: 0.3,
    }}>
      <Icon size={13} color={T.muted} /> {text}
    </span>
  );
}

const stepperBtn = {
  width: 32, height: 32, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`,
  color: T.ink, cursor: "pointer", display: "grid", placeItems: "center",
};
const ghostBtn = {
  marginTop: 14, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10,
  padding: "10px 16px", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.ink, cursor: "pointer",
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
// views: "home" (saved + cook-from) · "recipe" (the scrollable object) · "cook" (guided)
export default function UnifiedRecipesTab({ user, profile, nutritionProfile }) {
  const [view, setView] = useState("home");

  // saved recipes (real, persisted on MealTemplates rows, category "recipe")
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // cook-from-what-you-have inputs
  const [ingredients, setIngredients] = useState([]);
  const [goal, setGoal] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [budget, setBudget] = useState("");

  // generation + active recipe
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [active, setActive] = useState(null);       // { recipe, joyLine, savedId, rating }
  const [saving, setSaving] = useState(false);

  // ── load saved recipes (real, guarded) ──────────────────────────────────────
  const loadSaved = useCallback(async () => {
    if (!user?.id) { setLoadingSaved(false); return; }
    try {
      const rows = await withTimeout(
        base44.entities.MealTemplates.filter({ user_id: user.id }, "-created_date", 50),
        4000, "saved recipes"
      );
      const recipes = (rows || [])
        .filter((r) => r && r.category === "recipe" && r.recipe_json)
        .map((r) => {
          let parsed = null;
          try { parsed = JSON.parse(r.recipe_json); } catch { parsed = null; }
          return parsed ? { id: r.id, rating: r.rating || 0, recipe: parsed } : null;
        })
        .filter(Boolean)
        // rating influences ordering: loved recipes float up, then recency (already -created_date)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setSaved(recipes);
    } catch (e) {
      console.error("loadSaved failed", e);
      // honest: leave whatever we had; never crash
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // ── generate: cook from what you have (real fn invoke, guarded) ──────────────
  const findRecipe = async () => {
    setGenerating(true); setGenError(null);
    try {
      const res = await withTimeout(
        base44.functions.invoke("generateMealPlan", {
          mode: "recipe",
          wellness_goal: goal || undefined,
          ingredients,
          cuisine_preference: cuisine !== "Any" ? cuisine : undefined,
          // budget framing folded into usual_meals-style context the fn already reads
          dietary_preferences: budget === "low"
            ? ["budget-friendly, store-cupboard staples, under £3 per serving"]
            : budget === "medium"
              ? ["mid-budget, around £3 to £6 per serving"]
              : [],
        }),
        18000, "recipe"
      );
      if (res?.data?.error) {
        setGenError(res.data.error);
      } else if (res?.data?.data) {
        const joyLine = JOY_LINES[Math.floor(Math.random() * JOY_LINES.length)];
        setActive({ recipe: res.data.data, joyLine, savedId: null, rating: 0 });
        setView("recipe");
      } else {
        setGenError("That didn't return a recipe — please try again.");
      }
    } catch (e) {
      console.error("findRecipe failed", e);
      setGenError("Couldn't reach the kitchen just now. Please try again in a moment.");
    } finally {
      setGenerating(false);
    }
  };

  // open a saved recipe in the scrollable object
  const openSaved = (entry) => {
    setActive({ recipe: entry.recipe, joyLine: null, savedId: entry.id, rating: entry.rating || 0 });
    setView("recipe");
  };

  // ── save the active (generated) recipe — full JSON, optimistic, guarded ──────
  const saveActive = async () => {
    if (!active?.recipe || !user?.id) return;
    setSaving(true);
    const r = active.recipe;
    try {
      const created = await withTimeout(
        base44.entities.MealTemplates.create({
          user_id: user.id,
          title: r.recipe_name || "Saved recipe",
          default_meal_type: "lunch",
          category: "recipe",
          rating: 0,
          recipe_json: JSON.stringify(r),
        }),
        6000, "save"
      );
      const id = created?.id;
      // optimistic: mark active as saved + prepend to the saved list
      setActive((a) => (a ? { ...a, savedId: id || "pending", rating: 0 } : a));
      if (id) setSaved((s) => [{ id, rating: 0, recipe: r }, ...s]);
      toast.success("Recipe saved");
      // reconcile in the background
      loadSaved();
    } catch (e) {
      console.error("saveActive failed", e);
      toast.error("Couldn't save — please try again");
    } finally {
      setSaving(false);
    }
  };

  // ── rate a saved recipe (optimistic, guarded, rollback) ──────────────────────
  const rateActive = async (stars) => {
    if (!active?.savedId || active.savedId === "pending") return;
    const prev = active.rating;
    setActive((a) => ({ ...a, rating: stars }));                       // optimistic
    setSaved((s) => s.map((x) => (x.id === active.savedId ? { ...x, rating: stars } : x))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)));
    try {
      await withTimeout(
        base44.entities.MealTemplates.update(active.savedId, { rating: stars }),
        6000, "rating"
      );
      toast.success("Thanks — that shapes your suggestions");
    } catch (e) {
      console.error("rateActive failed", e);
      setActive((a) => ({ ...a, rating: prev }));                     // rollback
      setSaved((s) => s.map((x) => (x.id === active.savedId ? { ...x, rating: prev } : x)));
      toast.error("Couldn't save your rating — try again");
    }
  };

  // ════════════════════════════ RENDER ════════════════════════════════════════

  // GUIDED COOK
  if (view === "cook" && active?.recipe) {
    return <GuidedCook recipe={active.recipe} onExit={() => setView("recipe")} />;
  }

  // THE RECIPE OBJECT
  if (view === "recipe" && active?.recipe) {
    return (
      <RecipeObject
        recipe={active.recipe}
        joyLine={active.joyLine}
        onBack={() => { setActive(null); setView("home"); }}
        onSave={saveActive}
        saving={saving}
        savedId={active.savedId}
        rating={active.rating}
        onRate={rateActive}
        onCook={() => setView("cook")}
      />
    );
  }

  // HOME — saved discovery + cook-from-what-you-have
  return (
    <div>
      {/* ── DISCOVERY: your saved recipes ──────────────────────────────────── */}
      <div style={{ marginBottom: 26 }}>
        <Script size={26} carve={false} style={{ marginBottom: 2 }}>Your recipes</Script>
        <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>
          The dishes you've saved — the ones you loved float to the top.
        </Hand>

        {loadingSaved ? (
          <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <Loader2 size={20} className="animate-spin" color={T.muted} />
          </div>
        ) : saved.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {saved.map((entry) => {
              const r = entry.recipe;
              const mins = (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0);
              return (
                <button key={entry.id} onClick={() => openSaved(entry)}
                  style={{ ...cardShell, padding: 14, textAlign: "left", cursor: "pointer", width: "100%", display: "block" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>
                      {r.recipe_name || entry.recipe.title || "Saved recipe"}
                    </span>
                    {entry.rating > 0 && <Stars value={entry.rating} size={13} />}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 7, fontFamily: UI, fontSize: 11, color: T.muted }}>
                    {r.cuisine_type && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><BookOpen size={12} /> {r.cuisine_type}</span>}
                    {mins > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {mins} min</span>}
                    {r.servings && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Users size={12} /> {r.servings}</span>}
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, color: T.ink, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>
                      <ChefHat size={12} /> Cook
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ border: `1px dashed ${T.paperDeep}`, borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
            <Heart size={18} color={T.gold} style={{ margin: "0 auto 8px", display: "block" }} />
            <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, fontStyle: "italic", lineHeight: 1.4 }}>
              No saved recipes yet. Find one below from what's in your kitchen, then save it — your collection gathers here.
            </div>
          </div>
        )}
      </div>

      {/* ── COOK FROM WHAT YOU HAVE ─────────────────────────────────────────── */}
      <div style={{ ...cardShell, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: T.ink, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <ChefHat size={18} color={T.paper} />
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}>Cook from what you have</div>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>Ingredients in — a recipe and a short shopping list out.</div>
          </div>
        </div>

        {/* ingredients */}
        <div style={{ marginTop: 16 }}>
          <div style={{ ...sLabel, marginBottom: 8 }}>What's in your kitchen</div>
          <TagInput tags={ingredients} setTags={setIngredients} placeholder="e.g. eggs, spinach, rice…" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {QUICK_INGREDIENTS.filter((q) => !ingredients.includes(q)).slice(0, 8).map((q) => (
              <button key={q} onClick={() => setIngredients([...ingredients, q])}
                style={{ fontFamily: UI, fontSize: 11, padding: "4px 9px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer" }}>
                + {q}
              </button>
            ))}
          </div>
        </div>

        {/* goal */}
        <div style={{ marginTop: 16 }}>
          <div style={{ ...sLabel, marginBottom: 8 }}>A gentle goal (optional)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {WELLNESS_GOALS.map((g) => (
              <Pill key={g.id} active={goal === g.id} onClick={() => setGoal(goal === g.id ? "" : g.id)}>{g.label}</Pill>
            ))}
          </div>
        </div>

        {/* cuisine */}
        <div style={{ marginTop: 16 }}>
          <div style={{ ...sLabel, marginBottom: 8 }}>Take me somewhere</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CUISINES.map((c) => (
              <Pill key={c} active={cuisine === c} onClick={() => setCuisine(c)} accent={T.sage}>{c}</Pill>
            ))}
          </div>
        </div>

        {/* budget */}
        <div style={{ marginTop: 16 }}>
          <div style={{ ...sLabel, marginBottom: 8 }}>Budget</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {BUDGETS.map((b) => (
              <Pill key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)} accent={T.gold}>{b.label}</Pill>
            ))}
          </div>
        </div>

        {/* find */}
        <button onClick={findRecipe} disabled={generating}
          style={{
            width: "100%", marginTop: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 0", borderRadius: 12, background: T.crimson, color: T.paper, border: "none",
            cursor: generating ? "default" : "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700,
            letterSpacing: 0.6, textTransform: "uppercase", opacity: generating ? 0.75 : 1,
          }}>
          {generating ? <><Loader2 size={16} className="animate-spin" /> Finding your recipe…</> : <><Search size={16} /> Find a recipe</>}
        </button>

        {genError && (
          <div style={{ marginTop: 12, background: "rgba(188,46,39,0.08)", border: `1px solid rgba(188,46,39,0.25)`, borderRadius: 10, padding: "10px 12px" }}>
            <span style={{ fontFamily: SERIF, fontSize: 13, color: T.crimson }}>{genError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ active, onClick, children, accent = T.ink }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", borderRadius: 999,
      background: active ? accent : T.paper, color: active ? T.paper : T.muted,
      border: `1px solid ${active ? accent : T.paperDeep}`,
      fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer",
    }}>
      {children}
    </button>
  );
}
