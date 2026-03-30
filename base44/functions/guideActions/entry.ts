import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, payload } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    // ── GET RICH CONTEXT (used to prime Guide system prompt) ───────────────
    if (action === 'get_context') {
      const [
        profile, prefs, checkin, habits, cycleEvents,
        programs, userPrograms, hydration, journals,
        meals, mealPlan, todayRecs, recentSessions, savedItems,
      ] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: user.id }),
        base44.entities.UserPreferences.filter({ user_id: user.id }),
        base44.entities.DailyCheckins.filter({ user_id: user.id, date: today }),
        base44.entities.HabitLogs.filter({ user_id: user.id, date: today }),
        base44.entities.CycleEvents.filter({ user_id: user.id }, '-date', 10),
        base44.entities.Programs.list('-created_date', 20),
        base44.entities.UserPrograms.filter({ user_id: user.id }),
        base44.entities.HydrationLog.filter({ user_id: user.id, day_key: today }),
        base44.entities.JournalEntries.filter({ user_id: user.id }, '-created_date', 3),
        base44.entities.MealLog.filter({ user_id: user.id, day_key: today }),
        base44.entities.MealPlans.filter({ user_id: user.id }, '-created_date', 1),
        base44.entities.TodayRecommendations.filter({ user_id: user.id, date: today }),
        base44.entities.ContentHistory.filter({ user_id: user.id }, '-created_date', 5),
        base44.entities.SavedItems.filter({ user_id: user.id }, '-created_date', 5),
      ]);

      const activeUp = userPrograms.filter(u => u.is_saved || u.status === 'active');
      const activeProgram = activeUp[0]
        ? programs.find(p => p.id === activeUp[0].program_id)
        : null;
      const latestCycle = cycleEvents[0] || null;

      return Response.json({
        success: true,
        data: {
          user_name: user.full_name,
          today,
          profile: profile[0] || null,
          preferences: prefs[0] || null,
          today_checkin: checkin[0] || null,
          habits_today: habits,
          hydration_today: hydration[0] || null,
          meals_today: meals,
          meal_plan: mealPlan[0] || null,
          today_recommendations: todayRecs.slice(0, 3),
          active_program: activeProgram
            ? {
                title: activeProgram.title,
                current_day: activeUp[0].current_day || 1,
                program_key: activeProgram.program_key,
                streak: activeUp[0].streak_count || 0,
                total_days: activeProgram.duration_days,
              }
            : null,
          latest_cycle_event: latestCycle,
          recent_journals: journals.map(j => ({
            date: j.session_date || j.created_date?.split('T')[0],
            snippet: j.text?.slice(0, 100),
            mood_rating: j.mood_rating,
          })),
          recent_sessions: recentSessions.map(s => ({
            content_key: s.content_key,
            session_date: s.session_date,
            duration_seconds: s.duration_seconds,
          })),
          saved_items: savedItems.map(s => ({ title: s.title, item_type: s.item_type })),
        },
      });
    }

    // ── LOG HYDRATION ──────────────────────────────────────────────────────
    if (action === 'log_hydration') {
      const amount_ml = payload?.amount_ml || 250;
      const existing = await base44.entities.HydrationLog.filter({ user_id: user.id, day_key: today });
      let total_ml;
      if (existing[0]) {
        total_ml = (existing[0].total_ml || 0) + amount_ml;
        await base44.entities.HydrationLog.update(existing[0].id, { total_ml, updated_at: new Date().toISOString() });
      } else {
        total_ml = amount_ml;
        await base44.entities.HydrationLog.create({ user_id: user.id, day_key: today, total_ml, glasses: Math.round(total_ml / 250) });
      }
      return Response.json({ success: true, message: `Done — I logged ${amount_ml} ml of water for today. Your total is now ${total_ml} ml.`, data: { total_ml } });
    }

    // ── LOG MEAL ───────────────────────────────────────────────────────────
    if (action === 'log_meal') {
      const { meal_text, meal_type = 'meal' } = payload || {};
      if (!meal_text) return Response.json({ success: false, message: 'What did you eat? Give me a quick description.' });
      await base44.entities.MealLog.create({
        user_id: user.id, day_key: today,
        logged_at: new Date().toISOString(),
        meal_type, method: 'guide', raw_text: meal_text,
      });
      return Response.json({ success: true, message: `Logged — "${meal_text}" added to your ${meal_type} for today.` });
    }

    // ── LOG SYMPTOM ────────────────────────────────────────────────────────
    if (action === 'log_symptom') {
      const { symptom_type, severity = 3, notes } = payload || {};
      if (!symptom_type) return Response.json({ success: false, message: 'Which symptom should I log?' });
      await base44.entities.SymptomLogs.create({ user_id: user.id, date: today, symptom_type, severity, notes });
      return Response.json({ success: true, message: `Logged ${symptom_type} (severity ${severity}) for today.` });
    }

    // ── LOG CYCLE EVENT ────────────────────────────────────────────────────
    if (action === 'log_cycle_event') {
      const { type = 'PeriodStart', flow_level = 'medium' } = payload || {};
      await base44.entities.CycleEvents.create({ user_id: user.id, date: today, type, flow_level });
      return Response.json({ success: true, message: `Logged ${type.replace(/([A-Z])/g, ' $1').trim()} for today.` });
    }

    // ── COMPLETE HABIT ─────────────────────────────────────────────────────
    if (action === 'complete_habit') {
      const { habit_name } = payload || {};
      if (!habit_name) return Response.json({ success: false, message: 'Which habit should I mark complete?' });
      const existing = await base44.entities.HabitLogs.filter({ user_id: user.id, date: today, habit_type: habit_name });
      if (existing[0]) {
        await base44.entities.HabitLogs.update(existing[0].id, { completed: true });
      } else {
        await base44.entities.HabitLogs.create({ user_id: user.id, date: today, habit_type: habit_name, habit_name, completed: true });
      }
      return Response.json({ success: true, message: `Done — "${habit_name}" marked complete for today.` });
    }

    // ── GET NEXT PROGRAM DAY ───────────────────────────────────────────────
    if (action === 'get_program_next') {
      const ups = await base44.entities.UserPrograms.filter({ user_id: user.id });
      const active = ups.find(u => u.is_saved || u.status === 'active');
      if (!active) return Response.json({ success: false, message: "You don't have an active program yet. You can start one from Programs." });
      const progs = await base44.entities.Programs.filter({});
      const prog = progs.find(p => p.id === active.program_id);
      const currentDay = active.current_day || 1;
      const tasks = await base44.entities.ProgramTasks.filter({ program_key: prog?.program_key, day_number: currentDay });
      return Response.json({
        success: true,
        message: `Your next program day is Day ${currentDay} of "${prog?.title}".`,
        data: {
          program_title: prog?.title,
          program_key: prog?.program_key,
          current_day: currentDay,
          total_days: prog?.duration_days,
          route: `/ProgramDay?key=${prog?.program_key}&day=${currentDay}`,
          tasks: tasks.map(t => ({ title: t.title, task_type: t.task_type })),
        },
      });
    }

    // ── SEARCH CONTENT ─────────────────────────────────────────────────────
    if (action === 'search_content') {
      const { query, content_type, limit = 3 } = payload || {};
      const all = await base44.entities.ContentItems.list('-created_date', 60);
      const q = (query || '').toLowerCase();
      const results = all
        .filter(item => {
          const haystack = `${item.title} ${item.tags || ''} ${item.summary || ''}`.toLowerCase();
          const typeMatch = !content_type || item.content_type === content_type;
          const queryMatch = !q || haystack.includes(q);
          return typeMatch && queryMatch;
        })
        .slice(0, limit)
        .map(item => ({
          id: item.id,
          title: item.title,
          content_type: item.content_type,
          duration_minutes: item.duration_minutes,
          access_tier: item.access_tier,
          route: `/ContentPlayer?id=${item.id}`,
        }));
      return Response.json({ success: true, data: results });
    }

    // ── TTS (ElevenLabs) ───────────────────────────────────────────────────
    if (action === 'tts') {
      const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL' } = payload || {};
      if (!text) return Response.json({ success: false });
      const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500), model_id: 'eleven_turbo_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      });
      if (!res.ok) return Response.json({ success: false });
      const buf = await res.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return Response.json({ success: true, audio_base64: base64, mime: 'audio/mpeg' });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});