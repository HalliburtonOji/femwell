/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const items = await base44.asServiceRole.entities.ContentItems.list();
    let migrated = 0;
    for (const ci of items) {
      const updates = {};
      if (typeof ci.tags === 'string') {
        updates.tags = ci.tags ? ci.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
      if (!ci.access_tier || ci.access_tier === 'free') {
        if (ci.is_premium === true) {
          updates.access_tier = ci.premium_tier === 'PRO' ? 'pro' : 'plus';
        }
      }
      if (Object.keys(updates).length === 0) continue;
      updates.updated_at = new Date().toISOString();
      await base44.asServiceRole.entities.ContentItems.update(ci.id, updates);
      migrated++;
    }
    return Response.json({ ok: true, migrated, total: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});