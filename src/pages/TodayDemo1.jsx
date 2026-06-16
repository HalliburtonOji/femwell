// TodayDemo1 — "Calm single-focus hub, FULL" (Today redesign, Direction 1)
// ────────────────────────────────────────────────────────────────────────────
// ONE big hero focus card at the top, THEN a rich, populated supporting stack:
// garden · journal · nutrition · community · planner · lifestyle · program.
// Calm spacing, generous air — but a genuinely FULL page of real (mock) content,
// never a single item per screen. No scores, streaks, counts-as-competition.
// No-guilt voice throughout.
//
// Self-contained PREVIEW: useState + computeCycleDay ONLY. No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import {
  ChevronRight, Wind, BookOpen, Leaf, Heart as HeartIcon, Users, PenLine,
  Moon, Sparkles, Headphones, Phone, Pill, Footprints, Droplet, Salad,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG, PHASE_COLORS,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const ME = { name: "Hannah" };
const MOCK_PROFILE = {
  last_period_start_date: isoDaysAgo(21),
  cycle_avg_length: 28,
  period_length: 5,
  life_stage: "reproductive",
};
function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
const DATE_LABEL = "Tuesday 16 June";

// ── a living brand-colour bloom (companion: "Meadowlight") ───────────────────
function Bloom({ size = 92 }) {
  const cx = 50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Meadowlight, your companion bloom, blooming" style={{ flex: "none" }}>
      <ellipse cx={cx} cy={94} rx={20} ry={4} fill={T.paperDeep} opacity={0.5} />
      <path d="M50 92 C 48 70 52 52 50 40" stroke={T.sage} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M50 70 C 38 66 31 69 28 77 C 39 79 47 75 50 68 Z" fill={T.sage} opacity={0.9} />
      <path d="M50 60 C 62 56 69 59 72 67 C 61 69 52 65 50 58 Z" fill={T.sage} opacity={0.78} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={cx} cy={24} rx={7} ry={14} fill={T.blush} opacity={0.94}
          transform={`rotate(${a} ${cx} 38)`} />
      ))}
      {[30, 90, 150, 210, 270, 330].map((a) => (
        <ellipse key={a} cx={cx} cy={29} rx={5} ry={10} fill={T.blush} opacity={0.62}
          transform={`rotate(${a} ${cx} 38)`} />
      ))}
      <circle cx={cx} cy={38} r={7.5} fill={T.gold} />
      <circle cx={cx} cy={38} r={3.5} fill={T.crimson} opacity={0.5} />
    </svg>
  );
}

