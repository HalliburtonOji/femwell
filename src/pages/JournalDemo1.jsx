// JournalDemo1 — "Editorial" (dramatic serif, magazine layout)
// Shared FemWell palette. Distinct via typography, layout, hierarchy.
import { useState } from "react";
import { Sparkles, Flame } from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  surface:  "#FAF5E8",
  paperHi:  "#FFFDF5",
  espresso: "#3A2C1A",
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
  onThisDay: { text: "I felt invisible at the meeting. Like I had to make myself larger to be heard. Tired of it.", date: "Last cycle · Day 26" },
  entries: [
    { id: 1, type: "Reflection", body: "Today I noticed I keep editing myself before I speak. I don't think anyone asked me to.", date: "Today · 9:42am" },
    { id: 2, type: "Work",       body: "The deadline shifted again. I'm not sure how to plan around so much uncertainty.", date: "Yesterday" },
    { id: 3, type: "Burn",       body: "Things I'm not allowed to say out loud — even to myself.", date: "2 days ago · burns in 4h", burn: true },
    { id: 4, type: "Joy",        body: "The coffee this morning. The exact angle of the sunlight on the table.", date: "3 days ago" },
    { id: 5, type: "Gratitude",  body: "Mum called for no reason. Just to say hello.", date: "4 days ago" },
  ],
};

const TYPE_COLOUR = {
  "Free write":    "#3A2C1A",
  "Gratitude":     "#D4AF37",
  "Mood":          "#E8B4B8",
  "Mood journal":  "#E8B4B8",
  "Reflection":    "#8FAF8F",
  "Work":          "#5C7A7A",
  "Work & Career": "#5C7A7A",
  "Relationships": "#C4556B",
  "Money":         "#8B6914",
  "Creative":      "#C4892A",
  "Grief":         "#9B8B7A",
  "Joy":           "#5EA05E",
  "Identity":      "#6B4FA0",
  "Burn":          "#D4882A",
  "Burn Mode":     "#D4882A",
};

function tintFor(label) {
  const c = TYPE_COLOUR[label] || T.espresso;
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return { stripe: c, tint: `rgba(${r},${g},${b},0.04)` };
}

const ENTRY_TYPES = [
  { id: "free", label: "Free write" },
  { id: "gratitude", label: "Gratitude" },
  { id: "mood", label: "Mood" },
  { id: "reflection", label: "Reflection" },
  { id: "work", label: "Work" },
  { id: "relationships", label: "Relationships" },
  { id: "money", label: "Money" },
  { id: "creative", label: "Creative" },
  { id: "grief", label: "Grief" },
  { id: "joy", label: "Joy" },
  { id: "identity", label: "Identity" },
];

const TYPE_PROMPTS = {
  free: "Write freely.",
  gratitude: "Name three things you're genuinely grateful for today.",
  mood: "How are you actually feeling — not the edited version?",
  reflection: "What went well? What would you do differently?",
  work: "What's the actual state of work right now?",
  relationships: "Who's on your mind?",
  money: "What's your relationship with money this month?",
  creative: "What did you make, imagine or notice?",
  grief: "You don't have to explain. Just say what's true.",
  joy: "Name one small actual thing that felt good.",
  identity: "Who are you becoming?",
};

// Tiny utility ruler that appears under labels
function Rule() {
  return <div style={{ width: 24, height: 1, background: T.gold, marginTop: 4 }} />;
}

function SmallCaps({ children, mb = 0 }) {
  return (
    <div style={{
      fontFamily: UI, fontSize: 10.5, color: T.muted,
      letterSpacing: 1.6, fontWeight: 600, textTransform: "uppercase",
      marginBottom: mb,
    }}>{children}</div>
  );
}

