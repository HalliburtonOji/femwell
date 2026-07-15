import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    // `phase` is an OPTIONAL soft ranking signal — the CLIENT sends only the derived cycle-phase
    // label (e.g. "luteal"); no symptom/journal/cycle-day data is read or exposed here. Used only
    // to gently boost content already tagged for that phase (privacy-safe personalisation).
    const { mode = 'for_you', page = 0, page_size = 15, phase = '' } = body;

    // Get user lifestyle profile for personalization
    const [profiles, interactions] = await Promise.all([
      base44.entities.LifestyleProfile.filter({ user_id: user.id }),
      base44.entities.LifestyleInteractions.filter({ user_id: user.id }, '-acted_at', 200),
    ]);

    const profile = profiles[0] || {};
    const followedTopics = Array.isArray(profile.followed_topics) ? profile.followed_topics : [];
    const followedSources = Array.isArray(profile.followed_sources) ? profile.followed_sources : [];
    const hiddenIds = Array.isArray(profile.hidden_item_ids) ? profile.hidden_item_ids : [];

    // Build category weights from interactions
    const catWeights = {};
    for (const i of interactions) {
      if (!i.category) continue;
      if (i.action === 'like' || i.action === 'save' || i.action === 'try_this') {
        catWeights[i.category] = (catWeights[i.category] || 0) + 1;
      } else if (i.action === 'dislike' || i.action === 'hide') {
        catWeights[i.category] = (catWeights[i.category] || 0) - 2;
      }
    }

    // Build liked/hidden item sets
    const likedItemIds = new Set(interactions.filter(i => i.action === 'like' || i.action === 'save').map(i => i.item_id));
    const hiddenItemIds = new Set([...hiddenIds, ...interactions.filter(i => i.action === 'hide').map(i => i.item_id)]);

    // Fetch items
    let items;
    if (mode === 'trending') {
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'PUBLISHED', is_trending: true }, '-published_at', 50);
      if (items.length < 10) {
        const extra = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'PUBLISHED' }, '-engagement_score', 30);
        items = [...items, ...extra.filter(e => !items.find(i => i.id === e.id))].slice(0, 50);
      }
    } else if (mode === 'following') {
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'PUBLISHED' }, '-published_at', 100);
      items = items.filter(item =>
        followedTopics.includes(item.category) || followedSources.includes(item.source_id)
      );
    } else {
      // For You - fetch recent published items
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'PUBLISHED' }, '-published_at', 100);
    }

    // Filter hidden
    items = items.filter(item => !hiddenItemIds.has(item.id));

    // Score items
    const now = Date.now();
    const scored = items.map(item => {
      let score = 50;

      // Freshness (last 48h = +30, last week = +15)
      const age = now - new Date(item.published_at || item.ingested_at || 0).getTime();
      const ageHours = age / 3600000;
      if (ageHours < 48) score += 30;
      else if (ageHours < 168) score += 15;
      else if (ageHours < 720) score += 5;

      // User interest in category
      score += (catWeights[item.category] || 0) * 5;

      // Gentle cycle-phase fit — boost content already tagged for her current phase (soft, optional).
      if (phase && Array.isArray(item.phase_tags) && item.phase_tags.includes(phase)) score += 8;

      // Editor pick boost
      if (item.is_editor_pick) score += 20;

      // Trending boost
      if (item.is_trending) score += 10;

      // Engagement score
      score += Math.min((item.engagement_score || 0) * 2, 20);

      // Repetition penalty — reduce if same category appears many times (handled below)
      return { ...item, _score: score };
    });

    // Sort by score desc
    scored.sort((a, b) => b._score - a._score);

    // Diversity: prevent >3 consecutive same-category items
    const diversified = [];
    const catCounts = {};
    for (const item of scored) {
      const cat = item.category;
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      if (catCounts[cat] > 4) {
        diversified.push({ ...item, _score: item._score - 15 });
      } else {
        diversified.push(item);
      }
    }
    diversified.sort((a, b) => b._score - a._score);

    // Paginate
    const start = page * page_size;
    const pageItems = diversified.slice(start, start + page_size);

    // Get editor pick separately for pinned card
    const editorPick = items.find(i => i.is_editor_pick) || null;

    return Response.json({
      items: pageItems,
      editor_pick: page === 0 ? editorPick : null,
      has_more: start + page_size < diversified.length,
      total: diversified.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});