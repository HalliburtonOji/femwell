// NutritionNewDemo — Nutrition rebuilt to the dense single-horizontal-slider pattern (like the Planner).
// Demo-first. Live /Nutrition (NutritionRedesignDemo) is NOT touched.
//
// WHY (Halli): the live page stacks slider-card above slider-card with lots of downward scroll and
// half-empty cards. This is ONE big horizontal board slider — every short surface folded into a
// vertical up↕down segment card, so there's barely any downward scroll and no empty card space.
// Nothing stripped — all 8 surfaces (Log · Today · My plan · Recipes · AI meal plan · Shop · Progress ·
// Insights) + the two daily actions (Log a meal · Log water) + the energy/macros/water glance are here.
//
// BOARDS (one horizontal slider; cards slide horizontally, short ones slide vertically up↕down):
//   1) "Today"   — Today (energy ring + macros + water + quick-adds + logged + recents) · [Log ↕ My plan]
//   2) "Plan"    — AI meal plan (week grid) · [Recipes ↕ Shop]
//   3) "Insights"— [This week ↕ Patterns] · [For your stage ↕ Across your cycle]
// TOP-AREA CHROME (out of cards): Jump-to (left) + Calendar (right) + the two focus pills (Log a meal ·
// Log water). Oxblood headings, varied card language (decks, vertical segments, tile-grids, accent-rim
// sub-cards, colour pills). Seeded + optimistic (each tap visibly works); annotated with the real
// base44 entity (MealLog / HydrationLog / MealPlans / ShoppingList). No new base44 function.
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, X, Check, Utensils, Droplet, Search, Repeat, Star, Camera, Mic, ScanLine, Salad, Target,
  Beef, Wheat, Apple, Leaf, Flame, GlassWater, Coffee, Wine, TrendingUp, Sparkles, Heart, ListChecks,
  ShoppingBasket, CalendarDays, Soup, Fish,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes } from "@/components/brand/flora";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import {
  OXBLOOD, lbl, subCard, focusPill, Pill, Panel, StackedCard, BoardBody, TopChrome, SheetShell, JumpSheet, makeCalendarOverlay,
} from "@/components/brand/SliderKit";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

