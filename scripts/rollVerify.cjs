// rollVerify.cjs — verify the wider-card roll on EVERY board: card %, peek sliver, page overflow
// at 360/390/430, stray-asterisk titles, console/net errors, + a full-page screenshot per board.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }
const BOARDS = ["Mirror", "Move", "Kindred", "Curious", "Delight", "Nest", "Tonight", "Becoming", "Make", "Outside", "Money"];
const SHELF = { Mirror: "fw-mirror-shelf", Move: "fw-move-shelf", Kindred: "fw-kin-shelf", Curious: "fw-cur-shelf", Delight: "fw-del-shelf", Nest: "fw-nest-shelf", Tonight: "fw-ton-shelf", Becoming: "fw-bec-shelf", Outside: "fw-out-shelf", Money: "fw-mon-shelf", Make: null };

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const rows = [];

  for (const b of BOARDS) {
    const rec = { board: b, console: 0, net: 0 };
    const onC = m => { if (m.type() === "error") rec.console++; };
    const onE = () => rec.console++;
    const onR = r => { if (r.status() >= 400) rec.net++; };
    page.on("console", onC); page.on("pageerror", onE); page.on("response", onR);

    // overflow at 3 widths
    const ovf = {};
    for (const w of [360, 390, 430]) {
      await page.setViewportSize({ width: w, height: 844 });
      await page.goto("https://femwells.com/" + b, { waitUntil: "networkidle", timeout: 50000 }).catch(() => {});
      await page.waitForTimeout(w === 390 ? 3800 : 2600);
      if (w === 390) {
        await page.evaluate((cls) => { window.__cls = cls; window.scrollTo(0, 760); }, SHELF[b]);
        await page.waitForTimeout(500);
        rec.metrics = await page.evaluate((vw) => {
          const s = document.querySelector(window.__cls || "___none");
          const cards = s ? [...s.children].filter(x => x.offsetWidth > 40) : [];
          const c = cards[0], c2 = cards[1];
          const badTitle = [...document.querySelectorAll('h1,h2,h3,h4')].map(e => e.textContent || "").filter(t => /[*~]|(^|\s)_|_(\s|$)/.test(t)).slice(0, 3);
          return {
            cardW: c ? c.offsetWidth : null, cardPct: c ? Math.round(c.offsetWidth / vw * 1000) / 10 : null,
            peekPx: c2 ? Math.round(vw - c2.getBoundingClientRect().left) : (c ? "single-or-nopeek" : "n/a"),
            starTitles: badTitle,
          };
        }, w);
        await page.screenshot({ path: path.join(OUT, "R_" + b + ".png"), fullPage: true }).catch(() => {});
      }
      const sc = await page.evaluate(() => document.scrollingElement.scrollWidth);
      ovf[w] = { scrollW: sc, overflow: sc > w + 1 };
    }
    rec.overflow = ovf;
    page.off("console", onC); page.off("pageerror", onE); page.off("response", onR);
    rows.push(rec);
    const m = rec.metrics || {};
    console.log(b.padEnd(9), "card%:", (m.cardPct || "-"), "peek:", (m.peekPx ?? "-"),
      "| ovf360:", ovf[360].overflow, "390:", ovf[390].overflow, "430:", ovf[430].overflow,
      "| console:", rec.console, "net:", rec.net, "| starTitles:", JSON.stringify(m.starTitles || []));
  }
  fs.writeFileSync(path.join(OUT, "ROLLVERIFY.json"), JSON.stringify(rows, null, 1));
  await ctx.close();
  const bad = rows.filter(r => r.overflow[360].overflow || r.overflow[390].overflow || r.overflow[430].overflow || r.console > 0 || r.net > 0 || (r.metrics && r.metrics.starTitles && r.metrics.starTitles.length));
  console.log("\n" + (bad.length ? "⚠️ ISSUES: " + bad.map(r => r.board).join(",") : "✅ ALL CLEAN — no overflow, no console/net errors, no stray-asterisk titles"));
})();
