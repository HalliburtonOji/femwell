// NutritionHub — the REAL Nutrition page: a calm Daily Hub home + a Hero Card
// Slider of surface cards, each opening the FULL existing (data-wired) surface in
// a bottom sheet. Hybrid of two approved demos:
//   · NutritionDemo2 "Daily Hub" — one calm screen, ONE primary action, dusk-header
//     bottom-sheet spokes  (the organizing model)
//   · NutritionDemo1 "Hero Card Slider" — scroll-snap card slider, next card peeks
//     (the spine for moving between surfaces)
//
// This is PRODUCTION code wired to real Base44 entities. The home summary reads
// REAL MealLog + HydrationLog for today; the slider cards open the REAL surface
// components (NutritionTodayTab, NutritionPlanTab, …) — never mock data.
//
// Orchestration preserved from src/pages/Nutrition.jsx:
//   · auth.me() → Promise.all(UserProfile / NutritionProfile / DailyCheckins today)
//   · ?tab=… deep-link → opens the matching surface sheet
//   · onProfileUpdated → loadNutritionProfile() refreshes the shell
//   · selectedDate / dayKey for the Today surface (date-fns)
//   · HydrationLog / MealLog .subscribe() → refresh the home summary
//
// Brand: Editorial cream/plum (Ephesis + Cormorant), Lucide/SVG, NO EMOJI, gentle
// glances not scoreboards, Jess present, phone-first.
import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  UtensilsCrossed, Droplet, Target, BookOpen, CalendarDays,
  ShoppingBasket, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Leaf,
} from "lucide-react";
import {
  T, UI, SERIF, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { getMealSummary } from "@/utils/nutritionAiAnalysis";
import { HubSheet, SoftBar, Ring, SurfaceCard } from "@/components/nutrition/hub/HubShell";

import NutritionTodayTab from "../components/nutrition/NutritionTodayTab";
import NutritionPlanTab from "../components/nutrition/NutritionPlanTab";
import NutritionProgressTab from "../components/nutrition/NutritionProgressTab";
import NutritionInsightsTab from "../components/nutrition/NutritionInsightsTab";
import RecipeGeneratorTab from "../components/nutrition/RecipeGeneratorTab";
import MealPlanGeneratorTab from "../components/nutrition/MealPlanGeneratorTab";
import ShoppingListTab from "../components/nutrition/ShoppingListTab";

const COL = 460;     // phone column
const CARD_W = 320;  // < column so the next card peeks at the right edge
const GAP = 14;

// Surface registry — id + meta drives the slider cards AND the sheets. The id
// matches the ?tab= deep-link target so links land on the right surface.
const SURFACES = [
  { id: "today",    label: "Today",    eyebrow: "Your plate so far",       sheetTitle: "today",        accent: T.gold, Icon: UtensilsCrossed },
  { id: "plan",     label: "My Plan",  eyebrow: "A guide, never a cap",     sheetTitle: "my plan",      accent: T.gold, Icon: Target },
  { id: "recipes",  label: "Recipes",  eyebrow: "Cook what you have in",    sheetTitle: "recipes",      accent: T.sage, Icon: BookOpen },
  { id: "mealgen",  label: "AI Plan",  eyebrow: "A gentle week",            sheetTitle: "the week",     accent: T.sage, Icon: CalendarDays },
  { id: "shopping", label: "Shop",     eyebrow: "Sorted by aisle",          sheetTitle: "the list",     accent: T.sage, Icon: ShoppingBasket },
  { id: "progress", label: "Progress", eyebrow: "Patterns, not scores",     sheetTitle: "progress",     accent: T.gold, Icon: TrendingUp },
  { id: "insights", label: "Insights", eyebrow: "Nourishment for your stage", sheetTitle: "insights",   accent: T.sage, Icon: Sparkles },
];

// ?tab= → surface id (same map as Nutrition.jsx; hydration folds into today)
const TAB_MAP = {
  hydration: "today", today: "today", plan: "plan", recipes: "recipes",
  mealgen: "mealgen", shopping: "shopping", progress: "progress", insights: "insights",
};

// Gentle stage-aware line from Jess — never clinical, never a target.
function jessLine(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    perimenopause: "Steady protein and iron this week can soften the dips — no rules, just a gentle anchor.",
    menopause: "Calcium and a little extra protein go a long way right now. Small, warm meals over big ones.",
    pregnant: "Little and often tends to sit best. Whatever stays down today is enough.",
    postpartum: "Hydration and easy-to-reach food first — feeding yourself counts as much as anything.",
    ttc: "Colour on the plate and good fats are quietly doing a lot for you this season.",
  };
  if (stage && byStage[stage]) return byStage[stage];
  return "However today went, the next plate is a fresh start. One nourishing thing is plenty.";
}

