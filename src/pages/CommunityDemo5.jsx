// CommunityDemo5 — "Bento-Grid Dashboard"
// ─────────────────────────────────────────────────────────────────────────────
// The whole-life Community as a bento box: a responsive grid of varied-size tiles,
// everything at a glance. A masthead strip sits above the grid; each feature is a
// compact live tile that EXPANDS on tap (useState expandedTile) into its full
// interactive content, then collapses. Dashboard density, tap-to-expand.
//
// Feature-identical to all other CommunityDemo pages — only the UX/UI differs.
// All 9 surfaces present: presence+masthead · Question of the Day · Rooms ·
// Echo Wall · Lounge (feed + compose + crisisCheck) · Games · Four Lives ·
// Witness · Talk It Out.
//
// Self-contained, mock data + useState only, no entities. UK voice, no emoji,
// Lucide/SVG only. No scoreboards/counts/streaks/handles.
import { useState } from "react";
import {
  Users, ChevronRight, X, Check, Send, Sparkles, Plus,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  MASTHEAD, PRESENCE, QOTD, ROOMS, ECHOES, ECHO_REACTIONS, LOUNGE,
  THIS_OR_THAT, HOT_TAKES, STORY_SEED, ROLEPLAY, SAMPLE_ENTRY, FOUR_LIVES,
  WITNESS, AUDIO_MODES, AUDIO_NOTE, crisisCheck, UK_RESOURCES, FOOTER_LINE,
  ShieldAlert,
} from "./communityShared";

const PLUM = "#241a26";
const PLUM_HI = "#2f2233";
const PLUM_LINE = "#42324a";

export default function CommunityDemo5() {
  useEditorialFonts();
  const [expanded, setExpanded] = useState(null); // which tile is open (key) or null

  const open = (k) => setExpanded(k);
  const close = () => setExpanded(null);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 56 }}>
      <InkFilter />
      <Banner label="Community · Bento Dashboard — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "26px 16px 40px" }}>
        {/* ── masthead strip (above the grid) ──────────────────────────────── */}
        <header style={{
          background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16,
          padding: "16px 18px", marginBottom: 12,
        }}>
          <Eyebrow mb={7} color={T.muted}>{MASTHEAD.eyebrow}</Eyebrow>
          <Script size={38} carve>{MASTHEAD.title}</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.inkSoft, margin: "8px 0 12px", lineHeight: 1.5 }}>
            {MASTHEAD.subtitle}
          </p>
          {/* presence — ambient, aggregate, never named */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 11, borderTop: `1px solid ${T.paperDeep}` }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, flexShrink: 0 }} />
            <span style={{ fontFamily: UI, fontSize: 11.5, color: T.inkSoft, letterSpacing: 0.2 }}>
              <strong style={{ color: T.ink }}>{PRESENCE.count} women</strong> {PRESENCE.line}
            </span>
          </div>
        </header>

        {/* ── the bento grid ──────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Question of the Day — spans 2 cols */}
          <Tile span={2} label="Question of the day" title={QOTD.question}
            peek="One tap reveals the shape of the room — no counts." onOpen={() => open("qotd")} />
          {/* Rooms — 1 col */}
          <Tile label="The rooms" title="Whole-life"
            peek={`${ROOMS.length} rooms · health is one of them`} onOpen={() => open("rooms")} />
          {/* Echo Wall — 1 col */}
          <Tile label="Echo wall" title="Echoes"
            peek="Scrubbed one-liners · fade in 48h" onOpen={() => open("echoes")} />
          {/* Lounge — spans 2 cols */}
          <Tile span={2} label="The lounge" title="Vent, spill it, be heard"
            peek={LOUNGE[0].body} onOpen={() => open("lounge")} />
          {/* Games — 1 col */}
          <Tile label="The lighter side" title="Games"
            peek="This-or-that · hot takes · a shared story" onOpen={() => open("games")} />
          {/* Four Lives — 1 col */}
          <Tile label="One entry" title="Four lives"
            peek="One thing you wrote · four homes for it" onOpen={() => open("four")} />
          {/* Witness — plum, spans 2 cols */}
          <Tile span={2} dark label="Witness" title="Held once, by one"
            peek="Slow, earned, anonymous — a single matched sister." onOpen={() => open("witness")} />
          {/* Talk It Out — plum, spans 2 cols */}
          <Tile span={2} dark label="Talk it out" title="Say it aloud"
            peek="Voice note · turn-based 1:1 · a small live circle." onOpen={() => open("talk")} />
        </div>

        {/* footer line under the grid */}
        <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.65, margin: "20px auto 0", maxWidth: 380 }}>
          {FOOTER_LINE}
        </p>
        <div style={{ marginTop: 22 }}><EditorialFooter /></div>
      </div>

      {/* ── expanded overlay (the live feature) ───────────────────────────── */}
      {expanded && (
        <Overlay onClose={close} dark={expanded === "witness" || expanded === "talk"}>
          {expanded === "qotd"    && <QotdPanel />}
          {expanded === "rooms"   && <RoomsPanel />}
          {expanded === "echoes"  && <EchoesPanel />}
          {expanded === "lounge"  && <LoungePanel />}
          {expanded === "games"   && <GamesPanel />}
          {expanded === "four"    && <FourLivesPanel />}
          {expanded === "witness" && <WitnessPanel />}
          {expanded === "talk"    && <TalkPanel />}
        </Overlay>
      )}
    </div>
  );
}

