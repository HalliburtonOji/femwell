/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const todayStr = () => new Date().toISOString().split('T')[0];
const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

async function logNotification(base44, userId, type, title, body, actionRoute, metadata) {
  await base44.asServiceRole.entities.NotificationLog.create({
    user_id: userId,
    notification_type: type,
    title,
    body,
    sent_at: new Date().toISOString(),
    is_read: false,
    action_route: actionRoute || null,
    metadata_json: metadata ? JSON.stringify(metadata) : null,
    created_at: new Date().toISOString(),
  }).catch(() => {});
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = todayStr();
    const now = nowHHMM();
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const results = [];

    for (const profile of profiles) {
      if (!profile.user_id) continue;
      const uid = profile.user_id;

      // 1. Daily check-in reminder
      if (profile.reminder_checkin_time && now >= profile.reminder_checkin_time) {
        const checkins = await base44.asServiceRole.entities.DailyCheckins.filter({ user_id: uid, date: today });
        if (checkins.length === 0) {
          // Check not already sent today
          const existing = await base44.asServiceRole.entities.NotificationLog.filter({ user_id: uid, notification_type: 'daily_checkin_reminder' });
          const sentToday = existing.some(n => n.sent_at?.startsWith(today));
          if (!sentToday) {
            await logNotification(base44, uid, 'daily_checkin_reminder', "Time to check in 🌸", "Log how you're feeling today. It only takes a moment.", "/Today?open_log=1");
            results.push({ uid, type: 'daily_checkin_reminder' });
          }
        }
      }

      // 2. Medication reminders
      const medReminders = await base44.asServiceRole.entities.MedicationReminders.filter({ user_id: uid }).catch(() => []);
      for (const med of medReminders) {
        if (!med.reminder_time || now < med.reminder_time) continue;
        const existing = await base44.asServiceRole.entities.NotificationLog.filter({ user_id: uid, notification_type: 'medication_reminder' });
        const sentToday = existing.some(n => n.sent_at?.startsWith(today) && n.metadata_json?.includes(med.id));
        if (!sentToday) {
          await logNotification(base44, uid, 'medication_reminder', `Time for ${med.medication_name || 'your medication'}`, "Don't forget your scheduled medication.", "/Today", { med_id: med.id });
          results.push({ uid, type: 'medication_reminder', med: med.medication_name });
        }
      }

      // 3. Program reminder at 8pm
      if (now >= '20:00') {
        const userPrograms = await base44.asServiceRole.entities.UserPrograms.filter({ user_id: uid });
        const active = userPrograms.filter(p => p.status === 'active' || p.is_saved);
        if (active.length > 0) {
          const anyDoneToday = active.some(p => p.last_activity_date === today);
          if (!anyDoneToday) {
            const existing = await base44.asServiceRole.entities.NotificationLog.filter({ user_id: uid, notification_type: 'program_reminder' });
            const sentToday = existing.some(n => n.sent_at?.startsWith(today));
            if (!sentToday) {
              await logNotification(base44, uid, 'program_reminder', "Your program is waiting", "You haven't done today's session yet. A few minutes is all it takes.", "/ProgramsHub");
              results.push({ uid, type: 'program_reminder' });
            }
          }
        }
      }

      // 4. Streak alert at 7pm
      if (now >= '19:00') {
        const userPrograms = await base44.asServiceRole.entities.UserPrograms.filter({ user_id: uid });
        const streakProg = userPrograms.find(p => (p.streak_count || 0) > 0 && p.last_activity_date !== today);
        if (streakProg) {
          const existing = await base44.asServiceRole.entities.NotificationLog.filter({ user_id: uid, notification_type: 'streak_alert' });
          const sentToday = existing.some(n => n.sent_at?.startsWith(today));
          if (!sentToday) {
            await logNotification(base44, uid, 'streak_alert', `Don't break your ${streakProg.streak_count}-day streak! 🔥`, "Complete today's session to keep your momentum going.", "/ProgramsHub");
            results.push({ uid, type: 'streak_alert' });
          }
        }
      }

      // 5. Hydration nudge at 2pm
      if (now >= '14:00') {
        const targetMl = profile.hydration_target_ml || 2000;
        const hydLogs = await base44.asServiceRole.entities.HydrationLog.filter({ user_id: uid, day_key: today }).catch(() => []);
        const totalMl = hydLogs.reduce((s, l) => s + (l.amount_ml || 0), 0);
        if (totalMl < targetMl * 0.5) {
          const existing = await base44.asServiceRole.entities.NotificationLog.filter({ user_id: uid, notification_type: 'hydration_nudge' });
          const sentToday = existing.some(n => n.sent_at?.startsWith(today));
          if (!sentToday) {
            await logNotification(base44, uid, 'hydration_nudge', "Time to hydrate 💧", `You've had ${Math.round(totalMl)}ml today. You're less than halfway to your goal.`, "/Today");
            results.push({ uid, type: 'hydration_nudge' });
          }
        }
      }
    }

    return Response.json({ success: true, sent: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});