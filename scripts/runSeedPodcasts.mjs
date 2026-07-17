// Run the EXISTING seedPodcasts function (pure RSS, no LLM, no cost, idempotent).
// The 12 curated podcast sources have been sitting active with real feeds and ZERO episodes
// ever ingested — this is the missing in-app audio, not an absent feature.
const me = await base44.auth.me().catch(() => null);
console.log("acting as:", me?.email || "(unknown)", "| role:", me?.role || "-");
const res = await base44.functions.invoke("seedPodcasts", {});
console.log("seedPodcasts →", JSON.stringify(res?.data ?? res, null, 1).slice(0, 1200));
