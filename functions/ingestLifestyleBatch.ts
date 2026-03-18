import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function simpleHash(str) {
  let hash = 0;
  for (let index = 0; index < str.length; index += 1) {
    hash = (Math.imul(31, hash) + str.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function detectMediaType(sourceType) {
  if (sourceType === 'YOUTUBE_CHANNEL') return { media_type: 'VIDEO', provider: 'YOUTUBE' };
  if (sourceType === 'TIKTOK') return { media_type: 'TIKTOK', provider: 'TIKTOK' };
  if (sourceType === 'INSTAGRAM') return { media_type: 'INSTAGRAM', provider: 'INSTAGRAM' };
  return { media_type: 'ARTICLE', provider: sourceType === 'BLOG' ? 'BLOG' : sourceType === 'NEWS' ? 'NEWS' : 'RSS' };
}

async function parseFeed(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': 'FemWellBot/1.0' },
    signal: AbortSignal.timeout(12000),
  });
  const xml = await response.text();
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);

  return blocks.slice(0, 12).map((block) => {
    const readTag = (tag) => {
      const cdata = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdata?.[1]) return cdata[1].trim();
      const plain = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return plain?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    };

    const linkMatch = block.match(/<link[^>]+href="([^"]+)"/i);
    const enclosureMatch = block.match(/<(?:media:content|enclosure)[^>]+url="([^"]+)"/i);
    const imageMatch = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i) || enclosureMatch;

    return {
      title: readTag('title'),
      link: linkMatch?.[1] || readTag('link') || readTag('guid'),
      summary: readTag('description') || readTag('summary') || '',
      pub_date: readTag('pubDate') || readTag('published') || new Date().toISOString(),
      image_url: imageMatch?.[1] || '',
      embed_url: enclosureMatch?.[1] || '',
    };
  }).filter((item) => item.title && item.link);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const sourceLimit = payload.source_limit || 60;

    const sources = await base44.asServiceRole.entities.LifestyleSources.list('-updated_date', 300);
    const activeSources = sources.filter((source) => (source.enabled !== false) && (source.is_active !== false) && (source.url || source.feed_url)).slice(0, sourceLimit);

    let ingested = 0;
    let skipped = 0;

    for (const source of activeSources) {
      const sourceType = source.type || source.source_type || 'RSS';
      const feedUrl = source.url || source.feed_url;
      const media = detectMediaType(sourceType);

      try {
        const items = await parseFeed(feedUrl);
        for (const item of items) {
          const hash = simpleHash(item.link);
          const existing = await base44.asServiceRole.entities.LifestyleItems.filter({ content_url_hash: hash });
          if (existing[0]) {
            skipped += 1;
            continue;
          }

          await base44.asServiceRole.entities.LifestyleItems.create({
            source_id: source.id,
            source_name: source.name,
            source_logo_url: source.logo_url || '',
            title: item.title.slice(0, 220),
            content_url: item.link,
            embed_url: item.embed_url || item.link,
            content_url_hash: hash,
            image_url: item.image_url,
            category: source.category || 'Lifestyle',
            summary: item.summary.slice(0, 320),
            pub_date: item.pub_date,
            ingested_at: new Date().toISOString(),
            status: 'NEEDS_REVIEW',
            media_type: media.media_type,
            provider: media.provider,
            tags: [source.category || 'Lifestyle'],
          });
          ingested += 1;
        }
      } catch (error) {
        console.error(`Failed source ${source.name}: ${error.message}`);
      }
    }

    return Response.json({ ingested, skipped, scanned_sources: activeSources.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});