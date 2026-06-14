// personalisation — FemWell nutrition MEMORY.
//
// Pure, dependency-light, defensive helpers that derive a gentle sense of "what
// this person tends to reach for" from their REAL history. The caller passes
// already-fetched rows (MealLog rows, MealTemplates rows, saved recipe entries) —
// this file does NO fetching, no network, no React, no entity calls. Everything is
// recency-weighted and honesty-safe: a pattern is only surfaced when the data
// genuinely supports it; sparse history returns empty/null rather than a guess.
//
// Memory is a gentle SUGGESTION and a warm OBSERVATION — never a scoreboard. We do
// not show "you logged X times!" as a vanity count or a streak; the counts here are
// internal ranking signals only, never copy. NO EMOJI. Cream/plum brand, Lucide —
// but this file emits data, not UI.
//
// The one shared dependency is foodModel.normalizeFood, reused to derive a stable
// canonical `key` for a food name (so "Greek Yoghurt" and "greek yoghurt " dedupe).
// We fall back to a local lowercase if anything about that import is unavailable.

import { normalizeFood } from "@/utils/foodModel";

// ── tiny pure helpers ───────────────────────────────────────────────────────────
function lc(s) {
  return String(s || "").trim().toLowerCase();
}

// canonical key for a food name — reuse the spine's normalizer where useful, with a
// defensive fallback so this never throws on odd input.
function foodKey(name) {
  const text = String(name || "").trim();
  if (!text) return "";
  try {
    const f = normalizeFood({ name: text });
    return f?.key || lc(text);
  } catch {
    return lc(text);
  }
}

// best human-readable text for a MealLog row (what the user typed/logged).
function mealText(m) {
  return String(m?.raw_text || m?.name || "").trim();
}

// local YYYY-MM-DD for today (no date-fns dependency; pure).
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

// whole-day distance between two YYYY-MM-DD keys (a - b), defensive → 0 on bad input.
function daysBetween(aKey, bKey) {
  if (typeof aKey !== "string" || typeof bKey !== "string") return 0;
  const a = Date.parse(aKey + "T00:00:00");
  const b = Date.parse(bKey + "T00:00:00");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((a - b) / 86400000);
}

// the day_key for a meal row, falling back to logged_at / created_date date part.
function mealDayKey(m) {
  if (typeof m?.day_key === "string" && m.day_key) return m.day_key;
  const stamp = m?.logged_at || m?.created_date || m?.created_at;
  if (typeof stamp === "string" && stamp.length >= 10) return stamp.slice(0, 10);
  return "";
}

// ── recency-weighted score ───────────────────────────────────────────────────────
// The heart of every ranking here: a food's standing = how OFTEN it shows up, plus a
// gentle boost for how RECENTLY. We never let recency dominate count (so a one-off
// from yesterday doesn't outrank a months-long staple), but a fresh log nudges a food
// up. Weight per log = 1 + recencyBoost, where recencyBoost decays with age:
//   today → +0.6, ~a week ago → ~+0.3, a month+ ago → ~0. A food's score is the sum
// of its per-log weights, so frequency compounds while recency tilts ties.
function recencyWeight(dayKey, ref) {
  const age = Math.max(0, daysBetween(ref, dayKey)); // days ago (>= 0)
  // half-life ~10 days, capped at +0.6 so count always leads
  const boost = 0.6 * Math.exp(-age / 10);
  return 1 + (Number.isFinite(boost) ? boost : 0);
}

