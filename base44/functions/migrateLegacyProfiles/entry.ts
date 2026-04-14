/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function safeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
}

function safeJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // ── Migrate LifestyleProfile ──────────────────────────────────────────────
    const profiles = await base44.asServiceRole.entities.LifestyleProfile.list();
    let lpMigrated = 0;
    for (const p of profiles) {
      const needsMigration =
        typeof p.followed_topics === 'string' ||
        typeof p.followed_sources === 'string' ||
        typeof p.hidden_item_ids === 'string' ||
        typeof p.saved_item_ids === 'string' ||
        typeof p.last_seen_item_ids === 'string' ||
        typeof p.category_weights === 'string' ||
        p.category_weights_json;

      if (!needsMigration) continue;

      const weights = {
        ...safeJson(p.category_weights_json, {}),
        ...(typeof p.category_weights === 'object' && !Array.isArray(p.category_weights) ? p.category_weights : {}),
      };

      await base44.asServiceRole.entities.LifestyleProfile.update(p.id, {
        followed_topics: safeList(p.followed_topics),
        followed_sources: safeList(p.followed_sources),
        hidden_item_ids: safeList(p.hidden_item_ids),
        saved_item_ids: safeList(p.saved_item_ids),
        last_seen_item_ids: safeList(p.last_seen_item_ids),
        category_weights: weights,
        updated_at: new Date().toISOString(),
      });
      lpMigrated++;
    }

    // ── Migrate MealPlans ─────────────────────────────────────────────────────
    const plans = await base44.asServiceRole.entities.MealPlans.list();
    let mpMigrated = 0;
    for (const plan of plans) {
      if (!plan.plan_json) continue;
      let planJson = {};
      try { planJson = JSON.parse(plan.plan_json); } catch { continue; }
      const dayMap = {};
      for (const [key, meals] of Object.entries(planJson)) {
        const match = key.match(/^(\d+)_(.+)$/);
        if (!match) continue;
        const dayIdx = parseInt(match[1], 10);
        const mealType = match[2].toLowerCase();
        if (!dayMap[dayIdx]) dayMap[dayIdx] = { day: dayIdx, breakfast: [], lunch: [], dinner: [], snack: [] };
        if (['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
          dayMap[dayIdx][mealType] = Array.isArray(meals) ? meals : [String(meals)];
        }
      }
      const plan_days = Object.values(dayMap).sort((a, b) => a.day - b.day);
      await base44.asServiceRole.entities.MealPlans.update(plan.id, {
        plan_days,
        updated_at: new Date().toISOString(),
      });
      mpMigrated++;
    }

    // ── Migrate ContentItems ──────────────────────────────────────────────────
    const contentItems = await base44.asServiceRole.entities.ContentItems.list();
    let ciMigrated = 0;
    for (const ci of contentItems) {
      const updates = {};

      // Fix tags: string → array
      if (typeof ci.tags === 'string') {
        updates.tags = ci.tags ? ci.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }

      // Fix access_tier from is_premium / premium_tier
      if (!ci.access_tier || ci.access_tier === 'free') {
        if (ci.is_premium === true) {
          if (ci.premium_tier === 'PRO') updates.access_tier = 'pro';
          else updates.access_tier = 'plus';
        }
      }

      if (Object.keys(updates).length === 0) continue;
      updates.updated_at = new Date().toISOString();
      await base44.asServiceRole.entities.ContentItems.update(ci.id, updates);
      ciMigrated++;
    }

    // ── Migrate LifestyleItems ────────────────────────────────────────────────
    const lifestyleItems = await base44.asServiceRole.entities.LifestyleItems.list('-ingested_at', 2000);
    let liMigrated = 0;
    for (const li of lifestyleItems) {
      const updates = {};

      // Fix tags: string → array
      if (typeof li.tags === 'string') {
        updates.tags = li.tags ? li.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }

      // Fix takeaways: populate from takeaway_1/2/3 if takeaways is empty
      if ((!Array.isArray(li.takeaways) || li.takeaways.length === 0) && (li.takeaway_1 || li.takeaway_2 || li.takeaway_3)) {
        updates.takeaways = [li.takeaway_1, li.takeaway_2, li.takeaway_3].filter(Boolean);
      }

      // Fix published_at: parse pub_date if published_at is missing
      if (!li.published_at && li.pub_date) {
        try {
          updates.published_at = new Date(li.pub_date).toISOString();
        } catch {}
      }

      // Fix category: "Womens Health" → "Women's Health"
      if (li.category === "Womens Health") {
        updates.category = "Women's Health";
      }

      if (Object.keys(updates).length === 0) continue;
      updates.updated_at = new Date().toISOString();
      await base44.asServiceRole.entities.LifestyleItems.update(li.id, updates);
      liMigrated++;
    }

    return Response.json({ ok: true, lpMigrated, mpMigrated, ciMigrated, liMigrated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});