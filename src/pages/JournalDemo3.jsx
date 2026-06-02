// JournalDemo3 — "Clean Lines" (Modern Native iOS)
// Interactive demo. Mock data only — no entity queries.
import { useState } from "react";

const K = {
  bg:      "#FFFFFF",
  cream:   "#F4EDDB",
  rule:    "#E8E8E8",
  text:    "#1C1C1E",
  textDim: "#6B6B70",
  espresso:"#3A2C1A",
  blush:   "#E8B4B8",
  sage:    "#8FAF8F",
  gold:    "#D4AF37",
  amber:   "#D97A3A",
  muted:   "#9B8B7A",
};
const SF = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI","Helvetica Neue",system-ui,sans-serif';
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';

const PHASE_COLOUR = { menstrual: K.blush, follicular: K.sage, ovulatory: K.gold, luteal: K.muted };

const MOCK = {
  phase: "luteal", cycleDay: 26,
  prompt: "The editing phase. What can you let go of? What genuinely matters?",
  altPrompts: [
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
  rhythm: [true, true, false, true, true, false, true],
  rhythmCounts: [3, 4, 0, 2, 3, 0, 5],
  jessLine: "On cycle day 26 last month, you wrote about feeling invisible. It's day 26 today.",
  community: "23 women in luteal are writing about boundaries this week.",
  onThisDay: { text: "I felt invisible at the meeting. Like I had to make myself larger to be heard.", date: "Last cycle · Day 26" },
  echoes: 42,
  entries: [
    { id: 1, type: "Reflection", emoji: "💭", colour: K.muted, body: "I keep editing myself before I speak. I don't think anyone asked me to.", date: "9:42" },
    { id: 2, type: "Work", emoji: "💼", colour: K.gold, body: "The deadline shifted again. Not sure how to plan around so much uncertainty.", date: "Yesterday" },
    { id: 3, type: "Burn", emoji: "🔥", colour: K.amber, body: "Things I'm not allowed to say out loud.", date: "2d · burns 4h", burn: true },
    { id: 4, type: "Joy", emoji: "☀️", colour: K.gold, body: "Coffee. Light. Small enough to almost miss.", date: "3d" },
    { id: 5, type: "Gratitude", emoji: "🌿", colour: K.sage, body: "Mum called for no reason. Just to say hello.", date: "4d" },
  ],
};

const ENTRY_TYPES = [
  { id: "free", label: "Free", emoji: "✏️" },
  { id: "gratitude", label: "Gratitude", emoji: "🌿" },
  { id: "mood", label: "Mood", emoji: "💛" },
  { id: "reflection", label: "Reflection", emoji: "💭" },
  { id: "work", label: "Work", emoji: "💼" },
  { id: "joy", label: "Joy", emoji: "☀️" },
];

function InsightsBar({ onToggle, expanded }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: K.bg, border: `1px solid ${K.rule}`,
      borderLeft: `4px solid ${PHASE_COLOUR[MOCK.phase]}`,
      borderRadius: 12, padding: "10px 14px", marginBottom: 14,
      minHeight: 48,
    }}>
      <div style={{ display: "flex", gap: 4 }} aria-label="Rhythm">
        {MOCK.rhythm.slice(0, 5).map((on, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: on ? K.text : "transparent",
            border: on ? "none" : `1px solid ${K.textDim}`,
          }} />
        ))}
      </div>
      <div style={{
        flex: 1, fontFamily: SF, fontSize: 13.5,
        color: K.text, fontWeight: 500, lineHeight: 1.35,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{MOCK.jessLine}</div>
      <span style={{
        fontFamily: SF, fontSize: 18, color: K.textDim,
        transition: "transform 200ms",
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      }}>↗</span>
    </button>
  );
}

