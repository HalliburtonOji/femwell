// createClub (Community v2) — the MEMBER-CREATED Club path. BUILT BUT DISABLED: it is
// double-gated behind the env flag CLUBS_USER_CREATE_ENABLED ('true') AND an OSA/ICO legal
// floor that is not yet in place. With the flag unset/false it registers and validates but
// creates nothing (returns { disabled: true }) — so member Clubs cannot be created live. Even
// when enabled it writes asServiceRole (host stays anonymous) and a new member Club starts as
// 'forming' (not discoverable until a minimum k members). Self-contained (gotcha #1); NOTHING
// after Deno.serve (gotcha #3).
//
// Body: { user_id?, author_hash, name, line?, category?, intro? }
// Returns: { ok, club } | { disabled: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORIES = new Set(['Reading', 'Together', 'Games']);
function slugify(s: string): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const { user_id, author_hash, name } = p || {};
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // HARD GATE: member-created Clubs are off until the legal floor is in place. Validate input
    // so the endpoint is a clean 400 (not 404) on probe, but never create while disabled.
    const enabled = Deno.env.get('CLUBS_USER_CREATE_ENABLED') === 'true';
    if (!author_hash || !name) return Response.json({ error: 'author_hash + name required' }, { status: 400 });
    if (!enabled) return Response.json({ ok: false, disabled: true, reason: 'Member-created Clubs are not enabled yet.' }, { status: 200 });

    const category = CATEGORIES.has(String(p?.category)) ? String(p.category) : 'Together';
    const club_key = slugify(name) + '-' + String(author_hash).slice(0, 6);

    const sb = base44.asServiceRole;
    const club = await sb.entities.Club.create({
      club_key,
      name: String(name).slice(0, 60),
      line: p?.line ? String(p.line).slice(0, 140) : undefined,
      category,
      host: 'member',
      host_hash: String(author_hash),
      privacy: p?.privacy === 'closed' ? 'closed' : 'open',
      status: 'forming',
      intro: p?.intro ? String(p.intro).slice(0, 600) : undefined,
      hidden: false,
    }).catch((e: any) => { console.error('createClub create failed:', e?.message || e); return null; });
    if (!club) return Response.json({ error: 'Write failed' }, { status: 500 });

    return Response.json({ ok: true, club: { club_key: club.club_key, name: club.name, status: club.status } });
  } catch (e: any) {
    console.error('createClub error:', e?.message || e);
    return Response.json({ error: 'Could not create' }, { status: 500 });
  }
});
