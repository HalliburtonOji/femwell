import { base44 } from "@/api/base44Client";

/**
 * Runs one-time-per-user nutrition migrations on first meal-write.
 * Idempotent — guarded by UserProfile flags.
 *
 * Migrations:
 *   1. meal_score_migrated_v1 — doubles any meal_score <=5 on last 20 MealLog
 *      rows so the scale is 1–10 everywhere.
 *   2. ai_analysis_migrated_v1 — parses legacy string ai_analysis into the new
 *      object shape, preserving raw string in ai_analysis_legacy.
 *
 * Best-effort: swallows per-row errors; always updates the guard flags so we
 * don't retry forever.
 */
export async function runNutritionMigrationsIfNeeded(user, profile) {
  if (!user?.id || !profile?.id) return;

  const needsScoreMigration = !profile.meal_score_migrated_v1;
  const needsAiMigration = !profile.ai_analysis_migrated_v1;
  if (!needsScoreMigration && !needsAiMigration) return;

  // Pull the last 20 logs once for both migrations.
  let recent = [];
  try {
    recent = await base44.entities.MealLog.filter(
      { user_id: user.id },
      "-created_date",
      20
    );
  } catch {
    return;
  }

  // ── Migration 1: meal_score normalization (<=5 → double it) ──────────────
  if (needsScoreMigration) {
    const updates = [];
    for (const log of recent) {
      const score = Number(log.meal_score);
      if (Number.isFinite(score) && score > 0 && score <= 5) {
        updates.push(
          base44.entities.MealLog.update(log.id, {
            meal_score: Math.min(10, Math.round(score * 2)),
          }).catch(() => {})
        );
      }
    }
    if (updates.length) await Promise.all(updates);
  }

  // ── Migration 2: ai_analysis string → object ─────────────────────────────
  if (needsAiMigration) {
    const updates = [];
    for (const log of recent) {
      const raw = log.ai_analysis;
      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          // Preserve raw in legacy field before overwriting.
          updates.push(
            base44.entities.MealLog.update(log.id, {
              ai_analysis: parsed,
              ai_analysis_legacy: raw,
            }).catch(() => {})
          );
        } catch {
          /* leave as-is */
        }
      }
    }
    if (updates.length) await Promise.all(updates);
  }

  // Mark both flags so this never runs again for this user.
  try {
    await base44.entities.UserProfile.update(profile.id, {
      meal_score_migrated_v1: true,
      ai_analysis_migrated_v1: true,
    });
  } catch {
    /* ignore */
  }
}