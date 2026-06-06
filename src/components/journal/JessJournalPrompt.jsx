// JessJournalPrompt — Feature 4 (Wing #1 of 3)
//
// A small sage-toned card that sits at the top of the Journal page. Each
// day Jess proposes one phase-aware journaling prompt; tap "Use this
// prompt" and the New Entry sheet opens with the prompt pre-filled.
//
// Caching: jess_journal_prompt_<userId>_<YYYY-MM-DD>. We only call the
// agent once per user per day; subsequent renders re-hydrate the cached
// prompt instantly. Tapping refresh (clock icon) re-runs the agent and
// overwrites the cache.

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, PenLine, RefreshCw } from "lucide-react";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  todayKey,
} from "@/services/jessAgentService";

const PHASE_FALLBACK = {
  menstrual:  "What is asking to be released this cycle, however small?",
  follicular: "What feels possible this week that didn't feel possible last week?",
  ovulatory:  "Who or what do you want to show up for today, and why?",
  luteal:     "What have you noticed about yourself in the last few days?",
};

// Sprint 1 S1-2 — cross-mount inflight dedup.
//
// The Journal page was re-rendering JessJournalPrompt up to 6× before
// the first agent call wrote to localStorage, so every mount saw an
// empty cache and fired its own request. The component's per-instance
// `triedRef` couldn't see across remounts.
//
// Two-tier dedup:
//   1. Module-level inflight Map<cacheKey, Promise> — any concurrent
//      mount in the same JS context awaits the existing promise
//      instead of firing a fresh call.
//   2. Pending sentinel written into localStorage *before* the agent
//      call resolves. A subsequent mount (or a fresh navigation
//      that drops the module's Map) treats `{ pending: true }` as
//      "wait, don't re-fire" up to a 30 s expiry, after which we
//      assume the prior call was lost and try again.
const JOURNAL_PROMPT_INFLIGHT = new Map();
const PENDING_TTL_MS = 30 * 1000;

