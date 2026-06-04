// CommunityDemo5 — "Community Home" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// The page that ties it together. "Journal owns the writer. Community owns the
// peer shapes." One reflection can take four lives — stay locked, become an echo,
// be sealed to future-you, or be handed to one witness. Community walks a
// solitude → witness gradient as trust builds: Echo Wall → Witness Mode → Phase
// Twin, with Circles holding the belonging layer underneath.
//
// Captures, from COMMUNITY_BUILD_SPEC §1.0–1.4: the two-home story · the
// solitude → witness gradient (Cycle Mirror → Sealed Letters → Echo Wall →
// Witness → Phase Twin; first two SOLO/Journal, last three PEER/Community) ·
// "one entry, four lives" · the peer surfaces as one connected home.
//
// Self-contained, mock data only, no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import {
  Waves, HeartHandshake, Users, BookHeart, Lock, Feather, Send, MoonStar,
  ArrowRight, Circle,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, Heart, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

// the solitude → witness gradient (the spine of the whole system)
const GRADIENT = [
  { key: "mirror",  home: "Journal",   solo: true,  label: "Cycle Mirror",   line: "On this day last cycle, you wrote…", Icon: MoonStar },
  { key: "sealed",  home: "Journal",   solo: true,  label: "Sealed Letters",  line: "A letter to future-you, under your key.", Icon: Lock },
  { key: "echo",    home: "Community", solo: false, label: "Echo Wall",       line: "One scrubbed line to women in your phase.", Icon: Waves },
  { key: "witness", home: "Community", solo: false, label: "Witness Mode",    line: "One entry, held by one matched sister.", Icon: HeartHandshake },
  { key: "twin",    home: "Community", solo: false, label: "Phase Twin",      line: "Twelve days, one shape, written together.", Icon: Users },
];

// one entry, four lives
const FOUR_LIVES = [
  { Icon: Lock,    name: "Stay locked",        sub: "The default. Lives in your Journal, under your key.", tone: T.ink },
  { Icon: Waves,   name: "Become an echo",     sub: "One scrubbed line to the wall. Anonymous. Fades in 48h.", tone: T.gold },
  { Icon: Feather, name: "Be sealed",          sub: "A letter to future-you, opened on a date you choose.", tone: T.inkSoft },
  { Icon: Send,    name: "Handed to a witness", sub: "One matched sister reads it, once. Four lines back, or silence.", tone: T.crimson },
];

const PEER = [
  { Icon: Waves,        title: "Echo Wall",   tag: "Live this hour", body: "A room of one-liners. Five sisters in your inner autumn left a line this hour.", to: "/CommunityDemo1" },
  { Icon: HeartHandshake, title: "Witness Mode", tag: "Q3 · paired", body: "One sister shared once. Will you read one thing, once — and hold it?", to: "/CommunityDemo2" },
  { Icon: Users,        title: "Phase Twin",  tag: "Q4 · deepest", body: "Twelve days with one matched woman. Her words blurred until you write yours.", to: "/CommunityDemo3" },
  { Icon: Circle,       title: "Circles",     tag: "Belonging", body: "Rooms by phase, region, life stage and condition — plus the count of who's here tonight.", to: "/CommunityDemo4" },
];

