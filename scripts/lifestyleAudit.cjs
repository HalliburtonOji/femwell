// lifestyleAudit.cjs — PASSIVE adversarial audit of the Lifestyle shell + all 11 boards.
// Per route: console errors, pageerrors, failed network (>=400), full-page 390px screenshot,
// and a DOM audit (overflow/clip, broken/stock images, video header, empty shelves, placeholder
// text, raw numeric labels, invisible text). Plus an overflow-only pass at 360 + 430.
// Writes a JSON report to visualqa/AUDIT.json and PNGs to visualqa/.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }

const ROUTES = ["/Lifestyle", "/Mirror", "/Move", "/Kindred", "/Curious", "/Delight", "/Nest", "/Tonight", "/Becoming", "/Make", "/Outside", "/Money"];

// ---- DOM audit run inside the page ----
const AUDIT_FN = `() => {
  const vw = innerWidth, R = { vw, overflow: [], images: [], video: [], shelves: [], badText: [], invisible: [], pickers: [], facePlay: 0, docScrollW: document.scrollingElement.scrollWidth };
  // overflow / right-edge clip: elements whose right edge exceeds the viewport
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.right > vw + 1.5 && getComputedStyle(el).position !== 'fixed') {
      const t = (el.textContent||'').trim().slice(0,40);
      R.overflow.push({ tag: el.tagName.toLowerCase(), cls: (el.className&&el.className.toString?el.className.toString():'').slice(0,40), right: Math.round(r.right), over: Math.round(r.right - vw), t });
    }
  }
  R.overflow = R.overflow.filter((o,i,a)=>a.findIndex(x=>x.t===o.t&&x.over===o.over)===i).slice(0,25);
  // images: broken / stock
  for (const img of document.querySelectorAll('img')) {
    const src = img.currentSrc || img.src || '';
    if (!src) continue;
    const broken = img.complete && img.naturalWidth === 0;
    const stock = /unsplash|placeholder|lorempix|placehold|picsum|dummyimage|via\\.placeholder|example\\.com/i.test(src);
    if (broken || stock) R.images.push({ src: src.slice(0,90), broken, stock, nw: img.naturalWidth });
  }
  // video (header + any)
  for (const v of document.querySelectorAll('video')) {
    const r = v.getBoundingClientRect();
    R.video.push({ src: (v.currentSrc||v.src||'').slice(0,80), readyState: v.readyState, poster: (v.poster||'').slice(0,60), paused: v.paused, w: Math.round(r.width), h: Math.round(r.height) });
  }
  // horizontal shelves — flex rows that scroll — count children, flag empty
  for (const el of document.querySelectorAll('div')) {
    const s = getComputedStyle(el);
    if (s.display === 'flex' && (s.overflowX === 'auto' || s.overflowX === 'scroll')) {
      const kids = [...el.children].filter(c => c.getBoundingClientRect().width > 20);
      const r = el.getBoundingClientRect();
      if (r.width > 100 && r.height > 40) R.shelves.push({ n: kids.length, w: Math.round(r.width), h: Math.round(r.height), scrollW: el.scrollWidth, cls: (el.className&&el.className.toString?el.className.toString():'').slice(0,30) });
    }
  }
  // placeholder / raw-label / bad text
  const seen = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,button,li,a,div')) {
    const t = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
    if (!t || t.length < 1) continue;
    if (/lorem ipsum|placeholder|\\btest\\b|undefined|NaN|\\[object|null null/i.test(t) || /^\\d{3,}$/.test(t)) {
      if (!seen.has(t)) { seen.add(t); R.badText.push(t.slice(0,50)); }
    }
  }
  // invisible text: visible element with text whose color == its background exactly, or opacity 0 wrapper
  const lum = c => { const m=(c||'').match(/[\\d.]+/g); if(!m) return null; return (0.299*+m[0]+0.587*+m[1]+0.114*+m[2]); };
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,li')) {
    const t = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
    if (!t || t.length < 2) continue;
    const r = el.getBoundingClientRect(); if (r.width<2||r.height<2) continue;
    const s = getComputedStyle(el);
    if (s.opacity === '0' || s.visibility === 'hidden' || s.color === s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      R.invisible.push({ t: t.slice(0,30), color: s.color, opacity: s.opacity });
    }
  }
  R.invisible = R.invisible.slice(0,10);
  // picker chips (buttons in a row near the top, short labels)
  R.pickers = [...document.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(t=>t&&t.length<28).slice(0,40);
  R.facePlay = document.querySelectorAll('[aria-label*="lay" i],[data-play],button svg.lucide-play,button [class*="lay"]').length;
  return R;
}`;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const report = {};

  for (const route of ROUTES) {
    const name = route.replace("/", "") || "root";
    const rec = { route, console: [], pageerror: [], net: [], audit: null, overflow360: null, overflow430: null };
    const onConsole = m => { if (m.type() === "error") rec.console.push(m.text().slice(0, 140)); };
    const onPageErr = e => rec.pageerror.push(String(e).slice(0, 160));
    const onResp = r => { const s = r.status(); if (s >= 400) rec.net.push({ s, u: r.url().slice(0, 110) }); };
    page.on("console", onConsole); page.on("pageerror", onPageErr); page.on("response", onResp);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("https://femwells.com" + route, { waitUntil: "networkidle", timeout: 50000 }).catch(() => {});
    await page.waitForTimeout(4500);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
    await page.waitForTimeout(1200);
    rec.audit = await page.evaluate(new Function("return (" + AUDIT_FN + ")()")).catch(e => "AUDIT ERR " + e);
    await page.screenshot({ path: path.join(OUT, "A_" + name + ".png"), fullPage: true }).catch(() => {});

    // overflow-only at 360 + 430
    for (const w of [360, 430]) {
      await page.setViewportSize({ width: w, height: 844 });
      await page.waitForTimeout(900);
      const ov = await page.evaluate((vw) => {
        const out = [];
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) continue;
          if (r.right > vw + 1.5 && getComputedStyle(el).position !== 'fixed') {
            out.push({ tag: el.tagName.toLowerCase(), over: Math.round(r.right - vw), t: (el.textContent || '').trim().slice(0, 30) });
          }
        }
        return { docScrollW: document.scrollingElement.scrollWidth, vw, off: out.filter((o, i, a) => a.findIndex(x => x.t === o.t && x.over === o.over) === i).slice(0, 15) };
      }, w).catch(e => "ERR " + e);
      rec["overflow" + w] = ov;
    }

    page.off("console", onConsole); page.off("pageerror", onPageErr); page.off("response", onResp);
    report[name] = rec;
    console.log(name.padEnd(10), "console:", rec.console.length, "pageerr:", rec.pageerror.length, "net>=400:", rec.net.length,
      "| overflow390:", (rec.audit && rec.audit.overflow ? rec.audit.overflow.length : "?"),
      "360scrollW:", (rec.overflow360 && rec.overflow360.docScrollW), "430scrollW:", (rec.overflow430 && rec.overflow430.docScrollW),
      "| badText:", (rec.audit && rec.audit.badText ? rec.audit.badText.length : "?"),
      "brokenImg:", (rec.audit && rec.audit.images ? rec.audit.images.length : "?"));
  }

  fs.writeFileSync(path.join(OUT, "AUDIT.json"), JSON.stringify(report, null, 1));
  await ctx.close();
  console.log("\\nWROTE AUDIT.json");
})();
