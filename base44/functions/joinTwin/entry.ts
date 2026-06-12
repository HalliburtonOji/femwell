// joinTwin:
// Pull-based pairing for Phase Twin. A member asks to be paired; we return their
// existing live pairing if any, else match them into a pending one in the same
// phase (never their own), else open a new pending pair. All writes asServiceRole
// so created_by is the service — only twin hashes are stored, never a user id.
//
// Body: { user_id, twin_hash, phase, life_stage, language }
// Returns: { ok, pair: { id, status, day, paired, role, match_phase, start_date, archive_at } }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TWIN_DAYS = 12;
const ABANDON_HOURS = 72;
const PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal', 'unknown'];
const nowMs = () => Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
const dateISO = (ms: number) => new Date(ms).toISOString().split('T')[0];

function dayFromStart(startISO: string | null): number {
  if (!startISO) return 0;
  const start = new Date(startISO + 'T00:00:00Z').getTime();
  const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z').getTime();
  return Math.min(TWIN_DAYS, Math.floor((today - start) / 86400000) + 1);
}
function shape(r: any, myHash: string) {
  const role = r.a_hash === myHash ? 'a' : (r.b_hash === myHash ? 'b' : null);
  return {
    id: r.id, status: r.status, match_phase: r.match_phase,
    start_date: r.start_date || null, archive_at: r.archive_at || null,
    day: (r.status === 'active' || r.status === 'archived') ? dayFromStart(r.start_date) : 0,
    paired: !!r.b_hash, role,
  };
}

// Timeout guard — an awaited platform read/write that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, twin_hash, phase, life_stage, language } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!twin_hash) return Response.json({ error: 'twin_hash required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const T = nowMs();
  const nowISO = iso(T);

  // Already in a live (pending/active, not yet archived) pairing? Hand it back —
  // and lazily archive any of mine that have run their 12 days.
  const asA = await withTimeout(sb.entities.TwinPair.filter({ a_hash: twin_hash }, '-created_date', 20), 2500, 'filter').catch(() => []);
  const asB = await withTimeout(sb.entities.TwinPair.filter({ b_hash: twin_hash }, '-created_date', 20), 2500, 'filter').catch(() => []);
  const both = [...asA, ...asB];
  for (const r of both) {
    if (r.status === 'active' && dayFromStart(r.start_date) >= TWIN_DAYS && (r.archive_at || '') <= nowISO) {
      await withTimeout(sb.entities.TwinPair.update(r.id, { status: 'archived' }), 6000, 'update').catch(() => {});
      r.status = 'archived';
    }
  }
  const mine = both.find((r: any) => (r.status === 'pending' || r.status === 'active'));
  if (mine) return Response.json({ ok: true, pair: shape(mine, twin_hash) });

  // Find a pending pair to join (same phase + language, not mine, not lapsed).
  const ph = PHASES.includes(phase) ? phase : 'unknown';
  const pendings = await withTimeout(sb.entities.TwinPair
    .filter({ status: 'pending', match_phase: ph, match_language: language || 'en-GB' }, 'created_date', 50), 2500, 'filter').catch(() => []);
  const lapseBefore = iso(T - ABANDON_HOURS * 3600e3);
  const cand = pendings.find((r: any) =>
    r.a_hash !== twin_hash &&
    (!life_stage || !r.match_life_stage || r.match_life_stage === life_stage) &&
    (r.created_date || r.last_active_at || nowISO) > lapseBefore);

  if (cand) {
    const live = await withTimeout(sb.entities.TwinPair.get(cand.id), 2500, 'get').catch(() => null);
    if (live && live.status === 'pending' && live.a_hash !== twin_hash) {
      const patch = {
        b_hash: twin_hash, status: 'active', start_date: dateISO(T),
        archive_at: iso(T + TWIN_DAYS * 86400e3), last_active_at: nowISO,
      };
      const updated = await withTimeout(sb.entities.TwinPair.update(live.id, patch), 6000, 'update').catch(() => null);
      if (updated) {
        // M5: confirm we actually won the pairing (concurrent joiner could have
        // filled b_hash first). If someone else got it, fall through to open a new one.
        const after = await withTimeout(sb.entities.TwinPair.get(live.id), 2500, 'get').catch(() => null);
        if (!after || after.b_hash === twin_hash) {
          return Response.json({ ok: true, pair: shape(after || { ...live, ...patch }, twin_hash) });
        }
      }
      // lost the race — fall through to open a new one
    }
  }

  const created = await withTimeout(sb.entities.TwinPair.create({
    a_hash: twin_hash, match_phase: ph, match_life_stage: life_stage || undefined,
    match_language: language || 'en-GB', status: 'pending', last_active_at: nowISO,
  }), 6000, 'create').catch((e: any) => { console.error('joinTwin create failed:', e?.message || e); return null; });
  if (!created) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, pair: shape(created, twin_hash) });
});
