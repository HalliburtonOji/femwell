/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Phase calculation ─────────────────────────────────────────────────────────
function getPhaseAndDay(lastPeriodDateStr, cycleLength = 28) {
  if (!lastPeriodDateStr) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const last = new Date(lastPeriodDateStr);
  last.setUTCHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - last) / 86400000);
  const cycleDay = (diffDays % cycleLength) + 1;
  let phase;
  if (cycleDay <= 5) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulatory';
  else phase = 'luteal';
  return { phase, cycleDay };
}

// ── Content banks (5+ options per phase) ─────────────────────────────────────
const DAILY_PLAN = {
  menstrual: [
    { session_recommendation: 'Yin Yoga for Cramp Relief', nutrition_nudge: 'Focus on iron-rich foods today — lentils, spinach, dark chocolate', mental_tool: 'Body scan meditation to ease tension', focus_for_today: 'Rest and restore', lifestyle_suggestion: 'Take a warm bath with magnesium salts tonight' },
    { session_recommendation: '10-min Gentle Stretch & Breathwork', nutrition_nudge: 'Warm soups and stews support digestion during your period', mental_tool: 'Journaling: what do you need most today?', focus_for_today: 'Honour your body\'s need for stillness', lifestyle_suggestion: 'Use a heat pad for lower back or cramp relief' },
    { session_recommendation: 'Restorative Rest Session', nutrition_nudge: 'Omega-3s help reduce prostaglandin-driven cramps — salmon, walnuts, flaxseed', mental_tool: '4-7-8 breathing to calm the nervous system', focus_for_today: 'One gentle thing at a time', lifestyle_suggestion: 'Wear loose, comfortable clothing and reduce screen brightness' },
    { session_recommendation: 'Guided Body Compassion Meditation', nutrition_nudge: 'Limit caffeine and alcohol which worsen bloating and irritability', mental_tool: 'Write 3 things your body is doing well right now', focus_for_today: 'Self-compassion over productivity', lifestyle_suggestion: 'Sleep earlier — your body is doing significant work' },
    { session_recommendation: 'Slow Flow for Period Days', nutrition_nudge: 'Magnesium-rich foods ease cramps: pumpkin seeds, dark chocolate, avocado', mental_tool: 'Loving-kindness meditation for difficult days', focus_for_today: 'Low demands, high kindness', lifestyle_suggestion: 'Cancel non-essential commitments if you can today' },
  ],
  follicular: [
    { session_recommendation: 'HIIT Boost — 20 minutes', nutrition_nudge: 'Cruciferous veg support oestrogen metabolism: broccoli, cauliflower, kale', mental_tool: 'Morning intention-setting — what do you want to create this week?', focus_for_today: 'Start something new', lifestyle_suggestion: 'Plan a social event or creative project this week' },
    { session_recommendation: 'Strength Training — Upper Body', nutrition_nudge: 'Lean protein supports muscle recovery and hormone building', mental_tool: 'Visualisation: picture your ideal outcome for one current goal', focus_for_today: 'Energy is rising — use it', lifestyle_suggestion: 'Try a new recipe or activity you\'ve been putting off' },
    { session_recommendation: 'Dance Cardio — Feel-Good Flow', nutrition_nudge: 'Fermented foods like kefir and kimchi support a healthy microbiome this phase', mental_tool: 'Brainstorm without editing — free-write ideas for 10 minutes', focus_for_today: 'Creativity and momentum', lifestyle_suggestion: 'Schedule your most demanding tasks this week while energy is high' },
    { session_recommendation: 'Core & Pilates Flow', nutrition_nudge: 'Complex carbs like oats and quinoa provide sustained energy as oestrogen rises', mental_tool: 'Affirmation: I am capable of more than I realise', focus_for_today: 'Build and grow', lifestyle_suggestion: 'Reach out to someone you\'ve been meaning to connect with' },
    { session_recommendation: 'Run or Power Walk — 30 minutes', nutrition_nudge: 'Zinc from pumpkin seeds and legumes supports follicle development', mental_tool: 'Clarity check-in: what is one thing I want to accomplish this month?', focus_for_today: 'Initiative and confidence', lifestyle_suggestion: 'Get outside — sunlight and movement amplify rising oestrogen' },
  ],
  ovulatory: [
    { session_recommendation: 'Peak Performance Workout — Full Body', nutrition_nudge: 'Fibre helps clear excess oestrogen: flaxseeds, beans, whole grains', mental_tool: 'Speak your truth: practise a conversation you\'ve been avoiding', focus_for_today: 'Communicate and connect', lifestyle_suggestion: 'Schedule important meetings or presentations today — your charisma peaks now' },
    { session_recommendation: 'Strength PR Session — Go for a Personal Best', nutrition_nudge: 'Light, fresh foods like salads and smoothies suit your elevated metabolism', mental_tool: 'Assertiveness practice: state one need clearly to someone today', focus_for_today: 'Peak performance', lifestyle_suggestion: 'Make your most important decisions today — clarity is at its peak' },
    { session_recommendation: 'Hot Yoga or High-Intensity Cardio', nutrition_nudge: 'Anti-inflammatory foods reduce the testosterone-driven sebum spike: turmeric, berries', mental_tool: 'Gratitude journaling — what\'s going well right now?', focus_for_today: 'Shine and lead', lifestyle_suggestion: 'Wear something that makes you feel confident today' },
    { session_recommendation: 'Group Fitness Class or Team Sport', nutrition_nudge: 'Hydration is key as temperature regulation changes — aim for 2.5L today', mental_tool: 'Write down your three biggest strengths and how you\'ll use them this week', focus_for_today: 'Collaboration and output', lifestyle_suggestion: 'Host, meet, or connect — social energy is highest now' },
    { session_recommendation: 'Interval Running or Cycling', nutrition_nudge: 'BHA-friendly snacks: raw carrots, cucumber, and hummus keep skin clear during the surge', mental_tool: 'Set one bold intention for the rest of the month', focus_for_today: 'Drive and visibility', lifestyle_suggestion: 'Start that project or send that email you\'ve been overthinking' },
  ],
  luteal: [
    { session_recommendation: 'Pilates or Low-Impact Strength', nutrition_nudge: 'Complex carbs ease PMS cravings: sweet potato, brown rice, oats', mental_tool: 'Evening reflection: what went well and what would you change?', focus_for_today: 'Complete, don\'t start', lifestyle_suggestion: 'Wind down screens an hour before bed — sleep quality drops this phase' },
    { session_recommendation: 'Yoga for PMS and Mood Support', nutrition_nudge: 'B6 from chickpeas, bananas and turkey helps regulate progesterone-driven mood dips', mental_tool: 'Boundary check-in: where do I need to say no this week?', focus_for_today: 'Slow down and consolidate', lifestyle_suggestion: 'Reduce caffeine and swap for herbal teas to ease anxiety and bloating' },
    { session_recommendation: 'Walking Meditation — 30 minutes outside', nutrition_nudge: 'Magnesium from dark leafy greens eases bloating and improves sleep', mental_tool: 'Write what you\'ve achieved this cycle — celebrate it', focus_for_today: 'Inner reflection and release', lifestyle_suggestion: 'Batch cook meals ahead — cooking energy drops premenstrually' },
    { session_recommendation: 'Gentle Strength — Light Weights, High Reps', nutrition_nudge: 'Reduce salt to ease water retention: avoid processed foods this week', mental_tool: '5-4-3-2-1 grounding exercise when anxiety spikes', focus_for_today: 'Steady and consistent', lifestyle_suggestion: 'Prioritise sleep — aim for 8+ hours as progesterone makes you naturally tired' },
    { session_recommendation: 'Restorative Yoga — Evening Practice', nutrition_nudge: 'Dark chocolate (85%+) satisfies cravings and provides magnesium', mental_tool: 'Journaling: what emotions are coming up and what do they need?', focus_for_today: 'Tend and nurture', lifestyle_suggestion: 'Book something restorative for the weekend — a bath, massage, or time alone' },
  ],
};

