import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// RitualReframeShimmer — Planner Phase 2 C7 (MP-A2).
//
// Italic gold one-liner below a stuck/queued ritual card. Calls the
// `generateRitualReframe` Deno function on first render for a given
// (ritualName × phase × state) triple, caches the result in localStorage for
// 24h so re-renders + page reloads don't re-burn credits. Fallback to a
// deterministic permissive reframe when the LLM call fails or hasn't returned
// yet — the shimmer is decoration, not a hard requirement, and the FE never
// blocks UI waiting on it.
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C7.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NS = "fw_ritual_reframe_v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const ENABLED_FLAG = "fw_ritual_reframe_enabled";

// Curated fallbacks per common ritual kind. Keeps the surface alive when the
// LLM call fails. Voice rules: never minimising, never body-negative.
const FALLBACK_REFRAMES = [
  "Two minutes still counts here",
  "Half of it is plenty for today",
  "Start as small as feels honest",
  "A short version still keeps the rhythm",
  "Even a sip, a step, a sentence counts",
  "Tiny first move, the rest is optional",
];

function readCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${CACHE_NS}:${key}`);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - Number(ts) > TTL_MS) return null;
    return value || null;
  } catch { return null; }
}

function writeCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${CACHE_NS}:${key}`, JSON.stringify({ value, ts: Date.now() }));
  } catch { /* silent */ }
}

// Pick a stable fallback from the list using a deterministic hash so a given
// ritual always shows the same fallback (no jittery re-shuffling).
function stableFallback(seed) {
  if (!seed) return FALLBACK_REFRAMES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % FALLBACK_REFRAMES.length;
  return FALLBACK_REFRAMES[idx];
}

function isReframeEnabled() {
  if (typeof window === "undefined") return true;
  try {
    const v = window.localStorage.getItem(ENABLED_FLAG);
    // Default on. Set to "0" to disable network calls if a user wants the
    // shimmer to stay deterministic / offline.
    return v !== "0";
  } catch { return true; }
}

export default function RitualReframeShimmer({ ritualName, phase, state = "stuck", show = true }) {
  const cacheKey = `${ritualName}|${phase || "any"}|${state}`;
  const [reframe, setReframe] = useState(() => readCache(cacheKey));
  const [fetched, setFetched] = useState(!!reframe);

  useEffect(() => {
    if (!show) return;
    if (fetched) return;
    if (!isReframeEnabled()) { setReframe(stableFallback(cacheKey)); setFetched(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("generateRitualReframe", { ritualName, phase, state });
        if (cancelled) return;
        if (res?.ok && res.reframe) {
          writeCache(cacheKey, res.reframe);
          setReframe(res.reframe);
        } else {
          setReframe(stableFallback(cacheKey));
        }
      } catch {
        if (!cancelled) setReframe(stableFallback(cacheKey));
      } finally {
        if (!cancelled) setFetched(true);
      }
    })();
    return () => { cancelled = true; };
  }, [cacheKey, ritualName, phase, state, show, fetched]);

  if (!show) return null;
  const display = reframe || stableFallback(cacheKey);
  return (
    <p
      data-ritual-reframe={ritualName}
      style={{
        fontSize: 12,
        fontStyle: "italic",
        color: "var(--gold, #C9A95C)",
        letterSpacing: "-0.005em",
        margin: "4px 0 0",
        lineHeight: 1.4,
      }}
    >
      ⟢ {display}
    </p>
  );
}
