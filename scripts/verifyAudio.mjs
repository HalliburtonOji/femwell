const rows = await base44.entities.LifestyleItems.filter({}, "-created_date", 500);
const all = (rows || []).filter(r => r && r.title);
const audio = all.filter(r => /PODCAST|AUDIO/.test(String(r.media_type || "").toUpperCase()));
console.log("audio items now:", audio.length);
const byStatus = {}; for (const r of audio) byStatus[r.status] = (byStatus[r.status]||0)+1;
console.log("by status:", JSON.stringify(byStatus));
const playable = audio.filter(r => r.audio_url);
const withSummary = audio.filter(r => String(r.summary||"").trim().length >= 160);
console.log("with audio_url (IN-APP PLAYABLE):", playable.length, "| with a rich summary (>=160ch):", withSummary.length);
console.log("\nsample:");
for (const r of audio.slice(0, 6)) {
  console.log(` · [${r.status}] ${String(r.title).slice(0,52)}`);
  console.log(`     src=${r.source_name || "-"} | audio_url=${r.audio_url ? "YES" : "NO"} | dur=${r.duration_label || "-"} | summary=${String(r.summary||"").length}ch`);
}
