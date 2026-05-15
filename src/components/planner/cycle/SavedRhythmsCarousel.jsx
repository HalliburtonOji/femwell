import { useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SavedRhythmsCarousel — Planner Phase 2 A2-3 (MP-A3).
//
// Horizontal-scroll carousel of cycle-phase-themed rhythm bundles. Each bundle
// is a small card with a phase gradient background, eyebrow tag (YOURS ·
// ACTIVE / UP NEXT · DAY N / SAVED / ⓟ2 PACING BANK), Fraunces bundle name,
// count line, and a "Build into my week →" CTA. CTAs are stubs in v1 —
// console-log + transient inline toast (per spec default #3).
//
// Mounts on the Cycle tab between 28-day Consistency card and Week Ahead.
//
// Default bundles are hard-coded (spec default #1 — no new entity yet).
// Pacing Bank Low Spoons inserts at index 1 (right after the active bundle,
// spec default #2) only when `profile.pacing_bank_opt_in === true`. This is
// the new home for the Pacing Bank surface — Today's `PacingBankCard` mount
// is removed in the same commit (component file kept; one follow-up to
// delete).
//
// Eyebrow logic:
//   - bundle.phase === currentPhase  → "YOURS · ACTIVE"
//   - bundle.phase === nextPhase     → "UP NEXT · DAY N"
//   - else                           → "SAVED"
//   - Pacing Bank                    → "ⓟ2 PACING BANK" (always)
//
// Spec ref: claude-state/base44_mps/2026-05-15_planner_phase2_A2/spec.md §A2-3.
// Visual reference: claude-state/demos/femwell_planner_phase2_demo.html .bundles.
// Brand-voice rules: permissive copy, no emoji codepoints, no Playfair.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BUNDLES = [
  { id: "luteal",     name: "Luteal Softness",   count: "6 rituals",              phase: "luteal",     order: 0 },
  { id: "period",     name: "Period Rest Day",   count: "4 rituals · warming",     phase: "menstrual",  order: 1 },
  { id: "follicular", name: "Follicular Focus",  count: "5 rituals · deep work",   phase: "follicular", order: 2 },
  { id: "ovulatory",  name: "Ovulation Power",   count: "5 rituals · peak days",   phase: "ovulatory",  order: 3 },
  { id: "workday",    name: "Workday Stack",     count: "4 rituals · any phase",   phase: "any",        order: 4 },
];

const PACING_BANK_BUNDLE = {
  id: "pacing",
  name: "Low Spoons day",
  count: "2 anchors · rest deferred",
  phase: "pacing", // not a real phase — used for visual styling
  order: 99,
};

const PHASE_GRADIENT = {
  luteal:     "linear-gradient(135deg, #8A5F74 0%, #6C4F62 100%)",
  menstrual:  "linear-gradient(135deg, #B84A41 0%, #9B3E37 100%)",
  follicular: "linear-gradient(135deg, #E67F73 0%, #C96557 100%)",
  ovulatory:  "linear-gradient(135deg, #F2A99A 0%, #DF8978 100%)",
  any:        "linear-gradient(135deg, #C9A95C 0%, #A48740 100%)",
  pacing:     "linear-gradient(135deg, #5F8A85 0%, #3F6864 100%)",
};

// Light backgrounds (ovulatory) need plum text; everything else uses cream.
const PHASE_TEXT_COLOR = {
  luteal:     "var(--cream, #FFFAF5)",
  menstrual:  "var(--cream, #FFFAF5)",
  follicular: "var(--cream, #FFFAF5)",
  ovulatory:  "var(--plum, #4A2A3A)",
  any:        "var(--cream, #FFFAF5)",
  pacing:     "var(--cream, #FFFAF5)",
};

const PHASE_ORDER = ["menstrual", "follicular", "ovulatory", "luteal"];

function nextPhaseFrom(current) {
  if (!current) return null;
  const i = PHASE_ORDER.indexOf(current);
  if (i < 0) return null;
  return PHASE_ORDER[(i + 1) % PHASE_ORDER.length];
}

function eyebrowFor(bundle, currentPhase, currentCycleDay) {
  if (bundle.id === "pacing") return "PACING BANK";
  if (bundle.phase === "any") return "SAVED";
  if (bundle.phase === currentPhase) return "YOURS · ACTIVE";
  if (bundle.phase === nextPhaseFrom(currentPhase)) {
    return currentCycleDay ? `UP NEXT · DAY ${currentCycleDay}+` : "UP NEXT";
  }
  return "SAVED";
}