// ── seeded "today" (luteal · iron-leaning so the insights land) ──────────────
const KCAL_TARGET = 2000, WATER_TARGET = 8;
const PHASE = { label: "Luteal", hue: "#8E6E8E", day: 23 };
const SEED_MEALS = [
  { id: "m1", slot: "Breakfast", title: "Porridge + banana", kcal: 320 },
  { id: "m2", slot: "Lunch", title: "Chicken salad", kcal: 480 },
  { id: "m3", slot: "Snack", title: "Greek yoghurt + berries", kcal: 180 },
];
const RECENTS = ["Lentil dal", "Eggs on toast", "Salmon + greens", "Porridge + banana", "Chicken salad"];
const MACROS = [
  { label: "Protein", had: 58, guide: 90, unit: "g", cw: "crimson", Icon: Beef, why: "steadies energy, holds muscle" },
  { label: "Fibre", had: 18, guide: 30, unit: "g", cw: "sage", Icon: Leaf, why: "calms digestion, evens blood sugar" },
  { label: "Iron", had: 9, guide: 18, unit: "mg", cw: "gold", Icon: Flame, why: "carries oxygen — extra-kind in your luteal week" },
];
const TARGETS = [
  { label: "Protein", v: "90 g", cw: "crimson", Icon: Beef, why: "steadies energy and holds muscle" },
  { label: "Carbs", v: "220 g", cw: "gold", Icon: Wheat, why: "your main fuel — wholegrain where you can" },
  { label: "Fats", v: "70 g", cw: "sage", Icon: Apple, why: "hormones love healthy fats" },
  { label: "Fibre", v: "30 g", cw: "sage", Icon: Leaf, why: "calms digestion, evens blood sugar" },
  { label: "Iron", v: "18 mg", cw: "gold", Icon: Flame, why: "carries oxygen; pair with vitamin C" },
  { label: "Water", v: "8 glasses", cw: "sky", Icon: Droplet, why: "energy, skin, focus — little sips add up" },
];
const LOG_METHODS = [
  { id: "search", label: "Search", Icon: Search, cw: "gold", sub: "food database" },
  { id: "recents", label: "Recents", Icon: Repeat, cw: "sage", sub: "your go-tos" },
  { id: "fav", label: "Favourites", Icon: Star, cw: "gold", sub: "saved meals" },
  { id: "snap", label: "Snap", Icon: Camera, cw: "plum", sub: "photo estimate" },
  { id: "say", label: "Say it", Icon: Mic, cw: "sage", sub: "speak your meal" },
  { id: "scan", label: "Scan", Icon: ScanLine, cw: "crimson", sub: "barcode" },
];
const DRINKS = [
  { label: "Water", Icon: Droplet, cw: "sky", ml: 250 }, { label: "Coffee", Icon: Coffee, cw: "gold", ml: 200 },
  { label: "Tea", Icon: Coffee, cw: "sage", ml: 200 }, { label: "Juice", Icon: GlassWater, cw: "gold", ml: 200 },
  { label: "Smoothie", Icon: GlassWater, cw: "sage", ml: 300 }, { label: "Wine", Icon: Wine, cw: "crimson", ml: 175 },
];
const RECIPES = [
  { id: "r1", title: "Red lentil dal", stars: 5, why: "iron + fibre, gentle and warming" },
  { id: "r2", title: "Salmon + greens", stars: 4, why: "omega-3s for a luteal week" },
  { id: "r3", title: "Iron-rich stir fry", stars: 4, why: "beef + greens + a squeeze of lime" },
];
const WEEK_PLAN = [
  { d: "Mon", b: "Porridge", l: "Dal", dn: "Salmon" }, { d: "Tue", b: "Eggs", l: "Soup", dn: "Stir fry" },
  { d: "Wed", b: "Yoghurt", l: "Salad", dn: "Pasta", today: true }, { d: "Thu", b: "Toast", l: "Wrap", dn: "Curry" },
  { d: "Fri", b: "Oats", l: "Dal", dn: "Fish" }, { d: "Sat", b: "Pancakes", l: "Salad", dn: "Roast" }, { d: "Sun", b: "Eggs", l: "Soup", dn: "Stir fry" },
];
const SEED_SHOP = [
  { id: "s1", name: "Spinach", aisle: "Produce", got: false }, { id: "s2", name: "Red lentils", aisle: "Cupboard", got: false },
  { id: "s3", name: "Salmon fillet", aisle: "Protein", got: false }, { id: "s4", name: "Greek yoghurt", aisle: "Dairy", got: true },
  { id: "s5", name: "Bananas", aisle: "Produce", got: true }, { id: "s6", name: "Wholemeal bread", aisle: "Bakery", got: false },
  { id: "s7", name: "Eggs", aisle: "Dairy", got: false },
];
const WEEK_KCAL = [1820, 1650, 1980, 1740, 1180, 1900, 1600];

