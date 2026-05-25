// MenopauseRatingScale — Sprint 9
//
// The MRS is a validated clinical questionnaire (11 symptoms, 0–4
// each). This component renders BOTH:
//
//   1. A small card (default) with a "Take monthly check-in" button
//      that the parent mounts on /LifeStageCare for peri/meno/post-
//      menopause users.
//   2. A full-screen sheet (when `open === true`) that walks the
//      user through all 11 items, sums the score, classifies the
//      band, and writes the row.
//
// Persistence:
//   Primary entity: MenopauseRatingScale (may not exist on every
//   tenant). Fallbacks in order:
//     - UserHealthLogs with log_type = "mrs"
//     - SymptomLogs with symptom_type = "mrs"
//
// Anywhere this component shows a result, it carries the "Not medical
// advice" microcopy.

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, X, Check, ChevronRight } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
  amber:    "#C66B3C",
  rose:     "#C4849A",
};

const SCALE = [
  { value: 0, label: "None" },
  { value: 1, label: "Mild" },
  { value: 2, label: "Moderate" },
  { value: 3, label: "Severe" },
  { value: 4, label: "Very Severe" },
];

const QUESTIONS = [
  { key: "hot_flushes",       label: "Hot flushes, sweating",                                hint: "Episodes of sweating" },
  { key: "heart_discomfort",  label: "Heart discomfort",                                     hint: "Unusual awareness of heartbeat, palpitations" },
  { key: "sleep_problems",    label: "Sleep problems",                                       hint: "Difficulty falling asleep, sleeping through, waking too early" },
  { key: "depressive_mood",   label: "Depressive mood",                                      hint: "Feeling down, sad, tearful, lacking drive" },
  { key: "irritability",      label: "Irritability",                                         hint: "Feeling nervous, tense, aggressive" },
  { key: "anxiety",           label: "Anxiety",                                              hint: "Inner restlessness, feeling panicky" },
  { key: "exhaustion",        label: "Physical and mental exhaustion",                       hint: "Concentration problems, memory, forgetfulness" },
  { key: "sexual_problems",   label: "Sexual problems",                                      hint: "Change in libido, sexual activity, satisfaction" },
  { key: "bladder_problems",  label: "Bladder problems",                                     hint: "Urination frequency, urge incontinence" },
  { key: "vaginal_dryness",   label: "Dryness of vagina",                                    hint: "Vaginal dryness, itching, discomfort during sex" },
  { key: "joint_discomfort",  label: "Joint and muscular discomfort",                        hint: "Pain, stiffness, aching" },
];

function bandForScore(total) {
  if (total >= 24) return { id: "severe",   label: "Severe symptoms",        tint: "#A03A2A" };
  if (total >= 17) return { id: "moderate", label: "Moderate symptoms",      tint: "#C66B3C" };
  if (total >= 9)  return { id: "mild",     label: "Mild symptoms",          tint: "#D49A4E" };
  return                  { id: "none",     label: "No or minimal symptoms", tint: "#8FAF8F" };
}

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function persistMRS(payload) {
  // Try in order: MenopauseRatingScale → UserHealthLogs → SymptomLogs.
  // Whichever succeeds wins. The rich → minimal fallback is per-entity.
  const tryCreate = async (entityName, body) => {
    const entity = base44.entities?.[entityName];
    if (!entity?.create) return null;
    return entity.create(body).catch(() => null);
  };

  // MenopauseRatingScale primary
  let row = await tryCreate("MenopauseRatingScale", payload);
  if (row) return { entity: "MenopauseRatingScale", row };

  // UserHealthLogs fallback
  row = await tryCreate("UserHealthLogs", {
    user_id: payload.user_id,
    created_by: payload.user_id,
    log_type: "mrs",
    log_data: payload.scores,
    score: payload.total_score,
    severity: payload.severity_band,
    completed_at: payload.completed_at,
    month_key: payload.month_key,
    notes: `MRS total ${payload.total_score} — ${payload.severity_band}`,
  });
  if (row) return { entity: "UserHealthLogs", row };

  // SymptomLogs fallback — single row with the total in `severity` and
  // notes carrying the per-question scores so we don't lose data.
  row = await tryCreate("SymptomLogs", {
    user_id: payload.user_id,
    created_by: payload.user_id,
    symptom_type: "mrs",
    symptom_name: "Menopause Rating Scale",
    severity: payload.severity_band,
    date: (payload.completed_at || new Date().toISOString()).slice(0, 10),
    logged_at: payload.completed_at,
    notes: `MRS ${payload.total_score} (${payload.severity_band}) · ${Object.entries(payload.scores).map(([k, v]) => `${k}=${v}`).join(", ")}`,
  });
  if (row) return { entity: "SymptomLogs", row };

  return { entity: null, row: null };
}

