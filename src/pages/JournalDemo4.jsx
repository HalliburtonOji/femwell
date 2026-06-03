// JournalDemo4 — "The Wheel"
// 28 SVG segments arranged in a circle. Today extends outward with a gold
// pulse ring. Past entries fill segments with type colour. Centre = insights.
// Only FemWell can do this — every other journal lacks cycle data.
import { useState, useEffect } from "react";
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

const TODAY = 26;
const CYCLE_LEN = 28;

// Phase mapping
function phaseFor(day) {
  if (day <= 5) return { id: "menstrual",  colour: T.blush, label: "Menstrual" };
  if (day <= 13) return { id: "follicular", colour: T.sage,  label: "Follicular" };
  if (day <= 16) return { id: "ovulatory",  colour: T.gold,  label: "Ovulatory" };
  return { id: "luteal", colour: T.muted, label: "Luteal" };
}

// Mock entries by day. Today is included.
const ENTRIES_BY_DAY = {
  1:  { type: "mood",        body: "Day 1. Slow. Lots of paracetamol." },
  3:  { type: "reflection",  body: "Calmer than I expected." },
  5:  { type: "joy",         body: "Coffee outside, alone, perfect." },
  8:  { type: "creative",    body: "Started sketching again." },
  11: { type: "gratitude",   body: "Three good things today." },
  14: { type: "relationships", body: "Coffee with H. We talked." },
  16: { type: "work",        body: "Wrapped the deck early." },
  19: { type: "reflection",  body: "Quieter day. Editing energy." },
  22: { type: "work",        body: "Deadline shifted again." },
  24: { type: "grief",       body: "Reading old letters. Heavy." },
  25: { type: "reflection",  body: "I keep editing myself before I speak." },
  26: { type: "reflection",  body: "Today: I noticed it again. The editing.", isToday: true },
  27: { type: "burn",        body: "Things I'm not allowed to say.", burn: true, burnIn: "4h" },
};

// On This Day: same cycle day from prior cycle
const ON_THIS_DAY_TEXT = "I felt invisible at the meeting. Like I had to make myself larger to be heard.";

const MOCK = {
  prompt: "The editing phase. What can you let go of? What genuinely matters?",
  altPrompts: [
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
  community: "23 women also in luteal today",
  jessLine: "Today's day is for editing. Quiet, choosing.",
};

// Wheel geometry
const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_INNER = 96;
const R_OUTER = 132;
const R_TODAY = 144;
const R_ECHO  = 116; // mid radius for "last cycle echo" ring

function polar(angle, r) {
  return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r];
}

// Build an SVG path for a circular wedge between two angles, inner→outer arc.
function wedgePath(a0, a1, ri, ro) {
  const [x0i, y0i] = polar(a0, ri);
  const [x1i, y1i] = polar(a1, ri);
  const [x0o, y0o] = polar(a0, ro);
  const [x1o, y1o] = polar(a1, ro);
  const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
  return [
    `M ${x0o} ${y0o}`,
    `A ${ro} ${ro} 0 ${largeArc} 1 ${x1o} ${y1o}`,
    `L ${x1i} ${y1i}`,
    `A ${ri} ${ri} 0 ${largeArc} 0 ${x0i} ${y0i}`,
    "Z",
  ].join(" ");
}

// Map cycle day (1..28) to start/end angles. Today at 12 o'clock (-PI/2).
const ANG_PER = (Math.PI * 2) / CYCLE_LEN;
function anglesForDay(day, offsetRotation = 0) {
  // Day 1 starts left of 12 o'clock and goes clockwise; we centre TODAY at top.
  // Rotation: shift so today's segment sits at -PI/2.
  const todayOffset = -Math.PI / 2 - (TODAY - 0.5) * ANG_PER;
  const a0 = (day - 1) * ANG_PER + todayOffset + offsetRotation;
  const a1 = day * ANG_PER + todayOffset + offsetRotation;
  return [a0, a1];
}

