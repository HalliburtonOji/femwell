// clubsConfig — the LIVE Jess-hosted Clubs catalogue (Community v2).
//
// Clubs are "what you do together" (distinct from Circles = "who you are"): hosted activity/
// conversation groups. Phase-1 LIVE Clubs are JESS-HOSTED and ship as this STATIC catalogue
// (like the Circles + Book Club seed) so they're live with no DB seeding — there is no `Club`
// DB row for these; who-joined lives in `ClubMembership` (RLS-locked) and a club-scoped post
// lives in `CommunityPost.club`. The Book Club is the flagship reading Club but keeps its own
// view (BookClubView / ClubNote); these are the conversation Clubs that use the shared
// room-style feed + composer (PostCard / RoomComposer scoped by club).
//
// IMPORTANT: CLUB_KEYS here MUST stay in sync with the inlined allowlists in the self-contained
// functions joinClub / leaveClub / createCommunityPost (Base44 deploy gotcha #1).
//
// MEMBER-CREATED Clubs are BUILT but FLAGGED OFF (CLUBS_USER_CREATE_ENABLED below + the server
// createClub env gate) — gated behind the OSA/ICO legal floor. The "Start a Club" affordance is
// a "coming" state only; nothing creates a live member Club until both flags flip.

export const CLUBS = [
  // ── Together (Jess-hosted conversation Clubs) ─────────────────────────────
  { key: "slow-mornings", name: "Slow mornings", line: "A gentle daily check-in — what you're carrying, what's keeping you company.", category: "Together" },
  { key: "creativity-corner", name: "Creativity corner", line: "Making things, however small. Share a line, a stitch, a sketch — permission to play.", category: "Together" },
];

export const CLUB_CATEGORIES = ["Together"];

export const CLUB_KEYS = CLUBS.map((c) => c.key);
export const clubByKey = (key) => CLUBS.find((c) => c.key === key) || null;

// ── Daily-read readers' corners ──────────────────────────────────────────────
// Every "daily read" book gets a LIGHT per-book readers' corner — the same Club /
// club-scoped-CommunityPost mechanism as the Book Club, but general (no mandatory
// chapter checkpoints), kept spoiler-safe by norm. The corner key is derived from the
// book id (e.g. a Gutenberg id), so it works against whatever the Daily Read serves
// and scales to Halli's eventual ~10-book set with no per-book registration. The server
// (joinClub / createCommunityPost) allows any `dailyread-<id>` key by prefix.
export const DAILYREAD_PREFIX = "dailyread-";
export const dailyReadClubKey = (bookId) =>
  DAILYREAD_PREFIX + String(bookId || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
export const isDailyReadClub = (key) => typeof key === "string" && key.startsWith(DAILYREAD_PREFIX);
// Resolve a daily-read club to a display object (it isn't in the static catalogue).
export const dailyReadClubFromKey = (key, title) => ({
  key,
  name: (title && String(title).trim()) ? `${String(title).trim()} — readers' corner` : "Readers' corner",
  line: "Everyone reading this, talking about it — generally, and spoiler-safe. No endings, no plot twists given away.",
  category: "Reading",
  dailyRead: true,
});

// Member-created Clubs: OFF until the OSA/ICO legal floor is in place (mirrors the server
// createClub `CLUBS_USER_CREATE_ENABLED` env gate). Keep false — flip ONLY with the server flag.
export const CLUBS_USER_CREATE_ENABLED = false;

// device-local joined-state (anonymous, same model as circles/reactions/qotd — no read needed for UX)
export const isClubJoined = (key) => { try { return localStorage.getItem("fw_club_join_" + key) === "1"; } catch { return false; } };
export const markClubJoined = (key) => { try { localStorage.setItem("fw_club_join_" + key, "1"); } catch { /* ignore */ } };
export const clearClubJoined = (key) => { try { localStorage.removeItem("fw_club_join_" + key); } catch { /* ignore */ } };
