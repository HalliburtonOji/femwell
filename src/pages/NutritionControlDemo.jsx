// NutritionControlDemo — Control-Center concept, CORRECTED to Halli's spec.
//
// VERTICAL snap slider, ONE feature per FULL-COVER card. A summary header at top,
// then swipe UP through: Log · Today · My Plan · Recipes · AI Plan · Shop ·
// Progress · Insights — each its own full-screen card holding that one feature
// richly inline. FemWell editorial (cream/plum, Ephesis/Cormorant, Lucide). No
// horizontal grid, no Apple dark glass, no emoji, no scoreboards.
//
// Self-contained DEMO: useState only, mock data from ./nutritionDemoShared.
import {
  NotebookPen, UtensilsCrossed, HeartPulse, BookOpen, Sparkles, ShoppingBasket,
  TrendingUp, Leaf, Search, Camera, Mic, ScanLine, Clock, Plus, Check,
} from "lucide-react";
import {
  ME, TODAY, MEALS, RECENTS, LOG_METHODS, PLAN, MICROS, RECIPES, MEAL_PLAN,
  SHOPPING, SHOP_META, PROGRESS, JESS, pct, kcalLeft,
} from "./nutritionDemoShared";
import { T, SERIF, UI, Eyebrow, Script, Hand } from "@/components/journal/Editorial";
import ControlCenter, { Action, Tag, Inset } from "./controlCenterKit";

// gentle energy ring — soft arc, kind label, no shouted number
function Ring({ value, guide, size = 92 }) {
  const r = size / 2 - 7, c = 2 * Math.PI * r, p = pct(value, guide);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paperDeep} strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.gold} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (p / 100) * c} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: SERIF, fontSize: 21, fill: T.ink, fontWeight: 700 }}>{value}</text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: UI, fontSize: 8.5, fill: T.muted, letterSpacing: 0.5 }}>OF {guide}</text>
    </svg>
  );
}
function MacroBar({ label, v }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 10, color: T.muted }}>
        <span style={{ fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
        <span>{v.had}/{v.guide}{v.unit}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
        <div style={{ width: `${pct(v.had, v.guide)}%`, height: "100%", background: T.gold, borderRadius: 999 }} />
      </div>
    </div>
  );
}
function Spark({ data, w = 250, h = 46 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── per-feature card bodies (each fills its full-cover card) ─────────────────
const METHOD_ICON = { search: Search, recent: Clock, fave: HeartPulse, photo: Camera, voice: Mic, barcode: ScanLine };

function LogBody() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {LOG_METHODS.map((m) => {
          const Icon = METHOD_ICON[m.id] || Search;
          return (
            <Inset key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.wax, border: `1px solid ${T.paperDeep}`, color: T.crimson }}>
                <Icon size={16} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{m.label}</div>
                <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.hint}</div>
              </div>
            </Inset>
          );
        })}
      </div>
      <Eyebrow mb={6} mt={4}>Recents · one tap to re-add</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {RECENTS.slice(0, 5).map((r) => (
          <span key={r.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 11px", fontFamily: UI, fontSize: 11, color: T.inkSoft }}>
            <Plus size={12} color={T.muted} />{r.name}
          </span>
        ))}
      </div>
      <Action accent={T.crimson}><Plus size={15} /> Log a meal</Action>
    </>
  );
}

function TodayBody() {
  const logged = MEALS.filter((m) => m.title);
  const next = MEALS.find((m) => !m.title);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Ring value={TODAY.energy.had} guide={TODAY.energy.guide} />
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>Well nourished so far</div>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 3 }}>room for {kcalLeft()} more {TODAY.energy.unit} · a guide, never a cap</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
        <MacroBar label="PROTEIN" v={TODAY.protein} /><MacroBar label="FIBRE" v={TODAY.fibre} /><MacroBar label="IRON" v={TODAY.iron} />
      </div>
      <Eyebrow mb={4} mt={6}>Logged today</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {logged.map((m) => (
          <Inset key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 11 }}>
            <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: T.gold, width: 56, flex: "none" }}>{m.time}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
              <div style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{m.kcal} kcal · {m.note}</div>
            </div>
          </Inset>
        ))}
        {next && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: T.muted, paddingLeft: 4 }}>
            <Clock size={13} /> Next · {next.slot}: {next.planned}
          </div>
        )}
      </div>
    </>
  );
}

function PlanBody() {
  return (
    <>
      <Inset style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: T.ink }}>{PLAN.energyGuide}</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>kcal · gentle energy guide</span>
      </Inset>
      <Hand size={13.5} color={T.muted} style={{ paddingLeft: 2 }}>{PLAN.why}</Hand>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
        {PLAN.targets.map((t) => (
          <div key={t.key} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink, width: 78, flex: "none" }}>{t.label}</span>
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.gold, width: 54, flex: "none" }}>{t.guide}</span>
            <span style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted, lineHeight: 1.25 }}>{t.why}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function RecipesBody() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {RECIPES.map((r) => (
        <Inset key={r.id}>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{r.title}</div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, margin: "3px 0 8px" }}>{r.mins} mins · serves {r.serves}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {r.tags.map((t) => <Tag key={t} accent={T.sage}>{t}</Tag>)}
          </div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.inkSoft }}>
            <Check size={11} color={T.sage} style={{ verticalAlign: -1 }} /> have {r.have.length}
            {r.need.length > 0 && <span style={{ color: T.crimson, marginLeft: 10 }}>+ need {r.need.join(", ")}</span>}
          </div>
        </Inset>
      ))}
    </div>
  );
}

