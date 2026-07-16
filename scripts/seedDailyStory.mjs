// ONE-OFF, IDEMPOTENT SEED — authored Daily Story chapters → the DailyStory entity.
// Run:  cat scripts/seedDailyStory.mjs | npx base44 exec        (from a dir with base44/config.jsonc)
//
// NOT a generator and NOT scheduled: this is a hand-run script that writes hand-authored prose.
// Re-runnable safely — it skips any (series, day_number) already present and refuses to collide
// with an existing ACTIVE chapter on the same published_date.
//
// Reads the authored batches from workspace/dailystory/<series>.json:
//   { series_key, series_title, start_date, chapters: [{ day_number, title, segment_text, cliffhanger }] }

const SERIES_FILE = "workspace/dailystory/small_mends.json";
const DRY_RUN = false;

const raw = await Deno.readTextFile(SERIES_FILE);
const pack = JSON.parse(raw);
const { series_key, series_title, start_date, chapters } = pack;
if (!series_key || !series_title || !start_date || !Array.isArray(chapters) || !chapters.length) {
  throw new Error("bad pack: need series_key, series_title, start_date, chapters[]");
}

const addDays = (iso, n) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const words = (s) => String(s || "").trim().split(/\s+/).length;

// ── pre-flight: what's already there ─────────────────────────────────────────
const existingSeries = await base44.entities.DailyStory.filter({ series_key }, "day_number", 400);
const haveDays = new Set((existingSeries || []).map((r) => r.day_number));
const allActive = await base44.entities.DailyStory.filter({ is_active: true }, "day_number", 400);
const activeDates = new Map();
for (const r of allActive || []) {
  if (r.series_key !== series_key && r.published_date) activeDates.set(r.published_date, r.series_key);
}

console.log(`SEED ${series_key} ("${series_title}") — ${chapters.length} authored chapters, start ${start_date}`);
console.log(`already present for this series: ${haveDays.size} day(s)`);

let created = 0, skipped = 0, blocked = 0;
const nowISO = new Date().toISOString();

for (const ch of chapters.sort((a, b) => a.day_number - b.day_number)) {
  const day = ch.day_number;
  const published_date = addDays(start_date, day - 1);

  if (haveDays.has(day)) { console.log(`  · day ${String(day).padStart(2)} SKIP (already seeded)`); skipped++; continue; }
  if (activeDates.has(published_date)) {
    console.log(`  ! day ${String(day).padStart(2)} BLOCKED — ${published_date} already has an active chapter from ${activeDates.get(published_date)}`);
    blocked++; continue;
  }
  const w = words(ch.segment_text);
  if (!ch.segment_text || w < 380 || w > 640) {
    console.log(`  ! day ${String(day).padStart(2)} BLOCKED — segment_text is ${w} words (expected ~500)`);
    blocked++; continue;
  }
  if (!/^## Chapter \d+ — /.test(ch.segment_text.trim())) {
    console.log(`  ! day ${String(day).padStart(2)} BLOCKED — missing the "## Chapter N — Title" heading`);
    blocked++; continue;
  }
  if (!ch.cliffhanger) { console.log(`  ! day ${String(day).padStart(2)} BLOCKED — no cliffhanger`); blocked++; continue; }

  const row = {
    series_key, series_title,
    day_number: day,
    segment_text: ch.segment_text,
    cliffhanger: ch.cliffhanger,
    published_date,
    is_active: true,
    created_at: nowISO,
    updated_at: nowISO,
  };
  if (DRY_RUN) { console.log(`  ~ day ${String(day).padStart(2)} would create → ${published_date} (${w}w)`); created++; continue; }
  await base44.entities.DailyStory.create(row);
  console.log(`  + day ${String(day).padStart(2)} created → ${published_date} (${w}w)`);
  created++;
}

console.log(`\ncreated ${created} · skipped ${skipped} · blocked ${blocked}`);
if (created && !DRY_RUN) {
  const back = await base44.entities.DailyStory.filter({ series_key }, "day_number", 400);
  const rows = (back || []).sort((a, b) => a.day_number - b.day_number);
  const dates = rows.map((r) => r.published_date).sort();
  console.log(`VERIFY: ${rows.length} rows now in ${series_key}; runway ${dates[0]} → ${dates[dates.length - 1]}`);
  const today = new Date().toISOString().slice(0, 10);
  const todays = rows.find((r) => r.published_date === today && r.is_active);
  console.log(`VERIFY: today (${today}) → ${todays ? `day ${todays.day_number} — a REAL published chapter` : "no fresh chapter (evergreen covers it)"}`);
}
