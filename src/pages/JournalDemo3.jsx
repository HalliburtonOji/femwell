// JournalDemo3 — "Layered" (organic warmth, coloured stripes per entry type)
// Shared FemWell palette + a few derived warm tones for the per-type stripes,
// as specified. Distinct via tactile cards with full-height left stripe, light
// phase-wash backgrounds, botanical SVG dividers between entries.
import { useState } from "react";

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

// Per-entry-type stripe colours (FemWell palette + a few warm derivatives).
const TYPE_COLOUR = {
  free:          T.espresso,
  gratitude:     T.gold,
  mood:          T.blush,
  reflection:    T.sage,
  work:          "#5C7A7A",
  relationships: T.blush,
  money:         "#8B6914",
  creative:      "#C4892A",
  grief:         T.muted,
  joy:           T.sage,
  identity:      T.muted,
  burn:          T.amber,
};

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
  onThisDay: { text: "I felt invisible at the meeting. Like I had to make myself larger to be heard.", date: "Last cycle · Day 26", type: "reflection" },
  entries: [
    { id: 1, type: "reflection", body: "Today I noticed I keep editing myself before I speak. I don't think anyone asked me to.", date: "Today · 9:42am" },
    { id: 2, type: "work",       body: "The deadline shifted again. I'm not sure how to plan around so much uncertainty.", date: "Yesterday" },
    { id: 3, type: "burn",       body: "Things I'm not allowed to say out loud — even to myself.", date: "2d · burns 4h", burn: true },
    { id: 4, type: "joy",        body: "The coffee. The exact angle of light on the table.", date: "3d" },
    { id: 5, type: "relationships", body: "Mum called for no reason. Just to say hello.", date: "4d" },
    { id: 6, type: "creative",   body: "Sketched for the first time in a month.", date: "5d" },
  ],
};

const ENTRY_TYPES = [
  "free","gratitude","mood","reflection","work","relationships","money","creative","grief","joy","identity",
];
const TYPE_LABEL = {
  free: "Free write", gratitude: "Gratitude", mood: "Mood", reflection: "Reflection",
  work: "Work", relationships: "Relationships", money: "Money", creative: "Creative",
  grief: "Grief", joy: "Joy", identity: "Identity",
};
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

function tint(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function Botanical() {
  return (
    <svg width="60" height="14" viewBox="0 0 60 14" aria-hidden style={{ display: "block", margin: "6px auto 6px" }}>
      <path d="M2 7 Q15 1 30 7 T58 7" fill="none" stroke={T.muted} strokeWidth="1" opacity="0.55" />
      <circle cx="30" cy="7" r="1" fill={T.gold} />
    </svg>
  );
}

function PhasePill() {
  const c = PHASE_COLOUR[MOCK.phase];
  return (
    <span style={{
      background: c, color: T.espresso,
      fontFamily: UI, fontSize: 11.5, fontWeight: 700,
      padding: "4px 10px", borderRadius: 9999,
      letterSpacing: 0.4, textTransform: "uppercase",
    }}>Luteal · Day {MOCK.cycleDay}</span>
  );
}

function InsightsCard({ onExpand }) {
  const c = PHASE_COLOUR[MOCK.phase];
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "stretch", gap: 0,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: tint(c, 0.10),
      border: "none",
      borderRadius: 14, padding: 0, marginBottom: 16,
      boxShadow: "0 2px 8px rgba(58,44,26,0.07)",
      overflow: "hidden",
    }}>
      <div style={{ width: 4, background: c, alignSelf: "stretch" }} />
      <div style={{ flex: 1, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 32, marginBottom: 10 }}>
          {MOCK.rhythmCounts.slice(0, 5).map((n, i) => (
            <div key={i} style={{
              flex: 1, height: `${Math.max(4, n * 6)}px`,
              background: c, borderRadius: "2px 2px 0 0", opacity: 0.7,
            }} />
          ))}
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16,
          color: T.espresso, lineHeight: 1.5, margin: 0,
        }}>{MOCK.jessLine}</p>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 6 }}>Tap to see more</div>
      </div>
    </button>
  );
}

