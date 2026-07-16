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

// every ACTIVE chapter of the series, in reading order. One query, one contract.
export async function loadStoryChapters(seriesKey = DAILY_STORY_SERIES) {
  try {
    const rows = await base44.entities.DailyStory.filter({ series_key: seriesKey, is_active: true }, "day_number", 200);
    return (Array.isArray(rows) ? rows : [])
      .filter((r) => r && r.segment_text)
      .sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
  } catch { return []; }
}

// THE gate. Returns { chapter, index, total, fresh } — or null when the series is genuinely empty.
//   fresh === true  → a chapter really was published for today (a live series).
//   fresh === false → the evergreen chapter-a-day from the finished story (framed honestly).
export function chapterForDay(chapters, date = new Date()) {
  const list = (chapters || []).filter(Boolean);
  if (!list.length) return null;
  const today = isoDay(date);
  const fresh = list.find((c) => c.published_date === today && c.is_active !== false);
  if (fresh) return { chapter: fresh, index: list.indexOf(fresh), total: list.length, fresh: true };
  const i = (((dayNumber(date) - EPOCH_DAY) % list.length) + list.length) % list.length;
  return { chapter: list[i], index: i, total: list.length, fresh: false };
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
// how many of the series she's read (for the kind "you're N of 30 in" line — never a streak)
export function readCount(chapters) {
  return (chapters || []).filter((c) => c && isChapterRead(c.id)).length;
}

// the honest framing line — one sentence, true in both directions
export function framingLine(pick) {
  if (!pick) return "Today's chapter is on its way.";
  if (pick.fresh) return "Today's chapter, fresh off the press.";
  return `A chapter a day from “The Long Room” — a finished story you can also read straight through.`;
}
// the chapter's own label, e.g. "Chapter 7 of 30"
export function chapterLabel(pick) {
  if (!pick) return "";
  const n = (pick.chapter?.day_number ?? pick.index + 1);
  return `Chapter ${n} of ${pick.total}`;
}
