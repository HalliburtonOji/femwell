// ─────────────────────────────────────────────────────────────────────────────
// ConditionHealthProfile — "My Stage" section on the Profile screen.
// Spec ref: claude-state/product-research/femwell-complete-life-planner-2026-05-16.md
// + STEP 1 of the Life Stage build (2026-05-16).
//
// Backed by UserProfile.life_stage (string enum, 11 values) and
// UserProfile.conditions (array of strings, cross-cutting modifiers).
// Both fields are wired through the PlannerAdapter (src/utils/plannerAdapter.js)
// to reshape the Planner, Daily Story tags, and Jess context.
//
// Legacy: UserProfile.condition_flags is still written by the onboarding flow
// (Onboarding.jsx). We seed `conditions` from `condition_flags` on first read
// so existing users don't have to re-pick.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// 11-value life-stage enum (matches UserProfile.jsonc + plannerAdapter spec).
// Plus "none" sentinel for first-run users who haven't picked yet.
const LIFE_STAGES = [
  { key: "none",            label: "Skip for now",        group: "" },
  { key: "teen",            label: "Teen",                group: "Early" },
  { key: "reproductive",    label: "Reproductive years",  group: "Reproductive" },
  { key: "pre-ttc",         label: "Pre-TTC",             group: "Reproductive" },
  { key: "ttc",             label: "Trying to conceive",  group: "Reproductive" },
  { key: "pregnant-t1",     label: "Pregnant (T1)",       group: "Pregnancy" },
  { key: "pregnant-t2",     label: "Pregnant (T2)",       group: "Pregnancy" },
  { key: "pregnant-t3",     label: "Pregnant (T3)",       group: "Pregnancy" },
  { key: "postpartum",      label: "Postpartum",          group: "Pregnancy" },
  { key: "perimenopause",   label: "Perimenopause",       group: "Menopause" },
  { key: "menopause",       label: "Menopause",           group: "Menopause" },
  { key: "post-menopause",  label: "Post-menopause",      group: "Menopause" },
];

// 9 cross-cutting conditions (per spec).
const CONDITIONS = [
  { key: "pcos",            label: "PCOS",                 desc: "Polycystic ovary syndrome." },
  { key: "endo",            label: "Endometriosis",        desc: "Heavy painful periods, mid-cycle pain." },
  { key: "pmdd",            label: "PMDD",                 desc: "Severe luteal-locked mood disorder." },
  { key: "fibroids",        label: "Fibroids",             desc: "Heavy bleeding, longer bleeds." },
  { key: "thyroid",         label: "Thyroid disorder",     desc: "Hypothyroid or hyperthyroid." },
  { key: "hrt",             label: "On HRT",               desc: "Hormone replacement therapy (any age)." },
  { key: "cancer-survivor", label: "Cancer survivor",      desc: "Cycle disrupted by treatment." },
  { key: "ha",              label: "Hypothalamic amenorrhea", desc: "No period for months — recovery mode." },
  { key: "other",           label: "Other / prefer not to say", desc: "" },
];

// Map legacy `condition_flags` keys → new `conditions` keys.
// Used once on read so existing users keep their data.
const LEGACY_MAP = {
  pcos:           "pcos",
  endometriosis:  "endo",
  endo:           "endo",
  pmdd:           "pmdd",
  fibroids:       "fibroids",
  adenomyosis:    "other",
  thyroid:        "thyroid",
  perimenopause:  null,  // moved to life_stage — drop from conditions
  hrt:            "hrt",
  prefer_not:     "other",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};
const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

function migrateConditions(profile) {
  // Prefer the new `conditions` field if it has values.
  const newField = Array.isArray(profile?.conditions) ? profile.conditions : null;
  if (newField && newField.length > 0) return newField;
  // Otherwise seed from legacy `condition_flags`.
  const legacy = Array.isArray(profile?.condition_flags) ? profile.condition_flags : [];
  const mapped = legacy
    .map((k) => LEGACY_MAP[k] !== undefined ? LEGACY_MAP[k] : k)
    .filter((k) => k !== null);
  // Dedupe.
  return Array.from(new Set(mapped));
}

