// JessPhasePrep — Jess v2 J2-6
//
// Surfaces a small "your next phase is coming" preparation card when
// the user is 3-4 days out from a cycle phase transition. Card is
// cached weekly (we don't want to nag every day), and is hidden
// entirely for life stages where cycle-phase framing isn't appropriate
// (pregnancy, postpartum, peri-/menopause).
//
// Transition map (matches useCycleDay's thresholds):
//   menstrual  → follicular   at day  periodLen + 1
//   follicular → ovulatory    at day  floor(cycleLen * 0.43) + 1
//   ovulatory  → luteal       at day  floor(cycleLen * 0.5)  + 1
//   luteal     → menstrual    at day  cycleLen + 1   (= +daysUntilPeriod)
//
// The card renders if `daysToTransition` ∈ {3, 4}; otherwise we save
// a `suppress` flag in the weekly cache and stay hidden until the
// week key flips.

import { useEffect, useRef, useState } from "react";
import { X, Sunrise } from "lucide-react";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  weekKey,
} from "@/services/jessAgentService";
import { useCycleDay } from "@/hooks/useCycleDay";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

// Life stages where cycle-phase framing is inappropriate or harmful.
// Same set used elsewhere in the app for `cycleAnchored` gating.
const SUPPRESSED_LIFE_STAGES = new Set([
  "pregnant-t1", "pregnant-t2", "pregnant-t3",
  "postpartum",
  "perimenopause", "menopause", "post-menopause",
]);

const PHASE_LABEL = {
  menstrual:  "menstrual",
  follicular: "follicular",
  ovulatory:  "ovulatory",
  luteal:     "luteal",
};

const FALLBACK = {
  follicular: "Your follicular phase is a few days away — energy is on the way up. Now's a good moment to line up the things that will benefit from focus.",
  ovulatory:  "Your ovulatory window opens in a few days — peak energy and clarity. Plan the conversations or projects that need your sharpest voice.",
  luteal:     "Your luteal phase is approaching — a gentler week ahead. Build in a slower pace and a few comforts where you can.",
  menstrual:  "Your period is a few days away — softness, warmth, and rest will serve you well. Stock the basics you'll want on hand.",
};

// Compute next phase + days until transition. Pure helper so this can
// be unit-tested without React.
function computeNextPhase({ phase, cycleDay, cycleLen, periodLen, daysUntilPeriod }) {
  if (!phase) return null;
  const follicStart = periodLen + 1;
  const ovulStart   = Math.floor(cycleLen * 0.43) + 1;
  const lutStart    = Math.floor(cycleLen * 0.5)  + 1;

  let nextPhase, transitionDay;
  switch (phase) {
    case "menstrual":  nextPhase = "follicular"; transitionDay = follicStart; break;
    case "follicular": nextPhase = "ovulatory";  transitionDay = ovulStart;   break;
    case "ovulatory":  nextPhase = "luteal";     transitionDay = lutStart;    break;
    case "luteal":     nextPhase = "menstrual";  transitionDay = null;        break;
    default: return null;
  }
  let daysToTransition;
  if (phase === "luteal") {
    // daysUntilPeriod from useCycleDay = days until next period (next menstrual).
    daysToTransition = Math.max(0, Number(daysUntilPeriod) - 1);
  } else {
    daysToTransition = Math.max(0, transitionDay - Number(cycleDay));
  }
  return { nextPhase, daysToTransition };
}

