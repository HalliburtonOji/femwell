import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: 'Find upcoming events over the next 60 days in major UK cities (London, Manchester, Birmingham, Leeds, Bristol) covering ALL of the following: women networking and professional meetups, fitness and wellness classes (yoga, pilates, running clubs, HIIT), social parties and club nights, gallery openings and culture events, food and coffee socials, talks panels and workshops, dating and relationship events, online and virtual events accessible from anywhere. Source from Eventbrite, Dice, Meetup.com, Fatsoma, Time Out, RA (Resident Advisor), and Facebook Events. Return a balanced mix of free and paid events. Return up to 80 items.',
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
                source_name: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                is_online: { type: 'boolean' }
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
        tags: Array.isArray(item.tags) ? item.tags : [],
        is_online: Boolean(item.is_online),
      });
    }

    return Response.json({ refreshed: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});