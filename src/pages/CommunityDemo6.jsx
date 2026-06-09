// CommunityDemo6 — THE PRODUCTION CANDIDATE · Rooms + Tabs HYBRID (~65 / 35)
// ─────────────────────────────────────────────────────────────────────────────
// Halli's chosen direction: rooms-as-doors is the PRIMARY home (the easy jump-in);
// once you're INSIDE a room, a sticky TAB bar switches between rooms fast (and a
// Home pill returns you to the doors). Doors to enter, tabs to move around.
//
// Adds the COMMENTS feature: the poster chooses per post whether comments are ON
// (open, flat, anonymous, readable by all — lurking first-class) or OFF
// (reaction-only). Kind-by-design compose: a kindness prompt, a "peer support not
// medical advice" line, a char limit, and a crisis pre-check that routes to UK
// support instead of posting. No counts anywhere.
//
// Plus a light "Jess as games master": a gentle timed round Jess hosts — one
// shared prompt, a generous countdown, everyone answers, then Jess reveals only
// the AGGREGATE ("most of you said…"). No winner, no score.
//
// Same palette / PAPER_BG / Ephesis+Cormorant fonts as all the other demos.
// Mock data + useState only, no entities. Lucide/SVG only, no emoji. 18+, anon.
import { useState, useEffect } from "react";
import {
  Grid2x2, ArrowLeft, MessageCircle, Send, Check, Lock, Unlock, Sparkles, Clock,
  ShieldAlert, Phone, Mic, Repeat, Waves, Feather, Plus, HeartHandshake,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  MASTHEAD, PRESENCE, QOTD, ROOMS, ECHOES, ECHO_REACTIONS, LOUNGE,
  THIS_OR_THAT, HOT_TAKES, STORY_SEED, SAMPLE_ENTRY, FOUR_LIVES,
  WITNESS, AUDIO_MODES, AUDIO_NOTE, crisisCheck, UK_RESOURCES, FOOTER_LINE,
  COMMENTS_BY_POST, COMMENT_DISCLAIMER, COMMENT_KINDNESS, COMMENT_MAX, COMMENT_EMPTY,
  GM_ROUND,
} from "./communityShared";

const PLUM = "#241a26"; // the one permitted dark surface (Witness / Talk)

// the core rooms = the in-room TAB bar (the 35%)
const ROOM_TABS = [
  { key: "lounge", name: "Lounge",  Icon: MessageCircle },
  { key: "echo",   name: "Echo",    Icon: Waves },
  { key: "games",  name: "Lighter", Icon: Sparkles },
  { key: "share",  name: "Share",   Icon: Feather },
  { key: "talk",   name: "Talk",    Icon: Mic },
];
// the life rooms = extra doors on the home (open into a light themed view)
const LIFE_DOORS = ROOMS.filter((r) => ["love", "money", "style", "health"].includes(r.key));

