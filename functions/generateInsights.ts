import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { user_id } = await req.json();
  if (user.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const checkins = await base44.entities.DailyCheckins.filter({ user_id }, '-date', 30);

  if (checkins.length < 3) {
    return Response.json({ message: 'Not enough data', insights: [] });
  }

  const summary = checkins.slice(0, 14).map(c =>
    `Date: ${c.date}, Mood: ${c.mood}/5, Energy: ${c.energy}/5, Stress: ${c.stress}/5, Sleep: ${c.sleep_hours}h`
  ).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a compassionate women\'s health AI. Generate 3 concise wellness insights based on the user\'s logged data. Use pattern/trend/may help phrasing. Never diagnose. Each insight should reference how many days of data it is based on. Return JSON.' },
      { role: 'user', content: `Here is the user's recent wellness data:\n${summary}\n\nReturn JSON: { "insights": [{ "title": "...", "insight_text": "...", "evidence_text": "..." }] }` }
    ],
    response_format: { type: 'json_object' },
  });

  const data = JSON.parse(response.choices[0].message.content);

  for (const insight of data.insights) {
    await base44.entities.InsightCards.create({
      user_id,
      title: insight.title,
      insight_text: insight.insight_text,
      evidence_text: insight.evidence_text,
      date_range: `last_${checkins.length}_days`,
    });
  }

  return Response.json({ insights: data.insights });
});