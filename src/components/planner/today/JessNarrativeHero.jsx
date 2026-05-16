import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// JessNarrativeHero — Today-A T-A2 (MP-Today-A).
//
// Full-width gradient hero card at the top of the /Today page. Fraunces 26px
// headline + Inter 14px body, both phase-tinted. Generated weekly by a
// `generateJessHero` LLM call and cached for 7 days per
// `(user_id × isoWeek × phase)` via localStorage so credits are bounded
// (~£20/mo at 5k MAU per spec default #3 — `gpt_5_mini` at ~$0.0008/call).
//
// When the network call fails or no cached value exists yet, the component
// falls back to a deterministic 32-line bank (4 phases × 8 lines, selected
// by ISO-week × phase hash) so the hero always renders.
//
// Spec ref: claude-state/base44_mps/2026-05-15_today_redesign_A/spec.md §T-A2.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS = {
  menstrual:  "Period",
  follicular: "Follicular",
  ovulatory:  "Ovulatory",
  luteal:     "Luteal",
};

// Le Menu × Phase Sun — saturated phase palette for the sun rays + accent (applied 2026-05-16).
const PHASE_SOLID = {
  menstrual:  "#9A2845",
  follicular: "#D4745A",
  ovulatory:  "#C8A040",
  luteal:     "#7B5E9A",
  none:       "#A6862B",
};

// Roman numeral chapter for the phase (mirrors the Le Menu eyebrow "Chapter IV · La Lutéale").
const PHASE_ROMAN = {
  menstrual:  "I",
  follicular: "II",
  ovulatory:  "III",
  luteal:     "IV",
  none:       "·",
};

// Phase tint at 18% opacity over cream gradient (spec default #5).
const PHASE_TINTS = {
  menstrual:  "rgba(154,40,69,0.18)",
  follicular: "rgba(212,116,90,0.18)",
  ovulatory:  "rgba(200,160,64,0.18)",
  luteal:     "rgba(123,94,154,0.18)",
  none:       "rgba(166,134,43,0.18)", // gold-deep tint when phase unknown
};

// Phase Sun — 12 rays in current phase colour, cream/gold core. The Le Menu
// signature element. Rays rotate 60s · core pulses 3s (polish pass 2026-05-16).
function PhaseSun({ phase = "luteal", size = 60 }) {
  const c = PHASE_SOLID[phase] || PHASE_SOLID.none;
  const gid = `jess-sun-${phase}`;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="50%" cy="48%" r="50%">
          <stop offset="0%"  stopColor="#FBF6E6"/>
          <stop offset="65%" stopColor="#F4E8C8"/>
          <stop offset="100%" stopColor="#E8D49E"/>
        </radialGradient>
        <style>{`
          @keyframes jess-sun-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes jess-sun-pulse  { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          .jess-sun-rays { transform-origin: 36px 36px; animation: jess-sun-rotate 60s linear infinite; }
          .jess-sun-core { transform-origin: 36px 36px; animation: jess-sun-pulse 3s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .jess-sun-rays, .jess-sun-core { animation: none; }
          }
        `}</style>
      </defs>
      <g className="jess-sun-rays">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line key={i}
              x1={36 + Math.cos(a) * 21} y1={36 + Math.sin(a) * 21}
              x2={36 + Math.cos(a) * 34} y2={36 + Math.sin(a) * 34}
              stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i + 0.5) / 12) * Math.PI * 2;
          return (
            <line key={`t${i}`}
              x1={36 + Math.cos(a) * 25} y1={36 + Math.sin(a) * 25}
              x2={36 + Math.cos(a) * 30} y2={36 + Math.sin(a) * 30}
              stroke={c} strokeWidth="0.9" strokeOpacity="0.55" strokeLinecap="round"/>
          );
        })}
      </g>
      <circle className="jess-sun-core" cx="36" cy="36" r="16" fill={`url(#${gid})`} stroke={c} strokeWidth="0.6" strokeOpacity="0.7"/>
    </svg>
  );
}

