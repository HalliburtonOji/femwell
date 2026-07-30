// lifestyleProbe2.cjs — verify Batch A+B fixes + close the two UNVERIFIED items.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }
const shot = (page, n) => page.screenshot({ path: path.join(OUT, "Q_" + n + ".png") }).catch(() => {});
async function prep(page, route) {
  await page.goto("https://femwells.com" + route, { waitUntil: "networkidle", timeout: 50000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(1200);
}
const vis = (page, name) => page.getByRole('button', { name }).filter({ visible: true }).first();

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const out = {};

  // 0) AUTH status (can we test authed writes headless?)
  await prep(page, "/Lifestyle");
  out.auth = await page.evaluate(async () => {
    try { const b = window.base44 || (window.__BASE44__); } catch {}
    try { const r = await fetch('/api/apps/69a9891a6ccccc1822bbb4bc/entities/User/me', { headers: { 'accept': 'application/json' } }); return { meStatus: r.status }; }
    catch (e) { return { meErr: String(e).slice(0, 60) }; }
  });

  // 1) CHAPTER READER markdown (should be formatted, no literal ##)
  try {
    await vis(page, /Today's chapter/i).click({ timeout: 5000 });
    await page.waitForTimeout(1600);
    out.reader = await page.evaluate(() => {
      const txt = document.body.innerText;
      return { hasLiteralHash: /##\s?Chapter/i.test(txt), firstLines: (txt.match(/CHAPTER[\s\S]{0,220}/i) || [''])[0].replace(/\n+/g, ' | ').slice(0, 220) };
    });
    await shot(page, 'reader_md');
  } catch (e) { out.readerErr = String(e).slice(0, 100); }

  // 2) CLICKBAIT gone from /Move (the 'ALL MOMS' title must be absent)
  await prep(page, "/Move");
  out.move = await page.evaluate(() => {
    const txt = document.body.innerText;
    return { hasAllMoms: /ALL MOMS/i.test(txt), hasBreakfastHack: /breakfast hack/i.test(txt), sampleTitles: [...document.querySelectorAll('.fw-move-shelf')].slice(0, 1).map(s => (s.innerText || '').replace(/\s+/g, ' ').slice(0, 140)) };
  });

  // 3) SHOW ME ANOTHER — scroll through, find it, click, verify rotation
  await prep(page, "/Lifestyle");
  try {
    // scroll down in steps until the button exists
    let found = false;
    for (let y = 0; y < 12 && !found; y++) {
      found = await page.evaluate(() => !!([...document.querySelectorAll('button')].find(b => /Show me another/i.test(b.textContent || '') && b.getBoundingClientRect().width > 0)));
      if (!found) { await page.evaluate(() => window.scrollBy(0, 700)); await page.waitForTimeout(400); }
    }
    if (!found) { out.showAnother = { found: false }; }
    else {
      const grab = () => page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => /Show me another/i.test(b.textContent || ''));
        const card = btn ? btn.closest('[class*="Card"],[class*="card"],section,div') : null;
        // capture the card's title/body text near the button
        return card ? (card.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : '';
      });
      const before = await grab();
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Show me another/i.test(x.textContent || '')); if (b) b.click(); });
      await page.waitForTimeout(900);
      const after = await grab();
      out.showAnother = { found: true, changed: before !== after, before: before.slice(0, 70), after: after.slice(0, 70) };
    }
  } catch (e) { out.showAnotherErr = String(e).slice(0, 100); }

  // 4) SAVE/KEEP — click a save control, capture the network write + status + UI change
  await prep(page, "/Lifestyle");
  try {
    const writes = [];
    page.on('request', r => { if (/PUT|POST|PATCH/.test(r.method()) && /entities|functions/.test(r.url())) writes.push({ m: r.method(), u: r.url().slice(0, 80) }); });
    const respStatuses = [];
    page.on('response', r => { if (/PUT|POST|PATCH/.test(r.request().method()) && /entities|functions/.test(r.url())) respStatuses.push(r.status()); });
    // find a save-ish button
    const saveBtn = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find(x => /^(Keep it|Save it|Save for|Save it for the day|Keep it for today)$/i.test((x.textContent || '').trim()) && x.getBoundingClientRect().width > 0);
      if (b) { b.scrollIntoView({ block: 'center' }); return (b.textContent || '').trim(); }
      return null;
    });
    if (!saveBtn) { out.save = { foundBtn: false }; }
    else {
      await page.waitForTimeout(400);
      await page.evaluate((label) => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === label); if (b) b.click(); }, saveBtn);
      await page.waitForTimeout(2000);
      const uiAfter = await page.evaluate((label) => {
        const txt = document.body.innerText;
        return { savedWord: /Saved|Kept|Added|Keeping|Saving/i.test(txt), stillHasLabel: txt.includes(label) };
      }, saveBtn);
      out.save = { foundBtn: true, label: saveBtn, writeReqs: writes.slice(0, 4), respStatuses: respStatuses.slice(0, 4), uiAfter };
    }
  } catch (e) { out.saveErr = String(e).slice(0, 100); }

  fs.writeFileSync(path.join(OUT, "PROBE2.json"), JSON.stringify(out, null, 1));
  await ctx.close();
  console.log(JSON.stringify(out, null, 1));
})();
