// HrtTodayCard — Sprint 9
//
// Single small card that lives on the LifeStageCare page and on
// /Planner's Care row for peri/meno/post-menopause users.
//
// Today toggle: "Taken" / "Not yet" — taps write to MedicationLogs
// with medication_type = "hrt". Today's row is upserted so a user
// can flip back without producing duplicates.
//
// 7-day adherence dots: reads MedicationLogs filtered by
// medication_type = "hrt" for the previous 7 days. Green dot = at
// least one row for that day with taken === true. Grey = no row /
// no taken row.
//
// HRT name comes from profile.hrt_medication or
// profile.conditions metadata. Falls back to "Your HRT" if neither
// is set.

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Pill, Check, X as XIcon } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  border:   "#D4C9B4",
};

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayKey() { return dayKey(new Date()); }

function last7Keys() {
  const out = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

function hrtNameFromProfile(profile) {
  if (!profile) return null;
  if (profile.hrt_medication) return profile.hrt_medication;
  if (Array.isArray(profile.conditions)) {
    const hit = profile.conditions.find((c) => /hrt|estradiol|oestradiol|progesterone/i.test(String(c)));
    if (hit) return hit;
  }
  return null;
}

export default function HrtTodayCard({ user, profile }) {
  const [todayTaken, setTodayTaken] = useState(null); // boolean | null
  const [todayId, setTodayId] = useState(null);
  const [weekRows, setWeekRows] = useState([]); // [{day_key, taken}]
  const [saving, setSaving] = useState(false);
  const today = todayKey();
  const weekKeys = last7Keys();
  const hrtName = hrtNameFromProfile(profile) || "Your HRT";

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        // Pull a generous slice; client-side filter for medication_type.
        const rows = await base44.entities.MedicationLogs
          .filter({ user_id: user.id }, "-date", 60)
          .catch(() => []);
        if (cancelled) return;
        const hrtRows = (Array.isArray(rows) ? rows : []).filter((r) => {
          const t = (r?.medication_type || r?.med_type || "").toLowerCase();
          if (t === "hrt") return true;
          // Loose match by item_name if the row predates the flag.
          const name = String(r?.item_name || r?.medication_name || "").toLowerCase();
          return /hrt|estradiol|oestradiol|progesterone|tibolone/.test(name);
        });
        setWeekRows(hrtRows);
        const todayRow = hrtRows.find((r) => (r?.date || r?.day_key) === today);
        if (todayRow) {
          setTodayId(todayRow.id);
          setTodayTaken(todayRow.taken === true || todayRow.taken === "true");
        } else {
          setTodayId(null);
          setTodayTaken(null);
        }
      } catch { /* swallow */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, today]);

  async function logHrt(taken) {
    if (!user?.id || saving) return;
    setSaving(true);
    const rich = {
      user_id: user.id,
      created_by: user.id,
      item_name: hrtName,
      medication_name: hrtName,
      medication_type: "hrt",
      taken: !!taken,
      date: today,
      notes: taken ? "HRT taken" : "HRT not yet",
    };
    try {
      if (todayId) {
        const ok = await base44.entities.MedicationLogs.update(todayId, rich).catch(async () => {
          const minimal = { taken: !!taken, date: today, item_name: hrtName, medication_type: "hrt" };
          return await base44.entities.MedicationLogs.update(todayId, minimal);
        });
        if (ok) {
          setTodayTaken(!!taken);
          setWeekRows((prev) => prev.map((r) => (r.id === todayId ? { ...r, taken: !!taken } : r)));
        }
      } else {
        const created = await base44.entities.MedicationLogs.create(rich).catch(async () => {
          const minimal = { user_id: user.id, item_name: hrtName, medication_type: "hrt", taken: !!taken, date: today };
          return await base44.entities.MedicationLogs.create(minimal);
        });
        if (created?.id) {
          setTodayId(created.id);
          setTodayTaken(!!taken);
          setWeekRows((prev) => [...prev, created]);
        }
      }
    } catch { /* swallow */ }
    finally { setSaving(false); }
  }

  const takenSet = new Set(
    weekRows
      .filter((r) => r.taken === true || r.taken === "true")
      .map((r) => r?.date || r?.day_key),
  );

  return (
    <article style={{
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.gold}`,
      borderRadius: 16,
      padding: "14px 14px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 10,
          background: "rgba(212,175,55,0.18)", color: C.gold,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={18} /></span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>
            HRT today
          </p>
          <h3 style={{
            margin: "2px 0 0", fontSize: 16, fontWeight: 600,
            color: C.espresso, lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{hrtName}</h3>
        </div>
      </header>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => logHrt(true)}
          disabled={saving}
          style={{
            flex: 1,
            padding: "11px 12px", borderRadius: 12,
            background: todayTaken === true ? C.sage : "transparent",
            color: todayTaken === true ? C.cream : C.espresso,
            border: `1.5px solid ${todayTaken === true ? C.sage : C.border}`,
            fontFamily: "inherit", fontSize: 13, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: saving ? "default" : "pointer",
          }}
        >
          <Check size={14} /> Taken
        </button>
        <button
          type="button"
          onClick={() => logHrt(false)}
          disabled={saving}
          style={{
            flex: 1,
            padding: "11px 12px", borderRadius: 12,
            background: todayTaken === false ? C.muted : "transparent",
            color: todayTaken === false ? C.cream : C.espresso,
            border: `1.5px solid ${todayTaken === false ? C.muted : C.border}`,
            fontFamily: "inherit", fontSize: 13, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: saving ? "default" : "pointer",
          }}
        >
          <XIcon size={14} /> Not yet
        </button>
      </div>

      <div>
        <p style={{
          margin: "0 0 6px",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted,
        }}>Last 7 days</p>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {weekKeys.map((k) => {
            const on = takenSet.has(k);
            const isToday = k === today;
            return (
              <span
                key={k}
                title={k + (on ? " · taken" : " · missed")}
                style={{
                  width: 16, height: 16, borderRadius: 999,
                  background: on ? C.sage : C.cream,
                  border: `1.5px solid ${on ? C.sage : C.border}`,
                  outline: isToday ? `2px solid ${C.gold}` : "none",
                  outlineOffset: 2,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </div>
    </article>
  );
}
