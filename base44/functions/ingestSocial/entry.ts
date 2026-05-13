// MP-Pipeline Phase 1+2:
// - Hard-skips TikTok (deferred to Listen MP) and Instagram (Meta oembed died April 2025)
// - Replaces silent catches with IngestErrorLog rows
// - Existing TikTok/Instagram items in DB are left in place

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Inlined helper: structured ingest error log ────────────────────────────
async function logIngestError(base44, function_name, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name,
      stage,
      source_identifier: ctx.source_identifier || '',
      item_id: ctx.item_id || '',
      error_message: e?.message || String(err),
      error_stack: e?.stack || '',
      raw_payload: ctx.raw_payload ? JSON.stringify(ctx.raw_payload).slice(0, 4000) : '',
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch (logErr) {
    console.error(`[ingest-error-log-failed] ${function_name} ${stage}`, logErr?.message);
  }
  console.error(`[ingest-error] ${function_name} ${stage}`, err?.message || err);
}

function stripEmoji(s) {
  if (!s) return '';
  return String(s).replace(
    /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
    '',
  ).replace(/\s+/g, ' ').trim();
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sourceType = body.source_type || 'INSTAGRAM';

    // LC-1: TikTok seed is now active. Instagram remains permanently disabled.
    if (sourceType === 'INSTAGRAM') {
      return Response.json({
        ingested: 0,
        skipped: 0,
        sources: 0,
        deferred: true,
        reason: 'Instagram ingest permanently disabled (Meta oembed deprecated)',
      });
    }

    const sources = await base44.asServiceRole.entities.LifestyleSources.filter({
      is_active: true,
      source_type: sourceType,
    });

    let ingested = 0;
    let skipped = 0;
    const errors = [];

    for (const source of sources) {
      // LC-1: only skip Instagram; TikTok is now active
      const t = source.source_type || source.type;
      if (t === 'INSTAGRAM') continue;

      const postUrls = (source.feed_url || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      for (const postUrl of postUrls) {
        try {
          if (!postUrl) continue;
          const hash = simpleHash(postUrl);

          const existing = await base44.asServiceRole.entities.LifestyleItems.filter({ content_url_hash: hash });
          if (existing.length > 0) { skipped++; continue; }

          if (!source.id || !source.name) {
            await logIngestError(base44, 'ingestSocial', 'intake',
              { source_identifier: source.name || '(unnamed)', raw_payload: { postUrl } },
              new Error('Source missing id or name'));
            continue;
          }

          await base44.asServiceRole.entities.LifestyleItems.create({
            source_id: source.id,
            source_name: source.name,
            source_logo_url: source.logo_url || '',
            title: stripEmoji((source.name || 'Post')).slice(0, 200),
            content_url: postUrl,
            embed_url: postUrl,
            content_url_hash: hash,
            image_url: '',
            category: source.category || 'Lifestyle',
            summary: `View this post from ${source.name}`,
            published_at: new Date().toISOString(),
            ingested_at: new Date().toISOString(),
            status: 'PUBLISHED',
            media_type: t === 'TIKTOK' ? 'TIKTOK' : 'ARTICLE',
            provider: t === 'TIKTOK' ? 'TIKTOK' : 'BLOG',
            is_embeddable: t === 'TIKTOK',
            tags: Array.isArray(source.tags) ? source.tags : [],
          });
          ingested++;
        } catch (err) {
          errors.push(`${source.name}: ${err.message}`);
          await logIngestError(base44, 'ingestSocial', 'intake',
            { source_identifier: source.name, raw_payload: { postUrl } }, err);
          continue;
        }
      }
    }

    return Response.json({ ingested, skipped, sources: sources.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});