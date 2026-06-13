// CommunityRedesign1 — REDESIGN PREVIEW · "Calm Doorway + Hero Card Slider" for Community
// ─────────────────────────────────────────────────────────────────────────────
// Elevates the chosen Demo 6 (rooms-as-doors + tabs hybrid) by borrowing the richer,
// calmer component language from the new Nutrition demos:
//   · a CALM HERO with ONE primary action (today's prompt → "share a line")  [Demo2]
//   · a swipeable HERO-CARD SLIDER for the rooms/surfaces, next card PEEKING  [Demo1]
//   · BOTTOM SHEETS for compose + room-entry (one calm thing at a time)      [Demo2]
//   · progressive disclosure + lower density (one focal point per screen)
//
// PRESERVES Community's locked identity, unchanged:
//   anonymous-first / 18+ · NO scoreboards or vanity counts · the whole-life rooms
//   (Lounge, Echo Wall, Library, Clubs/Circles, Style/Love/Money/Health) · "peer
//   support not medical advice" + crisis routing to UK resources · Jess as host ·
//   cream/ink palette · Ephesis (Script) + Cormorant (Hand/Serif) · no emoji.
//
// HARD CONSTRAINTS: self-contained DEMO — useState/useEffect only, mock data, NO
// base44 / entities / network / props. T tokens only. Lucide/SVG only. 18+, anon.
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Waves, BookOpen, HeartHandshake, Sparkles, Mic, Feather,
  Lock, Unlock, Send, Check, Plus, Flag, ShieldAlert, Phone, X, Clock,
  ChevronLeft, ChevronRight, Heart, Users,
} from "lucide-react";
import {
  T, SERIF, HAND, UI, Eyebrow, Rule, Script, Hand, InkFilter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const COL = 430;       // phone column
const CARD_W = 365;    // ~85vw — next card peeks at the right edge
const GAP = 14;
const PLUM = "#241a26"; // the single permitted dark surface (heavier / crisis beats)

// ════════════════════════════════════════════════════════════════════════════
// MOCK DATA (realistic — feels like a phone; never a network call)
// ════════════════════════════════════════════════════════════════════════════
const MASTHEAD = {
  eyebrow: "The Community",
  title: "Pull up a chair",
  subtitle: "Anonymous, whole-life, kind. For all of you — not just your cycle.",
};

// Ambient presence — aggregate only, never a leaderboard or per-person count.
const PRESENCE = "A roomful of women are quietly around right now.";

const SEASON_LINE = "Others in the same season are here too. You don't have to have it figured out.";

const QOTD = {
  text: "What small thing got you through today?",
  // realistic prior answers (read-only, anonymous, no counts)
  answers: [
    "A cup of tea on the back step before anyone woke up.",
    "Texted my sister a voice note and felt less alone.",
    "Left the washing-up. Sat down instead. Radical.",
    "The dog. Always the dog.",
  ],
};

// The whole-life rooms — these become the swipeable hero cards (the spine).
const ROOMS = [
  { key: "lounge", name: "The Lounge", Icon: MessageCircle, accent: T.gold,
    line: "Vent, spill it, be heard — silly to serious. Comments open by default." },
  { key: "echo", name: "Echo Wall", Icon: Waves, accent: T.gold,
    line: "Anonymous one-liners, held by the room. Each fades in two days." },
  { key: "lighter", name: "The Lighter Side", Icon: Sparkles, accent: T.gold,
    line: "A gentle round Jess is hosting. No winners, no scores — just us." },
  { key: "library", name: "The Library", Icon: BookOpen, accent: T.sage,
    line: "A slow read together, hosted by Jess. Lurking is first-class." },
  { key: "talk", name: "Talk it out", Icon: Mic, accent: T.gold,
    line: "Being heard, not advised. Voice notes & turn-based talk. No recording." },
  { key: "love", name: "Love & Bodies", Icon: Heart, accent: T.blush,
    line: "The questions you'd never say aloud. Anonymous, no judgment." },
  { key: "money", name: "Money", Icon: Feather, accent: T.gold,
    line: "Honest about the numbers. No shame, no comparison." },
  { key: "health", name: "Health", Icon: HeartHandshake, accent: T.sage,
    line: "The clinical room — accurate, NHS-grounded. Never a diagnosis." },
  { key: "circles", name: "Circles & Clubs", Icon: Users, accent: T.gold,
    line: "Small rooms for what you're living and what you love. Join what's yours." },
];

// Lounge feed — each post carries its own comment mode (open / reaction-only).
const LOUNGE_POSTS = [
  { id: "p1", domain: "Perimenopause", mode: "open",
    body: "Woke at 3am again, soaked through. Nobody warned me it'd be like this. Anyone else just... awake at this hour, reading this?",
    comments: [
      { id: "c1", body: "Reading this at 3:12am. You're not alone tonight." },
      { id: "c2", by: "jess", body: "I'm here in the small hours too. You don't have to fix it — just know the room's awake with you." },
    ] },
  { id: "p2", domain: "Postpartum", mode: "open",
    body: "Six weeks in and I cried in the cereal aisle. Not sad exactly. Just full. Tell me this is normal.",
    comments: [
      { id: "c3", body: "Completely normal. The fourth trimester is a lot. Be gentle with yourself." },
    ] },
  { id: "p3", domain: "Just life", mode: "reaction",
    body: "Tiny win: I said no to something today and the world didn't end.",
    comments: [] },
];

const REACTIONS = ["held this", "felt that", "me too", "sending love"];

const ECHOES = [
  { id: "e1", body: "I am allowed to take up space.", fadeH: 41 },
  { id: "e2", body: "Some days the win is just getting through.", fadeH: 33 },
  { id: "e3", body: "Nobody's coming to give me permission. So here it is.", fadeH: 18 },
  { id: "e4", body: "I miss who I was before, and I'm proud of who I'm becoming.", fadeH: 9 },
];

// Jess's gentle round (games-master) — one shared prompt, generous countdown,
// then the AGGREGATE reveal. No winner, no score.
const GM_ROUND = {
  intro: "A little round, just for the fun of it.",
  prompt: "Comfort that never fails you?",
  options: ["A long bath", "Toast & butter", "An old playlist", "Fresh sheets"],
  reveal: "Most of you reached for toast & butter. Quietly, the room agrees — small and warm wins.",
  seconds: 45,
};

const LIBRARY = {
  title: "The Salt Path",
  author: "Raynor Winn",
  cadence: "A few chapters a week · Jess hosts",
  host_intro: "We're reading slowly, no one is late. Open a checkpoint when you reach it.",
  warnings: ["Themes of illness and grief", "Homelessness"],
  checkpoints: [
    { index: 0, label: "Through Chapter 4", open: true,
      prompt: "What did you carry with you from these first pages?" },
    { index: 1, label: "Chapters 5–9", open: false },
    { index: 2, label: "To the end", open: false },
  ],
  notes: [
    { id: "n1", body: "The bit about walking to think — I felt that in my bones." },
    { id: "n2", body: "Took me three sittings. Lurked the thread the whole time. Lovely." },
  ],
};

const TALK_MODES = [
  { key: "note", name: "Voice note", line: "Say it out loud, send it into the room. It's heard, not graded. No recording is kept." },
  { key: "held", name: "Held in silence", line: "Speak, and one matched sister simply listens. No reply expected — being heard is the whole thing." },
  { key: "swap", name: "Turn-and-turn", line: "Three minutes each. You talk, she holds, then you swap. Hold, don't fix." },
];

const CIRCLES = [
  { key: "ttc", name: "The Trying", line: "Two-week waits and the hoping. You're not waiting alone.", sensitive: true },
  { key: "soloparent", name: "Solo by choice or chance", line: "Doing it your way. Honest, no comparison." },
  { key: "creatives", name: "Makers & Menders", line: "For the ones who make things with their hands." },
  { key: "slowmornings", name: "Slow Mornings Club", line: "A quiet start, together. Jess hosts.", club: true },
];

const LIFE_ROOM_SEED = {
  love: "Third date and he asked what I actually want. Nearly fell off my chair.",
  money: "Opened the banking app without the pit in my stomach. Small, but new.",
  health: "Told the GP I was fine. I'm not sure I knew how to say the other thing.",
};

const UK_RESOURCES = [
  { name: "Samaritans", detail: "116 123 · free, any time, day or night" },
  { name: "Shout", detail: "Text SHOUT to 85258 · free, 24/7 text support" },
  { name: "NHS 111", detail: "Call 111 · urgent but not life-threatening" },
  { name: "Mind", detail: "0300 123 3393 · weekdays 9am–6pm" },
];

const FOOTER_LINE =
  "Peer support, not medical advice. Anonymous, 18+. If something here is heavy, we'll always point you to people who can hold it.";

// crude local crisis pre-check (mock — no network). Heavy → route to support.
const CRISIS_CUES = [
  "want to die", "end it", "kill myself", "suicid", "self harm", "self-harm",
  "harm myself", "no point", "can't go on", "hurt myself",
];
function isHeavy(text) {
  const t = (text || "").toLowerCase();
  return CRISIS_CUES.some((w) => t.includes(w));
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ════════════════════════════════════════════════════════════════════════════
function TinyTag({ children }) {
  if (!children) return null;
  return (
    <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.5, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function ReactRow({ postId, reacted, onReact }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
      {REACTIONS.map((k) => {
        const on = reacted === k;
        return (
          <button key={k} onClick={() => onReact(postId, k)} disabled={!!reacted} style={{
            fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            cursor: reacted ? "default" : "pointer",
            padding: "5px 11px", borderRadius: 999, border: `1px solid ${on ? T.gold : T.paperDeep}`,
            background: on ? T.paper : "transparent", color: on ? T.gold : T.muted,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>{on && <Check size={11} />}{k}</button>
        );
      })}
    </div>
  );
}

// the ONE clear primary action a card carries (borrowed from Demo1's PrimaryAction)
function PrimaryAction({ icon: Icon, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", marginTop: "auto", display: "inline-flex", alignItems: "center",
      justifyContent: "center", gap: 8, background: T.ink, color: T.paper, border: "none",
      borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 12, fontWeight: 700,
      letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer",
    }}>
      {Icon ? <Icon size={15} /> : null}{children}
    </button>
  );
}

// the rich card shell — tall, scroll-snapped, peeking (borrowed from Demo1's CardShell)
function CardShell({ room, children }) {
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W,
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 520,
      boxShadow: "0 10px 26px -18px rgba(11,8,5,0.5)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
        <span style={{
          width: 30, height: 30, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.ink, flexShrink: 0,
        }}><room.Icon size={15} /></span>
        <Eyebrow color={room.accent}>{room.name}</Eyebrow>
      </div>
      <Rule mb={14} />
      {children}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CRISIS SHEET (UK resources) — the heavy-text safety route, preserved
// ════════════════════════════════════════════════════════════════════════════
function CrisisSheet({ onClose }) {
  return (
    <Sheet title="You deserve more than a room" eyebrow="Someone is there, right now" tone="plum" onClose={onClose}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
        <ShieldAlert size={20} style={{ color: T.blush, flexShrink: 0, marginTop: 2 }} />
        <Hand size={17} color="#F4EFE3" carve={false}>
          This reads as heavy — and a room of strangers isn't the right shape for it. Nothing was posted; this stays private. These people are there, any time.
        </Hand>
      </div>
      {UK_RESOURCES.map((r) => (
        <div key={r.name} style={{
          display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(244,239,227,0.07)",
          border: "1px solid rgba(244,239,227,0.18)", borderRadius: 10, padding: "11px 13px", marginBottom: 9,
        }}>
          <Phone size={15} style={{ color: T.gold, marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#F4EFE3" }}>{r.name}</div>
            <div style={{ fontFamily: UI, fontSize: 12.5, color: "#CDBBA6" }}>{r.detail}</div>
          </div>
        </div>
      ))}
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BOTTOM SHEET SHELL (borrowed from Demo2's Sheet) — one calm thing at a time
// ════════════════════════════════════════════════════════════════════════════
function Sheet({ title, eyebrow, onClose, children, tone = "ink" }) {
  const headBg = tone === "plum" ? PLUM : T.dusk;
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,8,5,0.42)" }} />
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{
        position: "relative", ...PAPER_BG, backgroundColor: T.paper,
        borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "88%",
        display: "flex", flexDirection: "column", boxShadow: "0 -18px 50px rgba(11,8,5,0.32)",
        borderTop: `1px solid ${T.paperDeep}`,
      }}>
        <div style={{ background: headBg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "10px 18px 14px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(244,239,227,0.4)", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <div>
              {eyebrow ? (
                <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.6, color: T.wax, textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>{eyebrow}</div>
              ) : null}
              <Script size={34} color={T.paper} carve={false}>{title}</Script>
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              width: 34, height: 34, borderRadius: 999, flexShrink: 0,
              background: "rgba(244,239,227,0.12)", border: "1px solid rgba(244,239,227,0.3)",
              color: T.paper, display: "grid", placeItems: "center", cursor: "pointer",
            }}><X size={17} /></button>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "16px 18px 26px" }}>{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPOSE BODY (the ONE primary action) — kind-by-design, crisis pre-check
// ════════════════════════════════════════════════════════════════════════════
function ComposeBody({ onCrisis, onPosted, prompt }) {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState("open"); // open by default; poster may switch to reactions-only
  const send = () => {
    const t = body.trim();
    if (!t) return;
    if (isHeavy(t)) { onCrisis(); return; }   // heavy → route to support, never posts
    onPosted(t, mode);
  };
  return (
    <div>
      {prompt && (
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <Eyebrow mb={5}>Today's question</Eyebrow>
          <Hand size={18} color={T.ink}>{prompt}</Hand>
        </div>
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, 600))}
        placeholder="Say it plainly — silly to serious, no names."
        style={{
          width: "100%", minHeight: 120, resize: "none", fontFamily: SERIF, fontSize: 18,
          lineHeight: 1.5, color: T.ink, background: T.paperHi, border: `1px solid ${T.paperDeep}`,
          borderRadius: 12, padding: "13px 14px", boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginTop: 12 }}>
        <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>Replies:</span>
        <button onClick={() => setMode("open")} style={togglePill(mode === "open")}>
          <Unlock size={12} /> Open to comments
        </button>
        <button onClick={() => setMode("reaction")} style={togglePill(mode === "reaction")}>
          <Lock size={12} /> Reactions only
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, color: T.muted }}>
        <Sparkles size={13} style={{ color: T.gold, flexShrink: 0 }} />
        <span style={{ fontFamily: UI, fontSize: 11, lineHeight: 1.5 }}>
          Jess keeps it anonymous and kind. Peer support, not medical advice.
        </span>
      </div>
      <button onClick={send} disabled={!body.trim()} style={{
        width: "100%", marginTop: 16, display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 8, background: T.crimson, color: T.paper, border: "none", borderRadius: 14, padding: "15px",
        fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
        cursor: body.trim() ? "pointer" : "default", opacity: body.trim() ? 1 : 0.5,
      }}>
        <Send size={16} /> Share with the room
      </button>
    </div>
  );
}

function togglePill(on) {
  return {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999,
    cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700,
    background: on ? T.ink : "transparent", color: on ? T.paper : T.muted,
    border: `1px solid ${on ? T.ink : T.paperDeep}`,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// COMMENT ITEM (open, flat, anonymous, no counts; Jess styled distinctly)
// ════════════════════════════════════════════════════════════════════════════
function CommentItem({ cm }) {
  if (cm.by === "jess") {
    return (
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: T.wax, border: `1px solid ${T.gold}`, borderRadius: 10, padding: "10px 12px", marginBottom: 7 }}>
        <span style={{ width: 24, height: 24, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.gold}`, color: T.gold, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <Sparkles size={13} />
        </span>
        <div>
          <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 3 }}>Jess · here with you</div>
          <Hand size={15} color={T.ink}>{cm.body}</Hand>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 12px", marginBottom: 7 }}>
      <Hand size={15} color={T.inkSoft}>{cm.body}</Hand>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOM SHEET BODIES — each room opens calm in a bottom sheet (progressive disclosure)
// ════════════════════════════════════════════════════════════════════════════
function LoungeBody({ onCrisis }) {
  const [posts, setPosts] = useState(LOUNGE_POSTS);
  const [reacted, setReacted] = useState({});   // postId -> reaction label
  const [openFor, setOpenFor] = useState(null);  // which post's comment box is open
  const [draft, setDraft] = useState("");

  const react = (pid, k) => setReacted((s) => (s[pid] ? s : { ...s, [pid]: k }));

  const addComment = (pid) => {
    const t = draft.trim();
    if (!t) return;
    if (isHeavy(t)) { onCrisis(); return; }
    setPosts((P) => P.map((p) => p.id === pid
      ? { ...p, comments: [...p.comments, { id: "n" + Date.now(), body: t }] } : p));
    setDraft(""); setOpenFor(null);
  };

  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 16 }}>
        Spill it — silly to serious, kind, no names. Comments are open by default; lurking is welcome.
      </Hand>
      {posts.map((p) => {
        const isOpen = p.mode === "open";
        return (
          <div key={p.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7, gap: 8 }}>
              <Eyebrow color={T.muted}>{p.domain}</Eyebrow>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted }}>
                {isOpen ? <><MessageCircle size={11} /> Open</> : <><Lock size={11} /> Reactions only</>}
              </span>
            </div>
            <Hand size={19} color={T.ink} style={{ marginBottom: 12 }}>{p.body}</Hand>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <ReactRow postId={p.id} reacted={reacted[p.id]} onReact={react} />
              <button aria-label="Report this post" title="Report" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "inline-flex", flexShrink: 0 }}>
                <Flag size={13} />
              </button>
            </div>

            {isOpen ? (
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.paperDeep}`, paddingTop: 10 }}>
                {p.comments.length === 0
                  ? <Hand size={14} color={T.muted}>No replies yet. A kind word goes a long way.</Hand>
                  : p.comments.map((cm) => <CommentItem key={cm.id} cm={cm} />)}
                {openFor === p.id ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 6 }}>A kind word — you don't have to fix it.</div>
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 280))} placeholder="A kind word…"
                      style={{ width: "100%", minHeight: 56, resize: "none", fontFamily: SERIF, fontSize: 16, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px", boxSizing: "border-box" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{draft.length}/280 · Jess screens for kindness</span>
                      <button onClick={() => addComment(p.id)} style={inkBtnSm}><Send size={13} /> Send kindly</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setOpenFor(p.id); setDraft(""); }} style={ghostBtnSm}><Plus size={13} /> Add a comment</button>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 10, fontFamily: UI, fontSize: 11.5, color: T.muted, display: "flex", alignItems: "center", gap: 6 }}>
                <Lock size={12} /> The poster turned comments off here — reactions welcome.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EchoBody() {
  const [reacted, setReacted] = useState({});
  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 16 }}>
        Anonymous one-liners from across the cycle. Hold a line — it fades in two days.
      </Hand>
      {ECHOES.map((e) => (
        <div key={e.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 16px", marginBottom: 12 }}>
          <Hand size={20} color={T.ink}>“{e.body}”</Hand>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 11 }}>
            {REACTIONS.slice(0, 3).map((r) => {
              const on = reacted[e.id] === r;
              return (
                <button key={r} onClick={() => setReacted((s) => (s[e.id] ? s : { ...s, [e.id]: r }))} disabled={!!reacted[e.id]} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999,
                  cursor: reacted[e.id] ? "default" : "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600,
                  background: on ? T.paper : "transparent", color: on ? T.gold : T.muted, border: `1px solid ${on ? T.gold : T.paperDeep}`,
                }}>{on && <Check size={11} />}{r}</button>
              );
            })}
            <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10.5, color: T.muted, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} /> fades in {e.fadeH}h
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LighterBody() {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [left, setLeft] = useState(GM_ROUND.seconds);
  useEffect(() => {
    if (revealed) return;
    const id = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(id), setRevealed(true), 0) : s - 1)), 1000);
    return () => clearInterval(id);
  }, [revealed]);
  return (
    <div>
      <div style={{ background: PLUM, borderRadius: 16, padding: "18px 16px", color: "#F4EFE3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 999, background: "rgba(244,239,227,0.1)", color: T.gold, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={15} /></span>
          <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess is hosting</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: revealed ? T.sage : "#CDBBA6" }}>
            <Clock size={13} /> {revealed ? "round closed" : `closes in 0:${String(left).padStart(2, "0")}`}
          </span>
        </div>
        <Hand size={15} color="#CDBBA6" carve={false} style={{ marginBottom: 8 }}>{GM_ROUND.intro}</Hand>
        <Script size={26} color="#F4EFE3" carve={false} style={{ marginBottom: 14 }}>{GM_ROUND.prompt}</Script>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {GM_ROUND.options.map((o) => {
            const on = picked === o;
            return (
              <button key={o} onClick={() => setPicked(o)} disabled={revealed && !on} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 10px",
                borderRadius: 11, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: revealed ? "default" : "pointer",
                background: on ? "#F4EFE3" : "rgba(244,239,227,0.08)", color: on ? PLUM : "#F4EFE3",
                border: `1px solid ${on ? "#F4EFE3" : "rgba(244,239,227,0.25)"}`,
              }}>{on && <Check size={13} />}{o}</button>
            );
          })}
        </div>
        {picked && !revealed && <Hand size={14} color="#CDBBA6" carve={false} style={{ marginTop: 12 }}>Answer's in. The room reveals together when the round closes.</Hand>}
        {revealed && (
          <div style={{ marginTop: 14, background: "rgba(244,239,227,0.07)", border: "1px solid rgba(244,239,227,0.18)", borderRadius: 11, padding: "12px 13px" }}>
            <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.gold, textTransform: "uppercase", fontWeight: 700, marginBottom: 5 }}>The room, together</div>
            <Hand size={16} color="#F4EFE3" carve={false}>{GM_ROUND.reveal}</Hand>
          </div>
        )}
      </div>
      <Hand size={13} color={T.muted} style={{ marginTop: 14, textAlign: "center" }}>No winners, no scores — just a lighter beat in the day.</Hand>
    </div>
  );
}

