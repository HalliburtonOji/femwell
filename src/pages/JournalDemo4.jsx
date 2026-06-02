// JournalDemo4 — "Living Colour" (Expressive & Dimensional)
// Interactive demo. Mock data only — no entity queries.
import { useState } from "react";

const L = {
  cream:    "#F4EDDB",
  paper:    "#FFFFFF",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "rgba(58,44,26,0.10)",
  amber:    "#D4882A",
};

// Each life dimension / entry type has its own accent.
const DIMS = {
  free:          { id: "free",          label: "Free Write",    accent: "#3A2C1A" },
  gratitude:     { id: "gratitude",     label: "Gratitude",     accent: "#D4AF37" },
  mood:          { id: "mood",          label: "Mood",          accent: "#E8B4B8" },
  reflection:    { id: "reflection",    label: "Reflection",    accent: "#8FAF8F" },
  work:          { id: "work",          label: "Work & Career", accent: "#3A6B6B" },
  relationships: { id: "relationships", label: "Relationships", accent: "#C4556B" },
  money:         { id: "money",         label: "Money",         accent: "#8B6914" },
  creative:      { id: "creative",      label: "Creative",      accent: "#D4762A" },
  grief:         { id: "grief",         label: "Grief",         accent: "#4A5568" },
  joy:           { id: "joy",           label: "Joy",           accent: "#5EA05E" },
  identity:      { id: "identity",      label: "Identity",      accent: "#6B4FA0" },
  burn:          { id: "burn",          label: "Burn",          accent: "#D4882A" },
};

const FRAUNCES = '"Fraunces","Cormorant Garamond",Georgia,serif';
const CORM = '"Cormorant Garamond","Fraunces",Georgia,serif';
const INSTR = '"Instrument Serif","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

const MOCK = {
  cycleDay: 26, phase: "luteal",
  prompt: "The editing phase. What can you let go of? What genuinely matters?",
  altPrompts: [
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
  rhythm:    [true, true, false, true, true, false, true],
  rhythmType:["work","work","none","creative","relationships","none","reflection"],
  jessLine: "You've written most about Work this cycle. Creative has been quiet.",
  community: "23 women are writing about boundaries in luteal this week.",
  onThisDay: { text: "I felt invisible at the meeting. Like I had to make myself larger to be heard.", date: "Last cycle · Day 26", dim: "work" },
  // Dimension coverage this cycle (0-1)
  coverage: {
    work: 0.92, relationships: 0.62, reflection: 0.55,
    gratitude: 0.40, joy: 0.30, money: 0.20, creative: 0.12,
    grief: 0.08, identity: 0.05,
  },
  entries: [
    { id: 1, dim: "reflection", body: "I keep editing myself before I speak. I don't think anyone asked me to.", date: "Today · 9:42" },
    { id: 2, dim: "work",       body: "The deadline shifted again. I'm not sure how to plan around so much uncertainty.", date: "Yesterday" },
    { id: 3, dim: "burn",       body: "Things I'm not allowed to say out loud — even to myself.", date: "2d · burns 4h", burn: true },
    { id: 4, dim: "joy",        body: "The coffee. The exact angle of light on the table.", date: "3d" },
    { id: 5, dim: "relationships", body: "Mum called for no reason. Just to say hello.", date: "4d" },
    { id: 6, dim: "creative",   body: "First time touching the sketchbook in a month.", date: "5d" },
  ],
};

function hexWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function RainbowBar() {
  // Coloured gradient sliver from recent entry types
  const cols = MOCK.entries.slice(0, 5).map(e => DIMS[e.dim].accent);
  return (
    <div style={{
      width: 4, alignSelf: "stretch",
      background: `linear-gradient(180deg, ${cols.join(", ")})`,
      borderRadius: 2, marginRight: 14,
    }} />
  );
}

function DimensionBalance() {
  // Tiny horizontal coloured arcs row
  const items = Object.entries(MOCK.coverage).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 8 }} aria-label="Life dimension balance">
      {items.map(([k, v]) => (
        <div key={k} title={DIMS[k]?.label} style={{
          flex: 1, height: 5, borderRadius: 9999,
          background: hexWithAlpha(DIMS[k].accent, Math.max(0.18, v)),
        }} />
      ))}
    </div>
  );
}

