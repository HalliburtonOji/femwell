// The REAL audio picture. My "0 audio" measured LifestyleItems media_type only — too narrow.
const q = async (name, fn) => { try { return await fn(); } catch (e) { return { __err: String(e).slice(0, 90) }; } };
const sources = await q("s", () => base44.entities.LifestyleSources.filter({}, "-created_date", 100));
const listens = await q("l", () => base44.entities.PodcastListens.filter({}, "-created_date", 20));
const segs    = await q("a", () => base44.entities.AudioSegments.filter({}, "-created_date", 20));
const items   = await q("i", () => base44.entities.LifestyleItems.filter({}, "-created_date", 400));

const S = Array.isArray(sources) ? sources : [];
console.log("LifestyleSources:", S.length, sources.__err || "");
const pod = S.filter(s => String(s.source_type || "").toUpperCase() === "PODCAST");
console.log("  source_type=PODCAST:", pod.length);
for (const p of pod.slice(0, 8)) console.log(`   · ${p.name || p.title || "?"} | feed=${String(p.feed_url || p.url || "-").slice(0, 46)} | active=${p.is_active}`);
console.log("  other source_types:", [...new Set(S.map(s => s.source_type))].join(", ") || "(none)");

const I = Array.isArray(items) ? items : [];
const audio = I.filter(r => /PODCAST|AUDIO/.test(String(r.media_type || "").toUpperCase()));
console.log("\nLifestyleItems total:", I.length, "| media_type PODCAST/AUDIO:", audio.length);
const byStatus = {};
for (const r of audio) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
console.log("  audio by status:", JSON.stringify(byStatus));
for (const r of audio.slice(0, 5)) console.log(`   · [${r.status}] ${String(r.title).slice(0,44)} | audio_url=${r.audio_url ? "YES" : "no"} | ep=${r.episode_url ? "YES" : "no"}`);
console.log("\nPodcastListens:", Array.isArray(listens) ? listens.length : listens.__err);
console.log("AudioSegments:", Array.isArray(segs) ? segs.length : segs.__err);
