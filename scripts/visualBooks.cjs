// visualBooks.cjs — reach the Books board (Free Classics), test the gutendex fetch, and check
// each Track C board + shell for zero-height / invisible-text / low-contrast text via the DOM,
// then screenshot the Books board.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }

// crude contrast: flag visible text whose colour is within ~8% luminance of its background
const CONTRAST_FN = `() => {
  const lum = (c) => { const m = c.match(/\\d+/g); if (!m) return null; const [r,g,b] = m.map(Number); return (0.299*r+0.587*g+0.114*b)/255; };
  const out = [];
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,div,a,button,li')) {
    const t = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
    if (!t || t.length < 2) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const s = getComputedStyle(el); if (s.visibility==='hidden'||s.opacity==='0') continue;
    let bgEl = el, bg = null;
    for (let i=0;i<6 && bgEl;i++){ const b=getComputedStyle(bgEl).backgroundColor; if (b && b!=='rgba(0, 0, 0, 0)' && b!=='transparent'){ bg=b; break;} bgEl=bgEl.parentElement; }
    const fl = lum(s.color), bl = bg?lum(bg):null;
    if (fl!=null && bl!=null && Math.abs(fl-bl) < 0.16) out.push({ t: t.slice(0,40), color: s.color, bg, dL: +Math.abs(fl-bl).toFixed(3) });
  }
  // dedupe
  const seen = new Set(); return out.filter(o=>{ const k=o.t+o.color; if(seen.has(k))return false; seen.add(k); return true; }).slice(0,15);
}`;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto("https://femwells.com/Lifestyle", { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4500);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(600);

  // test the gutendex fetch (Free Classics source) from the page origin
  const gut = await page.evaluate(async () => {
    try { const r = await fetch("https://gutendex.com/books?topic=women&languages=en&page_size=12", { signal: AbortSignal.timeout(8000) }); if (!r.ok) return "http " + r.status; const d = await r.json(); return "ok results=" + (d?.results?.length ?? 0); }
    catch (e) { return "FETCH FAILED: " + String(e).slice(0, 80); }
  });
  console.log("GUTENDEX:", gut);

  // click the "Books" hero chip to jump the board slider to the Books board
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === "Books"); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(1800);
  // scroll down so the Books board's shelves are in view, then shoot
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "V_books_board.png"), fullPage: true });

  // contrast sweep across the shell + every board
  const routes = ["/Lifestyle", "/Mirror", "/Move", "/Kindred", "/Curious", "/Delight", "/Nest", "/Tonight", "/Becoming", "/Make", "/Outside", "/Money"];
  for (const r of routes) {
    await page.goto("https://femwells.com" + r, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(3000);
    const low = await page.evaluate(new Function("return (" + CONTRAST_FN + ")()")).catch(() => "err");
    console.log(r.padEnd(11), "low-contrast:", JSON.stringify(low));
  }
  await ctx.close();
})();
