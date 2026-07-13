// Library substance (#4) — mood/theme discovery shelves + reading-progress + buddy-read helpers.
// All on EXISTING entities: BuddyRead (client create/read is permitted — update/delete admin-locked),
// reading progress is device-local (localStorage), mood shelves are a curated client constant. No new
// backend. Whole-life, never a health list up front (a midlife/peri shelf sits BESIDE romance & thrillers).
import { base44 } from "@/api/base44Client";
import { crisisCheck } from "@/components/community/communityConfig";

// ── MOOD / THEME SHELVES — curated, whole-life. Each book: { title, author, tag }. ──
export const MOOD_SHELVES = [
  { key: "hug", label: "A warm hug", sub: "gentle, comforting reads",
    books: [
      { title: "The House in the Cerulean Sea", author: "TJ Klune", tag: "cosy & kind" },
      { title: "A Man Called Ove", author: "Fredrik Backman", tag: "grumpy-sweet" },
      { title: "The Enchanted April", author: "Elizabeth von Arnim", tag: "sun-warmed" },
      { title: "Anne of Green Gables", author: "L. M. Montgomery", tag: "comfort classic" },
    ] },
  { key: "twisty", label: "Twisty & gripping", sub: "can't-put-it-down",
    books: [
      { title: "The Silent Patient", author: "Alex Michaelides", tag: "one-sitting" },
      { title: "Gone Girl", author: "Gillian Flynn", tag: "sharp & dark" },
      { title: "The Thursday Murder Club", author: "Richard Osman", tag: "cosy crime" },
      { title: "Rebecca", author: "Daphne du Maurier", tag: "gothic classic" },
    ] },
  { key: "hopeful", label: "Hopeful", sub: "lifts you a little",
    books: [
      { title: "The Midnight Library", author: "Matt Haig", tag: "second chances" },
      { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", tag: "big-hearted" },
      { title: "A Little Life (with care)", author: "Hanya Yanagihara", tag: "tender, heavy" },
      { title: "Small Things Like These", author: "Claire Keegan", tag: "quiet grace" },
    ] },
  { key: "swoony", label: "Swoony", sub: "romance to fall into",
    books: [
      { title: "Beach Read", author: "Emily Henry", tag: "witty & warm" },
      { title: "The Kiss Quotient", author: "Helen Hoang", tag: "heartfelt" },
      { title: "Persuasion", author: "Jane Austen", tag: "slow-burn classic" },
      { title: "Red, White & Royal Blue", author: "Casey McQuiston", tag: "joyful" },
    ] },
  { key: "midlife", label: "Midlife & the shift", sub: "peri, menopause, becoming",
    books: [
      { title: "The Change", author: "Kirsten Miller", tag: "menopause, unleashed" },
      { title: "Hagitude", author: "Sharon Blackie", tag: "second-half power" },
      { title: "Still Hot!", author: "Kaye & Gibson", tag: "honest & funny" },
      { title: "What Fresh Hell Is This?", author: "Heather Corinna", tag: "peri, plainly" },
    ] },
  { key: "funny", label: "Quietly funny", sub: "a proper laugh",
    books: [
      { title: "Bridget Jones's Diary", author: "Helen Fielding", tag: "timeless" },
      { title: "Nora Ephron: I Feel Bad About My Neck", author: "Nora Ephron", tag: "wry & wise" },
      { title: "Where'd You Go, Bernadette", author: "Maria Semple", tag: "smart-silly" },
      { title: "Good Omens", author: "Pratchett & Gaiman", tag: "delightful" },
    ] },
];

// ── reading progress — device-local, per book_key (0–100). Spoiler-safe: gates buddy notes. ──
export const readProgress = (bookKey) => { try { return Number(localStorage.getItem("fw_read_pct_" + bookKey) || 0); } catch { return 0; } };
export const setReadProgress = (bookKey, pct) => { try { localStorage.setItem("fw_read_pct_" + bookKey, String(Math.max(0, Math.min(100, Math.round(pct))))); } catch { /* ignore */ } };
export const progressLabel = (pct) => pct <= 0 ? "Not started" : pct >= 100 ? "Finished" : pct < 34 ? "Just begun" : pct < 67 ? "Partway in" : "Nearly there";

// ── buddy reads — on the BuddyRead entity (client create + read; hidden flag = admin moderation).
// A note is short, crisis-checked client-side before write, and carries the writer's progress so the
// UI can spoiler-gate it. Deeper conversation still routes to the fully-moderated readers' corner. ──
export async function joinBuddyRead(user, book_key, title, alias, note, pct) {
  const clean = String(note || "").trim().slice(0, 240);
  if (clean && crisisCheck(clean).intercept) return { intercept: true };
  try {
    const row = await base44.entities.BuddyRead.create({
      book_key, title: String(title || "").slice(0, 200),
      author_hash: alias?.hash || "", alias: alias?.name || "A reader",
      note: clean ? `[${Math.max(0, Math.min(100, Math.round(pct || 0)))}%] ${clean}` : "",
      hidden: false, created_at: new Date().toISOString(),
    });
    return { ok: true, row };
  } catch { return { error: true }; }
}
export async function buddiesFor(book_key) {
  try {
    const rows = await base44.entities.BuddyRead.filter({ book_key, hidden: false }, "-created_date", 60);
    return Array.isArray(rows) ? rows : [];
  } catch { return []; }
}
// parse "[40%] text" back into { pct, text } for spoiler-gating
export function parseBuddyNote(note) {
  const m = String(note || "").match(/^\[(\d{1,3})%\]\s*([\s\S]*)$/);
  if (m) return { pct: Math.max(0, Math.min(100, Number(m[1]))), text: m[2] };
  return { pct: 0, text: String(note || "") };
}
