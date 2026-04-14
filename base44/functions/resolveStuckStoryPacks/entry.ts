/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Find all PENDING packs older than 15 minutes
    const pendingPacks = await base44.asServiceRole.entities.StoryPack.filter({ status: 'PENDING' });
    let processed = 0;

    for (const pack of pendingPacks) {
      const createdAt = new Date(pack.created_at);
      if (createdAt > fifteenMinutesAgo) continue; // Not old enough yet

      const items = await base44.asServiceRole.entities.StoryItem.filter({ pack_id: pack.id });
      const doneCount = items.filter(i => i.item_status === 'DONE').length;

      if (doneCount >= 3) {
        // Mark remaining items as FAILED and set pack to READY
        const pendingItems = items.filter(i => i.item_status === 'PENDING');
        for (const item of pendingItems) {
          await base44.asServiceRole.entities.StoryItem.update(item.id, { item_status: 'FAILED' });
        }
        await base44.asServiceRole.entities.StoryPack.update(pack.id, {
          status: 'READY',
          updated_at: new Date().toISOString(),
        });
        processed++;
      } else if (doneCount < 3) {
        // Too few items done — mark entire pack as FAILED
        const pendingItems = items.filter(i => i.item_status === 'PENDING');
        for (const item of pendingItems) {
          await base44.asServiceRole.entities.StoryItem.update(item.id, { item_status: 'FAILED' });
        }
        await base44.asServiceRole.entities.StoryPack.update(pack.id, {
          status: 'FAILED',
          updated_at: new Date().toISOString(),
        });
        processed++;
      }
    }

    return Response.json({ success: true, processed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});