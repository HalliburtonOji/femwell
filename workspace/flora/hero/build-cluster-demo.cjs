const fs = require("fs");
const F = require("./foliage3.cjs");
const M = require("./meadow.cjs");
const A = JSON.parse(fs.readFileSync("vivid-out.txt", "utf8").split("@@@JSON@@@")[1]);
const tex = fs.readFileSync("C:/Users/Halli/femwell-work/workspace/flora/paper-tex.txt", "utf8").trim();

const MAIN = [[38, 268], [92, 228], [150, 180], [212, 132], [268, 92]];
const CM = F.spline(MAIN, 22);
const BAND = M.meadowBand(52, 272, 7);

// a small CLOSED flower bud (petal teardrop + green calyx), drawn pointing up at origin
function budShape(petal, tip) {
  return `<g>
    <path d="M0 -3 C -3.4 -5 -4.4 -10 -3.4 -14 C -2.6 -17 -1.2 -18.5 0 -19 C 1.2 -18.5 2.6 -17 3.4 -14 C 4.4 -10 3.4 -5 0 -3 Z" fill="${petal}" stroke="#7A3A50" stroke-width="0.5" stroke-opacity="0.35"/>
    <path d="M0 -8 C -1.3 -11.5 -1.3 -15 0 -17.5" fill="none" stroke="${tip}" stroke-width="1" stroke-opacity="0.7" stroke-linecap="round"/>
    <path d="M0 -3 C -2.8 -3 -4.4 -6 -4 -9 M0 -3 C 2.8 -3 4.4 -6 4 -9 M0 -2 L0 -8" fill="none" stroke="#6E8358" stroke-width="1.1" stroke-linecap="round"/>
  </g>`;
}
// the ONE→MANY spray: a cluster of flower slots on short pedicels from a crown node.
// bud state → primary shows a single small bloom, secondaries are closed BUDS;
// full state → every slot is an open bloom (the buds have opened into a spray).
const SLOTS = [
  { dx: 0, dy: 2, s: 0.86, primary: true },
  { dx: -30, dy: 12, s: 0.6, budRot: -32 },
  { dx: 30, dy: 8, s: 0.62, budRot: 26 },
  { dx: -15, dy: -26, s: 0.56, budRot: -12 },
  { dx: 21, dy: -22, s: 0.58, budRot: 14 },
];
const ANCHOR = { x: 228, y: 102 }, CROWN = { x: 210, y: 134 };
function sprayPedicels() {
  return SLOTS.map((s) => {
    const ex = ANCHOR.x + s.dx, ey = ANCHOR.y + s.dy;
    const mx = (CROWN.x + ex) / 2 + 3, my = (CROWN.y + ey) / 2;
    return `<path d="M${CROWN.x} ${CROWN.y} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex} ${ey}" fill="none" stroke="url(#mStem)" stroke-width="1.5" stroke-linecap="round"/>`;
  }).join("");
}
function sprayFlowers(open, petal, tip) {
  const bud = budShape(petal, tip);
  return SLOTS.map((s) => {
    const cls = s.primary ? "primary" : "secondary";
    const ex = ANCHOR.x + s.dx, ey = ANCHOR.y + s.dy;
    const budW = `<span class="f-bud"><svg width="30" height="30" viewBox="-15 -22 30 26" style="overflow:visible;display:block;transform:rotate(${s.budRot || 0}deg)">${bud}</svg></span>`;
    return `<div class="slot ${cls}" style="position:absolute;left:${ex}px;top:${ey}px;transform:translate(-50%,-50%);z-index:2">`
      + `<span class="f-open" style="--s:${s.s}">${open}</span>${budW}</div>`;
  }).join("");
}
const svg = (inner, z, extra = "") => `<svg viewBox="0 0 300 300" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:${z};${extra}" aria-hidden="true">${F.DEFS}${M.DEFS}${inner}</svg>`;
const beeAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bee}</div>`;
const bflyAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bfly}</div>`;

// each variation: a DIFFERENT side twig + a DIFFERENT vivid flower (as a spray)
const V = [];
V.push({ name: "Coral & gold", tag: "coral → gold · a lifting twig", flower: "coral_gold", petal: "#E86A44", tip: "#F6C066",
  blurb: "Coral petals warming to gold at the tips, a gold heart. A spray of several on the crown; the side twig lifts up-left.",
  side: [[150, 180], [130, 146], [120, 110]], sideLeaves: [0.2, 0.9, 3, 26, 15, 44], creature: { fn: beeAt, l: 250, t: 66, s: 1 } });