// 32-line fallback bank — 4 phases × 8 lines. Selected deterministically by
// (isoWeek × phase) so the same week on the same phase always shows the
// same fallback if the LLM call fails. Permissive voice, no imperatives.
const FALLBACK_BANK = {
  menstrual: [
    { headline: "A week to soften the edges", body: "Your body's doing quiet work this week. Less ambition and more warmth might land well — you can let the to-do list wait." },
    { headline: "Slower mornings, gentler days", body: "Period weeks tend to ask for warm food, longer baths, and earlier nights. Take what you can; the week will keep." },
    { headline: "The rest week, by design", body: "This is the week the body asks for rest, not performance. Honour what you can, defer the rest — it'll be here." },
    { headline: "A pause that's not a setback", body: "Less energy now is part of the rhythm, not a glitch. A short walk, a warm cup, an early night — small is enough." },
    { headline: "Permission to do less, with care", body: "Bleeding weeks deserve their own pace. Lower the bar on outputs and watch the small kindnesses add up." },
    { headline: "Warmth wins this week", body: "Hot water bottles, slow meals, gentle stretches. The week doesn't need to be productive to count." },
    { headline: "Resting is a kind of working", body: "Your body's recovery is its own form of progress this week. Lay back into it without apology." },
    { headline: "Soft week, soft expectations", body: "If today asks for less, give it less. The shape of this week is rest — you'll have the others back soon enough." },
  ],
  follicular: [
    { headline: "Energy returning, in your time", body: "Follicular weeks tend to feel a bit lighter — a good window to begin one new thing if you've been waiting." },
    { headline: "Curiosity, quietly back online", body: "The rising window often invites making, planning, starting. Lean in lightly — no need to make up for the rest week." },
    { headline: "A widening lens this week", body: "Your nervous system tends to settle in this phase. A small new project might find a home here." },
    { headline: "Steady steps forward", body: "Follicular days carry their own kind of momentum. You don't have to push — the rhythm is doing some of the work." },
    { headline: "Permission to start something", body: "If there's been an idea waiting for a yes, this is a kind week to give it a small one. Nothing big — a first move is enough." },
    { headline: "A clearer thinking week", body: "Sleep often settles a touch in follicular days, and the mind tends to follow. Read something deeper, write something honest." },
    { headline: "The opening days", body: "The body's tending toward energy this week. Don't fill every gap — leave a little room to be surprised by yourself." },
    { headline: "Forward gently", body: "Follicular phases reward small, consistent moves over big ones. One walk, one good chapter, one decision — you've got time." },
  ],
  ovulatory: [
    { headline: "Bright window, your own pace", body: "Ovulatory weeks often carry the most energy of the cycle. Use it for what feels alive, not what feels like obligation." },
    { headline: "Connection lands more easily", body: "This is the phase your nervous system tends to feel social. A coffee with someone you've missed often does the trick." },
    { headline: "The 'yes' week, gently held", body: "More yes, less pressure. The expansive feeling is real — let it serve what you actually want, not what you ought to want." },
    { headline: "Peaks, on your terms", body: "Confidence often rises here. Sit with it for a beat before deciding what it wants to do with you." },
    { headline: "A wider apparent week", body: "Ovulatory days can make most things feel possible. The trick is choosing one — not chasing all of them." },
    { headline: "Energy with edges", body: "Even peak weeks have a ceiling. Two days of bigness plus three of steadiness usually wears better than five of pushing." },
    { headline: "The bright stretch", body: "Honour the lift without manufacturing more. A walk in proper sun, a real laugh — both count as productive." },
    { headline: "Open and unhurried", body: "This week tends to expand. Don't fill the expansion — leave a little space for the rest of the cycle to come home to." },
  ],
  luteal: [
    { headline: "A softer landing this week", body: "Luteal days often invite a different pace — depth over breadth, careful over many. The body's narrowing for a reason." },
    { headline: "Tighter focus, gentler outputs", body: "Energy starts metering itself this week. A clear close on one thing usually beats juggling four." },
    { headline: "Inward, by design", body: "The body's pulling some attention back inside this week. Saying no to a few extras now keeps the period week kinder later." },
    { headline: "Honest hours", body: "Luteal weeks are good for honest writing, honest editing, honest reflection. The unflinching kind of work, in small doses." },
    { headline: "Permission to slow the input", body: "Less social, less new, less noise often serves better this week. Reading something you already love is a real plan." },
    { headline: "Tend rather than chase", body: "The window's tending toward maintenance, not novelty. Cook the meal you usually skip; clean the corner you usually avoid." },
    { headline: "Quietly closing the loops", body: "This phase rewards finishing more than starting. One small loop closed today is more honest than three new ones opened." },
    { headline: "Warmth, slowness, less", body: "Your body's preparing for the next week. Warm food, earlier sleep, fewer ambitions — these are gifts to your future self." },
  ],
  none: [
    { headline: "Still learning your pattern", body: "We'll start to recognise your rhythm after a couple of cycles. For now, log a period when it lands and the rest will follow." },
    { headline: "A week of beginnings", body: "Without a phase yet, take the week on its own terms. Log a few checkins and the picture will start to fill in." },
    { headline: "Quiet groundwork", body: "While we're still calibrating, small consistent acts — water, a walk, sleep — carry more weight than big gestures." },
    { headline: "Soft start, no pressure", body: "It takes a cycle or two before patterns start to surface. Until then, gentleness is its own plan." },
    { headline: "The shape will come", body: "Each checkin teaches us a little more. The week ahead doesn't need to be perfect — just honest enough to learn from." },
    { headline: "Open weeks, open pace", body: "Before patterns settle in, you've got some freedom. Listen for what wants attention; we'll match it once your rhythm's known." },
    { headline: "Listening week", body: "We're still listening for your patterns. Treat this week as data — gentle, honest, low-stakes." },
    { headline: "Yours to set", body: "Without a phase yet, the week's yours to define. A single anchor each day is plenty while we learn alongside you." },
  ],
};

