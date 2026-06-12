// getTwinDay:
// The state source for a Phase Twin pairing on a given day. Verifies the caller is
// a member (by twin_hash), computes the current day, lazily archives a finished
// pairing, and returns BOTH answers for the day — but the twin's body is RELEASED
// ONLY IF the caller has written their own for that day (the "blurred until you
// write" rule, enforced server-side, not just in the UI). asServiceRole; no hashes
// of the other member are ever returned.
//
// Body: { user_id, twin_hash, pair_id, day? }   (day defaults to the current day)
// Returns: { ok, status, day, currentDay, paired, mine, twin, twinAnswered }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TWIN_DAYS = 12;
function dayFromStart(startISO: string | null): number {
  if (!startISO) return 0;
  const start = new Date(startISO + 'T00:00:00Z').getTime();
  const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z').getTime();
  return Math.min(TWIN_DAYS, Math.floor((today - start) / 86400000) + 1);
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
  const { user_id, twin_hash, pair_id, day } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!twin_hash || !pair_id) return Response.json({ error: 'twin_hash + pair_id required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const pair = await withTimeout(sb.entities.TwinPair.get(pair_id), 2500, 'get').catch(() => null);
  if (!pair) return Response.json({ ok: true, gone: true });
  if (pair.a_hash !== twin_hash && pair.b_hash !== twin_hash) {
    return Response.json({ error: 'Not your pairing' }, { status: 403 });
  }

  const nowISO = new Date().toISOString();
  let status = pair.status;
  const currentDay = dayFromStart(pair.start_date);
  if (status === 'active' && currentDay >= TWIN_DAYS && (pair.archive_at || '') <= nowISO) {
    await withTimeout(sb.entities.TwinPair.update(pair.id, { status: 'archived' }), 6000, 'update').catch(() => {});
    status = 'archived';
  }
  if (status === 'pending') {
    return Response.json({ ok: true, status, day: 0, currentDay: 0, paired: false, mine: null, twin: null, twinAnswered: false });
  }

  const otherHash = pair.a_hash === twin_hash ? pair.b_hash : pair.a_hash;
  // Which day to read — never a future day.
  const wantDay = Math.max(1, Math.min(currentDay, Number(day) || currentDay));

  const rows = await withTimeout(sb.entities.TwinEntry.filter({ pair_id }, undefined, 200), 2500, 'filter').catch(() => []);
  const mineRow = rows.find((r: any) => r.author_hash === twin_hash && Number(r.day) === wantDay) || null;
  const twinRow = rows.find((r: any) => r.author_hash === otherHash && Number(r.day) === wantDay) || null;

  // Blur gate: only release the twin's words once the caller has written theirs.
  // L5: also withhold the mere FACT she answered until you've written — strict
  // mutual blur, so you can't lurk to see if she showed up first.
  const mineWritten = !!(mineRow && (mineRow.body || '').trim());
  const twinAnswered = mineWritten && !!(twinRow && (twinRow.body || '').trim());

  return Response.json({
    ok: true, status, day: wantDay, currentDay, paired: true,
    mine: mineRow ? { day: wantDay, body: mineRow.body || '', prompt_key: mineRow.prompt_key || null } : null,
    twin: (mineWritten && twinAnswered) ? { day: wantDay, body: twinRow.body || '', prompt_key: twinRow.prompt_key || null } : null,
    twinAnswered,
  });
});
