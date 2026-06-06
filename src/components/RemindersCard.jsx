// V3 sprint Task 7 — Settings → Reminders card.
// Four toggles + three time pickers. Persists prefs as a JSON field on
// UserProfile.notification_prefs, then asks the notifications utility to
// (re)schedule.

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { readPrefs, scheduleNotifications } from "@/utils/notifications";

const C = {
  espresso: "#3A2C1A",
  paperHi:  "#F4EFE3",
  muted:    "#6B5B4E",
  sage:     "#3D6B3D",
  gold:     "#7A6000",
  border:   "#E5DCC9",
};

const ROWS = [
  { key: "checkin", label: "Daily check-in reminder",        time: "checkin_time" },
  { key: "med",     label: "Medication / supplement",         time: "med_time" },
  { key: "habit",   label: "Habit reminder",                  time: "habit_time" },
  { key: "cycle",   label: "Cycle prediction alert",          time: null },
];

export default function RemindersCard({ user, profile, onProfileChange }) {
  const [prefs, setPrefs] = useState(() => readPrefs(profile));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setPrefs(readPrefs(profile)); }, [profile?.id]);

  function toggle(key) {
    setPrefs((p) => ({ ...p, [`${key}_enabled`]: !p[`${key}_enabled`] }));
  }
  function setTime(field, value) {
    setPrefs((p) => ({ ...p, [field]: value }));
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const payload = { notification_prefs: prefs };
      let updated;
      if (profile?.id) {
        updated = await base44.entities.UserProfile.update(profile.id, payload);
      } else {
        updated = await base44.entities.UserProfile.create({ user_id: user.id, user_email: user.email, ...payload });
      }
      onProfileChange?.({ ...(profile || {}), ...updated, notification_prefs: prefs });
      await scheduleNotifications({ ...profile, notification_prefs: prefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setSaving(false);
  }

  return (
    <section
      aria-label="Reminders"
      style={{
        background: C.paperHi, borderRadius: 16, padding: 18,
        boxShadow: "var(--shadow-sm)", border: `1px solid ${C.border}`,
        marginBottom: 16,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Bell size={16} style={{ color: C.gold }} aria-hidden />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.espresso, margin: 0 }}>
          Reminders
        </h2>
      </header>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px", lineHeight: 1.5 }}>
        FemWell can send a gentle nudge at the times below. You can change or turn each one off at any time.
      </p>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {ROWS.map((r) => {
          const enabled = !!prefs[`${r.key}_enabled`];
          return (
            <li key={r.key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: `1px solid ${C.border}`, gap: 12,
            }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.espresso, }}>
                {r.label}
              </span>
              {r.time && enabled && (
                <input
                  type="time"
                  value={prefs[r.time] || "08:00"}
                  onChange={(e) => setTime(r.time, e.target.value)}
                  aria-label={`${r.label} time`}
                  style={{
                    minHeight: 36, padding: "4px 8px",
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    fontSize: 13,
                    color: C.espresso,
                  }}
                />
              )}
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`Toggle ${r.label}`}
                onClick={() => toggle(r.key)}
                style={{
                  flexShrink: 0,
                  width: 40, height: 22, borderRadius: 9999,
                  background: enabled ? "#8FAF8F" : "#E5E7EB",
                  border: "none", cursor: "pointer",
                  position: "relative",
                  transition: "background 180ms ease",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute", top: 2,
                    left: enabled ? 20 : 2,
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
          <span style={{ fontSize: 12, color: C.sage, display: "inline-flex", alignItems: "center", gap: 4, }}>
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
            border: "none", cursor: "pointer", minHeight: 36,
            fontSize: 13, fontWeight: 700,
            opacity: saving ? 0.6 : 1,
          }}
        >{saving ? "Saving…" : "Save reminders"}</button>
      </footer>
    </section>
  );
}
