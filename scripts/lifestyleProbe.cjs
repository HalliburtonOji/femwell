// lifestyleProbe.cjs — visual before/after proof for the AMBIGUOUS interactions the headless
// harness couldn't cleanly assert (keep-alive duplicate buttons, unknown reader/sheet classes).
// Clicks the VISIBLE control and screenshots before+after so a human can eyeball the change.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }
const shot = (page, n) => page.screenshot({ path: path.join(OUT, "P_" + n + ".png") }).catch(() => {});
async function prep(page, route) {
  await page.goto("https://femwells.com" + route, { waitUntil: "networkidle", timeout: 50000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(1200);
}
const vis = (page, name, exact = false) => page.getByRole('button', { name, exact }).filter({ visible: true }).first();

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const out = {};

  // TimePicker (Lifestyle) — capture the pick title + sub for evening vs few
  await prep(page, "/Lifestyle");
  try {
    await vis(page, 'A whole evening').click({ timeout: 5000 });
    await page.waitForTimeout(900);
    out.timeEvening = await page.evaluate(() => (document.body.innerText.match(/A whole evening[\s\S]{0,240}/) || [''])[0].replace(/\s+/g, ' '));
    await shot(page, 'time_evening'); // NB fullPage off = viewport
    await vis(page, 'A few minutes').click({ timeout: 5000 });
    await page.waitForTimeout(900);
    out.timeFew = await page.evaluate(() => (document.body.innerText.match(/A few minutes[\s\S]{0,240}/) || [''])[0].replace(/\s+/g, ' '));
    out.timePickerChanged = out.timeEvening !== out.timeFew;
  } catch (e) { out.timeErr = String(e).slice(0, 120); }

  // Show me another (Lifestyle intention)
  await prep(page, "/Lifestyle");
  try {
    const grab = () => page.evaluate(() => (document.body.innerText.match(/Set today's intention[\s\S]{0,180}|intention[\s\S]{0,160}/i) || [''])[0].replace(/\s+/g, ' '));
    out.intentBefore = await grab();
    await vis(page, /Show me another/i).click({ timeout: 5000 });
    await page.waitForTimeout(900);
    out.intentAfter = await grab();
    out.intentChanged = out.intentBefore !== out.intentAfter;
  } catch (e) { out.intentErr = String(e).slice(0, 120); }

  // Reader — Today's chapter (screenshot after)
  await prep(page, "/Lifestyle");
  try {
    await vis(page, /Today's chapter/i).click({ timeout: 5000 });
    await page.waitForTimeout(1800);
    out.readerURL = page.url();
    out.readerDOM = await page.evaluate(() => {
      const has = s => document.querySelectorAll(s).length;
      return { fixedOverlays: has('[style*="position: fixed"]'), dialog: has('[role="dialog"]'), bookText: /min left|Turning to the first page|Previous page/i.test(document.body.innerText), reading: has('[class*="Reading"],[class*="reading"]') };
    });
    await shot(page, 'reader_after');
  } catch (e) { out.readerErr = String(e).slice(0, 120); }

  // Jump-to (screenshot after)
  await prep(page, "/Lifestyle");
  try {
    await vis(page, /Jump to/i).click({ timeout: 5000 });
    await page.waitForTimeout(900);
    out.jumpDOM = await page.evaluate(() => ({ hasJumpTo: (document.body.innerText.match(/Jump to/gi) || []).length, gridish: document.querySelectorAll('[style*="grid"] button, [class*="sheet"] button').length, bodyTail: document.body.innerText.replace(/\s+/g, ' ').slice(-300) }));
    await shot(page, 'jump_after');
  } catch (e) { out.jumpErr = String(e).slice(0, 120); }

  // Move mood picker (screenshot each + region text)
  await prep(page, "/Move");
  try {
    const region = () => page.evaluate(() => {
      // find the "Good —" / feeling sub line + first shelf card title
      const t = document.body.innerText;
      const sub = (t.match(/(Good — spend it|Let it out through your body|Move to clear it|A plan, not a target)[\s\S]{0,120}/) || [''])[0].replace(/\s+/g, ' ');
      const firstCard = document.querySelector('.fw-move-shelf .fw-ce-press, .fw-move-shelf [class*="ce-press"]');
      return { sub, first: firstCard ? (firstCard.innerText || '').replace(/\s+/g, ' ').slice(0, 80) : 'none' };
    });
    await vis(page, /Full of it/i).click({ timeout: 4000 }).catch(() => { });
    await page.waitForTimeout(900); out.moveFull = await region(); await shot(page, 'move_full');
    await vis(page, /Wound up/i).click({ timeout: 4000 }).catch(() => { });
    await page.waitForTimeout(900); out.moveWound = await region(); await shot(page, 'move_wound');
    out.moodChanged = JSON.stringify(out.moveFull) !== JSON.stringify(out.moveWound);
  } catch (e) { out.moodErr = String(e).slice(0, 120); }

  // Community deep-link from Kindred — click by TEXT (button has icon+multiline)
  await prep(page, "/Kindred");
  try {
    const clicked = await page.evaluate(() => {
      const el = [...document.querySelectorAll('button,a')].find(b => /in Community/i.test(b.textContent || '') && b.getBoundingClientRect().width > 0);
      if (el) { el.click(); return el.textContent.replace(/\s+/g, ' ').slice(0, 50); }
      return null;
    });
    await page.waitForTimeout(2600);
    out.communityDeep = { clicked, url: page.url(), is404: await page.evaluate(() => /this page is private|not found|404|doesn.t exist/i.test(document.body.innerText)), len: await page.evaluate(() => document.body.innerText.length) };
    await shot(page, 'community_deep');
  } catch (e) { out.commErr = String(e).slice(0, 120); }

  fs.writeFileSync(path.join(OUT, "PROBE.json"), JSON.stringify(out, null, 1));
  await ctx.close();
  console.log(JSON.stringify(out, null, 1));
})();
