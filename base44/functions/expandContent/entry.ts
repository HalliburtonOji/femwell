// MP-Pipeline Phase 1+2:
// - This function is called from the UI to lazily expand article body.
// - Adds Tier-2 publish-time check: re-HEAD content_url; if unreachable now, log + skip publish
// - If image_url is unreachable, clear it (UI falls back to gradient) — don't break publish
// - Replaces silent catches with IngestErrorLog rows

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

// ── Inlined helper: HEAD reachability check ────────────────────────────────
async function isUrlReachable(url, timeoutMs = 5000) {
  if (!url || typeof url !== 'string') return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { item_id, title, summary, content_type } = await req.json();
  if (!item_id) return Response.json({ error: 'Missing item_id' }, { status: 400 });

  try {
    const isStory = content_type === 'STORY';
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a complete, engaging ${isStory ? 'short story of 700-900 words' : 'article of 500-700 words'} for women. Title: "${title}". Opening: "${summary}". Write the FULL text continuing from where the opening left off. Same voice and style. Return JSON: { body: string }`,
      response_json_schema: {
        type: 'object',
        properties: { body: { type: 'string' } },
      },
    });

    const body = result?.body || '';

    // Tier-2 publish-time validation: re-HEAD the source content_url and image_url.
    // We fetch the row to inspect URLs; only update fields when needed.
    let row = null;
    try {
      const rows = await base44.asServiceRole.entities.LifestyleItems.filter({ id: item_id });
      row = rows[0] || null;
    } catch (err) {
      await logIngestError(base44, 'expandContent', 'publish', { item_id }, err);
    }

    const updates = {};
    if (body.length > 100) updates.lede = body;

    if (row?.content_url) {
      const ok = await isUrlReachable(row.content_url);
      if (!ok) {
        await logIngestError(base44, 'expandContent', 'publish',
          { item_id, source_identifier: row.source_name || '' },
          new Error('content_url unreachable at publish-time; leaving status unchanged'));
        // Don't auto-flip status here — caller may have set NEEDS_REVIEW intentionally.
      }
    }

    if (row?.image_url) {
      const imgOk = await isUrlReachable(row.image_url);
      if (!imgOk) {
        updates.image_url = '';
        await logIngestError(base44, 'expandContent', 'publish',
          { item_id, source_identifier: row.source_name || '' },
          new Error('image_url unreachable; cleared so UI falls back to gradient'));
      }
    }

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.LifestyleItems.update(item_id, updates).catch((err) =>
        logIngestError(base44, 'expandContent', 'publish', { item_id }, err));
    }

    return Response.json({ body });
  } catch (e) {
    await logIngestError(base44, 'expandContent', 'summarization', { item_id }, e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});