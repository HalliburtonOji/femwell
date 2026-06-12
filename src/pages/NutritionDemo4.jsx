// NutritionDemo4 — Nutrition UX direction · "DAY-AS-A-STORY TIMELINE"
// ─────────────────────────────────────────────────────────────────────────────
// NO tabs. The whole page is ONE gentle vertical scroll that tells the day as a
// timeline from morning to night. Logged MEALS appear as time-stamped entries
// down a hairline spine (time dots). BETWEEN the meals, inline narrative cards
// surface in order: a morning Jess greeting, hydration nudges, the "afternoons
// run light" insight, a micronutrient note, an evening recipe, an "add dinner"
// prompt. The other surfaces are woven in as inline SECTION-BREAKS within the
// same scroll (progressive disclosure as you move down the day): "Your plan"
// (PLAN), "This week" (PROGRESS patterns + SVG sparkline), "Coming up — meal
// plan & shop" (MEAL_PLAN + SHOPPING/SHOP_META), and a closing "Insights for
// your stage" (JESS.insights + MICROS). A slim sticky "jump" rail (Morning /
// Plan / Week / Insights) lets you skip. Logging is an always-present "+ Log"
// affordance that opens a quick add (RECENTS / FAVOURITES / LOG_METHODS).
//
// This kills decision fatigue by removing navigation entirely — you don't CHOOSE
// a section, you scroll your own day, and everything appears in calm order.
//
// Self-contained DEMO: useState/useEffect only. No base44, no entities, no
// network, no props. Lucide/SVG only — no emoji. Palette = T tokens only.
import { useState, useEffect, useRef } from "react";
import {
  Plus, X, Search, Camera, Mic, ScanLine, Clock, Droplet, Sparkles,
  ChevronRight, Star, Soup, Sun, Moon, Leaf, ShoppingBasket, Check,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  ME, TODAY, HYDRATION, MEALS, RECENTS, FAVOURITES, LOG_METHODS,
  PLAN, MICROS, RECIPES, AI_RECIPE, MEAL_PLAN, SHOPPING, SHOP_META,
  PROGRESS, JESS, NOT_MEDICAL, FOOTER_LINE, pct,
} from "./nutritionDemoShared";

// The slim sticky jump-rail anchors (your day, in four beats).
const JUMPS = [
  { id: "morning",  label: "Morning",  Icon: Sun },
  { id: "plan",     label: "Plan",     Icon: Leaf },
  { id: "week",     label: "Week",     Icon: Sparkles },
  { id: "insights", label: "Insights", Icon: Moon },
];

