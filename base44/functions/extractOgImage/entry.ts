// MP og:image extraction:
// Fetch a remote URL and return the publisher-chosen hero image declared in
// open-graph / twitter-card meta tags. Used by ingestRSS at intake time and
// by backfillOgImages to patch previously-ingested items that have random
// Unsplash placeholders sitting in image_url.
//
// Body: { url: string }
// Returns: { image_url: string | null, fetched_at: ISO, source_url: string }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

// ── og:image extraction logic (also duplicated inline in ingestRSS) ────────
export function parseOgImageFromHtml(html: string, baseUrl: string): string | null {
  if (!html || typeof html !== 'string') return null;

  // Limit work to the <head>… section when possible — og tags live there.
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const haystack = headMatch ? headMatch[0] : html.slice(0, 200000);

  // Priority list. property-vs-name and single-vs-double quotes both occur in the wild.
  const patterns: RegExp[] = [
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

function isPlausibleImageUrl(url: string): boolean {
  if (!url || url.length < 12) return false;
  const lower = url.toLowerCase();
  if (lower.includes('1x1')) return false;
  if (lower.includes('pixel')) return false;
  if (lower.includes('blank')) return false;
  if (lower.includes('transparent')) return false;
  if (lower.endsWith('.svg')) return false; // many sites point og:image at a tiny SVG logo
  return true;
}

export async function fetchOgImage(url: string): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const url = body?.url;
    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'Missing url' }, { status: 400 });
    }

    let image_url: string | null = null;
    try {
      image_url = await fetchOgImage(url);
    } catch (err) {
      await logIngestError(base44, 'extractOgImage', 'og_image_fetch_failed',
        { source_identifier: url, item_id: url, raw_payload: { url } }, err);
      image_url = null;
    }

    return Response.json({
      image_url,
      fetched_at: new Date().toISOString(),
      source_url: url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