export default function CommunityDemo5() {
  useEditorialFonts();
  const [step, setStep] = useState(2);   // gradient position the user has "earned"

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Home — design demo · mock data" />

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "26px 20px 0" }}>
        {/* masthead */}
        <header style={{ textAlign: "center", marginBottom: 8 }}>
          <Eyebrow mb={10} color={T.muted}>Community</Eyebrow>
          <Script size={54} carve>For sisters, near and anonymous</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, margin: "12px auto 0", maxWidth: 470, lineHeight: 1.55 }}>
            The Journal is for you and future-you. Community is for everything that needs
            another person — anonymous first, earned slowly.
          </p>
        </header>

        {/* the two-home line */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, margin: "22px 0 8px", border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden" }}>
          <HomeHalf Icon={BookHeart} name="Journal" sub="owns the writer" lines="Mirror · Sealed Letters · Share-as-Echo" />
          <div style={{ width: 1, background: T.paperDeep }} />
          <HomeHalf Icon={Users} name="Community" sub="owns the peer shapes" lines="Echo Wall · Witness · Phase Twin · Circles" gold />
        </div>
        <div style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 26px" }}>
          One reflection can cross between them — but only ever at the entry level, never by default.
        </div>

        {/* one entry, four lives */}
        <SectionTitle>One entry, four lives</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 11, marginBottom: 30 }}>
          {FOUR_LIVES.map((l) => (
            <div key={l.name} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 15px" }}>
              <l.Icon size={18} color={l.tone} />
              <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, marginTop: 9 }}>{l.name}</div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginTop: 4 }}>{l.sub}</div>
            </div>
          ))}
        </div>

        {/* the solitude → witness gradient */}
        <SectionTitle>The solitude → witness gradient</SectionTitle>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 16px", textAlign: "center" }}>
          Journal gets the depth. Community earns the proximity. Each surface is unlocked by
          the trust the one before it built.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 30 }}>
          {GRADIENT.map((g, i) => {
            const earned = i <= step;
            return (
              <div key={g.key}>
                <button onClick={() => setStep(i)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                  background: earned ? T.paperHi : "transparent", border: `1px solid ${earned ? T.paperDeep : "transparent"}`,
                  borderRadius: 14, padding: "13px 15px", cursor: "pointer",
                }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: earned ? (g.solo ? `${T.ink}0F` : `${T.gold}1F`) : "transparent",
                    border: earned ? "none" : `1px dashed ${T.paperDeep}`,
                    color: earned ? (g.solo ? T.ink : T.gold) : T.muted }}>
                    <g.Icon size={18} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ fontFamily: SERIF, fontSize: 18, color: earned ? T.ink : T.muted }}>{g.label}</span>
                      <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: g.solo ? T.muted : T.gold, border: `1px solid ${g.solo ? T.paperDeep : T.gold}`, borderRadius: 999, padding: "2px 7px" }}>
                        {g.solo ? "Solo · Journal" : "Peer · Community"}
                      </span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: earned ? T.inkSoft : T.muted, marginTop: 3 }}>{g.line}</div>
                  </div>
                  {earned ? <Heart size={15} /> : <Lock size={14} color={T.muted} />}
                </button>
                {i < GRADIENT.length - 1 && (
                  <div style={{ width: 1, height: 14, background: T.paperDeep, marginLeft: 35 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* the peer surfaces, as one home */}
        <SectionTitle>Where the peer shapes live</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 14 }}>
          {PEER.map((p) => (
            <a key={p.title} href={p.to} style={{ textDecoration: "none", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "17px 17px", display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: `${T.gold}18`, color: T.gold, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <p.Icon size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1.2 }}>{p.title}</div>
                  <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginTop: 2 }}>{p.tag}</div>
                </div>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>{p.body}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.gold }}>
                Open demo <ArrowRight size={13} />
              </span>
            </a>
          ))}
        </div>

        {/* no-scoreboard footing */}
        <div style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.6, margin: "18px auto 0", maxWidth: 460 }}>
          No handles. No threads. No DMs. No likes, no leaderboards. The widest anything
          travels is one scrubbed line to the in-app wall.
        </div>

        <div style={{ marginTop: 28 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}

function HomeHalf({ Icon, name, sub, lines, gold }) {
  return (
    <div style={{ flex: 1, padding: "16px 16px", background: gold ? `${T.gold}10` : "transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
        <Icon size={18} color={gold ? T.gold : T.ink} />
        <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink }}>{name}</span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft }}>{sub}</div>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 8, letterSpacing: 0.2 }}>{lines}</div>
    </div>
  );
}
function SectionTitle({ children }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 14 }}>
      <Eyebrow color={T.muted}>{children}</Eyebrow>
    </div>
  );
}
function DemoBanner({ label }) {
  return <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>;
}
