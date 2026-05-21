// ─────────────────────────────────────────────────────────────────────────────
// jessContext — shared helper that builds a short "what's true right now"
// block for any Jess-flavoured InvokeLLM call to prepend to its prompt.
//
// Returns both a structured object (so callers can read individual fields)
// and a pre-formatted `prompt` string ready to splice into a system prompt.
// All entity lookups are best-effort with silent catch — Jess should never
// fail to answer because the context fetch flaked.
// ─────────────────────────────────────────────────────────────────────────────

import { base44 } from "@/api/base44Client";
import { hasAiConsent } from "@/utils/consent";

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

// Sprint C C2 — Default copy shown when consent_ai_processing is false.
// LLM callers should detect `{ blocked: true }` and render this instead
// of invoking the model.
export const AI_BLOCKED_MESSAGE = "Enable AI insights in Settings to let Jess and Astra read your data.";

// Mirrors derivePlannerPhase in PlannerV2Shell.jsx — duplicated here so
// utils/ doesn't take a component dependency.
export function deriveCyclePhase(profile) {
  if (!profile?.last_period_start_date) {
    return { phase: "follicular", dayInCycle: null };
  }
  const cycleLen  = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length    || 5;
  const start     = new Date(profile.last_period_start_date);
  const t         = new Date(); t.setHours(0, 0, 0, 0);
  const startDay  = new Date(start); startDay.setHours(0, 0, 0, 0);
  const raw = Math.floor((t - startDay) / 86400000) + 1;
  const normDay = ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
  let phase;
  if (normDay <= periodLen) phase = "menstrual";
  else if (normDay <= Math.floor(cycleLen * 0.43)) phase = "follicular";
  else if (normDay <= Math.floor(cycleLen * 0.5))  phase = "ovulatory";
  else phase = "luteal";
  return { phase, dayInCycle: normDay };
}

/**
 * Fetch today's mood / energy / symptoms, derive cycle phase, and return
 * a short context object + a `prompt` string ready to prepend to any LLM
 * prompt. Pass `{ user, profile }`. Both may be null — the helper degrades
 * gracefully and still returns a usable string ("User context unavailable").
 */
export async function buildJessContext({ user, profile } = {}) {
  // Sprint C C2 — default-deny AI consent. If the user has not opted in,
  // return a blocked context that callers detect via `blocked: true`.
  if (!hasAiConsent(profile)) {
    return {
      blocked: true,
      reason: "consent_ai_processing is not enabled",
      message: AI_BLOCKED_MESSAGE,
      lifeStage: profile?.life_stage || "reproductive",
      phase: null, dayInCycle: null,
      todayMood: null, todayEnergy: null, todaySymptoms: [],
      prompt: "",
    };
  }

  const lifeStage = profile?.life_stage || "reproductive";
  const { phase, dayInCycle } = deriveCyclePhase(profile);

  let todayMood = null;
  let todayEnergy = null;
  let todaySymptoms = [];

  if (user?.id) {
    const day = todayKey();
    try {
      const [checkins, symptoms] = await Promise.all([
        base44.entities.DailyCheckins
          .filter({ user_id: user.id, date: day }).catch(() => []),
        base44.entities.SymptomLogs
          .filter({ user_id: user.id, date: day }).catch(() => []),
      ]);
      const ci = (checkins || [])[0];
      if (ci) {
        todayMood   = ci.mood   ?? ci.mood_score   ?? null;
        todayEnergy = ci.energy ?? ci.energy_level ?? null;
      }
      todaySymptoms = (symptoms || [])
        .map((s) => s?.symptom_type || s?.symptom_name)
        .filter(Boolean);
    } catch { /* silent */ }
  }

  const lines = [
    `Life stage: ${lifeStage}`,
    `Cycle phase: ${phase}${dayInCycle ? ` (day ${dayInCycle})` : ""}`,
    `Today mood: ${todayMood != null ? `${todayMood}/5` : "not logged"}`,
    `Today energy: ${todayEnergy != null ? `${todayEnergy}/5` : "not logged"}`,
    `Symptoms today: ${todaySymptoms.length ? todaySymptoms.join(", ") : "none logged"}`,
  ];

  const prompt = `USER CONTEXT (today, ${todayKey()}):\n${lines.join("\n")}\n\n`;

  return {
    lifeStage,
    phase,
    dayInCycle,
    todayMood,
    todayEnergy,
    todaySymptoms,
    prompt,
  };
}