export default function JessPhasePrep({ user, profile }) {
  const cycle = useCycleDay(profile);
  const [text, setText]       = useState("");
  const [visible, setVisible] = useState(true);
  const [dismiss, setDismiss] = useState(false);
  const [next, setNext]       = useState(null);
  const ranRef               = useRef(false);

  const lifeStage = String(profile?.life_stage || "reproductive");
  const suppressed = SUPPRESSED_LIFE_STAGES.has(lifeStage);

  const cacheKey = user?.id
    ? `jess_phase_prep_${user.id}_${weekKey()}`
    : null;

  useEffect(() => {
    if (!cacheKey || ranRef.current) return;
    if (suppressed) { setVisible(false); ranRef.current = true; return; }
    if (!profile?.last_period_start_date) { setVisible(false); ranRef.current = true; return; }
    ranRef.current = true;

    const cached = loadDailyCache(cacheKey);
    if (cached?.suppress) { setVisible(false); return; }
    if (cached?.shown) { setVisible(false); return; }
    if (cached?.text && cached?.next) {
      setNext(cached.next);
      setText(cached.text);
      saveDailyCache(cacheKey, { ...cached, shown: true });
      return;
    }

    const computed = computeNextPhase(cycle);
    if (!computed) { setVisible(false); return; }
    const { nextPhase, daysToTransition } = computed;

    // Only fire inside the 3-4 day window.
    if (daysToTransition < 3 || daysToTransition > 4) {
      saveDailyCache(cacheKey, { suppress: true });
      setVisible(false);
      return;
    }

    const fallback = FALLBACK[nextPhase] || FALLBACK.follicular;

    const system =
      "You are Jess, a warm UK-based women's health companion. " +
      "The user's next cycle phase is approaching in a few days. " +
      "Write ONE warm 2-sentence message that names the phase, says when " +
      "(in days), and offers ONE practical, gentle prep tip — not medical advice. " +
      "Max 220 chars. No greeting, no sign-off, no quotation marks.";

    const userPrompt =
      `Current phase: ${cycle.phase}.\n` +
      `Next phase: ${nextPhase}.\n` +
      `Days until transition: ${daysToTransition}.\n` +
      `Life stage: ${lifeStage}.\n\n` +
      `Write the prep message.`;

    callJessAgent({ system, user: userPrompt })
      .then(({ text: raw }) => {
        const cleaned = String(raw || "").trim().replace(/^["']|["']$/g, "");
        const final = cleaned && cleaned.length > 12 ? cleaned : fallback;
        setNext({ nextPhase, daysToTransition });
        setText(final);
        saveDailyCache(cacheKey, { next: { nextPhase, daysToTransition }, text: final, shown: true });
      })
      .catch(() => {
        setNext({ nextPhase, daysToTransition });
        setText(fallback);
        saveDailyCache(cacheKey, { next: { nextPhase, daysToTransition }, text: fallback, shown: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, suppressed, profile?.last_period_start_date, cycle.phase, cycle.cycleDay]);

  function close() {
    setDismiss(true);
    setTimeout(() => setVisible(false), 320);
    if (cacheKey) {
      const cached = loadDailyCache(cacheKey) || {};
      saveDailyCache(cacheKey, { ...cached, shown: true });
    }
  }

  if (!visible || !text || !next) return null;

  const phaseLabel = PHASE_LABEL[next.nextPhase] || next.nextPhase;

  return (
    <article style={{
      margin: "0 16px 12px",
      background: `linear-gradient(135deg, ${C.paperHi} 0%, rgba(212,175,55,0.16) 100%)`,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.gold}`,
      borderRadius: 16,
      padding: "12px 14px 12px",
      display: "flex", alignItems: "flex-start", gap: 12,
      boxShadow: "0 4px 14px rgba(58,44,26,0.08)",
      animation: dismiss
        ? "jess-prep-leave 320ms ease-in forwards"
        : "jess-prep-enter 420ms cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9999,
        background: C.gold,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }} aria-hidden>
        <Sunrise size={14} style={{ color: C.espresso }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.muted, fontFamily: "'Inter', sans-serif",
        }}>Jess · {phaseLabel} phase in {next.daysToTransition} day{next.daysToTransition === 1 ? "" : "s"}</p>
        <p style={{
          margin: "4px 0 0", fontSize: 14,
          fontFamily: "'Fraunces', Georgia, serif",
          color: C.espresso, lineHeight: 1.5,
        }}>{text}</p>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss phase prep"
        style={{
          width: 26, height: 26, borderRadius: 9999,
          background: "rgba(58,44,26,0.06)", border: "none",
          color: C.espresso, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, padding: 0,
        }}
      ><X size={12} /></button>
      <style>{`
        @keyframes jess-prep-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jess-prep-leave {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </article>
  );
}
