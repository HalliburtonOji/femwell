// Shared hub HEADER centerpieces — the big circular medallions that anchor each hub
// header (the analogue of the Nutrition energy ring). Brand SVG line-art only: cream/plum
// palette, hand-drawn feel, NO emoji. Used by BOTH the live hub pages and the demos so
// they stay identical.
import { T } from "@/components/journal/Editorial";

// COMMUNITY — two women embracing, inside a warm ring. Tasteful, simple line-art with a
// small brand heart above where they meet. (Replaces the earlier circle-of-dots+bloom.)
export function CommunityEmbraceRing({ size = 176 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }} role="img" aria-label="Two women embracing">
      {/* ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.paperDeep} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.gold} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * 0.26} transform={`rotate(-90 ${cx} ${cy})`} />
      {/* the embrace — two figures leaning into each other */}
      <g transform={`translate(${cx} ${cy + 6})`} stroke={T.ink} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
        {/* left figure body */}
        <path d="M -34 34 Q -34 0 -12 -2 Q 2 0 2 34 Z" fill={T.blush} opacity="0.9" />
        {/* right figure body */}
        <path d="M -2 34 Q -2 0 12 -2 Q 34 0 34 34 Z" fill={T.sage} opacity="0.9" />
        {/* arms wrapping across the backs (hug) */}
        <path d="M -28 6 Q 0 -8 30 8" fill="none" stroke={T.ink} strokeWidth={2.4} />
        <path d="M 24 2 Q 0 16 -22 4" fill="none" stroke={T.ink} strokeWidth={1.6} opacity="0.65" />
        {/* heads, tilted toward each other */}
        <circle cx={-13} cy={-16} r={11} fill={T.blush} />
        <circle cx={13} cy={-16} r={11} fill={T.sage} />
      </g>
      {/* small brand heart above the embrace */}
      <path d={`M ${cx} ${cy - 30} c -4 -7 -15 -4 -15 4 c 0 6 8 11 15 16 c 7 -5 15 -10 15 -16 c 0 -8 -11 -11 -15 -4 z`}
        fill={T.crimson} stroke={T.crimson} strokeWidth={0.5} />
    </svg>
  );
}

// JOURNAL — a pen writing on a diary page, inside a gentle "this week" ring.
export function JournalDiaryRing({ size = 176, fraction = 0.5 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }} role="img" aria-label="A pen writing on a diary">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.paperDeep} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.gold} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - Math.max(0, Math.min(1, fraction)) * c} transform={`rotate(-90 ${cx} ${cy})`} />
      <g transform={`rotate(-7 ${cx} ${cy})`}>
        <rect x={cx - 34} y={cy - 22} width={68} height={50} rx={6} fill={T.paper} stroke={T.muted} strokeWidth={1.6} />
        <line x1={cx - 22} y1={cy - 8} x2={cx + 22} y2={cy - 8} stroke={T.muted} strokeWidth={1.3} />
        <line x1={cx - 22} y1={cy + 2} x2={cx + 22} y2={cy + 2} stroke={T.muted} strokeWidth={1.3} />
        <line x1={cx - 22} y1={cy + 12} x2={cx + 4} y2={cy + 12} stroke={T.muted} strokeWidth={1.3} />
      </g>
      <line x1={cx + 33} y1={cy - 36} x2={cx - 4} y2={cy + 14} stroke={T.ink} strokeWidth={3.4} strokeLinecap="round" />
      <line x1={cx + 33} y1={cy - 36} x2={cx + 40} y2={cy - 45} stroke={T.crimson} strokeWidth={3.4} strokeLinecap="round" />
      <path d={`M ${cx - 4} ${cy + 14} l -7 1 l 4 -7 z`} fill={T.ink} />
    </svg>
  );
}
