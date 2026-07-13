// circlesConfig — the curated Circles catalogue (Community Phase 4, §3.6).
//
// Circles are whole-life cohorts you opt into: life stages, conditions (special-category,
// careful copy + consent), and shared interests. The catalogue is CURATED (a fixed set,
// like the rooms) — not user-created — so there is no circle-creation moderation, no vanity
// "create a circle" surface, and no member counts anywhere. Match is on stage + interest,
// NEVER on cycle phase as a wall. Lurkable (read without joining), opt-in to participate.
//
// IMPORTANT: the CIRCLE_KEYS here must stay in sync with the inlined key allowlists in the
// self-contained functions createCommunityPost / joinCircle / leaveCircle (Base44 deploy
// gotcha #1 — no shared import across the function boundary).
//
// DECISION (2026-06-11): the catalogue is a STATIC constant — there is deliberately NO `Circle`
// DB entity (a `GET /entities/Circle` 404 is expected/correct). Who-joined lives in the
// `CircleMembership` entity (RLS-locked); a post's circle scope lives in `CommunityPost.circle`.
// Do NOT add a `Circle` entity — a fixed, curated cohort set belongs in code, like the rooms.

export const CIRCLES = [
  // ── Life stages ──────────────────────────────────────────────────────────
  { key: "ttc",           name: "Trying to conceive",  line: "The two-week waits, the hope, the not-talking-about-it.", category: "Life stages" },
  { key: "pregnancy",     name: "Pregnancy",           line: "However it's going — the wonder and the worry, week by week.", category: "Life stages" },
  { key: "postpartum",    name: "Postpartum",          line: "The fourth trimester and beyond. Newborn fog, healing, becoming.", category: "Life stages" },
  { key: "perimenopause", name: "Perimenopause",       line: "The shift before the shift. Naming what no one warned you about.", category: "Life stages" },
  { key: "menopause",     name: "Menopause & after",   line: "Through it and out the other side. Honest, unfiltered, together.", category: "Life stages" },

  // ── Living with (special-category — sensitive, consent on join) ───────────
  { key: "pcos", name: "PCOS",          line: "Cysts, hormones, the long road to a diagnosis and past it.", category: "Living with", sensitive: true },
  { key: "endo", name: "Endometriosis", line: "The pain that gets dismissed. Here it's believed.",          category: "Living with", sensitive: true },
  { key: "pmdd", name: "PMDD",          line: "The two weeks that take you under. You're not too much.",     category: "Living with", sensitive: true },

  // ── Shared loves (interests) ─────────────────────────────────────────────
  { key: "books",      name: "Books & reading",   line: "What you're reading, what wrecked you, what's next.", category: "Shared loves" },
  { key: "career",     name: "Career & ambition", line: "Work, pay, the dumb questions, the big swings.",      category: "Shared loves" },
  { key: "creativity", name: "Creativity",        line: "Making things, however small. Permission to play.",   category: "Shared loves" },
  { key: "movement",   name: "Movement & walks",  line: "Walks, swims, stretches — bodies in motion, kindly.", category: "Shared loves" },
];

export const CIRCLE_CATEGORIES = ["Life stages", "Living with", "Shared loves"];

export const CIRCLE_KEYS = CIRCLES.map((c) => c.key);
export const circleByKey = (key) => CIRCLES.find((c) => c.key === key) || null;

// Connectivity P6 — suggest circles from the profile's life_stage + interests
// (followed_categories), so onboarding/Profile taste feeds Circle discovery.
const STAGE_TO_CIRCLE = {
  ttc: "ttc", "pre-ttc": "ttc",
  "pregnant-t1": "pregnancy", "pregnant-t2": "pregnancy", "pregnant-t3": "pregnancy", pregnant: "pregnancy",
  postpartum: "postpartum", perimenopause: "perimenopause",
  menopause: "menopause", "post-menopause": "menopause",
};
const INTEREST_TO_CIRCLE = {
  books: "books", reading: "books", book: "books",
  career: "career", work: "career", money: "career", finance: "career",
  creativity: "creativity", art: "creativity", craft: "creativity", creative: "creativity",
  movement: "movement", fitness: "movement", walking: "movement", walks: "movement", exercise: "movement", yoga: "movement",
};
export function suggestedCircles(profile) {
  const keys = new Set();
  const stage = profile?.life_stage;
  if (stage && STAGE_TO_CIRCLE[stage]) keys.add(STAGE_TO_CIRCLE[stage]);
  const interests = Array.isArray(profile?.followed_categories) ? profile.followed_categories : [];
  for (const raw of interests) {
    const k = INTEREST_TO_CIRCLE[String(raw || "").toLowerCase()];
    if (k) keys.add(k);
  }
  return [...keys].map(circleByKey).filter(Boolean);
}

