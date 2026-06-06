import { useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CapacityTaxBar — Planner Phase 2 C3 (MP-A1).
//
// One-line strip showing predicted load vs available capacity for the current
// cycle phase, with a "Defer N" pill that moves reschedulable PersonalTasks to
// the follicular window. Mounts on the Cycle tab between the month ribbon and
// the Week Ahead card.
//
// Computed CLIENT-SIDE for v1 (server-side `computeCapacityTax` is the
// follow-up — see spec_v2 §C3 acceptance). We already have the data loaded
// in Planner.jsx, no extra fetch needed. CapacityTaxLog persistence is
// deferred to C3.5 — render path is honest as long as inputs are honest.
//
// Brand-voice rules (binding):
//   - permissive copy ("often", "tends") not prescriptive
//   - one-tap defer, undoable via standard Task UI
//   - no body-negative framing — "softer day" not "low day"
//   - data-viz needs aria-label per WCAG: "Predicted load 122 percent
//     of capacity, 22 percent over"
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C3.
// ─────────────────────────────────────────────────────────────────────────────

export const PHASE_MULTIPLIERS = {
  menstrual: 0.55,
  follicular: 1.10,
  ovulatory: 1.20,
  luteal: 0.85,
};

export const BASELINE_CAPACITY = 10;

export function deriveCapacity(phase, baseline = BASELINE_CAPACITY) {
  const mult = PHASE_MULTIPLIERS[phase] || 1.0;
  return Math.max(1, Math.round(baseline * mult * 10) / 10);
}

export function derivePredictedLoad({ personalTasks = [], activeProgram, ritualHabits = [] }) {
  // v1 deviation from spec §C3: spec specifies
  //   predictedLoad = sum(PersonalTask.estimated_effort * phase_modifier)
  //                 + sum(active habits * 1) + sum(active programmes * 1.5)
  // We omit per-task `phase_modifier` because (a) `estimated_effort` isn't in
  // the PersonalTasks schema yet (no UI to set it; effort defaults to 1) and
  // (b) phase_modifier is already applied to capacity in `deriveCapacity`,
  // which produces a phase-aware pct without double-counting. When the schema
  // adds `estimated_effort` + UI lands, the multiplication can be reinstated.
  let load = 0;
  for (const t of personalTasks) {
    if (!t) continue;
    if (t.completed === true) continue;
    const effort = Number(t?.estimated_effort) || 1; // default 1 if not set
    load += effort;
  }
  load += (ritualHabits || []).length * 1; // each active habit = 1
  if (activeProgram && !activeProgram.is_completed) load += 1.5; // active programme = 1.5
  return Math.round(load * 10) / 10;
}

export default function CapacityTaxBar({
  phase,
  personalTasks = [],
  activeProgram = null,
  ritualHabits = [],
  onDefer,
}) {
  const { load, capacity, pct, over } = useMemo(() => {
    const cap = deriveCapacity(phase);
    const lod = derivePredictedLoad({ personalTasks, activeProgram, ritualHabits });
    const p = cap > 0 ? Math.round((lod / cap) * 100) : 0;
    return { load: lod, capacity: cap, pct: p, over: lod > cap };
  }, [phase, personalTasks, activeProgram, ritualHabits]);

  // How many reschedulable tasks are eligible to defer.
  const deferrableCount = useMemo(() => {
    return (personalTasks || []).filter((t) => {
      if (!t || t.completed) return false;
      if (t.is_anchor === true) return false; // anchors never defer
      return true;
    }).length;
  }, [personalTasks]);

  // Cap the bar fill at 130% so spike days don't break visual.
  const barFill = Math.min(130, pct);
  const barColor = over
    ? "var(--rose-primary, #D45E52)"
    : pct >= 85
      ? "var(--clay, #C98A6B)"
      : "var(--sage, #7A9E8E)";

  const headline = over
    ? `${pct}% — over your usual ${capacity}-unit capacity`
    : pct >= 85
      ? `${pct}% — close to your ${capacity}-unit capacity`
      : `${pct}% — within capacity`;

  const subline = over
    ? `Light days often help here. Defer pulls non-anchor tasks to a steadier window.`
    : pct >= 85
      ? `Plenty of capacity left — but this is the edge of a comfortable week.`
      : `Plenty of room. Your phase tends to carry more right now.`;

  const ariaLabel = over
    ? `Predicted load ${pct} percent of capacity, ${pct - 100} percent over.`
    : `Predicted load ${pct} percent of capacity.`;

  const handleDefer = () => {
    if (!onDefer || deferrableCount === 0) return;
    onDefer(deferrableCount);
  };

  return (
    <section
      aria-label="Capacity tax"
      style={{
        background: "linear-gradient(180deg, var(--cream, #FFFAF5) 0%, var(--cream-2, #FFF5EC) 100%)",
        borderRadius: 16,
        padding: "14px 16px",
        border: "1px solid rgba(74,42,58,0.10)",
        borderLeft: "4px solid var(--moss, #7D8668)",
        boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--plum-mute, #8A7584)",
            margin: 0,
          }}
        >
          Capacity tax
        </p>
        <p
          aria-label={ariaLabel}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: barColor,
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          {headline}
        </p>
      </div>

      {/* Bar */}
      <div
        role="img"
        aria-label={ariaLabel}
        style={{
          height: 8,
          borderRadius: 9999,
          background: "var(--border-subtle, rgba(74,42,58,0.08))",
          overflow: "hidden",
          position: "relative",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${(barFill / 130) * 100}%`,
            background: barColor,
            transition: "width 240ms cubic-bezier(.4,0,.2,1)",
          }}
        />
        {/* 100%-of-capacity tick */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: `${(100 / 130) * 100}%`,
            height: "100%",
            width: 2,
            background: "rgba(74,42,58,0.25)",
          }}
        />
      </div>

      <p
        style={{
          fontSize: 12.5,
          color: "var(--plum-2, #6B4559)",
          lineHeight: 1.5,
          margin: "0 0 12px",
        }}
      >
        {subline}
      </p>

      {/* Defer pill */}
      {over && deferrableCount > 0 && (
        <button
          type="button"
          onClick={handleDefer}
          aria-label={`Defer ${deferrableCount} non-anchor tasks to a steadier window`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 9999,
            border: "none",
            background: "var(--plum, #4A2A3A)",
            color: "var(--cream, #FFFAF5)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 36,
          }}
        >
          Defer {deferrableCount}
        </button>
      )}
    </section>
  );
}
