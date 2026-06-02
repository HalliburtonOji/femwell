// JournalDemo2 — "Night Light" (Dark Intimate)
// Interactive demo. Mock data only — no entity queries.
import { useState, useEffect } from "react";

const N = {
  bg:        "#0D0B14",
  bgGradTop: "#15101F",
  surface:   "rgba(255,255,255,0.04)",
  surfaceHi: "rgba(255,255,255,0.07)",
  border:    "rgba(255,255,255,0.08)",
  text:      "#E8E4F0",
  textDim:   "rgba(232,228,240,0.65)",
  violet:    "#7B5EA7",
  silver:    "#C4B8D8",
  gold:      "#D4AF37",
  amber:     "#D97A3A",
  blush:     "#E8B4B8",
  sage:      "#8FAF8F",
};
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

const PHASE_COLOUR = { menstrual: N.blush, follicular: N.sage, ovulatory: N.gold, luteal: N.silver };

const MOCK = {
  cycleDay: 26, phase: "luteal",
  prompt: "The editing phase. What can you let go of? What genuinely matters?",
  altPrompts: [
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
  rhythm: [true, true, false, true, true, false, true],
  jessLine: "On cycle day 26 last month, you wrote about feeling invisible. It's day 26 today.",
  community: "23 women are awake at this hour too.",
  onThisDay: { text: "I felt invisible at the meeting. Like I had to be louder just to be seen.", date: "Last cycle · Day 26" },
  entries: [
    { id: 1, type: "Reflection", icon: "❋", body: "I keep editing myself before I speak. I don't think anyone asked me to.", date: "Today · 9:42am", colour: N.silver },
    { id: 2, type: "Night Self", icon: "🌙", body: "Couldn't sleep. The same thought kept circling. Wrote it down to release it.", date: "3:14am · 2 days ago", colour: N.violet },
    { id: 3, type: "Burn", icon: "🔥", body: "Things I'm not allowed to say. Even to myself.", date: "2 days ago · burns in 4h", colour: N.amber, burn: true },
    { id: 4, type: "Joy", icon: "☀", body: "The coffee. The angle of light. Small enough that no one would notice.", date: "3 days ago", colour: N.gold },
    { id: 5, type: "Grief", icon: "❉", body: "Reading old letters from her. Some days are heavier than others.", date: "5 days ago", colour: N.silver },
  ],
};

const ENTRY_TYPES = [
  { id: "night",      label: "Night Self",  icon: "🌙" },
  { id: "free",       label: "Free",        icon: "✎" },
  { id: "reflection", label: "Reflection",  icon: "❋" },
  { id: "mood",       label: "Mood",        icon: "♡" },
  { id: "grief",      label: "Grief",       icon: "❉" },
  { id: "burn",       label: "Burn",        icon: "🔥" },
];

function InsightsCard({ onExpand }) {
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: N.surface, border: `1px solid ${N.border}`,
      borderLeft: `2px solid ${N.violet}`,
      borderRadius: 18, padding: "14px 16px", marginBottom: 16,
      transition: "background 200ms",
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = N.surfaceHi}
      onMouseLeave={(e) => e.currentTarget.style.background = N.surface}
    >
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: UI, fontSize: 9.5, color: N.silver,
          letterSpacing: 1.6, fontWeight: 600, marginBottom: 4, opacity: 0.85,
        }}>JESS</div>
        <div style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 14,
          color: N.text, lineHeight: 1.45, opacity: 0.92,
        }}>{MOCK.jessLine}</div>
      </div>
      <div style={{ display: "flex", gap: 5 }} aria-label="Writing rhythm">
        {MOCK.rhythm.slice(0, 5).map((on, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: on
              ? `linear-gradient(135deg, ${N.silver}, ${N.violet})`
              : "transparent",
            border: on ? "none" : `1px solid ${N.textDim}`,
          }} />
        ))}
      </div>
    </button>
  );
}

function InsightsExpanded({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(13,11,20,0.85)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: N.bgGradTop, width: "100%", maxWidth: 640,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "24px 22px 32px", color: N.text,
        border: `1px solid ${N.border}`, borderBottom: "none",
      }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{
            width: 70, height: 70, borderRadius: "50%", margin: "0 auto",
            background: `radial-gradient(circle, ${N.violet} 0%, transparent 70%)`,
            border: `1px solid ${N.violet}`, opacity: 0.6,
            animation: "nl-pulse 4s ease-in-out infinite",
          }} />
          <div style={{
            fontFamily: UI, fontSize: 10, color: N.silver,
            letterSpacing: 2, fontWeight: 700, marginTop: 10,
          }}>WHAT JESS NOTICED</div>
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 17,
          color: N.text, lineHeight: 1.6, textAlign: "center",
          margin: "0 0 22px",
        }}>{MOCK.jessLine}</p>

        <div style={{
          background: N.surface, border: `1px solid ${N.border}`,
          borderRadius: 18, padding: "16px 18px", marginBottom: 14,
        }}>
          <div style={{ fontFamily: UI, fontSize: 9.5, color: N.gold, letterSpacing: 1.6, fontWeight: 700, marginBottom: 6 }}>
            ON THIS DAY · LAST CYCLE
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 16,
            color: N.text, margin: 0, lineHeight: 1.6, opacity: 0.92,
          }}>“{MOCK.onThisDay.text}”</p>
        </div>

        <div style={{
          textAlign: "center", padding: "12px 16px",
          background: "rgba(217,122,58,0.10)", border: `1px solid rgba(217,122,58,0.25)`,
          borderRadius: 18,
        }}>
          <div style={{ fontFamily: UI, fontSize: 9.5, color: N.amber, letterSpacing: 1.6, fontWeight: 700, marginBottom: 4 }}>
            COMMUNITY · QUIET HOURS
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 15,
            color: N.text, margin: 0, opacity: 0.92,
          }}>{MOCK.community}</p>
        </div>
      </div>
      <style>{`@keyframes nl-pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.08); } }`}</style>
    </div>
  );
}

