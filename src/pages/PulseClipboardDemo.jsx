// PulseClipboardDemo — STANDALONE v4 redesign preview of the LIVE Pulse page (your health intelligence /
// trends). Demo-first; the live Pulse is NOT touched. Self-contained + seeded (no entity queries).
//
// v4 Brand Bible: flora-hero + ONE summary signature + §6.10 ClipboardSliders of uniform Card.jsx cards +
// in-card CardDeck for peer sequences + §6.7.6 quick-action popups + soulful voice + PAPER_BG + canonical
// pinned Jump-to. Ease-first: read your week at a glance, then slide sideways through the deeper trends —
// nothing buried; ~2 phone screens.
//
// FULL PARITY (live Pulse → this demo; see checklist at foot): period countdown · predictive analysis ·
// pattern-insight cards · condition pulse · wearable week · weekly AI summary + this-week-at-a-glance stats
// + smart "try this" suggestions · time-range (3/6 mo) · health overview · AI health summary · reflect/belong
// (ContentActionBar) · data-source toggle (check-ins/symptoms) · metric chips · metric-by-phase bar chart ·
// pattern insight · time-series line · habit completion rates · sleep-vs-mood-vs-energy correlation ·
// skin & hair tracker. No new function; seeded.
import { useState } from "react";
import { Activity, Heart, Moon, Sparkles, TrendingUp, Brain, CalendarDays,
  Wind, Footprints, Watch, ChevronRight, Mic, ScanLine, Gauge, X, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Hand } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import { RichBloomV2, FlowerGlyph, floraKeyframes, cwOf } from "@/components/brand/flora";
import JumpToButton from "@/components/layout/JumpToButton";

const GOLD = cwOf("gold"), SAGE = cwOf("sage"), PLUM = cwOf("plum"), CRIM = cwOf("crimson"), SKY = cwOf("sky");
const PHASES = [
  { key: "menstrual", label: "Menstrual", col: T.crimson, avg: 6 },
  { key: "follicular", label: "Follicular", col: SAGE.petal, avg: 3 },
  { key: "ovulatory", label: "Ovulatory", col: GOLD.petal, avg: 2 },
  { key: "luteal", label: "Luteal", col: PLUM.petal, avg: 8 },
];
const SERIES = [4, 5, 3, 6, 7, 5, 8, 6, 4, 3, 5, 7, 9, 6]; // seeded "cramps over time"
const HABITS = [{ name: "Morning movement", pct: 86 }, { name: "Hydration", pct: 72 }, { name: "Magnesium", pct: 64 }, { name: "Wind-down", pct: 58 }];
const SLEEPMOOD = { sleep: [6, 7, 5, 8, 7, 6, 8], mood: [5, 6, 5, 7, 7, 6, 8], energy: [4, 6, 5, 7, 6, 5, 7] };
const WEARABLE = [{ label: "Sleep", v: "7h 20m", sub: "good", Icon: Moon, cw: "plum" }, { label: "Resting HR", v: "62 bpm", sub: "steady", Icon: Heart, cw: "crimson" }, { label: "HRV", v: "48 ms", sub: "recovering", Icon: Activity, cw: "sage" }, { label: "Steps", v: "8,240", sub: "avg/day", Icon: Footprints, cw: "gold" }];
const METRICS = ["Cramps", "Mood", "Energy", "Sleep", "Headache", "Bloating"];
const SECTIONS = [
  { id: "week", label: "This week", sub: "your week, read back", Icon: Sparkles, cw: "gold" },
  { id: "predict", label: "Predictions", sub: "what's ahead", Icon: CalendarDays, cw: "plum" },
  { id: "patterns", label: "Patterns", sub: "what your body repeats", Icon: Brain, cw: "sage" },
  { id: "phases", label: "By phase", sub: "metric × cycle phase", Icon: Gauge, cw: "crimson" },
  { id: "trends", label: "Trends", sub: "over 3–6 months", Icon: TrendingUp, cw: "gold" },
  { id: "signals", label: "Body signals", sub: "wearable · skin & hair", Icon: Watch, cw: "plum" },
];

