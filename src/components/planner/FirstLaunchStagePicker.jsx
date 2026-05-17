// ─────────────────────────────────────────────────────────────────────────────
// FirstLaunchStagePicker — full-screen stage picker modal.
//
// Shown on /Planner mount when:
//   - profile exists (user is signed in + has a UserProfile row)
//   - profile.life_stage is null / undefined / "none"  (no real stage set)
//   - the user hasn't deferred this via localStorage.femwell_stage_skip
//
// Lifts to the existing UserProfile.life_stage field — the same field
// onboarding writes. Once saved, plannerAdapter immediately reshapes the
// whole Planner.
//
// Why: many users already onboarded before the 11-stage picker existed.
// This is the gentle catch-up surface so we don't have to wait for them
// to wander into Profile to fix their experience.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STAGES = [
  { id: "teen",             label: "Teen",                hint: "Still learning your pattern · educational + body-neutral" },
  { id: "reproductive",     label: "Reproductive years",  hint: "Standard cycle tracking · phases · daily plan" },
  { id: "pre-ttc",          label: "Pre-TTC",             hint: "Thinking about it · baseline + folic acid + AMH" },
  { id: "ttc",              label: "Trying to conceive",  hint: "Clinical view · BBT · OPK · fertile window" },
  { id: "pregnant-t1",      label: "Pregnant — T1",       hint: "First trimester · cycle paused" },
  { id: "pregnant-t2",      label: "Pregnant — T2",       hint: "Second trimester · scan + movement" },
  { id: "pregnant-t3",      label: "Pregnant — T3",       hint: "Third trimester · kicks + bag" },
  { id: "postpartum",       label: "Postpartum",          hint: "Recovery · sleep · pelvic floor" },
  { id: "perimenopause",    label: "Perimenopause",       hint: "Symptoms over predictions · HRT log" },
  { id: "menopause",        label: "Menopause",           hint: "12+ months no period · long-term health" },
  { id: "post-menopause",   label: "Post-menopause",      hint: "Cycle no longer relevant · bone + heart" },
];

const SKIP_KEY = "femwell_stage_skip";

export function shouldShowFirstLaunch(profile) {
  if (typeof window === "undefined") return false;
  if (!profile) return false;
  // Halli's DEV toggle: skip the modal if she's deliberately testing a stage.
  try {
    if (window.localStorage.getItem("femwell_dev_life_stage")) return false;
    if (window.localStorage.getItem(SKIP_KEY) === "1") return false;
  } catch { /* fall through */ }
  const ls = profile?.life_stage;
  return !ls || ls === "none" || ls === "";
}

export default function FirstLaunchStagePicker({ profile, onSaved, onSkip, editMode = false }) {
  const [selected, setSelected] = useState(editMode ? (profile?.life_stage || null) : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // editMode flips the copy from a first-launch onboarding question to an
  // 'update' framing for the Profile page modal. Logic + layout identical.
  const eyebrowCopy = editMode ? "UPDATE · YOUR SEASON" : "FIRST · CHOOSE YOUR STAGE";
  const titleCopy   = editMode ? "Update your season"    : "What season are you in?";
  const ctaCopy     = editMode ? "Save change"            : "Continue →";
  const cancelCopy  = editMode ? "Cancel"                 : "Not now";

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    try {
      const ent = base44?.entities?.UserProfile;
      if (!ent || !profile?.id || typeof ent.update !== "function") {
        throw new Error("UserProfile entity unavailable");
      }
      await ent.update(profile.id, { life_stage: selected });
      if (onSaved) onSaved(selected);
    } catch (err) {
      setError(String(err?.message || err || "Couldn't save — try again."));
    } finally {
      setSaving(false);
    }
  };

  const skip = () => {
    try { window.localStorage.setItem(SKIP_KEY, "1"); } catch { /* silent */ }
    if (onSkip) onSkip();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose your Femwell stage"
      style={overlay}
    >
      <div style={panel}>
        <header style={head}>
          <div>
            <p style={eyebrow}>{eyebrowCopy}</p>
            <h2 style={title}>{titleCopy}</h2>
            <p style={subtitle}>
              This shapes every Planner surface, every Jess message, and every content card. You
              can change it any time from Profile.
            </p>
          </div>
          <button type="button" onClick={skip} aria-label="Skip for now" style={skipBtn}>
            <X size={14} strokeWidth={2.2} />
          </button>
        </header>

        <div style={list}>
          {STAGES.map((s) => {
            const isActive = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                style={{
                  ...row,
                  background: isActive ? "#3A2C1A" : "transparent",
                  color: isActive ? "#F4EDDB" : "#3A2C1A",
                  borderColor: isActive ? "#3A2C1A" : "rgba(58,44,26,0.16)",
                }}
              >
                <div style={rowLabel}>{s.label}</div>
                <div style={{ ...rowHint, color: isActive ? "rgba(244,237,219,0.78)" : "#6B5840" }}>
                  {s.hint}
                </div>
              </button>
            );
          })}
        </div>

        {error && <p style={errorLine}>{error}</p>}

        <footer style={foot}>
          <button type="button" onClick={skip} style={ghostBtn}>{cancelCopy}</button>
          <button
            type="button"
            onClick={save}
            disabled={!selected || saving}
            style={{ ...primaryBtn, opacity: !selected || saving ? 0.5 : 1 }}
          >
            {saving ? "Saving…" : ctaCopy}
          </button>
        </footer>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(58,44,26,0.55)",
  backdropFilter: "blur(3px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const panel = {
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.16)",
  borderRadius: 18,
  padding: 18,
  width: "100%",
  maxWidth: 460,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 14px 50px rgba(58,44,26,0.30)",
};
const head = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 14,
};
const eyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.20em",
  color: "#A6862B",
  textTransform: "uppercase",
  margin: 0,
};
const title = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22,
  fontWeight: 500,
  color: "#3A2C1A",
  margin: "4px 0 6px",
  lineHeight: 1.2,
};
const subtitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  color: "#6B5840",
  lineHeight: 1.55,
  margin: 0,
};
const skipBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  cursor: "pointer",
  flexShrink: 0,
};
const list = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 12,
};
const row = {
  textAlign: "left",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid",
  cursor: "pointer",
  minHeight: 44,
  fontFamily: "'Inter', sans-serif",
};
const rowLabel = {
  fontSize: 13.5,
  fontWeight: 700,
  lineHeight: 1.25,
};
const rowHint = {
  fontSize: 11.5,
  marginTop: 2,
  lineHeight: 1.4,
};
const errorLine = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#9A2845",
  margin: "0 0 10px",
};
const foot = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  paddingTop: 10,
  borderTop: "1px dashed rgba(58,44,26,0.16)",
};
const ghostBtn = {
  padding: "8px 14px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const primaryBtn = {
  padding: "8px 18px",
  borderRadius: 9999,
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "1px solid #3A2C1A",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
};
