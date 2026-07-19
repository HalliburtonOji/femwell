// Single source of truth for "which UserProfile row is HERS".
//
// WHY THIS EXISTS (measured 2026-07-19, not theorised):
// A user can accumulate several UserProfile rows. The test account has FIVE for one
// user_id, and only ONE of them carries her cycle data:
//
//   idx 0  created 2026-06-10 10:30:46   last_period_start_date: null   <- every call site took THIS
//   idx 1  created 2026-06-10 10:30:40   null
//   idx 2  created 2026-06-10 10:30:39   null      (three empty rows written within 8 seconds)
//   idx 3  created 2026-05-15 12:51:09   "2026-04-23", cycle 27, period 4   <- her REAL profile
//   idx 4  created 2026-04-10 18:24:53   null
//
// `filter()` returns newest-first, and all 62 call sites in the app did `rows[0]`. So the
// whole app has been reading an EMPTY row while her real one sat at index 3. That single
// line is why the phase rail never filled, why the hero never personalised, and why the
// phase tint never applied — the profile was found, it was just the wrong one.
//
// The fix is to pick the RICHEST row rather than the newest. Writes then land on that same
// row (we return the whole record, id included), so using this consistently also stops the
// app spreading her data across rows any further.
//
// This does NOT delete the redundant rows — deleting user data is not a bug fix, and the
// empty rows are harmless once nothing reads them. A dedup is proposed separately.

import { base44 } from "@/api/base44Client";

// Higher score = more likely to be the row she actually filled in. `last_period_start_date`
// dominates because it is the anchor every phase calculation in the app reads.
function completeness(p) {
  if (!p) return -1;
  let s = 0;
  if (p.last_period_start_date) s += 8;
  if (p.cycle_avg_length) s += 2;
  if (p.period_length) s += 2;
  if (p.life_stage && p.life_stage !== "none") s += 1;
  if (p.display_name) s += 1;
  if (Array.isArray(p.saved_item_ids) && p.saved_item_ids.length) s += 1;
  if (p.onboarding_complete) s += 1;
  return s;
}

// Pick her real profile from whatever `filter({user_id})` returned.
// Ties fall back to newest-first, i.e. exactly the old behaviour — so for the common case
// of a single row, or several equally-empty rows, nothing changes.
export function pickProfile(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter(Boolean);
  if (!list.length) return null;
  return list.slice().sort((a, b) =>
    completeness(b) - completeness(a) ||
    String(b.created_date || "").localeCompare(String(a.created_date || ""))
  )[0];
}

// The one call every surface should use. `base44.auth.me()` is the correct way to get the
// current user — `base44.entities.User.me()` does NOT exist in this SDK (measured: the
// entity client exposes list/filter/get/create/update/... and no `me`), which is the source
// of the "entities.User.me is not a function" console error.
export async function loadUserProfile(userId) {
  if (!userId) return null;
  const rows = await base44.entities.UserProfile.filter({ user_id: userId }).catch(() => []);
  return pickProfile(rows);
}

// Her name, in the order she'd most want to be called — with the same
// handle/username guard the Lifestyle hero already used (nobody wants
// "Ojihalliburton57's reading"). Returns "" when there's no human-looking name,
// so callers keep their un-named copy rather than printing something odd.
export function displayFirstName(user, profile) {
  const candidates = [profile?.display_name, user?.full_name, profile?.preferred_name];
  for (const c of candidates) {
    const first = String(c || "").trim().split(/\s+/)[0] || "";
    if (!first) continue;
    if (/\d/.test(first) || first.length > 16) continue;   // a handle, not a name
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return "";
}
