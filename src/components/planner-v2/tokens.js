// Shared design tokens for planner-v2 row components.
// Mirrors the palette signed off in UnifiedPlannerDemo.

export const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#F4EFE3",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
  plum:     "#4A2A3A",
  pMenstrual:  "#8B2635",
  pFollicular: "#C17B4E",
  pOvulatory:  "#C4933F",
  pLuteal:     "#5B4A8A",
  softMenstrual:  "#F0D4D8",
  softFollicular: "#EBC9B5",
  softOvulatory:  "#F0E0B0",
  softLuteal:     "#C4B5D4",
};

export const PHASE_LIGHT = {
  menstrual:  C.blush,
  follicular: C.sage,
  ovulatory:  C.gold,
  luteal:     C.muted,
};
export const PHASE_DEEP = {
  menstrual:  C.pMenstrual,
  follicular: C.pFollicular,
  ovulatory:  C.pOvulatory,
  luteal:     C.pLuteal,
};
export const PHASE_SOFT = {
  menstrual:  C.softMenstrual,
  follicular: C.softFollicular,
  ovulatory:  C.softOvulatory,
  luteal:     C.softLuteal,
};

export const card = {
  background: C.paperHi,
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 8,
  height: "100%", minHeight: 200,
  boxSizing: "border-box",
};
export const kicker = {
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
};
export const cardTitle = {
  fontSize: 17, fontWeight: 500, color: C.espresso,
  margin: "2px 0", lineHeight: 1.25, letterSpacing: "-0.005em",
  flex: 1,
};
export const cardSub = { fontSize: 12, color: C.muted, margin: "4px 0 0", lineHeight: 1.5 };
export const bullet = {
  display: "flex", alignItems: "flex-start", gap: 8,
  fontSize: 13, color: C.espresso, lineHeight: 1.45,
};
export const bulletDot = {
  width: 5, height: 5, borderRadius: 9999, background: C.gold,
  marginTop: 7, flexShrink: 0,
};