// The careful, consent-first note shown before joining a special-category circle.
// (Feature #4: adds the UK-GDPR "leaving removes you from the member list" line.)
export const SENSITIVE_CONSENT = (name) =>
  `This circle gathers people living with ${name}. What's shared here is sensitive — post anonymously, never anything that could identify you. Joining is your choice; leaving removes you from the member list, and you can leave any time.`;

// ── Per-circle RITUAL PROMPT (feature #4) — a warm, low-barrier, life-tinted opener per
// circle, seeded deterministically per day (like the room/QOTD prompts). Gives a lurker an
// on-ramp; a circle never reads empty. Whole-life by design (a condition circle also talks life).
export const CIRCLE_PROMPTS = {
  ttc:           ["One kind thing you did for yourself in the wait this week?", "What helped on a hard day recently?", "What are you quietly hopeful about?"],
  pregnancy:     ["What surprised you about this week — good or strange?", "One thing you want to remember from right now?", "What's the room's best comfort tip?"],
  postpartum:    ["What got you through the fog today, however small?", "One thing no one warned you about?", "What would you tell a new-you a month ago?"],
  perimenopause: ["The symptom no one warned you about — name it here.", "What's actually helped, if anything?", "One small win this week?"],
  menopause:     ["What's freer about this chapter than you expected?", "What do you wish younger women knew?", "One thing that helped this week?"],
  pcos:          ["What's one thing that's helped you feel more yourself?", "A myth about PCOS you'd love to bust?", "Beyond symptoms — what brought you joy this week?"],
  endo:          ["What helped on a flare day recently?", "A time you were finally believed — how did it feel?", "One good thing this week, pain aside?"],
  pmdd:          ["A kind thing you can do for luteal-you in advance?", "What helps you ride the two weeks?", "One small light this week?"],
  books:         ["What are you reading — and what's it doing to you?", "A book that wrecked you (in a good way)?", "What's next on your pile?"],
  career:        ["A work win, however small, this week?", "The question you'd never ask aloud — ask it here.", "What are you trying to change about work?"],
  creativity:    ["What did you make this week — however tiny?", "What do you want to try but haven't dared?", "Share a line, a stitch, a sketch."],
  movement:      ["How did you move today — gently counts?", "A walk/swim/stretch that felt good lately?", "What's your kind goal this week?"],
};
export function circlePromptForDay(circleKey) {
  const list = CIRCLE_PROMPTS[circleKey];
  if (!list || !list.length) return null;
  const day = new Date().toISOString().split("T")[0];
  const epoch = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
  const i = (((epoch % list.length) + list.length) % list.length);
  return list[i];
}

