/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { day_key } = await req.json().catch(() => ({}));
    const dayKey = day_key || new Date().toISOString().split('T')[0];

    // Check cache
    const existing = await withTimeout(base44.asServiceRole.entities.DailyPlan.filter({ user_id: user.id, day_key: dayKey }), 2500, 'read').catch(() => []);
    if (existing[0]) return Response.json(existing[0]);

    // Gather context
    const [profiles, checkins, promptResponses, userPrograms, allPrograms] = await Promise.all([
      withTimeout(base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.DailyCheckins.filter({ user_id: user.id }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.DailyPromptResponse.filter({ user_id: user.id, day_key: dayKey }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.UserPrograms.filter({ user_id: user.id }), 2500, 'read').catch(() => []),
      withTimeout(base44.asServiceRole.entities.Programs.list('-created_date', 50), 2500, 'read').catch(() => []),
    ]);

    const profile = profiles[0] || {};
    const recentCheckin = checkins.sort((a, b) => b.date?.localeCompare(a.date || '') || 0)[0];
    const promptResp = promptResponses[0];
    const activeProgram = userPrograms.find(p => p.status === 'active' || p.is_saved);
    const activeProgramTitle = activeProgram
      ? allPrograms.find(p => p.id === activeProgram.program_id)?.title
      : null;

    const context = [
      `Goals: ${(profile.goals || []).join(', ') || 'general wellness'}`,
      `Life stage: ${profile.life_stage || 'none'}`,
      `Tone preference: ${profile.tone_preference || 'warm'}`,
      recentCheckin ? `Last check-in mood: ${recentCheckin.mood || 3}/5, energy: ${recentCheckin.energy || 3}/5` : '',
      promptResp ? `Today's focus stated by user: "${promptResp.main_focus}", mood ${promptResp.mood}/5, energy ${promptResp.energy}/5` : '',
      activeProgramTitle ? `Active program: ${activeProgramTitle}, Day ${activeProgram.current_day || 1}` : '',
    ].filter(Boolean).join('\n');

    const planJson = await withTimeout(base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a wellness planner for a women's wellness app. Create a concise daily plan for today based on this user context:\n\n${context}\n\nReturn ONLY valid JSON with these fields:\n{\n  "focus_for_today": "1-2 sentence theme for the day",\n  "one_session": "name of one breathwork/meditation/movement session to do",\n  "one_nutrition_nudge": "one specific food/nutrition tip for today",\n  "one_mental_tool_prompt": "one short journaling or mindfulness prompt",\n  "one_lifestyle_card": "one lifestyle area to focus on today"\n}`,
      response_json_schema: {
        type: 'object',
        properties: {
          focus_for_today: { type: 'string' },
          one_session: { type: 'string' },
          one_nutrition_nudge: { type: 'string' },
          one_mental_tool_prompt: { type: 'string' },
          one_lifestyle_card: { type: 'string' },
        },
      },
    }), 20000, 'llm');

    const saved = await withTimeout(base44.asServiceRole.entities.DailyPlan.create({
      user_id: user.id,
      day_key: dayKey,
      focus_for_today: planJson.focus_for_today || '',
      session_recommendation: planJson.one_session || '',
      nutrition_nudge: planJson.one_nutrition_nudge || '',
      mental_tool: planJson.one_mental_tool_prompt || '',
      lifestyle_suggestion: planJson.one_lifestyle_card || '',
      created_at: new Date().toISOString(),
    }), 6000, 'write');

    return Response.json(saved);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});