function Segment({ day, settle, onTap }) {
  const phase = phaseFor(day);
  const entry = ENTRIES_BY_DAY[day];
  const isToday = entry && entry.isToday;
  const isBurn  = entry && entry.burn;
  const [a0, a1] = anglesForDay(day);
  const ro = isToday ? R_TODAY : R_OUTER;
  const fillBase = phase.colour;
  const fillEntry = entry ? (TYPE_COLOUR[entry.type] || T.espresso) : fillBase;
  return (
    <g style={{ cursor: "pointer" }} onClick={() => onTap(day, entry, phase)}>
      {/* Phase base wedge */}
      <path d={wedgePath(a0 + 0.005, a1 - 0.005, R_INNER, ro)}
            fill={fillBase} opacity={0.18}
            stroke={T.muted} strokeWidth="0.6" />
      {/* Entry overlay */}
      {entry && (
        <path d={wedgePath(a0 + 0.005, a1 - 0.005, R_INNER, ro)}
              fill={fillEntry} opacity={isBurn ? 0.55 : 0.42} />
      )}
      {/* Today: gold ring + pulse */}
      {isToday && (
        <>
          <path d={wedgePath(a0, a1, R_INNER, R_TODAY)}
                fill="none" stroke={T.gold} strokeWidth="2.5" />
          <path d={wedgePath(a0, a1, R_INNER, R_TODAY)}
                fill={T.gold} opacity={0.15}>
            <animate attributeName="opacity" values="0.10;0.30;0.10" dur="2.4s" repeatCount="indefinite" />
          </path>
        </>
      )}
      {/* Burn icon */}
      {isBurn && (
        (() => {
          const mid = (a0 + a1) / 2;
          const rMid = (R_INNER + R_OUTER) / 2;
          const [x, y] = polar(mid, rMid);
          return (
            <circle cx={x} cy={y} r="3.2" fill={T.muted} />
          );
        })()
      )}
    </g>
  );
}

function EchoRing({ day, onTap }) {
  // Dashed gold ring on the same day from "last cycle" — visual echo
  const [a0, a1] = anglesForDay(day);
  return (
    <path
      d={wedgePath(a0 + 0.005, a1 - 0.005, R_ECHO - 4, R_ECHO + 4)}
      fill="none" stroke={T.gold} strokeWidth="1.5" strokeDasharray="3 3"
      style={{ cursor: "pointer" }}
      onClick={() => onTap(day, { ...ENTRIES_BY_DAY[day], body: ON_THIS_DAY_TEXT, lastCycle: true })}
    />
  );
}

function PhaseLabels() {
  return (
    <g>
      {[
        { day: 3,  text: "Menstrual" },
        { day: 9,  text: "Follicular" },
        { day: 15, text: "Ovulatory" },
        { day: 21, text: "Luteal" },
      ].map((p) => {
        const [a0, a1] = anglesForDay(p.day);
        const mid = (a0 + a1) / 2;
        const [x, y] = polar(mid, R_OUTER + 14);
        return (
          <text key={p.text} x={x} y={y + 3} textAnchor="middle"
                fontFamily={UI} fontSize="9" fill={T.muted}
                style={{ letterSpacing: 1.2, textTransform: "uppercase" }}>
            {p.text.toUpperCase()}
          </text>
        );
      })}
    </g>
  );
}

function WheelCentre({ onExpand }) {
  return (
    <g style={{ cursor: "pointer" }} onClick={onExpand}>
      <circle cx={CX} cy={CY} r={R_INNER - 4} fill={T.cream} stroke="rgba(58,44,26,0.10)" strokeWidth="1" />
      <text x={CX} y={CY - 16} textAnchor="middle" fontFamily={UI} fontSize="9"
            fill={T.muted} style={{ letterSpacing: 1.4, textTransform: "uppercase" }}>
        DAY 26 · LUTEAL
      </text>
      <text x={CX} y={CY - 2} textAnchor="middle" fontFamily={CORM}
            fontStyle="italic" fontSize="14" fill={T.espresso}>
        {MOCK.jessLine}
      </text>
      <text x={CX} y={CY + 18} textAnchor="middle" fontFamily={CORM}
            fontStyle="italic" fontSize="11" fill={T.muted}>
        Tap centre to see more
      </text>
      <text x={CX} y={CY + 32} textAnchor="middle" fontFamily={UI} fontSize="9.5"
            fill={T.gold} style={{ letterSpacing: 1, textTransform: "uppercase" }}>
        <Sparkles size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> Jess
      </text>
      <text x={CX} y={CY + 48} textAnchor="middle" fontFamily={UI} fontSize="9"
            fill={T.muted}>23 · in luteal today</text>
    </g>
  );
}

