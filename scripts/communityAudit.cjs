// communityAudit.cjs — Phase-0 real-pixel + functional audit of the LIVE /Community (Community.jsx).
// Screenshots at 360/390/430, console/net errors, surface inventory + card sizing (§13.1 check),
// overflow/clip, invisible text, and READ-ONLY functional taps (open a room, Jump-to, board switch,
// Jess full-read). NO writes (no posting/DM/answer) — those are auth-gated + destructive; noted where
// the pipeline can't reach. Realtime can be slow → generous waits.
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright-core");
const PROFILE = path.join(process.env.LOCALAPPDATA, "ms-playwright-mcp", "mcp-chrome-7fe4e47");
const OUT = path.join(process.env.LOCALAPPDATA, "Temp", "claude", "C--Users-Halli-femwell-work",
  "231d4a39-c8df-4131-bcd9-a61bf1916877", "scratchpad", "visualqa");
const root = path.join(process.env.LOCALAPPDATA, "ms-playwright"); let exe = null;
for (const d of fs.readdirSync(root)) { if (!/^chromium-/.test(d)) continue; for (const c of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) { const f = path.join(root, d, ...c.split("/")); if (fs.existsSync(f)) { exe = f; break; } } if (exe) break; }

async function prep(page) {
  await page.goto("https://femwells.com/Community", { waitUntil: "networkidle", timeout: 55000 }).catch(() => {});
  await page.waitForTimeout(4500);
  // dismiss AgeGate (18+) then morning brief
  await page.evaluate(() => {
    const gateBtn = [...document.querySelectorAll("button")].find(b => /(^|\b)(yes|i'?m 18|over 18|enter|continue|agree|i am)\b/i.test(b.textContent || "") && /18|age|grown|women|enter/i.test(document.body.innerText.slice(0, 800)));
    if (gateBtn) gateBtn.click();
  }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Start my day/i.test(x.textContent || "")); if (b) b.click(); }).catch(() => {});
  await page.waitForTimeout(1500);
}