// ════════════════════════════════════════════════════════════════════════════
export default function NutritionNewDemo() {
  const [meals, setMeals] = useState(SEED_MEALS);
  const [water, setWater] = useState(4);          // glasses (250ml each)
  const [shop, setShop] = useState(SEED_SHOP);
  const [logOpen, setLogOpen] = useState(false);
  const [waterOpen, setWaterOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => { (async () => { try { const u = await base44.auth.me(); setUser(u); const p = await base44.entities.UserProfile.filter({ user_id: u.id }, null, 1); setProfile(p?.[0] || null); } catch { /* preview unauth */ } })(); }, []);
  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2200); };

  const kcal = useMemo(() => meals.reduce((s, m) => s + m.kcal, 0), [meals]);
  const addMeal = (title, slot = "Snack", kc = 300) => { setMeals((xs) => [...xs, { id: "n" + Date.now(), slot, title, kcal: kc }]); flash(`Logged: ${title}`); }; // MealLog.create
  const removeMeal = (id) => setMeals((xs) => xs.filter((m) => m.id !== id)); // MealLog.delete
  const addWater = (glasses = 1) => { setWater((w) => Math.min(WATER_TARGET + 4, w + glasses)); flash(glasses === 1 ? "+1 glass" : `+${glasses} glasses`); }; // HydrationLog.create
  const toggleShop = (id) => setShop((xs) => xs.map((s) => s.id === id ? { ...s, got: !s.got } : s)); // ShoppingList.update
  const jumpTo = (idx) => { setJumpOpen(false); sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); const track = sliderRef.current?.querySelector(".fw-clipboard-track"); const child = track?.children?.[idx]; if (track && child) track.scrollLeft = child.offsetLeft - track.offsetLeft; };

  const crimson = cwOf("crimson").petal, sky = cwOf("sky").petal, gold = cwOf("gold").petal;
  const BOARDS = [{ t: "Today", sub: "Your plate · log · plan" }, { t: "Plan", sub: "Week plan · recipes · shop" }, { t: "Insights", sub: "Progress · patterns · Jess" }];

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }}>
        <FwFloraHero title="Your plate" colorway="sage" bloom="poppy" flankL="sunflower" flankR="iris" titleColor={OXBLOOD}
          line="Food as kindness, not arithmetic. A gentle guide to today's plate — never a cap." />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "8px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: PHASE.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{PHASE.label} · Day {PHASE.day}</span>
        </div>

        <SummaryCard eyebrow="Today, at a glance" rows={[
          { Icon: Salad, label: "Your plate", text: `${kcal} of ${KCAL_TARGET} kcal · room for ${Math.max(0, KCAL_TARGET - kcal)} more`, onClick: () => jumpTo(0) },
          { Icon: Droplet, label: "Water", text: `${water} of ${WATER_TARGET} glasses — little sips add up`, onClick: () => jumpTo(0) },
          { Icon: Sparkles, label: "From Jess", text: "Iron-rich, warming food settles well in your luteal week.", onClick: () => jumpTo(2) },
        ]} />

        {/* TOP-AREA focus pills (out of the cards) */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setLogOpen(true)} style={focusPill(crimson)}><Utensils size={16} /> Log a meal</button>
          <button onClick={() => setWaterOpen(true)} style={focusPill(sky)}><Droplet size={16} /> Log water</button>
        </div>

        {/* ONE horizontal slider of 3 dense boards */}
        <div ref={sliderRef} style={{ marginTop: 16 }}>
          <ClipboardSlider hint="Slide your kitchen →" accent={gold}>

            <Clipboard title="Today" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={gold} flower="poppy" idx="cb-today" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={crimson}
                  top={[
                    <Panel key="plate" label="Your plate today" Icon={Salad} accent={gold}><PlatePanel kcal={kcal} water={water} onWater={addWater} /></Panel>,
                    <Panel key="logged" label="Logged & go-tos" Icon={ListChecks} accent={gold}><LoggedPanel meals={meals} onRemove={removeMeal} onReLog={(n) => addMeal(n, "Snack", 250)} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="log" label="Log a meal" Icon={Utensils} accent={crimson}><LogPanel onMethod={() => setLogOpen(true)} onReLog={(n) => addMeal(n, "Snack", 250)} /></Panel>,
                    <Panel key="plan" label="My plan" Icon={Target} accent={crimson}><PlanTargetsPanel /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Plan" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={cwOf("sage").petal} flower="snowdrop" idx="cb-plan" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={cwOf("sage").petal} bottomAccent={gold}
                  top={[
                    <Panel key="week" label="AI meal plan" Icon={CalendarDays} accent={cwOf("sage").petal}><MealPlanPanel onLog={(n) => addMeal(n, "Dinner", 520)} /></Panel>,
                    <Panel key="recipes" label="Recipes" Icon={Soup} accent={cwOf("sage").petal}><RecipesPanel onLog={(n) => addMeal(n, "Dinner", 520)} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="shop" label="Shopping" Icon={ShoppingBasket} accent={gold}><ShopPanel shop={shop} onToggle={toggleShop} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Insights" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={cwOf("plum").petal} flower="foxglove" idx="cb-ins" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={cwOf("plum").petal} bottomAccent={cwOf("crimson").petal}
                  top={[
                    <Panel key="thisweek" label="This week" Icon={TrendingUp} accent={cwOf("plum").petal}><ThisWeekPanel kcal={kcal} /></Panel>,
                    <Panel key="patterns" label="Patterns" Icon={Heart} accent={cwOf("plum").petal}><PatternsPanel water={water} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="stage" label="For your stage" Icon={Sparkles} accent={cwOf("crimson").petal}><StageInsightsPanel /></Panel>,
                    <Panel key="cycle" label="Across your cycle" Icon={Heart} accent={cwOf("crimson").petal}><CycleMemoryPanel /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "20px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A plate tended kindly feeds more than the body.</p>
      </div>

      {logOpen && <LogSheet onClose={() => setLogOpen(false)} onPick={(n) => { addMeal(n, "Lunch", 420); setLogOpen(false); }} />}
      {waterOpen && <WaterSheet onClose={() => setWaterOpen(false)} onAdd={(g) => { addWater(g); setWaterOpen(false); }} />}
      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {toast && <div style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>}
    </div>
  );
}

// ── energy ring ──────────────────────────────────────────────────────────────
function Ring({ value, target, size = 138, color }) {
  const r = (size - 18) / 2, c = 2 * Math.PI * r, pct = Math.min(1, value / target);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paperDeep} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div><div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted }}>today</div>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink }}>{value}</div>
          <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>of {target} kcal</div></div>
      </div>
    </div>
  );
}
function SoftBar({ had, guide, color }) {
  return <span style={{ display: "block", height: 6, borderRadius: 99, background: "rgba(58,44,26,0.10)", overflow: "hidden", marginTop: 4 }}><span style={{ display: "block", height: "100%", width: `${Math.min(100, (had / guide) * 100)}%`, background: color }} /></span>;
}