export default function NutritionDemo4() {
  useEditorialFonts();
  const [logOpen, setLogOpen] = useState(false);
  const [active, setActive] = useState("morning");

  // section refs for jump-to + active-on-scroll
  const refs = {
    morning:  useRef(null),
    plan:     useRef(null),
    week:     useRef(null),
    insights: useRef(null),
  };

  const jumpTo = (id) => {
    const el = refs[id]?.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // highlight the jump-rail beat you're currently scrolling through
  useEffect(() => {
    const onScroll = () => {
      const mark = window.scrollY + 140;
      let cur = "morning";
      for (const j of JUMPS) {
        const el = refs[j.id]?.current;
        if (el && el.offsetTop <= mark) cur = j.id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner />

      {/* slim sticky jump rail — skip ahead without choosing a tab */}
      <JumpRail active={active} onJump={jumpTo} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "20px 18px 90px" }}>
        {/* ── the day's masthead ───────────────────────────────────────── */}
        <header style={{ textAlign: "center", marginBottom: 8 }}>
          <Eyebrow mb={8} color={T.muted}>{ME.stageLabel} · {ME.cyclePhase}</Eyebrow>
          <Script size={44} carve>Your day</Script>
          <Hand size={16} color={T.inkSoft} carve={false} style={{ marginTop: 6 }}>
            morning to night, as it unfolded — just scroll
          </Hand>
        </header>

        {/* ════ MORNING → NIGHT: the single vertical timeline ════ */}
        <section ref={refs.morning} style={{ scrollMarginTop: 70, marginTop: 18 }}>
          <Timeline onLog={() => setLogOpen(true)} />
        </section>

        {/* ════ SECTION BREAK · YOUR PLAN ════ */}
        <SectionBreak innerRef={refs.plan} kicker="A pause in the day" title="Your plan" />
        <PlanBreak />

        {/* ════ SECTION BREAK · THIS WEEK ════ */}
        <SectionBreak innerRef={refs.week} kicker="Stepping back" title="This week" />
        <WeekBreak />

        {/* ════ SECTION BREAK · COMING UP ════ */}
        <SectionBreak kicker="Looking ahead" title="Coming up" />
        <ComingUpBreak />

        {/* ════ SECTION BREAK · INSIGHTS FOR YOUR STAGE ════ */}
        <SectionBreak innerRef={refs.insights} kicker="As the day closes" title="For your stage" />
        <InsightsBreak />

        {/* closing line */}
        <div style={{ textAlign: "center", marginTop: 34 }}>
          <Rule w="40%" c={T.paperDeep} mt={0} mb={14} />
          <div style={{ margin: "0 auto", maxWidth: 320 }}>
            <Hand size={15} color={T.muted} carve={false}>{NOT_MEDICAL}</Hand>
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.6, color: T.muted, marginTop: 12 }}>
            {FOOTER_LINE}
          </div>
        </div>
      </div>

      {/* always-present + Log affordance */}
      <LogButton onClick={() => setLogOpen(true)} />
      {logOpen && <QuickAdd onClose={() => setLogOpen(false)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHROME
// ════════════════════════════════════════════════════════════════════════════
function DemoBanner() {
  return (
    <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
      Nutrition · Day-as-a-Story Timeline — mock data
    </div>
  );
}

function JumpRail({ active, onJump }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(236,231,218,0.86)", backdropFilter: "blur(6px)",
      borderBottom: `1px solid ${T.paperDeep}`,
    }}>
      <div style={{ maxWidth: 430, margin: "0 auto", display: "flex", padding: "7px 10px", gap: 6 }}>
        {JUMPS.map((j) => {
          const on = active === j.id;
          return (
            <button key={j.id} onClick={() => onJump(j.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              background: on ? T.ink : "transparent",
              color: on ? T.paper : T.muted,
              border: `1px solid ${on ? T.ink : "transparent"}`,
              borderRadius: 999, padding: "6px 4px", cursor: "pointer",
              fontFamily: UI, fontSize: 11, letterSpacing: 0.3, fontWeight: 600,
            }}>
              <j.Icon size={12} strokeWidth={2} />
              {j.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LogButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 18, zIndex: 45,
      display: "inline-flex", alignItems: "center", gap: 8,
      background: T.crimson, color: T.paper, border: "none",
      borderRadius: 999, padding: "13px 26px", cursor: "pointer",
      fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
      boxShadow: "0 6px 22px rgba(11,8,5,0.28)",
    }}>
      <Plus size={18} strokeWidth={2.4} /> Log a meal
    </button>
  );
}

// ── a script-titled section divider that interrupts the scroll calmly ──
function SectionBreak({ innerRef, kicker, title }) {
  return (
    <div ref={innerRef} style={{ scrollMarginTop: 70, textAlign: "center", margin: "40px 0 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Rule w="100%" c={T.paperDeep} />
        <Leaf size={14} color={T.gold} style={{ flexShrink: 0 }} />
        <Rule w="100%" c={T.paperDeep} />
      </div>
      <Eyebrow mb={4} color={T.muted}>{kicker}</Eyebrow>
      <Script size={36} carve>{title}</Script>
    </div>
  );
}

// reusable inset card on inset paper
function Card({ children, surface = T.paperHi, style }) {
  return (
    <div style={{
      background: surface, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
      padding: 16, ...style,
    }}>{children}</div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE TIMELINE — meals on a hairline spine, narrative cards woven between
// ════════════════════════════════════════════════════════════════════════════
function Timeline({ onLog }) {
  // Build the ordered narrative feed of the day: meals + inline beats.
  const breakfast = MEALS.find((m) => m.slot === "Breakfast");
  const lunch     = MEALS.find((m) => m.slot === "Lunch");
  const snack     = MEALS.find((m) => m.slot === "Snack");
  const dinner    = MEALS.find((m) => m.slot === "Dinner");
  const ironMicro = MICROS.find((m) => m.key === "iron");
  const eveningRecipe = RECIPES.find((r) => r.tags.includes("omega-3")) || RECIPES[0];
  const afternoonPattern = PROGRESS.patterns.find((p) => p.title.startsWith("Afternoons")) || PROGRESS.patterns[1];

  return (
    <div style={{ position: "relative", paddingLeft: 30 }}>
      {/* the vertical spine */}
      <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 1.5, background: T.paperDeep }} />

      {/* morning Jess greeting + today's plate-so-far warmline */}
      <Beat dotColor={T.gold} icon={<Sun size={11} color={T.paper} />}>
        <JessGreeting line={JESS.todayLine} />
        <PlateSoFar />
      </Beat>

      {/* BREAKFAST */}
      <MealEntry meal={breakfast} />

      {/* hydration nudge */}
      <Beat dotColor={T.sage} icon={<Droplet size={10} color={T.paper} />} time="mid-morning">
        <HydrationCard />
      </Beat>

      {/* LUNCH */}
      <MealEntry meal={lunch} />

      {/* the "afternoons run light" insight */}
      <Beat dotColor={T.gold} icon={<Sparkles size={10} color={T.paper} />} time="afternoon">
        <Card>
          <Eyebrow mb={6} color={T.muted}>A pattern Jess noticed</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.3 }}>{afternoonPattern.title}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 4 }}>{afternoonPattern.detail}</div>
        </Card>
      </Beat>

      {/* SNACK */}
      <MealEntry meal={snack} />

      {/* a micronutrient note (iron) */}
      <Beat dotColor={T.crimson} icon={<Leaf size={10} color={T.paper} />} time="late afternoon">
        <MicroNote micro={ironMicro} />
      </Beat>

      {/* an evening recipe suggestion */}
      <Beat dotColor={T.gold} icon={<Soup size={10} color={T.paper} />} time="early evening">
        <RecipeSuggestion recipe={eveningRecipe} />
      </Beat>

      {/* DINNER — still to come (add prompt), on the dusk surface */}
      <AddDinner meal={dinner} onLog={onLog} />
    </div>
  );
}

// one beat on the spine: a time-dot + the card beside it
function Beat({ children, dotColor = T.gold, icon, time }) {
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div style={{
        position: "absolute", left: -30, top: 2, width: 20, height: 20, borderRadius: 999,
        background: dotColor, display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${T.paper}`, boxShadow: "0 1px 3px rgba(11,8,5,0.18)",
      }}>{icon}</div>
      {time && (
        <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted, marginBottom: 5 }}>
          {time}
        </div>
      )}
      {children}
    </div>
  );
}

function MealEntry({ meal }) {
  if (!meal) return null;
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      {/* the time-dot */}
      <div style={{
        position: "absolute", left: -30, top: 2, width: 20, height: 20, borderRadius: 999,
        background: T.ink, display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${T.paper}`, boxShadow: "0 1px 3px rgba(11,8,5,0.18)",
      }}>
        <Clock size={10} color={T.paper} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: T.ink }}>{meal.time}</span>
        <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>{meal.slot}</span>
      </div>
      <Card>
        <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.25 }}>{meal.title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, marginTop: 4 }}>
          {meal.items.join(" · ")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
          <Pill>{meal.kcal} kcal</Pill>
          <Pill>{meal.protein}g protein</Pill>
          <Pill>{meal.fibre}g fibre</Pill>
          {meal.note && <Pill accent>{meal.note}</Pill>}
        </div>
      </Card>
    </div>
  );
}

