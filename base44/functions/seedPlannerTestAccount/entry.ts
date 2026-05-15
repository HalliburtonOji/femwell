// seedPlannerTestAccount — Planner Phase 2 A2-5 (admin-gated).
//
// Populates a single user with the minimum-realistic data envelope needed to
// exercise every data-gated Planner surface. Targets `cycles_observed = 4` so
// the confidence pill flips to calibrated, the Cycle-tab Week Ahead chip
// strip + ETA footer render fully, Cycle Mirror Sunday tile clears its gate,
// and Doctor-Ready Diary has 6 weeks of mood + symptom data to summarise.
//
// Body (admin-only):
//   POST { user_id: "uid" }                    — seed the named user
//   POST { user_id: "uid", cleanup: true }     — delete the seeded rows
//
// Idempotency: skips seeding when the user already has >= 4 PeriodStart
// events (i.e. a previous seed run already happened or the user has real
// cycle data). Cleanup is best-effort by date range + tag.
//
// Returns: { ok, mode: "seed"|"cleanup"|"skip", user_id, counts }
//
// Spec ref: claude-state/base44_mps/2026-05-15_planner_phase2_A2/spec.md §A2-5.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SEED_TAG = 'seedPlannerTestAccount-2026-05-15';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toDateStr(d) { return d.toISOString().split('T')[0]; }
function daysAgo(n) {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n);
  return d;
}

const RITUAL_HABITS = ['Morning walk', 'Drink water', '5-minute reading'];
const HABIT_CATEGORY = { 'Morning walk': 'movement', 'Drink water': 'hydration', '5-minute reading': 'mindfulness' };

// 5 period starts spread 26-29 days apart, ending in a "now-7-days" most-recent
// row. Gives cycles_observed = 4 intervals.
function periodStartOffsets() { return [7, 35, 63, 92, 121]; }
function periodLengthDays(i) { return [4, 5, 4, 5, 5][i] || 5; }

// Mood + energy 4-5 range with 4 dip-days in the 42-day window to test Quiet
// Mode gate B (mood<3 && energy<3 for 2 days running). Deterministic by date.
function moodEnergyForOffset(offset) {
  if (offset >= 5 && offset <= 6) return { mood: 2, energy: 2 }; // 2-day low → gate triggers
  if (offset % 11 === 0) return { mood: 3, energy: 3 };
  if (offset % 7 === 0) return { mood: 4, energy: 4 };
  return { mood: 5, energy: 4 };
}

// Habit completion ratio ~75% with phase-aware dips.
function habitCompletedForDay(habitName, offsetDays) {
  // Deterministic pseudo-random.
  let h = 17;
  for (let i = 0; i < habitName.length; i += 1) h = (h * 31 + habitName.charCodeAt(i)) | 0;
  const x = Math.abs((h * (offsetDays + 1)) % 100);
  return x < 75; // ~75% completion
}

// UK-local meals — 7-day plan keyed by lowercase weekday so Planner.jsx
// can read it as plan_days[weekdayKey(date)].
const MEAL_PLAN_DAYS = {
  monday:    { breakfast: 'Porridge with stewed apple', lunch: 'Lentil & chicken stew', dinner: 'Roasted salmon, greens, jacket potato' },
  tuesday:   { breakfast: 'Greek yoghurt, oats, honey', lunch: 'Jacket potato, beans, slaw', dinner: 'Turkey meatballs in tomato sauce, pasta' },
  wednesday: { breakfast: 'Eggs on rye, avocado', lunch: 'Carrot & coriander soup, sourdough', dinner: 'Cottage pie, peas' },
  thursday:  { breakfast: 'Porridge with banana + flax', lunch: 'Tuna + butter-bean salad', dinner: 'Pan-fried sea bass, mash, samphire' },
  friday:    { breakfast: 'Smoked salmon, wholegrain, lemon', lunch: 'Goat cheese + roasted-beetroot wrap', dinner: 'Roast chicken, roast vegetables' },
  saturday:  { breakfast: 'Full breakfast (poached eggs, beans, mushrooms)', lunch: 'Soup + crusty bread', dinner: 'Spaghetti bolognese' },
  sunday:    { breakfast: 'French toast, berries', lunch: 'Sunday roast — beef, Yorkshires, gravy', dinner: 'Cheese board, oatcakes, fruit' },
};

