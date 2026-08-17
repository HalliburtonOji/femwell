// appAudit.cjs — whole-app UX/UI audit capture. Full-page screenshots of every major surface at
// 390 (+ overflow check at 360/430) AND a per-surface metric scan: section/heading count (cognitive
// load proxy), tap-target count + how many under 44px (Apple min), horizontal scrollers + peek px
// (discoverability), low-contrast candidates, morning-overlay presence. Read-only; no writes.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "appaudit");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }

const ROUTES = ["Today", "Lifestyle", "Community", "Nutrition", "Journal", "Health", "Garden", "Jess", "Profile", "Pulse", "Planner", "ProgramsHub"];

const SCAN = `() => {
  const vw = innerWidth;
  const txt = document.body.innerText;
  // section/heading count — cognitive-load proxy (distinct headings + eyebrows)
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,[class*="eyebrow" i],[class*="Eyebrow"]')].map(e=>(e.textContent||'').trim()).filter(t=>t.length>1&&t.length<60);
  const uniqHeads = [...new Set(heads)];
  // tap targets — interactive elements + under-44px count (Apple min)
  const inter = [...document.querySelectorAll('button,a,[role="button"],input,select,[onclick]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;});
  const small = inter.filter(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)<44;});
  const tiny = inter.filter(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)<32;});
  // horizontal scrollers + peek (discoverability of off-screen content)
  const hscroll = [...document.querySelectorAll('div')].filter(e=>{const s=getComputedStyle(e);return (s.overflowX==='auto'||s.overflowX==='scroll')&&e.scrollWidth>e.clientWidth+8;}).map(e=>{
    const kids=[...e.children].filter(c=>c.getBoundingClientRect().width>20);const c1=kids[1];const r=e.getBoundingClientRect();
    return {cls:(e.className&&e.className.toString?e.className.toString():'').slice(0,24),n:kids.length,overflowPx:e.scrollWidth-e.clientWidth,peek:c1?Math.round(vw-c1.getBoundingClientRect().left):'none',hasMask:/mask/i.test(e.getAttribute('style')||'')};
  }).slice(0,12);
  // low-contrast candidates (alpha-naive; false-positive prone but flags the warm-on-warm risk)
  const lum=c=>{const m=(c||'').match(/[\\d.]+/g);if(!m)return null;return (0.299*+m[0]+0.587*+m[1]+0.114*+m[2]);};
  const lowc=[];const seen=new Set();
  for(const el of document.querySelectorAll('p,span,div,a,button,h3,h4,li')){const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(!t||t.length<3)continue;const r=el.getBoundingClientRect();if(r.width<4||r.height<4)continue;const s=getComputedStyle(el);if(s.opacity==='0'||s.visibility==='hidden')continue;let bg=null,be=el;for(let i=0;i<6&&be;i++){const b=getComputedStyle(be).backgroundColor;if(b&&b!=='rgba(0, 0, 0, 0)'&&b!=='transparent'){bg=b;break;}be=be.parentElement;}const fl=lum(s.color),bl=bg?lum(bg):null;if(fl!=null&&bl!=null){const ratio=(Math.max(fl,bl)+0.05*255)/(Math.min(fl,bl)+0.05*255);if(ratio<3.5){const k=t.slice(0,24)+s.color;if(!seen.has(k)){seen.add(k);lowc.push({t:t.slice(0,26),color:s.color,size:s.fontSize,ratioApprox:+ratio.toFixed(2)});}}}}
  return {
    vw, private:/this page is private/i.test(txt), bodyLen:txt.length,
    docScrollW:document.scrollingElement.scrollWidth, pageOverflow:document.scrollingElement.scrollWidth>vw+1,
    sectionCount:uniqHeads.length, headings:uniqHeads.slice(0,22),
    tapTargets:inter.length, under44:small.length, under32:tiny.length,
    hscrollers:hscroll,
    lowContrast:lowc.slice(0,10),
    morningOverlay:/good (morning|afternoon|evening)/i.test(txt)&&/start my day/i.test(txt),
  };
}`;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const report = {};

  // capture the MORNING OVERLAY once (first load, before dismiss)
  await page.goto("https://femwells.com/Today", { waitUntil: "networkidle", timeout: 55000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT, "_morning_overlay.png") }).catch(() => {});
  const overlay = await page.evaluate(() => ({ hasStartMyDay: /start my day/i.test(document.body.innerText), greeting: (document.body.innerText.match(/good (morning|afternoon|evening)[^\n]{0,40}/i) || [''])[0] }));
  report._morningOverlay = overlay;

  for (const r of ROUTES) {
    const rec = { console: [], net: [] };
    const onC = m => { if (m.type() === "error") rec.console.push(m.text().slice(0, 80)); };
    const onE = e => rec.console.push("PAGEERR " + String(e).slice(0, 80));
    const onR = res => { if (res.status() >= 400) rec.net.push(res.status()); };
    page.on("console", onC); page.on("pageerror", onE); page.on("response", onR);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("https://femwells.com/" + r, { waitUntil: "networkidle", timeout: 55000 }).catch(() => {});
    await page.waitForTimeout(4200);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day|18 or over|come in/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
    await page.waitForTimeout(1300);
    rec.scan = await page.evaluate(new Function("return (" + SCAN + ")()")).catch(e => "ERR " + e);
    await page.screenshot({ path: path.join(OUT, r + ".png"), fullPage: true }).catch(() => {});
    // overflow at 360/430
    for (const w of [360, 430]) { await page.setViewportSize({ width: w, height: 844 }); await page.waitForTimeout(700); const ov = await page.evaluate(v => ({ w: v, over: document.scrollingElement.scrollWidth > v + 1, scrollW: document.scrollingElement.scrollWidth }), w).catch(() => null); rec["ov" + w] = ov; }
    page.off("console", onC); page.off("pageerror", onE); page.off("response", onR);
    report[r] = rec;
    const s = rec.scan || {};
    console.log(r.padEnd(11), "sections:", s.sectionCount, "| taps:", s.tapTargets, "u44:", s.under44, "u32:", s.under32, "| hscroll:", (s.hscrollers || []).length, "| lowContrast:", (s.lowContrast || []).length, "| overflow390:", s.pageOverflow, "| console:", rec.console.length);
  }

  fs.writeFileSync(path.join(OUT, "APP_AUDIT.json"), JSON.stringify(report, null, 1));
  await ctx.close();
  console.log("\\nWROTE APP_AUDIT.json + screenshots to", OUT);
})();