// ── topFoods(mealLogs, { limit }) ────────────────────────────────────────────────
// Most-logged DISTINCT foods, recency-weighted. Groups a person's real MealLog rows
// by canonical food key, sums each food's recency-weighted score, and returns the
// strongest first. Used to rank Recents/Favourites chips so go-tos lead, not just the
// newest single log. Returns [{ name, key, count, lastDay }]. Defensive: missing
// data → []. `count` is an internal frequency signal (never shown as a score).
export function topFoods(mealLogs, { limit = 8 } = {}) {
  const rows = Array.isArray(mealLogs) ? mealLogs.filter(Boolean) : [];
  if (rows.length === 0) return [];
  const ref = todayKey();
  const byKey = new Map();
  for (const m of rows) {
    const name = mealText(m);
    const key = foodKey(name);
    if (!key) continue;
    const dayKey = mealDayKey(m);
    const w = recencyWeight(dayKey, ref);
    const cur = byKey.get(key);
    if (cur) {
      cur.count += 1;
      cur.score += w;
      // keep the most recent day + the freshest label spelling
      if (!cur.lastDay || (dayKey && dayKey > cur.lastDay)) {
        cur.lastDay = dayKey;
        cur.name = name || cur.name;
      }
    } else {
      byKey.set(key, { name, key, count: 1, score: w, lastDay: dayKey });
    }
  }
  return [...byKey.values()]
    .sort((a, b) => (b.score - a.score) || (b.count - a.count) || ((b.lastDay || "") > (a.lastDay || "") ? 1 : -1))
    .slice(0, Math.max(1, Number(limit) || 8))
    .map(({ name, key, count, lastDay }) => ({ name, key, count, lastDay }));
}

// ── frequentFavourites(mealLogs, templates) ──────────────────────────────────────
// Foods logged often enough to feel like genuine go-tos, MERGED with the user's real
// MealTemplates (their explicit favourites). Real templates always lead (they chose
// them); then learned go-tos — foods logged on 2+ distinct days (so a single repeat
// isn't promoted) — fill in behind, deduped against the templates by canonical key.
// Returns a ranked, deduped list: template rows keep their full shape (id, title,
// default_meal_type, ai_analysis) and carry `learned:false`; learned ones are
// { name, key, count, lastDay, learned:true } so the caller can render either.
export function frequentFavourites(mealLogs, templates) {
  const tmpl = Array.isArray(templates) ? templates.filter(Boolean) : [];
  const seen = new Set();
  const out = [];

  // explicit favourites first — the user chose these
  for (const t of tmpl) {
    const title = String(t?.title || "").trim();
    const key = foodKey(title);
    if (!title || !key || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...t, name: title, key, learned: false });
  }

  // learned go-tos: count DISTINCT days a food was logged (a real habit, not a repeat
  // within one day), keep those reaching 2+ days, ranked by recency-weighted score.
  const rows = Array.isArray(mealLogs) ? mealLogs.filter(Boolean) : [];
  if (rows.length) {
    const ref = todayKey();
    const byKey = new Map();
    for (const m of rows) {
      const name = mealText(m);
      const key = foodKey(name);
      if (!key) continue;
      const dayKey = mealDayKey(m);
      const cur = byKey.get(key);
      if (cur) {
        cur.score += recencyWeight(dayKey, ref);
        cur.count += 1;
        if (dayKey) cur.days.add(dayKey);
        if (!cur.lastDay || (dayKey && dayKey > cur.lastDay)) { cur.lastDay = dayKey; cur.name = name || cur.name; }
      } else {
        byKey.set(key, { name, key, score: recencyWeight(dayKey, ref), count: 1, lastDay: dayKey, days: new Set(dayKey ? [dayKey] : []) });
      }
    }
    const learned = [...byKey.values()]
      .filter((f) => !seen.has(f.key) && f.days.size >= 2)
      .sort((a, b) => (b.score - a.score) || (b.count - a.count))
      .map((f) => ({ name: f.name, key: f.key, count: f.count, lastDay: f.lastDay, learned: true }));
    for (const f of learned) { if (!seen.has(f.key)) { seen.add(f.key); out.push(f); } }
  }

  return out;
}

// ── slotSuggestions(mealLogs, slot) ──────────────────────────────────────────────
// What the user usually eats for a given slot (breakfast/lunch/dinner/snack), from
// THEIR OWN history. Filters MealLog rows to that meal_type, then ranks distinct foods
// recency-weighted (topFoods on the slice). Returns a small list of name strings — for
// the plan editor's suggestion chips and the generator's "you often have …" hint.
// Defensive: bad slot or no history → [].
export function slotSuggestions(mealLogs, slot, { limit = 6 } = {}) {
  const rows = Array.isArray(mealLogs) ? mealLogs.filter(Boolean) : [];
  const want = lc(slot);
  if (!want || rows.length === 0) return [];
  const inSlot = rows.filter((m) => lc(m?.meal_type) === want);
  if (inSlot.length === 0) return [];
  return topFoods(inSlot, { limit }).map((f) => f.name).filter(Boolean);
}

