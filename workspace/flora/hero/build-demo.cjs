const fs = require("fs");
const F = require("./foliage.cjs");
const j = JSON.parse(fs.readFileSync("ssr-out.txt", "utf8").split("@@@JSON@@@")[1]);
const tex = fs.readFileSync("C:/Users/Halli/femwell-work/workspace/flora/paper-tex.txt", "utf8").trim();
const { full, bud, bee, keyframes } = j;

function bloom(leftP, topP, scale, kind) {
  const wrap = (inner) => `<div style="position:absolute;left:${leftP}px;top:${topP}px;transform:translate(-50%,-50%) scale(${scale});transform-origin:center;z-index:2">${inner}</div>`;
  if (kind === "main") return wrap(`<span class="rebloom"><span class="rb-full">${full}</span><span class="rb-bud">${bud}</span></span>`);
  return wrap(kind === "bud" ? bud : full);
}
const svg = (inner, z = 1) => `<svg viewBox="0 0 300 270" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:${z}" aria-hidden="true">${F.G}${inner}</svg>`;
const beeAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${bee}</div>`;

const T = [];

T.push({ name: "Gathered bouquet", tag: "fuller · a hand-tied bunch",
  blurb: "The bloom joined by two companions of the same flower + buds, on a fan of gathered leaves — a fuller hand-tied bunch instead of one lone stem.",
  stage:
    svg(F.stem(150,245,150,110,2.6,0)+F.stem(150,245,104,150,2.4,-10)+F.stem(150,245,196,150,2.4,10)+F.fan(150,246,7,60,17,-90,150)+F.bud(120,150,-18)+F.bud(182,150,16), 1)
    + bloom(150,96,1,"main") + bloom(104,150,0.6,"full") + bloom(196,150,0.6,"bud")
    + svg(F.leaf(132,236,34,13,-52,"lfg2")+F.leaf(168,236,34,13,52,"lfg"), 3)
    + beeAt(206,70,1) });

T.push({ name: "Blossoming branch", tag: "a flowering bough",
  blurb: "A woody branch arcs across, the bloom opening at a node with buds and leaves along the wood — reads as a flowering branch of a tree.",
  stage:
    svg(F.branch([[24,244],[96,206],[150,150],[212,104],[276,72]],7)
      + F.leaf(96,206,26,10,-120,"lfg2")+F.leaf(212,104,26,10,64,"lfg")+F.leaf(250,86,22,9,52,"lfg2")
      + F.bud(232,92,40)+F.bud(70,214,-60), 1)
    + bloom(150,100,1,"main") + bloom(250,150,0.5,"full")
    + svg(F.leaf(150,150,30,12,150,"lfg"), 3)
    + beeAt(96,150,0.9) });

T.push({ name: "Little tree", tag: "a small flowering tree",
  blurb: "A short trunk under a rounded canopy of layered foliage, the bloom nested near the crown with a couple peeking — a little flowering tree.",
  stage:
    svg(F.branch([[150,266],[150,168]],9) + F.canopy(150,108,84,3), 1)
    + bloom(150,112,0.92,"main") + bloom(108,92,0.42,"full") + bloom(192,96,0.42,"bud")
    + beeAt(210,150,0.85) });

T.push({ name: "Foliage nest", tag: "nested in leaves",
  blurb: "A wide fan of large leaves radiates behind the bloom so it sits nested in foliage — lush and green-forward, the flower cradled in its plant.",
  stage:
    svg(F.fan(150,182,9,86,24,-90,190,"lfg2")+F.fan(150,182,7,64,20,-90,150,"lfg"), 1)
    + bloom(150,120,1,"main")
    + svg(F.leaf(120,196,40,15,-46,"lfg")+F.leaf(180,196,40,15,46,"lfg2")+F.bud(150,206,0), 3)
    + beeAt(206,86,1) });

T.push({ name: "Flowering bush", tag: "a garden bush · many blooms",
  blurb: "A low, wide mound of dense foliage with three blooms of the same flower emerging at different heights — a small flowering garden bush.",
  stage:
    svg(F.canopy(150,176,80,3)+F.stem(122,184,116,116,2)+F.stem(150,188,150,86,2.4)+F.stem(178,184,192,124,2), 1)
    + bloom(150,90,0.86,"main") + bloom(112,120,0.56,"full") + bloom(192,128,0.54,"bud") + bloom(150,158,0.36,"full")
    + svg(F.leaf(128,188,30,12,-58,"lfg")+F.leaf(172,188,30,12,58,"lfg2"), 3)
    + beeAt(212,84,0.9) });

T.push({ name: "Living wreath", tag: "the ring, but alive",
  blurb: "The removed dashed ring becomes a living leafy vine arcing around the bloom — the frame is now foliage, not a dotted circle.",
  stage:
    svg(F.vineArc(150,120,96,16), 1)
    + bloom(150,118,1.05,"main")
    + beeAt(96,52,0.95) });

const card = (t, i) => `
<div class="card">
  <div class="tag">${t.tag}</div>
  <button class="stage" onclick="this.classList.toggle('bud')" aria-label="Tap to rebloom">
    ${t.stage}
    <span class="hint">tap to rebloom ↺</span>
  </button>
  <div class="titlerow"><span class="heart">♥</span><span class="ttl">Your plate</span></div>
  <div class="stylename">${i + 1} · ${t.name}</div>
  <div class="blurb">${t.blurb}</div>