export default function MenopauseRatingScale({ user, profile }) {
  const [open, setOpen] = useState(false);
  const [latest, setLatest] = useState(null); // last completed MRS row

  // Load the most recent MRS row from any of the 3 entities (best effort).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [mrs, health, symptoms] = await Promise.all([
          base44.entities?.MenopauseRatingScale?.filter?.({ user_id: user.id }, "-completed_at", 1).catch(() => []) || [],
          base44.entities?.UserHealthLogs?.filter?.({ user_id: user.id, log_type: "mrs" }, "-completed_at", 1).catch(() => []) || [],
          base44.entities?.SymptomLogs?.filter?.({ user_id: user.id, symptom_type: "mrs" }, "-logged_at", 1).catch(() => []) || [],
        ]);
        if (cancelled) return;
        const candidates = [
          ...(Array.isArray(mrs) ? mrs : []),
          ...(Array.isArray(health) ? health.map(r => ({ ...r, total_score: r.score, severity_band: r.severity, scores: r.log_data })) : []),
          ...(Array.isArray(symptoms) ? symptoms.map(r => ({ ...r, total_score: parseInt((r.notes || "MRS 0").match(/MRS (\d+)/)?.[1] || "0", 10), severity_band: r.severity })) : []),
        ];
        candidates.sort((a, b) => (b.completed_at || b.logged_at || "").localeCompare(a.completed_at || a.logged_at || ""));
        setLatest(candidates[0] || null);
      } catch { /* swallow */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <>
      <article style={{
        background: C.paperHi,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${C.rose}`,
        borderRadius: 16,
        padding: "16px",
        display: "flex", flexDirection: "column", gap: 12,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(196,132,154,0.18)", color: C.rose,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}><Activity size={18} /></span>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.rose }}>
              Clinical questionnaire
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif", color: C.espresso }}>
              Menopause Rating Scale
            </h3>
          </div>
        </header>

        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: C.espresso }}>
          A monthly snapshot of how 11 menopause symptoms are affecting you. Used by clinicians worldwide — taps to bring to your GP if useful.
        </p>

        {latest ? (
          <ResultStrip latest={latest} />
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
            No previous check-ins yet.
          </p>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: C.espresso, color: C.cream,
            border: "none", borderRadius: 12,
            padding: "11px 14px", fontWeight: 700, fontSize: 13.5,
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Take monthly check-in <ChevronRight size={15} />
        </button>

        <p style={{ margin: 0, fontSize: 10.5, color: C.muted, fontStyle: "italic" }}>
          Not medical advice — for your own self-tracking.
        </p>
      </article>

      {open && (
        <MRSSheet
          user={user}
          profile={profile}
          onClose={() => setOpen(false)}
          onComplete={(row) => { setLatest(row); setOpen(false); }}
        />
      )}
    </>
  );
}

function ResultStrip({ latest }) {
  const band = bandForScore(Number(latest?.total_score) || 0);
  return (
    <div style={{
      background: C.cream, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "10px 12px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>
          Latest score
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 14, color: C.espresso, lineHeight: 1.35 }}>
          <strong>{latest.total_score || 0}</strong> — {band.label.toLowerCase()}.
        </p>
      </div>
      <div style={{
        width: 14, height: 14, borderRadius: 999,
        background: band.tint, flexShrink: 0,
      }} />
    </div>
  );
}

function MRSSheet({ user, profile, onClose, onComplete }) {
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(null); // { total_score, severity_band }

  function setScore(key, value) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  function total() {
    return QUESTIONS.reduce((sum, q) => sum + (Number(scores[q.key]) || 0), 0);
  }

  const totalScore = total();
  const completedCount = QUESTIONS.filter((q) => scores[q.key] != null).length;
  const allAnswered = completedCount === QUESTIONS.length;
  const band = bandForScore(totalScore);

  async function handleSubmit() {
    if (!user?.id || saving || !allAnswered) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      created_by: user.id,
      scores,
      total_score: totalScore,
      severity_band: band.id,
      completed_at: new Date().toISOString(),
      month_key: monthKey(),
    };
    const { row } = await persistMRS(payload);
    setSubmitted({ total_score: totalScore, severity_band: band.id, completed_at: payload.completed_at, scores });
    setSaving(false);
    // Tell the parent so the card refreshes its strip.
    if (row && onComplete) onComplete(row.total_score != null ? row : payload);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 240,
      background: C.cream, color: C.espresso,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 18px 6px",
        maxWidth: 640, width: "100%", margin: "0 auto",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.rose }}>
            Menopause Rating Scale
          </p>
          <h2 style={{
            margin: "4px 0 0", fontSize: 22, fontWeight: 600,
            fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk,
            lineHeight: 1.18, letterSpacing: -0.3,
          }}>This month's check-in</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: C.paperHi, border: `1px solid ${C.border}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        ><X size={16} /></button>
      </header>

      <div style={{
        flex: 1, overflowY: "auto",
        padding: "12px 18px 24px",
        maxWidth: 640, margin: "0 auto", width: "100%", boxSizing: "border-box",
      }}>
        {!submitted ? (
          <>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
              For each item, choose how strongly you've felt it during the past month.
            </p>

            {QUESTIONS.map((q, idx) => (
              <fieldset key={q.key} style={{
                border: `1px solid ${C.border}`, borderRadius: 14,
                background: C.paperHi, padding: "12px 12px 10px",
                margin: "0 0 10px",
              }}>
                <legend style={{
                  padding: "0 6px", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted,
                }}>Question {idx + 1} of {QUESTIONS.length}</legend>
                <p style={{ margin: "2px 0 2px", fontSize: 15, fontWeight: 600, color: C.espresso, lineHeight: 1.3 }}>
                  {q.label}
                </p>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: C.muted, fontStyle: "italic", lineHeight: 1.35 }}>
                  {q.hint}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SCALE.map((s) => {
                    const on = scores[q.key] === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setScore(q.key, s.value)}
                        style={{
                          flex: "1 1 auto",
                          minWidth: 72,
                          padding: "8px 10px",
                          borderRadius: 999,
                          border: `1.5px solid ${on ? C.espresso : C.border}`,
                          background: on ? C.espresso : "transparent",
                          color: on ? C.cream : C.espresso,
                          fontSize: 12.5, fontWeight: on ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >{s.label}</button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <p style={{ margin: "12px 0 6px", fontSize: 12, color: C.muted, textAlign: "center" }}>
              {completedCount} of {QUESTIONS.length} answered · Running total {totalScore}
            </p>
          </>
        ) : (
          <SubmittedResults submitted={submitted} band={band} />
        )}
      </div>

      {!submitted && (
        <div style={{
          padding: "12px 18px max(14px, env(safe-area-inset-bottom))",
          background: C.cream, borderTop: `1px solid ${C.border}`,
        }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || saving}
            style={{
              width: "100%", maxWidth: 520, margin: "0 auto",
              padding: "13px 16px",
              borderRadius: 14,
              background: allAnswered ? C.espresso : C.muted,
              color: C.cream,
              border: "none",
              fontSize: 14.5, fontWeight: 700, letterSpacing: 0.3,
              cursor: allAnswered && !saving ? "pointer" : "default",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: allAnswered && !saving ? 1 : 0.65,
            }}
          >
            {saving ? "Saving…" : (allAnswered ? <>See my score <Check size={15} /></> : `Answer all ${QUESTIONS.length} to continue`)}
          </button>
          <p style={{ margin: "8px 0 0", fontSize: 10.5, color: C.muted, fontStyle: "italic", textAlign: "center" }}>
            Not medical advice — for your own self-tracking.
          </p>
        </div>
      )}
    </div>
  );
}

function SubmittedResults({ submitted }) {
  const band = bandForScore(Number(submitted.total_score) || 0);
  const max = QUESTIONS.length * 4; // 44
  const pct = Math.min(100, Math.round((submitted.total_score / max) * 100));

  return (
    <section style={{
      background: C.paperHi, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${band.tint}`,
      borderRadius: 16, padding: "18px 16px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: band.tint }}>
        Your MRS score this month
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk, lineHeight: 1 }}>
        {submitted.total_score} <span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>/ {max}</span>
      </p>
      <p style={{ margin: 0, fontSize: 14.5, color: C.espresso, lineHeight: 1.4 }}>
        {band.label}.
      </p>

      <div style={{ height: 10, borderRadius: 999, background: C.cream, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: band.tint }} />
      </div>

      <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: C.muted, fontSize: 12.5, lineHeight: 1.55 }}>
        <li>0–8 None / minimal</li>
        <li>9–16 Mild</li>
        <li>17–23 Moderate</li>
        <li>24+ Severe</li>
      </ul>

      <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted, fontStyle: "italic" }}>
        Not medical advice — share with your GP if you'd like clinical input.
      </p>
    </section>
  );
}
