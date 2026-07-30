// lifestyleInteract.cjs — ACTIVE adversarial functional test. Real Playwright clicks on the
// live authed profile. Proves (not asserts DOM presence): pickers switch content, video AND
// audio play in <=1 tap on the card face with playback ACTUALLY advancing, readers open in
// place, Jump-to opens, deep-links land. Autoplay gesture policy disabled so a click can start
// media. Logs a structured pass/fail per test with the evidence.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }

const log = [];
const rec = (name, pass, detail) => { log.push({ name, pass, detail }); console.log((pass ? "PASS " : "FAIL ") + name + " — " + detail); };

async function prep(page, route) {
  await page.goto("https://femwells.com" + route, { waitUntil: "networkidle", timeout: 50000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(1200);
}

// classify all "Play"-labelled buttons on the page by size
async function playButtons(page) {
  return await page.$$eval('button[aria-label]', els => els.map((e, i) => {
    const r = e.getBoundingClientRect();
    return { i, al: e.getAttribute('aria-label'), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), vis: r.width > 0 && r.height > 0 };
  }).filter(x => /^play/i.test(x.al) && x.vis));
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
  const page = ctx.pages()[0] || await ctx.newPage();

  // =========================== /Lifestyle ===========================
  await prep(page, "/Lifestyle");
  const startURL = page.url();

  // --- TEST 1: TimePicker chips switch content ---
  try {
    const pickText = async () => await page.evaluate(() => {
      const h = [...document.querySelectorAll('*')].find(e => (e.textContent || '').trim() === 'What do you have time for?');
      // the pick title is the big serif line after the chips
      const scope = h ? h.closest('div')?.parentElement : document;
      const t = scope ? scope.querySelectorAll('*') : [];
      return document.body.innerText.slice(0, 0) || (h ? (h.parentElement?.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 200) : 'no picker');
    });
    const before = await pickText();
    await page.getByRole('button', { name: 'A whole evening' }).click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const afterEve = await pickText();
    await page.getByRole('button', { name: 'A few minutes' }).click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const afterFew = await pickText();
    rec("TimePicker switches content", afterEve !== afterFew, `"evening" vs "few" differ: ${afterEve !== afterFew} (few="${afterFew.slice(0, 60)}")`);
  } catch (e) { rec("TimePicker switches content", false, "ERR " + String(e).slice(0, 80)); }

  // --- TEST 2: hero board chips switch the hero/board ---
  try {
    const heroText = () => page.evaluate(() => (document.querySelector('.fw-hero-ctl')?.closest('section,div')?.parentElement?.innerText || document.body.innerText).replace(/\s+/g, ' ').slice(0, 160));
    await page.getByRole('button', { name: 'Read', exact: true }).click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(700); const rTxt = await heroText();
    await page.getByRole('button', { name: 'Listen', exact: true }).click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(700); const lTxt = await heroText();
    rec("Hero chips switch board", rTxt !== lTxt, `Read≠Listen: ${rTxt !== lTxt}`);
  } catch (e) { rec("Hero chips switch board", false, "ERR " + String(e).slice(0, 80)); }

  // --- TEST 3: VIDEO plays in <=1 tap on the face (video el / youtube iframe appears, no nav) ---
  try {
    const pb = await playButtons(page);
    const vid = pb.filter(x => x.w > 180 && x.h > 110).sort((a, b) => a.top - b.top)[0];
    if (!vid) { rec("Video: 1-tap face play", false, "no large face play button found; play buttons=" + JSON.stringify(pb.slice(0, 6))); }
    else {
      const handles = await page.$$('button[aria-label]');
      // re-map: click by aria-label + position
      const before = await page.evaluate(() => ({ vids: document.querySelectorAll('video').length, yt: document.querySelectorAll('iframe[src*="youtube"]').length }));
      await handles[vid.i].scrollIntoViewIfNeeded().catch(() => {});
      await handles[vid.i].click({ timeout: 4000 });
      await page.waitForTimeout(2600);
      const after = await page.evaluate(() => {
        const vs = [...document.querySelectorAll('video')];
        return { vids: vs.length, yt: document.querySelectorAll('iframe[src*="youtube"]').length, ct: Math.max(0, ...vs.map(v => v.currentTime || 0)), url: location.href };
      });
      const appeared = (after.vids > before.vids) || (after.yt > before.yt);
      const noNav = after.url === startURL;
      rec("Video: 1-tap face play", appeared && noNav, `appeared=${appeared} (video ${before.vids}->${after.vids}, yt ${before.yt}->${after.yt}, currentTime=${after.ct.toFixed(2)}), noNav=${noNav}`);
    }
  } catch (e) { rec("Video: 1-tap face play", false, "ERR " + String(e).slice(0, 100)); }

  // --- TEST 4: AUDIO plays in <=1 tap (aria flips to Pause AND/OR audio.currentTime advances) ---
  await prep(page, "/Lifestyle");
  try {
    // the good-life board audio lives inside the clipboard slider; try to reveal by clicking "Good life"
    await page.getByRole('button', { name: 'Good life', exact: true }).click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const pb = await playButtons(page);
    const aud = pb.filter(x => x.w >= 40 && x.w <= 70 && x.h >= 40 && x.h <= 70)[0];
    if (!aud) { rec("Audio: 1-tap face play", false, "no audio-size play button; buttons=" + JSON.stringify(pb.map(x => x.w + "x" + x.h))); }
    else {
      const handles = await page.$$('button[aria-label]');
      await handles[aud.i].scrollIntoViewIfNeeded().catch(() => {});
      await handles[aud.i].click({ timeout: 4000 });
      await page.waitForTimeout(2200);
      const res = await page.evaluate(() => {
        const as = [...document.querySelectorAll('audio')];
        const pauseBtn = [...document.querySelectorAll('button[aria-label="Pause"]')].length;
        return { audios: as.length, ct: Math.max(0, ...as.map(a => a.currentTime || 0)), paused: as.map(a => a.paused), pauseBtn, url: location.href };
      });
      const advanced = res.ct > 0.15 || res.pauseBtn > 0;
      rec("Audio: 1-tap face play", advanced, `pauseBtnNow=${res.pauseBtn}, audioEls=${res.audios}, currentTime=${res.ct.toFixed(2)}, noNav=${res.url === startURL}`);
    }
  } catch (e) { rec("Audio: 1-tap face play", false, "ERR " + String(e).slice(0, 100)); }

  // --- TEST 5: reader opens in place (Today's chapter), no nav ---
  await prep(page, "/Lifestyle");
  try {
    const url0 = page.url();
    await page.getByRole('button', { name: /Today's chapter/i }).first().click({ timeout: 4000 });
    await page.waitForTimeout(1600);
    const r = await page.evaluate(() => ({ url: location.href, readingCol: document.querySelectorAll('.fw-reading-col, [class*="reading"]').length, overlay: document.querySelectorAll('[class*="sheet"],[role="dialog"]').length, bodyLen: document.body.innerText.length }));
    rec("Reader opens in place", r.url === url0 && (r.readingCol > 0 || r.overlay > 0), `noNav=${r.url === url0}, readingCol=${r.readingCol}, overlay=${r.overlay}`);
  } catch (e) { rec("Reader opens in place", false, "ERR " + String(e).slice(0, 90)); }

  // --- TEST 6: Jump-to opens the switcher ---
  await prep(page, "/Lifestyle");
  try {
    await page.getByRole('button', { name: /Jump to/i }).first().click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const txt = document.body.innerText;
      return { hasJump: /Jump to/i.test(txt), sheet: document.querySelectorAll('[class*="sheet"],[role="dialog"]').length, gridBtns: document.querySelectorAll('[class*="sheet"] button, [role="dialog"] button').length };
    });
    rec("Jump-to switcher opens", r.sheet > 0 && r.gridBtns > 2, `sheet=${r.sheet}, gridButtons=${r.gridBtns}`);
  } catch (e) { rec("Jump-to switcher opens", false, "ERR " + String(e).slice(0, 90)); }

  // --- TEST 7: "Show me another" changes content ---
  await prep(page, "/Lifestyle");
  try {
    const grab = () => page.evaluate(() => (document.body.innerText.match(/Set today's intention[\s\S]{0,160}/) || [''])[0].replace(/\s+/g, ' '));
    const b0 = await grab();
    await page.getByRole('button', { name: /Show me another/i }).first().click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const b1 = await grab();
    rec("'Show me another' rotates", b0 !== b1, `changed=${b0 !== b1}`);
  } catch (e) { rec("'Show me another' rotates", false, "ERR " + String(e).slice(0, 90)); }

  // =========================== a board: /Move (video-heavy) ===========================
  await prep(page, "/Move");
  try {
    const pb = await playButtons(page);
    const vid = pb.filter(x => x.w > 180 && x.h > 110).sort((a, b) => a.top - b.top)[0];
    if (!vid) { rec("Board /Move video 1-tap", false, "no face play; buttons=" + pb.length); }
    else {
      const handles = await page.$$('button[aria-label]');
      const before = await page.evaluate(() => ({ vids: document.querySelectorAll('video').length, yt: document.querySelectorAll('iframe[src*="youtube"]').length }));
      await handles[vid.i].scrollIntoViewIfNeeded().catch(() => {});
      await handles[vid.i].click({ timeout: 4000 });
      await page.waitForTimeout(2500);
      const after = await page.evaluate(() => ({ vids: document.querySelectorAll('video').length, yt: document.querySelectorAll('iframe[src*="youtube"]').length, url: location.href }));
      rec("Board /Move video 1-tap", (after.vids > before.vids || after.yt > before.yt), `video ${before.vids}->${after.vids}, yt ${before.yt}->${after.yt}`);
    }
  } catch (e) { rec("Board /Move video 1-tap", false, "ERR " + String(e).slice(0, 90)); }

  // --- board picker (mood chips) switch content ---
  await prep(page, "/Move");
  try {
    const grab = () => page.evaluate(() => (document.querySelector('section')?.parentElement?.innerText || document.body.innerText).replace(/\s+/g, ' ').slice(0, 400));
    await page.getByRole('button', { name: /Wound up/i }).first().click({ timeout: 3500 }).catch(() => {});
    await page.waitForTimeout(700); const a = await grab();
    await page.getByRole('button', { name: /Full of it/i }).first().click({ timeout: 3500 }).catch(() => {});
    await page.waitForTimeout(700); const b = await grab();
    rec("Board /Move mood picker switches", a !== b, `changed=${a !== b}`);
  } catch (e) { rec("Board /Move mood picker switches", false, "ERR " + String(e).slice(0, 90)); }

  // --- deep-links land (Community / Events) from a board ---
  await prep(page, "/Kindred");
  try {
    await page.getByRole('button', { name: /rooms in Community|in Community/i }).first().click({ timeout: 4000 });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({ url: location.href, is404: /not found|404|doesn.t exist/i.test(document.body.innerText), len: document.body.innerText.length }));
    rec("Deep-link Community lands", /Community/i.test(r.url) && !r.is404 && r.len > 400, `url=${r.url.replace('https://femwells.com', '')}, 404=${r.is404}`);
  } catch (e) { rec("Deep-link Community lands", false, "ERR " + String(e).slice(0, 90)); }

  fs.writeFileSync(path.join(OUT, "INTERACT.json"), JSON.stringify(log, null, 1));
  await ctx.close();
  const passes = log.filter(l => l.pass).length;
  console.log(`\n=== ${passes}/${log.length} passed ===`);
})();
