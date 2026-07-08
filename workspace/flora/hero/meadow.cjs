// ── Dusk WILDFLOWER-MEADOW surround for the flora hero (research-driven craft) ──
// References studied: wildflower-meadow layering (tall back grasses → mid wild
// flowers → front tufts; grasses 50–80%), Achillea millefolium (yarrow = a
// FLAT-TOPPED corymb of many tiny white florets on a tall thin stem, feathery
// gray-green foliage), cow-parsley/umbellifers (airy lacy radiating umbels),
// grass seed-heads catching light, golden-hour/dusk palette (warm but MUTED,
// desaturated olive-sage greens, cream/gold flowers, soft long shadows).
// Palette kept on-brand (cream paper world) — natural, never garish.

// deterministic PRNG (stable renders, natural-looking scatter)
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const DEFS = `<defs>
  <linearGradient id="mStem" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#5E7350"/><stop offset="100%" stop-color="#84986C"/></linearGradient>
  <linearGradient id="mGrF" x1="0" y1="1" x2="0.1" y2="0"><stop offset="0%" stop-color="#4E6B3F"/><stop offset="60%" stop-color="#6C8A54"/><stop offset="100%" stop-color="#8AA268"/></linearGradient>
  <linearGradient id="mGrM" x1="0" y1="1" x2="0.1" y2="0"><stop offset="0%" stop-color="#5C7A4A"/><stop offset="100%" stop-color="#89A06A"/></linearGradient>
  <linearGradient id="mGrB" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#7E9070"/><stop offset="100%" stop-color="#9DAE86"/></linearGradient>
  <linearGradient id="mSeed" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#B7A473"/><stop offset="100%" stop-color="#D8C48A"/></linearGradient>
  <radialGradient id="mYar" cx="50%" cy="42%" r="60%"><stop offset="0%" stop-color="#FBF6E9"/><stop offset="70%" stop-color="#F1E9D3"/><stop offset="100%" stop-color="#E6DABE"/></radialGradient>
  <radialGradient id="mGrnd" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2E261B" stop-opacity="0.15"/><stop offset="100%" stop-color="#2E261B" stop-opacity="0"/></radialGradient>
</defs>`;

