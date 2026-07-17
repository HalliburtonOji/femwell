// Do the REAL podcast audio_urls pass the app's playableMedia() gate?
const playableMedia = (url) => /^https?:\/\/\S+\.(mp4|webm|mov|m4v|mp3|m4a|aac|ogg|wav)(\?|#|$)/i.test(String(url || ""));
const rows = await base44.entities.LifestyleItems.filter({}, "-created_date", 500);
const audio = (rows || []).filter(r => /PODCAST|AUDIO/.test(String(r.media_type||"").toUpperCase()));
let pass = 0, fail = 0; const fails = [];
for (const r of audio) { if (playableMedia(r.audio_url)) pass++; else { fail++; fails.push(r.audio_url); } }
console.log(`audio episodes: ${audio.length} | PASS playableMedia: ${pass} | FAIL: ${fail}`);
console.log("\nsample URLs:");
for (const r of audio.slice(0, 4)) console.log(`  ${playableMedia(r.audio_url) ? "OK  " : "FAIL"} ${String(r.audio_url).slice(0, 96)}`);
if (fails.length) { console.log("\nFAILING URLs (would NOT play in-app):"); for (const u of fails.slice(0, 6)) console.log("  " + String(u).slice(0, 110)); }
