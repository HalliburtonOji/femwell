// JournalDemo3 — "The Canvas"
// Entries plotted as dots on a 2D map: X = day of cycle, Y = mood.
// Pan + zoom. Today pulses. Phase bands wash the background.
import { useState, useRef } from "react";

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

const TYPE_COLOUR = {
  free: T.espresso, gratitude: T.gold, mood: T.blush, reflection: T.sage,
  work: "#5C7A7A", relationships: "#C4556B", money: "#8B6914",
  creative: "#C4892A", grief: T.muted, joy: "#5EA05E", identity: "#6B4FA0",
  burn: T.amber,
};
const TYPE_LABEL = {
  free: "Free", gratitude: "Gratitude", mood: "Mood", reflection: "Reflection",
  work: "Work", relationships: "Relationships", money: "Money",
  creative: "Creative", grief: "Grief", joy: "Joy", identity: "Identity",
  burn: "Burn",
};
const ENTRY_TYPES = Object.keys(TYPE_COLOUR).filter(k => k !== "burn");
const TYPE_PROMPTS = {
  free: "Write freely.",
  gratitude: "Name three things you're genuinely grateful for today.",
  mood: "How are you actually feeling?",
  reflection: "What went well? What would you do differently?",
  work: "What's the actual state of work?",
  relationships: "Who's on your mind?",
  money: "What's your money story right now?",
  creative: "What did you make or notice?",
  grief: "Say what's true.",
  joy: "Name one small good thing.",
  identity: "Who are you becoming?",
};

// Canvas geometry: viewBox 800 × 360, X-axis is 28 days, Y-axis mood 1-5.
const VB_W = 800, VB_H = 360, MARGIN_X = 40, MARGIN_Y = 20;
const PLOT_W = VB_W - MARGIN_X * 2;
const PLOT_H = VB_H - MARGIN_Y * 2;
function xFor(day)   { return MARGIN_X + ((day - 1) / 27) * PLOT_W; }   // day 1..28
function yFor(mood)  { return MARGIN_Y + (1 - (mood - 1) / 4) * PLOT_H; } // mood 1..5 (5=top)

// Mock entries: { day, mood, type, body, words }
const ENTRIES = [
  { id: 1,  day: 1,  mood: 2, type: "mood",       body: "Day 1. Slow. Lots of paracetamol.", words: 32 },
  { id: 2,  day: 3,  mood: 3, type: "reflection", body: "Calmer than I expected.", words: 14 },
  { id: 3,  day: 5,  mood: 4, type: "joy",        body: "Coffee outside, alone, perfect.", words: 18 },
  { id: 4,  day: 8,  mood: 4, type: "creative",   body: "Started sketching again.", words: 22 },
  { id: 5,  day: 11, mood: 5, type: "gratitude",  body: "Three good things today.", words: 28 },
  { id: 6,  day: 14, mood: 5, type: "relationships", body: "Coffee with H. We talked about everything.", words: 40 },
  { id: 7,  day: 16, mood: 4, type: "work",       body: "Wrapped the deck early.", words: 16 },
  { id: 8,  day: 19, mood: 3, type: "reflection", body: "Quieter day. Editing energy.", words: 12 },
  { id: 9,  day: 22, mood: 2, type: "work",       body: "Deadline shifted again.", words: 20 },
  { id: 10, day: 24, mood: 2, type: "grief",      body: "Reading old letters. Heavy.", words: 30 },
  { id: 11, day: 25, mood: 3, type: "reflection", body: "I keep editing myself before I speak.", words: 45 },
  { id: 12, day: 26, mood: 3, type: "reflection", body: "Today: I noticed it again. The editing.", words: 55, isToday: true },
  { id: 13, day: 27, mood: 2, type: "burn",       body: "Things I'm not allowed to say.", words: 18, burn: true, burnIn: "4h" },
  // On This Day reference — same day_in_cycle from a prior cycle:
  { id: 100, day: 26, mood: 2, type: "reflection", body: "I felt invisible at the meeting. Like I had to make myself larger to be heard.", words: 60, lastCycle: true },
];

