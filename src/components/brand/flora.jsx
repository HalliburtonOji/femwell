// FemWell brand flora — the canonical, reusable craft components.
// Promoted from pages/BrandCraftSample.jsx so production surfaces (Today, Garden…)
// import the SAME approved bloom + colourway grammar instead of re-deriving.
// Spec: claude-state/BRAND_IDENTITY.md §2.5 (colourways), §5 (bloom), §5.2 (fingerprint).
//
// NOTE: BrandCraftSample.jsx still holds its own copies of the wider glyph set
// (FlowerGlyph/Creature/leaf/corner/divider/MiniGarden). This module exports the
// pieces production needs now — RichBloomV2 + the colourway/fingerprint grammar.
// De-dup the sample to import from here in a later pass.

import React from "react";
import { T } from "@/components/journal/Editorial";

// ── colour helpers ──────────────────────────────────────────────────────────
export function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amt));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amt));
  const b = Math.min(255, (n & 255) + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
export function darken(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 255) - Math.round(255 * amt));
  const g = Math.max(0, ((n >> 8) & 255) - Math.round(255 * amt));
  const b = Math.max(0, (n & 255) - Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ── the 9 colourways (BRAND_IDENTITY §2.5) — colour carries meaning ───────────
export const COLORWAYS = [
  { key: "crimson", label: "Crimson", meaning: "love · remembrance", petal: "#BC2E27", tip: "#D9554E", accent: "#2E261B" },
  { key: "blush", label: "Blush", meaning: "grace · tenderness", petal: "#E8B4B8", tip: "#F4D9DC", accent: "#A8893F" },
  { key: "gold", label: "Gold", meaning: "joy · radiance", petal: "#D4AF37", tip: "#E8CE78", accent: "#6B5840" },
  { key: "sage", label: "Sage", meaning: "renewal · hope", petal: "#8FAF8F", tip: "#B6CDB6", accent: "#2E261B" },
  { key: "plum", label: "Plum", meaning: "dignity · wisdom", petal: "#8E6E8E", tip: "#B196B1", accent: "#D4AF37" },
  { key: "lavender", label: "Lavender", meaning: "devotion · serenity", petal: "#B6A6C9", tip: "#D4C9E2", accent: "#8E6E8E" },
  { key: "cream", label: "Cream", meaning: "purity · a fresh start", petal: "#E4DAC1", tip: "#F2EAD6", accent: "#A8893F" },
  { key: "coral", label: "Coral", meaning: "warmth · enthusiasm", petal: "#E08A6A", tip: "#F0B79E", accent: "#8E3B2C" },
  { key: "sky", label: "Sky", meaning: "trust · constancy", petal: "#9FB6C9", tip: "#C3D2DE", accent: "#5F7E8E" },
];
export const cwOf = (key) => COLORWAYS.find((c) => c.key === key) || COLORWAYS[0];

// ── per-user flora fingerprint (deterministic; same garden on every device) ───
export function hashSeed(s) { let h = 2166136261; for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function seededRng(seed) { let x = (seed || 1) >>> 0; return () => { x = (Math.imul(x, 1103515245) + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
// Stable per-user colourway for the companion bloom (the fingerprint's signature hue).
export function fingerprintColourway(userId) { return COLORWAYS[hashSeed(userId || "femwell") % COLORWAYS.length]; }

// ── keyframes (inject once per page that renders a RichBloomV2) ───────────────
export const floraKeyframes = `@keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes fwcSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(-1px)}}@keyframes fwcShimmer{0%,100%{opacity:.45}50%{opacity:.85}}@media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}}`;

// ── RichBloomV2 — the canonical crafted bloom (BRAND_IDENTITY §5) ─────────────
const PETAL_BLOOM_CX = 50, PETAL_BLOOM_CY = 50;
function petalPath(len, wid) {
  const w = wid, L = len;
  return `M0 0
    C ${-w} ${-L * 0.30} ${-w * 0.92} ${-L * 0.80} ${-w * 0.34} ${-L * 0.95}
    Q 0 ${-L * 0.86} ${w * 0.34} ${-L * 0.95}
    C ${w * 0.92} ${-L * 0.80} ${w} ${-L * 0.30} 0 0 Z`;
}
export function RichBloomV2({ color = T.blush, color2 = null, accent = "#CBA24E", size = 150, animate = true, soft = true, idx = 0 }) {
  const cx = PETAL_BLOOM_CX, cy = PETAL_BLOOM_CY;
  const lightest = color2 || lighten(color, 0.52), light = lighten(color, 0.34), mid = lighten(color, 0.14), deep = color, deeper = darken(color, 0.13);
  const gid = `v2${idx}`;
  const delay = `${(idx % 5) * 0.7}s`;
  const ring = (count, len, wid, gradId, op, rot, edge) => Array.from({ length: count }).map((_, i) => {
    const ang = rot + i * (360 / count);
    return <path key={`${gradId}-${i}`} d={petalPath(len, wid)} fill={`url(#${gradId})`} opacity={op}
      stroke={edge} strokeWidth={edge ? 0.4 : undefined} strokeOpacity={edge ? 0.16 : undefined}
      transform={`translate(${cx} ${cy}) rotate(${ang})`} />;
  });
  return (
    <div style={{ position: "relative", display: "inline-block", width: size, height: Math.round(size * 1.05), lineHeight: 0 }}>
      {soft && (
        <svg viewBox="0 0 100 105" width={size} height={Math.round(size * 1.05)} aria-hidden style={{ position: "absolute", inset: 0 }}>
          <defs><filter id={`bl-${gid}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.9" /></filter></defs>
          <ellipse cx={cx} cy={97} rx={20} ry={4.6} fill="#2E261B" opacity="0.22" filter={`url(#bl-${gid})`} />
        </svg>
      )}
      <svg viewBox="0 0 100 105" width={size} height={Math.round(size * 1.05)} aria-hidden style={{ position: "relative", overflow: "visible" }}>
        <defs>
          <linearGradient id={`pO-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={mid} /><stop offset="52%" stopColor={deep} /><stop offset="100%" stopColor={deeper} /></linearGradient>
          <linearGradient id={`pM-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={light} /><stop offset="50%" stopColor={mid} /><stop offset="100%" stopColor={deep} /></linearGradient>
          <linearGradient id={`pI-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lightest} /><stop offset="60%" stopColor={light} /><stop offset="100%" stopColor={mid} /></linearGradient>
          <radialGradient id={`gl-${gid}`} cx="50%" cy="46%" r="52%"><stop offset="0%" stopColor={lightest} stopOpacity="0.30" /><stop offset="100%" stopColor={color} stopOpacity="0" /></radialGradient>
          <radialGradient id={`ct-${gid}`} cx="50%" cy="42%" r="60%"><stop offset="0%" stopColor={lighten(accent, 0.3)} /><stop offset="100%" stopColor={accent} /></radialGradient>
          <linearGradient id={`st-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8FAF8F" /><stop offset="100%" stopColor="#5F7E5F" /></linearGradient>
          <linearGradient id={`lf-${gid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9DBE9D" /><stop offset="100%" stopColor="#6E8E6E" /></linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r="36" fill={`url(#gl-${gid})`} />
        <path d={`M48.4 97 C 47.9 84 49.4 70 49 60 L 51 60 C 51.4 70 52 84 51.5 97 Z`} fill={`url(#st-${gid})`} />
        <g>
          <path d="M49 78 C 37 74 29 77 26 86 C 37 88 47 83 49 77 Z" fill={`url(#lf-${gid})`} opacity="0.95" />
          <path d="M49 78 C 41 79 33 82 27 86" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M42 79 L 39 76 M37 81 L 34 79 M33 83 L 31 82" stroke="#5F7E5F" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M51 71 C 63 67 71 70 74 79 C 63 81 53 76 51 70 Z" fill={`url(#lf-${gid})`} opacity="0.9" />
          <path d="M51 71 C 59 72 67 75 73 79" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65" />
        </g>
        <g style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: `fwcBreath 6s ease-in-out infinite`, animationDelay: delay } : undefined}>
          {ring(11, 30, 8.5, `pO-${gid}`, 0.97, 0, deeper)}
          {ring(10, 23, 7, `pM-${gid}`, 0.98, 18, deep)}
          {ring(7, 15, 5.4, `pI-${gid}`, 0.99, 9, mid)}
          <circle cx={cx} cy={cy} r="6.6" fill={`url(#ct-${gid})`} />
          {Array.from({ length: 9 }).map((_, i) => { const a = i * 40 * Math.PI / 180; const rr = 4.6; return <circle key={`stm${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="1.05" fill={darken(accent, 0.12)} opacity="0.85" />; })}
          <circle cx={cx} cy={cy} r="2.2" fill={lighten(accent, 0.28)} />
          <g style={animate ? { animation: `fwcShimmer 5s ease-in-out infinite`, animationDelay: delay } : undefined}>
            <ellipse cx={cx - 7} cy={cy - 11} rx="6.5" ry="3.4" fill="#FFFDF7" opacity="0.30" transform={`rotate(-24 ${cx - 7} ${cy - 11})`} />
            <circle cx={cx - 9} cy={cy - 6} r="1.5" fill="#FFFFFF" opacity="0.65" />
            <circle cx={cx + 6} cy={cy - 9} r="1.0" fill="#FFFFFF" opacity="0.45" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// a bloom that gently sways around its stem base (wrap RichBloomV2)
export function SwayBloom({ children, animate = true, idx = 0 }) {
  return (
    <div style={animate ? { display: "inline-block", transformOrigin: "bottom center", animation: "fwcSway 8s ease-in-out infinite", animationDelay: `${(idx % 5) * 0.9}s` } : { display: "inline-block" }}>
      {children}
    </div>
  );
}