// ── Per-condition NHS / charity INFO ANCHOR (feature #4) — one calm, grounded line atop a
// condition circle. The k-anon substitute for upvoting good info + a misinformation counterweight
// (JMIR 2025). Peer support, never a diagnosis; points to NHS/established charities.
export const CIRCLE_INFO = {
  pcos:          { line: "Peer support, not medical advice. For PCOS care, the NHS and Verity (the UK PCOS charity) are solid starting points.", href: "https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/" },
  endo:          { line: "Peer support, not medical advice. Endometriosis UK and the NHS have reliable, up-to-date information.", href: "https://www.nhs.uk/conditions/endometriosis/" },
  pmdd:          { line: "Peer support, not medical advice. If PMDD is affecting your life, the NHS and Mind can help you find the right support.", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
  perimenopause: { line: "Peer support, not medical advice. The NHS and the Daisy Network / Menopause Matters have grounded guidance.", href: "https://www.nhs.uk/conditions/menopause/" },
  menopause:     { line: "Peer support, not medical advice. The NHS has clear, current menopause information and treatment options.", href: "https://www.nhs.uk/conditions/menopause/" },
};

// ── JESS "FIRST LIGHT" (substance #3) — a warm, circle-specific opener so a live circle never
// reads empty. Rendered as Jess's voice (client-side; no post created). One warm line per circle,
// wrapped in a shared frame. When a woman leaves her first line in the circle, the existing
// jessSupport fn (backstop mode) is prompted so she also gets a real reply — never met with silence.
export const CIRCLE_FIRST_LIGHT = {
  ttc:           "This is a soft place for the wait — the hope, the ache, the not-talking-about-it. Whatever's happening in your cycle, you're among women who get it.",
  pregnancy:     "However this is going for you — the wonder and the worry both belong here, week by week.",
  postpartum:    "The fourth trimester is a lot. Newborn fog, healing, becoming — you can bring all of it here.",
  perimenopause: "The shift before the shift is real, and often dismissed. Here it's named, and believed.",
  menopause:     "Through it and out the other side — honest and unfiltered. Nothing's too much for this room.",
  pcos:          "The long road with PCOS is easier shared. Symptoms and life both — you don't have to be clinical here.",
  endo:          "The pain that gets dismissed elsewhere is believed here. So is the rest of your life.",
  pmdd:          "The two weeks that take you under don't make you too much. You're among women who understand.",
  books:         "For what you're reading, what wrecked you, what's next — pull up a chair.",
  career:        "Work, pay, the dumb questions, the big swings — say the thing you'd never say aloud.",
  creativity:    "Whatever you're making, however small — this is your permission to play.",
  movement:      "Bodies in motion, kindly — walks, swims, stretches, and the days you didn't manage either.",
};
export const circleFirstLight = (key) => CIRCLE_FIRST_LIGHT[key] || "You're welcome here exactly as you are.";

// ── CIRCLE RHYTHM (substance #3) — each circle gathers around a recurring moment, tying it into the
// Together/Events heartbeat. `tag` matches the curated online sessions in EventsTogether; `moment`
// is the belonging line. Signposts into the Events shelf (no new events invented here).
export const CIRCLE_RHYTHM = {
  ttc:           { moment: "a gentle monthly check-in and the cycle-sync evening", tag: "wellness" },
  pregnancy:     { moment: "the cycle-sync evening and soft online meet-ups", tag: "wellness" },
  postpartum:    { moment: "a gentle co-working hour while babies nap", tag: "online" },
  perimenopause: { moment: "the cycle-sync evening and gentle wellness sessions", tag: "wellness" },
  menopause:     { moment: "honest wellness sessions and online meet-ups", tag: "wellness" },
  pcos:          { moment: "gentle wellness sessions and the cycle-sync evening", tag: "wellness" },
  endo:          { moment: "gentle wellness sessions and the cycle-sync evening", tag: "wellness" },
  pmdd:          { moment: "the cycle-sync evening — soft company for the hard fortnight", tag: "wellness" },
  books:         { moment: "the weekly book-club call", tag: "books" },
  career:        { moment: "the co-working hour — gentle body-doubling", tag: "online" },
  creativity:    { moment: "a making hour and the co-working sessions", tag: "online" },
  movement:      { moment: "group walks and the gentle movement sessions", tag: "wellness" },
};
export const circleRhythm = (key) => CIRCLE_RHYTHM[key] || null;

// belonging cue — is THIS circle one her profile (stage/interest) points to? (never inferred from
// tracked cycle/symptoms — only self-declared stage + followed interests, same guardrail as discovery)
export function circleBelongsTo(key, profile) {
  return suggestedCircles(profile).some((c) => c.key === key);
}

// device-local joined-state (anonymous, same model as reactions/qotd — no read needed for UX)
export const isJoined = (key) => { try { return localStorage.getItem("fw_circle_" + key) === "1"; } catch { return false; } };
export const markJoined = (key) => { try { localStorage.setItem("fw_circle_" + key, "1"); } catch { /* ignore */ } };
export const clearJoined = (key) => { try { localStorage.removeItem("fw_circle_" + key); } catch { /* ignore */ } };
// first-line-in-this-circle flag (for the guaranteed Jess welcome reply, once per circle per device)
export const circlePostedEver = (key) => { try { return localStorage.getItem("fw_circle_posted_" + key) === "1"; } catch { return false; } };
export const markCirclePosted = (key) => { try { localStorage.setItem("fw_circle_posted_" + key, "1"); } catch { /* ignore */ } };
// "your circle has been active" nudge — remember the last post-count I saw per circle
export const circleSeenCount = (key) => { try { return Number(localStorage.getItem("fw_circle_seen_" + key) || 0); } catch { return 0; } };
export const markCircleSeen = (key, n) => { try { localStorage.setItem("fw_circle_seen_" + key, String(n)); } catch { /* ignore */ } };
