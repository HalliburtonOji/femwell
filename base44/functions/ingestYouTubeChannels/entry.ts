// MP-Pipeline Phase 1+2:
// - Writes new YouTube items as NEEDS_REVIEW (was PUBLISHED) so summarizeLifestyleItem
//   can run the embed gate, fetch duration, generate summary, then publish
// - Adds HEAD validation on canonical watch URL before each write
// - Populates source_id, source_name, source_logo_url (was missing — caused 47.8% null source_id)
// - Replaces silent catches with IngestErrorLog rows
// Phase 4-B:
// - YouTube branch: enforces YOUTUBE_PER_CHANNEL_CAP (hardcoded=3) per channel per 24h
// - RSS branch: reads daily_item_cap from LifestyleSources row, enforces per source per 24h
// Phase 5-B2:
// - YouTube branch: reads channel list from LifestyleSources (source_type='YOUTUBE_CHANNEL', is_active=true)
//   instead of hardcoded YOUTUBE_CHANNELS array. Cap per channel comes from source.daily_item_cap.
// - RSS-fallback branch: reads source list from LifestyleSources (source_type='RSS', is_active=true)
//   instead of hardcoded RSS_SOURCES array. LifestyleSources is now the single source of truth.

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



const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function parseYouTubeRSS(base44, channel) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FemWell/1.0' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const text = await res.text();
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    let match;
    while ((match = entryRegex.exec(text)) !== null) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
          || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return m?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
      };
      const videoId = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i) || [])[1] || '';
      const thumbnail = (block.match(/<media:thumbnail[^>]+url="([^"]+)"/i) || [])[1] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const views = parseInt((block.match(/<media:statistics\s+views="(\d+)"/) || [])[1] || '0', 10);
      entries.push({ videoId, title: get('title'), published: get('published'), thumbnail, views });
    }
    return entries;
  } catch (err) {
    await logIngestError(base44, 'parseYouTubeRSS', 'intake',
      { source_identifier: channel.name, raw_payload: { url } }, err);
    return [];
  }
}

