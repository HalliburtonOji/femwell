// NutritionDemo1 — "Hero Card Slider" (the founder's explicit ask)
// A big HORIZONTAL swipeable card slider is the SPINE of the page. Each slide is
// ONE feature surface rendered as a rich, tall card. Above the slider: a slim
// greeting + a small gentle "today" ring. The slider REPLACES the 7-tab bar —
// instead of choosing a tab, you swipe through cards. The next card PEEKs at the
// right edge (~85vw / ~365px) so the gesture is obvious. Each card has ONE clear
// primary action. Decision fatigue collapses into a single swipe.
//
// Self-contained DEMO: useState/useEffect ONLY. No base44, no entities, no
// network, no props. Mock data from ./nutritionDemoShared.
// Brand-pure: T tokens only, crimson the single pop, no emoji, Lucide + SVG only.
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Droplet, Plus, Search, Clock, Star, Camera,
  Mic, ScanLine, Utensils, Leaf, ShoppingBasket, Sparkles, TrendingUp,
} from "lucide-react";
import {
  ME, SURFACES, TODAY, HYDRATION, MEALS, RECENTS, FAVOURITES, LOG_METHODS,
  FOOD_SEARCH_SAMPLE, PLAN, MICROS, RECIPES, AI_RECIPE, MEAL_PLAN, SHOPPING,
  SHOP_META, PROGRESS, JESS, NOT_MEDICAL, FOOTER_LINE, pct, kcalLeft,
} from "./nutritionDemoShared";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const COL = 430;      // phone column
const CARD_W = 365;   // ~85vw — next card peeks at the right edge
const GAP = 14;

// ── tiny shared bits ─────────────────────────────────────────────────────────
function SoftBar({ value, guide, color = T.gold }) {
  const p = pct(value, guide);
  return (
    <div style={{ height: 6, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
      <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}
function TinyTag({ children }) {
  if (!children) return null;
  return (
    <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.5, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}
// the ONE clear primary action each card carries
function PrimaryAction({ icon: Icon, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 8, background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "13px 16px",
      fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer",
    }}>
      {Icon ? <Icon size={15} /> : null}{children}
    </button>
  );
}
// the rich card shell — tall, scroll-snapped, peeking
function CardShell({ surface, accent = T.gold, children }) {
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W,
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 528,
      boxShadow: "0 10px 26px -18px rgba(33,26,18,0.5)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <Eyebrow color={accent}>{surface.label}</Eyebrow>
        <TinyTag>{surface.blurb}</TinyTag>
      </div>
      <Rule mb={14} />
      {children}
    </section>
  );
}

// ── CARD 1 · TODAY ───────────────────────────────────────────────────────────
function CardToday({ surface }) {
  const e = TODAY.energy;
  return (
    <CardShell surface={surface}>
      <Script size={30} style={{ marginBottom: 2 }}>Today’s plate</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>{TODAY.warmline}</Hand>

      {/* gentle energy picture — room for more, not a scoreboard */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <Ring value={e.had} guide={e.guide} size={72} />
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontWeight: 600 }}>
            Still room to nourish
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2 }}>
            {kcalLeft()} {e.unit} left in today’s gentle guide
          </div>
        </div>
      </div>

      {/* macro lines */}
      <div style={{ display: "grid", gap: 9, marginBottom: 14 }}>
        {[
          { l: "Protein", v: TODAY.protein }, { l: "Fibre", v: TODAY.fibre }, { l: "Iron", v: TODAY.iron },
        ].map((m) => (
          <div key={m.l}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 11, color: T.muted }}>
              <span>{m.l}</span><span>{m.v.had}/{m.v.guide}{m.v.unit}</span>
            </div>
            <SoftBar value={m.v.had} guide={m.v.guide} />
          </div>
        ))}
      </div>

      {/* hydration */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Droplet size={14} color={T.sage} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 11, color: T.muted }}>
            <span>Hydration</span><span>{HYDRATION.cups} of {HYDRATION.guide} · last {HYDRATION.lastAt}</span>
          </div>
          <SoftBar value={HYDRATION.cups} guide={HYDRATION.guide} color={T.sage} />
        </div>
      </div>

      {/* logged meals */}
      <Eyebrow mb={8}>Logged today</Eyebrow>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {MEALS.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, fontWeight: 700, width: 58, textTransform: "uppercase" }}>{m.slot}</span>
            <div style={{ flex: 1 }}>
              {m.title
                ? <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{m.title}</div>
                : <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, fontStyle: "italic" }}>Planned · {m.planned}</div>}
            </div>
            <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{m.kcal ? `${m.kcal} kcal` : m.time || ""}</span>
          </div>
        ))}
      </div>

      <PrimaryAction icon={Plus}>Log dinner</PrimaryAction>
    </CardShell>
  );
}

