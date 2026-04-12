import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dayKey = body.day_key || new Date().toISOString().split('T')[0];

    // Check for existing pack
    const existing = await base44.entities.StoryPack.filter({ user_id: user.id, day_key: dayKey });
    if (existing[0]) return Response.json(existing[0]);

    // Create pack
    const now = new Date().toISOString();
    const pack = await base44.entities.StoryPack.create({
      user_id: user.id,
      day_key: dayKey,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    });

    // Create 5 empty StoryItem rows
    for (let i = 1; i <= 5; i++) {
      await base44.entities.StoryItem.create({
        pack_id: pack.id,
        slot_index: i,
        item_status: 'PENDING',
      });
    }

    return Response.json(pack);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});