// ── lovedMeals(mealLogs, { slot, limit }) ────────────────────────────────────────
// The meals a person genuinely LOVES — so they can resurface in the planner. A loved
// meal is one they RATED well (avg meal_score ≥ 6.5) OR returned to on 2+ distinct
// days (a real habit, not a one-off). Ranking blends recency-weighted frequency with
// the rating: a high score lifts a food, a low score dampens it, an unrated food is
// neutral. Optional `slot` filters to a meal_type. Returns [{ name, key, count,
// avgScore, loved }] strongest first. Defensive: no qualifying data → []. The scores
// are internal ranking signals only — never shown as a number (no scoreboard).
export function lovedMeals(mealLogs, { slot, limit = 4 } = {}) {
  const rows = Array.isArray(mealLogs) ? mealLogs.filter(Boolean) : [];
  if (rows.length === 0) return [];
  const want = slot ? lc(slot) : null;
  const ref = todayKey();
  const byKey = new Map();
  for (const m of rows) {
    if (want && lc(m?.meal_type) !== want) continue;
    const name = mealText(m);
    const key = foodKey(name);
    if (!key) continue;
    const dayKey = mealDayKey(m);
    const score = Number(m?.meal_score);
    const cur = byKey.get(key) || { name, key, freq: 0, count: 0, days: new Set(), scoreSum: 0, scoreN: 0, lastDay: dayKey };
    cur.freq += recencyWeight(dayKey, ref);
    cur.count += 1;
    if (dayKey) cur.days.add(dayKey);
    if (Number.isFinite(score) && score > 0) { cur.scoreSum += score; cur.scoreN += 1; }
    if (!cur.lastDay || (dayKey && dayKey > cur.lastDay)) { cur.lastDay = dayKey; cur.name = name || cur.name; }
    byKey.set(key, cur);
  }
  return [...byKey.values()]
    .map((f) => {
      const avg = f.scoreN ? f.scoreSum / f.scoreN : null;
      // a high rating lifts, a low one dampens (floored so it never zeroes out), unrated = neutral
      const ratingFactor = avg == null ? 1 : Math.max(0.4, 1 + 0.18 * (avg - 5));
      return { name: f.name, key: f.key, count: f.count, days: f.days.size, avg, love: f.freq * ratingFactor };
    })
    // honesty floor: genuinely rated-well OR a returned-to habit
    .filter((f) => (f.avg != null && f.avg >= 6.5) || f.days >= 2)
    .sort((a, b) => (b.love - a.love) || (b.count - a.count))
    .slice(0, Math.max(1, Number(limit) || 4))
    .map((f) => ({ name: f.name, key: f.key, count: f.count, avgScore: f.avg, loved: f.avg != null && f.avg >= 6.5 }));
}

// ── mealTimePattern(mealLogs, slot) ──────────────────────────────────────────────
// A gentle observed time for a slot ("you usually log breakfast around 8am") derived
// from logged_at across that slot's rows. Honesty-safe: needs at least 3 logged times
// for that slot before it'll claim a pattern, and only speaks when those times cluster
// (spread under ~3 hours). Returns a warm string, or null when the data is too thin or
// too scattered to honestly say. Never a target, never a nag.
export function mealTimePattern(mealLogs, slot) {
  const rows = Array.isArray(mealLogs) ? mealLogs.filter(Boolean) : [];
  const want = lc(slot);
  if (!want) return null;
  const hours = [];
  for (const m of rows) {
    if (lc(m?.meal_type) !== want) continue;
    const stamp = m?.logged_at || m?.created_date || m?.created_at;
    if (!stamp) continue;
    const d = new Date(stamp);
    if (Number.isNaN(d.getTime())) continue;
    hours.push(d.getHours() + d.getMinutes() / 60);
  }
  if (hours.length < 3) return null;
  // cluster check: only speak if the times sit reasonably close together
  const min = Math.min(...hours);
  const max = Math.max(...hours);
  if (max - min > 3) return null;
  const mean = hours.reduce((s, v) => s + v, 0) / hours.length;
  const hh = Math.round(mean);
  const display =
    hh === 0 ? "around midnight"
    : hh === 12 ? "around midday"
    : hh < 12 ? `around ${hh}am`
    : `around ${hh - 12}pm`;
  const SLOT_WORD = { breakfast: "breakfast", lunch: "lunch", dinner: "dinner", snack: "a snack" };
  const word = SLOT_WORD[want] || want;
  return `You usually log ${word} ${display}.`;
}

