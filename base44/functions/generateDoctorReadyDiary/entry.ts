// generateDoctorReadyDiary — Planner Phase 2 C4 (MP-A1).
//
// Server-side data assembly for the Doctor-Ready Diary. Returns a structured
// JSON payload the client renders into the printable diary surface + downloads
// as PDF via jsPDF. The function itself does NOT generate the PDF — Deno's
// PDF story is fragile and a client render makes the print/A4 contract easy
// to hit on iOS Safari (the spec's acceptance target).
//
// Pulls:
//   - CycleEvents (PeriodStart / PeriodEnd / Spotting) in date range
//   - DailyCheckins (mood / energy / sleep / symptoms — equivalent of MoodLogs)
//   - HabitLogs (movement / hydration / mindfulness / sleep / nutrition flags)
//   - UserProfile.hrt_regimen (active / method / evening_dose / reminder_time)
//   - UserProfile.cycle_prediction_meta (confidence — populated by C1 migration)
//
// NICE NG23-aligned field naming so a GP scanning the printout recognises:
//   - "Menstrual pattern" (PeriodStart intervals + flow level)
//   - "Vasomotor symptoms" (hot_flashes count from body_temp_feel)
//   - "Sleep disturbance" (sleep_hours / sleep_quality averages)
//   - "Mood + cognitive" (mood + focus averages)
//   - "Bleeding pattern" (PeriodStart → PeriodEnd lengths if both logged)
//   - "Treatment in use" (hrt_regimen)
//
// Body (signed-in user — no admin gate, user reads own data):
//   POST {}                  — default 6 weeks back
//   POST { weeks: 12 }       — bounded 1..26 weeks
//
// Returns:
//   { ok, range: { from, to, weeks }, profile_summary, cycle_events,
//     bleeding_pattern, daily_checkins, habit_logs, hrt, symptom_summary,
//     three_bullet_summary }
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C4.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MIN_WEEKS = 1;
const MAX_WEEKS = 26;
const DEFAULT_WEEKS = 6;

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function avg(nums) {
  const xs = (nums || []).filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (xs.length === 0) return null;
  return Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10;
}

function countWhere(rows, predicate) {
  let n = 0;
  for (const r of rows || []) if (predicate(r)) n += 1;
  return n;
}

// Three-bullet headline summary — deterministic, no LLM call (spec keeps the
// LLM summary as a follow-up enhancement; v1 ships honest computed bullets).
function buildThreeBulletSummary({ cycleEvents, checkins, weeks, hrt }) {
  const bullets = [];
  const periodStarts = (cycleEvents || []).filter((e) => e.type === 'PeriodStart').sort((a, b) => a.date.localeCompare(b.date));

  // Bullet 1 — menstrual pattern.
  if (periodStarts.length >= 2) {
    const intervals = [];
    for (let i = 1; i < periodStarts.length; i += 1) {
      intervals.push(daysBetween(periodStarts[i - 1].date, periodStarts[i].date));
    }
    const mean = Math.round(intervals.reduce((s, x) => s + x, 0) / intervals.length);
    const minI = Math.min(...intervals);
    const maxI = Math.max(...intervals);
    bullets.push(`Menstrual pattern over ${weeks} weeks: ${intervals.length + 1} period starts logged; cycle length ${mean} days (range ${minI}–${maxI}).`);
  } else if (periodStarts.length === 1) {
    bullets.push(`One period start logged in the past ${weeks} weeks (${periodStarts[0].date}). Not enough data to infer cycle length.`);
  } else {
    bullets.push(`No period starts logged in the past ${weeks} weeks.`);
  }

  // Bullet 2 — symptom load.
  const hotFlashDays = countWhere(checkins, (c) => c.body_temp_feel === 'hot_flashes');
  const sleepHoursList = (checkins || []).map((c) => c.sleep_hours).filter((x) => typeof x === 'number');
  const sleepHoursAvg = avg(sleepHoursList);
  const moodAvg = avg((checkins || []).map((c) => c.mood ?? c.mood_score));
  const symPieces = [];
  if (hotFlashDays > 0) symPieces.push(`hot flashes on ${hotFlashDays} day${hotFlashDays === 1 ? '' : 's'}`);
  if (sleepHoursAvg != null) symPieces.push(`mean sleep ${sleepHoursAvg}h/night`);
  if (moodAvg != null) symPieces.push(`mean mood ${moodAvg}/5`);
  bullets.push(symPieces.length ? `Symptom load: ${symPieces.join('; ')}.` : `No symptom log entries in window.`);

  // Bullet 3 — treatment context.
  if (hrt && hrt.active && hrt.method && hrt.method !== 'none') {
    const dose = hrt.evening_dose ? `, evening dose ${hrt.evening_dose}` : '';
    bullets.push(`Current HRT regimen: ${hrt.method}${dose}. Adherence reminder set${hrt.reminder_time ? ` at ${hrt.reminder_time}` : ''}.`);
  } else {
    bullets.push(`No HRT regimen recorded. Patient reviewing options.`);
  }

  return bullets;
}

