/* eslint-disable no-undef */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  const client = createClientFromRequest(req);
  const today = new Date().toISOString().split("T")[0];

  const profiles = await client.asServiceRole.entities.UserProfile.list("-created_date", 200);

  let processed = 0;

  for (const profile of profiles) {
    if (!profile.last_period_start_date || !profile.cycle_avg_length) continue;

    const lastPeriod = new Date(profile.last_period_start_date);
    const cycleLen = profile.cycle_avg_length || 28;
    const todayDate = new Date(today);

    // ── Period prediction ──────────────────────────────────────────────────
    let nextPeriod = new Date(lastPeriod);
    while (nextPeriod <= todayDate) {
      nextPeriod = new Date(nextPeriod.getTime() + cycleLen * 86400000);
    }
    const daysUntil = Math.round((nextPeriod - todayDate) / 86400000);

    if ([1, 3, 7].includes(daysUntil)) {
      // Deduplicate — check if already sent today
      const alreadySent = await client.asServiceRole.entities.NotificationLog.filter({
        user_id: profile.user_id,
        notification_type: "phase_change",
      }, "-sent_at", 5);

      const sentToday = alreadySent.some(n =>
        n.sent_at && n.sent_at.startsWith(today)
      );

      if (!sentToday) {
        const messages = {
          7: { title: "Period in 7 days 📅", body: "Your period is likely in a week. A good time to stock up and plan lighter days." },
          3: { title: "Period in 3 days 🌸", body: "Your period is approaching. Stock up, prep cosy essentials, and schedule some rest." },
          1: { title: "Period tomorrow 🌹", body: "Your period is likely tomorrow. Be gentle with yourself today." },
        };

        await client.asServiceRole.entities.NotificationLog.create({
          user_id: profile.user_id,
          notification_type: "phase_change",
          title: messages[daysUntil].title,
          body: messages[daysUntil].body,
          sent_at: new Date().toISOString(),
          action_route: "/Today?tab=track",
          is_read: false,
        });

        await client.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          type: "CYCLE_INSIGHT",
          source: "period_prediction",
          title: messages[daysUntil].title,
          insight_text: messages[daysUntil].body,
          cycle_phase: "menstrual",
          recommended_action_route: "/Today?tab=track",
          insight_date: today,
          expires_at: new Date(Date.now() + 3 * 86400000).toISOString(),
        });

        processed++;
      }
    }

    // ── Ovulation prediction ───────────────────────────────────────────────
    const ovulationDay = cycleLen - 14;
    let ovulationDate = new Date(lastPeriod.getTime() + ovulationDay * 86400000);
    while (ovulationDate <= todayDate) {
      ovulationDate = new Date(ovulationDate.getTime() + cycleLen * 86400000);
    }
    const daysUntilOvulation = Math.round((ovulationDate - todayDate) / 86400000);

    if ([0, 2].includes(daysUntilOvulation)) {
      const ovMsg = daysUntilOvulation === 2
        ? { title: "Fertile window approaching 🌼", body: "Your fertile window starts in about 2 days. Energy often peaks around ovulation." }
        : { title: "Peak fertility today 🌸", body: "Today is around your estimated ovulation day. You may feel more energetic and social." };

      const ovSent = await client.asServiceRole.entities.NotificationLog.filter({
        user_id: profile.user_id,
        notification_type: "ovulation_alert",
      }, "-sent_at", 3);

      const ovSentToday = ovSent.some(n => n.sent_at && n.sent_at.startsWith(today));

      if (!ovSentToday) {
        await client.asServiceRole.entities.NotificationLog.create({
          user_id: profile.user_id,
          notification_type: "ovulation_alert",
          title: ovMsg.title,
          body: ovMsg.body,
          sent_at: new Date().toISOString(),
          action_route: "/Pulse",
          is_read: false,
        });
      }
    }

    // ── Daily check-in nudge ───────────────────────────────────────────────
    const todayCheckins = await client.asServiceRole.entities.DailyCheckins.filter({
      user_id: profile.user_id,
      date: today,
    }, "-created_date", 1);

    if (todayCheckins.length === 0) {
      const nudgeSent = await client.asServiceRole.entities.NotificationLog.filter({
        user_id: profile.user_id,
        notification_type: "daily_checkin_reminder",
      }, "-sent_at", 3);

      const nudgeSentToday = nudgeSent.some(n => n.sent_at && n.sent_at.startsWith(today));

      if (!nudgeSentToday) {
        await client.asServiceRole.entities.NotificationLog.create({
          user_id: profile.user_id,
          notification_type: "daily_checkin_reminder",
          title: "How are you today? 🌿",
          body: "30 seconds to log your mood, energy and sleep. Your patterns thank you.",
          sent_at: new Date().toISOString(),
          action_route: "/Today",
          is_read: false,
        });
      }
    }
  }

  return Response.json({ ok: true, processed, profiles_scanned: profiles.length });
});