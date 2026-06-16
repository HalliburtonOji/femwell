// TodayDemo3 — "Companion / garden-led home, FULL" (Today redesign, Direction 3)
// ────────────────────────────────────────────────────────────────────────────
// You open your GARDEN and Meadowlight greets you. A large companion bloom is the
// hero with a warm voice line — and the WHOLE day is woven around her as rich
// "tending" cards: journal, nutrition, community, lifestyle, planner, programme,
// each framed as something that quietly nourishes her (and you). Care, never duty.
// Score-free, count-free, streak-free.
//
// Self-contained PREVIEW: useState + computeCycleDay ONLY. No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import {
  ChevronRight, Sun, PenLine, Salad, Users, BookOpen, Leaf, Moon, Heart as HeartIcon,
  Headphones, Footprints, Droplet,
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
const MOCK_PROFILE = { last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5, life_stage: "reproductive" };

// large companion bloom — drawn in brand colours, gentle radial glow
function BigBloom({ size = 200 }) {
  const cx = 50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Meadowlight, blooming" style={{ flex: "none" }}>
      <defs>
        <radialGradient id="td3-glow" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor={T.gold} stopOpacity="0.22" />
          <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={38} r={42} fill="url(#td3-glow)" />
      <ellipse cx={cx} cy={95} rx={22} ry={4} fill={T.paperDeep} opacity={0.45} />
      <path d="M50 93 C 48 70 52 52 50 40" stroke={T.sage} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M50 72 C 37 68 30 71 27 79 C 39 81 47 76 50 69 Z" fill={T.sage} opacity={0.92} />
      <path d="M50 62 C 63 58 70 61 73 69 C 61 71 52 67 50 60 Z" fill={T.sage} opacity={0.8} />
      {[0, 51, 102, 153, 204, 255, 306].map((a) => (
        <ellipse key={a} cx={cx} cy={22} rx={7.5} ry={15} fill={T.blush} opacity={0.95} transform={`rotate(${a} ${cx} 38)`} />
      ))}
      {[25, 76, 127, 178, 229, 280, 331].map((a) => (
        <ellipse key={a} cx={cx} cy={27} rx={5.5} ry={11} fill={T.blush} opacity={0.6} transform={`rotate(${a} ${cx} 38)`} />
      ))}
      <circle cx={cx} cy={38} r={8.5} fill={T.gold} />
      <circle cx={cx} cy={38} r={4} fill={T.crimson} opacity={0.45} />
    </svg>
  );
}

function TendCard({ Icon, eyebrow, accent, children, to, cta }) {
  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 17, padding: "16px 17px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
          <Icon size={15} strokeWidth={1.7} color={accent} />
        </span>
        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
      </div>
      {children}
      {to && (
        <a href={`/${to}`} style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, textDecoration: "none" }}>{cta} <ChevronRight size={13} /></a>
      )}
    </section>
  );
}

