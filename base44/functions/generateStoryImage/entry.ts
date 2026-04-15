/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildStoryImagePrompt(phase) {
  const phaseImages = {
    menstrual:  "A serene winter landscape, deep crimson peonies in snow, soft moonlight, watercolour style, no people, peaceful and still",
    follicular: "Fresh spring morning, pale green fern fronds unfurling, soft dew drops, botanical illustration style, no people, hopeful and bright",
    ovulatory:  "Sunlit summer meadow, golden wildflowers in bloom, warm light rays, impressionist style, no people, vibrant and alive",
    luteal:     "Autumn forest path, amber and rust leaves falling, warm cosy light, oil painting style, no people, introspective and warm",
  };
  return phaseImages[phase] || "Abstract soft watercolour circles in pink and lavender, calming wellness aesthetic, no people";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { pack_id, cycle_phase, day_key, user_id } = body;
    if (!pack_id) return Response.json({ error: 'pack_id required' }, { status: 400 });

    const sb = base44.asServiceRole;

    // Check if user account is less than 7 days old (skip for new users)
    const userCreatedDate = new Date(user.created_date || user.created_at || Date.now());
    const daysSinceCreation = Math.floor((Date.now() - userCreatedDate.getTime()) / 86400000);
    if (daysSinceCreation < 7) {
      return Response.json({ skipped: true, reason: 'New user — image generation starts after 7 days' });
    }

    // Check cache first
    const promptHash = `story_${day_key}_${user_id || user.id}`;
    const existingImages = await sb.entities.StoryVisualPool.filter({ prompt_hash: promptHash }).catch(() => []);
    if (existingImages.length > 0) {
      // Already cached — just link to pack
      await sb.entities.StoryPack.update(pack_id, { image_url: existingImages[0].image_url }).catch(() => {});
      return Response.json({ cached: true, image_url: existingImages[0].image_url });
    }

    // Generate image
    const imagePrompt = buildStoryImagePrompt(cycle_phase);
    const imgResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural",
        response_format: "url",
      }),
    });

    const imgData = await imgResponse.json();
    const imageUrl = imgData.data?.[0]?.url;

    if (!imageUrl) {
      return Response.json({ error: 'Image generation failed', details: imgData }, { status: 500 });
    }

    // Cache in StoryVisualPool
    await sb.entities.StoryVisualPool.create({ prompt_hash: promptHash, image_url: imageUrl }).catch(() => {});

    // Link to StoryPack
    await sb.entities.StoryPack.update(pack_id, { image_url: imageUrl }).catch(() => {});

    return Response.json({ image_url: imageUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});