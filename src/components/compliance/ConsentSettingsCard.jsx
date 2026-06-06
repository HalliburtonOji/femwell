// Sprint C C2 — Settings card that surfaces the six GDPR consent toggles
// to the user and persists them to UserProfile. Each toggle has a plain-
// English label, a short description, and a "Learn more" placeholder
// (links to /privacy where the policy lives).
//
// Mount on Settings → Privacy. Pass `user` + `profile` + `onChange`
// (called with the merged updated row so the parent Settings page can
// update its in-memory profile).

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Info } from "lucide-react";
import { CONSENT_FIELDS, emptyConsentRow } from "@/utils/consent";

export default function ConsentSettingsCard({ user, profile, onChange }) {
  const initial = useMemo(() => {
    const row = emptyConsentRow();
    if (profile) for (const f of CONSENT_FIELDS) row[f.key] = profile[f.key] === true;
    return row;
  }, [profile?.id]);

  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setValues(initial); }, [initial]);

  const toggle = (key) => setValues((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let updated;
      if (profile?.id) {
        updated = await base44.entities.UserProfile.update(profile.id, values);
      } else {
        updated = await base44.entities.UserProfile.create({
          user_id: user.id,
          user_email: user.email,
          ...values,
        });
      }
      onChange?.({ ...(profile || {}), ...updated, ...values });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <section
      style={{
        background: "white",
        borderRadius: 16,
        padding: 18,
        boxShadow: "var(--shadow-sm)",
        border: "1px solid #FECACA",
        marginBottom: 16,
      }}
      aria-label="Consent settings"
    >
      <header style={{ marginBottom: 12 }}>
        <h2 style={{
          fontSize: 18, fontWeight: 700,
          color: "var(--plum)", margin: 0,
        }}>What you're sharing with FemWell</h2>
        <p style={{
          fontSize: 12, color: "var(--mauve)",
          margin: "4px 0 0", lineHeight: 1.5,
        }}>
          Each toggle controls a specific category. You can change these at any
          time, and any data type you turn off stops being stored or processed.
        </p>
      </header>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {CONSENT_FIELDS.map((f) => {
          const on = values[f.key] === true;
          return (
            <li
              key={f.key}
              style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "1px solid #FCE7EA", gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600, color: "var(--plum)",
                  }}>
                  {f.label}
                  <a
                    href="/privacy"
                    title="Learn more in our Privacy Policy"
                    aria-label={`Learn more about ${f.label}`}
                    style={{ color: "#9B8B7A", lineHeight: 0 }}
                  >
                    <Info size={12} />
                  </a>
                </div>
                <p style={{
                  fontSize: 12, color: "var(--mauve)",
                  margin: "2px 0 0", lineHeight: 1.4,
                }}>{f.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Toggle ${f.label}`}
                onClick={() => toggle(f.key)}
                style={{
                  flexShrink: 0,
                  width: 40, height: 22, borderRadius: 9999,
                  background: on ? "#8FAF8F" : "#E5E7EB",
                  border: "none", cursor: "pointer",
                  position: "relative",
                  transition: "background 180ms ease",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 2,
                    left: on ? 20 : 2,
                    width: 18, height: 18, borderRadius: 9999,
                    background: "white",
                    transition: "left 180ms ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <footer style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
        {saved && (
          <span style={{
            fontSize: 12, color: "#059669", display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            padding: "8px 16px", borderRadius: 9999,
            background: "#E11D48", color: "white",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
            opacity: saving ? 0.6 : 1,
          }}
        >{saving ? "Saving…" : "Save consents"}</button>
      </footer>
    </section>
  );
}