const AUDIT = `() => {
  const vw = innerWidth, t = document.body.innerText;
  const has = s => new RegExp(s, "i").test(t);
  // shelves / boards
  const tracks = [...document.querySelectorAll('[class*="clipboard-track"],[class*="-shelf"],[class*="peek-track"]')].map(el => {
    const kids = [...el.children].filter(c => c.offsetWidth > 40);
    const c0 = kids[0], c1 = kids[1];
    const r = el.getBoundingClientRect();
    return { cls: (el.className.toString ? el.className.toString() : "").slice(0, 26), n: kids.length, cardW: c0 ? c0.offsetWidth : null, cardPct: c0 ? Math.round(c0.offsetWidth / vw * 1000) / 10 : null, peek: (c1 ? Math.round(vw - c1.getBoundingClientRect().left) : "none"), w: Math.round(r.width) };
  }).filter(x => x.w > 100);
  // overflow (non-fixed elements past the viewport)
  let overCount = 0, overSamples = [];
  for (const el of document.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; if (r.right > vw + 1.5 && getComputedStyle(el).position !== 'fixed') { overCount++; if (overSamples.length < 6) overSamples.push({ tag: el.tagName.toLowerCase(), over: Math.round(r.right - vw), t: (el.textContent || '').trim().slice(0, 24) }); } }
  // invisible text
  const invis = [];
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,li')) { const tx = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); if (!tx || tx.length < 2) continue; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; const s = getComputedStyle(el); if (s.opacity === '0' || s.visibility === 'hidden') invis.push(tx.slice(0, 24)); }
  return {
    vw,
    private: /this page is private/i.test(t),
    ageGateStuck: /over 18|are you 18|grown enough/i.test(t) && !/good (morning|afternoon|evening)/i.test(t),
    personalised: /good (morning|afternoon|evening)|luteal|follicular|menstrual|ovulat/i.test(t),
    docScrollW: document.scrollingElement.scrollWidth,
    pageOverflow: document.scrollingElement.scrollWidth > vw + 1,
    tracks,
    overCount, overSamples,
    invis: invis.slice(0, 6),
    surfaces: {
      rooms: has('lounge|the rooms|drop into'), circles: has('circle'), clubs: has('\\bclub'), library: has('library|bookshelf|book club'),
      games: has('game|tonight.s (game|round)'), events: has('event|meet ?up|pod'), buddy: has('buddy|read together|reading buddy'),
      echo: has('echo'), witness: has('witness'), letters: has('letter|pen ?pal|sealed'), connectPrefs: has('how you want to connect|connection pref|letters.only|paused'),
      qotd: has('question of the day|the question|answer today'), rituals: has('ritual|wisdom|close the week|pool'), resonance: has('someone like you|women your age|resonance'),
      jess: has('jess'), crisis: has('feeling low|find support|crisis|samaritans'), safety: has('anonymous|no handles|no dms|18\\+|hide|mute|report'),
    },
    bodyLen: t.length,
  };
}`;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: exe, headless: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const report = { widths: {}, functional: {} };

  for (const w of [360, 390, 430]) {
    const rec = { console: [], net: [] };
    const onC = m => { if (m.type() === "error") rec.console.push(m.text().slice(0, 90)); };
    const onE = e => rec.console.push("PAGEERR " + String(e).slice(0, 90));
    const onR = r => { if (r.status() >= 400) rec.net.push(r.status() + " " + r.url().split("/").slice(-1)[0].split("?")[0]); };
    page.on("console", onC); page.on("pageerror", onE); page.on("response", onR);
    await page.setViewportSize({ width: w, height: 844 });
    await prep(page);
    rec.audit = await page.evaluate(new Function("return (" + AUDIT + ")()")).catch(e => "ERR " + e);
    await page.screenshot({ path: path.join(OUT, "COMM_" + w + ".png"), fullPage: true }).catch(() => {});
    page.off("console", onC); page.off("pageerror", onE); page.off("response", onR);
    report.widths[w] = rec;
    const a = rec.audit || {};
    console.log("@" + w, "overflow:", a.pageOverflow, "| tracks:", (a.tracks || []).length, "| console:", rec.console.length, "net:", rec.net.length, "| personalised:", a.personalised, "ageGateStuck:", a.ageGateStuck);
  }

  // ---- READ-ONLY functional taps at 390 (no writes) ----
  await page.setViewportSize({ width: 390, height: 844 });
  await prep(page);
  const F = report.functional;
  const startURL = page.url();
  // 1) open a room tile (The Lounge)
  try {
    const before = await page.evaluate(() => document.body.innerText.length);
    await page.evaluate(() => { const el = [...document.querySelectorAll('*')].find(e => /^The Lounge$/i.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 40 && e.getBoundingClientRect().width < 300); if (el) (el.closest('button,[role="button"],div[onclick]') || el).click(); });
    await page.waitForTimeout(2500);
    F.openRoom = await page.evaluate((b) => ({ url: location.href, grew: document.body.innerText.length !== b, hasComposer: /leave (a|the first)|say it|write|post|your line/i.test(document.body.innerText), roomHeader: /lounge/i.test(document.body.innerText) }), before);
    await page.screenshot({ path: path.join(OUT, "COMM_room.png") }).catch(() => {});
  } catch (e) { F.openRoomErr = String(e).slice(0, 90); }

  // 2) Jump-to switcher
  await prep(page);
  try {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /jump|hub|switch/i.test(x.getAttribute('aria-label') || x.textContent || '') && x.getBoundingClientRect().width > 0); if (b) b.click(); });
    await page.waitForTimeout(1000);
    F.jumpTo = await page.evaluate(() => ({ sheet: document.querySelectorAll('[class*="sheet"],[role="dialog"]').length, gridBtns: document.querySelectorAll('[class*="sheet"] button,[role="dialog"] button').length, hasJump: /jump to/i.test(document.body.innerText) }));
  } catch (e) { F.jumpToErr = String(e).slice(0, 90); }

  // 3) board switch (arrow / next board)
  await prep(page);
  try {
    const b0 = await page.evaluate(() => (document.querySelector('[class*="clipboard-track"]') || {}).scrollLeft || 0);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /next board|board 2|›|slide/i.test(x.getAttribute('aria-label') || '')); if (b) b.click(); });
    await page.waitForTimeout(1200);
    const b1 = await page.evaluate(() => (document.querySelector('[class*="clipboard-track"]') || {}).scrollLeft || 0);
    F.boardSwitch = { before: b0, after: b1, moved: b0 !== b1 };
  } catch (e) { F.boardSwitchErr = String(e).slice(0, 90); }

  // 4) Jess full-read inner sheet
  await prep(page);
  try {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /open jess|jess.s full|full read/i.test(x.textContent || '') && x.getBoundingClientRect().width > 0); if (b) b.click(); });
    await page.waitForTimeout(1200);
    F.jessRead = await page.evaluate(() => ({ innerSheet: document.querySelectorAll('[class*="sheet"],[role="dialog"]').length, hasLongRead: /what the room|staying safe|today together|the room.s for/i.test(document.body.innerText) }));
  } catch (e) { F.jessReadErr = String(e).slice(0, 90); }

  fs.writeFileSync(path.join(OUT, "COMMUNITY_AUDIT.json"), JSON.stringify(report, null, 1));
  await ctx.close();
  console.log("\nFUNCTIONAL:", JSON.stringify(report.functional, null, 1));
})();