// ── Today: plate (ring + macros + water) ─────────────────────────────────────
function PlatePanel({ kcal, water, onWater }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
        <Ring value={kcal} target={KCAL_TARGET} color={cwOf("gold").petal} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {MACROS.map((m) => (
            <div key={m.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><m.Icon size={12} color={cwOf(m.cw).petal} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{m.label}</span><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginLeft: "auto" }}>{m.had}/{m.guide}{m.unit}</span></div>
              <SoftBar had={m.had} guide={m.guide} color={cwOf(m.cw).petal} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...subCard(cwOf("sky").petal), display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Droplet size={16} color={cwOf("sky").petal} />
        <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{water} of {WATER_TARGET} glasses</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}><Pill cw="sky" onClick={() => onWater(1)}>+250</Pill><Pill cw="sky" onClick={() => onWater(2)}>+500</Pill></span>
      </div>
      <div style={{ ...subCard(cwOf("gold").petal), marginTop: "auto", background: `${cwOf("gold").petal}10` }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>Room for {Math.max(0, KCAL_TARGET - kcal)} more kcal — a guide, never a cap. Iron's a little kind in your luteal week.</p></div>
    </div>
  );
}
function LoggedPanel({ meals, onRemove, onReLog }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ ...lbl, marginBottom: 6 }}>Logged today</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {meals.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(cwOf("gold").petal), padding: "8px 11px" }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, width: 64, flexShrink: 0 }}>{m.slot}</span>
            <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15, color: T.ink }}>{m.title}</span>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{m.kcal}</span>
            <button onClick={() => onRemove(m.id)} aria-label="Remove" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={14} /></button>
          </div>
        ))}
      </div>
      <div style={{ ...lbl, margin: "12px 0 6px" }}>Re-log a go-to — one tap</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{RECENTS.map((r) => <Pill key={r} Icon={Repeat} cw="sage" onClick={() => onReLog(r)}>{r}</Pill>)}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Familiar food is a quiet strength.</p>
    </div>
  );
}

