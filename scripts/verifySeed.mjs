// independent read-back: prove the gate now serves a REAL published chapter today
const rows = await base44.entities.DailyStory.filter({ is_active: true }, "day_number", 400);
const all = (rows || []).filter(r => r && r.segment_text);
const bySeries = {};
for (const r of all) (bySeries[r.series_key] = bySeries[r.series_key] || []).push(r);
console.log("ACTIVE series:");
for (const [k, l] of Object.entries(bySeries)) {
  const d = l.map(r => r.published_date).sort();
  console.log(`  ${k}: ${l.length} chapters · ${d[0]} → ${d[d.length-1]}`);
}
// replicate the shipped gate exactly
const isoDay = (dt) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
const today = isoDay(new Date());
const fresh = all.find(c => c.published_date === today && c.is_active !== false);
console.log("\nTODAY:", today);
if (fresh) {
  console.log(`  FRESH → ${fresh.series_key} day ${fresh.day_number}: "${(fresh.segment_text.match(/## (.+)/)||[])[1]}"`);
  console.log(`  cliffhanger: ${fresh.cliffhanger}`);
} else console.log("  no fresh chapter → evergreen safety net covers it");
// the next 5 days + one past the runway
for (const off of [1, 2, 29, 30]) {
  const d = new Date(); d.setDate(d.getDate() + off);
  const k = isoDay(d);
  const f = all.find(c => c.published_date === k);
  console.log(`  +${String(off).padStart(2)}d ${k} → ${f ? `${f.series_key} day ${f.day_number} (real)` : "no fresh → evergreen cycles the back-catalogue"}`);
}
