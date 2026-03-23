import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: 'Find upcoming women-focused events in the UK over the next 60 days. Include networking, fitness/wellness, talks/workshops, and relationship or therapy related events. Prefer London and major UK cities. Return a balanced mix of free and paid listings with direct links.',
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                date: { type: 'string' },
                location: { type: 'string' },
                price: { type: 'string' },
                link: { type: 'string' },
                category: { type: 'string' },
                is_free: { type: 'boolean' },
                city: { type: 'string' },
                source_name: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const existing = await base44.asServiceRole.entities.EventsItems.list('-created_date', 300);
    await Promise.all(existing.map((item) => base44.asServiceRole.entities.EventsItems.delete(item.id)));

    const items = Array.isArray(result.items) ? result.items.slice(0, 80) : [];
    for (const item of items) {
      await base44.asServiceRole.entities.EventsItems.create({
        title: item.title,
        date: item.date,
        location: item.location || '',
        price: item.price || '',
        link: item.link || '',
        category: item.category || 'general',
        is_free: Boolean(item.is_free),
        city: item.city || '',
        source_name: item.source_name || 'Web search',
      });
    }

    return Response.json({ refreshed: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});