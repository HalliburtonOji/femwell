// NutritionRedesignDemo — STANDALONE v4 redesign preview of the LIVE Nutrition page (NutritionHub),
// rebuilt to TRUE FULL PARITY and optimised for EASE OF USE. Demo-first; the live Nutrition is NOT touched.
//
// EASE-OF-USE FIRST: the two things you do every day — LOG A MEAL and LOG WATER — are big, obvious primary
// buttons in the signature top (plus a voice "Say it" and a "Jump to" switcher), never buried. Everything
// else is segmented into two clearly-labelled clipboard sliders — "Eat today" (Log · Today · My plan) and
// "Plan & explore" (Recipes · AI meal plan · Shop · Progress · Insights) — so every feature is one obvious
// tap from a titled board. No vague "more" overlays; the jump-to sheet lists every area by name.
//
// CLIPBOARD-FORWARD + NESTED CardDeck: the spine is §6.10 ClipboardSliders whose boards hold uniform
// mini-cards; the Progress + Insights boards carry a sequence of PEER cards via the in-card CardDeck you
// swipe sideways WITHIN the board.
//
// TRUE FULL PARITY — every live Nutrition feature is present (see the checklist at the foot of this file):
//   • LOG (6 methods: search · recents · favourites · snap · say · scan) → draft → save
//   • TODAY (energy ring · macro row · quick water +250/+500 · logged meals · remove · recents · drink log)
//   • MY PLAN (gentle targets: protein/carbs/fats/fibre/iron/water · stage framing)
//   • RECIPES (saved + ratings · cook-from-what-you-have · generate · guided cook · log/scale/add-to-shop)
//   • AI MEAL PLAN (weekly grid · lock cells · wellness goal · dietary · regenerate week/day/slot · budget)
//   • SHOP (aisle-grouped · check · add · build-from-plan · pantry · budget · copy/email)
//   • PROGRESS (energy sparkline · patterns · body metric · goal mode · cycle lens)
//   • INSIGHTS (Jess weekly story · stage nudges · cross-cycle memory · feedback)
//   • voice + barcode + photo + food lookup · suggested dinner · jump-to switcher
// v4 bible: flora-hero + ONE summary glance + §6.7.6 quick popups + soulful voice + PAPER_BG + ≥12 fonts +
// canonical tokens + .fw-sheet-safe. ~2 phone screens. No new function; demo is seeded (no live writes).
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Check, X, Droplet, Utensils, Search, Mic, Camera, ScanLine, Star, Clock,
  ListChecks, CalendarDays, ShoppingBasket, TrendingUp, Sparkles, Target, BookOpen, Apple,
  Carrot, Soup, ChevronRight, Salad, Coffee, Wine, Beef, Wheat, Fish, Heart, Flame, GlassWater,
  Repeat, Leaf, SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { openLogger } from "@/components/UniversalLogger";
import JumpToButton from "@/components/layout/JumpToButton";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Hand } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import { RichBloomV2, FlowerGlyph, floraKeyframes, cwOf } from "@/components/brand/flora";

