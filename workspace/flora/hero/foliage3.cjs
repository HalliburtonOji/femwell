// Realistic branch/leaf builders for the flora-hero REALISM pass.
// The old branch was a uniform stroked line (a flat stick). Here the bough is a
// FILLED, TAPERED, curved shape (thick root → thin tip) with bark shading, knots
// at nodes, and leaves on real petioles. Stage viewBox 300 × 300.

const DEFS = `<defs>
  <linearGradient id="bk3" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0%" stop-color="#B39A73"/><stop offset="42%" stop-color="#8A7150"/><stop offset="100%" stop-color="#5A4632"/></linearGradient>
  <linearGradient id="bk3d" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0%" stop-color="#9C855F"/><stop offset="100%" stop-color="#4E3D2A"/></linearGradient>
  <linearGradient id="lf3" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0%" stop-color="#B7D2A9"/><stop offset="48%" stop-color="#83A876"/><stop offset="100%" stop-color="#557A4C"/></linearGradient>
  <linearGradient id="lf3b" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0%" stop-color="#A6C69A"/><stop offset="100%" stop-color="#47693F"/></linearGradient>
  <linearGradient id="lf3d" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0%" stop-color="#9BBF93"/><stop offset="100%" stop-color="#3F5E39"/></linearGradient>
  <linearGradient id="gr3" x1="0" y1="1" x2="0.15" y2="0"><stop offset="0%" stop-color="#5E7E52"/><stop offset="55%" stop-color="#82A874"/><stop offset="100%" stop-color="#A7C78F"/></linearGradient>
  <linearGradient id="gr3b" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#516E48"/><stop offset="100%" stop-color="#789A69"/></linearGradient>
  <radialGradient id="shd3" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2E261B" stop-opacity="0.18"/><stop offset="100%" stop-color="#2E261B" stop-opacity="0"/></radialGradient>
</defs>`;

// Catmull-Rom sample through control points → smooth centerline
function spline(pts, per = 22) {
  const P = [pts[0], ...pts, pts[pts.length - 1]], res = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      res.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  res.push(pts[pts.length - 1]);
  return res;
}
// point + tangent-normal at parameter along a sampled centerline
function atT(C, t) {
  const n = C.length, f = Math.max(0, Math.min(n - 2, Math.floor(t * (n - 1))));
  const a = C[f], b = C[f + 1];
  let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  const lt = t * (n - 1) - f;
  return { x: a[0] + (b[0] - a[0]) * lt, y: a[1] + (b[1] - a[1]) * lt, nx: -dy, ny: dx };
}

