// JournalDemo2 — "The Conversation"
// The journal as a message thread between you and yourself across time.
// iMessage-familiar interaction, journal-novel application.
import { useState, useRef, useEffect } from "react";
import { Sparkles, Flame } from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  surface:  "#FAF5E8",
  paperHi:  "#FFFDF5",
  espresso: "#3A2C1A",
  espressoSoft: "rgba(58,44,26,0.85)",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.16)",
  muted:    "#9B8B7A",
  amber:    "#D4882A",
  amberSoft:"rgba(212,136,42,0.16)",
};
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

const TYPE_COLOUR = {
  free: T.espresso, gratitude: T.gold, mood: T.blush, reflection: T.sage,
  work: "#5C7A7A", relationships: "#C4556B", money: "#8B6914",
  creative: "#C4892A", grief: T.muted, joy: "#5EA05E", identity: "#6B4FA0",
  burn: T.amber,
};

const ENTRY_TYPES = [
  { id: "free", label: "Free write" },
  { id: "gratitude", label: "Gratitude" },
  { id: "mood", label: "Mood" },
  { id: "reflection", label: "Reflection" },
  { id: "work", label: "Work" },
  { id: "relationships", label: "Relationships" },
  { id: "creative", label: "Creative" },
  { id: "joy", label: "Joy" },
  { id: "grief", label: "Grief" },
];

const TYPE_PROMPTS = {
  free: "Write freely. No prompt.",
  gratitude: "Name three things you're genuinely grateful for today.",
  mood: "How are you actually feeling — not the edited version?",
  reflection: "What went well? What would you do differently?",
  work: "What's the actual state of work right now?",
  relationships: "Who's on your mind?",
  creative: "What did you make, imagine or notice?",
  joy: "Name one small actual thing that felt good.",
  grief: "You don't have to explain. Just say what's true.",
};

const PHASE_PROMPT = "The editing phase. What can you let go of? What genuinely matters?";

// Mock thread — chronological, oldest first. Renders bottom-to-top via display.
const THREAD = [
  { id: 1, kind: "user",  type: "joy",         body: "Coffee, light, the quiet kitchen.", time: "Mon 8:14am" },
  { id: 2, kind: "user",  type: "work",        body: "The deadline shifted. Tired of replanning.", time: "Mon 4:02pm" },
  { id: 3, kind: "jess",  body: "I notice you've written about work three times this week. ◆", time: "Tue 9:01am" },
  { id: 4, kind: "user",  type: "burn",        body: "Things I'm not allowed to say out loud — even to myself.", time: "Wed 11:42pm", burn: true, burnIn: "6h 23m" },
  { id: 5, kind: "user",  type: "reflection",  body: "I keep editing myself before I speak. I don't think anyone asked me to.", time: "Today 9:42am" },
  { id: 6, kind: "jess",  body: "It's day 26. In your luteal phase. Last month on this day you wrote about feeling invisible.", time: "Today · On This Day", onThisDay: true },
  { id: 7, kind: "jess",  body: "23 women in your phase wrote about boundaries this week.", time: "Today · Community", community: true },
];

function Avatar({ kind }) {
  if (kind === "jess") {
    return (
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: T.gold, color: T.espresso,
        fontFamily: CORM, fontSize: 16, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}><Sparkles size={14} /></div>
    );
  }
  return null;
}

function Bubble({ msg }) {
  const isUser = msg.kind === "user";
  const isBurn = !!msg.burn;
  const isComm = !!msg.community;
  const isOTD  = !!msg.onThisDay;
  const c = msg.type ? TYPE_COLOUR[msg.type] : T.espresso;

  // User (right-aligned cream bubble) with type dot + tag
  if (isUser) {
    return (
      <div style={{
        display: "flex", justifyContent: "flex-end",
        marginBottom: 10, padding: "0 14px",
      }}>
        <div style={{ maxWidth: "78%", textAlign: "left" }}>
          <article style={{
            position: "relative",
            background: isBurn ? T.amberSoft : T.cream,
            border: isBurn ? `1px solid ${T.amber}` : `1px solid rgba(58,44,26,0.06)`,
            color: T.espresso,
            borderRadius: "18px 18px 4px 18px",
            padding: "12px 14px 11px",
            boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: isBurn ? T.amber : c, display: "inline-block",
              }} />
              <span style={{
                fontFamily: UI, fontSize: 9.5, color: isBurn ? T.amber : T.gold,
                letterSpacing: 1.4, fontWeight: 700, textTransform: "uppercase",
              }}>
                {isBurn ? `Burn · burns in ${msg.burnIn}` : msg.type}
              </span>
            </div>
            <p style={{
              fontFamily: CORM, fontStyle: "italic", fontSize: 16,
              color: T.espresso, lineHeight: 1.5, margin: 0,
            }}>{msg.body}</p>
            {isBurn && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                fontSize: 16, lineHeight: 1,
              }}><Flame size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></span>
            )}
          </article>
          <div style={{
            fontFamily: UI, fontSize: 10.5, color: T.muted,
            marginTop: 3, textAlign: "right", paddingRight: 4,
          }}>{msg.time}</div>
        </div>
      </div>
    );
  }

  // Jess / On This Day / Community (left-aligned espresso bubble)
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 8,
      marginBottom: 12, padding: "0 14px",
    }}>
      <Avatar kind="jess" />
      <div style={{ maxWidth: "78%" }}>
        <article style={{
          background: T.espresso, color: T.cream,
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 14px",
          boxShadow: "0 2px 6px rgba(58,44,26,0.14)",
          borderLeft: isOTD ? `3px solid ${T.gold}` : isComm ? `3px solid ${T.blush}` : "none",
        }}>
          <div style={{
            fontFamily: UI, fontSize: 9.5, color: T.gold,
            letterSpacing: 1.4, fontWeight: 700, marginBottom: 4, textTransform: "uppercase",
          }}>
            {isOTD ? "On This Day" : isComm ? "Community" : "Jess"}
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 15.5,
            color: T.cream, lineHeight: 1.55, margin: 0,
          }}>{msg.body}</p>
        </article>
        <div style={{
          fontFamily: UI, fontSize: 10.5, color: T.muted,
          marginTop: 3, paddingLeft: 4,
        }}>{msg.time}</div>
      </div>
    </div>
  );
}

