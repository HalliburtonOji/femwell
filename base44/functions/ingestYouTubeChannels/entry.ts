// MP-Pipeline Phase 1+2:
// - Writes new YouTube items as NEEDS_REVIEW (was PUBLISHED) so summarizeLifestyleItem
//   can run the embed gate, fetch duration, generate summary, then publish
// - Adds HEAD validation on canonical watch URL before each write
// - Populates source_id, source_name, source_logo_url (was missing — caused 47.8% null source_id)
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

const YOUTUBE_CHANNELS = [
  { id: 'UC4cNjUPc2gQKucX3hLUayYQ', name: 'Dr. Mindy Pelz',      category: 'Hormones & Cycle', tags: ['hormones', 'fasting', 'cycle syncing'] },
  { id: 'UCFKE7WVJfvaHW5q283SxchA', name: 'Yoga With Adriene',    category: 'Mindfulness',      tags: ['yoga', 'movement', 'calm'] },
  { id: 'UCIJwWYOfsCfz6PjxbONYXSg', name: 'Blogilates',           category: 'Fitness',          tags: ['pilates', 'workout', 'women'] },
  { id: 'UCPD55VPa1ZWx1a_nzWC2VJA', name: 'Dr. Stacy Sims',       category: 'Fitness',          tags: ['exercise science', 'female physiology', 'strength'] },
  { id: 'UCIiI9tAbgvSPPL_50gefFtw', name: 'Nourish Move Love',     category: 'Fitness',          tags: ['strength', 'HIIT', 'women workout'] },
  { id: 'UCZUUZFex6AaIU4QTopFudYA', name: 'Grow With Jo',         category: 'Fitness',          tags: ['walking', 'low impact', 'beginner'] },
  { id: 'UCSOrtpPOceNxjeyHxL3kD_Q', name: 'Lena Fit',             category: 'Fitness',          tags: ['strength', 'body', 'women'] },
  { id: 'UCk4di8t80ySV8WIbX00ol8w', name: "Women's Health Mag",   category: "Women's Health",   tags: ['health', 'wellness', 'women'] },
  { id: 'UChVRfsT_ASBZk10o0An7Ucg', name: 'Pamela Reif',          category: 'Fitness',          tags: ['workout', 'fitness', 'women'] },
  { id: 'UCSaYCyda-i7enHvQ8Wns8_w', name: 'Abby Pollock',         category: 'Nutrition',        tags: ['nutrition', 'body composition', 'women'] },
  { id: 'UCmrOBAi8o04ZqNZgPsNxSKg', name: 'Kait Malthaner',       category: 'Nutrition',        tags: ['nutrition', 'exercise', 'hormone health'] },
  { id: 'UC6gdCj56YK5KxiFf3WSOLtA', name: 'The Gut Health MD',    category: 'Gut Health',       tags: ['gut health', 'microbiome', 'nutrition'] },
  { id: 'UCxAB39SRMVabVZEOKTo6iVA', name: 'mindbodygreen',        category: 'Mental Wellness',  tags: ['holistic', 'wellness', 'mindset'] },
  { id: 'UCuM9fe_QPFMTJT3uQmoNMFg', name: 'fitbymik',             category: 'Fitness',          tags: ['strength', 'workout', 'women'] },
  { id: 'UCogp-TMOSftFMx0cq1ZLSIQ', name: 'Lavendaire',           category: 'Mental Wellness',  tags: ['mindset', 'journaling', 'self growth'] },
  { id: 'UCJjSDX7GzpB6pBFbhqUxEYw', name: 'Pick Up Limes',        category: 'Nutrition',        tags: ['plant based', 'recipes', 'wellbeing'] },
  { id: 'UCImpROGHSCt2bEPbqf6YNOQ', name: 'Rachel Aust',          category: 'Lifestyle',        tags: ['minimalism', 'productivity', 'wellness'] },
  { id: 'UCBcRF18a7Qf58cCRy5xuWwQ', name: 'Maddie Lymburner',     category: 'Fitness',          tags: ['yoga', 'pilates', 'hiit', 'women'] },
  { id: 'UCUOdekVwzRQoFN-L3XCKvbw', name: 'Yoga with Kassandra',  category: 'Mindfulness',      tags: ['yin yoga', 'flexibility', 'calm'] },
];