function AiPlanBody() {
  return (
    <>
      <Hand size={14} color={T.muted} style={{ paddingLeft: 2 }}>{MEAL_PLAN.intro}</Hand>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
        {MEAL_PLAN.days.map((d) => (
          <Inset key={d.day} style={{ display: "flex", gap: 10, padding: 11 }}>
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.gold, width: 30, flex: "none" }}>{d.day}</span>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.35 }}>
              {d.b} · {d.l} · <span style={{ color: T.ink, fontWeight: 600 }}>{d.d}</span>
            </div>
          </Inset>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted, marginTop: 2 }}>
        <Sparkles size={13} color={T.sage} /> {MEAL_PLAN.note}
      </div>
    </>
  );
}

function ShopBody() {
  return (
    <>
      <Inset style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{SHOP_META.items} items · {SHOP_META.forDays} days</span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.gold }}>{SHOP_META.est}</span>
      </Inset>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {SHOPPING.map((a) => (
          <div key={a.aisle}>
            <Eyebrow mb={4} color={T.sage}>{a.aisle}</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {a.items.map((it) => (
                <span key={it} style={{ fontFamily: UI, fontSize: 10.5, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 8, padding: "4px 9px" }}>{it}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProgressBody() {
  return (
    <>
      <Inset>
        <Eyebrow mb={6}>This fortnight</Eyebrow>
        <Spark data={PROGRESS.spark} />
        <div style={{ fontFamily: SERIF, fontSize: 12.5, fontStyle: "italic", color: T.muted, marginTop: 6 }}>{PROGRESS.framing}</div>
      </Inset>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {PROGRESS.patterns.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, flex: "none", marginTop: 7, background: p.tone === "good" ? T.sage : T.gold }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{p.title}</div>
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.35, marginTop: 2 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function InsightsBody() {
  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Leaf size={15} color={T.sage} style={{ marginTop: 4, flex: "none" }} />
        <Hand size={15} color={T.inkSoft}>{JESS.todayLine}</Hand>
      </div>
      <Eyebrow mb={4} mt={4}>For your stage · {ME.stageLabel}</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MICROS.slice(0, 4).map((m) => (
          <Inset key={m.key} style={{ padding: 11 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink }}>{m.label}</span>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{m.foods.slice(0, 3).join(" · ")}</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, fontStyle: "italic", color: T.muted, marginTop: 3, lineHeight: 1.3 }}>{m.note}</div>
          </Inset>
        ))}
      </div>
    </>
  );
}

// ── the card set — ONE feature per full-cover card ──────────────────────────
const CARDS = [
  { id: "log", title: "Log", essence: "A meal in seconds.", icon: NotebookPen, accent: T.crimson, render: LogBody },
  { id: "today", title: "Today", essence: "Your plate so far.", icon: UtensilsCrossed, accent: T.gold, render: TodayBody },
  { id: "plan", title: "My Plan", essence: "What your body's asking for.", icon: HeartPulse, accent: T.gold, render: PlanBody },
  { id: "recipes", title: "Recipes", essence: "Cook what you have in.", icon: BookOpen, accent: T.sage, render: RecipesBody },
  { id: "aiplan", title: "AI Plan", essence: "A gentle, stage-aware week.", icon: Sparkles, accent: T.sage, render: AiPlanBody },
  { id: "shop", title: "Shop", essence: "The list, sorted by aisle.", icon: ShoppingBasket, accent: T.sage, render: ShopBody },
  { id: "progress", title: "Progress", essence: "Patterns, not scores.", icon: TrendingUp, accent: T.gold, render: ProgressBody },
  { id: "insights", title: "Insights", essence: "Nourishment for your stage.", icon: Leaf, accent: T.sage, render: InsightsBody },
];

// ── header (the summary "now" page) ─────────────────────────────────────────
function Header() {
  return (
    <>
      <Eyebrow mb={10}>{ME.greetingTime.toUpperCase()}, {ME.name.toUpperCase()} · {ME.stageLabel.toUpperCase()} · {ME.cyclePhase.toUpperCase()}</Eyebrow>
      <Script size={40} style={{ marginBottom: 16 }}>your plate today</Script>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <Ring value={TODAY.energy.had} guide={TODAY.energy.guide} size={104} />
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontWeight: 600, lineHeight: 1.25 }}>Well nourished so far</div>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 4 }}>room for {kcalLeft()} more {TODAY.energy.unit} · a gentle guide, never a cap</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
        <MacroBar label="PROTEIN" v={TODAY.protein} /><MacroBar label="FIBRE" v={TODAY.fibre} /><MacroBar label="IRON" v={TODAY.iron} />
      </div>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: "auto" }}>
        <Leaf size={14} color={T.sage} style={{ marginTop: 4, flex: "none" }} />
        <Hand size={15} color={T.muted}>{TODAY.warmline}</Hand>
      </div>
    </>
  );
}

export default function NutritionControlDemo() {
  return (
    <ControlCenter
      banner="Nutrition · Control-Center concept — mock data"
      header={<Header />}
      cards={CARDS}
      footer={
        <div style={{ textAlign: "center", padding: "6px 20px 0", flex: "none" }}>
          <div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>
            FemWell · nourishment for your whole life, not a scoreboard.
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 6, letterSpacing: 0.3 }}>
            Not medical advice — Jess is a wellness companion.
          </div>
        </div>
      }
    />
  );
}
