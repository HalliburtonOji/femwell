import { useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SmartViewCard — Planner Phase 2 C5 (MP-A1).
//
// Single adaptive "right now" card replacing the fixed-dashboard shape. State
// chip row visible at top; current state highlighted; the body of the card
// reframes per state. C5 wires 3 states fully — `idle`, `streaky`, `stuck` —
// and renders the other two (`drifting`, `quiet`) as greyed chips that come
// alive in C6 (quiet) + C7 (drifting via reframe shimmer).
//
// `?_smartView=<state>` URL param overrides the derived state — dev shortcut
// for screenshots + the visual walk in the spec's acceptance criteria.
//
// Good-for chips composite drives from cycle phase × capacity-tax pct, NOT
// just phase alone (spec §C5 + mechanic 5). When over capacity we lean into
// rest verbs ("warming meals", "slow social"); under capacity, we lean into
// effort verbs ("deep writing", "steady strength"). Historical hit-rate
// composite is a Phase 2 follow-up — schema for hit-rate isn't there yet.
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C5.
// Brand-voice: permissive copy, no body-negative framing, no emoji.
// ─────────────────────────────────────────────────────────────────────────────

export const SMART_STATES = ["idle", "streaky", "stuck", "drifting", "quiet"];
// Live in C5 + C6. Drifting joins in C7 via the reframe shimmer.
export const ACTIVE_SMART_STATES = new Set(["idle", "streaky", "stuck", "quiet"]);
const STATE_LABEL = {
  idle: "IDLE",
  streaky: "STREAKY",
  stuck: "STUCK",
  drifting: "DRIFTING",
  quiet: "QUIET",
};

// Map phase × capacity-tax pct into a small good-for chip set. Five chips max
// keeps the row scannable. Chips are deliberately gentle nouns/short phrases.
const GOODFOR_BY_PHASE = {
  menstrual: {
    rest: ["warming meals", "slow social", "gentle reading", "low light", "soup"],
    do: ["short walks", "warm baths", "rest journaling", "soft music", "tea"],
  },
  follicular: {
    rest: ["light planning", "tidy-ups", "batching tasks", "outline-only", "voice memos"],
    do: ["deep writing", "harder workouts", "new ideas", "learning", "outreach"],
  },
  ovulatory: {
    rest: ["voice notes", "short meetings", "fewer asks", "creative play", "music"],
    do: ["presentations", "recording", "deep social", "sharp focus", "tough calls"],
  },
  luteal: {
    rest: ["finishing edits", "reflection", "warming meals", "journaling", "saying no"],
    do: ["steady strength", "slow social", "deep writing", "edit pass", "review"],
  },
  unknown: {
    rest: ["rest", "tea", "warm food", "easy reading", "quiet"],
    do: ["writing", "walking", "tidying", "planning", "talking"],
  },
};

function pickGoodForChips({ phase, capacityPct }) {
  const ph = phase && GOODFOR_BY_PHASE[phase] ? phase : "unknown";
  const bank = GOODFOR_BY_PHASE[ph];
  const overCapacity = typeof capacityPct === "number" && capacityPct >= 100;
  const source = overCapacity ? bank.rest : bank.do;
  // Stable order — first 5 from the bank. Caller can shuffle later if needed.
  return source.slice(0, 5);
}

function deriveStateFromHeuristics({ dailyPlan, ritualHabits, todayHabitLogs, activeProgram }) {
  const totalHabits = (ritualHabits || []).length;
  const completedHabits = totalHabits === 0
    ? 0
    : (ritualHabits || []).filter((name) => todayHabitLogs?.[name]).length;
  // Idle: no plan and nothing started + no programme.
  if (!dailyPlan && totalHabits === 0 && !activeProgram) return "idle";
  if (totalHabits === 0) return "idle";
  if (completedHabits === totalHabits) return "streaky";
  if (completedHabits === 0) return "stuck";
  // Mixed progress — lean streaky if more than half, stuck otherwise.
  return completedHabits / totalHabits >= 0.5 ? "streaky" : "stuck";
}

function bodyForState({ state, phase, dailyPlan }) {
  // The card body reframes per state. Sub-line attempts to use real DailyPlan
  // copy where it exists, otherwise falls back to permissive defaults.
  const focus = dailyPlan?.focus_for_today || null;

  switch (state) {
    case "streaky":
      return {
        main: focus || "Steady and consistent — keep the rhythm going.",
        sub: "Your stack is moving. One more small thing, or stop here — both fine.",
      };
    case "stuck":
      return {
        main: focus || "Slow start is normal. Pick one small thing.",
        sub: "Even one ritual logged shifts the day. Anchor first, the rest follows.",
      };
    case "drifting":
      return {
        main: focus || "A few days off-rhythm. Today's a soft re-entry.",
        sub: "No need to catch up. Anchors only — leave the rest for a fresh week.",
      };
    case "quiet":
      return {
        main: "Quiet mode is on.",
        sub: "Non-anchor items are paused for a few days. Tap to undo if you want them back.",
      };
    case "idle":
    default:
      return {
        main: focus || "A clean page. Add one small thing when you're ready.",
        sub: phase ? `Your ${phase} window often tends to set the pace from here.` : "No pressure to start big.",
      };
  }
}

function readDevStateOverride() {
  if (typeof window === "undefined") return null;
  try {
    const p = new URLSearchParams(window.location.search).get("_smartView");
    if (p && SMART_STATES.includes(p)) return p;
  } catch { /* silent */ }
  return null;
}

export default function SmartViewCard({
  phase,
  cycleDay,
  capacityPct,
  dailyPlan,
  activeProgram,
  ritualHabits,
  todayHabitLogs,
  quietModeActive = false,
}) {
  const derivedState = useMemo(
    () => deriveStateFromHeuristics({ dailyPlan, ritualHabits, todayHabitLogs, activeProgram }),
    [dailyPlan, ritualHabits, todayHabitLogs, activeProgram]
  );
  const override = readDevStateOverride();
  // Quiet Mode (C6) always wins over derived state — the banner is the
  // explicit user-facing surface and the chip row should reflect that.
  const state = override || (quietModeActive ? "quiet" : derivedState);

  const { main, sub } = bodyForState({ state, phase, dailyPlan });
  const goodForChips = useMemo(
    () => pickGoodForChips({ phase, capacityPct }),
    [phase, capacityPct]
  );

  const phaseLine = phase
    ? `${phase.toUpperCase()}${cycleDay ? ` · DAY ${cycleDay}` : ""}`
    : "RIGHT NOW";

  return (
    <section
      aria-label="Smart view — right now"
      style={{
        background: "var(--surface, #FFFFFF)",
        borderRadius: 18,
        padding: "14px 16px 16px",
        border: "1px solid var(--border, rgba(74,42,58,0.10))",
        marginBottom: 12,
      }}
    >
      {/* Eyebrow */}
      <div style={eyebrowRowStyle}>
        <span style={kickerStyle}>Smart view</span>
        <span style={tenseStyle}>Right now · adaptive</span>
      </div>

      {/* State chip row — status indicators, NOT interactive tabs (the
          state derives from heuristics + quiet-mode + dev override; users
          don't switch states by tapping). aria-label on the active chip
          announces the current state. */}
      <div aria-label="Smart view state" style={chipRowStyle}>
        {SMART_STATES.map((s) => {
          const active = s === state;
          const live = ACTIVE_SMART_STATES.has(s);
          return (
            <span
              key={s}
              aria-current={active ? "true" : undefined}
              aria-label={active ? `Current state: ${STATE_LABEL[s]}` : STATE_LABEL[s]}
              style={{
                ...chipStyle,
                background: active
                  ? "var(--plum, #4A2A3A)"
                  : live
                    ? "var(--cream-deep, #FAF4ED)"
                    : "var(--cream-deep, #FAF4ED)",
                color: active
                  ? "var(--cream, #FFFAF5)"
                  : live
                    ? "var(--plum-2, #6B4559)"
                    : "var(--plum-mute, #8A7584)",
                opacity: live ? 1 : 0.55,
                fontWeight: active ? 700 : 600,
              }}
            >
              {STATE_LABEL[s]}
            </span>
          );
        })}
      </div>

      {/* Body */}
      <div style={cardBodyStyle}>
        <div style={cardHeadStyle}>
          <span style={cardLabelStyle}>{phaseLine}</span>
          <span style={cardTodayChipStyle}>TODAY</span>
        </div>
        <p style={cardMainStyle}>{main}</p>
        <p style={cardSubStyle}>{sub}</p>
        <p style={cardSigStyle}>— Jess, from your Daily Plan</p>
      </div>

      {/* Good-for chips */}
      {goodForChips.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={goodForTitleStyle}>
            Today is good for…
            <span
              title="Driven by cycle phase and this week's capacity tax"
              aria-label="Driven by cycle phase and this week's capacity tax"
              style={infoIconStyle}
            >i</span>
          </p>
          <div style={goodForChipsRowStyle}>
            {goodForChips.map((label) => (
              <span key={label} style={goodForChipStyle}>
                <span aria-hidden="true" style={chipDotStyle} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Styles ──
const eyebrowRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
};
const kickerStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  };
const tenseStyle = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #8A7584)",
  };
const chipRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 12,
};
const chipStyle = {
  fontSize: 10,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  padding: "5px 10px",
  borderRadius: 9999,
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.10))",
  };
const cardBodyStyle = {
  background: "var(--cream-deep, #FAF4ED)",
  borderRadius: 12,
  padding: "12px 14px",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
};
const cardHeadStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};
const cardLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #8A7584)",
  };
