// JournalDemo1 — "Paper & Ink" (Warm Editorial)
// Interactive demo. Mock data only — no entity queries.
import { useState } from "react";

const C = {
  paper: "#FAF5E8",
  paperHi: "#FFFFFF",
  cream: "#F4EDDB",
  espresso: "#3A2C1A",
  espressoSoft: "rgba(58,44,26,0.70)",
  blush: "#E8B4B8",
  sage: "#8FAF8F",
  gold: "#D4AF37",
  muted: "#9B8B7A",
  amber: "#D97A3A",
};
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

const PHASE_COLOURS = {
  menstrual: C.blush, follicular: C.sage,
  ovulatory: C.gold, luteal: C.muted,
};

const MOCK = {
  phase: "luteal", cycleDay: 26, dayOfWeek: "Wednesday",
  prompt: "The editing phase. What can you let go of? What genuinely matters?",
  altPrompts: [
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
  onThisDay: {
    cycleDay: 26,
    text: "I felt invisible at the meeting. Like I had to make myself larger to be heard. Tired of it.",
    date: "Last cycle · Day 26",
  },
  jessLine: "On cycle day 26 last month, you wrote about feeling invisible. It's day 26 today.",
  rhythm: [true, true, false, true, true, false, true],
  community: "23 women in luteal are writing about boundaries this week.",
  entries: [
    { id: 1, type: "Reflection", colour: C.muted, body: "Today I noticed I keep editing myself before I speak. I don't think anyone asked me to.", date: "Today · 9:42am", phase: "luteal" },
    { id: 2, type: "Work", colour: C.gold, body: "The deadline shifted again. I'm not sure how to plan around so much uncertainty.", date: "Yesterday", phase: "luteal" },
    { id: 3, type: "Burn", colour: C.amber, body: "Things I'm not allowed to say out loud — even to myself.", date: "2 days ago · burns in 4h", phase: "luteal", burn: true },
    { id: 4, type: "Joy", colour: C.gold, body: "The coffee this morning. The exact angle of the sunlight on the table.", date: "3 days ago", phase: "luteal" },
    { id: 5, type: "Gratitude", colour: C.sage, body: "Mum called for no reason. Just to say hello.", date: "4 days ago", phase: "ovulatory" },
  ],
};

const ENTRY_TYPES = [
  { id: "free",       label: "Free Write",  glyph: "✎" },
  { id: "gratitude",  label: "Gratitude",   glyph: "❀" },
  { id: "mood",       label: "Mood",        glyph: "♡" },
  { id: "reflection", label: "Reflection",  glyph: "❋" },
  { id: "work",       label: "Work",        glyph: "✿" },
  { id: "joy",        label: "Joy",         glyph: "☀" },
  { id: "grief",      label: "Grief",       glyph: "❉" },
];

function Botanical({ width = 80 }) {
  return (
    <svg width={width} height="14" viewBox="0 0 80 14" aria-hidden style={{ display: "block", margin: "0 auto" }}>
      <path d="M2 7 Q20 1 40 7 T78 7" fill="none" stroke={C.muted} strokeWidth="1" opacity="0.4" />
      <circle cx="40" cy="7" r="1.5" fill={C.gold} />
      <circle cx="20" cy="4" r="1" fill={C.sage} opacity="0.6" />
      <circle cx="60" cy="4" r="1" fill={C.sage} opacity="0.6" />
    </svg>
  );
}

function InsightsCard({ onExpand }) {
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "center", gap: 14,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: C.cream, border: "none",
      borderLeft: `3px solid ${PHASE_COLOURS[MOCK.phase]}`,
      borderRadius: 12, padding: "12px 14px",
      marginBottom: 14, boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: 9.5, color: C.gold, fontWeight: 700, letterSpacing: 1.6, marginBottom: 4 }}>
          ✦ JESS
        </div>
        <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14, color: C.espresso, lineHeight: 1.4 }}>
          {MOCK.jessLine}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }} aria-label="Writing rhythm">
        {MOCK.rhythm.slice(0, 5).map((on, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: on ? C.espresso : "transparent",
            border: on ? "none" : `1px solid ${C.muted}`,
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
      background: "rgba(58,44,26,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.paper, width: "100%", maxWidth: 640,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "20px 22px 30px",
        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(212,175,55,0.04) 0%, transparent 50%)",
      }}>
        <Botanical />
        <h2 style={{
          fontFamily: CORM, color: C.espresso, margin: "10px 0 4px",
          fontSize: 22, fontStyle: "italic", textAlign: "center",
        }}>What Jess noticed</h2>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16,
          color: C.espresso, lineHeight: 1.6, textAlign: "center",
          margin: "0 0 18px",
        }}>{MOCK.jessLine}</p>

        <div style={{ fontFamily: UI, fontSize: 10, color: C.muted, letterSpacing: 1.4, fontWeight: 700, marginBottom: 8 }}>
          THIS CYCLE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 20 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const day = i + 1;
            const phase = day <= 5 ? "menstrual" : day <= 12 ? "follicular" : day <= 16 ? "ovulatory" : "luteal";
            const wrote = [1, 3, 5, 12, 14, 17, 21, 23, 24, 26].includes(day);
            return (
              <div key={day} style={{
                width: 24, height: 24, borderRadius: "50%",
                background: wrote ? PHASE_COLOURS[phase] : "transparent",
                border: `1px solid ${wrote ? PHASE_COLOURS[phase] : "rgba(155,139,122,0.30)"}`,
                fontFamily: UI, fontSize: 9, color: wrote ? "white" : C.muted,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{day}</div>
            );
          })}
        </div>

        <div style={{
          background: C.paperHi, border: `1px solid rgba(58,44,26,0.10)`,
          borderRadius: 12, padding: "14px 16px", marginBottom: 14,
          transform: "rotate(-0.3deg)",
        }}>
          <div style={{ fontFamily: UI, fontSize: 9.5, color: C.gold, letterSpacing: 1.4, fontWeight: 700, marginBottom: 6 }}>
            ON THIS DAY · LAST CYCLE
          </div>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 17,
            color: C.espresso, margin: 0, lineHeight: 1.5,
          }}>“{MOCK.onThisDay.text}”</p>
        </div>

        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 13.5,
          color: C.muted, textAlign: "center", margin: 0,
        }}>{MOCK.community}</p>
      </div>
    </div>
  );
}