</div>`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FemWell — Flora Header · redesign styles</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500;1,600&family=Ephesis&display=swap" rel="stylesheet">
<style>
  :root{--paper:#ECE7DA;--paperHi:#F4EFE3;--paperDeep:#D8CFBC;--ink:#0B0805;--muted:#2E261B;--gold:#A8893F;--crimson:#BC2E27;--oxblood:#7A1A12;--serif:'Cormorant Garamond',Georgia,serif;--script:'Ephesis',cursive;--sans:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;--paper-tex:url("${tex}")}
  *{box-sizing:border-box}
  html,body{overflow-x:hidden;max-width:100%}
  body{margin:0;min-width:328px;background-color:var(--paper);background-image:radial-gradient(130% 80% at 28% -6%,rgba(255,253,247,.6),rgba(255,253,247,0) 44%),radial-gradient(135% 120% at 50% 48%,rgba(0,0,0,0) 56%,rgba(58,48,32,.16) 100%),linear-gradient(rgba(238,233,222,.5),rgba(238,233,222,.5)),var(--paper-tex);background-size:auto,auto,auto,300px 300px;background-repeat:no-repeat,no-repeat,repeat,repeat;background-blend-mode:normal,normal,normal,multiply;color:var(--ink);font-family:var(--serif);font-size:18px;line-height:1.5;-webkit-font-smoothing:antialiased}
  .doc{max-width:640px;width:100%;margin:0 auto;padding:22px clamp(11px,3.5vw,20px) 80px}
  .eyebrow{font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);text-align:center}
  h1{font-family:var(--script);font-size:clamp(38px,12vw,54px);color:var(--oxblood);margin:6px 0 2px;line-height:1.04;text-align:center;font-weight:400}
  .lede{font-family:var(--serif);font-style:italic;font-size:17px;color:var(--muted);text-align:center;max-width:460px;margin:4px auto 0}
  .intro{background:var(--paperHi);border:1px solid var(--paperDeep);border-left:4px solid var(--gold);border-radius:16px;padding:14px 15px;margin:16px 0}
  .intro p{margin:0;font-size:15.5px}
  .card{position:relative;overflow:hidden;margin:14px 0;padding:16px 14px 15px;border:1px solid var(--paperDeep);border-left:4px solid var(--gold);border-radius:20px;background:linear-gradient(rgba(245,240,229,.55),rgba(245,240,229,.55)),var(--paper-tex) center/300px 300px repeat,linear-gradient(165deg,var(--paperHi) 0%,rgba(168,137,63,.16) 100%);background-blend-mode:normal,multiply,normal;box-shadow:0 4px 20px rgba(58,44,26,.12),0 1px 4px rgba(58,44,26,.08),inset 0 1px 0 rgba(255,255,255,.42)}
  .tag{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px}
  .stage{position:relative;display:block;width:300px;max-width:100%;height:270px;margin:0 auto;border:none;background:transparent;cursor:pointer;padding:0}
  .rb-bud{display:none}.stage.bud .rb-full{display:none}.stage.bud .rb-bud{display:block}
  .hint{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--crimson);opacity:.85;z-index:5}
  .titlerow{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:-4px}
  .heart{color:var(--crimson);font-size:15px}
  .ttl{font-family:var(--script);font-weight:400;font-size:42px;line-height:1.02;color:var(--oxblood)}
  .stylename{text-align:center;font-family:var(--serif);font-weight:600;font-size:18px;color:var(--oxblood);margin-top:4px}
  .blurb{text-align:center;font-family:var(--serif);font-size:14.5px;color:var(--muted);line-height:1.5;max-width:380px;margin:4px auto 0}
  .foot{font-family:var(--sans);font-size:12px;color:var(--muted);text-align:center;margin-top:24px;line-height:1.6}
</style></head><body><div class="doc">
<div class="eyebrow">FemWell · flora header · redesign · pick one</div>
<h1>The flower header, fuller</h1>
<p class="lede">Six ways to make the plant read richer — no dashed ring, the same flower, still tap-to-rebloom.</p>
<div class="intro"><p>Halli's notes: the old hero was <b>thin — one stem, sparse</b>, inside a <b>dashed ring</b>. Here the ring is <b>gone</b> and the flower is grown into a fuller plant — a bush, a branch, a little tree, a nest of leaves, a bouquet, a living wreath. <b>Every style keeps the real bloom</b> (same species, the <b>mood tint</b>, the <b>companion bee</b>) and still <b>reblooms on tap</b> (bud → full). Tap any header to see it rebloom. Pick the one you love.</p></div>
${T.map(card).join("\n")}
<div class="foot">Demo only — nothing live yet. The chosen style folds into BRAND_IDENTITY.md as the canonical flora hero (FwFloraHero), preserving openness / mood tint / creature.<br>FemWell · the flora signature</div>
</div>
<style>${keyframes}</style>
</body></html>`;

fs.writeFileSync("C:/Users/Halli/femwell-handoff/FLORA-HEADER-DEMO.html", html);
console.log("wrote FLORA-HEADER-DEMO.html", (html.length / 1024).toFixed(0) + "KB");
