// purgeTestPosts — small ADMIN-ONLY cleanup: hide leftover QA/test posts from the Lounge.
// Client owner-deletes can't touch CommunityPost now (writes are locked to role:admin), so this
// service-role helper does it. It HIDES (hidden:true → drops from every room read; reversible),
// it does not hard-delete. Matches an explicit id list, or a body prefix (default the known QA
// markers). Admin-gated so a normal member can't mass-hide the wall.
//
// Body: { ids?: string[], bodyPrefix?: string }   Returns: { ok, hidden: [{id, body}] } | { error }
// Safe to keep as a tiny moderation utility, or remove once the wall is clean.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

// Default match for the QA rows left by live testing.
function isTestBody(body: string, prefix?: string): boolean {
  const b = String(body || '').trim().toLowerCase();
  if (prefix) return b.startsWith(prefix.toLowerCase());
  return b.startsWith('qa ') || b.startsWith('[diag]');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });
    // Owner/admin gate. The app OWNER's `role` isn't literally "admin" (same role-confusion class
    // as the RLS bug), so accept any of: role admin, the internal `_app_role` admin, or the owner
    // email allowlist. Echo the presented identity in the 403 so a reject is diagnosable.
    const OWNER_EMAILS = ['halliburtonoji@gmail.com', 'ojihalliburton57@gmail.com'];
    const email = String(me.email || '').toLowerCase();
    const isOwner = me.role === 'admin' || me._app_role === 'admin' || OWNER_EMAILS.includes(email);
    if (!isOwner) {
      return Response.json({ error: 'Owner/admin only', seen: { role: me.role, _app_role: me._app_role, email } }, { status: 403 });
    }

    let p: any;
    try { p = await req.json(); } catch { p = {}; }
    const ids: string[] = Array.isArray(p?.ids) ? p.ids.map((x: any) => String(x)) : [];
    const bodyPrefix: string | undefined = p?.bodyPrefix ? String(p.bodyPrefix) : undefined;
    const sb = base44.asServiceRole;

    let targets: any[] = [];
    if (ids.length) {
      for (const id of ids) {
        const row = await withTimeout(sb.entities.CommunityPost.get(id), 2500, 'get').catch(() => null);
        if (row?.id) targets.push(row);
      }
    } else {
      const rows = await withTimeout(sb.entities.CommunityPost.filter({ hidden: false }, '-created_date', 200), 4000, 'scan').catch(() => []);
      targets = (Array.isArray(rows) ? rows : []).filter((r: any) => isTestBody(r.body, bodyPrefix));
    }

    const hidden: any[] = [];
    for (const r of targets) {
      const ok = await withTimeout(sb.entities.CommunityPost.update(r.id, { hidden: true }), 2500, 'hide')
        .then(() => true).catch(() => false);
      if (ok) hidden.push({ id: r.id, body: r.body });
    }

    return Response.json({ ok: true, hidden, count: hidden.length });
  } catch (e: any) {
    console.error('purgeTestPosts error:', e?.message || e);
    return Response.json({ error: 'purge failed', detail: e?.message || String(e) }, { status: 500 });
  }
});