V.push({ name: "Magenta & cream", tag: "magenta → cream · a low offshoot", flower: "magenta_cream", petal: "#C63A75", tip: "#F4DCE6",
  blurb: "Rich magenta peonies with cream centres — vivid and lush. The side branch dips low-right into leaves.",
  side: [[212, 132], [236, 156], [256, 168]], sideLeaves: [0.15, 0.92, 3, 26, 15, 46], creature: { fn: beeAt, l: 252, t: 66, s: 1 } });
V.push({ name: "Violet & butter", tag: "violet + butter-gold heart", flower: "violet_butter", petal: "#8A63B4", tip: "#CBB8E4",
  blurb: "Violet open-faced blooms with a butter-yellow heart — a bold, joyful pairing. A short crown twig forks up.",
  side: [[212, 132], [226, 100], [230, 74]], sideLeaves: [0.2, 0.9, 2, 22, 13, 44], creature: { fn: bflyAt, l: 118, t: 120, s: 0.9 } });
V.push({ name: "Crimson & gold", tag: "crimson (the heart) + gold", flower: "crimson_gold", petal: "#C33A2C", tip: "#E8895F",
  blurb: "A showy crimson spray with gold centres — the heart colour, at its most alive. A forked twig for a wilder branch.",
  side: [[150, 180], [174, 152], [188, 120]], extraTwig: [[174, 152], [196, 158], [214, 152]], sideLeaves: [0.15, 0.9, 3, 24, 14, 46], creature: { fn: beeAt, l: 252, t: 68, s: 1 } });
V.push({ name: "Periwinkle & gold", tag: "periwinkle blue + gold heart", flower: "periwinkle_gold", petal: "#7C8CC8", tip: "#C0CAE6",
  blurb: "Cool periwinkle-blue blooms with a warm gold heart — a calm, uncommon colour for the set. Low-left bough, wider spread.",
  side: [[92, 228], [66, 198], [50, 166]], sideLeaves: [0.2, 0.92, 3, 27, 16, 46], creature: { fn: beeAt, l: 250, t: 66, s: 1 } });

const stageFor = (v) => {
  const open = A[v.flower];
  const CS = F.spline(v.side, 22);
  const foliage = BAND.back
    + F.branch(MAIN, 16, 3.2, { knots: [0.3, 0.62] })
    + F.knot(150, 180) + F.knot(212, 132) + F.knot(92, 228)
    + F.branch(v.side, 6.2, 1.7, {}) + (v.extraTwig ? F.branch(v.extraTwig, 4.5, 1.5, {}) : "")
    + F.leavesAlong(CM, 0.2, 0.6, 5, 33, 18, 44, "lf3")
    + F.leavesAlong(CS, v.sideLeaves[0], v.sideLeaves[1], v.sideLeaves[2], v.sideLeaves[3], v.sideLeaves[4], v.sideLeaves[5], "lf3")
    + sprayPedicels()
    + BAND.front;
  return svg(foliage, 1) + sprayFlowers(open, v.petal, v.tip) + v.creature.fn(v.creature.l, v.creature.t, v.creature.s);
};