function LibraryBody() {
  const [reached, setReached] = useState(0);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState(LIBRARY.notes);
  return (
    <div>
      <Script size={30} style={{ marginBottom: 2 }}>{LIBRARY.title}</Script>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>{LIBRARY.author} · {LIBRARY.cadence}</div>
      <Hand size={16} color={T.inkSoft} style={{ marginBottom: 14 }}>{LIBRARY.host_intro}</Hand>

      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 13px", marginBottom: 16 }}>
        <Eyebrow color={T.muted} mb={5}>A gentle heads-up</Eyebrow>
        {LIBRARY.warnings.map((w) => <div key={w} style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>· {w}</div>)}
      </div>

      <Eyebrow color={T.gold} mb={10}>Checkpoints — open one when you reach it</Eyebrow>
      {LIBRARY.checkpoints.map((cp) => {
        const unlocked = reached >= cp.index;
        return (
          <div key={cp.index} style={{ background: T.paperHi, border: `1px solid ${unlocked ? T.gold : T.paperDeep}`, borderRadius: 12, padding: "13px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {unlocked ? <MessageCircle size={14} style={{ color: T.gold }} /> : <Lock size={14} style={{ color: T.muted }} />}
              <div style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: unlocked ? T.ink : T.muted }}>{cp.label}</div>
            </div>
            {unlocked ? (
              <div style={{ marginTop: 10 }}>
                {cp.prompt && <Hand size={16} color={T.inkSoft} style={{ marginBottom: 10 }}>{cp.prompt}</Hand>}
                {notes.map((n) => (
                  <div key={n.id} style={{ padding: "6px 0", borderTop: `1px solid ${T.paperDeep}` }}><Hand size={15} color={T.inkSoft}>{n.body}</Hand></div>
                ))}
                <textarea value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 600))} placeholder="A few words — lurking counts too."
                  style={{ width: "100%", minHeight: 52, resize: "none", fontFamily: SERIF, fontSize: 16, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px", boxSizing: "border-box", marginTop: 8 }} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                  <button onClick={() => { if (draft.trim()) { setNotes((s) => [...s, { id: "n" + Date.now(), body: draft.trim() }]); setDraft(""); } }} style={inkBtnSm}><Send size={13} /> Add a note</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 8 }}>Spoiler-safe: the discussion opens once you've read this far.</div>
                <button onClick={() => setReached(cp.index)} style={ghostBtnSm}>I've read this far — open it</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TalkBody() {
  const [mode, setMode] = useState("note");
  const m = TALK_MODES.find((x) => x.key === mode);
  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 14 }}>Being heard, not advised. Three ways to be held out loud. No recording, ever.</Hand>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {TALK_MODES.map((a) => {
          const on = a.key === mode;
          return (
            <button key={a.key} onClick={() => setMode(a.key)} style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "8px 6px", borderRadius: 999, fontFamily: UI, fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: on ? T.ink : "transparent", color: on ? T.paper : T.muted, border: `1px solid ${on ? T.ink : T.paperDeep}`,
            }}>{a.name}</button>
          );
        })}
      </div>
      <div style={{ background: PLUM, borderRadius: 16, padding: "18px 16px", color: "#F4EFE3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, background: "rgba(244,239,227,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#F4EFE3" }}><Mic size={18} /></span>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: "#F4EFE3" }}>{m.name}</div>
        </div>
        <Hand size={16} color="#E6D6E8" carve={false}>{m.line}</Hand>
      </div>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          <Phone size={13} style={{ color: T.gold }} />
          <Eyebrow color={T.muted}>Someone is there, right now</Eyebrow>
        </div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>Samaritans 116 123 · NHS 111 · Shout 85258 · Mind 0300 123 3393</div>
      </div>
    </div>
  );
}

function LifeRoomBody({ room, onCrisis, onCompose }) {
  return (
    <div>
      <Hand size={16} color={T.inkSoft} style={{ marginBottom: 14 }}>
        {room.key === "health"
          ? "The clinical room — accurate, NHS-grounded. One room here, not the whole house. Ask a question, read what others learned, never a diagnosis."
          : "Ask the room, kindly — the questions you'd never say aloud. Anonymous, supportive, no judgment. Pull up a chair."}
      </Hand>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 16px", marginBottom: 14 }}>
        <Eyebrow color={T.muted} mb={6}>From the room</Eyebrow>
        <Hand size={17} color={T.ink}>{LIFE_ROOM_SEED[room.key] || "Quiet in here so far — leave the first word. Someone always comes by."}</Hand>
      </div>
      <button onClick={onCompose} style={ghostBtnSm}><Plus size={13} /> Add to {room.name}</button>
    </div>
  );
}

function CirclesBody({ onCompose }) {
  const [joined, setJoined] = useState({});
  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 16 }}>
        Smaller rooms by what you're living and what you love. Lurk freely; join the ones that are yours. No counts, no pressure.
      </Hand>
      {CIRCLES.map((c) => {
        const isIn = !!joined[c.key];
        return (
          <div key={c.key} style={{ background: T.paperHi, border: `1px solid ${isIn ? T.gold : T.paperDeep}`, borderRadius: 14, padding: "14px 15px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Script size={21} color={T.ink}>{c.name}</Script>
              {c.club && <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10, color: T.muted, display: "inline-flex", alignItems: "center", gap: 3 }}><HeartHandshake size={11} /> Jess hosts</span>}
              {c.sensitive && <span style={{ marginLeft: c.club ? 0 : "auto", fontFamily: UI, fontSize: 10, color: T.muted, display: "inline-flex", alignItems: "center", gap: 3 }}><Lock size={11} /> sensitive</span>}
            </div>
            <Hand size={16} color={T.muted} style={{ marginBottom: 10 }}>{c.line}</Hand>
            {isIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.gold }}><Check size={13} /> You're in</span>
                <button onClick={() => setJoined((s) => ({ ...s, [c.key]: false }))} style={{ ...ghostBtnSm, border: "none", color: T.muted }}>Leave</button>
                <button onClick={onCompose} style={{ ...ghostBtnSm, marginLeft: "auto" }}><Plus size={13} /> Add</button>
              </div>
            ) : (
              <button onClick={() => setJoined((s) => ({ ...s, [c.key]: true }))} style={ghostBtnSm}>
                {c.sensitive ? <><ShieldAlert size={13} /> Join — I understand</> : <><Users size={13} /> Join this circle</>}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// room key -> sheet content
function RoomSheetBody({ roomKey, onCrisis, onCompose }) {
  if (roomKey === "lounge") return <LoungeBody onCrisis={onCrisis} />;
  if (roomKey === "echo") return <EchoBody />;
  if (roomKey === "lighter") return <LighterBody />;
  if (roomKey === "library") return <LibraryBody />;
  if (roomKey === "talk") return <TalkBody />;
  if (roomKey === "circles") return <CirclesBody onCompose={onCompose} />;
  const room = ROOMS.find((r) => r.key === roomKey);
  return <LifeRoomBody room={room} onCrisis={onCrisis} onCompose={onCompose} />;
}

// the eyebrow each room sheet carries
const ROOM_SHEET_EYEBROW = {
  lounge: "Spill it — silly to serious",
  echo: "Held by the room, fades in 48h",
  lighter: "Jess is hosting · no scores",
  library: "A slow read, together",
  talk: "Heard, not advised",
  circles: "Small rooms, yours to join",
  love: "Anonymous · no judgment",
  money: "Honest · no comparison",
  health: "NHS-grounded · never a diagnosis",
};

// ════════════════════════════════════════════════════════════════════════════
// ROOM CARD (the hero card in the slider) — a calm preview + ONE primary action
// ════════════════════════════════════════════════════════════════════════════
function RoomCard({ room, onEnter }) {
  return (
    <CardShell room={room}>
      <Script size={30} style={{ marginBottom: 6 }}>{room.name}</Script>
      <Hand size={16} color={T.muted} style={{ marginBottom: 16 }}>{room.line}</Hand>

      {/* a calm, count-free preview of what's inside */}
      <div style={{ flex: 1 }}>
        <RoomPreview room={room} />
      </div>

      <PrimaryAction icon={room.Icon} onClick={() => onEnter(room.key)}>
        {room.key === "lounge" ? "Step into the Lounge"
          : room.key === "echo" ? "Read the wall"
          : room.key === "lighter" ? "Join the round"
          : room.key === "library" ? "Open the read"
          : room.key === "talk" ? "Talk it out"
          : room.key === "circles" ? "Find your circle"
          : "Enter the room"}
      </PrimaryAction>
    </CardShell>
  );
}

// a quiet preview — first lines only (progressive disclosure; the room opens in a sheet)
function RoomPreview({ room }) {
  if (room.key === "lounge") {
    return (
      <div>
        <Eyebrow mb={9}>A few voices today</Eyebrow>
        {LOUNGE_POSTS.slice(0, 2).map((p) => (
          <div key={p.id} style={{ borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 11, marginBottom: 12 }}>
            <TinyTag>{p.domain}</TinyTag>
            <Hand size={15} color={T.inkSoft} style={{ marginTop: 3 }}>{p.body.length > 96 ? p.body.slice(0, 96) + "…" : p.body}</Hand>
          </div>
        ))}
      </div>
    );
  }
  if (room.key === "echo") {
    return (
      <div>
        <Eyebrow mb={9}>On the wall now</Eyebrow>
        {ECHOES.slice(0, 3).map((e) => (
          <div key={e.id} style={{ marginBottom: 10 }}>
            <Hand size={16} color={T.inkSoft}>“{e.body}”</Hand>
            <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={10} /> fades in {e.fadeH}h</div>
          </div>
        ))}
      </div>
    );
  }
  if (room.key === "lighter") {
    return (
      <div>
        <Eyebrow mb={9} color={T.gold}>Jess's round · tonight</Eyebrow>
        <Hand size={18} color={T.ink} style={{ marginBottom: 10 }}>{GM_ROUND.prompt}</Hand>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {GM_ROUND.options.map((o) => (
            <span key={o} style={{ fontFamily: SERIF, fontSize: 13, color: T.inkSoft, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 11px" }}>{o}</span>
          ))}
        </div>
      </div>
    );
  }
  if (room.key === "library") {
    return (
      <div>
        <Eyebrow mb={9} color={T.sage}>This season's read</Eyebrow>
        <div style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink }}>{LIBRARY.title}</div>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 2, marginBottom: 10 }}>{LIBRARY.author}</div>
        <Hand size={15} color={T.muted}>{LIBRARY.host_intro}</Hand>
      </div>
    );
  }
  if (room.key === "talk") {
    return (
      <div>
        <Eyebrow mb={9}>Three ways to be held</Eyebrow>
        {TALK_MODES.map((m) => (
          <div key={m.key} style={{ display: "flex", gap: 9, alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.gold, flexShrink: 0 }} />
            <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft }}>{m.name}</div>
          </div>
        ))}
      </div>
    );
  }
  if (room.key === "circles") {
    return (
      <div>
        <Eyebrow mb={9}>A few circles</Eyebrow>
        {CIRCLES.slice(0, 3).map((c) => (
          <div key={c.key} style={{ marginBottom: 9 }}>
            <div style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 700, fontSize: 16, color: T.ink }}>{c.name}</div>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>{c.line}</div>
          </div>
        ))}
      </div>
    );
  }
  // life rooms (love / money / health)
  return (
    <div>
      <Eyebrow mb={9}>From the room</Eyebrow>
      <div style={{ borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 12 }}>
        <Hand size={16} color={T.inkSoft}>{LIFE_ROOM_SEED[room.key] || "Quiet in here so far — leave the first word."}</Hand>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE SLIDER SPINE (borrowed from Demo1's Slider) — swipe through rooms, peek
// ════════════════════════════════════════════════════════════════════════════
function RoomSlider({ onEnter }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const last = ROOMS.length - 1;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(el.scrollLeft / (CARD_W + GAP));
        setActive(Math.max(0, Math.min(last, i)));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  return (
    <div>
      {/* segmented label rail — which room you're peeking at */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 20px 12px", scrollbarWidth: "none" }} className="cr-rail">
        <style>{`.cr-rail::-webkit-scrollbar{display:none}.cr-track::-webkit-scrollbar{display:none}`}</style>
        {ROOMS.map((r, i) => (
          <button key={r.key} onClick={() => goTo(i)} style={{
            flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
            border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
            fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
          }}>{r.name}</button>
        ))}
      </div>

      {/* the swipeable track — real CSS scroll-snap, next card peeks */}
      <div ref={trackRef} className="cr-track" style={{
        display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
        padding: "0 20px 4px", scrollbarWidth: "none",
      }}>
        {ROOMS.map((room) => <RoomCard key={room.key} room={room} onEnter={onEnter} />)}
        <div style={{ flex: `0 0 ${COL - CARD_W - 20}px` }} aria-hidden />
      </div>

      {/* prev / dots / next */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 20px 0" }}>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} style={navBtn(active === 0)} aria-label="Previous room">
          <ChevronLeft size={18} />
        </button>
        <div style={{ display: "flex", gap: 7 }}>
          {ROOMS.map((r, i) => (
            <button key={r.key} onClick={() => goTo(i)} aria-label={r.name} style={{
              width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
              background: i === active ? T.crimson : T.paperDeep, cursor: "pointer", transition: "width .2s",
            }} />
          ))}
        </div>
        <button onClick={() => goTo(active + 1)} disabled={active === last} style={navBtn(active === last)} aria-label="Next room">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
    color: disabled ? T.paperDeep : T.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// shared small button styles
// ════════════════════════════════════════════════════════════════════════════
const inkBtnSm = { display: "inline-flex", alignItems: "center", gap: 6, background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "8px 13px", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" };
const ghostBtnSm = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "8px 13px", fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer" };

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function CommunityRedesign1() {
  useEditorialFonts();

  // sheet state: null | "compose" | "crisis" | a room key
  const [sheet, setSheet] = useState(null);
  // a tiny, count-free confirmation after sharing (no scoreboard, just warmth)
  const [shared, setShared] = useState(false);

  const openCompose = () => setSheet("compose");
  const openCrisis = () => setSheet("crisis");
  const close = () => setSheet(null);

  const onPosted = () => {
    setSheet(null);
    setShared(true);
  };
  useEffect(() => {
    if (!shared) return;
    const id = setTimeout(() => setShared(false), 4000);
    return () => clearTimeout(id);
  }, [shared]);

  const roomMeta = sheet && ROOMS.find((r) => r.key === sheet);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />

      {/* required top banner — EXACT */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Community · Redesign preview — mock data
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", overflow: "hidden", minHeight: "100vh" }}>
        {/* ── CALM HERO ──────────────────────────────────────────────────── */}
        <header style={{ padding: "26px 20px 6px" }}>
          <Eyebrow mb={8}>{MASTHEAD.eyebrow}</Eyebrow>
          <Script size={44} style={{ marginBottom: 8 }}>{MASTHEAD.title}</Script>
          <Hand size={18} color={T.inkSoft} style={{ marginBottom: 14 }}>{MASTHEAD.subtitle}</Hand>

          {/* ambient presence + a folded, count-free belonging line (no scoreboard) */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, marginTop: 6, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, fontWeight: 600, lineHeight: 1.5 }}>{PRESENCE}</div>
              <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 2 }}>{SEASON_LINE}</div>
            </div>
          </div>
        </header>

        {/* the ONE focal point — today's question + the ONE primary action */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 18, padding: "18px 18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <Sparkles size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess · question of the day</span>
            </div>
            <Script size={28} color={T.paper} carve={false} style={{ marginBottom: 14 }}>{QOTD.text}</Script>

            <button onClick={openCompose} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
              background: T.crimson, color: T.paper, border: "none", borderRadius: 14, padding: "15px",
              cursor: "pointer", boxShadow: "0 6px 18px rgba(188,46,39,0.25)",
            }}>
              <Feather size={17} />
              <span style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Share a line</span>
            </button>

            {shared ? (
              <div style={{ fontFamily: UI, fontSize: 12, color: T.wax, marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Check size={13} /> Shared, anonymously. You're in good company today.
              </div>
            ) : (
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.wax, marginTop: 12, opacity: 0.85 }}>
                A line is plenty. No names, no count of who joins in.
              </div>
            )}
          </div>

          {/* a quiet read of the room — first answers only (progressive disclosure) */}
          <button onClick={() => setSheet("lounge")} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            background: "transparent", border: "none", borderBottom: `1px solid ${T.paperDeep}`,
            padding: "14px 2px", cursor: "pointer", marginTop: 16,
          }}>
            <span style={{ textAlign: "left" }}>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1, color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 2 }}>The room, today</span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>“{QOTD.answers[0]}”</span>
            </span>
            <ChevronRight size={18} color={T.muted} style={{ flexShrink: 0 }} />
          </button>
        </div>

        {/* ── THE SPINE — the hero card slider for the rooms ───────────────── */}
        <div style={{ marginTop: 22 }}>
          <div style={{ padding: "0 20px 12px" }}>
            <Eyebrow mb={6}>The rooms — swipe through, step into any one</Eyebrow>
            <Hand size={15} color={T.muted}>One card, one room. The next one peeks at the edge.</Hand>
          </div>
          <RoomSlider onEnter={(key) => setSheet(key)} />
        </div>

        {/* footer voice — identity lines, preserved */}
        <footer style={{ textAlign: "center", padding: "30px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>{FOOTER_LINE}</div>
        </footer>

        {/* ── THE BOTTOM SHEETS — one calm thing at a time ─────────────────── */}
        {sheet === "compose" && (
          <Sheet title="Share a line" eyebrow="Anonymous · kind by design" onClose={close}>
            <ComposeBody onCrisis={openCrisis} onPosted={onPosted} prompt={QOTD.text} />
          </Sheet>
        )}
        {sheet === "crisis" && <CrisisSheet onClose={close} />}
        {roomMeta && (
          <Sheet title={roomMeta.name} eyebrow={ROOM_SHEET_EYEBROW[roomMeta.key]} onClose={close}>
            <RoomSheetBody roomKey={roomMeta.key} onCrisis={openCrisis} onCompose={openCompose} />
          </Sheet>
        )}
      </div>
    </div>
  );
}
