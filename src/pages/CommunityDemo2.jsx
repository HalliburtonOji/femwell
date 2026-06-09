// CommunityDemo2 — "Rooms as Doors" (spatial)
// ─────────────────────────────────────────────────────────────────────────────
// Same COMPLETE whole-life Community feature set as every other demo — only the
// UX differs. Here the home is a HALLWAY: a masthead, an ambient-presence line,
// a Question-of-the-Day "welcome mat", and a grid of DOORS (room tiles). Tapping
// a door OPENS it (useState selectedView) into a full-screen ROOM with a clear
// back affordance — you ENTER and LEAVE rooms. Every feature is a door you enter:
// Lounge, Echo Wall, Games, Four-Lives, Witness, Talk-It-Out, plus the life
// rooms (Love / Money / Style / Lighter / Health).
//
// Self-contained: mock data + useState only, no entities. UK voice, no emoji,
// Lucide/SVG only. No scoreboards, counts, streaks, handles or DMs.
import { useState } from "react";
import {
  DoorOpen, ArrowLeft, Send, Check, ChevronRight,
  MessageCircle, Users, Heart, Briefcase, Sparkles, Moon, Waves, HeartHandshake,
  Stethoscope, Lock, Mail, Mic, Phone, Repeat,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  MASTHEAD, PRESENCE, QOTD, ECHOES, ECHO_REACTIONS, LOUNGE,
  THIS_OR_THAT, HOT_TAKES, STORY_SEED, ROLEPLAY, SAMPLE_ENTRY, FOUR_LIVES,
  WITNESS, AUDIO_MODES, AUDIO_NOTE, crisisCheck, UK_RESOURCES, FOOTER_LINE,
  ShieldAlert,
} from "./communityShared";

const PLUM = "#241a26"; // the one dark surface — Witness / Talk fragile card

// ── the doors on the wall (each opens a full-screen room) ────────────────────
const DOORS = [
  { key: "lounge",  name: "The Lounge",   line: "Vent, spill it, be heard — silly to serious.", Icon: MessageCircle, accent: T.ink,     hint: "busy tonight" },
  { key: "echo",    name: "Echo Wall",    line: "One scrubbed line, held — never replied to.",   Icon: Waves,         accent: T.gold,    hint: "lines this hour" },
  { key: "games",   name: "Games Room",   line: "This-or-that, hot takes, a story we build.",    Icon: Sparkles,      accent: T.sage,    hint: "play now" },
  { key: "lives",   name: "Four Lives",   line: "One entry — choose where it goes.",             Icon: Mail,          accent: T.ink,     hint: "your choice" },
  { key: "witness", name: "Witness",      line: "Held once, by one matched sister.",             Icon: HeartHandshake,accent: T.blush,   hint: "paired gently" },
  { key: "talk",    name: "Talk It Out",  line: "Say it aloud — a voice held, never fixed.",     Icon: Mic,           accent: T.blush,   hint: "voice first" },
  { key: "love",    name: "Love",         line: "Dating, friendship, marriage — ask, kindly.",   Icon: Heart,         accent: T.blush,   hint: "open" },
  { key: "money",   name: "Money & Work", line: "Careers, pay, pensions — no question too small.",Icon: Briefcase,     accent: T.ink,     hint: "open" },
  { key: "style",   name: "Style",        line: "Confidence, never the body. Rate the choice.",  Icon: Sparkles,      accent: T.gold,    hint: "open" },
  { key: "lighter", name: "Lighter Side", line: "Telly, the stars, a daily smart-friend note.",  Icon: Moon,          accent: T.ink,     hint: "today's note" },
  { key: "health",  name: "Health",       line: "The clinical room — NHS-grounded. One room.",   Icon: Stethoscope,   accent: T.sage,    hint: "one room" },
];

