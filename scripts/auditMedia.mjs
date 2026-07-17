// Can the live library actually play inline? Evidence for pass 6b.
const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 300);
const all = (rows || []).filter(r => r && r.title);
const kind = r => {
  const m = String(r.media_type || "").toUpperCase();
  if (/TIKTOK|INSTAGRAM|REEL/.test(m)) return "tiktok";
  if (/PODCAST|AUDIO/.test(m)) return "audio";
  if (/VIDEO|CLIP/.test(m)) return "video";
  return "other";
};
const g = {};
for (const r of all) {
  const k = kind(r); g[k] = g[k] || { n:0, vid:0, embeddable:0, embedUrl:0, audioUrl:0, episodeUrl:0, playable:0 };
  const s = g[k]; s.n++;
  if (r.video_id) s.vid++;
  if (r.is_embeddable) s.embeddable++;
  if (r.embed_url) s.embedUrl++;
  if (r.audio_url) s.audioUrl++;
  if (r.episode_url) s.episodeUrl++;
  if ((r.video_id || r.embed_url) && r.is_embeddable) s.playable++;
  if (r.audio_url) s.playable++;
}
console.log("type      n   video_id  is_embeddable  embed_url  audio_url  episode_url  => INLINE-PLAYABLE");
for (const [k,s] of Object.entries(g).sort((a,b)=>b[1].n-a[1].n))
  console.log(`${k.padEnd(9)}${String(s.n).padStart(3)}   ${String(s.vid).padStart(6)}  ${String(s.embeddable).padStart(11)}  ${String(s.embedUrl).padStart(9)}  ${String(s.audioUrl).padStart(9)}  ${String(s.episodeUrl).padStart(11)}  => ${s.playable}`);
const v = all.filter(r => kind(r) === "video");
console.log("\nsample video rows:");
for (const r of v.slice(0,3)) console.log(`  vid=${r.video_id||"-"} emb=${r.is_embeddable} url=${String(r.content_url||"").slice(0,52)} src=${r.source_name||"-"}`);
