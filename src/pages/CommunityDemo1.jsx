// CommunityDemo1 — "Community Home — the rooms + Question of the Day"
// ─────────────────────────────────────────────────────────────────────────────
// The whole-life editorial home. Health is ONE room, not the house. A warm
// masthead, an ambient presence line, a one-tap Question of the Day that reveals
// a descriptive-norm aggregate (no counts, no leaderboard), and the whole-life
// rooms grid: Lounge, Circles, Love, Money & Work, Style, The Lighter Side,
// Echo Wall, Witness, Health.
//
// From WHOLE_LIFE_REBALANCE §"whole-life rooms" + COMMUNITY_MEGA_PLAN §0.5:
// broaden Community into life-domain rooms; friendship & fun as first-class;
// QOTD as the gentle daily-belonging engine. Anonymous, 18+, no scoreboards.
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import {
  Sofa, Users, Heart, Wallet, Sparkles, Moon, Waves, HeartHandshake,
  Stethoscope, Coffee, MessageCircle, Briefcase, Wind, Check,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// ── Question of the Day (one tap → descriptive-norm reveal) ──────────────────
const QOTD = {
  ask: "What small thing lifted you today?",
  options: [
    { id: "coffee",  label: "a good coffee",        Icon: Coffee },
    { id: "text",    label: "a text from a friend", Icon: MessageCircle },
    { id: "work",    label: "a win at work",        Icon: Briefcase },
    { id: "air",     label: "fresh air",            Icon: Wind },
  ],
  // descriptive norm only — what most women said, never a count or ranking
  norm: "text",
  normLine: "Most women said the same as you — a text from a friend.",
  normLineOther: "Most women said: a text from a friend.",
};

// ── whole-life rooms (icon + name + one-line + a gentle, non-competitive hint) ─
const ROOMS = [
  { Icon: Sofa,         name: "The Lounge",        line: "Vent, spill it, ask if you're being unreasonable — kindly.", hint: "Busy tonight",        accent: T.ink },
  { Icon: Users,        name: "Circles",           line: "Friendship by interest — books, walks, late starts, hobbies.", hint: "A few new rooms",    accent: T.sage },
  { Icon: Heart,        name: "Love & Relationships", line: "Dating, partners, family — the tender and the tangled.",   hint: "Quietly active",      accent: T.blush },
  { Icon: Wallet,       name: "Money & Work",      line: "Ask the dumb question. Plain-English, never condescending.",  hint: "Open all hours",      accent: T.ink },
  { Icon: Sparkles,     name: "Style & Self-Expression", line: "Advice, not hot-or-not. Dress for the woman you are.",  hint: "Warm in here",        accent: T.gold },
  { Icon: Moon,         name: "The Lighter Side",  line: "A smart-friend daily, playful astrology, a proper laugh.",    hint: "Today's read is up",  accent: T.ink },
  { Icon: Waves,        name: "Echo Wall",         line: "One scrubbed line to women in your phase. Held, not replied.", hint: "Lines this hour",    accent: T.gold },
  { Icon: HeartHandshake, name: "Witness",         line: "One entry, held once by one matched sister. Slow, earned.",   hint: "Paired gently",       accent: T.blush },
  { Icon: Stethoscope,  name: "Health",            line: "One room, not the house. Phase, symptoms, the clinical bits.", hint: "Here when you need it", accent: T.sage },
];

export default function CommunityDemo1() {
  useEditorialFonts();
  const [picked, setPicked] = useState(null);   // QOTD selection (null until tapped)

  const matched = picked === QOTD.norm;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Home — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "40px 20px 60px" }}>
        {/* masthead */}
        <header style={{ textAlign: "center", marginBottom: 16 }}>
          <Eyebrow mb={10} color={T.muted}>Your community</Eyebrow>
          <Script size={56} carve>For the whole of you</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, margin: "12px auto 0", maxWidth: 360, lineHeight: 1.55 }}>
            Your health is one room here — not the whole house. Come in for the love,
            the laugh, the money question, the late-night vent.
          </p>
        </header>

        {/* ambient presence — aggregate, never named */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "11px 14px", margin: "0 0 22px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, flexShrink: 0 }} />
          <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, letterSpacing: 0.2 }}>
            <strong style={{ color: T.ink }}>31 women</strong> are here right now — you're not alone tonight.
          </span>
        </div>

        {/* Question of the Day */}
        <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "20px 18px 18px", marginBottom: 30, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ width: 22, height: 1, background: T.gold }} />
            <Eyebrow color={T.muted}>Question of the day</Eyebrow>
          </div>
          <Script size={30} carve style={{ marginBottom: 14 }}>{QOTD.ask}</Script>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {QOTD.options.map((o) => {
              const on = picked === o.id;
              const dim = picked && !on;
              return (
                <button
                  key={o.id}
                  onClick={() => setPicked(o.id)}
                  disabled={!!picked}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "11px 13px", borderRadius: 13, textAlign: "left",
                    background: on ? T.ink : "transparent",
                    border: `1px solid ${on ? T.ink : T.paperDeep}`,
                    color: on ? T.paper : (dim ? T.muted : T.inkSoft),
                    fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2,
                    cursor: picked ? "default" : "pointer",
                    opacity: dim ? 0.55 : 1, transition: "all .18s ease",
                  }}
                >
                  <o.Icon size={15} style={{ flexShrink: 0 }} />
                  <span>{o.label}</span>
                  {on && <Check size={14} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* descriptive-norm reveal — no counts, no leaderboard */}
          {picked && (
            <div style={{ marginTop: 15 }}>
              <Rule c={T.paperDeep} mb={12} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <Users size={15} color={T.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <Hand size={20} carve>
                    {matched ? QOTD.normLine : QOTD.normLineOther}
                  </Hand>
                  <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "6px 0 0", lineHeight: 1.5 }}>
                    A little company in the small things. No tally, no names — just the shape of the room.
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* the rooms */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <Eyebrow color={T.muted}>The rooms</Eyebrow>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
          {ROOMS.map((r) => (
            <div
              key={r.name}
              style={{
                display: "flex", alignItems: "flex-start", gap: 13,
                background: T.paperHi, border: `1px solid ${T.paperDeep}`,
                borderRadius: 16, padding: "15px 16px",
              }}
            >
              <span style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: `${r.accent}14`, color: r.accent,
              }}>
                <r.Icon size={19} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.2 }}>{r.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: T.sage }} />
                    {r.hint}
                  </span>
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "4px 0 0", lineHeight: 1.5 }}>
                  {r.line}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* gentle footing — no handles, no likes, no leaderboards */}
        <div style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.65, margin: "0 auto", maxWidth: 380 }}>
          No handles. No likes. No leaderboards. Anonymous, 18 and over — a room
          everyone's already in, just by being here.
        </div>

        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}

function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}
