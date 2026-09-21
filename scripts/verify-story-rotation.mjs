// Wiring proof for the Daily Story gate (dailyStory.js): chapters rotate ONE PER DAY within a
// MONTHLY run that CLOSES at month-end, and a fresh chapter published for today always wins.
// Runs the real module (base44 client stubbed) against fixed dates. `node scripts/verify-story-rotation.mjs`
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const src = readFileSync(new URL("../src/components/lifestyle/dailyStory.js", import.meta.url), "utf8")
  .replace(/import \{ base44 \} from "@\/api\/base44Client";/, "const base44 = { entities: { DailyStory: { filter: async () => [] } } };");
mkdirSync(new URL("../.tmp/", import.meta.url), { recursive: true });
const tmp = new URL("../.tmp/dailyStory.proof.mjs", import.meta.url);
writeFileSync(tmp, src);
const { chapterForDay, nextChapterOf, framingLine, chapterLabel } = await import(pathToFileURL(tmp.pathname.replace(/^\/([A-Za-z]:)/, "$1")).href);

// a 30-chapter finished series, all published in the past
const series = Array.from({ length: 30 }, (_, i) => ({ id: `ch${i + 1}`, series_key: "the_long_room", series_title: "The Long Room", day_number: i + 1, segment_text: `Chapter ${i + 1} text`, published_date: "2026-05-01", is_active: true }));

const at = (y, m, d) => new Date(y, m - 1, d, 9, 0, 0);
const checks = [];
const expect = (name, got, want) => checks.push({ name, ok: JSON.stringify(got) === JSON.stringify(want), got, want });

// 1) one chapter per calendar day — day N → chapter N
expect("Sep 1 → ch1", chapterForDay(series, at(2026, 9, 1)).chapter.day_number, 1);
expect("Sep 2 → ch2", chapterForDay(series, at(2026, 9, 2)).chapter.day_number, 2);
expect("Sep 21 → ch21", chapterForDay(series, at(2026, 9, 21)).chapter.day_number, 21);
expect("Sep 30 → ch30 (finale, run not yet complete)", [chapterForDay(series, at(2026, 9, 30)).chapter.day_number, chapterForDay(series, at(2026, 9, 30)).complete], [30, false]);
// consecutive days always advance by exactly one
let monotone = true;
for (let d = 1; d < 30; d++) if (chapterForDay(series, at(2026, 9, d + 1)).chapter.day_number !== chapterForDay(series, at(2026, 9, d)).chapter.day_number + 1) monotone = false;
expect("Sep 1→30 advances exactly +1 per day", monotone, true);

// 2) the run CLOSES at month-end — a 31-day month's day 31 = complete (finale held, no loop to ch1)
const oct31 = chapterForDay(series, at(2026, 10, 31));
expect("Oct 31 → complete, finale held (NOT ch1)", [oct31.complete, oct31.chapter.day_number], [true, 30]);
expect("Oct 31 monthEnd/daysLeft", [oct31.monthEnd, oct31.daysLeft], ["2026-10-31", 1]);
// and a new run begins on the 1st
expect("Nov 1 → ch1 (new run)", [chapterForDay(series, at(2026, 11, 1)).chapter.day_number, chapterForDay(series, at(2026, 11, 1)).complete], [1, false]);
// tomorrow's tease across the boundary
expect("nextChapterOf(Oct 31) → Nov 1 = ch1", nextChapterOf(series, at(2026, 10, 31)).chapter.day_number, 1);
expect("nextChapterOf(Oct 30) → Oct 31 = complete", nextChapterOf(series, at(2026, 10, 30)).complete, true);
// a short month closes early, honestly (Feb 2027 = 28 days → ch28 on the 28th, then Mar 1 = ch1)
expect("Feb 28 2027 → ch28", chapterForDay(series, at(2027, 2, 28)).chapter.day_number, 28);
expect("Mar 1 2027 → ch1", chapterForDay(series, at(2027, 3, 1)).chapter.day_number, 1);

// 3) a chapter genuinely published for TODAY wins over the run
const fresh = [...series, { id: "fresh", series_key: "new_series", series_title: "New Series", day_number: 1, segment_text: "Fresh", published_date: "2026-09-21", is_active: true }];
const f = chapterForDay(fresh, at(2026, 9, 21));
expect("fresh chapter for today wins", [f.fresh, f.chapter.id, f.seriesKey], [true, "fresh", "new_series"]);

// 4) the framing is honest
expect("label Sep 21", chapterLabel(chapterForDay(series, at(2026, 9, 21))), "Chapter 21 of 30");
expect("framing mid-run mentions the close", /closes on the 30th/.test(framingLine(chapterForDay(series, at(2026, 9, 21)))), true);
expect("framing when complete mentions the 1st", /new run begins on the 1st/.test(framingLine(oct31)), true);

const fails = checks.filter((c) => !c.ok);
for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.ok ? "" : `  got=${JSON.stringify(c.got)} want=${JSON.stringify(c.want)}`}`);
console.log(`\n${checks.length - fails.length}/${checks.length} passed`);
process.exit(fails.length ? 1 : 0);
