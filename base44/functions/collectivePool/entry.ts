// collectivePool (Community Phase 4, §P.2.4) — the "together this week" pool. AGGREGATE-ONLY:
// the number is a COUNT of this week's contributions, never per-person, never ranked, never a
// streak. Two modes:
//   - GET (no moment): return { total, mine_today } for the current week.
//   - POST { moment }: add one gentle moment (rest/water/move/pause) within a generous
//     per-device daily cap, then return the new { total, mine_today }.
// Self-contained (gotcha #1); NOTHING after Deno.serve (gotcha #3); asServiceRole.
//
// Body: { user_id?, author_hash, moment? }   Returns: { ok, total, mine_today, added }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MOMENTS = new Set(['rest', 'water', 'move', 'pause']);
const DAILY_CAP = 8;

function weekKey(): string {
  const d = new Date();
  const dow = (d.getUTCDay() + 6) % 7;     // 0 = Monday
  const mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
  return mon.toISOString().slice(0, 10);
}
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any = {};
    try { const j = await req.json(); if (j && typeof j === 'object') p = j; } catch { p = {}; }
    const { user_id, author_hash } = p || {};
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });

    const sb = base44.asServiceRole;
    const gk = weekKey();
    const since = startOfTodayISO();

    const countTotal = async () => {
      const rows = await sb.entities.GoalContribution.filter({ goal_key: gk }, '-created_date', 2000).catch(() => []);
      return Array.isArray(rows) ? rows.length : 0;
    };
    const mineToday = async () => {
      const rows = await sb.entities.GoalContribution.filter({ goal_key: gk, author_hash: String(author_hash) }, '-created_date', 50).catch(() => []);
      return (Array.isArray(rows) ? rows : []).filter((r: any) => (r.created_date || '') >= since).length;
    };

    const moment = p?.moment ? String(p.moment) : '';
    if (!moment) {
      return Response.json({ ok: true, total: await countTotal(), mine_today: await mineToday(), added: false });
    }
    if (!MOMENTS.has(moment)) return Response.json({ error: 'unknown moment' }, { status: 400 });

    const today = await mineToday();
    if (today >= DAILY_CAP) {
      return Response.json({ ok: true, total: await countTotal(), mine_today: today, added: false, capped: true });
    }
    await sb.entities.GoalContribution.create({
      goal_key: gk, moment, author_hash: String(author_hash),
    }).catch((e: any) => { console.error('collectivePool create failed:', e?.message || e); return null; });

    return Response.json({ ok: true, total: await countTotal(), mine_today: today + 1, added: true });
  } catch (e: any) {
    console.error('collectivePool error:', e?.message || e);
    return Response.json({ error: 'Could not reach the pool' }, { status: 500 });
  }
});
