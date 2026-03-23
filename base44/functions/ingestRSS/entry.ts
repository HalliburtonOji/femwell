import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function parseRSS(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'FemWell/1.0 RSS Reader' } });
  const text = await res.text();
  const items = [];

  // Extract <item> blocks
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || block.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    const imgMatch = block.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
      || block.match(/<media:content[^>]+url="([^"]+)"/i)
      || block.match(/<enclosure[^>]+url="([^"]+)"/i);
    items.push({
      title: get('title'),
      link: get('link') || get('guid'),
      pubDate: get('pubDate'),
      description: get('description'),
      image_url: imgMatch ? imgMatch[1] : '',
    });
  }
  return items;
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const sources = await base44.asServiceRole.entities.LifestyleSources.filter({ is_active: true, source_type: 'RSS' });
    let ingested = 0;
    let skipped = 0;

    for (const source of sources) {
      if (!source.feed_url) continue;
      try {
        const rssItems = await parseRSS(source.feed_url);
        for (const item of rssItems.slice(0, 20)) {
          if (!item.title || !item.link) continue;
          const hash = simpleHash(item.link);

          // Check dedupe
          const existing = await base44.asServiceRole.entities.LifestyleItems.filter({ content_url_hash: hash });
          if (existing.length > 0) { skipped++; continue; }

          await base44.asServiceRole.entities.LifestyleItems.create({
            source_id: source.id,
            source_name: source.name,
            source_logo_url: source.logo_url || '',
            title: item.title.slice(0, 200),
            content_url: item.link,
            content_url_hash: hash,
            image_url: item.image_url || '',
            category: source.category || 'Lifestyle',
            summary: item.description?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
            pub_date: item.pubDate || new Date().toISOString(),
            ingested_at: new Date().toISOString(),
            status: 'NEEDS_REVIEW',
            media_type: 'ARTICLE',
            tags: source.category || 'Lifestyle',
          });
          ingested++;
        }
      } catch (e) {
        console.error(`Failed source ${source.name}:`, e.message);
      }
    }

    return Response.json({ ingested, skipped, sources: sources.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});