function PinnedInsightsBar({ expanded, onToggle }) {
  return (
    <div style={{
      background: T.goldSoft, borderTop: `1px solid rgba(212,175,55,0.30)`,
      borderBottom: `1px solid rgba(212,175,55,0.30)`,
      padding: "10px 14px", cursor: "pointer",
    }} onClick={onToggle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: T.gold, color: T.espresso,
          width: 18, height: 18, borderRadius: "50%",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: CORM, fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}><Sparkles size={13} /></span>
        <div style={{
          flex: 1, fontFamily: UI, fontSize: 12.5, color: T.espresso, fontWeight: 600,
        }}>
          Jess · Cycle day 26 · Writing rhythm:{" "}
          <span aria-label="Rhythm">{"●●●●○"}</span>
        </div>
        <span style={{
          fontFamily: UI, fontSize: 11, color: T.gold, fontWeight: 700,
          letterSpacing: 0.5,
        }}>{expanded ? "Hide ↑" : "See more ↓"}</span>
      </div>
      {expanded && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: `1px dashed rgba(212,175,55,0.30)`,
        }}>
          <div style={{
            fontFamily: UI, fontSize: 10, color: T.muted,
            letterSpacing: 1.4, fontWeight: 700, marginBottom: 8, textTransform: "uppercase",
          }}>This week</div>
          <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
            {["M","T","W","T","F","S","S"].map((d, i) => {
              const on = [true,true,false,true,true,false,true][i];
              return (
                <div key={i} style={{
                  flex: 1, textAlign: "center",
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 3, margin: "0 auto 4px",
                    background: on ? T.espresso : "transparent",
                    border: on ? "none" : `1px solid ${T.muted}`,
                  }} />
                  <div style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{d}</div>
                </div>
              );
            })}
          </div>
          <div style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 13.5,
            color: T.espresso, lineHeight: 1.55, margin: 0,
          }}>
            On cycle day 26 last month, you wrote about feeling invisible.
            23 women in your phase wrote about rest this week.
          </div>
        </div>
      )}
    </div>
  );
}

