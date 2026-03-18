import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: 'Find active coupon or promo code deals for wellness, skincare, fitness, food, and supplements stores popular in the UK. Prefer stores like Boots, ASOS, Sephora, Cult Beauty, Holland & Barrett, MyProtein, Gymshark, and similar. Return concise current-looking offers only.',
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                store_name: { type: 'string' },
                code: { type: 'string' },
                expiry: { type: 'string' },
                terms: { type: 'string' },
                link: { type: 'string' },
                category: { type: 'string' },
                source_name: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const existing = await base44.asServiceRole.entities.DealsItems.list('-created_date', 300);
    await Promise.all(existing.map((item) => base44.asServiceRole.entities.DealsItems.delete(item.id)));

    const items = Array.isArray(result.items) ? result.items.slice(0, 60) : [];
    for (const item of items) {
      await base44.asServiceRole.entities.DealsItems.create({
        store_name: item.store_name,
        code: item.code,
        expiry: item.expiry || '',
        terms: item.terms || '',
        link: item.link || '',
        category: item.category || 'general',
        source_name: item.source_name || 'Web search',
        is_active: true,
      });
    }

    return Response.json({ refreshed: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});