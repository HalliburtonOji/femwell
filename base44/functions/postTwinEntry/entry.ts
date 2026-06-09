// postTwinEntry:
// A member writes (or edits) their answer for the current day. Verifies the caller
// is a member of an ACTIVE pairing and that the day is the current day (no
// back-filling, no future). One row per (pair_id, author_hash, day) — upserted.
// asServiceRole so created_by is the service; only the twin hash is stored.
//
// Body: { user_id, twin_hash, pair_id, day, prompt_key, body }
// Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TWIN_DAYS = 12;
const MAX_ANSWER_CHARS = 800;
function dayFromStart(startISO: string | null): number {
  if (!startISO) return 0;
  const start = new Date(startISO + 'T00:00:00Z').getTime();
  const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z').getTime();
  return Math.min(TWIN_DAYS, Math.floor((today - start) / 86400000) + 1);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, twin_hash, pair_id, day, prompt_key, body } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!twin_hash || !pair_id) return Response.json({ error: 'twin_hash + pair_id required' }, { status: 400 });
  if (!body || !String(body).trim()) return Response.json({ error: 'body required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const pair = await sb.entities.TwinPair.get(pair_id).catch(() => null);
  if (!pair) return Response.json({ error: 'Not found' }, { status: 404 });
  if (pair.a_hash !== twin_hash && pair.b_hash !== twin_hash) {
    return Response.json({ error: 'Not your pairing' }, { status: 403 });
  }
  if (pair.status !== 'active') return Response.json({ error: 'Pairing not active' }, { status: 409 });

  const currentDay = dayFromStart(pair.start_date);
  const wantDay = Number(day) || currentDay;
  if (wantDay !== currentDay) {
    return Response.json({ error: 'Can only answer the current day', currentDay }, { status: 409 });
  }

  const text = String(body).slice(0, MAX_ANSWER_CHARS);
  const nowISO = new Date().toISOString();

  const rows = await sb.entities.TwinEntry.filter({ pair_id }, undefined, 200).catch(() => []);
  const existing = rows.find((r: any) => r.author_hash === twin_hash && Number(r.day) === currentDay);

  let ok;
  if (existing) {
    ok = await sb.entities.TwinEntry.update(existing.id, { body: text, prompt_key: prompt_key || existing.prompt_key })
      .catch((e: any) => { console.error('postTwinEntry update failed:', e?.message || e); return null; });
  } else {
    ok = await sb.entities.TwinEntry.create({
      pair_id, author_hash: twin_hash, day: currentDay, prompt_key: prompt_key || `d${currentDay}`, body: text,
    }).catch((e: any) => { console.error('postTwinEntry create failed:', e?.message || e); return null; });
  }
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });

  await sb.entities.TwinPair.update(pair_id, { last_active_at: nowISO }).catch(() => {});
  return Response.json({ ok: true });
});
