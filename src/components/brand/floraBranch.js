// ─────────────────────────────────────────────────────────────────────────────
// floraBranch.js — the BLOSSOMING-BRANCH foliage system for the canonical flora
// hero (BRAND_IDENTITY §6.8 / FwFloraHero). Halli approved the branch direction
// and asked for a constantly-changing MIX → this exports the 6 branch framings
// (foliage as static SVG strings) + bloom PLACEMENTS. The hero (PageTop.jsx)
// renders the REAL RichBloomV2 at each placement so the page's species / mood
// tint / openness (tap-to-rebloom) are preserved in every variant.
//
// Foliage is green (sage) and independent of the bloom's colourway — only the
// bloom retints with the mood. No dashed ring. A grass bed grounds every one.
// Stage coordinate space: 300 × 290 (viewBox + the bloom-div px positions match).
// ─────────────────────────────────────────────────────────────────────────────

// gradient defs shared by all foliage layers (leaf tones · stem · bark · grass · ground shadow)
export const BRANCH_DEFS = `<defs>
  <linearGradient id="fbLf" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#B4D0B4"/><stop offset="52%" stop-color="#82A282"/><stop offset="100%" stop-color="#5A785A"/></linearGradient>
  <linearGradient id="fbLf2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9BBE9B"/><stop offset="100%" stop-color="#4F6E4F"/></linearGradient>
  <linearGradient id="fbLfBk" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#AEC6AE"/><stop offset="100%" stop-color="#7C9A7C"/></linearGradient>
  <linearGradient id="fbStm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8FAF8F"/><stop offset="100%" stop-color="#5F7E5F"/></linearGradient>
  <linearGradient id="fbBark" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9C8666"/><stop offset="100%" stop-color="#6E5C43"/></linearGradient>
  <linearGradient id="fbGr" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#6E8F63"/><stop offset="60%" stop-color="#8AAE7E"/><stop offset="100%" stop-color="#A6C58F"/></linearGradient>
  <linearGradient id="fbGrBk" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#5F7E5A"/><stop offset="100%" stop-color="#83A277"/></linearGradient>
  <radialGradient id="fbShd" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2E261B" stop-opacity="0.16"/><stop offset="100%" stop-color="#2E261B" stop-opacity="0"/></radialGradient>
</defs>`;

// ── builders (return SVG string fragments) ──
function leaf(x, y, L, W, ang, g = "fbLf", op = 1) {
  const d = `M0 0 C ${W} ${-L * 0.28} ${W * 0.5} ${-L * 0.82} 0 ${-L} C ${-W * 0.5} ${-L * 0.82} ${-W} ${-L * 0.28} 0 0 Z`;
  const vein = `M0 -2 C ${W * 0.12} ${-L * 0.45} ${W * 0.05} ${-L * 0.7} 0 ${-L * 0.92}`;
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="${d}" fill="url(#${g})" opacity="${op}" stroke="#4F6E4F" stroke-width="0.5" stroke-opacity="0.25"/><path d="${vein}" fill="none" stroke="#4F6E4F" stroke-width="0.6" stroke-opacity="0.35"/></g>`;
}
function branch(pts, w = 7) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [px, py] = pts[i - 1], [x, y] = pts[i]; d += ` Q ${(px + x) / 2 + 4} ${(py + y) / 2} ${x} ${y}`; }
  return `<path d="${d}" fill="none" stroke="url(#fbBark)" stroke-width="${w}" stroke-linecap="round"/>`;
}
function bud(x, y, ang = 0, c = "#E8B4B8") {
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0 L0 -7" stroke="url(#fbStm)" stroke-width="1.6" stroke-linecap="round"/><path d="M0 -7 C -3.4 -8 -3.6 -13 0 -15 C 3.6 -13 3.4 -8 0 -7 Z" fill="${c}" stroke="#C98A90" stroke-width="0.5" stroke-opacity="0.5"/><path d="M0 -7 C -1.6 -9 -1.6 -12 0 -14" stroke="#fff" stroke-width="0.5" stroke-opacity="0.5" fill="none"/><path d="M0 -7 C -2.6 -6 -4 -8 -3.4 -10 M0 -7 C 2.6 -6 4 -8 3.4 -10" stroke="#6F8F6F" stroke-width="1" fill="none" stroke-linecap="round"/></g>`;
}
function cluster(x, y, n, L, W, baseAng, spread, g = "fbLf") {
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const a = baseAng - spread / 2 + spread * t;
    const l = L * (0.78 + 0.28 * Math.sin(i * 1.3 + 1));
    s += leaf(x, y, l, W, a, i % 2 ? g : "fbLf2", 0.96);
  }
  return s;
}
function blade(x, y, h, lean, g = "fbGr", bw = 1.7) {
  const tipx = x + lean, tipy = y - h, cx = x + lean * 0.35, cy = y - h * 0.58;
  return `<path d="M${(x - bw).toFixed(1)} ${y} Q ${(cx - bw * 0.4).toFixed(1)} ${cy.toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)} Q ${(cx + bw * 0.4).toFixed(1)} ${cy.toFixed(1)} ${(x + bw).toFixed(1)} ${y} Z" fill="url(#${g})"/>`;
}
function grass(cx, y, w, n, h = 26) {
  let back = "", front = "";
  const shadow = `<ellipse cx="${cx}" cy="${y + 2}" rx="${w * 0.6}" ry="8" fill="url(#fbShd)"/>`;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = cx - w / 2 + w * t, off = (x - cx) / (w / 2);
    const lean = off * (10 + 6 * Math.abs(off)) + (i % 2 ? 3 : -3);
    const hh = h * (0.62 + 0.42 * Math.abs(Math.sin(i * 1.7))) * (1 - 0.18 * Math.abs(off));
    const isBack = i % 3 === 0;
    const s = blade(x, y, hh * (isBack ? 1.08 : 1), lean, isBack ? "fbGrBk" : "fbGr", isBack ? 1.5 : 1.8);
    if (isBack) back += s; else front += s;
  }
  return shadow + back + front;
}
function petals(x, y, n = 3, c = "#EAC0C4") {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = i * 137, r = 6 + i * 5;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.5;
    s += `<path d="M${px} ${py} q 4 -3 7 0 q -3 3 -7 0 Z" fill="${c}" opacity="${0.5 - i * 0.08}"/>`;
  }
  return s;
}