export default function ConditionHealthProfile({ profile, onProfileUpdate }) {
  const [editStage, setEditStage] = useState(false);
  const [editConditions, setEditConditions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conditions, setConditions] = useState(() => migrateConditions(profile));
  const [stage, setStage] = useState(profile?.life_stage || "none");

  // Re-seed when the profile prop changes (e.g. parent refetches).
  useEffect(() => {
    setConditions(migrateConditions(profile));
    setStage(profile?.life_stage || "none");
  }, [profile?.id, profile?.life_stage, profile?.conditions, profile?.condition_flags]);

  const persist = async (patch) => {
    if (!profile) return;
    setSaving(true);
    try {
      // Try the full patch first. If base44 rejects an unknown field
      // (the conditions enum hasn't shipped on the live schema yet, etc),
      // retry with the schema-pre-migration subset so the user still gets
      // local state updated and we don't no-op silently.
      try {
        await base44.entities.UserProfile.update(profile.id, patch);
      } catch (err) {
        const msg = String(err?.message || err || "");
        if (/unknown|conditions|life_stage|400|404/i.test(msg)) {
          // Strip the new fields and retry.
          const safe = { ...patch };
          delete safe.conditions;
          // life_stage is an older field but its enum has been expanded —
          // if the server rejects the new value, fall back to "none".
          if (safe.life_stage && /pre-ttc|pregnant-t|postpartum|perimenopause|menopause|post-menopause|teen|reproductive/.test(String(safe.life_stage))) {
            // Keep going — server may have it already; only retry if the
            // first call clearly rejected the value.
            try {
              await base44.entities.UserProfile.update(profile.id, safe);
            } catch {
              // Last resort — local-only update.
            }
          } else {
            try {
              await base44.entities.UserProfile.update(profile.id, safe);
            } catch {
              /* fall through to local-only update */
            }
          }
          console.warn("[ConditionHealthProfile] schema not migrated yet; local state updated only.", err);
        } else {
          throw err;
        }
      }
      onProfileUpdate(patch);
    } finally {
      setSaving(false);
    }
  };

  const setLifeStage = (nextStage) => {
    setStage(nextStage);
    persist({ life_stage: nextStage });
    setEditStage(false);
  };

  const toggleCondition = (key) => {
    let next;
    if (key === "other") {
      next = conditions.includes("other") ? [] : ["other"];
    } else {
      const without = conditions.filter((k) => k !== "other");
      next = without.includes(key)
        ? without.filter((k) => k !== key)
        : [...without, key];
    }
    setConditions(next);
    // Also keep legacy condition_flags in lockstep for backwards compat,
    // mirroring with the same keys so other surfaces that still read
    // `condition_flags` don't go blank.
    persist({ conditions: next, condition_flags: next });
  };

  const activeStage = LIFE_STAGES.find((s) => s.key === stage) || LIFE_STAGES[0];
  const activeConditions = CONDITIONS.filter((c) => conditions.includes(c.key));

  return (
    <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
      <p style={{ ...sLabel, marginBottom: "12px" }}>My Stage</p>

      {/* Life stage picker */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Life stage</p>
          <button
            onClick={() => setEditStage((v) => !v)}
            style={{
              fontSize: 11, fontWeight: 600, color: "var(--rose-dust)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {editStage ? "Done" : "Change"}
          </button>
        </div>

        {editStage ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LIFE_STAGES.map((s) => {
              const isActive = stage === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setLifeStage(s.key)}
                  disabled={saving}
                  style={{
                    borderRadius: 9999, padding: "5px 13px",
                    fontSize: 12, fontWeight: 500,
                    cursor: saving ? "wait" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                    border: "1.5px solid",
                    backgroundColor: isActive ? "var(--plum)" : "transparent",
                    borderColor: isActive ? "var(--plum)" : "var(--border)",
                    color: isActive ? "white" : "var(--mauve)",
                    minHeight: 32,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        ) : (
          <span
            style={{
              fontSize: 13, fontWeight: 500, color: "var(--plum)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {activeStage.label}
            {activeStage.group ? (
              <span style={{ color: "var(--mauve)", fontWeight: 400, marginLeft: 6 }}>
                · {activeStage.group}
              </span>
            ) : null}
          </span>
        )}
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", marginBottom: "14px" }} />

      {/* Conditions multi-select */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
          Conditions <span style={{ color: "var(--mauve)", fontWeight: 400 }}>(cross-cutting)</span>
        </p>
        <button
          onClick={() => setEditConditions((v) => !v)}
          style={{
            fontSize: 11, fontWeight: 600, color: "var(--rose-dust)",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {editConditions ? "Done" : "Edit"}
        </button>
      </div>

      {editConditions ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CONDITIONS.map((c) => {
            const isActive = conditions.includes(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleCondition(c.key)}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 12,
                  border: "1.5px solid", cursor: saving ? "wait" : "pointer",
                  textAlign: "left", width: "100%",
                  backgroundColor: isActive ? "var(--plum)" : "var(--surface)",
                  borderColor: isActive ? "var(--plum)" : "var(--border)",
                  minHeight: 44,
                }}
              >
                <div
                  style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: `2px solid ${isActive ? "rgba(255,255,255,0.5)" : "var(--border)"}`,
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {isActive && <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "white" }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    {c.label}
                  </p>
                  {c.desc && (
                    <p style={{ fontSize: 11, color: isActive ? "rgba(255,255,255,0.7)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                      {c.desc}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : activeConditions.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          No conditions set. Tap Edit to add conditions — PCOS, endo, PMDD, or on HRT each reshape the Planner.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {activeConditions.map((c) => (
            <span
              key={c.key}
              style={{
                backgroundColor: "var(--rose-dust-subtle)",
                color: "var(--rose-dust)", borderRadius: 9999,
                padding: "4px 12px", fontSize: 12, fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {c.label}
            </span>
          ))}
        </div>
      )}

      {/* Disclosure */}
      <p
        style={{
          fontSize: 10.5, color: "var(--mauve)",
          marginTop: 12, lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif", fontStyle: "italic",
        }}
      >
        Your stage and conditions are used to adapt the Planner, Daily Story, and Jess only — never shared.
      </p>
    </div>
  );
}
