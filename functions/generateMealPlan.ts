import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { mode, wellness_goal, ingredients, usual_meals, duration_days = 7 } = await req.json();

    const goalDescriptions = {
      energy: "boost energy levels with complex carbs, iron, B vitamins, and balanced blood sugar",
      digestion: "support healthy digestion with fiber, probiotics, fermented foods, and anti-inflammatory ingredients",
      sleep: "promote better sleep with tryptophan-rich foods, magnesium, and avoiding stimulants",
      mood: "support mood with omega-3s, B vitamins, magnesium, and gut-healthy foods",
      hydration: "maximize hydration with water-rich foods, electrolytes, and minimal diuretics",
      hormone: "support hormone balance with phytoestrogens, zinc, healthy fats, and cruciferous vegetables",
    };

    const goalContext = goalDescriptions[wellness_goal] || "support general wellness and balanced nutrition";
    const ingredientList = (ingredients || []).join(", ") || "no specific ingredients provided";
    const usualMealsList = (usual_meals || []).join(", ") || "no usual meals provided";

    let prompt, schema;

    if (mode === "recipe") {
      prompt = `You are a professional nutritionist and chef creating a recipe for a women's wellness app.

Wellness goal: ${wellness_goal ? `${wellness_goal} — ${goalContext}` : "general wellness"}
Available ingredients: ${ingredientList}
User's usual meals: ${usualMealsList}

Create ONE complete, delicious recipe that:
- Uses as many of the available ingredients as possible
- Supports the wellness goal
- Is practical and achievable for a home cook
- Includes an "add-on suggestion" (an extra ingredient or side that would boost the wellness benefit further)

Return ONLY valid JSON matching this schema exactly:
{
  "recipe_name": "string",
  "tagline": "short enticing description (max 15 words)",
  "cuisine_type": "string",
  "difficulty": "Easy|Medium|Advanced",
  "prep_time_minutes": number,
  "cook_time_minutes": number,
  "servings": number,
  "ingredients": [{"name": "string", "quantity": "string", "unit": "string", "optional": false}],
  "instructions": ["string"],
  "nutritional_summary": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number},
  "wellness_benefits": ["string (max 3)"],
  "addon_suggestions": [{"name": "string", "reason": "string"}],
  "tip": "one practical cooking tip"
}`;
      schema = null;
    } else {
      prompt = `You are a professional nutritionist creating a ${duration_days}-day meal plan for a women's wellness app.

Wellness goal: ${wellness_goal ? `${wellness_goal} — ${goalContext}` : "general wellness"}
Available/preferred ingredients: ${ingredientList}
User's usual meals: ${usualMealsList}

Create a ${duration_days}-day meal plan that:
- Incorporates the user's usual meals where appropriate
- Builds on available ingredients to minimise shopping
- Supports the wellness goal every day
- Is varied and enjoyable, not repetitive
- Includes "add-on suggestions" — simple extras to boost wellness benefits

Return ONLY valid JSON matching this schema exactly:
{
  "plan_name": "string",
  "wellness_focus": "string",
  "days": [
    {
      "day_number": number,
      "day_label": "Monday|Tuesday|...",
      "meals": {
        "breakfast": {"name": "string", "description": "string", "prep_minutes": number},
        "lunch": {"name": "string", "description": "string", "prep_minutes": number},
        "dinner": {"name": "string", "description": "string", "prep_minutes": number},
        "snack": {"name": "string", "description": "string", "prep_minutes": number}
      },
      "daily_wellness_tip": "string"
    }
  ],
  "shopping_list": ["string"],
  "addon_suggestions": [{"name": "string", "reason": "string", "applies_to": "all|breakfast|lunch|dinner|snack"}],
  "weekly_tip": "string"
}`;
      schema = null;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional nutritionist and chef. Always return valid JSON only, no markdown, no extra text." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content);
    return Response.json({ mode, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});