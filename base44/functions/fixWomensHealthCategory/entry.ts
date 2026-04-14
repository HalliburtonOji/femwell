/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const scanAll = body.scan_all === true;

    let items;
    if (scanAll) {
      // Scan all items to find any with non-canonical category
      items = await base44.asServiceRole.entities.LifestyleItems.list('-ingested_at', 500);
      items = items.filter(i => i.category && i.category !== "Women's Health" && i.category.toLowerCase().replace(/[^a-z]/g, '').includes('womenshealth'));
    } else {
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ category: "Womens Health" });
    }

    let fixed = 0;
    for (const item of items) {
      const updates = { category: "Women's Health" };
      if (typeof item.tags === 'string') {
        updates.tags = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
      await base44.asServiceRole.entities.LifestyleItems.update(item.id, updates);
      fixed++;
    }

    return Response.json({ ok: true, fixed, found: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});