function ctaLabelFor(bundle) {
  if (bundle.id === "pacing") return "Use today →";
  return "Build into my week →";
}

export default function SavedRhythmsCarousel({ profile, currentPhase, currentCycleDay }) {
  const [toastMsg, setToastMsg] = useState(null);

  const bundles = useMemo(() => {
    const list = [...DEFAULT_BUNDLES];
    if (profile?.pacing_bank_opt_in === true) {
      // Insert at index 1 (right after the active bundle position).
      list.splice(1, 0, PACING_BANK_BUNDLE);
    }
    return list;
  }, [profile?.pacing_bank_opt_in]);

  const handleCta = (bundle) => {
    // eslint-disable-next-line no-console
    console.log("[saved-rhythms] CTA tapped:", bundle.id);
    setToastMsg(`Saved "${bundle.name}" (coming soon)`);
    setTimeout(() => setToastMsg(null), 2800);
  };

  return (
    <section aria-label="Saved cycle rhythms, swipe horizontally" style={wrapStyle}>
      <div style={dividerStyle}>
        <p style={divTitleStyle}>Saved rhythms</p>
        <span style={divMetaStyle}>SWIPE →</span>
      </div>

      <div style={scrollerStyle} className="fw-no-scrollbar">
        {bundles.map((b) => {
          const text = PHASE_TEXT_COLOR[b.phase] || PHASE_TEXT_COLOR.luteal;
          const gradient = PHASE_GRADIENT[b.phase] || PHASE_GRADIENT.luteal;
          const eyebrow = eyebrowFor(b, currentPhase, currentCycleDay);
          return (
            <div
              key={b.id}
              tabIndex={0}
              role="group"
              aria-label={`${b.name}. ${eyebrow}. ${b.count}.`}
              style={{
                ...bundleCardStyle,
                background: gradient,
                color: text,
              }}
            >
              <p style={{ ...bundleEyebrowStyle, color: text, opacity: text === "var(--cream, #FFFAF5)" ? 0.85 : 0.65 }}>
                {eyebrow}
              </p>
              <p style={{ ...bundleNameStyle, color: text }}>{b.name}</p>
              <p style={{ ...bundleCountStyle, color: text, opacity: text === "var(--cream, #FFFAF5)" ? 0.85 : 0.7 }}>
                {b.count}
              </p>
              <button
                type="button"
                onClick={() => handleCta(b)}
                style={{
                  ...bundleCtaStyle,
                  color: text,
                  borderColor: text === "var(--cream, #FFFAF5)" ? "rgba(255,250,245,0.55)" : "rgba(74,42,58,0.55)",
                }}
              >
                {ctaLabelFor(b)}
              </button>
            </div>
          );
        })}
      </div>

      {toastMsg && (
        <p role="status" aria-live="polite" style={toastStyle}>{toastMsg}</p>
      )}

      {/* Inline style — `display: none` for ::-webkit-scrollbar to hide the
          scrollbar on horizontal carousel per demo. Scoped via the className. */}
      <style>{`
        .fw-no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .fw-no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

// ── Styles ──
const wrapStyle = {
  marginBottom: 16,
};
const dividerStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 8,
  padding: "0 2px",
};
const divTitleStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const divMetaStyle = {
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: "0.12em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
};
const scrollerStyle = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 6,
  margin: "0 -18px",
  padding: "0 18px 6px",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
};
const bundleCardStyle = {
  flexShrink: 0,
  width: 178,
  borderRadius: 14,
  padding: "12px 14px 14px",
  display: "flex",
  flexDirection: "column",
  scrollSnapAlign: "start",
  cursor: "default",
  outline: "none",
};
const bundleEyebrowStyle = {
  fontSize: 9.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 8px",
};
const bundleNameStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 17,
  fontWeight: 500,
  letterSpacing: "-0.005em",
  lineHeight: 1.2,
  margin: "0 0 4px",
};
const bundleCountStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  margin: "0 0 12px",
};
const bundleCtaStyle = {
  background: "transparent",
  border: "1px solid",
  borderRadius: 9999,
  padding: "5px 10px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.02em",
  cursor: "pointer",
  alignSelf: "flex-start",
  marginTop: "auto",
};
const toastStyle = {
  marginTop: 8,
  padding: "6px 12px",
  borderRadius: 9999,
  background: "var(--plum, #4A2A3A)",
  color: "var(--cream, #FFFAF5)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  display: "inline-block",
};
