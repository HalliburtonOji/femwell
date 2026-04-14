import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function fetchArticleText(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    // Strip tags, collapse whitespace, get first 3000 chars
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
  } catch {
    return '';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { item_id, batch_size = 5 } = body;

    let items;
    if (item_id) {
      const item = await base44.asServiceRole.entities.LifestyleItems.filter({ id: item_id });
      items = item;
    } else {
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'NEEDS_REVIEW' }, '-ingested_at', batch_size);
    }

    let summarized = 0;
    for (const item of items) {
      try {
        const articleText = await fetchArticleText(item.content_url);
        const textToUse = articleText || item.summary || item.title;

        const prompt = `You are a women's wellness content editor. Summarise this article for a health-conscious female audience.

Title: ${item.title}
Content: ${textToUse}

Return JSON with:
- summary: 2-3 engaging sentences (max 180 chars)
- takeaway_1: first key takeaway (max 90 chars)
- takeaway_2: second key takeaway (max 90 chars)
- takeaway_3: third key takeaway (max 90 chars, or empty string if not needed)
- why_it_matters: one-line statement on why this matters (max 80 chars)
- category: one of [Womens Health, Relationships, Professional, Beauty, Lifestyle, Mental Health, Nutrition, Fitness]
- tags: comma-separated keywords (max 5 tags)`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              takeaway_1: { type: 'string' },
              takeaway_2: { type: 'string' },
              takeaway_3: { type: 'string' },
              why_it_matters: { type: 'string' },
              category: { type: 'string' },
              tags: { type: 'string' },
            },
          },
        });

        const tagsArr = result.tags
          ? result.tags.split(',').map(t => t.trim()).filter(Boolean)
          : (Array.isArray(item.tags) ? item.tags : []);
        await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
          summary: result.summary || item.summary,
          takeaways: [result.takeaway_1, result.takeaway_2, result.takeaway_3].filter(Boolean),
          why_it_matters: result.why_it_matters || '',
          category: result.category === 'Womens Health' ? "Women's Health" : (result.category || item.category),
          tags: tagsArr,
          status: 'PUBLISHED',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        summarized++;
      } catch (e) {
        console.error(`Failed item ${item.id}:`, e.message);
      }
    }

    return Response.json({ summarized, total: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});