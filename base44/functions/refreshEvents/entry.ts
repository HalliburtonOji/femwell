/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Fetch in smaller batches (8 items each) to avoid JSON truncation
    const fetchBatch = async (categories) => {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'gemini_3_flash',
        add_context_from_internet: true,
        prompt: `Find 8 upcoming real events over the next 60 days in major UK cities (London, Manchester, Birmingham, Leeds, Bristol) for: ${categories}. Include both free and paid events. Return ONLY direct booking URLs. Return exactly 8 items as a JSON array.`,
        response_json_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              maxItems: 8,
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
                  source_name: { type: 'string' },
                  is_online: { type: 'boolean' },
                }
              }
            }
          }
        }
      });
      return Array.isArray(res.items) ? res.items : [];
    };

    const [batch1, batch2, batch3, batch4] = await Promise.all([
      fetchBatch('women networking, fitness and wellness'),
      fetchBatch('talks and workshops, dating events'),
      fetchBatch('social parties, gallery and culture events'),
      fetchBatch('food and coffee socials, virtual and online events'),
    ]);
    const result = { items: [...batch1, ...batch2, ...batch3, ...batch4] };

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
        ticket_platform: item.ticket_platform || item.source_name || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        is_online: Boolean(item.is_online),
      });
    }

    return Response.json({ refreshed: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});