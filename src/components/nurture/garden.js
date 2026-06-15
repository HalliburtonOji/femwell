// garden.js — the ACCUMULATING garden (Companion Direction B, Phase 1).
//
// A chapter = a calendar month (YYYY-MM). The CURRENT chapter is the live companion; each
// PAST month is a kept plant. As months pass, /Garden becomes a wanderable record of the
// seasons she's moved through — June's bloom beside May's. Guilt-free: a quiet month is
// still a kept chapter; nothing dies, a new chapter begins fresh.
//
// Persistence mirrors companion.js: a localStorage cache renders instantly + survives offline,
// and every entity write is guarded + FIRE-AND-FORGET (never awaited on a UI path) so a wedged
// backend can't block or break the garden [[base44-fetch-no-timeout-hangs]]. Reads fail open.

import { base44 } from "@/api/base44Client";

// ── chapter keys / labels ──────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function monthOf(dayStr) { return String(dayStr || "").slice(0, 7); }            // "2026-05-14" -> "2026-05"
export function currentChapterKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
export function chapterLabel(key) { const [y, m] = String(key || "").split("-"); const mi = (parseInt(m, 10) || 1) - 1; return `${MONTHS[mi] || "—"} ${y || ""}`.trim(); }

// season (UK / N-hemisphere) drives the archived plant's colour — honest + deterministic,
// so we never fabricate a historical cycle phase we don't have.
const SEASONS = {
  spring: { name: "spring", color: "#8FAF8F" },
  summer: { name: "summer", color: "#D4AF37" },
  autumn: { name: "autumn", color: "#C17B4E" },
  winter: { name: "winter", color: "#8E6E8E" },
};
export function seasonOf(key) {
  const m = parseInt(String(key || "").split("-")[1], 10) || 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}
export const seasonColor = (name) => (SEASONS[name] || SEASONS.spring).color;

// friendly noun for the life-area tended most that chapter
export const AREA_NOUN = {
  journal: "your journal", nutrition: "what you ate & drank", checkins: "your check-ins",
  cycle: "your cycle notes", programs: "a practice kept", planner: "the days you planned",
  community: "the community",
};

// ── group engagement day-sets into months ──────────────────────────────
// areaSets = { area: Set<"YYYY-MM-DD"> }. Returns { "YYYY-MM": {activeDays, areaDays:{area:int},
// topArea, engagement} } for every month present. `engagement` = total area-days that month
// (the basis for the chapter plant's growth stage), comparable across chapters.
export function groupByMonth(areaSets) {
  const out = {};
  for (const [area, set] of Object.entries(areaSets || {})) {
    for (const d of set) {
      const m = monthOf(d);
      if (!out[m]) out[m] = { days: new Set(), areaDays: {} };
      out[m].days.add(d);
      out[m].areaDays[area] = (out[m].areaDays[area] || 0) + 1;
    }
  }
  const res = {};
  for (const [m, v] of Object.entries(out)) {
    const entries = Object.entries(v.areaDays);
    const topArea = entries.sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const engagement = entries.reduce((s, [, n]) => s + n, 0);
    res[m] = { activeDays: v.days.size, areaDays: v.areaDays, topArea, engagement };
  }
  return res;
}

// ── local cache (instant render + offline) ─────────────────────────────
const keyFor = (userId) => "fw_garden_chapters_" + String(userId || "anon");
export function localChapters(userId) {
  try { const a = JSON.parse(localStorage.getItem(keyFor(userId)) || "[]"); return Array.isArray(a) ? a : []; }
  catch { return []; }
}
function cacheChapters(userId, arr) { try { localStorage.setItem(keyFor(userId), JSON.stringify(arr)); } catch { /* ignore */ } }
function mergeByKey(...lists) {
  const map = new Map();
  for (const list of lists) for (const ch of (list || [])) if (ch && ch.chapter_key) map.set(ch.chapter_key, { ...map.get(ch.chapter_key), ...ch });
  return [...map.values()].sort((a, b) => String(b.chapter_key).localeCompare(String(a.chapter_key)));
}

// ── cross-device load ──────────────────────────────────────────────────
const rowIdByKey = {}; // `${userId}:${chapter_key}` -> entity row id
export async function loadGardenChapters(userId) {
  if (!userId) return localChapters(userId);
  try {
    const rows = await base44.entities.GardenChapter.filter({ user_id: userId }, "-chapter_key", 200).catch(() => []);
    const norm = (Array.isArray(rows) ? rows : []).filter(Boolean).map((r) => {
      rowIdByKey[`${userId}:${r.chapter_key}`] = r.id;
      return {
        chapter_key: r.chapter_key, label: r.label, life_stage: r.life_stage, form_key: r.form_key,
        accent: r.accent, stage_key: r.stage_key, season: r.season, top_area: r.top_area,
        active_days: r.active_days, summary: r.summary,
      };
    });
    const merged = mergeByKey(localChapters(userId), norm);
    cacheChapters(userId, merged);
    return merged;
  } catch { return localChapters(userId); }
}

// ── archive a past chapter — local first, then guarded fire-and-forget upsert ────
// `row` must include chapter_key. Dedupes by (user_id, chapter_key): never creates twice.
export function archiveChapter(userId, row) {
  if (!userId || !row || !row.chapter_key) return;
  const existing = localChapters(userId);
  if (existing.some((c) => c.chapter_key === row.chapter_key)) return; // already kept
  const next = mergeByKey(existing, [row]);
  cacheChapters(userId, next);
  const body = {
    user_id: userId, chapter_key: row.chapter_key, label: row.label, life_stage: row.life_stage || "",
    form_key: row.form_key || "", accent: row.accent || "", stage_key: row.stage_key || "",
    season: row.season || "", top_area: row.top_area || "", active_days: row.active_days || 0,
    summary: row.summary || "", archived_at: new Date().toISOString(),
  };
  (async () => {
    try {
      // guard against a concurrent/cross-device row for the same chapter
      const found = await base44.entities.GardenChapter.filter({ user_id: userId, chapter_key: row.chapter_key }, "-created_date", 1).catch(() => []);
      if (Array.isArray(found) && found[0]) { rowIdByKey[`${userId}:${row.chapter_key}`] = found[0].id; return; }
      const created = await base44.entities.GardenChapter.create(body).catch(() => null);
      if (created?.id) rowIdByKey[`${userId}:${row.chapter_key}`] = created.id;
    } catch { /* fail-open — localStorage already holds it */ }
  })();
}