const PHASES = [
  { start: 1,  end: 5,  colour: T.blush, label: "Menstrual" },
  { start: 6,  end: 13, colour: T.sage,  label: "Follicular" },
  { start: 14, end: 16, colour: T.gold,  label: "Ovulatory" },
  { start: 17, end: 28, colour: T.muted, label: "Luteal" },
];

const MOCK = {
  prompt: "The editing phase. What can you let go of?",
  community: "23 women also journalled today",
  jessLine: "Most of your entries this cycle cluster around day 25–26. There's a pattern worth noticing.",
};

function sizeFor(words) {
  // Map word count (0–60) to 10–22px diameter
  const w = Math.min(60, Math.max(8, words));
  return 10 + (w / 60) * 12;
}

function PhaseBands() {
  return (
    <g>
      {PHASES.map((p) => (
        <rect
          key={p.label}
          x={xFor(p.start) - PLOT_W / 56}
          y={MARGIN_Y}
          width={xFor(p.end) - xFor(p.start) + PLOT_W / 28}
          height={PLOT_H}
          fill={p.colour}
          opacity={0.10}
        />
      ))}
      {PHASES.map((p) => (
        <text
          key={`label-${p.label}`}
          x={(xFor(p.start) + xFor(p.end)) / 2}
          y={MARGIN_Y + 14}
          textAnchor="middle"
          fontFamily={UI}
          fontSize="9"
          fill={T.muted}
          opacity={0.7}
          style={{ letterSpacing: 1, textTransform: "uppercase" }}
        >{p.label.toUpperCase()}</text>
      ))}
    </g>
  );
}

function Axes() {
  return (
    <g>
      {/* Y axis labels */}
      <text x={6} y={yFor(5) + 4} fontFamily={UI} fontSize="9" fill={T.muted}>High</text>
      <text x={6} y={yFor(1) + 4} fontFamily={UI} fontSize="9" fill={T.muted}>Low</text>
      {/* X axis ticks */}
      {[1, 7, 14, 21, 28].map((d) => (
        <text key={d} x={xFor(d)} y={VB_H - 4} textAnchor="middle" fontFamily={UI} fontSize="9" fill={T.muted}>
          {d === 28 ? "Day 28" : `Day ${d}`}
        </text>
      ))}
      {/* Connecting line through entries (chronological) */}
      <polyline
        fill="none"
        stroke={T.muted}
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity={0.45}
        points={ENTRIES.filter(e => !e.lastCycle).sort((a,b)=>a.day-b.day).map(e => `${xFor(e.day)},${yFor(e.mood)}`).join(" ")}
      />
    </g>
  );
}

function GhostDots() {
  // Faint community signal — 23 grey dots scattered near today's column behind entries
  const today = 26;
  return (
    <g opacity={0.25}>
      {Array.from({ length: 23 }).map((_, i) => {
        const angle = (i / 23) * Math.PI * 2;
        const r = 26 + (i % 5);
        return (
          <circle
            key={i}
            cx={xFor(today) + Math.cos(angle) * r}
            cy={yFor(3) + Math.sin(angle) * r}
            r={3}
            fill={T.muted}
          />
        );
      })}
    </g>
  );
}

