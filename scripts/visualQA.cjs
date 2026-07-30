// visualQA.cjs — REAL full-page screenshots of the LIVE authed site at 390px.
//
// WHY THIS EXISTS: structural DOM verification (element present / text present / counts) CANNOT
// see empty-but-rendered containers, text overflow/clipping, z-index spill under nav, or
// contrast. Halli's screenshot showed defects our "green" DOM asserts sailed past. This captures
// actual pixels, full-page, scrolled, so a human (or a vision pass) LOOKS at the result.
//
// AUTH: reuses the persisted logged-in Chrome profile the MCP browser created
// (ms-playwright-mcp/mcp-chrome-7fe4e47) via persistent context, so we get the test user's real
// session without a headless login. Launches the same on-disk Chromium the smoke test uses.
//
// Usage:  node scripts/visualQA.cjs [route ...]        (defaults to the full board set)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const PROFILE = path.join(process.env.LOCALAPPDATA || "", "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA || "", "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");

const ROUTES = process.argv.slice(2).length ? process.argv.slice(2)
  : ["/Lifestyle", "/Mirror", "/Move", "/Kindred", "/Curious", "/Delight", "/Nest", "/Tonight", "/Becoming", "/Make", "/Outside", "/Money"];

function findChromium() {
  const root = path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
  for (const d of fs.readdirSync(root)) {
    if (!/^chromium-/.test(d)) continue;
    for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) {
      const f = path.join(root, d, ...c.split("/"));
      if (fs.existsSync(f)) return f;
    }
  }
  return null;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const exe = findChromium();
  if (!exe) { console.error("no chromium found"); process.exit(1); }

  // persistent context = reuse the real logged-in profile (cookies, localStorage)
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: exe, headless: true, viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, args: ["--hide-scrollbars"],
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // confirm we're actually authenticated
  await page.goto("https://femwells.com/Today", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3500);
  const authed = await page.evaluate(async () => {
    try { const me = await window.base44?.auth?.me?.(); return me?.id ? (me.full_name || me.email || "yes") : "NO"; } catch { return "unknown"; }
  }).catch(() => "err");
  console.log("AUTH:", authed);

  const results = [];
  for (const route of ROUTES) {
    try {
      await page.goto("https://femwells.com" + route, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
      await page.waitForTimeout(4000); // hydration + content fetch
      // dismiss the once-a-day morning brief if it's covering the page
      await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
      await page.waitForTimeout(700);
      const name = route.replace(/\//g, "") || "root";
      const file = path.join(OUT, `${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, vw: innerWidth }));
      results.push({ route, file, ...dims });
      console.log(`  shot ${route.padEnd(11)} -> ${name}.png  (${dims.w}x${dims.h}, vw ${dims.vw})`);
    } catch (e) { console.log(`  FAIL ${route}: ${String(e).split("\n")[0]}`); }
  }
  await ctx.close();
  console.log("\nDONE. Screenshots in:\n" + OUT);
})();