// life-room placeholder seed feeds (themed, whole-life — not clinical)
const LIFE_FEEDS = {
  love:   ["He texts back in seconds but never plans. Is that a flag, or am I impatient?", "Made up with my sister after a year apart. Took one honest letter.", "Single by choice this year and, quietly, thriving."],
  money:  ["Asked for the pay band before the interview. Felt bold. Glad I did.", "Started a tiny pension pot. Future-me can buy a coffee on me.", "Said no to a 'quick favour' that was really three days' work."],
  style:  ["Charity-shop blazer, eight pounds, fits like it was made for me.", "Wore the bold lip to the dull meeting. Mood: transformed.", "Clearing the wardrobe of clothes for a woman I'm not anymore."],
  lighter:["Tonight's stars say: rest is productive. Taking it as gospel.", "Three episodes deep and unashamed. Recommend the lot.", "The cat sat on the laptop and ended my workday. Wise creature."],
  health: ["NHS-grounded answers live here. Phase-aware, plain-English, never alarmist.", "A gentle check-in: how has your sleep been this week?", "Ask the clinical question you'd never say aloud. Held with care."],
};

export default function CommunityDemo2() {
  useEditorialFonts();
  const [view, setView] = useState(null); // null = hallway; otherwise a door key

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoBanner label="Community · Rooms as doors — design demo · mock data" />
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 0 50px" }}>
        {view === null && <Hallway onEnter={setView} />}
        {view !== null && (
          <Room doorKey={view} onLeave={() => setView(null)}>
            {view === "lounge"  && <LoungeRoom />}
            {view === "echo"    && <EchoRoom />}
            {view === "games"   && <GamesRoom />}
            {view === "lives"   && <LivesRoom />}
            {view === "witness" && <WitnessRoom />}
            {view === "talk"    && <TalkRoom />}
            {LIFE_FEEDS[view]   && <LifeRoom doorKey={view} />}
          </Room>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  THE HALLWAY — masthead · presence · QOTD welcome-mat · the doors grid
// ═══════════════════════════════════════════════════════════════════════════
function Hallway({ onEnter }) {
  const [picked, setPicked] = useState(null);
  const matched = picked === QOTD.norm;

  return (
    <div style={{ padding: "38px 20px 0" }}>
      {/* masthead */}
      <header style={{ textAlign: "center", marginBottom: 16 }}>
        <Eyebrow mb={10} color={T.muted}>{MASTHEAD.eyebrow}</Eyebrow>
        <Script size={54} carve>{MASTHEAD.title}</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "12px auto 0", maxWidth: 360, lineHeight: 1.55 }}>
          {MASTHEAD.subtitle}
        </p>
      </header>

      {/* ambient presence — aggregate, never named */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "11px 14px", margin: "0 0 20px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, flexShrink: 0 }} />
        <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, letterSpacing: 0.2 }}>
          <strong style={{ color: T.ink }}>{PRESENCE.count} women</strong> {PRESENCE.line}
        </span>
      </div>

      {/* QOTD — the welcome mat at the threshold */}
      <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "18px 18px 16px", marginBottom: 30, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 22, height: 1, background: T.gold }} />
          <Eyebrow color={T.muted}>Welcome mat · question of the day</Eyebrow>
        </div>
        <Script size={28} carve style={{ marginBottom: 13 }}>{QOTD.question}</Script>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {QOTD.options.map((o) => {
            const on = picked === o, dim = picked && !on;
            return (
              <button key={o} onClick={() => setPicked(o)} disabled={!!picked}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 13px",
                  borderRadius: 13, textAlign: "left",
                  background: on ? T.ink : "transparent",
                  border: `1px solid ${on ? T.ink : T.paperDeep}`,
                  color: on ? T.paper : (dim ? T.muted : T.inkSoft),
                  fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2,
                  cursor: picked ? "default" : "pointer", opacity: dim ? 0.55 : 1, transition: "all .18s ease",
                }}>
                <span>{o}</span>
                {on && <Check size={14} style={{ marginLeft: "auto", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
        {picked && (
          <div style={{ marginTop: 14 }}>
            <Rule c={T.paperDeep} mb={11} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <Users size={15} color={T.gold} style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <Hand size={20} carve>
                  {matched ? `Most women said the same as you — ${QOTD.norm}.` : QOTD.normLine}
                </Hand>
                <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "6px 0 0", lineHeight: 1.5 }}>
                  No tally, no names — just the shape of the room.
                </p>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* the doors on the wall */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "center", marginBottom: 16 }}>
        <DoorOpen size={14} color={T.muted} />
        <Eyebrow color={T.muted}>Choose a door</Eyebrow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 30 }}>
        {DOORS.map((d) => (
          <button key={d.key} onClick={() => onEnter(d.key)}
            style={{
              position: "relative", textAlign: "left", cursor: "pointer",
              background: T.paperHi, border: `1px solid ${T.paperDeep}`,
              borderLeft: `3px solid ${d.accent}`, borderRadius: 14,
              padding: "15px 14px 14px", minHeight: 132,
              display: "flex", flexDirection: "column",
              boxShadow: "0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(40,30,18,0.06)",
            }}>
            {/* the door knob */}
            <span style={{ position: "absolute", top: 18, right: 12, width: 7, height: 7, borderRadius: 999, background: T.gold, boxShadow: `0 0 0 3px ${d.accent}1A` }} />
            <span style={{
              width: 38, height: 38, borderRadius: 11, marginBottom: 11,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: `${d.accent}14`, color: d.accent,
            }}>
              <d.Icon size={18} />
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1.15, marginBottom: 4 }}>{d.name}</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4, flex: 1 }}>{d.line}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9, fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: T.sage }} />
              {d.hint}
            </span>
          </button>
        ))}
      </div>

      {/* footing on the home */}
      <div style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.65, margin: "0 auto", maxWidth: 380 }}>
        {FOOTER_LINE}
      </div>
      <div style={{ marginTop: 28 }}><EditorialFooter /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  THE ROOM SHELL — full-screen, with the "leave" affordance (back through door)
