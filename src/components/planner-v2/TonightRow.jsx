// TonightRow — Tonight's Intentions · Tomorrow Preview · Cycle Reflection.
//
// Props:
//   tomorrowPhase    "ovulatory" | "follicular" | "luteal" | "menstrual"
//   tomorrowEvents   [{ id, hour, title }]
//   reflection       optional initial reflection text
//   stage            optional stage for pregnancy variants
//   dateKey          override for localStorage key (defaults to today)

import React, { useState } from "react";
import { Moon, Sunrise, Heart, ChevronRight, Check, Sparkles } from "lucide-react";
import Row from "./Row";
import { C, PHASE_DEEP, PHASE_SOFT, card, kicker, cardTitle, cardSub } from "./tokens";

function TonightIntentionsCard({ stage, dateKey }) {
  const key = `femwell_tonight_${dateKey || new Date().toISOString().split("T")[0]}`;
  const DEFAULTS = stage && stage.startsWith("pregnant")
    ? [
        { id: "i1", text: "Pillow positioning",  done: false },
        { id: "i2", text: "Sleep by 10:00pm",    done: false },
        { id: "i3", text: "Hydration before bed", done: false },
      ]
    : [
        { id: "i1", text: "Phone down by 9:30pm", done: false },
        { id: "i2", text: "Magnesium taken",      done: false },
        { id: "i3", text: "Wind-down ritual",     done: false },
      ];
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULTS;
  });
  function toggle(id) {
    setItems((prev) => {
      const next = prev.map((it) => it.id === id ? { ...it, done: !it.done } : it);
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }
  const done = items.filter((i) => i.done).length;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}1A`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Moon size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>TONIGHT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Close the day kindly</h3>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.muted,
          padding: "3px 9px", borderRadius: 9999,
          background: `${C.plum}14`,
        }}>{done}/{items.length}</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => (
          <li key={it.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 10,
            background: it.done ? `${C.plum}10` : C.cream,
            border: `1px solid ${it.done ? `${C.plum}33` : "rgba(58,44,26,0.06)"}`,
          }}>
            <button onClick={() => toggle(it.id)} aria-label={`Toggle ${it.text}`} style={{
              width: 20, height: 20, borderRadius: 9999,
              background: it.done ? C.plum : "transparent",
              border: `1.5px solid ${it.done ? C.plum : "rgba(58,44,26,0.22)"}`,
              cursor: "pointer", padding: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {it.done && <Check size={11} style={{ color: "#fff" }} />}
            </button>
            <span style={{
              flex: 1, fontSize: 12.5, color: C.espresso,
              textDecoration: it.done ? "line-through" : "none",
              opacity: it.done ? 0.6 : 1,
            }}>{it.text}</span>
          </li>
        ))}
      </ul>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 12, color: C.muted, margin: "6px 0 0", lineHeight: 1.55,
      }}>The body remembers gentleness.</p>
    </article>
  );
}

function TomorrowPreviewCard({ tomorrowPhase = "ovulatory", tomorrowEvents }) {
  const events = tomorrowEvents || [
    { id: "t1", hour: 9,  title: "Strategy review" },
    { id: "t2", hour: 12, title: "Lunch with team" },
    { id: "t3", hour: 16, title: "Pitch prep" },
  ];
  const tone = PHASE_DEEP[tomorrowPhase] || C.gold;
  const soft = PHASE_SOFT[tomorrowPhase] || C.cream;
  const PHASE_PROMPTS = {
    ovulatory:  "Lean into visibility — your voice carries tomorrow.",
    follicular: "Start something new — momentum is on your side.",
    luteal:     "Protect your edges — schedule lighter where you can.",
    menstrual:  "Honour the slowdown — rest is the work.",
  };
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${tone}1F`, color: tone,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sunrise size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>TOMORROW</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>
            {tomorrowPhase[0].toUpperCase()}{tomorrowPhase.slice(1)} energy
          </h3>
        </div>
      </div>
      <div style={{
        padding: "8px 10px", borderRadius: 10, marginTop: 4,
        background: `${soft}55`, border: `1px solid ${tone}33`,
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 12.5, color: C.espresso, lineHeight: 1.5,
      }}>
        {PHASE_PROMPTS[tomorrowPhase] || PHASE_PROMPTS.ovulatory}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {events.slice(0, 3).map((e) => (
          <li key={e.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 10,
            background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: tone, minWidth: 34 }}>
              {e.hour <= 12 ? e.hour : e.hour - 12}{e.hour < 12 ? "am" : "pm"}
            </span>
            <span style={{ flex: 1, fontSize: 12.5, color: C.espresso, fontWeight: 600, minWidth: 0 }}>{e.title}</span>
          </li>
        ))}
      </ul>
      <button style={ctaLink}>View full day <ChevronRight size={12} /></button>
    </article>
  );
}

function CycleReflectionCard({ reflection, dateKey }) {
  const key = `femwell_reflection_${dateKey || new Date().toISOString().split("T")[0]}`;
  const [text, setText] = useState(() => {
    if (reflection != null) return reflection;
    try { return localStorage.getItem(key) || ""; } catch { return ""; }
  });
  function handleBlur() { try { localStorage.setItem(key, text); } catch {} }

  const PROMPTS = [
    "What felt easeful today?",
    "What did your body ask for?",
    "One thing you noticed about your cycle.",
  ];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>CYCLE REFLECTION</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>One line for tonight</h3>
        </div>
        <Sparkles size={12} style={{ color: C.gold }} />
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        {PROMPTS.map((p) => (
          <li key={p} style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 11.5, color: C.muted, lineHeight: 1.45,
          }}>· {p}</li>
        ))}
      </ul>
      <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={handleBlur}
        placeholder="Tonight, I noticed…" rows={3} style={{
          width: "100%", padding: "8px 10px", marginTop: 6,
          borderRadius: 10, background: C.cream,
          border: "1px solid rgba(58,44,26,0.10)",
          fontFamily: "Georgia, serif", fontSize: 12.5, color: C.espresso,
          lineHeight: 1.5, outline: "none", resize: "vertical",
          boxSizing: "border-box",
      }} />
    </article>
  );
}

const ctaLink = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};

function TonightRow({ tomorrowPhase, tomorrowEvents, reflection, stage, dateKey }) {
  return (
    <Row label="Tonight & tomorrow">
      <TonightIntentionsCard stage={stage} dateKey={dateKey} />
      <TomorrowPreviewCard tomorrowPhase={tomorrowPhase} tomorrowEvents={tomorrowEvents} />
      <CycleReflectionCard reflection={reflection} dateKey={dateKey} />
    </Row>
  );
}

export default React.memo(TonightRow);
