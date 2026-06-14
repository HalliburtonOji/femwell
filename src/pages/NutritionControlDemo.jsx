// NutritionControlDemo — "Control-Center" concept, FemWell-reinterpreted.
//
// The brief: reimagine Apple's iOS Control Center music/AirPlay card, but NOT
// as dark translucent glass. We translate the *structure* (a big card floating
// over a dimmed backdrop, a tile grid with a peek of the next column, a pinned
// quick-jump rail) into FemWell EDITORIAL: cream/plum paper, Ephesis + Cormorant,
// Lucide/SVG icons, soft shadows + rounding, no emoji, no scoreboards.
//
// Layout, top → bottom:
//   • TOP BANNER (mock-data marker, exact spec).
//   • HEADER = the Daily-Hub plate summary (greeting · stage · phase, "your plate
//     today" in Ephesis, an energy RING with "room for more" framing, a macro row
//     of mini-bars, a Jess line). Gentle, never a scoreboard.
//   • The DIM LAYER + the big FULL-SCREEN-COVERING rounded CARD floating over it.
//     Inside the card: a 2-COLUMN scroll-snap GRID of large rounded tiles, the
//     next column PEEKING at the right edge; and a vertical JUMP RAIL pinned on
//     the right with quick-jump icons.
//
// Self-contained DEMO: useState/useEffect ONLY. No base44, no entities, no
// network, no props. Mock data reused from ./nutritionDemoShared.
import { useState, useRef } from "react";
import {
  Plus, UtensilsCrossed, NotebookPen, BookOpen, Sparkles, ShoppingBasket,
  TrendingUp, Leaf, HeartPulse, ChevronRight,
} from "lucide-react";
import {
  ME, TODAY, MEALS, RECENTS, PLAN, MICROS, RECIPES, AI_RECIPE,
  SHOP_META, PROGRESS, JESS, pct, kcalLeft,
} from "./nutritionDemoShared";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const COL = 430;     // phone column
const RAIL_W = 50;   // pinned right jump-rail width

// ── gentle energy ring (no shouted number — a soft arc + a kind label) ────────
function Ring({ value, guide, size = 78 }) {
  const r = size / 2 - 6, c = 2 * Math.PI * r, p = pct(value, guide);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paperDeep} strokeWidth={5.5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.gold} strokeWidth={5.5} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (p / 100) * c} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: SERIF, fontSize: 17, fill: T.ink, fontWeight: 600 }}>{value}</text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: UI, fontSize: 8, fill: T.muted, letterSpacing: 0.5 }}>OF {guide}</text>
    </svg>
  );
}

// ── a single macro mini-bar (Protein / Fibre / Iron) ──────────────────────────
function MacroBar({ label, v }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 10, color: T.muted }}>
        <span style={{ fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
        <span>{v.had}/{v.guide}{v.unit}</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
        <div style={{ width: `${pct(v.had, v.guide)}%`, height: "100%", background: T.gold, borderRadius: 999 }} />
      </div>
    </div>
  );
}

// ── HEADER = the Daily-Hub plate summary ──────────────────────────────────────
function PlateHeader() {
  return (
    <header style={{ padding: "20px 20px 22px" }}>
      <Eyebrow mb={10}>
        {ME.greetingTime.toUpperCase()}, {ME.name.toUpperCase()} · {ME.stageLabel.toUpperCase()} · FOLLICULAR · DAY 6
      </Eyebrow>
      <Script size={34} style={{ marginBottom: 14 }}>your plate today</Script>

      {/* energy ring + the kind "room for more" line */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <Ring value={TODAY.energy.had} guide={TODAY.energy.guide} />
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontWeight: 600, lineHeight: 1.25 }}>
            Well nourished so far
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 3 }}>
            room for {kcalLeft()} more {TODAY.energy.unit} · a gentle guide, never a cap
          </div>
        </div>
      </div>

      {/* macro row — three mini-bars, side by side */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <MacroBar label="PROTEIN" v={TODAY.protein} />
        <MacroBar label="FIBRE" v={TODAY.fibre} />
        <MacroBar label="IRON" v={TODAY.iron} />
      </div>

      {/* Jess line */}
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <Leaf size={14} color={T.sage} style={{ marginTop: 4, flex: "none" }} />
        <Hand size={15} color={T.muted}>{TODAY.warmline}</Hand>
      </div>
    </header>
  );
}