function PromptCard({ onWrite }) {
  const [altIdx, setAltIdx] = useState(0);
  const prompts = [MOCK.prompt, ...MOCK.altPrompts];
  const current = prompts[altIdx % prompts.length];
  return (
    <div style={{
      background: C.paperHi, borderRadius: 14,
      padding: "16px 18px 14px",
      boxShadow: "0 2px 4px rgba(58,44,26,0.08)",
      marginBottom: 14, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 16, right: 16, height: 2,
        background: PHASE_COLOURS[MOCK.phase],
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
        <span style={{ color: C.gold, fontFamily: CORM, fontSize: 16 }}>✦</span>
        <span style={{ fontFamily: UI, fontSize: 10, color: C.muted, letterSpacing: 1.6, fontWeight: 700 }}>
          JESS · LUTEAL · DAY {MOCK.cycleDay}
        </span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 18,
        color: C.espresso, lineHeight: 1.5, margin: "0 0 14px",
      }}>{current}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onWrite(current)} style={{
          background: C.gold, color: C.espresso, border: "none",
          borderRadius: 9999, padding: "8px 16px",
          fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Write to this ✦</button>
        <button onClick={() => setAltIdx(i => i + 1)} style={{
          background: "transparent", color: C.espresso,
          border: `1px solid ${C.muted}`,
          borderRadius: 9999, padding: "8px 14px",
          fontFamily: UI, fontSize: 12.5, cursor: "pointer",
        }}>Different prompt →</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  return (
    <article style={{
      background: C.paperHi, borderRadius: 12,
      padding: "14px 16px", marginBottom: 14,
      transform: "rotate(-0.4deg)",
      position: "relative",
      boxShadow: "0 3px 8px rgba(58,44,26,0.10)",
      backgroundImage: "linear-gradient(180deg, transparent 0%, transparent 50%, rgba(58,44,26,0.03) 51%, transparent 52%)",
    }}>
      <div style={{ fontFamily: UI, fontSize: 10, color: C.gold, letterSpacing: 1.4, fontWeight: 700, marginBottom: 6 }}>
        FROM LAST CYCLE — {MOCK.onThisDay.date.toUpperCase()}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 16,
        color: C.espresso, lineHeight: 1.55, margin: "0 0 10px",
      }}>“{MOCK.onThisDay.text}”</p>
      <button onClick={onReply} style={{
        background: "transparent", color: C.gold,
        border: `1px solid ${C.gold}`,
        borderRadius: 9999, padding: "5px 14px",
        fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
      }}>Reply to past self ✦</button>
    </article>
  );
}

