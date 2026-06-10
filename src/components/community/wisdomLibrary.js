// wisdomLibrary — the curated evergreen seed for Living Wisdom (Community Phase 4, §3.8).
//
// The library shows TWO sources merged: this curated seed (our editorial pick, always
// present so the collection is never empty — the same pattern as the static QOTD rotation)
// and durable WisdomEntry rows promoted from well-held echoes over time. These lines are
// anonymised community wisdom in a warm, plain voice — never clinical claims, never advice
// dressed as fact, no emoji. Whole-life, not clinical-only.
//
// CURATION MODEL (open decision flagged for Halli): launch = curated (our pick). The
// promoteWisdom path can ALSO surface community-validated lines (held echoes, holds≥5). How
// much to weight curated vs community-promoted — and whether to label the source to readers
// — is a real product call. Default here: curated seed + promoted echoes shown together,
// source unlabelled (it's shared wisdom either way).

export const WISDOM_TOPICS = ["All", "Motherhood", "Cycles", "Work", "Grief", "Rest", "Body", "Identity", "Love"];

export const WISDOM_SEED = [
  { body: "You're allowed to grieve a life you didn't choose and still love the one you have.", topic: "Identity" },
  { body: "No one warned us the tiredness would have a season. It does. It lifts.", topic: "Rest" },
  { body: "The day you stopped apologising for taking up space was the day you started healing.", topic: "Identity" },
  { body: "Your body kept a hundred secrets to keep you alive. Be a little gentler with it.", topic: "Body" },
  { body: "Some weeks you just keep the plants alive and yourself fed. That counts.", topic: "Rest" },
  { body: "You can love your child and miss who you were. Both are true at once.", topic: "Motherhood" },
  { body: "The cycle isn't betraying you. It's telling you, in the only language it has.", topic: "Cycles" },
  { body: "You don't have to earn rest by collapsing first.", topic: "Rest" },
  { body: "Asking the dumb question in the meeting is how you become the one others ask.", topic: "Work" },
  { body: "Grief doesn't get smaller. You grow around it. The growing is the work.", topic: "Grief" },
  { body: "Nobody is graded on how they got through the hard year. They just got through it.", topic: "Identity" },
  { body: "The right people don't need you to perform being fine.", topic: "Love" },
  { body: "Your worth was never a number on a scale or a payslip. It just feels that way some days.", topic: "Body" },
  { body: "Let the luteal week be quieter. The world will still be there when the tide comes back in.", topic: "Cycles" },
  { body: "You taught yourself to need so little. You're allowed to want more than that now.", topic: "Identity" },
  { body: "Saying no to the thing that drains you is saying yes to the life underneath it.", topic: "Work" },
  { body: "The mother you are at 3am is still the mother you are. Tired is not unkind.", topic: "Motherhood" },
  { body: "Some love is just someone sitting with you while it's hard, not fixing a thing.", topic: "Love" },
  { body: "What you call 'too sensitive' the people who love you call 'paying attention'.", topic: "Identity" },
  { body: "You are not behind. There is no race. There was never a race.", topic: "Rest" },
];

// A stable featured pick for a given local day (rotates daily, same for everyone) — no
// Date.now() inside any function that ships to a Base44 worker; this is client-only.
export function featuredWisdom(dateISO) {
  const d = dateISO || new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
  return WISDOM_SEED[h % WISDOM_SEED.length];
}