function InsightsExpanded({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80, background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: tint(PHASE_COLOUR[MOCK.phase], 0.12),
        width: "100%", maxWidth: 680,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "22px 22px 30px",
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 16px" }} />
        <PhasePill />
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 19,
          color: T.espresso, lineHeight: 1.55, margin: "14px 0 22px",
        }}>{MOCK.jessLine}</p>

        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" }}>
          Dimension coverage
        </div>
        {[
          ["work", 0.92, "Most active"],
          ["relationships", 0.62, ""],
          ["reflection", 0.55, ""],
          ["joy", 0.30, ""],
          ["creative", 0.12, "Quiet this cycle"],
        ].map(([k, v, note]) => (
          <div key={k} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: tint(TYPE_COLOUR[k], 0.08),
            borderLeft: `4px solid ${TYPE_COLOUR[k]}`,
            borderRadius: 10, padding: "8px 12px", marginBottom: 6,
          }}>
            <div style={{ width: 90, fontFamily: UI, fontSize: 12, color: T.espresso, fontWeight: 600 }}>
              {TYPE_LABEL[k]}
            </div>
            <div style={{ flex: 1, height: 6, background: T.cream, borderRadius: 9999 }}>
              <div style={{ width: `${v * 100}%`, height: "100%", background: TYPE_COLOUR[k], borderRadius: 9999 }} />
            </div>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, width: 95, textAlign: "right" }}>{note}</div>
          </div>
        ))}
        <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "16px 0 0" }}>
          {MOCK.community}
        </p>
      </div>
    </div>
  );
}

function PromptCard({ onWrite }) {
  const [i, setI] = useState(0);
  const c = PHASE_COLOUR[MOCK.phase];
  const prompts = [MOCK.prompt, ...MOCK.altPrompts];
  const current = prompts[i % prompts.length];
  return (
    <div style={{
      background: T.paperHi,
      borderRadius: 14, marginBottom: 16, display: "flex", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(58,44,26,0.07)",
    }}>
      <div style={{ width: 4, background: c }} />
      <div style={{ flex: 1, padding: "16px 18px" }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>
          Jess · Day {MOCK.cycleDay}
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 18,
          color: T.espresso, lineHeight: 1.55, margin: "0 0 14px", fontWeight: 500,
        }}>{current}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => onWrite(current)} style={{
            background: T.gold, color: T.espresso, border: "none",
            borderRadius: 9999, padding: "7px 16px",
            fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>Write to this</button>
          <button onClick={() => setI(x => x + 1)} style={{
            background: "transparent", color: c,
            border: `1px solid ${c}`,
            borderRadius: 9999, padding: "7px 14px",
            fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}>Different prompt</button>
        </div>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  const c = TYPE_COLOUR[MOCK.onThisDay.type] || T.gold;
  return (
    <div style={{
      background: T.paperHi,
      borderRadius: 14, marginBottom: 16, display: "flex", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(58,44,26,0.07)",
    }}>
      <div style={{ width: 4, background: c }} />
      <div style={{ flex: 1, padding: "14px 18px", background: tint(c, 0.04) }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: c, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, textTransform: "uppercase" }}>
          On this day · {MOCK.onThisDay.date}
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16.5,
          color: T.espresso, lineHeight: 1.55, margin: "0 0 8px",
        }}>"{MOCK.onThisDay.text}"</p>
        <button onClick={onReply} style={{
          background: "transparent", color: c, border: "none",
          fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          padding: 0,
        }}>Reply to past self →</button>
      </div>
    </div>
  );
}

function CommunityStrip() {
  return (
    <div style={{
      background: T.paperHi,
      borderRadius: 14, marginBottom: 16, display: "flex", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(58,44,26,0.07)",
    }}>
      <div style={{ width: 4, background: T.blush }} />
      <div style={{ flex: 1, padding: "12px 18px" }}>
        <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14.5, color: T.espresso, margin: 0 }}>
          {MOCK.community}
        </p>
      </div>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["M","T","W","T","F","S","S"];
  const c = PHASE_COLOUR[MOCK.phase];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
      {labels.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 11, height: 11, borderRadius: "50%", margin: "0 auto 5px",
            background: MOCK.rhythm[i] ? c : "transparent",
            border: MOCK.rhythm[i] ? "none" : `1px solid ${T.muted}`,
          }} />
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>{d}</div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry, onTap, divider }) {
  const c = TYPE_COLOUR[entry.type] || T.espresso;
  return (
    <>
      <article onClick={() => onTap(entry)} style={{
        background: tint(c, 0.03),
        borderRadius: 14, marginBottom: 10, display: "flex", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(58,44,26,0.07)",
        cursor: "pointer",
      }}>
        <div style={{ width: 4, background: c }} />
        <div style={{ flex: 1, padding: "16px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontFamily: UI, fontSize: 10.5, color: c, fontWeight: 700,
              letterSpacing: 0.6, textTransform: "uppercase",
            }}>{entry.burn ? "Burn 🔥" : TYPE_LABEL[entry.type]}</span>
            <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11.5, color: T.muted }}>{entry.date}</span>
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 16.5,
            color: T.espresso, lineHeight: 1.55, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{entry.body}</p>
        </div>
      </article>
      {divider && <Botanical />}
    </>
  );
}

