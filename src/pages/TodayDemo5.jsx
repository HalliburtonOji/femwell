// TodayDemo5 — "Editorial 'your day' letter, FULL" (Today redesign, Direction 5)
// ────────────────────────────────────────────────────────────────────────────
// A dated DISPATCH written FOR you today — a rich, multi-paragraph letter in
// Jess's warm voice that weaves greeting, phase, and the whole day into prose
// with quiet inline DOORWAYS (links set into the sentences). THEN the day's
// surfaces sit beneath as populated cards/links: garden, journal, nutrition,
// community, lifestyle, programme. Cream/plum letter aesthetic. No-guilt.
//
// Self-contained PREVIEW: computeCycleDay ONLY (no state). No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import {
  ChevronRight, Leaf, PenLine, Salad, Users, BookOpen, Moon, Heart as HeartIcon,
  Headphones, Droplet,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG, PHASE_COLORS, Heart,
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

// inline doorway — a link set into a sentence (crimson, underlined hairline)
function Link({ to, children }) {
  return (
    <a href={`/${to}`} style={{ color: T.crimson, textDecoration: "none", borderBottom: `1px solid ${T.crimson}`, fontWeight: 600 }}>{children}</a>
  );
}

function MiniBloom({ size = 56 }) {
  const cx = 50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Meadowlight, blooming" style={{ flex: "none" }}>
      <path d="M50 92 C 48 72 52 56 50 44" stroke={T.sage} strokeWidth={3} fill="none" strokeLinecap="round" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={cx} cy={28} rx={7} ry={14} fill={T.blush} opacity={0.94} transform={`rotate(${a} ${cx} 42)`} />
      ))}
      <circle cx={cx} cy={42} r={7.5} fill={T.gold} />
      <circle cx={cx} cy={42} r={3.5} fill={T.crimson} opacity={0.5} />
    </svg>
  );
}