export default function CommunityDemo6() {
  useEditorialFonts();
  const [view, setView] = useState("home"); // "home" (doors) | a room key

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Rooms + Tabs hybrid — production candidate · mock data" />
      <div style={{ maxWidth: 430, margin: "0 auto", padding: view === "home" ? "30px 18px 60px" : "0 0 60px" }}>
        {view === "home" ? <Home onEnter={setView} /> : <RoomShell view={view} onNav={setView} />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOME — the doors (the 65%): masthead · presence · QOTD welcome-mat · doors grid
// ════════════════════════════════════════════════════════════════════════════
function Home({ onEnter }) {
  const [picked, setPicked] = useState(null);
  const allDoors = [...ROOM_TABS.map((t) => {
    const r = ROOMS.find((x) => x.key === t.key) || {};
    return { key: t.key, name: t.name === "Lighter" ? "The Lighter Side" : `The ${t.name}`, Icon: t.Icon, line: doorLine(t.key), hint: r.hint || "open" };
  }), ...LIFE_DOORS.map((r) => ({ key: r.key, name: r.name, Icon: r.Icon, line: r.line, hint: r.hint }))];

  return (
    <>
      <header style={{ textAlign: "center", marginBottom: 18 }}>
        <Eyebrow mb={8} color={T.muted}>{MASTHEAD.eyebrow}</Eyebrow>
        <Script size={46} carve>{MASTHEAD.title}</Script>
        <Hand size={17} color={T.inkSoft} carve={false} style={{ marginTop: 8 }}>{MASTHEAD.subtitle}</Hand>
      </header>

      {/* ambient presence — aggregate, never named */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "center", marginBottom: 18 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage }} />
        <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft }}>
          <strong style={{ color: T.ink }}>{PRESENCE.count} women</strong> {PRESENCE.line}
        </span>
      </div>

      {/* QOTD welcome-mat */}
      <div style={cardStyle}>
        <Eyebrow color={T.muted}>Question of the day</Eyebrow>
        <div style={{ margin: "4px 0 12px" }}><Hand size={22} color={T.ink}>{QOTD.question}</Hand></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {QOTD.options.map((o) => {
            const on = picked === o;
            return (
              <button key={o} onClick={() => setPicked(o)} style={chip(on)}>
                {on && <Check size={13} />}{o}
              </button>
            );
          })}
        </div>
        {picked && <Hand size={15} color={T.inkSoft} style={{ marginTop: 11 }}>Most women said: {QOTD.norm}. You're in good company.</Hand>}
      </div>

      {/* the doors */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "22px 0 8px" }}>
        <Grid2x2 size={15} style={{ color: T.gold }} />
        <Eyebrow color={T.muted}>Choose a door — or flick between rooms once you're in</Eyebrow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {allDoors.map((d) => (
          <button key={d.key} onClick={() => onEnter(d.key)} style={doorStyle}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: T.gold, borderRadius: "12px 0 0 12px" }} />
            <span style={{ width: 30, height: 30, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.ink, marginBottom: 8 }}>
              <d.Icon size={16} />
            </span>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.15 }}>{d.name}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4, marginTop: 3, flex: 1 }}>{d.line}</div>
            <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginTop: 8 }}>{d.hint}</div>
          </button>
        ))}
      </div>

      <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.65, margin: "22px auto 0", maxWidth: 380 }}>{FOOTER_LINE}</p>
      <div style={{ marginTop: 18 }}><EditorialFooter /></div>
    </>
  );
}

function doorLine(key) {
  return ({
    lounge: "Vent, spill it, be heard — silly to serious.",
    echo: "Anonymous one-liners that fade in two days.",
    games: "A gentle round Jess is hosting — fun, no winners.",
    share: "One entry, four lives — or hand it to a witness.",
    talk: "Say it out loud — voice notes & turn-based talk.",
  })[key] || "";
}