export default function NutritionHub() {
  useEditorialFonts();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openSheet, setOpenSheet] = useState(null);   // surface id or null
  const [active, setActive] = useState(0);            // slider index

  // Home summary (real MealLog + HydrationLog for the selected day)
  const [summary, setSummary] = useState({ kcal: 0, meals: 0, hydrationMl: 0, lastMeal: null });

  const dayKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = dayKey === format(new Date(), "yyyy-MM-dd");
  const trackRef = useRef(null);
  const last = SURFACES.length - 1;

  // ── deep-link: parse ?tab= on mount and open the matching surface ──────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && TAB_MAP[tabParam]) {
      const id = TAB_MAP[tabParam];
      setOpenSheet(id);
      const idx = SURFACES.findIndex((s) => s.id === id);
      if (idx >= 0) setActive(idx);
    }
  }, []);

  // ── load the home summary for the selected day (real entities, guarded) ────
  const loadSummary = useCallback(async (u, key) => {
    if (!u) return;
    const [meals, hydration] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: u.id, day_key: key }).catch(() => []),
      base44.entities.HydrationLog.filter({ user_id: u.id, day_key: key }).catch(() => []),
    ]);
    const safeMeals = (meals || []).filter(Boolean);
    const kcal = safeMeals.reduce((sum, m) => sum + (getMealSummary(m).summary?.calories || 0), 0);
    const hydrationMl = (hydration || []).filter(Boolean).reduce((s, l) => s + (l.amount_ml || 0), 0);
    const lastMeal = [...safeMeals]
      .sort((a, b) => (a.logged_at || "").localeCompare(b.logged_at || ""))
      .reverse()
      .find((m) => m.raw_text)?.raw_text || null;
    setSummary({ kcal: Math.round(kcal), meals: safeMeals.length, hydrationMl, lastMeal });
  }, []);

  const loadNutritionProfile = useCallback(async () => {
    if (!user) return;
    const profiles = await base44.entities.NutritionProfile.filter({ user_id: user.id }).catch(() => []);
    setNutritionProfile(profiles[0] || null);
  }, [user]);

  // ── init: auth + profiles + today's check-in + subscriptions ───────────────
  useEffect(() => {
    let unsubHydration;
    let unsubMeals;
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, nutProfiles, checkins] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.NutritionProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: format(new Date(), "yyyy-MM-dd") }).catch(() => []),
        ]);
        if (profiles[0]) setProfile(profiles[0]);
        if (nutProfiles[0]) setNutritionProfile(nutProfiles[0]);
        if (checkins[0]) setCheckin(checkins[0]);
        // a new log anywhere → nudge selectedDate so the summary effect re-runs
        try { unsubHydration = base44.entities.HydrationLog.subscribe(() => setSelectedDate((d) => new Date(d))); } catch { /* no-op */ }
        try { unsubMeals = base44.entities.MealLog.subscribe(() => setSelectedDate((d) => new Date(d))); } catch { /* no-op */ }
      } catch (err) {
        console.error("NutritionHub init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      unsubHydration?.();
      unsubMeals?.();
    };
  }, []);

  // refresh the home summary whenever the user or the day changes (subscriptions
  // bump selectedDate, so this also catches a new meal/hydration log)
  useEffect(() => {
    if (user) loadSummary(user, dayKey);
  }, [user, dayKey, loadSummary]);

  const changeDay = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  // ── slider: keep active index in sync with scroll-snap swipes ──────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(el.scrollLeft / (CARD_W + GAP));
        setActive(Math.max(0, Math.min(last, i)));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  const calorieTarget = nutritionProfile?.calories_target || nutritionProfile?.calorie_target || 2000;
  const hydrationTarget = nutritionProfile?.hydration_target_ml || 2000;
  const kcalLeft = Math.max(0, calorieTarget - summary.kcal);

  // ── the real surface for the open sheet ────────────────────────────────────
  const renderSurface = (id) => {
    if (!user) return null;
    switch (id) {
      case "today":    return <NutritionTodayTab user={user} profile={profile} nutritionProfile={nutritionProfile} dayKey={dayKey} checkin={checkin} />;
      case "plan":     return <NutritionPlanTab user={user} nutritionProfile={nutritionProfile} />;
      case "recipes":  return <RecipeGeneratorTab user={user} />;
      case "mealgen":  return <MealPlanGeneratorTab user={user} nutritionProfile={nutritionProfile} />;
      case "shopping": return <ShoppingListTab user={user} />;
      case "progress": return <NutritionProgressTab user={user} nutritionProfile={nutritionProfile} onProfileUpdated={loadNutritionProfile} />;
      case "insights": return <NutritionInsightsTab user={user} profile={profile} />;
      default:         return null;
    }
  };

  const openMeta = openSheet ? SURFACES.find((s) => s.id === openSheet) : null;

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120 }}>
      <InkFilter />
      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative" }}>

        {/* ── greeting + day stepper ─────────────────────────────────────── */}
        <header style={{ padding: "22px 18px 12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Eyebrow mb={4}>Wellness Studio · Nutrition</Eyebrow>
              <Script size={40} carve>your plate today</Script>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "5px 6px",
            }}>
              <button onClick={() => changeDay(-1)} aria-label="Previous day"
                style={{ width: 26, height: 26, borderRadius: 9, border: "none", background: "transparent", color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
                <ChevronLeft size={16} />
              </button>
              <div style={{ textAlign: "center", minWidth: 74 }}>
                <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.ink }}>{isToday ? "Today" : format(selectedDate, "EEE")}</div>
                <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>{format(selectedDate, "d MMM")}</div>
              </div>
              <button onClick={() => changeDay(1)} disabled={isToday} aria-label="Next day"
                style={{ width: 26, height: 26, borderRadius: 9, border: "none", background: "transparent", color: T.muted, cursor: isToday ? "default" : "pointer", opacity: isToday ? 0.3 : 1, display: "grid", placeItems: "center" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* ── gentle today glance (REAL data) ────────────────────────────── */}
        <div style={{ padding: "0 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Ring value={summary.kcal} guide={calorieTarget} size={92} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>
                {summary.meals === 0 ? "A fresh plate" : "Still room to nourish"}
              </div>
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 3 }}>
                {summary.kcal > 0
                  ? `${kcalLeft} kcal left in today’s gentle guide`
                  : `Today’s gentle guide is about ${calorieTarget} kcal`}
              </div>
              {/* hydration glance */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <Droplet size={13} color={T.sage} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 10, color: T.muted }}>
                    <span>Hydration</span>
                    <span>{summary.hydrationMl}ml of {hydrationTarget}ml</span>
                  </div>
                  <SoftBar value={summary.hydrationMl} guide={hydrationTarget} color={T.sage} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Jess's one line ────────────────────────────────────────────── */}
        <div style={{ padding: "16px 18px 0" }}>
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "15px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <Leaf size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
            </div>
            <Hand size={17} color={T.paper} carve={false}>{jessLine(profile)}</Hand>
          </div>
        </div>

        {/* ── ONE primary action + ONE suggested next ────────────────────── */}
        <div style={{ padding: "14px 18px 0" }}>
          <button
            onClick={() => setOpenSheet("today")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
              background: T.crimson, color: T.paper, border: "none", borderRadius: 16, padding: "16px",
              cursor: "pointer", boxShadow: "0 6px 18px rgba(188,46,39,0.22)",
            }}
          >
            <UtensilsCrossed size={18} />
            <span style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Log a meal</span>
          </button>

          <button
            onClick={() => setOpenSheet("recipes")}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
              padding: "13px 15px", cursor: "pointer", marginTop: 10,
            }}
          >
            <span style={{ width: 38, height: 38, borderRadius: 11, background: T.ink, color: T.paper, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <BookOpen size={17} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase", display: "block" }}>Suggested next</span>
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, display: "block", lineHeight: 1.15 }}>
                {summary.lastMeal ? "Cook something that fits today" : "Find a recipe for tonight"}
              </span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>
                Phase-friendly, from what you have in
              </span>
            </span>
          </button>
        </div>

        {/* ── THE SPINE — Hero Card Slider of surfaces ───────────────────── */}
        <div style={{ marginTop: 22 }}>
          <div style={{ padding: "0 18px 10px" }}>
            <Hand size={15} color={T.muted}>Swipe through your kitchen — each card opens the full thing.</Hand>
          </div>

          {/* segmented label rail */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 18px 12px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {SURFACES.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} style={{
                flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
                border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
                fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
              }}>{s.label}</button>
            ))}
          </div>

          {/* the swipeable track — scroll-snap, next card peeks */}
          <div ref={trackRef} className="nutrihub-track" style={{
            display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "0 18px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}>
            <style>{`.nutrihub-track::-webkit-scrollbar{display:none}`}</style>

            {SURFACES.map((s) => (
              <SurfaceCard
                key={s.id}
                cardW={CARD_W}
                label={s.label}
                blurb={s.id === "today" && !isToday ? format(selectedDate, "d MMM") : null}
                accent={s.accent}
                onOpen={() => setOpenSheet(s.id)}
                primaryLabel={`Open ${s.label}`}
                primaryIcon={s.Icon}
              >
                <CardSummary
                  surface={s}
                  summary={summary}
                  calorieTarget={calorieTarget}
                  hydrationTarget={hydrationTarget}
                  kcalLeft={kcalLeft}
                  jess={jessLine(profile)}
                />
              </SurfaceCard>
            ))}

            {/* trailing spacer so the last card can center-snap */}
            <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
          </div>

          {/* prev / dots / next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
            <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous surface" style={navBtn(active === 0)}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: "flex", gap: 7 }}>
              {SURFACES.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} aria-label={s.label} style={{
                  width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                  background: i === active ? T.crimson : T.paperDeep, cursor: "pointer", transition: "width .2s",
                }} />
              ))}
            </div>
            <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next surface" style={navBtn(active === last)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "30px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            Nourishment is a relationship, not a target.
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>
            Gentle guidance for your stage — not medical advice.
          </div>
        </footer>

        {/* ── the bottom sheet — the FULL real surface ───────────────────── */}
        {openMeta && (
          <HubSheet title={openMeta.sheetTitle} eyebrow={openMeta.eyebrow} onClose={() => setOpenSheet(null)}>
            {renderSurface(openMeta.id)}
          </HubSheet>
        )}
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
    color: disabled ? T.paperDeep : T.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

// ── per-card rich summary (the "peek" before opening the full surface) ───────
// REAL numbers for Today; calm framing copy for the rest. No mock figures — the
// non-Today cards intentionally read as invitations into the real surface.
function CardSummary({ surface, summary, calorieTarget, hydrationTarget, kcalLeft, jess }) {
  if (surface.id === "today") {
    return (
      <div>
        <Script size={26} style={{ marginBottom: 2 }}>Today’s plate</Script>
        <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
          {summary.meals === 0 ? "Nothing logged yet — whenever you’re ready." : `${summary.meals} logged so far.`}
        </Hand>

        <div style={{ display: "grid", gap: 11 }}>
          <Glance label="Energy" value={`${summary.kcal} of ${calorieTarget} kcal`} v={summary.kcal} guide={calorieTarget} color={T.gold} />
          <Glance label="Hydration" value={`${summary.hydrationMl} of ${hydrationTarget} ml`} v={summary.hydrationMl} guide={hydrationTarget} color={T.sage} />
        </div>

        {summary.lastMeal ? (
          <div style={{ marginTop: 14 }}>
            <Eyebrow mb={6}>Last logged</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.3 }}>{summary.lastMeal}</div>
          </div>
        ) : (
          <div style={{ marginTop: 14, fontFamily: UI, fontSize: 11, color: T.muted }}>
            {kcalLeft} kcal of gentle room left today.
          </div>
        )}
      </div>
    );
  }

  // framing-only cards (open the real surface for the detail)
  const blurbs = {
    plan:     { line: "What your body’s asking for this stage — guides, not caps.", icon: Target },
    recipes:  { line: "Saved and AI recipes, sorted by what’s already in your kitchen.", icon: BookOpen },
    mealgen:  { line: "A gentle week, generated around your stage and your week.", icon: CalendarDays },
    shopping: { line: "Everything your plan needs, sorted by aisle and ready to tick off.", icon: ShoppingBasket },
    progress: { line: "Patterns across your fortnight — a soft line, never a score.", icon: TrendingUp },
    insights: { line: jess, icon: Sparkles },
  };
  const b = blurbs[surface.id] || { line: "", icon: Sparkles };
  const Icon = b.icon;
  return (
    <div>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", marginBottom: 12 }}>
        <Icon size={19} color={T.ink} />
      </div>
      <Script size={26} style={{ marginBottom: 6 }}>{surface.label}</Script>
      <Hand size={15} color={T.muted}>{b.line}</Hand>
    </div>
  );
}

function Glance({ label, value, v, guide, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontFamily: UI, fontSize: 11, color: T.muted }}>
        <span style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", fontSize: 9.5 }}>{label}</span>
        <span>{value}</span>
      </div>
      <SoftBar value={v} guide={guide} color={color} />
    </div>
  );
}
