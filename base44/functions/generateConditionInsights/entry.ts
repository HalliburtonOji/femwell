/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function getCycleDay(profile, dateStr) {
  if (!profile.last_period_start_date) return null;
  const date = new Date(dateStr || new Date());
  const last = new Date(profile.last_period_start_date);
  const diff = Math.floor((date - last) / (1000 * 60 * 60 * 24));
  return (diff % (profile.cycle_avg_length || 28)) + 1;
}

// deno-lint-ignore no-undef
// eslint-disable-next-line no-undef
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0];

    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    for (const profile of profiles) {
      if (!profile.user_id) continue;
      const flags = profile.condition_flags || [];
      const lifeStage = profile.life_stage || 'none';
      const cycleDay = getCycleDay(profile, today);

      const insightBase = {
        user_id: profile.user_id,
        user_email: profile.user_email,
        source: 'condition_engine',
        insight_date: today,
        is_read: false,
        confidence: 0.75,
        recommended_action_route: null,
      };

      // PCOS — weekly habit tip
      if (flags.includes('pcos')) {
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 1) { // Monday
          const tips = [
            { title: 'Insulin sensitivity tip', text: 'Resistance training 2-3x per week can improve insulin sensitivity by up to 25% in women with PCOS. Even 20-minute sessions make a difference.' },
            { title: 'Androgen management', text: 'Spearmint tea has shown anti-androgen properties in small studies — 2 cups daily may help reduce hirsutism over 4-6 weeks.' },
            { title: 'Cycle regularity tip', text: 'Inositol (particularly myo-inositol) is one of the most evidence-backed supplements for improving cycle regularity in PCOS. Discuss with your GP.' },
            { title: 'Blood sugar balance', text: 'Pairing carbohydrates with protein and fat at every meal slows glucose absorption — key for managing the insulin resistance pattern common in PCOS.' },
          ];
          const tip = tips[Math.floor(Math.random() * tips.length)];
          await base44.asServiceRole.entities.InsightCards.create({
            ...insightBase,
            cycle_phase: 'any',
            type: 'HABIT_TIP',
            title: tip.title,
            insight_text: tip.text,
          }).catch(() => {});
        }
      }

      // Endometriosis — menstrual phase flare tip
      if (flags.includes('endometriosis') && cycleDay && cycleDay <= (profile.period_length || 5)) {
        await base44.asServiceRole.entities.InsightCards.create({
          ...insightBase,
          cycle_phase: 'menstrual',
          type: 'PHASE_INSIGHT',
          title: 'Managing your endometriosis flare',
          insight_text: 'During menstruation, endometriosis lesions respond to hormonal changes just like uterine tissue. Heat therapy, anti-inflammatory foods (omega-3s, turmeric), and gentle movement can reduce prostaglandin-driven pain. Rest is therapeutic, not passive — your body needs it.',
        }).catch(() => {});
      }

      // PMDD — surface from day 14 onward
      if (flags.includes('pmdd') && cycleDay && cycleDay >= 14) {
        const lutealDay = cycleDay - 13;
        if (lutealDay === 1 || lutealDay === 7) { // Early and mid-luteal prompts
          await base44.asServiceRole.entities.InsightCards.create({
            ...insightBase,
            cycle_phase: 'luteal',
            type: 'MOOD_TIP',
            title: 'PMDD support — luteal phase',
            insight_text: lutealDay === 1
              ? 'You\'re entering your luteal phase — the highest-risk window for PMDD symptoms. Logging your mood daily this week builds a pattern that helps distinguish PMDD from other mood conditions. Magnesium glycinate 300mg in the evening may ease symptoms — check with your GP.'
              : 'Mid-luteal PMDD symptoms tend to peak 7-10 days before menstruation. If your mood feels disproportionately low or you\'re experiencing irritability that feels unusual, that\'s the PMDD pattern — not a reflection of who you are. Breathwork and social rest (less output, not isolation) help.',
          }).catch(() => {});
        }
      }

      // Perimenopause / menopause — cycle insight
      if (lifeStage === 'perimenopause' || lifeStage === 'menopause') {
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 3) { // Wednesday
          const tips = [
            { title: 'Managing hot flashes', text: 'Hot flashes occur when a narrowed thermoregulatory zone in the hypothalamus triggers vasodilation. Triggers include caffeine, alcohol, spicy food, and stress. A cool environment and layered clothing help. Phytoestrogens (flaxseed, soy) may reduce frequency in some women.' },
            { title: 'Sleep and hormones', text: 'Falling oestrogen disrupts sleep architecture, reducing slow-wave and REM sleep. Keeping your bedroom below 18°C, avoiding alcohol (which fragments REM), and consistent sleep timing all help your body regulate temperature overnight.' },
            { title: 'Bone health window', text: 'You lose up to 20% of bone density in the first 5 years post-menopause. Calcium (1200mg/day from food or supplement), Vitamin D (1000IU+), and weight-bearing exercise 3x/week are the most evidence-backed interventions.' },
          ];
          const tip = tips[Math.floor(new Date().getDate() / 10) % tips.length];
          await base44.asServiceRole.entities.InsightCards.create({
            ...insightBase,
            cycle_phase: 'any',
            type: 'CYCLE_INSIGHT',
            title: tip.title,
            insight_text: tip.text,
          }).catch(() => {});
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});