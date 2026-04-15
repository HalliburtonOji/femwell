/* eslint-disable no-undef */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  const client = createClientFromRequest(req);
  const today = new Date().toISOString().split("T")[0];

  const profiles = await client.asServiceRole.entities.UserProfile.list("-created_date", 200);

  const SYMPTOM_FIELDS = ["pain", "headache", "cramps", "bloating", "breast_tenderness"];
  const PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];

  const suggestions = {
    headache: "Staying well-hydrated and reducing caffeine may help.",
    cramps: "Magnesium, heat therapy, and gentle movement are commonly helpful.",
    bloating: "Reducing salt and increasing fibre in the days before this phase may ease this.",
    pain: "Omega-3s and anti-inflammatory foods like ginger may reduce pain.",
    breast_tenderness: "Reducing caffeine and salt in your luteal phase may help with tenderness.",
  };

  function getPhaseForDate(dateStr, lastPeriodStart, cycleLen) {
    const d = new Date(dateStr);
    const last = new Date(lastPeriodStart);
    const diff = Math.floor((d - last) / 86400000);
    if (diff < 0) return null;
    const cycleDay = (diff % cycleLen) + 1;
    if (cycleDay <= 5) return "menstrual";
    if (cycleDay <= 13) return "follicular";
    if (cycleDay <= 16) return "ovulatory";
    return "luteal";
  }

  let insightsCreated = 0;

  for (const profile of profiles) {
    if (!profile.last_period_start_date || !profile.cycle_avg_length) continue;

    const checkins = await client.asServiceRole.entities.DailyCheckins.filter(
      { user_id: profile.user_id }, "-date", 60
    );

    if (checkins.length < 10) continue;

    const cycleLen = profile.cycle_avg_length || 28;

    // Build phase → symptom frequency map
    const phaseSymptoms = { menstrual: {}, follicular: {}, ovulatory: {}, luteal: {} };

    for (const checkin of checkins) {
      const phase = getPhaseForDate(checkin.date, profile.last_period_start_date, cycleLen);
      if (!phase) continue;
      for (const field of SYMPTOM_FIELDS) {
        if (checkin[field] != null && checkin[field] >= 3) {
          phaseSymptoms[phase][field] = (phaseSymptoms[phase][field] || 0) + 1;
        }
      }
    }

    for (const phase of PHASES) {
      const symptoms = phaseSymptoms[phase];
      for (const [symptom, count] of Object.entries(symptoms)) {
        if (count < 3) continue;

        const label = symptom.replace(/_/g, " ");
        const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1);

        // Deduplicate
        const existing = await client.asServiceRole.entities.InsightCards.filter({
          user_id: profile.user_id,
          source: "symptom_pattern",
          cycle_phase: phase,
        }, "-created_date", 10);

        const alreadyExists = existing.some(e =>
          e.insight_text && e.insight_text.includes(label)
        );
        if (alreadyExists) continue;

        await client.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          type: "CYCLE_INSIGHT",
          source: "symptom_pattern",
          title: `${label.charAt(0).toUpperCase() + label.slice(1)} pattern in ${phaseLabel}`,
          insight_text: `You've logged ${label} multiple times during your ${phase} phase. This is a recognised pattern for many women. ${suggestions[symptom] || "Tracking this over time helps you anticipate and prepare."}`,
          cycle_phase: phase,
          recommended_action_route: "/Pulse",
          insight_date: today,
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        });

        insightsCreated++;
      }
    }
  }

  return Response.json({ ok: true, insights_created: insightsCreated, profiles_scanned: profiles.length });
});