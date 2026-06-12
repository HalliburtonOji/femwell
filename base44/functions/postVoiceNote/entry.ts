// postVoiceNote (Community M4) — store an async voice-note. Self-contained. asServiceRole.
//
// SAFETY INVARIANT (do not weaken): unscreened audio is NEVER delivered to a listener.
// Voice can't be crisis/abuse-screened without speech-to-text, so until an STT provider
// key exists, every note is stored `pending_screening` and HELD — audio never reaches
// another member. Two independent gates must BOTH pass before a note is ever 'delivered':
//   1. TRANSCRIPTION_ENABLED env flag is 'true'   (operational switch)
//   2. an STT transcript is produced AND passes the same crisis + moderation screen as text
// With no STT_API_KEY the second gate can't pass even if someone flips the flag — so a
// misconfiguration fails CLOSED (held), never open.
//
// Body: { user_id?, author_hash, audio_url, duration_sec?, masked?, surface? }
// Returns: { ok, note, delivered, reason }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_DURATION = 90;   // seconds — async voice-notes are short by design

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
  const { user_id, author_hash, audio_url } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (!author_hash || !audio_url) return Response.json({ error: 'author_hash + audio_url required' }, { status: 400 });

  const duration = Math.min(MAX_DURATION, Math.max(0, Number(p?.duration_sec) || 0));
  const masked = !!p?.masked;
  const surface = p?.surface ? String(p.surface).slice(0, 24) : 'community';

  // Gate 1 — operational switch (default OFF).
  const transcriptionEnabled = Deno.env.get('TRANSCRIPTION_ENABLED') === 'true';
  const sttKey = Deno.env.get('STT_API_KEY') || Deno.env.get('ASSEMBLYAI_API_KEY') || Deno.env.get('DEEPGRAM_API_KEY');

  // Gate 2 — without STT we CANNOT screen speech, so we never deliver. The note is stored
  // for the author's record only; status stays pending_screening; no holder, no live_at.
  let status = 'pending_screening';
  let reason = 'screening-not-live';
  // NOTE: when STT lands, the delivery path slots in HERE — transcribe (sttKey) -> run the
  // existing crisis + OpenAI moderation screen on the transcript -> on pass set
  // status:'delivered', live_at, expires_at, holder_hash (one phase-sister); on fail set
  // 'blocked'/'held'. Until then this stays inert and audio is never handed on.
  if (transcriptionEnabled && sttKey) {
    // intentionally NOT implemented yet — STT integration is the activation step.
    // Fail closed: still hold rather than deliver unscreened audio.
    status = 'held';
    reason = 'awaiting-stt-integration';
  } else if (transcriptionEnabled && !sttKey) {
    reason = 'flag-on-but-no-stt-key';   // misconfiguration → still held, never delivered
  }

  const sb = base44.asServiceRole;
  const note = await withTimeout(sb.entities.VoiceNote.create({
    author_hash: String(author_hash),
    surface,
    audio_url: String(audio_url),
    duration_sec: duration,
    masked,
    status,
    // live_at / expires_at / holder_hash deliberately UNSET — set only on a passing screen.
  }), 6000, 'create').catch((e: any) => { console.error('postVoiceNote create failed:', e?.message || e); return null; });
  if (!note) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({
    ok: true,
    delivered: false,                      // ALWAYS false until STT screening is live
    reason,
    note: { id: note.id, status: note.status, duration_sec: note.duration_sec, masked: note.masked, surface: note.surface },
  });
});