// gentle energy ring (no shouted number, soft arc)
function Ring({ value, guide, size = 72 }) {
  const r = size / 2 - 5, c = 2 * Math.PI * r, p = pct(value, guide);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paperDeep} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.gold} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (p / 100) * c} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: SERIF, fontSize: 13, fill: T.ink, fontWeight: 600 }}>{p}%</text>
    </svg>
  );
}

// ── CARD 2 · LOG ─────────────────────────────────────────────────────────────
const METHOD_ICONS = { search: Search, recent: Clock, fave: Star, photo: Camera, voice: Mic, barcode: ScanLine };
function CardLog({ surface }) {
  const [open, setOpen] = useState("recent");
  return (
    <CardShell surface={surface}>
      <Script size={30} style={{ marginBottom: 2 }}>Add a meal</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>In seconds — tap how you’d like to log.</Hand>

      {/* method rail */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        {LOG_METHODS.map((mth) => {
          const Icon = METHOD_ICONS[mth.id] || Plus;
          const active = open === mth.id;
          return (
            <button key={mth.id} onClick={() => setOpen(active ? null : mth.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "11px 4px",
              background: active ? T.ink : "transparent", color: active ? T.paper : T.inkSoft,
              border: `1px solid ${active ? T.ink : T.paperDeep}`, borderRadius: 12, cursor: "pointer",
            }}>
              <Icon size={16} />
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3, textAlign: "center" }}>{mth.label}</span>
            </button>
          );
        })}
      </div>

      {/* expanded surface */}
      <div style={{ flex: 1 }}>
        {open === "recent" && <ChipAddList items={RECENTS} label="Recents — one tap to re-add" />}
        {open === "fave" && <ChipAddList items={FAVOURITES} label="Favourites — your go-tos" />}
        {open === "search" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px", marginBottom: 10 }}>
              <Search size={13} color={T.muted} />
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>spin</span>
            </div>
            <ChipAddList items={FOOD_SEARCH_SAMPLE.map((s) => ({ id: s.id, name: s.name, kcal: s.kcal, tag: s.tag }))} label="UK food database" />
          </div>
        )}
        {(open === "photo" || open === "voice" || open === "barcode") && (
          <div style={{ textAlign: "center", padding: "26px 10px", border: `1px dashed ${T.paperDeep}`, borderRadius: 12 }}>
            {open === "photo" && <Camera size={26} color={T.muted} />}
            {open === "voice" && <Mic size={26} color={T.muted} />}
            {open === "barcode" && <ScanLine size={26} color={T.muted} />}
            <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginTop: 10 }}>
              {LOG_METHODS.find((m) => m.id === open)?.label}
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 4 }}>
              {LOG_METHODS.find((m) => m.id === open)?.hint}
            </div>
          </div>
        )}
        {open === null && <Hand size={14} color={T.muted}>Pick a way to log above.</Hand>}
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryAction icon={Plus} onClick={() => setOpen("recent")}>Add a recent</PrimaryAction>
      </div>
    </CardShell>
  );
}
function ChipAddList({ items, label }) {
  return (
    <div>
      <Eyebrow mb={9}>{label}</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((it) => (
          <button key={it.id} style={{
            display: "inline-flex", alignItems: "center", gap: 7, background: T.wax,
            border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px 7px 10px", cursor: "pointer",
          }}>
            <Plus size={12} color={T.crimson} />
            <span style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>{it.name}</span>
            <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>{it.kcal} kcal</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CARD 3 · MY PLAN ─────────────────────────────────────────────────────────
function CardPlan({ surface }) {
  return (
    <CardShell surface={surface}>
      <Script size={28} style={{ marginBottom: 2 }}>What your body’s asking for</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>{PLAN.why}</Hand>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: SERIF, fontSize: 30, color: T.ink, fontWeight: 600 }}>{PLAN.energyGuide}</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.5 }}>kcal · a guide, never a cap</span>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        {PLAN.targets.map((t) => (
          <div key={t.key}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{t.label}</span>
              <span style={{ fontFamily: UI, fontSize: 11, color: T.gold, fontWeight: 700 }}>{t.guide}</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", marginTop: 2 }}>{t.why}</div>
          </div>
        ))}
      </div>

      <PrimaryAction icon={Utensils}>See foods that fit</PrimaryAction>
    </CardShell>
  );
}