// ── Log panel (6 methods + recents) ──────────────────────────────────────────
function LogPanel({ onMethod, onReLog }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Six ways to log a meal in seconds — pick whatever's easiest right now.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{LOG_METHODS.map((m) => (
        <button key={m.id} onClick={onMethod} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 11px", borderRadius: 13, cursor: "pointer", background: `${cwOf(m.cw).petal}12`, border: `1px solid ${cwOf(m.cw).petal}55`, textAlign: "left" }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: `${cwOf(m.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><m.Icon size={15} color={cwOf(m.cw).petal} /></span>
          <span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.1 }}>{m.label}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{m.sub}</span></span>
        </button>
      ))}</div>
      <div style={{ ...lbl, margin: "14px 0 6px" }}>Recents — one tap</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{RECENTS.map((r) => <Pill key={r} Icon={Repeat} cw="sage" onClick={() => onReLog(r)}>{r}</Pill>)}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Slide up for your plate, down for your targets.</p>
    </div>
  );
}

// ── My plan targets ──────────────────────────────────────────────────────────
function PlanTargetsPanel() {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, lineHeight: 1.5, margin: "0 0 12px" }}>Reproductive years · gentle targets for your body and stage — a guide for the week, never a cap.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{TARGETS.map((t) => (
        <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(cwOf(t.cw).petal) }}>
          <t.Icon size={14} color={cwOf(t.cw).petal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{t.label} · {t.v}</span><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, display: "block", lineHeight: 1.35 }}>{t.why}</span></span>
        </div>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>These shift with your stage and cycle — kindly, in the background.</p>
    </div>
  );
}

// ── AI meal plan grid ────────────────────────────────────────────────────────
function MealPlanPanel({ onLog }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Your week, planned around your phase. Pin what you love, regenerate the rest.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{WEEK_PLAN.map((w) => (
        <div key={w.d} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(w.today ? cwOf("gold").petal : T.paperDeep), background: w.today ? `${cwOf("gold").petal}12` : T.paper, padding: "7px 10px" }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: w.today ? OXBLOOD : T.muted, width: 30, flexShrink: 0 }}>{w.d}</span>
          <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: T.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.b} · {w.l} · <b>{w.dn}</b></span>
          {w.today && <button onClick={() => onLog(w.dn)} style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff", background: cwOf("gold").petal, border: "none", borderRadius: 999, padding: "4px 11px", cursor: "pointer", flexShrink: 0 }}>Log {w.dn}</button>}
        </div>
      ))}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}><Pill Icon={Repeat} cw="sage">Regenerate week</Pill><Pill Icon={Target} cw="gold">Wellness goal</Pill></div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Dinner tonight is pinned — tap Log when you've eaten.</p>
    </div>
  );
}

// ── Recipes ──────────────────────────────────────────────────────────────────
function RecipesPanel({ onLog }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Your saved recipes — and new ones from what's already in your kitchen.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{RECIPES.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(cwOf("gold").petal) }}>
          <Soup size={16} color={cwOf("gold").petal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>{r.title}</span><span style={{ fontFamily: UI, fontSize: 12, color: cwOf("gold").accent || T.muted }}>{"★".repeat(r.stars)}<span style={{ color: T.muted }}> · {r.why}</span></span></span>
          <button onClick={() => onLog(r.title)} style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff", background: cwOf("gold").petal, border: "none", borderRadius: 999, padding: "5px 13px", cursor: "pointer", flexShrink: 0 }}>Log</button>
        </div>
      ))}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}><Pill Icon={Sparkles} cw="sage">Cook what I have</Pill><Pill Icon={Plus} cw="gold">Generate</Pill></div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Slide down for your shopping list.</p>
    </div>
  );
}