function Pill({ children, accent }) {
  return (
    <span style={{
      fontFamily: UI, fontSize: 10.5, letterSpacing: 0.2, padding: "3px 9px", borderRadius: 999,
      background: accent ? "rgba(168,137,63,0.14)" : T.paper,
      color: accent ? T.gold : T.muted,
      border: `1px solid ${accent ? "rgba(168,137,63,0.4)" : T.paperDeep}`,
    }}>{children}</span>
  );
}

function JessGreeting({ line }) {
  return (
    <Card surface={T.wax}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: T.sage, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Leaf size={13} color={T.paper} />
        </span>
        <Eyebrow color={T.muted}>Jess · good evening, {ME.name}</Eyebrow>
      </div>
      <Hand size={18} color={T.inkSoft} carve={false}>{line}</Hand>
    </Card>
  );
}

// today's plate so far — a soft "room to nourish" picture, never a scoreboard
function PlateSoFar() {
  const e = TODAY.energy;
  return (
    <Card style={{ marginTop: 10 }}>
      <Eyebrow mb={8} color={T.muted}>Your plate so far</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1 }}>{e.had}</span>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>of {e.guide} {e.unit} · still room to nourish</span>
      </div>
      <SoftBar value={pct(e.had, e.guide)} color={T.sage} />
      <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 9, lineHeight: 1.35 }}>{TODAY.warmline}</div>
    </Card>
  );
}