function Composer({ open, onClose, seedPrompt }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [burn, setBurn] = useState(false);
  const [timer, setTimer] = useState("24h");
  if (!open) return null;
  const c = TYPE_COLOUR[type] || T.espresso;
  const prompt = seedPrompt || TYPE_PROMPTS[type] || MOCK.prompt;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 90,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.surface, width: "100%", maxWidth: 680,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "20px 20px 28px", maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
            New entry
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: T.muted, fontSize: 22, cursor: "pointer",
          }} aria-label="Close">×</button>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
          {ENTRY_TYPES.map((k) => {
            const active = k === type;
            return (
              <button key={k} onClick={() => setType(k)} style={{
                flexShrink: 0,
                background: active ? TYPE_COLOUR[k] : tint(TYPE_COLOUR[k], 0.10),
                color: active ? "white" : T.espresso,
                border: `1px solid ${TYPE_COLOUR[k]}`,
                borderRadius: 9999, padding: "6px 14px",
                fontFamily: UI, fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>{TYPE_LABEL[k]}</button>
            );
          })}
        </div>

        <div style={{ height: 3, background: c, marginBottom: 14, borderRadius: 9999 }} />

        <div style={{
          background: T.paperHi, borderRadius: 14, display: "flex", overflow: "hidden",
          marginBottom: 14, boxShadow: "0 2px 8px rgba(58,44,26,0.06)",
        }}>
          <div style={{ width: 4, background: c }} />
          <div style={{ flex: 1, padding: "12px 14px" }}>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: c, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, textTransform: "uppercase" }}>
              Jess prompt
            </div>
            <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 16, color: T.espresso, margin: 0, lineHeight: 1.55 }}>
              {prompt}
            </p>
          </div>
        </div>

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Write…"
          style={{
            width: "100%", minHeight: 220,
            background: T.paperHi, border: "none",
            borderRadius: 14, padding: 18, resize: "none",
            fontFamily: CORM, fontSize: 17, lineHeight: 1.6,
            color: T.espresso, outline: "none",
            boxShadow: "0 2px 8px rgba(58,44,26,0.06)",
          }}
        />

        <div style={{
          marginTop: 14,
          background: tint(T.amber, 0.10),
          borderRadius: 14, padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: T.amber, fontWeight: 700, letterSpacing: 0.4 }}>Burn Mode</div>
            <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 13, color: T.espresso }}>
              Jess never reads this. Pick a timer.
            </div>
          </div>
          <button onClick={() => setBurn(v => !v)} style={{
            background: burn ? T.amber : "transparent",
            color: burn ? "white" : T.amber,
            border: `1px solid ${T.amber}`,
            borderRadius: 9999, padding: "5px 12px",
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>{burn ? "On" : "Open"}</button>
        </div>
        {burn && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {["1h","24h","Choose date","Tap to burn"].map(t => (
              <button key={t} onClick={() => setTimer(t)} style={{
                background: timer === t ? T.amber : "transparent",
                color: timer === t ? "white" : T.amber,
                border: `1px solid ${T.amber}`,
                borderRadius: 9999, padding: "4px 10px",
                fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{
          width: "100%", marginTop: 14,
          background: T.gold, color: T.espresso, border: "none",
          borderRadius: 9999, padding: "10px 18px",
          fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>Save entry ✓</button>
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  const c = TYPE_COLOUR[entry.type] || T.espresso;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70, background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: tint(c, 0.08), width: "100%", maxWidth: 680,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "22px 22px 28px",
        borderTop: `4px solid ${c}`,
      }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: c, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" }}>
          {entry.burn ? "Burn" : TYPE_LABEL[entry.type]}
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 18,
          color: T.espresso, lineHeight: 1.6, margin: "0 0 10px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{entry.date}</div>
      </div>
    </div>
  );
}

export default function JournalDemo3() {
  const [insOpen, setInsOpen] = useState(false);
  const [composer, setComposer] = useState(false);
  const [seed, setSeed] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (p = "") => { setSeed(p); setComposer(true); };

  return (
    <div style={{ minHeight: "100vh", background: T.surface, paddingBottom: 60 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "26px 20px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <h1 style={{
              fontFamily: CORM, fontSize: 30, fontWeight: 600,
              color: T.espresso, margin: 0, letterSpacing: -0.4,
            }}>Journal</h1>
            <div style={{ marginTop: 8 }}><PhasePill /></div>
          </div>
          <button onClick={() => open()} style={{
            background: T.espresso, color: T.cream, border: "none",
            borderRadius: 9999, padding: "9px 16px",
            fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>+ New entry</button>
        </div>

        <InsightsCard onExpand={() => setInsOpen(true)} />
        <PromptCard onWrite={(p) => open(p)} />
        <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <CommunityStrip />
        <RhythmStrip />

        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, textTransform: "uppercase" }}>
          Entries
        </div>
        {MOCK.entries.map((e, i) => (
          <EntryCard key={e.id} entry={e} onTap={(en) => setDetail(en)} divider={i < MOCK.entries.length - 1} />
        ))}
      </div>

      {insOpen && <InsightsExpanded onClose={() => setInsOpen(false)} />}
      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
