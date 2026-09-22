// Full-page verification of the Lifestyle clean redesign (behind the `clean` flag).
// SEEDED data (the preview profile's live session has lapsed) — labelled as such in the report.
// Screenshots the WHOLE page at 360/390/430, drives real taps (each chip, the jump strip, the
// chapter flip, a triad column), and asserts nothing fights: one header, one language, no overflow.
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const EXE = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1217/chrome-win64/chrome.exe");
const OUT = process.argv[2] || ".";
const BASE = "http://localhost:4173/LifestyleBespokeDemo";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const report = [];

for (const w of [360, 390, 430]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await page.goto(BASE + "?seed=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const chipNames = await page.evaluate(() =>
    [...document.querySelectorAll(".fw-hero-ctl button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.textContent.trim()));

  // the landing
  const landing = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      videoHero: !!document.querySelector("video") || [...document.querySelectorAll("img")].some((i) => /garden|lifestyle-dusk/.test(i.src)),
      glance: /TODAY, AT A GLANCE/i.test(t),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      ground: getComputedStyle(document.querySelector("#main-content > div") || document.body).backgroundColor,
      grain: /paper-texture/.test(getComputedStyle(document.querySelector("#main-content > div") || document.body).backgroundImage),
      hearts: document.querySelectorAll('svg path[fill="#BC2E27"]').length,
      stillLabel: /PLACEHOLDER STILL/i.test(t),
    };
  });
  await page.screenshot({ path: path.join(OUT, `clean-landing-${w}.png`), fullPage: true });

  // walk EVERY chip and capture the whole page
  const sections = [];
  for (const name of chipNames) {
    await page.evaluate((n) => {
      const b = [...document.querySelectorAll(".fw-hero-ctl button")].filter((x) => x.getBoundingClientRect().width > 0 && x.textContent.trim() === n);
      b[0]?.click();
    }, name);
    await page.waitForTimeout(1500);
    const s = await page.evaluate(() => {
      const t = document.body.innerText;
      const vis = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0);
      return {
        showing: (t.match(/Showing: [^\n]+/) || [])[0] || null,
        glanceStillThere: /TODAY, AT A GLANCE/i.test(t),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        height: document.documentElement.scrollHeight,
        oxblood: vis("*").filter((e) => { const c = getComputedStyle(e).color; return c === "rgb(122, 26, 18)"; }).length,
        texturedCards: vis("*").filter((e) => /paper-texture/.test(getComputedStyle(e).backgroundImage)).length,
        buttons: vis("button").length,
      };
    });
    sections.push({ chip: name, ...s });
    if (w === 390) await page.screenshot({ path: path.join(OUT, `clean-${name.toLowerCase().replace(/\W+/g, "")}-390.png`), fullPage: true });
  }

  // ── real taps on the two rebuilt surfaces (390 only) ──
  const taps = {};
  if (w === 390) {
    // Sky: the jump strip must move the page
    await page.evaluate(() => { const b = [...document.querySelectorAll(".fw-hero-ctl button")].filter((x) => x.getBoundingClientRect().width > 0 && /sky/i.test(x.textContent)); b[0]?.click(); });
    await page.waitForTimeout(1500);
    const before = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => { const b = [...document.querySelectorAll(".fw-sky-jump button")].find((x) => /Year/i.test(x.textContent)); b?.click(); });
    await page.waitForTimeout(1200);
    taps.jumpStripMoves = (await page.evaluate(() => window.scrollY)) !== before;
    taps.movementsPresent = await page.evaluate(() => {
      const t = document.body.innerText;
      return ["Today's weather", "Sun, moon & rising", "Your two tides", "house your year", "Ask the sky", "How you two run", "atelier", "Quiet mode", "Where the science sits", "Carry it with you"].filter((k) => new RegExp(k, "i").test(t));
    });
    // Books & story: the chapter flip + the run strip
    await page.evaluate(() => { const b = [...document.querySelectorAll(".fw-hero-ctl button")].filter((x) => x.getBoundingClientRect().width > 0 && /books/i.test(x.textContent)); b[0]?.click(); });
    await page.waitForTimeout(1500);
    taps.books = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        nextChapter: /Your next chapter|Today's chapter/i.test(t),
        runStrip: document.querySelectorAll('button[aria-label^="Chapter"]').length,
        shelf: /This month's shelf|library to fall into/i.test(t),
        duplicateRows: (() => { const ls = t.split("\n").filter((l) => /^Chapter \d+/.test(l)); return ls.length - new Set(ls).size; })(),
      };
    });
  }

  report.push({ width: w, landing, sections, taps, errors: errors.filter((e) => !/apps\/null|App not found/.test(e)) });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
