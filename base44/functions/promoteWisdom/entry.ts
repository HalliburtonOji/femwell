// promoteWisdom (Community Phase 4, §3.8) — the durable write path for the Living Wisdom
// library. Two modes, both ADMIN-ONLY (the library is public-read, so writes are a curation
// tool, never a user action — a future auto-promote cron runs with the same admin/service
// identity):
//   - curate: { body, topic?, life_stage? } → a WisdomEntry(source:"curated").
//   - promote: { echo_id, holds } → copy a well-held, clean, recent Echo's SCRUBBED LINE
//     (never its author) into a WisdomEntry(source:"community") before the 48h fade. Gate:
//     holds >= 5, echo not hidden, age <= 180d; dedup by source_echo_id.
// Self-contained (gotcha #1); NOTHING after Deno.serve (gotcha #3); asServiceRole write.
//
// Body: { body?, topic?, life_stage?, echo_id?, holds? }
// Returns: { ok, wisdom } | { ok, skipped } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HOLDS_FLOOR = 5;
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const MAX_LEN = 240;
// strip emoji defensively (no emoji anywhere)
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });
    if (me.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const sb = base44.asServiceRole;

    // ── promote a held echo ──
    if (p?.echo_id) {
      const holds = Number(p?.holds) || 0;
      if (holds < HOLDS_FLOOR) return Response.json({ ok: true, skipped: 'below-holds-floor' }, { status: 200 });
      const echo = await sb.entities.Echo.get(String(p.echo_id)).catch(() => null);
      if (!echo) return Response.json({ error: 'Echo not found' }, { status: 404 });
      if (echo.hidden) return Response.json({ ok: true, skipped: 'hidden' }, { status: 200 });
      const age = Date.now() - Date.parse(echo.created_date || echo.live_at || '');
      if (Number.isFinite(age) && age > MAX_AGE_MS) return Response.json({ ok: true, skipped: 'too-old' }, { status: 200 });

      const dupe = await sb.entities.WisdomEntry.filter({ source_echo_id: String(p.echo_id) }, '-created_date', 1).catch(() => []);
      if (Array.isArray(dupe) && dupe.length) return Response.json({ ok: true, skipped: 'already-promoted' }, { status: 200 });

      const body = String(echo.body || '').replace(EMOJI, '').trim().slice(0, MAX_LEN);
      if (!body) return Response.json({ error: 'Empty echo' }, { status: 400 });
      const w = await sb.entities.WisdomEntry.create({
        body, topic: p?.topic ? String(p.topic).slice(0, 24) : undefined,
        life_stage: echo.life_stage ? String(echo.life_stage).slice(0, 24) : undefined,
        source: 'community', holds, source_echo_id: String(p.echo_id),
      }).catch((e: any) => { console.error('promoteWisdom(community) failed:', e?.message || e); return null; });
      if (!w) return Response.json({ error: 'Write failed' }, { status: 500 });
      return Response.json({ ok: true, wisdom: { id: w.id, source: 'community' } });
    }

    // ── curate a line ──
    const body = String(p?.body || '').replace(EMOJI, '').trim().slice(0, MAX_LEN);
    if (!body) return Response.json({ error: 'body or echo_id required' }, { status: 400 });
    const w = await sb.entities.WisdomEntry.create({
      body,
      topic: p?.topic ? String(p.topic).slice(0, 24) : undefined,
      life_stage: p?.life_stage ? String(p.life_stage).slice(0, 24) : undefined,
      source: 'curated', holds: 0,
    }).catch((e: any) => { console.error('promoteWisdom(curated) failed:', e?.message || e); return null; });
    if (!w) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, wisdom: { id: w.id, source: 'curated' } });
  } catch (e: any) {
    console.error('promoteWisdom error:', e?.message || e);
    return Response.json({ error: 'Could not promote' }, { status: 500 });
  }
});
