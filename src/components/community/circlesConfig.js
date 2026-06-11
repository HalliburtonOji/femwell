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

// The careful, consent-first note shown before joining a special-category circle.
export const SENSITIVE_CONSENT = (name) =>
  `This circle gathers people living with ${name}. What's shared here is sensitive — post anonymously, never anything that could identify you. Joining is your choice, and you can leave any time.`;

// device-local joined-state (anonymous, same model as reactions/qotd — no read needed for UX)
export const isJoined = (key) => { try { return localStorage.getItem("fw_circle_" + key) === "1"; } catch { return false; } };
export const markJoined = (key) => { try { localStorage.setItem("fw_circle_" + key, "1"); } catch { /* ignore */ } };
export const clearJoined = (key) => { try { localStorage.removeItem("fw_circle_" + key); } catch { /* ignore */ } };