// ── the GRID TILES — each large rounded card carries title, essence, preview ──
// Mock preview lines are inlined per tile so the grid reads "phone-real".
const TILES = [
  { id: "log", title: "Log", icon: NotebookPen, accent: T.crimson,
    essence: "A meal in seconds.",
    preview: ["Recents", RECENTS.slice(0, 2).map((r) => r.name).join(" · ")] },
  { id: "today", title: "Today", icon: UtensilsCrossed, accent: T.gold,
    essence: "Your plate so far.",
    preview: ["Logged", `${MEALS.filter((m) => m.title).length} meals · next: ${MEALS.find((m) => !m.title)?.planned}`] },
  { id: "plan", title: "My Plan", icon: HeartPulse, accent: T.gold,
    essence: "What your body's asking for.",
    preview: ["Guide", `${PLAN.energyGuide} kcal · ${PLAN.targets[0].guide} protein`] },
  { id: "recipes", title: "Recipes", icon: BookOpen, accent: T.sage,
    essence: "Cook what you have in.",
    preview: ["Tonight", RECIPES[1].title] },
  { id: "aiplan", title: "AI Plan", icon: Sparkles, accent: T.sage,
    essence: "A gentle, stage-aware week.",
    preview: ["From AI", AI_RECIPE.title] },
  { id: "shop", title: "Shop", icon: ShoppingBasket, accent: T.sage,
    essence: "The list, sorted by aisle.",
    preview: ["List", `${SHOP_META.items} items · ${SHOP_META.est} · ${SHOP_META.forDays} days`] },
  { id: "progress", title: "Progress", icon: TrendingUp, accent: T.gold,
    essence: "Patterns, not scores.",
    preview: ["Lately", PROGRESS.patterns[0].title] },
  { id: "insights", title: "Insights", icon: Leaf, accent: T.sage,
    essence: "Nourishment for your stage.",
    preview: ["Jess", "A little iron at dinner would round today out."] },
  { id: "stage", title: "For your stage", icon: HeartPulse, accent: T.crimson,
    essence: "Women's micronutrients.",
    preview: ["Iron", `${MICROS[0].had}/${MICROS[0].guide}${MICROS[0].unit} · pair with vitamin C`] },
];

function Tile({ tile, onActivate }) {
  const Icon = tile.icon;
  return (
    <button onClick={onActivate} style={{
      scrollSnapAlign: "start", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18,
      padding: 15, display: "flex", flexDirection: "column", gap: 10, minHeight: 150,
      boxShadow: "0 6px 16px -12px rgba(33,26,18,0.45)",
    }}>
      {/* icon disc + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 11, flex: "none", display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          background: T.wax, border: `1px solid ${T.paperDeep}`, color: tile.accent,
        }}>
          <Icon size={17} />
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontWeight: 600 }}>{tile.title}</span>
      </div>

      {/* one-line essence */}
      <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, fontStyle: "italic", lineHeight: 1.3 }}>
        {tile.essence}
      </div>

      {/* mock preview line — pushed to the bottom of the tile */}
      <div style={{ marginTop: "auto", paddingTop: 4 }}>
        <div style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: tile.accent, marginBottom: 3 }}>
          {tile.preview[0]}
        </div>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.inkSoft, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {tile.preview[1]}
        </div>
      </div>
    </button>
  );
}

