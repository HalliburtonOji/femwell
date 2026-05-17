import { format } from "date-fns";
import { Sun, Moon, Sunset, Plus, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isCycleLifeStage } from "@/utils/plannerAdapter";

const MORNING_MESSAGES = {
  menstrual: [
    "Rest is productive today.",
    "Your body is doing deep work. Be soft with yourself.",
    "Slow mornings are allowed. You don't have to do it all.",
  ],
  follicular: [
    "Fresh energy incoming. What will you create?",
    "Your mind is sharp and ready. Great day to start something.",
    "Rising energy — lean into it.",
  ],
  ovulatory: [
    "You're glowing today. Go connect with someone.",
    "Peak week. Your charisma is high — use it.",
    "Great day for big conversations and bold moves.",
  ],
  luteal: [
    "Honour what you need today.",
    "Your intuition is sharp this week. Trust it.",
    "It's okay to slow down. Deep rest is part of the cycle.",
  ],
};

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function computeNextPeriod(profile) {
  if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
  const last = new Date(profile.last_period_start_date);
  const cycle = profile.cycle_avg_length || 28;
  const today = new Date();
  let next = new Date(last);
  while (next <= today) next = new Date(next.getTime() + cycle * 86400000);
  const daysUntil = Math.round((next - today) / 86400000);
  return daysUntil <= 7 ? daysUntil : null;
}

// Phase config — no emojis, clean
const PHASE_META = {
  menstrual:  { label: "Menstrual",  accent: "#C4849A", subtle: "#F5ECF0", tip: "Rest and restore. Your body is working hard." },
  follicular: { label: "Follicular", accent: "#7A9E8E", subtle: "#EBF2EF", tip: "Energy rising — a good time to start new things." },
  ovulatory:  { label: "Ovulatory",  accent: "#B89E6A", subtle: "#F5F0E6", tip: "Peak clarity and confidence. Make the most of today." },
  luteal:     { label: "Luteal",     accent: "#8A7E88", subtle: "#F0EBF0", tip: "Wind down, reflect, and nourish yourself." },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { word: "Good morning", Icon: Sun };
  if (h < 17) return { word: "Good afternoon", Icon: Sunset };
  return { word: "Good evening", Icon: Moon };
}

const PHASE_IMAGES = {
  menstrual:  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80",
  follicular: "https://images.unsplash.com/photo-1490750967868-88df5691cc2b?w=900&q=80",
  ovulatory:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  luteal:     "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=900&q=80",
  default:    "https://images.unsplash.com/photo-1490750967868-88df5691cc2b?w=900&q=80",
};

function HeroAmbient({ phase }) {
  const meta = phase ? PHASE_META[phase] : null;
  const baseColor = meta?.accent || "#C4849A";
  const imgSrc = PHASE_IMAGES[phase] || PHASE_IMAGES.default;
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[28px]"
      aria-hidden="true"
      style={{ background: `linear-gradient(145deg, var(--ivory) 0%, ${meta?.subtle || "#F5ECF0"} 100%)` }}
    >
      {/* HD phase photo */}
      <img
        src={imgSrc}
        alt=""
        loading="lazy"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, transition: "opacity 1.5s ease" }}
        onError={e => { e.target.style.display = "none"; }}
      />
      {/* Frosted gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 0%, rgba(250,248,245,0.6) 100%)" }} />
      {/* Orb 1 */}
      <div
        style={{
          position: "absolute", top: "-30%", right: "-10%",
          width: "55%", paddingBottom: "55%", borderRadius: "50%",
          background: `radial-gradient(circle, ${baseColor}26 0%, transparent 70%)`,
          animation: "fw-drift-a 18s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 2 */}
      <div
        style={{
          position: "absolute", bottom: "-20%", left: "-8%",
          width: "45%", paddingBottom: "45%", borderRadius: "50%",
          background: `radial-gradient(circle, ${baseColor}18 0%, transparent 70%)`,
          animation: "fw-drift-b 22s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 60px, ${baseColor}07 60px, ${baseColor}07 61px)`,
        }}
      />
      <style>{`
        @keyframes fw-drift-a { from { transform: translate(0,0) scale(1); } to { transform: translate(3%,5%) scale(1.08); } }
        @keyframes fw-drift-b { from { transform: translate(0,0) scale(1); } to { transform: translate(-3%,-4%) scale(1.06); } }
      `}</style>
    </div>
  );
}

function extractFirstName(profile, user) {
  if (profile?.display_name) return profile.display_name;
  if (user?.full_name) return user.full_name.split(" ")[0];
  if (user?.email) {
    const prefix = user.email.split("@")[0];
    const words = prefix.split(/[0-9_.\-]+/).filter(Boolean);
    if (words[0]) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }
  return "";
}

