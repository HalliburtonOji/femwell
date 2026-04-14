import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function stripHtml(text) {
  return (text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

async function parseRSS(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'FemWell/1.0 RSS Reader' } });
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
      return plain?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    };
    const linkAttr = block.match(/<link[^>]+href="([^"]+)"/i);
    items.push({
      title: get('title'),
      link: linkAttr?.[1] || get('link') || get('guid'),
      pubDate: get('pubDate') || get('published') || new Date().toISOString(),
      description: get('description') || get('summary') || ''
    });
  }
  return items;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const activeSources = await base44.asServiceRole.entities.LifestyleSources.filter({ is_active: true }, 'priority', 15);
    let ingested = 0;
    let skipped = 0;

    for (const source of activeSources) {
      if (!source.rss_url) continue;
      try {
        const rssItems = await parseRSS(source.rss_url);
        for (const item of rssItems.slice(0, 20)) {
          if (!item.title || !item.link) continue;
          const existing = await base44.asServiceRole.entities.LifestyleItems.filter({ content_url: item.link });
          if (existing.length > 0) {
            skipped += 1;
            continue;
          }

          await base44.asServiceRole.entities.LifestyleItems.create({
            source_id: source.id,
            source_name: source.name,
            title: item.title.slice(0, 220),
            content_url: item.link,
            summary: stripHtml(item.description),
            published_at: (() => { try { return new Date(item.pubDate).toISOString(); } catch { return new Date().toISOString(); } })(),
            category: source.category,
            media_type: 'ARTICLE',
            status: 'PUBLISHED',
            tags: Array.isArray(source.tags) ? source.tags : [],
            ingested_at: new Date().toISOString(),
            provider: 'RSS'
          });
          ingested += 1;
        }
      } catch {
        // do nothing
      }
    }

    return Response.json({ ingested, skipped, sources: activeSources.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});