function Tile({ icon: Icon, label, sub, cw = "sage", onTap }) {
  const c = cwOf(cw);
  return (
    <button onClick={onTap} aria-label={label} style={{ textAlign: "left", cursor: "pointer", minHeight: 96, display: "flex", flexDirection: "column", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 14, padding: "12px 11px", boxShadow: "0 3px 12px rgba(11,8,5,0.06)" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", marginBottom: 7 }}><Icon size={15} strokeWidth={1.7} color={c.petal} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{sub}</span>
    </button>
  );
}
const Grid = ({ children, cols = 2 }) => <div style={{ display: "grid", gridTemplateColumns: cols === 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 9 }}>{children}</div>;

function Panel({ eyebrow, Icon, title, line, cw = "gold", children }) {
  const c = cwOf(cw);
  return (
    <div style={{ minHeight: 188, display: "flex", flexDirection: "column", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}16 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 16, padding: "16px 16px 14px", boxShadow: "0 3px 12px rgba(11,8,5,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Icon size={16} color={c.petal} /></span>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", color: c.petal }}>{eyebrow}</span>
        <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="cosmos" size={24} color={c.petal} color2={c.tip} idx={`p-${eyebrow}`} /></span>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.25, marginBottom: 6 }}>{title}</div>
      {line && <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, lineHeight: 1.5, margin: 0 }}>{line}</p>}
      {children}
    </div>
  );
}
// seeded mini bar chart (metric by phase)
function PhaseBars() {
  const max = Math.max(...PHASES.map((p) => p.avg));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110, marginTop: 10, padding: "0 4px" }}>
        {PHASES.map((p) => (
          <div key={p.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{p.avg}</span>
            <div style={{ width: "100%", height: `${Math.round((p.avg / max) * 84)}px`, background: p.col, borderRadius: "6px 6px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        {PHASES.map((p) => <span key={p.key} style={{ flex: 1, textAlign: "center", fontFamily: UI, fontSize: 9.5, color: T.muted }}>{p.label.slice(0, 4)}</span>)}
      </div>
    </div>
  );
}
function Spark({ data, color = GOLD.petal, h = 56 }) {
  const max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h - ((v - min) / rng) * (h - 8) - 4}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{ marginTop: 10 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function PulseClipboardDemo() {
  const navigate = useNavigate();
  const link = (p) => navigate(createPageUrl(p));
  const [sheet, setSheet] = useState(null);   // "jump" | "reflect"
  const [popup, setPopup] = useState(null);
  const [range, setRange] = useState(3);
  const [metric, setMetric] = useState("Cramps");
  const [source, setSource] = useState("checkins");
  const pop = (title, line, cw, Icon) => setPopup({ title, line, cw, Icon });

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 112, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <JumpToButton pinned onClick={() => setSheet("jump")} />

      <FwFloraHero title="Pulse" bloom="cosmos" colorway="plum" flankL="clover" flankR="chamomile" creature="butterfly"
        line="Your week, read back gently — patterns, not scores. Slide sideways for the deeper trends." ringSize={184} bloomSize={116} />

      <Wrap>
        <div style={{ marginTop: 6 }}>
          <SummaryCard eyebrow="Your week, gently" accent={PLUM.petal} rows={[
            { Icon: Heart, label: "Mood", text: "Brighter than last week — steadier in the evenings", onClick: () => pop("Mood this week", "A gentle lift — your evenings settled. Worth noticing, not scoring.", "plum", Heart) },
            { Icon: Moon, label: "Rest", text: "Sleep 7h 20m avg — recovering well", onClick: () => pop("Rest this week", "Your body is recovering. Magnesium + an earlier night land well in your luteal week.", "plum", Moon) },
            { Icon: CalendarDays, label: "Ahead", text: "Period in ~5 days — energy may dip", onClick: () => pop("The week ahead", "Period in ~5 days. Expect a gentle energy dip — plan lighter, rest is the work.", "crimson", CalendarDays) },
          ]} />
        </div>

        {/* PRIMARY ACTIONS — Pulse is read-only; the obvious action is to reflect on a pattern (→ journal). */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => setSheet("reflect")} aria-label="Reflect on a pattern (voice)" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: PLUM.petal, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", boxShadow: `0 6px 18px ${PLUM.petal}55` }}>
            <span aria-hidden style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "rgba(255,255,255,0.22)" }}><Mic size={16} /></span> Reflect
          </button>
          <button onClick={() => link("Today")} aria-label="Log today" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: GOLD.petal, color: "#fff", border: "none", borderRadius: 16, padding: "15px 12px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", boxShadow: "0 6px 18px rgba(168,137,63,0.32)" }}>
            <Check size={18} /> Log today
          </button>
        </div>

        {/* time range */}
        <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginRight: 2 }}>Over</span>
          {[3, 6].map((m) => (
            <button key={m} onClick={() => setRange(m)} style={{ cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "7px 16px", borderRadius: 999, border: `1px solid ${range === m ? T.ink : T.paperDeep}`, background: range === m ? T.ink : "transparent", color: range === m ? T.paper : T.muted }}>{m} months</button>
          ))}
        </div>

        <Hand size={14} color={T.muted} style={{ display: "block", margin: "12px 0 0", textAlign: "center" }}>
          Your whole pulse on a few boards — slide each sideways; tap any card to read it.
        </Hand>
      </Wrap>

      <div style={{ position: "relative", zIndex: 1, padding: "8px 16px 0", maxWidth: 600, margin: "0 auto" }}>
        <ClipboardSlider hint="Slide — this week" accent={PLUM.petal}>
          <Clipboard title="This week" sub="YOUR WEEK, READ BACK GENTLY" accent={GOLD.petal} flower="marigold" idx="cb-week">
            <CardDeck accent={GOLD.petal}>
              <Panel eyebrow="From Jess" Icon={Sparkles} cw="gold" title="A steady, kinder week" line="You logged on 5 of 7 days. Mood lifted midweek and sleep held — variety in your meals came through. No scores, just the shape of it." />
              <Panel eyebrow="This week, try" Icon={Heart} cw="plum" title="One small kindness" line="An earlier night before your period and iron-rich food this week. A short walk on the brighter days.">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                  {["Find a book", "Browse lifestyle", "Log today"].map((c) => <button key={c} onClick={() => link("Lifestyle")} style={chip}>{c}</button>)}
                </div>
              </Panel>
            </CardDeck>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>This week at a glance</div>
              <Grid cols={3}>
                {[["Journal", "4", "entries", "plum"], ["Habits", "18", "kept", "sage"], ["Meals", "12", "logged", "gold"], ["Check-ins", "5", "days", "crimson"], ["Skin", "Calm", "most-logged", "blush"], ["Hair", "Low", "shedding", "sage"]].map(([l, v, s, cw]) => {
                  const c = cwOf(cw);
                  return <div key={l} style={{ ...statCell, borderLeft: `3px solid ${c.petal}` }}><span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.ink }}>{v}</span><span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: c.petal }}>{l}</span><span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{s}</span></div>;
                })}
              </Grid>
            </div>
          </Clipboard>

          <Clipboard title="Predictions" sub="WHAT'S AHEAD, GENTLY" accent={PLUM.petal} flower="iris" idx="cb-pred">
            <CardDeck accent={PLUM.petal}>
              <Panel eyebrow="Period countdown" Icon={CalendarDays} cw="crimson" title="Period in ~5 days" line="Day 23 of 28 · luteal. A gentle dip is normal here — plan lighter, rest is part of the work.">
                <div style={{ display: "flex", gap: 4, marginTop: 12 }}>{Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 99, background: i < 2 ? T.crimson : T.paperDeep }} />)}</div>
              </Panel>
              <Panel eyebrow="Predictive · Jess" Icon={Brain} cw="plum" title="Energy may ease this week" line="Based on your last cycles, the days before your period tend to run quieter. Front-load anything demanding to earlier in the week." />
              <Panel eyebrow="Heads up" Icon={Wind} cw="sage" title="Cramps tend to peak day 1–2" line="Warmth, magnesium and a slower morning have helped you most in past cycles." />
            </CardDeck>
          </Clipboard>

          <Clipboard title="Patterns" sub="WHAT YOUR BODY REPEATS" accent={SAGE.petal} flower="clover" idx="cb-pat">
            <CardDeck accent={SAGE.petal}>
              <Panel eyebrow="Pattern insight" Icon={TrendingUp} cw="plum" title="Mood peaks in your follicular week" line="And tends to be lowest in late luteal — your data, across the last 3 months. Worth planning around, gently." />
              <Panel eyebrow="Pattern insight" Icon={Moon} cw="crimson" title="Lower sleep tracks with harder days" line="On nights under 6h, your next-day mood ran lower. Protecting sleep before your period may help most." />
              <Panel eyebrow="Condition · PMDD" Icon={Heart} cw="plum" title="Late-luteal mood dips" line="Your logs show a recurring late-luteal low. A gentle plan + your GP-ready diary can help you talk it through." />
            </CardDeck>
          </Clipboard>
        </ClipboardSlider>

        <div style={{ height: 18 }} />

        <ClipboardSlider hint="Slide — over time" accent={GOLD.petal}>
          <Clipboard title="By phase" sub="A METRIC ACROSS YOUR CYCLE" accent={T.crimson} flower="anemone" idx="cb-phase">
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {["checkins", "symptoms"].map((s) => <button key={s} onClick={() => setSource(s)} style={{ flex: 1, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 10, border: `1px solid ${source === s ? T.ink : T.paperDeep}`, background: source === s ? T.ink : "transparent", color: source === s ? T.paper : T.muted }}>{s === "checkins" ? "Daily check-ins" : "Symptom logs"}</button>)}
            </div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 4 }}>
              {METRICS.map((m) => <button key={m} onClick={() => setMetric(m)} style={{ flexShrink: 0, cursor: "pointer", fontFamily: UI, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: "none", background: metric === m ? PLUM.petal : T.paperDeep, color: metric === m ? "#fff" : T.muted }}>{m}</button>)}
            </div>
            <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 12px 10px" }}>
              <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink }}>{metric} by cycle phase</div>
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Average — last {range} months</div>
              <PhaseBars />
            </div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center", margin: "12px 4px 0", lineHeight: 1.5 }}>Your {metric.toLowerCase()} tends to peak in the luteal phase and settle in the follicular.</p>
          </Clipboard>

          <Clipboard title="Trends" sub="OVER 3–6 MONTHS — SWIPE INSIDE" accent={GOLD.petal} flower="sunflower" idx="cb-trend">
            <CardDeck accent={GOLD.petal}>
              <Panel eyebrow="Over time" Icon={TrendingUp} cw="gold" title={`${metric} over time`} line={`Daily readings — last ${range} months. A gentle rhythm, rising before each period.`}>
                <Spark data={SERIES} color={GOLD.petal} />
              </Panel>
              <Panel eyebrow="Habits" Icon={Check} cw="sage" title="Habit completion" line="Your steadiest tending this season.">
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {HABITS.map((h) => (
                    <div key={h.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, marginBottom: 3 }}><span style={{ color: T.ink, fontWeight: 600 }}>{h.name}</span><span style={{ color: SAGE.petal, fontWeight: 700 }}>{h.pct}%</span></div>
                      <div style={{ height: 6, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${h.pct}%`, height: "100%", background: SAGE.petal }} /></div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel eyebrow="Correlation" Icon={Moon} cw="plum" title="Sleep, mood & energy" line="When sleep held, mood and energy followed — last 7 readings.">
                <div style={{ marginTop: 10 }}>
                  <Spark data={SLEEPMOOD.sleep} color={PLUM.petal} h={40} />
                  <Spark data={SLEEPMOOD.mood} color={T.ink} h={40} />
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 6 }}>
                    {[["Sleep", PLUM.petal], ["Mood", T.ink], ["Energy", GOLD.petal]].map(([l, c]) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10, color: T.muted }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c }} />{l}</span>)}
                  </div>
                </div>
              </Panel>
            </CardDeck>
          </Clipboard>

          <Clipboard title="Body signals" sub="WEARABLE · SKIN & HAIR" accent={PLUM.petal} flower="violet" idx="cb-sig">
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>This week from your wearable</div>
            <Grid>
              {WEARABLE.map((w) => { const c = cwOf(w.cw); return (
                <div key={w.label} style={{ ...statCell, alignItems: "flex-start", textAlign: "left", borderLeft: `3px solid ${c.petal}` }}>
                  <w.Icon size={15} color={c.petal} />
                  <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink, marginTop: 3 }}>{w.v}</span>
                  <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: c.petal }}>{w.label}</span>
                  <span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{w.sub}</span>
                </div>
              ); })}
            </Grid>
            <button onClick={() => link("SkinHair")} style={{ ...trackerRow, marginTop: 11 }}>
              <ScanLine size={16} color={GOLD.petal} />
              <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Skin & hair trends</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>phase-by-phase breakouts & shedding</span></span>
              <ChevronRight size={16} color={T.muted} />
            </button>
          </Clipboard>
        </ClipboardSlider>
      </div>

      {popup && <QuickPopup item={popup} onClose={() => setPopup(null)} />}
      {sheet === "reflect" && <ReflectSheet onClose={() => setSheet(null)} />}
      {sheet === "jump" && <JumpSheet onClose={() => setSheet(null)} onPick={() => setSheet(null)} />}
    </div>
  );
}

function Wrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }
function QuickPopup({ item, onClose }) {
  const c = cwOf(item.cw || "plum"); const Icon = item.Icon || Sparkles;
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ ...disc, width: 34, height: 34 }}><Icon size={16} color={c.petal} /></span>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, flex: 1 }}>{item.title}</div>
          <button onClick={onClose} aria-label="Close" style={iconX}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "4px 0 12px" }}>{item.line}</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 6px" }}><RichBloomV2 form="cosmos" color={c.petal} color2={c.tip} accent={c.accent} size={96} idx="pulse-qp" /></div>
      </div>
    </div>
  );
}
function ReflectSheet({ onClose }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{ ...sheetStyle, textAlign: "center" }}>
        <style>{`@keyframes fwPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:.7}}`}</style>
        <div style={grab} />
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: PLUM.petal }}>Reflect on a pattern</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink, margin: "4px 0 2px" }}>Listening…</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>“A pattern I noticed in myself lately — ”</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 18px" }}><div style={{ width: 92, height: 92, borderRadius: 999, background: `${PLUM.petal}22`, display: "grid", placeItems: "center", animation: "fwPulse 1.6s ease-in-out infinite" }}><Mic size={34} color={PLUM.petal} /></div></div>
        <button onClick={onClose} style={{ ...cta, background: PLUM.petal }}><Check size={16} /> Save to journal</button>
      </div>
    </div>
  );
}
function JumpSheet({ onClose, onPick }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Jump to</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>every part of your pulse, by name</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {SECTIONS.map((s) => { const c = cwOf(s.cw); return (
            <button key={s.id} onClick={onPick} style={{ display: "flex", alignItems: "flex-start", gap: 9, textAlign: "left", padding: "12px 11px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, background: T.paper, cursor: "pointer" }}>
              <s.Icon size={17} color={c.petal} />
              <span><span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{s.label}</span><span style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.3 }}>{s.sub}</span></span>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

const chip = { background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink };
const statCell = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 64, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 6px", gap: 1 };
const trackerRow = { display: "flex", alignItems: "center", gap: 10, width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 12px", cursor: "pointer" };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `3px solid ${T.gold}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "82dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted };
const disc = { borderRadius: 8, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0, background: T.paper };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };

/* ── PARITY CHECKLIST (live Pulse → this demo) ──
 SIGNATURE: ✅ flora hero · ✅ one summary (mood/rest/ahead) · ★✅ primary Reflect (voice→journal) + Log today ·
   ✅ time-range 3/6mo · ✅ canonical pinned Jump-to.
 THIS-WEEK slider: ✅ weekly AI summary + ✅ "this week, try" + chips · ✅ this-week-at-a-glance stats
   (journal/habits/meals/check-ins/skin/hair) · ✅ period countdown · ✅ predictive analysis · ✅ pattern-insight
   cards · ✅ condition pulse (PMDD).
 OVER-TIME slider: ✅ data-source toggle (check-ins/symptoms) · ✅ metric chips · ✅ metric-by-phase bar chart ·
   ✅ pattern insight · ✅ time-series line · ✅ habit completion rates · ✅ sleep-vs-mood-vs-energy correlation ·
   ✅ wearable week · ✅ skin & hair tracker. §6.7.6 quick popups · reflect/belong voice · clipboard + CardDeck
   spine · ~2 screens · v4 bible · demo-first (seeded). */
