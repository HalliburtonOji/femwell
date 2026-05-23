// Shared phase recommendation data — single source of truth for
// phase-aware copy across the app.
//
// Consumers:
//   • JessDemoPanel.jsx — For You tab "This week" 5-category cards
//   • PlannerV2Shell.jsx — Body Today phase-personalisation chip strip
//
// UK English, second person, no emoji. Add new copy here rather than
// duplicating phase-specific strings into individual components.

export const PHASE_RECS = {
  menstrual: {
    nutrition: [
      "Iron-forward meals: lentils, dark leafy greens, beef or liver if you eat it",
      "Pair iron with vitamin C — squeeze lemon on the greens",
      "Warm cooked food over salads; stew, soup, congee, roast roots",
    ],
    movement: [
      "Walking and gentle yoga move blood without taxing energy",
      "Skip the HIIT this week — your nervous system is in repair mode",
      "Pelvic-floor stretches ease cramps for many people",
    ],
    rest: [
      "Hot water bottle on the lower belly or back — 20 minutes, twice a day",
      "Earlier bed by 30 minutes — sleep need rises in the menstrual phase",
      "Naps under 25 minutes don't disrupt the night-time cycle",
    ],
    mood: [
      "Lower the bar this week — that's information, not failure",
      "Journaling for 5 minutes can name the feelings that surface in week 1",
      "If you're irritable, it's hormonal. Don't make decisions you'll regret",
    ],
    social: [
      "Decline what you can — your social battery is genuinely lower",
      "One trusted person beats five surface conversations this week",
      "Reschedule the 'maybe' invites — your future self will thank you",
    ],
  },
  follicular: {
    nutrition: [
      "Leaner proteins, fresh veg, sprouted grains — your gut handles variety well now",
      "Fermented foods (kefir, kimchi, sauerkraut) support rising oestrogen",
      "Lighter breakfasts work — appetite is naturally lower this phase",
    ],
    movement: [
      "Strength training is your friend — muscles build best in the first half",
      "Try a new class or sport — coordination and learning peak now",
      "Cardio feels easier — push the pace a bit",
    ],
    rest: [
      "You may need slightly less sleep — 7 hours often enough this phase",
      "Morning light walks set the circadian rhythm for the whole cycle",
      "Save big rest blocks for luteal week instead",
    ],
    mood: [
      "Optimism rises with oestrogen — ride it, plan ahead",
      "Creative work lands well — brainstorm, draft, design",
      "Confidence is real this week, not a performance",
    ],
    social: [
      "Schedule the harder conversations now — communication is sharper",
      "Try the thing you've been putting off — first impressions go well",
      "Network, present, ask — this is your visibility window",
    ],
  },
  ovulatory: {
    nutrition: [
      "High-protein, anti-inflammatory: salmon, eggs, leafy greens, berries",
      "Hydration is critical — body temperature is up around ovulation",
      "Cruciferous veg (broccoli, kale, sprouts) help oestrogen metabolism",
    ],
    movement: [
      "Peak strength and stamina — schedule the hardest session of the cycle",
      "Group classes and team sport land well — your social drive is high",
      "Cool down properly — heat regulation is harder this week",
    ],
    rest: [
      "Sleep slightly later if you can — body temperature drop is delayed",
      "A 10-minute wind-down ritual offsets the natural alertness",
      "Skip caffeine after 2 pm — sensitivity is higher this phase",
    ],
    mood: [
      "Confidence and clarity are at their best — make the bold ask today",
      "Communication peaks — write the email, send the message",
      "If something feels off socially, trust it — your read on people is sharp",
    ],
    social: [
      "This is your visibility window — schedule the meeting, post, present",
      "Date nights and reconnections land especially well",
      "Lead with warmth — your charisma is at its highest",
    ],
  },
  luteal: {
    nutrition: [
      "Magnesium-rich foods: dark chocolate, pumpkin seeds, almonds, banana",
      "Complex carbs (oats, sweet potato, rye) steady week-3 mood dips",
      "Reduce alcohol and sugar — both worsen PMS for most people",
    ],
    movement: [
      "Pilates, swimming, and walking match your energy better than HIIT",
      "Strength is still possible — just lower the volume by 20%",
      "Stretching before bed helps with the restless luteal nights",
    ],
    rest: [
      "Earlier bed by 45 minutes — sleep need rises through luteal week",
      "Wind down with no screens 30 minutes before bed",
      "If you wake at 3-4am, try magnesium glycinate (check with your GP)",
    ],
    mood: [
      "Sensitivity rises — that's biology, not weakness",
      "Big feelings are valid; big decisions can wait a few days",
      "Track what soothes you — patterns emerge across cycles",
    ],
    social: [
      "Batch admin and chores now — save creative collaboration for next cycle",
      "Smaller, quieter gatherings beat big nights out this week",
      "Tell your closest people what you need — they often can't guess",
    ],
  },
};

// NEXT_PHASE_PREVIEW — used by JessDemoPanel For You tab "Coming up"
// section. Each phase carries the name of the next phase, a two-sentence
// preview, and one prep tip.
export const NEXT_PHASE_PREVIEW = {
  menstrual: {
    nextPhase: "Follicular",
    preview:
      "Oestrogen is starting to climb back up. Energy, focus and curiosity will lift over the next few days.",
    prepTip:
      "Choose one thing you've been putting off — follicular is the easiest week to start it.",
  },
  follicular: {
    nextPhase: "Ovulatory",
    preview:
      "You're heading into your peak window. Communication, confidence and physical output are about to be at their highest.",
    prepTip:
      "Block 2-3 hours of deep work in your calendar for the next 3-4 days — you'll be sharper than usual.",
  },
  ovulatory: {
    nextPhase: "Luteal",
    preview:
      "Energy will ease back as progesterone takes over. Your body shifts into a quieter, more inward week.",
    prepTip:
      "Front-load the week — finish the harder tasks now, save admin and gentler work for days 20+.",
  },
  luteal: {
    nextPhase: "Menstrual",
    preview:
      "Your period is approaching. Energy will dip and your body will ask for warmth, rest and slower food.",
    prepTip:
      "Stock the cupboard: iron-rich snacks, a hot water bottle on standby, painkillers in reach.",
  },
};
