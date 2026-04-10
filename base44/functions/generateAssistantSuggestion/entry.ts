import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const currentPage = body.currentPage || 'Today';
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();

    const [profiles, checkins, habits, journal, programs, hydration, mealLogs, symptoms, pregProfiles, kicks, contractions, lifestyleItems] = await Promise.all([
      base44.entities.UserProfile.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id, date: today }),
      base44.entities.HabitLogs.filter({ user_id: user.id, date: today }),
      base44.entities.JournalEntries.filter({ user_id: user.id }, '-date', 3),
      base44.entities.UserPrograms.filter({ user_id: user.id, status: 'active' }),
      base44.entities.HydrationLog.filter({ user_id: user.id, day_key: today }),
      base44.entities.MealLog.filter({ user_id: user.id, log_date: today }),
      base44.entities.SymptomLogs.filter({ user_id: user.id }, '-date', 5),
      base44.entities.PregnancyProfile.filter({ user_id: user.id }),
      base44.entities.PregnancyKickSession.filter({ user_id: user.id, day_key: today }),
      base44.entities.ContractionSession.filter({ user_id: user.id, day_key: today }),
      base44.entities.LifestyleItems.filter({ status: 'PUBLISHED' }, '-pub_date', 6),
    ]);

    const profile = profiles[0] || {};
    const hasCheckin = checkins.length > 0;
    const hasHabits = habits.length > 0;
    const hasMeals = mealLogs.length > 0;
    const hydrationMl = hydration.reduce((s, h) => s + (h.amount_ml || 0), 0);
    const hydrationTarget = profile.hydration_target_ml || 2000;
    const isPregnant = pregProfiles.length > 0;
    const hasKicks = kicks.length > 0;
    const hasContractions = contractions.length > 0;
    const activeProgram = programs[0];
    const recentJournal = journal[0];
    const lastSymptom = symptoms[0];
    const lifeStage = profile.life_stage;
    const randomArticle = lifestyleItems[Math.floor(Math.random() * Math.min(lifestyleItems.length, 6))];

    // Build a smart, varied context for the LLM
    const context = {
      currentPage,
      hour,
      hasCheckin,
      hasHabits,
      hasMeals,
      hydrationMl,
      hydrationTarget,
      hydrationLow: hydrationMl < hydrationTarget * 0.5,
      isPregnant,
      hasKicksToday: hasKicks,
      hasContractionsToday: hasContractions,
      lifeStage,
      activeProgram: activeProgram ? { title: activeProgram.program_key, current_day: activeProgram.current_day } : null,
      journaledRecently: !!recentJournal,
      lastSymptomType: lastSymptom?.symptom_type || null,
      goals: profile.goals || [],
      cycleEnabled: (profile.modules_enabled || []).includes('cycle'),
      articleTitle: randomArticle?.title || null,
      articleId: randomArticle?.id || null,
      articleCategory: randomArticle?.category || null,
    };

    const prompt = `You are a smart suggestion engine for a women's wellness app called FemWell.
Return ONE short, contextual suggestion based on this context:
${JSON.stringify(context, null, 2)}

RULES:
- Type must be "question" (opens assistant chat) or "suggestion" (deep-links to app section)
- "prompt" must be max 55 characters, warm, natural, NOT robotic
- category must be one of: log, habit, journal, program, nutrition, hydration, content, cycle, pregnancy, lifestyle, mood, skin
- action_route is an in-app path e.g. /Today, /Nutrition, /Journal, /Programs, /SkinHair, /LifeStageCare, /Explore, /Lifestyle
- For questions, action_route should be /Assistant
- Be VARIED — don't always suggest logging. Mix: journal prompts, program nudges, content discovery, hydration, mood checks, etc.
- Morning (5-11am): daily log, habits, program start
- Afternoon (12-17pm): meal check, hydration, program content  
- Evening (18-22pm): journal, reflection, mood check, tomorrow prep
- If pregnant and no kicks today → suggest kick count
- If active program → nudge to continue
- If hydration low → suggest water
- If no journal recently → journal prompt question
- AVOID suggesting "log" again if context shows already logged today (hasCheckin=true)

Return JSON only:
{ "type": "question"|"suggestion", "title": string (2-3 words), "prompt": string (max 55 chars), "action_route": string, "category": string }`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          prompt: { type: 'string' },
          action_route: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['type', 'title', 'prompt', 'action_route', 'category']
      }
    });

    // Enforce max length on prompt
    if (result.prompt && result.prompt.length > 60) {
      result.prompt = result.prompt.slice(0, 57) + '…';
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});