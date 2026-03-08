import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { raw_text, cycle_phase, energy_level, digestion_score } = body;

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
User context: cycle phase: ${cycle_phase || 'unknown'}, energy: ${energy_level || 'unknown'}/10, digestion: ${digestion_score || 'unknown'}/10

Return this exact JSON structure:
{
  "items": [{"name": "string", "quantity_text": "string", "estimated_protein": "low|medium|high", "estimated_fiber": "low|medium|high", "estimated_calories": 0}],
  "quick_check": {
    "supports": ["energy"],
    "bullets": ["string", "string", "string"],
    "micro_action": "string",
    "action_type": "water|breathwork|walk|snack|journal"
  },
  "meal_score": {"protein": 5, "veg_fiber": 5, "balance": 5}
}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});