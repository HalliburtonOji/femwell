/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

// Photo logging — uses the SAME OpenAI key + SAME gpt-4o-mini vision model for BOTH:
//   • mode "meal" (default, unchanged): a meal photo → editable macro draft.
//   • mode "schedule" (NEW): a screenshot of a work rota / roster / list of events →
//     structured, REVIEWABLE schedule entries (dates, times, shifts, event names).
// No new function, no new key — one multimodal path, branched by `mode`. The client
// ALWAYS shows a review/confirm step for schedule mode before anything is saved.
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

    const { image_base64, cycle_phase, wellness_goal, meal_log_id, mode, reference_date, intent_text, time_of_day } = body;
    if (!image_base64) return Response.json({ error: 'image_base64 required' }, { status: 400 });

    // Accept either a full data URL or raw base64; normalise to a data URL.
    const imageUrl = String(image_base64).startsWith('data:')
      ? String(image_base64)
      : `data:image/jpeg;base64,${image_base64}`;

    // ── INTENT MODE (NEW) — classify what the user means from image + their words ──
    // The photo logger is NOT schedule-only: it routes to food / symptom / moment /
    // schedule based on the user's stated intent AND what's in the image. Returns a
    // classification + a meal-type guess + whether it's retrospective (already happened)
    // vs a plan. The CLIENT owns the follow-up chips + review/confirm before any save.
    if (mode === 'intent') {
      const refDate = /^\d{4}-\d{2}-\d{2}$/.test(String(reference_date || ''))
        ? String(reference_date) : new Date().toISOString().slice(0, 10);
      const said = String(intent_text || '').slice(0, 300);
      const tod = String(time_of_day || '').slice(0, 20);
      const INTENT_UNAVAILABLE = { kind: 'intent', detected: 'other', is_retrospective: true, title: '', meal_type_guess: null, analysis_unavailable: true, notes: '' };

      let data;
      try {
        const response = await withTimeout(openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `You classify what a user is trying to log from a PHOTO plus their own words, for a women's wellness app. Pick the single best category and a few hints. If the user's words state the intent, trust them over the image. Return valid JSON only.` },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `The user added this image and said: "${said || '(nothing)'}". Today is ${refDate}${tod ? `, it is currently ${tod}` : ''}.
Return EXACT JSON:
{
  "kind": "intent",
  "detected": "food" | "schedule" | "symptom" | "moment" | "other",
  "is_retrospective": true | false,
  "title": "short human label of what's in the image (<=6 words)",
  "meal_type_guess": "breakfast" | "lunch" | "dinner" | "snack" | null,
  "notes": "one short honest sentence"
}
Guidance: a receipt, a plate of food, a menu, a fridge, groceries → "food". A work rota / roster / shift timetable or a list of future events → "schedule" (is_retrospective=false). A rash / swelling / medication box / note about feeling unwell → "symptom". A scenic / selfie / pet / keepsake with no data → "moment". "is_retrospective" is true when it describes something that ALREADY happened (a meal eaten, a symptom felt, a moment), false when it's a plan for the future. meal_type_guess only for food (use the time of day + any words as a hint).`,
                },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }), 25000, 'vision-intent');
        data = JSON.parse(response.choices[0].message.content);
      } catch {
        return Response.json(INTENT_UNAVAILABLE);
      }

      const det = ['food', 'schedule', 'symptom', 'moment', 'other'].includes(data?.detected) ? data.detected : 'other';
      const mt = ['breakfast', 'lunch', 'dinner', 'snack'].includes(data?.meal_type_guess) ? data.meal_type_guess : null;
      return Response.json({
        kind: 'intent',
        detected: det,
        is_retrospective: typeof data?.is_retrospective === 'boolean' ? data.is_retrospective : (det !== 'schedule'),
        title: data?.title ? String(data.title).slice(0, 60) : '',
        meal_type_guess: mt,
        notes: data?.notes ? String(data.notes).slice(0, 200) : '',
      });
    }

    // ── SCHEDULE MODE (NEW) — read a rota / event list → reviewable entries ──────
    if (mode === 'schedule') {
      const refDate = /^\d{4}-\d{2}-\d{2}$/.test(String(reference_date || ''))
        ? String(reference_date)
        : new Date().toISOString().slice(0, 10);

      // Clean fast-degrade payload — returned 200 whenever vision is slow/unreadable so
      // the client can show a tidy "couldn't read it" state and never auto-commits.
      const SCHED_UNAVAILABLE = { kind: 'schedule', entries: [], detected_type: 'unknown', analysis_unavailable: true, notes: '' };

      let data;
      try {
        const response = await withTimeout(openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You read a photo or screenshot of a personal SCHEDULE — a work rota/roster of shifts, or a list of upcoming events/appointments — and extract structured calendar entries a person can review before saving. You never invent entries. If something is unreadable or ambiguous, say so in "notes" and lower confidence. Return valid JSON only.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract every schedule entry visible in this image. Today's date is ${refDate} (use it to resolve weekday-only rows to the NEXT matching upcoming date; if a full date is printed, use that).
Return this EXACT JSON:
{
  "kind": "schedule",
  "detected_type": "rota" | "event_list" | "unknown",
  "entries": [
    {
      "title": "string — shift label or event name (e.g. 'Early shift', 'Dentist')",
      "date": "YYYY-MM-DD or null (resolve if a weekday/day is given)",
      "day_label": "string as printed (e.g. 'Mon', 'Tue 9 Jul') or null",
      "start": "HH:MM 24h or null",
      "end": "HH:MM 24h or null",
      "all_day": false,
      "confidence": "low" | "medium" | "high"
    }
  ],
  "notes": "one short honest sentence about anything ambiguous, unread, or assumed"
}
Rules: up to 20 entries. Times in 24h. If only a weekday is shown (a rota), resolve "date" to the next upcoming date for that weekday relative to today and keep the printed text in "day_label". If neither a date nor a resolvable weekday is present, set date null and lower confidence. If the image is not a schedule, return detected_type "unknown", empty entries, and a note.`,
                },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }), 25000, 'vision-schedule');
        data = JSON.parse(response.choices[0].message.content);
      } catch {
        return Response.json(SCHED_UNAVAILABLE);
      }

      // Normalise defensively — never trust the shape blindly; cap at 20; NEVER write
      // anything here (the client reviews + saves). This endpoint only PARSES.
      const entries = Array.isArray(data?.entries) ? data.entries.slice(0, 20) : [];
      return Response.json({
        kind: 'schedule',
        detected_type: ['rota', 'event_list', 'unknown'].includes(data?.detected_type) ? data.detected_type : 'unknown',
        entries: entries.map((e: any) => ({
          title: String(e?.title || 'Untitled').slice(0, 80),
          date: /^\d{4}-\d{2}-\d{2}$/.test(String(e?.date || '')) ? e.date : null,
          day_label: e?.day_label ? String(e.day_label).slice(0, 40) : null,
          start: /^\d{1,2}:\d{2}$/.test(String(e?.start || '')) ? e.start : null,
          end: /^\d{1,2}:\d{2}$/.test(String(e?.end || '')) ? e.end : null,
          all_day: !!e?.all_day,
          confidence: ['low', 'medium', 'high'].includes(e?.confidence) ? e.confidence : 'low',
        })),
        notes: data?.notes ? String(data.notes).slice(0, 240) : '',
      });
    }

    // ── MEAL MODE (default, UNCHANGED) ──────────────────────────────────────────
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
