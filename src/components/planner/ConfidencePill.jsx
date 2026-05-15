// ─────────────────────────────────────────────────────────────────────────────
// ConfidencePill — Planner Phase 2 C2 (MP-A1).
//
// Renders under the .ph-sub line on BOTH Today + Cycle Planner tabs. Pulls
// from UserProfile.cycle_prediction_meta (populated by Phase 2 migration in
// C1). Below the 4-cycle threshold it renders permissive "still learning"
// copy; at 4+ cycles it shows the confidence pct + cycle count.
//
// Brand-voice rules (binding):
//   - permissive language only ("tends", "often"), no imperatives
//   - lead with the user's own data, never population averages
//   - no body-negative framing
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C2.
// ─────────────────────────────────────────────────────────────────────────────

const MIN_CYCLES_FOR_CONFIDENCE = 4;

export default function ConfidencePill({ meta }) {
  // Defensive — meta is nullable until migratePlannerPhase2 has run for this user.
  const observed = Number(meta?.cycles_observed) || 0;
  const pct = Number(meta?.confidence_pct) || 0;

  let body;
  if (observed < MIN_CYCLES_FOR_CONFIDENCE) {
    body = `Still learning — ${observed} of ${MIN_CYCLES_FOR_CONFIDENCE} cycles`;
  } else {
    body = `${Math.round(pct)}% · ${observed} cycles`;
  }

  return (
    <span
      role="status"
      aria-label={observed < MIN_CYCLES_FOR_CONFIDENCE
        ? `Cycle prediction is still learning. ${observed} of ${MIN_CYCLES_FOR_CONFIDENCE} cycles logged so far.`
        : `Cycle prediction confidence: ${Math.round(pct)} percent based on ${observed} cycles.`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "var(--surface-raised, #F8F4F0)",
        color: "var(--plum-2, #6B4559)",
        border: "1px solid var(--border, rgba(74,42,58,0.08))",
        whiteSpace: "nowrap",
      }}
    >
      {body}
    </span>
  );
}