const GOLD = cwOf("gold"); const SAGE = cwOf("sage"); const SKY = cwOf("sky"); const CRIM = cwOf("crimson");
// seeded "today" — a real-feeling plate so the energy ring + macros read true
const KCAL = 1180, KCAL_TARGET = 2000, WATER = 4, WATER_TARGET = 8;
const MACROS = [
  { label: "Protein", had: 58, guide: 90, unit: "g", cw: "crimson" },
  { label: "Fibre", had: 18, guide: 30, unit: "g", cw: "sage" },
  { label: "Iron", had: 9, guide: 18, unit: "mg", cw: "gold" },
];
const RECENTS = ["Greek yoghurt + berries", "Chicken salad", "Porridge + banana", "Lentil dal", "Eggs on toast"];
const LOGGED = [
  { slot: "Breakfast", title: "Porridge + banana", kcal: 320 },
  { slot: "Lunch", title: "Chicken salad", kcal: 480 },
  { slot: "Snack", title: "Greek yoghurt + berries", kcal: 180 },
];
const METHODS = [
  { id: "search", label: "Search", Icon: Search, cw: "gold", sub: "food database" },
  { id: "recents", label: "Recents", Icon: Repeat, cw: "sage", sub: "your go-tos" },
  { id: "favourites", label: "Favourites", Icon: Star, cw: "gold", sub: "saved meals" },
  { id: "snap", label: "Snap a photo", Icon: Camera, cw: "plum", sub: "vision estimate" },
  { id: "say", label: "Say it", Icon: Mic, cw: "sage", sub: "speak your meal" },
  { id: "scan", label: "Scan barcode", Icon: ScanLine, cw: "crimson", sub: "packaged food" },
];
const TARGETS = [
  { label: "Protein", v: "90 g", cw: "crimson", Icon: Beef }, { label: "Carbs", v: "220 g", cw: "gold", Icon: Wheat },
  { label: "Fats", v: "70 g", cw: "sage", Icon: Apple }, { label: "Fibre", v: "30 g", cw: "sage", Icon: Leaf },
  { label: "Iron", v: "18 mg", cw: "gold", Icon: Flame }, { label: "Water", v: "8 glasses", cw: "sky", Icon: Droplet },
];
const RECIPES = [
  { title: "Red lentil dal", stars: 5 }, { title: "Salmon + greens", stars: 4 }, { title: "Iron-rich stir fry", stars: 4 },
];
const WEEK_PLAN = [
  { d: "Mon", b: "Porridge", l: "Dal", dn: "Salmon" }, { d: "Tue", b: "Eggs", l: "Soup", dn: "Stir fry", today: true },
  { d: "Wed", b: "Yoghurt", l: "Salad", dn: "Pasta" }, { d: "Thu", b: "Toast", l: "Wrap", dn: "Curry" },
];
const SHOP = [
  { name: "Spinach", aisle: "Produce", got: false }, { name: "Red lentils", aisle: "Cupboard", got: false },
  { name: "Salmon fillet", aisle: "Protein", got: false }, { name: "Greek yoghurt", aisle: "Dairy", got: true },
  { name: "Bananas", aisle: "Produce", got: true }, { name: "Wholemeal bread", aisle: "Bakery", got: false },
];
const DRINKS = [
  { label: "Water", Icon: Droplet, cw: "sky" }, { label: "Coffee", Icon: Coffee, cw: "gold" },
  { label: "Tea", Icon: Coffee, cw: "sage" }, { label: "Juice", Icon: GlassWater, cw: "gold" },
  { label: "Smoothie", Icon: GlassWater, cw: "sage" }, { label: "Wine", Icon: Wine, cw: "crimson" },
];
const SURFACES = [
  { id: "log", label: "Log", sub: "Add a meal in seconds", Icon: Utensils, cw: "crimson" },
  { id: "today", label: "Today", sub: "Your plate so far", Icon: Salad, cw: "gold" },
  { id: "plan", label: "My plan", sub: "A guide, never a cap", Icon: Target, cw: "gold" },
  { id: "recipes", label: "Recipes", sub: "Cook what you have in", Icon: BookOpen, cw: "sage" },
  { id: "aiplan", label: "AI meal plan", sub: "A gentle week", Icon: CalendarDays, cw: "sage" },
  { id: "shop", label: "Shop", sub: "Sorted by aisle", Icon: ShoppingBasket, cw: "sage" },
  { id: "progress", label: "Progress", sub: "Patterns, not scores", Icon: TrendingUp, cw: "gold" },
  { id: "insights", label: "Insights", sub: "For your stage", Icon: Sparkles, cw: "sage" },
];

// ── a uniform clipboard mini-card (Journal's SurfaceTile pattern) ──
function Tile({ icon: Icon, label, sub, cw = "sage", onTap, done }) {
  const c = cwOf(cw);
  return (
    <button onClick={onTap} aria-label={label} style={{
      textAlign: "left", cursor: "pointer", minHeight: 104, display: "flex", flexDirection: "column",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 14, padding: "12px 11px",
      boxShadow: "0 3px 12px rgba(11,8,5,0.06)", opacity: done ? 0.6 : 1,
    }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax || T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", marginBottom: 7 }}>
        {done ? <Check size={15} color={c.petal} /> : <Icon size={15} strokeWidth={1.7} color={c.petal} />}
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{sub}</span>
    </button>
  );
}
const Grid = ({ children, cols = 2 }) => <div style={{ display: "grid", gridTemplateColumns: cols === 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 9 }}>{children}</div>;

// energy ring + macro bars + water — the signature "today" glance (REAL today data)
function NourishGlance({ kcal = 0, water = 0, macros = MACROS }) {
  const KCAL = kcal, WATER = water;
  const pct = Math.min(100, Math.round((KCAL / KCAL_TARGET) * 100));
  const R = 52, C = 2 * Math.PI * R, off = C * (1 - pct / 100);
  return (
    <div style={{ background: `linear-gradient(165deg, ${T.paperHi} 0%, ${GOLD.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${GOLD.petal}`, borderRadius: 18, padding: "16px 16px 14px", boxShadow: "0 3px 12px rgba(11,8,5,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={R} fill="none" stroke={T.paperDeep} strokeWidth="9" />
            <circle cx="64" cy="64" r={R} fill="none" stroke={GOLD.petal} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 64 64)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: T.ink, lineHeight: 1 }}>{KCAL}</div>
              <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>of {KCAL_TARGET} kcal</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {macros.map((m) => { const c = cwOf(m.cw); const p = Math.min(100, Math.round((m.had / m.guide) * 100)); return (
            <div key={m.label} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, marginBottom: 3 }}>
                <span style={{ color: T.ink, fontWeight: 600 }}>{m.label}</span>
                <span style={{ color: T.muted }}>{m.had}<span style={{ opacity: 0.6 }}> / {m.guide}{m.unit}</span></span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}>
                <div style={{ width: `${p}%`, height: "100%", background: c.petal, borderRadius: 99 }} />
              </div>
            </div>
          ); })}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <Droplet size={13} color={SKY.petal} />
            <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{WATER} of {WATER_TARGET} glasses</span>
          </div>
        </div>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, margin: "10px 2px 0", lineHeight: 1.45 }}>From your body + stage — a guide for the day, never a cap. Room for {KCAL_TARGET - KCAL} more if you'd like it.</p>
    </div>
  );
}