// ════════════════════════════════════════════════════════════════════════════
// ROOM SHELL — full-screen room with the sticky TAB bar (the 35%) + Home pill
// ════════════════════════════════════════════════════════════════════════════
function RoomShell({ view, onNav }) {
  const isCore = ROOM_TABS.some((t) => t.key === view);
  const life = ROOMS.find((r) => r.key === view);
  return (
    <>
      {/* sticky room nav: Home pill + the room tabs */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(244,239,227,0.96)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.paperDeep}`, padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", alignItems: "center" }}>
          <button onClick={() => onNav("home")} style={navPill(false, true)}><ArrowLeft size={13} /> Doors</button>
          {ROOM_TABS.map((t) => {
            const on = t.key === view;
            return (
              <button key={t.key} onClick={() => onNav(t.key)} style={navPill(on)}>
                <t.Icon size={13} /> {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 18px 0" }}>
        {view === "lounge" && <LoungeRoom />}
        {view === "echo"   && <EchoRoom />}
        {view === "games"  && <GamesRoom />}
        {view === "share"  && <ShareRoom />}
        {view === "talk"   && <TalkRoom />}
        {!isCore && life   && <LifeRoom room={life} />}
      </div>
    </>
  );
}

// ── LOUNGE — the COMMENTS feature centrepiece ────────────────────────────────
function LoungeRoom() {
  const [lists, setLists] = useState(() => JSON.parse(JSON.stringify(COMMENTS_BY_POST)));
  const [openFor, setOpenFor] = useState(null);   // which post's comment box is open
  const [draft, setDraft] = useState("");
  const [crisisFor, setCrisisFor] = useState(null);
  const [reacted, setReacted] = useState({});      // postId -> reaction label
  const [myMode, setMyMode] = useState("reactions"); // my new post's comments mode

  const addComment = (pid) => {
    const t = draft.trim();
    if (!t) return;
    if (crisisCheck(t)) { setCrisisFor(pid); return; }
    setLists((L) => ({ ...L, [pid]: { ...L[pid], list: [...L[pid].list, { id: "n" + Date.now(), body: t }] } }));
    setDraft(""); setOpenFor(null);
  };

  return (
    <>
      <RoomHead title="The Lounge" sub="Spill it — silly to serious, kind, no names. You choose if a post is open to comments." />

      {/* your-own composer with the comments on/off toggle (the poster's choice) */}
      <div style={cardStyle}>
        <Eyebrow color={T.muted}>Say something — Jess keeps it anonymous</Eyebrow>
        <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "10px 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "8px 0 10px" }}>
          What's true for you right now…
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>When you post, replies are:</span>
          <button onClick={() => setMyMode("reactions")} style={togglePill(myMode === "reactions")}><Lock size={12} /> Reactions only</button>
          <button onClick={() => setMyMode("open")} style={togglePill(myMode === "open")}><Unlock size={12} /> Open to comments</button>
        </div>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 8 }}>{COMMENT_DISCLAIMER}</div>
      </div>

      {/* the feed — each post shows its comment mode */}
      {LOUNGE.map((p) => {
        const c = lists[p.id] || { open: false, list: [] };
        return (
          <div key={p.id} style={{ ...cardStyle, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Eyebrow color={T.muted}>{p.domain}</Eyebrow>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted }}>
                {c.open ? <><MessageCircle size={11} /> Open to comments</> : <><Lock size={11} /> Reactions only</>}
              </span>
            </div>
            <Hand size={19} color={T.ink}>{p.body}</Hand>

            {/* kind reactions (always available, no counts) */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {ECHO_REACTIONS.map((r) => {
                const on = reacted[p.id] === r;
                return <button key={r} onClick={() => setReacted((s) => ({ ...s, [p.id]: r }))} disabled={!!reacted[p.id]} style={reactPill(on)}>{on && <Check size={11} />}{r}</button>;
              })}
            </div>

            {/* comments — visible to all (lurking), flat, no counts */}
            {c.open ? (
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.paperDeep}`, paddingTop: 10 }}>
                {c.list.length === 0
                  ? <Hand size={14} color={T.muted}>{COMMENT_EMPTY}</Hand>
                  : c.list.map((cm) => (
                      <div key={cm.id} style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 12px", marginBottom: 7 }}>
                        <Hand size={15} color={T.inkSoft}>{cm.body}</Hand>
                      </div>
                    ))}
                {crisisFor === p.id ? (
                  <CrisisCard onClose={() => { setCrisisFor(null); setOpenFor(null); setDraft(""); }} />
                ) : openFor === p.id ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 6 }}>{COMMENT_KINDNESS}</div>
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value.slice(0, COMMENT_MAX))} placeholder="A kind word…"
                      style={{ width: "100%", minHeight: 56, resize: "none", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px", boxSizing: "border-box" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{draft.length}/{COMMENT_MAX}</span>
                      <button onClick={() => addComment(p.id)} style={inkBtnSm}><Send size={13} /> Send kindly</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setOpenFor(p.id); setDraft(""); }} style={ghostBtnSm}><Plus size={13} /> Add a kind word</button>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 10, fontFamily: UI, fontSize: 11.5, color: T.muted, display: "flex", alignItems: "center", gap: 6 }}>
                <Lock size={12} /> Comments are off for this one — reactions welcome.
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ── ECHO ─────────────────────────────────────────────────────────────────────
function EchoRoom() {
  const [reacted, setReacted] = useState({});
  return (
    <>
      <RoomHead title="Echo Wall" sub="Anonymous one-liners from across the cycle. Hold a line — it fades in two days." />
      {ECHOES.map((e) => (
        <div key={e.id} style={{ ...cardStyle, marginTop: 12 }}>
          <Hand size={20} color={T.ink}>“{e.body}”</Hand>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
            {ECHO_REACTIONS.map((r) => {
              const on = reacted[e.id] === r;
              return <button key={r} onClick={() => setReacted((s) => ({ ...s, [e.id]: r }))} disabled={!!reacted[e.id]} style={reactPill(on)}>{on && <Check size={11} />}{r}</button>;
            })}
            <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10.5, color: T.muted }}>fades in {e.fadeH}h</span>
          </div>
        </div>
      ))}
    </>
  );
}