// a soft card shell — cream paper, hairline, soft shadow (SurfaceCard-style)
function Card({ children, style }) {
  return (
    <section style={{
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 17,
      padding: "17px 17px 16px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)", ...style,
    }}>{children}</section>
  );
}
function CardHead({ Icon, eyebrow, accent = T.muted }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
        <Icon size={15} strokeWidth={1.7} color={accent} />
      </span>
      <Eyebrow color={accent}>{eyebrow}</Eyebrow>
    </div>
  );
}
function Doorway({ children, to }) {
  return (
    <a href={`/${to}`} style={{
      marginTop: 12, display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
      color: T.muted, textDecoration: "none",
    }}>{children} <ChevronRight size={13} /></a>
  );
}
function Bar({ value, guide, color = T.sage }) {
  const pct = Math.max(4, Math.min(100, Math.round((value / guide) * 100)));
  return (
    <div style={{ height: 6, borderRadius: 999, background: T.paperDeep, overflow: "hidden", marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}

export default function TodayDemo1() {
  useEditorialFonts();
  const cd = computeCycleDay(MOCK_PROFILE);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={1} name="Calm single-focus, full" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "58px 20px 120px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* greeting + cycle context */}
        <header>
          <Eyebrow color={T.muted}>{DATE_LABEL}</Eyebrow>
          <Script size={42} style={{ marginTop: 5 }}>{greeting()}, {ME.name}.</Script>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: T.paper, background: PHASE_COLORS.luteal, borderRadius: 999, padding: "3px 10px" }}>
              Day {cd.cycleDay} · Luteal
            </span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>Inner Autumn</span>
          </div>
          <Hand size={17} color={T.inkSoft} style={{ marginTop: 7 }}>
            Boundaries feel natural now — the wind-down half of your cycle. A good week to do less, on purpose.
          </Hand>
        </header>

        {/* THE hero focus card */}
        <article style={{
          background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 19,
          padding: "20px 20px 18px", boxShadow: "0 14px 32px rgba(58,48,32,0.11)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: 999, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
              <Wind size={21} strokeWidth={1.6} color={T.crimson} />
            </span>
            <Eyebrow color={T.crimson}>Your one thing today</Eyebrow>
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 29, lineHeight: 1.12, margin: "15px 0 0" }}>
            A five-minute settle
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.inkSoft, margin: "10px 0 0" }}>
            In luteal your nervous system asks for less input. Before the day picks up, one short breath
            practice to take the edge off. Nothing to finish — just somewhere soft to start.
          </p>
          <a href="/Lifestyle" style={{
            marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
            background: T.ink, color: T.paper, textDecoration: "none",
            borderRadius: 999, padding: "11px 20px", fontFamily: UI, fontSize: 13.5, fontWeight: 700,
          }}>Begin · 5 min <ChevronRight size={16} /></a>
        </article>

        {/* GARDEN — the companion */}
        <Card>
          <CardHead Icon={Leaf} eyebrow="Your garden · Meadowlight" accent={T.sage} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Bloom size={88} />
            <div>
              <Script size={26}>Blooming</Script>
              <Hand size={15.5} color={T.inkSoft} style={{ marginTop: 4 }}>
                Tended 5 days this week. Today, the line you left fed her — that&apos;s all it ever takes.
              </Hand>
              <Doorway to="Garden">Visit the garden</Doorway>
            </div>
          </div>
        </Card>

        {/* JOURNAL */}
        <Card>
          <CardHead Icon={PenLine} eyebrow="Journal · 3 entries this cycle" accent={T.gold} />
          <Hand size={18} color={T.ink}>What would feel like enough today?</Hand>
          <div style={{ marginTop: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px" }}>
            <Eyebrow mb={3}>Two days ago</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, margin: 0, lineHeight: 1.4 }}>
              &ldquo;I keep circling the same worry, and I&apos;m tired of being the one who holds it…&rdquo;
            </p>
          </div>
          <Doorway to="Journal">Write a line</Doorway>
        </Card>

        {/* NUTRITION glance */}
        <Card>
          <CardHead Icon={Salad} eyebrow="Today's plate" accent={T.sage} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>2 meals · ~840 kcal</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>protein 38g</span>
          </div>
          <Bar value={38} guide={60} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 13 }}>
            <Leaf size={14} color={T.gold} />
            <Hand size={15} color={T.inkSoft}>Iron&apos;s leaning light today — a few pumpkin seeds would help.</Hand>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
            <Droplet size={14} color={T.sage} />
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Water · 3 of 6 glasses</span>
          </div>
          <Doorway to="Nutrition">Open nutrition</Doorway>
        </Card>

        {/* COMMUNITY pulse */}
        <Card>
          <CardHead Icon={Users} eyebrow="From the circle" accent={T.crimson} />
          <Hand size={17} color={T.ink}>What small thing lifted you today?</Hand>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 0 0" }}>A few sisters have answered.</p>
          <div style={{ marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px", display: "flex", alignItems: "center", gap: 9 }}>
            <HeartIcon size={14} color={T.crimson} />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft }}>&ldquo;It&apos;s held.&rdquo;</span>
            <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10, color: T.muted }}>anonymous</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
            <BookOpen size={13} color={T.muted} />
            <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft }}>Books circle — reading <em>Little Women</em> together.</span>
          </div>
          <Doorway to="Community">Join in</Doorway>
        </Card>

        {/* PLANNER / day */}
        <Card>
          <CardHead Icon={Sparkles} eyebrow="Your day, gently" accent={T.gold} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 11, overflow: "hidden", border: `1px solid ${T.paperDeep}` }}>
            {[
              { Icon: Footprints, label: "A 10-minute walk", note: "whenever the light's good" },
              { Icon: Phone, label: "GP call", note: "3:00 pm" },
              { Icon: Pill, label: "Supplements", note: "iron + vitamin D" },
            ].map((it) => (
              <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: T.paper }}>
                <it.Icon size={16} color={T.muted} strokeWidth={1.7} />
                <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.ink }}>{it.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{it.note}</span>
              </div>
            ))}
          </div>
          <Hand size={15} color={T.inkSoft} style={{ marginTop: 11 }}>Lighter energy today — keep it kind. None of this is a must.</Hand>
        </Card>

        {/* LIFESTYLE daily read + listen */}
        <Card>
          <CardHead Icon={BookOpen} eyebrow="Today's read" accent={T.muted} />
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 20, margin: 0, lineHeight: 1.2 }}>The quiet power of luteal rest</h3>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: "7px 0 0", lineHeight: 1.45 }}>
            Why the second half of your cycle is built for finishing, not starting — and how to lean into it.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 13, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
            <Headphones size={15} color={T.crimson} />
            <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15.5, color: T.ink }}>Audio · Winding down</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>8 min</span>
          </div>
          <Doorway to="Lifestyle">More to read</Doorway>
        </Card>

        {/* PROGRAM */}
        <Card>
          <CardHead Icon={Moon} eyebrow="Your programme" accent={T.sage} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink }}>Sleep, gently</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>day 4 of 7</span>
          </div>
          <Bar value={4} guide={7} color={T.gold} />
          <Hand size={15.5} color={T.inkSoft} style={{ marginTop: 11 }}>Tonight: a body-scan to let the day settle out of your shoulders.</Hand>
          <Doorway to="Lifestyle">Open tonight&apos;s session</Doorway>
        </Card>

        {/* Jess closing voice */}
        <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
              <Leaf size={13} color={T.dusk} />
            </span>
            <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
          </div>
          <Hand size={17.5} color={T.paper}>
            You don&apos;t have to earn the rest, Hannah. The walk, the worry, the seeds — pick one, or none.
            I&apos;ll still be here, and so will she.
          </Hand>
        </div>

        <footer style={{ textAlign: "center", paddingTop: 8 }}>
          <Rule w={40} c={T.paperDeep} mb={11} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>One thing is plenty. The rest will keep.</div>
        </footer>
      </div>
    </div>
  );
}

function DemoRibbon({ n, name }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
      background: T.ink, color: T.paper, textAlign: "center",
      fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8,
      padding: "5px 10px", textTransform: "uppercase",
    }}>
      DEMO · Today direction {n} — {name}
    </div>
  );
}
