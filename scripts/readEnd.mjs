const rows = await base44.entities.DailyStory.filter({ series_key: "the_long_room" }, "day_number", 40);
const lr = (rows || []).sort((a, b) => a.day_number - b.day_number);
for (const d of [15, 29, 30]) {
  const c = lr.find((r) => r.day_number === d);
  if (!c) continue;
  console.log("\n────── DAY " + d + " ──────");
  console.log("CLIFF:", c.cliffhanger);
  console.log(c.segment_text);
}
