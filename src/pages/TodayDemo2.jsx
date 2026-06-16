// TodayDemo2 — "Cycle-led day, FULL" (Today redesign, Direction 2)
// ────────────────────────────────────────────────────────────────────────────
// A phase RING/arc hero anchors the page (Day 22 · luteal · Inner Autumn), then
// a FULL "your luteal day": phase-tuned, populated cards — rest, iron-rich
// nourishment, a boundaries journal prompt, a gentle plan, community, lifestyle,
// the garden. A small stage switcher (cycle / menopause / pregnancy) reskins the
// arc + tunes the copy — but EVERY state stays full. No-guilt: the ring is
// orientation, never a score.
//
// Self-contained PREVIEW: useState + computeCycleDay ONLY. No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import { useState } from "react";
import {
  ChevronRight, Moon, Salad, Leaf, BookOpen, Users, PenLine, Heart as HeartIcon,
  Headphones, Phone, Footprints, Sparkles,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG, PHASE_COLORS,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const ME = { name: "Hannah" };
const DATE_LABEL = "Tuesday 16 June";
function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
const CYCLE_PROFILE = { last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5, life_stage: "reproductive" };

const STATES = {
  cycle: {
    label: "Cycling", color: PHASE_COLORS.luteal,
    ring: { day: 22, of: 28 }, eyebrow: "Day 22 · Luteal", season: "Inner Autumn",
    line: "Boundaries feel natural now. The winding-down half — built for finishing, not starting.",
  },
  menopause: {
    label: "Menopause", color: T.gold,
    ring: null, eyebrow: "Menopause · a new era", season: "Second Spring",
    line: "No cycle to track now — a steadier season. We tune the day to warmth, sleep and strong bones.",
  },
  pregnancy: {
    label: "Pregnant", color: T.sage,
    ring: { day: 22, of: 40 }, eyebrow: "Week 22 · second trimester", season: "The settled middle",
    line: "The kinder middle stretch. Little and often, gentle movement, and rest without apology.",
  },
};

const DAY = {
  cycle: {
    focus: { Icon: Moon, t: "A five-minute settle", b: "Luteal asks for less input. One short breath practice before the day picks up." },
    nourish: { t: "Iron-rich, warm", b: "Lentils, leafy greens, a few seeds — your stores dip in this half.", note: "iron leaning light · 2 meals · ~840 kcal" },
    prompt: "Where could a boundary make today lighter?",
  },
  menopause: {
    focus: { Icon: Moon, t: "Cool the evening", b: "A wind-down routine softens night flushes — dim light, a slower hour before bed." },
    nourish: { t: "Calcium + protein", b: "Yoghurt, oily fish, tofu — protective as oestrogen settles.", note: "bones first · 2 meals · ~900 kcal" },
    prompt: "What does this new season make more room for?",
  },
  pregnancy: {
    focus: { Icon: Moon, t: "Feet up, ten minutes", b: "Second-trimester energy is real but finite. A short lie-down banks it for later." },
    nourish: { t: "Little and often", b: "Iron and folate — dahl, spinach, citrus. Whatever stays down is enough.", note: "rising blood volume · 3 small meals" },
    prompt: "What would help you feel held this week?",
  },
};

function Card({ children, style }) {
  return <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 17, padding: "16px 17px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)", ...style }}>{children}</section>;
}
function CardHead({ Icon, eyebrow, accent = T.muted }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
        <Icon size={15} strokeWidth={1.7} color={accent} />
      </span>
      <Eyebrow color={accent}>{eyebrow}</Eyebrow>
    </div>
  );
}
function Doorway({ children, to }) {
  return <a href={`/${to}`} style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, textDecoration: "none" }}>{children} <ChevronRight size={13} /></a>;
}