const cardTodayChipStyle = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.16em",
  padding: "3px 8px",
  borderRadius: 9999,
  background: "var(--plum, #4A2A3A)",
  color: "var(--cream, #FFFAF5)",
  };
const cardMainStyle = {
  fontSize: 17,
  lineHeight: 1.35,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.01em",
  margin: "0 0 6px",
};
const cardSubStyle = {
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  margin: "0 0 6px",
};
const cardSigStyle = {
  fontSize: 11,
  fontStyle: "italic",
  color: "var(--plum-mute, #8A7584)",
  margin: 0,
};
const goodForTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--plum-2, #6B4559)",
  margin: "0 0 8px",
  display: "flex",
  alignItems: "center",
  gap: 6,
};
const infoIconStyle = {
  fontSize: 11,
  fontWeight: 700,
  fontStyle: "italic",
  width: 16,
  height: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
  background: "var(--cream-deep, #FAF4ED)",
  color: "var(--plum-mute, #8A7584)",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.10))",
  cursor: "help",
};
const goodForChipsRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};
const goodForChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "var(--plum-2, #6B4559)",
  padding: "5px 10px",
  borderRadius: 9999,
  background: "var(--surface, #FFFFFF)",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.10))",
};
const chipDotStyle = {
  width: 5,
  height: 5,
  borderRadius: 9999,
  background: "var(--sage, #7A9E8E)",
  display: "inline-block",
};
