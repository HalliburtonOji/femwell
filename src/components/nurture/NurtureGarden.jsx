// NurtureGarden — the Nurture Companion, phase 1 (MVP).
//
// A living bloom that grows from GENUINE engagement (journalling, nutrition logging,
// daily check-ins) — shown as STATE, never a score. It breathes with the current cycle
// phase (colour) and never dies: a gap is a "resting season", and coming back is met with
// a warm welcome, not guilt. No streaks, no decay, no numbers-as-pressure.
//
// Real signals (guarded reads): JournalEntries + MealLog + DailyCheckins.
//   · lifetime tending → growth STAGE (seed → sprout → budding → blooming → full bloom)
//   · days tended in the last week → "tended lately" vs "resting"
// Brand: cream/plum, Ephesis/Cormorant, Lucide/SVG, no emoji. Phase colour = canonical set.

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, differenceInCalendarDays } from "date-fns";
import {
  T, UI, SERIF, Script, Hand, Eyebrow, Heart, PHASE_COLORS, PHASE_LABEL, useEditorialFonts,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

// growth stages by lifetime "tending" count (acts of care across the app)
const STAGES = [
  { key: "seed",     min: 0,   name: "Just planted",   line: "A seed is in the soil. Whatever you tend — a line, a meal, a check-in — it begins to grow." },
  { key: "sprout",   min: 3,   name: "Sprouting",      line: "First green. Your garden is finding its feet, the way you are." },
  { key: "budding",  min: 10,  name: "Budding",        line: "Buds are forming. There's a shape to how you show up for yourself now." },
  { key: "blooming", min: 24,  name: "Blooming",       line: "It's blooming. Look what a season of small attentions makes." },
  { key: "full",     min: 50,  name: "In full bloom",  line: "Full and open. This is a garden that has been genuinely, gently kept." },
];
function stageFor(count) {
  let s = STAGES[0];
  for (const st of STAGES) if (count >= st.min) s = st;
  return s;
}

const DAY = 86400000;
function dayKeysBack(n) {
  const out = new Set();
  for (let i = 0; i < n; i++) out.add(format(new Date(Date.now() - i * DAY), "yyyy-MM-dd"));
  return out;
}

export default function NurtureGarden({ compact = false, onOpen = null }) {
  useEditorialFonts();
  const [data, setData] = useState(null);   // null = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const uid = me?.id;
      const last14 = dayKeysBack(14);
      const last7 = dayKeysBack(7);
      // guarded, capped reads — never block; missing data just means a younger garden
      const [entries, meals, checkins, prof] = await Promise.all([
        uid ? base44.entities.JournalEntries.filter({ user_id: uid }, "-created_date", 200).catch(() => []) : [],
        uid ? base44.entities.MealLog.filter({ user_id: uid }, "-day_key", 200).catch(() => []) : [],
        uid ? base44.entities.DailyCheckins.filter({ user_id: uid }, "-created_date", 120).catch(() => []) : [],
        base44.entities.UserProfile.filter({}, "-created_date", 1).catch(() => []),
      ]);
      if (!alive) return;
      const E = (entries || []).filter(Boolean);
      const M = (meals || []).filter(Boolean);
      const Cn = (checkins || []).filter(Boolean);
      const p = Array.isArray(prof) ? prof[0] : null;

      // lifetime tending = total real acts of care (capped reads, so this saturates gently)
      const lifetime = E.length + M.length + Cn.length;

      // distinct days tended (any signal) in the last 7 / 14 days
      const dayOf = (x) => x.day_key || x.date || (x.created_date ? String(x.created_date).slice(0, 10) : (x.created_at ? String(x.created_at).slice(0, 10) : null));
      const days = new Set();
      [...E, ...M, ...Cn].forEach((x) => { const d = dayOf(x); if (d) days.add(d); });
      const tended7 = [...days].filter((d) => last7.has(d)).length;
      const tended14 = [...days].filter((d) => last14.has(d)).length;

      // most recent act → for the "resting season" + welcome-back logic
      const allDays = [...days].sort();
      const lastDay = allDays.length ? allDays[allDays.length - 1] : null;
      const gapDays = lastDay ? differenceInCalendarDays(new Date(), new Date(lastDay)) : null;

      setProfile(p);
      setData({ lifetime, tended7, tended14, gapDays, lastDay });
    })();
    return () => { alive = false; };
  }, []);

  const phase = useMemo(() => {
    try { return profile?.last_period_start_date ? computeCycleDay(profile).phase : null; } catch { return null; }
  }, [profile]);
  const color = PHASE_COLORS[phase] || T.sage;

  if (data === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: compact ? "24px 0" : "60px 0" }}>
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  const stage = stageFor(data.lifetime);
  const stageIdx = STAGES.findIndex((s) => s.key === stage.key);
  // resting season: no tending for ~5+ days → the garden rests (never dies), warm welcome on return
  const resting = (data.gapDays == null) || (data.gapDays >= 5);
  const returning = data.gapDays != null && data.gapDays >= 5 && data.tended7 > 0; // came back today after a gap
  const tendedLately = data.tended7 > 0;

  const stateLine = data.gapDays == null
    ? "Your garden is ready for its first act of care."
    : returning
      ? "Welcome back. Your garden kept your place — it's waking up with you."
      : resting
        ? "Resting season. Nothing is lost; it's waiting, soft and alive, for whenever you return."
        : stage.line;

  const stateName = data.gapDays == null ? "Just planted"
    : resting && !returning ? "Resting"
    : stage.name;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 6 : 12 }}>
        <Heart size={14} />
        <Eyebrow color={T.muted}>{phase ? `Your garden · ${PHASE_LABEL[phase]} phase` : "Your garden"}</Eyebrow>
      </div>

      <Bloom stageIdx={stageIdx} color={color} resting={resting && !returning} size={compact ? 120 : 190} />

      <Script size={compact ? 24 : 32} color={T.ink} style={{ marginTop: compact ? 8 : 14 }}>{stateName}</Script>
      <Hand size={compact ? 15 : 17} color={T.muted} style={{ marginTop: 6, maxWidth: 360, lineHeight: 1.5 }}>
        {stateLine}
      </Hand>

      {!compact && (
        <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {tendedLately ? (
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.ink, background: T.wax, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px" }}>
              Tended {data.tended7} {data.tended7 === 1 ? "day" : "days"} this week
            </span>
          ) : null}
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.muted, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px" }}>
            No streaks · no scores · it never dies
          </span>
        </div>
      )}

      {!compact && (
        <div style={{ marginTop: 22, fontFamily: SERIF, fontSize: 13.5, color: T.muted, fontStyle: "italic", maxWidth: 380, lineHeight: 1.5 }}>
          It grows from what you already do — a journal line, a logged meal, a check-in. Rest is part of it; a gap is a season, not a failure.
        </div>
      )}
    </div>
  );
}