// Stage-keyed fallback bank — used when plannerConfig.ribbonType !== "cycle"
// (i.e. peri, ttc, teen, postpartum, ha, pcos-modifier). Four lines per stage,
// permissive voice, no cycle-phase language. Mirrors the per-stage jess_context
// guidance from src/utils/plannerAdapter.js so the FE-only fallback doesn't
// drift away from what the LLM would have said.
const STAGE_FALLBACK_BANK = {
  perimenopause: [
    { headline: "Patterns over predictions",        body: "Cycles are doing their own thing now — that's perimenopause, not a glitch. Tracking hot flushes and sleep this week will tell you more than counting days ever could." },
    { headline: "Symptom load, gently watched",     body: "Some weeks land louder than others in peri. Log what you notice; the pattern is the point, not the perfect entry." },
    { headline: "Resistance over relentlessness",   body: "Strength work tends to help most in this phase. A short, honest session beats a long one you dread." },
    { headline: "Sleep first, ambition second",     body: "Night sweats can fragment everything else. If sleep's been thin, lower the bar on the day — the body's still doing the harder thing." },
  ],
  menopause: [
    { headline: "A different kind of steady",       body: "Without a cycle to ride, the week is yours to shape. Long-game pillars — bone, heart, mood, sleep — earn small consistent moves more than big bursts." },
    { headline: "Bone is a long conversation",      body: "Weight-bearing movement this week pays back for decades. Walk, lift, climb a stair more than you usually would." },
    { headline: "Local oestrogen is allowed",       body: "GSM is the most undertreated thing in this stage. If anything's tender or dry, it's worth a GP word — vaginal oestrogen is safe and effective." },
    { headline: "Quiet wins compound",              body: "The headline metrics don't change overnight here. Sleep, protein, walks, friendship — pick one, hold it lightly." },
  ],
  ttc: [
    { headline: "Holding the wait",                 body: "The two-week wait is the hardest stretch of TTC. Plans that involve other people often help more than plans that involve waiting alone." },
    { headline: "Cycle as a clinical tool",         body: "BBT, OPK, supplements — this week is data, not destiny. We won't pretend to know what we don't, and you don't have to either." },
    { headline: "Small steady kindness",            body: "Folic acid, water, sleep, a walk. The dull list still matters; TTC weeks reward repetition over heroics." },
    { headline: "Both true at once",                body: "You can hope and protect yourself at the same time. Letting this week be both is honest." },
  ],
  teen: [
    { headline: "Still learning your pattern",      body: "Cycles often take a year or two to settle after they start. Logging what you notice is the most useful thing you can do this week — no need for perfect data." },
    { headline: "It is fine to feel different",     body: "Some weeks you'll feel bright, some heavy. That's bodies, not failure. Tell someone you trust if anything feels too much." },
    { headline: "Body and mood together",           body: "The week before a bleed often dips in mood. Knowing that's normal makes it lighter. We're not measuring you — we're learning with you." },
    { headline: "School + cycle = a real thing",    body: "If a heavy week lands on a hard week at school, that's worth a conversation with someone older. The body deserves room." },
  ],
  postpartum: [
    { headline: "Healing is its own kind of work",  body: "Postpartum weeks ask the body to keep doing the recovery in the background. Sleep, water, gentle movement — the dull stuff is the real thing here." },
    { headline: "Mood matters this week",           body: "Baby blues and PND can look alike on a hard day. If anything's heavier than it should be, the GP or health visitor wants to know — not after, now." },
    { headline: "Pelvic floor, lightly",            body: "A short daily contraction set this week is more useful than a long one once a month. Squeezy app or NHS-aligned cues, your call." },
    { headline: "The cycle will return when it does",body: "Lactational amenorrhea is a real reason periods can take months to come back. We're not predicting — just keeping an eye." },
  ],
  pcos: [
    { headline: "Three steady levers",              body: "Protein at breakfast, a walk after lunch, two strength sessions this week. PCOS responds to repetition more than perfection." },
    { headline: "Cycle on its own clock",           body: "PCOS Mode is on; we won't pretend to predict your next bleed. NHS guidance suggests inducing one every 3-4 months if absent — worth a GP word if you're past that." },
    { headline: "Sleep is metabolic",               body: "Short or fragmented sleep this week makes the insulin side harder. Earlier bedtimes earn more than later workouts in PCOS." },
    { headline: "Symptoms over phase",              body: "Acne, energy, mood, weight, hair — that's the dashboard for now. Log what you notice; the cycle is one input, not the whole picture." },
  ],
  ha: [
    { headline: "Recovery is the only goal",        body: "Restoration mode is on. We won't show calorie content or training intensity, and we won't predict a cycle. The body chooses the timeline." },
    { headline: "Rest is the work",                 body: "Energy availability is the lever in HA. More food and less movement, kindly, repeatedly — this week and the next." },
    { headline: "If anything's heavy, reach",       body: "Beat (beateatingdisorders.org.uk) and your GP exist for this. The hardest part is starting the conversation; the rest is held." },
    { headline: "Small honest weeks",               body: "HA recovery happens in many small honest weeks. We're not measuring progress against anything; we're just being here with you." },
  ],
};

