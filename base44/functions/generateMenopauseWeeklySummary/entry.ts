/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

function getMondayWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const week_start = body.week_start || getMondayWeekStart();
    const force = body.force || false;

    if (!force) {
      const existing = await base44.asServiceRole.entities.MenopauseWeeklyReport.filter({ user_id: user.id, week_start }).catch(() => []);
      if (existing[0]) return Response.json({ success: true, report: existing[0] });
    }

    const week_end = new Date(new Date(week_start).getTime() + 7 * 86400000).toISOString().split('T')[0];

    const [symptomEntries, dailyLogs] = await Promise.all([
      base44.asServiceRole.entities.MenopauseSymptomEntry.filter({ user_id: user.id }).catch(() => []),
      base44.asServiceRole.entities.MenopauseDailyLog.filter({ user_id: user.id }).catch(() => []),
    ]);

    const weekSymptoms = symptomEntries.filter(e => e.day_key >= week_start && e.day_key < week_end);
    const weekLogs = dailyLogs.filter(l => l.date >= week_start && l.date < week_end);

    const symptomSummary = weekSymptoms.length
      ? weekSymptoms.map(e => `${e.symptom_type} sev ${e.severity_1_5}/5${e.trigger_tags?.length ? ` (triggers: ${e.trigger_tags.join(', ')})` : ''}`).join('; ')
      : 'no symptom diary entries';

    const logSummary = weekLogs.length
      ? weekLogs.map(l => `hot_flashes:${l.hot_flashes} sleep:${l.sleep_quality} mood:${l.mood} energy:${l.energy}`).join('; ')
      : 'no daily logs';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a supportive menopause health advisor. This is for informational purposes only, not medical advice. Return JSON only.' },
        { role: 'user', content: `Week: ${week_start}\nSymptom diary: ${symptomSummary}\nDaily logs: ${logSummary}\n\nReturn JSON with exactly these keys:\n- top_symptoms: array of top symptom names (max 4)\n- severity_trend: one sentence describing the week\n- suspected_triggers: array of suspected trigger names\n- questions_for_clinician: array of 5 specific questions to ask a doctor\n- self_care_plan: array of 3 specific actionable self-care steps for next week` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    const existing = await base44.asServiceRole.entities.MenopauseWeeklyReport.filter({ user_id: user.id, week_start }).catch(() => []);
    for (const e of existing) await base44.asServiceRole.entities.MenopauseWeeklyReport.delete(e.id).catch(() => {});

    const saved = await base44.asServiceRole.entities.MenopauseWeeklyReport.create({
      user_id: user.id, week_start,
      top_symptoms: parsed.top_symptoms || [],
      severity_trend: parsed.severity_trend || '',
      suspected_triggers: parsed.suspected_triggers || [],
      questions_for_clinician: parsed.questions_for_clinician || [],
      self_care_plan: parsed.self_care_plan || [],
      report_data: parsed,
      created_at: new Date().toISOString(),
    });

    return Response.json({ success: true, report: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});