const fs = require("fs");
const F = require("./foliage3.cjs");
const M = require("./meadow.cjs");
const A = JSON.parse(fs.readFileSync("flowers-out.txt", "utf8").split("@@@JSON@@@")[1]);
const tex = fs.readFileSync("C:/Users/Halli/femwell-work/workspace/flora/paper-tex.txt", "utf8").trim();

// ── FIXED main diagonal bough (lower-left, thick → upper-right, thin) ──
const MAIN = [[38, 268], [92, 228], [150, 180], [212, 132], [268, 92]];
const CM = F.spline(MAIN, 22);
// ── SHARED dusk wildflower-meadow patch the bough grows out of (back + front layers) ──
const BAND = M.meadowBand(52, 272, 7);

// place a bloom fragment (main = rebloomable full<->bud; else static full)
function bloom(leftP, topP, scale, kind, full, bud, rot = 0) {
  const t = `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`;
  const inner = kind === "main"
    ? `<span class="rebloom"><span class="rb-full">${full}</span><span class="rb-bud">${bud}</span></span>`
    : (kind === "bud" ? bud : full);
  return `<div style="position:absolute;left:${leftP}px;top:${topP}px;transform:${t};transform-origin:center;z-index:2">${inner}</div>`;
}
const svg = (inner, z, extra = "") => `<svg viewBox="0 0 300 300" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:${z};${extra}" aria-hidden="true">${F.DEFS}${M.DEFS}${inner}</svg>`;
const beeAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bee}</div>`;
const bflyAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bfly}</div>`;

// each variation: a DIFFERENT side branch + a DIFFERENT flower on the SAME bough
const V = [];

V.push({ name: "Rose", tag: "soft pink rose · a twig lifting", flower: "rose_blush",
  blurb: "A soft rose sits near the crown; the side twig lifts up-left with a bud. The classic.",
  side: [[150, 180], [130, 146], [120, 110]],
  sideLeaves: [0.2, 0.9, 3, 26, 15, 44],
  blooms: [{ l: 224, t: 112, s: 0.9, k: "main" }, { l: 120, t: 108, s: 0.42, k: "bud" }],
  creature: { fn: beeAt, l: 244, t: 78, s: 1 } });

V.push({ name: "Peony", tag: "fuller peony · a low offshoot", flower: "peony_blush",
  blurb: "The fuller, many-petalled peony for maximum petal richness; the side branch dips low-right into leaves.",
  side: [[212, 132], [236, 156], [256, 168]],
  sideLeaves: [0.15, 0.92, 3, 26, 15, 46],
  blooms: [{ l: 226, t: 110, s: 0.98, k: "main" }],
  creature: { fn: beeAt, l: 250, t: 84, s: 1 } });

V.push({ name: "Coral rose", tag: "warm coral · a short crown twig", flower: "rose_coral",
  blurb: "A warm coral rose; a short twig forks up near the tip with a bud — the warmest of the set.",
  side: [[212, 132], [226, 100], [230, 74]],
  sideLeaves: [0.2, 0.9, 2, 22, 13, 44],
  blooms: [{ l: 214, t: 118, s: 0.9, k: "main" }, { l: 232, t: 74, s: 0.4, k: "bud" }],
  creature: { fn: bflyAt, l: 118, t: 128, s: 0.9 } });

V.push({ name: "Magnolia", tag: "cream magnolia · a low bough", flower: "magnolia_cream",
  blurb: "A pale cream magnolia; the side branch springs low-left from the base for a wider, calmer spread.",
  side: [[92, 228], [66, 198], [50, 166]],
  sideLeaves: [0.2, 0.92, 3, 27, 16, 46],
  blooms: [{ l: 224, t: 112, s: 0.92, k: "main" }, { l: 60, t: 160, s: 0.4, k: "bud" }],
  creature: { fn: beeAt, l: 244, t: 80, s: 1 } });

V.push({ name: "Hibiscus", tag: "crimson hibiscus · a forked twig", flower: "hibiscus_crim",
  blurb: "A showy crimson hibiscus (the heart colour); a forked twig gives a livelier, wilder branch.",
  side: [[150, 180], [174, 152], [188, 120]],
  sideLeaves: [0.15, 0.9, 3, 24, 14, 46],
  blooms: [{ l: 224, t: 114, s: 0.88, k: "main" }, { l: 188, t: 118, s: 0.4, k: "bud" }],
  creature: { fn: beeAt, l: 246, t: 82, s: 1 },
  extraTwig: [[174, 152], [196, 158], [214, 152]] });

