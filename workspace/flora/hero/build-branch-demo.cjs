const fs = require("fs");
const F = require("./foliage2.cjs");
const j = JSON.parse(fs.readFileSync("ssr-out.txt", "utf8").split("@@@JSON@@@")[1]);
const tex = fs.readFileSync("C:/Users/Halli/femwell-work/workspace/flora/paper-tex.txt", "utf8").trim();
const A = j; // {full,mid,bud,peonyFull,peonyBud,bee,bfly,keyframes}

// place a bloom; main=rebloomable (full<->bud). kinds: main|full|mid|bud|peony|peonyBud
function bloom(leftP, topP, scale, kind, rot = 0) {
  const t = `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`;
  const wrap = (inner) => `<div style="position:absolute;left:${leftP}px;top:${topP}px;transform:${t};transform-origin:center;z-index:2">${inner}</div>`;
  if (kind === "main") return wrap(`<span class="rebloom"><span class="rb-full">${A.full}</span><span class="rb-bud">${A.bud}</span></span>`);
  if (kind === "peonyMain") return wrap(`<span class="rebloom"><span class="rb-full">${A.peonyFull}</span><span class="rb-bud">${A.peonyBud}</span></span>`);
  const map = { full: A.full, mid: A.mid, bud: A.bud, peony: A.peonyFull };
  return wrap(map[kind] || A.full);
}
const layer = (inner, z, extra = "") => `<svg viewBox="0 0 300 290" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:${z};${extra}" aria-hidden="true">${F.G}${F.G2}${inner}</svg>`;
const beeAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bee}</div>`;
const bflyAt = (l, t, s = 1) => `<div style="position:absolute;left:${l}px;top:${t}px;transform:scale(${s});z-index:4">${A.bfly}</div>`;

const V = [];

// V1 — Bough in bloom: dense 3-bloom cluster + buds + dense leaves + grass at the rooted base
V.push({ name: "Bough in bloom", tag: "a dense flowering bough",
  blurb: "The branch carries a cluster of three blooms with buds between, dense leaves all along the wood, and a tuft of grass at its rooted foot — the fullest bough.",
  stage:
    layer(F.cluster(150,150,5,30,11,-40,150,"lfgBk"), 1, "opacity:.7") // back leaves (depth)
    + layer(F.branch([[26,250],[92,214],[150,150],[214,110],[276,80]],8)
        + F.cluster(92,214,4,26,10,60,120)+F.cluster(214,110,4,26,10,-30,120)+F.cluster(150,150,4,24,9,150,110)
        + F.leaf(250,92,24,10,58,"lfg2")+F.leaf(60,232,22,9,-118,"lfg")
        + F.bud(238,96,44)+F.bud(70,224,-58)+F.bud(180,120,20)
        + F.grass(60,252,64,11,24)+F.petals(120,236,3), 1)
    + bloom(150,108,0.98,"main") + bloom(112,150,0.62,"mid") + bloom(196,132,0.6,"bud", 8)
    + layer(F.leaf(150,150,28,11,150,"lfg"), 3)
    + beeAt(214,66,1) });

// V2 — Arching garland bough with trailing leaves + grass bed centred
V.push({ name: "Arching garland", tag: "an arc of blossom",
  blurb: "The bough arcs up and over like a garland, blooms hung along the crest and leaves trailing down beneath, grounded on a soft bed of grass.",
  stage:
    layer(F.branch([[30,258],[64,150],[150,84],[236,150],[270,258]],7)
        + F.cluster(64,150,4,24,9,190,130)+F.cluster(236,150,4,24,9,-10,130)
        + F.leaf(150,90,26,11,110,"lfg")+F.leaf(150,90,26,11,70,"lfg2")
        + F.bud(92,120,-30)+F.bud(208,120,30)
        + F.leaf(58,178,22,9,150,"lfg2")+F.leaf(242,178,22,9,30,"lfg")
        + F.grass(150,260,120,15,26)+F.grass(38,260,40,7,20)+F.grass(262,260,40,7,20)+F.petals(150,244,4), 1)
    + bloom(150,94,0.9,"main") + bloom(82,132,0.56,"mid", -12) + bloom(218,132,0.56,"bud", 12)
    + beeAt(150,50,0.95) });

// V3 — Grounded upright branch rising from a clear grass bed
V.push({ name: "Grounded branch", tag: "rooted in grass",
  blurb: "A more upright branch rises straight out of a full bed of grass — clearly rooted, not floating — with two blooms, buds and framing leaves.",
  stage:
    layer(F.cluster(150,150,5,28,11,-90,130,"lfgBk"), 1, "opacity:.65")
    + layer(F.branch([[150,262],[146,196],[158,140],[150,96]],8)
        + F.branch([[150,150],[196,120]],5)+F.branch([[150,180],[112,152]],5)
        + F.cluster(150,150,4,26,10,20,120)+F.cluster(150,180,4,26,10,200,120)
        + F.leaf(150,120,26,11,40,"lfg2")+F.leaf(150,120,26,11,-40,"lfg")
        + F.bud(200,116,30)+F.bud(108,148,-30)+F.bud(150,104,0)
        + F.grass(150,262,140,18,30)+F.petals(120,246,3)+F.petals(190,250,2), 1)
    + bloom(196,116,0.6,"mid", 12) + bloom(112,150,0.6,"bud", -12) + bloom(150,110,0.94,"main")
    + beeAt(206,86,0.9) });

// V4 — Layered depth: a soft back bough + a crisp front bough with blooms
V.push({ name: "Layered depth", tag: "two boughs · real depth",
  blurb: "A soft, paler bough sits behind a crisp front branch so the scene has real depth — blooms on the front wood, hazy foliage behind, grass below.",
  stage:
    layer(F.branch([[40,120],[130,150],[210,120],[280,150]],6)+F.cluster(130,150,5,26,10,-40,150,"lfgBk")+F.cluster(210,120,5,26,10,-40,150,"lfgBk")+F.bud(70,132,-20)+F.bud(250,132,20), 1, "opacity:.5;filter:blur(0.6px)")
    + layer(F.branch([[24,250],[96,206],[164,150],[236,120],[284,102]],8)
        + F.cluster(96,206,4,26,10,55,120)+F.cluster(164,150,4,26,10,-25,120)
        + F.leaf(236,110,24,10,56,"lfg2")+F.bud(214,110,40)+F.bud(72,222,-56)
        + F.grass(64,252,68,12,24)+F.petals(130,236,3), 1)
    + bloom(164,108,0.94,"main") + bloom(236,142,0.5,"mid", 10)
    + beeAt(206,74,0.95) });

// V5 — Blossom spray: many small blooms + buds along the branch (cherry-blossom feel)
V.push({ name: "Blossom spray", tag: "many blooms · a spray",
  blurb: "The whole branch breaks into blossom — many smaller blooms and buds scattered along it with fine leaves, like a spray of spring branch, over grass.",
  stage:
    layer(F.branch([[22,244],[88,214],[150,168],[214,120],[278,84]],7)
        + F.branch([[150,168],[176,130]],4)+F.branch([[88,214],[70,176]],4)
        + F.cluster(120,190,3,18,7,40,110)+F.cluster(190,140,3,18,7,-20,110)+F.cluster(70,176,3,16,6,120,100)
        + F.bud(96,196,-40)+F.bud(176,128,20)+F.bud(240,100,44)+F.bud(140,176,10)+F.bud(206,124,30)
        + F.leaf(258,92,20,8,54,"lfg2")+F.leaf(52,228,18,7,-120,"lfg")
        + F.grass(72,246,70,12,24)+F.petals(150,232,4), 1)
    + bloom(150,150,0.7,"main") + bloom(100,186,0.46,"mid",-14) + bloom(206,120,0.5,"bud",14) + bloom(246,92,0.36,"mid",26)
    + beeAt(214,64,0.95)+bflyAt(70,120,0.85) });

// V6 — Peony bough: the fuller-petal bloom on the branch
V.push({ name: "Peony bough", tag: "fuller petals",
  blurb: "The same idea with the fuller, many-petalled bloom (peony) for maximum petal richness — a lush double bloom on a leafy bough over grass. (Species is a dial — any flower works.)",
  stage:
    layer(F.cluster(150,150,5,30,12,-40,150,"lfgBk"), 1, "opacity:.7")
    + layer(F.branch([[26,250],[94,212],[158,150],[224,112],[280,86]],8)
        + F.cluster(94,212,4,28,11,58,120)+F.cluster(158,150,4,26,10,-28,120)
        + F.leaf(252,96,26,11,58,"lfg2")+F.bud(226,100,42)+F.bud(74,222,-56)+F.bud(190,124,22)
        + F.grass(66,252,66,11,24)+F.petals(126,236,3), 1)
    + bloom(158,106,0.98,"peonyMain") + bloom(112,152,0.6,"bud", 8)
    + layer(F.leaf(158,148,28,11,150,"lfg"), 3)
    + beeAt(220,66,1) });

const card = (v, i) => `
<div class="card">
  <div class="tag">${v.tag}</div>
  <button class="stage" onclick="this.classList.toggle('bud')" aria-label="Tap to rebloom">
    ${v.stage}
    <span class="hint">tap to rebloom ↺</span>
  </button>
  <div class="titlerow"><span class="heart">♥</span><span class="ttl">Your plate</span></div>
  <div class="stylename">${i + 1} · ${v.name}</div>
  <div class="blurb">${v.blurb}</div>
