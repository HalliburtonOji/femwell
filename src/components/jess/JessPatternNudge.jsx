// JessPatternNudge — Jess v2 J2-4
//
// Reads the user's last ~7 DailyCheckins and detects simple patterns
// worth a single, gentle nudge from Jess. The card surfaces ONCE per
// day per pattern; once dismissed (or auto-dismissed via the daily
// cache key flip), it stays hidden until tomorrow.
//
// Detected patterns (first-match wins, in this order):
//   1. mood-drop      — mood fell ≥ 2 pts vs. the 3-day rolling baseline
//   2. low-mood       — mood ≤ 2 for 3+ consecutive days
//   3. low-energy     — energy ≤ 2 for 3+ consecutive days
//   4. low-sleep      — sleep_hours < 5 for 3+ consecutive nights
//
// Hidden conditions (don't render anything):
//   • fewer than 3 days of check-ins in the last 7 days
//   • no pattern matched
//   • already shown today
//
// No "Not medical advice" disclaimer is needed inside the card body —
// the persistent chat footer (J2-3) and the URGENCY_REFERRAL guard
// cover the surface area. This is a wellness nudge, not advice.

import { useEffect, useRef, useState } from "react";
import { X, HeartPulse } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  todayKey,
} from "@/services/jessAgentService";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  border:   "#D4C9B4",
};

// ─── Pattern detection ──────────────────────────────────────────────
// Returns { pattern, detail } or null. `pattern` is one of:
// "mood-drop" | "low-mood" | "low-energy" | "low-sleep".
function detectPattern(checkins) {
  if (!Array.isArray(checkins) || checkins.length < 3) return null;

  // Sort newest-first, take the last 7 calendar days.
  const sorted = [...checkins]
    .filter((c) => c && c.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 7);
  if (sorted.length < 3) return null;

  // 1. mood-drop — today vs. average of previous 3 days
  const todays = sorted[0];
  const baseline = sorted.slice(1, 4);
  if (todays?.mood != null && baseline.length >= 2) {
    const baseMoods = baseline.map((c) => Number(c.mood)).filter((n) => Number.isFinite(n));
    if (baseMoods.length >= 2) {
      const avg = baseMoods.reduce((a, b) => a + b, 0) / baseMoods.length;
      const drop = avg - Number(todays.mood);
      if (drop >= 2) {
        return { pattern: "mood-drop", detail: { from: Number(avg.toFixed(1)), to: todays.mood } };
      }
    }
  }

  // 2. low-mood — 3+ consecutive days mood ≤ 2
  if (consecutive(sorted, (c) => Number(c.mood) <= 2, 3)) {
    return { pattern: "low-mood", detail: { days: 3 } };
  }

  // 3. low-energy — 3+ consecutive days energy ≤ 2
  if (consecutive(sorted, (c) => Number(c.energy) <= 2, 3)) {
    return { pattern: "low-energy", detail: { days: 3 } };
  }

  // 4. low-sleep — 3+ consecutive nights sleep_hours < 5
  if (consecutive(sorted, (c) => Number(c.sleep_hours) < 5 && c.sleep_hours != null, 3)) {
    return { pattern: "low-sleep", detail: { days: 3 } };
  }

  return null;
}

function consecutive(rows, pred, run) {
  let count = 0;
  for (const r of rows) {
    if (pred(r)) {
      count += 1;
      if (count >= run) return true;
    } else {
      count = 0;
    }
  }
  return false;
}

// Friendly summary used in the system prompt + the card eyebrow.
function patternSummary(p) {
  switch (p?.pattern) {
    case "mood-drop":  return "mood dipped today";
    case "low-mood":   return "low mood for a few days";
    case "low-energy": return "low energy for a few days";
    case "low-sleep":  return "short sleep for a few nights";
    default:           return "a pattern worth noticing";
  }
}

const FALLBACK = {
  "mood-drop":  "I noticed mood is lower today than the last few days. Be gentle with yourself — small comforts count.",
  "low-mood":   "It looks like the last few days have been heavier. I'm here if you want to talk about it.",
  "low-energy": "Energy has been low for a few days. Could be a sign you need rest, food, or a slower pace today.",
  "low-sleep":  "Sleep has been short for a few nights. Tonight, even 30 extra minutes can help reset things.",
};

