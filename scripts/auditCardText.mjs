// Which content types actually carry text to summarise? Evidence for the empty-card flag.
const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 200);
const all = (rows || []).filter(r => r && r.title);
const strip = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const kind = r => {
  const m = String(r.media_type || "").toUpperCase(), c = String(r.content_type || "").toUpperCase();
  if (/TIKTOK|INSTAGRAM|REEL/.test(m)) return "tiktok";
  if (/PODCAST|AUDIO/.test(m)) return "audio";
  if (/VIDEO|CLIP/.test(m)) return "video";
  if (c === "FICTION") return "book"; if (c === "STORY") return "story"; if (c === "GUIDE") return "guide";
  return "article";
};
const by = {};
for (const r of all) {
  const k = kind(r);
  by[k] = by[k] || { n: 0, rich: 0, thin: 0, none: 0, best: 0 };
  const t = Math.max(strip(r.lede).length, strip(r.summary).length, strip(r.why_it_matters).length);
  by[k].n++; by[k].best += t;
  if (t >= 160) by[k].rich++; else if (t > 0) by[k].thin++; else by[k].none++;
}
console.log("PUBLISHED LifestyleItems:", all.length);
console.log("type      n   rich(>=160ch)  thin(1-159)  NONE   avg-chars");
for (const [k, v] of Object.entries(by).sort((a,b)=>b[1].n-a[1].n)) {
  console.log(`${k.padEnd(9)} ${String(v.n).padStart(3)}   ${String(v.rich).padStart(8)}      ${String(v.thin).padStart(6)}     ${String(v.none).padStart(3)}   ${Math.round(v.best/v.n)}`);
}
