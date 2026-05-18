// CareRow — four cards: Meds & Supplements (merged) · Symptom Log ·
// Body Scan · GP Report (compact). Stage-aware so pregnancy shows
// folic-acid / kick-count nudges rather than HRT prompts.
//
// Props:
//   medications [{ id, name, dose, time, taken }]
//   supplements [{ id, name, dose, time, taken }]
//   symptoms    [{ id, label, severity }]   today's quick-log
//   stage       optional — "pregnant_t1" | "pregnant_t2" | "pregnant_t3" | etc
//   onOpenGpReport()                         opens the full Doctor-Ready overlay

import React, { useState } from "react";
import { Pill, Activity, Scan, FileText, ChevronRight, Check, Plus, Sparkles } from "lucide-react";
import Row from "./Row";
import { C, card, kicker, cardTitle, cardSub } from "./tokens";
import { openLogger } from "@/components/UniversalLogger";

function MedsSupplementsCard({ medications, supplements, stage }) {
  const meds = medications || [];
  const supps = supplements || (stage && stage.startsWith("pregnant")
    ? [
        { id: "s1", name: "Folic acid", dose: "400mcg", time: "8:00am", taken: true },
        { id: "s2", name: "Pregnacare",  dose: "1 tab",   time: "8:00am", taken: false },
        { id: "s3", name: "Vitamin D",   dose: "10mcg",  time: "with dinner", taken: false },
      ]
    : [
        { id: "s1", name: "Magnesium glycinate", dose: "300mg", time: "evening", taken: false },
        { id: "s2", name: "Vitamin D",           dose: "1000IU", time: "morning", taken: true },
        { id: "s3", name: "Omega-3",             dose: "1g",     time: "with meal", taken: true },
      ]);
  const [items, setItems] = useState([...meds, ...supps]);

  function toggle(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, taken: !it.taken } : it));
  }
  const takenCount = items.filter((i) => i.taken).length;

  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>MEDS & SUPPLEMENTS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's stack</h3>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.muted,
          padding: "3px 9px", borderRadius: 9999,
          background: `${C.sage}1A`, whiteSpace: "nowrap",
        }}>{takenCount}/{items.length}</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.slice(0, 5).map((it) => (
          <li key={it.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 8px", borderRadius: 10,
            background: it.taken ? `${C.sage}10` : C.cream,
            border: `1px solid ${it.taken ? `${C.sage}33` : "rgba(58,44,26,0.06)"}`,
          }}>
            <button onClick={() => toggle(it.id)} aria-label={`Mark ${it.name} taken`} style={{
              width: 20, height: 20, borderRadius: 9999,
              background: it.taken ? C.sage : "transparent",
              border: `1.5px solid ${it.taken ? C.sage : "rgba(58,44,26,0.22)"}`,
              cursor: "pointer", padding: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {it.taken && <Check size={11} style={{ color: "#fff" }} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: C.espresso,
                textDecoration: it.taken ? "line-through" : "none",
                opacity: it.taken ? 0.6 : 1,
              }}>{it.name}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                {it.dose}{it.time ? ` · ${it.time}` : ""}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openLogger("med")} style={ctaLink}>
        <Plus size={11} /> Add medication <ChevronRight size={11} />
      </button>
    </article>
  );
}

