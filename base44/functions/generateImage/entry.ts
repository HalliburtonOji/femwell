import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt, size = '1024x1024', quality = 'standard', cacheKey, style = 'natural' } = await req.json();
    if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

    // Check cache
    if (cacheKey) {
      const cached = await base44.asServiceRole.entities.StoryVisualPool.filter({ prompt_hash: cacheKey });
      if (cached.length > 0 && cached[0].image_url) {
        return Response.json({ image_url: cached[0].image_url, cached: true });
      }
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality,
        style,
        response_format: 'url',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data.error?.message }, { status: 500 });
    }

    const image_url = data.data[0].url;

    if (cacheKey) {
      await base44.asServiceRole.entities.StoryVisualPool.create({
        theme: cacheKey,
        image_url,
        prompt_hash: cacheKey,
        image_prompt: prompt,
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({ image_url, cached: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});