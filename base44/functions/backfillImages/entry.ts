// backfillImages — admin-only, one-shot backfill of image_url='' rows.
//
// Why: ingestRSS originally only tried og:image, which silently fails on
// Cloudflare-fronted publishers. Most existing PUBLISHED LifestyleItems
// rows have an empty image_url because of that. This function walks
// empty-image rows in batches, re-fetches the article page (Chrome UA),
// parses og:image / twitter:image, and patches the row. Missing-image
// rows that still can't resolve get an IngestErrorLog row tagged
// `image_missing_backfill` so we can spot publishers that need a manual
// override.
//
// Body:  { limit?: number }   (default 50, max 200 per call)
// Returns: { ok, scanned, patched, still_missing, errors }
//
// Safety:
// - Admin-only. Refuses non-admin callers.
// - Caps per-call to 200 rows so a single invocation never runs longer
//   than ~3 minutes (ample headroom under base44's 5-min function limit).
// - Re-fetches each article serially with a 10s timeout. Concurrent fetches
//   would risk rate-limit blocks from the same publisher origin.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function isPlausibleImageUrl(url: string): boolean {
  if (!url || url.length < 12) return false;
  const lower = url.toLowerCase();
  if (lower.includes('1x1')) return false;
  if (lower.includes('pixel')) return false;
  if (lower.includes('blank')) return false;
  if (lower.includes('transparent')) return false;
  if (lower.endsWith('.svg')) return false;
  return true;
}

function resolveUrl(candidate: string, baseUrl: string): string | null {
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

function parseOgImageFromHtml(html: string, baseUrl: string): string | null {
  if (!html) return null;
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const haystack = headMatch ? headMatch[0] : html.slice(0, 200000);
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:url["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image:src["']/i,
  ];
  for (const re of patterns) {
    const m = haystack.match(re);
    if (m && m[1]) {
      const candidate = m[1].trim();
      const resolved = resolveUrl(candidate, baseUrl);
      if (resolved && isPlausibleImageUrl(resolved)) return resolved;
    }
  }
  return null;
}

async function fetchOgImage(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return parseOgImageFromHtml(html, res.url || url);
  } catch {
    return null;
  }
}

async function logMiss(base44: any, item: any, message: string) {
  try {
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name: 'backfillImages',
      stage: 'image_missing_backfill',
      source_identifier: item.source_name || '',
      item_id: item.id || '',
      error_message: message,
      raw_payload: JSON.stringify({ content_url: item.content_url, title: item.title }).slice(0, 4000),
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch {
    // Best-effort logging; never block the backfill itself.
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    let body: any = {};
    try { body = await req.json(); } catch { /* empty */ }
    const requestedLimit = Math.max(1, Math.min(200, Number(body?.limit) || 50));

    // Pull rows with empty image_url, newest first so the visible feed
    // benefits from the backfill immediately.
    const rows = await base44.asServiceRole.entities.LifestyleItems.filter(
      { status: 'PUBLISHED', image_url: '' },
      '-published_at',
      requestedLimit,
    );

    let scanned = 0;
    let patched = 0;
    let stillMissing = 0;
    let errors = 0;

    for (const row of rows) {
      scanned += 1;
      if (!row?.content_url) {
        await logMiss(base44, row, 'no content_url to fetch');
        stillMissing += 1;
        continue;
      }
      try {
        const og = await fetchOgImage(row.content_url);
        if (og && isPlausibleImageUrl(og)) {
          await base44.asServiceRole.entities.LifestyleItems.update(row.id, { image_url: og });
          patched += 1;
        } else {
          await logMiss(base44, row, 'og:image not found or implausible');
          stillMissing += 1;
        }
      } catch (err: any) {
        await logMiss(base44, row, `fetch error: ${err?.message || String(err)}`);
        errors += 1;
      }
    }

    return Response.json({
      ok: true,
      scanned,
      patched,
      still_missing: stillMissing,
      errors,
      remaining_hint: scanned === requestedLimit
        ? 'Call again with the same limit until scanned < limit.'
        : 'All currently-empty rows scanned.',
    });
  } catch (err: any) {
    console.error('[backfillImages] fatal', err?.message);
    return Response.json({ error: err?.message || 'fatal' }, { status: 500 });
  }
});
