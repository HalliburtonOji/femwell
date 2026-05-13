// computeRedWhiteMoon:
// Monthly batch — classify each user as Red Moon / White Moon /
// Pink Moon / Purple Moon / mixed / insufficient_data based on which
// moon phase their last few period_starts fell on.
//
// Body: { user_id?: string }  — when present, only that user is processed
//                                (used by admin re-runs).
// Returns: { ok: true, scanned, updated, skipped }
//
// Schedule: cron-driven on the 1st of each month via pipelineOrchestrator
// phase 'computeRedWhiteMoon'.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Moon math (mirror of generateHoroscopeReading / src/utils/astrology.js) ──
const SYNODIC = 29.530588;
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

function getMoonPhaseKey(date: Date): string {
  const days = (date.getTime() - REF_NEW_MOON_MS) / 86400000;
  const cycles = days / SYNODIC;
  let position = cycles - Math.floor(cycles);
  if (position < 0) position += 1;
  const buckets = [
    { key: 'new',              min: 0.00, max: 0.03 },
    { key: 'waxing_crescent',  min: 0.03, max: 0.22 },
    { key: 'first_quarter',    min: 0.22, max: 0.28 },
    { key: 'waxing_gibbous',   min: 0.28, max: 0.47 },
    { key: 'full',             min: 0.47, max: 0.53 },
    { key: 'waning_gibbous',   min: 0.53, max: 0.72 },
    { key: 'last_quarter',     min: 0.72, max: 0.78 },
    { key: 'waning_crescent',  min: 0.78, max: 0.97 },
    { key: 'new',              min: 0.97, max: 1.01 },
  ];
  const b = buckets.find((x) => position >= x.min && position < x.max) || buckets[0];
  return b.key;
}

// ── Classifier (mirror of src/lib/astrology/redWhite.js) ────────────────────
const RED = new Set(['new', 'waxing_crescent']);
const WHITE = new Set(['full', 'waning_gibbous']);
const PINK = new Set(['first_quarter', 'waxing_gibbous']);
const PURPLE = new Set(['last_quarter', 'waning_crescent']);

function countMatches(keys: string[], allowed: Set<string>): number {
  let n = 0;
  for (const k of keys) if (allowed.has(k)) n += 1;
  return n;
}

function classify(periodStartDates: Date[]): {
  archetype: string;
  confidence: number;
  bleeds_at_phases: string[];
} {
  const sorted = periodStartDates
    .filter((d) => d && !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())
    .slice(0, 6);

  if (sorted.length < 3) {
    return { archetype: 'insufficient_data', confidence: 0, bleeds_at_phases: [] };
  }

  const phaseKeys = sorted.map((d) => getMoonPhaseKey(d));
  const sample = phaseKeys.length;
  const red = countMatches(phaseKeys, RED);
  const white = countMatches(phaseKeys, WHITE);
  const pink = countMatches(phaseKeys, PINK);
  const purple = countMatches(phaseKeys, PURPLE);
  const threshold = sample >= 6 ? 4 : sample >= 5 ? 3 : sample >= 4 ? 3 : 2;

  let archetype = 'mixed';
  let best = 0;
  if (red >= threshold && red > best) { archetype = 'red_moon'; best = red; }
  if (white >= threshold && white > best) { archetype = 'white_moon'; best = white; }
  if (pink >= threshold && pink > best) { archetype = 'pink_moon'; best = pink; }
  if (purple >= threshold && purple > best) { archetype = 'purple_moon'; best = purple; }
  if (archetype === 'mixed') best = Math.max(red, white, pink, purple);

  return {
    archetype,
    confidence: sample > 0 ? Math.min(1, best / sample) : 0,
    bleeds_at_phases: phaseKeys,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const MS_PER_DAY = 86400000;

function daysSince(iso: string | null | undefined): number {
  if (!iso) return Infinity;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return Infinity;
  return Math.floor((Date.now() - t) / MS_PER_DAY);
}

// ── Main ────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);

  let payload: any = {};
  try { payload = await req.json(); } catch { /* allow empty body for cron */ }
  const onlyUserId: string | undefined = payload?.user_id;

  if (me && me.role !== 'admin' && (!onlyUserId || me.id !== onlyUserId)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = base44.asServiceRole;
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - 180 * MS_PER_DAY); // last 180 days

  // Decide the user set. For a single-user re-run, look up that user.
  let userIds: string[] = [];
  if (onlyUserId) {
    userIds = [onlyUserId];
  } else {
    // Use AstroProfile as the canonical user table for horoscope users.
    // Cap at 1000 for monthly safety; well above current onboarded base.
    const profiles = await sb.entities.AstroProfile.filter({}, '-updated_date', 1000).catch(() => []);
    userIds = Array.from(new Set(profiles.map((p: any) => p?.user_id).filter(Boolean)));
  }

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  const errors: any[] = [];

  for (const userId of userIds) {
    scanned += 1;
    try {
      // Pull recent period_starts. Over-fetch then filter client-side.
      const cycleRows = await sb.entities.CycleEvents.filter(
        { user_id: userId }, '-date', 36
      ).catch(() => []);

      const periodStarts: Date[] = [];
      for (const r of cycleRows || []) {
        const t = String(r?.type || '').toLowerCase();
        if (t !== 'period_start' && t !== 'periodstart') continue;
        const d = new Date(r.date);
        if (isNaN(d.getTime())) continue;
        if (d < cutoff) continue;
        periodStarts.push(d);
      }

      if (periodStarts.length < 3) {
        // Skip insufficient_data unless overdue: refresh the timestamp at most
        // once every 60 days so we don't write churn for every empty user.
        const existing = await sb.entities.HoroscopePersistedClassification.filter(
          { user_id: userId }, '-last_computed_at', 1
        ).catch(() => []);
        const row = existing?.[0];
        if (row && daysSince(row.last_computed_at) < 60) {
          skipped += 1;
          continue;
        }
        const patch = {
          user_id: userId,
          red_white_archetype: 'insufficient_data',
          confidence: 0,
          bleeds_at_phases: [],
          last_computed_at: now,
          updated_at: now,
        };
        if (row) {
          await sb.entities.HoroscopePersistedClassification.update(row.id, patch);
        } else {
          await sb.entities.HoroscopePersistedClassification.create({ ...patch, created_at: now });
        }
        updated += 1;
        continue;
      }

      const cls = classify(periodStarts);
      const existing = await sb.entities.HoroscopePersistedClassification.filter(
        { user_id: userId }, '-last_computed_at', 1
      ).catch(() => []);
      const row = existing?.[0];
      const patch = {
        user_id: userId,
        red_white_archetype: cls.archetype,
        confidence: cls.confidence,
        bleeds_at_phases: cls.bleeds_at_phases,
        last_computed_at: now,
        updated_at: now,
      };
      if (row) {
        await sb.entities.HoroscopePersistedClassification.update(row.id, patch);
      } else {
        await sb.entities.HoroscopePersistedClassification.create({ ...patch, created_at: now });
      }
      updated += 1;
    } catch (err: any) {
      errors.push({ user_id: userId, error: err?.message || String(err) });
    }
  }

  return Response.json({ ok: true, scanned, updated, skipped, errors: errors.slice(0, 10) });
});
