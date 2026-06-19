import { useEffect, useState } from "react";
import { Sparkle, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { habitCompletedOf } from "@/components/planner/cycle/habitLogNormalise";

// ─────────────────────────────────────────────────────────────────────────────
// FreshStartBanner — Planner Phase 2 B1 (MP-B).
//
// Soft "reset" affordance at the top of the Today tab. Fires on emotional
// inflection points — cycle day 1, fresh Monday after a quiet week, the
// morning after Quiet Mode lifts, the day after a tough stretch, or the
// first of a month. Only one banner shows at a time (highest-priority
// trigger wins). When no trigger fires, the component renders `null`.
//
// Trigger priority (first match wins):
//   1. cycle-day-1       → today is cycle day 1 (dayOfCycle === 1)
//   2. post-quiet-mode   → quiet_mode_until ended within the last 24h
//   3. post-illness      → ≥3 of last 7 DailyCheckins low + today is back up
//   4. first-of-month    → today.getDate() === 1
//   5. fresh-Monday      → Monday + <2 habit-log days in last 7
//
// Copy bank is deterministic per (trigger × dateISO) so the banner won't
// flicker on re-render. Skip-for-today persists via localStorage
// (`fw_fresh_start_dismissed_<dateISO>`).
//
// Spec ref: claude-state/base44_mps/2026-05-15_planner_phase2_B/spec.md §B1.
// ─────────────────────────────────────────────────────────────────────────────

// Copy banks — 4 lines per trigger, selected deterministically by hash of
// (dateISO + trigger key).
const COPY = {
  "cycle-day-1": [
    "Day one of a new cycle — a soft beginning, not a sprint.",
    "Cycle day one — let the rest of the week earn its momentum.",
    "A new cycle begins. Today doesn't need to do everything.",
    "Day one — quiet wins are still wins.",
  ],
  "post-quiet-mode": [
    "Quiet Mode is lifting — let your usual rhythm trickle back.",
    "Coming back online softly — anchors first, the rest can wait.",
    "Out of Quiet Mode — pick one thing to begin again.",
    "Quieter days fold into busier ones. Choose your re-entry.",
  ],
  "post-illness": [
    "Steadier ground after a tougher stretch — gently does it.",
    "The dip is passing. Today asks for one small return.",
    "Body's resetting — let the comeback be quiet.",
    "Post-rough-patch reset — small steps, not catch-up.",
  ],
  "first-of-month": [
    "A new page in the month — what does today want from you?",
    "First of the month — a clean line, not a finish line.",
    "Month one. One small intention will do.",
    "Top of the month — invite, don't push.",
  ],
  "fresh-Monday": [
    "A soft Monday reset — pick one thing to begin again.",
    "Quiet week behind you — let Monday be a doorway, not a deadline.",
    "Fresh Monday — one anchor is plenty.",
    "Mondays don't have to be loud.",
  ],
};

// Per-trigger eyebrow labels — kept short for the gold pill above the message.
const EYEBROW = {
  "cycle-day-1":    "FRESH START · CYCLE DAY 1",
  "post-quiet-mode":"FRESH START · QUIET MODE LIFTING",
  "post-illness":   "FRESH START · STEADIER GROUND",
  "first-of-month": "FRESH START · NEW MONTH",
  "fresh-Monday":   "FRESH START · NEW WEEK",
};

// Per-trigger aria reason for screen readers.
const TRIGGER_REASON = {
  "cycle-day-1":    "cycle day one",
  "post-quiet-mode":"quiet mode lifting",
  "post-illness":   "steadier ground after a tougher stretch",
  "first-of-month": "first of the month",
  "fresh-Monday":   "fresh Monday",
};

// Cheap deterministic hash for copy-bank rotation. Stable across re-renders.
function stringToHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function toDateISO(d) {
  return d.toISOString().split("T")[0];
}

// Trigger #1 — today is cycle day 1.
function isCycleDayOne(profile, today) {
  if (!profile?.last_period_start_date) return false;
  const cycleLength = profile.cycle_avg_length || 28;
  const start = new Date(profile.last_period_start_date);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return false;
  return diff % cycleLength === 0;
}

// Trigger #2 — quiet_mode_until is in the past but within the last 24h.
function isPostQuietMode(profile, today) {
  const iso = profile?.quiet_mode_until;
  if (!iso) return false;
  try {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return false;
    const nowMs = today.getTime();
    return t < nowMs && nowMs - t <= 24 * 60 * 60 * 1000;
  } catch { return false; }
}

// Trigger #3 — last 7 days had ≥3 low days (mood ≤2 OR energy ≤2) AND today
// is back up (mood ≥3 AND energy ≥3). Returns false when DailyCheckins data
// hasn't arrived yet — better to under-fire than mis-fire.
function isPostIllness(checkins, today) {
  if (!Array.isArray(checkins) || checkins.length === 0) return false;
  const todayISO = toDateISO(today);
  // Today's checkin must show recovery (mood ≥3 AND energy ≥3).
  const todays = checkins.find(c => c.date === todayISO);
  if (!todays) return false;
  const moodOK = (todays.mood ?? 3) >= 3;
  const energyOK = (todays.energy ?? 3) >= 3;
  if (!moodOK || !energyOK) return false;
  // Count low days in the prior 7 (excluding today).
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const todayMs = today.getTime();
  let lowCount = 0;
  for (const c of checkins) {
    if (!c.date || c.date === todayISO) continue;
    const cMs = new Date(c.date).getTime();
    if (!Number.isFinite(cMs)) continue;
    if (todayMs - cMs > sevenDaysMs || todayMs - cMs < 0) continue;
    const lowMood = (c.mood ?? 3) <= 2;
    const lowEnergy = (c.energy ?? 3) <= 2;
    if (lowMood || lowEnergy) lowCount += 1;
  }
  return lowCount >= 3;
}

// Trigger #4 — calendar first-of-month.
function isFirstOfMonth(today) {
  return today.getDate() === 1;
}

// Trigger #5 — Monday + last 7 days had fewer than 2 distinct dates with any
// HabitLog (anyone, any habit). Heuristic for a quiet week behind us.
function isFreshMonday(habitLogs, today) {
  if (today.getDay() !== 1) return false;
  if (!Array.isArray(habitLogs)) return true; // no data → still a soft signal
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const todayMs = today.getTime();
  const days = new Set();
  for (const h of habitLogs) {
    if (!h?.date) continue;
    if (!habitCompletedOf(h)) continue;
    const ms = new Date(h.date).getTime();
    if (!Number.isFinite(ms)) continue;
    if (todayMs - ms > sevenDaysMs || todayMs - ms < 0) continue;
    days.add(h.date);
  }
  return days.size < 2;
}

// Evaluate triggers in priority order. Returns trigger key or null.
function evaluateTrigger({ profile, habitLogs, checkins, today }) {
  if (isCycleDayOne(profile, today))   return "cycle-day-1";
  if (isPostQuietMode(profile, today)) return "post-quiet-mode";
  if (isPostIllness(checkins, today))  return "post-illness";
  if (isFirstOfMonth(today))           return "first-of-month";
  if (isFreshMonday(habitLogs, today)) return "fresh-Monday";
  return null;
}

export default function FreshStartBanner({ profile, habitLogs, today, onPlanWithJess, onAddAnchor }) {
  const dateISO = toDateISO(today);
  const dismissKey = `fw_fresh_start_dismissed_${dateISO}`;

  // Skip-for-today persistence — read once.
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(dismissKey) === "1"; }
    catch { return false; }
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checkins, setCheckins] = useState(null);

  // Lazy-fetch the last 8 DailyCheckins (one window for the post-illness
  // trigger). Cheap query; skipped if the user has already dismissed today.
  useEffect(() => {
    if (dismissed) return;
    if (!profile?.user_id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.DailyCheckins.filter(
          { user_id: profile.user_id },
          "-date",
          8,
        );
        if (!cancelled) setCheckins(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setCheckins([]);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.user_id, dismissed]);

  if (dismissed) return null;

  const trigger = evaluateTrigger({ profile, habitLogs, checkins, today });
  if (!trigger) return null;

  const lines = COPY[trigger];
  const msg = lines[stringToHash(dateISO + trigger) % lines.length];
  const eyebrow = EYEBROW[trigger];

  const handleSkip = () => {
    try { localStorage.setItem(dismissKey, "1"); } catch { /* noop */ }
    setDismissed(true);
    setSheetOpen(false);
  };

  return (
    <>
      <section
        role="status"
        aria-label={`Fresh start invitation — ${TRIGGER_REASON[trigger]}`}
        style={bannerStyle}
      >
        <div style={iconWrapStyle} aria-hidden="true">
          <Sparkle size={18} strokeWidth={1.5} style={{ color: "var(--plum, #4A2A3A)" }} />
        </div>
        <div style={bodyStyle}>
          <p style={eyebrowStyle}>{eyebrow}</p>
          <p style={msgStyle}>{msg}</p>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          style={ctaBtnStyle}
          aria-label="Open fresh-start reset options"
        >
          Reset →
        </button>
      </section>
      {sheetOpen && (
        <FreshStartResetSheet
          onClose={() => setSheetOpen(false)}
          onAddAnchor={() => {
            setSheetOpen(false);
            if (onAddAnchor) onAddAnchor();
          }}
          onPlanWithJess={() => {
            setSheetOpen(false);
            if (onPlanWithJess) onPlanWithJess();
          }}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}

// ─── Reset sheet (slide-up bottom sheet, modelled on PodcastListenSheet) ────
function FreshStartResetSheet({ onClose, onAddAnchor, onPlanWithJess, onSkip }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Fresh start reset options" style={sheetOverlayStyle} onClick={onClose}>
      <div className="fw-sheet-safe" style={sheetCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={sheetHeadStyle}>
          <span style={sheetTitleStyle}>A small reset</span>
          <button type="button" onClick={onClose} aria-label="Close reset options" style={sheetCloseBtnStyle}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <button type="button" onClick={onAddAnchor} style={sheetOptionStyle}>
          <span style={sheetOptionTitleStyle}>Set one anchor for today</span>
          <span style={sheetOptionSubStyle}>One thing — small, doable, yours.</span>
        </button>
        <button type="button" onClick={onPlanWithJess} style={sheetOptionStyle}>
          <span style={sheetOptionTitleStyle}>Plan with Jess</span>
          <span style={sheetOptionSubStyle}>A few minutes together — see what wants attention.</span>
        </button>
        <button type="button" onClick={onSkip} style={{ ...sheetOptionStyle, borderBottom: "none" }}>
          <span style={sheetOptionTitleStyle}>Skip for today</span>
          <span style={sheetOptionSubStyle}>The banner will quiet down until tomorrow.</span>
        </button>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const bannerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  marginBottom: 14,
  borderRadius: 14,
  background: "linear-gradient(135deg, rgba(201,169,92,0.22) 0%, rgba(212,94,82,0.10) 100%)",
  border: "1px solid rgba(201,169,92,0.45)",
};
const iconWrapStyle = {
  width: 34,
  height: 34,
  borderRadius: 9999,
  background: "var(--cream, #FFFAF5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "inset 0 0 0 1px rgba(74,42,58,0.10)",
};
const bodyStyle = { flex: 1, minWidth: 0 };
const eyebrowStyle = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "var(--gold-deep, #A6862B)",
  margin: "0 0 4px",
};
const msgStyle = {
  fontSize: 14.5,
  lineHeight: 1.4,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
  margin: 0,
};
const ctaBtnStyle = {
  padding: "8px 14px",
  borderRadius: 9999,
  border: "1px solid var(--plum, #4A2A3A)",
  background: "transparent",
  color: "var(--plum, #4A2A3A)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
  minHeight: 40,
  minWidth: 40,
};

// Bottom sheet
const sheetOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  background: "rgba(20,16,32,0.45)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};
const sheetCardStyle = {
  width: "100%",
  maxWidth: 480,
  background: "var(--cream, #FFFAF5)",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: "18px 18px 24px",
  boxShadow: "0 -12px 40px rgba(20,16,32,0.18)",
};
const sheetHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};
const sheetTitleStyle = {
  fontSize: 18,
  color: "var(--plum, #4A2A3A)",
};
const sheetCloseBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 9999,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--plum-mute, #8A7584)",
};
const sheetOptionStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 2,
  width: "100%",
  padding: "12px 4px",
  border: "none",
  borderBottom: "1px solid rgba(74,42,58,0.08)",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  minHeight: 56,
};
const sheetOptionTitleStyle = {
  fontSize: 15,
  color: "var(--plum, #4A2A3A)",
};
const sheetOptionSubStyle = {
  fontSize: 12,
  color: "var(--plum-2, #6B4559)",
};