function PromptCard({ onWrite }) {
  const [i, setI] = useState(0);
  const prompts = [MOCK.prompt, ...MOCK.altPrompts];
  const current = prompts[i % prompts.length];
  return (
    <div style={{
      background: N.surface, border: `1px solid ${N.border}`,
      borderRadius: 18, padding: "16px 18px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ color: N.gold, fontFamily: CORM, fontSize: 16 }}>✦</span>
        <span style={{
          fontFamily: UI, fontSize: 9.5, color: N.silver,
          letterSpacing: 1.6, fontWeight: 700, opacity: 0.85,
        }}>JESS · LUTEAL · DAY {MOCK.cycleDay}</span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 18,
        color: N.text, lineHeight: 1.55, margin: "0 0 14px",
      }}>{current}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onWrite(current)} style={{
          background: "transparent", color: N.gold,
          border: `1px solid ${N.gold}`,
          borderRadius: 9999, padding: "8px 16px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>Write to this ✦</button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", color: N.silver,
          border: `1px solid ${N.border}`,
          borderRadius: 9999, padding: "8px 14px",
          fontFamily: UI, fontSize: 12.5, cursor: "pointer",
        }}>Different prompt →</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), 200); return () => clearTimeout(t); }, []);
  return (
    <article style={{
      background: N.surface, border: `1px solid ${N.border}`,
      borderRadius: 18, padding: "14px 16px", marginBottom: 16,
      opacity: shown ? 1 : 0, transition: "opacity 700ms ease-out",
    }}>
      <div style={{ fontFamily: UI, fontSize: 9.5, color: N.gold, letterSpacing: 1.6, fontWeight: 700, marginBottom: 6 }}>
        ON THIS DAY · LAST CYCLE
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 16,
        color: N.text, lineHeight: 1.55, margin: "0 0 10px", opacity: 0.92,
      }}>“{MOCK.onThisDay.text}”</p>
      <button onClick={onReply} style={{
        background: "transparent", color: N.gold,
        border: `1px solid ${N.gold}`,
        borderRadius: 9999, padding: "5px 13px",
        fontFamily: UI, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
      }}>Reply to past self →</button>
    </article>
  );
}

function CommunitySignal() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", marginBottom: 16,
      background: "transparent", border: `1px dashed ${N.border}`,
      borderRadius: 14,
    }}>
      <span style={{ fontSize: 16, color: N.amber }} aria-hidden>✦</span>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 13.5,
        color: N.silver, margin: 0,
      }}>{MOCK.community}</p>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
      {labels.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", margin: "0 auto 4px",
            background: MOCK.rhythm[i]
              ? `linear-gradient(135deg, ${N.silver}, ${N.violet})`
              : "transparent",
            border: MOCK.rhythm[i] ? "none" : `1px solid ${N.textDim}`,
          }} />
          <div style={{ fontFamily: UI, fontSize: 9.5, color: N.textDim, letterSpacing: 0.5 }}>{d}</div>
        </div>
      ))}
    </div>
  );
}

function EntryRow({ entry, onTap, last }) {
  return (
    <button onClick={() => onTap(entry)} style={{
      display: "block", width: "100%", textAlign: "left",
      background: "transparent", border: "none",
      borderBottom: last ? "none" : `1px solid ${N.border}`,
      padding: "14px 0", cursor: "pointer", position: "relative",
      boxShadow: entry.burn ? `0 0 24px rgba(217,122,58,0.20)` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }} aria-hidden>{entry.icon}</span>
        <span style={{
          fontFamily: UI, fontSize: 10, color: entry.colour,
          letterSpacing: 1.4, fontWeight: 700,
        }}>{entry.type.toUpperCase()}</span>
        <span style={{
          marginLeft: "auto", fontFamily: UI, fontSize: 11,
          color: N.textDim,
        }}>{entry.date}</span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 16,
        color: N.text, lineHeight: 1.55, margin: 0, opacity: 0.92,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{entry.body}</p>
    </button>
  );
}

