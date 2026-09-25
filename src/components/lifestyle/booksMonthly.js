// booksMonthly — the AUTHORED monthly book set for the Books & story section.
//
// Why authored and not an API query: Gutendex returns 2,216 titles for `topic=women` (measured
// 2026-09-25). A live fetch is a dump, not curation — and curation is the whole job here. This is
// the same pattern as the shipped Book Club seed (`bookClubConfig.js`): a real curated constant,
// no new entity, no new function. Every title is free public-domain (Project Gutenberg), so every
// pick opens into readable text in the existing BookReader.
//
// RESEARCH THIS ENCODES (mnt/femwell/research_books_section.md):
//  · ONE featured book is the product; the alternates are scenery. Four a month is already ~16x the
//    UK median (40% of Britons read none in a year; median 3) — so we lead with one, quietly.
//    https://yougov.com/en-gb/articles/51730-40-of-britons-havent-read-a-single-book-in-the-last-12-months
//  · NOT ONE GENRE. Women 13-44 are 35% of UK book purchases and romance leads there, but
//    historical fiction leads for women 45+ (crime/thriller too). A romance-shaped shelf fails half
//    our life stages, so the featured pick is chosen per life stage.
//    https://nielseniq.com/global/en/insights/commentary/2026/the-uk-book-consumer-2025/
//  · ESCAPE, NOT SELF-IMPROVEMENT. Fiction +18%, non-fiction -4%. No self-help shelf.
//  · DOORWAYS, NOT GENRES (Nancy Pearl's appeal factors): people · place · words · story.
//  · THE MATURE REVEAL shows the synopsis EARLY and the object LATE — anticipation only pays if the
//    wait ends in a real read, so `revealed:false` still carries `why` + `doorway`.
//
// Adding a month: add a key `YYYY-MM`. Anything missing falls back to EVERGREEN.

export const DOORWAYS = {
  people: { key: "people", label: "The people", line: "characters you'd miss when it ends" },
  place:  { key: "place",  label: "The place",  line: "a world you can walk around in" },
  words:  { key: "words",  label: "The words",  line: "sentences worth reading twice" },
  story:  { key: "story",  label: "What happens next", line: "a pull you can't put down" },
};
export const DOORWAY_KEYS = Object.keys(DOORWAYS);
const DOORWAY_STORE = "fw_books_doorway";
export function getDoorway() { try { const v = localStorage.getItem(DOORWAY_STORE); return DOORWAY_KEYS.includes(v) ? v : null; } catch { return null; } }
export function setDoorway(k) { try { if (DOORWAY_KEYS.includes(k)) localStorage.setItem(DOORWAY_STORE, k); } catch { /* private mode — the section just stays unsorted */ } }

// "Not for me" — a first-class action. It swaps the featured book for an alternate and records no
// debt anywhere: device-local, per month, reversible by clearing site data.
const PASS_STORE = "fw_books_passed";
export function passedIds() { try { return JSON.parse(localStorage.getItem(PASS_STORE) || "[]"); } catch { return []; } }
export function passBook(id) { try { const s = new Set(passedIds()); s.add(String(id)); localStorage.setItem(PASS_STORE, JSON.stringify([...s])); } catch { /* ignore */ } }

const B = (gutenberg_id, title, author, doorway, why, notes) => ({ gutenberg_id: String(gutenberg_id), title, author, doorway, why, notes: notes || null });

