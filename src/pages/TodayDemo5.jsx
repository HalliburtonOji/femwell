// TodayDemo5 — "Editorial 'your day' story" (Today redesign, Direction 5)
// ────────────────────────────────────────────────────────────────────────────
// A dated DISPATCH written FOR you today. Not a grid of cards — a short
// editorial paragraph in Jess's warm voice that WEAVES the greeting, the phase,
// and ONE gentle suggestion into prose, with quiet inline DOORWAYS (links) set
// into the sentences. Cream/plum "letter" aesthetic (the same voice the Health
// letters prove works). The garden gets one closing line — a resting season is
// written about kindly, never as a lapse. No scores / streaks / counts.
//
// Self-contained PREVIEW: computeCycleDay ONLY (no state needed). No base44, no
// entities, no network, no required props. Brand-pure: Editorial T tokens,
// crimson the single pop, NO emoji, Lucide + inline SVG only.
import { ChevronRight } from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG, Heart,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const ME = { name: "Hannah" };

function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
function dateline() {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

// An inline doorway — a link set into the running prose (plum, underlined).
function Door({ to, children }) {
  return (
    <a href={`/${to}`} style={{
      color: T.crimson, textDecoration: "underline", textUnderlineOffset: 3,
      textDecorationThickness: 1, fontWeight: 600,
    }}>{children}</a>
  );
}

// Per-phase dispatch copy (Jess's voice). The suggestion is woven in, with the
// doorway sitting inside the sentence — never a separate "do this" button.
function dispatch(phase, name, tod) {
  const open = `${greeting()}, ${name}.`;
  const map = {
    menstrual: {
      season: "Inner Winter",
      body: <>
        It's a winter week, and your body is doing quiet, heavy work — so today asks very little of you.
        If anything at all, let it be warmth and stillness: a <Door to="Lifestyle">slow grounding practice</Door> this {tod},
        and a plate that's gentle to digest. If you'd like to put a single line down, your <Door to="Journal">page</Door> is open. Nothing else is owed.
      </>,
    },
    follicular: {
      season: "Inner Spring",
      body: <>
        Something's beginning. Follicular energy is the part of the month that loves a fresh start, and you may feel it gathering this {tod}.
        It's a kind day to pick up something new — perhaps a note in your <Door to="Journal">journal</Door> about what you'd like to grow this cycle,
        or a look at <Door to="Nutrition">what would nourish that rising energy</Door>. Begin gently; there's no rush.
      </>,
    },
    ovulatory: {
      season: "Inner Summer",
      body: <>
        You're at your most open today — bright, warm, easy in your own skin. If there's a conversation you've been circling, this {tod} is the one to have it.
        Your appetite and energy are high too, so a <Door to="Nutrition">bright, protein-forward plate</Door> will keep the afternoon steady.
        Enjoy the summer of it.
      </>,
    },
    luteal: {
      season: "Inner Autumn",
      body: <>
        We've turned the corner into your inner autumn, and boundaries feel natural now — so this is a good week to honour them.
        Your nervous system is asking for less input, not more. If you have five minutes this {tod}, a <Door to="Lifestyle">short breath practice</Door> would
        take the edge off; and if tonight needs it, there's a <Door to="Nutrition">magnesium-friendly supper</Door> that settles the luteal restlessness.
        Be unhurried with yourself.
      </>,
    },
  };
  const d = map[phase] || map.luteal;
  return { open, ...d };
}

export default function TodayDemo5() {
  useEditorialFonts();
  const cd = computeCycleDay({ last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5 });
  const tod = (() => { const h = new Date().getHours(); return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"; })();
  const d = dispatch(cd.phase, ME.name, tod);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={5} name="Editorial 'your day' story" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "64px 26px 120px" }}>
        {/* masthead / dateline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow color={T.muted}>Your day · {dateline()}</Eyebrow>
          <Eyebrow color={T.crimson}>{d.season} · Day {cd.cycleDay}</Eyebrow>
        </div>
        <Rule mt={10} mb={0} c={T.paperDeep} />

        {/* the dispatch */}
        <Script size={40} style={{ marginTop: 24 }}>{d.open}</Script>

        <div style={{ marginTop: 18, fontFamily: SERIF, fontSize: 18.5, lineHeight: 1.62, color: T.inkSoft }}>
          {d.body}
        </div>

        {/* signed, in voice */}
        <div style={{ marginTop: 26 }}>
          <Hand size={20} color={T.ink}>— Jess</Hand>
        </div>

        <Rule mt={30} mb={0} c={T.paperDeep} />

        {/* the garden, written about kindly — one closing line, never a lapse */}
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12 }}>
          <Heart size={20} />
          <Hand size={16.5} color={T.muted} style={{ flex: 1 }}>
            Your <a href="/Garden" style={{ color: T.sage, textDecoration: "underline", textUnderlineOffset: 3, fontStyle: "italic", fontWeight: 600 }}>garden</a> is
            in bloom and has been keeping its own quiet company while you were away.
          </Hand>
        </div>

        <a href="/Garden" style={{
          marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
          color: T.muted, textDecoration: "none",
        }}>Visit the garden <ChevronRight size={14} /></a>
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
    }}>DEMO · Today direction {n} — {name}</div>
  );
}
