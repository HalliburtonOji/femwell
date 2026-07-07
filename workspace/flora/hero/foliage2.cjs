// Richer foliage builders for the blossoming-branch focus demo — grass, dense leaf
// clusters, depth (back/front layers), petal scatter. Extends foliage.cjs.
const F = require("./foliage.cjs");

// extra defs: hazier BACK-layer leaf tone (for depth) + soft petal
const G2 = `<defs>
  <linearGradient id="lfgBk" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#AEC6AE"/><stop offset="100%" stop-color="#7C9A7C"/></linearGradient>
  <linearGradient id="grassg" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#6E8F63"/><stop offset="60%" stop-color="#8AAE7E"/><stop offset="100%" stop-color="#A6C58F"/></linearGradient>
  <linearGradient id="grassgBk" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#5F7E5A"/><stop offset="100%" stop-color="#83A277"/></linearGradient>
  <radialGradient id="grndSh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2E261B" stop-opacity="0.16"/><stop offset="100%" stop-color="#2E261B" stop-opacity="0"/></radialGradient>
</defs>`;

// one tapered grass blade rooted at (x,y), height h, leaning `lean` px, tone id
function blade(x, y, h, lean, g = "grassg", bw = 1.7) {
  const tipx = x + lean, tipy = y - h;
  const cx = x + lean * 0.35, cy = y - h * 0.58;
  return `<path d="M${(x-bw).toFixed(1)} ${y} Q ${(cx-bw*0.4).toFixed(1)} ${cy.toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)} Q ${(cx+bw*0.4).toFixed(1)} ${cy.toFixed(1)} ${(x+bw).toFixed(1)} ${y} Z" fill="url(#${g})"/>`;
}
// a tuft / bed of grass centred (cx,y), spanning width w, n blades, ~height h
function grass(cx, y, w, n, h = 26) {
  let back = "", front = "";
  const shadow = `<ellipse cx="${cx}" cy="${y+2}" rx="${w*0.6}" ry="8" fill="url(#grndSh)"/>`;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = cx - w / 2 + w * t;
    const off = (x - cx) / (w / 2);           // -1..1
    const lean = off * (10 + 6 * Math.abs(off)) + (i % 2 ? 3 : -3);
    const hh = h * (0.62 + 0.42 * Math.abs(Math.sin(i * 1.7))) * (1 - 0.18 * Math.abs(off));
    const isBack = i % 3 === 0;
    (isBack ? (s => back += s) : (s => front += s))(blade(x, y, hh * (isBack ? 1.08 : 1), lean, isBack ? "grassgBk" : "grassg", isBack ? 1.5 : 1.8));
  }
  return shadow + back + front;
}
// dense two-sided leaf cluster from a stalk point (x,y) opening upward around baseAng
function cluster(x, y, n, L, W, baseAng, spread, g = "lfg") {
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const a = baseAng - spread / 2 + spread * t;
    const l = L * (0.78 + 0.28 * Math.sin(i * 1.3 + 1));
    s += F.leaf(x, y, l, W, a, (i % 2 ? g : "lfg2"), 0.96);
  }
  return s;
}
// a few soft fallen petals / specks near (x,y) for life
function petals(x, y, n = 3, c = "#EAC0C4") {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = i * 137, r = 6 + i * 5;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.5;
    s += `<path d="M${px} ${py} q 4 -3 7 0 q -3 3 -7 0 Z" fill="${c}" opacity="${0.5 - i * 0.08}"/>`;
  }
  return s;
}

module.exports = { ...F, G2, blade, grass, cluster, petals };
