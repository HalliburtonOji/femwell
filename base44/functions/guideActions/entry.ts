/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MEDICATION_FAMILIES = {
  paracetamol: ["paracetamol", "acetaminophen", "tylenol", "panadol", "calpol"],
  ibuprofen: ["ibuprofen", "advil", "nurofen", "motrin"],
};

function normalizeMedicationName(name = '') {
  const normalized = name.toLowerCase().trim();
  const family = Object.entries(MEDICATION_FAMILIES).find(([, aliases]) => aliases.some(alias => normalized.includes(alias)));
  return {
    input: name,
    normalized,
    family: family?.[0] || normalized,
    canonical_name: family?.[0] === 'paracetamol' ? 'paracetamol' : family?.[0] || normalized,
  };
}

function parseDoseMg(dose = '') {
  const match = String(dose).toLowerCase().match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2];
  if (unit === 'g') return value * 1000;
  if (unit === 'mcg') return value / 1000;
  return value;
}

function toDateTimeFromLog(record) {
  return new Date(record.created_date || `${record.date}T12:00:00.000Z`);
}

function evaluateMedicationSafety(history, itemName, dose) {
  const med = normalizeMedicationName(itemName);
  const currentDoseMg = parseDoseMg(dose);
  const relevantHistory = history.filter(log => normalizeMedicationName(log.item_name).family === med.family);
  const now = new Date();
  const last24h = relevantHistory.filter(log => now.getTime() - toDateTimeFromLog(log).getTime() <= 24 * 60 * 60 * 1000);
  const total24hMg = last24h.reduce((sum, log) => sum + (parseDoseMg(log.dose) || 0), 0) + (currentDoseMg || 0);
  const latest = relevantHistory.sort((a, b) => toDateTimeFromLog(b).getTime() - toDateTimeFromLog(a).getTime())[0];
  const hoursSinceLastDose = latest ? Number(((now.getTime() - toDateTimeFromLog(latest).getTime()) / (1000 * 60 * 60)).toFixed(1)) : null;

  let severity = 'none';
  let display_message = '';
  if (med.family === 'paracetamol') {
    if (hoursSinceLastDose !== null && hoursSinceLastDose < 4) {
      severity = 'warning';
      display_message = `This was logged ${hoursSinceLastDose} hours after your previous paracetamol entry, so please double-check the timing before taking more.`;
    }
    if (total24hMg >= 4000) {
      severity = 'urgent';
      display_message = `You've logged ${Math.round(total24hMg)} mg of paracetamol in the past 24 hours. Please get urgent medical advice or contact poison help now.`;
    } else if (total24hMg >= 3000 && severity !== 'urgent') {
      severity = 'caution';
      display_message = `You've logged ${Math.round(total24hMg)} mg of paracetamol in the past 24 hours, so be careful not to exceed your daily limit.`;
    }
  }

  return {
    severity,
    reason: display_message || null,
    total_24h_mg: currentDoseMg ? Math.round(total24hMg) : null,
    last_dose_interval_hours: hoursSinceLastDose,
    ingredient_family: med.family,
    canonical_name: med.canonical_name,
    display_message,
  };
}