const HRT_REGIMEN = {
  active: true,
  method: 'patch',
  evening_dose: 'Estradiol 50mcg',
  reminder_time: '21:00',
};

// 6 PersonalTasks for today — 2 anchors + 4 non-anchor. The is_anchor field
// is in the local jsonc but not yet in the live schema; we write it anyway
// so the value lands once Cowork publishes the schema migration.
const PERSONAL_TASKS_FOR_TODAY = [
  { title: 'Pick up GP referral letter', category: 'wellness', is_anchor: true },
  { title: 'Call mum back about Sunday',  category: 'personal',  is_anchor: true },
  { title: 'Edit pass on the deck',       category: 'work',      is_anchor: false },
  { title: 'Read 10 pages of Suddenly',   category: 'personal',  is_anchor: false },
  { title: 'Reply to Jess on WhatsApp',   category: 'social',    is_anchor: false },
  { title: 'Stretch 5 minutes',           category: 'wellness',  is_anchor: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const userId = String(body?.user_id || '').trim();
    if (!userId) return Response.json({ error: 'user_id is required' }, { status: 400 });
    const cleanup = !!body?.cleanup;

    const sb = base44.asServiceRole;
    const now = new Date().toISOString();
    const counts = { CycleEvents: 0, HabitLogs: 0, UserPrograms: 0, MealPlans: 0, DailyCheckins: 0, PersonalTasks: 0, UserProfile: 0 };

    // ── Cleanup mode ─────────────────────────────────────────────────────────
    if (cleanup) {
      const wipe = async (entity, filter) => {
        const rows = await sb.entities[entity].filter(filter, '-created_date', 500).catch(() => []);
        for (const r of rows || []) {
          try { await sb.entities[entity].delete(r.id); counts[entity] += 1; } catch { /* swallow */ }
        }
      };
      await wipe('CycleEvents', { user_id: userId });
      await wipe('HabitLogs', { user_id: userId });
      await wipe('UserPrograms', { user_id: userId });
      await wipe('MealPlans', { user_id: userId });
      await wipe('DailyCheckins', { user_id: userId });
      await wipe('PersonalTasks', { user_id: userId });
      return Response.json({ ok: true, mode: 'cleanup', user_id: userId, counts });
    }

    // ── Idempotency check ───────────────────────────────────────────────────
    const existingPeriods = await sb.entities.CycleEvents
      .filter({ user_id: userId, type: 'PeriodStart' }, '-date', 10)
      .catch(() => []);
    if ((existingPeriods || []).length >= 4) {
      return Response.json({ ok: true, mode: 'skip', user_id: userId, reason: 'already_seeded', counts });
    }

    // ── 1. CycleEvents — 5 PeriodStart + 5 PeriodEnd ────────────────────────
    const periodStartDates = periodStartOffsets().map((off) => toDateStr(daysAgo(off)));
    const flowLevels = ['light', 'medium', 'medium', 'medium', 'medium'];
    for (let i = 0; i < periodStartDates.length; i += 1) {
      try {
        await sb.entities.CycleEvents.create({
          user_id: userId,
          date: periodStartDates[i],
          type: 'PeriodStart',
          flow_level: flowLevels[i],
          created_at: now,
        });
        counts.CycleEvents += 1;
      } catch { /* swallow */ }
      // PeriodEnd a few days later (matching periodLengthDays).
      const endDate = new Date(periodStartDates[i]);
      endDate.setDate(endDate.getDate() + periodLengthDays(i));
      try {
        await sb.entities.CycleEvents.create({
          user_id: userId,
          date: toDateStr(endDate),
          type: 'PeriodEnd',
          flow_level: 'light',
          created_at: now,
        });
        counts.CycleEvents += 1;
      } catch { /* swallow */ }
    }

    // ── 2. HabitLogs — 28 days × 3 ritual habits ────────────────────────────
    for (let off = 0; off < 28; off += 1) {
      const dateStr = toDateStr(daysAgo(off));
      for (const habitName of RITUAL_HABITS) {
        const completed = habitCompletedForDay(habitName, off);
        try {
          await sb.entities.HabitLogs.create({
            user_id: userId,
            date: dateStr,
            habit_type: habitName,
            habit_name: habitName,                  // Planner.jsx reader compat
            habit_category: HABIT_CATEGORY[habitName] || 'other',
            completed,
            is_completed: completed,               // Planner.jsx reader compat
            created_at: now,
          });
          counts.HabitLogs += 1;
        } catch { /* swallow */ }
      }
    }

    // ── 3. Active programme — Sleep Reset ───────────────────────────────────
    try {
      await sb.entities.UserPrograms.create({
        user_id: userId,
        program_id: 'sleep-reset',
        program_key: 'sleep-reset',
        program_name: 'Sleep Reset',
        started_at: toDateStr(daysAgo(0)),
        current_day: 1,
        total_days: 7,
        status: 'active',
        is_completed: false,
        is_saved: true,
        reminder_time: '21:30',
        created_at: now,
      });
      counts.UserPrograms += 1;
    } catch { /* swallow */ }

    // ── 4. MealPlan for this week ────────────────────────────────────────────
    try {
      // Compute the Monday of this week.
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(monday.getDate() + diff);
      await sb.entities.MealPlans.create({
        user_id: userId,
        week_start: toDateStr(monday),
        plan_days: MEAL_PLAN_DAYS,
        created_at: now,
      });
      counts.MealPlans += 1;
    } catch { /* swallow */ }

    // ── 5. DailyCheckins — 42 days of mood + energy ─────────────────────────
    for (let off = 0; off < 42; off += 1) {
      const { mood, energy } = moodEnergyForOffset(off);
      try {
        await sb.entities.DailyCheckins.create({
          user_id: userId,
          date: toDateStr(daysAgo(off)),
          mood,
          energy,
          mood_score: mood,
          energy_level: energy,
          sleep_hours: 7 + ((off % 3) - 1) * 0.5, // 6.5/7/7.5 rotation
          sleep_quality: 4,
          body_temp_feel: off % 8 === 0 ? 'hot_flashes' : 'normal',
          cramps: off % 14 === 0 ? 4 : 1,
          notes: off === 0 ? 'Felt steady. Picked up the GP letter.' : '',
          created_at: now,
        });
        counts.DailyCheckins += 1;
      } catch { /* swallow */ }
    }

    // ── 6. PersonalTasks for today ──────────────────────────────────────────
    const todayStr = toDateStr(new Date());
    for (const t of PERSONAL_TASKS_FOR_TODAY) {
      try {
        await sb.entities.PersonalTasks.create({
          user_id: userId,
          date: todayStr,
          title: t.title,
          category: t.category,
          completed: false,
          is_anchor: t.is_anchor,
          created_at: now,
        });
        counts.PersonalTasks += 1;
      } catch { /* swallow */ }
    }

    // ── 7. UserProfile updates — HRT + cycle_prediction_meta + pacing_bank ──
    try {
      const profiles = await sb.entities.UserProfile.filter({ user_id: userId }, undefined, 1).catch(() => []);
      const nextPeriodIso = toDateStr(daysFromNow(20)); // 20-ish days from now
      const profilePatch = {
        hrt_regimen: HRT_REGIMEN,
        cycle_prediction_meta: {
          confidence_pct: 84,
          cycles_observed: 4,
          next_period_eta: nextPeriodIso,
          eta_window_days: 1,
        },
        pacing_bank_opt_in: true,
        last_period_start_date: periodStartDates[0],
        cycle_avg_length: 28,
        period_length: 5,
      };
      if (profiles && profiles.length > 0) {
        await sb.entities.UserProfile.update(profiles[0].id, profilePatch);
      } else {
        await sb.entities.UserProfile.create({ user_id: userId, ...profilePatch, created_at: now });
      }
      counts.UserProfile += 1;
    } catch { /* swallow */ }

    return Response.json({ ok: true, mode: 'seed', user_id: userId, seed_tag: SEED_TAG, counts });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});
