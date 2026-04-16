/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled worker: runs every 10 minutes.
// Advances one StoryItem per pending StoryPack.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sb = base44.asServiceRole;
    const today = new Date().toISOString().split('T')[0];

    // Find pending packs for today (limit 10)
    const pendingPacks = await sb.entities.StoryPack.filter({ day_key: today, status: 'PENDING' }, '-created_at', 10).catch(() => []);

    const results = [];
    for (const pack of pendingPacks) {
      const itemRes = await sb.functions.invoke('generateNextStoryItem', { pack_id: pack.id }).catch(e => ({ error: String(e?.message || 'Unknown error') }));
      const finalRes = await sb.functions.invoke('finalizeStoryPack', { pack_id: pack.id }).catch(e => ({ error: String(e?.message || 'Unknown error') }));

      // Generate DALL-E image if pack has no image yet (cost-managed, cached)
      if (!pack.image_url) {
        const imgRes = await sb.functions.invoke('generateStoryImage', {
          pack_id: pack.id,
          cycle_phase: pack.cycle_phase || null,
          day_key: pack.day_key || today,
          user_id: pack.user_id,
        }).catch(() => ({ skipped: true }));
        results.push({ pack_id: pack.id, itemRes, finalRes, imgRes });
      } else {
        results.push({ pack_id: pack.id, itemRes, finalRes });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});