const card = (v, i) => `
<div class="card">
  <div class="tag">${v.tag}</div>
  <button class="stage" onclick="this.classList.toggle('bud')" aria-label="Tap to rebloom">${stageFor(v)}<span class="hint">tap: one → many ↺</span></button>
  <div class="titlerow"><span class="heart">♥</span><span class="ttl">Your plate</span></div>
  <div class="stylename">${i + 1} · ${v.name}</div>
  <div class="blurb">${v.blurb}</div>
</div>`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FemWell — Flora Hero · colourful spray</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500;1,600&family=Ephesis&display=swap" rel="stylesheet">
<style>
  :root{--paper:#ECE7DA;--paperHi:#F4EFE3;--paperDeep:#D8CFBC;--ink:#0B0805;--muted:#2E261B;--gold:#A8893F;--crimson:#BC2E27;--oxblood:#7A1A12;--serif:'Cormorant Garamond',Georgia,serif;--script:'Ephesis',cursive;--sans:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;--paper-tex:url("${tex}")}
  *{box-sizing:border-box}html,body{overflow-x:hidden;max-width:100%}
  body{margin:0;min-width:328px;background-color:var(--paper);background-image:radial-gradient(130% 80% at 28% -6%,rgba(255,253,247,.6),rgba(255,253,247,0) 44%),radial-gradient(135% 120% at 50% 48%,rgba(0,0,0,0) 56%,rgba(58,48,32,.16) 100%),linear-gradient(rgba(238,233,222,.5),rgba(238,233,222,.5)),var(--paper-tex);background-size:auto,auto,auto,300px 300px;background-repeat:no-repeat,no-repeat,repeat,repeat;background-blend-mode:normal,normal,normal,multiply;color:var(--ink);font-family:var(--serif);font-size:18px;line-height:1.5;-webkit-font-smoothing:antialiased}
  .doc{max-width:640px;width:100%;margin:0 auto;padding:22px clamp(11px,3.5vw,20px) 80px}
  .eyebrow{font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);text-align:center}
  h1{font-family:var(--script);font-size:clamp(38px,12vw,54px);color:var(--oxblood);margin:6px 0 2px;line-height:1.04;text-align:center;font-weight:400}
  .lede{font-family:var(--serif);font-style:italic;font-size:17px;color:var(--muted);text-align:center;max-width:470px;margin:4px auto 0}
  .intro{background:var(--paperHi);border:1px solid var(--paperDeep);border-left:4px solid var(--gold);border-radius:16px;padding:14px 15px;margin:16px 0}
  .intro p{margin:0 0 8px;font-size:15.5px}.intro p:last-child{margin:0}
  .card{position:relative;overflow:hidden;margin:14px 0;padding:16px 14px 15px;border:1px solid var(--paperDeep);border-left:4px solid var(--gold);border-radius:20px;background:linear-gradient(rgba(245,240,229,.5),rgba(245,240,229,.5)),var(--paper-tex) center/300px 300px repeat,linear-gradient(165deg,var(--paperHi) 0%,rgba(168,137,63,.15) 100%);background-blend-mode:normal,multiply,normal;box-shadow:0 4px 20px rgba(58,44,26,.12),0 1px 4px rgba(58,44,26,.08),inset 0 1px 0 rgba(255,255,255,.42)}
  .tag{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px}
  .stage{position:relative;display:block;width:300px;max-width:100%;height:300px;margin:0 auto;border:none;background:transparent;cursor:pointer;padding:0}
  /* one → many: full = every slot open; bud = primary a single small bloom, others closed buds */
  .slot .f-open{display:block;transform:scale(var(--s));transform-origin:center;transition:transform .5s cubic-bezier(.34,1.2,.4,1)}
  .slot .f-bud{display:none}
  .stage.bud .slot.secondary .f-open{display:none}
  .stage.bud .slot.secondary .f-bud{display:block}
  .stage.bud .slot.primary .f-open{transform:scale(calc(var(--s) * 0.66))}
  .hint{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--crimson);opacity:.85;z-index:5}
  .titlerow{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:0}
  .heart{color:var(--crimson);font-size:15px}.ttl{font-family:var(--script);font-weight:400;font-size:42px;line-height:1.02;color:var(--oxblood)}
  .stylename{text-align:center;font-family:var(--serif);font-weight:600;font-size:18px;color:var(--oxblood);margin-top:4px}
  .blurb{text-align:center;font-family:var(--serif);font-size:14.5px;color:var(--muted);line-height:1.5;max-width:400px;margin:4px auto 0}
  .foot{font-family:var(--sans);font-size:12px;color:var(--muted);text-align:center;margin-top:24px;line-height:1.6}
</style></head><body><div class="doc">
<div class="eyebrow">FemWell · flora hero · colourful spray · one → many</div>
<h1>Colour, and a spray that opens</h1>
<p class="lede">Bigger, more colourful two-tone blooms — and a cluster that grows from one to many. Tap a header.</p>
<div class="intro"><p><b>Three changes to the flower:</b> (1) <b>richer, two-tone colours</b> — coral→gold, magenta→cream, violet + butter heart, crimson + gold, periwinkle + gold (vivid, still on-brand); (2) <b>bigger blooms &amp; several per stem</b> — a small spray on the crown, not one lone flower; (3) a new <b>one → many</b> rebloom: <b>tap</b> and the state goes from <b>a single small bloom + closed buds</b> to <b>a full open cluster</b> — the buds <i>open</i>, they don't just grow. Openness now drives <b>how many flowers are open</b>, not the size.</p><p>Kept: the dusk-<b>meadow</b> surround, the single realistic <b>diagonal bough</b>, all the <b>side-twig variants</b>, the <b>mood tint</b> + <b>companion</b>, <b>no dashed ring</b>. Five colourful sprays below — tap each to see one → many. Pick the palette/feel.</p></div>
${V.map(card).join("\n")}
<div class="foot">Demo only for the look — once you pick, the colourful spray + one→many mechanic fold into BRAND_IDENTITY.md (flora list + hero) and replace the live single-bloom scale.<br>FemWell · the flora signature</div>
</div>
</body></html>`;

fs.writeFileSync("C:/Users/Halli/femwell-handoff/FLORA-BRANCH-REALISM.html", html);
console.log("wrote FLORA-BRANCH-REALISM.html", (html.length / 1024).toFixed(0) + "KB");
