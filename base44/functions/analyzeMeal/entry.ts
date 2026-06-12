/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

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
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      raw_text,
      cycle_phase,
      energy_level,
      digestion_score,
      wellness_goal,
      prompt_append,
      meal_log_id,
      short_input,
      excluded_swaps,
    } = body;

    if (!raw_text) return Response.json({ error: 'raw_text required' }, { status: 400 });

    // Resolve phase if not provided
    let resolvedPhase = cycle_phase || null;
    if (!resolvedPhase) {
      try {
        const phases = await withTimeout(base44.asServiceRole.entities.PhaseHistory.filter({ user_id: user.id }), 2500, 'read').catch(() => []);
        const latest = phases.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
        resolvedPhase = latest?.phase || null;
      } catch {}
    }

    const phaseContext = {
      menstrual: 'Iron-rich foods are helpful. Energy is lower — warming, nourishing meals support the body.',
      follicular: 'Rising estrogen supports more carbs for energy. Lighter, vibrant foods work well.',
      ovulatory: 'Peak energy. Lighter meals. Zinc and antioxidants are beneficial.',
      luteal: 'Slightly higher calorie needs. Magnesium, B6, and complex carbs help with PMS.',
    };

    const phaseInstruction = resolvedPhase && phaseContext[resolvedPhase]
      ? `\n\nCycle context: ${resolvedPhase} phase — ${phaseContext[resolvedPhase]} Include one phase-specific suggestion. Never be prescriptive.`
      : '';

    const swapExclusionNote = Array.isArray(excluded_swaps) && excluded_swaps.length > 0
      ? `\n\nDo NOT repeat any of these recent smart_swaps (user has seen them): ${excluded_swaps.slice(0, 20).join('; ')}.`
      : '';

    // ── Short-input quality guard: compact output only ────────────────────
    if (short_input) {
      const compactResponse = await withTimeout(openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a concise nutrition assistant. Return valid JSON only. Keep output minimal."
          },
          {
            role: "user",
            content: `Short meal input: "${raw_text}". Return this exact JSON (keep it minimal — up to 3 items, no prose):
{
  "summary": { "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 },
  "items": [ { "name": "string", "quantity_text": "string", "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 } ],
  "smart_swaps": ["one brief swap"]
}
Sum items into summary. Max 3 items.${swapExclusionNote}`
          }
        ],
        response_format: { type: "json_object" }
      }), 20000, 'llm');
      const compact = JSON.parse(compactResponse.choices[0].message.content);
      const items = (compact.items || []).slice(0, 3);
      compact.items = items;
      compact.summary = {
        calories: Math.round(items.reduce((s, i) => s + (i.calories || 0), 0)),
        protein_g: Math.round(items.reduce((s, i) => s + (i.protein_g || 0), 0)),
        carbs_g: Math.round(items.reduce((s, i) => s + (i.carbs_g || 0), 0)),
        fat_g: Math.round(items.reduce((s, i) => s + (i.fat_g || 0), 0)),
        fiber_g: Math.round(items.reduce((s, i) => s + (i.fiber_g || 0), 0)),
      };
      // Dedupe swaps server-side too
      if (Array.isArray(compact.smart_swaps) && Array.isArray(excluded_swaps)) {
        const lower = excluded_swaps.map(s => String(s).trim().toLowerCase());
        compact.smart_swaps = compact.smart_swaps.filter(sw => sw && !lower.includes(String(sw).trim().toLowerCase()));
      }

      if (meal_log_id && items.length > 0) {
        await Promise.all(items.map(item =>
          withTimeout(base44.asServiceRole.entities.MealItems.create({
            meal_log_id,
            name: item.name,
            quantity_text: item.quantity_text || '',
            calories: item.calories || 0,
            protein_g: item.protein_g || 0,
            carbs_g: item.carbs_g || 0,
            fat_g: item.fat_g || 0,
            fiber_g: item.fiber_g || 0,
            source: 'ai',
          }), 6000, 'write').catch(() => {})
        ));
      }

      return Response.json(compact);
    }

    // ── Full-length analysis ──────────────────────────────────────────────
    const response = await withTimeout(openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly, supportive nutrition assistant for a women's wellness app.
Analyse meal descriptions and return structured JSON with warm, non-diagnostic insights.
Never make medical claims. Use language like "may support", "you might notice", "consider".
Return valid JSON only.`
        },
        {
          role: "user",
          content: `Analyse this meal for a woman${resolvedPhase ? ` currently in the ${resolvedPhase} phase of her cycle` : ''}.

Meal: "${raw_text}"
User context: cycle phase: ${resolvedPhase || 'unknown'}, energy: ${energy_level || 'unknown'}/10, digestion: ${digestion_score || 'unknown'}/10, wellness goal: ${wellness_goal || 'general wellness'}${prompt_append ? '\n' + prompt_append : ''}${phaseInstruction}${swapExclusionNote}

Return this exact JSON structure:
{
  "summary": { "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 },
  "items": [ { "name": "string", "quantity_text": "string", "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0 } ],
  "quick_check": { "supports": ["energy"], "bullets": ["string","string","string"], "micro_action": "string", "action_type": "water|breathwork|walk|snack|journal" },
  "meal_score": 7,
  "smart_swaps": ["one brief swap"],
  "wellness_goal_match": "short phrase",
  "tone_safety_note": "brief disclaimer",
  "insight": {
    "headline": "catchy 5-8 word headline",
    "wellness_impact": "2-3 warm sentences",
    "action_items": "1-2 practical next steps",
    "smart_swap": "one ingredient swap suggestion",
    "confidence": "low|medium|high"
  }
}

IMPORTANT:
- summary MUST be the sum of items' macros.
- meal_score is a SINGLE NUMBER from 1 to 10 (10 = excellent balance/quality).
- smart_swaps must not repeat anything from the exclusion list above.
- All macro fields are integers.`
        }
      ],
      response_format: { type: "json_object" }
    }), 20000, 'llm');

    const data = JSON.parse(response.choices[0].message.content);

    // Server-side sum recompute to guarantee summary never stays zero.
    const items = data.items || [];
    data.summary = {
      calories: Math.round(items.reduce((s, i) => s + (i.calories || 0), 0)),
      protein_g: Math.round(items.reduce((s, i) => s + (i.protein_g || 0), 0)),
      carbs_g: Math.round(items.reduce((s, i) => s + (i.carbs_g || 0), 0)),
      fat_g: Math.round(items.reduce((s, i) => s + (i.fat_g || 0), 0)),
      fiber_g: Math.round(items.reduce((s, i) => s + (i.fiber_g || 0), 0)),
    };

    // Normalize meal_score to 1–10 single number if it came back as object.
    if (data.meal_score && typeof data.meal_score === 'object') {
      const vals = ['protein', 'veg_fiber', 'balance']
        .map(k => Number(data.meal_score[k]))
        .filter(n => Number.isFinite(n));
      if (vals.length) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        data.meal_score = Math.min(10, Math.max(1, Math.round(avg * 2)));
      }
    } else if (typeof data.meal_score === 'number' && data.meal_score <= 5) {
      data.meal_score = Math.min(10, Math.round(data.meal_score * 2));
    }

    // Dedupe swaps server-side too.
    if (Array.isArray(data.smart_swaps) && Array.isArray(excluded_swaps)) {
      const lower = excluded_swaps.map(s => String(s).trim().toLowerCase());
      data.smart_swaps = data.smart_swaps.filter(sw => sw && !lower.includes(String(sw).trim().toLowerCase()));
    }

    // Write MealItems records if meal_log_id provided.
    if (meal_log_id && items.length > 0) {
      await Promise.all(items.map(item =>
        withTimeout(base44.asServiceRole.entities.MealItems.create({
          meal_log_id,
          name: item.name,
          quantity_text: item.quantity_text || '',
          calories: item.calories || 0,
          protein_g: item.protein_g || 0,
          carbs_g: item.carbs_g || 0,
          fat_g: item.fat_g || 0,
          fiber_g: item.fiber_g || 0,
          source: 'ai',
        }), 6000, 'write').catch(() => {})
      ));
    }

    return Response.json(data);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});