function parseReminderTime(input = '') {
  const text = input.toLowerCase().trim();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, payload } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    if (action === 'resolve_pending_action') {
      const { pending_action, user_reply } = payload || {};
      if (!pending_action?.type || !user_reply) {
        return Response.json({ success: false, message: 'Missing follow-up details.' });
      }
      if (pending_action.type === 'set_program_reminder') {
        const reminder_time = parseReminderTime(user_reply);
        if (!reminder_time) {
          return Response.json({
            success: false,
            needs_follow_up: true,
            pending_action,
            message: 'What time should I set it for? For example: 9pm.',
          });
        }
        const programs = await base44.entities.UserPrograms.filter({ user_id: user.id });
        const activeProgram = programs.find(p => p.is_saved || p.status === 'active');
        if (!activeProgram) {
          return Response.json({ success: false, message: "I couldn't find an active program reminder to update." });
        }
        await base44.entities.UserPrograms.update(activeProgram.id, { reminder_time });
        return Response.json({
          success: true,
          message: `Done — I set your program reminder for ${reminder_time}.`,
          data: { reminder_time, user_program_id: activeProgram.id },
        });
      }
    }

    // ── GET COACH CONTEXT (personalised system prompt context) ────────────
    if (action === 'get_coach_context') {
      const [profiles, recentCheckins, phaseHistory, correlations] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: user.id }),
        base44.entities.DailyCheckins.filter({ user_id: user.id }, '-date', 7),
        base44.entities.PhaseHistory.filter({ user_id: user.id }, '-date', 1),
        base44.entities.Correlations.filter({ user_id: user.id }),
      ]);
      const profile = profiles[0] || {};
      const lastCheckin = recentCheckins[0] || null;
      const phaseToday = phaseHistory[0] || null;
      const avgOf = (arr, field) => {
        const vals = arr.map(c => c[field]).filter(v => v != null);
        return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
      };
      const context = {
        cycle_phase: phaseToday?.phase ?? profile?.current_phase ?? 'unknown',
        cycle_day: phaseToday?.cycle_day ?? null,
        life_stage: profile?.life_stage ?? 'none',
        condition_flags: profile?.condition_flags ?? [],
        tone_preference: profile?.tone_preference ?? 'warm',
        goals: profile?.goals ?? [],
        recent_mood_avg: avgOf(recentCheckins, 'mood'),
        recent_sleep_avg: avgOf(recentCheckins, 'sleep_hours'),
        recent_stress_avg: avgOf(recentCheckins, 'stress'),
        last_checkin_date: lastCheckin?.date ?? null,
        top_correlations: correlations.slice(0, 3).map(c => c.explanation_text).filter(Boolean),
        hydration_target_ml: profile?.hydration_target_ml ?? 2000,
      };
      const toneRules = {
        warm: 'Use warm, validating language. Never prescriptive.',
        clinical: 'Be direct, evidence-based, minimal emotional language.',
        motivational: 'Use energising, forward-looking, action-oriented language.',
        straight: 'Be concise, no filler, no affirmations.',
        minimal: 'Answer only what was asked, no elaboration.',
      };
      const systemPrompt = `You are a personal wellness guide for ${user.full_name || user.email}.

CURRENT USER CONTEXT:
- Cycle phase: ${context.cycle_phase}${context.cycle_day ? ` (day ${context.cycle_day})` : ''}
- Life stage: ${context.life_stage}
- Health conditions: ${context.condition_flags.join(', ') || 'none reported'}
- Goals: ${context.goals.join(', ') || 'general wellness'}
- Tone preference: ${context.tone_preference}

RECENT WELLBEING (last 7 days):
- Average mood: ${context.recent_mood_avg != null ? `${context.recent_mood_avg}/5` : 'not logged'}
- Average sleep: ${context.recent_sleep_avg != null ? `${context.recent_sleep_avg}h` : 'not logged'}
- Average stress: ${context.recent_stress_avg != null ? `${context.recent_stress_avg}/5` : 'not logged'}
- Last check-in: ${context.last_checkin_date ?? 'none recorded'}

PERSONAL PATTERNS DETECTED:
${context.top_correlations.length ? context.top_correlations.map(c => `- ${c}`).join('\n') : '- Not enough data yet to detect personal patterns'}

TONE RULES:
- ${toneRules[context.tone_preference] ?? toneRules.warm}

SAFETY RULES:
- Never diagnose.
- For symptoms lasting 3+ days or severity 4+/5, suggest speaking to a GP.
- Never recommend stopping medication.
- Always acknowledge that individual experience varies.
- Do not use filler phrases like "Oh honey", "bestie", or "sweetie" unless the user has explicitly used casual language first.

${context.cycle_phase === 'luteal' ? 'Note: User is in their luteal phase — acknowledge potential PMS context where relevant.' : ''}
${context.life_stage === 'pregnancy' ? 'Note: User is pregnant — adjust all advice for pregnancy safety.' : ''}
${context.life_stage === 'menopause' ? 'Note: User is in menopause — tailor advice for menopause-specific needs.' : ''}`;
      return Response.json({ success: true, data: { context, system_prompt: systemPrompt } });
    }

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

    // ── SET PROGRAM REMINDER ───────────────────────────────────────────────
    if (action === 'set_program_reminder') {
      const reminder_time = parseReminderTime(payload?.reminder_time || '');
      const programs = await base44.entities.UserPrograms.filter({ user_id: user.id });
      const activeProgram = programs.find(p => p.is_saved || p.status === 'active');
      if (!activeProgram) {
        return Response.json({ success: false, message: "You don't have an active program yet, so I can't set that reminder." });
      }
      if (!reminder_time) {
        return Response.json({
          success: false,
          needs_follow_up: true,
          pending_action: { type: 'set_program_reminder', user_program_id: activeProgram.id },
          message: 'What time should I set the reminder?',
        });
      }
      await base44.entities.UserPrograms.update(activeProgram.id, { reminder_time });
      return Response.json({
        success: true,
        message: `Done — I set your program reminder for ${reminder_time}.`,
        data: { reminder_time, user_program_id: activeProgram.id },
      });
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

    // ── LOG MEDICATION ─────────────────────────────────────────────────────
    if (action === 'log_medication') {
      const { item_name, dose, notes } = payload || {};
      if (!item_name) return Response.json({ success: false, message: 'What medication should I log?' });
      const history = await base44.entities.MedicationLogs.filter({ user_id: user.id }, '-created_date', 50);
      const safety = evaluateMedicationSafety(history, item_name, dose || '');
      await base44.entities.MedicationLogs.create({ user_id: user.id, date: today, item_name: safety.canonical_name || item_name, dose: dose || '', notes: notes || '', taken: true });
      return Response.json({
        success: true,
        message: safety.display_message
          ? `Done — I logged ${safety.canonical_name || item_name}${dose ? ` ${dose}` : ''} for today.\n\n${safety.display_message}`
          : `Done — I logged ${safety.canonical_name || item_name}${dose ? ` ${dose}` : ''} for today.`,
        data: { safety },
      });
    }

    // ── SAVE / UNSAVE CONTENT ──────────────────────────────────────────────
    if (action === 'toggle_saved_item') {
      const { item_id, item_type = 'CONTENT', title, preview_text } = payload || {};
      if (!item_id || !title) return Response.json({ success: false, message: 'Missing item details.' });
      const existing = await base44.entities.SavedItems.filter({ user_id: user.id, item_id });
      if (existing.length > 0) {
        await base44.entities.SavedItems.delete(existing[0].id);
        return Response.json({ success: true, message: `Removed "${title}" from your saved items.` });
      }
      await base44.entities.SavedItems.create({ user_id: user.id, item_id, item_type, title, preview_text: preview_text || '', created_at: new Date().toISOString() });
      return Response.json({ success: true, message: `Saved "${title}" to your items.` });
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