function InsightsExpanded() {
  return (
    <div style={{
      background: K.cream, border: `1px solid ${K.rule}`,
      borderRadius: 12, padding: "16px 18px", marginBottom: 14,
    }}>
      <div style={{ fontFamily: SF, fontSize: 11, color: K.textDim, fontWeight: 600, letterSpacing: 0.4, marginBottom: 10 }}>
        WRITING RHYTHM · LAST 7 DAYS
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60, marginBottom: 14 }}>
        {MOCK.rhythmCounts.map((n, i) => {
          const today = i === MOCK.rhythmCounts.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${Math.max(4, n * 10)}px`,
                background: today ? K.gold : n > 0 ? K.espresso : "transparent",
                border: n === 0 ? `1px dashed ${K.textDim}` : "none",
                borderRadius: "4px 4px 0 0",
              }} />
              <div style={{ fontFamily: SF, fontSize: 10, color: K.textDim, marginTop: 4 }}>{["M","T","W","T","F","S","S"][i]}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: "flex", gap: 10, marginBottom: 12,
      }}>
        <div style={{
          flex: 1, background: K.bg, border: `1px solid ${K.rule}`,
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ fontFamily: SF, fontSize: 10, color: K.textDim, fontWeight: 600, letterSpacing: 0.4 }}>COMMUNITY</div>
          <div style={{ fontFamily: SF, fontSize: 18, color: K.text, fontWeight: 700 }}>{MOCK.echoes}</div>
          <div style={{ fontFamily: SF, fontSize: 11, color: K.textDim }}>echoes this week</div>
        </div>
        <div style={{
          flex: 1, background: K.bg, border: `1px solid ${K.rule}`,
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ fontFamily: SF, fontSize: 10, color: K.textDim, fontWeight: 600, letterSpacing: 0.4 }}>THIS CYCLE</div>
          <div style={{ fontFamily: SF, fontSize: 18, color: K.text, fontWeight: 700 }}>14</div>
          <div style={{ fontFamily: SF, fontSize: 11, color: K.textDim }}>entries</div>
        </div>
      </div>

      <div style={{
        background: K.bg, borderLeft: `3px solid ${K.gold}`,
        padding: "10px 12px", borderRadius: 4,
      }}>
        <div style={{ fontFamily: SF, fontSize: 10, color: K.textDim, fontWeight: 600, letterSpacing: 0.4, marginBottom: 4 }}>
          ON THIS DAY · LAST CYCLE
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 15,
          color: K.text, margin: 0, lineHeight: 1.5,
        }}>“{MOCK.onThisDay.text}”</p>
      </div>
    </div>
  );
}

function PromptCard({ onWrite }) {
  const [i, setI] = useState(0);
  const prompts = [MOCK.prompt, ...MOCK.altPrompts];
  const current = prompts[i % prompts.length];
  return (
    <div style={{
      background: K.cream, border: `1px solid ${K.rule}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: PHASE_COLOUR[MOCK.phase], display: "inline-block",
        }} />
        <span style={{ fontFamily: SF, fontSize: 11, color: K.textDim, fontWeight: 600, letterSpacing: 0.4 }}>
          JESS SUGGESTS · LUTEAL · DAY {MOCK.cycleDay}
        </span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 16,
        color: K.text, margin: "0 0 12px", lineHeight: 1.5,
      }}>{current}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onWrite(current)} style={{
          background: K.gold, color: K.espresso, border: "none",
          borderRadius: 9999, padding: "7px 14px",
          fontFamily: SF, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Write to this</button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", color: K.text,
          border: `1px solid ${K.rule}`,
          borderRadius: 9999, padding: "7px 12px",
          fontFamily: SF, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        }}>Different prompt</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  return (
    <article style={{
      background: K.bg, borderLeft: `4px solid ${K.gold}`,
      border: `1px solid ${K.rule}`, borderLeftWidth: 4,
      borderRadius: 12, padding: "12px 14px", marginBottom: 14,
    }}>
      <div style={{ fontFamily: SF, fontSize: 11, color: K.textDim, fontWeight: 600, letterSpacing: 0.4, marginBottom: 4 }}>
        ON THIS DAY · {MOCK.onThisDay.date.toUpperCase()}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 15,
        color: K.text, margin: "0 0 8px", lineHeight: 1.5,
      }}>“{MOCK.onThisDay.text}”</p>
      <button onClick={onReply} style={{
        background: "transparent", color: K.gold,
        border: "none", padding: 0,
        fontFamily: SF, fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>Reply to past self ↗</button>
    </article>
  );
}

