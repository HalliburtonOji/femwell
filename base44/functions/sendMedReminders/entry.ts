import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMin = now.getUTCMinutes();
    // Match reminders within the current 30-minute window
    const windowStart = Math.floor(currentMin / 30) * 30;

    const [allReminders, allUsers] = await Promise.all([
      base44.asServiceRole.entities.MedicationReminders.filter({ is_active: true }),
      base44.asServiceRole.entities.User.list(),
    ]);

    const userMap = {};
    allUsers.forEach(u => { userMap[u.id] = u; });

    let sent = 0;
    for (const reminder of allReminders) {
      if (!reminder.reminder_time) continue;
      const [rHour, rMin] = reminder.reminder_time.split(':').map(Number);
      const rMinWindow = Math.floor(rMin / 30) * 30;

      if (currentHour === rHour && windowStart === rMinWindow) {
        const u = userMap[reminder.user_id];
        if (!u?.email) continue;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          from_name: 'FemWell',
          subject: `💊 Medication Reminder: ${reminder.medication_name}`,
          body: `Hi ${u.full_name || 'there'},\n\nTime to take your medication!\n\n💊 ${reminder.medication_name}${reminder.dose ? ` — ${reminder.dose}` : ''}\n\nStay on track with your wellness journey 🌸\n\n— FemWell`,
        });
        sent++;
      }
    }

    return Response.json({ sent, checked: allReminders.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});