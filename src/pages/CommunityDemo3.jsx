// CommunityDemo3 — "Tabbed / Segmented Control" UX
// ─────────────────────────────────────────────────────────────────────────────
// The SAME complete whole-life Community as every other demo — only the UX
// differs. Here the signature is a STICKY segmented control (a pill-tab row:
// Home · Lounge · Rooms · Play · Share · Talk) pinned to the top of the column.
// It stays put while you flick between sections fast (useState activeTab),
// app-like and compact. Health is one room, not the house. Anonymous, 18+,
// whole-life not clinical. No scoreboards, no handles, no emoji.
//
// Self-contained, mock data + useState only, no entities. UK voice, Lucide only.
import { useState } from "react";
import {
  Home as HomeIcon, MessageCircle, Grid3x3, Dices, Send, Mic2,
  Check, Users, Waves, Heart, ArrowRight, Lock, Quote, Plus, ChevronRight,
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

const TABS = [
  { key: "home",   label: "Home",   Icon: HomeIcon },
  { key: "lounge", label: "Lounge", Icon: MessageCircle },
  { key: "rooms",  label: "Rooms",  Icon: Grid3x3 },
  { key: "play",   label: "Play",   Icon: Dices },
  { key: "share",  label: "Share",  Icon: Send },
  { key: "talk",   label: "Talk",   Icon: Mic2 },
];

export default function CommunityDemo3() {
  useEditorialFonts();
  const [tab, setTab] = useState("home");

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoBanner label="Community · Tabbed — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", position: "relative" }}>
        {/* ── STICKY segmented control — the signature of this UX ─────────── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 20,
          background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}`,
          padding: "9px 12px",
        }}>
          <div style={{
            display: "flex", gap: 6, overflowX: "auto",
            WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
          }}>
            {TABS.map((tb) => {
              const on = tab === tb.key;
              return (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 13px", borderRadius: 999, flexShrink: 0,
                    background: on ? T.ink : "transparent",
                    border: `1px solid ${on ? T.ink : T.paperDeep}`,
                    color: on ? T.paper : T.muted,
                    fontFamily: UI, fontSize: 12, fontWeight: 700,
                    letterSpacing: 0.3, cursor: "pointer",
                    transition: "all .16s ease", whiteSpace: "nowrap",
                  }}
                >
                  <tb.Icon size={13} style={{ flexShrink: 0 }} />
                  {tb.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div style={{ padding: "22px 20px 56px" }}>
          {tab === "home"   && <HomeTab onJump={setTab} />}
          {tab === "lounge" && <LoungeTab />}
          {tab === "rooms"  && <RoomsTab />}
          {tab === "play"   && <PlayTab />}
          {tab === "share"  && <ShareTab />}
          {tab === "talk"   && <TalkTab />}

          <div style={{ marginTop: 34 }}>
            <Rule c={T.paperDeep} mb={14} />
            <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.6, margin: "0 auto", maxWidth: 360 }}>
              {FOOTER_LINE}
            </p>
            <div style={{ marginTop: 22 }}><EditorialFooter /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ HOME ═══════════════════════════════════════
   masthead + presence · QOTD · Echo Wall · quick links into the rooms       */
function HomeTab({ onJump }) {
  const [picked, setPicked] = useState(null);
  const matched = picked === QOTD.norm;

  return (
    <section>
      {/* masthead */}
      <header style={{ textAlign: "center", marginBottom: 14 }}>
        <Eyebrow mb={9} color={T.muted}>{MASTHEAD.eyebrow}</Eyebrow>
        <Script size={50} carve>{MASTHEAD.title}</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, margin: "11px auto 0", maxWidth: 350, lineHeight: 1.55 }}>
          {MASTHEAD.subtitle}
        </p>
      </header>

      {/* ambient presence */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "10px 14px", margin: "0 0 22px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, flexShrink: 0 }} />
        <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, letterSpacing: 0.2 }}>
          <strong style={{ color: T.ink }}>{PRESENCE.count} women</strong> {PRESENCE.line}
        </span>
      </div>

      {/* Question of the Day */}
      <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "18px 16px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
          <span style={{ width: 22, height: 1, background: T.gold }} />
          <Eyebrow color={T.muted}>Question of the day</Eyebrow>
        </div>
        <Script size={27} carve style={{ marginBottom: 13 }}>{QOTD.question}</Script>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {QOTD.options.map((o) => {
            const on = picked === o;
            const dim = picked && !on;
            return (
              <button
                key={o}
                onClick={() => setPicked(o)}
                disabled={!!picked}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "10px 12px", borderRadius: 12, textAlign: "left",
                  background: on ? T.ink : "transparent",
                  border: `1px solid ${on ? T.ink : T.paperDeep}`,
                  color: on ? T.paper : (dim ? T.muted : T.inkSoft),
                  fontFamily: UI, fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
                  cursor: picked ? "default" : "pointer", opacity: dim ? 0.55 : 1,
                  transition: "all .18s ease",
                }}
              >
                <span style={{ flex: 1 }}>{o}</span>
                {on && <Check size={13} style={{ flexShrink: 0 }} />}
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
                <Hand size={19} carve>
                  {matched ? "Most women said the same as you — a text from a friend." : QOTD.normLine}
                </Hand>
                <p style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontStyle: "italic", margin: "5px 0 0", lineHeight: 1.5 }}>
                  A little company in the small things. No tally, no names — just the shape of the room.
                </p>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Echo Wall — prominent on Home */}
      <EchoWall />

      {/* quick links into the deeper tabs */}
      <div style={{ marginTop: 26 }}>
        <Eyebrow color={T.muted} mb={11}>Jump in</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {[
            { to: "lounge", label: "The Lounge", line: "Vent · be heard" },
            { to: "rooms",  label: "The rooms",  line: "Whole-life" },
            { to: "play",   label: "Play",       line: "Games · no scores" },
            { to: "share",  label: "Share one entry", line: "Four lives" },
          ].map((q) => (
            <button
              key={q.to}
              onClick={() => onJump(q.to)}
              style={{
                textAlign: "left", padding: "13px 14px", borderRadius: 13,
                background: T.paperHi, border: `1px solid ${T.paperDeep}`,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{q.label}</span>
                <ArrowRight size={14} color={T.muted} />
              </div>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>{q.line}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Echo Wall (anonymous one-liners, fade 48h, kind one-way reactions) ──── */
function EchoWall() {
  const [reacted, setReacted] = useState({});  // id -> reaction label

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
        <Waves size={15} color={T.gold} />
        <Eyebrow color={T.muted}>Echo Wall</Eyebrow>
        <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, fontStyle: "italic", marginLeft: "auto" }}>
          scrubbed lines · fade in 48h
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {ECHOES.map((e) => {
          const mine = reacted[e.id];
          return (
            <div key={e.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "13px 14px" }}>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.ink, margin: 0, lineHeight: 1.5 }}>
                “{e.body}”
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {ECHO_REACTIONS.map((r) => {
                  const on = mine === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setReacted((p) => ({ ...p, [e.id]: on ? null : r }))}
                      style={{
                        padding: "5px 11px", borderRadius: 999,
                        background: on ? T.ink : "transparent",
                        border: `1px solid ${on ? T.ink : T.paperDeep}`,
                        color: on ? T.paper : T.muted,
                        fontFamily: UI, fontSize: 10.5, fontWeight: 600,
                        cursor: "pointer", transition: "all .15s ease",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
                <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, marginLeft: "auto" }}>
                  fades in {e.fadeH}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════ LOUNGE ═════════════════════════════════════
   the whole-life feed + compose with crisisCheck → UK_RESOURCES routing      */
function LoungeTab() {
  const [draft, setDraft] = useState("");
  const [posted, setPosted] = useState(false);
  const crisis = crisisCheck(draft);

  const send = () => { if (!crisis && draft.trim()) { setPosted(true); setDraft(""); } };

  return (
    <section>
      <header style={{ marginBottom: 16 }}>
        <Eyebrow mb={8} color={T.muted}>The Lounge</Eyebrow>
        <Script size={34} carve>Spill it, kindly</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "8px 0 0", lineHeight: 1.5 }}>
          Silly to serious, no names. Whole-life — the win, the wobble, the “is it just me”.
        </p>
      </header>

      {/* compose */}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 15, padding: "14px", marginBottom: 22 }}>
        <textarea
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setPosted(false); }}
          placeholder="Say it here — anonymously."
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box", resize: "none",
            background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11,
            padding: "11px 12px", fontFamily: SERIF, fontSize: 14.5, color: T.ink,
            lineHeight: 1.5, outline: "none",
          }}
        />
        {crisis ? (
          <div style={{ marginTop: 12, background: T.paper, border: `1px solid ${T.crimson}`, borderRadius: 12, padding: "13px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
              <ShieldAlert size={16} color={T.crimson} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 800, color: T.crimson, letterSpacing: 0.3 }}>
                This belongs with someone trained — not a peer.
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {UK_RESOURCES.map((r) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <r.Icon size={14} color={T.crimson} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: UI, fontSize: 12, color: T.ink }}>
                    <strong>{r.name}</strong> — {r.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11 }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontStyle: "italic" }}>
              {posted ? "Shared with the room." : "No handle attached."}
            </span>
            <button
              onClick={send}
              disabled={!draft.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 999,
                background: draft.trim() ? T.ink : "transparent",
                border: `1px solid ${draft.trim() ? T.ink : T.paperDeep}`,
                color: draft.trim() ? T.paper : T.muted,
                fontFamily: UI, fontSize: 12, fontWeight: 700,
                cursor: draft.trim() ? "pointer" : "default",
              }}
            >
              Share <Send size={12} />
            </button>
          </div>
        )}
      </div>

      {/* feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {LOUNGE.map((p) => (
          <div key={p.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px" }}>
            <span style={{
              display: "inline-block", fontFamily: UI, fontSize: 9, fontWeight: 800,
              letterSpacing: 1, textTransform: "uppercase", color: p.warm ? T.sage : T.muted,
              marginBottom: 7,
            }}>
              {p.domain}
            </span>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════ ROOMS ══════════════════════════════════════
   the whole-life rooms in detail                                            */
function RoomsTab() {
  const [open, setOpen] = useState(null);

  return (
    <section>
      <header style={{ marginBottom: 16 }}>
        <Eyebrow mb={8} color={T.muted}>The rooms</Eyebrow>
        <Script size={34} carve>One room, not the house</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "8px 0 0", lineHeight: 1.5 }}>
          Rooms for the whole of your life. Health is the clinical one — it doesn’t run the place.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ROOMS.map((r) => {
          const isOpen = open === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setOpen(isOpen ? null : r.key)}
              style={{
                textAlign: "left", width: "100%",
                background: T.paperHi, border: `1px solid ${isOpen ? T.ink : T.paperDeep}`,
                borderRadius: 14, padding: "14px 15px", cursor: "pointer",
                transition: "border-color .15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.ink,
                }}>
                  <r.Icon size={17} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{r.name}</span>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 9, fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: T.sage }} />
                    {r.hint}
                  </div>
                </div>
                <ChevronRight size={15} color={T.muted} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .18s ease", flexShrink: 0 }} />
              </div>
              {isOpen && (
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "11px 0 0 50px", lineHeight: 1.55 }}>
                  {r.line}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ════════════════════════════ PLAY ═══════════════════════════════════════
   This-or-That tap→split · Hot Takes · One-Line Story add · Role-Play        */
