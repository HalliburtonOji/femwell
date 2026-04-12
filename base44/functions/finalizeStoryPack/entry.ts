import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { pack_id } = body;
    if (!pack_id) return Response.json({ error: 'pack_id required' }, { status: 400 });

    const items = await base44.entities.StoryItem.filter({ pack_id });
    const allDone = items.length === 5 && items.every(i => i.item_status === 'DONE' && i.image_url);

    if (allDone) {
      await base44.entities.StoryPack.update(pack_id, {
        status: 'READY',
        updated_at: new Date().toISOString(),
      });
      return Response.json({ status: 'READY' });
    }

    return Response.json({ status: 'PENDING', done: items.filter(i => i.item_status === 'DONE').length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});