function InsightsCard({ onExpand }) {
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "center", gap: 18,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: T.paperHi, border: "none",
      borderRadius: 4, padding: "22px 24px",
      boxShadow: "0 1px 3px rgba(58,44,26,0.08), 0 4px 12px rgba(58,44,26,0.06), 0 0 0 1px rgba(58,44,26,0.04)",
      marginBottom: 40,
    }}>
      <div style={{ width: 2, height: 40, background: T.gold }} />
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 18,
          color: T.espresso, margin: 0, lineHeight: 1.45, fontWeight: 400,
        }}>{MOCK.jessLine}</p>
        <SmallCaps mb={0}>From Jess <Sparkles size={11} style={{ display: "inline", verticalAlign: "-1px" }} /></SmallCaps>
      </div>
      <div style={{ display: "flex", gap: 6 }} aria-label="Writing rhythm">
        {MOCK.rhythm.slice(0, 5).map((on, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: on ? T.espresso : "transparent",
            border: on ? "none" : `1px solid ${T.muted}`,
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
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 580,
        padding: "40px 36px 36px", borderRadius: 4,
        boxShadow: "0 8px 40px rgba(58,44,26,0.18)",
      }}>
        <SmallCaps mb={20}>From Jess <Sparkles size={11} style={{ display: "inline", verticalAlign: "-1px" }} /></SmallCaps>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 26,
          color: T.espresso, lineHeight: 1.45, margin: "0 0 26px", fontWeight: 400,
        }}>{MOCK.jessLine}</p>
        <Rule />
        <div style={{ marginTop: 24, marginBottom: 18 }}>
          <SmallCaps mb={8}>This cycle</SmallCaps>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1;
              const wrote = [1, 3, 5, 12, 14, 17, 21, 23, 24, 26].includes(day);
              return (
                <div key={day} style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: wrote ? T.espresso : "transparent",
                  border: `1px solid ${wrote ? T.espresso : T.muted}`,
                  fontFamily: UI, fontSize: 9, color: wrote ? T.cream : T.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{day}</div>
              );
            })}
          </div>
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16,
          color: T.muted, lineHeight: 1.5, margin: 0,
        }}>{MOCK.community}</p>
      </div>
    </div>
  );
}

function PromptCard({ onWrite }) {
  const [i, setI] = useState(0);
  const prompts = [MOCK.prompt, ...MOCK.altPrompts];
  const current = prompts[i % prompts.length];
  return (
    <div style={{ marginBottom: 40 }}>
      <SmallCaps mb={12}>Jess · Luteal · Day {MOCK.cycleDay}</SmallCaps>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 22,
        color: T.espresso, lineHeight: 1.5, margin: "0 0 18px", fontWeight: 400,
      }}>{current}</p>
      <div style={{ display: "flex", gap: 28 }}>
        <button onClick={() => onWrite(current)} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: CORM, fontSize: 17, color: T.gold, fontStyle: "italic",
          padding: 0, borderBottom: `1px solid ${T.gold}`, paddingBottom: 2,
        }}>Write to this <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: UI, fontSize: 13, color: T.muted, padding: 0,
        }}>Different prompt →</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  return (
    <div style={{ position: "relative", marginBottom: 40, padding: "28px 30px 24px", background: T.paperHi, borderRadius: 4,
      boxShadow: "0 1px 3px rgba(58,44,26,0.08), 0 4px 12px rgba(58,44,26,0.06), 0 0 0 1px rgba(58,44,26,0.04)",
    }}>
      <div style={{
        position: "absolute", top: -10, left: 18,
        fontFamily: CORM, fontSize: 120, color: T.gold,
        opacity: 0.20, lineHeight: 1, fontWeight: 600,
      }} aria-hidden>“</div>
      <SmallCaps mb={10}>From last cycle · Day {MOCK.cycleDay}</SmallCaps>
      <Rule />
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 22,
        color: T.espresso, lineHeight: 1.5, margin: "16px 0 18px", fontWeight: 400,
        position: "relative",
      }}>{MOCK.onThisDay.text}</p>
      <button onClick={onReply} style={{
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: CORM, fontSize: 16, color: T.gold, fontStyle: "italic",
        padding: 0, borderBottom: `1px solid ${T.gold}`, paddingBottom: 2,
      }}>Reply to past self <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></button>
    </div>
  );
}

