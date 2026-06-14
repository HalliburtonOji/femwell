// PromptCarousel — the editorial "A note from Jess" prompt wing (Phase 1).
//
// Replaces the raw sage JessJournalPrompt card with the Editorial JessNote
// look while PRESERVING the live behaviour: the lead prompt is Jess's
// LLM-generated daily prompt (same jessAgentService + daily cache the wing
// used), with phase-tuned fallbacks. "Another prompt" cycles the phase set;
// "Write to this" opens the composer seeded with the current prompt.
//
// Brand: Ephesis script for the voiced prompt, Cormorant italic for CTAs, gold
// hairline accent, the single crimson heart. No emoji. Not medical advice.

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  callJessAgent, loadDailyCache, saveDailyCache, todayKey,
} from "@/services/jessAgentService";
import { T, UI, HAND, PRESS, Script, Eyebrow, Heart } from "./Editorial";

// Phase-tuned prompts (editorial register — second person, ritual-tinged).
const PHASE_TUNED = {
  menstrual: [
    "What is asking to be released this cycle, however small?",
    "Where can you let the pace soften today?",
    "What does rest look like if you let it be enough?",
    "What did your body carry you through this week?",
    "What feels quieter now, but truer?",
  ],
  follicular: [
    "What feels possible this week that didn't last week?",
    "What small beginning is asking for your attention?",
    "What would you start if no one were watching?",
    "Where is your energy wanting to go?",
    "What are you curious about today?",
  ],
  ovulatory: [
    "Who or what do you want to show up for today, and why?",
    "What wants to be said out loud?",
    "Where did you feel most like yourself this week?",
    "What are you ready to be seen for?",
    "What connection felt real lately?",
  ],
  luteal: [
    "What can you let go of — and what genuinely matters?",
    "What is a quieter no you have been avoiding saying?",
    "What have you noticed about yourself these last few days?",
    "What is weighing on you that you haven't said out loud?",
    "What does the discerning part of you already know?",
  ],
};
const tunedFor = (phase) => PHASE_TUNED[phase] || PHASE_TUNED.follicular;

export default function PromptCarousel({ user, profile, phase, cycleDay, lastEntry, onWrite, onDark = false }) {
  // on a DARK (dusk) surface, text must use the light/cream tokens for contrast — the
  // default dark-ink tokens are for light paper. (carve relief is for paper, off on dark.)
  const cMain = onDark ? T.paper : T.ink;
  const cSoft = onDark ? T.wax : T.muted;
  const cEyebrow = onDark ? T.wax : T.muted;
  const tuned = useMemo(() => tunedFor(phase), [phase]);
  const [lead, setLead] = useState("");     // Jess's live daily prompt
  const [loading, setLoading] = useState(false);
  const [i, setI] = useState(0);
  const tried = useRef(false);

  const cacheKey = useMemo(
    () => (user?.id ? `jess_journal_prompt_${user.id}_${todayKey()}` : null),
    [user?.id],
  );

  // Lead prompt = cached daily Jess prompt, else one agent call (cached).
  useEffect(() => {
    if (!cacheKey || tried.current) return;
    tried.current = true;
    const cached = loadDailyCache(cacheKey);
    if (cached?.prompt) { setLead(cached.prompt); return; }

    const fallback = tuned[0];
    const lastSnippet = (lastEntry?.text || "").toString().slice(0, 200).replace(/\s+/g, " ").trim();
    const system =
      "You are Jess, a UK-based women's wellness companion. " +
      "Your only job this turn: propose ONE journaling prompt the user could write into today. " +
      "Rules: (1) exactly one sentence ending with a question mark; (2) max 140 characters; " +
      "(3) warm and specific, never generic; (4) reference the current cycle phase mood when it fits; " +
      "(5) no preambles, sign-offs or quotation marks; (6) never give medical advice or name conditions.";
    const userPrompt =
      `Current cycle phase: ${phase || "follicular"}.\n` +
      `Life stage: ${profile?.life_stage || "reproductive"}.\n` +
      (lastSnippet ? `Last journal snippet: "${lastSnippet}"\n` : "") +
      `Suggest one journaling prompt for today.`;

    setLoading(true);
    callJessAgent({ system, user: userPrompt })
      .then(({ text }) => {
        const cleaned = String(text || "").trim().replace(/^["']|["']$/g, "").split(/\n/)[0].trim();
        const final = cleaned && cleaned.length > 5 ? cleaned : fallback;
        setLead(final);
        saveDailyCache(cacheKey, { prompt: final });
      })
      .catch(() => { setLead(fallback); saveDailyCache(cacheKey, { prompt: fallback }); })
      .finally(() => setLoading(false));
  }, [cacheKey, phase, profile?.life_stage, lastEntry, tuned]);

  // Carousel sequence: Jess's live prompt first (once ready), then the phase set.
  const sequence = lead ? [lead, ...tuned] : tuned;
  const current = sequence[i % sequence.length];
  const phaseWord = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Today";
  const onLead = lead && (i % sequence.length) === 0;

  return (
    <section style={{ marginBottom: 46 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Heart size={14} />
        <Eyebrow color={cEyebrow}>
          A note from Jess · {phaseWord}{cycleDay ? ` · Day ${cycleDay}` : ""}
        </Eyebrow>
      </div>

      {loading && !lead ? (
        <Script size={32} color={onDark ? T.paper : T.inkSoft} carve={false} style={{ letterSpacing: 0.2, opacity: onDark ? 0.85 : 0.75 }}>
          Jess is thinking…
        </Script>
      ) : (
        <Script size={34} color={cMain} carve={!onDark} style={{ letterSpacing: 0.2 }}>{current}</Script>
      )}

      <div style={{ display: "flex", gap: 26, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => current && onWrite && onWrite(current)}
          disabled={!current}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
            border: "none", cursor: current ? "pointer" : "default", padding: 0, paddingBottom: 3,
            fontFamily: HAND, fontWeight: 600, fontSize: 20, color: cMain, textShadow: onDark ? "none" : PRESS,
            borderBottom: `1px solid ${T.gold}`, opacity: current ? 1 : 0.5,
          }}
        >
          Write to this <ArrowRight size={14} />
        </button>
        <button
          onClick={() => setI((x) => x + 1)}
          style={{
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
            fontFamily: UI, fontSize: 12.5, color: cSoft, letterSpacing: 0.4, fontWeight: 600,
          }}
        >
          Another prompt
        </button>
        <span style={{ fontFamily: UI, fontSize: 10, color: cSoft, letterSpacing: 0.4, fontWeight: 600, fontStyle: "italic", marginLeft: "auto" }}>
          {onLead ? "Jess · today" : "Phase prompt"} · not medical advice
        </span>
      </div>
    </section>
  );
}
