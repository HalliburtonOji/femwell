import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const currentPage = body.currentPage || 'Today';
    const today = new Date().toISOString().split('T')[0];

    const [profiles, checkins, pregProfiles, pregLogs, contractions, kicks, lifestyle] = await Promise.all([
      base44.entities.UserProfile.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id, date: today }),
      base44.entities.PregnancyProfile.filter({ user_id: user.id }),
      base44.entities.PregnancyDailyLog.filter({ user_id: user.id }, '-date', 5),
      base44.entities.ContractionSession.filter({ user_id: user.id, day_key: today }),
      base44.entities.PregnancyKickSession.filter({ user_id: user.id, day_key: today }),
      base44.entities.LifestyleItems.list('-pub_date', 12),
    ]);

    const profile = profiles[0] || {};
    const latestStory = lifestyle.find((item) => item.content_type === 'STORY' || item.provider === 'FEMWELL_AI');

    const prompt = `You are a suggestion engine for FemWell. Return exactly one smart assistant prompt as JSON.
User profile: ${JSON.stringify(profile)}
Has daily checkin today: ${checkins.length > 0}
Pregnancy profile: ${JSON.stringify(pregProfiles[0] || null)}
Recent pregnancy logs: ${JSON.stringify(pregLogs.slice(0, 3))}
Contractions today: ${contractions.length}
Kicks today: ${kicks.length}
Current page: ${currentPage}
Latest story: ${JSON.stringify(latestStory || null)}

Rules:
- Decide between type question or suggestion.
- Questions should open the assistant conversation.
- Suggestions should open a route or content directly.
- Prefer actionable and timely prompts.
- If no daily log today, quick log is a good option.
- If pregnancy profile exists and no kicks or contractions today, those are good options.
- If there is a strong story match, can suggest opening it.
- action_route must be an in-app route like /Today?open_log=1, /LifeStageCare, /LifestyleDetail?id=123, /Lifestyle, /Nutrition.
- title should be short.
- prompt should be warm and natural.

Return object schema:
{ type: 'question' | 'suggestion', title: string, prompt: string, action_route: string }`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          prompt: { type: 'string' },
          action_route: { type: 'string' }
        },
        required: ['type', 'title', 'prompt', 'action_route']
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});