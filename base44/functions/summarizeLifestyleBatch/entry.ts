import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function fetchArticleText(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3500);
  } catch {
    return '';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const batchSize = payload.batch_size || 8;
    const pending = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'NEEDS_REVIEW' }, '-ingested_at', batchSize);

    let summarized = 0;
    for (const item of pending) {
      try {
        const articleText = await fetchArticleText(item.content_url);
        const sourceText = articleText || item.summary || item.title;
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are the FemWell lifestyle editor. Rewrite this content for a premium women’s wellness feed. Keep it warm, useful, and concise.\n\nTitle: ${item.title}\nCategory hint: ${item.category || 'Lifestyle'}\nProvider: ${item.provider || 'RSS'}\nText: ${sourceText}\n\nReturn:\n- summary: max 180 characters\n- takeaways: exactly 3 short strings\n- why_it_matters: max 100 characters\n- category: one of Womens Health, Relationships, Career & Money, Beauty, Lifestyle, Mental Wellness, Food, Fitness, Culture, Parenting, Sex Education, Menopause, PCOS, PMS\n- tags: 3 to 5 short strings`,
          response_json_schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              takeaways: { type: 'array', items: { type: 'string' } },
              why_it_matters: { type: 'string' },
              category: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
          },
        });

        const takeaways = Array.isArray(result.takeaways) ? result.takeaways.slice(0, 3) : [];
        const normalizedCategory = result.category === 'Womens Health' ? "Women's Health" : (result.category || item.category);
        await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
          summary: result.summary || item.summary,
          takeaways,
          why_it_matters: result.why_it_matters || '',
          category: normalizedCategory,
          tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : (Array.isArray(item.tags) ? item.tags : []),
          status: 'PUBLISHED',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        summarized += 1;
      } catch (error) {
        console.error(`Failed lifestyle item ${item.id}: ${error.message}`);
      }
    }

    return Response.json({ summarized, total: pending.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});