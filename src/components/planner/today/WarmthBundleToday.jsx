// ─────────────────────────────────────────────────────────────────────────────
// WarmthBundleToday — Planner Phase 2 C9 (MP-A3).
//
// Three Today-tab surfaces that share warmth-bundle voice + cadence:
//   1. TonightCard — bedtime intent card with optional HRT row (only when
//      profile.hrt_regimen is active and method !== 'none') + "Share with my
//      GP" link that cross-tab navigates to the Doctor-Ready Diary.
//   2. ShutdownRitualCard — small wind-down block under Tonight.
//   3. PacingBankCard — low-spoons bundle. Only renders when
//      profile.pacing_bank_opt_in === true (opt-IN per spec default #5).
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C9.
// Brand-voice rules: permissive, never minimising, no body-negative framing,
// no emoji, no Playfair, no #C084FC.
// ─────────────────────────────────────────────────────────────────────────────

function isHrtActive(profile) {
  const r = profile?.hrt_regimen;
  return !!(r && r.active && r.method && r.method !== "none");
}

function isPacingBankOptedIn(profile) {
  return profile?.pacing_bank_opt_in === true;
}

export function TonightCard({ profile, onGoToDiary }) {
  const hrtActive = isHrtActive(profile);
  const hrt = profile?.hrt_regimen || null;

  return (
    <section aria-label="Tonight" style={cardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Tonight</p>
        <span style={tenseStyle}>WIND-DOWN · 30 MIN</span>
      </div>
      <p style={mainStyle}>A soft landing — lights down, screens away, water by the bed.</p>
      <p style={subStyle}>One small ritual you'll thank yourself for tomorrow morning.</p>

      {hrtActive && (
        <div style={hrtRowStyle} role="group" aria-label="HRT regimen tonight">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={hrtKickerStyle}>HRT · Tonight</p>
            <p style={hrtMainStyle}>
              {hrt.method ? hrt.method.charAt(0).toUpperCase() + hrt.method.slice(1) : "Your regimen"}
              {hrt.evening_dose ? <> · {hrt.evening_dose}</> : null}
            </p>
            {hrt.reminder_time && (
              <p style={hrtSubStyle}>Reminder set for {hrt.reminder_time}.</p>
            )}
          </div>
          <button
            type="button"
            onClick={onGoToDiary}
            style={ghostBtnStyle}
            aria-label="Share with my GP — opens Doctor-Ready Diary"
          >
            Share with my GP →
          </button>
        </div>
      )}
    </section>
  );
}

export function ShutdownRitualCard() {
  return (
    <section aria-label="Shutdown ritual" style={shutCardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Shutdown ritual</p>
        <span style={tenseStyle}>5 MIN · AFTER WORK</span>
      </div>
      <ul style={shutListStyle}>
        <li style={shutItemStyle}>Close every open tab on your screen.</li>
        <li style={shutItemStyle}>Write tomorrow's one anchor on paper.</li>
        <li style={shutItemStyle}>Stand up and stretch for thirty seconds.</li>
      </ul>
      <p style={shutFootStyle}>
        Tiny boundary between work and the evening. Skip a step if you want — the line still gets drawn.
      </p>
    </section>
  );
}

export function PacingBankCard({ profile }) {
  if (!isPacingBankOptedIn(profile)) return null;
  return (
    <section aria-label="Pacing bank — low-spoons bundle" style={pacingCardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Pacing bank</p>
        <span style={tenseStyle}>LOW-SPOONS · OPTIONAL</span>
      </div>
      <p style={mainStyle}>Three things that count when capacity is small.</p>
      <ul style={pacingListStyle}>
        <li style={pacingItemStyle}>
          <span style={pacingDotStyle} aria-hidden="true" />
          A full glass of water, in a chair you like.
        </li>
        <li style={pacingItemStyle}>
          <span style={pacingDotStyle} aria-hidden="true" />
          Two minutes outside, even if it's just the doorway.
        </li>
        <li style={pacingItemStyle}>
          <span style={pacingDotStyle} aria-hidden="true" />
          One message to the person you've been meaning to text.
        </li>
      </ul>
      <p style={pacingFootStyle}>
        Saved rhythms for the days that ask less of you. You opted in — adjust any time in settings.
      </p>
    </section>
  );
}

// ── Styles ──
const cardStyle = {
  background: "var(--surface, #FFFFFF)",
  borderRadius: 16,
  padding: "14px 16px",
  border: "1px solid var(--border, rgba(74,42,58,0.10))",
  marginBottom: 12,
};
const shutCardStyle = { ...cardStyle, background: "var(--cream, #FFFAF5)" };
const pacingCardStyle = { ...cardStyle, background: "var(--cream-deep, #FAF4ED)", borderLeft: "4px solid var(--sage, #7A9E8E)" };

const headRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
  flexWrap: "wrap",
};
const kickerStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const tenseStyle = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
};
const mainStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 16,
  lineHeight: 1.4,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
  margin: "0 0 4px",
};
const subStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  margin: 0,
};

const hrtRowStyle = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--cream-deep, #FAF4ED)",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};
const hrtKickerStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.10em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 2px",
};
const hrtMainStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 14.5,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
  margin: 0,
};
const hrtSubStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "var(--plum-2, #6B4559)",
  margin: "2px 0 0",
};
const ghostBtnStyle = {
  padding: "7px 12px",
  borderRadius: 9999,
  border: "1px solid var(--plum, #4A2A3A)",
  background: "transparent",
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 32,
};

const shutListStyle = { margin: 0, paddingLeft: 18 };
const shutItemStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  marginBottom: 2,
};
const shutFootStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontStyle: "italic",
  color: "var(--plum-mute, #8A7584)",
  margin: "8px 0 0",
  lineHeight: 1.5,
};

const pacingListStyle = { listStyle: "none", margin: "4px 0 0", padding: 0 };
const pacingItemStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 4,
};
const pacingDotStyle = {
  width: 6,
  height: 6,
  borderRadius: 9999,
  background: "var(--sage, #7A9E8E)",
  display: "inline-block",
  marginTop: 7,
  flexShrink: 0,
};
const pacingFootStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontStyle: "italic",
  color: "var(--plum-mute, #8A7584)",
  margin: "8px 0 0",
  lineHeight: 1.5,
};
