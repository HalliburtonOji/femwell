// seedPodcasts — operator-invoked, one-shot. Seeds 12 curated UK women's-
// wellness-adjacent podcast LifestyleSources rows + ingests ~5 most-recent
// episodes per source into LifestyleItems. Idempotent — re-running skips
// rows whose content_url_hash already exists.
//
// Body (admin-only):
//   POST {} — runs the full seed.
//   POST { only_source_name: string } — re-seeds episodes for one source.
// Returns: { ok, sources_created, sources_existing, episodes_ingested, episodes_skipped, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Seed feed URLs verified via iTunes Search API + manual HTTP check
// 2026-05-14. First seedPodcasts run only landed The High Low — 8 of 12
// hardcoded URLs were 404 because Acast / Simplecast / Megaphone had
// rotated slugs since the original seeds were authored. Canonical URLs
// below are from iTunes Search API results matched on trackName; all 12
// verified 200 + valid RSS body from base44 edge before commit. If a
// feed dies again, re-run an iTunes Search lookup for the new URL.
const SEED_PODCASTS = [
  { name: 'Maintenance Phase',                        feed_url: 'https://feeds.buzzsprout.com/1411126.rss',                                       category: 'Lifestyle' },
  { name: 'Adam Buxton',                              feed_url: 'https://feeds.acast.com/public/shows/18dcd5db-f898-42c6-ab31-3a1853c1a645',      category: 'Culture' },
  { name: 'This Is Dating',                           feed_url: 'https://feeds.simplecast.com/xBrAtG6E',                                          category: 'Relationships' },
  { name: 'Modern Love',                              feed_url: 'https://feeds.simplecast.com/eHEJ08b1',                                          category: 'Relationships' },
  { name: 'Sentimental Garbage',                      feed_url: 'https://feeds.acast.com/public/shows/edd6bde5-221e-4c07-bde8-2a0241ccc6e0',      category: 'Culture' },
  { name: "You're Wrong About",                       feed_url: 'https://feeds.buzzsprout.com/1112270.rss',                                       category: 'Culture' },
  { name: 'Where Should We Begin? with Esther Perel', feed_url: 'https://feeds.megaphone.fm/ep-wswb',                                             category: 'Relationships' },
  { name: 'The Hilarious World of Depression',        feed_url: 'https://feeds.publicradio.org/public_feeds/the-hilarious-world-of-depression',  category: 'Mental Wellness' },
  { name: 'On Being with Krista Tippett',             feed_url: 'https://onbeing.org/series/podcast/feed/',                                       category: 'Mindfulness' },
  { name: 'The High Low',                             feed_url: 'https://feeds.acast.com/public/shows/the-high-low',                              category: 'Culture' },
  { name: 'Slow Burn',                                feed_url: 'https://feeds.acast.com/public/shows/6965759d79fe7d554545528a',                  category: 'Culture' },
  { name: 'How To Fail With Elizabeth Day',           feed_url: 'https://rss.pdrl.fm/e402a9/feeds.megaphone.fm/howtofail',                        category: 'Lifestyle' },
];

async function logIngestError(base44, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name: 'seedPodcasts',
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
    console.error('[seedPodcasts log-failed]', logErr?.message);
  }
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function stripEmoji(s) {
  if (!s) return '';
  return String(s).replace(
    /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
    '',
  ).replace(/\s+/g, ' ').trim();
}

function parseChannelImage(xml) {
  const itunes = xml.match(/<itunes:image[^>]*href=["']([^"']+)["']/i);
  if (itunes?.[1]) return itunes[1];
  const ch = xml.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i);
  if (ch?.[1]) return ch[1].trim();
  return '';
}

function parsePodcastItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '').trim();
    const desc = (block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '').trim();
    const enclosure = block.match(/<enclosure[^>]*url=["']([^"']+)["']/i)?.[1] || '';
    const itunesImage = block.match(/<itunes:image[^>]*href=["']([^"']+)["']/i)?.[1] || '';
    const itunesDuration = (block.match(/<itunes:duration>([\s\S]*?)<\/itunes:duration>/i)?.[1] || '').trim();
    const guid = (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] || link || title).trim();
    if (!title || !link) continue;
    items.push({ title, link, desc, pubDate, enclosure, image: itunesImage, durationLabel: itunesDuration, guid });
  }
  return items;
}

