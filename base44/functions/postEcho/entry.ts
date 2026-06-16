// postEcho — Echo Wall dispatcher (consolidated to fit the 50-function cap). One function,
// four anonymous actions, all under the SERVICE identity so the Echo entity's write policy
// stays locked (no user_id ever stored; authorship is only ever the salted device-derived
// author_hash — see src/components/journal/echo/echoAnon.js):
//   action "post" (default) → create an echo (crisis re-check, 5/day rate-limit)
//   action "react"          → +1 ONE known kind-reaction count
//   action "report"         → +1 report_count, auto-hide past threshold
//   action "retract"        → author pulls their own echo (author_hash ownership proof)
// (Merged from the former postEcho/reactEcho/reportEcho/retractEcho — same behaviour.)
// Self-contained; nothing declared after Deno.serve. The user is authenticated only to gate
// the write; their id is never stored.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_ECHO_LEN = 180;
const PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal', 'unknown'];
const VISIBILITIES = ['same_phase', 'circles', 'all'];
const REACTION_FIELDS = ['held_count', 'metoo_count', 'hearyou_count', 'saved_count'];
const DAILY_ECHO_LIMIT = 5;
const REPORT_AUTOHIDE_THRESHOLD = 2;

// Server-side mirror of CRISIS_PATTERNS — belt-and-braces so a crisis line can never become
// a public echo even if the client check is bypassed.
const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i,
  /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i,
  /\bnothing\s+to\s+live\s+for\b/i,
  /\bhe\s+(hits|beats|hurts)\s+me\b/i,
  /\bnot\s+safe\s+(at home|here|with him|with her)\b/i,
];
function isCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
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
  p = p || {};
  const action = String(p.action || 'post');
  const { user_id } = p;
  // A signed-in user may only act as themselves (admins exempt).
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const sb = base44.asServiceRole;

  // ── react: +1 ONE known reaction count ───────────────────────────────────────────────
  if (action === 'react') {
    const { echo_id, field } = p;
    if (!echo_id) return Response.json({ error: 'echo_id required' }, { status: 400 });
    if (!REACTION_FIELDS.includes(field)) return Response.json({ error: 'invalid field' }, { status: 400 });
    const echo = await withTimeout(sb.entities.Echo.get(echo_id), 2500, 'get').catch(() => null);
    if (!echo) return Response.json({ error: 'Not found' }, { status: 404 });
    if (echo.hidden) return Response.json({ error: 'unavailable' }, { status: 409 });
    const count = (echo[field] || 0) + 1;
    const ok = await withTimeout(sb.entities.Echo.update(echo_id, { [field]: count }), 6000, 'update')
      .catch((e: any) => { console.error('reactEcho update failed:', e?.message || e); return null; });
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, field, count });
  }

  // ── report: +1 report_count, auto-hide past threshold ─────────────────────────────────
  if (action === 'report') {
    const { echo_id } = p;
    if (!echo_id) return Response.json({ error: 'echo_id required' }, { status: 400 });
    const echo = await withTimeout(sb.entities.Echo.get(echo_id), 2500, 'get').catch(() => null);
    if (!echo) return Response.json({ error: 'Not found' }, { status: 404 });
    const report_count = (echo.report_count || 0) + 1;
    const hidden = report_count >= REPORT_AUTOHIDE_THRESHOLD;
    const ok = await withTimeout(sb.entities.Echo.update(echo_id, { report_count, hidden }), 6000, 'update')
      .catch((e: any) => { console.error('reportEcho update failed:', e?.message || e); return null; });
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, report_count, hidden });
  }

  // ── retract: author pulls their own echo (author_hash ownership proof) ────────────────
  if (action === 'retract') {
    const { echo_id, author_hash } = p;
    if (!echo_id) return Response.json({ error: 'echo_id required' }, { status: 400 });
    if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
    const echo = await withTimeout(sb.entities.Echo.get(echo_id), 2500, 'get').catch(() => null);
    if (!echo) return Response.json({ error: 'Not found' }, { status: 404 });
    if (me.role !== 'admin' && echo.author_hash !== String(author_hash)) {
      return Response.json({ error: 'Not your echo' }, { status: 403 });
    }
    const del = await withTimeout(sb.entities.Echo.delete(echo_id), 6000, 'delete').then(() => true).catch(() => false);
    if (!del) return Response.json({ error: 'Delete failed' }, { status: 500 });
    return Response.json({ ok: true });
  }

  // ── post (default): create an anonymous echo ──────────────────────────────────────────
  const {
    body, author_hash, phase, life_stage, cycle_day,
    source_entry_hash, live_at, expires_at, visibility,
  } = p;
  const line = String(body || '').trim();
  if (!line) return Response.json({ error: 'Empty echo' }, { status: 400 });
  if (line.length > MAX_ECHO_LEN) return Response.json({ error: 'Echo too long' }, { status: 400 });
  if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
  if (!live_at || !expires_at) return Response.json({ error: 'live_at + expires_at required' }, { status: 400 });

  // Crisis re-check — route to support instead of writing a public echo.
  if (isCrisis(line)) return Response.json({ ok: false, intercept: true }, { status: 200 });

  // Rate limit — 5 echoes/day per author_hash, enforced server-side.
  const since = startOfTodayISO();
  const mine = await withTimeout(sb.entities.Echo
    .filter({ author_hash: String(author_hash) }, '-live_at', 50), 2500, 'filter').catch(() => []);
  const today = (Array.isArray(mine) ? mine : []).filter((e: any) => (e.live_at || e.created_date || '') >= since).length;
  if (today >= DAILY_ECHO_LIMIT) return Response.json({ error: 'rate', today }, { status: 200 });

  // The anonymity boundary: asServiceRole means created_by is the service, not the author.
  const echo = await withTimeout(sb.entities.Echo.create({
    body: line,
    author_hash: String(author_hash),
    phase: PHASES.includes(phase) ? phase : 'unknown',
    life_stage: life_stage || undefined,
    cycle_day: typeof cycle_day === 'number' ? cycle_day : undefined,
    source_entry_hash: source_entry_hash || undefined,
    live_at: String(live_at),
    expires_at: String(expires_at),
    held_count: 0, metoo_count: 0, hearyou_count: 0, saved_count: 0,
    report_count: 0, hidden: false,
    visibility: VISIBILITIES.includes(visibility) ? visibility : 'all',
  }), 6000, 'create').catch((err: any) => { console.error('postEcho create failed:', err?.message || err); return null; });

  if (!echo) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, echo });
});
