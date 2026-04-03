import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const YOUTUBE_CHANNELS = [
  { id: 'UC4cNjUPc2gQKucX3hLUayYQ', name: 'Dr. Mindy Pelz',      category: 'Hormones & Cycle', tags: ['hormones', 'fasting', 'cycle syncing'] },
  { id: 'UCFKE7WVJfvaHW5q283SxchA', name: 'Yoga With Adriene',    category: 'Mindfulness',      tags: ['yoga', 'movement', 'calm'] },
  { id: 'UCIJwWYOfsCfz6PjxbONYXSg', name: 'Blogilates',           category: 'Fitness',          tags: ['pilates', 'workout', 'women'] },
  { id: 'UCPD55VPa1ZWx1a_nzWC2VJA', name: 'Dr. Stacy Sims',       category: 'Fitness',          tags: ['exercise science', 'female physiology', 'strength'] },
  { id: 'UCIiI9tAbgvSPPL_50gefFtw', name: 'Nourish Move Love',     category: 'Fitness',          tags: ['strength', 'HIIT', 'women workout'] },
  { id: 'UCZUUZFex6AaIU4QTopFudYA', name: 'Grow With Jo',         category: 'Fitness',          tags: ['walking', 'low impact', 'beginner'] },
  { id: 'UCSOrtpPOceNxjeyHxL3kD_Q', name: 'Lena Fit',             category: 'Fitness',          tags: ['strength', 'body', 'women'] },
  { id: 'UCk4di8t80ySV8WIbX00ol8w', name: "Women's Health Mag",   category: 'Womens Health',    tags: ['health', 'wellness', 'women'] },
  { id: 'UChVRfsT_ASBZk10o0An7Ucg', name: 'Pamela Reif',          category: 'Fitness',          tags: ['workout', 'fitness', 'women'] },
  { id: 'UCSaYCyda-i7enHvQ8Wns8_w', name: 'Abby Pollock',         category: 'Nutrition',        tags: ['nutrition', 'body composition', 'women'] },
  { id: 'UCmrOBAi8o04ZqNZgPsNxSKg', name: 'Kait Malthaner',       category: 'Nutrition',        tags: ['nutrition', 'exercise', 'hormone health'] },
  { id: 'UC6gdCj56YK5KxiFf3WSOLtA', name: 'The Gut Health MD',    category: 'Gut Health',       tags: ['gut health', 'microbiome', 'nutrition'] },
  { id: 'UCxAB39SRMVabVZEOKTo6iVA', name: 'mindbodygreen',        category: 'Mental Wellness',  tags: ['holistic', 'wellness', 'mindset'] },
  { id: 'UCuM9fe_QPFMTJT3uQmoNMFg', name: 'fitbymik',             category: 'Fitness',          tags: ['strength', 'workout', 'women'] },
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
  { name: 'The Guardian Women', rss: 'https://www.theguardian.com/lifeandstyle/women/rss',  category: 'Womens Health',   content_type: 'ARTICLE' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function parseYouTubeRSS(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FemWell/1.0' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  } catch { return []; }
}

async function parseRSS(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FemWell/1.0 RSS Reader' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
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
  } catch { return []; }
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

    // Pre-fetch all existing hashes in one query to avoid per-item filter calls hitting rate limits
    const allExisting = await base44.asServiceRole.entities.LifestyleItems.list('-created_date', 2000);
    const existingHashes = new Set(allExisting.map(i => i.content_url_hash).filter(Boolean));

    if (mode === 'youtube' || mode === 'all') {
      for (const channel of YOUTUBE_CHANNELS) {
        const videos = await parseYouTubeRSS(channel.id);
        await sleep(200);
        for (const v of videos.slice(0, 15)) {
          if (!v.videoId || !v.title) continue;
          const contentUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
          const hash = hashUrl(contentUrl);
          if (existingHashes.has(hash)) { skipped++; continue; }
          await base44.asServiceRole.entities.LifestyleItems.create({
            source_name: channel.name, channel_name: channel.name, channel_id: channel.id,
            video_id: v.videoId, title: v.title.slice(0, 220),
            content_url: contentUrl,
            source_url: contentUrl,
            embed_url: `https://www.youtube.com/embed/${v.videoId}?rel=0&modestbranding=1&playsinline=1`,
            image_url: v.thumbnail, content_url_hash: hash,
            pub_date: v.published || new Date().toISOString(),
            ingested_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            category: channel.category, content_type: 'VIDEO', media_type: 'VIDEO',
            provider: 'YOUTUBE', tags: channel.tags, status: 'PUBLISHED',
            engagement_score: Math.min(Math.floor((v.views || 0) / 1000), 50),
          });
          existingHashes.add(hash);
          ytIngested++;
          await sleep(150);
        }
      }
    }

    if (mode === 'rss' || mode === 'all') {
      for (const source of RSS_SOURCES) {
        const items = await parseRSS(source.rss);
        await sleep(200);
        for (const item of items.slice(0, 20)) {
          if (!item.title || !item.link) continue;
          const hash = hashUrl(item.link);
          if (existingHashes.has(hash)) { skipped++; continue; }
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
            source_name: source.name, title: item.title.slice(0, 220),
            content_url: item.link, source_url: item.link, content_url_hash: hash,
            image_url: item.image_url || '', author_name: item.author || '', lede, summary: lede,
            pub_date: item.pubDate || new Date().toISOString(),
            ingested_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            category: source.category, content_type: source.content_type,
            media_type: 'ARTICLE', provider: 'RSS', status: 'NEEDS_REVIEW', tags: [],
          });
          existingHashes.add(hash);
          rssIngested++;
          await sleep(150);
        }
      }
    }

    return Response.json({ youtube_ingested: ytIngested, rss_ingested: rssIngested, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});