function Composer({ open, onClose, seedPrompt }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [burn, setBurn] = useState(false);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(13,11,20,0.85)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "flex", alignItems: "stretch",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: N.bg, width: "100%", height: "100vh",
        padding: "26px 22px 30px", display: "flex", flexDirection: "column",
        color: N.text, overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{
            fontFamily: UI, fontSize: 10, color: N.silver,
            letterSpacing: 2, fontWeight: 700,
          }}>NEW ENTRY</span>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: N.silver, fontSize: 22, cursor: "pointer",
          }} aria-label="Close">×</button>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
          {ENTRY_TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button key={t.id} onClick={() => { setType(t.id); setBurn(t.id === "burn"); }} style={{
                flexShrink: 0,
                background: active ? N.surfaceHi : "transparent",
                color: active ? N.text : N.silver,
                border: `1px solid ${active ? N.silver : N.border}`,
                borderRadius: 9999, padding: "7px 13px",
                fontFamily: UI, fontSize: 12.5, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>

        {burn && (
          <div style={{
            border: `1px solid ${N.amber}`, borderRadius: 14,
            padding: "10px 14px", marginBottom: 14,
            background: "rgba(217,122,58,0.06)",
            boxShadow: `0 0 30px rgba(217,122,58,0.15)`,
          }}>
            <p style={{ margin: 0, fontFamily: CORM, fontStyle: "italic", fontSize: 14, color: N.amber }}>
              🔥 Write knowing it will disappear. Jess will never read this.
            </p>
          </div>
        )}

        {!burn && (
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 16,
            color: N.silver, lineHeight: 1.55, margin: "0 0 14px", opacity: 0.85,
          }}>{seedPrompt || MOCK.prompt}</p>
        )}

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Begin…"
          style={{
            flex: 1, minHeight: 260,
            background: "transparent", border: "none",
            color: N.text, padding: 0, resize: "none",
            fontFamily: CORM, fontSize: 19, lineHeight: 1.6, outline: "none",
            caretColor: N.violet,
          }}
        />

        <div style={{ marginTop: 14 }}>
          <button onClick={onClose} style={{
            width: "100%", background: "transparent", color: N.silver,
            border: `1px solid ${N.silver}`,
            borderRadius: 9999, padding: "12px 20px",
            fontFamily: UI, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          }}>Release into the dark ✦</button>
        </div>
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(13,11,20,0.85)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: N.bgGradTop, width: "100%", maxWidth: 640,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "22px 24px 30px", color: N.text,
        border: `1px solid ${N.border}`, borderBottom: "none",
      }}>
        <div style={{
          fontFamily: UI, fontSize: 10, color: entry.colour,
          letterSpacing: 1.6, fontWeight: 700, marginBottom: 8,
        }}>{entry.type.toUpperCase()}</div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 19,
          color: N.text, lineHeight: 1.65, margin: "0 0 12px", opacity: 0.94,
          whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 12, color: N.textDim }}>{entry.date}</div>
      </div>
    </div>
  );
}

export default function JournalDemo2() {
  const [insOpen, setInsOpen] = useState(false);
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (p = "") => { setSeed(p); setComposer(true); };

  return (
    <div style={{
      minHeight: "100vh", background: N.bg,
      backgroundImage: `radial-gradient(circle at 70% 20%, rgba(123,94,167,0.10) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(123,94,167,0.06) 0%, transparent 50%)`,
      paddingBottom: 60, color: N.text,
      animation: "nl-breath 8s ease-in-out infinite",
    }}>
      <style>{`@keyframes nl-breath { 0%,100% { background-position: 0% 0%, 100% 100%; } 50% { background-position: 2% 2%, 98% 98%; } }`}</style>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "30px 18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <div style={{
              fontFamily: UI, fontSize: 10, color: N.silver,
              letterSpacing: 2, fontWeight: 700, marginBottom: 4, opacity: 0.85,
            }}>LUTEAL · DAY {MOCK.cycleDay}</div>
            <h1 style={{
              fontFamily: CORM, fontStyle: "italic", fontSize: 32, fontWeight: 400,
              color: N.text, margin: 0,
            }}>Journal</h1>
            <p style={{
              fontFamily: CORM, fontStyle: "italic", fontSize: 14,
              color: N.textDim, margin: "2px 0 0",
            }}>A private hour.</p>
          </div>
          <button onClick={() => open()} style={{
            background: "transparent", color: N.gold,
            border: `1px solid ${N.gold}`,
            borderRadius: 9999, padding: "9px 17px",
            fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}>+ New entry</button>
        </div>

        <InsightsCard onExpand={() => setInsOpen(true)} />
        <PromptCard onWrite={(p) => open(p)} />
        <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <CommunitySignal />
        <RhythmStrip />

        <div style={{
          fontFamily: UI, fontSize: 9.5, color: N.silver,
          letterSpacing: 2, fontWeight: 700, marginBottom: 8, opacity: 0.7,
        }}>ENTRIES</div>
        <div>
          {MOCK.entries.map((e, i) => (
            <EntryRow key={e.id} entry={e} onTap={(en) => setDetail(en)} last={i === MOCK.entries.length - 1} />
          ))}
        </div>
      </div>

      {insOpen && <InsightsExpanded onClose={() => setInsOpen(false)} />}
      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
