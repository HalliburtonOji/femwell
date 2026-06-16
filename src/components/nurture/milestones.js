// milestones.js — RARE / MILESTONE BLOOMS for the accumulating garden (Phase 3).
//
// A rare bloom is earned THROUGH LIVING, never by hitting a target. It is COLLECTION,
// not score: when a real life-milestone is reached (a first sealed letter opened, a
// hundredth journal line, a full cycle tracked, a year on FemWell…), a special bloom
// quietly JOINS the garden with a warm "look what grew" note. There is no "locked /
// greyed missing milestone" anywhere — we only ever surface what HAS grown, plus a
// gentle "more may bloom as you go". No streaks, no scores, no "you're behind".
//
// Persistence mirrors companion.js / garden.js EXACTLY: a localStorage cache renders
// instantly + survives offline, and every entity write is guarded + FIRE-AND-FORGET
// (never awaited on a UI path) so a wedged backend can never block or break the garden
// [[base44-fetch-no-timeout-hangs]]. Reads fail open. We reuse the existing CompanionState
// entity (a new `milestones` string-array field) rather than spin up another entity.

import { base44 } from "@/api/base44Client";

// ── the rare-bloom catalogue ────────────────────────────────────────────────
// Each milestone = a distinct rare bloom. `rare` is the visual variant key the Bloom
// art reads (halo / treatment); `form` is the base bloom species it's drawn from. Copy
// is warm + collection-framed ("look what grew") — never achievement-pressure. Order is
// the order they're shown in the collection (gentle, not ranked).
export const MILESTONES = [
  {
    key: "first_letter_opened", form: "foxglove", rare: "gilded",
    title: "A letter, opened", line: "The first letter you sealed to yourself came back to you. Look what grew while you waited.",
  },
  {
    key: "journal_50", form: "foxglove", rare: "inked",
    title: "Fifty lines", line: "Fifty times you've written yourself down. A whole season of honest pages.",
  },
  {
    key: "journal_100", form: "foxglove", rare: "gilded",
    title: "A hundred lines", line: "A hundred journal entries. Look what a quiet, steady habit makes.",
  },
  {
    key: "full_cycle", form: "peony", rare: "haloed",
    title: "A full cycle, tracked", line: "You followed a whole cycle through, start to start. Your body, witnessed.",
  },
  {
    key: "season_showing_up", form: "daisy", rare: "haloed",
    title: "A season of showing up", line: "Thirty days, across the months, you came back to yourself. A season kept.",
  },
  {
    key: "year_on_femwell", form: "peony", rare: "gilded",
    title: "A year, grown", line: "A year since you began here. Look how far the small attentions have carried you.",
  },
  {
    key: "first_community_act", form: "forget", rare: "haloed",
    title: "Not alone", line: "You reached into the community for the first time. Something grew that you weren't alone for.",
  },
  {
    key: "first_book_chapter", form: "forget", rare: "inked",
    title: "A chapter finished", line: "You read your way to the end of a chapter. A bloom grown in company.",
  },
];
const BY_KEY = Object.fromEntries(MILESTONES.map((m) => [m.key, m]));
export function milestoneDef(key) { return BY_KEY[key] || null; }

// ── local cache (instant render + offline) ──────────────────────────────────
const keyFor = (userId) => "fw_garden_milestones_" + String(userId || "anon");
export function localMilestones(userId) {
  try { const a = JSON.parse(localStorage.getItem(keyFor(userId)) || "[]"); return Array.isArray(a) ? a.filter((k) => BY_KEY[k]) : []; }
  catch { return []; }
}
function cacheMilestones(userId, keys) { try { localStorage.setItem(keyFor(userId), JSON.stringify([...new Set(keys)])); } catch { /* ignore */ } }

// ── reuse CompanionState for cross-device persistence (a `milestones` array field) ──
// One guarded, fire-and-forget upsert. Never awaited by any UI path. We dedupe locally
// first so the same milestone never re-fires a write.
const rowIdCache = {};
function persist(userId, keys) {
  if (!userId) return;
  const body = { milestones: [...new Set(keys)] };
  (async () => {
    try {
      const id = rowIdCache[userId];
      if (id) { await base44.entities.CompanionState.update(id, body).catch(() => {}); return; }
      const rows = await base44.entities.CompanionState.filter({ user_id: userId }, "-updated_date", 1).catch(() => []);
      const existing = Array.isArray(rows) && rows[0];
      if (existing) { rowIdCache[userId] = existing.id; await base44.entities.CompanionState.update(existing.id, body).catch(() => {}); }
      else { const created = await base44.entities.CompanionState.create({ user_id: userId, ...body }).catch(() => null); if (created?.id) rowIdCache[userId] = created.id; }
    } catch { /* fail-open — localStorage already holds it */ }
  })();
}

// HYDRATE from the entity (fail-open). Merges any server-side milestone keys into the
// local cache (union — a rare bloom, once grown, is never taken away). Returns true if
// the local set changed, so the caller can re-render.
export async function loadMilestones(userId) {
  if (!userId) return false;
  try {
    const rows = await base44.entities.CompanionState.filter({ user_id: userId }, "-updated_date", 1).catch(() => []);
    const row = Array.isArray(rows) && rows[0];
    if (!row) return false;
    rowIdCache[userId] = row.id;
    const remote = Array.isArray(row.milestones) ? row.milestones.filter((k) => BY_KEY[k]) : [];
    const before = localMilestones(userId);
    const merged = [...new Set([...before, ...remote])];
    if (merged.length === before.length && merged.every((k) => before.includes(k))) return false;
    cacheMilestones(userId, merged);
    return true;
  } catch { return false; }
}

// ── detection — earned THROUGH LIVING, from real data ────────────────────────
// `signals` is assembled by the caller from the guarded reads it already does (plus a
// couple of cheap extra ones). We ONLY ever ADD newly-earned keys to the kept set — we
// never remove or "expire" a rare bloom, and we never surface what hasn't grown.
//
//   signals = {
//     journalCount, communityActs, readingDayCount, activeDayCount,
//     accountAgeDays, lettersOpened, cycleStarts,
//   }
//
// Returns the FULL kept set (existing ∪ newly-earned) and the list of keys that are NEW
// this pass (so the surface can show a gentle "a new bloom grew" note once).
export function detectMilestones(userId, signals = {}) {
  const have = new Set(localMilestones(userId));
  const earned = new Set(have);
  const s = signals;
  const add = (k, cond) => { if (cond && BY_KEY[k]) earned.add(k); };

  add("first_letter_opened", (s.lettersOpened || 0) >= 1);
  add("journal_50", (s.journalCount || 0) >= 50);
  add("journal_100", (s.journalCount || 0) >= 100);
  add("full_cycle", (s.cycleStarts || 0) >= 2);           // two period-starts = one full cycle observed
  add("season_showing_up", (s.activeDayCount || 0) >= 30);
  add("year_on_femwell", (s.accountAgeDays || 0) >= 365);
  add("first_community_act", (s.communityActs || 0) >= 1);
  add("first_book_chapter", (s.readingDayCount || 0) >= 1);

  const next = [...earned];
  const isNew = next.filter((k) => !have.has(k));
  if (isNew.length) { cacheMilestones(userId, next); persist(userId, next); }
  return { keys: next, newlyEarned: isNew };
}