function PhaseRing({ state }) {
  const size = 196, sw = 11, r = (size - sw) / 2, cx = size / 2;
  const C = 2 * Math.PI * r;
  const frac = state.ring ? state.ring.day / state.ring.of : 0.62;
  const dots = state.ring && state.ring.of <= 28 ? state.ring.of : 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={T.paperDeep} strokeWidth={sw} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={state.color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C}`} transform={`rotate(-90 ${cx} ${cx})`} />
        {[...Array(dots)].map((_, i) => {
          const a = (i / dots) * 2 * Math.PI - Math.PI / 2;
          return <circle key={i} cx={cx + Math.cos(a) * (r + sw / 2 + 5)} cy={cx + Math.sin(a) * (r + sw / 2 + 5)} r={i + 1 === state.ring.day ? 2.6 : 1.1} fill={i + 1 <= state.ring.day ? state.color : T.paperDeep} />;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <Script size={38}>{state.season}</Script>
          <div style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 0.8, color: T.muted, marginTop: -2 }}>{state.eyebrow}</div>
        </div>
      </div>
    </div>
  );
}

export default function TodayDemo2() {
  useEditorialFonts();
  const [stateKey, setStateKey] = useState("cycle");
  const st = STATES[stateKey];
  const day = DAY[stateKey];
  const cd = computeCycleDay(CYCLE_PROFILE); void cd;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={2} name="Cycle-led day, full" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "58px 20px 120px", display: "flex", flexDirection: "column", gap: 16 }}>

        <header style={{ textAlign: "center" }}>
          <Eyebrow color={T.muted}>{DATE_LABEL}</Eyebrow>
          <Script size={40} style={{ marginTop: 4 }}>{`Good afternoon, ${ME.name}.`}</Script>
        </header>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PhaseRing state={st} />
          <Hand size={17} color={T.inkSoft} style={{ marginTop: 12, textAlign: "center", maxWidth: 320 }}>{st.line}</Hand>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {Object.entries(STATES).map(([k, s]) => (
            <button key={k} onClick={() => setStateKey(k)} style={{
              background: k === stateKey ? T.ink : "transparent", color: k === stateKey ? T.paper : T.muted,
              border: `1px solid ${k === stateKey ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 13px",
              fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
            }}>{s.label}</button>
          ))}
        </div>

        <Rule c={T.paperDeep} />
        <Eyebrow color={st.color}>Your {st.season.toLowerCase()} day</Eyebrow>

        <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "19px 19px 17px", boxShadow: "0 13px 30px rgba(58,48,32,0.10)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 999, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
              <day.focus.Icon size={20} strokeWidth={1.6} color={T.crimson} />
            </span>
            <Eyebrow color={T.crimson}>What this season asks for</Eyebrow>
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 27, lineHeight: 1.12, margin: "13px 0 0" }}>{day.focus.t}</h1>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.inkSoft, margin: "9px 0 0" }}>{day.focus.b}</p>
          <a href="/Lifestyle" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, background: T.ink, color: T.paper, textDecoration: "none", borderRadius: 999, padding: "10px 19px", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>Begin · 5 min <ChevronRight size={15} /></a>
        </article>

        <Card>
          <CardHead Icon={Salad} eyebrow="Nourishment for now" accent={T.sage} />
          <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{day.nourish.t}</span>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: "6px 0 0", lineHeight: 1.45 }}>{day.nourish.b}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px" }}>
            <Leaf size={14} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{day.nourish.note}</span>
          </div>
          <Doorway to="Nutrition">Open nutrition</Doorway>
        </Card>

        <Card>
          <CardHead Icon={PenLine} eyebrow="Journal · 3 entries this cycle" accent={T.gold} />
          <Hand size={18} color={T.ink}>{day.prompt}</Hand>
          <div style={{ marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
            <Eyebrow mb={3}>Two days ago</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4 }}>&ldquo;I keep circling the same worry…&rdquo;</p>
          </div>
          <Doorway to="Journal">Write a line</Doorway>
        </Card>

        <Card>
          <CardHead Icon={Sparkles} eyebrow="Your day, gently" accent={T.gold} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 11, overflow: "hidden", border: `1px solid ${T.paperDeep}` }}>
            {[
              { Icon: Footprints, label: "A 10-minute walk", note: "easy pace" },
              { Icon: Phone, label: "GP call", note: "3:00 pm" },
              { Icon: Moon, label: "Wind-down by ten", note: "screens off" },
            ].map((it) => (
              <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: T.paper }}>
                <it.Icon size={16} color={T.muted} strokeWidth={1.7} />
                <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.ink }}>{it.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{it.note}</span>
              </div>
            ))}
          </div>
          <Hand size={15} color={T.inkSoft} style={{ marginTop: 10 }}>Lighter energy today — keep it kind.</Hand>
        </Card>

        <Card>
          <CardHead Icon={Users} eyebrow="From the circle" accent={T.crimson} />
          <Hand size={16.5} color={T.ink}>What small thing lifted you today?</Hand>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "7px 0 0" }}>A few sisters have answered.</p>
          <div style={{ marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px", display: "flex", alignItems: "center", gap: 9 }}>
            <HeartIcon size={14} color={T.crimson} />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>&ldquo;It&apos;s held.&rdquo;</span>
            <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10, color: T.muted }}>anonymous</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <BookOpen size={13} color={T.muted} />
            <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft }}>Books circle — reading <em>Little Women</em> together.</span>
          </div>
          <Doorway to="Community">Join in</Doorway>
        </Card>

        <Card>
          <CardHead Icon={BookOpen} eyebrow="Today's read & listen" accent={T.muted} />
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, margin: 0, lineHeight: 1.2 }}>The quiet power of luteal rest</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
            <Headphones size={15} color={T.crimson} />
            <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15, color: T.ink }}>Audio · Winding down</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>8 min</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 13 }}>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>Sleep, gently · day 4 of 7</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>tonight: body-scan</span>
          </div>
          <Doorway to="Lifestyle">More to read</Doorway>
        </Card>

        <Card>
          <CardHead Icon={Leaf} eyebrow="Your garden · Meadowlight" accent={T.sage} />
          <Hand size={16} color={T.inkSoft}>Blooming — tended 5 days this week. Today, the line you left fed her.</Hand>
          <Doorway to="Garden">Visit the garden</Doorway>
        </Card>

        <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}><Leaf size={13} color={T.dusk} /></span>
            <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
          </div>
          <Hand size={17} color={T.paper}>Your body isn&apos;t asking you to push today, Hannah — it&apos;s asking you to land. Let&apos;s land.</Hand>
        </div>

        <footer style={{ textAlign: "center", paddingTop: 6 }}>
          <Rule w={40} c={T.paperDeep} mb={11} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>The ring is a map, not a measure.</div>
        </footer>
      </div>
    </div>
  );
}

function DemoRibbon({ n, name }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000, background: T.ink, color: T.paper, textAlign: "center", fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, padding: "5px 10px", textTransform: "uppercase" }}>
      DEMO · Today direction {n} — {name}
    </div>
  );
}
