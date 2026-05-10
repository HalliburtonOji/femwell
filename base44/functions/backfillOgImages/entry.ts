// One-time backfill: replace random Unsplash placeholders on existing
// LifestyleItems with the publisher's actual og:image hero.
//
// HOW TO RUN: invoke from base44 admin once after this commit ships.
// Optional body: { limit?: number, dryRun?: boolean, overwriteUnsplash?: boolean }
//   - limit (default 500): max items to scan this run
//   - dryRun (default false): inspect only, do not write
//   - overwriteUnsplash (default true): replace image_url that points at
//     images.unsplash.com / source.unsplash.com placeholders
//
// SAFE TO DELETE this file after one successful run; the production code
// path is now in ingestRSS (inline og:image extraction at ingest time) and
// the standalone extractOgImage function.

/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function isPlausibleImageUrl(url) {
  if (!url || url.length < 12) return false;
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
  if (!html || typeof html !== 'string') return null;
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

async function fetchOgImage(url) {
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

function isPlaceholderImage(url, overwriteUnsplash) {
  if (!url) return true;
  if (!overwriteUnsplash) return false;
  const lower = url.toLowerCase();
  return lower.includes('images.unsplash.com') || lower.includes('source.unsplash.com');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body?.limit) || 500, 1000);
    const dryRun = body?.dryRun === true;
    const overwriteUnsplash = body?.overwriteUnsplash !== false;

    const sb = base44.asServiceRole;
    const items = await sb.entities.LifestyleItems.filter(
      { status: 'PUBLISHED' },
      '-created_date',
      limit
    );

    const counts = {
      scanned: 0,
      eligible: 0,
      extracted: 0,
      updated: 0,
      skipped_no_url: 0,
      skipped_has_image: 0,
      skipped_no_og: 0,
      errors: 0,
      dryRun,
    };

    for (const item of items) {
      counts.scanned += 1;

      if (!item.content_url) {
        counts.skipped_no_url += 1;
        continue;
      }

      const currentImage = item.image_url || '';
      const needsReplacement = !currentImage || isPlaceholderImage(currentImage, overwriteUnsplash);
      if (!needsReplacement) {
        counts.skipped_has_image += 1;
        continue;
      }

      counts.eligible += 1;

      let og = null;
      try {
        og = await fetchOgImage(item.content_url);
      } catch {
        counts.errors += 1;
        continue;
      }

      if (!og) {
        counts.skipped_no_og += 1;
        continue;
      }

      counts.extracted += 1;

      if (!dryRun) {
        try {
          await sb.entities.LifestyleItems.update(item.id, { image_url: og });
          counts.updated += 1;
        } catch {
          counts.errors += 1;
        }
      }
    }

    return Response.json({
      ok: true,
      counts,
      ran_at: new Date().toISOString(),
      note: 'Safe to delete this function file after one successful run.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
