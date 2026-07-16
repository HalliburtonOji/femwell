// one-off READ — inspect the existing "The Long Room" chapters so a new arc matches
// voice, structure and fields exactly. No writes. Piped to `base44 exec`.
const rows = await base44.entities.DailyStory.filter({}, "day_number", 200);
const all = Array.isArray(rows) ? rows : [];
const bySeries = {};
for (const r of all) {
  const k = r.series_key || "(none)";
  (bySeries[k] = bySeries[k] || []).push(r);
}
console.log("TOTAL rows:", all.length);
for (const [k, list] of Object.entries(bySeries)) {
  const days = list.map((r) => r.day_number).sort((a, b) => a - b);
  const dates = list.map((r) => r.published_date).filter(Boolean).sort();
  const words = list.map((r) => String(r.segment_text || "").trim().split(/\s+/).length);
  console.log("\nSERIES " + k + " — " + list.length + " rows");
  console.log("  series_title :", list[0] && list[0].series_title);
  console.log("  day_number   :", days[0], "->", days[days.length - 1]);
  console.log("  published    :", dates[0], "->", dates[dates.length - 1]);
  console.log("  is_active    :", [...new Set(list.map((r) => r.is_active))].join(","));
  console.log("  words/chapter: min", Math.min.apply(null, words), "max", Math.max.apply(null, words), "avg", Math.round(words.reduce((a, b) => a + b, 0) / words.length));
  console.log("  gradient     :", (list[0] && list[0].image_gradient) || "(none)");
  console.log("  fields       :", Object.keys(list[0] || {}).join(", "));
}
const lr = (bySeries["the_long_room"] || []).sort((a, b) => a.day_number - b.day_number);
for (const d of [1, 2, 30]) {
  const c = lr.find((r) => r.day_number === d);
  if (!c) continue;
  console.log("\n────────── the_long_room · DAY " + d + " ──────────");
  console.log("CLIFFHANGER :", c.cliffhanger);
  console.log("TEXT:\n" + c.segment_text);
}
