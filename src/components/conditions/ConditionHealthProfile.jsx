import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const CONDITIONS = [
  { key: "pcos",          label: "PCOS",            desc: "Polycystic ovary syndrome" },
  { key: "endometriosis", label: "Endometriosis",    desc: "Chronic pelvic pain and tissue growth" },
  { key: "pmdd",          label: "PMDD",             desc: "Severe premenstrual mood disorder" },
  { key: "perimenopause", label: "Perimenopause",    desc: "Hormonal transition before menopause" },
  { key: "fibroids",      label: "Fibroids",         desc: "Non-cancerous uterine growths" },
  { key: "adenomyosis",   label: "Adenomyosis",      desc: "Uterine lining growing into the muscle" },
  { key: "thyroid",       label: "Thyroid disorder", desc: "Hypothyroid or hyperthyroid" },
  { key: "prefer_not",   label: "Prefer not to say", desc: "" },
];

const LIFE_STAGES = [
  { key: "none",      label: "None" },
  { key: "ttc",       label: "Trying to conceive" },
  { key: "pregnancy", label: "Pregnant" },
  { key: "menopause", label: "Perimenopause or Menopause" },
];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};
const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

export default function ConditionHealthProfile({ profile, onProfileUpdate }) {
  const [editConditions, setEditConditions] = useState(false);
  const [editLifeStage, setEditLifeStage] = useState(false);
  const [saving, setSaving] = useState(false);

  const flags = profile?.condition_flags || [];
  const lifeStage = profile?.life_stage || "none";

  const toggleCondition = async (key) => {
    if (!profile) return;
    setSaving(true);
    let next;
    if (key === "prefer_not") {
      next = flags.includes("prefer_not") ? [] : ["prefer_not"];
    } else {
      const without = flags.filter(f => f !== "prefer_not");
      next = without.includes(key) ? without.filter(f => f !== key) : [...without, key];
    }
    await base44.entities.UserProfile.update(profile.id, { condition_flags: next });
    // Sync ConditionProfiles entity
    const added = next.filter(k => !flags.includes(k));
    const removed = flags.filter(k => !next.includes(k));
    for (const c of added) {
      base44.entities.ConditionProfiles.create({ user_id: profile.user_id, condition: c, track_enabled: true }).catch(() => {});
    }
    if (removed.length > 0) {
      const existing = await base44.entities.ConditionProfiles.filter({ user_id: profile.user_id }).catch(() => []);
      for (const c of removed) {
        const rec = existing.find(e => e.condition === c);
        if (rec) base44.entities.ConditionProfiles.update(rec.id, { track_enabled: false }).catch(() => {});
      }
    }
    onProfileUpdate({ condition_flags: next });
    setSaving(false);
  };

  const setLifeStage = async (stage) => {
    if (!profile) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, { life_stage: stage });
    onProfileUpdate({ life_stage: stage });
    setEditLifeStage(false);
    setSaving(false);
  };

  const activeConditions = CONDITIONS.filter(c => flags.includes(c.key) && c.key !== "prefer_not");
  const currentStage = LIFE_STAGES.find(s => s.key === lifeStage) || LIFE_STAGES[0];

  return (
    <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
      <p style={{ ...sLabel, marginBottom: "12px" }}>Health profile</p>

      {/* Life stage */}
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: "6px" }}>Life stage</p>
        {editLifeStage ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LIFE_STAGES.map(s => (
              <button key={s.key} onClick={() => setLifeStage(s.key)}
                style={{ borderRadius: 9999, padding: "5px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1.5px solid",
                  backgroundColor: lifeStage === s.key ? "var(--plum)" : "transparent",
                  borderColor: lifeStage === s.key ? "var(--plum)" : "var(--border)",
                  color: lifeStage === s.key ? "white" : "var(--mauve)" }}>
                {s.label}
              </button>
            ))}
            <button onClick={() => setEditLifeStage(false)}
              style={{ borderRadius: 9999, padding: "5px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{currentStage.label}</span>
            <button onClick={() => setEditLifeStage(true)}
              style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Change
            </button>
          </div>
        )}
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", marginBottom: "14px" }} />

      {/* Health conditions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Health conditions</p>
        <button onClick={() => setEditConditions(v => !v)}
          style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          {editConditions ? "Done" : "Edit"}
        </button>
      </div>

      {editConditions ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CONDITIONS.map(c => {
            const active = flags.includes(c.key);
            return (
              <button key={c.key} onClick={() => toggleCondition(c.key)}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid", cursor: "pointer", textAlign: "left", width: "100%",
                  backgroundColor: active ? "var(--plum)" : "var(--surface)",
                  borderColor: active ? "var(--plum)" : "var(--border)" }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${active ? "rgba(255,255,255,0.5)" : "var(--border)"}`, backgroundColor: active ? "rgba(255,255,255,0.2)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "white" }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: active ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{c.label}</p>
                  {c.desc && <p style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.7)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{c.desc}</p>}
                </div>
              </button>
            );
          })}
        </div>
      ) : activeConditions.length === 0 && !flags.includes("prefer_not") ? (
        <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          No conditions set. Tap Edit to add conditions for personalised tracking.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {flags.includes("prefer_not") ? (
            <span style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", borderRadius: 9999, padding: "4px 12px", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              Prefer not to say
            </span>
          ) : activeConditions.map(c => (
            <span key={c.key} style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", borderRadius: 9999, padding: "4px 12px", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}