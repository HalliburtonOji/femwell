// JournalDemo2 — "Structured" (clean grid, high information density)
// Shared FemWell palette. Distinct via system-font primary, compact cards,
// flat borders, accordion expansion, iOS-style segmented controls.
import { useState } from "react";

const T = {
  cream:       "#F4EDDB",
  surface:     "#FAF5E8",
  paperHi:     "#FFFFFF",
  borderLight: "#E8DBC8",
  espresso:    "#3A2C1A",
  blush:       "#E8B4B8",
  sage:        "#8FAF8F",
  gold:        "#D4AF37",
  muted:       "#9B8B7A",
  amber:       "#D4882A",
};
const SF = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,system-ui,sans-serif';
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';

const PHASE_COLOUR = { menstrual: T.blush, follicular: T.sage, ovulatory: T.gold, luteal: T.muted };

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
  entries: [
    { id: 1, type: "Reflection", body: "I keep editing myself before I speak. I don't think anyone asked me to.", date: "9:42" },
    { id: 2, type: "Work",       body: "The deadline shifted again. Not sure how to plan around so much uncertainty.", date: "Yesterday" },
    { id: 3, type: "Burn",       body: "Things I'm not allowed to say out loud.", date: "2d · burns 4h", burn: true },
    { id: 4, type: "Joy",        body: "Coffee. Light. Small enough to almost miss.", date: "3d" },
    { id: 5, type: "Gratitude",  body: "Mum called for no reason. Just to say hello.", date: "4d" },
  ],
};

const ENTRY_TYPES = [
  { id: "free", label: "Free" },
  { id: "gratitude", label: "Gratitude" },
  { id: "mood", label: "Mood" },
  { id: "reflection", label: "Reflection" },
  { id: "work", label: "Work" },
  { id: "joy", label: "Joy" },
  { id: "grief", label: "Grief" },
];
const TYPE_PROMPTS = {
  free: "Write freely.",
  gratitude: "Name three things you're genuinely grateful for today.",
  mood: "How are you actually feeling — not the edited version?",
  reflection: "What went well? What would you do differently?",
  work: "What's the actual state of work right now?",
  joy: "Name one small actual thing that felt good.",
  grief: "You don't have to explain. Just say what's true.",
};

function PhasePill() {
  return (
    <span style={{
      background: T.sage, color: T.espresso,
      fontFamily: SF, fontSize: 12, fontWeight: 600,
      padding: "3px 9px", borderRadius: 6,
      letterSpacing: 0.1,
    }}>Luteal · Day {MOCK.cycleDay}</span>
  );
}