const RSS_SOURCES = [
  { name: 'mindbodygreen',      rss: 'https://www.mindbodygreen.com/rss.xml',                category: 'Mental Wellness', content_type: 'ARTICLE' },
  { name: 'Longreads',          rss: 'https://longreads.com/feed/',                          category: 'Lifestyle',       content_type: 'STORY'   },
  { name: 'Narratively',        rss: 'https://www.narratively.com/feed',                     category: 'Lifestyle',       content_type: 'STORY'   },
  { name: 'Electric Lit',       rss: 'https://electricliterature.com/feed/',                 category: 'Culture',         content_type: 'STORY'   },
  { name: 'Granta',             rss: 'https://granta.com/feed/',                             category: 'Culture',         content_type: 'STORY'   },
  { name: 'The Everygirl',      rss: 'https://theeverygirl.com/feed/',                       category: 'Lifestyle',       content_type: 'ARTICLE' },
  { name: 'Aeon Essays',        rss: 'https://aeon.co/feed.rss',                             category: 'Mental Wellness', content_type: 'STORY'   },
  { name: 'Lit Hub',            rss: 'https://lithub.com/feed/',                             category: 'Culture',         content_type: 'STORY'   },
  { name: 'Girls Gone Strong',  rss: 'https://girlsgonestrong.com/feed/',                    category: 'Fitness',         content_type: 'ARTICLE' },
  { name: 'SELF Magazine',      rss: 'https://www.self.com/feed/rss',                        category: 'Fitness',         content_type: 'ARTICLE' },
  { name: 'The Guardian Women', rss: 'https://www.theguardian.com/lifeandstyle/women/rss',   category: "Women's Health",  content_type: 'ARTICLE' },
];

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
    const res = await fetch(source.rss, { headers: { 'User-Agent': 'FemWell/1.0 RSS Reader' }, signal: AbortSignal.timeout(10000) });
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

// Look up (and lazily create) a LifestyleSources row for each curated channel,
// so YouTube items always have a non-null source_id.
async function resolveYouTubeSourceId(base44, channel, sourceCache) {
  const cacheKey = `yt:${channel.id}`;
  if (sourceCache.has(cacheKey)) return sourceCache.get(cacheKey);
  try {
    const existing = await base44.asServiceRole.entities.LifestyleSources.filter({
      source_type: 'YOUTUBE',
      external_id: channel.id,
    }).catch(() => []);
    if (existing && existing[0]?.id) {
      sourceCache.set(cacheKey, existing[0].id);
      return existing[0].id;
    }
    const created = await base44.asServiceRole.entities.LifestyleSources.create({
      name: channel.name,
      source_type: 'YOUTUBE',
      external_id: channel.id,
      category: channel.category,
      tags: channel.tags,
      is_active: true,
    }).catch(() => null);
    if (created?.id) {
      sourceCache.set(cacheKey, created.id);
      return created.id;
    }
  } catch (err) {
    await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
      { source_identifier: channel.name, raw_payload: { channelId: channel.id } }, err);
  }
  sourceCache.set(cacheKey, '');
  return '';
}

async function resolveRSSSourceId(base44, source, sourceCache) {
  const cacheKey = `rss:${source.rss}`;
  if (sourceCache.has(cacheKey)) return sourceCache.get(cacheKey);
  try {
    const existing = await base44.asServiceRole.entities.LifestyleSources.filter({
      source_type: 'RSS',
      rss_url: source.rss,
    }).catch(() => []);
    if (existing && existing[0]?.id) {
      sourceCache.set(cacheKey, existing[0].id);
      return existing[0].id;
    }
    const created = await base44.asServiceRole.entities.LifestyleSources.create({
      name: source.name,
      source_type: 'RSS',
      rss_url: source.rss,
      category: source.category,
      is_active: true,
    }).catch(() => null);
    if (created?.id) {
      sourceCache.set(cacheKey, created.id);
      return created.id;
    }
  } catch (err) {
    await logIngestError(base44, 'ingestYouTubeChannels', 'intake',
      { source_identifier: source.name, raw_payload: { rss: source.rss } }, err);
  }
  sourceCache.set(cacheKey, '');
  return '';
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
    const sourceCache = new Map();

    if (mode === 'youtube' || mode === 'all') {
      for (const channel of YOUTUBE_CHANNELS) {
        const videos = await parseYouTubeRSS(base44, channel);
        await sleep(200);
        const sourceId = await resolveYouTubeSourceId(base44, channel, sourceCache);

        for (const v of videos.slice(0, 20)) {
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

            // Required-field guard: title and content_url already non-null;
            // source_id can be empty if LifestyleSources write failed — log and skip rather than write a partial.
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
      for (const source of RSS_SOURCES) {
        const items = await parseRSS(base44, source);
        await sleep(200);
        const sourceId = await resolveRSSSourceId(base44, source, sourceCache);

        for (const item of items.slice(0, 20)) {
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