// NutritionHubDemo — the "rich summary HEADER + big horizontal SLIDING CARDS" design
// language applied to NUTRITION. Header = the Daily-Hub plate summary; cards = Log /
// Today / My Plan / Recipes / Shop / Progress / Insights, each a big card holding that
// feature richly. Shares hubDemoKit with JournalHubDemo so they read as one system.
// Self-contained demo: mock data from ./nutritionDemoShared. FemWell editorial.
import {
  NotebookPen, UtensilsCrossed, HeartPulse, BookOpen, ShoppingBasket,
  TrendingUp, Leaf, Search, Camera, Mic, ScanLine, Clock, Plus,
} from "lucide-react";
import {
  ME, TODAY, MEALS, RECENTS, LOG_METHODS, PLAN, MICROS, RECIPES,
  SHOPPING, SHOP_META, PROGRESS, JESS, pct, kcalLeft,
} from "./nutritionDemoShared";
import { T, SERIF, UI, Script, Hand } from "@/components/journal/Editorial";
import HubDemo, { Action, Inset, Tag, Eyebrow2 } from "./hubDemoKit";

function Ring({ value, guide, size = 96 }) {
  const r = size / 2 - 7, c = 2 * Math.PI * r, p = pct(value, guide);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paperDeep} strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.gold} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (p / 100) * c} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: SERIF, fontSize: 20, fill: T.ink, fontWeight: 700 }}>{value}</text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: UI, fontSize: 8, fill: T.muted, letterSpacing: 0.5 }}>OF {guide}</text>
    </svg>
  );
}
function MacroBar({ label, v }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 10, color: T.muted }}>
        <span style={{ fontWeight: 700, letterSpacing: 0.3 }}>{label}</span><span>{v.had}/{v.guide}{v.unit}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
        <div style={{ width: `${pct(v.had, v.guide)}%`, height: "100%", background: T.gold, borderRadius: 999 }} />
      </div>
    </div>
  );
}
function Spark({ data, w = 240, h = 44 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / (max - min || 1)) * (h - 8) - 4).toFixed(1)}`).join(" ");
  return <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}><polyline points={pts} fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const METHOD_ICON = { search: Search, recent: Clock, fave: HeartPulse, photo: Camera, voice: Mic, barcode: ScanLine };

function LogBody() {
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
      {LOG_METHODS.map((m) => { const Icon = METHOD_ICON[m.id] || Search; return (
        <Inset key={m.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: 11 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.wax, border: `1px solid ${T.paperDeep}`, color: T.crimson }}><Icon size={15} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{m.label}</div>
            <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.hint}</div>
          </div>
        </Inset>); })}
    </div>
    <Eyebrow2>Recents · one tap</Eyebrow2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {RECENTS.slice(0, 4).map((r) => <span key={r.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 10px", fontFamily: UI, fontSize: 10.5, color: T.inkSoft }}><Plus size={11} color={T.muted} />{r.name}</span>)}
    </div>
    <Action accent={T.crimson}><Plus size={15} /> Log a meal</Action>
  </>);
}
function TodayBody() {
  const logged = MEALS.filter((m) => m.title);
  return (<>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Ring value={TODAY.energy.had} guide={TODAY.energy.guide} />
      <div><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>Well nourished so far</div>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 3 }}>room for {kcalLeft()} more {TODAY.energy.unit}</div></div>
    </div>
    <div style={{ display: "flex", gap: 12, marginTop: 2 }}><MacroBar label="PROTEIN" v={TODAY.protein} /><MacroBar label="FIBRE" v={TODAY.fibre} /><MacroBar label="IRON" v={TODAY.iron} /></div>
    <Eyebrow2>Logged today</Eyebrow2>
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {logged.map((m) => <Inset key={m.id} style={{ display: "flex", gap: 10, padding: 10 }}>
        <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: T.gold, width: 48, flex: "none" }}>{m.time}</span>
        <div style={{ minWidth: 0 }}><div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
          <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>{m.kcal} kcal · {m.note}</div></div></Inset>)}
    </div>
  </>);
}
function PlanBody() {
  return (<>
    <Inset style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: T.ink }}>{PLAN.energyGuide}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>kcal · gentle guide</span></Inset>
    <Hand size={13} color={T.muted}>{PLAN.why}</Hand>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
      {PLAN.targets.slice(0, 4).map((t) => <div key={t.key} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 700, color: T.ink, width: 70, flex: "none" }}>{t.label}</span>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.gold, width: 50, flex: "none" }}>{t.guide}</span>
        <span style={{ fontFamily: SERIF, fontSize: 12.5, fontStyle: "italic", color: T.muted, lineHeight: 1.25 }}>{t.why}</span></div>)}
    </div>
  </>);
}
function RecipesBody() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {RECIPES.map((r) => <Inset key={r.id}>
      <div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{r.title}</div>
      <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, margin: "3px 0 8px" }}>{r.mins} mins · serves {r.serves}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{r.tags.map((t) => <Tag key={t} accent={T.sage}>{t}</Tag>)}</div>
    </Inset>)}
  </div>);
}
function ShopBody() {
  return (<>
    <Inset style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{SHOP_META.items} items · {SHOP_META.forDays} days</span><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.gold }}>{SHOP_META.est}</span></Inset>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {SHOPPING.slice(0, 3).map((a) => <div key={a.aisle}><Eyebrow2 color={T.sage}>{a.aisle}</Eyebrow2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{a.items.slice(0, 4).map((it) => <span key={it} style={{ fontFamily: UI, fontSize: 10, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 8, padding: "3px 8px" }}>{it}</span>)}</div></div>)}
    </div>
  </>);
}
function ProgressBody() {
  return (<>
    <Inset><Eyebrow2>This fortnight</Eyebrow2><Spark data={PROGRESS.spark} /><div style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: T.muted, marginTop: 6 }}>{PROGRESS.framing}</div></Inset>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {PROGRESS.patterns.slice(0, 2).map((p, i) => <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, flex: "none", marginTop: 6, background: p.tone === "good" ? T.sage : T.gold }} />
        <div><div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{p.title}</div><div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 2, lineHeight: 1.35 }}>{p.detail}</div></div></div>)}
    </div>
  </>);
}
function InsightsBody() {
  return (<>
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}><Leaf size={14} color={T.sage} style={{ marginTop: 3, flex: "none" }} /><Hand size={14} color={T.inkSoft}>{JESS.todayLine}</Hand></div>
    <Eyebrow2>For your stage · {ME.stageLabel}</Eyebrow2>
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {MICROS.slice(0, 3).map((m) => <Inset key={m.key} style={{ padding: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 700, color: T.ink }}>{m.label}</span><span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{m.foods.slice(0, 3).join(" · ")}</span></div>
        <div style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{m.note}</div></Inset>)}
    </div>
  </>);
}

const CARDS = [
  { id: "log", title: "Log", essence: "A meal in seconds.", icon: NotebookPen, accent: T.crimson, render: LogBody },
  { id: "today", title: "Today", essence: "Your plate so far.", icon: UtensilsCrossed, accent: T.gold, render: TodayBody },
  { id: "plan", title: "My Plan", essence: "What your body's asking for.", icon: HeartPulse, accent: T.gold, render: PlanBody },
  { id: "recipes", title: "Recipes", essence: "Cook what you have in.", icon: BookOpen, accent: T.sage, render: RecipesBody },
  { id: "shop", title: "Shop", essence: "The list, by aisle.", icon: ShoppingBasket, accent: T.sage, render: ShopBody },
  { id: "progress", title: "Progress", essence: "Patterns, not scores.", icon: TrendingUp, accent: T.gold, render: ProgressBody },
  { id: "insights", title: "Insights", essence: "Nourishment for your stage.", icon: Leaf, accent: T.sage, render: InsightsBody },
];

function Header() {
  return (<>
    <div style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>
      {ME.greetingTime.toUpperCase()}, {ME.name.toUpperCase()} · {ME.stageLabel.toUpperCase()} · {ME.cyclePhase.toUpperCase()}
    </div>
    <Script size={38} carve>your plate today</Script>
    <div style={{ display: "flex", alignItems: "center", gap: 15, margin: "12px 0 14px" }}>
      <Ring value={TODAY.energy.had} guide={TODAY.energy.guide} size={104} />
      <div><div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>Well nourished so far</div>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 4 }}>room for {kcalLeft()} more {TODAY.energy.unit} · a gentle guide, never a cap</div></div>
    </div>
    <div style={{ display: "flex", gap: 14, marginBottom: 12 }}><MacroBar label="PROTEIN" v={TODAY.protein} /><MacroBar label="FIBRE" v={TODAY.fibre} /><MacroBar label="IRON" v={TODAY.iron} /></div>
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}><Leaf size={14} color={T.sage} style={{ marginTop: 3, flex: "none" }} /><Hand size={14.5} color={T.muted}>{TODAY.warmline}</Hand></div>
  </>);
}

export default function NutritionHubDemo() {
  return (
    <HubDemo
      banner="Nutrition · Hub-style demo — mock data"
      header={<Header />}
      cards={CARDS}
      footer={<div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>Nourishment is a relationship, not a target.</div>
        <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 6, letterSpacing: 0.3 }}>Not medical advice — Jess is a wellness companion.</div>
      </div>}
    />
  );
}