// ── rankRecipesByPreference(savedRecipes) ────────────────────────────────────────
// Order saved recipe entries by rating (loved first), then recency — memory for
// recipes, so favourites surface first across sessions. Accepts the shape the recipes
// tab already holds: [{ id, rating, recipe, created_date? }]. Pure, stable, non-
// mutating (returns a new array). Defensive: non-array → []. Recency tie-break uses
// created_date when present, else leaves input order (already -created_date from the
// fetch).
export function rankRecipesByPreference(savedRecipes) {
  const rows = Array.isArray(savedRecipes) ? savedRecipes.filter(Boolean) : [];
  if (rows.length === 0) return [];
  return rows
    .map((r, i) => ({ r, i })) // preserve incoming order for stable tie-breaks
    .sort((a, b) => {
      const ra = Number(a.r?.rating) || 0;
      const rb = Number(b.r?.rating) || 0;
      if (rb !== ra) return rb - ra;                 // loved first
      const da = a.r?.created_date || a.r?.created_at || "";
      const db = b.r?.created_date || b.r?.created_at || "";
      if (da && db && da !== db) return db > da ? 1 : -1; // newer first
      return a.i - b.i;                              // stable
    })
    .map(({ r }) => r);
}

// ── learnedPatternLine(mealLogs) ─────────────────────────────────────────────────
// ONE warm, observed memory line for Insights ("you reach for porridge most
// mornings") — or null when the data is too sparse to honestly say. Built from the
// strongest go-to overall: needs a food logged on 3+ distinct days AND clearly ahead
// of the runner-up before it'll speak, so we only narrate a real habit. Gentle,
// observational, never a verdict, never a count shown as a score. NO EMOJI.
export function learnedPatternLine(mealLogs) {
  const rows = Array.isArray(mealLogs) ? mealLogs.filter(Boolean) : [];
  if (rows.length < 4) return null;

  // group by food key, tracking distinct days + dominant slot + recency-weighted score
  const byKey = new Map();
  const ref = todayKey();
  for (const m of rows) {
    const name = mealText(m);
    const key = foodKey(name);
    if (!key) continue;
    const dayKey = mealDayKey(m);
    const slot = lc(m?.meal_type);
    const cur = byKey.get(key);
    if (cur) {
      cur.score += recencyWeight(dayKey, ref);
      if (dayKey) cur.days.add(dayKey);
      if (slot) cur.slots[slot] = (cur.slots[slot] || 0) + 1;
      if (!cur.lastDay || (dayKey && dayKey > cur.lastDay)) cur.name = name || cur.name;
    } else {
      byKey.set(key, {
        name, key, score: recencyWeight(dayKey, ref), lastDay: dayKey,
        days: new Set(dayKey ? [dayKey] : []),
        slots: slot ? { [slot]: 1 } : {},
      });
    }
  }

  const ranked = [...byKey.values()].sort((a, b) => (b.days.size - a.days.size) || (b.score - a.score));
  const top = ranked[0];
  if (!top || top.days.size < 3) return null;
  // honesty: the top go-to should clearly lead, not be one of many ties
  const second = ranked[1];
  if (second && second.days.size >= top.days.size && (top.score - second.score) < 0.5) return null;

  // dominant slot → a natural time-of-day phrase
  const slot = Object.entries(top.slots).sort((a, b) => b[1] - a[1])[0]?.[0];
  const SLOT_PHRASE = {
    breakfast: "most mornings",
    lunch: "for lunch most days",
    dinner: "for dinner most evenings",
    snack: "when you fancy a snack",
  };
  const when = (slot && SLOT_PHRASE[slot]) || "again and again";
  const food = String(top.name || "").trim();
  if (!food) return null;
  return `You reach for ${food.toLowerCase()} ${when} — a gentle go-to we've noticed.`;
}