const PHASE_BRIEFS = {
  menstrual: [
    { headline: 'Rest is productive today', body_tip: 'Oestrogen and progesterone are at their lowest. Your body is working hard — the uterus is contracting, iron is being lost, and energy is diverted inward. This is not a failure state; it\'s a biological reset.', energy_note: 'Energy is naturally low. Reduce expectations and honour that.', mood_note: 'You may feel more inward, tender, or emotional. This is cyclically normal — not a character flaw.', food_suggestion: 'Iron-rich foods: lentils, spinach, red meat, pumpkin seeds. Avoid caffeine which worsens cramps.', movement_suggestion: 'Gentle yin yoga, walking, or rest. No HIIT — your body is already working.' },
    { headline: 'Your body is doing something remarkable', body_tip: 'Menstruation is a full system flush. Pain, fatigue, and sensitivity are signals — not weaknesses. The more you work with them, the easier this phase becomes over time.', energy_note: 'Lower than usual. Pace yourself across the day.', mood_note: 'Introspective and potentially emotional. Journalling helps more than pushing through.', food_suggestion: 'Warm, cooked foods: soups, stews, root vegetables. Avoid cold and raw foods.', movement_suggestion: 'Slow stretching, breathwork, or a short walk in fresh air.' },
    { headline: 'The quiet phase has its own power', body_tip: 'Low oestrogen means your brain accesses both hemispheres more equally — this is a good time for reflection, problem-solving, and letting go of what isn\'t working.', energy_note: 'Low but steady. Use your clearest hour of the day for anything important.', mood_note: 'You may crave solitude. That\'s valid. Honour it where you can.', food_suggestion: 'Dark chocolate, walnuts, avocado — all rich in magnesium to ease cramps and mood.', movement_suggestion: 'Restorative yoga, slow swimming, or nothing at all.' },
    { headline: 'Bleed without apology', body_tip: 'Your period is not an inconvenience — it\'s a monthly health report. Pain, clots, and irregularity are signals worth tracking. You\'re doing that.', energy_note: 'If fatigue is severe, check iron levels with your GP.', mood_note: 'Lower serotonin this week means irritability is biochemical, not personal.', food_suggestion: 'Vitamin C with iron-rich foods boosts absorption: orange juice with lentil soup.', movement_suggestion: 'Child\'s pose, gentle hip openers, and legs up the wall.' },
    { headline: 'A reset, not a retreat', body_tip: 'Think of menstruation as the body\'s built-in maintenance window. Immune function, digestion, and hormonal balance are all resetting.', energy_note: 'Keep demands minimal today if possible.', mood_note: 'Sensitivity is heightened — be gentle with yourself and set boundaries easily.', food_suggestion: 'Ginger and turmeric tea reduces inflammation and soothes cramps.', movement_suggestion: 'Rest or 15 minutes of slow, intuitive stretching.' },
  ],
  follicular: [
    { headline: 'Your energy window is opening', body_tip: 'Rising oestrogen boosts serotonin, dopamine, and physical resilience. Your brain is sharper, your mood is lifting, and your body is stronger. This is your green-light phase.', energy_note: 'Energy is climbing. A great week to front-load your schedule.', mood_note: 'Optimism and motivation are higher than usual. Use this window intentionally.', food_suggestion: 'Cruciferous vegetables support oestrogen metabolism: broccoli, rocket, Brussels sprouts.', movement_suggestion: 'Push your training. Your body recovers faster and handles more load.' },
    { headline: 'Fresh starts belong to this phase', body_tip: 'Follicular oestrogen creates neuroplasticity — learning new things, changing habits, and building routines all stick better now than at any other point in the cycle.', energy_note: 'Physical and mental stamina are rising. Make the most of it.', mood_note: 'Social confidence is increasing. Reach out, connect, initiate.', food_suggestion: 'Protein with every meal to support muscle building and hormone production.', movement_suggestion: 'Strength training, cardio, or anything new and energising.' },
    { headline: 'The comeback is in full swing', body_tip: 'After menstruation\'s reset, follicular oestrogen drives cellular repair, collagen synthesis, and mood lift. Your skin glows, your voice is stronger, and your wit is sharper.', energy_note: 'Sustained energy — plan ambitious things without fear of flagging.', mood_note: 'Feeling more like yourself. Lean into it.', food_suggestion: 'Fermented foods like yogurt, kefir and sauerkraut boost gut health this phase.', movement_suggestion: 'Try something new — a class, a route, a sport. Your body is ready.' },
    { headline: 'Oestrogen is your tailwind', body_tip: 'This phase is your biological advantage. Oestrogen acts as a natural antidepressant, anti-inflammatory, and performance enhancer. Work with it.', energy_note: 'Higher than baseline. Use the early part of the day for your most demanding tasks.', mood_note: 'Clarity and positivity are peaking. Journal your intentions for this cycle.', food_suggestion: 'Zinc-rich foods support follicle development: pumpkin seeds, legumes, shellfish.', movement_suggestion: 'Increase intensity gradually — your pain tolerance is also higher now.' },
    { headline: 'Create now, rest later', body_tip: 'The follicular phase is nature\'s creative sprint. Ideas flow, plans feel achievable, and risk feels manageable. This is not an accident — it\'s hormonal design.', energy_note: 'Strong and building. Perfect for long projects or demanding workouts.', mood_note: 'You may feel braver and more expressive than usual. Good. Use it.', food_suggestion: 'Complex carbohydrates give sustained energy: oats, quinoa, sweet potato.', movement_suggestion: 'Dance, run, climb — anything that matches your rising energy.' },
  ],
  ovulatory: [
    { headline: 'You are at your peak — and you feel it', body_tip: 'Peak oestrogen boosts confidence, communication, physical performance, and attractiveness signals. Testosterone adds drive and libido. This is your most outward, powerful window.', energy_note: 'Peak physical and cognitive energy. Make big decisions and do hard things.', mood_note: 'High confidence and social openness. Ideal for difficult conversations or presentations.', food_suggestion: 'Fibre to support oestrogen clearance: flaxseeds, beans, whole grains.', movement_suggestion: 'Go for personal bests. Your strength, speed, and recovery are at their highest.' },
    { headline: 'Your charisma is biological today', body_tip: 'Research shows voices are measurably more appealing, faces are more symmetrical, and communication is more persuasive around ovulation. Your body is designed to shine right now.', energy_note: 'Explosive energy available. Channel it consciously.', mood_note: 'Extroverted and expressive. Great for networking, pitching, or reconnecting.', food_suggestion: 'Anti-inflammatory foods to manage testosterone-driven skin: turmeric, berries, green tea.', movement_suggestion: 'Group exercise, team sport, or a workout that challenges you.' },
    { headline: 'Lead from your strongest self', body_tip: 'Ovulation is the hinge point of the cycle. You have full hormonal support for almost everything — leadership, creativity, physical output, and connection.', energy_note: 'Sustained and high. This is your longest strong day.', mood_note: 'Centred and capable. Others will feel it too.', food_suggestion: 'Lean protein and healthy fats to sustain the energy surge.', movement_suggestion: 'High-intensity training, heavy lifting, or anything that challenges your max.' },
    { headline: 'Speak up, reach out, make moves', body_tip: 'Ovulatory oestrogen makes social risk feel lower and reward feel higher. Your instinct to connect and create is biologically supported. Act on it.', energy_note: 'Fast and clear. Cognitive performance is measurably highest this week.', mood_note: 'Assertive and warm. A rare and powerful combination.', food_suggestion: 'Hydration is critical — higher metabolism means higher fluid needs.', movement_suggestion: 'Fast, powerful exercise: sprints, circuits, HIIT.' },
    { headline: 'This is your natural prime time', body_tip: 'Every metric — strength, mood, cognition, libido, recovery — peaks around ovulation. You\'re not imagining it. Work with your biology, not against it.', energy_note: 'Do the hardest thing on your list today.', mood_note: 'Optimistic and magnetic. A great day to be visible.', food_suggestion: 'Mineral-rich foods for hormonal support: pumpkin seeds, sesame, Brazil nuts.', movement_suggestion: 'Whatever you love most, and push further than usual.' },
  ],
  luteal: [
    { headline: 'The wind-down begins — and that\'s okay', body_tip: 'Progesterone rises and oestrogen drops. Your body is preparing for either pregnancy or menstruation. This phase requires more sleep, more food, and less pressure.', energy_note: 'Energy is steady but falling. Front-load tasks early in the week.', mood_note: 'More inward and critical. Don\'t make permanent decisions about temporary feelings.', food_suggestion: 'Complex carbs and B6 ease mood swings: bananas, chickpeas, turkey, brown rice.', movement_suggestion: 'Moderate effort — Pilates, swimming, walking. Avoid extreme intensity.' },
    { headline: 'Your brain sees what others miss', body_tip: 'Luteal progesterone activates a different cognitive mode — detail-oriented, critical, and reflective. You\'re better at spotting problems and finishing things than starting new ones.', energy_note: 'Lower than last week. Schedule completion tasks, not new launches.', mood_note: 'Sensitivity is heightened. Take space when you need it — it\'s not weakness.', food_suggestion: 'Magnesium reduces PMS symptoms: dark leafy greens, dark chocolate, avocado.', movement_suggestion: 'Gentle strength, yoga, or long slow walks.' },
    { headline: 'Rest is not laziness — it\'s luteal logic', body_tip: 'Progesterone is sedating. Sleep needs increase by 20–30 minutes. Digestion slows. Your body is pulling resources inward. Give it what it needs.', energy_note: 'Conserve energy for what matters most. Edit and simplify.', mood_note: 'Emotional processing is deeper now. Journalling is especially powerful.', food_suggestion: 'Reduce salt and alcohol to ease water retention and anxiety.', movement_suggestion: 'Restorative yoga, gentle stretching, or nature walking.' },
    { headline: 'Completion over creation', body_tip: 'This is nature\'s editing phase — you\'re wired to refine, reflect, and release. Don\'t fight the pull toward introspection; use it to audit what\'s not working.', energy_note: 'Lowest at the very end of this phase. Plan light days before your period.', mood_note: 'Irritability is biochemical, not a character flaw. Track it, don\'t suppress it.', food_suggestion: 'Calcium reduces PMS symptoms by up to 48%: dairy, fortified plant milks, almonds.', movement_suggestion: 'Slow it down — this isn\'t the week for personal bests.' },
    { headline: 'The premenstrual phase is real, not in your head', body_tip: 'PMDD affects 3–8% of people with cycles. Severe PMS is not normal and is treatable. Your luteal symptoms are worth tracking and worth discussing with a doctor.', energy_note: 'Variable. Some days will feel heavier than others.', mood_note: 'If mood is significantly disrupting your life this phase, speak to a GP.', food_suggestion: 'Evening primrose oil, vitamin E, and B-complex reduce PMS for many people.', movement_suggestion: 'Even 20 minutes of walking reduces progesterone-driven anxiety significantly.' },
  ],
};

