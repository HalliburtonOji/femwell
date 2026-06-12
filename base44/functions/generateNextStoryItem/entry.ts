import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VALID_ROUTE_KEYS = [
  'Today','Nutrition','Journal','Lifestyle','Programs','Explore',
  'SkinHair','Pulse','LifeStageCare','Assistant','NutritionHydration',
  'LifestyleFiction','LifestyleBooks'
];

const THEME_PROMPTS = {
  calm:          "Serene soft-focus botanical scene, pastel pink and sage greens, morning light, minimal, elegant",
  energy:        "Vibrant sunrise over hills, warm amber tones, dynamic composition, energising and bright",
  relationships: "Two silhouettes in warm golden light, soft bokeh, intimate and tender atmosphere",
  nutrition:     "Beautiful flat-lay of colourful whole foods on marble, pastel light, artful composition",
  cycle:         "Abstract moon phases in gradient purples and rose, celestial feminine energy, minimal",
  skin:          "Close macro of dewy petal or skin texture, blush tones, soft studio light",
  growth:        "Tall tree in misty forest, light filtering through canopy, aspirational and calm",
  sleep:         "Moonlit bedroom interior, deep indigo and lavender tones, peaceful and restful",
};

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

    const body = await req.json().catch(() => ({}));
    const { pack_id } = body;
    if (!pack_id) return Response.json({ error: 'pack_id required' }, { status: 400 });

    // Find first pending item in this pack
    const items = await withTimeout(base44.entities.StoryItem.filter({ pack_id }), 2500, 'read').catch(() => []);
    const pendingItem = items.sort((a, b) => a.slot_index - b.slot_index).find(i => i.item_status === 'PENDING');
    if (!pendingItem) return Response.json({ done: true });

    // Build personalization context
    const today = new Date().toISOString().split('T')[0];
    const [profiles, checkins, userPrograms] = await Promise.all([
      withTimeout(base44.entities.UserProfile.filter({ user_id: user.id }), 2500, 'read').catch(() => []),
      withTimeout(base44.entities.DailyCheckins.filter({ user_id: user.id, date: today }), 2500, 'read').catch(() => []),
      withTimeout(base44.entities.UserPrograms.filter({ user_id: user.id }), 2500, 'read').catch(() => []),
    ]);

    const profile = profiles[0] || {};
    const checkin = checkins[0];
    const activeProgram = userPrograms.find(p => p.status === 'active' || p.is_saved);

    const ctx = {
      goals: (profile.goals || []).join(', ') || 'general wellness',
      life_stage: profile.life_stage || 'none',
      mood: checkin?.mood || null,
      energy: checkin?.energy || null,
      active_program: activeProgram ? activeProgram.program_key : null,
      slot: pendingItem.slot_index,
    };

    // Generate story copy
    const themes = ['calm', 'energy', 'relationships', 'nutrition', 'cycle', 'skin', 'growth', 'sleep'];
    const theme = themes[(pendingItem.slot_index - 1) % themes.length];

    const copy = await withTimeout(base44.integrations.Core.InvokeLLM({
      prompt: `You are creating a daily wellness story card for a women's wellness app.
Context: ${JSON.stringify(ctx)}
Theme: ${theme}
Slot: ${pendingItem.slot_index} of 5

Create a short, inspiring story card. Return JSON only.
Rules: No emoji. Max 50 chars per text field. route_key must be one of: ${VALID_ROUTE_KEYS.join(', ')}.
{
  "title": "short inspiring title (4-6 words)",
  "body_line_1": "first line (max 50 chars)",
  "body_line_2": "second line (max 50 chars)",
  "cta_label": "CTA button text (2-4 words)",
  "route_key": "one of the valid route keys above"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body_line_1: { type: 'string' },
          body_line_2: { type: 'string' },
          cta_label: { type: 'string' },
          route_key: { type: 'string' },
        },
        required: ['title', 'body_line_1', 'body_line_2', 'cta_label', 'route_key'],
      },
    }), 20000, 'llm');

    // Validate route_key
    const routeKey = VALID_ROUTE_KEYS.includes(copy.route_key) ? copy.route_key : 'Today';

    // Visual: check pool first
    const pool = await withTimeout(base44.asServiceRole.entities.StoryVisualPool.filter({ theme, is_active: true }), 2500, 'read').catch(() => []);
    let imageUrl = null;
    let imagePrompt = THEME_PROMPTS[theme] || 'Elegant wellness lifestyle photography, soft natural light';

    if (pool.length > 0) {
      // Pick a random one from the pool
      imageUrl = pool[Math.floor(Math.random() * pool.length)].image_url;
    } else {
      // Generate new image and add to pool
      const imgResult = await withTimeout(base44.integrations.Core.GenerateImage({ prompt: imagePrompt }), 20000, 'gen');
      imageUrl = imgResult?.url || null;
      if (imageUrl) {
        await withTimeout(base44.asServiceRole.entities.StoryVisualPool.create({
          theme,
          image_url: imageUrl,
          image_prompt: imagePrompt,
          created_at: new Date().toISOString(),
          is_active: true,
        }), 6000, 'write').catch(() => {});
      }
    }

    // Save item
    await withTimeout(base44.entities.StoryItem.update(pendingItem.id, {
      title: copy.title,
      body_line_1: copy.body_line_1,
      body_line_2: copy.body_line_2,
      cta_label: copy.cta_label,
      route_key: routeKey,
      theme,
      image_url: imageUrl,
      image_prompt: imagePrompt,
      item_status: 'DONE',
      generated_at: new Date().toISOString(),
    }), 6000, 'write').catch(() => null);

    // Check if pack is now complete
    const allItems = await withTimeout(base44.entities.StoryItem.filter({ pack_id: pendingItem.pack_id }), 2500, 'read').catch(() => []);
    const allDone = allItems.every(i => i.item_status === 'DONE');
    if (allDone) {
      await withTimeout(base44.entities.StoryPack.update(pendingItem.pack_id, {
        status: 'READY',
        updated_at: new Date().toISOString(),
      }), 6000, 'write').catch(() => null);
    }

    return Response.json({ ok: true, slot: pendingItem.slot_index });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});