// ── the bloom — an SVG that opens petal by petal with the growth stage, in the phase
// colour, and breathes gently (calm pulse; stilled for resting + reduced-motion). ──
function Bloom({ stageIdx, color, resting, size = 190 }) {
  const cx = 50, cy = 42;
  const petals = [0, 1, 2, 3, 4, 5];
  // how "open" the bloom is by stage: seed=0 … full=1
  const open = Math.min(1, stageIdx / 4);
  const petalLen = 9 + open * 16;
  const petalW = 5 + open * 6;
  const leafOn = stageIdx >= 1;
  const leaf2On = stageIdx >= 2;
  const stemTop = stageIdx === 0 ? 58 : cy + 6;
  return (
    <div aria-hidden style={{ width: size, height: size, position: "relative" }}>
      <style>{`
        @keyframes fwBreath { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.045); } }
        @media (prefers-reduced-motion: reduce) { .fw-breath { animation: none !important; } }
      `}</style>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* soft halo */}
        <circle cx={cx} cy={cy} r={open * 26 + 8} fill={color} opacity="0.08" />
        {/* stem */}
        <path d={`M50 86 C 49 74, 51 66, 50 ${stemTop}`} stroke="#7C8F6E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* leaves */}
        {leafOn && <path d="M50 70 C 40 66, 34 70, 33 76 C 41 78, 48 75, 50 70 Z" fill="#8FAF8F" opacity="0.9" />}
        {leaf2On && <path d="M50 64 C 60 60, 66 64, 67 70 C 59 72, 52 69, 50 64 Z" fill="#7FA07F" opacity="0.85" />}
        {/* the bloom */}
        {stageIdx === 0 ? (
          // seed in soil
          <g>
            <ellipse cx={cx} cy="60" rx="7" ry="4.5" fill={color} opacity="0.55" />
            <path d="M30 64 Q50 60 70 64" stroke="#7C8F6E" strokeWidth="1.4" fill="none" opacity="0.5" />
          </g>
        ) : (
          <g className={resting ? "" : "fw-breath"} style={{ transformOrigin: `${cx}px ${cy}px`, animation: resting ? "none" : "fwBreath 5.5s ease-in-out infinite" }}>
            {petals.map((i) => {
              const a = (i * 60) * Math.PI / 180;
              const px = cx + Math.cos(a) * (petalLen * 0.62);
              const py = cy + Math.sin(a) * (petalLen * 0.62);
              return (
                <ellipse
                  key={i}
                  cx={px} cy={py}
                  rx={petalW} ry={petalLen * 0.6}
                  fill={color}
                  opacity={resting ? 0.4 : 0.85}
                  transform={`rotate(${i * 60} ${px} ${py})`}
                />
              );
            })}
            <circle cx={cx} cy={cy} r={3.5 + open * 2.5} fill={resting ? "#C9BCA6" : T.gold} />
          </g>
        )}
      </svg>
    </div>
  );
}