function InsightsCard({ onExpand }) {
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "stretch", gap: 0,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: L.paper, border: `1px solid ${L.border}`,
      borderRadius: 16, padding: "14px 14px", marginBottom: 16,
      boxShadow: "0 1px 3px rgba(58,44,26,0.06)",
    }}>
      <RainbowBar />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: 9.5, color: L.muted, letterSpacing: 1.6, fontWeight: 700, marginBottom: 4 }}>
          ✦ JESS
        </div>
        <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14, color: L.espresso, lineHeight: 1.45 }}>
          {MOCK.jessLine}
        </div>
        <DimensionBalance />
        <div style={{ display: "flex", gap: 5, marginTop: 8 }} aria-label="Writing rhythm">
          {MOCK.rhythm.slice(0, 5).map((on, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: on ? DIMS[MOCK.rhythmType[i]]?.accent || L.espresso : "transparent",
              border: on ? "none" : `1px solid ${L.muted}`,
            }} />
          ))}
        </div>
      </div>
    </button>
  );
}

function DimensionMap() {
  // Each dim as a circle sized by coverage
  const entries = Object.entries(MOCK.coverage);
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      gap: 18, padding: "20px 12px",
    }}>
      {entries.map(([k, v]) => {
        const size = Math.round(28 + v * 84);
        return (
          <div key={k} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            width: 86,
          }}>
            <div style={{
              width: size, height: size, borderRadius: "50%",
              background: hexWithAlpha(DIMS[k].accent, 0.20),
              border: `2px solid ${DIMS[k].accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: INSTR, fontSize: 12,
                color: DIMS[k].accent, fontWeight: 600,
              }}>{Math.round(v * 100)}%</span>
            </div>
            <div style={{
              fontFamily: UI, fontSize: 11, color: L.espresso,
              fontWeight: 600, textAlign: "center", lineHeight: 1.2,
            }}>{DIMS[k].label}</div>
          </div>
        );
      })}
    </div>
  );
}

function InsightsExpanded({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: L.cream, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "22px 20px 30px", maxHeight: "92vh", overflowY: "auto",
      }}>
        <h2 style={{
          fontFamily: FRAUNCES, color: L.espresso, margin: "0 0 4px",
          fontSize: 24, fontWeight: 700, textAlign: "center",
        }}>Life Dimension Balance</h2>
        <p style={{
          fontFamily: UI, fontSize: 12.5, color: L.muted, textAlign: "center", margin: "0 0 6px",
        }}>What you've been writing about this cycle.</p>
        <DimensionMap />
        <div style={{
          background: L.paper, border: `1px solid ${L.border}`, borderRadius: 14,
          padding: "12px 14px", marginBottom: 12,
          borderLeft: `4px solid ${DIMS.work.accent}`,
        }}>
          <div style={{ fontFamily: UI, fontSize: 10, color: DIMS.work.accent, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
            WORK · MOST WRITTEN
          </div>
          <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14.5, color: L.espresso, margin: 0, lineHeight: 1.5 }}>
            Work has been on your mind. Quieter dimensions need air too.
          </p>
        </div>
        <div style={{
          background: L.paper, border: `1px solid ${L.border}`, borderRadius: 14,
          padding: "12px 14px",
          borderLeft: `4px solid ${DIMS.joy.accent}`,
        }}>
          <div style={{ fontFamily: UI, fontSize: 10, color: DIMS.joy.accent, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
            JOY · QUIET
          </div>
          <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14.5, color: L.espresso, margin: 0, lineHeight: 1.5 }}>
            Tiny joys count. The coffee, the song, the parking spot.
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
      background: L.paper, borderRadius: 14, padding: "14px 16px",
      marginBottom: 16, border: `1px solid ${L.border}`,
      borderLeft: `4px solid ${DIMS.reflection.accent}`,
    }}>
      <div style={{ fontFamily: UI, fontSize: 9.5, color: L.muted, letterSpacing: 1.6, fontWeight: 700, marginBottom: 6 }}>
        JESS · LUTEAL · DAY {MOCK.cycleDay}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 18,
        color: L.espresso, lineHeight: 1.55, margin: "0 0 12px",
      }}>{current}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onWrite(current)} style={{
          background: DIMS.reflection.accent, color: "white", border: "none",
          borderRadius: 9999, padding: "8px 16px",
          fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Write to this ✦</button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", color: L.espresso,
          border: `1px solid ${L.muted}`,
          borderRadius: 9999, padding: "8px 14px",
          fontFamily: UI, fontSize: 12.5, cursor: "pointer",
        }}>Different prompt →</button>
      </div>
    </div>
  );
}

function OnThisDayCard({ onReply }) {
  const dim = DIMS[MOCK.onThisDay.dim];
  return (
    <article style={{
      background: hexWithAlpha(dim.accent, 0.06),
      borderRadius: 14, padding: "12px 14px", marginBottom: 16,
      border: `1px solid ${L.border}`,
      borderLeft: `4px solid ${dim.accent}`,
    }}>
      <div style={{ fontFamily: UI, fontSize: 9.5, color: dim.accent, letterSpacing: 1.4, fontWeight: 700, marginBottom: 6 }}>
        ON THIS DAY · {dim.label.toUpperCase()}
      </div>
      <p style={{
        fontFamily: CORM, fontStyle: "italic", fontSize: 15.5,
        color: L.espresso, lineHeight: 1.55, margin: "0 0 8px",
      }}>“{MOCK.onThisDay.text}”</p>
      <button onClick={onReply} style={{
        background: "transparent", color: dim.accent,
        border: `1px solid ${dim.accent}`,
        borderRadius: 9999, padding: "5px 13px",
        fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
      }}>Reply to past self →</button>
    </article>
  );
}

function CommunityStrip() {
  return (
    <div style={{
      background: L.paper, border: `1px solid ${L.border}`,
      borderLeft: `4px solid ${DIMS.relationships.accent}`,
      borderRadius: 14, padding: "10px 14px", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: 16 }}>✦</span>
      <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14, color: L.espresso, margin: 0 }}>
        {MOCK.community}
      </p>
    </div>
  );
}

function RhythmStrip() {
  const labels = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
      {labels.map((d, i) => {
        const t = MOCK.rhythmType[i];
        const has = MOCK.rhythm[i];
        return (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              width: 11, height: 11, borderRadius: "50%", margin: "0 auto 4px",
              background: has ? DIMS[t]?.accent || L.espresso : "transparent",
              border: has ? "none" : `1px solid ${L.muted}`,
            }} />
            <div style={{ fontFamily: UI, fontSize: 10, color: L.muted }}>{d}</div>
          </div>
        );
      })}
    </div>
  );
}

function EntryCard({ entry, onTap }) {
  const dim = DIMS[entry.dim];
  return (
    <article onClick={() => onTap(entry)} style={{
      background: hexWithAlpha(dim.accent, 0.06),
      borderRadius: 14, padding: "13px 14px 12px",
      marginBottom: 10, cursor: "pointer",
      border: `1px solid ${L.border}`,
      borderLeft: `4px solid ${dim.accent}`,
      breakInside: "avoid",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{
          background: hexWithAlpha(dim.accent, 0.18),
          color: dim.accent,
          padding: "3px 9px", borderRadius: 9999,
          fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8,
        }}>{entry.burn ? "🔥 BURN" : dim.label}</span>
        <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11, color: L.muted }}>
          {entry.date}
        </span>
      </div>
      <p style={{
        fontFamily: entry.burn ? CORM : UI,
        fontStyle: entry.burn ? "italic" : "normal",
        fontSize: 14, color: L.espresso, lineHeight: 1.5, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{entry.body}</p>
    </article>
  );
}

function DimChooser({ onPick, onBurn }) {
  const dimsList = ["free","gratitude","mood","reflection","work","relationships","money","creative","grief","joy","identity"];
  return (
    <div>
      <div style={{
        fontFamily: FRAUNCES, fontSize: 22, fontWeight: 700,
        color: L.espresso, marginBottom: 12,
      }}>What are you writing about today?</div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10,
        marginBottom: 14,
      }}>
        {dimsList.map((k) => {
          const d = DIMS[k];
          return (
            <button key={k} onClick={() => onPick(k)} style={{
              background: hexWithAlpha(d.accent, 0.12),
              color: d.accent,
              border: `1px solid ${d.accent}`,
              borderRadius: 14, padding: "14px 12px",
              fontFamily: UI, fontSize: 13.5, fontWeight: 700,
              cursor: "pointer", textAlign: "left",
            }}>{d.label}</button>
          );
        })}
      </div>
      <button onClick={onBurn} style={{
        width: "100%",
        background: hexWithAlpha(L.amber, 0.10),
        color: L.amber,
        border: `1px solid ${L.amber}`,
        borderRadius: 14, padding: "12px",
        fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
      }}>🔥 Burn Mode — write knowing it will disappear</button>
    </div>
  );
}

function Composer({ open, onClose, seedPrompt }) {
  const [stage, setStage] = useState("pick"); // pick | write | burn
  const [dim, setDim] = useState(null);
  const [text, setText] = useState("");
  if (!open) return null;
  const close = () => { setStage("pick"); setDim(null); setText(""); onClose(); };
  const accent = dim ? DIMS[dim].accent : DIMS.reflection.accent;
  return (
    <div onClick={close} style={{
      position: "fixed", inset: 0, zIndex: 90,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: dim ? hexWithAlpha(DIMS[dim].accent, 0.06) : L.cream,
        width: "100%", maxWidth: 720,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "20px 20px 30px", maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 11, color: L.muted, fontWeight: 700, letterSpacing: 1.4 }}>
            NEW ENTRY
          </span>
          <button onClick={close} style={{
            background: "transparent", border: "none", color: L.muted, fontSize: 22, cursor: "pointer",
          }} aria-label="Close">×</button>
        </div>
        {stage === "pick" && (
          <DimChooser onPick={(k) => { setDim(k); setStage("write"); }} onBurn={() => { setDim("burn"); setStage("burn"); }} />
        )}
        {stage === "write" && dim && (
          <>
            <div style={{
              fontFamily: UI, fontSize: 10, color: accent,
              fontWeight: 700, letterSpacing: 1.4, marginBottom: 6,
            }}>{DIMS[dim].label.toUpperCase()}</div>
            <p style={{
              fontFamily: CORM, fontStyle: "italic", fontSize: 17,
              color: accent, lineHeight: 1.55, margin: "0 0 14px",
            }}>{seedPrompt || MOCK.prompt}</p>
            <textarea
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Write here…"
              style={{
                width: "100%", minHeight: 240,
                background: hexWithAlpha(accent, 0.04),
                border: `1px solid ${hexWithAlpha(accent, 0.20)}`,
                borderRadius: 12, padding: 14, resize: "none",
                fontFamily: CORM, fontSize: 17, lineHeight: 1.6,
                color: L.espresso, outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setStage("pick")} style={{
                background: "transparent", color: L.espresso,
                border: `1px solid ${L.muted}`,
                borderRadius: 9999, padding: "9px 16px",
                fontFamily: UI, fontSize: 13, cursor: "pointer",
              }}>← Change</button>
              <button onClick={close} style={{
                flex: 1, background: accent, color: "white", border: "none",
                borderRadius: 9999, padding: "9px 18px",
                fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>Save entry ✓</button>
            </div>
          </>
        )}
        {stage === "burn" && (
          <>
            <div style={{
              background: hexWithAlpha(L.amber, 0.10),
              border: `1px solid ${L.amber}`, borderRadius: 14,
              padding: "12px 14px", marginBottom: 14,
            }}>
              <div style={{ fontFamily: UI, fontSize: 11, color: L.amber, fontWeight: 700, letterSpacing: 1.4 }}>🔥 BURN MODE</div>
              <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 14.5, color: L.espresso, margin: "4px 0 0" }}>
                Jess will never read this. Set a timer below.
              </p>
            </div>
            <textarea
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Say it. No one will read this."
              style={{
                width: "100%", minHeight: 200,
                background: L.paper, border: `1px solid ${L.amber}`,
                borderRadius: 12, padding: 14, resize: "none",
                fontFamily: CORM, fontSize: 17, lineHeight: 1.6,
                color: L.espresso, outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {["1 hour","24 hours","Choose date","Tap to burn"].map(t => (
                <button key={t} style={{
                  background: "transparent", color: L.amber,
                  border: `1px solid ${L.amber}`,
                  borderRadius: 9999, padding: "6px 12px",
                  fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
            <button onClick={close} style={{
              width: "100%", marginTop: 14,
              background: L.amber, color: "white", border: "none",
              borderRadius: 9999, padding: "10px 18px",
              fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>Seal burn entry 🔥</button>
          </>
        )}
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  const dim = DIMS[entry.dim];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: hexWithAlpha(dim.accent, 0.08),
        width: "100%", maxWidth: 720,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "22px 22px 30px",
        borderTop: `4px solid ${dim.accent}`,
      }}>
        <div style={{
          fontFamily: UI, fontSize: 10, color: dim.accent,
          fontWeight: 700, letterSpacing: 1.4, marginBottom: 8,
        }}>{entry.burn ? "🔥 BURN" : dim.label.toUpperCase()}</div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 18,
          color: L.espresso, lineHeight: 1.65, margin: "0 0 12px", whiteSpace: "pre-wrap",
        }}>{entry.body}</p>
        <div style={{ fontFamily: UI, fontSize: 12, color: L.muted }}>{entry.date}</div>
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
    <div style={{ minHeight: "100vh", background: L.cream, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "26px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <div style={{
              fontFamily: UI, fontSize: 10, color: L.muted,
              letterSpacing: 2, fontWeight: 700, marginBottom: 4,
            }}>LUTEAL · DAY {MOCK.cycleDay}</div>
            <h1 style={{
              fontFamily: FRAUNCES, fontSize: 32, fontWeight: 700,
              color: L.espresso, margin: 0, letterSpacing: -0.5,
            }}>Journal</h1>
            <p style={{ fontFamily: INSTR, fontSize: 14, color: L.muted, margin: "2px 0 0", fontStyle: "italic" }}>
              Every dimension has a voice.
            </p>
          </div>
          <button onClick={() => open()} style={{
            background: L.espresso, color: L.cream, border: "none",
            borderRadius: 9999, padding: "10px 18px",
            fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>+ New entry</button>
        </div>

        <InsightsCard onExpand={() => setInsOpen(true)} />
        <PromptCard onWrite={(p) => open(p)} />
        <OnThisDayCard onReply={() => open("Reflecting on what I wrote a cycle ago…\n\n")} />
        <CommunityStrip />
        <RhythmStrip />

        <div style={{
          fontFamily: UI, fontSize: 10, color: L.muted,
          letterSpacing: 2, fontWeight: 700, marginBottom: 10,
        }}>RECENT ENTRIES</div>
        <div style={{
          columnCount: 2, columnGap: 10,
        }}>
          {MOCK.entries.map((e) => (
            <EntryCard key={e.id} entry={e} onTap={(en) => setDetail(en)} />
          ))}
        </div>
      </div>

      {insOpen && <InsightsExpanded onClose={() => setInsOpen(false)} />}
      <Composer open={composer} onClose={() => setComposer(false)} seedPrompt={seed} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