export default function JessPatternNudge({ user, profile }) {
  const [hit, setHit]         = useState(null);   // { pattern, detail }
  const [text, setText]       = useState("");
  const [visible, setVisible] = useState(true);
  const [dismiss, setDismiss] = useState(false);
  const ranRef               = useRef(false);

  const cacheKey = user?.id ? `jess_pattern_nudge_${user.id}_${todayKey()}` : null;

  useEffect(() => {
    if (!cacheKey || ranRef.current) return;
    ranRef.current = true;

    // Already shown today?
    const cached = loadDailyCache(cacheKey);
    if (cached?.shown) { setVisible(false); return; }
    if (cached?.suppress) { setVisible(false); return; }

    // Re-use text if we already generated it earlier today but didn't
    // mark `shown` (rare — happens if React unmounted mid-render).
    if (cached?.text && cached?.hit) {
      setHit(cached.hit);
      setText(cached.text);
      saveDailyCache(cacheKey, { ...cached, shown: true });
      return;
    }

    const Entity = base44?.entities?.DailyCheckins;
    if (!Entity) { setVisible(false); return; }

    (async () => {
      let rows = [];
      try {
        rows = await Entity.filter({ user_id: user.id }, "-date", 14).catch(() => []);
      } catch { rows = []; }

      const detected = detectPattern(rows);
      if (!detected) {
        // Suppress for the rest of today so we don't re-fetch on every
        // re-render — pattern detection is the same all day.
        saveDailyCache(cacheKey, { suppress: true });
        setVisible(false);
        return;
      }

      const summary = patternSummary(detected);
      const lifeStage = profile?.life_stage || "reproductive";
      const fallback = FALLBACK[detected.pattern];

      const system =
        "You are Jess, a warm UK-based women's health companion. " +
        "Acknowledge a pattern from the user's recent check-ins. " +
        "ONE short paragraph (2 sentences, max 200 chars). " +
        "Be specific to the pattern, NOT generic. Do not diagnose. " +
        "No medical advice — gentle, practical comfort only. " +
        "No sign-off, no quotation marks, no greeting.";

      const userPrompt =
        `Pattern: ${summary}.\n` +
        `Life stage: ${lifeStage}.\n` +
        (detected.pattern === "mood-drop"
          ? `Mood was around ${detected.detail.from}/5, today is ${detected.detail.to}/5.\n`
          : `Run length: ${detected.detail.days} consecutive days.\n`) +
        `Write one warm, specific 2-sentence acknowledgement.`;

      try {
        const { text: raw } = await callJessAgent({ system, user: userPrompt });
        const cleaned = String(raw || "").trim().replace(/^["']|["']$/g, "");
        const final = cleaned && cleaned.length > 12 ? cleaned : fallback;
        setHit(detected);
        setText(final);
        saveDailyCache(cacheKey, { hit: detected, text: final, shown: true });
      } catch {
        setHit(detected);
        setText(fallback);
        saveDailyCache(cacheKey, { hit: detected, text: fallback, shown: true });
      }
    })();
  }, [cacheKey, user?.id, profile?.life_stage]);

  function close() {
    setDismiss(true);
    setTimeout(() => setVisible(false), 320);
    if (cacheKey) {
      const cached = loadDailyCache(cacheKey) || {};
      saveDailyCache(cacheKey, { ...cached, shown: true });
    }
  }

  if (!visible || !hit || !text) return null;

  return (
    <article style={{
      margin: "0 16px 12px",
      background: `linear-gradient(135deg, ${C.paperHi} 0%, rgba(143,175,143,0.18) 100%)`,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.sage}`,
      borderRadius: 16,
      padding: "12px 14px 12px",
      display: "flex", alignItems: "flex-start", gap: 12,
      boxShadow: "0 4px 14px rgba(58,44,26,0.08)",
      animation: dismiss
        ? "jess-nudge-leave 320ms ease-in forwards"
        : "jess-nudge-enter 420ms cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9999,
        background: C.sage,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }} aria-hidden>
        <HeartPulse size={14} style={{ color: "#F4EDDB" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.muted, fontFamily: "'Inter', sans-serif",
        }}>Jess noticed · {patternSummary(hit)}</p>
        <p style={{
          margin: "4px 0 0", fontSize: 14,
          fontFamily: "'Fraunces', Georgia, serif",
          color: C.espresso, lineHeight: 1.5,
        }}>{text}</p>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss nudge"
        style={{
          width: 26, height: 26, borderRadius: 9999,
          background: "rgba(58,44,26,0.06)", border: "none",
          color: C.espresso, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, padding: 0,
        }}
      ><X size={12} /></button>
      <style>{`
        @keyframes jess-nudge-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jess-nudge-leave {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </article>
  );
}
