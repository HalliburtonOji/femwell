// MorningCheckinCard — Phase 3 P3-2
//
// Renders at the top of the Planner (just below the Jess Hero) every
// morning until the user has logged a DailyCheckins row for today.
// Three quick-tap fields:
//   • Mood   — 5 Lucide-face options (Frown / Frown / Meh / Smile / Smile)
//   • Energy — 5 Zap-intensity options
//   • Sleep  — 3 options (poor / ok / good) → mapped to 4 / 7 / 8 hrs
//
// On submit, writes DailyCheckins for today and disappears. If a checkin
// already exists for today, the card never mounts. No emoji — Lucide
// only, per the FemWell brand rule.

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Frown, Meh, Smile, Zap, Moon, Check } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Lucide-only mood scale, 1–5.
const MOOD_OPTIONS = [
  { value: 1, Icon: Frown, tint: "#D45E52", label: "Low" },
  { value: 2, Icon: Frown, tint: "#C17B4E", label: "Down" },
  { value: 3, Icon: Meh,   tint: "#9B8B7A", label: "Neutral" },
  { value: 4, Icon: Smile, tint: "#6B8F5A", label: "Good" },
  { value: 5, Icon: Smile, tint: "#3A2C1A", label: "Bright" },
];

// Energy scale — Zap, fading from muted to gold across 5 dots.
const ENERGY_OPTIONS = [
  { value: 1, tint: "#9B8B7A", label: "Drained" },
  { value: 2, tint: "#C17B4E", label: "Low" },
  { value: 3, tint: "#D4AF37", label: "Steady" },
  { value: 4, tint: "#8FAF8F", label: "Lively" },
  { value: 5, tint: "#3A2C1A", label: "Peak" },
];

const SLEEP_OPTIONS = [
  { value: "poor", hours: 4,  label: "Poor",  tint: "#D45E52" },
  { value: "ok",   hours: 6,  label: "OK",    tint: "#C17B4E" },
  { value: "good", hours: 8,  label: "Good",  tint: "#6B8F5A" },
];

export default function MorningCheckinCard({ user, onComplete }) {
  const [hasTodayCheckin, setHasTodayCheckin] = useState(null); // null = loading, true/false = known
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(false);
  const [justDismissed, setJustDismissed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.DailyCheckins.filter(
          { user_id: user.id, date: todayLocalISO() },
          "-updated_at",
          1,
        ).catch(() => []);
        if (cancelled) return;
        setHasTodayCheckin(Array.isArray(rows) && rows.length > 0);
      } catch {
        if (!cancelled) setHasTodayCheckin(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Don't render while loading, after submission, or if checkin exists.
  if (hasTodayCheckin === null) return null;
  if (hasTodayCheckin === true) return null;
  if (justDismissed) return null;

  const canSubmit = mood != null && energy != null && sleep != null;

  async function handleSubmit() {
    if (!canSubmit || saving || !user?.id) return;
    setSaving(true);
    setErr(false);
    const sleepOption = SLEEP_OPTIONS.find((o) => o.value === sleep);
    try {
      await base44.entities.DailyCheckins.create({
        user_id: user.id,
        date: todayLocalISO(),
        mood,
        energy,
        energy_level: energy,
        sleep_hours: sleepOption?.hours ?? null,
        sleep_quality: sleep,
      });
      setJustDismissed(true);
      try { onComplete && onComplete(); } catch { /* swallow */ }
    } catch {
      setErr(true);
      setSaving(false);
    }
  }

  return (
    <article style={{
      margin: "8px 16px 14px",
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.gold}`,
      borderRadius: 16,
      padding: "14px 14px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 4px 16px rgba(58,44,26,0.10)",
    }}>
      <div>
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.gold, }}>Morning check-in</p>
        <h3 style={{
          margin: "4px 0 0", fontSize: 17, fontWeight: 500,
          color: C.espresso,
          lineHeight: 1.25,
        }}>How are you starting today?</h3>
      </div>

      {/* MOOD */}
      <ScaleRow
        label="Mood"
        options={MOOD_OPTIONS}
        value={mood}
        onChange={setMood}
        renderIcon={(opt, on) => {
          const Icon = opt.Icon;
          return <Icon size={18} style={{ color: on ? C.cream : opt.tint }} />;
        }}
      />

      {/* ENERGY */}
      <ScaleRow
        label="Energy"
        options={ENERGY_OPTIONS}
        value={energy}
        onChange={setEnergy}
        renderIcon={(opt, on) => (
          <Zap size={16} style={{ color: on ? C.cream : opt.tint, opacity: 0.6 + opt.value * 0.08 }} />
        )}
      />

      {/* SLEEP */}
      <div>
        <p style={rowLabel}>Sleep last night</p>
        <div style={{ display: "flex", gap: 8 }}>
          {SLEEP_OPTIONS.map((opt) => {
            const on = sleep === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSleep(opt.value)}
                style={{
                  flex: 1,
                  padding: "10px 6px", borderRadius: 12,
                  background: on ? opt.tint : C.cream,
                  color: on ? C.cream : C.espresso,
                  border: `1px solid ${on ? opt.tint : C.border}`,
                  cursor: "pointer",
                  fontSize: 12.5, fontWeight: 600,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "background 180ms ease, color 180ms ease",
                }}
                aria-pressed={on}
                aria-label={`Sleep ${opt.label}`}
              >
                <Moon size={14} style={{ color: on ? C.cream : opt.tint, opacity: 0.85 }} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 2,
      }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 9999,
            background: canSubmit ? C.espresso : C.muted,
            color: C.cream,
            border: "none",
            cursor: canSubmit && !saving ? "pointer" : "default",
            fontSize: 13, fontWeight: 700,
            opacity: canSubmit && !saving ? 1 : 0.6,
          }}
        >
          <Check size={13} /> {saving ? "Saving…" : "Save check-in"}
        </button>
        {err && (
          <p style={{ margin: 0, fontSize: 11, color: C.crimson || "#A84E56", fontWeight: 600, width: "100%", order: 9 }}>
            Couldn{"’"}t save your check-in — please try again.
          </p>
        )}
        <p style={{
          margin: 0, fontSize: 10, color: C.muted, fontStyle: "italic",
          textAlign: "right", maxWidth: "55%",
        }}>
          Not medical advice — for your own self-tracking.
        </p>
      </div>
    </article>
  );
}

function ScaleRow({ label, options, value, onChange, renderIcon }) {
  return (
    <div>
      <p style={rowLabel}>{label}</p>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                padding: "10px 0", borderRadius: 12,
                background: on ? opt.tint : C.cream,
                border: `1px solid ${on ? opt.tint : C.border}`,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 40,
                transition: "background 180ms ease",
              }}
              aria-pressed={on}
              aria-label={`${label} ${opt.label}`}
            >
              {renderIcon(opt, on)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const rowLabel = {
  margin: "0 0 6px",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: "#9B8B7A",
  };
