// joinClub (Community v2) — record an anonymous opt-in membership of a Club. Self-contained
// (no shared import — Base44 deploy gotcha #1). asServiceRole write, so created_by is the
// service, never the member. Dedups (no duplicate membership rows). NOTHING is declared after
// Deno.serve (gotcha #3).
//
// Body: { user_id?, author_hash, club_key, consented? }
// Returns: { ok, joined } | { ok, already: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Live Jess-hosted Clubs. Keep in sync with src/components/community/clubsConfig.js CLUB_KEYS.
// (Member-created Club keys are validated against the Club entity once user-create is enabled.)
const CLUB_KEYS = new Set([
  'slow-mornings', 'creativity-corner',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const { user_id, author_hash, club_key } = p || {};
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!author_hash || !club_key) return Response.json({ error: 'author_hash + club_key required' }, { status: 400 });

    const sb = base44.asServiceRole;
    // A valid Club is a known Jess-hosted key, a per-book daily-read readers' corner
    // (dailyread-<bookId>, opened on demand — no pre-registration needed), or a live
    // Club entity row (future member Clubs).
    let known = CLUB_KEYS.has(String(club_key)) || /^dailyread-[a-z0-9_-]{1,48}$/i.test(String(club_key));
    if (!known) {
      const rows = await sb.entities.Club.filter({ club_key: String(club_key), hidden: false }, '-created_date', 1).catch(() => []);
      known = Array.isArray(rows) && rows.length > 0;
    }
    if (!known) return Response.json({ error: 'unknown club' }, { status: 400 });

    const existing = await sb.entities.ClubMembership.filter({ club_key: String(club_key), author_hash: String(author_hash) }, '-created_date', 1).catch(() => []);
    if (Array.isArray(existing) && existing.length) return Response.json({ ok: true, already: true }, { status: 200 });

    const row = await sb.entities.ClubMembership.create({
      club_key: String(club_key),
      author_hash: String(author_hash),
      consented: !!p?.consented,
    }).catch((e: any) => { console.error('joinClub create failed:', e?.message || e); return null; });
    if (!row) return Response.json({ error: 'Write failed' }, { status: 500 });

    return Response.json({ ok: true, joined: { club_key: row.club_key } });
  } catch (e: any) {
    console.error('joinClub error:', e?.message || e);
    return Response.json({ error: 'Could not join' }, { status: 500 });
  }
});
