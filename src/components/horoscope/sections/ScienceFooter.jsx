// ─────────────────────────────────────────────────────────────────────────────
// ScienceFooter — Section 11. Dashed card. Honest framing for the moon claim.
//
// Helfrich-Förster 2021 (Science Advances) + Cajochen 2013 (Current Biology)
// citations + A2 LSA lineage line. NO partnership claim — "trained in the
// tradition" only.
// ─────────────────────────────────────────────────────────────────────────────

import SectionWrap from "../SectionWrap";

export default function ScienceFooter() {
  return (
    <SectionWrap>
      <div style={shellStyle}>
        <p style={eyebrowStyle}>Why we trust the moon</p>
        <p style={bodyStyle}>
          Helfrich-Förster 2021 (<em>Science Advances</em>) found ~24% of women under 35 sync their cycle to lunar phase, stronger when artificial light is low. Cajochen 2013 (<em>Current Biology</em>) found a 30% reduction in NREM delta sleep around the full moon. We cite these honestly; astrology beyond moon-phase remains symbolic.
        </p>
        <p style={lineageStyle}>
          Astra&rsquo;s craft is trained in the London School of Astrology tradition (est. 1948 lineage).
        </p>
      </div>
    </SectionWrap>
  );
}

const shellStyle = {
  padding: "14px 16px 12px",
  // H2-fix1: now sits INSIDE a Plum Night SectionWrap, so the dashed card uses
  // cream-on-night tones (matching the rest of the Horoscope tab) rather than
  // plum-on-cream — the outer wrap is dark.
  background: "rgba(245,230,211,0.04)",
  border: "1px dashed rgba(245,230,211,0.22)",
  borderRadius: 12,
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(245,230,211,0.62)",
  margin: "0 0 8px",
};
const bodyStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(245,230,211,0.78)",
  margin: "0 0 8px",
};
const lineageStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  lineHeight: 1.5,
  color: "rgba(245,230,211,0.62)",
  margin: 0,
};
