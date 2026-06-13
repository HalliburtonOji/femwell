/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

// Photo meal logging — uses the SAME OpenAI key as analyzeMeal (no new key).
// gpt-4o-mini is multimodal/vision-capable, so we pass the meal photo as an
// image_url and get back the same editable-draft JSON shape analyzeMeal returns.
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

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
    let user;
    try {
      user = await withTimeout(base44.auth.me(), 5000, 'auth');
    } catch {
      return Response.json({ error: 'Auth unavailable', analysis_unavailable: true }, { status: 503 });
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await withTimeout(req.json(), 4000, 'parse').catch(() => null);
    if (!body) return Response.json({ error: 'Bad request', analysis_unavailable: true }, { status: 400 });

    const { image_base64, cycle_phase, wellness_goal, meal_log_id } = body;
    if (!image_base64) return Response.json({ error: 'image_base64 required' }, { status: 400 });

    // Accept either a full data URL or raw base64; normalise to a data URL.
    const imageUrl = String(image_base64).startsWith('data:')
      ? String(image_base64)
      : `data:image/jpeg;base64,${image_base64}`;

    // Clean fast-degrade payload (same convention as analyzeMeal) — returned 200
    // whenever the vision call is slow or can't read the photo, so the client
    // always gets a parseable response and can show a tidy "couldn't read it" state.
    const UNAVAILABLE = {
      summary: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
      items: [], smart_swaps: [], analysis_unavailable: true,
    };

    let data;
    try {
      const response = await withTimeout(openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a friendly, supportive nutrition assistant for a women's wellness app.
Look at the meal photo and estimate its foods and macros as a warm, NON-diagnostic draft.
Never make medical claims. These are gentle estimates the user will edit — be reasonable, not precise.
Return valid JSON only.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Estimate the meal in this photo${cycle_phase ? ` (the user is in the ${cycle_phase} phase)` : ''}${wellness_goal ? `, wellness goal: ${wellness_goal}` : ''}.
Return this exact JSON:
{
  "summary": { "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 },
  "items": [ { "name": "string", "quantity_text": "string", "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 } ],
  "smart_swaps": ["one brief gentle swap"],
  "photo_confidence": "low|medium|high"
}
Identify up to 5 visible items. summary MUST be the sum of items' macros. All macro fields are integers. If the image is not food or is unreadable, return all-zero summary, empty items, and photo_confidence "low".`,
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }), 25000, 'vision');
      data = JSON.parse(response.choices[0].message.content);
    } catch {
      return Response.json(UNAVAILABLE);
    }

    // Server-side sum recompute so the summary is never out of step with items.
    const items = (data.items || []).slice(0, 5);
    data.items = items;
    data.summary = {
      calories: Math.round(items.reduce((s, i) => s + (i.calories || 0), 0)),
      protein_g: Math.round(items.reduce((s, i) => s + (i.protein_g || 0), 0)),
      carbs_g: Math.round(items.reduce((s, i) => s + (i.carbs_g || 0), 0)),
      fat_g: Math.round(items.reduce((s, i) => s + (i.fat_g || 0), 0)),
      fiber_g: Math.round(items.reduce((s, i) => s + (i.fiber_g || 0), 0)),
    };

    // If a meal_log_id is supplied, persist the item breakdown (same as analyzeMeal).
    if (meal_log_id && items.length > 0) {
      await Promise.all(items.map((item) =>
        withTimeout(base44.asServiceRole.entities.MealItems.create({
          meal_log_id,
          name: item.name,
          quantity_text: item.quantity_text || '',
          calories: item.calories || 0,
          protein_g: item.protein_g || 0,
          carbs_g: item.carbs_g || 0,
          fat_g: item.fat_g || 0,
          fiber_g: item.fiber_g || 0,
          source: 'photo',
        }), 6000, 'write').catch(() => {})
      ));
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
