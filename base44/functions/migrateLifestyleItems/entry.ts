/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    // Support pagination: offset into list
    const batchSize = body.batch_size || 100;
    const skip = body.skip || 0;

    const items = await base44.asServiceRole.entities.LifestyleItems.list('-ingested_at', batchSize + skip);
    const batch = items.slice(skip, skip + batchSize);

    let migrated = 0;
    for (const li of batch) {
      const updates = {};

      if (typeof li.tags === 'string') {
        updates.tags = li.tags ? li.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }

      if ((!Array.isArray(li.takeaways) || li.takeaways.length === 0) && (li.takeaway_1 || li.takeaway_2 || li.takeaway_3)) {
        updates.takeaways = [li.takeaway_1, li.takeaway_2, li.takeaway_3].filter(Boolean);
      }

      if (!li.published_at && li.pub_date) {
        try { updates.published_at = new Date(li.pub_date).toISOString(); } catch {}
      }

      if (li.category === 'Womens Health') {
        updates.category = "Women's Health";
      }

      if (Object.keys(updates).length === 0) continue;
      updates.updated_at = new Date().toISOString();
      await base44.asServiceRole.entities.LifestyleItems.update(li.id, updates);
      migrated++;
    }

    return Response.json({ ok: true, migrated, batchProcessed: batch.length, skip, hasMore: items.length > skip + batchSize });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});