// TAPERED, FILLED branch through control points. wBase→wTip widths, knots swell it.
function branch(pts, wBase, wTip, { grad = "bk3", knots = [], per = 22, grain = true } = {}) {
  const C = spline(pts, per), n = C.length, left = [], right = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const nx = -dy, ny = dx;
    let w = (wBase + (wTip - wBase) * Math.pow(t, 0.85)) / 2;
    for (const k of knots) { const d = Math.abs(t - k); if (d < 0.06) w *= 1 + 0.55 * (1 - d / 0.06); }
    left.push([C[i][0] + nx * w, C[i][1] + ny * w]);
    right.push([C[i][0] - nx * w, C[i][1] - ny * w]);
  }
  const fmt = (p) => p[0].toFixed(1) + " " + p[1].toFixed(1);
  const outline = "M" + left.map(fmt).join(" L ") + " L " + right.slice().reverse().map(fmt).join(" L ") + " Z";
  // shaded underside (the darker, lower-right edge)
  const under = "M" + C.map((p, i) => { const t = i / (n - 1); const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; let w = (wBase + (wTip - wBase) * Math.pow(t, 0.85)) / 2; return (p[0] - (-dy / L) * w * 0.34).toFixed(1) + " " + (p[1] - (dx / L) * w * 0.34).toFixed(1); }).join(" L ");
  let grainP = "";
  if (grain) grainP = `<path d="${"M" + C.filter((_, i) => i % 2 === 0).map(fmt).join(" L ")}" fill="none" stroke="#4E3D2A" stroke-width="0.5" stroke-opacity="0.25"/>`;
  return `<path d="${outline}" fill="url(#${grad})" stroke="#4E3D2A" stroke-width="0.5" stroke-opacity="0.4"/>`
    + `<path d="${under} L ${right.slice().reverse().map(fmt).join(" L ")} Z" fill="#4E3D2A" fill-opacity="0.16"/>`
    + grainP;
}
// a small twig knot (where a side branch or leaf springs)
function knot(x, y, r = 2.4) { return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#6E5A40" opacity="0.5"/>`; }

// a REALISTIC leaf: a full ovate blade (rounded base → pointed tip), a curved
// midrib and SHORT internal lateral veins (kept inside the blade — no whiskers),
// on a short petiole springing from (bx,by) toward `ang`. side sets which way the
// asymmetric belly + droop go. L = blade length, W = blade width.
function leaf(bx, by, L, W, ang, g = "lf3", side = 1, petiole = 5) {
  const rad = ang * Math.PI / 180, ux = Math.cos(rad), uy = Math.sin(rad);
  const px = bx + ux * petiole, py = by + uy * petiole;      // blade base (top of petiole)
  const vx = -uy, vy = ux;                                   // perpendicular (unit)
  const hw = W / 2;
  const P = (p) => p[0].toFixed(1) + " " + p[1].toFixed(1);
  const at = (a, off) => [px + ux * L * a + vx * off, py + uy * L * a + vy * off];
  const tip = [px + ux * L, py + uy * L];
  // ovate outline: base(0) → belly(0.45, ±full width, one side fuller) → tip(1)
  const c = 0.11 * side; // gentle asymmetric curl
  const blade = `M${P([px, py])}`
    + ` C ${P(at(0.06, hw * 0.5))} ${P(at(0.34, hw * (1 + c)))} ${P(at(0.55, hw * (0.94 + c)))}`
    + ` C ${P(at(0.8, hw * 0.6))} ${P(at(0.95, hw * 0.22))} ${P(tip)}`
    + ` C ${P(at(0.95, -hw * 0.22))} ${P(at(0.8, -hw * 0.6))} ${P(at(0.55, -hw * (0.94 - c)))}`
    + ` C ${P(at(0.34, -hw * (1 - c)))} ${P(at(0.06, -hw * 0.5))} ${P([px, py])} Z`;
  const petioleP = `<path d="M${P([bx, by])} Q ${P([bx + ux * petiole * 0.55 + vx * side * 0.8, by + uy * petiole * 0.55 + vy * side * 0.8])} ${P([px, py])}" fill="none" stroke="#6E7E52" stroke-width="1.2" stroke-linecap="round"/>`;
  const mid = `<path d="M${P([px, py])} Q ${P(at(0.52, hw * 0.06 * side))} ${P(tip)}" fill="none" stroke="#3F5E39" stroke-width="0.7" stroke-opacity="0.45"/>`;
  let veins = "";
  for (const tt of [0.3, 0.52, 0.72]) {
    const reach = hw * (1 - tt) * 0.72;                      // shrinks toward tip → stays inside
    const m = at(tt, 0), fwd = 0.09 * L;
    veins += `<path d="M${P(m)} Q ${P([m[0] + vx * reach * 0.6 + ux * fwd * 0.5, m[1] + vy * reach * 0.6 + uy * fwd * 0.5])} ${P([m[0] + vx * reach + ux * fwd, m[1] + vy * reach + uy * fwd])}" fill="none" stroke="#3F5E39" stroke-width="0.4" stroke-opacity="0.38"/>`;
    veins += `<path d="M${P(m)} Q ${P([m[0] - vx * reach * 0.6 + ux * fwd * 0.5, m[1] - vy * reach * 0.6 + uy * fwd * 0.5])} ${P([m[0] - vx * reach + ux * fwd, m[1] - vy * reach + uy * fwd])}" fill="none" stroke="#3F5E39" stroke-width="0.4" stroke-opacity="0.38"/>`;
  }
  return petioleP + `<path d="${blade}" fill="url(#${g})" stroke="#3F5E39" stroke-width="0.5" stroke-opacity="0.3"/>` + mid + veins;
}
// alternating leaves along a sampled centerline [t0,t1] — each springs forward-
// outward from the branch (acute angle toward the tip), alternating sides.
function leavesAlong(C, t0, t1, count, L, W, outAng, g, size = 1) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const t = t0 + (t1 - t0) * (count === 1 ? 0.5 : i / (count - 1));
    const p = atT(C, t);
    const side = i % 2 ? 1 : -1;
    const nAng = Math.atan2(p.ny * side, p.nx * side) * 180 / Math.PI; // outward normal on this side
    const tAng = Math.atan2(-p.nx, p.ny) * 180 / Math.PI;             // tangent toward the tip
    let diff = ((tAng - nAng + 540) % 360) - 180;                     // signed shortest turn
    const ang = nAng + Math.sign(diff) * outAng;                     // outward, tilted toward tip
    const ll = L * (0.85 + 0.18 * Math.sin(i * 1.5)) * size;
    s += leaf(p.x, p.y, ll, W * size, ang, i % 3 === 0 ? "lf3b" : g, side);
  }
  return s;
}
// natural grass clump (roots at the bough foot)
function grass(cx, y, w, n, h = 30) {
  let back = "", front = "";
  const shadow = `<ellipse cx="${cx}" cy="${y + 2}" rx="${w * 0.62}" ry="9" fill="url(#shd3)"/>`;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = cx - w / 2 + w * t, off = (x - cx) / (w / 2);
    const lean = off * (11 + 7 * Math.abs(off)) + (i % 2 ? 3 : -3);
    const hh = h * (0.6 + 0.44 * Math.abs(Math.sin(i * 1.7))) * (1 - 0.16 * Math.abs(off));
    const isBack = i % 3 === 0, bw = isBack ? 1.5 : 1.9;
    const tipx = x + lean, tipy = y - hh, mx = x + lean * 0.35, my = y - hh * 0.58;
    const blade = `<path d="M${(x - bw).toFixed(1)} ${y} Q ${(mx - bw * 0.4).toFixed(1)} ${my.toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)} Q ${(mx + bw * 0.4).toFixed(1)} ${my.toFixed(1)} ${(x + bw).toFixed(1)} ${y} Z" fill="url(#${isBack ? "gr3b" : "gr3"})"/>`;
    if (isBack) back += blade; else front += blade;
  }
  return shadow + back + front;
}
function petals(x, y, n = 3, c = "#EAC0C4") {
  let s = "";
  for (let i = 0; i < n; i++) { const a = i * 137, r = 6 + i * 5, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.5; s += `<path d="M${px} ${py} q 4 -3 7 0 q -3 3 -7 0 Z" fill="${c}" opacity="${0.5 - i * 0.08}"/>`; }
  return s;
}

module.exports = { DEFS, spline, atT, branch, knot, leaf, leavesAlong, grass, petals };