function CommunityStrip() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", marginBottom: 14,
      background: "transparent",
    }}>
      <span style={{ fontSize: 18, color: C.sage }} aria-hidden>❀</span>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 14,
        color: C.muted, margin: 0, lineHeight: 1.45,
      }}>{MOCK.community}</p>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {labels.map((d, i) => (
          <div key={d} style={{ textAlign: "center", flex: 1 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", margin: "0 auto 4px",
              background: MOCK.rhythm[i] ? C.espresso : "transparent",
              border: MOCK.rhythm[i] ? "none" : `1px solid ${C.muted}`,
            }} />
            <div style={{ fontFamily: UI, fontSize: 9.5, color: C.muted, letterSpacing: 0.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryCard({ entry, i, onTap }) {
  const rot = i % 2 === 0 ? -0.4 : 0.4;
  return (
    <article onClick={() => onTap(entry)} style={{
      background: C.paperHi,
      borderRadius: 10, padding: "13px 16px 12px",
      marginBottom: 10, cursor: "pointer",
      transform: `rotate(${rot}deg)`,
      boxShadow: "0 2px 6px rgba(58,44,26,0.10)",
      borderLeft: entry.burn ? `3px solid ${C.amber}` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
        <span style={{
          background: entry.burn ? "rgba(217,122,58,0.14)" : "rgba(58,44,26,0.05)",
          color: entry.colour,
          padding: "2px 9px", borderRadius: 4,
          fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 1.4,
          textTransform: "uppercase", border: `1px solid ${entry.colour}`,
          transform: "rotate(-1deg)",
        }}>{entry.burn ? "🔥 BURN" : entry.type}</span>
        <span style={{ marginLeft: "auto", fontFamily: CORM, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
          {entry.date}
        </span>
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 16,
        color: C.espresso, lineHeight: 1.5, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{entry.body}</p>
    </article>
  );
}

function Composer({ open, onClose, seedPrompt }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [burnMode, setBurnMode] = useState(false);
  if (!open) return null;

  if (burnMode) {
    return (
      <div onClick={() => setBurnMode(false)} style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(58,44,26,0.55)",
        display: "flex", alignItems: "flex-end",
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          background: "#1F1810", width: "100%",
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: "20px 22px 26px", color: C.cream,
          borderTop: `2px solid ${C.amber}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: C.amber, fontSize: 18 }}>🔥</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: C.amber, letterSpacing: 1.6, fontWeight: 700 }}>BURN MODE</span>
          </div>
          <h2 style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 22, margin: "0 0 8px" }}>
            Write knowing it will disappear.
          </h2>
          <p style={{ fontFamily: UI, fontSize: 11.5, color: C.amber, margin: "0 0 14px" }}>
            Jess will never read this. It is yours until it is gone.
          </p>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Say it. No one will read this."
            style={{
              width: "100%", minHeight: 140,
              background: C.paper, color: C.espresso, border: "none",
              borderRadius: 10, padding: 14, resize: "none",
              fontFamily: CORM, fontSize: 16, lineHeight: 1.55, outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setBurnMode(false)} style={{
              background: "transparent", color: C.cream,
              border: `1px solid ${C.muted}`, borderRadius: 9999,
              padding: "8px 14px", fontFamily: UI, fontSize: 13, cursor: "pointer",
            }}>Back</button>
            <button onClick={() => { setBurnMode(false); onClose(); }} style={{
              background: C.amber, color: "#1F1810", border: "none",
              borderRadius: 9999, padding: "8px 18px",
              fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Seal entry · burns in 1h</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 90,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.paper, width: "100%", height: "100vh",
        padding: "26px 22px 30px", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: UI, fontSize: 11, color: C.muted, letterSpacing: 1.4, fontWeight: 700 }}>
            ✎ A NEW ENTRY
          </span>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer",
          }} aria-label="Close">×</button>
        </div>
        <Botanical width={120} />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px 0 14px" }}>
          {ENTRY_TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                flexShrink: 0,
                background: active ? C.cream : "transparent",
                color: C.espresso,
                border: `1px solid ${active ? C.gold : C.muted}`,
                borderRadius: 9999, padding: "7px 14px",
                fontFamily: UI, fontSize: 12.5, fontWeight: active ? 700 : 500,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
                <span style={{ marginRight: 6, color: active ? C.gold : C.muted }}>{t.glyph}</span>
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{
          borderLeft: `2px solid ${C.gold}`,
          paddingLeft: 14, marginBottom: 16,
        }}>
          <p style={{
            fontFamily: CORM, fontStyle: "italic", fontSize: 17,
            color: C.espresso, lineHeight: 1.55, margin: 0,
          }}>{seedPrompt || MOCK.prompt}</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write here. Slow is fine."
          style={{
            width: "100%", minHeight: 240,
            background: "transparent", border: "none",
            padding: 0, resize: "none",
            fontFamily: CORM, fontSize: 19, lineHeight: 1.65,
            color: C.espresso, outline: "none",
          }}
        />
        <div style={{
          margin: "16px 0", padding: "14px 16px",
          background: "rgba(217,122,58,0.10)",
          border: `1px solid ${C.amber}`, borderRadius: 12,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: UI, fontSize: 11.5, color: C.amber, fontWeight: 700, letterSpacing: 1.2 }}>BURN MODE</div>
            <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 13, color: C.espresso }}>
              Write knowing it will disappear.
            </div>
          </div>
          <button onClick={() => setBurnMode(true)} style={{
            background: C.amber, color: "white", border: "none",
            borderRadius: 9999, padding: "6px 14px",
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Open</button>
        </div>
        <button onClick={onClose} style={{
          width: "100%", background: C.gold, color: C.espresso,
          border: "none", borderRadius: 9999, padding: "12px 20px",
          fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
          marginTop: 10,
        }}>Seal entry ✦</button>
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(58,44,26,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.paperHi, width: "100%", maxWidth: 640,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "20px 22px 28px",
      }}>
        <div style={{
          fontFamily: UI, fontSize: 10, color: entry.colour,
          letterSpacing: 1.6, fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
        }}>{entry.burn ? "🔥 BURN" : entry.type}</div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 19,
          color: C.espresso, lineHeight: 1.6, margin: "0 0 14px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 13, color: C.muted, marginBottom: 14 }}>
          {entry.date}
        </div>
        <Botanical width={100} />
      </div>
    </div>
  );
}

export default function JournalDemo1() {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [seedPrompt, setSeedPrompt] = useState("");
  const [detail, setDetail] = useState(null);

  const open = (seed = "") => { setSeedPrompt(seed); setComposerOpen(true); };

  return (
    <div style={{
      minHeight: "100vh", background: C.paper,
      paddingBottom: 60,
      backgroundImage: "radial-gradient(circle at 20% 30%, rgba(212,175,55,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(143,175,143,0.04) 0%, transparent 50%)",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "30px 18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
          <div>
            <div style={{
              fontFamily: UI, fontSize: 10.5, color: C.muted,
              letterSpacing: 2, fontWeight: 700, marginBottom: 4,
            }}>LUTEAL · DAY {MOCK.cycleDay} · {MOCK.dayOfWeek.toUpperCase()}</div>
            <h1 style={{
              fontFamily: CORM, fontSize: 36, fontWeight: 700,
              color: C.espresso, margin: 0, letterSpacing: -0.5,
            }}>Journal</h1>
            <p style={{
              fontFamily: CORM, fontStyle: "italic", fontSize: 15,
              color: C.muted, margin: "2px 0 0",
            }}>Boundaries feel natural now.</p>
          </div>
          <button onClick={() => open()} style={{
            background: C.espresso, color: C.cream, border: "none",
            borderRadius: 9999, padding: "10px 18px",
            fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>+ New entry</button>
        </div>
        <Botanical />

        <div style={{ marginTop: 18 }}>
          <InsightsCard onExpand={() => setInsightsOpen(true)} />
          <PromptCard onWrite={(p) => open(p)} />
          <OnThisDayCard onReply={() => open(`Reflecting on what I wrote a cycle ago…\n\n`)} />
          <CommunityStrip />
          <RhythmStrip />

          <div style={{
            fontFamily: UI, fontSize: 10, color: C.muted,
            letterSpacing: 1.6, fontWeight: 700, marginTop: 6, marginBottom: 12,
            textAlign: "center",
          }}>— ENTRIES —</div>

          {MOCK.entries.map((e, i) => (
            <EntryCard key={e.id} entry={e} i={i} onTap={(en) => setDetail(en)} />
          ))}

          <Botanical />
        </div>
      </div>

      {insightsOpen && <InsightsExpanded onClose={() => setInsightsOpen(false)} />}
      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} seedPrompt={seedPrompt} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