// ── CARD 4 · RECIPES ─────────────────────────────────────────────────────────
function CardRecipes({ surface }) {
  const [gen, setGen] = useState(false);
  return (
    <CardShell surface={surface} accent={T.sage}>
      <Script size={30} style={{ marginBottom: 2 }}>Cook what you have</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>Saved recipes, sorted by what’s already in.</Hand>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {!gen ? (
          <div style={{ display: "grid", gap: 12 }}>
            {RECIPES.map((r) => (
              <div key={r.id} style={{ border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: 12 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", margin: "3px 0 7px" }}>{r.why}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7 }}>
                  {r.tags.map((tg) => (
                    <span key={tg} style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.sage, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "2px 7px" }}>{tg}</span>
                  ))}
                </div>
                <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>
                  Have: {r.have.join(", ")}{r.need.length ? ` · Need: ${r.need.join(", ")}` : " · nothing to buy"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.sage}`, borderRadius: 12, padding: 14, background: T.wax }}>
            <Eyebrow mb={6} color={T.sage}>Generated from what’s in</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontWeight: 600 }}>{AI_RECIPE.title}</div>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, margin: "3px 0 8px" }}>{AI_RECIPE.mins} min · serves {AI_RECIPE.serves}</div>
            <Hand size={13} color={T.muted} style={{ marginBottom: 10 }}>{AI_RECIPE.why}</Hand>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.inkSoft, marginBottom: 8 }}>{AI_RECIPE.ingredients.join(" · ")}</div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {AI_RECIPE.steps.map((s, i) => (
                <li key={i} style={{ fontFamily: SERIF, fontSize: 13, color: T.ink, marginBottom: 4 }}>{s}</li>
              ))}
            </ol>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, marginTop: 10 }}>{AI_RECIPE.nutrition}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryAction icon={Sparkles} onClick={() => setGen((g) => !g)}>
          {gen ? "Back to saved" : "Generate from what’s in"}
        </PrimaryAction>
      </div>
    </CardShell>
  );
}

// ── CARD 5 · MEAL PLAN ───────────────────────────────────────────────────────
function CardMealPlan({ surface }) {
  return (
    <CardShell surface={surface} accent={T.sage}>
      <Script size={30} style={{ marginBottom: 2 }}>A gentle week</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>{MEAL_PLAN.intro}</Hand>

      <div style={{ flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: "0 8px" }}>
          {MEAL_PLAN.days.map((d) => (
            <div key={d.day} style={{ display: "contents" }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: T.gold, letterSpacing: 0.5, textTransform: "uppercase", paddingTop: 9, borderTop: `1px solid ${T.paperDeep}` }}>{d.day}</div>
              <div style={{ paddingTop: 9, paddingBottom: 9, borderTop: `1px solid ${T.paperDeep}` }}>
                {[["B", d.b], ["L", d.l], ["D", d.d]].map(([slot, meal]) => (
                  <div key={slot} style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 3 }}>
                    <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, color: T.muted, width: 12 }}>{slot}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>{meal}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Hand size={13} color={T.muted} style={{ marginTop: 12 }}>{MEAL_PLAN.note}</Hand>
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryAction icon={ShoppingBasket}>Send to shopping list</PrimaryAction>
      </div>
    </CardShell>
  );
}

// ── CARD 6 · SHOP ────────────────────────────────────────────────────────────
function CardShop({ surface }) {
  return (
    <CardShell surface={surface} accent={T.sage}>
      <Script size={30} style={{ marginBottom: 2 }}>The list</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 12 }}>Sorted by aisle, straight from your plan.</Hand>

      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        {[[SHOP_META.items, "items"], [SHOP_META.est, "estimate"], [SHOP_META.forDays + " days", "covered"]].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontWeight: 600 }}>{v}</div>
            <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "grid", gap: 12 }}>
        {SHOPPING.map((grp) => (
          <div key={grp.aisle}>
            <Eyebrow mb={6} color={T.sage}>{grp.aisle}</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {grp.items.map((it) => (
                <span key={it} style={{ fontFamily: SERIF, fontSize: 13, color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 10px" }}>{it}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryAction icon={ShoppingBasket}>Tick off as you shop</PrimaryAction>
      </div>
    </CardShell>
  );
}

// ── CARD 7 · PROGRESS ────────────────────────────────────────────────────────
function CardProgress({ surface }) {
  return (
    <CardShell surface={surface}>
      <Script size={30} style={{ marginBottom: 2 }}>Patterns, not scores</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>{PROGRESS.framing}</Hand>

      <Eyebrow mb={8}>This fortnight</Eyebrow>
      <Sparkline data={PROGRESS.spark} />

      <div style={{ display: "grid", gap: 12, marginTop: 16, flex: 1 }}>
        {PROGRESS.patterns.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <span style={{ width: 6, borderRadius: 999, background: p.tone === "good" ? T.sage : T.gold, flex: "none" }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", marginTop: 1 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <PrimaryAction icon={TrendingUp}>See what shapes your days</PrimaryAction>
    </CardShell>
  );
}
function Sparkline({ data }) {
  const w = 320, h = 56, max = Math.max(...data), min = Math.min(...data);
  const x = (i) => (i / (data.length - 1)) * w;
  const y = (v) => h - 6 - ((v - min) / (max - min || 1)) * (h - 12);
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={d} fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2.4} fill={T.gold} />)}
    </svg>
  );
}

// ── CARD 8 · INSIGHTS ────────────────────────────────────────────────────────
function CardInsights({ surface }) {
  return (
    <CardShell surface={surface}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Leaf size={16} color={T.sage} />
        <Eyebrow color={T.sage}>Jess · for your stage</Eyebrow>
      </div>
      <Hand size={16} color={T.ink} style={{ marginBottom: 14 }}>{JESS.todayLine}</Hand>

      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {JESS.insights.map((ins, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 11 }}>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, fontWeight: 600 }}>{ins.title}</div>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, marginTop: 1 }}>{ins.body}</div>
          </div>
        ))}
      </div>

      <Eyebrow mb={8}>Gentle nudges</Eyebrow>
      <div style={{ flex: 1, display: "grid", gap: 9 }}>
        {MICROS.map((m) => (
          <div key={m.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{m.had}/{m.guide}{m.unit}</span>
            </div>
            <SoftBar value={m.had} guide={m.guide} color={pct(m.had, m.guide) < 70 ? T.crimson : T.sage} />
            <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 4 }}>
              {m.foods.join(" · ")} — {m.note}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ── the cards, in surface order ──────────────────────────────────────────────
const CARDS = [CardToday, CardLog, CardPlan, CardRecipes, CardMealPlan, CardShop, CardProgress, CardInsights];

// ── the slider spine ─────────────────────────────────────────────────────────
function Slider() {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const last = SURFACES.length - 1;

  // keep active index in sync with manual scroll-snap swipes
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
  }, [last]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  return (
    <div>
      {/* segmented label rail — which surface you're on */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 20px 12px", WebkitOverflowScrolling: "touch" }}>
        {SURFACES.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} style={{
            flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
            border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
            fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
          }}>{s.label}</button>
        ))}
      </div>

      {/* the swipeable track — real CSS scroll-snap, next card peeks */}
      <div ref={trackRef} className="nutri-track" style={{
        display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
        padding: "0 20px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
      }}>
        <style>{`.nutri-track::-webkit-scrollbar{display:none}`}</style>
        {CARDS.map((Card, i) => <Card key={SURFACES[i].id} surface={SURFACES[i]} />)}
        {/* trailing spacer so the last card can center-snap */}
        <div style={{ flex: `0 0 ${COL - CARD_W - 20}px` }} aria-hidden />
      </div>

      {/* prev / dots / next */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 20px 0" }}>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} style={navBtn(active === 0)} aria-label="Previous card">
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
        <button onClick={() => goTo(active + 1)} disabled={active === last} style={navBtn(active === last)} aria-label="Next card">
          <ChevronRight size={18} />
        </button>
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

// ── page ─────────────────────────────────────────────────────────────────────
export default function NutritionDemo1() {
  useEditorialFonts();

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />

      {/* mock-data banner */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Nutrition · Hero Card Slider — mock data
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto" }}>
        {/* slim greeting + gentle today ring */}
        <header style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Eyebrow mb={4}>{ME.greetingTime}, {ME.name}</Eyebrow>
            <Script size={30} style={{ marginBottom: 2 }}>Nourishment</Script>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.4 }}>
              {ME.stageLabel} · {ME.cyclePhase}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Ring value={TODAY.energy.had} guide={TODAY.energy.guide} size={64} />
            <div style={{ fontFamily: UI, fontSize: 9, color: T.muted, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>today</div>
          </div>
        </header>

        <Rule w="calc(100% - 40px)" mb={16} c={T.paperDeep} />
        <div style={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}>
          <Hand size={15} color={T.muted}>Swipe through your day — one card, one clear next thing.</Hand>
        </div>

        {/* THE SPINE — the hero card slider replaces the tab bar */}
        <Slider />

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "26px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>{FOOTER_LINE}</div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>{NOT_MEDICAL}</div>
        </footer>
      </div>
    </div>
  );
}
