import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { item_id, title, summary, content_type } = await req.json();
  if (!item_id) return Response.json({ error: 'Missing item_id' }, { status: 400 });

  try {
    const isStory = content_type === 'STORY';
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a complete, engaging ${isStory ? 'short story of 700-900 words' : 'article of 500-700 words'} for women. Title: "${title}". Opening: "${summary}". Write the FULL text continuing from where the opening left off. Same voice and style. Return JSON: { body: string }`,
      response_json_schema: {
        type: 'object',
        properties: { body: { type: 'string' } },
      },
    });

    const body = result?.body || '';

    // Persist to DB so next open is instant
    if (body.length > 100) {
      await base44.asServiceRole.entities.LifestyleItems.update(item_id, { lede: body }).catch(() => {});
    }

    return Response.json({ body });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});