import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_id, action, category, source_id } = await req.json();
    if (!item_id || !action) return Response.json({ error: 'item_id and action required' }, { status: 400 });

    // Record interaction
    await base44.entities.LifestyleInteractions.create({
      user_id: user.id,
      item_id,
      action,
      category: category || '',
      source_id: source_id || '',
      acted_at: new Date().toISOString(),
    });

    // Update item engagement score
    if (action === 'like' || action === 'save' || action === 'try_this') {
      const items = await base44.asServiceRole.entities.LifestyleItems.filter({ id: item_id });
      if (items[0]) {
        await base44.asServiceRole.entities.LifestyleItems.update(item_id, {
          engagement_score: (items[0].engagement_score || 0) + 1,
        });
      }
    }

    // Update user lifestyle profile (followed topics, hidden items)
    const profiles = await base44.entities.LifestyleProfile.filter({ user_id: user.id });
    const profile = profiles[0];

    if (action === 'hide' && profile) {
      const hidden = profile.hidden_item_ids ? profile.hidden_item_ids.split(',').filter(Boolean) : [];
      if (!hidden.includes(item_id)) {
        hidden.push(item_id);
        await base44.entities.LifestyleProfile.update(profile.id, {
          hidden_item_ids: hidden.slice(-500).join(','), // cap at 500
        });
      }
    }

    if (action === 'save' && profile) {
      const saved = profile.saved_item_ids ? profile.saved_item_ids.split(',').filter(Boolean) : [];
      if (!saved.includes(item_id)) {
        saved.push(item_id);
        await base44.entities.LifestyleProfile.update(profile.id, {
          saved_item_ids: saved.join(','),
        });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});