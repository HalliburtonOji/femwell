import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payload } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    // ── LOG HYDRATION ──────────────────────────────────────────────────────
    if (action === 'log_hydration') {
      const amount_ml = payload?.amount_ml || 250;
      const existing = await base44.entities.HydrationLog.filter({
        user_id: user.id,
        day_key: today,
      });
      let total_ml = amount_ml;
      if (existing[0]) {
        total_ml = (existing[0].total_ml || 0) + amount_ml;
        await base44.entities.HydrationLog.update(existing[0].id, {
          total_ml,
          updated_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.HydrationLog.create({
          user_id: user.id,
          day_key: today,
          total_ml,
          glasses: Math.round(total_ml / 250),
        });
      }
      return Response.json({
        success: true,
        message: `Done — I logged ${amount_ml} ml of water for today. Your total so far is ${total_ml} ml.`,
        data: { total_ml, amount_ml },
      });
    }

    // ── LOG MEAL ───────────────────────────────────────────────────────────
    if (action === 'log_meal') {
      const { meal_text, meal_type = 'meal' } = payload || {};
      if (!meal_text) {
        return Response.json({ success: false, message: 'No meal description provided.' });
      }
      await base44.entities.MealLog.create({
        user_id: user.id,
        day_key: today,
        logged_at: new Date().toISOString(),
        meal_type,
        method: 'guide',
        raw_text: meal_text,
      });
      return Response.json({
        success: true,
        message: `Logged — "${meal_text}" added to your ${meal_type} for today.`,
        data: { meal_text, meal_type },
      });
    }

    // ── GET USER CONTEXT ───────────────────────────────────────────────────
    if (action === 'get_context') {
      const [profile, checkin, habits, cycleEvents, programs, userPrograms, hydration, journals] =
        await Promise.all([
          base44.entities.UserProfile.filter({ user_id: user.id }),
          base44.entities.DailyCheckins.filter({ user_id: user.id, date: today }),
          base44.entities.HabitLogs.filter({ user_id: user.id, date: today }),
          base44.entities.CycleEvents.filter({ user_id: user.id }),
          base44.entities.Programs.list('-created_date', 20),
          base44.entities.UserPrograms.filter({ user_id: user.id }),
          base44.entities.HydrationLog.filter({ user_id: user.id, day_key: today }),
          base44.entities.JournalEntries.filter({ user_id: user.id }, '-created_date', 3),
        ]);

      const activePrograms = userPrograms.filter(u => u.is_saved || u.status === 'active');
      const activeProgram = activePrograms[0]
        ? programs.find(p => p.id === activePrograms[0].program_id)
        : null;

      const latestCycleEvent = [...cycleEvents].sort((a, b) => b.date.localeCompare(a.date))[0];

      return Response.json({
        success: true,
        data: {
          user_name: user.full_name,
          today,
          profile: profile[0] || null,
          today_checkin: checkin[0] || null,
          habits_today: habits,
          hydration_today: hydration[0] || null,
          active_program: activeProgram
            ? {
                title: activeProgram.title,
                current_day: activePrograms[0].current_day || 1,
                program_key: activeProgram.program_key,
                streak: activePrograms[0].streak_count || 0,
              }
            : null,
          latest_cycle_event: latestCycleEvent || null,
          recent_journals: journals.map(j => ({
            date: j.session_date || j.created_date?.split('T')[0],
            snippet: j.text?.slice(0, 120),
            mood_rating: j.mood_rating,
          })),
        },
      });
    }

    // ── GET PROGRAM NEXT DAY ───────────────────────────────────────────────
    if (action === 'get_program_next') {
      const userPrograms = await base44.entities.UserPrograms.filter({ user_id: user.id });
      const active = userPrograms.filter(u => u.is_saved || u.status === 'active')[0];
      if (!active) {
        return Response.json({ success: false, message: "You don't have an active program. You can start one in Programs." });
      }
      const program = await base44.entities.Programs.filter({});
      const prog = program.find(p => p.id === active.program_id);
      const currentDay = active.current_day || 1;
      const tasks = await base44.entities.ProgramTasks.filter({
        program_key: prog?.program_key,
        day_number: currentDay,
      });
      return Response.json({
        success: true,
        data: {
          program_title: prog?.title,
          current_day: currentDay,
          program_key: prog?.program_key,
          tasks: tasks.map(t => ({ title: t.title, task_type: t.task_type, content_key: t.content_key })),
        },
        message: `Your next program day is Day ${currentDay} of "${prog?.title}".`,
      });
    }

    // ── TTS (ElevenLabs) ───────────────────────────────────────────────────
    if (action === 'tts') {
      const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL' } = payload || {};
      if (!text) return Response.json({ success: false, message: 'No text provided.' });

      const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (!res.ok) {
        return Response.json({ success: false, message: 'TTS unavailable.' });
      }

      const audioBuffer = await res.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      return Response.json({ success: true, audio_base64: base64, mime: 'audio/mpeg' });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});