function HydrationCard() {
  return (
    <Card>
      <Eyebrow mb={8} color={T.muted}>Hydration · last sip {HYDRATION.lastAt}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {Array.from({ length: HYDRATION.guide }).map((_, i) => (
          <span key={i} style={{
            flex: 1, height: 26, borderRadius: 5,
            background: i < HYDRATION.cups ? T.sage : T.paper,
            border: `1px solid ${i < HYDRATION.cups ? T.sage : T.paperDeep}`,
          }} />
        ))}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 9 }}>
        {HYDRATION.cups} of {HYDRATION.guide} cups — a glass with the afternoon would be kind.
      </div>
    </Card>
  );
}

function MicroNote({ micro }) {
  if (!micro) return null;
  return (
    <Card>
      <Eyebrow mb={6} color={T.muted}>A gentle micronutrient note</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 19 }}>{micro.label}</span>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{micro.had} of {micro.guide} {micro.unit} so far</span>
      </div>
      <SoftBar value={pct(micro.had, micro.guide)} color={T.crimson} />
      <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 9 }}>{micro.note}</div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.gold, marginTop: 7 }}>
        Good sources: {micro.foods.join(", ")}
      </div>
    </Card>
  );
}

function SoftBar({ value, color = T.gold }) {
  return (
    <div style={{ height: 7, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, marginTop: 8, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, opacity: 0.85 }} />
    </div>
  );
}

function RecipeSuggestion({ recipe }) {
  if (!recipe) return null;
  return (
    <Card>
      <Eyebrow mb={6} color={T.muted}>For dinner tonight</Eyebrow>
      <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.25 }}>{recipe.title}</div>
      <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 4 }}>{recipe.why}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <Pill>{recipe.mins} min</Pill>
        <Pill>serves {recipe.serves}</Pill>
        {recipe.tags.slice(0, 2).map((t) => <Pill key={t} accent>{t}</Pill>)}
      </div>
      {recipe.need?.length > 0 && (
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 9 }}>
          You have most of it in — just need {recipe.need.join(", ")}.
        </div>
      )}
    </Card>
  );
}