function InsightsCard({ expanded, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${T.borderLight}`,
      borderLeft: `3px solid ${T.gold}`,
      borderRadius: 10, padding: "12px 14px",
      minHeight: 56, marginBottom: 14,
    }}>
      <div style={{ display: "flex", gap: 3 }} aria-label="Writing rhythm">
        {MOCK.rhythm.slice(0, 5).map((on, i) => (
          <div key={i} style={{
            width: 6, height: 6,
            background: on ? T.espresso : "transparent",
            border: on ? "none" : `1px solid ${T.muted}`,
          }} />
        ))}
      </div>
      <div style={{
        flex: 1, fontFamily: SF, fontSize: 13.5,
        color: T.espresso, lineHeight: 1.4,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{MOCK.jessLine}</div>
      <span style={{
        fontFamily: SF, fontSize: 18, color: T.muted, marginLeft: 4,
        transition: "transform 180ms",
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      }}>›</span>
    </button>
  );
}

function InsightsExpanded() {
  return (
    <div style={{
      background: T.cream, border: `1px solid ${T.borderLight}`,
      borderRadius: 10, padding: "14px 16px", marginBottom: 14,
    }}>
      <div style={{
        fontFamily: SF, fontSize: 11, color: T.muted,
        fontWeight: 600, letterSpacing: 0.5, marginBottom: 10, textTransform: "uppercase",
      }}>Writing rhythm · 7 days</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 14 }}>
        {MOCK.rhythmCounts.map((n, i) => {
          const today = i === MOCK.rhythmCounts.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${Math.max(4, n * 10)}px`,
                background: today ? T.gold : n > 0 ? T.espresso : "transparent",
                border: n === 0 ? `1px dashed ${T.muted}` : "none",
                borderRadius: 2,
              }} />
              <div style={{ fontFamily: SF, fontSize: 10, color: T.muted, marginTop: 4 }}>{["M","T","W","T","F","S","S"][i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{
        fontFamily: SF, fontSize: 12.5, color: T.muted,
        padding: "10px 12px", background: T.surface, borderRadius: 8, marginBottom: 10,
      }}>{MOCK.community}</div>
      <div style={{
        borderLeft: `2px solid ${T.gold}`, padding: "8px 12px",
        background: T.paperHi, borderRadius: 4,
      }}>
        <div style={{ fontFamily: SF, fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
          On this day · last cycle
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 15,
          color: T.espresso, margin: 0, lineHeight: 1.5,
        }}>"{MOCK.onThisDay.text}"</p>
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
      background: T.paperHi, border: `1px solid ${T.borderLight}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: PHASE_COLOUR[MOCK.phase] }} />
        <span style={{ fontFamily: SF, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          Jess suggests · Day {MOCK.cycleDay}
        </span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 16,
        color: T.espresso, lineHeight: 1.5, margin: "0 0 10px",
      }}>{current}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onWrite(current)} style={{
          background: "transparent", color: T.sage,
          border: `1px solid ${T.sage}`,
          borderRadius: 9999, padding: "5px 12px",
          fontFamily: SF, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>Write to this</button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", color: T.muted,
          border: `1px solid ${T.borderLight}`,
          borderRadius: 9999, padding: "5px 12px",
          fontFamily: SF, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        }}>Different prompt</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  return (
    <div style={{
      background: T.paperHi, border: `1px solid rgba(58,44,26,0.20)`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 14,
    }}>
      <div style={{ fontFamily: SF, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
        On this day · {MOCK.onThisDay.date}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 15,
        color: T.espresso, margin: "0 0 8px", lineHeight: 1.5,
      }}>"{MOCK.onThisDay.text}"</p>
      <button onClick={onReply} style={{
        background: T.gold, color: T.espresso, border: "none",
        borderRadius: 9999, padding: "5px 12px",
        fontFamily: SF, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
      }}>Reply to past self</button>
    </div>
  );
}

function CommunityStat() {
  return (
    <div style={{
      background: T.paperHi, border: `1px solid ${T.borderLight}`,
      borderRadius: 10, padding: "10px 14px", marginBottom: 14,
      fontFamily: SF, fontSize: 13, color: T.espresso, fontWeight: 500,
    }}>
      <span style={{ color: T.gold, marginRight: 6 }}>✦</span>{MOCK.community}
    </div>
  );
}

function RhythmStrip() {
  const labels = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, padding: "4px 2px" }}>
      {labels.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 8, height: 8, margin: "0 auto 4px",
            background: MOCK.rhythm[i] ? T.espresso : "transparent",
            border: MOCK.rhythm[i] ? "none" : `1px solid ${T.muted}`,
          }} />
          <div style={{ fontFamily: SF, fontSize: 10, color: T.muted }}>{d}</div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry, onTap }) {
  return (
    <button onClick={() => onTap(entry)} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: `1px solid ${T.borderLight}`,
      borderRadius: 10, padding: "12px",
      marginBottom: 8,
      borderLeft: entry.burn ? `3px solid ${T.amber}` : `1px solid ${T.borderLight}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{
          background: T.cream, color: T.espresso,
          fontFamily: SF, fontSize: 10, fontWeight: 700,
          padding: "2px 6px", borderRadius: 4, letterSpacing: 0.4, textTransform: "uppercase",
        }}>{entry.burn ? "Burn 🔥" : entry.type}</span>
        <span style={{ fontFamily: SF, fontSize: 11, color: T.muted }}>{entry.date}</span>
      </div>
      <p style={{
        fontFamily: SF, fontSize: 14, color: T.espresso,
        lineHeight: 1.45, margin: 0,
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
  const [timer, setTimer] = useState("24h");
  if (!open) return null;
  const prompt = seedPrompt || TYPE_PROMPTS[type] || MOCK.prompt;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 90,
      background: "rgba(0,0,0,0.30)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 680,
        borderTopLeftRadius: 14, borderTopRightRadius: 14,
        padding: "14px 16px 20px",
        height: "60vh", display: "flex", flexDirection: "column",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: SF, fontSize: 14, color: T.gold, fontWeight: 500, padding: 0,
          }}>Cancel</button>
          <span style={{ fontFamily: SF, fontSize: 15, color: T.espresso, fontWeight: 700 }}>New entry</span>
          <button onClick={onClose} style={{
            background: T.espresso, color: T.cream, border: "none",
            fontFamily: SF, fontSize: 13, fontWeight: 700, padding: "5px 12px",
            borderRadius: 9999, cursor: "pointer",
          }}>Save</button>
        </div>

        {/* iOS-style segmented control */}
        <div style={{
          display: "flex", gap: 2, marginBottom: 12,
          padding: 2, background: T.cream, borderRadius: 8,
          overflowX: "auto",
        }}>
          {ENTRY_TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                flex: "0 0 auto",
                background: active ? T.espresso : "transparent",
                color: active ? T.cream : T.espresso,
                border: "none", borderRadius: 6,
                padding: "5px 10px",
                fontFamily: SF, fontSize: 12, fontWeight: 600, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>{t.label}</button>
            );
          })}
        </div>

        <div style={{
          background: "rgba(143,175,143,0.14)", borderRadius: 10,
          padding: "8px 12px", marginBottom: 12,
        }}>
          <div style={{ fontFamily: SF, fontSize: 10.5, color: T.sage, fontWeight: 700, letterSpacing: 0.5, marginBottom: 2, textTransform: "uppercase" }}>
            Jess suggests
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 14.5,
            color: T.espresso, lineHeight: 1.5, margin: 0,
          }}>{prompt}</p>
        </div>

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Start writing…"
          style={{
            flex: 1, border: `1px solid ${T.borderLight}`,
            borderRadius: 8, padding: "10px 12px", resize: "none",
            fontFamily: SF, fontSize: 14.5, lineHeight: 1.55, color: T.espresso,
            outline: "none", background: T.paperHi,
          }}
        />

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: `1px solid ${T.borderLight}`, marginTop: 10,
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SF, fontSize: 13, color: T.espresso, cursor: "pointer" }}>
            <span>🔥 Burn Mode</span>
            <span onClick={(e) => { e.preventDefault(); setBurn(v => !v); }} style={{
              width: 36, height: 22, borderRadius: 9999,
              background: burn ? T.gold : T.borderLight,
              position: "relative", transition: "background 180ms",
              display: "inline-block",
            }}>
              <span style={{
                position: "absolute", top: 2, left: burn ? 16 : 2,
                width: 18, height: 18, borderRadius: "50%",
                background: T.paperHi, transition: "left 180ms",
                boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
              }} />
            </span>
          </label>
        </div>
        {burn && (
          <div style={{
            display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap",
          }}>
            {["1h","24h","Choose date","Tap to burn"].map(t => (
              <button key={t} onClick={() => setTimer(t)} style={{
                background: timer === t ? T.amber : "transparent",
                color: timer === t ? T.paperHi : T.amber,
                border: `1px solid ${T.amber}`,
                borderRadius: 9999, padding: "4px 10px",
                fontFamily: SF, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.30)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 680,
        borderTopLeftRadius: 14, borderTopRightRadius: 14,
        padding: "16px 18px 22px",
      }}>
        <div style={{ width: 36, height: 4, background: T.borderLight, borderRadius: 9999, margin: "0 auto 14px" }} />
        <span style={{
          background: T.cream, color: T.espresso,
          fontFamily: SF, fontSize: 10, fontWeight: 700,
          padding: "2px 6px", borderRadius: 4, letterSpacing: 0.4, textTransform: "uppercase",
        }}>{entry.burn ? "Burn" : entry.type}</span>
        <p style={{
          fontFamily: SF, fontSize: 14.5, color: T.espresso,
          lineHeight: 1.55, margin: "12px 0 8px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: SF, fontSize: 12, color: T.muted }}>{entry.date}</div>
      </div>
    </div>
  );
}

export default function JournalDemo2() {
  const [expand, setExpand] = useState(false);
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (p = "") => { setSeed(p); setComposer(true); };

  return (
    <div style={{ minHeight: "100vh", background: T.surface, paddingBottom: 60 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h1 style={{ fontFamily: SF, fontSize: 17, fontWeight: 700, color: T.espresso, margin: 0 }}>
              Journal
            </h1>
            <div style={{ marginTop: 4 }}><PhasePill /></div>
          </div>
          <button onClick={() => open()} style={{
            background: T.gold, color: T.espresso, border: "none",
            borderRadius: 9999, padding: "8px 14px",
            fontFamily: SF, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>+ New entry</button>
        </div>

        <InsightsCard expanded={expand} onToggle={() => setExpand(v => !v)} />
        {expand && <InsightsExpanded />}
        <PromptCard onWrite={(p) => open(p)} />
        <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <CommunityStat />
        <RhythmStrip />

        <div style={{ fontFamily: SF, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
          Recent
        </div>
        {MOCK.entries.map((e) => (
          <EntryCard key={e.id} entry={e} onTap={(en) => setDetail(en)} />
        ))}
      </div>

      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
