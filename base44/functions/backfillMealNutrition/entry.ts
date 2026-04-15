/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// One-time backfill: fix existing MealLog records with broken nutritional_summary
// and patch null-type InsightCards from daily_phase_generator

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const sb = base44.asServiceRole;
    const results = { mealLogs: 0, mealItems: 0, insightCards: 0 };

    // ── FIX 1D: Backfill MealLog nutritional_summary ─────────────────────
    const mealLogs = await sb.entities.MealLog.list('-created_date', 200);
    for (const log of mealLogs) {
      if (!log.ai_analysis) continue;
      let analysis;
      try { analysis = typeof log.ai_analysis === 'string' ? JSON.parse(log.ai_analysis) : log.ai_analysis; } catch { continue; }
      const items = analysis.items || [];
      if (items.length === 0) continue;

      const summary = {
        calories: Math.round(items.reduce((s, i) => s + (i.calories || 0), 0)),
        protein_g: Math.round(items.reduce((s, i) => s + (i.protein_g || 0), 0)),
        carbs_g: Math.round(items.reduce((s, i) => s + (i.carbs_g || 0), 0)),
        fat_g: Math.round(items.reduce((s, i) => s + (i.fat_g || 0), 0)),
        fiber_g: Math.round(items.reduce((s, i) => s + (i.fiber_g || 0), 0)),
      };
      analysis.nutritional_summary = summary;
      await sb.entities.MealLog.update(log.id, { ai_analysis: JSON.stringify(analysis) });
      results.mealLogs++;

      // Write MealItems if not already present
      const existing = await sb.entities.MealItems.filter({ meal_log_id: log.id });
      if (existing.length === 0) {
        for (const item of items) {
          await sb.entities.MealItems.create({
            meal_log_id: log.id,
            name: item.name,
            quantity_text: item.quantity_text || '',
            calories: item.calories || 0,
            protein_g: item.protein_g || 0,
            carbs_g: item.carbs_g || 0,
            fat_g: item.fat_g || 0,
            fiber_g: item.fiber_g || 0,
            source: 'ai',
          }).catch(() => {});
          results.mealItems++;
        }
      }
    }

    // ── FIX 4D: Patch null-type InsightCards from daily_phase_generator ───
    const cards = await sb.entities.InsightCards.filter({ source: 'daily_phase_generator' });
    for (const card of cards) {
      if (card.type) continue;
      await sb.entities.InsightCards.update(card.id, {
        type: 'PHASE_INSIGHT',
        cycle_phase: card.cycle_phase || 'any',
      });
      results.insightCards++;
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});