export default function TodayHeroSection({
  user,
  profile,
  cycleInfo,
  todayCheckin,
  onOpenCheckin,
  onOpenCalendar,
}) {
  const { word: greetWord, Icon: GreetIcon } = getGreeting();
  const firstName = extractFirstName(profile, user);

  // Phase 2 QA fix #1 (BLOCKER) — cycle-anchored UI must NEVER render on
  // non-cycle stages (pregnant-t1/t2/t3, postpartum, menopause, post-
  // menopause, PCOS-modified, HA-modified). Even if the profile still
  // carries a `last_period_start_date` from before the stage flip, "Period
  // in 2 days" on a pregnant user is factually wrong + violates trust.
  const lifeStage = profile?.life_stage || "reproductive";
  const conditions = profile?.conditions || profile?.condition_flags || [];
  const cycleAnchored = isCycleLifeStage(lifeStage, conditions);

  const phaseMeta = cycleInfo && cycleAnchored ? PHASE_META[cycleInfo.phase] : null;
  const today = new Date();

  // Smart morning message — deterministic pick by day-of-year. Only render
  // a phase-keyed message when the stage is cycle-anchored; otherwise the
  // greeting + check-in stays neutral.
  const morningMsg = (() => {
    if (!cycleAnchored) return null;
    const phase = cycleInfo?.phase;
    const msgs = phase ? MORNING_MESSAGES[phase] : null;
    if (!msgs) return null;
    return msgs[getDayOfYear() % msgs.length];
  })();

  // Period countdown — only compute when stage is cycle-anchored. Pregnant /
  // postpartum / menopausal users must not see "Period in N days".
  const daysUntilPeriod = cycleAnchored ? computeNextPeriod(profile) : null;

  return (
    <div className="relative rounded-[28px] overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-md)" }}>
      <HeroAmbient phase={cycleInfo?.phase} />

      {/* Content layer */}
      <div className="relative z-10 px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">

        {/* Welcome row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {/* Date line */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <button
                onClick={onOpenCalendar}
                title="Open tracker"
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.8)",
                  backgroundColor: "rgba(255,255,255,0.55)",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}
              >
                <CalendarDays style={{ width: 16, height: 16, color: "var(--mauve)" }} />
              </button>
              <p
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.12em" }}
              >
                {format(today, "EEEE, MMMM d")}
              </p>
            </div>

            {/* Greeting */}
            <h1
              className="text-3xl md:text-4xl leading-tight"
              style={{
                fontFamily: "'Fraunces', serif",
                color: "var(--plum)",
                letterSpacing: "-0.02em",
                fontWeight: 600,
              }}
            >
              {greetWord}
              {firstName && (
                <span style={{ color: phaseMeta?.accent || "var(--rose-dust)", display: "block" }}>
                  {firstName}.
                </span>
              )}
            </h1>
          </div>

          {/* Avatar */}
          <Link
            to={createPageUrl("Profile")}
            title="View profile"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-base font-semibold"
              style={{
                backgroundColor: phaseMeta?.subtle || "var(--rose-dust-subtle)",
                color: phaseMeta?.accent || "var(--rose-dust)",
                border: `1.5px solid ${phaseMeta?.accent || "var(--rose-dust-light)"}40`,
                fontFamily: "'Fraunces', serif",
                fontSize: "1.1rem",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {user?.full_name?.[0]?.toUpperCase() || "·"}
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div
          style={{ height: "1px", backgroundColor: `${phaseMeta?.accent || "var(--rose-dust)"}20`, marginBottom: "1.25rem" }}
        />

        {/* Cycle context — premium, text-led */}
        {cycleInfo && phaseMeta && (
          <div className="mb-4 flex items-start gap-4">
            <div
              className="flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1"
              style={{ backgroundColor: phaseMeta.accent, boxShadow: `0 0 8px ${phaseMeta.accent}60` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: phaseMeta.accent, fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}
                >
                  {phaseMeta.label} · Day {cycleInfo.day}
                </p>
                {daysUntilPeriod !== null && (
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    backgroundColor: daysUntilPeriod <= 3 ? "var(--rose-dust-subtle)" : "rgba(255,255,255,0.65)",
                    color: daysUntilPeriod <= 3 ? "var(--rose-dust)" : "var(--mauve)",
                    border: `1px solid ${daysUntilPeriod <= 3 ? "var(--rose-dust-light)" : "var(--border)"}`,
                    borderRadius: 9999, padding: "2px 9px",
                    fontSize: 10, fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    Period in {daysUntilPeriod}d
                  </span>
                )}
              </div>
              {morningMsg && (
                <p
                  className="text-sm leading-relaxed mb-1"
                  style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  {morningMsg}
                </p>
              )}
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--plum)", opacity: 0.6, fontFamily: "'Inter', sans-serif" }}
              >
                {phaseMeta.tip}
              </p>
            </div>
          </div>
        )}

        {/* Primary daily focus — check-in CTA or summary */}
        {todayCheckin ? (
          <div
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}
              >
                Today's check-in
              </p>
              <button
                onClick={onOpenCheckin}
                className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: phaseMeta?.accent || "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Mood",   value: todayCheckin.mood,        unit: "/5" },
                { label: "Energy", value: todayCheckin.energy,      unit: "/5" },
                { label: "Stress", value: todayCheckin.stress,      unit: "/5" },
                { label: "Sleep",  value: todayCheckin.sleep_hours, unit: "h" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p
                    className="text-xl font-semibold leading-none"
                    style={{ color: "var(--plum)", fontFamily: "'Fraunces', serif" }}
                  >
                    {m.value ?? "—"}
                    <span className="text-xs font-normal" style={{ color: "var(--mauve)" }}>{m.unit}</span>
                  </p>
                  <p
                    className="text-[10px] mt-1 uppercase tracking-wider"
                    style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}
                  >
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenCheckin}
            className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-200 group"
            style={{
              backgroundColor: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
              style={{
                backgroundColor: phaseMeta?.subtle || "var(--rose-dust-subtle)",
                color: phaseMeta?.accent || "var(--rose-dust)",
              }}
            >
              <GreetIcon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
              >
                How are you today?
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}
              >
                Log mood, energy, sleep and more
              </p>
            </div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: phaseMeta?.subtle || "var(--rose-dust-subtle)", color: phaseMeta?.accent || "var(--rose-dust)" }}
            >
              <Plus className="w-3.5 h-3.5" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}