// ── the 6 branch variants ── (foliage strings + bloom placements + creature)
// blooms: { left, top, scale, rot, role } — role "main" uses the hero's openness
// prop (tap-to-rebloom); "full"/"mid"/"bud" are decorative companions (fixed openness).
export const ROLE_OPEN = { main: null, full: 1, mid: 0.68, bud: 0.34 };

export const BRANCH_VARIANTS = [
  { // 1 — Bough in bloom (dense cluster + grass at the rooted foot)
    key: "bough",
    back: cluster(150, 150, 5, 30, 11, -40, 150, "fbLfBk"),
    backStyle: "opacity:.7",
    main: branch([[26, 250], [92, 214], [150, 150], [214, 110], [276, 80]], 8)
      + cluster(92, 214, 4, 26, 10, 60, 120) + cluster(214, 110, 4, 26, 10, -30, 120) + cluster(150, 150, 4, 24, 9, 150, 110)
      + leaf(250, 92, 24, 10, 58, "fbLf2") + leaf(60, 232, 22, 9, -118, "fbLf")
      + bud(238, 96, 44) + bud(70, 224, -58) + bud(180, 120, 20)
      + grass(60, 252, 64, 11, 24) + petals(120, 236, 3),
    front: leaf(150, 150, 28, 11, 150, "fbLf"),
    blooms: [{ left: 150, top: 108, scale: 0.98, rot: 0, role: "main" }, { left: 112, top: 150, scale: 0.62, rot: 0, role: "mid" }, { left: 196, top: 132, scale: 0.6, rot: 8, role: "bud" }],
    creature: { left: 214, top: 66, scale: 1 },
  },
  { // 2 — Arching garland (grounded on a grass bed)
    key: "arch",
    main: branch([[30, 258], [64, 150], [150, 84], [236, 150], [270, 258]], 7)
      + cluster(64, 150, 4, 24, 9, 190, 130) + cluster(236, 150, 4, 24, 9, -10, 130)
      + leaf(150, 90, 26, 11, 110, "fbLf") + leaf(150, 90, 26, 11, 70, "fbLf2")
      + bud(92, 120, -30) + bud(208, 120, 30)
      + leaf(58, 178, 22, 9, 150, "fbLf2") + leaf(242, 178, 22, 9, 30, "fbLf")
      + grass(150, 260, 120, 15, 26) + grass(38, 260, 40, 7, 20) + grass(262, 260, 40, 7, 20) + petals(150, 244, 4),
    blooms: [{ left: 150, top: 94, scale: 0.9, rot: 0, role: "main" }, { left: 82, top: 132, scale: 0.56, rot: -12, role: "mid" }, { left: 218, top: 132, scale: 0.56, rot: 12, role: "bud" }],
    creature: { left: 150, top: 50, scale: 0.95 },
  },
  { // 3 — Grounded branch (upright, rising from a full grass bed)
    key: "grounded",
    back: cluster(150, 150, 5, 28, 11, -90, 130, "fbLfBk"),
    backStyle: "opacity:.65",
    main: branch([[150, 262], [146, 196], [158, 140], [150, 96]], 8) + branch([[150, 150], [196, 120]], 5) + branch([[150, 180], [112, 152]], 5)
      + cluster(150, 150, 4, 26, 10, 20, 120) + cluster(150, 180, 4, 26, 10, 200, 120)
      + leaf(150, 120, 26, 11, 40, "fbLf2") + leaf(150, 120, 26, 11, -40, "fbLf")
      + bud(200, 116, 30) + bud(108, 148, -30) + bud(150, 104, 0)
      + grass(150, 262, 140, 18, 30) + petals(120, 246, 3) + petals(190, 250, 2),
    blooms: [{ left: 196, top: 116, scale: 0.6, rot: 12, role: "mid" }, { left: 112, top: 150, scale: 0.6, rot: -12, role: "bud" }, { left: 150, top: 110, scale: 0.94, rot: 0, role: "main" }],
    creature: { left: 206, top: 86, scale: 0.9 },
  },
  { // 4 — Layered depth (soft back bough behind a crisp front branch)
    key: "depth",
    back: branch([[40, 120], [130, 150], [210, 120], [280, 150]], 6) + cluster(130, 150, 5, 26, 10, -40, 150, "fbLfBk") + cluster(210, 120, 5, 26, 10, -40, 150, "fbLfBk") + bud(70, 132, -20) + bud(250, 132, 20),
    backStyle: "opacity:.5;filter:blur(0.6px)",
    main: branch([[24, 250], [96, 206], [164, 150], [236, 120], [284, 102]], 8)
      + cluster(96, 206, 4, 26, 10, 55, 120) + cluster(164, 150, 4, 26, 10, -25, 120)
      + leaf(236, 110, 24, 10, 56, "fbLf2") + bud(214, 110, 40) + bud(72, 222, -56)
      + grass(64, 252, 68, 12, 24) + petals(130, 236, 3),
    blooms: [{ left: 164, top: 108, scale: 0.94, rot: 0, role: "main" }, { left: 236, top: 142, scale: 0.5, rot: 10, role: "mid" }],
    creature: { left: 206, top: 74, scale: 0.95 },
  },
  { // 5 — Blossom spray (many smaller blooms + buds + a butterfly)
    key: "spray",
    main: branch([[22, 244], [88, 214], [150, 168], [214, 120], [278, 84]], 7) + branch([[150, 168], [176, 130]], 4) + branch([[88, 214], [70, 176]], 4)
      + cluster(120, 190, 3, 18, 7, 40, 110) + cluster(190, 140, 3, 18, 7, -20, 110) + cluster(70, 176, 3, 16, 6, 120, 100)
      + bud(96, 196, -40) + bud(176, 128, 20) + bud(240, 100, 44) + bud(140, 176, 10) + bud(206, 124, 30)
      + leaf(258, 92, 20, 8, 54, "fbLf2") + leaf(52, 228, 18, 7, -120, "fbLf")
      + grass(72, 246, 70, 12, 24) + petals(150, 232, 4),
    blooms: [{ left: 150, top: 150, scale: 0.7, rot: 0, role: "main" }, { left: 100, top: 186, scale: 0.46, rot: -14, role: "mid" }, { left: 206, top: 120, scale: 0.5, rot: 14, role: "bud" }, { left: 246, top: 92, scale: 0.36, rot: 26, role: "mid" }],
    creature: { left: 214, top: 64, scale: 0.95 },
    bfly: { left: 70, top: 120, scale: 0.85 },
  },
  { // 6 — Lush bough (the fullest: a larger main bloom + dense back foliage)
    key: "lush",
    back: cluster(150, 150, 5, 30, 12, -40, 150, "fbLfBk"),
    backStyle: "opacity:.7",
    main: branch([[26, 250], [94, 212], [158, 150], [224, 112], [280, 86]], 8)
      + cluster(94, 212, 4, 28, 11, 58, 120) + cluster(158, 150, 4, 26, 10, -28, 120)
      + leaf(252, 96, 26, 11, 58, "fbLf2") + bud(226, 100, 42) + bud(74, 222, -56) + bud(190, 124, 22)
      + grass(66, 252, 66, 11, 24) + petals(126, 236, 3),
    front: leaf(158, 148, 28, 11, 150, "fbLf"),
    blooms: [{ left: 158, top: 106, scale: 1.06, rot: 0, role: "main" }, { left: 112, top: 152, scale: 0.6, rot: 8, role: "bud" }],
    creature: { left: 220, top: 66, scale: 1 },
  },
];

// Rotation: a per-mount advance seeded by the day-of-year, so the hero's framing
// CHANGES on each page view ("constantly changing") yet is stable while mounted
// (no mid-session flicker) and drifts across days. Deterministic, never random.
let _seq = 0;
export function pickBranchVariant(offset = 0) {
  let day = 0;
  try { day = Math.floor(Date.now() / 86400000); } catch { /* SSR guard */ }
  const i = (((day + offset + _seq) % BRANCH_VARIANTS.length) + BRANCH_VARIANTS.length) % BRANCH_VARIANTS.length;
  _seq += 1;
  return i;
}