const PHASE_INSIGHTS = {
  menstrual: [
    { title: 'Your pain threshold changes with your cycle', insight_text: 'Pain sensitivity is highest during menstruation due to low oestrogen. This isn\'t in your head — prostaglandins trigger uterine contractions and increase nerve sensitivity. Ibuprofen (an anti-prostaglandin) works best taken before peak pain, not after.' },
    { title: 'Iron loss during your period is real', insight_text: 'The average person loses 30–80ml of blood per period, which equates to 15–35mg of iron. Low iron causes fatigue, brain fog, and low mood — symptoms often blamed on stress or personality. If you feel consistently worse during your period, ask your GP to check ferritin levels.' },
    { title: 'Your period is a monthly health report', insight_text: 'Colour, flow, clotting, and pain level all carry information. Very heavy bleeding, large clots, or debilitating cramps are not "just part of it" — they can indicate fibroids, endometriosis, or adenomyosis. You deserve an answer.' },
    { title: 'Cold sensitivity spikes during menstruation', insight_text: 'Low oestrogen reduces thermoregulation efficiency. Many people feel colder, have colder hands and feet, and struggle to warm up during their period. This is why warm food, baths, and heat pads work so well — it\'s not just comfort, it\'s physiology.' },
    { title: 'Why you crave carbs during your period', insight_text: 'Low serotonin during menstruation triggers carbohydrate cravings because carbs temporarily boost serotonin production. Eating complex carbs like oats and sweet potato satisfies the craving without a sugar crash.' },
  ],
  follicular: [
    { title: 'Oestrogen makes new habits stick', insight_text: 'Neuroplasticity — the brain\'s ability to form new connections — is measurably higher during the follicular phase. This means habits, skills, and patterns learned now are more likely to persist. Starting a new routine this week isn\'t just hopeful thinking; it\'s biologically supported.' },
    { title: 'Your pain tolerance is higher this week', insight_text: 'Rising oestrogen has an analgesic effect, increasing your pain threshold. Intense workouts, waxing, dental appointments, or anything uncomfortable is better tolerated now than at any other phase. Schedule demanding physical things this week.' },
    { title: 'Follicular oestrogen boosts verbal fluency', insight_text: 'Studies show verbal memory and speed of information processing peak in the follicular phase. If you have presentations, pitches, or important conversations coming up, this is the week to schedule them.' },
    { title: 'Your gut microbiome changes with your cycle', insight_text: 'Oestrogen influences gut bacteria composition, and follicular-phase oestrogen is associated with more diverse, healthier microbiome patterns. Probiotic-rich foods like kefir, yogurt, and kimchi are especially beneficial now.' },
    { title: 'Skin is at its most resilient right now', insight_text: 'Oestrogen stimulates collagen production, oil production is balanced, and the skin barrier is at its strongest. This is the best week to introduce retinoids, chemical exfoliants, or any active skincare ingredient that requires a robust barrier to tolerate.' },
  ],
  ovulatory: [
    { title: 'Your voice changes around ovulation', insight_text: 'Research has found that voice pitch and pleasantness are measurably higher around ovulation due to oestrogen\'s effect on vocal cord elasticity. Public speaking, recording, or hosting important calls today isn\'t just confidence — it\'s biology working in your favour.' },
    { title: 'Testosterone drives your ambition today', insight_text: 'A brief testosterone surge at ovulation increases competitive drive, risk appetite, and confidence. This is why ovulatory days often feel like the best time to ask for a raise, start a negotiation, or tackle something that\'s been sitting on your list.' },
    { title: 'Ovulation increases your physical output ceiling', insight_text: 'Peak oestrogen increases muscle glycogen storage, reduces perception of effort, and speeds up recovery. Research shows women lift more, run faster, and recover quicker in the days around ovulation. Your personal best is most likely to happen this week.' },
    { title: 'Skin clarity peaks at ovulation — then drops', insight_text: 'The ovulatory peak in oestrogen gives the clearest skin of the cycle, but a simultaneous testosterone surge begins to increase sebum. This is the ideal day for photos, events, or presentations where you want to look your best.' },
    { title: 'Social cognition is sharpest at ovulation', insight_text: 'Ovulatory oestrogen enhances theory of mind — the ability to understand others\' perspectives and read emotional cues. Negotiation, conflict resolution, or difficult interpersonal conversations are best handled during this window.' },
  ],
  luteal: [
    { title: 'Why you feel hungrier before your period', insight_text: 'Progesterone increases basal metabolic rate by up to 300 calories in the luteal phase. Your body is burning more fuel, which drives hunger and cravings. Eating slightly more — especially complex carbs — is not weakness; it\'s meeting a genuine biological need.' },
    { title: 'Luteal progesterone is sedating by design', insight_text: 'Progesterone converts to allopregnanolone, which binds to GABA receptors — the same receptors targeted by sedatives and alcohol. This is why you feel more tired, need more sleep, and find it harder to push through cognitive demands in the late luteal phase.' },
    { title: 'PMS is not inevitable', insight_text: 'Severe PMS and PMDD are often linked to nutritional deficiencies (B6, magnesium, calcium), sleep debt, chronic stress, and gut dysbiosis — all of which are addressable. Tracking your symptoms is the first step to understanding your specific drivers.' },
    { title: 'Your detail-orientation is an asset this week', insight_text: 'Luteal progesterone activates a more cautious, detail-focused cognitive mode. This isn\'t anxiety — it\'s precision. Editing documents, auditing projects, reviewing decisions, and noticing errors are all things you\'re better at this week than in the follicular phase.' },
    { title: 'Alcohol hits harder in the luteal phase', insight_text: 'Low oestrogen slows alcohol metabolism and increases sensitivity to its depressant effects. A drink that felt fine last week may feel heavier now. If mood is already lower, alcohol reliably makes it worse — even if it feels like relief in the moment.' },
  ],
};