// ═══════════════════════════════════════════════════════════════════════════
function Room({ doorKey, onLeave, children }) {
  const door = DOORS.find((d) => d.key === doorKey);
  const dark = doorKey === "witness" || doorKey === "talk";
  return (
    <div style={{ minHeight: "100vh", background: dark ? PLUM : "transparent" }}>
      {/* the threshold bar — you've stepped through; here is the way back */}
      <div style={{
        position: "sticky", top: 0, zIndex: 5,
        display: "flex", alignItems: "center", gap: 11, padding: "14px 18px",
        background: dark ? PLUM : T.paper,
        borderBottom: `1px solid ${dark ? "#3a2c3d" : T.paperDeep}`,
      }}>
        <button onClick={onLeave} aria-label="Leave the room"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "transparent", border: `1px solid ${dark ? "#4a3a4d" : T.paperDeep}`,
            borderRadius: 999, padding: "6px 12px 6px 9px", cursor: "pointer",
            fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
            color: dark ? "#E8DCEA" : T.muted,
          }}>
          <ArrowLeft size={14} /> Leave
        </button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: dark ? "#C9B6CC" : T.muted }}>
          <door.Icon size={14} /> {door.name}
        </span>
      </div>
      <div style={{ padding: "26px 20px 40px" }}>{children}</div>
    </div>
  );
}

