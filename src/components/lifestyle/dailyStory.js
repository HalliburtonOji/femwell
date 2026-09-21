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
// THE MODEL (Halli, 2026-09-21 — "a chapter a day, and the series ENDS at month-end"): the daily
// read is a MONTHLY SERIES RUN. Chapter N is served on day N of the calendar month (everyone is on
// the same chapter today), and the run CLOSES at month-end: once the month has more days than the
// series has chapters (day 31 of a 30-chapter run), the series is "complete" — the finale stays open
// and she's invited to read it straight through — and a NEW run begins on the 1st. No silent
// modulo loop, no "chapter 24 on the 21st". (Months shorter than the series — Feb — simply close
// early; that's honest, and the straight-through read is always there.)
//
// GRACEFUL UPGRADE: a genuinely fresh chapter published for TODAY always WINS over the evergreen
// pick — so if the series is ever refilled (authored, generated, or repointed at StoryPack), this
// module needs no change; it simply stops falling back.
import { base44 } from "@/api/base44Client";

export const DAILY_STORY_SERIES = "the_long_room";

export function isoDay(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// the month's shape — day-of-month, its last day, and how many days remain (incl. today)
export function monthShape(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const dayOfMonth = d.getDate();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const monthEnd = isoDay(new Date(d.getFullYear(), d.getMonth(), daysInMonth));
  return { dayOfMonth, daysInMonth, monthEnd, daysLeft: daysInMonth - dayOfMonth + 1, monthName: d.toLocaleDateString("en-GB", { month: "long" }) };
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

// THE gate. Returns { chapter, index, total, fresh, seriesKey, complete, dayOfMonth, monthEnd,
// daysLeft, monthName } — null only if there is nothing.
//   fresh === true  → a chapter really WAS published for today (a live, authored series).
//   fresh === false → the monthly run: chapter (day-of-month) from the current series.
//   complete === true → this month's run has ended (day-of-month > chapters); the finale is served
//                       and a new run starts on the 1st.
// `index` is the position within what the reader can open (published <= today) → goToChapter-safe.
export function chapterForDay(chapters, date = new Date()) {
  const list = (chapters || []).filter((c) => c && c.segment_text);
  if (!list.length) return null;
  const today = isoDay(date);
  const m = monthShape(date);

  // 1) a chapter genuinely published for TODAY wins — in ANY series. This is what the authored
  //    refill produces, so seeding forward-dated chapters makes them the real daily read.
  const fresh = list.find((c) => c.published_date === today && c.is_active !== false);
  if (fresh) {
    const key = fresh.series_key;
    return { chapter: fresh, index: readableRows(list, key, today).findIndex((c) => c.id === fresh.id), total: seriesRows(list, key).length, fresh: true, seriesKey: key, complete: false, ...m };
  }

  // 2) THE MONTHLY RUN — chapter N on day N of the month, from the CURRENT series' READABLE
  //    back-catalogue only (a future-dated chapter can never be served early). "Current" = whichever
  //    series published most recently on-or-before today (so a new series takes over when it starts).
  const readable = list.filter((c) => !c.published_date || c.published_date <= today);
  if (!readable.length) return null;
  const newest = readable.reduce((a, c) => (!a || String(c.published_date || "") > String(a.published_date || "") ? c : a), null);
  const key = newest.series_key;
  const pool = readableRows(list, key, today);
  if (!pool.length) return null;
  const complete = m.dayOfMonth > pool.length;           // the run has closed for this month
  const i = complete ? pool.length - 1 : m.dayOfMonth - 1; // day N → chapter N; after the end → the finale
  return { chapter: pool[i], index: i, total: seriesRows(list, key).length, fresh: false, seriesKey: key, complete, ...m };
}

// tomorrow's chapter — for the gentle "what's next" tease (never a streak, never a scold).
// On the last day of a run it returns tomorrow's pick honestly: the finale again (complete) if the
// month still has days, or chapter 1 of the new run if tomorrow is the 1st.
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
  if (pick.complete) return `“${title}” has closed for ${pick.monthName || "this month"} — read it straight through; a new run begins on the 1st.`;
  const left = pick.daysLeft != null ? (pick.daysLeft === 1 ? "the run closes tonight" : `the run closes on the ${new Date(pick.monthEnd).getDate()}${ordinal(new Date(pick.monthEnd).getDate())}`) : "";
  return `A chapter a day from “${title}”${left ? ` — ${left}` : ""} — or read it straight through.`;
}
const ordinal = (n) => (n % 10 === 1 && n !== 11) ? "st" : (n % 10 === 2 && n !== 12) ? "nd" : (n % 10 === 3 && n !== 13) ? "rd" : "th";
// the chapter's own label, e.g. "Chapter 7 of 30"
export function chapterLabel(pick) {
  if (!pick) return "";
  const n = (pick.chapter?.day_number ?? pick.index + 1);
  return `Chapter ${n} of ${pick.total}`;
}
