// bookClubConfig — the curated Book Club seed (Community Phase 4, §P.2.2).
//
// One curated pick at a time. Reading happens in the EXISTING BookReader
// (/BookReader?gutenberg_id=N — free public-domain) so there is no new reader. The pick +
// its spoiler-safe checkpoints ship here so the club is live immediately; once Halli sets a
// real BookClubPick entity (active:true) + ClubCheckpoints, the client prefers those. Notes
// (ClubNote) are the live interactive data, keyed by pick_key. Soft progress only — never a
// "books-read" leaderboard or streak.
//
// Progress is self-attested + device-local (anonymous, like reactions/qotd/circle-joins): a
// checkpoint's discussion unlocks only when YOU say you've reached it → spoiler-safe AND
// latecomer-safe. (Auto-unlock from live reader progress is a later refinement.)

export const SEED_PICK = {
  pick_key: "littlewomen-2026q3",
  gutenberg_id: "514",                 // Little Women — Louisa May Alcott (Project Gutenberg)
  title: "Little Women",
  author: "Louisa May Alcott",
  host_intro:
    "Our first read together. Four sisters, one cramped house, and the whole of a life — ambition, love, money worries, grief, growing up — long before anyone called it that. Read it however you like; lurking counts. I'll meet you at each checkpoint.",
  cadence: "Six weeks · no rush, no streak",
  trigger_warnings: ["Serious illness and the loss of a family member", "Period-typical views on marriage and women's roles"],
  checkpoints: [
    { index: 0, label: "Up to the first Christmas", jess_prompt: "Each sister carries the hard winter differently. Which one did you recognise — in yourself, or in someone you love?" },
    { index: 1, label: "Through Meg's choices", jess_prompt: "Meg weighs a comfortable life against a true one. Have you ever made that trade — either way?" },
    { index: 2, label: "Beth's chapters", jess_prompt: "This stretch is tender (see the content note). What did it stir? No need to be eloquent — a few words is plenty." },
    { index: 3, label: "To the end", jess_prompt: "They each became someone. Which ending felt most like a kindness to the girl she started as?" },
  ],
};

// device-local self-attested progress (highest checkpoint index reached; -1 = none yet).
// A checkpoint i is unlocked only when reached >= i → spoiler-safe, including checkpoint 0.
export const clubReached = (pickKey) => { try { const v = localStorage.getItem("fw_club_" + pickKey); return v === null ? -1 : Number(v); } catch { return -1; } };
export const setClubReached = (pickKey, idx) => { try { const cur = clubReached(pickKey); if (idx > cur) localStorage.setItem("fw_club_" + pickKey, String(idx)); } catch { /* ignore */ } };
