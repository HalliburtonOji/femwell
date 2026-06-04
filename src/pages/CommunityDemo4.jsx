// CommunityDemo4 — "Circles + Others in your phase" (Community design demo)
// ─────────────────────────────────────────────────────────────────────────────
// The belonging layer. A taxonomy of themed cohorts you can join — by Phase,
// Program, Region, Life stage, Condition — alongside a zero-moderation-cost
// belonging signal: an anonymised "others in your phase" aggregate that turns
// cold statistics into you're-not-alone with no 1:1 exposure and nothing to
// moderate.
//
// Captures, from COMMUNITY_BUILD_SPEC §2.F.1 (circles taxonomy) + §2.B.3 (the
// research-driven aggregate card, borrowed from Clue's sub-phase insight, with a
// k-anonymity floor so a too-small cohort is suppressed rather than shown).
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import {
  Moon, CalendarClock, MapPin, Sprout, HeartPulse, Check, Users,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const TAXONOMY = [
  { key: "phase",     label: "Phase",      Icon: Moon,          circles: [
    { name: "Luteal Softness", members: 1400, today: 12 },
    { name: "Follicular Rising", members: 980, today: 7 },
  ] },
  { key: "program",   label: "Program",    Icon: CalendarClock, circles: [
    { name: "Sleep Reset cohort", members: 420, today: 5 },
  ] },
  { key: "region",    label: "Region",     Icon: MapPin,        circles: [
    { name: "UK Women Wellness", members: 2100, today: 19 },
  ] },
  { key: "lifestage", label: "Life stage", Icon: Sprout,        circles: [
    { name: "Perimenopause Watch", members: 890, today: 9 },
    { name: "Postpartum First Year", members: 310, today: 4 },
  ] },
  { key: "condition", label: "Condition",  Icon: HeartPulse,    circles: [
    { name: "PCOS Honest", members: 760, today: 8 },
    { name: "PMDD Support", members: 540, today: 6 },
  ] },
];

const K_FLOOR = 20;   // k-anonymity floor — below this a cohort is suppressed, never shown

export default function CommunityDemo4() {
  useEditorialFonts();
  const [tab, setTab] = useState("phase");
  const [joined, setJoined] = useState({ "Luteal Softness": true });
  const active = TAXONOMY.find((t) => t.key === tab);
  const joinedCount = Object.values(joined).filter(Boolean).length;

  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : "" + n);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Circles & belonging — design demo · mock data" />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "26px 20px 0" }}>
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <Eyebrow mb={10} color={T.muted}>Circles</Eyebrow>
          <Script size={48} carve>Rooms you can belong to</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "10px auto 0", maxWidth: 440, lineHeight: 1.5 }}>
            Themed cohorts, grouped by what you share. No followers, no feed rank — just
            company, by the shape of your life.
          </p>
        </header>

        {/* the aggregate belonging card — the zero-moderation signal */}
        <AggregateCard count={312} weekHeavy={847} />

        {/* taxonomy tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", margin: "22px 0 16px", paddingBottom: 4 }}>
          {TAXONOMY.map((t) => {
            const on = t.key === tab;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                background: on ? T.ink : "transparent", color: on ? T.paper : T.inkSoft,
                border: `1px solid ${on ? T.ink : T.paperDeep}`,
                fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
              }}>
                <t.Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* circle cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {active.circles.map((c) => {
            const isJoined = !!joined[c.name];
            return (
              <article key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "16px 17px" }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, background: `${T.gold}1A`, color: T.gold, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <active.Icon size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1.25 }}>{c.name}</div>
                  <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 3 }}>
                    {fmt(c.members)} sisters · {c.today} posting today
                  </div>
                </div>
                <button onClick={() => setJoined((j) => ({ ...j, [c.name]: !j[c.name] }))} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                  background: isJoined ? `${T.sage}26` : T.ink, color: isJoined ? T.ink : T.paper,
                  border: `1px solid ${isJoined ? T.sage : T.ink}`, fontFamily: UI, fontSize: 12, fontWeight: 700,
                }}>
                  {isJoined ? <><Check size={13} /> Joined</> : "Join"}
                </button>
              </article>
            );
          })}
        </div>

        <div style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 18 }}>
          {joinedCount} circle{joinedCount === 1 ? "" : "s"} joined · echoes you leave can stay circle-scoped
        </div>

        <div style={{ marginTop: 28 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}

// ── the aggregate belonging card (suppressed below the k-anonymity floor) ────
function AggregateCard({ count, weekHeavy }) {
  if (count < K_FLOOR) {
    return (
      <div style={{ textAlign: "center", padding: "20px 18px", border: `1px dashed ${T.paperDeep}`, borderRadius: 16, fontFamily: UI, fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>
        Too few in your phase right now to show a count without naming anyone. We'd rather
        show nothing than risk that.
      </div>
    );
  }
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "20px 20px", textAlign: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Users size={15} color={T.gold} />
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: T.muted }}>Others in your phase · tonight</span>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.5, color: T.ink }}>
        You're one of <Script size={34} carve style={{ display: "inline", verticalAlign: "baseline" }}>{count}</Script> women
        in their inner autumn tonight.
      </div>
      <Rule w={50} c={T.paperDeep} mt={14} mb={12} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>
        {weekHeavy} in your luteal phase logged something heavy this week. No names. No
        content. Just the company of a number.
      </div>
    </div>
  );
}

function DemoBanner({ label }) {
  return <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>;
}