export default function JessJournalPrompt({ user, profile, phase, lastEntry, onUsePrompt }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const triedRef = useRef(false);

  const cacheKey = useMemo(() => {
    if (!user?.id) return null;
    return `jess_journal_prompt_${user.id}_${todayKey()}`;
  }, [user?.id]);

  // Initial fetch — try cache (incl. pending sentinel), then agent.
  useEffect(() => {
    if (!cacheKey || triedRef.current) return;
    triedRef.current = true;
    const cached = loadDailyCache(cacheKey);
    if (cached?.prompt) { setPrompt(cached.prompt); return; }
    // Sprint 1 S1-2 — honour a pending sentinel from another mount.
    if (cached?.pending && Date.now() - Number(cached.ts || 0) < PENDING_TTL_MS) {
      // Another mount is already fetching. Latch onto its promise if
      // available and adopt the resolved prompt; otherwise leave the
      // card in its loading-but-quiet state until the other mount's
      // saveDailyCache call lands.
      const inflight = JOURNAL_PROMPT_INFLIGHT.get(cacheKey);
      if (inflight && typeof inflight.then === "function") {
        setLoading(true);
        inflight.finally(() => {
          const fresh = loadDailyCache(cacheKey);
          if (fresh?.prompt) setPrompt(fresh.prompt);
          setLoading(false);
        });
      }
      return;
    }
    runAgent({ force: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, phase]);

  function runAgent({ force }) {
    if (!cacheKey) return;
    if (loading) return;
    // Sprint 1 S1-2 — second guard: if another mount started the same
    // request in this JS context, await it rather than firing again.
    const existing = JOURNAL_PROMPT_INFLIGHT.get(cacheKey);
    if (existing && typeof existing.then === "function" && !force) {
      setLoading(true);
      existing.finally(() => {
        const fresh = loadDailyCache(cacheKey);
        if (fresh?.prompt) setPrompt(fresh.prompt);
        setLoading(false);
      });
      return;
    }
    const fallback = PHASE_FALLBACK[phase] || PHASE_FALLBACK.follicular;
    const lastSnippet = (lastEntry?.text || lastEntry?.content || "")
      .toString().slice(0, 200).replace(/\s+/g, " ").trim();

    setLoading(true);
    // Sprint 1 S1-2 — write the pending sentinel synchronously BEFORE
    // the agent call so a remount in the next paint tick sees it and
    // doesn't fire a duplicate.
    saveDailyCache(cacheKey, { pending: true, ts: Date.now() });

    const system =
      "You are Jess, a UK-based women's wellness companion. " +
      "Your only job in this turn: propose ONE journaling prompt the user could write into today. " +
      "Output rules: " +
      "(1) exactly one sentence, ending with a question mark; " +
      "(2) max 140 characters; " +
      "(3) warm and specific, never generic ('What did you do today?' is too thin); " +
      "(4) reference the current cycle phase mood when it fits naturally; " +
      "(5) do not include preambles, sign-offs, or quotation marks; " +
      "(6) never give medical advice and do not name conditions.";

    const userPrompt =
      `Current cycle phase: ${phase || "follicular"}.\n` +
      `Life stage: ${profile?.life_stage || "reproductive"}.\n` +
      (lastSnippet ? `Last journal snippet: "${lastSnippet}"\n` : "") +
      `Suggest one journaling prompt for today.`;

    // Sprint 1 S1-2 — capture the promise in the module-level Map so
    // concurrent mounts in the same JS context dedupe to a single call.
    const promise = callJessAgent({ system, user: userPrompt })
      .then(({ text }) => {
        setLoading(false);
        const cleaned = String(text || "")
          .trim()
          .replace(/^["']|["']$/g, "")
          .split(/\n/)[0]
          .trim();
        const final = cleaned && cleaned.length > 5 ? cleaned : fallback;
        setPrompt(final);
        saveDailyCache(cacheKey, { prompt: final });
      })
      .catch(() => {
        setLoading(false);
        setPrompt(fallback);
        saveDailyCache(cacheKey, { prompt: fallback });
      })
      .finally(() => {
        // Clear the inflight slot so a future refresh can fire again.
        JOURNAL_PROMPT_INFLIGHT.delete(cacheKey);
      });
    JOURNAL_PROMPT_INFLIGHT.set(cacheKey, promise);
    // force flag exists so the refresh button can be wired later if desired
    void force;
  }

  function handleUse() {
    if (!prompt || !onUsePrompt) return;
    onUsePrompt(prompt);
  }

  function handleRefresh() {
    // Wipe cache so the agent call writes fresh.
    if (cacheKey && typeof window !== "undefined") {
      try { window.localStorage.removeItem(cacheKey); } catch { /* swallow */ }
    }
    runAgent({ force: true });
  }

  const display = prompt || (loading ? "" : (PHASE_FALLBACK[phase] || PHASE_FALLBACK.follicular));

  return (
    <article style={{
      background: "rgba(143, 175, 143, 0.14)", // sage @ low alpha
      border: "1px solid rgba(143, 175, 143, 0.40)",
      borderLeft: "3px solid #8FAF8F",
      borderRadius: 14, padding: "14px 14px 12px",
      marginBottom: 16,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={14} style={{ color: "#6B8F6B" }} aria-hidden />
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#6B8F6B", }}>Jess · Today's prompt</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="New prompt"
          disabled={loading}
          style={{
            width: 28, height: 28, borderRadius: 9999,
            background: "transparent",
            border: "1px solid rgba(143, 175, 143, 0.40)",
            color: "#6B8F6B", cursor: loading ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: 0, opacity: loading ? 0.55 : 1,
            transition: "transform 200ms ease",
          }}
        >
          <RefreshCw
            size={13}
            style={loading ? { animation: "jess-spin 900ms linear infinite" } : undefined}
          />
        </button>
      </div>
      <p style={{
        margin: 0, fontSize: 15,
        color: "#3A2C1A", lineHeight: 1.45,
      }}>
        {loading && !prompt ? (
          <span style={{ color: "#9B8B7A", fontStyle: "italic", fontSize: 13 }}>
            Jess is thinking…
          </span>
        ) : display}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={handleUse}
          disabled={!prompt || loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 9999,
            background: "#3A2C1A", color: "#F4EDDB",
            border: "none", cursor: prompt && !loading ? "pointer" : "default",
            fontSize: 13, fontWeight: 600,
            opacity: prompt && !loading ? 1 : 0.55,
          }}
        >
          <PenLine size={13} />
          Use this prompt
        </button>
        <p style={{
          margin: 0, fontSize: 10, color: "#9B8B7A", fontStyle: "italic",
          }}>Not medical advice.</p>
      </div>
      <style>{`
        @keyframes jess-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </article>
  );
}