function Wheel({ onSegmentTap, onCentre }) {
  const [settle, setSettle] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSettle(true), 50); return () => clearTimeout(t); }, []);
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        width: "100%", maxWidth: 360, height: "auto", display: "block", margin: "0 auto",
        transform: settle ? "rotate(0deg)" : "rotate(-30deg)",
        opacity: settle ? 1 : 0.6,
        transition: "transform 2s cubic-bezier(0.16,1,0.3,1), opacity 1.4s",
      }}
    >
      <PhaseLabels />
      {Array.from({ length: CYCLE_LEN }).map((_, i) => (
        <Segment key={i + 1} day={i + 1} onTap={onSegmentTap} />
      ))}
      {/* On This Day echo ring on day 26 (visualised at the mid radius) */}
      <EchoRing day={TODAY} onTap={onSegmentTap} />
      <WheelCentre onExpand={onCentre} />
    </svg>
  );
}

function PromptCard({ onWrite }) {
  const [i, setI] = useState(0);
  const prompts = [MOCK.prompt, ...MOCK.altPrompts];
  return (
    <div style={{
      background: T.cream, border: `1px solid rgba(58,44,26,0.10)`,
      borderLeft: `4px solid ${T.muted}`,
      borderRadius: 14, padding: "14px 16px", marginTop: 12, marginBottom: 12,
    }}>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase" }}>
        Jess · Luteal · Day 26
      </div>
      <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 17, color: T.espresso, lineHeight: 1.55, margin: "0 0 12px" }}>
        {prompts[i % prompts.length]}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onWrite(prompts[i % prompts.length])} style={{
          background: T.gold, color: T.espresso, border: "none",
          borderRadius: 9999, padding: "8px 16px",
          fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Write to this <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></button>
        <button onClick={() => setI(x => x + 1)} style={{
          background: "transparent", color: T.muted,
          border: `1px solid ${T.muted}`,
          borderRadius: 9999, padding: "8px 14px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>Different prompt →</button>
      </div>
    </div>
  );
}

function CentreInsights({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(58,44,26,0.40)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.paperHi, width: "100%", maxWidth: 560,
        borderRadius: 18, padding: "20px 22px 26px",
      }}>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 10, textTransform: "uppercase" }}>
          <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> The Cycle, Annotated
        </div>
        {/* mini wheel reproduction */}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: "100%", maxWidth: 280, display: "block", margin: "0 auto 14px" }}>
          <PhaseLabels />
          {Array.from({ length: CYCLE_LEN }).map((_, i) => (
            <Segment key={i + 1} day={i + 1} onTap={() => {}} />
          ))}
        </svg>
        <p style={{
          fontFamily: CORM, fontStyle: "italic", fontSize: 17,
          color: T.espresso, lineHeight: 1.55, margin: "0 0 12px", textAlign: "center",
        }}>{MOCK.jessLine}</p>
        <div style={{
          background: T.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10,
          borderLeft: `3px solid ${T.gold}`,
        }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4, textTransform: "uppercase" }}>
            On This Day · Last cycle
          </div>
          <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 15, color: T.espresso, margin: 0, lineHeight: 1.55 }}>
            "{ON_THIS_DAY_TEXT}"
          </p>
        </div>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, textAlign: "center" }}>
          {MOCK.community}
        </div>
      </div>
    </div>
  );
}

