// migrateSessionsToPractice — one-shot operator-invoked migration.
// LC-3 ships this as WellnessSessions-only. The Cowork spec (LC-3 §4i) also
// migrated audio-typed ContentItems rows; that leg was dropped because
// ContentItems is consumed by 9 other surfaces (BreathworkAudioManager,
// ContentPlayer, etc) and sweeping it would silently break those flows.
// A future LC-3.5 can revisit a ContentItems sweep once those consumers are
// audited and the audio-rows migration path is owned end-to-end.
//
// Sweeps WellnessSessions into LifestyleItems with media_type='PRACTICE':
//   - category in [Meditation, Yoga, Pilates]
//   - duration_minutes > 0 OR audio_url set
//   - WellnessSessions row stays untouched (still consumed by Programs +
//     other surfaces — we copy, not move).
// Idempotent — re-running upserts on a content_url_hash derived from origin id.
//
// Body (admin-only):
//   POST {} — full migration.
//   POST { dry_run: true } — counts only, no writes.
// Returns: { ok, wellness_migrated, skipped, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function stripEmoji(s) {
  if (!s) return '';
  return String(s).replace(
    /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
    '',
  ).replace(/\s+/g, ' ').trim();
}

const PRACTICE_WELLNESS_CATEGORIES = new Set([
  'Meditation', 'Yoga', 'Pilates',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;

    const sb = base44.asServiceRole;
    const now = new Date().toISOString();
    let wellnessMigrated = 0;
    let skipped = 0;
    const errors = [];

    const wellness = await sb.entities.WellnessSessions.list('-created_date', 200).catch(() => []);
    for (const ws of wellness || []) {
      try {
        const cat = ws?.category || '';
        if (!PRACTICE_WELLNESS_CATEGORIES.has(cat)) { skipped += 1; continue; }
        const audio = ws?.audio_url || '';
        const minutes = Number(ws?.duration_minutes) || 0;
        if (!audio && minutes <= 0) { skipped += 1; continue; }

        const hash = simpleHash(`wellness:${ws.id}`);
        const dupe = await sb.entities.LifestyleItems.filter(
          { content_url_hash: hash }, undefined, 1,
        ).catch(() => []);
        if (dupe.length > 0) { skipped += 1; continue; }

        if (dryRun) { wellnessMigrated += 1; continue; }

        await sb.entities.LifestyleItems.create({
          source_id: '',
          source_name: 'FemWell Practice',
          title: stripEmoji(ws.title || ws.name || 'Practice').slice(0, 220),
          content_url: audio || `femwell://practice/${ws.id}`,
          content_url_hash: hash,
          summary: stripEmoji(ws.description || ''),
          image_url: ws.image_url || '',
          audio_url: audio,
          duration_seconds: minutes * 60,
          duration_label: minutes ? `${minutes} MIN` : '',
          category: cat === 'Meditation' ? 'Mindfulness' : 'Lifestyle',
          media_type: 'PRACTICE',
          provider: 'BLOG',
          status: 'PUBLISHED',
          tags: ['practice', String(cat).toLowerCase()],
          published_at: ws.created_date || now,
          ingested_at: now,
          created_at: now,
        });
        wellnessMigrated += 1;
      } catch (err) {
        errors.push({ source: 'wellness', id: ws?.id, error: err?.message || String(err) });
      }
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      wellness_migrated: wellnessMigrated,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});