function TypeSheet({ open, onClose, onPick, onBurn }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 95,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: "16px 16px 22px",
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 14px" }} />
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1.4, marginBottom: 10, textTransform: "uppercase" }}>
          Choose entry type
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {ENTRY_TYPES.map((t) => (
            <button key={t.id} onClick={() => { onPick(t.id); onClose(); }} style={{
              background: "transparent", color: T.espresso,
              border: `1px solid ${TYPE_COLOUR[t.id]}`,
              borderLeft: `4px solid ${TYPE_COLOUR[t.id]}`,
              borderRadius: 9999, padding: "7px 14px",
              fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => { onBurn(); onClose(); }} style={{
          width: "100%",
          background: T.amberSoft, color: T.amber,
          border: `1px solid ${T.amber}`,
          borderRadius: 14, padding: "12px 14px",
          fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        }}><Flame size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Burn Mode — write knowing it will disappear</button>
      </div>
    </div>
  );
}

function ComposeBar({ type, burnOn, onPlus, onSendInit, onChange, value, onMicHold }) {
  const c = burnOn ? T.amber : (TYPE_COLOUR[type] || T.gold);
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
      background: T.cream,
      borderTop: `1px solid rgba(58,44,26,0.10)`,
      padding: "10px 12px",
      paddingBottom: "max(10px, env(safe-area-inset-bottom))",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onPlus} aria-label="Add" style={{
          width: 32, height: 32, borderRadius: "50%",
          background: T.paperHi, color: T.espresso,
          border: `1px solid ${T.muted}`, cursor: "pointer",
          fontSize: 18, lineHeight: 1, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
        <div style={{
          flex: 1, background: T.paperHi,
          border: `1px solid rgba(58,44,26,0.10)`,
          borderLeft: `4px solid ${c}`,
          borderRadius: 18, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <input
            value={value} onChange={(e) => onChange(e.target.value)}
            onFocus={onSendInit}
            placeholder={burnOn ? "Burn it after…" : "Write to yourself…"}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontFamily: UI, fontSize: 14.5, color: T.espresso,
            }}
          />
        </div>
        <button onMouseDown={onMicHold} onTouchStart={onMicHold} aria-label="Send / hold to speak" style={{
          width: 36, height: 36, borderRadius: "50%",
          background: T.gold, color: T.espresso,
          border: "none", cursor: "pointer",
          fontFamily: CORM, fontSize: 18, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={13} /></button>
      </div>
    </div>
  );
}

function JessPromptBanner({ type, burnOn, onClose }) {
  const c = burnOn ? T.amber : (TYPE_COLOUR[type] || T.gold);
  const promptText = burnOn
    ? "Jess will never read this. Set a timer when you send."
    : (type ? (TYPE_PROMPTS[type] || PHASE_PROMPT) : PHASE_PROMPT);
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, zIndex: 65,
      bottom: "calc(58px + env(safe-area-inset-bottom))",
      background: T.espresso, color: T.cream,
      borderTop: `1px solid rgba(244,237,219,0.10)`,
      borderBottom: `1px solid rgba(244,237,219,0.10)`,
      padding: "10px 14px",
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ color: c, fontFamily: CORM, fontSize: 16, lineHeight: 1.2 }}><Sparkles size={13} /></span>
      <p style={{
        flex: 1, fontFamily: CORM, fontStyle: "italic", fontSize: 14.5,
        color: T.cream, lineHeight: 1.5, margin: 0,
      }}>{promptText}</p>
      <button onClick={onClose} aria-label="Dismiss" style={{
        background: "transparent", border: "none", color: T.muted,
        fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

function BurnTimerToast({ on, onClose }) {
  if (!on) return null;
  return (
    <div style={{
      position: "fixed", bottom: 132, left: "50%", transform: "translateX(-50%)",
      background: T.amber, color: T.paperHi,
      borderRadius: 9999, padding: "6px 14px",
      fontFamily: UI, fontSize: 12, fontWeight: 700, zIndex: 75,
      boxShadow: "0 6px 18px rgba(212,136,42,0.30)",
    }} onClick={onClose}><Flame size={12} style={{ display: "inline", verticalAlign: "-2px" }} /> Burns in 1h · tap to change</div>
  );
}

export default function JournalDemo2() {
  const [expand, setExpand] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [type, setType] = useState(null);
  const [burnOn, setBurnOn] = useState(false);
  const [value, setValue] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [thread, setThread] = useState(THREAD);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  const send = () => {
    if (!value.trim()) return;
    const newMsg = burnOn
      ? { id: Date.now(), kind: "user", type: "burn", body: value.trim(), time: "Now", burn: true, burnIn: "1h" }
      : { id: Date.now(), kind: "user", type: type || "free", body: value.trim(), time: "Now" };
    setThread(prev => [...prev, newMsg]);
    setValue("");
    setPromptOpen(false);
    setBurnOn(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.surface,
      display: "flex", flexDirection: "column",
    }}>
      {/* Sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 60,
        background: T.cream,
        borderBottom: `1px solid rgba(58,44,26,0.10)`,
        padding: "14px 16px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 30, height: 30, borderRadius: "50%",
            background: T.gold, color: T.espresso,
            fontFamily: CORM, fontSize: 18, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}><Sparkles size={13} /></span>
          <div>
            <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 17, color: T.espresso, lineHeight: 1.2 }}>
              You & Jess
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.4 }}>
              Luteal · Day 26
            </div>
          </div>
        </div>
      </header>

      {/* Pinned insights */}
      <PinnedInsightsBar expanded={expand} onToggle={() => setExpand(v => !v)} />

      {/* Thread */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto",
        paddingTop: 12, paddingBottom: 160,
      }}>
        {thread.map((msg) => <Bubble key={msg.id} msg={msg} />)}
      </div>

      {/* Jess prompt banner (only when composing) */}
      {promptOpen && (
        <JessPromptBanner
          type={type}
          burnOn={burnOn}
          onClose={() => setPromptOpen(false)}
        />
      )}

      {/* Burn toast */}
      <BurnTimerToast on={burnOn && !sheet} onClose={() => setBurnOn(false)} />

      {/* Compose bar */}
      <ComposeBar
        type={type}
        burnOn={burnOn}
        value={value}
        onChange={(v) => { setValue(v); send.last = v; }}
        onSendInit={() => setPromptOpen(true)}
        onPlus={() => setSheet(true)}
        onMicHold={send}
      />

      <TypeSheet
        open={sheet}
        onClose={() => setSheet(false)}
        onPick={(id) => { setType(id); setBurnOn(false); setPromptOpen(true); }}
        onBurn={() => { setBurnOn(true); setType(null); setPromptOpen(true); }}
      />
    </div>
  );
}