// ── bento tile (compact, tap to expand) ──────────────────────────────────────
function Tile({ span = 1, dark = false, label, title, peek, onOpen }) {
  const bg = dark ? PLUM : T.paperHi;
  const border = dark ? PLUM_LINE : T.paperDeep;
  const ink = dark ? "#F4EFE3" : T.ink;
  const soft = dark ? "#cdbcd0" : T.inkSoft;
  const mut = dark ? "#9a86a0" : T.muted;
  return (
    <button
      onClick={onOpen}
      style={{
        gridColumn: span === 2 ? "span 2" : "auto",
        background: bg, border: `1px solid ${border}`, borderRadius: 16,
        padding: "13px 14px", textAlign: "left", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 6, minHeight: 104,
        transition: "transform .15s ease, box-shadow .15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(11,8,5,0.07)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 16, height: 1, background: T.gold }} />
        <Eyebrow color={mut}>{label}</Eyebrow>
      </span>
      <span style={{ fontFamily: SERIF, fontSize: span === 2 ? 23 : 19, color: ink, lineHeight: 1.15 }}>{title}</span>
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: soft, lineHeight: 1.45, flex: 1,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {peek}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: mut, marginTop: "auto" }}>
        Open <ChevronRight size={12} />
      </span>
    </button>
  );
}

// ── expanded overlay shell ───────────────────────────────────────────────────
function Overlay({ children, onClose, dark }) {
  const bg = dark ? PLUM : T.paper;
  const ink = dark ? "#F4EFE3" : T.ink;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50, background: "rgba(11,8,5,0.42)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto",
          background: bg, color: ink, borderRadius: "20px 20px 0 0",
          border: `1px solid ${dark ? PLUM_LINE : T.paperDeep}`, borderBottom: "none",
          padding: "16px 18px 32px", boxShadow: "0 -10px 40px rgba(11,8,5,0.25)",
        }}
      >
        <button onClick={onClose} style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1,
          textTransform: "uppercase", color: dark ? "#9a86a0" : T.muted,
        }}>
          <X size={13} /> Close
        </button>
        {children}
      </div>
    </div>
  );
}

// ── panel header helper ──────────────────────────────────────────────────────
function PanelHead({ label, title, dark }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Eyebrow mb={6} color={dark ? "#9a86a0" : T.muted}>{label}</Eyebrow>
      <Script size={30} carve style={dark ? { color: "#F4EFE3" } : undefined}>{title}</Script>
    </div>
  );
}

