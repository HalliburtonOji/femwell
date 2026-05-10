// MP-Pipeline Phase 1+2:
// - Replaces silent catches with IngestErrorLog rows
// - Adds HEAD validation before each LifestyleItem write
// - Skips items with empty title/content_url/source_id (no partial records)
// Phase 4-B:
// - Reads source.daily_item_cap (default 5), skips source if 24h cap reached, logs cap_reached

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

function stripHtml(text) {
  return (text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

async function parseRSS(base44, sourceName, url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const text = await res.text();
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1] || match[2] || '';
      const get = (tag) => {
        const cdata = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
        if (cdata?.[1]) return cdata[1].trim();
        const plain = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return plain?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
      };
      const linkAttr = block.match(/<link[^>]+href="([^"]+)"/i);
      items.push({
        title: get('title'),
        link: linkAttr?.[1] || get('link') || get('guid'),
        pubDate: get('pubDate') || get('published') || new Date().toISOString(),
        description: get('description') || get('summary') || ''
      });
    }
    return items;
  } catch (err) {
    await logIngestError(base44, 'parseRSS', 'intake', { source_identifier: sourceName, raw_payload: { url } }, err);
    throw err;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const activeSources = await base44.asServiceRole.entities.LifestyleSources.filter({ is_active: true }, 'priority', 40);
    let ingested = 0;
    let skipped = 0;

    for (const source of activeSources) {
      if (!source.feed_url) continue;

      // ── Cap logic: skip this source if it hit its 24h cap ──
      const cap = (source.daily_item_cap ?? 5);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      let recentCount = 0;
      try {
        const recent = await base44.asServiceRole.entities.LifestyleItems.filter(
          { source_id: source.id, created_at: { $gte: since } },
          null,
          cap + 1
        );
        recentCount = Array.isArray(recent) ? recent.length : 0;
      } catch { recentCount = 0; }

      if (recentCount >= cap) {
        await logIngestError(base44, 'ingestRSS', 'cap_reached',
          { source_identifier: source.name, raw_payload: { recentCount, cap, source_id: source.id } },
          new Error(`source cap reached: ${recentCount}/${cap}`));
        continue;
      }
      const remaining = cap - recentCount;
      let createdInThisRun = 0;

      let rssItems = [];
      try {
        rssItems = await parseRSS(base44, source.name, source.feed_url);
      } catch {
        // Already logged inside parseRSS — keep going to next source.
        continue;
      }

      for (const item of rssItems.slice(0, 20)) {
        if (createdInThisRun >= remaining) break;
        try {
          if (!item.title || !item.link) {
            await logIngestError(base44, 'ingestRSS', 'intake',
              { source_identifier: source.name, raw_payload: item },
              new Error('Missing required field: title or link'));
            continue;
          }

          if (!source.id) {
            await logIngestError(base44, 'ingestRSS', 'intake',
              { source_identifier: source.name, raw_payload: item },
              new Error('Source has no id; skipping write'));
            continue;
          }

          const existing = await base44.asServiceRole.entities.LifestyleItems.filter({ content_url: item.link });
          if (existing.length > 0) {
            skipped += 1;
            continue;
          }

          const reachable = await isUrlReachable(item.link);
          if (!reachable) {
            await logIngestError(base44, 'ingestRSS', 'url_validation',
              { source_identifier: source.name, item_id: item.link, raw_payload: { link: item.link } },
              new Error('HEAD non-200 or unreachable'));
            continue;
          }

          await base44.asServiceRole.entities.LifestyleItems.create({
            source_id: source.id,
            source_name: source.name,
            title: item.title.slice(0, 220),
            content_url: item.link,
            summary: stripHtml(item.description),
            published_at: (() => { try { return new Date(item.pubDate).toISOString(); } catch { return new Date().toISOString(); } })(),
            category: source.category,
            media_type: (Array.isArray(source.tags) && source.tags.includes('podcast')) ? 'PODCAST' : 'ARTICLE',
            status: 'PUBLISHED',
            tags: Array.isArray(source.tags) ? source.tags : [],
            created_at: new Date().toISOString(),
            ingested_at: new Date().toISOString(),
            provider: 'RSS'
          });
          ingested += 1;
          createdInThisRun += 1;
        } catch (err) {
          await logIngestError(base44, 'ingestRSS', 'intake',
            { source_identifier: source.name, raw_payload: item }, err);
          continue;
        }
      }
    }

    return Response.json({ ingested, skipped, sources: activeSources.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});