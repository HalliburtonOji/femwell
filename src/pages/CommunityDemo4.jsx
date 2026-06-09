// CommunityDemo4 — "Jess walks you in" · CONVERSATIONAL / JESS-GUIDED UX
// ─────────────────────────────────────────────────────────────────────────────
// The COMPLETE whole-life Community, revealed as a guided conversation. Jess —
// the warm AI host (scripted via mock data, NOT a real LLM) — greets you, asks
// the Question of the Day, offers to peek in the Lounge, shows the rooms, brings
// up the games, presents the "one entry, four lives" as a choice she offers,
// introduces Witness, and invites you to talk it out. Every feature surfaces as
// an INLINE interactive card inside the chat. Your taps appear as user-side
// chips. The conversation reveals progressively via a single "show me more" advance.
//
// Feature-identical to the other 4 demos — only the UX differs (chat-led flow).
// Self-contained: mock data + useState only, no entities. UK voice, no emoji,
// Lucide + SVG only. Anonymous-first, whole-life NOT clinical, 18+.
import { useState } from "react";
import {
  Sparkles, Check, Send, Lock, Users, ArrowDown, ShieldCheck,
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

const PLUM = "#241a26"; // the one permitted dark surface (Witness / Talk-It-Out)

// ── chat scaffolding ─────────────────────────────────────────────────────────
function Jess({ children, lead }) {
  // a warm Jess message bubble — soft cream, aligned left, small Sparkles avatar
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
      <span style={{
        width: 30, height: 30, borderRadius: 999, flexShrink: 0, marginTop: 2,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.gold,
      }}>
        <Sparkles size={15} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {lead && <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, marginBottom: 5 }}>Jess</div>}
        <div style={{
          background: T.paperHi, border: `1px solid ${T.paperDeep}`,
          borderRadius: "4px 16px 16px 16px", padding: "13px 15px",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function You({ children }) {
  // a user-side reply chip — ink, aligned right
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
      <div style={{
        maxWidth: "82%", background: T.ink, color: T.paper,
        borderRadius: "16px 4px 16px 16px", padding: "9px 14px",
        fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2, lineHeight: 1.45,
      }}>
        {children}
      </div>
    </div>
  );
}

// a soft inline card that lives WITHIN Jess's side of the chat
function Card({ children, plum }) {
  return (
    <div style={{
      marginBottom: 14, marginLeft: 40,
      background: plum ? PLUM : T.paperHi,
      border: `1px solid ${plum ? "#3a2c3d" : T.paperDeep}`,
      borderRadius: 16, padding: "16px 16px 15px",
    }}>
      {children}
    </div>
  );
}

function JessSay({ children, size = 16 }) {
  return <Hand size={size} carve={false} style={{ color: T.inkSoft }}>{children}</Hand>;
}

export default function CommunityDemo4() {
  useEditorialFonts();

  // progressive reveal — each "show me more" advances Jess one step further in
  const [step, setStep] = useState(1);
  const advance = () => setStep((s) => s + 1);

  // per-feature interactive state (all useState, no entities)
  const [qotd, setQotd] = useState(null);
  const [openRoom, setOpenRoom] = useState(null);
  const [echoReact, setEchoReact] = useState({});           // echoId -> reaction
  const [draft, setDraft] = useState("");
  const [posted, setPosted] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [tot, setTot] = useState({});                       // this-or-that id -> "a"|"b"
  const [takeIdx, setTakeIdx] = useState(0);
  const [storyLine, setStoryLine] = useState("");
  const [story, setStory] = useState(STORY_SEED);
  const [cafe, setCafe] = useState("");
  const [cafes, setCafes] = useState(ROLEPLAY.entries);
  const [fate, setFate] = useState(null);
  const [witnessResp, setWitnessResp] = useState(null);
  const [audio, setAudio] = useState(null);

  const matched = qotd === QOTD.norm;

  function postToLounge() {
    if (!draft.trim()) return;
    if (crisisCheck(draft)) { setCrisis(true); return; }
    setPosted(true);
  }

  // the "show me more" advance prompt Jess offers between surfaces
  const More = ({ label, when }) =>
    step === when ? (
      <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 22px" }}>
        <button onClick={advance} style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999,
          padding: "8px 16px", cursor: "pointer",
          fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted,
        }}>
          {label} <ArrowDown size={13} />
        </button>
      </div>
    ) : null;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · Jess walks you in — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "30px 18px 60px" }}>

        {/* ── (1) Jess intro — masthead voice + ambient presence ── */}
        <header style={{ textAlign: "center", marginBottom: 22 }}>
          <Eyebrow mb={9} color={T.muted}>{MASTHEAD.eyebrow}</Eyebrow>
          <Script size={46} carve>{MASTHEAD.title}</Script>
        </header>

        <Jess lead>
          <JessSay size={17}>Hello, you. I'm Jess. Come in — sit wherever you like.</JessSay>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "9px 0 0", lineHeight: 1.55 }}>
            {MASTHEAD.subtitle}
          </p>
        </Jess>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, flexShrink: 0 }} />
            <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, letterSpacing: 0.2 }}>
              <strong style={{ color: T.ink }}>{PRESENCE.count} women</strong> {PRESENCE.line}
            </span>
          </div>
        </Card>

        {/* ── (2) Question of the Day ── */}
        <Jess>
          <JessSay>Before anything else — a little question I ask everyone who walks in.</JessSay>
        </Jess>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
            <span style={{ width: 20, height: 1, background: T.gold }} />
            <Eyebrow color={T.muted}>Question of the day</Eyebrow>
          </div>
          <Script size={26} carve style={{ marginBottom: 13 }}>{QOTD.question}</Script>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {QOTD.options.map((o) => {
              const on = qotd === o;
              const dim = qotd && !on;
              return (
                <button key={o} onClick={() => !qotd && setQotd(o)} disabled={!!qotd} style={{
                  display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 12px",
                  borderRadius: 12, textAlign: "left",
                  background: on ? T.ink : "transparent",
                  border: `1px solid ${on ? T.ink : T.paperDeep}`,
                  color: on ? T.paper : (dim ? T.muted : T.inkSoft),
                  fontFamily: UI, fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
                  cursor: qotd ? "default" : "pointer", opacity: dim ? 0.55 : 1, transition: "all .18s ease",
                }}>
                  <span>{o}</span>
                  {on && <Check size={13} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </Card>

        {qotd && <You>{qotd}</You>}
        {qotd && (
          <Jess>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <Users size={15} color={T.gold} style={{ marginTop: 3, flexShrink: 0 }} />
              <div>
                <JessSay>
                  {matched ? "Snap — that's just what most women said too." : QOTD.normLine}
                </JessSay>
                <p style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontStyle: "italic", margin: "6px 0 0", lineHeight: 1.5 }}>
                  No tally, no names — just the shape of the room. A little company in the small things.
                </p>
              </div>
            </div>
          </Jess>
        )}

        {qotd && <More label="Want to peek in the Lounge?" when={1} />}

        {/* ── (3) the whole-life rooms ── */}
        {step >= 2 && (
          <>
            <Jess>
              <JessSay>This is the heart of the house — the rooms. Health is just one of them, not the whole place. Tap any to peek inside.</JessSay>
            </Jess>
            <Card>
              <Eyebrow color={T.muted}>The rooms</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 11 }}>
                {ROOMS.map((r) => {
                  const on = openRoom === r.key;
                  return (
                    <button key={r.key} onClick={() => setOpenRoom(on ? null : r.key)} style={{
                      display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 999,
                      background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`,
                      color: on ? T.paper : T.inkSoft, cursor: "pointer",
                      fontFamily: UI, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2,
                    }}>
                      <r.Icon size={14} style={{ flexShrink: 0 }} />
                      {r.name}
                    </button>
                  );
                })}
              </div>
              {openRoom && (() => {
                const r = ROOMS.find((x) => x.key === openRoom);
                return (
                  <div style={{ marginTop: 13 }}>
                    <Rule c={T.paperDeep} mb={11} />
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{r.name}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
                        <span style={{ width: 5, height: 5, borderRadius: 999, background: T.sage }} />{r.hint}
                      </span>
                    </div>
                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "4px 0 0", lineHeight: 1.5 }}>{r.line}</p>
                  </div>
                );
              })()}
            </Card>
            <More label="Show me the Echo Wall" when={2} />
          </>
        )}

        {/* ── (4) Echo Wall ── */}
        {step >= 3 && (
          <>
            <Jess>
              <JessSay>Some women leave a single line on the Echo Wall — scrubbed, no names, fades in 48 hours. You can't reply, only hold it.</JessSay>
            </Jess>
            <Card>
              <Eyebrow color={T.muted}>Echo Wall</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 11 }}>
                {ECHOES.slice(0, 3).map((e) => {
                  const r = echoReact[e.id];
                  return (
                    <div key={e.id} style={{ borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 11 }}>
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.ink, margin: 0, lineHeight: 1.45 }}>"{e.body}"</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: UI, fontSize: 9, color: T.muted, letterSpacing: 0.6, marginRight: 2 }}>fades in {e.fadeH}h</span>
                        {ECHO_REACTIONS.map((re) => {
                          const on = r === re;
                          return (
                            <button key={re} onClick={() => setEchoReact((m) => ({ ...m, [e.id]: on ? null : re }))} style={{
                              padding: "3px 9px", borderRadius: 999,
                              background: on ? T.blush : "transparent",
                              border: `1px solid ${on ? T.blush : T.paperDeep}`,
                              color: on ? T.ink : T.muted, cursor: "pointer",
                              fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                            }}>{re}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <More label="Take me into the Lounge" when={3} />
          </>
        )}

        {/* ── (5) the Lounge — feed + anonymous compose + crisisCheck ── */}
        {step >= 4 && (
          <>
            <Jess>
              <JessSay>The Lounge is where it all spills out — silly to serious. Have a read, then add yours if you like. I'll keep it anonymous, always.</JessSay>
            </Jess>
            <Card>
              <Eyebrow color={T.muted}>The Lounge</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 11 }}>
                {LOUNGE.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ marginTop: 5, width: 6, height: 6, borderRadius: 999, flexShrink: 0, background: p.warm ? T.sage : T.gold }} />
                    <div>
                      <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>{p.domain}</span>
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "2px 0 0", lineHeight: 1.5 }}>{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Rule c={T.paperDeep} mt={14} mb={12} />

              {!posted && !crisis && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Lock size={12} color={T.muted} />
                    <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, fontStyle: "italic" }}>Jess keeps this anonymous — no name, ever.</span>
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Spill it here…"
                    rows={2}
                    style={{
                      width: "100%", boxSizing: "border-box", resize: "none",
                      background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11,
                      padding: "10px 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink,
                    }}
                  />
                  <button onClick={postToLounge} style={{
                    marginTop: 9, display: "inline-flex", alignItems: "center", gap: 7,
                    background: T.ink, color: T.paper, border: "none", borderRadius: 999,
                    padding: "9px 16px", cursor: "pointer",
                    fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase",
                  }}>
                    <Send size={13} /> Hand it to the room
                  </button>
                </>
              )}

              {posted && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={15} color={T.sage} />
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft }}>It's in — anonymously. The room's got you.</span>
                </div>
              )}

              {/* crisisCheck → Jess gently surfaces UK resources */}
              {crisis && (
                <div style={{ background: PLUM, border: "1px solid #3a2c3d", borderRadius: 13, padding: "14px 14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                    <ShieldAlert size={16} color={T.blush} />
                    <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.blush }}>Jess is here</span>
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.paper, margin: "0 0 11px", lineHeight: 1.5 }}>
                    That sounds heavy, and I don't want you to carry it alone. This is bigger than a peer can hold — please reach someone who can, right now.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {UK_RESOURCES.map((u) => (
                      <div key={u.name} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        <u.Icon size={14} color={T.blush} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontFamily: UI, fontSize: 11.5, color: "#EDE6DB", lineHeight: 1.45 }}>
                          <strong style={{ color: T.paper }}>{u.name}</strong> — {u.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            <More label="Fancy a game?" when={4} />
          </>
        )}

        {/* ── (6) the non-clinical games ── */}
        {step >= 5 && (
          <>
            <Jess>
              <JessSay>When the room needs lightening, we play. No scores, no winners — just a bit of fun. Have a go.</JessSay>
            </Jess>

            {/* This-or-That */}
            <Card>
              <Eyebrow color={T.muted}>This or that</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 11 }}>
                {THIS_OR_THAT.map((q) => {
                  const pick = tot[q.id];
                  return (
                    <div key={q.id}>
                      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, margin: "0 0 8px" }}>{q.prompt}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[["a", q.a, q.split[0]], ["b", q.b, q.split[1]]].map(([k, label, pct]) => {
                          const on = pick === k;
                          return (
                            <button key={k} onClick={() => !pick && setTot((m) => ({ ...m, [q.id]: k }))} disabled={!!pick} style={{
                              flex: 1, position: "relative", overflow: "hidden", padding: "9px 12px", borderRadius: 11,
                              background: "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`,
                              color: T.inkSoft, cursor: pick ? "default" : "pointer", textAlign: "left",
                              fontFamily: UI, fontSize: 12, fontWeight: 700,
                            }}>
                              {pick && <span style={{ position: "absolute", inset: 0, width: `${pct}%`, background: on ? `${T.blush}55` : `${T.paperDeep}66` }} />}
                              <span style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 6 }}>
                                <span>{label}</span>
                                {pick && <span style={{ color: T.muted }}>{pct}%</span>}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Hot Takes */}
            <Card>
              <Eyebrow color={T.muted}>Hot takes</Eyebrow>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.ink, margin: "11px 0 12px", lineHeight: 1.4 }}>
                "{HOT_TAKES[takeIdx]}"
              </p>
              <button onClick={() => setTakeIdx((i) => (i + 1) % HOT_TAKES.length)} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 14px",
                cursor: "pointer", fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: T.muted,
              }}>Next take</button>
            </Card>

            {/* One-Line Story */}
            <Card>
              <Eyebrow color={T.muted}>One-line story</Eyebrow>
              <div style={{ marginTop: 11 }}>
                {story.map((line, i) => (
                  <p key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "0 0 6px", lineHeight: 1.5 }}>{line}</p>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
                <input
                  value={storyLine}
                  onChange={(e) => setStoryLine(e.target.value)}
                  placeholder="Add the next line…"
                  style={{ flex: 1, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "8px 11px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.ink }}
                />
                <button onClick={() => { if (storyLine.trim()) { setStory((s) => [...s, storyLine.trim()]); setStoryLine(""); } }} style={{
                  background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "0 13px", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}><Send size={14} /></button>
              </div>
            </Card>

            {/* Role-Play */}
            <Card>
              <Eyebrow color={T.muted}>Role-play</Eyebrow>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, margin: "11px 0 10px" }}>{ROLEPLAY.prompt}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {cafes.map((c, i) => (
                  <span key={i} style={{ padding: "6px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft }}>{c}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                <input
                  value={cafe}
                  onChange={(e) => setCafe(e.target.value)}
                  placeholder="Name yours…"
                  style={{ flex: 1, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "8px 11px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.ink }}
                />
                <button onClick={() => { if (cafe.trim()) { setCafes((s) => [...s, cafe.trim()]); setCafe(""); } }} style={{
                  background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "0 13px", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}><Send size={14} /></button>
              </div>
            </Card>

            <More label="There's one more thing…" when={5} />
          </>
        )}

        {/* ── (7) one entry, four lives ── */}
        {step >= 6 && (
          <>
            <Jess>
              <JessSay>Say you'd written something tonight. The lovely part is — you choose what becomes of it. One entry, four possible lives. Which would you give it?</JessSay>
            </Jess>
            <Card>
              <Eyebrow color={T.muted}>One entry, four lives</Eyebrow>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "10px 0 13px", padding: "10px 12px", background: T.paper, borderLeft: `2px solid ${T.gold}`, borderRadius: "0 8px 8px 0", lineHeight: 1.5 }}>
                "{SAMPLE_ENTRY}"
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FOUR_LIVES.map((f) => {
                  const on = fate === f.key;
                  return (
                    <button key={f.key} onClick={() => setFate(f.key)} style={{
                      display: "flex", alignItems: "flex-start", gap: 11, textAlign: "left",
                      padding: "11px 12px", borderRadius: 12, cursor: "pointer",
                      background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`,
                    }}>
                      <f.Icon size={16} color={on ? T.paper : T.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: on ? T.paper : T.ink }}>{f.label}</span>
                          {f.defaultLife && <span style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: on ? T.blush : T.muted }}>default</span>}
                        </div>
                        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: on ? "#EDE6DB" : T.inkSoft, margin: "2px 0 0", lineHeight: 1.45 }}>{f.line}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
            {fate && <You>{FOUR_LIVES.find((f) => f.key === fate).label}</You>}
            {fate && (
              <Jess>
                <JessSay>{fate === "lock" ? "Then it stays yours, under your key. That's always allowed." : "A brave choice. Nothing leaves until you say so — and even then, only the scrubbed shape of it."}</JessSay>
              </Jess>
            )}
            <More label="Tell me about Witness" when={6} />
          </>
        )}

        {/* ── (8) Witness — gate + charter + 4 fixed responses (plum surface) ── */}
        {step >= 7 && (
          <>
            <Jess>
              <JessSay>Witness is the slowest, most careful room. One sister reads your entry once, and sends back one of four lines — or silence. You earn your turn by holding space first.</JessSay>
            </Jess>
            <Card plum>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                <ShieldCheck size={15} color={T.blush} />
                <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.blush }}>Witness</span>
              </div>

              {/* the gate */}
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.paper, margin: "0 0 9px", lineHeight: 1.5 }}>{WITNESS.gate.line}</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {Array.from({ length: WITNESS.gate.need }).map((_, i) => (
                  <span key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < WITNESS.gate.held ? T.blush : "#3a2c3d" }} />
                ))}
              </div>

              {/* the charter */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {WITNESS.charter.map(([title, body]) => (
                  <div key={title} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <Check size={13} color={T.sage} style={{ marginTop: 3, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, color: T.paper }}>{title}</span>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: "#CFC6BA", lineHeight: 1.45 }}> — {body}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* the 4 fixed responses */}
              <Rule c="#3a2c3d" mt={14} mb={11} />
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.blush }}>The four lines she can send back</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
                {WITNESS.responses.map((r) => {
                  const on = witnessResp === r;
                  return (
                    <button key={r} onClick={() => setWitnessResp(on ? null : r)} style={{
                      padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                      background: on ? T.blush : "transparent", border: `1px solid ${on ? T.blush : "#3a2c3d"}`,
                      color: on ? PLUM : "#EDE6DB", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5,
                    }}>{r}</button>
                  );
                })}
              </div>
              {witnessResp && (
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: "#CFC6BA", margin: "11px 0 0", lineHeight: 1.45 }}>
                  She'd send "{witnessResp}" — then it seals. No reply, no thread. Just held, once.
                </p>
              )}
            </Card>
            <More label="And if I want to be heard out loud?" when={7} />
          </>
        )}

        {/* ── (9) Talk It Out — audio modes + note + signpost (plum) ── */}
        {step >= 8 && (
          <>
            <Jess>
              <JessSay>Sometimes typing isn't enough. If you'd rather be heard out loud, there are gentle ways — hold, don't fix is the only rule.</JessSay>
            </Jess>
            <Card plum>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.blush }}>Talk it out</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AUDIO_MODES.map((m) => {
                  const on = audio === m.key;
                  return (
                    <button key={m.key} onClick={() => setAudio(on ? null : m.key)} style={{
                      display: "flex", alignItems: "flex-start", gap: 11, textAlign: "left",
                      padding: "11px 12px", borderRadius: 12, cursor: "pointer",
                      background: on ? T.blush : "transparent", border: `1px solid ${on ? T.blush : "#3a2c3d"}`,
                    }}>
                      <m.Icon size={16} color={on ? PLUM : T.blush} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: on ? PLUM : T.paper }}>{m.name}</span>
                        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: on ? "#2a1f2c" : "#CFC6BA", margin: "2px 0 0", lineHeight: 1.45 }}>{m.line}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontFamily: UI, fontSize: 10.5, color: "#A99FB0", fontStyle: "italic", margin: "12px 0 0", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
                <Lock size={12} style={{ marginTop: 2, flexShrink: 0 }} /> {AUDIO_NOTE}
              </p>
            </Card>
            <More label="That's me — close us out" when={8} />
          </>
        )}

        {/* ── closing Jess bubble — FOOTER_LINE ── */}
        {step >= 9 && (
          <>
            <Jess lead>
              <JessSay size={16}>That's the whole house. Stay as long as you like — I'll be here.</JessSay>
              <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "10px 0 0", lineHeight: 1.6 }}>
                {FOOTER_LINE}
              </p>
            </Jess>
            <div style={{ marginTop: 22 }}><EditorialFooter /></div>
          </>
        )}

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
