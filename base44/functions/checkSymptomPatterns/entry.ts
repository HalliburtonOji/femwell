/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function subtractDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const userId = body.user_id || user.id;

    const today = new Date().toISOString().split('T')[0];
    const threeDaysAgo = subtractDays(today, 3);

    const SYMPTOM_FIELDS = ['pain', 'headache', 'cramps', 'bloating', 'breast_tenderness'];
    const HIGH_THRESHOLD = 4;

    // Fetch recent checkins
    const allCheckins = await base44.asServiceRole.entities.DailyCheckins.filter({ user_id: userId });
    const recentCheckins = allCheckins.filter(c => c.date >= threeDaysAgo);

    const alerts = [];

    if (recentCheckins.length >= 3) {
      for (const field of SYMPTOM_FIELDS) {
        const vals = recentCheckins.map(c => c[field]).filter(v => v != null);
        if (vals.length >= 3 && vals.every(v => v >= HIGH_THRESHOLD)) {
          const label = field.replace(/_/g, ' ');
          await base44.asServiceRole.entities.InsightCards.create({
            user_id: userId,
            type: 'HABIT_TIP',
            source: 'symptom_alert_engine',
            title: `Persistent ${label} noticed`,
            insight_text: `You've logged high ${label} for 3 or more days. If this is unusual for you, it may be worth noting for your next GP appointment. Your body knows best — listen to it.`,
            recommended_action_route: '/AdviceChat',
            insight_date: today,
            expires_at: addDays(today, 3),
            cycle_phase: null,
            is_read: false,
            created_at: new Date().toISOString(),
          }).catch(() => {});

          await base44.asServiceRole.entities.NotificationLog.create({
            user_id: userId,
            notification_type: 'symptom_alert',
            title: 'Something worth noting',
            body: `You've logged ${label} for 3 days running. Consider mentioning this to your doctor.`,
            sent_at: new Date().toISOString(),
            is_read: false,
            action_route: '/Insights',
            created_at: new Date().toISOString(),
          }).catch(() => {});

          alerts.push({ field, type: 'checkin_sustained' });
        }
      }
    }

    // Check SymptomLogs
    const allSymptoms = await base44.asServiceRole.entities.SymptomLogs.filter({ user_id: userId }).catch(() => []);
    const recentSymptoms = allSymptoms.filter(s => s.date >= threeDaysAgo && (s.severity || 0) >= HIGH_THRESHOLD);

    // Group by symptom_type
    const byType = {};
    for (const s of recentSymptoms) {
      const key = s.symptom_type || s.symptom_name || 'unknown';
      if (!byType[key]) byType[key] = [];
      byType[key].push(s);
    }

    for (const [symptomType, logs] of Object.entries(byType)) {
      if (logs.length >= 3) {
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: userId,
          type: 'HABIT_TIP',
          source: 'symptom_alert_engine',
          title: `${symptomType} logged for multiple days`,
          insight_text: `You've logged ${symptomType} at high severity for 3+ days. This pattern might be worth tracking and discussing with a healthcare provider if it continues.`,
          recommended_action_route: '/AdviceChat',
          insight_date: today,
          expires_at: addDays(today, 3),
          is_read: false,
          created_at: new Date().toISOString(),
        }).catch(() => {});

        alerts.push({ field: symptomType, type: 'symptom_log_sustained' });
      }
    }

    return Response.json({ success: true, alerts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});