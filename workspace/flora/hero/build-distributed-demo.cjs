const fs = require("fs");
const F = require("./foliage3.cjs");
const M = require("./meadow.cjs");
const A = JSON.parse(fs.readFileSync("vivid-out.txt", "utf8").split("@@@JSON@@@")[1]); // headOnly blooms
const tex = fs.readFileSync("C:/Users/Halli/femwell-work/workspace/flora/paper-tex.txt", "utf8").trim();

const MAIN = [[38, 268], [92, 228], [150, 180], [212, 132], [268, 92]];
const CM = F.spline(MAIN, 22);
const BAND = M.meadowBand(52, 272, 7);
const HEAD_OFF = 19; // px the head sits above the div centre (headOnly box)

function budShape(petal, tip) {
  return `<g>
    <path d="M0 -3 C -3.4 -5 -4.4 -10 -3.4 -14 C -2.6 -17 -1.2 -18.5 0 -19 C 1.2 -18.5 2.6 -17 3.4 -14 C 4.4 -10 3.4 -5 0 -3 Z" fill="${petal}" stroke="#7A3A50" stroke-width="0.5" stroke-opacity="0.35"/>
    <path d="M0 -8 C -1.3 -11.5 -1.3 -15 0 -17.5" fill="none" stroke="${tip}" stroke-width="1" stroke-opacity="0.7" stroke-linecap="round"/>
    <path d="M0 -3 C -2.8 -3 -4.4 -6 -4 -9 M0 -3 C 2.8 -3 4.4 -6 4 -9 M0 -2 L0 -8" fill="none" stroke="#6E8358" stroke-width="1.1" stroke-linecap="round"/>
  </g>`;
}
// a bloom perched on a branch at param t of centerline C. side: +1 lower / -1 upper.
// returns { ped (SVG pedicel), flower (positioned div with f-open head + f-bud) }
function perch(C, t, side, scale, order, open, petal, tip, budRot = 0) {
  const p = F.atT(C, t);
  const off = 14 + scale * 10;                       // sit just off the wood
  const fx = p.x + p.nx * side * off, fy = p.y + p.ny * side * off;
  const ped = `<path d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q ${((p.x + fx) / 2).toFixed(1)} ${((p.y + fy) / 2).toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)}" fill="none" stroke="url(#mStem)" stroke-width="1.5" stroke-linecap="round"/>`;
  const cls = order === 0 ? "primary" : "secondary";
  const budW = `<span class="f-bud"><svg width="34" height="34" viewBox="-17 -22 34 26" style="overflow:visible;display:block;transform:rotate(${budRot}deg)">${budShape(petal, tip)}</svg></span>`;
  const flower = `<div class="slot ${cls}" style="position:absolute;left:${fx.toFixed(1)}px;top:${(fy + HEAD_OFF * scale).toFixed(1)}px;transform:translate(-50%,-50%);z-index:2">`
    + `<span class="f-open" style="--s:${scale}">${open}</span>${budW}</div>`;
  return { ped, flower };
}
const svg = (inner, z, extra = "") => `<svg viewBox="0 0 300 300" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:${z};${extra}" aria-hidden="true">${F.DEFS}${M.DEFS}${inner}</svg>`;
const beeAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bee}</div>`;
const bflyAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bfly}</div>`;

// BIG blooms DISTRIBUTED along the whole main bough (shared) — order = open sequence
const MAIN_BLOOMS = [
  { t: 0.9, side: -1, s: 0.82, order: 0, budRot: 8 },   // near the tip — the "one" that opens first
  { t: 0.68, side: 1, s: 0.86, order: 2, budRot: -14 },
  { t: 0.47, side: -1, s: 0.82, order: 1, budRot: 12 },
  { t: 0.28, side: 1, s: 0.72, order: 3, budRot: 20 },
];

const V = [];
V.push({ name: "Coral & gold", tag: "coral → gold · blooms down the bough", flower: "coral_gold", petal: "#E86A44", tip: "#F6C066",
  blurb: "Big coral-to-gold blooms spaced along the whole bough. The side twig lifts up-left with one more.",
  side: [[150, 180], [130, 146], [120, 110]], sideBlooms: [{ t: 0.88, side: -1, s: 0.66, order: 4, budRot: -10 }], creature: { fn: beeAt, l: 254, t: 54, s: 1 } });
V.push({ name: "Magenta & cream", tag: "magenta → cream · a low offshoot", flower: "magenta_cream", petal: "#C63A75", tip: "#F4DCE6",
  blurb: "Rich magenta-cream blooms along the bough; the side branch dips low-right with another.",
  side: [[212, 132], [236, 156], [256, 168]], sideBlooms: [{ t: 0.9, side: 1, s: 0.62, order: 4, budRot: 18 }], creature: { fn: beeAt, l: 256, t: 56, s: 1 } });
V.push({ name: "Violet & butter", tag: "violet + butter heart · a crown twig", flower: "violet_butter", petal: "#8A63B4", tip: "#CBB8E4",
  blurb: "Violet open faces with butter-gold hearts, spread down the branch. A short crown twig forks up with one.",
  side: [[212, 132], [226, 100], [230, 74]], sideBlooms: [{ t: 0.9, side: -1, s: 0.62, order: 4, budRot: -6 }], creature: { fn: bflyAt, l: 120, t: 118, s: 0.9 } });
