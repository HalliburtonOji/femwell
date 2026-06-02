// JournalDemo4 — "Bold" (high-contrast espresso cards on cream)
// Shared FemWell palette. Distinct via inverted entry cards (dark on light),
// dramatic Cormorant Bold headers, gold accents that speak loudly.
import { useState } from "react";

const T = {
  cream:    "#F4EDDB",
  surface:  "#FAF5E8",
  paperHi:  "#FFFDF5",
  espresso: "#3A2C1A",
  espressoHi: "#4A3826",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  gold:     "#D4AF37",
  muted:    "#9B8B7A",
  amber:    "#D4882A",
};
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

const PHASE_COLOUR = { menstrual: T.blush, follicular: T.sage, ovulatory: T.gold, luteal: T.muted };

const MOCK = {
  phase: "luteal", cycleDay: 26,
  prompt: "The editing phase. What can you let go of? What genuinely matters?",
  altPrompts: [
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
  rhythm: [true, true, false, true, true, false, true],
  jessLine: "On cycle day 26 last month, you wrote about feeling invisible. It's day 26 today.",
  community: "23 women in luteal are writing about boundaries this week.",
  onThisDay: { text: "I felt invisible at the meeting. Like I had to make myself larger to be heard.", date: "Cycle day 26" },
  entries: [
    { id: 1, type: "Reflection", body: "Today I noticed I keep editing myself before I speak. I don't think anyone asked me to.", date: "Today · 9:42am" },
    { id: 2, type: "Work",       body: "The deadline shifted again. I'm not sure how to plan around so much uncertainty.", date: "Yesterday" },
    { id: 3, type: "Burn",       body: "Things I'm not allowed to say out loud — even to myself.", date: "2 days ago · burns 4h", burn: true },
    { id: 4, type: "Joy",        body: "The coffee. The angle of light on the table.", date: "3 days ago" },
    { id: 5, type: "Gratitude",  body: "Mum called for no reason. Just to say hello.", date: "4 days ago" },
  ],
};

const ENTRY_TYPES = [
  { id: "free", label: "Free write" },
  { id: "gratitude", label: "Gratitude" },
  { id: "mood", label: "Mood" },
  { id: "reflection", label: "Reflection" },
  { id: "work", label: "Work" },
  { id: "relationships", label: "Relationships" },
  { id: "joy", label: "Joy" },
  { id: "grief", label: "Grief" },
];
const TYPE_PROMPTS = {
  free: "Write freely.",
  gratitude: "Name three things you're genuinely grateful for today.",
  mood: "How are you actually feeling — not the edited version?",
  reflection: "What went well? What would you do differently?",
  work: "What's the actual state of work right now?",
  relationships: "Who's on your mind?",
  joy: "Name one small actual thing that felt good.",
  grief: "You don't have to explain. Just say what's true.",
};

function PhasePill() {
  return (
    <span style={{
      background: T.espresso, color: T.cream,
      fontFamily: UI, fontSize: 11.5, fontWeight: 700,
      padding: "5px 12px", borderRadius: 9999,
      letterSpacing: 0.4, textTransform: "uppercase",
    }}>Luteal · Day {MOCK.cycleDay}</span>
  );
}

function InsightsCard({ onExpand }) {
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "center", gap: 14,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: T.espresso, color: T.cream,
      border: "none", borderLeft: `4px solid ${T.gold}`,
      borderRadius: 16, padding: "16px 18px", marginBottom: 24,
      boxShadow: "0 4px 16px rgba(58,44,26,0.25)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
          ✦ JESS
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16.5,
          color: T.cream, lineHeight: 1.5, margin: 0,
        }}>{MOCK.jessLine}</p>
      </div>
      <div style={{ display: "flex", gap: 5 }} aria-label="Writing rhythm">
        {MOCK.rhythm.slice(0, 5).map((on, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: on ? T.cream : "transparent",
            border: on ? "none" : `1px solid ${T.cream}`,
            opacity: on ? 1 : 0.55,
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
      background: "rgba(58,44,26,0.65)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.espresso, color: T.cream,
        width: "100%", maxWidth: 680,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "24px 22px 30px",
        boxShadow: "0 -8px 30px rgba(58,44,26,0.40)",
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 18px" }} />
        <div style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.08) 0%, transparent 60%)",
          padding: "20px 14px", borderRadius: 14, marginBottom: 14,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
            ✦ JESS
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontWeight: 700, fontSize: 20,
            color: T.cream, lineHeight: 1.5, margin: 0,
          }}>{MOCK.jessLine}</p>
        </div>

        <div style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.08) 0%, transparent 60%)",
          padding: "16px 14px", borderRadius: 14, marginBottom: 14,
        }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
            ON THIS DAY · {MOCK.onThisDay.date.toUpperCase()}
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 17,
            color: T.cream, lineHeight: 1.55, margin: 0,
          }}>"{MOCK.onThisDay.text}"</p>
        </div>

        <div style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 60%)",
          padding: "14px", borderRadius: 14, textAlign: "center",
        }}>
          <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14.5, color: T.cream, margin: 0, opacity: 0.92 }}>
            {MOCK.community}
          </p>
        </div>
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
      background: T.paperHi, borderRadius: 16,
      border: `1px solid rgba(58,44,26,0.10)`,
      padding: "20px 22px", marginBottom: 24,
    }}>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 8 }}>
        ✦ JESS · DAY {MOCK.cycleDay}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontWeight: 700, fontSize: 22,
        color: T.espresso, lineHeight: 1.45, margin: "0 0 16px", letterSpacing: -0.2,
      }}>{current}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onWrite(current)} style={{
          background: T.gold, color: T.espresso, border: "none",
          borderRadius: 9999, padding: "9px 18px",
          fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Write to this ✦</button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: T.espresso, color: T.cream, border: "none",
          borderRadius: 9999, padding: "9px 16px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>Different prompt</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  return (
    <div style={{
      background: T.espresso, color: T.cream,
      borderRadius: 16, padding: "16px 20px", marginBottom: 24,
      boxShadow: "0 4px 16px rgba(58,44,26,0.25)",
    }}>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
        ON THIS DAY · {MOCK.onThisDay.date.toUpperCase()}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 17,
        color: T.cream, lineHeight: 1.55, margin: "0 0 12px",
      }}>"{MOCK.onThisDay.text}"</p>
      <button onClick={onReply} style={{
        background: T.gold, color: T.espresso, border: "none",
        borderRadius: 9999, padding: "6px 14px",
        fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
      }}>Reply to past self ✦</button>
    </div>
  );
}

