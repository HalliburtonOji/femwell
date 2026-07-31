// measureLayout.cjs — measure the CURRENT clipboard/board/card widths (% of viewport), frame
// border weights + padding, and outer margins, on /Lifestyle (ClipboardSlider) + /Curious (Shelf),
// at 360/390/430. Baseline for the "fill ~85%, lighter frame" pass.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }
async function prep(page, route) {
  await page.goto("https://femwells.com" + route, { waitUntil: "networkidle", timeout: 50000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(1000);
}
const pct = (w, vw) => Math.round((w / vw) * 1000) / 10;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const out = {};

  for (const w of [360, 390, 430]) {
    await page.setViewportSize({ width: w, height: 844 });
    // ---- Lifestyle (ClipboardSlider) ----
    await prep(page, "/Lifestyle");
    out["Lifestyle@" + w] = await page.evaluate((vw) => {
      const R = { vw };
      const track = document.querySelector('.fw-clipboard-track');
      const board = track && [...track.children].find(c => c.offsetWidth > 40);
      const section = board && board.querySelector('section');
      const cs = section && getComputedStyle(section);
      // inner content card (PeekShelf card / CoverCard)
      const inner = document.querySelector('.fw-peek-track > div, .fw-peek-track [class*="ce-press"]');
      const container = document.querySelector('[style*="max-width: 480"], [style*="maxWidth: 480"]') || (track && track.closest('div[style*="max-width"]'));
      return {
        vw,
        boardW: board ? board.offsetWidth : null,
        boardPct: board ? Math.round(board.offsetWidth / vw * 1000) / 10 : null,
        section: cs ? { borderLeft: cs.borderLeftWidth, border: cs.borderTopWidth, radius: cs.borderTopLeftRadius, padTop: cs.paddingTop, padSide: cs.paddingLeft, shadow: cs.boxShadow.slice(0, 40) } : null,
        innerCardW: inner ? inner.offsetWidth : null,
        innerCardPct: inner ? Math.round(inner.offsetWidth / vw * 1000) / 10 : null,
        containerMaxW: container ? getComputedStyle(container).maxWidth : null,
        containerPad: container ? getComputedStyle(container).paddingLeft : null,
      };
    }, w);

    // ---- Curious (Shelf + CoverCard) ----
    await prep(page, "/Curious");
    out["Curious@" + w] = await page.evaluate((vw) => {
      const shelfCard = document.querySelector('.fw-cur-shelf > div');
      const cover = shelfCard && (shelfCard.querySelector('[class*="ce-press"]') || shelfCard.firstElementChild);
      const cs = cover && getComputedStyle(cover);
      const container = document.querySelector('[style*="max-width: 480"], [style*="maxWidth: 480"]');
      return {
        vw,
        cardW: shelfCard ? shelfCard.offsetWidth : null,
        cardPct: shelfCard ? Math.round(shelfCard.offsetWidth / vw * 1000) / 10 : null,
        cover: cs ? { border: cs.borderTopWidth, radius: cs.borderTopLeftRadius, pad: cs.paddingLeft, shadow: cs.boxShadow.slice(0, 40) } : null,
        containerMaxW: container ? getComputedStyle(container).maxWidth : null,
        containerPad: container ? getComputedStyle(container).paddingLeft : null,
      };
    }, w);
  }

  fs.writeFileSync(path.join(path.dirname(fs.realpathSync(__filename)), "..", "scratchpad_measure.json"), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await ctx.close();
})();