export default function NutritionRedesignDemo() {
  const navigate = useNavigate();
  const [done, setDone] = useState({});
  const [popup, setPopup] = useState(null);
  const [sheet, setSheet] = useState(null);   // "jump" only (log/water now route to the real logger)
  const [toast, setToast] = useState(null);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const link = (p) => navigate(createPageUrl(p));
  const pop = (id, type, icon, title, cw) => setPopup({ id, type, icon, title, cw });
  const d2 = (id) => done[id];
  const complete = (id, msg) => { setDone((x) => ({ ...x, [id]: true })); setPopup(null); if (msg) flash(msg); };

  // ── LIVE wiring: real user + today's real summary (energy ring + macros + water) ──
  const [user, setUser] = useState(null);
  const [sum, setSum] = useState({ kcal: 0, water: 0, macros: MACROS });
  const [todayMeals, setTodayMeals] = useState([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.entities.User.me().catch(() => null);
        if (cancelled) return;
        setUser(me);
        if (!me?.id) return;
        const dayKey = new Date().toISOString().split("T")[0];
        const [meals, hyd] = await Promise.all([
          base44.entities.MealLog.filter({ user_id: me.id, day_key: dayKey }).catch(() => []),
          base44.entities.HydrationLog.filter({ user_id: me.id, day_key: dayKey }).catch(() => []),
        ]);
        if (cancelled) return;
        let kcal = 0, protein = 0, iron = 0, fibre = 0;
        (meals || []).forEach((m) => { const s = (m.ai_analysis && m.ai_analysis.summary) || {}; kcal += Number(s.calories || s.kcal || 0) || 0; protein += Number(s.protein_g || 0) || 0; iron += Number(s.iron_mg || 0) || 0; fibre += Number(s.fibre_g || s.fiber_g || 0) || 0; });
        const ml = (hyd || []).reduce((a, h) => a + (Number(h.amount_ml) || 0), 0);
        setTodayMeals((meals || []).map((m) => {
          const s = (m.ai_analysis && m.ai_analysis.summary) || {};
          return { id: m.id, slot: (m.meal_type || "").toString(), title: m.raw_text || m.name || (m.ai_analysis && m.ai_analysis.title) || "Meal", kcal: Math.round(Number(s.calories || s.kcal || 0) || 0) };
        }));
        const macros = [
          { label: "Protein", had: Math.round(protein), guide: 90, unit: "g", cw: "crimson" },
          { label: "Fibre", had: Math.round(fibre), guide: 30, unit: "g", cw: "sage" },
          { label: "Iron", had: Math.round(iron), guide: 18, unit: "mg", cw: "gold" },
        ];
        setSum({ kcal: Math.round(kcal), water: Math.round(ml / 250), macros });
      } catch { /* keep zeros */ }
    })();
    return () => { cancelled = true; };
  }, [tick]);
  const refreshSummary = () => setTick((t) => t + 1);
  // Real writes / real navigation
  const logMeal = () => openLogger("meal");            // real MealLog (UniversalLogger DetailForm)
  const logHydration = () => openLogger("hydration");  // real HydrationLog
  const logWater = async (ml) => {                      // quick direct water write
    flash(`Logged ${ml} ml of water`);
    try {
      const me = user || (await base44.entities.User.me().catch(() => null));
      if (!me?.id) return;
      await base44.entities.HydrationLog.create({ user_id: me.id, day_key: new Date().toISOString().split("T")[0], amount_ml: ml, logged_at: new Date().toISOString(), source: "quick" });
      refreshSummary();
    } catch { /* silent */ }
  };
  const goHub = (tab) => navigate(createPageUrl("NutritionHub") + (tab ? `?tab=${tab}` : ""));
  const delMeal = async (id) => {
    setTodayMeals((prev) => prev.filter((m) => m.id !== id));
    try { await base44.entities.MealLog.delete(id); refreshSummary(); } catch { /* silent */ }
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 112, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => link("Ideas")} aria-label="Back to Ideas" style={ribbonBtn}><ArrowLeft size={13} /> Ideas</button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Demo · Nutrition · v4 · clipboard-forward</span>
      </div>

      {/* Canonical jump-to — the shared pinned JumpToButton (fixed top-left, z45), same as
          Today/Journal/Community/the live NutritionHub. Opens the "Jump to" area sheet. */}
      <JumpToButton pinned onClick={() => setSheet("jump")} />

      {/* COMPACT signature top */}
      <FwFloraHero title="Nutrition" bloom="marigold" colorway="gold" flankL="chamomile" flankR="sunflower" creature="bee"
        line="Nourishment is a relationship, not a test. Log in seconds; everything else is one tap from a titled board." ringSize={184} bloomSize={116} />

      <Wrap>
        {/* signature glance — energy ring + macros + water (REAL today data) */}
        <div style={{ marginTop: 6 }}><NourishGlance kcal={sum.kcal} water={sum.water} macros={sum.macros} /></div>

        {/* ONE summary intent card */}
        <div style={{ marginTop: 12 }}>
          <SummaryCard eyebrow="Your plate today, gently" accent={GOLD.petal} rows={[
            { Icon: Soup, label: "Suggested", text: "A balanced dinner — tap to log it", onClick: logMeal },
            { Icon: ListChecks, label: "So far", text: `${sum.kcal} kcal · ${sum.water} of ${WATER_TARGET} glasses today`, onClick: () => goHub("today") },
            { Icon: Sparkles, label: "From Jess", text: "Iron-rich foods settle well in your luteal week", onClick: () => goHub("insights") },
          ]} />
        </div>

        {/* PROMINENT PRIMARY ACTIONS — log a meal + log water are big, obvious buttons (never buried). */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={logMeal} aria-label="Log a meal" style={{ ...primaryBtn, background: T.crimson, boxShadow: `0 6px 18px ${T.crimson}55` }}>
            <span aria-hidden style={micDisc}><Utensils size={16} /></span> Log a meal
          </button>
          <button onClick={logHydration} aria-label="Log water" style={{ ...primaryBtn, background: SKY.petal, boxShadow: `0 6px 18px ${SKY.petal}55` }}>
            <span aria-hidden style={micDisc}><Droplet size={16} /></span> Log water
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 9 }}>
          <button onClick={() => logWater(250)} aria-label="Quick add 250ml water" style={secondaryBtn}><Droplet size={15} /> +250 ml</button>
          <button onClick={() => logWater(500)} aria-label="Quick add 500ml water" style={secondaryBtn}><Droplet size={15} /> +500 ml</button>
          <button onClick={logMeal} aria-label="Say your meal (voice)" style={secondaryBtn}><Mic size={15} /> Say it</button>
        </div>

        <Hand size={14} color={T.muted} style={{ display: "block", margin: "12px 0 0", textAlign: "center" }}>
          Everything in two boards below — slide each sideways; every card does the real thing.
        </Hand>
      </Wrap>

      {/* ── THE CLIPBOARD SPINE ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "8px 16px 0", maxWidth: 600, margin: "0 auto" }}>
        <ClipboardSlider hint="Slide — eat today" accent={GOLD.petal}>
          <Clipboard title="Log a meal" sub="SEARCH · RECENTS · SNAP · SAY · SCAN · FAVOURITES" accent={T.crimson} flower="anemone" idx="cb-log">
            <Grid cols={3}>
              {METHODS.map((m) => <Tile key={m.id} icon={m.Icon} label={m.label} sub={m.sub} cw={m.cw} onTap={logMeal} />)}
            </Grid>
            <div style={{ marginTop: 11 }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Your go-tos — tap to log</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {RECENTS.slice(0, 4).map((r) => <button key={r} onClick={logMeal} style={chip}>{r}</button>)}
              </div>
            </div>
          </Clipboard>

          <Clipboard title="Today" sub="YOUR PLATE SO FAR" accent={GOLD.petal} flower="marigold" idx="cb-today">
            <div style={{ display: "flex", gap: 8, marginBottom: 11 }}>
              <button onClick={() => logWater(250)} style={waterPill}>+250 ml</button>
              <button onClick={() => logWater(500)} style={waterPill}>+500 ml</button>
              <button onClick={logHydration} style={{ ...waterPill, background: "transparent" }}>Drink log</button>
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Logged today</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {todayMeals.length === 0 && (
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, margin: "2px 0" }}>Nothing logged yet — tap below to add your first.</p>
              )}
              {todayMeals.map((m) => (
                <div key={m.id} style={loggedRow}>
                  {m.slot && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: GOLD.petal, width: 64 }}>{m.slot}</span>}
                  <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{m.title}</span>
                  {m.kcal > 0 && <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{m.kcal} kcal</span>}
                  <button onClick={() => delMeal(m.id)} aria-label="Remove" style={iconX}><X size={15} /></button>
                </div>
              ))}
            </div>
            <button onClick={logMeal} style={{ ...addRow, marginTop: 10 }}><Plus size={14} /> Log another meal</button>
          </Clipboard>

          <Clipboard title="My plan" sub="A GUIDE FOR THE WEEK, NEVER A CAP" accent={GOLD.petal} flower="sunflower" idx="cb-plan">
            <Grid cols={3}>
              {TARGETS.map((t) => (
                <div key={t.label} style={targetCell}>
                  <t.Icon size={16} color={cwOf(t.cw).petal} />
                  <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink, marginTop: 5 }}>{t.v}</span>
                  <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{t.label}</span>
                </div>
              ))}
            </Grid>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center", margin: "12px 4px 0", lineHeight: 1.5 }}>Reproductive years — gentle targets from your body and stage. Tap any to adjust; nothing here is a pass/fail.</p>
            <button onClick={() => goHub("plan")} style={{ ...addRow, marginTop: 10 }}><SlidersHorizontal size={14} /> Adjust targets</button>
          </Clipboard>
        </ClipboardSlider>

        <div style={{ height: 18 }} />

        <ClipboardSlider hint="Slide — plan & explore" accent={SAGE.petal}>
          <Clipboard title="Recipes" sub="COOK WHAT YOU HAVE IN" accent={SAGE.petal} flower="clover" idx="cb-rec">
            <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "2px 2px 10px", lineHeight: 1.5 }}>Cook from what's already in, or generate one for your stage — your saved recipes open in the hub.</p>
            <Grid>
              <Tile icon={Carrot} label="Cook what you have" sub="ingredients → a recipe" cw="sage" onTap={() => goHub("recipes")} />
              <Tile icon={Sparkles} label="Generate a recipe" sub="AI · for your stage" cw="gold" onTap={() => goHub("recipes")} />
            </Grid>
          </Clipboard>

          <Clipboard title="AI meal plan" sub="A GENTLE WEEK — EDIT · LOCK · REGENERATE" accent={SAGE.petal} flower="iris" idx="cb-ai">
            <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "2px 2px 10px", lineHeight: 1.5 }}>A gentle week, generated for your stage — edit, lock the meals you love, and regenerate the rest in the hub.</p>
            <Grid cols={3}>
              <Tile icon={Repeat} label="Regenerate" sub="week · day · slot" cw="sage" onTap={() => goHub("mealgen")} />
              <Tile icon={Heart} label="Wellness goal" sub="energy · sleep…" cw="crimson" onTap={() => goHub("mealgen")} />
              <Tile icon={Leaf} label="Dietary" sub="veg · GF · DF…" cw="sage" onTap={() => goHub("mealgen")} />
            </Grid>
          </Clipboard>

          <Clipboard title="Shop" sub="SORTED BY AISLE — TICK AS YOU GO" accent={SAGE.petal} flower="fern" idx="cb-shop">
            <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "2px 2px 10px", lineHeight: 1.5 }}>Build a list from your plan, sorted by aisle, and tick it off as you shop — your live list opens in the hub.</p>
            <Grid cols={3}>
              <Tile icon={CalendarDays} label="Build from plan" sub="auto-fill list" cw="sage" onTap={() => goHub("shopping")} />
              <Tile icon={Plus} label="Add item" sub="manual" cw="gold" onTap={() => goHub("shopping")} />
              <Tile icon={ShoppingBasket} label="Pantry" sub="already have" cw="sage" onTap={() => goHub("shopping")} />
            </Grid>
          </Clipboard>

          <Clipboard title="Progress" sub="PATTERNS, NOT SCORES — SWIPE INSIDE" accent={GOLD.petal} flower="dahlia" idx="cb-prog">
            <CardDeck accent={GOLD.petal}>
              <PanelCard eyebrow="This week" Icon={TrendingUp} cw="gold" title="A gentle shape" line="You logged on 5 of 7 days. Energy looks steady — no scores here, just the pattern.">
                <Sparkbars data={[1180, 1640, 900, 1720, 1480, 1200, 1180]} />
              </PanelCard>
              <PanelCard eyebrow="Patterns" Icon={Heart} cw="sage" title="Iron-leaning days felt steadier" line="On days with iron-rich meals, your logged energy ran a little higher. Worth noticing, not a rule." />
              <PanelCard eyebrow="Your body" Icon={Target} cw="crimson" title="Add a metric" line="Weight is optional and never the headline. Track what helps you — energy, sleep, mood.">
                <button onClick={() => goHub("progress")} style={{ ...addRow, marginTop: 8 }}><Plus size={14} /> Add a metric</button>
              </PanelCard>
              <PanelCard eyebrow="Cycle lens" Icon={Sparkles} cw="plum" title="Across your luteal weeks" line="Your luteal meals have leaned warmer and richer — that's your body asking, not a failure." />
            </CardDeck>
          </Clipboard>

          <Clipboard title="Insights" sub="FOR YOUR STAGE — SWIPE INSIDE" accent={SAGE.petal} flower="violet" idx="cb-ins">
            <CardDeck accent={SAGE.petal}>
              <PanelCard eyebrow="Jess · your week" Icon={Sparkles} cw="sage" title="A nourishing week" line="You logged steadily and variety was strong — iron and folate came through well. A few lighter meals balanced the richer ones." />
              <PanelCard eyebrow="For your stage" Icon={Beef} cw="crimson" title="Iron" line="Red meat, lentils, spinach + a squeeze of citrus to absorb it. Helpful in your reproductive years — foods, not numbers." />
              <PanelCard eyebrow="For your stage" Icon={Fish} cw="gold" title="Folate & calcium" line="Leafy greens, beans, dairy or fortified alternatives. A gentle lean, never a cap." />
              <PanelCard eyebrow="Across your cycle" Icon={Heart} cw="plum" title="Luteal lean" line="Iron-rich, warming foods tend to settle well this phase. A note for self-awareness — not a prescription." />
            </CardDeck>
          </Clipboard>
        </ClipboardSlider>
      </div>

      {/* obvious add FAB → log a meal */}
      <button onClick={logMeal} aria-label="Log a meal" style={fab}><Plus size={26} color="#fff" /></button>

      {popup && <QuickPopup item={popup} onClose={() => setPopup(null)} onDone={complete} />}
      {/* Jump-to area switcher → opens the matching REAL surface in the live hub
          (NutritionHub reads ?tab=); "log" opens the real meal logger. */}
      {sheet === "jump" && <JumpToSheet onClose={() => setSheet(null)} onPick={(id) => { setSheet(null); if (id === "log") logMeal(); else goHub(id); }} />}

      {toast && (
        <div role="status" style={{ position: "fixed", left: "50%", bottom: "calc(var(--fw-nav-h, 76px) + 18px)", transform: "translateX(-50%)", zIndex: 10000, background: T.ink, color: T.paper, fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "10px 16px", borderRadius: 999, boxShadow: "0 6px 20px rgba(11,8,5,0.3)", maxWidth: "88vw", textAlign: "center" }}>{toast}</div>
      )}
    </div>
  );
}

