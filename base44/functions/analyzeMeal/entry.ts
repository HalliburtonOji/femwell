/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { raw_text, cycle_phase, energy_level, digestion_score, wellness_goal, prompt_append, meal_log_id } = body;

    if (!raw_text) return Response.json({ error: 'raw_text required' }, { status: 400 });

    const response = await openai.chat.completions.create({
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
          content: `Meal: "${raw_text}"
User context: cycle phase: ${cycle_phase || 'unknown'}, energy: ${energy_level || 'unknown'}/10, digestion: ${digestion_score || 'unknown'}/10, wellness goal: ${wellness_goal || 'general wellness'}${prompt_append ? '\n' + prompt_append : ''}

Return this exact JSON structure:
{
  "nutritional_summary": {
    "calories": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "fiber_g": 0
  },
  "items": [
    {
      "name": "string",
      "quantity_text": "string",
      "calories": 0,
      "protein_g": 0,
      "carbs_g": 0,
      "fat_g": 0,
      "fiber_g": 0
    }
  ],
  "quick_check": {
    "supports": ["energy"],
    "bullets": ["string", "string", "string"],
    "micro_action": "string",
    "action_type": "water|breathwork|walk|snack|journal"
  },
  "meal_score": {"protein": 5, "veg_fiber": 5, "balance": 5},
  "insight": {
    "headline": "catchy 5-8 word headline",
    "wellness_impact": "2-3 warm sentences",
    "action_items": "1-2 practical next steps",
    "smart_swap": "one ingredient swap suggestion",
    "confidence": "low|medium|high",
    "tone_safety_note": "brief disclaimer"
  }
}

IMPORTANT: nutritional_summary MUST be calculated by summing calories, protein_g, carbs_g, fat_g, and fiber_g across ALL items. Never leave nutritional_summary values as 0 if items have values. All macro fields = integers.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content);

    // Fix A: Always recompute nutritional_summary by summing items
    const items = data.items || [];
    data.nutritional_summary = {
      calories: Math.round(items.reduce((s, i) => s + (i.calories || 0), 0)),
      protein_g: Math.round(items.reduce((s, i) => s + (i.protein_g || 0), 0)),
      carbs_g: Math.round(items.reduce((s, i) => s + (i.carbs_g || 0), 0)),
      fat_g: Math.round(items.reduce((s, i) => s + (i.fat_g || 0), 0)),
      fiber_g: Math.round(items.reduce((s, i) => s + (i.fiber_g || 0), 0)),
    };

    // Fix B: Write MealItems records if meal_log_id provided
    if (meal_log_id && items.length > 0) {
      const mealItemRecords = items.map(item => ({
        meal_log_id,
        name: item.name,
        quantity_text: item.quantity_text || '',
        calories: item.calories || 0,
        protein_g: item.protein_g || 0,
        carbs_g: item.carbs_g || 0,
        fat_g: item.fat_g || 0,
        fiber_g: item.fiber_g || 0,
        source: 'ai',
      }));
      await Promise.all(mealItemRecords.map(r => base44.asServiceRole.entities.MealItems.create(r).catch(() => {})));
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});