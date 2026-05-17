// ─────────────────────────────────────────────────────────────────────────────
// RitualBundlesCarousel — Phase 2 BUILD 5
//
// Horizontal phase-keyed carousel sitting below the morning ritual stack on
// the Today tab. Four cycle-anchored bundles + one fallback for non-cycle
// stages:
//
//   • menstrual   → Restore  (rest-leaning rituals)
//   • follicular  → Build    (new-energy rituals)
//   • ovulatory   → Expand   (connection / output rituals)
//   • luteal      → Settle   (boundary / softening rituals)
//   • non-cycle   → Wellbeing (general 3-ritual primer)
//
// Tapping a bundle drops every ritual in it onto the user's HabitLogs for
// the selected day, stamped with `time_of_day` ("morning" for the warmer
// active bundles, "evening" for Settle/Restore wind-downs). The morning
// stack picks them up on the next reactivity tick; today's check toggles
// remain optimistic via the parent toggleHabit() handler.
//
// Empty/duplicate safety: if a HabitLog row for the same name + date
// already exists, we skip the create. Bundle tap doesn't navigate away —
// it's an inline action.
//
// Visual: cream tile background per FemWell Le Menu palette; the bundle
// matching the user's current phase gets a subtle "for today" gold pip.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BUNDLES = {
  menstrual: {
    title: "Restore",
    subtitle: "Soften, slow, rest",
    accent: "#9A2845",
    rituals: [
      { name: "Heat on belly", timeOfDay: "evening" },
      { name: "Yin yoga · 10m", timeOfDay: "evening" },
      { name: "Warm cooked breakfast", timeOfDay: "morning" },
      { name: "Lights out by 10pm", timeOfDay: "evening" },
    ],
  },
  follicular: {
    title: "Build",
    subtitle: "New energy, fresh starts",
    accent: "#D4745A",
    rituals: [
      { name: "Morning walk · 20m", timeOfDay: "morning" },
      { name: "Strength · 25m", timeOfDay: "morning" },
      { name: "Plan one small thing", timeOfDay: "morning" },
      { name: "Cold water on face", timeOfDay: "morning" },
    ],
  },
  ovulatory: {
    title: "Expand",
    subtitle: "Connect, speak, move",
    accent: "#C8A040",
    rituals: [
      { name: "Reach out to someone", timeOfDay: "morning" },
      { name: "HIIT or dance · 20m", timeOfDay: "morning" },
      { name: "Sunlight before screens", timeOfDay: "morning" },
      { name: "Hydration: 2L", timeOfDay: "morning" },
    ],
  },
  luteal: {
    title: "Settle",
    subtitle: "Soft edges, honest hours",
    accent: "#7B5E9A",
    rituals: [
      { name: "Journal · 5m", timeOfDay: "evening" },
      { name: "Magnesium at dinner", timeOfDay: "evening" },
      { name: "Wind-down walk", timeOfDay: "evening" },
      { name: "Bath + book before bed", timeOfDay: "evening" },
    ],
  },
};

const NON_CYCLE_BUNDLE = {
  title: "Wellbeing",
  subtitle: "Three steady rituals",
  accent: "#6B8F5A",
  rituals: [
    { name: "Morning walk · 20m", timeOfDay: "morning" },
    { name: "Hydration: 2L", timeOfDay: "morning" },
    { name: "Wind-down · screens off 9pm", timeOfDay: "evening" },
  ],
};

