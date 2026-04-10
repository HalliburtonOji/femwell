import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const day_key = body.day_key || new Date().toISOString().split('T')[0];
    const force = body.force || false;

    if (!force) {
      const existing = await base44.asServiceRole.entities.DailyPlan.filter({ user_id: user.id, day_key }).catch(() => []);
      if (existing[0]) return Response.json({ success: true, plan: existing[0] });
    }

    const [profiles, checkins, programs] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id }),
      base44.asServiceRole.entities.DailyCheckins.filter({ user_id: user.id, date: day_key }),
      base44.asServiceRole.entities.UserPrograms.filter({ user_id: user.id }),
    ]);

    const profile = profiles[0];
    const checkin = checkins[0];
    const activeProgram = programs.find(p => p.status === 'active' || p.is_saved);

    const context = [
      profile?.goals?.length ? `Goals: ${profile.goals.join(', ')}` : '',
      profile?.life_stage && profile.life_stage !== 'none' ? `Life stage: ${profile.life_stage}` : '',
      checkin ? `Mood: ${checkin.mood}/5, Energy: ${checkin.energy}/5, Stress: ${checkin.stress}/5` : '',
      activeProgram ? `Active program day ${activeProgram.current_day || 1}` : '',
    ].filter(Boolean).join('. ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a warm, evidence-based wellness planner for women. Generate a concise personalised daily plan. Be specific, not generic. Return JSON only.' },
        { role: 'user', content: `Context: ${context || 'General wellness-focused woman'}\n\nReturn JSON with exactly these keys:\n- focus_for_today: one compelling sentence theme for today (max 60 chars)\n- session_recommendation: one specific session suggestion (e.g. "10-min breathwork for stress relief")\n- nutrition_nudge: one specific nutrition tip for today\n- mental_tool: one short self-care or mindset step\n- lifestyle_suggestion: one specific reading or content topic suggestion` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const plan_json = JSON.parse(response.choices[0].message.content);

    const existing = await base44.asServiceRole.entities.DailyPlan.filter({ user_id: user.id, day_key }).catch(() => []);
    for (const e of existing) await base44.asServiceRole.entities.DailyPlan.delete(e.id).catch(() => {});

    const saved = await base44.asServiceRole.entities.DailyPlan.create({
      user_id: user.id, day_key,
      plan_json: JSON.stringify(plan_json),
      created_at: new Date().toISOString(),
    });

    return Response.json({ success: true, plan: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});