function CommunityStrip() {
  return (
    <div style={{
      background: T.paperHi, border: `1px solid rgba(58,44,26,0.10)`,
      borderLeft: `3px solid ${T.gold}`,
      borderRadius: 12, padding: "12px 16px", marginBottom: 24,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ color: T.gold, fontSize: 16 }}>✦</span>
      <p style={{ fontFamily: CORM, fontStyle: "italic", fontWeight: 500, fontSize: 15, color: T.espresso, margin: 0 }}>
        {MOCK.community}
      </p>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
      {labels.map((d, i) => (
        <div key={d} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%", margin: "0 auto 5px",
            background: MOCK.rhythm[i] ? T.espresso : "transparent",
            border: MOCK.rhythm[i] ? "none" : `1px solid ${T.muted}`,
          }} />
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>{d}</div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry, onTap }) {
  return (
    <article onClick={() => onTap(entry)} style={{
      background: T.espresso, color: T.cream,
      borderRadius: 16, padding: "18px 22px 16px",
      marginBottom: 14, cursor: "pointer",
      boxShadow: "0 4px 16px rgba(58,44,26,0.25)",
      borderLeft: entry.burn ? `4px solid ${T.amber}` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          background: T.gold, color: T.espresso,
          fontFamily: UI, fontSize: 10, fontWeight: 700,
          padding: "3px 10px", borderRadius: 9999, letterSpacing: 0.8, textTransform: "uppercase",
        }}>{entry.burn ? "Burn 🔥" : entry.type}</span>
        <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11.5, color: T.cream, opacity: 0.7 }}>
          {entry.date}
        </span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 17,
        color: T.cream, lineHeight: 1.55, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        overflow: "hidden", opacity: 0.94,
      }}>{entry.body}</p>
    </article>
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 90, background: T.cream,
      padding: "24px 20px 30px", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <PhasePill />
        <button onClick={onClose} style={{
          background: T.espresso, color: T.cream, border: "none",
          borderRadius: 9999, padding: "6px 14px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
        }}>Close</button>
      </div>

      <h2 style={{
        fontFamily: CORM, fontWeight: 700, fontSize: 28,
        color: T.espresso, margin: "0 0 18px", letterSpacing: -0.3,
      }}>
        {ENTRY_TYPES.find(t => t.id === type)?.label || "Free write"}
      </h2>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 18 }}>
        {ENTRY_TYPES.map((t) => {
          const active = t.id === type;
          return (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              flexShrink: 0,
              background: active ? T.gold : T.espresso,
              color: active ? T.espresso : T.gold,
              border: "none",
              borderRadius: 9999, padding: "6px 14px",
              fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap",
            }}>{t.label}</button>
          );
        })}
        <button onClick={() => setBurn(v => !v)} style={{
          flexShrink: 0,
          background: burn ? T.amber : T.espresso,
          color: burn ? T.espresso : T.amber,
          border: `1px solid ${T.amber}`,
          borderRadius: 9999, padding: "6px 14px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          whiteSpace: "nowrap",
        }}>🔥 Burn mode</button>
      </div>

      <div style={{
        background: T.espresso, color: T.cream,
        borderRadius: 14, padding: "12px 16px", marginBottom: 18,
        borderLeft: `3px solid ${T.gold}`,
      }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
          ✦ JESS
        </div>
        <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 16, color: T.cream, margin: 0, lineHeight: 1.55 }}>
          {prompt}
        </p>
      </div>

      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Write…"
        style={{
          width: "100%", minHeight: 240,
          background: T.paperHi, border: `1px solid rgba(58,44,26,0.10)`,
          borderRadius: 14, padding: 18, resize: "none",
          fontFamily: CORM, fontSize: 20, lineHeight: 1.6,
          color: T.espresso, outline: "none",
        }}
      />

      {burn && (
        <div style={{
          marginTop: 14, background: T.espresso, borderRadius: 14,
          padding: "12px 14px", borderLeft: `3px solid ${T.amber}`,
        }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.amber, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
            🔥 BURN TIMER
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["1h","24h","Choose date","Tap to burn"].map(t => (
              <button key={t} onClick={() => setTimer(t)} style={{
                background: timer === t ? T.amber : "transparent",
                color: timer === t ? T.espresso : T.amber,
                border: `1px solid ${T.amber}`,
                borderRadius: 9999, padding: "5px 12px",
                fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <button onClick={onClose} style={{
        width: "100%", marginTop: 18,
        background: T.gold, color: T.espresso, border: "none",
        borderRadius: 9999, padding: "12px 20px",
        fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>Save entry ✓</button>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70, background: "rgba(58,44,26,0.65)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.espresso, color: T.cream,
        width: "100%", maxWidth: 680,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "22px 24px 30px",
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 16px" }} />
        <span style={{
          background: T.gold, color: T.espresso,
          fontFamily: UI, fontSize: 10.5, fontWeight: 700,
          padding: "3px 10px", borderRadius: 9999, letterSpacing: 0.8, textTransform: "uppercase",
        }}>{entry.burn ? "Burn" : entry.type}</span>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 18,
          color: T.cream, lineHeight: 1.65, margin: "16px 0 12px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.cream, opacity: 0.7 }}>{entry.date}</div>
      </div>
    </div>
  );
}

export default function JournalDemo4() {
  const [insOpen, setInsOpen] = useState(false);
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (p = "") => { setSeed(p); setComposer(true); };

  return (
    <div style={{ minHeight: "100vh", background: T.surface, paddingBottom: 60 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "26px 16px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontFamily: CORM, fontSize: 38, fontWeight: 700,
              color: T.espresso, margin: 0, letterSpacing: -0.6,
            }}>Journal</h1>
            <div style={{ marginTop: 8 }}><PhasePill /></div>
          </div>
          <button onClick={() => open()} style={{
            background: T.gold, color: T.espresso, border: "none",
            borderRadius: 9999, padding: "10px 18px",
            fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          }}>+ New entry</button>
        </div>

        <InsightsCard onExpand={() => setInsOpen(true)} />
        <PromptCard onWrite={(p) => open(p)} />
        <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <CommunityStrip />
        <RhythmStrip />

        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 700, letterSpacing: 1.4, marginBottom: 12 }}>
          ENTRIES
        </div>
        {MOCK.entries.map((e) => (
          <EntryCard key={e.id} entry={e} onTap={(en) => setDetail(en)} />
        ))}
      </div>

      {insOpen && <InsightsExpanded onClose={() => setInsOpen(false)} />}
      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