// ── (1) Question of the Day ──────────────────────────────────────────────────
function QotdPanel() {
  const [picked, setPicked] = useState(null);
  const matched = picked === QOTD.norm;
  return (
    <div>
      <PanelHead label="Question of the day" title={QOTD.question} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {QOTD.options.map((o) => {
          const on = picked === o;
          const dim = picked && !on;
          return (
            <button key={o} onClick={() => setPicked(o)} disabled={!!picked}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 13px",
                borderRadius: 13, textAlign: "left", background: on ? T.ink : "transparent",
                border: `1px solid ${on ? T.ink : T.paperDeep}`,
                color: on ? T.paper : (dim ? T.muted : T.inkSoft),
                fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2,
                cursor: picked ? "default" : "pointer", opacity: dim ? 0.55 : 1, transition: "all .18s ease",
              }}>
              <span style={{ flex: 1 }}>{o}</span>
              {on && <Check size={14} style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
      {picked && (
        <div style={{ marginTop: 15 }}>
          <Rule c={T.paperDeep} mb={12} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
            <Users size={15} color={T.gold} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <Hand size={20} carve>
                {matched ? `Most women said the same as you — ${QOTD.norm}.` : QOTD.normLine}
              </Hand>
              <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "6px 0 0", lineHeight: 1.5 }}>
                A little company in the small things. No tally, no names — just the shape of the room.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── (2) Rooms ────────────────────────────────────────────────────────────────
function RoomsPanel() {
  return (
    <div>
      <PanelHead label="The rooms" title="For the whole of you" />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.inkSoft, margin: "0 0 14px", lineHeight: 1.5 }}>
        Health is one room here — not the whole house.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {ROOMS.map((r) => (
          <div key={r.key} style={{
            background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "13px 13px",
            display: "flex", flexDirection: "column", gap: 7,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10, display: "inline-flex",
              alignItems: "center", justifyContent: "center", background: `${T.ink}0E`, color: T.ink,
            }}>
              <r.Icon size={17} />
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.2 }}>{r.name}</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: T.inkSoft, lineHeight: 1.45 }}>{r.line}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted, marginTop: "auto" }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: T.sage }} /> {r.hint}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── (3) Echo Wall ────────────────────────────────────────────────────────────
function EchoesPanel() {
  const [reacted, setReacted] = useState({}); // id -> reaction label
  return (
    <div>
      <PanelHead label="Echo wall" title="Lines, held not replied" />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.inkSoft, margin: "0 0 14px", lineHeight: 1.5 }}>
        One scrubbed line, to women in your phase. Fades in 48 hours. A kind, one-way hold — never a thread.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {ECHOES.map((e) => {
          const mine = reacted[e.id];
          return (
            <div key={e.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px" }}>
              <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: "0 0 9px" }}>"{e.body}"</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ECHO_REACTIONS.map((rx) => {
                    const on = mine === rx;
                    return (
                      <button key={rx} onClick={() => setReacted((p) => ({ ...p, [e.id]: on ? undefined : rx }))}
                        style={{
                          padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                          background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`,
                          color: on ? T.paper : T.muted, fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
                        }}>
                        {rx}
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, whiteSpace: "nowrap" }}>fades in {e.fadeH}h</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── (4) Lounge — feed + compose + crisisCheck → UK resources ─────────────────
function LoungePanel() {
  const [feed, setFeed] = useState(LOUNGE);
  const [draft, setDraft] = useState("");
  const [crisis, setCrisis] = useState(false);

  const post = () => {
    const text = draft.trim();
    if (!text) return;
    if (crisisCheck(text)) { setCrisis(true); return; }
    setFeed((f) => [{ id: `new-${Date.now()}`, domain: "You", body: text, warm: true }, ...f]);
    setDraft("");
    setCrisis(false);
  };

  return (
    <div>
      <PanelHead label="The lounge" title="Vent, spill it, be heard" />
      {/* compose */}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 13px", marginBottom: 14 }}>
        <textarea
          value={draft}
          onChange={(e) => { setDraft(e.target.value); if (crisis) setCrisis(false); }}
          placeholder="Silly to serious — no names. What's on your mind?"
          rows={2}
          style={{
            width: "100%", resize: "none", border: "none", outline: "none", background: "transparent",
            fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <button onClick={post} disabled={!draft.trim()} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 11,
            background: draft.trim() ? T.ink : T.paperDeep, color: T.paper, border: "none",
            cursor: draft.trim() ? "pointer" : "default", fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3,
          }}>
            Share <Send size={13} />
          </button>
        </div>
      </div>

      {/* crisis routing — heavy never goes to a peer */}
      {crisis && (
        <div style={{ background: `${T.crimson}0D`, border: `1px solid ${T.crimson}55`, borderRadius: 14, padding: "14px 15px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <ShieldAlert size={16} color={T.crimson} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: 0.3, color: T.crimson }}>Some things deserve more than a peer</span>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.inkSoft, margin: "0 0 10px", lineHeight: 1.5 }}>
            This sounds heavy — and you deserve real support, not a stranger's reply. Please reach one of these now.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {UK_RESOURCES.map((r) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <r.Icon size={15} color={T.crimson} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: UI, fontSize: 12, color: T.ink }}>
                  <strong>{r.name}</strong> — {r.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {feed.map((p) => (
          <div key={p.id} style={{
            background: T.paperHi, border: `1px solid ${p.warm ? T.sage + "55" : T.paperDeep}`,
            borderRadius: 14, padding: "13px 15px",
          }}>
            <span style={{ display: "inline-block", fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>
              {p.domain}
            </span>
            <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.5, margin: 0 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── (5) Games — this-or-that, hot takes, one-line story, role-play ───────────
function GamesPanel() {
  const [tapped, setTapped] = useState({});       // this-or-that: id -> "a"|"b"
  const [takeIdx, setTakeIdx] = useState(0);
  const [story, setStory] = useState(STORY_SEED);
  const [line, setLine] = useState("");
  const [cafe, setCafe] = useState(ROLEPLAY.entries);
  const [cafeDraft, setCafeDraft] = useState("");

  const addLine = () => { if (line.trim()) { setStory((s) => [...s, line.trim()]); setLine(""); } };
  const addCafe = () => { if (cafeDraft.trim()) { setCafe((c) => [...c, cafeDraft.trim()]); setCafeDraft(""); } };

  return (
    <div>
      <PanelHead label="The lighter side" title="A proper laugh" />

      {/* This or That */}
      <Eyebrow mb={9} color={T.muted}>This or that</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 20 }}>
        {THIS_OR_THAT.map((q) => {
          const choice = tapped[q.id];
          return (
            <div key={q.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "13px 14px" }}>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink, margin: "0 0 10px" }}>{q.prompt}</p>
              <div style={{ display: "flex", gap: 9 }}>
                {[["a", q.a, q.split[0]], ["b", q.b, q.split[1]]].map(([k, lbl, pct]) => {
                  const on = choice === k;
                  return (
                    <button key={k} onClick={() => setTapped((p) => ({ ...p, [q.id]: k }))}
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                        background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`,
                        color: on ? T.paper : T.inkSoft, fontFamily: UI, fontSize: 12, fontWeight: 700, position: "relative", overflow: "hidden",
                      }}>
                      {choice && (
                        <span style={{ position: "absolute", insetBlock: 0, left: 0,
                          background: on ? "rgba(244,239,227,0.12)" : `${T.sage}1F`, width: `${pct}%`, zIndex: 0 }} />
                      )}
                      <span style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <span>{lbl}</span>
                        {choice && <span style={{ opacity: 0.85 }}>{pct}%</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {choice && <p style={{ fontFamily: UI, fontSize: 10, color: T.muted, fontStyle: "italic", margin: "8px 0 0" }}>Just the shape of the room — no winners.</p>}
            </div>
          );
        })}
      </div>

      {/* Hot Takes */}
      <Eyebrow mb={9} color={T.muted}>Hot takes</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px", marginBottom: 20 }}>
        <Hand size={20} carve>{HOT_TAKES[takeIdx]}</Hand>
        <button onClick={() => setTakeIdx((i) => (i + 1) % HOT_TAKES.length)}
          style={{
            marginTop: 11, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10,
            background: "transparent", border: `1px solid ${T.paperDeep}`, color: T.inkSoft, cursor: "pointer",
            fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          }}>
          <Sparkles size={12} /> Another
        </button>
      </div>

      {/* One-Line Story */}
      <Eyebrow mb={9} color={T.muted}>One-line story</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px", marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 11 }}>
          {story.map((s, i) => (
            <p key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>
              {s}
            </p>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={line} onChange={(e) => setLine(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLine()}
            placeholder="Add the next line…"
            style={{ flex: 1, padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, fontFamily: SERIF, fontSize: 13, color: T.ink, outline: "none" }} />
          <button onClick={addLine} disabled={!line.trim()} style={{
            display: "inline-flex", alignItems: "center", padding: "0 13px", borderRadius: 10,
            background: line.trim() ? T.ink : T.paperDeep, color: T.paper, border: "none",
            cursor: line.trim() ? "pointer" : "default",
          }}>
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Role-Play */}
      <Eyebrow mb={9} color={T.muted}>Role-play</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px" }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink, margin: "0 0 10px" }}>{ROLEPLAY.prompt}</p>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 11 }}>
          {cafe.map((c, i) => (
            <span key={i} style={{ padding: "6px 11px", borderRadius: 999, background: `${T.blush}26`, border: `1px solid ${T.blush}77`, fontFamily: SERIF, fontSize: 12.5, color: T.ink }}>
              {c}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={cafeDraft} onChange={(e) => setCafeDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCafe()}
            placeholder="Your café's name…"
            style={{ flex: 1, padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, fontFamily: SERIF, fontSize: 13, color: T.ink, outline: "none" }} />
          <button onClick={addCafe} disabled={!cafeDraft.trim()} style={{
            display: "inline-flex", alignItems: "center", padding: "0 13px", borderRadius: 10,
            background: cafeDraft.trim() ? T.ink : T.paperDeep, color: T.paper, border: "none",
            cursor: cafeDraft.trim() ? "pointer" : "default",
          }}>
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── (6) Four Lives — sample entry + chooser ──────────────────────────────────
function FourLivesPanel() {
  const [chosen, setChosen] = useState("lock");
  return (
    <div>
      <PanelHead label="One entry" title="Four lives" />
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px", marginBottom: 14 }}>
        <Eyebrow mb={7} color={T.muted}>What you wrote</Eyebrow>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink, lineHeight: 1.55, margin: 0 }}>
          "{SAMPLE_ENTRY}"
        </p>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.inkSoft, margin: "0 0 12px", lineHeight: 1.5 }}>
        One thing you wrote — four homes it could have. Choose where it goes.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FOUR_LIVES.map((l) => {
          const on = chosen === l.key;
          return (
            <button key={l.key} onClick={() => setChosen(l.key)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", cursor: "pointer",
                background: on ? T.ink : T.paperHi, border: `1px solid ${on ? T.ink : T.paperDeep}`,
                borderRadius: 14, padding: "13px 14px", transition: "all .16s ease",
              }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                background: on ? "rgba(244,239,227,0.14)" : `${T.ink}0E`, color: on ? T.paper : T.ink,
              }}>
                <l.Icon size={17} />
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: on ? T.paper : T.ink, display: "block" }}>{l.label}</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: on ? "#E7DFCF" : T.inkSoft, lineHeight: 1.45 }}>{l.line}</span>
              </div>
              {on && <Check size={16} color={T.paper} style={{ marginTop: 4, flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── (7) Witness — gate + charter + responses (plum fragile surface) ──────────
function WitnessPanel() {
  const [step, setStep] = useState("gate"); // gate -> charter -> respond -> sent
  const [reply, setReply] = useState(null);
  const inkP = "#F4EFE3", softP = "#cdbcd0", mutP = "#9a86a0";

  return (
    <div>
      <PanelHead label="Witness" title="Held once, by one" dark />

      {step === "gate" && (
        <div>
          <div style={{ background: PLUM_HI, border: `1px solid ${PLUM_LINE}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: inkP, lineHeight: 1.55, margin: 0 }}>
              {WITNESS.gate.line}
            </p>
            <div style={{ display: "flex", gap: 7, marginTop: 13 }}>
              {Array.from({ length: WITNESS.gate.need }).map((_, i) => (
                <span key={i} style={{
                  flex: 1, height: 5, borderRadius: 999,
                  background: i < WITNESS.gate.held ? T.blush : PLUM_LINE,
                }} />
              ))}
            </div>
          </div>
          <button onClick={() => setStep("charter")} style={{
            width: "100%", padding: "13px", borderRadius: 12, background: T.blush, color: PLUM, border: "none",
            cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4,
          }}>
            Hold space for a sister
          </button>
        </div>
      )}

      {step === "charter" && (
        <div>
          <Eyebrow mb={11} color={mutP}>The charter — how it's held</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 16 }}>
            {WITNESS.charter.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 11 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: T.blush, flexShrink: 0, marginTop: 6 }} />
                <div>
                  <span style={{ fontFamily: SERIF, fontSize: 15, color: inkP, display: "block" }}>{k}</span>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: softP, lineHeight: 1.5 }}>{v}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep("respond")} style={{
            width: "100%", padding: "13px", borderRadius: 12, background: T.blush, color: PLUM, border: "none",
            cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4,
          }}>
            Read her entry
          </button>
        </div>
      )}

      {step === "respond" && (
        <div>
          <div style={{ background: PLUM_HI, border: `1px solid ${PLUM_LINE}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
            <Eyebrow mb={7} color={mutP}>She wrote · reproductive · TTC</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: inkP, lineHeight: 1.55, margin: 0 }}>
              "{SAMPLE_ENTRY}"
            </p>
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: mutP, fontStyle: "italic", margin: "0 0 11px", lineHeight: 1.5 }}>
            One read, one fixed response. Hold, don't fix. Then it seals.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {WITNESS.responses.map((r) => {
              const on = reply === r;
              return (
                <button key={r} onClick={() => setReply(r)}
                  style={{
                    padding: "12px", borderRadius: 12, cursor: "pointer",
                    background: on ? T.blush : "transparent", border: `1px solid ${on ? T.blush : PLUM_LINE}`,
                    color: on ? PLUM : inkP, fontFamily: SERIF, fontSize: 14, fontStyle: "italic",
                  }}>
                  {r}
                </button>
              );
            })}
          </div>
          <button onClick={() => reply && setStep("sent")} disabled={!reply} style={{
            width: "100%", marginTop: 14, padding: "13px", borderRadius: 12,
            background: reply ? T.blush : PLUM_LINE, color: reply ? PLUM : mutP, border: "none",
            cursor: reply ? "pointer" : "default", fontFamily: UI, fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4,
          }}>
            Send once, then seal
          </button>
        </div>
      )}

      {step === "sent" && (
        <div style={{ textAlign: "center", padding: "20px 8px" }}>
          <span style={{
            width: 52, height: 52, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: `${T.blush}2E`, border: `1px solid ${T.blush}`, marginBottom: 14,
          }}>
            <Check size={22} color={T.blush} />
          </span>
          <Hand size={24} carve style={{ color: inkP }}>"{reply}" — held with her, then sealed.</Hand>
          <p style={{ fontFamily: UI, fontSize: 11, color: mutP, fontStyle: "italic", margin: "10px auto 0", maxWidth: 280, lineHeight: 1.5 }}>
            No DM, no follow, no re-view. She felt it once. That was enough.
          </p>
        </div>
      )}
    </div>
  );
}

// ── (8) Talk It Out — audio modes + note + signpost (plum) ───────────────────
function TalkPanel() {
  const [mode, setMode] = useState(null);
  const inkP = "#F4EFE3", softP = "#cdbcd0", mutP = "#9a86a0";
  const active = AUDIO_MODES.find((m) => m.key === mode);
  return (
    <div>
      <PanelHead label="Talk it out" title="Say it aloud" dark />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {AUDIO_MODES.map((m) => {
          const on = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(on ? null : m.key)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", cursor: "pointer",
                background: on ? PLUM_HI : "transparent", border: `1px solid ${on ? T.blush : PLUM_LINE}`,
                borderRadius: 14, padding: "13px 14px", transition: "all .16s ease",
              }}>
              <span style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                background: on ? `${T.blush}26` : "rgba(244,239,227,0.06)", color: on ? T.blush : inkP,
              }}>
                <m.Icon size={18} />
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: inkP, display: "block" }}>{m.name}</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: softP, lineHeight: 1.5 }}>{m.line}</span>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div style={{ background: PLUM_HI, border: `1px solid ${PLUM_LINE}`, borderRadius: 14, padding: "14px 15px", marginBottom: 12 }}>
          <Hand size={20} carve style={{ color: inkP }}>You chose: {active.name}. Held by a phase-sister — hold, don't fix.</Hand>
        </div>
      )}

      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "12px 13px", borderRadius: 12, background: "rgba(244,239,227,0.04)", border: `1px solid ${PLUM_LINE}` }}>
        <ShieldAlert size={15} color={T.blush} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: UI, fontSize: 11, color: mutP, lineHeight: 1.55, margin: 0 }}>{AUDIO_NOTE}</p>
      </div>
    </div>
  );
}

// ── demo banner ──────────────────────────────────────────────────────────────
function Banner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}