V.push({ name: "Crimson & gold", tag: "crimson (the heart) + gold · a forked twig", flower: "crimson_gold", petal: "#C33A2C", tip: "#E8895F",
  blurb: "A showy crimson-and-gold bough, blooms all along it — the heart colour at its most alive. A forked twig.",
  side: [[150, 180], [174, 152], [188, 120]], extraTwig: [[174, 152], [196, 158], [214, 152]], sideBlooms: [{ t: 0.85, side: -1, s: 0.62, order: 4, budRot: 10 }], creature: { fn: beeAt, l: 256, t: 58, s: 1 } });
V.push({ name: "Periwinkle & gold", tag: "periwinkle + gold heart · a low bough", flower: "periwinkle_gold", petal: "#7C8CC8", tip: "#C0CAE6",
  blurb: "Cool periwinkle-blue blooms with warm gold hearts, spaced along a low-left bough — calm and uncommon.",
  side: [[92, 228], [66, 198], [50, 166]], sideBlooms: [{ t: 0.88, side: -1, s: 0.62, order: 4, budRot: -12 }], creature: { fn: beeAt, l: 254, t: 54, s: 1 } });

const stageFor = (v) => {
  const open = A[v.flower];
  const CS = F.spline(v.side, 22);
  const blooms = [...MAIN_BLOOMS.map((b) => perch(CM, b.t, b.side, b.s, b.order, open, v.petal, v.tip, b.budRot)),
    ...(v.sideBlooms || []).map((b) => perch(CS, b.t, b.side, b.s, b.order, open, v.petal, v.tip, b.budRot))];
  const foliage = BAND.back
    + F.branch(MAIN, 16, 3.2, { knots: [0.3, 0.62] })
    + F.knot(150, 180) + F.knot(212, 132) + F.knot(92, 228)
    + F.branch(v.side, 6.2, 1.7, {}) + (v.extraTwig ? F.branch(v.extraTwig, 4.5, 1.5, {}) : "")
    + F.leavesAlong(CM, 0.16, 0.82, 6, 30, 17, 46, "lf3")
    + F.leavesAlong(CS, 0.2, 0.9, 3, 24, 14, 46, "lf3")
    + blooms.map((b) => b.ped).join("")
    + BAND.front;
  return svg(foliage, 1) + blooms.map((b) => b.flower).join("") + v.creature.fn(v.creature.l, v.creature.t, v.creature.s);
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
<title>FemWell — Flora Hero · blooms along the bough</title>
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
  /* one → many, spread along the bough: full = all open; bud = only the tip bloom (small) + closed buds elsewhere */
  .slot .f-open{display:block;transform:scale(var(--s));transform-origin:center;transition:transform .5s cubic-bezier(.34,1.2,.4,1)}
  .slot .f-bud{display:none}
  .stage.bud .slot.secondary .f-open{display:none}
  .stage.bud .slot.secondary .f-bud{display:block}
  .stage.bud .slot.primary .f-open{transform:scale(calc(var(--s) * 0.6))}
  .hint{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--crimson);opacity:.85;z-index:5}
  .titlerow{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:0}
  .heart{color:var(--crimson);font-size:15px}.ttl{font-family:var(--script);font-weight:400;font-size:42px;line-height:1.02;color:var(--oxblood)}
  .stylename{text-align:center;font-family:var(--serif);font-weight:600;font-size:18px;color:var(--oxblood);margin-top:4px}
  .blurb{text-align:center;font-family:var(--serif);font-size:14.5px;color:var(--muted);line-height:1.5;max-width:400px;margin:4px auto 0}
  .foot{font-family:var(--sans);font-size:12px;color:var(--muted);text-align:center;margin-top:24px;line-height:1.6}
</style></head><body><div class="doc">
<div class="eyebrow">FemWell · flora hero · blooms along the bough</div>
<h1>Big blooms, down the branch</h1>
<p class="lede">Larger flowers, spaced along the whole bough like a real flowering branch — and still one → many. Tap a header.</p>
<div class="intro"><p><b>Two fixes:</b> (1) the blooms are now <b>distributed down the whole bough</b> (and the side twig), spaced naturally — not piled in one cluster at the crown; (2) each flower is <b>bigger &amp; stem-less</b> (it sits cleanly on the wood, no little green stalk) so they read as big, beautiful, colourful flowers.</p><p>The <b>one → many</b> rebloom still applies, now along the branch: <b>tap</b> and it goes from <b>one open bloom near the tip + closed buds down the bough</b> to <b>every bloom open</b> — the buds open in sequence along the branch. Kept: the dusk <b>meadow</b>, the realistic <b>diagonal bough</b>, the <b>two-tone palettes</b>, side-twig variants, mood tint, companion, no dashed ring. Pick the palette/feel.</p></div>
${V.map(card).join("\n")}
<div class="foot">Demo only for the look — once you pick, the along-the-bough larger blooms + one→many fold into BRAND_IDENTITY.md §6.8 and go live.<br>FemWell · the flora signature</div>
</div>
</body></html>`;

fs.writeFileSync("C:/Users/Halli/femwell-handoff/FLORA-BRANCH-REALISM.html", html);
console.log("wrote FLORA-BRANCH-REALISM.html", (html.length / 1024).toFixed(0) + "KB");