function Dot({ e, onTap }) {
  const colour = e.burn ? T.amber : (TYPE_COLOUR[e.type] || T.espresso);
  const r = sizeFor(e.words) / 2;
  const cx = xFor(e.day);
  const cy = yFor(e.mood);

  // Last cycle: dashed gold ring around the dot
  if (e.lastCycle) {
    return (
      <g style={{ cursor: "pointer" }} onClick={() => onTap(e)}>
        <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke={T.gold} strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx={cx} cy={cy} r={r} fill={colour} opacity={0.4} />
      </g>
    );
  }

  // Today: large + gold pulse ring
  if (e.isToday) {
    return (
      <g style={{ cursor: "pointer" }} onClick={() => onTap(e)}>
        <circle cx={cx} cy={cy} r={r + 10} fill={T.gold} opacity={0.18}>
          <animate attributeName="r" values={`${r + 8};${r + 16};${r + 8}`} dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.30;0.05;0.30" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={T.gold} strokeWidth="2" />
        <circle cx={cx} cy={cy} r={r + 2} fill={colour} />
        <text x={cx} y={cy + 3} textAnchor="middle" fontFamily={CORM} fontSize="10" fontWeight="700" fill={T.paperHi}>26</text>
      </g>
    );
  }

  return (
    <g style={{ cursor: "pointer" }} onClick={() => onTap(e)}>
      <circle cx={cx} cy={cy} r={r} fill={colour} opacity={0.78} />
      {e.burn && (
        <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fill={T.paperHi} fontFamily={UI} fontWeight="700">🔥</text>
      )}
    </g>
  );
}

function MiniCanvas() {
  // Compressed canvas — used in the insights bar
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: 120, height: 54 }} aria-hidden>
      <PhaseBands />
      {ENTRIES.filter(e => !e.lastCycle).map((e) => (
        <circle
          key={e.id}
          cx={xFor(e.day)}
          cy={yFor(e.mood)}
          r={sizeFor(e.words) / 2}
          fill={e.burn ? T.amber : TYPE_COLOUR[e.type]}
          opacity={e.isToday ? 1 : 0.7}
        />
      ))}
    </svg>
  );
}

function InsightsBar({ onExpand }) {
  return (
    <button onClick={onExpand} style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", textAlign: "left", cursor: "pointer",
      background: T.cream, border: `1px solid rgba(58,44,26,0.10)`,
      borderRadius: 14, padding: "10px 14px", marginBottom: 12,
    }}>
      <div style={{ flexShrink: 0 }}>
        <MiniCanvas />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: UI, fontSize: 11, color: T.gold, fontWeight: 700,
          letterSpacing: 1.4, marginBottom: 3, textTransform: "uppercase",
        }}>Your constellation</div>
        <div style={{ fontFamily: UI, fontSize: 12.5, color: T.espresso, fontWeight: 600 }}>
          Cycle day 26 · 12 entries this cycle
        </div>
        <div style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 13, color: T.muted, marginTop: 2, lineHeight: 1.4 }}>
          {MOCK.jessLine}
        </div>
      </div>
    </button>
  );
}

function InsightsExpanded({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 720,
        borderRadius: 18, padding: "20px 22px 26px",
      }}>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 8, textTransform: "uppercase" }}>
          Your constellation, expanded
        </div>
        <div style={{ background: T.cream, borderRadius: 12, padding: 8, marginBottom: 14, position: "relative" }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <PhaseBands />
            <Axes />
            {ENTRIES.map((e) => (
              <Dot key={e.id} e={e} onTap={() => {}} />
            ))}
            {/* annotation */}
            <line x1={xFor(25)} y1={yFor(3.5) - 18} x2={xFor(26)} y2={yFor(3)} stroke={T.gold} strokeWidth="1" />
            <text x={xFor(25)} y={yFor(3.5) - 22} textAnchor="middle" fontFamily={CORM} fontStyle="italic" fontSize="12" fill={T.gold}>
              Cluster · day 25–26
            </text>
          </svg>
        </div>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16,
          color: T.espresso, lineHeight: 1.55, margin: 0,
        }}>{MOCK.jessLine}</p>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 12 }}>{MOCK.community}</div>
      </div>
    </div>
  );
}

function PromptCard({ onWrite }) {
  return (
    <div style={{
      background: T.cream, border: `1px solid rgba(58,44,26,0.10)`,
      borderLeft: `4px solid ${T.muted}`,
      borderRadius: 14, padding: "12px 14px", marginBottom: 12,
    }}>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4, textTransform: "uppercase" }}>
        Jess · Luteal · Day 26
      </div>
      <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 16, color: T.espresso, lineHeight: 1.55, margin: "0 0 10px" }}>
        {MOCK.prompt}
      </p>
      <button onClick={onWrite} style={{
        background: T.gold, color: T.espresso, border: "none",
        borderRadius: 9999, padding: "7px 14px",
        fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
      }}>Write to this ✦</button>
    </div>
  );
}