function CommunityStrip() {
  return (
    <div style={{ marginBottom: 32 }}>
      <SmallCaps mb={6}>Community</SmallCaps>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 17,
        color: T.muted, margin: 0, lineHeight: 1.5,
      }}>{MOCK.community}</p>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div style={{ marginBottom: 40 }}>
      <SmallCaps mb={10}>This week</SmallCaps>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {labels.map((d, i) => (
          <div key={d} style={{ textAlign: "center" }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", margin: "0 auto 6px",
              background: MOCK.rhythm[i] ? T.espresso : "transparent",
              border: MOCK.rhythm[i] ? "none" : `1px solid ${T.muted}`,
            }} />
            <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryCard({ entry, i, onTap }) {
  const rot = i % 2 === 0 ? 0.3 : -0.2;
  const label = entry.burn ? "Burn" : entry.type;
  const { stripe, tint } = tintFor(label);
  return (
    <article onClick={() => onTap(entry)} style={{
      background: tint || T.paperHi, borderRadius: 4,
      padding: "22px 26px 20px 26px", marginBottom: 22,
      cursor: "pointer", transform: `rotate(${rot}deg)`,
      boxShadow: "0 1px 3px rgba(58,44,26,0.08), 0 4px 12px rgba(58,44,26,0.06), 0 0 0 1px rgba(58,44,26,0.04)",
      borderLeft: `4px solid ${stripe}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Card body sits over the paper white so the 4% tint reads on the warm paper rest of the bg */}
      <div style={{
        position: "absolute", inset: "0 0 0 4px",
        background: T.paperHi, opacity: 1, zIndex: 0,
      }} />
      <div style={{
        position: "absolute", inset: "0 0 0 4px",
        background: tint, zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SmallCaps mb={0}>{label}</SmallCaps>
        <Rule />
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 20,
          color: T.espresso, lineHeight: 1.55, margin: "14px 0 12px", fontWeight: 500,
        }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, letterSpacing: 0.3 }}>
          {entry.date}
        </div>
      </div>
    </article>
  );
}

function Composer({ open, onClose, seedPrompt }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  if (!open) return null;
  const prompt = seedPrompt || TYPE_PROMPTS[type] || MOCK.prompt;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 90, background: T.surface,
      padding: "32px 32px 40px", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <SmallCaps>A new entry</SmallCaps>
        <button onClick={onClose} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: UI, fontSize: 13, color: T.muted,
        }}>Close</button>
      </div>

      <h2 style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 36, fontWeight: 700,
        color: T.espresso, margin: "0 0 24px", letterSpacing: -0.5,
      }}>
        {ENTRY_TYPES.find(t => t.id === type)?.label || "Free write"}
      </h2>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        {ENTRY_TYPES.map((t) => (
          <button key={t.id} onClick={() => setType(t.id)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: UI, fontSize: 12.5, color: t.id === type ? T.gold : T.muted,
            padding: 0, fontWeight: t.id === type ? 700 : 400, letterSpacing: 0.5,
            borderBottom: t.id === type ? `1px solid ${T.gold}` : "none",
            paddingBottom: 2,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{
        paddingLeft: 18, borderLeft: `1px solid ${T.gold}`, marginBottom: 28,
      }}>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 20,
          color: T.espresso, lineHeight: 1.55, margin: 0, fontWeight: 400,
        }}>{prompt}</p>
      </div>

      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Begin…"
        style={{
          width: "100%", minHeight: 320,
          background: T.paperHi, border: "none",
          padding: "20px 22px", borderRadius: 4, resize: "none",
          fontFamily: CORM, fontSize: 22, lineHeight: 1.6,
          color: T.espresso, outline: "none", fontStyle: "italic",
          boxShadow: "0 1px 3px rgba(58,44,26,0.08), 0 4px 12px rgba(58,44,26,0.06)",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <button style={{
          background: "transparent", border: `1px solid ${T.gold}`,
          padding: "12px 28px", cursor: "pointer",
          fontFamily: CORM, fontSize: 16, color: T.gold, fontStyle: "italic",
          borderRadius: 4,
        }} onClick={onClose}>Save entry</button>
        <button style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: UI, fontSize: 13, color: T.amber, padding: 0,
        }}><Flame size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Burn this entry</button>
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 580,
        padding: "36px 32px", borderRadius: 4,
        boxShadow: "0 8px 40px rgba(58,44,26,0.18)",
      }}>
        <SmallCaps>{entry.burn ? "Burn" : entry.type}</SmallCaps>
        <Rule />
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 22,
          color: T.espresso, lineHeight: 1.6, margin: "20px 0 16px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: 0.5 }}>{entry.date}</div>
      </div>
    </div>
  );
}

export default function JournalDemo1() {
  const [insOpen, setInsOpen] = useState(false);
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (p = "") => { setSeed(p); setComposer(true); };

  return (
    <div style={{ minHeight: "100vh", background: T.surface, paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 32px 24px" }}>
        <SmallCaps mb={4}>The Journal</SmallCaps>
        <h1 style={{
          fontFamily: CORM, fontSize: 60, fontWeight: 300,
          color: T.muted, margin: 0, letterSpacing: -1, lineHeight: 1,
          textTransform: "capitalize",
        }}>Luteal</h1>
        <div style={{ marginTop: 8 }}>
          <SmallCaps>Day {MOCK.cycleDay}</SmallCaps>
        </div>
        <button onClick={() => open()} style={{
          marginTop: 24,
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: CORM, fontSize: 17, color: T.gold, fontStyle: "italic",
          padding: 0, borderBottom: `1px solid ${T.gold}`, paddingBottom: 2,
        }}>+ Begin a new entry <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></button>

        <div style={{ marginTop: 48 }}>
          <InsightsCard onExpand={() => setInsOpen(true)} />
          <PromptCard onWrite={(p) => open(p)} />
          <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
          <CommunityStrip />
          <RhythmStrip />

          <SmallCaps mb={20}>Entries</SmallCaps>
          {MOCK.entries.map((e, i) => (
            <EntryCard key={e.id} entry={e} i={i} onTap={(en) => setDetail(en)} />
          ))}
        </div>
      </div>

      {insOpen && <InsightsExpanded onClose={() => setInsOpen(false)} />}
      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
