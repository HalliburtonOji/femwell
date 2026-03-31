import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PHASE_LABELS = {
  menstrual: 'menstrual',
  follicular: 'follicular',
  ovulatory: 'ovulatory',
  luteal: 'luteal',
};

const PHASE_ROUTES = {
  menstrual: '/ContentPlayer?id=69ac3d2217940aebdf578c21',
  follicular: '/ContentPlayer?id=69ac3d2217940aebdf578c22',
  ovulatory: '/ContentPlayer?id=69ac3d2217940aebdf578c23',
  luteal: '/ProgramDetail?key=prog_pms_relief_path',
  any: '/ProgramDetail?key=prog_sleep_reset_rebuilt',
};

function getCycleInfo(profile) {
  const cycleLength = profile.cycle_avg_length || 28;
  const periodLength = profile.period_length || 5;
  if (!profile.last_period_start_date) {
    return { phase: 'any', cycleDay: null };
  }
  const today = new Date();
  const last = new Date(profile.last_period_start_date);
  const daysSince = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;
  if (cycleDay <= periodLength) return { phase: 'menstrual', cycleDay };
  if (cycleDay <= 13) return { phase: 'follicular', cycleDay };
  if (cycleDay <= 16) return { phase: 'ovulatory', cycleDay };
  return { phase: 'luteal', cycleDay };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0];
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    let processed = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;
      if (!userId) continue;
      const existing = await base44.asServiceRole.entities.InsightCards.filter({ user_id: userId, insight_date: today, source: 'daily_phase_generator' });
      if (existing.length > 0) continue;

      const cycle = getCycleInfo(profile);
      const phaseLabel = PHASE_LABELS[cycle.phase] || 'any';
      const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are generating one short cycle-aware daily insight card for a women's wellness app. Current phase: ${phaseLabel}. Return JSON with keys title and insight_text only. Title must be short, specific, and phase-aware. insight_text must be exactly 2 sentences and reference the phase naturally. Keep it supportive and practical.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            insight_text: { type: 'string' }
          },
          required: ['title', 'insight_text']
        }
      });

      await base44.asServiceRole.entities.InsightCards.create({
        user_id: userId,
        title: ai.title,
        insight_text: ai.insight_text,
        cycle_phase: phaseLabel,
        recommended_action_route: PHASE_ROUTES[cycle.phase] || PHASE_ROUTES.any,
        confidence: 0.85,
        insight_date: today,
        source: 'daily_phase_generator',
        is_read: false,
      });

      processed += 1;
    }

    return Response.json({ success: true, processed, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});