const stageFor = (v) => {
  const f = A[`${v.flower}_full`], b = A[`${v.flower}_bud`];
  const CS = F.spline(v.side, 22);
  // z-order: meadow BACK (behind) → bough + branch leaves → meadow FRONT (grasses over the foot)
  const foliage = BAND.back
    + F.branch(MAIN, 16, 3.2, { knots: [0.3, 0.62] })
    + F.knot(150, 180) + F.knot(212, 132) + F.knot(92, 228)
    + F.branch(v.side, 6.2, 1.7, {})
    + (v.extraTwig ? F.branch(v.extraTwig, 4.5, 1.5, {}) : "")
    + F.leavesAlong(CM, 0.2, 0.66, 5, 33, 18, 44, "lf3")
    + F.leavesAlong(CS, v.sideLeaves[0], v.sideLeaves[1], v.sideLeaves[2], v.sideLeaves[3], v.sideLeaves[4], v.sideLeaves[5], "lf3")
    + BAND.front;
  const blooms = v.blooms.map((bl) => bloom(bl.l, bl.t, bl.k === "main" ? bl.s * 0.9 : bl.s, bl.k, f, b, bl.rot || 0)).join("");
  const cr = v.creature.fn(v.creature.l, v.creature.t, v.creature.s);
  return svg(foliage, 1) + blooms + cr;
};

const card = (v, i) => `
<div class="card">
  <div class="tag">${v.tag}</div>
  <button class="stage" onclick="this.classList.toggle('bud')" aria-label="Tap to rebloom">${stageFor(v)}<span class="hint">tap to rebloom ↺</span></button>
  <div class="titlerow"><span class="heart">♥</span><span class="ttl">Your plate</span></div>
  <div class="stylename">${i + 1} · ${v.name}</div>
  <div class="blurb">${v.blurb}</div>
</div>`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FemWell — Flora Hero · realistic branch</title>
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
  .rb-bud{display:none}.stage.bud .rb-full{display:none}.stage.bud .rb-bud{display:block}
  .hint{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--crimson);opacity:.85;z-index:5}
  .titlerow{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:0}
  .heart{color:var(--crimson);font-size:15px}.ttl{font-family:var(--script);font-weight:400;font-size:42px;line-height:1.02;color:var(--oxblood)}
  .stylename{text-align:center;font-family:var(--serif);font-weight:600;font-size:18px;color:var(--oxblood);margin-top:4px}
  .blurb{text-align:center;font-family:var(--serif);font-size:14.5px;color:var(--muted);line-height:1.5;max-width:400px;margin:4px auto 0}
  .foot{font-family:var(--sans);font-size:12px;color:var(--muted);text-align:center;margin-top:24px;line-height:1.6}
</style></head><body><div class="doc">
<div class="eyebrow">FemWell · flora hero · a dusk meadow · pick one</div>
<h1>Grown from a meadow</h1>
<p class="lede">The bough now rises out of a real little patch of dusk wildflower meadow — yarrow, cow-parsley, layered grasses. Only the side twig &amp; the flower change.</p>
<div class="intro"><p><b>Researched real references</b> (wildflower meadows at dusk): fields layer — <b>tall hazy grasses &amp; wild plants behind → mid wildflowers → a dense clump of grass tufts at the base</b>; the signature flower is <b>yarrow</b> (flat white umbels on thin stems) with <b>cow-parsley lace</b> and grass <b>seed-heads catching the low light</b>; the palette is warm but <b>muted</b> (dusk, not garish).</p><p>So the surround was rebuilt to that feeling: a <b>layered, natural meadow patch</b> — back grasses for depth, yarrow &amp; umbellifers, a dense tuft where the bough roots, soft dusk shadow — instead of a few cartoon blades. The <b>realistic tapered bough</b> (curved bark, real leaves) and <b>no dashed ring</b> stay. <b>What varies:</b> only the <b>side twig</b> + the <b>flower</b>. Every one still <b>reblooms on tap</b> (bud → full — tap a header), keeps the <b>mood tint</b> + <b>companion creature</b>. Pick the flower/feel; the meadow &amp; bough stay constant.</p></div>
${V.map(card).join("\n")}
<div class="foot">Demo only — the live hero currently looks artificial; once you pick, this realistic bough replaces the rotation and folds into BRAND_IDENTITY.md §6.8. Openness / mood tint / creature preserved.<br>FemWell · the flora signature</div>
</div>
<style>${A.keyframes}</style>
</body></html>`;

fs.writeFileSync("C:/Users/Halli/femwell-handoff/FLORA-BRANCH-REALISM.html", html);
console.log("wrote FLORA-BRANCH-REALISM.html", (html.length / 1024).toFixed(0) + "KB");