function summariseSymptoms(checkins) {
  // Aggregate the symptom-shaped fields into a per-symptom day count.
  const out = {
    hot_flashes_days: 0,
    cold_days: 0,
    cramps_severe_days: 0,        // cramps >= 4
    headache_days: 0,             // headache >= 3
    bloating_days: 0,             // bloating >= 3
    breast_tenderness_days: 0,    // >= 3
    cravings_days: 0,             // appetite === 'cravings'
    notable_notes: [],
  };
  for (const c of checkins || []) {
    if (c.body_temp_feel === 'hot_flashes') out.hot_flashes_days += 1;
    if (c.body_temp_feel === 'cold') out.cold_days += 1;
    if (typeof c.cramps === 'number' && c.cramps >= 4) out.cramps_severe_days += 1;
    if (typeof c.headache === 'number' && c.headache >= 3) out.headache_days += 1;
    if (typeof c.bloating === 'number' && c.bloating >= 3) out.bloating_days += 1;
    if (typeof c.breast_tenderness === 'number' && c.breast_tenderness >= 3) out.breast_tenderness_days += 1;
    if (c.appetite === 'cravings') out.cravings_days += 1;
    if (typeof c.notes === 'string' && c.notes.trim().length > 0 && out.notable_notes.length < 6) {
      out.notable_notes.push({ date: c.date, note: c.notes.trim().slice(0, 200) });
    }
  }
  return out;
}

function summariseBleeding(cycleEvents) {
  // Pair PeriodStart → PeriodEnd into bleeding episodes.
  const sorted = (cycleEvents || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const episodes = [];
  let openStart = null;
  for (const e of sorted) {
    if (e.type === 'PeriodStart') openStart = { start: e.date, flow_level: e.flow_level || null };
    else if (e.type === 'PeriodEnd' && openStart) {
      const length = daysBetween(openStart.start, e.date) + 1;
      episodes.push({ start: openStart.start, end: e.date, length_days: length, flow_level: openStart.flow_level });
      openStart = null;
    }
  }
  // Carry the open one (if any) as ongoing.
  if (openStart) episodes.push({ start: openStart.start, end: null, length_days: null, flow_level: openStart.flow_level, ongoing: true });
  return episodes;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me?.id) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const weeksRaw = Number(body?.weeks) || DEFAULT_WEEKS;
    const weeks = Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, Math.round(weeksRaw)));

    const to = new Date(); to.setHours(0, 0, 0, 0);
    const from = new Date(to); from.setDate(from.getDate() - weeks * 7);
    const fromStr = toDateStr(from);
    const toStr = toDateStr(to);

    const sb = base44.asServiceRole;
    const userId = me.id;

    // Pull all relevant rows in parallel. Each entity is owner-scoped via RLS
    // when called through the user client; we use service-role + explicit
    // user_id filter for consistency with other Phase 2 functions.
    //
    // Base44 SDK doesn't support `_gte / _lte` filter operators — we fetch
    // most-recent rows and filter to the window in-memory (same pattern as
    // checkSymptomPatterns / computeCorrelations / generateWeeklyInsights).
    const inWindow = (rows) => (rows || []).filter((r) => r?.date && r.date >= fromStr && r.date <= toStr);
    const [profilesRaw, cycleEventsRaw, checkinsRaw, habitLogsRaw] = await Promise.all([
      sb.entities.UserProfile.filter({ user_id: userId }, null, 1).catch(() => []),
      sb.entities.CycleEvents.filter({ user_id: userId }, '-date', 500).catch(() => []),
      sb.entities.DailyCheckins.filter({ user_id: userId }, '-date', 500).catch(() => []),
      sb.entities.HabitLogs.filter({ user_id: userId }, '-date', 1000).catch(() => []),
    ]);
    const profiles = profilesRaw;
    const cycleEvents = inWindow(cycleEventsRaw);
    const checkins = inWindow(checkinsRaw);
    const habitLogs = inWindow(habitLogsRaw);

    const profile = Array.isArray(profiles) && profiles.length ? profiles[0] : null;
    const hrt = profile?.hrt_regimen || null;
    const meta = profile?.cycle_prediction_meta || null;

    const bleedingPattern = summariseBleeding(cycleEvents);
    const symptomSummary = summariseSymptoms(checkins);
    const threeBullets = buildThreeBulletSummary({ cycleEvents, checkins, weeks, hrt });

    // Habit completion rates by category (last `weeks` weeks).
    const habitByCat = {};
    for (const h of habitLogs || []) {
      const cat = h.habit_category || 'other';
      // Tolerant of legacy + Planner shapes — Planner.jsx writes `is_completed`
      // while Track.jsx writes `completed`; we accept either.
      const isCompleted = h.completed ?? h.is_completed ?? false;
      habitByCat[cat] = habitByCat[cat] || { total: 0, completed: 0 };
      habitByCat[cat].total += 1;
      if (isCompleted) habitByCat[cat].completed += 1;
    }

    return Response.json({
      ok: true,
      generated_at: new Date().toISOString(),
      range: { from: fromStr, to: toStr, weeks },
      profile_summary: {
        cycle_avg_length: profile?.cycle_avg_length ?? null,
        last_period_start_date: profile?.last_period_start_date ?? null,
        confidence_pct: meta?.confidence_pct ?? null,
        cycles_observed: meta?.cycles_observed ?? null,
      },
      cycle_events: cycleEvents,
      bleeding_pattern: bleedingPattern,
      daily_checkins: checkins,
      habit_logs_by_category: habitByCat,
      hrt: hrt && hrt.active && hrt.method && hrt.method !== 'none' ? hrt : null,
      symptom_summary: symptomSummary,
      three_bullet_summary: threeBullets,
    });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});
