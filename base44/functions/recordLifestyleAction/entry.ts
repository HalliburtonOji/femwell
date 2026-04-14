import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function asList(value) {
  if (Array.isArray(value)) return value;
  return [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_id, action, category, source_id } = await req.json();
    if (!item_id || !action) return Response.json({ error: 'item_id and action required' }, { status: 400 });

    await base44.entities.LifestyleInteractions.create({
      user_id: user.id,
      item_id,
      action,
      category: category || '',
      source_id: source_id || '',
      acted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    const profiles = await base44.entities.LifestyleProfile.filter({ user_id: user.id });
    const profile = profiles[0] || await base44.entities.LifestyleProfile.create({ user_id: user.id });

    const hiddenIds = asList(profile.hidden_item_ids);
    const savedIds = asList(profile.saved_item_ids);
    const blockedCategories = asList(profile.blocked_categories);
    const blockedSources = asList(profile.blocked_sources);
    const categoryWeights = (profile.category_weights && typeof profile.category_weights === 'object') ? { ...profile.category_weights } : {};

    if (action === 'like' || action === 'save' || action === 'try_this' || action === 'open') {
      categoryWeights[category] = Number(categoryWeights[category] || 0) + 1;
    }

    if (action === 'dislike' || action === 'hide') {
      categoryWeights[category] = Number(categoryWeights[category] || 0) - 2;
    }

    if (action === 'hide' && !hiddenIds.includes(item_id)) hiddenIds.push(item_id);
    if (action === 'save' && !savedIds.includes(item_id)) savedIds.push(item_id);
    if (action === 'hide' && category && Number(categoryWeights[category] || 0) <= -4 && !blockedCategories.includes(category)) blockedCategories.push(category);
    if (action === 'hide' && source_id && !blockedSources.includes(source_id)) blockedSources.push(source_id);

    await base44.entities.LifestyleProfile.update(profile.id, {
      hidden_item_ids: hiddenIds.slice(-500),
      saved_item_ids: savedIds.slice(-500),
      category_weights: categoryWeights,
      blocked_categories: blockedCategories.slice(-30),
      blocked_sources: blockedSources.slice(-50),
      updated_at: new Date().toISOString(),
    });

    const items = await base44.asServiceRole.entities.LifestyleItems.filter({ id: item_id });
    if (items[0]) {
      const currentScore = Number(items[0].engagement_score || 0);
      const nextScore = action === 'like' || action === 'save' || action === 'try_this'
        ? currentScore + 2
        : action === 'open' || action === 'listen'
          ? currentScore + 1
          : Math.max(currentScore - 1, 0);
      await base44.asServiceRole.entities.LifestyleItems.update(item_id, {
        engagement_score: nextScore,
        is_trending: nextScore >= 8,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});