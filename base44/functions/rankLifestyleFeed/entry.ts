import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CATEGORY_BOOSTS = {
  stress: ['Mental Wellness', 'Lifestyle'],
  sleep: ['Mental Wellness', 'Lifestyle'],
  energy: ['Fitness', 'Food'],
  hormones: ['Womens Health', 'PMS', 'Menopause', 'PCOS'],
};

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function safeJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getRecencyScore(item) {
  const baseDate = item.published_at || item.pub_date || item.ingested_at;
  const hours = (Date.now() - new Date(baseDate || 0).getTime()) / 3600000;
  if (hours < 24) return 22;
  if (hours < 72) return 14;
  if (hours < 168) return 8;
  return 2;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const mode = payload.mode || 'for_you';
    const page = payload.page || 0;
    const pageSize = payload.page_size || 15;

    const isAuthenticated = await base44.auth.isAuthenticated().catch(() => false);
    const user = isAuthenticated ? await base44.auth.me().catch(() => null) : null;

    const allItems = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'PUBLISHED' }, '-published_at', 200);
    const publishedItems = allItems.filter((item) => item.media_type !== 'TIKTOK' && item.media_type !== 'INSTAGRAM' && item.media_type !== 'VIDEO' && item.media_type !== 'CLIP');

    let preferences = null;
    let profile = null;
    let interactions = [];
    let recentCheckins = [];
    let activePrograms = [];
    let programs = [];
    let adviceHistory = [];

    if (user) {
      const [prefs, profiles, allInteractions, checkins, userPrograms, allPrograms, advice] = await Promise.all([
        base44.entities.UserPreferences.filter({ user_id: user.id }),
        base44.entities.LifestyleProfile.filter({ user_id: user.id }),
        base44.entities.LifestyleInteractions.filter({ user_id: user.id }, '-created_date', 300),
        base44.entities.DailyCheckins.filter({ user_id: user.id }, '-date', 14),
        base44.entities.UserPrograms.filter({ user_id: user.id }),
        base44.entities.Programs.list('-created_date', 80),
        base44.entities.AdviceHistory?.filter ? base44.entities.AdviceHistory.filter({ user_id: user.id }, '-created_date', 30) : Promise.resolve([]),
      ]);
      preferences = prefs[0] || null;
      profile = profiles[0] || null;
      interactions = allInteractions;
      recentCheckins = checkins;
      activePrograms = userPrograms.filter((entry) => entry.status === 'active' || entry.is_saved);
      programs = allPrograms;
      adviceHistory = advice || [];
    }

    const blockedCategories = new Set(profile?.blocked_categories || []);
    const blockedSources = new Set(profile?.blocked_sources || []);
    const hiddenIds = new Set(asList(profile?.hidden_item_ids));
    const followedTopics = new Set(asList(profile?.followed_topics));
    const followedSources = new Set(asList(profile?.followed_sources));
    const categoryWeights = safeJson(profile?.category_weights_json || profile?.category_weights, {});
    const interests = new Set(preferences?.lifestyle_interests || []);

    const highStress = recentCheckins.filter((item) => Number(item.stress) >= 4).length >= 2;
    const lowSleep = recentCheckins.filter((item) => Number(item.sleep_quality) <= 2).length >= 2;
    const lowEnergy = recentCheckins.filter((item) => Number(item.energy) <= 2).length >= 2;

    const programCategories = new Set(
      activePrograms
        .map((entry) => programs.find((program) => program.id === entry.program_id))
        .filter(Boolean)
        .flatMap((program) => [program.category, ...(program.goal_tags || [])])
        .filter(Boolean)
    );

    const adviceText = adviceHistory.map((item) => `${item.topic || ''} ${item.question || ''}`.toLowerCase()).join(' ');

    let items = publishedItems.filter((item) => !hiddenIds.has(item.id) && !blockedCategories.has(item.category) && !blockedSources.has(item.source_id));

    if (mode === 'following') {
      items = items.filter((item) => followedTopics.has(item.category) || followedSources.has(item.source_id) || interests.has(item.category));
    }

    if (mode === 'trending') {
      items = items.sort((left, right) => (right.engagement_score || 0) - (left.engagement_score || 0));
    }

    const scored = items.map((item) => {
      let score = 40 + getRecencyScore(item) + Math.min(item.engagement_score || 0, 25);
      if (item.is_editor_pick) score += 10;
      if (item.is_trending) score += 12;
      if (interests.has(item.category)) score += 18;
      if (followedTopics.has(item.category)) score += 15;
      if (followedSources.has(item.source_id)) score += 14;
      if (programCategories.has(item.category)) score += 12;
      score += Number(categoryWeights[item.category] || 0) * 4;

      if (highStress && CATEGORY_BOOSTS.stress.includes(item.category)) score += 10;
      if (lowSleep && CATEGORY_BOOSTS.sleep.includes(item.category)) score += 8;
      if (lowEnergy && CATEGORY_BOOSTS.energy.includes(item.category)) score += 8;
      if (adviceText.includes('pms') && item.category === 'PMS') score += 12;
      if (adviceText.includes('menopause') && item.category === 'Menopause') score += 12;
      if (adviceText.includes('pcos') && item.category === 'PCOS') score += 12;

      return { ...item, _score: score };
    }).sort((left, right) => right._score - left._score);

    const start = page * pageSize;
    const pageItems = scored.slice(start, start + pageSize);
    const editorPick = scored.find((item) => item.is_editor_pick) || scored[0] || null;

    return Response.json({
      items: pageItems,
      editor_pick: page === 0 && mode === 'for_you' ? editorPick : null,
      has_more: start + pageSize < scored.length,
      total: scored.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});