function SurfaceRow({ Icon, accent, eyebrow, title, sub, to }) {
  return (
    <a href={`/${to}`} style={{
      display: "flex", alignItems: "center", gap: 13, padding: "13px 15px",
      background: T.paperHi, textDecoration: "none", color: T.ink,
      border: `1px solid ${T.paperDeep}`, borderRadius: 14,
    }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={16} strokeWidth={1.7} color={accent} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase" }}>{eyebrow}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 16.5, color: T.ink, lineHeight: 1.18 }}>{title}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted }}>{sub}</span>
      </span>
      <ChevronRight size={16} color={T.muted} />
    </a>
  );
}

export default function TodayDemo5() {
  useEditorialFonts();
  const cd = computeCycleDay(MOCK_PROFILE); void cd;
  const P = { fontFamily: SERIF, fontSize: 17, lineHeight: 1.62, color: T.inkSoft, margin: "0 0 15px" };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={5} name="Your day, a letter" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "58px 22px 120px" }}>

        {/* masthead */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <Eyebrow color={T.muted}>{DATE_LABEL}</Eyebrow>
          <Script size={42} style={{ marginTop: 5 }}>Good afternoon, {ME.name}.</Script>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 7 }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: T.paper, background: PHASE_COLORS.luteal, borderRadius: 999, padding: "3px 10px" }}>Day 22 · Luteal</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>Inner Autumn</span>
          </div>
        </div>

        <Rule mt={20} mb={20} c={T.paperDeep} />

        {/* the letter — Jess's voice, doorways woven in */}
        <div style={{ position: "relative" }}>
          <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.6, color: T.crimson, textTransform: "uppercase", fontWeight: 700 }}>A note from Jess</span>

          <p style={{ ...P, marginTop: 14 }}>
            You&apos;re in the quiet half of your cycle today — <em>Inner Autumn</em>, day twenty-two.
            Boundaries feel natural here, so if part of you wants to do less, that&apos;s not you slipping.
            That&apos;s your body being honest. Let&apos;s build the day around <em>enough</em>, not around full.
          </p>

          <p style={P}>
            If you only do one thing, make it <Link to="Lifestyle">a five-minute settle</Link> before the
            afternoon picks up — luteal asks for less input, and a short breath practice takes the edge off.
            Then, when you&apos;ve a moment, <Link to="Journal">leave yourself a line</Link>. Two days ago you
            wrote <em>&ldquo;I keep circling the same worry…&rdquo;</em> — you don&apos;t have to solve it, only
            to set it down where you can see it.
          </p>

          <p style={P}>
            Your plate&apos;s had two meals so far, around eight hundred and forty calories, and your iron&apos;s
            leaning a touch light — <Link to="Nutrition">a few seeds or some greens</Link> would steady it,
            and you&apos;re three glasses of water into the day. No rules. Out in the wider
            <Link to="Community"> circle</Link>, a few sisters have answered today&apos;s question — <em>what
            small thing lifted you?</em> — and one left just two words: <em>&ldquo;It&apos;s held.&rdquo;</em>
          </p>

          <p style={{ ...P, marginBottom: 0 }}>
            There&apos;s a walk and a GP call at three on your plan if you&apos;ve the energy, and
            tonight your <Link to="Lifestyle">Sleep, gently</Link> programme reaches day four — a body-scan.
            And <Link to="Garden">Meadowlight</Link> is blooming, by the way. She&apos;s been keeping you
            company whether you tended her or not. That&apos;s rather the point of her.
          </p>

          {/* sign-off */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
            <Heart size={18} />
            <Script size={26}>Jess</Script>
          </div>
        </div>

        <Rule mt={26} mb={20} c={T.paperDeep} />

        {/* the surfaces beneath — populated cards/links */}
        <Eyebrow color={T.muted} mb={14}>Everything from the letter, in one place</Eyebrow>

        {/* garden — a little richer, with the bloom */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 15px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, marginBottom: 10 }}>
          <MiniBloom size={62} />
          <div style={{ flex: 1 }}>
            <Eyebrow color={T.sage} mb={2}>Your garden · Meadowlight</Eyebrow>
            <Script size={22}>Blooming</Script>
            <Hand size={14.5} color={T.inkSoft}>Tended 5 days this week — today, your line fed her.</Hand>
          </div>
          <a href="/Garden" style={{ alignSelf: "center" }}><ChevronRight size={18} color={T.muted} /></a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SurfaceRow Icon={PenLine} accent={T.gold} eyebrow="Journal · 3 this cycle" title="What would feel like enough today?" sub="last: “I keep circling the same worry…”" to="Journal" />
          <SurfaceRow Icon={Salad} accent={T.sage} eyebrow="Today's plate" title="2 meals · ~840 kcal · protein 38g" sub="iron leaning light · 3 of 6 glasses" to="Nutrition" />
          <SurfaceRow Icon={Users} accent={T.crimson} eyebrow="From the circle" title="“It’s held.”" sub="a few sisters answered · Books circle: Little Women" to="Community" />
          <SurfaceRow Icon={BookOpen} accent={T.muted} eyebrow="Today's read" title="The quiet power of luteal rest" sub="audio · winding down · 8 min" to="Lifestyle" />
          <SurfaceRow Icon={Moon} accent={T.sage} eyebrow="Your programme" title="Sleep, gently · day 4 of 7" sub="tonight: a body-scan" to="Lifestyle" />
        </div>

        {/* small glance strip — calm icons echoing the letter */}
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 22, opacity: 0.85 }}>
          {[Droplet, HeartIcon, Headphones, Leaf].map((Ic, i) => (
            <Ic key={i} size={15} color={T.muted} strokeWidth={1.6} />
          ))}
        </div>

        <footer style={{ textAlign: "center", paddingTop: 18 }}>
          <Rule w={40} c={T.paperDeep} mb={11} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Read it, or don&apos;t. It keeps until you&apos;re ready.</div>
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