// one tapered grass blade rooted at (x,baseY), curved lean, height h
function blade(x, baseY, h, lean, grad, bw = 1.7) {
  const tipx = x + lean, tipy = baseY - h, mx = x + lean * 0.34, my = baseY - h * 0.6;
  return `<path d="M${(x - bw).toFixed(1)} ${baseY} Q ${(mx - bw * 0.4).toFixed(1)} ${my.toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)} Q ${(mx + bw * 0.4).toFixed(1)} ${my.toFixed(1)} ${(x + bw).toFixed(1)} ${baseY} Z" fill="url(#${grad})"/>`;
}
// a tall grass with a feathery SEED HEAD catching light (oat-like nodding spike)
function seedGrass(x, baseY, h, lean, grad = "mGrM") {
  const topx = x + lean, topy = baseY - h;
  const stem = `<path d="M${x} ${baseY} Q ${(x + lean * 0.4).toFixed(1)} ${(baseY - h * 0.6).toFixed(1)} ${topx.toFixed(1)} ${topy.toFixed(1)}" fill="none" stroke="url(#${grad})" stroke-width="1.2" stroke-linecap="round"/>`;
  let head = "";
  const dir = lean >= 0 ? 1 : -1;
  for (let i = 0; i < 6; i++) {
    const t = i / 5, sy = topy + t * 12, sx = topx + dir * t * 3 + dir * 1.5;
    head += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} q ${(dir * 3).toFixed(1)} -2 ${(dir * 4.5).toFixed(1)} 0" fill="none" stroke="url(#mSeed)" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>`;
  }
  return stem + head;
}
// YARROW: tall thin stem + a flat-topped corymb of many tiny florets + feathery leaves
function yarrow(x, baseY, h, headR, seed, { pale = false } = {}) {
  const r = rng(seed);
  const sway = (r() - 0.5) * 10;
  const topx = x + sway, topy = baseY - h;
  const stem = `<path d="M${x} ${baseY} Q ${(x + sway * 0.4).toFixed(1)} ${(baseY - h * 0.55).toFixed(1)} ${topx.toFixed(1)} ${topy.toFixed(1)}" fill="none" stroke="url(#mStem)" stroke-width="${pale ? 1 : 1.4}" stroke-linecap="round" ${pale ? 'opacity="0.75"' : ""}/>`;
  // a couple of feathery leaf hints low on the stem
  let leaves = "";
  for (const ly of [0.72, 0.5]) {
    const lx = x + sway * (1 - ly), yy = baseY - h * (1 - ly), sgn = r() > 0.5 ? 1 : -1;
    for (let k = 1; k <= 4; k++) leaves += `<path d="M${lx.toFixed(1)} ${yy.toFixed(1)} q ${(sgn * 3).toFixed(1)} ${(-2 - k).toFixed(1)} ${(sgn * (5 + k)).toFixed(1)} ${(-3 - k * 1.4).toFixed(1)}" fill="none" stroke="#6E8358" stroke-width="0.7" stroke-linecap="round" opacity="${pale ? 0.4 : 0.6}"/>`;
  }
  // flat-topped corymb: many tiny florets scattered in a wide, shallow, flat-topped dome
  const shadow = `<ellipse cx="${topx.toFixed(1)}" cy="${(topy + 1).toFixed(1)}" rx="${(headR * 0.9).toFixed(1)}" ry="${(headR * 0.34).toFixed(1)}" fill="#8A7A55" opacity="${pale ? 0.1 : 0.16}"/>`;
  let florets = "";
  const n = pale ? 16 : 30;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * headR;
    const fx = topx + Math.cos(a) * rr, fy = topy - Math.abs(Math.sin(a)) * headR * 0.16 + (r() - 0.5) * headR * 0.18; // flat top, slight depth
    const fr = 0.9 + r() * 0.8;
    florets += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${fr.toFixed(1)}" fill="url(#mYar)" ${pale ? 'opacity="0.7"' : ""}/>`;
  }
  // a faint warm floret-cluster shading + a few gold centres (backlit dusk)
  let centres = "";
  for (let i = 0; i < (pale ? 3 : 6); i++) { const a = r() * 6.28, rr = r() * headR * 0.7; centres += `<circle cx="${(topx + Math.cos(a) * rr).toFixed(1)}" cy="${(topy + (r() - 0.5) * headR * 0.16).toFixed(1)}" r="0.7" fill="#E4CF9A" opacity="0.7"/>`; }
  return stem + leaves + shadow + florets + centres;
}
// COW-PARSLEY / umbellifer: tall stem + a rounded lacy umbel of radiating spokes
function umbel(x, baseY, h, r0, seed, { pale = false } = {}) {
  const r = rng(seed);
  const sway = (r() - 0.5) * 8, topx = x + sway, topy = baseY - h;
  const stem = `<path d="M${x} ${baseY} Q ${(x + sway * 0.4).toFixed(1)} ${(baseY - h * 0.55).toFixed(1)} ${topx.toFixed(1)} ${topy.toFixed(1)}" fill="none" stroke="url(#mStem)" stroke-width="${pale ? 0.9 : 1.2}" stroke-linecap="round" ${pale ? 'opacity="0.7"' : ""}/>`;
  const spokes = pale ? 8 : 12; let lace = "";
  for (let i = 0; i < spokes; i++) {
    const a = -Math.PI * 0.5 + (i / (spokes - 1) - 0.5) * Math.PI * 1.3;
    const ex = topx + Math.cos(a) * r0, ey = topy + Math.sin(a) * r0 * 0.7;
    lace += `<path d="M${topx.toFixed(1)} ${topy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#DFD8C2" stroke-width="0.45" opacity="${pale ? 0.4 : 0.6}"/>`;
    for (let k = 0; k < 4; k++) { const jx = ex + (r() - 0.5) * 3, jy = ey + (r() - 0.5) * 3; lace += `<circle cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="${(0.8 + r() * 0.5).toFixed(1)}" fill="#F4EEDF" ${pale ? 'opacity="0.7"' : ""}/>`; }
  }
  return stem + lace;
}
// small round meadow flower (clover/knapweed dot) for scatter accents
function dot(x, y, r0, col) { return `<circle cx="${x}" cy="${y}" r="${r0}" fill="${col}"/>`; }

