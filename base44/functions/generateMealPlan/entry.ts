import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      mode,
      wellness_goal,
      ingredients,
      usual_meals,
      loved_meals,
      duration_days = 7,
      dietary_preferences = [],
      cuisine_preference,
      included_meal_types,
      calorie_target,
      protein_target,
      surprise_me = false,
    } = await req.json();

    // usual_meals / loved_meals may arrive as a flat array OR a per-slot object
    // ({breakfast:[...], dinner:[...]}). Flatten either shape safely (the old code
    // assumed an array and threw on the object, silently failing generation).
    const flattenMeals = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.filter(Boolean);
      if (typeof v === "object") return Object.values(v).flat().filter(Boolean);
      return [];
    };

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
    const usualMealsList = flattenMeals(usual_meals).join(", ") || "none";
    const lovedMealsList = flattenMeals(loved_meals).join(", ") || "none";
    const dietaryStr = dietary_preferences?.length ? dietary_preferences.join(", ") : "no specific dietary restrictions";
    const cuisineStr = cuisine_preference || "any cuisine";

    let nutritionNote = "";
    if (calorie_target) nutritionNote += ` Target ~${calorie_target} kcal per day.`;
    if (protein_target) nutritionNote += ` Aim for ~${protein_target}g protein per day.`;

    let prompt;

    if (mode === "recipe") {
      const surpriseContext = surprise_me
        ? "Be creative and surprise the user with something delicious and unexpected — avoid common 'health food' clichés."
        : `Available ingredients: ${ingredientList}\nUser's usual meals: ${usualMealsList}`;

      prompt = `You are a professional nutritionist and chef creating a recipe for a women's wellness app.

    Wellness goal: ${wellness_goal ? `${wellness_goal} — ${goalContext}` : "general wellness"}
    Dietary preferences: ${dietaryStr}
    Cuisine preference: ${cuisineStr}
    ${surpriseContext}

    IMPORTANT DIVERSITY RULES — follow ALL of these:
    1. Do NOT use quinoa unless the user explicitly requested it.
    2. Do NOT default to clichés like buddha bowls, acai bowls, overnight oats, or chia pudding unless cuisine preference calls for it.
    3. If cuisine is "Any" or unspecified, choose a non-Western cuisine at least 60% of the time — e.g. Japanese, West African, Persian, Vietnamese, Peruvian, Ethiopian, Turkish, Korean, Moroccan, Indian.
    4. Vary the cooking method — choose from: braised, steamed, roasted, raw, poached, wok-fried, baked, grilled, slow-cooked, one-pot, pan-seared.
    5. The recipe must feel genuinely different from a standard "wellness recipe" — surprise the user.
    6. Pick an unexpected PRIMARY ingredient that is still delicious and achievable.

    Create ONE complete, delicious recipe that respects all dietary preferences, supports the wellness goal, and is achievable for a home cook. Include up to 2 add-on suggestions.

    Return ONLY valid JSON:
    {
    "recipe_name": "string",
    "tagline": "short enticing description (max 15 words)",
    "cuisine_type": "string",
    "difficulty": "Easy|Medium|Advanced",
    "prep_time_minutes": number,
    "cook_time_minutes": number,
    "servings": number,
    "ingredients": [{"name": "string", "quantity": "string", "unit": "string", "optional": false}],
    "instructions": ["string — each step must be a FULL SENTENCE with real detail"],
    "nutritional_summary": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number},
    "wellness_benefits": ["string (max 3)"],
    "addon_suggestions": [{"name": "string", "reason": "string"}],
    "tip": "one practical cooking tip"
}`;

    } else {
      const mealTypesStr = (included_meal_types || ["breakfast", "lunch", "dinner", "snack"]).join(", ");

      prompt = `You are a professional nutritionist creating a ${duration_days}-day meal plan for a women's wellness app.

Wellness goal: ${wellness_goal ? `${wellness_goal} — ${goalContext}` : "general wellness"}
Dietary preferences: ${dietaryStr}
Cuisine/food preferences: ${cuisineStr}
Available/preferred ingredients: ${ingredientList}
User's usual meals: ${usualMealsList}
Meals the user has LOVED before (rated highly / returns to): ${lovedMealsList}
Meal types to include each day: ${mealTypesStr}
${nutritionNote}

Create a ${duration_days}-day meal plan that:
- Respects all dietary preferences strictly
- Incorporates the user's usual meals where appropriate
- Brings back the user's LOVED meals: include up to TWO of them across the week, placed in a fitting slot, even if that means gently bending the no-repeat rules below (loved meals are the welcome exception — familiarity is a feature, not a failure)
- Builds on available ingredients to minimise shopping
- Supports the wellness goal every day
- Is varied and enjoyable, not repetitive
- Aligns with nutritional targets if provided
- Includes only the specified meal types per day
- Includes "add-on suggestions" — simple extras to boost wellness benefits

Return ONLY valid JSON:
{
  "plan_name": "string",
  "wellness_focus": "string",
  "days": [
    {
      "day_number": number,
      "day_label": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
      "meals": {
        "breakfast": {"name": "string", "description": "string", "cuisine": "string", "prep_minutes": number, "cook_steps": ["string"]},
        "lunch": {"name": "string", "description": "string", "cuisine": "string", "prep_minutes": number, "cook_steps": ["string"]},
        "dinner": {"name": "string", "description": "string", "cuisine": "string", "prep_minutes": number, "cook_steps": ["string"]},
        "snack": {"name": "string", "description": "string", "cuisine": "string", "prep_minutes": number, "cook_steps": ["string"]}
      },
      "daily_wellness_tip": "string"
    }
  ],
  "shopping_list": ["string"],
  "addon_suggestions": [{"name": "string", "reason": "string", "applies_to": "all|breakfast|lunch|dinner|snack"}],
  "weekly_tip": "string"
}

Only include the meal types specified (${mealTypesStr}) in each day's meals object.

CRITICAL CUISINE DIVERSITY — follow ALL of these or the plan fails:
(0) Each day MUST have at least one non-Western meal. Rotate through these cuisines across the 7 days: Day 1: Nigerian/West African, Day 2: Indian/South Asian, Day 3: Thai/Vietnamese, Day 4: Mediterranean/Greek, Day 5: Lebanese/Middle Eastern, Day 6: Mexican/Caribbean, Day 7: Japanese/Korean. Include the cuisine name in each meal object as a 'cuisine' field.
(1) No protein source (chicken, beef, fish, eggs, tofu, lentils, etc.) should appear more than once in the full plan.
(2) No two meals should share the same primary cooking method (stir-fry, baked, roasted, grilled, raw, steamed, soup).
(3) Every meal must include an estimated calorie count and a macro breakdown (protein_g, carbs_g, fat_g) in the nutritional_summary field of each day.
(4) The shopping list must be deduplicated — if an ingredient appears in multiple meals, list it once with the combined quantity.
(5) The shopping list maximum is 25 items total. Prioritise staples that appear in multiple meals.
(6) Each meal must include cook_steps: an array of 3–5 actionable cooking steps, each a full sentence.`;
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