// Cheap deterministic hash for fallback rotation.
function stringToHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ISO week-of-year number (Mon-start).
function isoWeekOfYear(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

// Resolve the fallback bank for the current state. Stage takes precedence
// over cycle phase when the stage has its own bank (peri, ttc, teen,
// postpartum, ha) OR when the conditions include pcos / ha (which reshape
// the voice in plannerAdapter). Otherwise we fall back to the cycle-phase
// bank (reproductive default).
function fallbackFor(phase, dateISO, lifeStage, conditions) {
  // Stage-keyed override.
  const conds = Array.isArray(conditions) ? conditions : [];
  let stageKey = null;
  if (conds.includes("ha")) stageKey = "ha";
  else if (conds.includes("pcos")) stageKey = "pcos";
  else if (lifeStage && STAGE_FALLBACK_BANK[lifeStage]) stageKey = lifeStage;
  if (stageKey) {
    const bank = STAGE_FALLBACK_BANK[stageKey];
    const idx = stringToHash(dateISO + stageKey) % bank.length;
    return bank[idx];
  }
  // Fall back to cycle-phase bank.
  const key = phase && FALLBACK_BANK[phase] ? phase : "none";
  const bank = FALLBACK_BANK[key];
  const idx = stringToHash(dateISO + key) % bank.length;
  return bank[idx];
}

export default function JessNarrativeHero({ profile, cycleInfo, plannerConfig }) {
  const today = new Date();
  const dateISO = today.toISOString().split("T")[0];
  const phase = cycleInfo?.phase || "";
  const week = isoWeekOfYear(today);

  // Life Stage context — bumps the cache key so each stage gets its own
  // weekly hero, and is passed through to the backend so the LLM prompt
  // is reshaped per stage / condition. See src/utils/plannerAdapter.js.
  // plannerConfig.ribbonType !== "cycle" → stage-keyed fallback bank.
  const lifeStage = profile?.life_stage || "reproductive";
  const conditions = profile?.conditions || profile?.condition_flags || [];
  const conditionsKey = conditions.slice().sort().join("-") || "none";

  const cacheKey = useMemo(() => {
    const uid = profile?.user_id || profile?.id || "anon";
    return `fw_jess_hero_${uid}_w${week}_${phase || "none"}_${lifeStage}_${conditionsKey}`;
  }, [profile?.user_id, profile?.id, week, phase, lifeStage, conditionsKey]);

  const [hero, setHero] = useState(() => fallbackFor(phase, dateISO, lifeStage, conditions));

  useEffect(() => {
    let cancelled = false;

    // Step 1: try localStorage cache.
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const ageMs = Date.now() - (parsed?.savedAt || 0);
        if (parsed?.headline && parsed?.body && ageMs < 7 * 24 * 60 * 60 * 1000) {
          setHero({ headline: parsed.headline, body: parsed.body, from: "cache" });
          return; // skip network
        }
      }
    } catch { /* fall through to network */ }

    // Step 2: network. Skip when user is anonymous or opt-out flag is set.
    if (!profile?.user_id) return;
    if (localStorage.getItem("fw_jess_hero_enabled") === "0") return;

    (async () => {
      try {
        const res = await base44.functions.invoke("generateJessHero", {
          phase: phase || "",
          week_of_year: week,
          recent_mood_trend: "unknown",
          habit_hit_rate_pct: null,
          cycle_observed_count: profile?.cycle_prediction_meta?.cycles_observed || 0,
          life_stage: lifeStage,
          jess_context: plannerConfig?.jessContext || "",
          banner_text: plannerConfig?.bannerText || "",
        });
        const payload = res?.data || res;
        if (cancelled) return;
        if (payload?.ok && payload?.headline && payload?.body) {
          setHero({ headline: payload.headline, body: payload.body, from: "llm" });
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              headline: payload.headline,
              body: payload.body,
              savedAt: Date.now(),
            }));
          } catch { /* localStorage full or unavailable — fail quiet */ }
        }
      } catch {
        // Fallback already showing — silent.
      }
    })();

    return () => { cancelled = true; };
  }, [cacheKey, phase, week, profile?.user_id, profile?.cycle_prediction_meta?.cycles_observed, lifeStage, plannerConfig?.jessContext, plannerConfig?.bannerText]);

  const tint = PHASE_TINTS[phase] || PHASE_TINTS.none;
  // Le Menu × Phase Sun — chapter eyebrow defaults to "Chapter IV · Luteal · Day 22".
  // Life Stage adapter: when the stage isn't cycle-anchored (peri / pregnancy /
  // ttc / postpartum / post-meno / pcos-modifier / ha-modifier), swap the
  // chapter line for a stage-aware prefix from plannerConfig.eyebrowPrefix so
  // the cycle frame doesn't dominate when it shouldn't.
  const phaseLabel = phase ? PHASE_LABELS[phase] : null;
  const roman = phase ? PHASE_ROMAN[phase] : null;
  const cycleDay = cycleInfo?.day || null;
  const ribbonType = plannerConfig?.ribbonType || "cycle";
  const stageEyebrow = plannerConfig?.eyebrowPrefix || null;
  let eyebrow;
  if (ribbonType !== "cycle" && stageEyebrow) {
    // Stage-aware: e.g. "TODAY · PERI" / "TODAY · CD" / "TODAY · STILL LEARNING".
    eyebrow = stageEyebrow;
  } else if (phaseLabel && roman) {
    eyebrow = cycleDay
      ? `Chapter ${roman} · ${phaseLabel} · Day ${cycleDay}`
      : `Chapter ${roman} · ${phaseLabel}`;
  } else {
    eyebrow = "This week";
  }

  // Stronger gradient for visual weight — bump the phase tint from 18% to
  // ~32% so the hero clearly anchors the top of the Today tab.
  const heroBg = tint.replace(/0\.18\)/g, "0.32)").replace(/0\.18 /g, "0.32 ");
  const accentColor = PHASE_SOLID[phase] || PHASE_SOLID.none;

  return (
    <section
      role="region"
      aria-label="This week's hero, from Jess"
      style={{
        position: "relative",
        // Le Menu cream paper base, with phase tint blended in
        background: `linear-gradient(135deg, ${heroBg} 0%, #F4EDDB 70%, #FBF6E6 100%)`,
        border: "1px solid rgba(58,44,26,0.16)",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 18,
        padding: "16px 18px 18px",
        marginBottom: 12,
        boxShadow: "0 4px 14px rgba(58,44,26,0.10), 0 1px 3px rgba(58,44,26,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Le Menu Phase Sun — top-right anchor */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 12, right: 14, opacity: 0.95, pointerEvents: "none",
      }}>
        <PhaseSun phase={phase || "none"} size={60}/>
      </div>
      <div style={{ paddingRight: 64 }}>
        <p style={{
          ...eyebrowStyle,
          color: accentColor,
          letterSpacing: "0.22em",
        }}>{eyebrow}</p>
        <h2 aria-live="polite" style={{
          ...headlineStyle,
          color: "#3A2C1A",
        }}>{hero.headline}</h2>
        <p style={{
          ...bodyStyle,
          color: "#6B5840",
        }}>{hero.body}</p>
        <div style={{
          ...attributionStyle,
          color: "#8A7458",
        }}>
          <Sparkles size={11} strokeWidth={1.6} aria-hidden="true" />
          <span>From Jess · this week</span>
        </div>
      </div>
    </section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const eyebrowStyle = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "var(--gold-deep, #A6862B)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 8px",
};
const headlineStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 26,
  fontWeight: 500,
  lineHeight: 1.18,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.018em",
  margin: "0 0 10px",
};
const bodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  margin: "0 0 12px",
};
const attributionStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--plum-mute, #8A7584)",
  letterSpacing: "0.02em",
};
