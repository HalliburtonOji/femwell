import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0];
    const deals = await base44.asServiceRole.entities.DealsItems.filter({ is_active: true });
    let updated = 0;

    for (const deal of deals) {
      if (deal.expiry && deal.expiry < today) {
        await base44.asServiceRole.entities.DealsItems.update(deal.id, { is_active: false });
        updated += 1;
      }
    }

    return Response.json({ success: true, updated, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});