export default function RitualBundlesCarousel({ userId, selectedDateStr, currentPhase, plannerConfig, onRitualsAdded }) {
  const [addingKey, setAddingKey] = useState(null);
  const [addedKeys, setAddedKeys] = useState(() => new Set());

  const isCycleStage = plannerConfig?.ribbonType === "cycle";
  const bundles = useMemo(() => {
    if (!isCycleStage) {
      return [{ key: "wellbeing", ...NON_CYCLE_BUNDLE, isForToday: true }];
    }
    return ["menstrual", "follicular", "ovulatory", "luteal"].map((k) => ({
      key: k,
      ...BUNDLES[k],
      isForToday: currentPhase === k,
    }));
  }, [isCycleStage, currentPhase]);

  async function handleAddBundle(bundle) {
    if (!userId || addingKey) return;
    setAddingKey(bundle.key);
    try {
      // Look up any existing HabitLogs for this date to avoid duplicates.
      let existing = [];
      try {
        existing = await base44.entities.HabitLogs.filter(
          { user_id: userId, date: selectedDateStr },
          null,
          50,
        );
      } catch { /* missing entity → treat as empty */ }
      const existingNames = new Set(
        (existing || [])
          .map((r) => (r?.habit_name || r?.habit_type || "").toLowerCase())
          .filter(Boolean),
      );
      const toCreate = bundle.rituals.filter(
        (r) => !existingNames.has((r.name || "").toLowerCase()),
      );
      for (const r of toCreate) {
        try {
          await base44.entities.HabitLogs.create({
            user_id: userId,
            habit_name: r.name,
            date: selectedDateStr,
            is_completed: false,
            time_of_day: r.timeOfDay || "morning",
            created_at: new Date().toISOString(),
          });
        } catch { /* silent — entity may not be migrated */ }
      }
      setAddedKeys((prev) => {
        const next = new Set(prev);
        next.add(bundle.key);
        return next;
      });
      if (typeof onRitualsAdded === "function") onRitualsAdded();
    } finally {
      setAddingKey(null);
    }
  }

  if (bundles.length === 0) return null;

  return (
    <section style={wrapStyle} aria-label="Ritual bundles">
      <div style={headRowStyle}>
        <span style={kickerStyle}>RITUAL BUNDLES</span>
        <span style={tinyHelperStyle}>Tap one to drop today’s rituals into your stack</span>
      </div>
      <div style={trackStyle} role="list">
        {bundles.map((b) => {
          const added = addedKeys.has(b.key);
          const adding = addingKey === b.key;
          return (
            <article
              key={b.key}
              role="listitem"
              style={{
                ...cardStyle,
                borderColor: b.isForToday ? b.accent : "rgba(74,42,58,0.10)",
                boxShadow: b.isForToday ? `0 4px 16px ${b.accent}22` : cardStyle.boxShadow,
              }}
            >
              <div style={cardHeadStyle}>
                <span style={{ ...phaseDotStyle, background: b.accent }} aria-hidden="true" />
                <span style={cardTitleStyle}>{b.title}</span>
                {b.isForToday && <span style={forTodayChipStyle}>FOR TODAY</span>}
              </div>
              <p style={cardSubStyle}>{b.subtitle}</p>
              <ul style={ritualListStyle}>
                {b.rituals.map((r) => (
                  <li key={r.name} style={ritualLineStyle}>
                    <Sparkles size={11} style={{ color: b.accent, flexShrink: 0 }} />
                    <span>{r.name}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleAddBundle(b)}
                disabled={adding || added}
                style={{
                  ...addBtnStyle,
                  background: added ? "transparent" : "var(--plum, #4A2A3A)",
                  color: added ? "var(--plum, #4A2A3A)" : "var(--cream, #FFFAF5)",
                  borderColor: added ? "var(--plum, #4A2A3A)" : "transparent",
                  opacity: adding ? 0.6 : 1,
                  cursor: added || adding ? "default" : "pointer",
                }}
                aria-label={added ? `Added ${b.title} bundle` : `Add ${b.title} bundle to today`}
              >
                {added ? (
                  <>
                    <Check size={12} /> Added
                  </>
                ) : adding ? (
                  "Adding…"
                ) : (
                  "Add to stack"
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ── Styles ──
const wrapStyle = {
  marginTop: 4,
  marginBottom: 14,
};
const headRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  padding: "0 2px 6px",
  flexWrap: "wrap",
};
const kickerStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  textTransform: "uppercase",
};
const tinyHelperStyle = {
  fontSize: 10,
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  fontStyle: "italic",
};
const trackStyle = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 6,
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
};
const cardStyle = {
  flex: "0 0 220px",
  scrollSnapAlign: "start",
  background: "#FFFFFF",
  border: "1px solid",
  borderRadius: 16,
  padding: "12px 14px 12px",
  boxShadow: "0 2px 8px rgba(74,42,58,0.04)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const cardHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};
const phaseDotStyle = {
  width: 8,
  height: 8,
  borderRadius: 9999,
  flexShrink: 0,
};
const cardTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
};
const forTodayChipStyle = {
  marginLeft: "auto",
  fontFamily: "'Inter', sans-serif",
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: "0.12em",
  background: "rgba(168,134,75,0.16)",
  color: "#A6862B",
  padding: "2px 6px",
  borderRadius: 9999,
};
const cardSubStyle = {
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  fontSize: 12,
  color: "var(--plum-2, #6B4559)",
  margin: 0,
  lineHeight: 1.4,
};
const ritualListStyle = {
  listStyle: "none",
  padding: 0,
  margin: "4px 0 6px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const ritualLineStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "var(--plum, #4A2A3A)",
  lineHeight: 1.3,
};
const addBtnStyle = {
  marginTop: 2,
  padding: "8px 0",
  borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.04em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};