// A rich, layered, natural DUSK-MEADOW band at the base. cx = the branch foot.
// Returns { back, front } SVG strings (back goes BEHIND the branch, front OVER it).
function meadowBand(cx, groundY, seed = 7) {
  const r = rng(seed);
  const jitter = (base, amt) => base + (r() - 0.5) * amt;
  // density falls off to the RIGHT (the branch rises there); densest at the foot.
  const tall = (x) => Math.max(0.28, 1 - x / 340);          // height/prominence scale by x
  let back = `<ellipse cx="${cx + 24}" cy="${groundY + 3}" rx="140" ry="13" fill="url(#mGrnd)"/>`;
  // BACK layer — tall hazy grasses + pale wild plants; shorter & sparser to the right (recede)
  for (let i = 0; i < 30; i++) {
    const x = jitter(8 + Math.pow(r(), 1.25) * 270, 14), h = (40 + r() * 74) * tall(x), lean = (r() - 0.5) * 24;
    back += `<g opacity="${(0.34 + r() * 0.3).toFixed(2)}">${blade(x, groundY - r() * 5, h, lean, "mGrB", 1.5)}</g>`;
  }
  for (let i = 0; i < 4; i++) { const x = jitter(28 + i * 34, 22); back += `<g opacity="0.6">${yarrow(x, groundY - r() * 4, (74 + r() * 34) * tall(x), 8 + r() * 3, seed * 31 + i, { pale: true })}</g>`; }
  for (let i = 0; i < 2; i++) { const x = jitter(64 + i * 70, 26); back += `<g opacity="0.5">${umbel(x, groundY - r() * 4, (86 + r() * 20) * tall(x), 9, seed * 17 + i, { pale: true })}</g>`; }
  for (let i = 0; i < 7; i++) { const x = jitter(18 + i * 20, 14); back += `<g opacity="0.5">${seedGrass(x, groundY - r() * 4, (54 + r() * 40) * tall(x), (r() - 0.5) * 18, "mGrB")}</g>`; }

  // FRONT layer — crisper mid grasses (dense clump left), yarrow/umbel heads, front tufts
  let front = "";
  for (let i = 0; i < 40; i++) {
    const bias = Math.pow(r(), 1.7);                          // cluster hard to the foot
    const x = jitter(10 + bias * 210, 11), h = (22 + r() * 44) * (0.55 + 0.55 * tall(x)), lean = (r() - 0.5) * 22;
    front += blade(x, groundY + r() * 3, h, lean, r() > 0.42 ? "mGrM" : "mGrF", 1.7 + r() * 0.6);
  }
  // 3 yarrow heads (the hero meadow flower) at varied heights near the foot + 1 further out
  [cx - 12, cx + 22, cx + 58, cx + 108].forEach((x, i) => { front += yarrow(jitter(x, 8), groundY + r() * 2, (38 + r() * 30) * (i === 3 ? 0.7 : 1), 10 + r() * 3.5, seed * 7 + i); });
  // two lacy cow-parsley + small accent flowers (clover/knapweed dots)
  front += umbel(jitter(cx + 40, 10), groundY, 60 + r() * 14, 11, seed * 5);
  front += umbel(jitter(cx - 2, 10), groundY, 48 + r() * 12, 9, seed * 9);
  for (let i = 0; i < 6; i++) { const x = jitter(cx + (r() - 0.35) * 150, 8), y = groundY - 6 - r() * 30; front += dot(x, y, 1.3 + r() * 0.7, r() > 0.5 ? "#E7C7CB" : "#EAD9A8"); }
  // front seed-grasses (catch the dusk light) — clustered at the foot
  for (let i = 0; i < 6; i++) { const x = jitter(cx - 10 + i * 16, 12); front += seedGrass(x, groundY + r() * 3, 30 + r() * 26, (r() - 0.5) * 16, "mGrF"); }
  // crisp dark front blades at the very base (dense tuft)
  for (let i = 0; i < 16; i++) { const x = jitter(cx - 6 + (r() - 0.5) * 96, 8); front += blade(x, groundY + 4, 14 + r() * 22, (r() - 0.5) * 15, "mGrF", 2); }
  // low scatter continuing to the RIGHT so the meadow doesn't hard-stop (thins, stays short)
  for (let i = 0; i < 14; i++) { const x = jitter(150 + i * 11, 12), h = (12 + r() * 20) * tall(x); front += blade(x, groundY + 4, h, (r() - 0.5) * 14, r() > 0.5 ? "mGrM" : "mGrF", 1.7); }
  front += yarrow(jitter(232, 10), groundY + 2, 30, 8, seed * 13);   // one distant yarrow far right
  for (let i = 0; i < 3; i++) { const x = jitter(200 + i * 30, 16), y = groundY - 4 - r() * 14; front += dot(x, y, 1.2 + r() * 0.5, "#EAD9A8"); }
  return { back, front };
}

module.exports = { DEFS, rng, blade, seedGrass, yarrow, umbel, dot, meadowBand };