// dinner not logged yet → the day's open ending, on the dusk surface
function AddDinner({ meal, onLog }) {
  return (
    <div style={{ position: "relative", marginBottom: 4 }}>
      <div style={{
        position: "absolute", left: -30, top: 2, width: 20, height: 20, borderRadius: 999,
        background: T.dusk, display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${T.paper}`, boxShadow: "0 1px 3px rgba(11,8,5,0.18)",
      }}>
        <Moon size={10} color={T.wax} />
      </div>
      <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted, marginBottom: 5 }}>
        tonight · still to come
      </div>
      <div style={{ background: T.dusk, borderRadius: 14, padding: 16, border: `1px solid ${T.dusk}` }}>
        <div style={{ fontFamily: SERIF, fontSize: 19, color: T.wax }}>Dinner is still ahead</div>
        {meal?.planned && (
          <div style={{ fontFamily: SERIF, fontSize: 15, color: "rgba(239,227,201,0.72)", marginTop: 4 }}>
            Planned: {meal.planned}
          </div>
        )}
        <button onClick={onLog} style={{
          marginTop: 13, display: "inline-flex", alignItems: "center", gap: 7,
          background: "transparent", color: T.wax, border: `1px solid ${T.gold}`,
          borderRadius: 999, padding: "9px 16px", cursor: "pointer",
          fontFamily: UI, fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={15} /> Add dinner when you're ready
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION BREAK · YOUR PLAN (PLAN.targets)
// ════════════════════════════════════════════════════════════════════════════
function PlanBreak() {
  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: SERIF, fontSize: 18 }}>Energy guide</span>
        <span style={{ fontFamily: UI, fontSize: 13, color: T.ink, fontWeight: 700 }}>{PLAN.energyGuide} kcal</span>
      </div>
      <Hand size={15} color={T.muted} carve={false}>{PLAN.why}</Hand>
      <Rule c={T.paperDeep} mt={14} mb={14} />
      <Eyebrow mb={10} color={T.muted}>What your body's asking for</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PLAN.targets.map((t) => (
          <div key={t.key}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17 }}>{t.label}</span>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.gold, fontWeight: 700 }}>{t.guide}</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, marginTop: 2 }}>{t.why}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION BREAK · THIS WEEK (PROGRESS patterns + sparkline, no streaks)
// ════════════════════════════════════════════════════════════════════════════
function WeekBreak() {
  return (
    <Card style={{ marginTop: 12 }}>
      <Hand size={15} color={T.muted} carve={false}>{PROGRESS.framing}</Hand>
      <div style={{ marginTop: 14, marginBottom: 4 }}>
        <Eyebrow mb={8} color={T.muted}>Nourishment, this fortnight</Eyebrow>
        <Sparkline data={PROGRESS.spark} />
      </div>
      <Rule c={T.paperDeep} mt={14} mb={14} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PROGRESS.patterns.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: 999, marginTop: 7, flexShrink: 0,
              background: p.tone === "good" ? T.sage : T.gold,
            }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.25 }}>{p.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, marginTop: 2 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Sparkline({ data }) {
  const w = 300, h = 56, pad = 4;
  const max = Math.max(...data), min = Math.min(...data);
  const span = Math.max(1, max - min);
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label="weekly nourishment trend">
      <path d={area} fill={T.gold} opacity={0.1} />
      <path d={line} fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.4 : 2} fill={i === pts.length - 1 ? T.crimson : T.gold} />
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION BREAK · COMING UP (MEAL_PLAN week + AI_RECIPE + SHOPPING/SHOP_META)
// ════════════════════════════════════════════════════════════════════════════
function ComingUpBreak() {
  const [shopOpen, setShopOpen] = useState(false);
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* the gentle week */}
      <Card>
        <Eyebrow mb={8} color={T.muted}>A gentle plan for the week</Eyebrow>
        <Hand size={15} color={T.muted} carve={false}>{MEAL_PLAN.intro}</Hand>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0 }}>
          {MEAL_PLAN.days.map((d, i) => (
            <div key={d.day} style={{ padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${T.paperDeep}` }}>
              <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, color: T.ink, marginBottom: 3 }}>{d.day}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, lineHeight: 1.4 }}>
                {d.b} · {d.l} · {d.d}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, marginTop: 10, fontStyle: "italic" }}>{MEAL_PLAN.note}</div>
      </Card>

      {/* the AI recipe built from what's in */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
          <Sparkles size={14} color={T.gold} />
          <Eyebrow color={T.muted}>Jess cooked this from what you have in</Eyebrow>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.25 }}>{AI_RECIPE.title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 4 }}>{AI_RECIPE.why}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <Pill>{AI_RECIPE.mins} min</Pill>
          <Pill>serves {AI_RECIPE.serves}</Pill>
        </div>
        <ol style={{ margin: "12px 0 0", paddingLeft: 18 }}>
          {AI_RECIPE.steps.map((s, i) => (
            <li key={i} style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, marginBottom: 4, lineHeight: 1.35 }}>{s}</li>
          ))}
        </ol>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.gold, marginTop: 10 }}>{AI_RECIPE.nutrition}</div>
      </Card>

      {/* the shop — by aisle, expandable */}
      <Card>
        <button onClick={() => setShopOpen((o) => !o)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "transparent", border: "none", cursor: "pointer", padding: 0, gap: 8,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBasket size={16} color={T.ink} />
            <span style={{ fontFamily: SERIF, fontSize: 18 }}>The list, by aisle</span>
          </span>
          <ChevronRight size={18} color={T.muted} style={{ transform: shopOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        </button>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 6 }}>
          {SHOP_META.items} items · {SHOP_META.est} · {SHOP_META.forDays} days
        </div>
        {shopOpen && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {SHOPPING.map((aisle) => (
              <div key={aisle.aisle}>
                <Eyebrow mb={6} color={T.gold}>{aisle.aisle}</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {aisle.items.map((it) => (
                    <div key={it} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${T.paperDeep}`, flexShrink: 0 }} />
                      <span style={{ fontFamily: SERIF, fontSize: 15.5 }}>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION BREAK · INSIGHTS FOR YOUR STAGE (JESS.insights + MICROS)
// ════════════════════════════════════════════════════════════════════════════
function InsightsBreak() {
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      <Card surface={T.wax}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 26, height: 26, borderRadius: 999, background: T.sage, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={13} color={T.paper} />
          </span>
          <Eyebrow color={T.muted}>Jess · for where you are</Eyebrow>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {JESS.insights.map((ins, i) => (
            <div key={i}>
              <div style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.25 }}>{ins.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, marginTop: 3, lineHeight: 1.4 }}>{ins.body}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* the women's micronutrient picture, gentle bars */}
      <Card>
        <Eyebrow mb={12} color={T.muted}>Your nutrients, so far today</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {MICROS.map((m) => (
            <div key={m.key}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: SERIF, fontSize: 16.5 }}>{m.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{m.had} / {m.guide} {m.unit}</span>
              </div>
              <SoftBar value={pct(m.had, m.guide)} color={m.key === "iron" ? T.crimson : T.gold} />
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, marginTop: 5 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// + LOG quick-add (RECENTS / FAVOURITES / LOG_METHODS incl photo/voice/barcode)
// ════════════════════════════════════════════════════════════════════════════
const METHOD_ICONS = {
  search: Search, recent: Clock, fave: Star, photo: Camera, voice: Mic, barcode: ScanLine,
};

function QuickAdd({ onClose }) {
  const [added, setAdded] = useState({}); // id -> true (mock confirm tick)
  const toggle = (id) => setAdded((a) => ({ ...a, [id]: !a[id] }));

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(11,8,5,0.42)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 430, maxHeight: "86vh", overflowY: "auto",
        background: T.paper, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderTop: `1px solid ${T.paperDeep}`, padding: "16px 18px 28px",
        boxShadow: "0 -10px 40px rgba(11,8,5,0.3)",
      }}>
        {/* grabber + header */}
        <div style={{ width: 40, height: 4, borderRadius: 999, background: T.paperDeep, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Script size={30} carve>Add a meal</Script>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color={T.muted} />
          </button>
        </div>
        <Hand size={15} color={T.muted} carve={false} style={{ marginBottom: 14 }}>
          A tap is enough — snap it, say it, scan it, or pick a go-to.
        </Hand>

        {/* capture methods */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          {LOG_METHODS.map((m) => {
            const Icon = METHOD_ICONS[m.id] || Search;
            return (
              <div key={m.id} style={{
                background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12,
                padding: "12px 8px", textAlign: "center",
              }}>
                <Icon size={18} color={T.ink} />
                <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.ink, marginTop: 6 }}>{m.label}</div>
                <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, marginTop: 2 }}>{m.hint}</div>
              </div>
            );
          })}
        </div>

        {/* recents — one tap to re-add */}
        <Eyebrow mb={10} color={T.muted}>Recents · one tap to re-add</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {RECENTS.map((r) => (
            <QuickRow key={r.id} name={r.name} kcal={r.kcal} tag={r.tag} on={!!added[r.id]} onTap={() => toggle(r.id)} />
          ))}
        </div>

        {/* favourites */}
        <Eyebrow mb={10} color={T.muted}>Favourites · your go-tos</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAVOURITES.map((f) => (
            <QuickRow key={f.id} name={f.name} kcal={f.kcal} tag={f.tag} on={!!added[f.id]} onTap={() => toggle(f.id)} star />
          ))}
        </div>

        <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, textAlign: "center", marginTop: 20 }}>
          {NOT_MEDICAL}
        </div>
      </div>
    </div>
  );
}

function QuickRow({ name, kcal, tag, on, onTap, star }) {
  return (
    <button onClick={onTap} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
      background: on ? "rgba(143,175,143,0.16)" : T.paperHi,
      border: `1px solid ${on ? T.sage : T.paperDeep}`, borderRadius: 12,
      padding: "11px 13px", cursor: "pointer",
    }}>
      {star && <Star size={14} color={T.gold} style={{ flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.2 }}>{name}</div>
        {tag && <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, marginTop: 2 }}>{tag}</div>}
      </div>
      <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, flexShrink: 0 }}>{kcal} kcal</span>
      <span style={{
        width: 24, height: 24, borderRadius: 999, flexShrink: 0,
        background: on ? T.sage : "transparent",
        border: `1.5px solid ${on ? T.sage : T.paperDeep}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {on ? <Check size={14} color={T.paper} /> : <Plus size={14} color={T.muted} />}
      </span>
    </button>
  );
}