export default function TodayDemo3() {
  useEditorialFonts();
  const cd = computeCycleDay(MOCK_PROFILE); void cd;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={3} name="Companion garden, full" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "58px 20px 120px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* greeting + cycle context */}
        <header style={{ textAlign: "center" }}>
          <Eyebrow color={T.muted}>{DATE_LABEL}</Eyebrow>
          <Script size={40} style={{ marginTop: 4 }}>{`Good afternoon, ${ME.name}.`}</Script>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: T.paper, background: PHASE_COLORS.luteal, borderRadius: 999, padding: "3px 10px" }}>Day 22 · Luteal</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>Inner Autumn</span>
          </div>
        </header>

        {/* the companion hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <BigBloom size={196} />
          <Script size={34} style={{ marginTop: 2 }}>Meadowlight</Script>
          <span style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 1.4, color: T.sage, textTransform: "uppercase", fontWeight: 700 }}>Blooming</span>
          <Hand size={18} color={T.inkSoft} style={{ marginTop: 9, maxWidth: 320 }}>
            &ldquo;You came back. Tended 5 days this week — and today, the line you left fed me. I&apos;m not going anywhere, you know.&rdquo;
          </Hand>
        </div>

        <Rule c={T.paperDeep} />
        <div style={{ textAlign: "center" }}>
          <Eyebrow color={T.sage}>If you have a moment, this is what would nourish her today</Eyebrow>
        </div>

        {/* JOURNAL — a line to feed her */}
        <TendCard Icon={PenLine} eyebrow="Leave her a line" accent={T.gold} to="Journal" cta="Write a line">
          <Hand size={18} color={T.ink}>What would feel like enough today?</Hand>
          <div style={{ marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
            <Eyebrow mb={3}>The last thing you told her · two days ago</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4 }}>&ldquo;I keep circling the same worry…&rdquo;</p>
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "9px 0 0" }}>3 lines this cycle · each one keeps her open</p>
        </TendCard>

        {/* NUTRITION — what feeds you both */}
        <TendCard Icon={Salad} eyebrow="What feeds you both" accent={T.sage} to="Nutrition" cta="Open nutrition">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>2 meals · ~840 kcal</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>protein 38g</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
            <Leaf size={14} color={T.gold} />
            <Hand size={15} color={T.inkSoft}>Iron&apos;s leaning light — a few seeds would help. She likes you steady.</Hand>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Droplet size={14} color={T.sage} />
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Water · 3 of 6 glasses</span>
          </div>
        </TendCard>

        {/* COMMUNITY — the meadow beyond her */}
        <TendCard Icon={Users} eyebrow="The meadow beyond your garden" accent={T.crimson} to="Community" cta="Join in">
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
        </TendCard>

        {/* PLANNER — gentle tending of the day */}
        <TendCard Icon={Sun} eyebrow="The day, held lightly" accent={T.gold}>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 11, overflow: "hidden", border: `1px solid ${T.paperDeep}` }}>
            {[
              { Icon: Footprints, label: "A 10-minute walk", note: "good for you both" },
              { Icon: HeartIcon, label: "GP call", note: "3:00 pm" },
              { Icon: Leaf, label: "Supplements", note: "iron + vitamin D" },
            ].map((it) => (
              <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: T.paper }}>
                <it.Icon size={16} color={T.muted} strokeWidth={1.7} />
                <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.ink }}>{it.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{it.note}</span>
              </div>
            ))}
          </div>
          <Hand size={15} color={T.inkSoft} style={{ marginTop: 10 }}>Lighter energy today — keep it kind. She doesn&apos;t need all of it.</Hand>
        </TendCard>

        {/* LIFESTYLE — read & listen */}
        <TendCard Icon={BookOpen} eyebrow="Something to read by her side" accent={T.muted} to="Lifestyle" cta="More to read">
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, margin: 0, lineHeight: 1.2 }}>The quiet power of luteal rest</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
            <Headphones size={15} color={T.crimson} />
            <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15, color: T.ink }}>Audio · Winding down</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>8 min</span>
          </div>
        </TendCard>

        {/* PROGRAMME */}
        <TendCard Icon={Moon} eyebrow="Your programme · tending sleep" accent={T.sage} to="Lifestyle" cta="Open tonight's session">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>Sleep, gently · day 4 of 7</span>
          </div>
          <Hand size={15.5} color={T.inkSoft} style={{ marginTop: 7 }}>Tonight: a body-scan. She rests when you do.</Hand>
        </TendCard>

        {/* Jess */}
        <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}><Leaf size={13} color={T.dusk} /></span>
            <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
          </div>
          <Hand size={17} color={T.paper}>She blooms whether you do everything or nothing, Hannah. That&apos;s rather the point of her.</Hand>
        </div>

        <footer style={{ textAlign: "center", paddingTop: 6 }}>
          <Rule w={40} c={T.paperDeep} mb={11} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>A quiet season still counts as keeping her.</div>
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