function pickByDay(arr, date) {
  const dayOfYear = Math.floor((new Date(date) - new Date(new Date(date).getFullYear(), 0, 0)) / 86400000);
  return arr[dayOfYear % arr.length];
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0];

    // Week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setUTCDate(monday.getUTCDate() + diffToMonday);
    const weekStart = monday.toISOString().split('T')[0];

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    let created = { phaseHistory: 0, dailyPlan: 0, phaseBrief: 0, insightCard: 0 };

    for (const profile of profiles) {
      if (!profile.user_id || !profile.last_period_start_date) continue;

      const cycleLength = profile.cycle_avg_length || 28;
      const phaseData = getPhaseAndDay(profile.last_period_start_date, cycleLength);
      if (!phaseData) continue;
      const { phase, cycleDay } = phaseData;

      // ── 1. PhaseHistory ───────────────────────────────────────────────────
      const existingPhase = await base44.asServiceRole.entities.PhaseHistory.filter({ user_id: profile.user_id, date: today }).catch(() => []);
      if (existingPhase.length === 0) {
        await base44.asServiceRole.entities.PhaseHistory.create({
          user_id: profile.user_id,
          user_email: profile.user_email || '',
          date: today,
          phase,
          cycle_day: cycleDay,
          cycle_length_used: cycleLength,
          period_length_used: 5,
          last_period_date_used: profile.last_period_start_date,
          calculation_method: 'profile',
          created_at: new Date().toISOString(),
        });
        created.phaseHistory++;
      }

      // ── 2. DailyPlan ──────────────────────────────────────────────────────
      const existingPlan = await base44.asServiceRole.entities.DailyPlan.filter({ user_id: profile.user_id, day_key: today }).catch(() => []);
      if (existingPlan.length === 0) {
        const plan = pickByDay(DAILY_PLAN[phase], today);
        await base44.asServiceRole.entities.DailyPlan.create({
          user_id: profile.user_id,
          day_key: today,
          ...plan,
          created_at: new Date().toISOString(),
        });
        created.dailyPlan++;
      }

      // ── 3. DailyPhaseBrief ────────────────────────────────────────────────
      const existingBrief = await base44.asServiceRole.entities.DailyPhaseBrief.filter({ user_id: profile.user_id, date: today }).catch(() => []);
      if (existingBrief.length === 0) {
        const brief = pickByDay(PHASE_BRIEFS[phase], today);
        await base44.asServiceRole.entities.DailyPhaseBrief.create({
          user_id: profile.user_id,
          date: today,
          cycle_phase: phase,
          cycle_day: cycleDay,
          ...brief,
          created_at: new Date().toISOString(),
        });
        created.phaseBrief++;
      }

      // ── 4. InsightCard (once per week) ────────────────────────────────────
      const existingInsight = await base44.asServiceRole.entities.InsightCards.filter({ user_id: profile.user_id, source: 'daily_data_generator', insight_date: weekStart }).catch(() => []);
      if (existingInsight.length === 0) {
        const insight = pickByDay(PHASE_INSIGHTS[phase], today);
        await base44.asServiceRole.entities.InsightCards.create({
          user_id: profile.user_id,
          type: 'PHASE_INSIGHT',
          source: 'daily_data_generator',
          cycle_phase: phase,
          insight_date: weekStart,
          title: insight.title,
          insight_text: insight.insight_text,
          confidence: 0.85,
          is_read: false,
          created_at: new Date().toISOString(),
        });
        created.insightCard++;
      }
    }

    return Response.json({ success: true, processed: profiles.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});