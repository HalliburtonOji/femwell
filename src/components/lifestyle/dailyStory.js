// dailyStory.js — THE ONE GATING CONTRACT for the Daily Story (component #5).
//
// THE BUG THIS FIXES: four surfaces each asked the DailyStory entity a different question, so
// the same day could show four different answers —
//   • LifestyleEliteShell  filter({}, "-created_date", 1)                → newest-ever row, no
//     is_active + no date gate → presented a 37-day-STALE chapter as "Today's chapter".
//   • DailyStoryReel       filter({is_active}, "-published_date", 40) → first <= today → also stale.
//   • TodayDailyChapterCard published_date === today && is_active        → BLANK once the series ended.
//   • DailyStoryReader     {series_key, is_active} → all <= today        → the straight-through read.
// Now every surface calls `chapterForDay()` and gets the SAME chapter, framed honestly.
//
// THE MODEL (evergreen, no new backend): "The Long Room" is a FINISHED 30-chapter story. Rather
// than pretend it's still being written (stale) or show nothing (blank), we serve it as an honest
// chapter-a-day: deterministic by calendar day, so EVERY woman is on the same chapter today, and
// the series cycles. She can also read it straight through — both framings are true, so we say so.
//
// GRACEFUL UPGRADE: a genuinely fresh chapter published for TODAY always WINS over the evergreen
// pick — so if the series is ever refilled (authored, generated, or repointed at StoryPack), this
// module needs no change; it simply stops falling back.
import { base44 } from "@/api/base44Client";

export const DAILY_STORY_SERIES = "the_long_room";

// a stable anchor so the rotation is deterministic across devices/sessions/reloads
const EPOCH_DAY = Math.floor(Date.UTC(2026, 0, 1) / 86400000);

export function isoDay(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayNumber(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

// every ACTIVE chapter — ALL series, in reading order. One query, one contract.
// (Series-aware since the authored refill: a new series must be able to become the daily read
// without a code change. Pass a seriesKey only when you want one specific series.)
export async function loadStoryChapters(seriesKey) {
  try {
    const where = seriesKey ? { series_key: seriesKey, is_active: true } : { is_active: true };
    const rows = await base44.entities.DailyStory.filter(where, "day_number", 400);
    return (Array.isArray(rows) ? rows : [])
      .filter((r) => r && r.segment_text)
      .sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
  } catch { return []; }
}

const byDay = (a, b) => (a.day_number || 0) - (b.day_number || 0);
const seriesRows = (list, key) => list.filter((c) => c.series_key === key).sort(byDay);
// what she may READ today — never a chapter dated in the future (that would spoil it)
const readableRows = (list, key, today) =>
  seriesRows(list, key).filter((c) => !c.published_date || c.published_date <= today);

// THE gate. Returns { chapter, index, total, fresh, seriesKey } — null only if there is nothing.
//   fresh === true  → a chapter really WAS published for today (a live, authored series).
//   fresh === false → the evergreen chapter-a-day from the current series' finished back-catalogue.
// `index` is the position within what the reader can open (published <= today) → goToChapter-safe.
export function chapterForDay(chapters, date = new Date()) {
  const list = (chapters || []).filter((c) => c && c.segment_text);
  if (!list.length) return null;
  const today = isoDay(date);

  // 1) a chapter genuinely published for TODAY wins — in ANY series. This is what the authored
  //    refill produces, so seeding forward-dated chapters makes them the real daily read.
  const fresh = list.find((c) => c.published_date === today && c.is_active !== false);
  if (fresh) {
    const key = fresh.series_key;
    return { chapter: fresh, index: readableRows(list, key, today).findIndex((c) => c.id === fresh.id), total: seriesRows(list, key).length, fresh: true, seriesKey: key };
  }

  // 2) EVERGREEN — the safety net. Cycle the CURRENT series' READABLE back-catalogue only, so a
  //    future-dated chapter can never be served early. "Current" = whichever series published most
  //    recently on-or-before today (so a new series takes over the moment it starts).
  const readable = list.filter((c) => !c.published_date || c.published_date <= today);
  if (!readable.length) return null;
  const newest = readable.reduce((a, c) => (!a || String(c.published_date || "") > String(a.published_date || "") ? c : a), null);
  const key = newest.series_key;
  const pool = readableRows(list, key, today);
  if (!pool.length) return null;
  const i = (((dayNumber(date) - EPOCH_DAY) % pool.length) + pool.length) % pool.length;
  return { chapter: pool[i], index: i, total: seriesRows(list, key).length, fresh: false, seriesKey: key };
}

// tomorrow's chapter — for the gentle "what's next" tease (never a streak, never a scold)
export function nextChapterOf(chapters, date = new Date()) {
  const t = new Date(date); t.setDate(t.getDate() + 1);
  return chapterForDay(chapters, t);
}

// ── read state — the SAME app-wide key the Today reel already uses, so "read" means one thing ──
export const readKeyOf = (id) => `fw_read_chapter_${id}`;
export function isChapterRead(id) {
  if (!id) return false;
  try { return !!window.localStorage.getItem(readKeyOf(id)); } catch { return false; }
}
export function markChapterRead(id) {
  if (!id) return;
  try { window.localStorage.setItem(readKeyOf(id), "read"); } catch { /* private mode — fine */ }
}
// how many of THIS series she's read (the kind "you're N of 30 in" line — never a streak)
export function readCount(chapters, pick) {
  const key = pick?.seriesKey;
  const list = key ? (chapters || []).filter((c) => c && c.series_key === key) : (chapters || []);
  return list.filter((c) => c && isChapterRead(c.id)).length;
}

// the honest framing line — one sentence, true in both directions. Never claims "fresh today"
// unless a chapter really was published for today.
export function framingLine(pick) {
  if (!pick) return "Today's chapter is on its way.";
  const title = pick.chapter?.series_title || "this series";
  if (pick.fresh) return `Today's chapter of “${title}” — new today.`;
  return `A chapter a day from “${title}” — a finished story you can also read straight through.`;
}
// the chapter's own label, e.g. "Chapter 7 of 30"
export function chapterLabel(pick) {
  if (!pick) return "";
  const n = (pick.chapter?.day_number ?? pick.index + 1);
  return `Chapter ${n} of ${pick.total}`;
}
