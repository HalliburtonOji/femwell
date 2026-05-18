// InsightsRow — Daily Intention · Astra Reading · Mood & Mental Health ·
// Breathwork · Cycle Psychology. Five cards.

import React, { useState, useEffect } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import Row from "./Row";
import { C, PHASE_DEEP, card, kicker, cardTitle } from "./tokens";

const PHASE_PROMPTS = {
  ovulatory:  "What does your body need you to honour today?",
  follicular: "What's calling you to start?",
  luteal:     "What can you let go of this week?",
  menstrual:  "How can you slow down today?",
};

function IntentionCard({ initial, onSave, dateKey }) {
  const key = `femwell_intention_${dateKey || new Date().toISOString().split("T")[0]}`;
  const [val, setVal] = useState(() => {
    if (initial != null) return initial;
    try { return localStorage.getItem(key) || ""; } catch { return ""; }
  });
  function handleBlur() {
    try { localStorage.setItem(key, val); } catch {}
    onSave?.(val);
  }
  return (
    <article style={card}>
      <h3 style={cardTitle}>Daily intention</h3>
      <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: C.muted, margin: "4px 0" }}>
        Anchor for today.
      </p>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} onBlur={handleBlur}
        placeholder="Write here…" rows={4} style={{
        width: "100%", padding: "10px 12px",
        borderRadius: 10, background: C.cream,
        border: "1px solid rgba(58,44,26,0.10)",
        fontFamily: "Georgia, serif", fontSize: 13, color: C.espresso,
        lineHeight: 1.55, outline: "none", resize: "vertical",
        boxSizing: "border-box",
      }} />
    </article>
  );
}

function AstraCard({ astraReading, phase }) {
  const reading = astraReading || {
    title: phase ? `Your ${phase} reading` : "Your reading",
    short: "Your patterns are speaking. Today wants honesty over performance.",
  };
  return (
    <article style={{ ...card, position: "relative" }}>
      <div style={{
        position: "absolute", top: 12, right: 12,
        width: 30, height: 30, borderRadius: 9999,
        background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}><Sparkles size={14} style={{ color: C.gold }} /></div>
      <span style={kicker}>ASTRA · READING</span>
      <h3 style={cardTitle}>{reading.title}</h3>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: C.espresso, lineHeight: 1.55, margin: 0 }}>
        {reading.short}
      </p>
    </article>
  );
}

function MoodMentalHealthCard({ moodHistory, phase }) {
  const dots = moodHistory || [3, 4, 3, 2, 2, 3, 3];
  const colorFor = (v) => v >= 4 ? C.sage : v >= 3 ? C.gold : C.blush;
  return (
    <article style={card}>
      <span style={kicker}>MOOD & MENTAL HEALTH</span>
      <h3 style={cardTitle}>How are you really feeling?</h3>
      <div style={{ display: "flex", gap: 8, padding: "8px 0", marginTop: 4 }}>
        {dots.map((v, i) => (
          <span key={i} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ width: 18, height: 18, borderRadius: 9999, background: colorFor(v) }} />
          </span>
        ))}
      </div>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 12, color: C.muted, margin: "8px 0 0", lineHeight: 1.55,
      }}>
        {phase === "luteal" ? "Luteal can bring emotional intensity — this is biological, not personal." : "Your patterns are visible. Tell Jess what you're noticing."}
      </p>
    </article>
  );
}

function BreathworkCard() {
  const patterns = [
    { name: "Box breathing",   pattern: "4-4-4-4", duration: "4 min", purpose: "Calm" },
    { name: "4-7-8 breathing", pattern: "4-7-8",   duration: "5 min", purpose: "Sleep" },
    { name: "Cyclic sighing",  pattern: "2-1",     duration: "3 min", purpose: "Stress relief" },
  ];
  return (
    <article style={card}>
      <span style={kicker}>BREATHWORK</span>
      <h3 style={cardTitle}>Centre yourself</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {patterns.map((p) => (
          <button key={p.name} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", borderRadius: 12,
            background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
            cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500, color: C.espresso, lineHeight: 1.2 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: "0.04em" }}>
                {p.pattern} · {p.duration} · {p.purpose}
              </div>
            </div>
            <ChevronRight size={12} style={{ color: C.muted }} />
          </button>
        ))}
      </div>
    </article>
  );
}

const SEASON_NAMES = {
  menstrual: "Inner Winter", follicular: "Inner Spring",
  ovulatory: "Inner Summer", luteal: "Inner Autumn",
};
const SEASON_CHARS = {
  menstrual:  ["Energy turns inward", "Boundaries feel natural", "Rest is the work"],
  follicular: ["Curiosity rises", "New ideas land easily", "Energy feels lighter"],
  ovulatory:  ["Verbal sharpness peaks", "Confidence is high", "Visibility lands well"],
  luteal:     ["Reflection sharpens", "Boundaries feel natural", "Inner critic may get loud"],
};

function CyclePsychologyCard({ phase = "luteal" }) {
  return (
    <article style={card}>
      <span style={kicker}>CYCLE PSYCHOLOGY</span>
      <h3 style={cardTitle}>Your inner season</h3>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 12,
        background: `${PHASE_DEEP[phase]}1F`, border: `1px solid ${PHASE_DEEP[phase]}33`,
      }}>
        <span style={{ width: 12, height: 12, borderRadius: 9999, background: PHASE_DEEP[phase] }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso }}>
            {phase[0].toUpperCase() + phase.slice(1)} · {SEASON_NAMES[phase]}
          </div>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 5 }}>
        {SEASON_CHARS[phase].map((c) => (
          <li key={c} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: C.espresso, lineHeight: 1.45 }}>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: C.gold, marginTop: 7, flexShrink: 0 }} />
            {c}
          </li>
        ))}
      </ul>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 12, color: C.muted, margin: "8px 0 0", lineHeight: 1.55,
      }}>This is normal. You are not broken.</p>
    </article>
  );
}

export default function InsightsRow({ intention, astraReading, phase, moodHistory }) {
  return (
    <Row label="Mind & insight">
      <IntentionCard initial={intention} />
      <AstraCard astraReading={astraReading} phase={phase} />
      <MoodMentalHealthCard moodHistory={moodHistory} phase={phase} />
      <BreathworkCard />
      <CyclePsychologyCard phase={phase} />
    </Row>
  );
}
