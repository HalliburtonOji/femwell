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
export const floraKeyframes = `@keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes fwcSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(-1px)}}@keyframes fwcShimmer{0%,100%{opacity:.45}50%{opacity:.85}}@keyframes fwcDrift{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(4px,-5px) rotate(3deg)}}@keyframes fwcFlutter{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.86)}}@keyframes fwcGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.72;transform:scale(1.04)}}@media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}}`;

// ── RichBloomV2 — the canonical crafted bloom (BRAND_IDENTITY §5) ─────────────
// ELEVATED 2026-06-19 (Halli "flora looks boring, +2 levels"): realistic petals
// (softly-notched silhouette + per-petal midrib vein), richer 4–5-stop gradients
// with a lit tip + shadowed throat (ambient occlusion), dimensional layered
// centres, and a much larger species library. Perf held: gradients + extra paths
// only, NO per-petal blur — the one isolated drop-shadow is the sole filter,
// animation stays on the GROUP + is prefers-reduced-motion gated (§4).
const PETAL_BLOOM_CX = 50, PETAL_BLOOM_CY = 50;
// rounded, softly-notched petal (organic teardrop with a gentle dip at the tip)
function petalRound(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w} ${-L * 0.24} ${-w * 0.98} ${-L * 0.70} ${-w * 0.42} ${-L * 0.88} C ${-w * 0.18} ${-L * 0.97} ${-w * 0.05} ${-L} 0 ${-L * 0.92} C ${w * 0.05} ${-L} ${w * 0.18} ${-L * 0.97} ${w * 0.42} ${-L * 0.88} C ${w * 0.98} ${-L * 0.70} ${w} ${-L * 0.24} 0 0 Z`;
}
// pointed petal (rays / spiky forms — dahlia, chrysanthemum, cosmos, daisy, cornflower)
function petalPoint(len, wid) {
  const w = wid, L = len;
  return `M0 0 C ${-w} ${-L * 0.36} ${-w * 0.55} ${-L * 0.80} 0 ${-L} C ${w * 0.55} ${-L * 0.80} ${w} ${-L * 0.36} 0 0 Z`;
}
const petalPath = petalRound; // back-compat alias
const GOLD_ANGLE = 137.50776; // for sunflower seed spiral (phyllotaxis)
// ── species-specific petal silhouettes (so each flower READS as itself, not a generic ring) ──
// cupped petal with a folded centre crease (rose / peony / camellia)
function petalCup(len, wid) { const w = wid, L = len; return `M0 0 C ${-w} ${-L * 0.30} ${-w * 0.95} ${-L * 0.82} ${-w * 0.34} ${-L * 0.99} C ${-w * 0.10} ${-L * 1.02} ${w * 0.10} ${-L * 1.02} ${w * 0.34} ${-L * 0.99} C ${w * 0.95} ${-L * 0.82} ${w} ${-L * 0.30} 0 0 Z`; }
// broad rounded petal that bulges past its waist (hibiscus / magnolia / anemone)
function petalBroad(len, wid) { const w = wid, L = len; return `M0 0 C ${-w * 1.04} ${-L * 0.22} ${-w * 1.02} ${-L * 0.66} ${-w * 0.5} ${-L * 0.92} C ${-w * 0.2} ${-L * 1.04} ${w * 0.2} ${-L * 1.04} ${w * 0.5} ${-L * 0.92} C ${w * 1.02} ${-L * 0.66} ${w * 1.04} ${-L * 0.22} 0 0 Z`; }
// narrow lance tepal, pointed (lily / iris falls)
function petalLance(len, wid) { const w = wid, L = len; return `M0 0 C ${-w} ${-L * 0.34} ${-w * 0.5} ${-L * 0.84} 0 ${-L} C ${w * 0.5} ${-L * 0.84} ${w} ${-L * 0.34} 0 0 Z`; }
// a furled comma — the curled inner petal of a rose's heart
function petalFurl(s) { return `M0 0 C ${-7 * s} ${-2 * s} ${-8 * s} ${-10 * s} ${-2 * s} ${-13 * s} C ${2 * s} ${-15 * s} ${7 * s} ${-12 * s} ${6 * s} ${-7 * s} C ${5.4 * s} ${-3.5 * s} ${1.5 * s} ${-3 * s} ${1.5 * s} ${-6 * s}`; }

// per-FORM ring grammar — [count, len, wid, rotation, gradCode, opacity, pointed?].
const FORM_RINGS = {
  peony:        [[12, 30, 8.5, 0, "O", 0.97], [10, 23, 7, 18, "M", 0.98], [8, 15, 5.4, 9, "I", 0.99]],
  rose:         [[8, 29, 9.5, 0, "O", 0.95], [7, 22, 8.6, 26, "M", 0.97], [6, 15, 7.6, 12, "I", 0.98], [5, 9, 6.4, 22, "I", 0.99]],
  ranunculus:   [[11, 25, 6.6, 0, "O", 0.95], [10, 19, 5.8, 17, "M", 0.97], [9, 13.5, 4.8, 9, "I", 0.98], [7, 8.5, 4, 14, "I", 0.99]],
  camellia:     [[8, 28, 8.4, 0, "O", 0.96], [7, 20, 7.2, 24, "M", 0.98], [6, 13, 6, 12, "I", 0.99]],
  marigold:     [[14, 27, 4.6, 0, "O", 0.95], [13, 20.5, 4, 13, "M", 0.97], [11, 14.5, 3.5, 7, "I", 0.98], [8, 9, 3, 11, "I", 0.99]],
  dahlia:       [[12, 32, 5, 0, "O", 0.95, 1], [11, 24, 4.4, 15, "M", 0.97, 1], [9, 16, 3.7, 8, "I", 0.98, 1]],
  chrysanthemum:[[18, 33, 3, 0, "O", 0.95, 1], [16, 26, 2.8, 10, "M", 0.97, 1], [13, 18, 2.5, 6, "I", 0.98, 1]],
  cosmos:       [[8, 34, 6.4, 0, "O", 0.96]],
  anemone:      [[7, 31, 8.8, 0, "O", 0.96]],
  magnolia:     [[9, 36, 8, 0, "O", 0.96], [6, 25, 7, 20, "M", 0.97]],
  hellebore:    [[5, 30, 11, 0, "O", 0.95]],
  poppy:        [[5, 34, 13, 0, "O", 0.96], [5, 21, 9.5, 36, "M", 0.98]],
  daisy:        [[20, 35, 3.2, 0, "O", 0.97, 1], [20, 29, 2.8, 9, "M", 0.98, 1]],
  forget:       [[5, 24, 11.5, 0, "O", 0.96], [5, 15, 7.5, 36, "M", 0.98]],
  cornflower:   [[10, 30, 4, 0, "O", 0.95, 1], [8, 20, 3.4, 18, "M", 0.97, 1]],
};
// centre treatment per form: tuft (lush stamen cluster) · dark (poppy eye) · gold (daisy disc) · stamen (open ring)
const CENTER_KIND = {
  peony: "tuft", rose: "tuft", ranunculus: "tuft", camellia: "tuft", marigold: "tuft", dahlia: "tuft", chrysanthemum: "tuft", magnolia: "tuft",
  poppy: "dark", anemone: "dark", cornflower: "dark",
  daisy: "gold", forget: "gold", cosmos: "gold",
  hellebore: "stamen",
};
// large-rounded forms get a per-petal midrib vein (reads on few big petals; clutter on many)
const VEINED = new Set(["poppy", "forget", "anemone", "cosmos", "hellebore"]);
// per-species PETAL SILHOUETTE — so each ring-built flower reads as itself (not one generic shape)
const PETAL_FN = { round: petalRound, point: petalPoint, cup: petalCup, broad: petalBroad, lance: petalLance };
const SHAPE = {
  peony: "cup", camellia: "cup", ranunculus: "cup", marigold: "cup",
  anemone: "broad", cosmos: "broad", hellebore: "broad", poppy: "broad",
  dahlia: "point", chrysanthemum: "point", daisy: "point", cornflower: "point",
};
const CUPPED = new Set(["peony", "camellia", "ranunculus", "marigold"]);
// dedicated (non-ring) heads — bespoke geometry so the flower is unmistakable
const FORM_BELL = "foxglove", FORM_FERN = "fern", FORM_SUN = "sunflower", FORM_SNOWDROP = "snowdrop", FORM_TULIP = "tulip",
  FORM_ROSE = "rose", FORM_HIBISCUS = "hibiscus", FORM_LILY = "lily", FORM_MAGNOLIA = "magnolia";

export function RichBloomV2({ color = T.blush, color2 = null, accent = "#CBA24E", size = 150, animate = true, soft = true, idx = 0, form = "peony" }) {
  const cx = PETAL_BLOOM_CX, cy = PETAL_BLOOM_CY;
  const lightest = color2 || lighten(color, 0.52), light = lighten(color, 0.34), mid = lighten(color, 0.14), deep = color, deeper = darken(color, 0.13), darkest = darken(color, 0.3);
  const sheen = lighten(color, 0.62);
  const gid = `v2${idx}`;
  const delay = `${(idx % 5) * 0.7}s`;
  const formKey = (typeof form === "string" ? form : form?.key) || "peony";
  const gradFor = (code) => code === "O" ? `pO-${gid}` : code === "M" ? `pM-${gid}` : `pI-${gid}`;
  const edgeFor = (code) => code === "O" ? deeper : code === "M" ? deep : mid;
  const ring = (count, len, wid, gradId, op, rot, edge, shape = "round", vein) => Array.from({ length: count }).map((_, i) => {
    const ang = rot + i * (360 / count);
    const d = (PETAL_FN[shape] || petalRound)(len, wid);
    const cup = shape === "cup";
    return (
      <g key={`${gradId}-${i}`} transform={`translate(${cx} ${cy}) rotate(${ang})`}>
        <path d={d} fill={`url(#${gradId})`} opacity={op} stroke={edge} strokeWidth={edge ? 0.4 : undefined} strokeOpacity={edge ? 0.16 : undefined} />
        {cup && <>
          <path d={`M0 ${-len * 0.18} Q ${wid * 0.16} ${-len * 0.55} 0 ${-len * 0.9}`} stroke={sheen} strokeWidth="0.5" strokeOpacity="0.32" fill="none" strokeLinecap="round" />
          <path d={`M ${-wid * 0.44} ${-len * 0.24} Q ${-wid * 0.28} ${-len * 0.6} ${-wid * 0.12} ${-len * 0.86}`} stroke={deeper} strokeWidth="0.4" strokeOpacity="0.18" fill="none" strokeLinecap="round" />
        </>}
        {vein && <path d={`M0 -1 Q ${wid * 0.05} ${-len * 0.5} 0 ${-len * 0.82}`} stroke={sheen} strokeWidth="0.55" strokeOpacity="0.4" fill="none" strokeLinecap="round" />}
      </g>
    );
  });

  // ── centre renderers ──
  const centerTuft = () => (
    <g>
      <circle cx={cx} cy={cy} r="13" fill={`url(#occ-${gid})`} />
      <circle cx={cx} cy={cy} r="5" fill={`url(#ct-${gid})`} />
      {Array.from({ length: 16 }).map((_, i) => { const a = i * (360 / 16) * Math.PI / 180; const rr = 4.8; return <circle key={`s${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="1.5" fill={`url(#ct-${gid})`} opacity="0.92" />; })}
      {Array.from({ length: 9 }).map((_, i) => { const a = i * (360 / 9) * Math.PI / 180; const rr = 2.4; return <circle key={`d${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="0.7" fill={darken(accent, 0.18)} opacity="0.85" />; })}
      <circle cx={cx - 1.3} cy={cy - 1.3} r="1.5" fill={lighten(accent, 0.36)} opacity="0.8" />
    </g>
  );
  const centerDark = () => (
    <g>
      <circle cx={cx} cy={cy} r="8.2" fill={darken(color, 0.5)} />
      <circle cx={cx} cy={cy} r="9.5" fill={`url(#occ-${gid})`} />
      {Array.from({ length: 13 }).map((_, i) => { const a = i * (360 / 13) * Math.PI / 180; const rr = 6; return <circle key={`s${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="0.95" fill={darken(color, 0.66)} opacity="0.92" />; })}
      <circle cx={cx} cy={cy} r="2.6" fill={darken(color, 0.34)} />
      <circle cx={cx - 0.8} cy={cy - 0.8} r="0.9" fill={lighten(color, 0.12)} opacity="0.5" />
    </g>
  );
  const centerGold = (big) => (
    <g>
      <circle cx={cx} cy={cy} r={big ? 9 : 6.8} fill={`url(#disc-${gid})`} />
      {Array.from({ length: big ? 18 : 12 }).map((_, i) => { const a = i * (360 / (big ? 18 : 12)) * Math.PI / 180; const rr = big ? 6.4 : 4.7; return <circle key={`s${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={big ? 1.05 : 0.95} fill="#7A5A22" opacity="0.78" />; })}
      <circle cx={cx} cy={cy} r={big ? 3 : 2.2} fill="#E9CF7A" />
      <circle cx={cx - 0.9} cy={cy - 0.9} r="1" fill="#FFF6D8" opacity="0.7" />
    </g>
  );
  const centerStamen = () => (
    <g>
      <circle cx={cx} cy={cy} r="6.2" fill={lighten(color, 0.42)} />
      {Array.from({ length: 18 }).map((_, i) => { const a = i * (360 / 18) * Math.PI / 180; return <line key={`l${i}`} x1={cx} y1={cy} x2={cx + Math.cos(a) * 6.6} y2={cy + Math.sin(a) * 6.6} stroke={darken(accent, 0.05)} strokeWidth="0.5" opacity="0.7" />; })}
      {Array.from({ length: 18 }).map((_, i) => { const a = i * (360 / 18) * Math.PI / 180; return <circle key={`t${i}`} cx={cx + Math.cos(a) * 6.6} cy={cy + Math.sin(a) * 6.6} r="0.75" fill={accent} />; })}
      <circle cx={cx} cy={cy} r="2.6" fill="#E9CF7A" />
    </g>
  );
  const centerFor = (kind, big) => kind === "dark" ? centerDark() : kind === "gold" ? centerGold(big) : kind === "stamen" ? centerStamen() : centerTuft();

  // shared dewy speculars
  const speculars = () => (
    <g style={animate ? { animation: `fwcShimmer 5s ease-in-out infinite`, animationDelay: delay } : undefined}>
      <ellipse cx={cx - 7} cy={cy - 11} rx="6.5" ry="3.4" fill="#FFFDF7" opacity="0.24" transform={`rotate(-24 ${cx - 7} ${cy - 11})`} />
      <circle cx={cx - 9} cy={cy - 6} r="1.4" fill="#FFFFFF" opacity="0.55" />
      <circle cx={cx + 6} cy={cy - 9} r="1.0" fill="#FFFFFF" opacity="0.4" />
    </g>
  );
  // ── per-form HEAD renderers (all inside the breathing/swaying group) ──
  const petalHead = () => {
    const rings = FORM_RINGS[formKey] || FORM_RINGS.peony;
    const kind = CENTER_KIND[formKey] || "tuft";
    const vein = VEINED.has(formKey);
    const shape = SHAPE[formKey] || "round";
    return (
      <>
        {rings.map(([count, len, wid, rot, code, op]) => (
          <React.Fragment key={`${code}-${rot}`}>{ring(count, len, wid, gradFor(code), op, rot, edgeFor(code), shape, vein)}</React.Fragment>
        ))}
        {centerFor(kind, formKey === "daisy" || formKey === "cosmos")}
        {speculars()}
      </>
    );
  };
  // SUNFLOWER — narrow ray florets + a big seed disc with a real phyllotaxis spiral
  const sunHead = () => (
    <g>
      {ring(26, 35, 2.7, gradFor("O"), 0.96, 0, deeper, true)}
      {ring(26, 30, 2.5, gradFor("M"), 0.98, 6.9, deep, true)}
      <circle cx={cx} cy={cy} r="13" fill={`url(#disc-${gid})`} />
      {Array.from({ length: 96 }).map((_, i) => { const a = i * GOLD_ANGLE * Math.PI / 180; const rr = 1.32 * Math.sqrt(i); if (rr > 12) return null; return <circle key={`sd${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="0.72" fill={i % 2 ? "#5E4419" : "#7A5A22"} opacity="0.92" />; })}
      <circle cx={cx} cy={cy} r="13" fill="none" stroke={darken(color, 0.22)} strokeWidth="0.6" opacity="0.45" />
      <ellipse cx={cx - 4} cy={cy - 4} rx="3.4" ry="2" fill="#FFFFFF" opacity="0.12" transform={`rotate(-30 ${cx - 4} ${cy - 4})`} />
    </g>
  );
  // SNOWDROP — a nodding white bell of 3 outer tepals + a green-marked inner cup
  const snowdropHead = () => (
    <g>
      <path d="M50 16 C 50 26 50 32 50 37" stroke={`url(#st-${gid})`} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M50 33 C 56 33 59 36 57 39" stroke="#7E9A7E" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8" />
      <g transform="translate(50 40)">
        <path d="M0 1 C -7.5 4 -8.5 17 -3 24 C -1 26 1 26 0.5 23 Z" fill={`url(#snowO-${gid})`} stroke={darken(lightest, 0.06)} strokeWidth="0.3" strokeOpacity="0.4" />
        <path d="M0 1 C 7.5 4 8.5 17 3 24 C 1 26 -1 26 -0.5 23 Z" fill={`url(#snowO-${gid})`} stroke={darken(lightest, 0.06)} strokeWidth="0.3" strokeOpacity="0.4" />
        <path d="M0 1 C -2.4 7 -2.4 20 0 25 C 2.4 20 2.4 7 0 1 Z" fill={`url(#snowM-${gid})`} />
        <path d="M0 21 C -2.2 20 -2.2 17.5 0 16.5 C 2.2 17.5 2.2 20 0 21 Z" fill="#7FA77F" opacity="0.85" />
        <ellipse cx="-2.2" cy="7" rx="1.3" ry="3.2" fill="#FFFFFF" opacity="0.55" />
      </g>
    </g>
  );
  // TULIP — a closed goblet of cupped tepals
  const tulipHead = () => {
    const tp = (rot, s, grad, op) => <path d="M0 0 C -8.5 -5 -9 -27 0 -36 C 9 -27 8.5 -5 0 0 Z" fill={`url(#${grad})`} opacity={op} stroke={deep} strokeWidth="0.3" strokeOpacity="0.2" transform={`translate(${cx} ${cy + 12}) rotate(${rot}) scale(${s})`} />;
    return (
      <g>
        {tp(-22, 1, `pO-${gid}`, 0.95)}{tp(22, 1, `pO-${gid}`, 0.95)}{tp(0, 1.06, `pM-${gid}`, 0.97)}
        {tp(-11, 0.84, `pI-${gid}`, 0.98)}{tp(11, 0.84, `pI-${gid}`, 0.98)}
        <ellipse cx={cx - 3} cy={cy - 12} rx="2.2" ry="6" fill="#FFFFFF" opacity="0.2" transform={`rotate(-12 ${cx - 3} ${cy - 12})`} />
      </g>
    );
  };
  const bellHead = () => {
    const bells = [
      { x: 50, y: 56, s: 1.18 }, { x: 42, y: 49, s: 1.02 }, { x: 57, y: 47, s: 0.96 },
      { x: 45, y: 39, s: 0.84 }, { x: 54, y: 33, s: 0.72 }, { x: 50, y: 26, s: 0.6 },
    ];
    return (
      <g>
        <path d="M50 62 C 49 46 51 30 50 18" stroke={`url(#st-${gid})`} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {bells.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
            <path d="M0 -7 C -5.2 -6 -6 0 -5 5.4 C -4 8.4 4 8.4 5 5.4 C 6 0 5.2 -6 0 -7 Z" fill={`url(#pM-${gid})`} stroke={deep} strokeWidth="0.3" strokeOpacity="0.22" />
            <ellipse cx="0" cy="5.6" rx="4.6" ry="1.9" fill={deeper} opacity="0.45" />
            <circle cx="-1.5" cy="3.2" r="0.5" fill={lightest} opacity="0.85" /><circle cx="1.5" cy="4.2" r="0.5" fill={lightest} opacity="0.75" />
            <ellipse cx="-2" cy="-3" rx="1.7" ry="1.05" fill="#FFFDF7" opacity="0.32" transform="rotate(-20 -2 -3)" />
          </g>
        ))}
      </g>
    );
  };
  const fernHead = () => {
    const frond = (rot, len, key) => {
      const pairs = 7;
      return (
        <g key={key} transform={`translate(${cx} 60) rotate(${rot})`}>
          <path d={`M0 0 Q 3 ${-len / 2} 1 ${-len}`} stroke={`url(#lf-${gid})`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {Array.from({ length: pairs }).map((_, i) => {
            const t = (i + 0.5) / pairs, yy = -len * t, ll = 5.6 * (1 - t * 0.66);
            return (
              <g key={i}>
                <ellipse cx={-ll * 0.7} cy={yy} rx={ll} ry={ll * 0.34} fill={`url(#lf-${gid})`} opacity="0.92" transform={`rotate(-32 ${-ll * 0.7} ${yy})`} />
                <ellipse cx={ll * 0.7} cy={yy} rx={ll} ry={ll * 0.34} fill={`url(#lf-${gid})`} opacity="0.92" transform={`rotate(32 ${ll * 0.7} ${yy})`} />
              </g>
            );
          })}
        </g>
      );
    };
    return <g>{frond(-20, 42, "fl")}{frond(0, 50, "fc")}{frond(20, 42, "fr")}</g>;
  };
  // a cupped-petal ring with fold creases — the rose family building block
  const cupRing = (count, len, wid, gradId, op, rot, edge) => Array.from({ length: count }).map((_, i) => {
    const ang = rot + i * (360 / count);
    return (
      <g key={`${gradId}-${i}`} transform={`translate(${cx} ${cy}) rotate(${ang})`}>
        <path d={petalCup(len, wid)} fill={`url(#${gradId})`} opacity={op} stroke={edge} strokeWidth="0.4" strokeOpacity="0.18" />
        <path d={`M0 ${-len * 0.18} Q ${wid * 0.16} ${-len * 0.55} 0 ${-len * 0.9}`} stroke={sheen} strokeWidth="0.5" strokeOpacity="0.32" fill="none" strokeLinecap="round" />
        <path d={`M ${-wid * 0.44} ${-len * 0.24} Q ${-wid * 0.28} ${-len * 0.6} ${-wid * 0.12} ${-len * 0.86}`} stroke={deeper} strokeWidth="0.4" strokeOpacity="0.18" fill="none" strokeLinecap="round" />
      </g>
    );
  });
  // ROSE — the hero. Open cupped outer petals → a spiralled, furled heart.
  const roseHead = () => {
    // the SPIRAL FURLED HEART — overlapping crescent petals coiling inward (the rose signature)
    const coil = [];
    const N = 11;
    for (let i = 0; i < N; i++) {
      const ang = i * 47, sc = 1.12 - i * 0.072;
      coil.push(<path key={`c${i}`} d="M0 0 C -7.5 -1.5 -9 -9.5 -3 -13 C 1.4 -15.6 8 -11.6 7 -5.6 C 6.2 -2 1.6 -2.2 1.8 -6"
        transform={`translate(${cx} ${cy}) rotate(${ang}) scale(${sc})`}
        fill={i % 2 ? `url(#pM-${gid})` : `url(#pI-${gid})`} stroke={deeper} strokeWidth="0.4" strokeOpacity="0.24" opacity="0.99" />);
    }
    return (
      <g>
        {cupRing(8, 32, 12, `pO-${gid}`, 0.96, 0, deeper)}
        {cupRing(7, 25, 11.5, `pM-${gid}`, 0.97, 24, deep)}
        {cupRing(6, 18, 10, `pM-${gid}`, 0.98, 12, deep)}
        <circle cx={cx} cy={cy} r="13" fill={`url(#occ-${gid})`} />
        {coil}
        <circle cx={cx} cy={cy} r="1.6" fill={deeper} opacity="0.6" />
        <ellipse cx={cx - 7} cy={cy - 8} rx="3.4" ry="2" fill="#FFFDF7" opacity="0.22" transform={`rotate(-28 ${cx - 7} ${cy - 8})`} />
      </g>
    );
  };
  // HIBISCUS — 5 broad veined petals, a deep throat, and the signature staminal column.
  const hibiscusHead = () => (
    <g>
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${i * 72})`}>
          <path d={petalBroad(35, 15)} fill={`url(#pO-${gid})`} stroke={deeper} strokeWidth="0.4" strokeOpacity="0.16" />
          {[-1, 0, 1].map((k) => <path key={k} d={`M0 -3 Q ${k * 3.4} ${-18} ${k * 2.2} ${-31}`} stroke={darken(color, 0.22)} strokeWidth="0.4" strokeOpacity="0.3" fill="none" strokeLinecap="round" />)}
        </g>
      ))}
      <circle cx={cx} cy={cy} r="9.5" fill={darken(color, 0.42)} />
      <circle cx={cx} cy={cy} r="11" fill={`url(#occ-${gid})`} />
      {/* staminal column up-right */}
      <path d={`M${cx} ${cy} Q ${cx + 7} ${cy - 13} ${cx + 9.5} ${cy - 24}`} stroke={darken(color, 0.16)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => { const t = i / 9; const px = cx + 7 * t + (i % 2 ? 1.8 : -1.8); const py = cy - 16 * t - 5; return <circle key={i} cx={px} cy={py} r="1.15" fill="#E9CF7A" stroke="#B98F2E" strokeWidth="0.2" />; })}
      {Array.from({ length: 5 }).map((_, i) => { const a = i * 72 * Math.PI / 180; return <circle key={`sg${i}`} cx={cx + 9.5 + Math.cos(a) * 2.2} cy={cy - 24 + Math.sin(a) * 2.2} r="1.3" fill={darken(color, 0.05)} />; })}
      {speculars()}
    </g>
  );
  // LILY — 6 recurved lance tepals + 6 prominent stamens with anthers + pistil.
  const ANTHER = "#9A6B2E";
  const lilyHead = () => (
    <g>
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${i * 60})`}>
          <path d={petalLance(37, 8)} fill={`url(#${i % 2 ? "pM" : "pO"}-${gid})`} stroke={deeper} strokeWidth="0.4" strokeOpacity="0.16" />
          <path d="M0 -3 L 0 -34" stroke={darken(color, 0.18)} strokeWidth="0.4" strokeOpacity="0.26" />
          <circle cx="0" cy="-11" r="0.8" fill={darken(color, 0.3)} opacity="0.45" />
          <circle cx="-1.4" cy="-15" r="0.6" fill={darken(color, 0.3)} opacity="0.4" />
        </g>
      ))}
      {Array.from({ length: 6 }).map((_, i) => { const a = (i * 60 + 30) * Math.PI / 180; const ex = cx + Math.cos(a) * 17, ey = cy + Math.sin(a) * 17; return (<g key={`st${i}`}><line x1={cx} y1={cy} x2={ex} y2={ey} stroke={lighten(ANTHER, 0.18)} strokeWidth="0.9" strokeLinecap="round" /><ellipse cx={ex} cy={ey} rx="2.6" ry="1.3" fill={ANTHER} transform={`rotate(${i * 60 + 30} ${ex} ${ey})`} /></g>); })}
      <ellipse cx={cx} cy={cy - 1} rx="2" ry="3" fill={`url(#ct-${gid})`} />
      {speculars()}
    </g>
  );
  // MAGNOLIA — 9 broad open tepals + a central carpel cone.
  const magnoliaHead = () => (
    <g>
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={petalBroad(36, 8.5)} fill={`url(#${i % 2 ? "pO" : "pM"}-${gid})`} opacity="0.96" stroke={deeper} strokeWidth="0.4" strokeOpacity="0.14" transform={`translate(${cx} ${cy}) rotate(${i * 40})`} />)}
      <ellipse cx={cx} cy={cy} rx="4.2" ry="6.4" fill={`url(#ct-${gid})`} />
      {Array.from({ length: 11 }).map((_, i) => { const a = i * 33 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 3} cy={cy + Math.sin(a) * 4.4} r="0.7" fill={darken(accent, 0.12)} opacity="0.7" />; })}
      <ellipse cx={cx - 1} cy={cy - 2} rx="1.5" ry="2.6" fill="#FFFDF7" opacity="0.34" />
      {speculars()}
    </g>
  );
  const head = formKey === FORM_BELL ? bellHead() : formKey === FORM_FERN ? fernHead()
    : formKey === FORM_SUN ? sunHead() : formKey === FORM_SNOWDROP ? snowdropHead()
    : formKey === FORM_TULIP ? tulipHead() : formKey === FORM_ROSE ? roseHead()
    : formKey === FORM_HIBISCUS ? hibiscusHead() : formKey === FORM_LILY ? lilyHead()
    : formKey === FORM_MAGNOLIA ? magnoliaHead() : petalHead();

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
          {/* petals — 4-stop, lit tip → shadowed throat */}
          <linearGradient id={`pO-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={light} /><stop offset="24%" stopColor={mid} /><stop offset="70%" stopColor={deep} /><stop offset="100%" stopColor={deeper} /></linearGradient>
          <linearGradient id={`pM-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lightest} /><stop offset="30%" stopColor={light} /><stop offset="72%" stopColor={mid} /><stop offset="100%" stopColor={deep} /></linearGradient>
          <linearGradient id={`pI-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sheen} /><stop offset="45%" stopColor={lightest} /><stop offset="100%" stopColor={light} /></linearGradient>
          <radialGradient id={`gl-${gid}`} cx="50%" cy="46%" r="52%"><stop offset="0%" stopColor={lightest} stopOpacity="0.34" /><stop offset="100%" stopColor={color} stopOpacity="0" /></radialGradient>
          <radialGradient id={`ct-${gid}`} cx="42%" cy="38%" r="64%"><stop offset="0%" stopColor={lighten(accent, 0.34)} /><stop offset="60%" stopColor={accent} /><stop offset="100%" stopColor={darken(accent, 0.16)} /></radialGradient>
          {/* throat occlusion — dark at centre, fades out (seats the petals) */}
          <radialGradient id={`occ-${gid}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={darkest} stopOpacity="0.5" /><stop offset="55%" stopColor={darkest} stopOpacity="0.26" /><stop offset="100%" stopColor={darkest} stopOpacity="0" /></radialGradient>
          {/* seed disc (sunflower / daisy gold eye) */}
          <radialGradient id={`disc-${gid}`} cx="42%" cy="40%" r="64%"><stop offset="0%" stopColor="#A07A2E" /><stop offset="60%" stopColor="#6E4F1C" /><stop offset="100%" stopColor="#4A3412" /></radialGradient>
          {/* snowdrop whites (pale, faintly colourway-tinted) */}
          <linearGradient id={`snowO-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor={lightest} /></linearGradient>
          <linearGradient id={`snowM-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lighten(lightest, 0.2)} /><stop offset="100%" stopColor={light} /></linearGradient>
          <linearGradient id={`st-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8FAF8F" /><stop offset="100%" stopColor="#5F7E5F" /></linearGradient>
          <linearGradient id={`lf-${gid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#A6C6A6" /><stop offset="55%" stopColor="#82A282" /><stop offset="100%" stopColor="#5F7E5F" /></linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r="36" fill={`url(#gl-${gid})`} />
        <path d={`M48.4 97 C 47.9 84 49.4 70 49 60 L 51 60 C 51.4 70 52 84 51.5 97 Z`} fill={`url(#st-${gid})`} />
        <g>
          <path d="M49 78 C 37 74 29 77 26 86 C 37 88 47 83 49 77 Z" fill={`url(#lf-${gid})`} opacity="0.95" />
          <path d="M49 78 C 41 79 33 82 27 86" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M42 79 L 39 76 M37 81 L 34 79 M33 83 L 31 82" stroke="#5F7E5F" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M51 71 C 63 67 71 70 74 79 C 63 81 53 76 51 70 Z" fill={`url(#lf-${gid})`} opacity="0.9" />
          <path d="M51 71 C 59 72 67 75 73 79" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65" />
          <path d="M58 73 L 61 71 M62 75 L 65 74 M66 77 L 68 76" stroke="#5F7E5F" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.5" />
        </g>
        <g style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: `fwcBreath 6s ease-in-out infinite`, animationDelay: delay } : undefined}>
          {head}
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

// ── BOUQUET — a COMBINATION arrangement: 2–4 DIFFERENT blooms clustered with
// overlapping stems + leaves, so a surface shows a posy, not one lone flower.
export function Bouquet({ items, size = 220, animate = true, idx = "bq" }) {
  const list = (items && items.length) ? items : [
    { form: "rose", colorway: "crimson", scale: 1.0, dx: 0, dy: 0, rot: 0 },
    { form: "sunflower", colorway: "gold", scale: 0.72, dx: -0.30, dy: 0.16, rot: -16 },
    { form: "hibiscus", colorway: "coral", scale: 0.66, dx: 0.31, dy: 0.20, rot: 16 },
    { form: "forget", colorway: "sky", scale: 0.42, dx: 0.10, dy: -0.20, rot: 8 },
  ];
  const W = size, H = Math.round(size * 1.14);
  return (
    <div style={{ position: "relative", width: W, height: H, lineHeight: 0 }}>
      <style>{floraKeyframes}</style>
      {list.map((it, i) => {
        const c = cwOf(it.colorway);
        const bs = Math.round(W * 0.6 * (it.scale ?? 1));
        return (
          <div key={i} style={{ position: "absolute", left: `calc(50% + ${(it.dx || 0) * W}px)`, top: `calc(46% + ${(it.dy || 0) * H}px)`, transform: `translate(-50%,-50%) rotate(${it.rot || 0}deg)`, zIndex: (it.scale ?? 1) >= 1 ? 3 : 2 }}>
            <SwayBloom animate={animate} idx={i}><RichBloomV2 form={it.form} color={c.petal} color2={c.tip} accent={c.accent} size={bs} animate={animate} soft={i === 0} idx={`${idx}-${i}`} /></SwayBloom>
          </div>
        );
      })}
    </div>
  );
}

// ── BLOOM + CREATURE — a living moment: a creature resting physically ON the
// plant (a butterfly on a petal, a ladybird on a leaf, a bee on the flower).
const CREATURE_AT = {
  petal: { top: "15%", left: "60%", size: 34 },
  leaf: { top: "79%", left: "25%", size: 24 },
  flower: { top: "40%", left: "47%", size: 30 },
};
export function BloomWithCreature({ form = "rose", colorway = "crimson", size = 150, creature = "butterfly", at = "petal", animate = true, idx = "bwc" }) {
  const c = cwOf(colorway);
  const p = CREATURE_AT[at] || CREATURE_AT.petal;
  const col = creature === "bee" ? T.gold : creature === "ladybird" ? T.crimson : c.accent;
  return (
    <div style={{ position: "relative", width: size, height: Math.round(size * 1.05), display: "inline-block", lineHeight: 0 }}>
      <RichBloomV2 form={form} color={c.petal} color2={c.tip} accent={c.accent} size={size} animate={animate} idx={idx} />
      <div style={{ position: "absolute", top: p.top, left: p.left, transform: "translate(-50%,-50%)", zIndex: 4, pointerEvents: "none" }}>
        <Pollinator kind={creature} size={p.size} color={col} color2={c.tip} animate={animate} idx={`${idx}-cr`} />
      </div>
    </div>
  );
}

// ── BOTANICAL BRAND-IMAGE GLYPHS (BRAND_IDENTITY §4) — corners · dividers · motifs · leaves ────────
// Promoted from BrandCraftSample so production surfaces (Today…) render the real craft.

// elevated vine motif — tapered gradient stem, veined leaves, tendril + bud (low-opacity page texture)
export function VineMotifV2({ color = T.gold, color2, opacity = 0.5, w = 130, flip = false, idx = 0 }) {
  const c2 = color2 || color, gid = `vm${idx}${flip ? "f" : ""}`;
  return (
    <svg width={w} height={w} viewBox="0 0 140 140" aria-hidden style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <defs>
        <linearGradient id={`vs-${gid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" /><stop offset="32%" stopColor={color} stopOpacity={opacity} /><stop offset="100%" stopColor={c2} stopOpacity={opacity * 0.72} />
        </linearGradient>
      </defs>
      <path d="M10 132 C 30 112 34 86 28 62 C 24 44 32 28 50 18 L 52.6 19.6 C 35 30 27 45 31 62 C 37 86 33 112 12.4 133 Z" fill={`url(#vs-${gid})`} />
      <g fill="none" stroke={`url(#vs-${gid})`} strokeWidth="1.05" strokeLinecap="round">
        <path d="M29 64 C 16 60 9 49 11 38 C 23 42 30 52 29 64 Z" />
        <path d="M29 64 C 23 56 17 49 12 39" strokeWidth="0.8" />
        <path d="M24 56 L 19 56 M21 50 L 16 49 M19 45 L 15 43" strokeWidth="0.6" opacity="0.8" />
        <path d="M31 50 C 45 47 53 38 54 26 C 42 29 33 38 31 50 Z" />
        <path d="M31 50 C 39 43 47 36 53 27" strokeWidth="0.8" />
        <path d="M40 42 L 41 37 M45 38 L 47 33 M49 34 L 52 30" strokeWidth="0.6" opacity="0.8" />
        <path d="M27 92 C 15 89 8 80 10 70 C 22 74 28 82 27 92 Z" />
        <path d="M27 92 C 22 84 16 77 11 71" strokeWidth="0.8" />
        <path d="M50 18 C 58 14 64 17 66 24 C 67 29 63 33 59 31 C 56 29.5 57 25 61 26" strokeWidth="0.9" />
        <circle cx="50" cy="18" r="2.1" fill={color} stroke="none" opacity={opacity} />
        <circle cx="61" cy="26" r="1.3" fill={c2} stroke="none" opacity={opacity * 0.8} />
      </g>
    </svg>
  );
}

// leaf-rule divider (a hairline broken by one veined leaf-eye)
export function LeafDivider({ color = T.gold, my = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: `${my}px 0` }}>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
      <svg width="30" height="16" viewBox="0 0 30 16" fill="none" stroke={color} strokeWidth="1.1" aria-hidden opacity="0.8">
        <path d="M3 8 C 9 1 21 1 27 8 C 21 15 9 15 3 8 Z" /><path d="M3 8 H 27" strokeWidth="0.8" />
        <path d="M9 5 L 11 8 M14 4 L 15 8 M19 5 L 18 8 M23 6 L 21 8" strokeWidth="0.55" opacity="0.8" />
      </svg>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}

// sprig divider — a fading stem with alternating leaves
export function SprigDivider({ color = T.gold, w = 240, my = 22 }) {
  const u = `sf${String(color).replace("#", "")}`;
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: `${my}px 0` }}>
      <svg width={w} height="26" viewBox="0 0 240 26" aria-hidden fill="none" stroke={color} strokeLinecap="round">
        <defs>
          <linearGradient id={u} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" /><stop offset="22%" stopColor={color} stopOpacity="0.55" /><stop offset="50%" stopColor={color} stopOpacity="0.7" /><stop offset="78%" stopColor={color} stopOpacity="0.55" /><stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M8 13 H 232" stroke={`url(#${u})`} strokeWidth="1" />
        <g stroke={color} strokeWidth="0.9" opacity="0.7">
          <path d="M120 13 C 116 7 116 2 120 -1" transform="translate(0 2)" />
          <path d="M120 13 C 113 12 108 9 105 4 C 111 4 117 8 120 13 Z" />
          <path d="M120 13 C 127 12 132 9 135 4 C 129 4 123 8 120 13 Z" />
          <path d="M101 13 C 96 13 92 11 90 7 C 95 7 99 9 101 13 Z" opacity="0.6" />
          <path d="M139 13 C 144 13 148 11 150 7 C 145 7 141 9 139 13 Z" opacity="0.6" />
          <circle cx="120" cy="3" r="1.6" fill={color} stroke="none" />
        </g>
      </svg>
    </div>
  );
}

// fleuron divider — a quatrefoil ornament between two short rules (chapter-grade break)
export function FleuronDivider({ color = T.gold, w = 200, my = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: `${my}px 0` }}>
      <span style={{ width: w * 0.34, height: 1, background: color, opacity: 0.4 }} />
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.8">
        <path d="M11 11 C 11 5 14 2 18 3 C 17 7 14 10 11 11 Z" /><path d="M11 11 C 17 11 20 14 19 18 C 15 17 12 14 11 11 Z" />
        <path d="M11 11 C 11 17 8 20 4 19 C 5 15 8 12 11 11 Z" /><path d="M11 11 C 5 11 2 8 3 4 C 7 5 10 8 11 11 Z" />
        <circle cx="11" cy="11" r="1.3" fill={color} stroke="none" />
      </svg>
      <span style={{ width: w * 0.34, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}

// corner-treatment — sprig / carved / tendril (drawn for a corner; rotate for the others)
export function CornerSprig({ variant = "sprig", color = T.gold, size = 74, opacity = 0.7, corner = "tl", idx = 0 }) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[corner] || 0;
  const stroke = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", opacity };
  let body;
  if (variant === "tendril") {
    body = (
      <g {...stroke} strokeWidth="1.05">
        <path d="M5 5 C 24 9 40 24 48 46" />
        <path d="M48 46 C 52 56 62 58 66 50 C 69 44 64 38 58 40 C 53 41.5 53 48 58 48" />
        <path d="M22 8 C 28 6 33 9 34 15" strokeWidth="0.8" /><path d="M40 26 C 46 24 51 27 51 33" strokeWidth="0.8" />
        <circle cx="5" cy="5" r="1.5" fill={color} stroke="none" />
      </g>
    );
  } else if (variant === "carved") {
    body = (
      <g>
        <g fill="none" stroke="#FFFDF7" strokeWidth="1.1" strokeLinecap="round" opacity={Math.min(0.5, opacity)} transform="translate(0.7 0.7)"><path d="M8 64 L 8 8 L 64 8" /><path d="M14 64 L 14 14 L 64 14" /></g>
        <g fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity={opacity}>
          <path d="M8 64 L 8 8 L 64 8" /><path d="M14 64 L 14 14 L 64 14" />
          <path d="M14 14 C 24 16 30 22 31 32 C 22 31 16 24 14 14 Z" /><path d="M14 14 C 21 19 27 25 31 32" strokeWidth="0.55" />
          <circle cx="8" cy="8" r="1.7" fill={color} stroke="none" />
        </g>
      </g>
    );
  } else {
    body = (
      <g {...stroke} strokeWidth="1.1">
        <path d="M6 6 C 22 10 34 22 40 42 C 43 52 49 58 60 60" />
        <path d="M20 9 C 26 6 33 8 36 15 C 29 17 22 14 20 9 Z" /><path d="M20 9 C 27 11 32 13 36 15" strokeWidth="0.6" />
        <path d="M37 30 C 34 24 36 17 43 13 C 45 20 43 27 37 30 Z" /><path d="M37 30 C 38 24 40 19 43 14" strokeWidth="0.6" />
        <path d="M41 47 C 47 44 54 46 57 53 C 50 55 43 52 41 47 Z" />
        <circle cx="60" cy="60" r="2.4" fill={color} stroke="none" /><circle cx="6" cy="6" r="1.6" fill={color} stroke="none" />
      </g>
    );
  }
  return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden style={{ transform: `rotate(${rot}deg)`, display: "block" }}>{body}</svg>;
}

// a delicate single corner ornament positioned in a card corner (absolute; pass into a relative card)
export function CardCorner({ variant = "sprig", color = T.gold, size = 52, opacity = 0.5, corner = "tr" }) {
  const pos = { ...(corner.includes("t") ? { top: 0 } : { bottom: 0 }), ...(corner.includes("l") ? { left: 0 } : { right: 0 }) };
  return <div style={{ position: "absolute", pointerEvents: "none", zIndex: 0, ...pos }}><CornerSprig variant={variant} color={color} corner={corner} size={size} opacity={opacity} /></div>;
}

// ── CardFrame — the canonical "framed card" treatment (the Today bar): the §4.2 corner element in
// ALL FOUR corners, visible per the lush tone dial. Overlay it INSIDE a position:relative;
// overflow:hidden card (it doesn't impose a background, unlike BrandFrame). Set card content
// position:relative so it paints above the corners. Shared so every page frames cards identically.
export function CardFrame({ variant = "sprig", color = T.gold, opacity = 0.62, size = 50 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ── clampLines — safe-text style: wrap + N-line clamp so nothing bleeds off a card/page (the Today
// overflow fix). Spread into a text node's style: {...clampLines(2)}. ───────────────────────────────
export function clampLines(n = 2) {
  return { minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" };
}

// ── FLOWER GLYPH — colourway-parameterised species (BRAND_IDENTITY §5.2) ──────────────────────────
// ELEVATED 2026-06-19: softly-notched petals, a 4-stop radial + a lit sheen, a
// dimensional centre and a faint cast shadow — so the small meaning-blooms read
// crafted, not flat. Cheap (gradients + paths, no blur). 24 species.
const GLYPH_NP = (len, wid) => `M0 0 C ${-wid} ${-len * 0.30} ${-wid * 0.92} ${-len * 0.78} ${-wid * 0.40} ${-len * 0.92} C ${-wid * 0.15} ${-len} ${-wid * 0.05} ${-len} 0 ${-len * 0.93} C ${wid * 0.05} ${-len} ${wid * 0.15} ${-len} ${wid * 0.40} ${-len * 0.92} C ${wid * 0.92} ${-len * 0.78} ${wid} ${-len * 0.30} 0 0 Z`;
const GLYPH_POINT = (len, wid) => `M0 0 C ${-wid} ${-len * 0.36} ${-wid * 0.5} ${-len * 0.82} 0 ${-len} C ${wid * 0.5} ${-len * 0.82} ${wid} ${-len * 0.36} 0 0 Z`;
export const FLOWER_VARIANTS = [
  "camellia", "poppy", "sunflower", "dahlia", "lotus", "cornflower", "lavender", "rose", "iris",
  "primrose", "bluebell", "violet", "anemone", "ranunculus", "marigold", "chrysanthemum",
  "snowdrop", "tulip", "magnolia", "cosmos", "daffodil", "clover", "hellebore", "chamomile",
];
export function FlowerGlyph({ variant = "camellia", size = 52, color = T.crimson, color2 = null, accent = "#2E261B", idx = 0 }) {
  const gid = `fg-${variant}-${idx}`;
  const cx = 20, cy = 20;
  const hi = color2 || lighten(color, 0.42), lit = lighten(color, 0.24), dk = darken(color, 0.12), dkr = darken(color, 0.28);
  const fill = `url(#fgr-${gid})`;
  const grad = (
    <>
      <radialGradient id={`fgr-${gid}`} cx="42%" cy="34%" r="72%">
        <stop offset="0%" stopColor={lighten(hi, 0.12)} /><stop offset="38%" stopColor={hi} /><stop offset="74%" stopColor={color} /><stop offset="100%" stopColor={dk} />
      </radialGradient>
      <linearGradient id={`fgl-${gid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={hi} /><stop offset="55%" stopColor={color} /><stop offset="100%" stopColor={dk} />
      </linearGradient>
      <radialGradient id={`fgc-${gid}`} cx="42%" cy="38%" r="64%"><stop offset="0%" stopColor="#E9CF7A" /><stop offset="60%" stopColor="#C9A227" /><stop offset="100%" stopColor="#8A6D1C" /></radialGradient>
    </>
  );
  const lfill = `url(#fgl-${gid})`;
  const ctr = (r = 3, c) => <><circle cx={cx} cy={cy} r={r} fill={c || `url(#fgc-${gid})`} /><circle cx={cx - r * 0.4} cy={cy - r * 0.4} r={r * 0.4} fill="#FFF6D8" opacity="0.65" /></>;
  // generic petal ring of notched petals
  const petalRing = (count, len, wid, rot = 0, op = 0.95, f = lfill, pointed = false) => Array.from({ length: count }).map((_, i) =>
    <path key={`${rot}-${i}`} d={pointed ? GLYPH_POINT(len, wid) : GLYPH_NP(len, wid)} fill={f} opacity={op} stroke={dkr} strokeWidth="0.25" strokeOpacity="0.18" transform={`translate(${cx} ${cy}) rotate(${rot + i * (360 / count)})`} />);
  let body;
  if (variant === "poppy") {
    body = (<g>{petalRing(4, 15, 9, 18, 0.96)}{petalRing(4, 11, 7, 63, 0.9, fill)}<circle cx={cx} cy={cy} r="4" fill={dkr} />{Array.from({ length: 9 }).map((_, i) => { const a = i * 40 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 3} cy={cy + Math.sin(a) * 3} r="0.7" fill={darken(color, 0.5)} />; })}<circle cx={cx} cy={cy} r="1.8" fill={darken(color, 0.4)} /></g>);
  } else if (variant === "sunflower") {
    body = (<g>{petalRing(18, 15, 2.6, 0, 0.96, lfill, true)}{petalRing(18, 12.5, 2.4, 10, 0.9, fill, true)}<circle cx={cx} cy={cy} r="6.2" fill={`url(#fgc-${gid})`} />{Array.from({ length: 24 }).map((_, i) => { const a = i * GOLD_ANGLE * Math.PI / 180; const rr = 0.62 * Math.sqrt(i); if (rr > 5.4) return null; return <circle key={i} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="0.5" fill="#6E4F1C" opacity="0.9" />; })}</g>);
  } else if (variant === "dahlia") {
    body = (<g>{petalRing(12, 14, 3.4, 0, 0.92, lfill, true)}{petalRing(10, 10.5, 3, 18, 0.95, fill, true)}{petalRing(8, 7, 2.6, 9, 0.98, lfill, true)}{ctr(2.2, dkr)}</g>);
  } else if (variant === "chrysanthemum") {
    body = (<g>{petalRing(16, 15, 2.4, 0, 0.92, lfill, true)}{petalRing(14, 11.5, 2.2, 11, 0.95, fill, true)}{petalRing(11, 8, 2, 7, 0.98, lfill, true)}{ctr(2, dk)}</g>);
  } else if (variant === "ranunculus") {
    body = (<g>{petalRing(9, 12, 4.4, 0, 0.92)}{petalRing(8, 9, 3.8, 20, 0.95, fill)}{petalRing(7, 6, 3.2, 10, 0.98, lfill)}{petalRing(5, 3.6, 2.6, 16, 1, fill)}<circle cx={cx} cy={cy} r="1.6" fill={dkr} /></g>);
  } else if (variant === "marigold") {
    body = (<g>{petalRing(12, 13, 3.6, 0, 0.92)}{petalRing(11, 9.5, 3.2, 13, 0.95, fill)}{petalRing(9, 6.5, 2.8, 7, 0.98, lfill)}{ctr(2, dk)}</g>);
  } else if (variant === "anemone") {
    body = (<g>{petalRing(7, 14, 5.2, 0, 0.96)}<circle cx={cx} cy={cy} r="4.6" fill={dkr} />{Array.from({ length: 14 }).map((_, i) => { const a = i * (360 / 14) * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 4} cy={cy + Math.sin(a) * 4} r="0.7" fill={darken(color, 0.5)} />; })}<circle cx={cx} cy={cy} r="2" fill={darken(color, 0.42)} /></g>);
  } else if (variant === "cosmos") {
    body = (<g>{petalRing(8, 14, 4.6, 0, 0.96)}{ctr(3)}</g>);
  } else if (variant === "rose") {
    body = (<g>{petalRing(6, 13, 6, 0, 0.9)}{petalRing(5, 9, 5.2, 30, 0.95, fill)}{petalRing(5, 5.6, 4.2, 12, 0.99, lfill)}<path d="M20 20 C 17.6 19 16.8 16.4 18.4 14.6 C 20 13.6 21.6 15 21 16.8" fill="none" stroke={dkr} strokeWidth="0.7" opacity="0.6" /></g>);
  } else if (variant === "camellia") {
    body = (<g>{petalRing(6, 13, 5.6, 0, 0.9)}{petalRing(6, 9, 4.6, 30, 0.96, fill)}{petalRing(5, 5, 3.6, 14, 1, lfill)}{ctr(2.2)}</g>);
  } else if (variant === "tulip") {
    body = (<g><path d="M20 30 C 13 26 12 14 16 7 C 18 12 18 22 20 30 Z" fill={lfill} stroke={dkr} strokeWidth="0.3" strokeOpacity="0.2" /><path d="M20 30 C 27 26 28 14 24 7 C 22 12 22 22 20 30 Z" fill={lfill} stroke={dkr} strokeWidth="0.3" strokeOpacity="0.2" /><path d="M20 30 C 17 22 17 12 20 5 C 23 12 23 22 20 30 Z" fill={fill} /><path d="M20 30 C 20 33 20 35 20 37" stroke="#7E9A7E" strokeWidth="1.1" fill="none" strokeLinecap="round" /></g>);
  } else if (variant === "magnolia") {
    body = (<g>{petalRing(6, 15, 5.4, 0, 0.94)}{petalRing(3, 11, 4.6, 60, 0.97, fill)}{ctr(2.4, lighten("#C9A227", 0.1))}</g>);
  } else if (variant === "daffodil") {
    body = (<g>{petalRing(6, 13, 4.2, 0, 0.95, lfill, false)}<circle cx={cx} cy={cy} r="5" fill={`url(#fgc-${gid})`} /><circle cx={cx} cy={cy} r="5" fill="none" stroke={darken("#C9A227", 0.18)} strokeWidth="0.8" /><circle cx={cx} cy={cy} r="2.6" fill={lighten("#E9CF7A", 0.1)} /></g>);
  } else if (variant === "hellebore") {
    body = (<g>{petalRing(5, 13, 6, 0, 0.95)}<circle cx={cx} cy={cy} r="5" fill={lighten(color, 0.4)} />{Array.from({ length: 14 }).map((_, i) => { const a = i * (360 / 14) * Math.PI / 180; return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * 5.2} y2={cy + Math.sin(a) * 5.2} stroke="#C9A227" strokeWidth="0.5" opacity="0.8" />; })}<circle cx={cx} cy={cy} r="1.8" fill="#E9CF7A" /></g>);
  } else if (variant === "snowdrop") {
    body = (<g><path d="M20 5 C 20 11 20 14 20 17" stroke="#7E9A7E" strokeWidth="1.2" fill="none" strokeLinecap="round" /><path d="M20 14 C 24 14 26 16 25 18" stroke="#7E9A7E" strokeWidth="0.9" fill="none" opacity="0.8" /><g transform="translate(20 18)"><path d="M0 0 C -5 2 -5.6 11 -2 15 C -0.6 16.4 0.6 16.4 0.4 14 Z" fill={lfill} stroke={dk} strokeWidth="0.25" strokeOpacity="0.3" /><path d="M0 0 C 5 2 5.6 11 2 15 C 0.6 16.4 -0.6 16.4 -0.4 14 Z" fill={lfill} stroke={dk} strokeWidth="0.25" strokeOpacity="0.3" /><path d="M0 0 C -1.6 4 -1.6 12 0 15 C 1.6 12 1.6 4 0 0 Z" fill={hi} /></g></g>);
  } else if (variant === "clover") {
    body = (<g>{[[-6, -4], [6, -4], [0, 7]].map(([dx, dy], i) => <g key={i} transform={`translate(${cx + dx} ${cy + dy})`}><path d="M0 0 C -5 -2 -6 -7 -2 -9 C 0 -10 0 -7 0 -5 C 0 -7 0 -10 2 -9 C 6 -7 5 -2 0 0 Z" fill={lfill} stroke={dk} strokeWidth="0.25" strokeOpacity="0.25" /></g>)}<path d="M20 27 C 20 32 20 35 20 38" stroke="#7E9A7E" strokeWidth="1.1" fill="none" strokeLinecap="round" /><circle cx={cx} cy={cy} r="1.4" fill={lighten(color, 0.2)} /></g>);
  } else if (variant === "chamomile") {
    body = (<g>{petalRing(13, 13, 2.6, 0, 0.96, "url(#snowc-" + gid + ")")}<circle cx={cx} cy={cy} r="4.4" fill={`url(#fgc-${gid})`} /><circle cx={cx - 1.3} cy={cy - 1.3} r="1.4" fill="#FFF6D8" opacity="0.6" /></g>);
  } else if (variant === "cornflower") {
    body = (<g>{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M0 0 L -1.8 -9 L -0.6 -13 L 0.6 -13 L 1.8 -9 Z" fill={lfill} opacity="0.93" transform={`translate(${cx} ${cy}) rotate(${i * 30})`} />)}{petalRing(6, 7, 1.8, 30, 0.95, fill, true)}<circle cx={cx} cy={cy} r="2.4" fill={dkr} /></g>);
  } else if (variant === "lotus") {
    body = (<g>{petalRing(8, 15, 4.6, 0, 0.6, fill)}{petalRing(6, 12, 4.6, 24, 0.85, lfill)}{petalRing(5, 8.5, 4, 12, 0.97, fill)}<circle cx={cx} cy={cy - 2} r="2" fill={lighten("#C9A227", 0.1)} /></g>);
  } else if (variant === "lavender") {
    body = (<g><path d="M20 38 C 20 30 20 22 20 12" fill="none" stroke="#7E9A7E" strokeWidth="1.3" strokeLinecap="round" /><path d="M20 30 C 14 30 12 27 12 23 M20 26 C 26 26 28 23 28 19" stroke="#8FAF8F" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8" />{Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={20 + (i % 2 ? 2.6 : -2.6)} cy={5 + i * 1.6} rx="2.5" ry="3.1" fill={fill} opacity="0.95" />)}</g>);
  } else if (variant === "iris") {
    body = (<g>{[-20, 0, 20].map((a, i) => <path key={`u${i}`} d={GLYPH_NP(13, 3.6)} fill={lfill} opacity="0.92" transform={`translate(${cx} ${cy}) rotate(${a})`} />)}{[150, 180, 210].map((a, i) => <path key={`f${i}`} d="M0 0 C -3.6 5 -3 11 0 14 C 3 11 3.6 5 0 0 Z" fill={fill} opacity="0.96" transform={`translate(${cx} ${cy}) rotate(${a - 180})`} />)}<path d="M20 20 C 19 24 19 28 20 31" stroke="#E9CF7A" strokeWidth="1.4" fill="none" opacity="0.85" strokeLinecap="round" /></g>);
  } else if (variant === "primrose") {
    body = (<g>{Array.from({ length: 5 }).map((_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return <path key={i} d="M0 0 C -4.4 -2 -4.8 -7 0 -9.5 C 4.8 -7 4.4 -2 0 0 Z" fill={lfill} opacity="0.95" transform={`translate(${cx + Math.cos(a) * 7} ${cy + Math.sin(a) * 7}) rotate(${i * 72 + 180})`} />; })}<circle cx={cx} cy={cy} r="3.2" fill={`url(#fgc-${gid})`} /><circle cx={cx} cy={cy} r="1.3" fill={lighten("#E9CF7A", 0.1)} /></g>);
  } else if (variant === "bluebell") {
    body = (<g><path d="M20 4 C 19 12 20 18 20 22" stroke="#7E9A7E" strokeWidth="1.1" fill="none" strokeLinecap="round" />{[[13, 16, -22], [20, 22, 4], [27, 17, 24]].map(([x, y, r], i) => <g key={i} transform={`rotate(${r} ${x} ${y})`}><path d={`M${x} ${y - 7} C ${x - 4} ${y - 6} ${x - 4} ${y} ${x - 3} ${y + 3} C ${x - 1.5} ${y + 5} ${x + 1.5} ${y + 5} ${x + 3} ${y + 3} C ${x + 4} ${y} ${x + 4} ${y - 6} ${x} ${y - 7} Z`} fill={lfill} opacity="0.95" /></g>)}</g>);
  } else if (variant === "violet") {
    body = (<g>{[[-7, -5], [7, -5], [-8, 3], [8, 3]].map(([dx, dy], i) => <ellipse key={i} cx={cx + dx} cy={cy + dy} rx="5.2" ry="6" fill={fill} opacity="0.95" />)}<ellipse cx={cx} cy={cy + 8} rx="6.5" ry="7" fill={lfill} opacity="0.96" />{Array.from({ length: 5 }).map((_, i) => { const a = i * 30 + 75; return <line key={i} x1={cx} y1={cy + 1} x2={cx + Math.cos(a * Math.PI / 180) * 5} y2={cy + 1 + Math.sin(a * Math.PI / 180) * 5} stroke={dkr} strokeWidth="0.4" opacity="0.5" />; })}<circle cx={cx} cy={cy + 1} r="2.2" fill="#E9CF7A" /></g>);
  } else { // fallback → camellia-like
    body = (<g>{petalRing(6, 13, 5.6, 0, 0.9)}{petalRing(6, 9, 4.6, 30, 0.96, fill)}{ctr(2.4)}</g>);
  }
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <defs>{grad}<linearGradient id={`snowc-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor={lighten(color, 0.5)} /></linearGradient></defs>
      <ellipse cx={cx} cy="36" rx="9" ry="1.8" fill="#2E261B" opacity="0.12" />
      {body}
    </svg>
  );
}

// ── BUTTERFLY — transformation + return. Gentle drift + faint flutter (isolated, reduced-motion-safe).
export function Butterfly({ size = 46, color = "#8E6E8E", color2 = T.gold, pattern = "spots", animate = true, idx = 0 }) {
  const gid = `bf-${idx}`;
  let marks;
  if (pattern === "bands") marks = <g fill="none" stroke={color2} strokeWidth="2.2" strokeLinecap="round" opacity="0.8"><path d="M7 11 C 12 13 17 14 22 15" /><path d="M11 31 C 15 30 19 28 22 26" /></g>;
  else if (pattern === "eyes") marks = <g><circle cx="10" cy="13" r="2.6" fill={color2} opacity="0.9" /><circle cx="10" cy="13" r="1.1" fill={darken(color, 0.3)} /><circle cx="14" cy="30" r="2" fill={color2} opacity="0.8" /><circle cx="14" cy="30" r="0.9" fill={darken(color, 0.3)} /></g>;
  else marks = <g><circle cx="9" cy="13" r="1.6" fill="#FFFDF7" opacity="0.6" /><circle cx="13" cy="11" r="1" fill={color2} opacity="0.7" /><circle cx="15" cy="30" r="1.2" fill={color2} opacity="0.7" /></g>;
  const wingL = (<g><path d="M24 15 C 17 6 5 5 3 13 C 2 19 11 22 24 20 Z" fill={`url(#bw-${gid})`} /><path d="M24 21 C 15 22 8 28 12 34 C 16 38 23 31 24 24 Z" fill={`url(#bw2-${gid})`} />{marks}</g>);
  return (
    <svg viewBox="0 0 48 42" width={size} height={Math.round(size * 0.88)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 7s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.9}s` } : undefined}>
      <defs>
        <linearGradient id={`bw-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lighten(color, 0.28)} /><stop offset="100%" stopColor={color} /></linearGradient>
        <linearGradient id={`bw2-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={darken(color, 0.12)} /></linearGradient>
      </defs>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "right center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : undefined}>{wingL}</g>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "left center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : undefined} transform="translate(48 0) scale(-1 1)">{wingL}</g>
      <path d="M24 11 C 22.8 19 22.8 28 24 34 C 25.2 28 25.2 19 24 11 Z" fill="#2E261B" /><circle cx="24" cy="11" r="1.6" fill="#2E261B" />
      <path d="M24 10 C 22 6 20 4 18 3" stroke="#2E261B" strokeWidth="0.7" fill="none" strokeLinecap="round" /><path d="M24 10 C 26 6 28 4 30 3" stroke="#2E261B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── BEE — community, the sacred feminine, pollination = connection (§6.3). Drifts gently.
export function Bee({ size = 40, color = "#D4AF37", animate = true, idx = 0 }) {
  const gid = `bee-${idx}`;
  return (
    <svg viewBox="0 0 48 36" width={size} height={Math.round(size * 0.75)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 7s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.8}s` } : undefined}>
      <defs>
        <linearGradient id={`bb-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lighten(color, 0.3)} /><stop offset="100%" stopColor={darken(color, 0.08)} /></linearGradient>
        <radialGradient id={`bw-${gid}`} cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" /><stop offset="100%" stopColor="#DCE6EE" stopOpacity="0.35" /></radialGradient>
      </defs>
      {/* wings */}
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "24px 14px", animation: "fwcFlutter 0.5s ease-in-out infinite" } : undefined}>
        <ellipse cx="20" cy="12" rx="8" ry="5" fill={`url(#bw-${gid})`} stroke="#C7D2DC" strokeWidth="0.4" transform="rotate(-22 20 12)" />
        <ellipse cx="28" cy="12" rx="8" ry="5" fill={`url(#bw-${gid})`} stroke="#C7D2DC" strokeWidth="0.4" transform="rotate(22 28 12)" />
      </g>
      {/* body */}
      <ellipse cx="24" cy="22" rx="11" ry="8" fill={`url(#bb-${gid})`} />
      <path d="M19 15 C 21 28 27 28 29 15" fill="none" stroke="#2E261B" strokeWidth="2.1" opacity="0.9" />
      <path d="M15 19 C 18 26 30 26 33 19" fill="none" stroke="#2E261B" strokeWidth="2.1" opacity="0.9" />
      <circle cx="35.5" cy="20" r="3.4" fill="#2E261B" />
      <path d="M36 17 C 38 14 39 13 41 12 M37 18 C 39 16 41 15 43 14" stroke="#2E261B" strokeWidth="0.6" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="19" rx="3" ry="2" fill="#FFFFFF" opacity="0.18" />
    </svg>
  );
}

// ── DRAGONFLY — insight, "seeing through", change (§6.3). For Pulse / patterns.
export function Dragonfly({ size = 48, color = "#8E6E8E", color2 = T.gold, animate = true, idx = 0 }) {
  const gid = `df-${idx}`;
  const wing = (rot, len) => <ellipse cx="0" cy="0" rx={len} ry="3.4" fill={`url(#dw-${gid})`} stroke={color} strokeWidth="0.4" strokeOpacity="0.4" transform={`rotate(${rot})`} />;
  return (
    <svg viewBox="0 0 56 40" width={size} height={Math.round(size * 0.72)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 8s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.7}s` } : undefined}>
      <defs>
        <linearGradient id={`db-${gid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={lighten(color, 0.2)} /><stop offset="100%" stopColor={darken(color, 0.14)} /></linearGradient>
        <radialGradient id={`dw-${gid}`} cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor={lighten(color2, 0.4)} stopOpacity="0.5" /><stop offset="100%" stopColor={color2} stopOpacity="0.16" /></radialGradient>
      </defs>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "20px 16px", animation: "fwcFlutter 0.45s ease-in-out infinite" } : undefined}>
        <g transform="translate(20 15)">{wing(-24, 13)}{wing(24, 13)}</g>
        <g transform="translate(20 19)">{wing(-156, 12)}{wing(156, 12)}</g>
      </g>
      {/* long abdomen */}
      <rect x="19" y="15.5" width="33" height="3" rx="1.5" fill={`url(#db-${gid})`} transform="rotate(4 19 17)" />
      {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={26 + i * 5} y1="15" x2={26 + i * 5} y2="19.5" stroke={darken(color, 0.2)} strokeWidth="0.5" opacity="0.5" transform="rotate(4 19 17)" />)}
      <circle cx="16" cy="16" r="4" fill={darken(color, 0.1)} />
      <circle cx="14.5" cy="14.8" r="1.3" fill={lighten(color2, 0.3)} opacity="0.8" />
    </svg>
  );
}

// ── MOTH (luna) — transformation through darkness; night/rest (§6.3). For Journal / menstrual.
export function Moth({ size = 46, color = "#8FAF8F", color2 = T.gold, animate = true, idx = 0 }) {
  const gid = `mo-${idx}`;
  const wingL = (
    <g>
      <path d="M24 17 C 14 8 3 9 4 17 C 5 24 15 24 24 21 Z" fill={`url(#mw-${gid})`} stroke={darken(color, 0.12)} strokeWidth="0.4" strokeOpacity="0.4" />
      <path d="M24 21 C 16 23 9 27 12 33 C 15 38 22 33 24 25 Z" fill={`url(#mw2-${gid})`} stroke={darken(color, 0.12)} strokeWidth="0.4" strokeOpacity="0.4" />
      <circle cx="12" cy="16" r="1.8" fill={color2} opacity="0.6" /><circle cx="15" cy="29" r="1.3" fill={color2} opacity="0.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 48 44" width={size} height={Math.round(size * 0.92)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 9s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.9}s` } : undefined}>
      <defs>
        <linearGradient id={`mw-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lighten(color, 0.3)} /><stop offset="100%" stopColor={color} /></linearGradient>
        <linearGradient id={`mw2-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={darken(color, 0.14)} /></linearGradient>
      </defs>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "right center", animation: "fwcFlutter 1.1s ease-in-out infinite" } : undefined}>{wingL}</g>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "left center", animation: "fwcFlutter 1.1s ease-in-out infinite" } : undefined} transform="translate(48 0) scale(-1 1)">{wingL}</g>
      <ellipse cx="24" cy="22" rx="2.4" ry="9" fill="#3A2C1A" />
      <path d="M24 13 C 21 9 18 7 15 7 M24 13 C 27 9 30 7 33 7" stroke="#3A2C1A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M21 11 L 16 8 M21 12 L 16 10 M27 11 L 32 8 M27 12 L 32 10" stroke="#3A2C1A" strokeWidth="0.5" opacity="0.7" strokeLinecap="round" />
    </svg>
  );
}

// ── LADYBIRD — luck, protection, grace (§6.3). For Nutrition / kitchen-garden.
export function Ladybird({ size = 30, color = T.crimson, animate = true, idx = 0 }) {
  const gid = `lb-${idx}`;
  return (
    <svg viewBox="0 0 32 30" width={size} height={Math.round(size * 0.94)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 8s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.8}s` } : undefined}>
      <defs><radialGradient id={`lg-${gid}`} cx="40%" cy="30%" r="75%"><stop offset="0%" stopColor={lighten(color, 0.32)} /><stop offset="70%" stopColor={color} /><stop offset="100%" stopColor={darken(color, 0.16)} /></radialGradient></defs>
      <ellipse cx="16" cy="20" rx="11" ry="9.5" fill={`url(#lg-${gid})`} />
      <path d="M16 11 C 16 18 16 26 16 29" stroke="#2E261B" strokeWidth="1.1" opacity="0.85" />
      <path d="M16 11 C 11 11 7.5 13 6 16.5 C 8 13.5 12 11.6 16 11.5 Z" fill="#2E261B" />
      <circle cx="10.5" cy="16.5" r="1.7" fill="#2E261B" /><circle cx="21.5" cy="16.5" r="1.7" fill="#2E261B" />
      <circle cx="9" cy="23" r="1.5" fill="#2E261B" /><circle cx="23" cy="23" r="1.5" fill="#2E261B" />
      <circle cx="16" cy="25.5" r="1.4" fill="#2E261B" />
      <ellipse cx="16" cy="8.5" rx="4.4" ry="3.6" fill="#2E261B" />
      <circle cx="14.5" cy="7.8" r="0.9" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="12" cy="15" rx="3" ry="2" fill="#FFFFFF" opacity="0.18" transform="rotate(-20 12 15)" />
    </svg>
  );
}

// Pollinator picker — one component, choose the §8 page-character creature by name.
export function Pollinator({ kind = "butterfly", ...rest }) {
  if (kind === "bee") return <Bee {...rest} />;
  if (kind === "dragonfly") return <Dragonfly {...rest} />;
  if (kind === "moth") return <Moth {...rest} />;
  if (kind === "ladybird") return <Ladybird {...rest} />;
  return <Butterfly {...rest} />;
}

// a feature card framed with four delicate corner sprigs
export function BrandFrame({ children, color = T.gold, variant = "sprig", opacity = 0.55, size = 58, style }) {
  return (
    <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 20, padding: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)", ...style }}>
      {["tl", "tr", "br", "bl"].map((c) => (
        <div key={c} style={{ position: "absolute", pointerEvents: "none", ...(c.includes("t") ? { top: 3 } : { bottom: 3 }), ...(c.includes("l") ? { left: 3 } : { right: 3 }) }}>
          <CornerSprig variant={variant} color={color} corner={c} size={size} opacity={opacity} />
        </div>
      ))}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