function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  const c = entry.burn ? T.amber : TYPE_COLOUR[entry.type];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70, background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: "20px 22px 26px",
        borderTop: `3px solid ${c}`,
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          <span style={{
            fontFamily: UI, fontSize: 11, color: c, fontWeight: 700,
            letterSpacing: 1.4, textTransform: "uppercase",
          }}>
            {entry.burn ? `Burn · burns in ${entry.burnIn}` : TYPE_LABEL[entry.type]}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11.5, color: T.muted }}>
            Day {entry.day} · mood {entry.mood}/5
          </span>
        </div>
        {entry.lastCycle && (
          <div style={{
            fontFamily: UI, fontSize: 10.5, color: T.gold,
            fontWeight: 700, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase",
          }}>This time last cycle</div>
        )}
        {entry.isToday && (
          <div style={{
            fontFamily: UI, fontSize: 10.5, color: T.gold,
            fontWeight: 700, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase",
          }}>Today's prompt</div>
        )}
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 18,
          color: T.espresso, lineHeight: 1.6, margin: 0,
        }}>{entry.body}</p>
        {entry.isToday && (
          <div style={{ marginTop: 14 }}>
            <PromptCard onWrite={onClose} />
          </div>
        )}
        <button style={{
          marginTop: 14,
          background: T.espresso, color: T.cream, border: "none",
          borderRadius: 9999, padding: "8px 16px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
        }}>Ask Jess about this</button>
      </div>
    </div>
  );
}