function PlayTab() {
  const [votes, setVotes] = useState({});       // t.id -> "a" | "b"
  const [takeIdx, setTakeIdx] = useState(0);
  const [story, setStory] = useState([...STORY_SEED]);
  const [line, setLine] = useState("");
  const [cafes, setCafes] = useState([...ROLEPLAY.entries]);
  const [name, setName] = useState("");

  const addLine = () => { if (line.trim()) { setStory((s) => [...s, line.trim()]); setLine(""); } };
  const addCafe = () => { if (name.trim()) { setCafes((c) => [...c, name.trim()]); setName(""); } };

  return (
    <section>
      <header style={{ marginBottom: 16 }}>
        <Eyebrow mb={8} color={T.muted}>The Lighter Side</Eyebrow>
        <Script size={34} carve>Play, no scores</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "8px 0 0", lineHeight: 1.5 }}>
          Tap, take, build a line. Nobody’s keeping count.
        </p>
      </header>

      {/* This or That */}
      <Eyebrow color={T.muted} mb={10}>This or that</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
        {THIS_OR_THAT.map((t) => {
          const v = votes[t.id];
          return (
            <div key={t.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px" }}>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, margin: "0 0 11px" }}>{t.prompt}</p>
              {!v ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {["a", "b"].map((side) => (
                    <button
                      key={side}
                      onClick={() => setVotes((p) => ({ ...p, [t.id]: side }))}
                      style={{
                        padding: "12px", borderRadius: 12, background: "transparent",
                        border: `1px solid ${T.paperDeep}`, color: T.ink,
                        fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {t[side]}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["a", "b"].map((side) => {
                    const pct = side === "a" ? t.split[0] : t.split[1];
                    const mine = v === side;
                    return (
                      <div key={side}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: mine ? T.ink : T.muted, marginBottom: 4 }}>
                          <span>{t[side]}{mine && " · you"}</span>
                          <span>{pct}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: mine ? T.ink : T.muted, opacity: mine ? 1 : 0.4 }} />
                        </div>
                      </div>
                    );
                  })}
                  <p style={{ fontFamily: UI, fontSize: 10, color: T.muted, fontStyle: "italic", margin: "3px 0 0" }}>
                    How the room leans — not a score.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hot Takes */}
      <Eyebrow color={T.muted} mb={10}>Hot take</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "16px", marginBottom: 26 }}>
        <Quote size={16} color={T.gold} style={{ marginBottom: 8 }} />
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.ink, margin: "0 0 13px", lineHeight: 1.45 }}>
          {HOT_TAKES[takeIdx]}
        </p>
        <button
          onClick={() => setTakeIdx((i) => (i + 1) % HOT_TAKES.length)}
          style={{
            padding: "8px 15px", borderRadius: 999, background: "transparent",
            border: `1px solid ${T.paperDeep}`, color: T.muted,
            fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          Another
        </button>
      </div>

      {/* One-Line Story */}
      <Eyebrow color={T.muted} mb={10}>One-line story</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px", marginBottom: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
          {story.map((s, i) => (
            <p key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: i < STORY_SEED.length ? T.inkSoft : T.ink, margin: 0, lineHeight: 1.5 }}>
              {s}
            </p>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLine()}
            placeholder="Add the next line…"
            style={{
              flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`,
              borderRadius: 10, padding: "10px 12px", fontFamily: SERIF, fontSize: 13.5,
              color: T.ink, outline: "none",
            }}
          />
          <button
            onClick={addLine}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 40, borderRadius: 10, background: T.ink, border: "none",
              color: T.paper, cursor: "pointer", flexShrink: 0,
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Role-Play */}
      <Eyebrow color={T.muted} mb={10}>Role-play</Eyebrow>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px" }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, margin: "0 0 11px" }}>{ROLEPLAY.prompt}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {cafes.map((c, i) => (
            <span key={i} style={{
              padding: "7px 13px", borderRadius: 999, background: T.paper,
              border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontStyle: "italic",
              fontSize: 13.5, color: T.ink,
            }}>
              {c}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCafe()}
            placeholder="Name yours…"
            style={{
              flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`,
              borderRadius: 10, padding: "10px 12px", fontFamily: SERIF, fontSize: 13.5,
              color: T.ink, outline: "none",
            }}
          />
          <button
            onClick={addCafe}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 40, borderRadius: 10, background: T.ink, border: "none",
              color: T.paper, cursor: "pointer", flexShrink: 0,
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ SHARE ══════════════════════════════════════
   "one entry, four lives" chooser + Witness (gate/charter/4 responses)       */
function ShareTab() {
  const [life, setLife] = useState(FOUR_LIVES.find((l) => l.defaultLife)?.key || "lock");
  const [sent, setSent] = useState(false);
  const g = WITNESS.gate;
  const unlocked = g.held >= g.need;

  return (
    <section>
      <header style={{ marginBottom: 16 }}>
        <Eyebrow mb={8} color={T.muted}>One entry, four lives</Eyebrow>
        <Script size={34} carve>Where does it go?</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "8px 0 0", lineHeight: 1.5 }}>
          You wrote one thing. You decide its life.
        </p>
      </header>

      {/* the entry */}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "15px 16px", marginBottom: 16 }}>
        <Quote size={15} color={T.gold} style={{ marginBottom: 7 }} />
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.55 }}>
          {SAMPLE_ENTRY}
        </p>
      </div>

      {/* four lives chooser */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
        {FOUR_LIVES.map((l) => {
          const on = life === l.key;
          return (
            <button
              key={l.key}
              onClick={() => setLife(l.key)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left",
                background: on ? T.ink : T.paperHi,
                border: `1px solid ${on ? T.ink : T.paperDeep}`,
                borderRadius: 13, padding: "13px 14px", cursor: "pointer",
                transition: "all .16s ease",
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginTop: 1,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: on ? "rgba(244,239,227,0.14)" : T.paper,
                border: `1px solid ${on ? "transparent" : T.paperDeep}`,
                color: on ? T.paper : T.ink,
              }}>
                <l.Icon size={15} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 16, color: on ? T.paper : T.ink }}>{l.label}</span>
                  {on && <Check size={14} color={T.paper} style={{ marginLeft: "auto" }} />}
                </div>
                <p style={{ fontFamily: UI, fontSize: 11.5, color: on ? "rgba(244,239,227,0.75)" : T.muted, margin: "3px 0 0", lineHeight: 1.45 }}>
                  {l.line}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Witness — appears when "handed to a witness" is chosen (plum fragile surface) */}
      {life === "witness" ? (
        <div style={{ background: "#241a26", borderRadius: 16, padding: "20px 18px", color: "#EFE7DA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Heart size={15} color={T.blush} />
            <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: T.blush }}>
              Witness
            </span>
          </div>
          <Script size={26} carve style={{ color: "#F4EFE3" }}>Held once, by one</Script>

          {/* gate */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,180,184,0.3)", borderRadius: 12, padding: "13px 14px", margin: "15px 0" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "#EFE7DA", margin: "0 0 9px", lineHeight: 1.5 }}>
              {g.line}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: g.need }).map((_, i) => (
                <span key={i} style={{
                  flex: 1, height: 5, borderRadius: 999,
                  background: i < g.held ? T.blush : "rgba(255,255,255,0.15)",
                }} />
              ))}
            </div>
          </div>

          {/* charter */}
          <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,180,184,0.8)" }}>
            The charter
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "11px 0 16px" }}>
            {WITNESS.charter.map(([title, body]) => (
              <div key={title} style={{ display: "flex", gap: 9 }}>
                <Check size={13} color={T.sage} style={{ marginTop: 3, flexShrink: 0 }} />
                <div>
                  <span style={{ fontFamily: SERIF, fontSize: 14, color: "#F4EFE3" }}>{title}</span>
                  <p style={{ fontFamily: UI, fontSize: 11, color: "rgba(239,231,218,0.7)", margin: "2px 0 0", lineHeight: 1.5 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* her four lines back */}
          <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,180,184,0.8)" }}>
            She can only say
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "11px 0 16px" }}>
            {WITNESS.responses.map((r) => (
              <span key={r} style={{
                padding: "7px 13px", borderRadius: 999,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "#EFE7DA",
              }}>
                “{r}”
              </span>
            ))}
            <span style={{ padding: "7px 13px", fontFamily: UI, fontSize: 11.5, color: "rgba(239,231,218,0.55)", fontStyle: "italic" }}>
              …or silence.
            </span>
          </div>

          <button
            onClick={() => unlocked && setSent(true)}
            disabled={!unlocked || sent}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, marginTop: 4,
              background: unlocked && !sent ? T.blush : "rgba(255,255,255,0.08)",
              border: "none",
              color: unlocked && !sent ? "#241a26" : "rgba(239,231,218,0.5)",
              fontFamily: UI, fontSize: 13, fontWeight: 800, letterSpacing: 0.3,
              cursor: unlocked && !sent ? "pointer" : "default",
            }}
          >
            {sent ? "Handed over — cancel within 2 hours" : unlocked ? "Hand it to a witness" : `Hold ${g.need - g.held} more to unlock`}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "13px 14px" }}>
          <Lock size={15} color={T.muted} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>
            {FOUR_LIVES.find((l) => l.key === life)?.line}
          </span>
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════ TALK ═══════════════════════════════════════
   Audio "Talk It Out" — mode switcher + note + signpost                      */