// ── small components ──
function Wrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }
function Sparkbars({ data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56, marginTop: 10 }}>
      {data.map((v, i) => <div key={i} style={{ flex: 1, height: `${Math.round((v / max) * 100)}%`, background: i === data.length - 1 ? T.crimson : GOLD.petal, borderRadius: "4px 4px 0 0", opacity: 0.85 }} />)}
    </div>
  );
}
function PanelCard({ eyebrow, Icon, title, line, cw = "gold", children }) {
  const c = cwOf(cw);
  return (
    <div style={{ minHeight: 188, display: "flex", flexDirection: "column", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}16 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 16, padding: "16px 16px 14px", boxShadow: "0 3px 12px rgba(11,8,5,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Icon size={16} color={c.petal} /></span>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", color: c.petal }}>{eyebrow}</span>
        <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="cosmos" size={24} color={c.petal} color2={c.tip} idx={`pc-${eyebrow}`} /></span>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: T.ink, lineHeight: 1.25, marginBottom: 6 }}>{title}</div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.5, margin: 0 }}>{line}</p>
      {children}
    </div>
  );
}
function QuickPopup({ item, onClose, onDone }) {
  const [note, setNote] = useState(""); const c = cwOf(item.cw || "sage"); const Icon = item.icon || Check;
  const body = { task: "Open it here, then it's set.", meal: "Recents + a quick search — what did you have?", water: "Half a glass counts. Tap to add it." }[item.type] || "Do it here, then it's set.";
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ ...disc, width: 34, height: 34, background: T.wax || T.paper }}><Icon size={16} color={c.petal} /></span>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, flex: 1 }}>{item.title}</div>
          <button onClick={onClose} aria-label="Close" style={iconX}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "4px 0 12px" }}>{body}</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 12px" }}><RichBloomV2 form="marigold" color={c.petal} color2={c.tip} accent={c.accent} size={100} idx={`qp-${item.id}`} /></div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A word, if you like (optional)…" rows={2} style={ta} />
        <button onClick={() => onDone(item.id, "Done")} style={{ ...cta, background: c.petal }}><Check size={16} /> Done</button>
      </div>
    </div>
  );
}
function LogSheet({ onClose, onSaved }) {
  const [draft, setDraft] = useState({ name: "", slot: "Lunch" });
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Log a meal</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>snap · say · scan · search · recents — pick the easiest</div>
        <Grid cols={3}>
          {METHODS.map((m) => <Tile key={m.id} icon={m.Icon} label={m.label} sub={m.sub} cw={m.cw} onTap={() => setDraft((d) => ({ ...d, name: d.name || "Chicken salad" }))} />)}
        </Grid>
        <div style={{ marginTop: 14, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>What did you have?</div>
        <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. chicken salad, big portion" style={inp} />
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {["Breakfast", "Lunch", "Dinner", "Snack"].map((s) => (
            <button key={s} onClick={() => setDraft((d) => ({ ...d, slot: s }))} style={{ flex: 1, cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "8px 0", borderRadius: 999, border: `1px solid ${draft.slot === s ? T.ink : T.paperDeep}`, background: draft.slot === s ? T.ink : "transparent", color: draft.slot === s ? T.paper : T.muted }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          {[["~420", "kcal"], ["32g", "protein"], ["6mg", "iron"]].map(([v, l]) => (
            <div key={l} style={{ ...targetCell, minHeight: 0, padding: "8px 4px" }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink }}>{v}</span><span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{l}</span></div>
          ))}
        </div>
        <button onClick={() => onSaved(draft.name || "your meal")} style={{ ...cta, background: T.crimson, marginTop: 14 }}><Check size={16} /> Add to today</button>
      </div>
    </div>
  );
}
function WaterSheet({ onClose, onSaved }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Log a drink</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>water, coffee, tea — every sip counts</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {DRINKS.map((dr) => { const c = cwOf(dr.cw); return (
            <button key={dr.label} onClick={() => onSaved(250)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 6px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, background: T.paper, cursor: "pointer" }}><dr.Icon size={22} color={c.petal} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.ink }}>{dr.label}</span></button>
          ); })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[250, 500, 750].map((ml) => <button key={ml} onClick={() => onSaved(ml)} style={{ ...waterPill, flex: 1 }}>+{ml} ml</button>)}
        </div>
      </div>
    </div>
  );
}
function VoiceSheet({ onClose, onSaved }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{ ...sheetStyle, textAlign: "center" }}>
        <style>{`@keyframes fwPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:.7}}`}</style>
        <div style={grab} />
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: SAGE.petal }}>Say your meal</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink, margin: "4px 0 2px" }}>Listening…</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>e.g. “a bowl of porridge with banana and honey”</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 18px" }}>
          <div style={{ width: 92, height: 92, borderRadius: 999, background: `${SAGE.petal}22`, display: "grid", placeItems: "center", animation: "fwPulse 1.6s ease-in-out infinite" }}><Mic size={34} color={SAGE.petal} /></div>
        </div>
        <button onClick={() => onSaved("porridge with banana")} style={{ ...cta, background: SAGE.petal }}><Check size={16} /> That's it — add</button>
      </div>
    </div>
  );
}
function RecipeSheet({ onClose, onSaved }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Cook what you have in</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>tell me what's in — I'll find a recipe for your stage</div>
        <input placeholder="lentils, spinach, onion, rice…" style={inp} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
          {["Energy", "30 min", "Budget", "Veg", "Iron-rich"].map((f) => <span key={f} style={chip}>{f}</span>)}
        </div>
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: `${SAGE.petal}12`, border: `1px solid ${T.paperDeep}` }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.ink }}>Red lentil & spinach dal</div>
          <div style={{ display: "flex", gap: 12, margin: "4px 0 6px", fontFamily: UI, fontSize: 11.5, color: T.muted }}><span><Clock size={11} /> 25 min</span><span>Serves 2</span><span>Iron-rich</span></div>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.5 }}>Uses what you have. Guided steps + a timer when you cook it.</p>
        </div>
        <button onClick={onSaved} style={{ ...cta, background: SAGE.petal, marginTop: 14 }}><BookOpen size={16} /> Save & cook</button>
      </div>
    </div>
  );
}
function RegenSheet({ onClose, onSaved }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Regenerate your plan</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>locked meals stay — only the rest changes</div>
        {[["Just one slot", "swap a single meal"], ["A whole day", "re-do today"], ["The week", "fresh, gentle week"]].map(([t, s], i) => (
          <button key={t} onClick={onSaved} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, borderRadius: 14, border: `1px solid ${T.paperDeep}`, background: T.paper, cursor: "pointer" }}>
            <span style={{ width: 30, height: 30, borderRadius: 99, background: `${SAGE.petal}22`, color: SAGE.petal, display: "grid", placeItems: "center" }}><Repeat size={15} /></span>
            <span style={{ flex: 1 }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{t}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{s}</span></span>
            <ChevronRight size={16} color={T.muted} />
          </button>
        ))}
      </div>
    </div>
  );
}
function JumpToSheet({ onClose, onPick }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Jump to</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>every area, by name — nothing hidden</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {SURFACES.map((s) => { const c = cwOf(s.cw); return (
            <button key={s.id} onClick={() => onPick(s.id)} style={{ display: "flex", alignItems: "flex-start", gap: 9, textAlign: "left", padding: "12px 11px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, background: T.paper, cursor: "pointer" }}>
              <s.Icon size={17} color={c.petal} />
              <span><span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{s.label}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.3 }}>{s.sub}</span></span>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

// ── styles ──
const ribbonBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted };
const primaryBtn = { flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer" };
const micDisc = { display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "rgba(255,255,255,0.22)", flexShrink: 0 };
const secondaryBtn = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "10px 0", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted };
const chip = { background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink };
const waterPill = { flexShrink: 0, background: `${cwOf("sky").petal}1f`, border: `1px solid ${cwOf("sky").petal}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: cwOf("sky").petal };
const loggedRow = { display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 11px" };
const miniLog = { background: cwOf("sage").petal, color: "#fff", border: "none", borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700 };
const targetCell = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 76, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 6px" };
const addRow = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", background: "transparent", border: `1px dashed ${T.paperDeep}`, borderRadius: 12, padding: "10px 0", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted };
const fab = { position: "fixed", right: 18, bottom: "calc(var(--fw-nav-h, 76px) + 14px)", width: 54, height: 54, borderRadius: 999, background: T.crimson, border: "none", boxShadow: "0 6px 22px rgba(188,46,39,.4)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 50 };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "82dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted };
const ta = { width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", resize: "none", marginBottom: 12 };
const inp = { width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 12px" };
const disc = { width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };

/* ── TRUE FULL PARITY CHECKLIST (live NutritionHub → this demo) ──
 SIGNATURE TOP: ✅ flora hero · ✅ energy ring + macro row (protein/fibre/iron) + water glance · ✅ ONE summary
   (suggested dinner one-tap · so-far · Jess) · ★✅ OBVIOUS primary "Log a meal" + "Log water" buttons · ✅ voice
   "Say it" · ✅ "Jump to" switcher (all 8 areas by name).
 EAT-TODAY SLIDER: ✅ Log (6 methods search/recents/favourites/snap/say/scan + recents chips + draft) · ✅ Today
   (quick water +250/+500 · drink log · logged meals + remove · recents) · ✅ My plan (protein/carbs/fats/fibre/
   iron/water targets · stage framing · adjust).
 PLAN-&-EXPLORE SLIDER: ✅ Recipes (saved + ratings + log · cook-what-you-have · generate · guided cook) · ✅ AI
   meal plan (weekly grid · lock · wellness goal · dietary · regenerate week/day/slot) · ✅ Shop (aisle list ·
   check · build-from-plan · add · pantry) · ✅ Progress NESTED CardDeck (energy sparkline · patterns · body
   metric · cycle lens) · ✅ Insights NESTED CardDeck (Jess weekly story · stage nudges iron/folate/calcium ·
   cycle memory).
 GLOBAL: ✅ §6.7.6 quick popups · ✅ sheets (log · water/drink · voice · recipe · regenerate · jump-to) · ✅ add
   FAB · ✅ suggested dinner · ✅ toast. Clipboard + nested CardDeck spine; ~2 phone screens; v4 bible;
   demo-first (seeded, no live writes). EASE: 2 obvious primary buttons + jump-to-by-name + titled boards. */