function SymptomLogCard({ symptoms, stage }) {
  const list = symptoms || (stage && stage.startsWith("pregnant")
    ? [
        { id: "y1", label: "Nausea",       severity: 2 },
        { id: "y2", label: "Fatigue",      severity: 3 },
        { id: "y3", label: "Heartburn",    severity: 1 },
      ]
    : [
        { id: "y1", label: "Cramps",       severity: 2 },
        { id: "y2", label: "Headache",     severity: 1 },
        { id: "y3", label: "Bloating",     severity: 2 },
      ]);
  const toneFor = (v) => v >= 3 ? C.rose : v >= 2 ? C.gold : C.sage;

  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOM LOG</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>How is your body today?</h3>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map((s) => (
          <li key={s.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 8px", borderRadius: 10,
            background: C.cream, border: "1px solid rgba(58,44,26,0.06)",
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: 9999, background: toneFor(s.severity), flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: 12.5, color: C.espresso, fontWeight: 600 }}>{s.label}</span>
            <span style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3].map((n) => (
                <span key={n} style={{
                  width: 14, height: 4, borderRadius: 9999,
                  background: n <= s.severity ? toneFor(s.severity) : "rgba(58,44,26,0.10)",
                }} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <button onClick={() => openLogger("symptom")} style={ctaLink}>
        <Plus size={11} /> Log symptoms <ChevronRight size={11} />
      </button>
    </article>
  );
}

function BodyScanCard({ stage }) {
  // Quick body-scan: 6 zones tap-to-cycle through 4 sensations.
  // Local-only for now — wiring lands in Phase 2.
  const zones = ["Head", "Chest", "Belly", "Pelvis", "Back", "Legs"];
  const SENSATIONS = ["—", "Tight", "Ache", "Calm"];
  const TONE = ["rgba(58,44,26,0.10)", C.rose, C.gold, C.sage];
  const [state, setState] = useState(() => zones.map(() => 0));
  function cycle(i) {
    setState((prev) => prev.map((v, j) => j === i ? (v + 1) % SENSATIONS.length : v));
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Scan size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>BODY SCAN</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>One-minute check-in</h3>
        </div>
      </div>
      <p style={cardSub}>Tap each zone — cycle through how it feels right now.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
        {zones.map((z, i) => (
          <button key={z} onClick={() => cycle(i)} style={{
            padding: "8px 6px", borderRadius: 12,
            background: C.cream, border: `1px solid ${TONE[state[i]]}`,
            cursor: "pointer", fontFamily: "inherit", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: TONE[state[i]] }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.espresso }}>{z}</span>
            <span style={{ fontSize: 9, color: C.muted, letterSpacing: "0.04em" }}>{SENSATIONS[state[i]]}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function GpReportCard({ stage, onOpen }) {
  // Compact preview that opens the full Doctor-Ready Diary overlay.
  const items = stage && stage.startsWith("pregnant")
    ? [
        { label: "Folic acid streak", value: "21 days" },
        { label: "Kick counts logged", value: "4 sessions" },
        { label: "Antenatal notes",   value: "Ready" },
      ]
    : [
        { label: "Cycle length avg",  value: "28 days" },
        { label: "Symptoms logged",   value: "12 this cycle" },
        { label: "Medications",       value: "Up to date" },
      ];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.espresso}14`, color: C.espresso,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><FileText size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>DOCTOR-READY DIARY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Take this to your GP</h3>
        </div>
        <Sparkles size={12} style={{ color: C.gold }} />
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((it) => (
          <li key={it.label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 10px", borderRadius: 10,
            background: C.cream, border: "1px solid rgba(58,44,26,0.06)",
          }}>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{it.label}</span>
            <span style={{ fontSize: 12.5, color: C.espresso, fontWeight: 700 }}>{it.value}</span>
          </li>
        ))}
      </ul>
      <button onClick={onOpen} style={{
        alignSelf: "flex-start", marginTop: 6,
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "6px 12px", borderRadius: 9999,
        background: C.espresso, color: C.cream,
        border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
      }}>
        Open full export <ChevronRight size={11} />
      </button>
    </article>
  );
}

const ctaLink = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};

export default function CareRow({ medications, supplements, symptoms, stage, onOpenGpReport }) {
  return (
    <Row label="Care">
      <MedsSupplementsCard medications={medications} supplements={supplements} stage={stage} />
      <SymptomLogCard symptoms={symptoms} stage={stage} />
      <BodyScanCard stage={stage} />
      <GpReportCard stage={stage} onOpen={onOpenGpReport} />
    </Row>
  );
}