</div>`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FemWell — Blossoming Branch · variations</title>
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
  .lede{font-family:var(--serif);font-style:italic;font-size:17px;color:var(--muted);text-align:center;max-width:470px;margin:4px auto 0}
  .intro{background:var(--paperHi);border:1px solid var(--paperDeep);border-left:4px solid var(--gold);border-radius:16px;padding:14px 15px;margin:16px 0}
  .intro p{margin:0 0 8px;font-size:15.5px}.intro p:last-child{margin:0}
  .card{position:relative;overflow:hidden;margin:14px 0;padding:16px 14px 15px;border:1px solid var(--paperDeep);border-left:4px solid var(--gold);border-radius:20px;background:linear-gradient(rgba(245,240,229,.5),rgba(245,240,229,.5)),var(--paper-tex) center/300px 300px repeat,linear-gradient(165deg,var(--paperHi) 0%,rgba(168,137,63,.15) 100%);background-blend-mode:normal,multiply,normal;box-shadow:0 4px 20px rgba(58,44,26,.12),0 1px 4px rgba(58,44,26,.08),inset 0 1px 0 rgba(255,255,255,.42)}
  .tag{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px}
  .stage{position:relative;display:block;width:300px;max-width:100%;height:290px;margin:0 auto;border:none;background:transparent;cursor:pointer;padding:0}
  .rb-bud{display:none}.stage.bud .rb-full{display:none}.stage.bud .rb-bud{display:block}
  .hint{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--crimson);opacity:.85;z-index:5}
  .titlerow{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:0}
  .heart{color:var(--crimson);font-size:15px}
  .ttl{font-family:var(--script);font-weight:400;font-size:42px;line-height:1.02;color:var(--oxblood)}
  .stylename{text-align:center;font-family:var(--serif);font-weight:600;font-size:18px;color:var(--oxblood);margin-top:4px}
  .blurb{text-align:center;font-family:var(--serif);font-size:14.5px;color:var(--muted);line-height:1.5;max-width:400px;margin:4px auto 0}
  .foot{font-family:var(--sans);font-size:12px;color:var(--muted);text-align:center;margin-top:24px;line-height:1.6}
</style></head><body><div class="doc">
<div class="eyebrow">FemWell · flora header · the blossoming branch · pick one</div>
<h1>The blossoming branch, richer</h1>
<p class="lede">You picked the branch — here it is with more: more blooms &amp; petals, more leaves, a bed of grass, real depth.</p>
<div class="intro"><p><b>The brief:</b> the branch is the direction, it just needs <b>MORE</b> — more flower &amp; petals, more leaves framing the wood, a little <b>grass at the base</b> so it&rsquo;s grounded not floating, and more lush depth &amp; life.</p><p>Six richer takes below. <b>Every one keeps the real bloom</b> (same species, the <b>mood tint</b>, the <b>companion bee</b>), has <b>no dashed ring</b>, sits on the real card, and <b>still reblooms on tap</b> (bud → full — tap any header). Pick the one that sings.</p></div>
${V.map(card).join("\n")}
<div class="foot">Demo only — nothing live yet. The chosen branch folds into BRAND_IDENTITY.md as the canonical flora hero (FwFloraHero), preserving openness / mood tint / creature.<br>FemWell · the flora signature</div>
</div>
<style>${A.keyframes}</style>
</body></html>`;

fs.writeFileSync("C:/Users/Halli/femwell-handoff/FLORA-BRANCH-DEMO.html", html);
console.log("wrote FLORA-BRANCH-DEMO.html", (html.length / 1024).toFixed(0) + "KB");