function durationToSeconds(label) {
  if (!label) return 0;
  if (/^\d+$/.test(label)) return parseInt(label, 10);
  const parts = label.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const onlySource = body?.only_source_name;

    const sb = base44.asServiceRole;
    const now = new Date().toISOString();
    let sourcesCreated = 0;
    let sourcesExisting = 0;
    let episodesIngested = 0;
    let episodesSkipped = 0;
    const errors = [];

    for (const seed of SEED_PODCASTS) {
      if (onlySource && seed.name !== onlySource) continue;

      // 1. Upsert the LifestyleSources row
      const existing = await sb.entities.LifestyleSources.filter(
        { name: seed.name }, undefined, 1,
      ).catch(() => []);
      let sourceRow = existing[0];
      if (!sourceRow) {
        try {
          sourceRow = await sb.entities.LifestyleSources.create({
            name: seed.name,
            type: 'RSS',
            source_type: 'PODCAST',
            feed_url: seed.feed_url,
            url: seed.feed_url,
            category: seed.category,
            is_active: true,
            enabled: true,
            priority: 5,
            daily_item_cap: 5,
            tags: ['podcast'],
            language: 'en',
            created_at: now,
          });
          sourcesCreated += 1;
          // Resolve Apple Podcasts collectionId inline for the brand-new
          // source. Non-fatal — if iTunes Search misses, ONE_SHOT_PHASES
          // backfill will pick it up on the next daily cron, and even if
          // that also misses, derivePodcastLinks() returns null for apple
          // so the listen sheet just hides the Apple button.
          try {
            await base44.functions.invoke('resolveApplePodcastId', { source_id: sourceRow.id });
          } catch { /* non-fatal */ }
        } catch (err) {
          await logIngestError(base44, 'source_create',
            { source_identifier: seed.name, raw_payload: seed }, err);
          errors.push({ source: seed.name, error: 'source_create' });
          continue;
        }
      } else {
        sourcesExisting += 1;
        // Heal any drift between the seed config and the DB row:
        //   - source_type may not be PODCAST yet
        //   - feed_url may be stale (we rotated 8 URLs on 2026-05-14
        //     after Acast/Simplecast/Megaphone changed slugs)
        const patch = {};
        if (sourceRow.source_type !== 'PODCAST') {
          patch.source_type = 'PODCAST';
          patch.tags = Array.from(new Set([...(sourceRow.tags || []), 'podcast']));
        }
        if (sourceRow.feed_url !== seed.feed_url) {
          patch.feed_url = seed.feed_url;
          patch.url = seed.feed_url;
        }
        if (Object.keys(patch).length > 0) {
          try {
            await sb.entities.LifestyleSources.update(sourceRow.id, patch);
            sourceRow = { ...sourceRow, ...patch };
          } catch { /* non-fatal */ }
        }
      }

      // 2. Fetch the feed
      // Use a browser-like User-Agent — Acast/Simplecast/Megaphone reject
      // bare "FemWell/1.0" with 403 or 406. The Accept header advertises
      // RSS/Atom + XML fallback. Mirrors ingestRSS's CHROME_UA approach.
      let xml = '';
      try {
        const res = await fetch(seed.feed_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        xml = await res.text();
      } catch (err) {
        await logIngestError(base44, 'feed_fetch',
          { source_identifier: seed.name, raw_payload: { feed_url: seed.feed_url } }, err);
        errors.push({ source: seed.name, error: 'feed_fetch' });
        continue;
      }

      const channelImage = parseChannelImage(xml);
      const items = parsePodcastItems(xml).slice(0, 5);

      for (const ep of items) {
        try {
          const hash = simpleHash(ep.guid);
          const dupe = await sb.entities.LifestyleItems.filter(
            { content_url_hash: hash }, undefined, 1,
          ).catch(() => []);
          if (dupe.length > 0) { episodesSkipped += 1; continue; }

          // Image is optional. PodcastCard's getCategoryGradient renders a
          // tasteful fallback when image_url is empty, so a missing
          // <itunes:image> should NOT throw the row away. (Previously this
          // block was a hard skip — that meant a single under-tagged feed
          // could yield zero episodes ingested and the rail rendered nothing.)
          const image = ep.image || channelImage || '';
          if (!image) {
            await logIngestError(base44, 'image_missing',
              { source_identifier: seed.name, item_id: ep.guid, raw_payload: { title: ep.title } },
              new Error('No image_url for episode and no channel artwork (writing row with empty image)'));
          }

          const seconds = durationToSeconds(ep.durationLabel);
          let publishedAt = now;
          try { publishedAt = new Date(ep.pubDate).toISOString(); } catch { /* use now */ }

          await sb.entities.LifestyleItems.create({
            source_id: sourceRow.id,
            source_name: seed.name,
            title: stripEmoji(ep.title).slice(0, 220),
            content_url: ep.link,
            content_url_hash: hash,
            summary: stripEmoji(stripHtml(ep.desc)).slice(0, 600),
            image_url: image,
            audio_url: ep.enclosure || '',
            episode_url: ep.link,
            duration_seconds: seconds,
            duration_label: ep.durationLabel || '',
            published_at: publishedAt,
            ingested_at: now,
            category: seed.category,
            media_type: 'PODCAST',
            provider: 'RSS',
            status: 'PUBLISHED',
            tags: ['podcast'],
            created_at: now,
          });
          episodesIngested += 1;
        } catch (err) {
          await logIngestError(base44, 'episode_create',
            { source_identifier: seed.name, item_id: ep.guid, raw_payload: ep }, err);
          errors.push({ source: seed.name, item: ep.title?.slice(0, 60), error: 'episode_create' });
        }
      }
    }

    return Response.json({
      ok: true,
      sources_created: sourcesCreated,
      sources_existing: sourcesExisting,
      episodes_ingested: episodesIngested,
      episodes_skipped: episodesSkipped,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});