// small shared room header
function RoomTitle({ children, sub, dark }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Script size={40} carve color={dark ? "#F4EFE3" : T.ink}>{children}</Script>
      {sub && (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: dark ? "#C9B6CC" : T.inkSoft, margin: "8px 0 0", lineHeight: 1.5 }}>{sub}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOOR 1 — THE LOUNGE  (feed + compose + crisis routing → UK_RESOURCES)
// ═══════════════════════════════════════════════════════════════════════════
function LoungeRoom() {
  const [draft, setDraft] = useState("");
  const [feed, setFeed] = useState(LOUNGE);
  const [crisis, setCrisis] = useState(false);

  function post() {
    const t = draft.trim();
    if (!t) return;
    if (crisisCheck(t)) { setCrisis(true); return; }
    setFeed([{ id: `n${Date.now()}`, domain: "You", body: t, warm: true }, ...feed]);
    setDraft("");
  }

  return (
    <>
      <RoomTitle sub="Vent, spill it, ask if you're being unreasonable — kindly. No names, no threads.">The Lounge</RoomTitle>

      {/* compose */}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: 14, marginBottom: 22 }}>
        <textarea value={draft} onChange={(e) => { setDraft(e.target.value); if (crisis) setCrisis(false); }}
          placeholder="Say the thing. Anonymous, here." rows={3}
          style={{ width: "100%", resize: "none", border: "none", outline: "none", background: "transparent",
            fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5 }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={post}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.ink, color: T.paper,
              border: "none", borderRadius: 999, padding: "8px 16px", cursor: "pointer",
              fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <Send size={13} /> Leave it here
          </button>
        </div>
      </div>

      {crisis && <CrisisCard />}

      {/* feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {feed.map((p) => (
          <div key={p.id} style={{
            background: T.paperHi, border: `1px solid ${T.paperDeep}`,
            borderLeft: `3px solid ${p.warm ? T.sage : T.gold}`, borderRadius: 14, padding: "13px 15px",
          }}>
            <Eyebrow color={T.muted} mb={6}>{p.domain}</Eyebrow>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function CrisisCard() {
  return (
    <div style={{ background: PLUM, borderRadius: 16, padding: "16px 16px 14px", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <ShieldAlert size={17} color={T.blush} />
        <Hand size={19} carve color="#F4EFE3">This one's too heavy for a peer to hold.</Hand>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: "#C9B6CC", margin: "0 0 12px", lineHeight: 1.5 }}>
        Please reach someone who can be with you properly, right now.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {UK_RESOURCES.map((r) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", borderRadius: 11, padding: "10px 12px" }}>
            <r.Icon size={15} color={T.blush} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: "#F4EFE3" }}>{r.name}</div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: "#C9B6CC" }}>{r.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOOR 2 — ECHO WALL  (echoes + kind one-way reactions, no counts)
// ═══════════════════════════════════════════════════════════════════════════
function EchoRoom() {
  const [reacted, setReacted] = useState({}); // id -> reaction label

  return (
    <>
      <RoomTitle sub="Anonymous one-liners from women in your phase. They fade in 48 hours. You can hold one — never reply.">Echo Wall</RoomTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {ECHOES.map((e) => {
          const mine = reacted[e.id];
          return (
            <div key={e.id} style={{
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 15,
              padding: "15px 16px", opacity: 0.55 + (e.fadeH / 48) * 0.45, // fading toward 0
            }}>
              <p style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", color: T.ink, margin: "0 0 11px", lineHeight: 1.45 }}>
                “{e.body}”
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                {ECHO_REACTIONS.map((r) => {
                  const on = mine === r;
                  return (
                    <button key={r} onClick={() => setReacted({ ...reacted, [e.id]: r })} disabled={!!mine}
                      style={{
                        background: on ? T.gold : "transparent",
                        border: `1px solid ${on ? T.gold : T.paperDeep}`,
                        color: on ? T.paper : (mine ? T.muted : T.inkSoft),
                        borderRadius: 999, padding: "5px 11px", cursor: mine ? "default" : "pointer",
                        fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                        opacity: mine && !on ? 0.4 : 1, transition: "all .16s ease",
                      }}>
                      {r}
                    </button>
                  );
                })}
                <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted }}>
                  fades in {e.fadeH}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11, fontStyle: "italic", color: T.muted, marginTop: 18, lineHeight: 1.5 }}>
        A hand on a shoulder, not a thread. No counts, no names.
      </p>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOOR 3 — GAMES ROOM  (this-or-that · hot takes · one-line story · role-play)
// ═══════════════════════════════════════════════════════════════════════════
function GamesRoom() {
  const [tot, setTot] = useState({});        // this-or-that: id -> "a"|"b"
  const [takeIdx, setTakeIdx] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [story, setStory] = useState(STORY_SEED);
  const [line, setLine] = useState("");
  const [cafes, setCafes] = useState(ROLEPLAY.entries);
  const [cafeDraft, setCafeDraft] = useState("");

  return (
    <>
      <RoomTitle sub="No scores, no winners — just a daily nothing-game to share.">Games Room</RoomTitle>

      {/* This-or-That */}
      <Section label="This or that">
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {THIS_OR_THAT.map((q) => {
            const choice = tot[q.id];
            return (
              <div key={q.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 13 }}>
                <Hand size={18} carve style={{ marginBottom: 10 }}>{q.prompt}</Hand>
                <div style={{ display: "flex", gap: 9 }}>
                  {["a", "b"].map((side) => {
                    const on = choice === side;
                    return (
                      <button key={side} onClick={() => setTot({ ...tot, [q.id]: side })} disabled={!!choice}
                        style={{ flex: 1,
                          background: on ? T.ink : "transparent", color: on ? T.paper : T.inkSoft,
                          border: `1px solid ${on ? T.ink : T.paperDeep}`, borderRadius: 11,
                          padding: "10px 8px", cursor: choice ? "default" : "pointer",
                          fontFamily: UI, fontSize: 12.5, fontWeight: 700 }}>
                        {q[side]}
                        {choice && (
                          <span style={{ display: "block", fontFamily: UI, fontSize: 10, fontWeight: 600, marginTop: 3, opacity: 0.75 }}>
                            {q.split[side === "a" ? 0 : 1]}% of women
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Hot Takes */}
      <Section label="Hot takes">
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 15 }}>
          <p style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: T.ink, margin: "0 0 13px", lineHeight: 1.45 }}>
            “{HOT_TAKES[takeIdx]}”
          </p>
          <div style={{ display: "flex", gap: 9 }}>
            {[["Agree", T.sage], ["Outrageous", T.gold]].map(([lbl, col]) => (
              <button key={lbl} onClick={() => setVerdict(lbl)}
                style={{ flex: 1, background: verdict === lbl ? col : "transparent", color: verdict === lbl ? T.paper : T.inkSoft,
                  border: `1px solid ${verdict === lbl ? col : T.paperDeep}`, borderRadius: 11, padding: "9px",
                  cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700 }}>{lbl}</button>
            ))}
            <button onClick={() => { setTakeIdx((takeIdx + 1) % HOT_TAKES.length); setVerdict(null); }}
              style={{ background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 13px",
                cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, display: "inline-flex", alignItems: "center", gap: 5 }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Section>

      {/* One-Line Story */}
      <Section label="One-line story — we build it together">
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 15 }}>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 12px", lineHeight: 1.6 }}>
            {story.map((s, i) => <span key={i}>{s} </span>)}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Add the next line…"
              style={{ flex: 1, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px",
                outline: "none", background: T.paper, fontFamily: SERIF, fontSize: 14, color: T.ink }} />
            <button onClick={() => { if (line.trim()) { setStory([...story, line.trim()]); setLine(""); } }}
              style={{ background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "0 14px",
                cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700 }}>Add</button>
          </div>
        </div>
      </Section>

      {/* Role-Play */}
      <Section label={ROLEPLAY.prompt}>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 15 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {cafes.map((c, i) => (
              <span key={i} style={{ background: `${T.sage}1F`, color: T.inkSoft, border: `1px solid ${T.sage}55`,
                borderRadius: 999, padding: "6px 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5 }}>{c}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={cafeDraft} onChange={(e) => setCafeDraft(e.target.value)} placeholder="Name yours…"
              style={{ flex: 1, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px",
                outline: "none", background: T.paper, fontFamily: SERIF, fontSize: 14, color: T.ink }} />
            <button onClick={() => { if (cafeDraft.trim()) { setCafes([...cafes, cafeDraft.trim()]); setCafeDraft(""); } }}
              style={{ background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "0 14px",
                cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700 }}>Add</button>
          </div>
        </div>
      </Section>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
        <span style={{ width: 18, height: 1, background: T.gold }} />
        <Eyebrow color={T.muted}>{label}</Eyebrow>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOOR 4 — FOUR LIVES  (one entry → four destinies chooser)
// ═══════════════════════════════════════════════════════════════════════════
function LivesRoom() {
  const [life, setLife] = useState(FOUR_LIVES.find((l) => l.defaultLife)?.key || FOUR_LIVES[0].key);
  const chosen = FOUR_LIVES.find((l) => l.key === life);

  return (
    <>
      <RoomTitle sub="You wrote it once. Now choose the life it lives. The default is the safe one.">Four Lives</RoomTitle>

      {/* the entry */}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 15, padding: "15px 17px", marginBottom: 20 }}>
        <Eyebrow color={T.muted} mb={8}>Your entry</Eyebrow>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, fontStyle: "italic", color: T.ink, margin: 0, lineHeight: 1.55 }}>
          “{SAMPLE_ENTRY}”
        </p>
      </div>

      {/* the four doors within the door */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {FOUR_LIVES.map((l) => {
          const on = life === l.key;
          return (
            <button key={l.key} onClick={() => setLife(l.key)}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left",
                background: on ? T.ink : T.paperHi, border: `1px solid ${on ? T.ink : T.paperDeep}`,
                borderRadius: 14, padding: "14px 15px", cursor: "pointer", transition: "all .16s ease" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                background: on ? "rgba(255,255,255,0.14)" : `${T.gold}18`, color: on ? T.paper : T.gold }}>
                <l.Icon size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 16.5, color: on ? T.paper : T.ink }}>{l.label}</span>
                  {l.defaultLife && <span style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: on ? "#D8CFBC" : T.muted }}>default</span>}
                  {on && <Check size={15} style={{ marginLeft: "auto", color: T.paper }} />}
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: on ? "#D8CFBC" : T.inkSoft, margin: "4px 0 0", lineHeight: 1.45 }}>{l.line}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "center" }}>
        <chosen.Icon size={15} color={T.gold} />
        <Hand size={18} carve>This entry will: {chosen.label.toLowerCase()}.</Hand>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOOR 5 — WITNESS  (gate · 6-rail charter · 4 fixed responses) — on the plum
// ═══════════════════════════════════════════════════════════════════════════
function WitnessRoom() {
  const [reply, setReply] = useState(null);
  const open = WITNESS.gate.held >= WITNESS.gate.need;

  return (
    <>
      <RoomTitle dark sub="The slowest room. One entry, held once by one matched sister. Earned, not scrolled.">Witness</RoomTitle>

      {/* the gate */}
      {!open && (
        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #3a2c3d", borderRadius: 15, padding: "15px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Lock size={15} color={T.blush} />
            <Eyebrow color="#C9B6CC">To send, first hold</Eyebrow>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: "#E8DCEA", margin: "0 0 11px", lineHeight: 1.5 }}>
            {WITNESS.gate.line}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: WITNESS.gate.need }).map((_, i) => (
              <span key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i < WITNESS.gate.held ? T.blush : "rgba(255,255,255,0.14)" }} />
            ))}
          </div>
        </div>
      )}

      {/* the charter — 6 rails */}
      <div style={{ marginBottom: 22 }}>
        <Eyebrow color="#C9B6CC" mb={12}>The charter — six rails that make it safe</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {WITNESS.charter.map(([head, body], i) => (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.blush, lineHeight: 1.3, flexShrink: 0, width: 18 }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: "#F4EFE3", marginBottom: 2 }}>{head}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: "#C9B6CC", lineHeight: 1.5 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* the four fixed responses — all she can ever send back */}
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 15, padding: "15px 16px" }}>
        <Hand size={18} carve color="#F4EFE3" style={{ marginBottom: 12 }}>When she has read it, she may send one — and only one — of these:</Hand>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {WITNESS.responses.map((r) => {
            const on = reply === r;
            return (
              <button key={r} onClick={() => setReply(r)} disabled={!!reply}
                style={{ background: on ? T.blush : "transparent", color: on ? PLUM : "#E8DCEA",
                  border: `1px solid ${on ? T.blush : "#4a3a4d"}`, borderRadius: 12, padding: "12px 10px",
                  cursor: reply ? "default" : "pointer", fontFamily: SERIF, fontStyle: "italic", fontSize: 15,
                  opacity: reply && !on ? 0.4 : 1, transition: "all .16s ease" }}>
                {r}
              </button>
            );
          })}
        </div>
        {reply && (
          <p style={{ fontFamily: UI, fontSize: 11, color: "#C9B6CC", fontStyle: "italic", margin: "12px 0 0", textAlign: "center", lineHeight: 1.5 }}>
            Four lines back, or silence. Then it seals — no DM, no follow, no re-view.
          </p>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOOR 6 — TALK IT OUT  (audio-mode switcher · note · signpost) — on the plum
// ═══════════════════════════════════════════════════════════════════════════
function TalkRoom() {
  const [mode, setMode] = useState(AUDIO_MODES[0].key);
  const active = AUDIO_MODES.find((m) => m.key === mode);

  return (
    <>
      <RoomTitle dark sub="Some things need saying aloud. Held in voice, never fixed.">Talk It Out</RoomTitle>

      {/* the switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {AUDIO_MODES.map((m) => {
          const on = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                background: on ? "rgba(232,180,184,0.16)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${on ? T.blush : "#3a2c3d"}`, borderRadius: 13, padding: "13px 8px",
                cursor: "pointer", transition: "all .16s ease" }}>
              <m.Icon size={19} color={on ? T.blush : "#C9B6CC"} />
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: on ? "#F4EFE3" : "#C9B6CC", textAlign: "center" }}>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* the active mode */}
      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #3a2c3d", borderRadius: 16, padding: "18px 17px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "rgba(232,180,184,0.16)", color: T.blush }}>
            <active.Icon size={19} />
          </span>
          <Script size={28} carve color="#F4EFE3">{active.name}</Script>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#E8DCEA", margin: 0, lineHeight: 1.55 }}>
          {active.line}
        </p>
        {mode === "note" && (
          <button style={{ marginTop: 16, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
            background: T.blush, color: PLUM, border: "none", borderRadius: 999, padding: "12px",
            cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <Mic size={15} /> Hold to record a voice echo
          </button>
        )}
        {mode === "talk" && (
          <button style={{ marginTop: 16, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
            background: "transparent", color: T.blush, border: `1px solid ${T.blush}`, borderRadius: 999, padding: "12px",
            cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <Repeat size={15} /> Pair me for a turn-based talk
          </button>
        )}
        {mode === "circle" && (
          <button style={{ marginTop: 16, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
            background: "transparent", color: T.blush, border: `1px solid ${T.blush}`, borderRadius: 999, padding: "12px",
            cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase" }}>
            <Users size={15} /> Listen in to tonight's circle
          </button>
        )}
      </div>

      {/* the honest signpost */}
      <div style={{ display: "flex", gap: 10, padding: "13px 15px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
        <Phone size={15} color="#C9B6CC" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontFamily: UI, fontSize: 11.5, color: "#C9B6CC", margin: 0, lineHeight: 1.6 }}>{AUDIO_NOTE}</p>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  THE LIFE ROOMS — Love / Money / Style / Lighter / Health (themed placeholders)
// ═══════════════════════════════════════════════════════════════════════════
function LifeRoom({ doorKey }) {
  const door = DOORS.find((d) => d.key === doorKey);
  const feed = LIFE_FEEDS[doorKey] || [];
  return (
    <>
      <RoomTitle sub={door.line}>{door.name}</RoomTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {feed.map((body, i) => (
          <div key={i} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${door.accent}`, borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>{body}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, padding: "13px 15px", background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 13, display: "flex", alignItems: "center", gap: 10 }}>
        <door.Icon size={16} color={door.accent} />
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>
          A themed room — the full feed, compose and gentle prompts open inside.
        </span>
      </div>
    </>
  );
}

// ── demo banner ──────────────────────────────────────────────────────────────
function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}