function SegmentDetail({ data, onClose, onWrite }) {
  if (!data) return null;
  const { day, entry, phase } = data;
  const isToday = entry && entry.isToday;
  const c = entry ? (entry.burn ? T.amber : TYPE_COLOUR[entry.type]) : phase.colour;
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
        <div style={{
          fontFamily: UI, fontSize: 11, color: c, fontWeight: 700,
          letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase",
        }}>
          Day {day} · {phase.label}
        </div>
        {entry?.lastCycle && (
          <div style={{
            fontFamily: UI, fontSize: 10, color: T.gold, fontWeight: 700,
            letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase",
          }}>This time last cycle</div>
        )}
        {entry ? (
          <>
            <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 18, color: T.espresso, lineHeight: 1.6, margin: "4px 0 10px" }}>
              {entry.body}
            </p>
            {entry.burn && (
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.amber, fontWeight: 700, marginBottom: 8 }}>
                <Flame size={12} style={{ display: "inline", verticalAlign: "-2px" }} /> Burns in {entry.burnIn}
              </div>
            )}
            {isToday && <PromptCard onWrite={() => { onWrite(); onClose(); }} />}
          </>
        ) : (
          <>
            <p style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 16, color: T.muted, margin: "4px 0 14px", lineHeight: 1.55 }}>
              Nothing written on day {day} of this cycle.
            </p>
            <button onClick={() => { onWrite(); onClose(); }} style={{
              background: T.gold, color: T.espresso, border: "none",
              borderRadius: 9999, padding: "8px 16px",
              fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Write for day {day} <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></button>
          </>
        )}
      </div>
    </div>
  );
}

function Composer({ open, onClose }) {
  const [type, setType] = useState("reflection");
  const [text, setText] = useState("");
  const [burnOn, setBurnOn] = useState(false);
  const [timer, setTimer] = useState("24h");
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>
            For this cycle day
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
          }}><Flame size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Burn</button>
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
        }}>Save · fill segment <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px" }} /></button>
      </div>
    </div>
  );
}

export default function JournalDemo4() {
  const [segment, setSegment] = useState(null);
  const [centreOpen, setCentreOpen] = useState(false);
  const [composer, setComposer] = useState(false);

  const handleSegmentTap = (day, entry, phaseOrEcho) => {
    // If entry is provided by EchoRing it includes lastCycle flag
    const phase = phaseOrEcho?.id ? phaseOrEcho : phaseFor(day);
    setSegment({ day, entry: entry || null, phase });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.surface, paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 1.4, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>
            Luteal · Day 26
          </div>
          <h1 style={{ fontFamily: CORM, fontStyle: "italic", fontSize: 26, fontWeight: 500, color: T.espresso, margin: 0 }}>
            The cycle, in 28 segments
          </h1>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontFamily: UI, fontSize: 10.5, color: T.muted, marginBottom: 8 }}>
          {[
            ["Menstrual", T.blush],
            ["Follicular", T.sage],
            ["Ovulatory", T.gold],
            ["Luteal", T.muted],
          ].map(([label, c]) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              {label}
            </span>
          ))}
        </div>

        <div style={{ background: T.cream, borderRadius: 18, padding: "16px 12px", border: `1px solid rgba(58,44,26,0.08)` }}>
          <Wheel
            onSegmentTap={(day, entry, phaseOrEcho) => handleSegmentTap(day, entry, phaseOrEcho)}
            onCentre={() => setCentreOpen(true)}
          />
        </div>

        {/* Prompt card below the wheel */}
        <PromptCard onWrite={() => setComposer(true)} />

        {/* Community + On This Day labels */}
        <div style={{
          display: "flex", justifyContent: "space-between", gap: 10,
          fontFamily: UI, fontSize: 11, color: T.muted, padding: "0 6px",
        }}>
          <span><Sparkles size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> {MOCK.community}</span>
          <span>Dashed gold = last cycle echo</span>
        </div>
      </div>

      <CentreInsights open={centreOpen} onClose={() => setCentreOpen(false)} />
      <SegmentDetail data={segment} onClose={() => setSegment(null)} onWrite={() => setComposer(true)} />
      <Composer open={composer} onClose={() => setComposer(false)} />
    </div>
  );
}
