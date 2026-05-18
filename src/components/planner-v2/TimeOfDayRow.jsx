// TimeOfDayRow — three tall cards (Morning / Afternoon / Evening). Sliding
// changes the active accent on the dots. Each card has sectioned interactive
// checkboxes. Pregnancy stage shows different prompts.
//
// Props:
//   stage, phase
//   morningItems   { habits[], nourishment[], care[], tasks[] }
//   afternoonItems { habits[], nourishment[], tasks[] }
//   eveningItems   { reflection[], care[], nourishment[], sleep[] }
//   onAdd(type?)   opens UniversalLogger

import React, { useRef, useState, useEffect } from "react";
import { Sun, Activity, Moon, Plus } from "lucide-react";
import { C } from "./tokens";
import { openLogger } from "@/components/UniversalLogger";

const VARIANTS = [
  { id: "morning",   label: "MORNING",   Icon: Sun,      accent: C.gold  },
  { id: "afternoon", label: "AFTERNOON", Icon: Activity, accent: C.sage  },
  { id: "evening",   label: "EVENING",   Icon: Moon,     accent: C.blush },
];

function defaultsFor(id, stage) {
  if (stage && stage.startsWith("pregnant")) {
    if (id === "morning")   return { sections: [
      { name: "JOURNEY",     items: [{ id: "p1", text: "Morning sickness check", done: false }] },
      { name: "NOURISHMENT", items: [{ id: "p2", text: "Folic acid 400mcg", done: false, meta: "8:00am" }] },
    ]};
    if (id === "afternoon") return { sections: [
      { name: "MOVEMENT",    items: [{ id: "p3", text: "Gentle walk · 20m", done: false }] },
    ]};
    if (id === "evening")   return { sections: [
      { name: "REFLECTIONS", items: [{ id: "p4", text: "Kick count (if T2/T3)", done: false }] },
      { name: "SLEEP",       items: [{ id: "p5", text: "Pillow positioning", meta: "9:30pm", info: true }] },
    ]};
  }
  if (id === "morning") return { sections: [
    { name: "HABITS", items: [
      { id: "h1", text: "Morning movement",   meta: "streak", done: false },
      { id: "h2", text: "Hydration check",    meta: "streak", done: false },
      { id: "h3", text: "Supplements",        meta: "streak", done: false },
    ]},
    { name: "NOURISHMENT", items: [{ id: "n1", text: "Breakfast", done: false }] },
    { name: "TASKS", items: [{ id: "t1", text: "Top task", done: false }] },
  ]};
  if (id === "afternoon") return { sections: [
    { name: "HABITS", items: [{ id: "ah1", text: "Midday hydration", done: false }] },
    { name: "NOURISHMENT", items: [{ id: "an1", text: "Lunch", done: false }] },
    { name: "TASKS", items: [{ id: "at1", text: "Continue from morning", done: false }] },
  ]};
  return { sections: [
    { name: "TONIGHT'S REFLECTION", items: [
      { id: "tr1", text: "One win today", reflection: true },
      { id: "tr2", text: "Energy rating", reflection: true },
    ]},
    { name: "CARE", items: [{ id: "ec1", text: "Magnesium glycinate", meta: "evening", done: false }] },
    { name: "SLEEP TARGET", items: [{ id: "es1", text: "Aim for bed by 10:30pm", info: true }] },
  ]};
}

function VariantCard({ variant, sections, onItemToggle, onAdd }) {
  return (
    <article style={{
      background: C.cream, borderRadius: 18,
      padding: "16px 18px 16px 14px",
      boxShadow: "0 2px 12px rgba(58,44,26,0.08)",
      minHeight: 380, height: "100%",
      display: "flex", flexDirection: "column", gap: 4,
      borderLeft: `4px solid ${variant.accent}`,
      boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9999,
          background: `${variant.accent}1F`, color: variant.accent,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <variant.Icon size={14} />
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          color: variant.accent,
        }}>{variant.label}</span>
      </div>
      {(sections || []).map((sec) => (
        <div key={sec.name} style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(58,44,26,0.10)" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted }}>{sec.name}</span>
            <span style={{ flex: 1, height: 1, background: "rgba(58,44,26,0.10)" }} />
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sec.items.map((it) => (
              <li key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                {!it.reflection && !it.info ? (
                  <input type="checkbox" checked={!!it.done} onChange={() => onItemToggle?.(sec.name, it.id)}
                    style={{ accentColor: variant.accent, flexShrink: 0 }} />
                ) : it.info ? (
                  <Moon size={14} style={{ color: C.muted, flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 16, height: 16, flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: 12.5, flex: 1, color: C.espresso,
                  textDecoration: it.done ? "line-through" : "none",
                  opacity: it.done ? 0.5 : 1,
                }}>{it.text}</span>
                {it.meta && (
                  <span style={{ fontSize: 9.5, letterSpacing: "0.08em", color: C.muted, fontWeight: 600 }}>{it.meta}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={() => onAdd?.()} style={{
        alignSelf: "flex-start", marginTop: 10,
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 12px", borderRadius: 9999,
        background: "transparent", border: `1px dashed ${variant.accent}55`,
        color: variant.accent,
        fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
      }}>
        <Plus size={12} /> Add
      </button>
    </article>
  );
}

function TimeOfDayRow({ stage, phase, morningItems, afternoonItems, eveningItems, onAdd }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const cards = [
    { variant: VARIANTS[0], data: morningItems   || defaultsFor("morning",   stage) },
    { variant: VARIANTS[1], data: afternoonItems || defaultsFor("afternoon", stage) },
    { variant: VARIANTS[2], data: eveningItems   || defaultsFor("evening",   stage) },
  ];

  // Local state for toggles (real wiring via prop callbacks in Phase 2)
  const [localSections, setLocalSections] = useState(cards.map((c) => c.data.sections));
  useEffect(() => {
    setLocalSections(cards.map((c) => c.data.sections));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function toggle(cardIdx, secName, id) {
    setLocalSections((prev) => prev.map((secs, ci) => ci !== cardIdx ? secs : secs.map((s) =>
      s.name !== secName ? s : { ...s, items: s.items.map((it) => it.id === id ? { ...it, done: !it.done } : it) },
    )));
  }
  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(cards.length - 1, i));
    setActive(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setActive(best);
  }

  return (
    <section style={{ marginBottom: 18 }} aria-label="Your day">
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", marginBottom: 8,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.muted, fontWeight: 700,
        }}>YOUR DAY</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {cards.map((c, i) => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: 9999,
              background: i === active ? c.variant.accent : "rgba(58,44,26,0.20)",
              transform: i === active ? "scale(1.4)" : "scale(1)",
              transition: "all 200ms ease",
            }} />
          ))}
        </div>
      </div>
      <div ref={trackRef} onScroll={onScroll} style={{
        display: "flex", overflowX: "auto",
        scrollSnapType: "x mandatory", gap: 12, padding: "4px 16px",
        scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
      }}>
        {cards.map((c, i) => (
          <div key={c.variant.id} style={{
            flex: "0 0 calc(100% - 32px)", maxWidth: 520, scrollSnapAlign: "start",
          }}>
            <VariantCard
              variant={c.variant}
              sections={localSections[i]}
              onItemToggle={(secName, id) => toggle(i, secName, id)}
              onAdd={() => (onAdd ? onAdd(c.variant.id) : openLogger())}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(TimeOfDayRow);