// ── GAMES — Jess as games master + the lighter games ─────────────────────────
function GamesRoom() {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [left, setLeft] = useState(GM_ROUND.seconds);
  useEffect(() => {
    if (revealed) return;
    const id = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(id), setRevealed(true), 0) : s - 1)), 1000);
    return () => clearInterval(id);
  }, [revealed]);

  const [votes, setVotes] = useState({});
  const [takeIdx, setTakeIdx] = useState(0);
  const [story, setStory] = useState([...STORY_SEED]);
  const [line, setLine] = useState("");

  return (
    <>
      <RoomHead title="The Lighter Side" sub="A gentle round Jess is hosting — and a few small games. No winners, no scores." />

      {/* Jess as games master */}
      <div style={{ ...cardStyle, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.gold, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={15} /></span>
          <Eyebrow color={T.muted}>Jess is hosting</Eyebrow>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: revealed ? T.sage : T.muted }}>
            <Clock size={13} /> {revealed ? "round closed" : `closes in 0:${String(left).padStart(2, "0")}`}
          </span>
        </div>
        <Hand size={15} color={T.inkSoft} style={{ marginBottom: 8 }}>{GM_ROUND.intro}</Hand>
        <Hand size={21} color={T.ink} style={{ marginBottom: 12 }}>{GM_ROUND.prompt}</Hand>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {GM_ROUND.options.map((o) => {
            const on = picked === o;
            return <button key={o} onClick={() => setPicked(o)} disabled={revealed && !on} style={chip(on)}>{on && <Check size={13} />}{o}</button>;
          })}
        </div>
        {picked && !revealed && <Hand size={14} color={T.muted} style={{ marginTop: 10 }}>Answer in. The room reveals together when the round closes.</Hand>}
        {revealed && (
          <div style={{ marginTop: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 13px" }}>
            <Eyebrow color={T.gold}>The room, together</Eyebrow>
            <Hand size={16} color={T.ink} style={{ marginTop: 4 }}>{GM_ROUND.reveal}</Hand>
          </div>
        )}
      </div>

      {/* a couple of small games */}
      <div style={{ ...cardStyle, marginTop: 12 }}>
        <Eyebrow color={T.muted}>This or that</Eyebrow>
        {THIS_OR_THAT.map((t) => {
          const v = votes[t.id];
          return (
            <div key={t.id} style={{ marginTop: 8 }}>
              <Hand size={16} color={T.ink}>{t.prompt}</Hand>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {["a", "b"].map((side) => (
                  <button key={side} onClick={() => setVotes((s) => ({ ...s, [t.id]: side }))} style={{ ...chip(v === side), flex: 1 }}>{t[side]}</button>
                ))}
              </div>
              {v && (
                <div style={{ display: "flex", gap: 8, marginTop: 7, fontFamily: UI, fontSize: 11, color: T.muted }}>
                  <Bar label={t.a} pct={t.split[0]} mine={v === "a"} /><Bar label={t.b} pct={t.split[1]} mine={v === "b"} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...cardStyle, marginTop: 12 }}>
        <Eyebrow color={T.muted}>Kind hot-take</Eyebrow>
        <Hand size={17} color={T.ink} style={{ margin: "6px 0 8px" }}>{HOT_TAKES[takeIdx]}</Hand>
        <button onClick={() => setTakeIdx((i) => (i + 1) % HOT_TAKES.length)} style={ghostBtnSm}>Another</button>
      </div>

      <div style={{ ...cardStyle, marginTop: 12 }}>
        <Eyebrow color={T.muted}>One-line story</Eyebrow>
        <div style={{ margin: "8px 0" }}>
          {story.map((s, i) => <Hand key={i} size={15} color={i === story.length - 1 ? T.ink : T.inkSoft} style={{ display: "block", fontStyle: "italic" }}>{s}</Hand>)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={line} onChange={(e) => setLine(e.target.value)} placeholder="add the next line…" style={{ flex: 1, fontFamily: SERIF, fontSize: 14.5, color: T.ink, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "8px 11px" }} />
          <button onClick={() => { if (line.trim()) { setStory((s) => [...s, line.trim()]); setLine(""); } }} style={inkBtnSm}><Plus size={13} /> Add</button>
        </div>
      </div>
    </>
  );
}

// ── SHARE — four lives + Witness (plum fragile surface) ──────────────────────
function ShareRoom() {
  const [fate, setFate] = useState("lock");
  const [resp, setResp] = useState(null);
  const sel = FOUR_LIVES.find((f) => f.key === fate);
  return (
    <>
      <RoomHead title="One entry, four lives" sub="What happens to a reflection — you decide, at the entry level, never by default." />
      <div style={{ ...cardStyle, marginTop: 4 }}>
        <Eyebrow color={T.muted}>From your journal</Eyebrow>
        <Hand size={17} color={T.ink} style={{ marginTop: 5 }}>{SAMPLE_ENTRY}</Hand>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {FOUR_LIVES.map((f) => {
          const on = fate === f.key;
          return (
            <button key={f.key} onClick={() => setFate(f.key)} style={{ ...doorStyle, minHeight: 92, background: on ? T.ink : T.paperHi, borderColor: on ? T.ink : T.paperDeep }}>
              <f.Icon size={16} style={{ color: on ? T.paper : T.ink, marginBottom: 6 }} />
              <div style={{ fontFamily: SERIF, fontSize: 15, color: on ? T.paper : T.ink }}>{f.label}{f.defaultLife ? " ·" : ""}</div>
              {f.defaultLife && <div style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: on ? "rgba(244,237,219,0.7)" : T.muted }}>default</div>}
            </button>
          );
        })}
      </div>
      {sel && <Hand size={15} color={T.inkSoft} style={{ marginTop: 10 }}>{sel.line}</Hand>}

      {fate === "witness" && (
        <div style={{ marginTop: 14, background: PLUM, border: "1px solid #3a2c3d", borderRadius: 16, padding: "16px 16px 18px" }}>
          <Eyebrow color="#c9a6cf">Witness · held once, by one</Eyebrow>
          <Hand size={16} color="#F4EFE3" carve={false} style={{ margin: "6px 0 12px" }}>One matched sister reads it once. She answers with one line, or holds it in silence. You can take it back within two hours.</Hand>
          <div style={{ fontFamily: UI, fontSize: 11, color: "#c9a6cf", marginBottom: 8 }}>{WITNESS.gate.line}</div>
          <Eyebrow color="#c9a6cf">She answers with one line</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            {WITNESS.responses.map((r) => {
              const on = resp === r;
              return <button key={r} onClick={() => setResp(r)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", borderRadius: 11, fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: on ? "#F4EFE3" : "transparent", color: on ? PLUM : "#F4EFE3", border: `1px solid ${on ? "#F4EFE3" : "#4a3a4d"}` }}>{on && <HeartHandshake size={13} />}{r}</button>;
            })}
          </div>
          {resp && <Hand size={15} color="#e6d6e8" carve={false} style={{ marginTop: 12 }}>She chose “{resp}.” The entry seals again. It leaves no history, on either side.</Hand>}
        </div>
      )}
    </>
  );
}

// ── TALK — audio modes + signpost ────────────────────────────────────────────
function TalkRoom() {
  const [mode, setMode] = useState("note");
  const m = AUDIO_MODES.find((x) => x.key === mode);
  return (
    <>
      <RoomHead title="Talk it out" sub="Being heard, not advised. Three ways to be held out loud. No recording, ever." />
      <div style={{ display: "flex", gap: 6, marginTop: 4, marginBottom: 12 }}>
        {AUDIO_MODES.map((a) => {
          const on = a.key === mode;
          return <button key={a.key} onClick={() => setMode(a.key)} style={{ ...navPill(on), flex: 1, justifyContent: "center" }}><a.Icon size={13} /> {a.name}</button>;
        })}
      </div>
      <div style={{ background: PLUM, border: "1px solid #3a2c3d", borderRadius: 16, padding: "18px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, background: "#33243a", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#F4EFE3" }}><m.Icon size={18} /></span>
          <div style={{ fontFamily: SERIF, fontSize: 19, color: "#F4EFE3" }}>{m.name}</div>
        </div>
        <Hand size={16} color="#e6d6e8" carve={false}>{m.line}</Hand>
        {mode === "talk" && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Repeat size={15} style={{ color: "#c9a6cf" }} />
            <span style={{ fontFamily: UI, fontSize: 12, color: "#c9a6cf" }}>3:00 — you talk, she holds, then swap. Hold, don't fix.</span>
          </div>
        )}
      </div>
      <div style={{ marginTop: 12 }}><Signpost /></div>
      <Hand size={13} color={T.muted} style={{ marginTop: 10 }}>{AUDIO_NOTE}</Hand>
    </>
  );
}

// ── a life room (Love / Money / Style / Health) — light themed view ──────────
function LifeRoom({ room }) {
  return (
    <>
      <RoomHead title={room.name} sub={room.line} />
      <div style={{ ...cardStyle, marginTop: 4 }}>
        <Hand size={16} color={T.inkSoft}>
          {room.key === "health"
            ? "The clinical room — accurate, NHS-grounded. One room here, not the whole house. Ask a question, read what others learned, never a diagnosis."
            : "Ask the room, kindly — the questions you'd never say aloud. Anonymous, supportive, no judgment. Pull up a chair."}
        </Hand>
      </div>
      <div style={{ ...cardStyle, marginTop: 12 }}>
        <Eyebrow color={T.muted}>From the room</Eyebrow>
        <Hand size={16} color={T.ink} style={{ marginTop: 6 }}>
          {({ love: "Third date and he asked what I actually want. Nearly fell off my chair.",
              money: "Opened the banking app without the pit in my stomach. Small, but new.",
              style: "Charity-shop dress, four pounds, made my whole week.",
              health: "Told the GP I was fine. I'm not sure I knew how to say the other thing." })[room.key]}
        </Hand>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// small shared bits
// ════════════════════════════════════════════════════════════════════════════
function RoomHead({ title, sub }) {
  return (
    <header style={{ marginBottom: 10 }}>
      <Script size={36} carve>{title}</Script>
      <Hand size={15} color={T.inkSoft} carve={false} style={{ marginTop: 4 }}>{sub}</Hand>
      <Rule mt={10} />
    </header>
  );
}
function CrisisCard({ onClose }) {
  return (
    <div style={{ marginTop: 10, background: PLUM, border: "1px solid #3a2c3d", borderRadius: 14, padding: "15px 15px 16px" }}>
      <ShieldAlert size={20} style={{ color: "#E8B4B8", marginBottom: 6 }} />
      <Hand size={16} color="#F4EFE3" carve={false}>This sounds heavy. A comment isn't the right shape for tonight — this stays private, nothing is posted. You deserve more than a room can hold.</Hand>
      <div style={{ marginTop: 10 }}>{UK_RESOURCES.map((r) => (
        <div key={r.name} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 7 }}>
          <r.Icon size={14} style={{ color: "#c9a6cf", marginTop: 2 }} />
          <div><div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: "#F4EFE3" }}>{r.name}</div><div style={{ fontFamily: UI, fontSize: 11.5, color: "#c9a6cf" }}>{r.detail}</div></div>
        </div>
      ))}</div>
      <button onClick={onClose} style={{ marginTop: 4, ...ghostBtnSmLight }}>Keep it private</button>
    </div>
  );
}
function Signpost() {
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><Phone size={13} style={{ color: T.gold }} /><Eyebrow color={T.muted}>Someone is there, right now</Eyebrow></div>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>Samaritans 116 123 · NHS 111 · Shout 85258 · Mind 0300 123 3393</div>
    </div>
  );
}
function Bar({ label, pct, mine }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>{label}</span><span>{pct}%</span></div>
      <div style={{ height: 6, borderRadius: 99, background: T.paperDeep, marginTop: 3 }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: mine ? T.crimson : T.muted }} /></div>
    </div>
  );
}
function DemoBanner({ label }) {
  return <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>{label}</div>;
}

// styles
const cardStyle = { background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 16px" };
const doorStyle = { position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "14px 14px 13px", minHeight: 118, cursor: "pointer", overflow: "hidden" };
function chip(on) { return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 10px", borderRadius: 11, fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer", background: on ? T.ink : T.paperHi, color: on ? T.paper : T.ink, border: `1px solid ${on ? T.ink : T.paperDeep}` }; }
function navPill(on, home) { return { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, background: on ? T.ink : "transparent", color: on ? T.paper : (home ? T.ink : T.muted), border: `1px solid ${on ? T.ink : T.paperDeep}` }; }
function togglePill(on) { return { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700, background: on ? T.ink : "transparent", color: on ? T.paper : T.muted, border: `1px solid ${on ? T.ink : T.paperDeep}` }; }
function reactPill(on) { return { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, cursor: on ? "default" : "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600, background: on ? T.paper : "transparent", color: on ? T.ink : T.muted, border: `1px solid ${on ? T.gold : T.paperDeep}` }; }
const inkBtnSm = { display: "inline-flex", alignItems: "center", gap: 6, background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "8px 13px", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" };
const ghostBtnSm = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "8px 13px", fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer" };
const ghostBtnSmLight = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "#F4EFE3", border: "1px solid #4a3a4d", borderRadius: 10, padding: "8px 13px", fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer" };