async function parseRSS(base44, source) {
  try {
    const res = await fetch(source.rss, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${source.rss}`);
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
        return plain?.[1]
          ?.replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
          .replace(/\s+/g, ' ').trim() || '';
      };
      const linkAttr = block.match(/<link[^>]+href="([^"]+)"/i);
      const imgTag = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i)
        || block.match(/<enclosure[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
      const authorTag = block.match(/<dc:creator[^>]*><!?\[?CDATA\[?([^\]<]+)/i)
        || block.match(/<author[^>]*>([^<]+)</i);
      items.push({
        title: get('title'),
        link: linkAttr?.[1] || get('link') || get('guid'),
        pubDate: get('pubDate') || get('published') || new Date().toISOString(),
        description: get('description') || get('summary') || get('content') || '',
        image_url: imgTag?.[1] || '',
        author: authorTag?.[1]?.trim() || '',
      });
    }
    return items;
  } catch (err) {
    await logIngestError(base44, 'parseRSS', 'intake',
      { source_identifier: source.name, raw_payload: { url: source.rss } }, err);
    return [];
  }
}

function hashUrl(url) {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  }
  return String(Math.abs(h));
}



Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'all';
    let ytIngested = 0, rssIngested = 0, skipped = 0;

    // Pre-fetch all existing hashes in one query to avoid per-item filter rate-limit hits
    const allExisting = await base44.asServiceRole.entities.LifestyleItems.list('-created_date', 2000);
    const existingHashes = new Set(allExisting.map(i => i.content_url_hash).filter(Boolean));

    if (mode === 'youtube' || mode === 'all') {
      // Phase 5-B2: source list comes from LifestyleSources entity (was hardcoded YOUTUBE_CHANNELS).
      const ytSources = await base44.asServiceRole.entities.LifestyleSources.filter(
        { source_type: 'YOUTUBE_CHANNEL', is_active: true },
        'priority',
        50
      ).catch(() => []);

      for (const source of (ytSources || [])) {
        if (!source.external_id) {
          await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
            { source_identifier: source.name || '', raw_payload: { sourceId: source.id } },
            new Error('YOUTUBE_CHANNEL row missing external_id; skipped'));
          continue;
        }
        // Map LifestyleSources row to the {id, name, category, tags} shape parseYouTubeRSS + the create call expect.
        const channel = {
          id: source.external_id,
          name: source.name,
          category: source.category,
          tags: Array.isArray(source.tags) ? source.tags : [],
        };

        const videos = await parseYouTubeRSS(base44, channel);
        await sleep(200);
        const sourceId = source.id;  // LifestyleSources row id — direct, no resolve helper needed

        // ── YouTube cap logic — per-row from LifestyleSources.daily_item_cap ──
        const cap = (source.daily_item_cap ?? 3);
        const ytSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        let ytRecentCount = 0;
        try {
          const ytRecent = await base44.asServiceRole.entities.LifestyleItems.filter(
            { source_id: sourceId, created_at: { $gte: ytSince } },
            null,
            cap + 1
          );
          ytRecentCount = Array.isArray(ytRecent) ? ytRecent.length : 0;
        } catch { ytRecentCount = 0; }

        if (ytRecentCount >= cap) {
          await logIngestError(base44, 'ingestYouTubeChannels', 'cap_reached',
            { source_identifier: channel.name, raw_payload: { recentCount: ytRecentCount, cap, source_id: sourceId } },
            new Error(`youtube channel cap reached: ${ytRecentCount}/${cap}`));
          continue;
        }
        const ytRemaining = cap - ytRecentCount;
        let ytCreatedInThisRun = 0;

        for (const v of videos.slice(0, 20)) {
          if (ytCreatedInThisRun >= ytRemaining) break;
          try {
            if (!v.videoId || !v.title) {
              skipped++;
              continue;
            }
            const contentUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
            const hash = hashUrl(contentUrl);
            if (existingHashes.has(hash)) { skipped++; continue; }

            // HEAD validation on the canonical YouTube watch URL.
            const reachable = await isUrlReachable(contentUrl);
            if (!reachable) {
              await logIngestError(base44, 'ingestYouTubeChannels', 'url_validation',
                { source_identifier: channel.name, item_id: contentUrl, raw_payload: { videoId: v.videoId } },
                new Error('HEAD non-200 or unreachable'));
              skipped++;
              continue;
            }

            // Required-field guard
            if (!sourceId) {
              await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
                { source_identifier: channel.name, item_id: contentUrl, raw_payload: { videoId: v.videoId } },
                new Error('Could not resolve source_id for channel'));
              skipped++;
              continue;
            }

            await base44.asServiceRole.entities.LifestyleItems.create({
              source_id: sourceId,
              source_name: channel.name,
              source_logo_url: '',
              channel_name: channel.name,
              channel_id: channel.id,
              video_id: v.videoId,
              title: v.title.slice(0, 220),
              content_url: contentUrl,
              image_url: v.thumbnail,
              content_url_hash: hash,
              published_at: v.published || new Date().toISOString(),
              created_at: new Date().toISOString(),
              ingested_at: new Date().toISOString(),
              category: channel.category,
              content_type: 'VIDEO',
              media_type: 'VIDEO',
              provider: 'YOUTUBE',
              tags: channel.tags,
              status: 'NEEDS_REVIEW',
              engagement_score: Math.min(Math.floor((v.views || 0) / 1000), 50),
            });
            existingHashes.add(hash);
            ytIngested++;
            ytCreatedInThisRun += 1;
            await sleep(150);
          } catch (err) {
            await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
              { source_identifier: channel.name, raw_payload: v }, err);
            continue;
          }
        }
      }
    }

    if (mode === 'rss' || mode === 'all') {
      // Phase 5-B2: source list comes from LifestyleSources entity (was hardcoded RSS_SOURCES).
      // Note: ingestRSS already reads RSS sources from LifestyleSources independently;
      // deduplication is protected by content_url_hash. A future MP can remove this branch.
      const rssSources = await base44.asServiceRole.entities.LifestyleSources.filter(
        { source_type: 'RSS', is_active: true },
        'priority',
        50
      ).catch(() => []);

      for (const sourceRow of (rssSources || [])) {
        if (!sourceRow.feed_url) {
          await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
            { source_identifier: sourceRow.name || '', raw_payload: { sourceId: sourceRow.id } },
            new Error('RSS row missing feed_url; skipped'));
          continue;
        }
        // Map to the {name, rss, category, content_type} shape parseRSS + the create call expect.
        const source = {
          name: sourceRow.name,
          rss: sourceRow.feed_url,
          category: sourceRow.category,
          content_type: sourceRow.content_type || 'ARTICLE',
        };

        const items = await parseRSS(base44, source);
        await sleep(200);
        const sourceId = sourceRow.id;  // direct — no resolve helper needed

        // ── RSS cap logic — per-row from LifestyleSources.daily_item_cap ──
        const rssCap = (sourceRow.daily_item_cap ?? 5);
        const rssSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        let rssRecentCount = 0;
        try {
          const rssRecent = await base44.asServiceRole.entities.LifestyleItems.filter(
            { source_id: sourceId, created_at: { $gte: rssSince } },
            null,
            rssCap + 1
          );
          rssRecentCount = Array.isArray(rssRecent) ? rssRecent.length : 0;
        } catch { rssRecentCount = 0; }

        if (rssRecentCount >= rssCap) {
          await logIngestError(base44, 'ingestYouTubeChannels', 'cap_reached',
            { source_identifier: source.name, raw_payload: { recentCount: rssRecentCount, cap: rssCap, source_id: sourceId } },
            new Error(`rss source cap reached: ${rssRecentCount}/${rssCap}`));
          continue;
        }
        const rssRemaining = rssCap - rssRecentCount;
        let rssCreatedInThisRun = 0;

        for (const item of items.slice(0, 20)) {
          if (rssCreatedInThisRun >= rssRemaining) break;
          try {
            if (!item.title || !item.link) { skipped++; continue; }
            const hash = hashUrl(item.link);
            if (existingHashes.has(hash)) { skipped++; continue; }

            // HEAD validation on the article URL.
            const reachable = await isUrlReachable(item.link);
            if (!reachable) {
              await logIngestError(base44, 'ingestYouTubeChannels', 'url_validation',
                { source_identifier: source.name, item_id: item.link, raw_payload: { link: item.link } },
                new Error('HEAD non-200 or unreachable'));
              skipped++;
              continue;
            }

            if (!sourceId) {
              await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
                { source_identifier: source.name, item_id: item.link, raw_payload: { link: item.link } },
                new Error('Could not resolve source_id for RSS source'));
              skipped++;
              continue;
            }

            const rawDesc = item.description || '';
            const lede = rawDesc
              .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#\d+;/g, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<img[^>]*>/gi, '')
              .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 260);
            await base44.asServiceRole.entities.LifestyleItems.create({
              source_id: sourceId,
              source_name: source.name,
              source_logo_url: '',
              title: item.title.slice(0, 220),
              content_url: item.link,
              content_url_hash: hash,
              image_url: item.image_url || '',
              author_name: item.author || '',
              lede,
              summary: lede,
              published_at: (() => { try { return new Date(item.pubDate).toISOString(); } catch { return new Date().toISOString(); } })(),
              created_at: new Date().toISOString(),
              ingested_at: new Date().toISOString(),
              category: source.category,
              content_type: source.content_type,
              media_type: 'ARTICLE',
              provider: 'RSS',
              status: 'NEEDS_REVIEW',
              tags: [],
            });
            existingHashes.add(hash);
            rssIngested++;
            rssCreatedInThisRun += 1;
            await sleep(150);
          } catch (err) {
            await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
              { source_identifier: source.name, raw_payload: item }, err);
            continue;
          }
        }
      }
    }

    return Response.json({ youtube_ingested: ytIngested, rss_ingested: rssIngested, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});