function TalkTab() {
  const [mode, setMode] = useState(AUDIO_MODES[0].key);
  const active = AUDIO_MODES.find((m) => m.key === mode);

  return (
    <section>
      <header style={{ marginBottom: 16 }}>
        <Eyebrow mb={8} color={T.muted}>Talk it out</Eyebrow>
        <Script size={34} carve>Use your voice</Script>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "8px 0 0", lineHeight: 1.5 }}>
          When typing isn’t enough. Hold, don’t fix.
        </p>
      </header>

      {/* mode switcher — segmented, echoing the page signature */}
      <div style={{ display: "flex", gap: 7, marginBottom: 18 }}>
        {AUDIO_MODES.map((m) => {
          const on = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "10px 8px", borderRadius: 11,
                background: on ? T.ink : "transparent",
                border: `1px solid ${on ? T.ink : T.paperDeep}`,
                color: on ? T.paper : T.muted,
                fontFamily: UI, fontSize: 11, fontWeight: 700, cursor: "pointer",
                transition: "all .16s ease",
              }}
            >
              <m.Icon size={13} />
              {m.name}
            </button>
          );
        })}
      </div>

      {/* active mode — plum card (the only other dark surface allowed) */}
      <div style={{ background: "#241a26", borderRadius: 16, padding: "22px 18px", color: "#EFE7DA", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 13 }}>
          <span style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "rgba(232,180,184,0.16)", color: T.blush,
          }}>
            <active.Icon size={20} />
          </span>
          <Script size={26} carve style={{ color: "#F4EFE3" }}>{active.name}</Script>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "rgba(239,231,218,0.9)", margin: 0, lineHeight: 1.6 }}>
          {active.line}
        </p>
      </div>

      {/* signpost note */}
      <div style={{ display: "flex", gap: 9, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: "13px 14px" }}>
        <ShieldAlert size={15} color={T.muted} style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: 0, lineHeight: 1.6 }}>
          {AUDIO_NOTE}
        </p>
      </div>
    </section>
  );
}

function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: T.paper, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}
