/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function getCyclePhase(lastPeriodDate, cycleLen, periodLen) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = new Date(lastPeriodDate);
  const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const cycleDay = (daysSince % cycleLen) + 1;
  if (cycleDay <= periodLen) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 17) return 'ovulatory';
  return 'luteal';
}

// Timeout guard — an awaited platform read/write that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

const PHASE_PARTNER_MSG = {
  menstrual: { label: "Menstrual phase", description: "She's in her menstrual phase — energy tends to be lower and rest is important right now. A quiet evening in or gentle support goes a long way.", emoji: "🌙" },
  follicular: { label: "Follicular phase", description: "She's in her follicular phase — energy is rising and she may feel more social and enthusiastic. A great time for new plans or activities together.", emoji: "🌱" },
  ovulatory: { label: "Ovulatory phase", description: "She's in her ovulatory phase — this is typically when energy and confidence are at their peak. She may be feeling her best right now.", emoji: "✨" },
  luteal: { label: "Luteal phase", description: "She's in her luteal phase — energy begins to wind down and she may need more comfort and understanding. Small acts of care really count here.", emoji: "🍂" },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { access_token } = body;

    if (!access_token) return Response.json({ error: 'access_token required' }, { status: 400 });

    // Find the PartnerAccess record
    const accesses = await withTimeout(base44.asServiceRole.entities.PartnerAccess.filter({ access_token, is_active: true }), 2500, 'filter').catch(() => []);
    const access = accesses[0];
    if (!access) return Response.json({ error: 'Invalid or expired link' }, { status: 404 });

    // Check expiry
    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return Response.json({ error: 'This link has expired' }, { status: 403 });
    }

    // Update last_accessed_at
    await withTimeout(base44.asServiceRole.entities.PartnerAccess.update(access.id, { last_accessed_at: new Date().toISOString() }), 6000, 'update').catch(() => null);

    const permissions = access.permissions || [];
    const uid = access.owner_user_id;

    const [profiles, todayCheckins, userPrograms, allPrograms] = await Promise.all([
      withTimeout(base44.asServiceRole.entities.UserProfile.filter({ user_id: uid }), 2500, 'filter').catch(() => []),
      withTimeout(base44.asServiceRole.entities.DailyCheckins.filter({ user_id: uid, date: new Date().toISOString().split('T')[0] }), 2500, 'filter').catch(() => []),
      permissions.includes('programs') ? withTimeout(base44.asServiceRole.entities.UserPrograms.filter({ user_id: uid }), 2500, 'filter').catch(() => []) : Promise.resolve([]),
      permissions.includes('programs') ? withTimeout(base44.asServiceRole.entities.Programs.list('-created_date', 20), 2500, 'list').catch(() => []) : Promise.resolve([]),
    ]);

    const profile = profiles[0];
    const todayCheckin = todayCheckins[0];
    const phase = profile?.last_period_start_date
      ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
      : null;

    const phaseInfo = phase ? PHASE_PARTNER_MSG[phase] : null;

    // Build safe response — NO symptoms, no journals, no sexual health
    const responseData = {
      phase: permissions.includes('cycle_phase') ? phase : null,
      phase_info: permissions.includes('cycle_phase') ? phaseInfo : null,
      mood_emoji: permissions.includes('mood') && todayCheckin?.mood ? ['😔','😟','😐','🙂','😊'][todayCheckin.mood - 1] || null : null,
      energy_emoji: permissions.includes('energy') && todayCheckin?.energy ? ['🪫','😴','⚡','✨','🚀'][todayCheckin.energy - 1] || null : null,
      active_program: null,
      weekly_message: null,
    };

    if (permissions.includes('programs')) {
      const activeEntry = (userPrograms || []).find(p => p.status === 'active' || p.is_saved);
      if (activeEntry) {
        const prog = allPrograms.find(p => p.id === activeEntry.program_id);
        if (prog) {
          responseData.active_program = {
            title: prog.title,
            current_day: activeEntry.current_day || 1,
            duration_days: prog.duration_days,
            streak: activeEntry.streak_count || 0,
          };
        }
      }
    }

    // Generate weekly phase message
    if (phase && permissions.includes('cycle_phase')) {
      const weeklyMessages = {
        menstrual: "This week she may feel lower energy and more inward-focused. Warmth, rest, and gentle company are especially appreciated.",
        follicular: "This week she may feel curious, energised, and open to new experiences. A great time to plan things together.",
        ovulatory: "This week she may be feeling her most confident and communicative — a good time for meaningful conversations.",
        luteal: "This week she may feel more reflective and in need of comfort. Small thoughtful gestures go further than you'd think.",
      };
      responseData.weekly_message = weeklyMessages[phase];
    }

    return Response.json({ success: true, data: responseData });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});