// Life stages that lean a different way (BRAND life-stage keys). `default` covers the rest.
const EVERGREEN = {
  featured: {
    default:        B(1342, "Pride and Prejudice", "Jane Austen", "people", "Everyone thinks they know it; almost no one remembers how funny it is. Elizabeth is the best company in English fiction."),
    perimenopause:  B(105, "Persuasion", "Jane Austen", "people", "Austen's quietest novel, about a second chance taken late and on her own terms. The one that forgives the most.", "Grief, and a family that undervalues her"),
    menopause:      B(105, "Persuasion", "Jane Austen", "people", "A second chance taken late and on her own terms — the Austen written for a woman who's already lived a bit.", "Grief, and a family that undervalues her"),
    "post-menopause": B(4276, "North and South", "Elizabeth Gaskell", "place", "A southern girl, a northern mill town, and an argument about work and worth that hasn't dated at all."),
    postpartum:     B(514, "Little Women", "Louisa May Alcott", "people", "Four sisters, one cramped house, and the whole of a life. Short chapters — you can read one and stop.", "Serious illness and the loss of a family member"),
    pregnant:       B(514, "Little Women", "Louisa May Alcott", "people", "Warm, domestic and easy to pick up in pieces. Short chapters, nothing to keep track of.", "Serious illness and the loss of a family member"),
    teen:           B(42671, "Pride and Prejudice (illustrated)", "Jane Austen", "story", "Sharp, funny, and every bit the romance everyone's been recommending you — the original one."),
  },
  alternates: [
    B(768, "Wuthering Heights", "Emily Brontë", "place", "The moors do half the talking. Bleak, gorgeous, and nobody in it behaves.", "Cruelty, and an unkind depiction of illness and death"),
    B(158, "Emma", "Jane Austen", "people", "A heroine 'no one but myself will much like' — she's wrong, Emma is a delight."),
    B(174, "The Picture of Dorian Gray", "Oscar Wilde", "words", "Read it for the sentences. Wilde can't write a dull line even when the plot turns nasty.", "Vanity, corruption and a violent death"),
    B(1260, "Jane Eyre", "Charlotte Brontë", "story", "A small, plain, furious woman who refuses to be managed. It still reads like a page-turner.", "Childhood cruelty, and the confinement of a mentally ill woman"),
  ],
  // the month's last book arrives on a set day — but its synopsis is here from day one
  reveal: B(2701, "Moby-Dick", "Herman Melville", "words", "A big, strange, very funny book about obsession — nothing like the one people describe."),
};

const MONTHS = {
  // e.g. "2026-10": { featured: {...}, alternates: [...], reveal: {...} }
};

// the 4th Sunday of the month — the reveal day (a set, predictable day, not a surprise)
export function revealDay(date = new Date()) {
  const y = date.getFullYear(), m = date.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  let sundays = 0;
  for (let d = 1; d <= last; d++) if (new Date(y, m, d).getDay() === 0) { sundays++; if (sundays === 4) return d; }
  return Math.min(28, last);
}

// The month's set, resolved for HER: life-stage featured pick, her doorway ordering the alternates,
// anything she's passed on swapped out, and the reveal held until its day (synopsis always shown).
export function monthlySet(date = new Date(), lifeStage = null, doorway = null) {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const src = MONTHS[key] || EVERGREEN;
  const passed = new Set(passedIds());
  const stage = String(lifeStage || "").toLowerCase();
  const pickFor = (f) => f[stage] || (stage.startsWith("pregnant") ? f.pregnant : null) || f.default;

  let featured = pickFor(src.featured || EVERGREEN.featured);
  let alternates = (src.alternates || EVERGREEN.alternates).filter((b) => b.gutenberg_id !== featured.gutenberg_id);
  // "Not for me" — promote the first alternate she hasn't passed on; the set quietly shrinks.
  while (featured && passed.has(featured.gutenberg_id) && alternates.length) featured = alternates.shift();
  alternates = alternates.filter((b) => !passed.has(b.gutenberg_id));
  // her doorway sorts the alternates (it orders, it never filters — nothing is hidden from her)
  if (doorway) alternates = [...alternates].sort((a, b) => (b.doorway === doorway) - (a.doorway === doorway));

  const rv = src.reveal || EVERGREEN.reveal;
  const day = revealDay(date);
  const revealed = date.getDate() >= day;
  return {
    featured: passed.has(featured?.gutenberg_id) ? null : featured,
    alternates: alternates.slice(0, 2),
    reveal: rv ? { ...rv, revealed, day } : null,
    monthName: date.toLocaleDateString("en-GB", { month: "long" }),
  };
}