function Composer({ open, onClose }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [mood, setMood] = useState(3);
  const [burnOn, setBurnOn] = useState(false);
  const [timer, setTimer] = useState("1h");
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 95, background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: "16px 18px 24px", maxHeight: "94vh", overflowY: "auto",
      }}>
        <div style={{ width: 36, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>
            New entry · today
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
          {ENTRY_TYPES.map((k) => {
            const active = k === type;
            return (
              <button key={k} onClick={() => { setType(k); setBurnOn(false); }} style={{
                flexShrink: 0,
                background: active ? TYPE_COLOUR[k] : "transparent",
                color: active ? "white" : T.espresso,
                border: `1px solid ${TYPE_COLOUR[k]}`,
                borderRadius: 9999, padding: "5px 12px",
                fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>{TYPE_LABEL[k]}</button>
            );
          })}
          <button onClick={() => setBurnOn(v => !v)} style={{
            flexShrink: 0,
            background: burnOn ? T.amber : "transparent",
            color: burnOn ? T.paperHi : T.amber,
            border: `1px solid ${T.amber}`,
            borderRadius: 9999, padding: "5px 12px",
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
            whiteSpace: "nowrap",
          }}>🔥 Burn</button>
        </div>

        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 16,
          color: T.espresso, lineHeight: 1.55, margin: "0 0 12px",
        }}>{burnOn ? "Jess never reads this. Set a timer." : (TYPE_PROMPTS[type] || MOCK.prompt)}</p>

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Write…"
          style={{
            width: "100%", minHeight: 200,
            background: T.cream, border: "none",
            borderRadius: 12, padding: 14, resize: "none",
            fontFamily: CORM, fontSize: 17, lineHeight: 1.6,
            color: T.espresso, outline: "none",
          }}
        />

        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
            Mood — this sets the Y position of your dot
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5].map((m) => (
              <button key={m} onClick={() => setMood(m)} style={{
                flex: 1,
                background: mood === m ? T.gold : "transparent",
                color: mood === m ? T.espresso : T.muted,
                border: `1px solid ${T.muted}`,
                borderRadius: 12, padding: "8px 0",
                fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>{m}</button>
            ))}
          </div>
        </div>

        {burnOn && (
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {["1h","24h","Choose date","Tap to burn"].map(t => (
              <button key={t} onClick={() => setTimer(t)} style={{
                background: timer === t ? T.amber : "transparent",
                color: timer === t ? T.paperHi : T.amber,
                border: `1px solid ${T.amber}`,
                borderRadius: 9999, padding: "5px 12px",
                fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{
          width: "100%", marginTop: 14,
          background: T.gold, color: T.espresso, border: "none",
          borderRadius: 9999, padding: "11px 18px",
          fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>Save entry · add to canvas ✦</button>
      </div>
    </div>
  );
}

export default function JournalDemo3() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [detail, setDetail] = useState(ENTRIES.find(e => e.isToday) || null);
  const [insOpen, setInsOpen] = useState(false);
  const [composer, setComposer] = useState(false);
  const dragRef = useRef(null);

  const onWheel = (e) => {
    e.preventDefault();
    const next = Math.max(0.7, Math.min(2.5, zoom + (e.deltaY < 0 ? 0.12 : -0.12)));
    setZoom(next);
  };
  const onMouseDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.x),
      y: dragRef.current.panY + (e.clientY - dragRef.current.y),
    });
  };
  const onMouseUp = () => { dragRef.current = null; };

  return (
    <div style={{ minHeight: "100vh", background: T.surface, paddingBottom: 80 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 16px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 1.4, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>
              Luteal · Day 26
            </div>
            <h1 style={{
              fontFamily: CORM, fontStyle: "italic", fontSize: 28, fontWeight: 500,
              color: T.espresso, margin: 0, letterSpacing: -0.3,
            }}>Your journal as a constellation</h1>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setZoom(z => Math.max(0.7, z - 0.2))} style={zoomBtn}>−</button>
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} style={zoomBtn}>+</button>
          </div>
        </div>

        {/* Insights bar with mini canvas */}
        <InsightsBar onExpand={() => setInsOpen(true)} />

        {/* Canvas viewport */}
        <div
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            position: "relative",
            background: T.cream,
            border: `1px solid rgba(58,44,26,0.10)`,
            borderRadius: 16, overflow: "hidden",
            cursor: dragRef.current ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            style={{
              width: "100%", height: "auto", display: "block",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: dragRef.current ? "none" : "transform 200ms ease-out",
            }}
          >
            <PhaseBands />
            <Axes />
            <GhostDots />
            {ENTRIES.map((e) => <Dot key={e.id} e={e} onTap={(en) => setDetail(en)} />)}
          </svg>

          {/* Community label at bottom */}
          <div style={{
            position: "absolute", left: 12, bottom: 8,
            fontFamily: UI, fontSize: 10, color: T.muted, opacity: 0.85,
          }}>{MOCK.community}</div>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, marginBottom: 4,
        }}>
          {["reflection","joy","work","gratitude","relationships","creative","grief"].map((k) => (
            <span key={k} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: UI, fontSize: 11, color: T.muted,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLOUR[k] }} />
              {TYPE_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      {/* Write today FAB */}
      <button onClick={() => setComposer(true)} style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 60,
        width: 56, height: 56, borderRadius: "50%",
        background: T.gold, color: T.espresso, border: "none",
        boxShadow: "0 8px 22px rgba(212,175,55,0.45)",
        fontSize: 22, fontFamily: CORM, fontWeight: 700, cursor: "pointer",
      }} aria-label="Write today">✏️</button>

      {insOpen && <InsightsExpanded onClose={() => setInsOpen(false)} />}
      <Composer open={composer} onClose={() => setComposer(false)} />
      <EntryDetail entry={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

const zoomBtn = {
  width: 30, height: 30, borderRadius: "50%",
  background: T.cream, color: T.espresso,
  border: `1px solid ${T.muted}`, cursor: "pointer",
  fontFamily: CORM, fontSize: 16, fontWeight: 700,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
