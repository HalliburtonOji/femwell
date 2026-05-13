import { PAPER_NIGHT, INK_NIGHT } from "./styles/tokens.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// SectionWrap — H2-fix1.
//
// The locked v2.1 demo renders every non-hero section inside the phone-inner
// container whose background is Plum Night (#2B1E26). In production the
// Horoscope tab sits inside the cream Lifestyle page, so without an outer
// Plum Night card the cream-on-dark UI floats invisibly on cream.
//
// SectionWrap is the OUTER container that gives each section its Plum Night
// card. Inner sub-cards (Triad pills, Today's Weather stat tiles, etc.) keep
// their existing rgba(245,230,211,0.04) surfaces — those are the small cards
// inside this wrap.
//
// Usage: wrap a section's existing top-level return JSX with <SectionWrap>.
// Optional `style` prop merges in for one-offs (e.g. ScienceFooter's dashed
// inner card stays inside but its margins differ slightly).
// ─────────────────────────────────────────────────────────────────────────────

export default function SectionWrap({ children, style }) {
  return <div style={{ ...sectionWrapStyle, ...(style || {}) }}>{children}</div>;
}

const sectionWrapStyle = {
  background: PAPER_NIGHT,
  color: INK_NIGHT,
  borderRadius: 22,
  padding: "24px 22px",
  margin: "0 0 14px",
  boxShadow: "0 2px 14px rgba(43,30,38,0.10)",
};
