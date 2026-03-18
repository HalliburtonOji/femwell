import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const page = payload.page || 0;
    const pageSize = payload.page_size || 15;

    const isAuthenticated = await base44.auth.isAuthenticated().catch(() => false);
    const user = isAuthenticated ? await base44.auth.me().catch(() => null) : null;

    const clipItems = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'PUBLISHED' }, '-published_at', 160);
    let preferences = null;
    let profile = null;
    let interactions = [];

    if (user) {
      const [prefs, profiles, allInteractions] = await Promise.all([
        base44.entities.UserPreferences.filter({ user_id: user.id }),
        base44.entities.LifestyleProfile.filter({ user_id: user.id }),
        base44.entities.LifestyleInteractions.filter({ user_id: user.id }, '-created_date', 200),
      ]);
      preferences = prefs[0] || null;
      profile = profiles[0] || null;
      interactions = allInteractions;
    }

    const interests = new Set(preferences?.lifestyle_interests || []);
    const blockedCategories = new Set(safeList(profile?.blocked_categories));
    const hiddenIds = new Set((profile?.hidden_item_ids || '').split(',').filter(Boolean));
    const preferredProviders = new Set(
      interactions
        .filter((item) => item.action === 'like' || item.action === 'save' || item.action === 'open')
        .map((item) => item.source_id)
        .filter(Boolean)
    );

    const scored = clipItems
      .filter((item) => ['VIDEO', 'TIKTOK', 'INSTAGRAM', 'CLIP'].includes(item.media_type))
      .filter((item) => !blockedCategories.has(item.category) && !hiddenIds.has(item.id))
      .map((item) => {
        let score = 45 + Math.min(item.engagement_score || 0, 25);
        if (interests.has(item.category)) score += 18;
        if (preferredProviders.has(item.source_id)) score += 10;
        if (item.is_trending) score += 12;
        if (item.provider === 'YOUTUBE') score += 4;
        return { ...item, _score: score };
      })
      .sort((left, right) => right._score - left._score);

    const start = page * pageSize;
    return Response.json({
      items: scored.slice(start, start + pageSize),
      has_more: start + pageSize < scored.length,
      total: scored.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});