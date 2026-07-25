// PRE-DEPLOY SMOKE TEST — drive the built bundle in a real browser BEFORE it ships.
//
// WHY THIS EXISTS: on 2026-07-17 a temporal-dead-zone bug (a useMemo deps array referencing
// values declared below it) shipped to production and crashed EVERY route for EVERY user.
// `vite build` was green — a TDZ is a RUNTIME error, the bundler cannot see it — and
// `curl /Lifestyle` returned 200, which only proves the HTML shell served, not that React
// rendered. A green build + a 200 is NOT verification for a render-path change.
//
// This serves dist/ and loads the routes in headless Chromium, failing on an ErrorBoundary or
// any "before initialization"/ReferenceError. Unauthenticated is fine: a TDZ crashes regardless
// of session (that is how the outage reproduced in clean Chrome).
//
// Usage:  npx vite build && node scripts/smokeRender.cjs
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(process.cwd(), "dist");
const ROUTES = ["/", "/Today", "/Lifestyle", "/Journal", "/Nutrition", "/Profile", "/WatchListen", "/Mirror", "/Move", "/Kindred", "/Curious", "/Delight", "/Nest", "/Tonight", "/Becoming", "/Outside", "/Make", "/Money"];
const PORT = 4178;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon" };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  let file = path.join(DIST, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html"); // SPA fallback
  const body = fs.readFileSync(file);
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(body);
});

(async () => {
  if (!fs.existsSync(path.join(DIST, "index.html"))) { console.error("no dist/ — run `npx vite build` first"); process.exit(1); }
  let chromium;
  try { ({ chromium } = require("playwright-core")); }
  catch { console.error("playwright-core not available — cannot smoke-test"); process.exit(1); }

  // find an on-disk chromium (the same one the verifier used)
  const roots = [path.join(process.env.LOCALAPPDATA || "", "ms-playwright"), path.join(process.env.USERPROFILE || "", "AppData", "Local", "ms-playwright")];
  const CANDIDATES = ["chrome-win64/chrome.exe", "chrome-win/chrome.exe", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"];
  let exe = null;
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const d of fs.readdirSync(r)) {
      if (!/^chromium/.test(d)) continue;
      for (const c of CANDIDATES) {
        const full = path.join(r, d, ...c.split("/"));
        if (fs.existsSync(full)) { exe = full; break; }
      }
      if (exe) break;
    }
    if (exe) break;
  }
  if (!exe) { console.error("no local chromium found — cannot smoke-test"); process.exit(1); }

  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: exe, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const fatal = [];
  page.on("pageerror", (e) => {
    const m = String(e);
    if (/before initialization|is not defined|Cannot access/i.test(m)) fatal.push(m.split("\n")[0]);
  });

  let failed = 0;
  for (const route of ROUTES) {
    fatal.length = 0;
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2500); // let requestIdleCallback warm the KEEP_ALIVE pages (that is how the P0 spread)
    const text = await page.evaluate(() => document.body.innerText || "").catch(() => "");
    const boundary = /Something went wrong|Reload|Go Home/i.test(text) && text.length < 400;
    const ok = !boundary && fatal.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? "  ok  " : "  FAIL"} ${route.padEnd(11)} ${boundary ? "ErrorBoundary!" : ""} ${fatal.length ? "| " + fatal[0].slice(0, 90) : ""}`);
  }

  await browser.close();
  server.close();
  if (failed) { console.error(`\nSMOKE FAILED on ${failed} route(s) — DO NOT DEPLOY.`); process.exit(1); }
  console.log("\nSMOKE PASSED — every route rendered, no TDZ/ReferenceError.");
})();