function CommunityStat() {
  return (
    <div style={{
      background: K.bg, border: `1px solid ${K.rule}`,
      borderRadius: 12, padding: "10px 14px", marginBottom: 14,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: "50%",
        background: K.cream, display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 14,
      }}>✦</span>
      <p style={{ fontFamily: SF, fontSize: 13, color: K.text, margin: 0, fontWeight: 500 }}>
        {MOCK.community}
      </p>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["M","T","W","T","F","S","S"];
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: 6,
      marginBottom: 14, padding: "6px 4px",
    }}>
      {labels.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", margin: "0 auto 4px",
            background: MOCK.rhythm[i] ? K.text : "transparent",
            border: MOCK.rhythm[i] ? "none" : `1px solid ${K.textDim}`,
          }} />
          <div style={{ fontFamily: SF, fontSize: 10, color: K.textDim }}>{d}</div>
        </div>
      ))}
    </div>
  );
}

function EntryRow({ entry, onTap, last }) {
  const [reactOpen, setReactOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => onTap(entry)} style={{
        display: "block", width: "100%", textAlign: "left",
        background: K.bg, border: "none",
        borderBottom: last ? "none" : `1px solid ${K.rule}`,
        padding: "12px 4px", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: SF, fontSize: 10, color: entry.colour,
            fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
          }}>
            <span style={{ marginRight: 4 }}>{entry.emoji}</span>{entry.type}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: SF, fontSize: 12, color: K.textDim }}>
            {entry.date}
          </span>
        </div>
        <p style={{
          fontFamily: SF, fontSize: 14.5, color: K.text,
          lineHeight: 1.45, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{entry.body}</p>
      </button>
      {!entry.burn && (
        <button onClick={(e) => { e.stopPropagation(); setReactOpen(v => !v); }} style={{
          position: "absolute", top: 8, right: 6,
          background: "transparent", border: "none", color: K.textDim,
          fontSize: 16, cursor: "pointer", padding: 4,
        }} aria-label="React">⋯</button>
      )}
      {reactOpen && (
        <div style={{
          position: "absolute", top: 32, right: 0,
          background: K.bg, border: `1px solid ${K.rule}`,
          borderRadius: 9999, padding: "4px 10px",
          display: "flex", gap: 8, zIndex: 5,
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
        }}>
          {["🌩️", "☀️", "🌀", "❤️"].map((g) => (
            <button key={g} onClick={() => setReactOpen(false)} style={{
              background: "transparent", border: "none", cursor: "pointer", fontSize: 16,
            }}>{g}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function Composer({ open, onClose, seedPrompt }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [burn, setBurn] = useState(false);
  const [haptic, setHaptic] = useState(false);
  if (!open) return null;
  const handleSave = () => {
    setHaptic(true);
    setTimeout(() => { setHaptic(false); onClose(); }, 500);
  };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 90,
      background: "rgba(0,0,0,0.30)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: K.bg, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 14, borderTopRightRadius: 14,
        padding: "12px 18px 20px",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -12px 30px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          width: 36, height: 4, background: K.rule,
          borderRadius: 9999, margin: "0 auto 12px",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: K.gold,
            fontFamily: SF, fontSize: 15, fontWeight: 500, cursor: "pointer", padding: 0,
          }}>Cancel</button>
          <span style={{ fontFamily: SF, fontSize: 15, color: K.text, fontWeight: 600 }}>New entry</span>
          <button onClick={handleSave} style={{
            background: "transparent", border: "none", color: K.gold,
            fontFamily: SF, fontSize: 15, fontWeight: 700, cursor: "pointer", padding: 0,
          }}>Save</button>
        </div>

        <div style={{
          display: "flex", gap: 6, marginBottom: 12,
          padding: 2, background: K.cream, borderRadius: 10, overflowX: "auto",
        }}>
          {ENTRY_TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                flex: "0 0 auto",
                background: active ? K.bg : "transparent",
                color: K.text,
                border: "none", borderRadius: 8,
                padding: "6px 12px",
                fontFamily: SF, fontSize: 12, fontWeight: active ? 700 : 500,
                cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.10)" : "none",
              }}>
                <span style={{ marginRight: 4 }}>{t.emoji}</span>{t.label}
              </button>
            );
          })}
        </div>

        <div style={{
          background: K.cream, borderRadius: 10,
          padding: "10px 12px", marginBottom: 12,
        }}>
          <div style={{ fontFamily: SF, fontSize: 10, color: K.textDim, fontWeight: 600, letterSpacing: 0.4, marginBottom: 4 }}>
            JESS SUGGESTS
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 14.5,
            color: K.text, lineHeight: 1.5, margin: 0,
          }}>{seedPrompt || MOCK.prompt}</p>
        </div>

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Start writing…"
          autoFocus
          style={{
            border: "none", padding: 0, resize: "none",
            fontFamily: SF, fontSize: 15.5, lineHeight: 1.55, color: K.text,
            outline: "none", minHeight: 220, background: K.bg,
          }}
        />

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: `1px solid ${K.rule}`, marginTop: 6,
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SF, fontSize: 13, color: K.text, cursor: "pointer" }}>
            <span style={{ fontSize: 14 }}>🔥</span> Burn Mode
            <span onClick={(e) => { e.preventDefault(); setBurn(v => !v); }} style={{
              width: 36, height: 22, borderRadius: 9999,
              background: burn ? K.gold : K.rule,
              position: "relative", transition: "background 200ms",
              display: "inline-block",
            }}>
              <span style={{
                position: "absolute", top: 2, left: burn ? 16 : 2,
                width: 18, height: 18, borderRadius: "50%",
                background: K.bg, transition: "left 200ms",
                boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
              }} />
            </span>
          </label>
          {burn && (
            <span style={{ fontFamily: SF, fontSize: 12, color: K.amber, fontWeight: 600 }}>Set timer →</span>
          )}
        </div>
      </div>
      {haptic && (
        <div style={{
          position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
          background: K.text, color: K.bg, fontFamily: SF, fontSize: 12,
          padding: "5px 12px", borderRadius: 9999, opacity: 0.85,
        }}>haptic ✓</div>
      )}
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(0,0,0,0.30)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: K.bg, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 14, borderTopRightRadius: 14,
        padding: "18px 22px 26px",
      }}>
        <div style={{ width: 36, height: 4, background: K.rule, borderRadius: 9999, margin: "0 auto 14px" }} />
        <div style={{
          fontFamily: SF, fontSize: 10, color: entry.colour, fontWeight: 700, letterSpacing: 0.6, marginBottom: 8,
        }}>{entry.emoji} {entry.type.toUpperCase()}</div>
        <p style={{
          fontFamily: SF, fontSize: 15.5, color: K.text,
          lineHeight: 1.55, margin: "0 0 12px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: SF, fontSize: 12, color: K.textDim, marginBottom: 14 }}>{entry.date}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            background: K.gold, color: K.espresso, border: "none",
            borderRadius: 9999, padding: "8px 16px",
            fontFamily: SF, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>Ask Jess</button>
          <button style={{
            background: "transparent", color: K.text,
            border: `1px solid ${K.rule}`,
            borderRadius: 9999, padding: "8px 16px",
            fontFamily: SF, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Save to GP</button>
        </div>
      </div>
    </div>
  );
}

export default function JournalDemo3() {
  const [expand, setExpand] = useState(false);
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (p = "") => { setSeed(p); setComposer(true); };

  return (
    <div style={{ minHeight: "100vh", background: K.bg, paddingBottom: 60, color: K.text }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: PHASE_COLOUR[MOCK.phase],
              }} />
              <span style={{ fontFamily: SF, fontSize: 12, color: K.textDim, fontWeight: 600 }}>
                Luteal · Day {MOCK.cycleDay}
              </span>
            </div>
            <h1 style={{
              fontFamily: SF, fontSize: 28, fontWeight: 700,
              color: K.text, margin: 0, letterSpacing: -0.5,
            }}>Journal</h1>
          </div>
          <button onClick={() => open()} style={{
            background: K.gold, color: K.espresso, border: "none",
            borderRadius: 9999, padding: "9px 16px",
            fontFamily: SF, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>+ New</button>
        </div>

        <InsightsBar onToggle={() => setExpand(v => !v)} expanded={expand} />
        {expand && <InsightsExpanded />}
        <PromptCard onWrite={(p) => open(p)} />
        <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <CommunityStat />
        <RhythmStrip />

        <div style={{
          fontFamily: SF, fontSize: 11, color: K.textDim,
          fontWeight: 600, letterSpacing: 0.6, marginBottom: 6,
        }}>RECENT</div>
        <div>
          {MOCK.entries.map((e, i) => (
            <EntryRow key={e.id} entry={e} onTap={(en) => setDetail(en)} last={i === MOCK.entries.length - 1} />
          ))}
        </div>
      </div>

      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
