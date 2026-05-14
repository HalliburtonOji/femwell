// backfillLongreadsImages — admin-invoked sweep for ARTICLE rows missing
// image_url. Fetches the content_url, parses og:image / twitter:image /
// first article <img>, persists onto image_url. Idempotent — skips rows
// that already have image_url set.
//
// Wired into pipelineOrchestrator as a WEEKLY_PHASES entry so new ARTICLE
// rows that come in image-less (e.g. RSS feeds that don't carry <enclosure>
// or media:thumbnail) get a backfill pass each Sunday. The first-run
// bootstrap also fires it on the next daily cron after deploy.
//
// Body (admin-only):
//   POST {} — full sweep across ARTICLE rows with empty image_url.
//   POST { media_type } — limit to one media_type (default ARTICLE).
//   POST { dry_run: true } — counts only, no writes.
//   POST { limit: N } — cap rows scanned (default 500).
// Returns: { ok, scanned, candidates, updated, no_image_found, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_LIMIT = 500;
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Rejects 1x1 trackers, blank pixels, svg icons. Same logic as ingestRSS.
function isPlausibleImageUrl(url) {
  if (!url || typeof url !== 'string' || url.length < 12) return false;
  const lower = url.toLowerCase();
  if (lower.includes('1x1')) return false;
  if (lower.includes('pixel')) return false;
  if (lower.includes('blank')) return false;
  if (lower.includes('transparent')) return false;
  if (lower.endsWith('.svg')) return false;
  return true;
}

function resolveUrl(candidate, baseUrl) {
  try {
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (/^\/\//.test(candidate)) {
      const proto = new URL(baseUrl).protocol;
      return `${proto}${candidate}`;
    }
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseOgImageFromHtml(html, baseUrl) {
  if (!html) return null;
  // Order: og:image:secure_url, og:image, twitter:image, first <img src> in <article>.
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const abs = resolveUrl(m[1], baseUrl);
      if (abs && isPlausibleImageUrl(abs)) return abs;
    }
  }
  // Fallback — first <img> inside <article>.
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const haystack = articleMatch ? articleMatch[1] : html;
  const imgMatch = haystack.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const abs = resolveUrl(imgMatch[1], baseUrl);
    if (abs && isPlausibleImageUrl(abs)) return abs;
  }
  return null;
}

async function fetchImageFromPage(contentUrl) {
  if (!contentUrl || !/^https?:\/\//i.test(contentUrl)) return null;
  let res;
  try {
    res = await fetch(contentUrl, {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  // Only parse text; bail on binary content types.
  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  if (ctype && !ctype.includes('html') && !ctype.includes('xml')) return null;
  let html;
  try {
    html = await res.text();
  } catch {
    return null;
  }
  // Trim — only need <head> for og: tags. Most pages put og: in first 64KB.
  return parseOgImageFromHtml(html.slice(0, 200_000), contentUrl);
}

async function logResult(base44, row, stage, payload) {
  try {
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name: 'backfillLongreadsImages',
      stage,
      source_identifier: row?.source_name || '',
      item_id: row?.id || '',
      error_message: payload?.message || '',
      raw_payload: payload ? JSON.stringify(payload).slice(0, 4000) : '',
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch { /* non-fatal */ }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (me && me.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;
    const onlyMedia = body?.media_type || 'ARTICLE';
    const limit = Math.min(Number(body?.limit) || DEFAULT_LIMIT, 2000);

    const sb = base44.asServiceRole;
    let scanned = 0;
    let candidates = 0;
    let updated = 0;
    let noImageFound = 0;
    const errors = [];

    // Paginate through ARTICLE rows in created-date order.
    const pageSize = 100;
    let offset = 0;
    while (offset < limit) {
      const rows = await sb.entities.LifestyleItems.filter(
        { media_type: onlyMedia }, '-created_date', pageSize,
      ).catch(() => []);
      if (!rows || rows.length === 0) break;

      for (const row of rows) {
        scanned += 1;
        if (scanned > limit) break;
        // Skip rows that already have an image.
        const existing = row.image_url;
        if (existing && typeof existing === 'string' && existing.trim() !== '') continue;
        // Skip rows without a fetchable URL.
        if (!row.content_url || !/^https?:\/\//i.test(row.content_url)) continue;
        candidates += 1;

        if (dryRun) continue;

        let foundUrl;
        try {
          foundUrl = await fetchImageFromPage(row.content_url);
        } catch (err) {
          errors.push({ id: row.id, error: err?.message || String(err) });
          continue;
        }

        if (!foundUrl) {
          noImageFound += 1;
          await logResult(base44, row, 'no_image', { content_url: row.content_url });
          continue;
        }

        try {
          await sb.entities.LifestyleItems.update(row.id, { image_url: foundUrl });
          updated += 1;
          await logResult(base44, row, 'ok', { image_url: foundUrl });
        } catch (err) {
          errors.push({ id: row.id, error: err?.message || String(err) });
        }

        // Be polite — small delay between outbound fetches.
        await new Promise((r) => setTimeout(r, 200));
      }

      if (rows.length < pageSize) break;
      offset += pageSize;
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      media_type: onlyMedia,
      scanned,
      candidates,
      updated,
      no_image_found: noImageFound,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});
