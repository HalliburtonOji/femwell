/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

// ── Community WEB PUSH sweep (F3, 2026-08-06) — FOLDED here instead of a new function: base44's
// hard cap is 50 functions and we're AT it, so a dedicated pushSweep can't deploy. This existing
// scheduled reminder fn is the right home (already automated, already writes NotificationLog). The
// community sweep is ADDITIVE (runs once, after the per-profile loop) and can never affect the
// existing reminders 1–5. Sends the ONE time-based nudge that can't fire inline: your-turn in a game
// gone quiet, ≤ once per ~20h per player (NotificationLog-guarded). Real-time reply/DM push fires
// inline from createCommunityPost, not here.
const CHOUR = 3600 * 1000;
function communityVapidReady() {
  try {
    const pub = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    const priv = Deno.env.get('VAPID_PRIVATE_KEY') || '';
    const sub = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@femwells.com';
    if (!pub || !priv) return false;
    webpush.setVapidDetails(sub, pub, priv);
    return true;
  } catch { return false; }
}
async function communitySendToHash(base44, authorHash, uid, payload) {
  const sb = base44.asServiceRole;
  const subs = await sb.entities.PushSubscription.filter({ author_hash: authorHash, active: true }, '-created_date', 20).catch(() => []);
  if (!Array.isArray(subs) || !subs.length) return false;
  const data = JSON.stringify(payload);
  const nowISO = new Date().toISOString();
  let sent = false;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, data);
      sent = true;
      await sb.entities.PushSubscription.update(s.id, { last_sent_at: nowISO }).catch(() => {});
    } catch (e) {
      const code = e?.statusCode || e?.status;
      if (code === 404 || code === 410) await sb.entities.PushSubscription.update(s.id, { active: false }).catch(() => {});
    }
  }
  return sent;
}
// The community turn-nudge sweep — additive; never throws.
async function communityTurnSweep(base44) {
  const out = { scanned: 0, nudged: 0 };
  try {
    if (!communityVapidReady()) return out;
    const sb = base44.asServiceRole;
    const now = Date.now();
    const STALE_MIN = 24 * CHOUR, STALE_MAX = 5 * 24 * CHOUR, RENUDGE = 20 * CHOUR;
    const games = await sb.entities.GameMatch.filter({ status: 'active' }, '-last_move_at', 200).catch(() => []);
    for (const g of (Array.isArray(games) ? games : [])) {
      const t = new Date(g.last_move_at || g.updated_date || g.created_date || 0).getTime();
      const idle = now - t;
      if (!(idle >= STALE_MIN && idle <= STALE_MAX)) continue;
      out.scanned++;
      const turnHash = g.turn === 'b' ? g.b_hash : g.a_hash;
      if (!turnHash) continue;
      const subs = await sb.entities.PushSubscription.filter({ author_hash: turnHash, active: true }, '-created_date', 1).catch(() => []);
      const uid = Array.isArray(subs) && subs[0] ? subs[0].user_id : '';
      if (!uid) continue;
      const recent = await sb.entities.NotificationLog.filter({ user_id: uid, notification_type: 'community_turn' }, '-sent_at', 1).catch(() => []);
      const lastAt = Array.isArray(recent) && recent[0] ? new Date(recent[0].sent_at || 0).getTime() : 0;
      if (now - lastAt < RENUDGE) continue;
      const ok = await communitySendToHash(base44, turnHash, uid, {
        title: "It's your turn", body: "A gentle round is waiting for you in the community.",
        route: '/Community?view=games', type: 'community_turn',
      });
      if (ok) {
        out.nudged++;
        await sb.entities.NotificationLog.create({ user_id: uid, notification_type: 'community_turn', title: "It's your turn", body: "A gentle round is waiting for you in the community.", action_route: '/Community?view=games', sent_at: new Date().toISOString(), is_read: false, created_at: new Date().toISOString() }).catch(() => {});
      }
    }
  } catch { /* never break the reminder run */ }
  return out;
}

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

    // 6. Community — your-turn push sweep (additive; folded here vs a new fn per the 50-fn cap).
    const community = await communityTurnSweep(base44);

    return Response.json({ success: true, sent: results.length, results, community });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});