// ── the RIGHT JUMP RAIL — pinned vertical quick-jump icons ─────────────────────
const RAIL = [
  { id: "log", label: "Log", icon: NotebookPen },
  { id: "today", label: "Today", icon: UtensilsCrossed },
  { id: "recipes", label: "Recipes", icon: BookOpen },
  { id: "shop", label: "Shop", icon: ShoppingBasket },
  { id: "insights", label: "Insights", icon: Leaf },
];
function JumpRail({ active, onJump }) {
  return (
    <div style={{
      position: "sticky", top: 14, alignSelf: "flex-start", flex: "none", width: RAIL_W,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
      padding: "12px 0", marginLeft: 6,
      background: T.wax, border: `1px solid ${T.paperDeep}`, borderRadius: 999,
      boxShadow: "0 6px 16px -12px rgba(33,26,18,0.45)",
    }}>
      {RAIL.map((r) => {
        const Icon = r.icon;
        const on = active === r.id;
        return (
          <button key={r.id} onClick={() => onJump(r.id)} aria-label={r.label} title={r.label} style={{
            width: 38, height: 38, borderRadius: 999, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: on ? T.ink : "transparent", color: on ? T.paper : T.inkSoft,
            border: `1px solid ${on ? T.ink : "transparent"}`,
          }}>
            <Icon size={17} />
          </button>
        );
      })}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function NutritionControlDemo() {
  useEditorialFonts();

  const [active, setActive] = useState(null);   // last quick-jumped surface (rail highlight)
  const gridRef = useRef(null);
  const tileRefs = useRef({});

  // tapping a rail icon scrolls the matching grid tile into view (a real "jump")
  const jump = (id) => {
    setActive(id);
    const el = tileRefs.current[id];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 40 }}>
      <InkFilter />

      {/* mock-data banner (exact spec) */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Nutrition · Control-Center concept — mock data
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative" }}>
        {/* HEADER — the Daily-Hub plate summary, sitting above the floating card */}
        <PlateHeader />

        {/* THE FLOATING CARD OVER A DIMMED BACKDROP.
            The dim is a soft inset wash inside the editorial frame (not dark glass):
            a thin scrim band + a settling shadow so the card reads as lifted above
            the page. The card itself is the big rounded panel; it "covers" the rest
            of the screen (min-height fills the viewport below the header). */}
        <div style={{ position: "relative", padding: "0 14px 18px" }}>
          {/* the dimmed backdrop — a gentle cream scrim, NOT black translucency */}
          <div aria-hidden style={{
            position: "absolute", inset: "8px 8px 0", borderRadius: 30,
            background: "linear-gradient(rgba(58,44,26,0.10), rgba(58,44,26,0.04))",
            boxShadow: "inset 0 1px 0 rgba(58,44,26,0.10)",
          }} />

          {/* the floating panel */}
          <section style={{
            position: "relative",
            background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 26,
            minHeight: "76vh", padding: "18px 4px 18px 16px",
            boxShadow: "0 24px 60px -28px rgba(33,26,18,0.55), 0 2px 0 rgba(255,253,247,0.7) inset",
            display: "flex", gap: 4,
          }}>
            {/* the grip — a little editorial handle, the "pulled-up sheet" cue */}
            <div aria-hidden style={{
              position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)",
              width: 42, height: 4, borderRadius: 999, background: T.paperDeep,
            }} />

            {/* LEFT: the 2-column scroll-snap grid (next column peeks at the edge) */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 12 }}>
              <Eyebrow mb={10}>Your nourishment, in reach</Eyebrow>
              <div ref={gridRef} className="nctl-grid" style={{
                display: "grid",
                // ~2.18 columns visible → the third column peeks at the right edge
                gridAutoFlow: "column",
                gridTemplateRows: "repeat(2, auto)",
                gridAutoColumns: "calc((100% - 24px) / 2.18)",
                gap: 12,
                overflowX: "auto", overflowY: "hidden",
                scrollSnapType: "x mandatory",
                paddingBottom: 6, paddingRight: 4,
                scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
              }}>
                <style>{`.nctl-grid::-webkit-scrollbar{display:none}`}</style>
                {TILES.map((tile) => (
                  <div key={tile.id} ref={(el) => { tileRefs.current[tile.id] = el; }} style={{ display: "flex" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ flex: 1, display: "flex" }}>
                        <Tile tile={tile} onActivate={() => setActive(tile.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* gentle "swipe for more" cue under the grid */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, color: T.muted }}>
                <ChevronRight size={13} />
                <span style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.4 }}>
                  slide across for more · {TILES.length} cards
                </span>
              </div>

              {/* the ONE quiet primary action the card carries */}
              <button style={{
                width: "100%", marginTop: 16, display: "inline-flex", alignItems: "center",
                justifyContent: "center", gap: 8, background: T.ink, color: T.paper, border: "none",
                borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 12, fontWeight: 700,
                letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer",
              }}>
                <Plus size={15} /> Log dinner
              </button>
            </div>

            {/* RIGHT: the pinned vertical jump rail */}
            <JumpRail active={active} onJump={jump} />
          </section>
        </div>

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "8px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            FemWell · nourishment for your whole life, not a scoreboard.
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>
            {JESS.todayLine ? "Not medical advice — Jess is a wellness companion." : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