// ── Shop ─────────────────────────────────────────────────────────────────────
function ShopPanel({ shop, onToggle }) {
  const left = shop.filter((s) => !s.got).length;
  const ordered = [...shop].sort((a, b) => Number(a.got) - Number(b.got));
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Straight from your plan, sorted by aisle. {left} to get — tick as you go.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{ordered.map((s) => (
        <button key={s.id} onClick={() => onToggle(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(s.got ? cwOf("sage").petal : T.paperDeep), padding: "8px 11px", cursor: "pointer" }}>
          <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${s.got ? cwOf("sage").petal : T.paperDeep}`, background: s.got ? cwOf("sage").petal : "transparent", display: "grid", placeItems: "center" }}>{s.got && <Check size={12} color="#fff" />}</span>
          <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15, color: s.got ? T.muted : T.ink, textDecoration: s.got ? "line-through" : "none" }}>{s.name}</span>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{s.aisle}</span>
        </button>
      ))}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}><Pill Icon={Plus} cw="gold">Build from plan</Pill><Pill Icon={ListChecks} cw="sage">Pantry</Pill></div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Tick items off and they drop to the bottom.</p>
    </div>
  );
}

// ── Progress · This week ─────────────────────────────────────────────────────
function ThisWeekPanel({ kcal }) {
  const week = [...WEEK_KCAL]; week[4] = kcal; const max = Math.max(...week, KCAL_TARGET);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Energy across your week. You logged on 5 of 7 days — showing up is the pattern.</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, margin: "4px 0 6px" }}>{week.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", height: `${(v / max) * 100}%`, borderRadius: "4px 4px 0 0", background: i === 4 ? cwOf("crimson").petal : cwOf("gold").petal, opacity: i === 4 ? 1 : 0.55 }} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: i === 4 ? OXBLOOD : T.muted }}>{labels[i]}</span>
        </div>
      ))}</div>
      <div style={{ ...subCard(cwOf("plum").petal), marginTop: 12, background: `${cwOf("plum").petal}10` }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>Mid-week dipped lower — a softer luteal day. That's the body asking, not a slip.</p></div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Slide down for your patterns.</p>
    </div>
  );
}
function PatternsPanel({ water }) {
  const items = [
    { Icon: TrendingUp, t: "Showing up", b: "5 of 7 days logged — consistency, not perfection.", cw: "gold" },
    { Icon: Droplet, t: "Hydration", b: `${water} glasses today. Little sips add up to clearer energy.`, cw: "sky" },
    { Icon: Heart, t: "Iron-leaning days felt steadier", b: "Your steadier days had iron-rich meals. Worth leaning into this week.", cw: "crimson" },
  ];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Quiet patterns from your week — noticed gently, never graded.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{items.map((p) => (
        <div key={p.t} style={{ ...subCard(cwOf(p.cw).petal) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><p.Icon size={14} color={cwOf(p.cw).petal} /><span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{p.t}</span></div>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>{p.b}</p>
        </div>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Familiar food is a quiet strength.</p>
    </div>
  );
}

// ── Insights · stage + cycle ─────────────────────────────────────────────────
function StageInsightsPanel() {
  const nudges = [
    { Icon: Beef, t: "Iron", b: "Red meat, lentils, spinach — with a squeeze of citrus to absorb it. Extra-kind in your reproductive years.", cw: "crimson" },
    { Icon: Fish, t: "Folate & calcium", b: "Leafy greens, beans, dairy or fortified alternatives. A steady foundation.", cw: "sage" },
  ];
  return (
    <div style={{ flex: 1 }}>
      <div style={{ ...subCard(cwOf("crimson").petal), marginBottom: 12, background: `${cwOf("crimson").petal}0D` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><Sparkles size={14} color={cwOf("crimson").petal} /><span style={{ ...lbl, color: cwOf("crimson").petal }}>Jess · your week</span></div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, margin: 0, lineHeight: 1.45 }}>You've logged steadily — iron-rich, warming foods settle well in your luteal week.</p>
      </div>
      <Eyebrow color={cwOf("crimson").petal}>For your stage</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 8 }}>{nudges.map((n) => (
        <div key={n.t} style={{ ...subCard(cwOf(n.cw).petal) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><n.Icon size={14} color={cwOf(n.cw).petal} /><span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{n.t}</span></div>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>{n.b}</p>
        </div>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Slide down for your cross-cycle memory.</p>
    </div>
  );
}
function CycleMemoryPanel() {
  const lines = ["Iron-rich meals logged more often in your luteal weeks.", "Hydration dips a little the week before your period.", "Warming, cooked food over raw when energy is lower."];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>What your past luteal weeks remember — so this one's a little easier.</p>
      <Eyebrow color={cwOf("plum").petal}>Across your luteal weeks</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>{lines.map((l) => (
        <div key={l} style={{ display: "flex", alignItems: "flex-start", gap: 8, ...subCard(cwOf("plum").petal) }}>
          <Heart size={14} color={cwOf("plum").petal} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.4 }}>{l}</span>
        </div>
      ))}</div>
      <div style={{ ...subCard(cwOf("sage").petal), marginTop: "auto", background: `${cwOf("sage").petal}10` }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.45 }}>Your body keeps good notes. We just read them back to you.</p></div>
    </div>
  );
}

// ── sheets ──
function LogSheet({ onClose, onPick }) {
  return (
    <SheetShell title="Log a meal" eyebrowText="What did you have?" accent={cwOf("crimson").petal} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>{LOG_METHODS.map((m) => (
        <button key={m.id} onClick={() => onPick(m.id === "scan" ? "Scanned item" : m.id === "snap" ? "Photo meal" : "Lentil dal")} style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 11px", borderRadius: 13, cursor: "pointer", background: `${cwOf(m.cw).petal}12`, border: `1px solid ${cwOf(m.cw).petal}55`, textAlign: "left" }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: `${cwOf(m.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><m.Icon size={15} color={cwOf(m.cw).petal} /></span>
          <span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.1 }}>{m.label}</span><span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{m.sub}</span></span>
        </button>
      ))}</div>
      <div style={{ ...lbl, marginBottom: 6 }}>Or a recent — one tap</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{RECENTS.map((r) => <Pill key={r} Icon={Repeat} cw="sage" onClick={() => onPick(r)}>{r}</Pill>)}</div>
    </SheetShell>
  );
}
function WaterSheet({ onClose, onAdd }) {
  return (
    <SheetShell title="Log water" eyebrowText="Little sips add up" accent={cwOf("sky").petal} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => onAdd(1)} style={{ flex: 1, padding: "14px", borderRadius: 13, background: `${cwOf("sky").petal}14`, border: `1px solid ${cwOf("sky").petal}55`, fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, cursor: "pointer" }}>+250 ml</button>
        <button onClick={() => onAdd(2)} style={{ flex: 1, padding: "14px", borderRadius: 13, background: `${cwOf("sky").petal}14`, border: `1px solid ${cwOf("sky").petal}55`, fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, cursor: "pointer" }}>+500 ml</button>
        <button onClick={() => onAdd(3)} style={{ flex: 1, padding: "14px", borderRadius: 13, background: `${cwOf("sky").petal}14`, border: `1px solid ${cwOf("sky").petal}55`, fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, cursor: "pointer" }}>+750 ml</button>
      </div>
      <div style={{ ...lbl, marginBottom: 8 }}>Or a drink</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{DRINKS.map((d) => (
        <button key={d.label} onClick={() => onAdd(Math.max(1, Math.round(d.ml / 250)))} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: 13, background: `${cwOf(d.cw).petal}12`, border: `1px solid ${cwOf(d.cw).petal}55`, cursor: "pointer" }}>
          <d.Icon size={18} color={cwOf(d.cw).petal} /><span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{d.label}</span>
        </button>
      ))}</div>
    </SheetShell>
  );
}
