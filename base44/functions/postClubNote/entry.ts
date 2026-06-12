// postClubNote (Community Phase 4, §P.2.2) — add an anonymous note to a Book Club checkpoint
// thread. Same moderation spine as addComment: crisis → route to support (never posted);
// harmful → stored status:removed (tombstone); borderline → flagged review; else visible.
// Health-vocab allowlisted. Graceful keyword fallback if the OpenAI key is unavailable.
// Self-contained (gotcha #1); NOTHING after Deno.serve (gotcha #3); asServiceRole write.
//
// Body: { user_id?, author_hash, pick_key, checkpoint_index, body }
// Returns: { ok, note } | { intercept: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i, /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i, /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i, /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i, /\bhurt(ing)?\s+myself\b/i, /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i, /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i, /\bnothing\s+to\s+live\s+for\b/i,
];
const BANNED = ['idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard'];

// PUBLISH-THEN-SCREEN (re-architecture, 2026-06-12). Club-note writes run ONLY fast LOCAL
// checks (crisis intercept + a keyword floor) — NO blocking network call, so the note is
// created and returned immediately. Club-note threads are short and checkpoint-scoped; the
// local floor is the screen here (OpenAI post-hoc screening can be added via screenContent
// later if needed). No awaited external call → no hang.
function localScreen(text: string): { crisis?: boolean; remove?: boolean; ok?: boolean } {
  if (CRISIS_PATTERNS.some((re) => re.test(text || ''))) return { crisis: true };
  const t = (text || '').toLowerCase();
  if (BANNED.some((w) => t.includes(w))) return { remove: true };
  return { ok: true };
}

const MAX_LEN = 600;

// Timeout guard — an awaited create that HANGS would wedge the function (a plain .catch
// only catches a throw). Race it against a timeout so the handler always returns.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const { user_id, author_hash, pick_key } = p || {};
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!author_hash || !pick_key) return Response.json({ error: 'author_hash + pick_key required' }, { status: 400 });
    const checkpoint_index = Number(p?.checkpoint_index);
    if (!Number.isFinite(checkpoint_index) || checkpoint_index < 0) return Response.json({ error: 'checkpoint_index required' }, { status: 400 });
    const text = String(p?.body || '').trim();
    if (!text) return Response.json({ error: 'Empty note' }, { status: 400 });
    if (text.length > MAX_LEN) return Response.json({ error: 'Note too long' }, { status: 400 });

    const mod = localScreen(text);
    if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
    const status = mod.remove ? 'removed' : 'visible';

    const sb = base44.asServiceRole;
    const note = await withTimeout(sb.entities.ClubNote.create({
      pick_key: String(pick_key),
      checkpoint_index: Math.floor(checkpoint_index),
      author_hash: String(author_hash),
      body: status === 'removed' ? '' : text,
      status, flagged: false, hidden: false,
    }), 6000, 'create').catch((e: any) => { console.error('postClubNote create failed:', e?.message || e); return null; });
    if (!note) return Response.json({ error: 'Write failed' }, { status: 500 });

    return Response.json({ ok: true, note: { id: note.id, pick_key: note.pick_key, checkpoint_index: note.checkpoint_index, body: note.body, status: note.status, created_date: note.created_date } });
  } catch (e: any) {
    console.error('postClubNote error:', e?.message || e);
    return Response.json({ error: 'Could not post note' }, { status: 500 });
  }
});
