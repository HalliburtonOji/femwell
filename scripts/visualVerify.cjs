// visualVerify.cjs — targeted re-capture to PROVE the visual fixes: the Small Mends fade, the
// Free Classics empty-state (on the Books board), and the nav clearance (bottom viewport shot).
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto("https://femwells.com/Lifestyle", { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4500);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(700);

  // 1) full page (Small Mends fade should be clean now)
  await page.screenshot({ path: path.join(OUT, "V_Lifestyle_full.png"), fullPage: true });

  // 2) navigate the board slider to the Books board (Free Classics is its bottom shelf)
  const boards = await page.evaluate(() => {
    const track = document.querySelector(".fw-clipboard-track"); if (!track) return "no track";
    const bs = [...track.children].filter((c) => c.offsetWidth > 40);
    if (bs[3]) track.scrollLeft = bs[3].offsetLeft - track.offsetLeft; // Books = index 3
    return bs.length;
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "V_Lifestyle_books.png"), fullPage: true });

  // 3) nav clearance — scroll to the very bottom, capture VIEWPORT (fixed nav visible in place)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "V_Lifestyle_bottom_viewport.png"), fullPage: false });
  const navInfo = await page.evaluate(() => {
    const fixed = [...document.querySelectorAll("div,nav")].map((e) => ({ e, r: e.getBoundingClientRect(), s: getComputedStyle(e) }))
      .filter((x) => x.s.position === "fixed" && x.r.bottom > innerHeight - 30 && x.r.height > 45 && x.r.height < 180);
    const nav = fixed.sort((a, b) => b.r.height - a.r.height)[0];
    // is any Handy-row / footer text under the nav?
    const handy = [...document.querySelectorAll("*")].find((e) => (e.textContent || "").trim() === "Handy right now");
    return { boards, navTopFromBottom: nav ? Math.round(innerHeight - nav.r.top) : null, navHeight: nav ? Math.round(nav.r.height) : null, handyBottom: handy ? Math.round(handy.getBoundingClientRect().bottom) : null, vh: innerHeight };
  });
  console.log("nav:", JSON.stringify(navInfo));
  await ctx.close();
  console.log("shots: V_Lifestyle_full.png, V_Lifestyle_books.png, V_Lifestyle_bottom_viewport.png");
})();
