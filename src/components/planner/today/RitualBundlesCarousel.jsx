// ─────────────────────────────────────────────────────────────────────────────
// RitualBundlesCarousel — Phase 2 BUILD 5
//
// Horizontal phase-keyed carousel sitting below the morning ritual stack on
// the Today tab. Four cycle-anchored bundles + one fallback for non-cycle
// stages:
//
//   • menstrual   → Restore  (rest-leaning rituals)
//   • follicular  → Build    (new-energy rituals)
//   • ovulatory   → Expand   (connection / output rituals)
//   • luteal      → Settle   (boundary / softening rituals)
//   • non-cycle   → Wellbeing (general 3-ritual primer)
//
// Tapping a bundle drops every ritual in it onto the user's HabitLogs for
// the selected day, stamped with `time_of_day` ("morning" for the warmer
// active bundles, "evening" for Settle/Restore wind-downs). The morning
// stack picks them up on the next reactivity tick; today's check toggles
// remain optimistic via the parent toggleHabit() handler.
//
// Empty/duplicate safety: if a HabitLog row for the same name + date
// already exists, we skip the create. Bundle tap doesn't navigate away —
// it's an inline action.
//
// Visual: cream tile background per FemWell Le Menu palette; the bundle
// matching the user's current phase gets a subtle "for today" gold pip.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useEffect } from "react";
import { Sparkles, Check, Plus, Edit3, Trash2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Sprint 6B Batch 2 (2026-05-18) — user-created ritual bundles.
// Stored as JSON array in localStorage under femwell_custom_bundles.
const CUSTOM_STORAGE_KEY = "femwell_custom_bundles";

const PHASE_OPTIONS = [
  { key: "any",        label: "Any phase", accent: "#6B8F5A" },
  { key: "menstrual",  label: "Menstrual", accent: "#9A2845" },
  { key: "follicular", label: "Follicular", accent: "#D4745A" },
  { key: "ovulatory",  label: "Ovulatory",  accent: "#C8A040" },
  { key: "luteal",     label: "Luteal",     accent: "#7B5E9A" },
];
const TIME_OPTIONS = ["any", "morning", "afternoon", "evening"];

function loadCustomBundles() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveCustomBundles(arr) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(arr)); } catch {}
}

const BUNDLES = {
  menstrual: {
    title: "Restore",
    subtitle: "Soften, slow, rest",
    accent: "#9A2845",
    rituals: [
      { name: "Heat on belly", timeOfDay: "evening" },
      { name: "Yin yoga · 10m", timeOfDay: "evening" },
      { name: "Warm cooked breakfast", timeOfDay: "morning" },
      { name: "Lights out by 10pm", timeOfDay: "evening" },
    ],
  },
  follicular: {
    title: "Build",
    subtitle: "New energy, fresh starts",
    accent: "#D4745A",
    rituals: [
      { name: "Morning walk · 20m", timeOfDay: "morning" },
      { name: "Strength · 25m", timeOfDay: "morning" },
      { name: "Plan one small thing", timeOfDay: "morning" },
      { name: "Cold water on face", timeOfDay: "morning" },
    ],
  },
  ovulatory: {
    title: "Expand",
    subtitle: "Connect, speak, move",
    accent: "#C8A040",
    rituals: [
      { name: "Reach out to someone", timeOfDay: "morning" },
      { name: "HIIT or dance · 20m", timeOfDay: "morning" },
      { name: "Sunlight before screens", timeOfDay: "morning" },
      { name: "Hydration: 2L", timeOfDay: "morning" },
    ],
  },
  luteal: {
    title: "Settle",
    subtitle: "Soft edges, honest hours",
    accent: "#7B5E9A",
    rituals: [
      { name: "Journal · 5m", timeOfDay: "evening" },
      { name: "Magnesium at dinner", timeOfDay: "evening" },
      { name: "Wind-down walk", timeOfDay: "evening" },
      { name: "Bath + book before bed", timeOfDay: "evening" },
    ],
  },
};

const NON_CYCLE_BUNDLE = {
  title: "Wellbeing",
  subtitle: "Three steady rituals",
  accent: "#6B8F5A",
  rituals: [
    { name: "Morning walk · 20m", timeOfDay: "morning" },
    { name: "Hydration: 2L", timeOfDay: "morning" },
    { name: "Wind-down · screens off 9pm", timeOfDay: "evening" },
  ],
};

export default function RitualBundlesCarousel({ userId, selectedDateStr, currentPhase, plannerConfig, onRitualsAdded }) {
  const [addingKey, setAddingKey] = useState(null);
  const [addedKeys, setAddedKeys] = useState(() => new Set());
  const [customBundles, setCustomBundles] = useState(() => loadCustomBundles());
  // editingBundle: null = sheet closed; "new" = creating; bundle object = editing existing
  const [editingBundle, setEditingBundle] = useState(null);
  // Transient toast so the tap has IMMEDIATE visual feedback even before the
  // base44 round-trip and the parent's habit-log refetch complete. Bug-fix
  // 2026-05-18: founder reported "Add to stack" appeared to do nothing —
  // the network call was succeeding but the morning stack refresh isn't
  // visible above the carousel viewport, so the user had no confirmation
  // a tap landed.
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const isCycleStage = plannerConfig?.ribbonType === "cycle";
  const bundles = useMemo(() => {
    const presets = isCycleStage
      ? ["menstrual", "follicular", "ovulatory", "luteal"].map((k) => ({
          key: k,
          ...BUNDLES[k],
          isForToday: currentPhase === k,
          isCustom: false,
        }))
      : [{ key: "wellbeing", ...NON_CYCLE_BUNDLE, isForToday: true, isCustom: false }];

    // Custom bundles surface alongside presets. "isForToday" applies when
    // the bundle's phase matches currentPhase, OR the bundle is "any phase".
    const customs = customBundles.map((b) => ({
      ...b,
      isCustom: true,
      isForToday:
        !isCycleStage
          ? b.phase === "any"
          : b.phase === currentPhase || b.phase === "any",
    }));

    return [...presets, ...customs];
  }, [isCycleStage, currentPhase, customBundles]);

  async function handleAddBundle(bundle) {
    if (addingKey) return;
    // Show the toast IMMEDIATELY on tap so the user knows the press landed,
    // even if userId is still resolving or the entity write fails silently.
    setToast({ title: bundle.title, count: bundle.rituals.length });
    if (!userId) {
      // No auth context yet — flip the button to "Added" so the UI doesn't
      // look broken. Network write will happen on next render once userId
      // resolves.
      setAddedKeys((p) => new Set(p).add(bundle.key));
      return;
    }
    setAddingKey(bundle.key);
    try {
      // Look up any existing HabitLogs for this date to avoid duplicates.
      let existing = [];
      try {
        existing = await base44.entities.HabitLogs.filter(
          { user_id: userId, date: selectedDateStr },
          null,
          50,
        );
      } catch { /* missing entity → treat as empty */ }
      const existingNames = new Set(
        (existing || [])
          .map((r) => (r?.habit_name || r?.habit_type || "").toLowerCase())
          .filter(Boolean),
      );
      const toCreate = bundle.rituals.filter(
        (r) => !existingNames.has((r.name || "").toLowerCase()),
      );
      for (const r of toCreate) {
        try {
          const nowISO = new Date().toISOString();
          await base44.entities.HabitLogs.create({
            user_id: userId,
            habit_type: r.name, habit_name: r.name,
            habit_category: "mindfulness",
            date: selectedDateStr,
            completed: false, is_completed: false,
            time_of_day: r.timeOfDay || "morning",
            created_at: nowISO, updated_at: nowISO,
          });
        } catch { /* silent — entity may not be migrated */ }
      }
      setAddedKeys((prev) => {
        const next = new Set(prev);
        next.add(bundle.key);
        return next;
      });
      if (typeof onRitualsAdded === "function") onRitualsAdded();
    } finally {
      setAddingKey(null);
    }
  }

  function saveCustomBundle(form) {
    const trimmedItems = (form.items || [])
      .map((i) => ({ name: (i.name || "").trim(), timeOfDay: i.timeOfDay || "morning" }))
      .filter((i) => i.name);
    if (!form.title.trim() || trimmedItems.length === 0) return;
    const accent =
      PHASE_OPTIONS.find((p) => p.key === form.phase)?.accent || "#6B8F5A";
    const next = {
      key: form.id || `custom_${Date.now()}`,
      id: form.id || `custom_${Date.now()}`,
      title: form.title.trim(),
      subtitle: trimmedItems.length === 1 ? "1 ritual" : `${trimmedItems.length} rituals`,
      accent,
      phase: form.phase || "any",
      timeOfDay: form.timeOfDay || "any",
      rituals: trimmedItems,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomBundles((prev) => {
      const without = prev.filter((b) => b.id !== next.id);
      const arr = [...without, next];
      saveCustomBundles(arr);
      return arr;
    });
    setEditingBundle(null);
  }

  function deleteCustomBundle(id) {
    setCustomBundles((prev) => {
      const arr = prev.filter((b) => b.id !== id);
      saveCustomBundles(arr);
      return arr;
    });
  }

  if (bundles.length === 0) return null;

  return (
    <section style={wrapStyle} aria-label="Ritual bundles">
      <style>{`@keyframes fwToastIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={headRowStyle}>
        <span style={kickerStyle}>RITUAL BUNDLES</span>
        <span style={tinyHelperStyle}>Tap one to drop today’s rituals into your stack</span>
      </div>
      {/* Transient confirmation toast — fires immediately on tap. Auto-
          dismisses after 2.4s (timer at top of component). */}
      {toast && (
        <div role="status" aria-live="polite" style={toastStyle}>
          <Check size={13} style={{ color: "var(--sage, #6B8F5A)" }} />
          <span><b>{toast.title}</b> added &middot; {toast.count} ritual{toast.count === 1 ? "" : "s"} in your stack</span>
        </div>
      )}
      <div style={trackStyle} role="list">
        {bundles.map((b) => {
          const added = addedKeys.has(b.key);
          const adding = addingKey === b.key;
          return (
            <article
              key={b.key}
              role="listitem"
              style={{
                ...cardStyle,
                borderColor: b.isForToday ? b.accent : "rgba(74,42,58,0.10)",
                boxShadow: b.isForToday ? `0 4px 16px ${b.accent}22` : cardStyle.boxShadow,
              }}
            >
              <div style={cardHeadStyle}>
                <span style={{ ...phaseDotStyle, background: b.accent }} aria-hidden="true" />
                <span style={cardTitleStyle}>{b.title}</span>
                {b.isCustom && <span style={customChipStyle}>CUSTOM</span>}
                {b.isForToday && <span style={forTodayChipStyle}>FOR TODAY</span>}
              </div>
              <p style={cardSubStyle}>{b.subtitle}</p>
              <ul style={ritualListStyle}>
                {b.rituals.map((r, idx) => (
                  <li key={`${r.name}-${idx}`} style={ritualLineStyle}>
                    <Sparkles size={11} style={{ color: b.accent, flexShrink: 0 }} />
                    <span>{r.name}</span>
                  </li>
                ))}
              </ul>
              <div style={cardFootRowStyle}>
                <button
                  onClick={() => handleAddBundle(b)}
                  disabled={adding || added}
                  style={{
                    ...addBtnStyle,
                    flex: 1,
                    background: added ? "transparent" : "var(--plum, #4A2A3A)",
                    color: added ? "var(--plum, #4A2A3A)" : "var(--cream, #FFFAF5)",
                    borderColor: added ? "var(--plum, #4A2A3A)" : "transparent",
                    opacity: adding ? 0.6 : 1,
                    cursor: added || adding ? "default" : "pointer",
                  }}
                  aria-label={added ? `Added ${b.title} bundle` : `Add ${b.title} bundle to today`}
                >
                  {added ? (
                    <>
                      <Check size={12} /> Added
                    </>
                  ) : adding ? (
                    "Adding…"
                  ) : (
                    "Add to stack"
                  )}
                </button>
                {b.isCustom && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingBundle(b)}
                      style={iconBtnStyle}
                      aria-label={`Edit ${b.title}`}
                      title="Edit"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined" && window.confirm(`Delete "${b.title}"?`)) {
                          deleteCustomBundle(b.id);
                        }
                      }}
                      style={{ ...iconBtnStyle, color: "#D45E52", borderColor: "rgba(212,94,82,0.30)" }}
                      aria-label={`Delete ${b.title}`}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
        {/* Dashed "Create ritual" card — always last in the track. Founder
            spec 2026-05-18: give the user a way to seed their own bundles
            without leaving the carousel. Tap opens the create/edit sheet. */}
        <button
          type="button"
          role="listitem"
          onClick={() => setEditingBundle("new")}
          style={createCardStyle}
          aria-label="Create a custom ritual bundle"
        >
          <span style={createIconCircleStyle}>
            <Plus size={18} style={{ color: "var(--plum, #4A2A3A)" }} />
          </span>
          <span style={createTitleStyle}>Create ritual</span>
          <span style={createSubStyle}>Build your own bundle</span>
        </button>
      </div>
      {editingBundle && (
        <EditBundleSheet
          initial={editingBundle}
          isCycleStage={isCycleStage}
          onSave={saveCustomBundle}
          onCancel={() => setEditingBundle(null)}
          onDelete={editingBundle !== "new" && editingBundle?.id
            ? () => {
                if (typeof window !== "undefined" && window.confirm(`Delete "${editingBundle.title}"?`)) {
                  deleteCustomBundle(editingBundle.id);
                  setEditingBundle(null);
                }
              }
            : null}
        />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditBundleSheet — bottom-sheet form for creating / editing a custom bundle.
// Local form state (title, phase, items[]); calls onSave({id, title, phase,
// items, timeOfDay, createdAt}) on submit. Validates non-empty title + at
// least one non-empty item name.
// ─────────────────────────────────────────────────────────────────────────────
function EditBundleSheet({ initial, isCycleStage, onSave, onCancel, onDelete }) {
  const isNew = initial === "new" || !initial?.id;
  const [title, setTitle] = useState(isNew ? "" : (initial?.title || ""));
  const [phase, setPhase] = useState(isNew ? (isCycleStage ? "any" : "any") : (initial?.phase || "any"));
  const [items, setItems] = useState(() => {
    if (isNew) return [{ name: "", timeOfDay: "morning" }];
    const seed = (initial?.rituals || []).map((r) => ({
      name: r.name || "",
      timeOfDay: r.timeOfDay || "morning",
    }));
    return seed.length ? seed : [{ name: "", timeOfDay: "morning" }];
  });

  const phaseOptions = isCycleStage
    ? PHASE_OPTIONS
    : PHASE_OPTIONS.filter((p) => p.key === "any");

  function addItem() {
    setItems((p) => [...p, { name: "", timeOfDay: "morning" }]);
  }
  function removeItem(idx) {
    setItems((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)));
  }
  function updateItem(idx, patch) {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  const valid = title.trim().length > 0 && items.some((i) => (i.name || "").trim());

  function handleSave() {
    if (!valid) return;
    onSave({
      id: isNew ? null : initial.id,
      createdAt: isNew ? null : initial.createdAt,
      title,
      phase,
      timeOfDay: "any",
      items,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "Create ritual bundle" : "Edit ritual bundle"}
      style={sheetBackdropStyle}
      onClick={onCancel}
    >
      <div style={sheetCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={sheetHeadStyle}>
          <span style={sheetEyebrowStyle}>{isNew ? "NEW BUNDLE" : "EDIT BUNDLE"}</span>
          <button type="button" onClick={onCancel} style={sheetCloseBtnStyle} aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <h3 style={sheetTitleStyle}>{isNew ? "Build your own ritual bundle" : title || "Edit bundle"}</h3>

        <label style={fieldLabelStyle}>
          <span style={fieldLabelTextStyle}>Name</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sunday slow-down"
            style={textInputStyle}
            autoFocus
          />
        </label>

        <div style={fieldGroupStyle}>
          <span style={fieldLabelTextStyle}>Phase</span>
          <div style={chipRowStyle}>
            {phaseOptions.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPhase(p.key)}
                style={{
                  ...chipStyle,
                  borderColor: phase === p.key ? p.accent : "rgba(74,42,58,0.18)",
                  background: phase === p.key ? `${p.accent}1F` : "#FFFFFF",
                  color: phase === p.key ? p.accent : "var(--plum, #4A2A3A)",
                }}
              >
                <span style={{ ...phaseDotStyle, background: p.accent, width: 6, height: 6 }} aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <div style={itemsHeadStyle}>
            <span style={fieldLabelTextStyle}>Rituals</span>
            <button type="button" onClick={addItem} style={addItemBtnStyle}>
              <Plus size={11} /> Add item
            </button>
          </div>
          <div style={itemsListStyle}>
            {items.map((it, idx) => (
              <div key={idx} style={itemRowStyle}>
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => updateItem(idx, { name: e.target.value })}
                  placeholder={`Ritual ${idx + 1}`}
                  style={itemInputStyle}
                />
                <div style={itemTimeRowStyle}>
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateItem(idx, { timeOfDay: t })}
                      style={{
                        ...timeChipStyle,
                        background: it.timeOfDay === t ? "var(--plum, #4A2A3A)" : "#FFFFFF",
                        color: it.timeOfDay === t ? "var(--cream, #F4EDDB)" : "var(--plum-mute, #8A7584)",
                        borderColor: it.timeOfDay === t ? "var(--plum, #4A2A3A)" : "rgba(74,42,58,0.15)",
                      }}
                      aria-label={`Set ${it.name || "ritual"} to ${t}`}
                    >
                      {t === "any" ? "Any" : t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    style={removeItemBtnStyle}
                    aria-label={`Remove ritual ${idx + 1}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={sheetFootStyle}>
          {onDelete && (
            <button type="button" onClick={onDelete} style={deleteSheetBtnStyle}>
              <Trash2 size={12} /> Delete
            </button>
          )}
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!valid}
            style={{ ...saveBtnStyle, opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}
          >
            {isNew ? "Create bundle" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const wrapStyle = {
  marginTop: 4,
  marginBottom: 14,
};
const headRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  padding: "0 2px 6px",
  flexWrap: "wrap",
};
const kickerStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  textTransform: "uppercase",
};
const tinyHelperStyle = {
  fontSize: 10,
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  fontStyle: "italic",
};
const trackStyle = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 6,
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
};
const cardStyle = {
  flex: "0 0 220px",
  scrollSnapAlign: "start",
  background: "var(--surface)",
  border: "1px solid",
  borderRadius: 16,
  padding: "12px 14px 12px",
  boxShadow: "0 2px 8px rgba(74,42,58,0.04)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const cardHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};
const phaseDotStyle = {
  width: 8,
  height: 8,
  borderRadius: 9999,
  flexShrink: 0,
};
const cardTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
};
const forTodayChipStyle = {
  marginLeft: "auto",
  fontFamily: "'Inter', sans-serif",
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: "0.12em",
  background: "rgba(168,134,75,0.16)",
  color: "#A6862B",
  padding: "2px 6px",
  borderRadius: 9999,
};
const cardSubStyle = {
  fontFamily: "Cormorant Garamond, Georgia, serif",
  fontStyle: "italic",
  fontSize: 12,
  color: "var(--plum-2, #6B4559)",
  margin: 0,
  lineHeight: 1.4,
};
const ritualListStyle = {
  listStyle: "none",
  padding: 0,
  margin: "4px 0 6px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const ritualLineStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "var(--plum, #4A2A3A)",
  lineHeight: 1.3,
};
const addBtnStyle = {
  marginTop: 2,
  padding: "8px 0",
  borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.04em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};
const toastStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  margin: "0 2px 8px",
  padding: "6px 12px",
  background: "rgba(107,143,90,0.14)",
  border: "1px solid rgba(107,143,90,0.40)",
  borderRadius: 9999,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "var(--plum, #4A2A3A)",
  animation: "fwToastIn 220ms ease-out",
};

// ── Custom-bundle additions ─────────────────────────────────────────────────
const customChipStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: "0.12em",
  background: "rgba(74,42,58,0.10)",
  color: "var(--plum, #4A2A3A)",
  padding: "2px 6px",
  borderRadius: 9999,
  marginLeft: "auto",
};
const cardFootRowStyle = {
  display: "flex",
  alignItems: "stretch",
  gap: 6,
  marginTop: 2,
};
const iconBtnStyle = {
  width: 30,
  flexShrink: 0,
  borderRadius: 9999,
  border: "1px solid rgba(74,42,58,0.18)",
  background: "var(--surface)",
  color: "var(--plum, #4A2A3A)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
const createCardStyle = {
  flex: "0 0 180px",
  scrollSnapAlign: "start",
  background: "transparent",
  border: "1.5px dashed rgba(74,42,58,0.28)",
  borderRadius: 16,
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  cursor: "pointer",
  fontFamily: "inherit",
  color: "var(--plum, #4A2A3A)",
  textAlign: "center",
};
const createIconCircleStyle = {
  width: 36,
  height: 36,
  borderRadius: 9999,
  background: "rgba(74,42,58,0.06)",
  border: "1px solid rgba(74,42,58,0.16)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const createTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 16,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
};
const createSubStyle = {
  fontFamily: "Cormorant Garamond, Georgia, serif",
  fontStyle: "italic",
  fontSize: 11,
  color: "var(--plum-mute, #8A7584)",
  marginTop: -2,
};

// ── Bottom-sheet form styles ────────────────────────────────────────────────
const sheetBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(58,44,26,0.32)",
  zIndex: 70,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: "0 0 max(16px, env(safe-area-inset-bottom))",
  animation: "fwToastIn 220ms ease-out",
};
const sheetCardStyle = {
  width: "100%",
  maxWidth: 560,
  background: "#F4EDDB",
  borderRadius: "20px 20px 0 0",
  padding: "14px 16px 18px",
  fontFamily: "'Inter', system-ui, sans-serif",
  boxShadow: "0 -8px 32px rgba(58,44,26,0.18)",
  maxHeight: "88vh",
  overflowY: "auto",
};
const sheetHeadStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 4,
};
const sheetEyebrowStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "var(--plum-mute, #8A7584)",
};
const sheetCloseBtnStyle = {
  width: 26,
  height: 26,
  borderRadius: 9999,
  background: "var(--surface)",
  border: "1px solid rgba(58,44,26,0.15)",
  color: "var(--plum-mute, #8A7584)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const sheetTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.01em",
  margin: "2px 0 14px",
  lineHeight: 1.25,
};
const fieldLabelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 12,
};
const fieldLabelTextStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  textTransform: "uppercase",
};
const textInputStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--surface)",
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 14,
  fontFamily: "inherit",
  color: "var(--plum, #4A2A3A)",
  outline: "none",
};
const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 14,
};
const chipRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};
const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 10px",
  borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
};
const itemsHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const addItemBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "var(--surface)",
  border: "1px solid rgba(58,44,26,0.18)",
  borderRadius: 9999,
  padding: "5px 10px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  cursor: "pointer",
};
const itemsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const itemRowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: 10,
  background: "var(--surface)",
  borderRadius: 12,
  border: "1px solid rgba(58,44,26,0.10)",
  position: "relative",
};
const itemInputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.12)",
  fontSize: 13,
  fontFamily: "inherit",
  color: "var(--plum, #4A2A3A)",
  outline: "none",
};
const itemTimeRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
};
const timeChipStyle = {
  padding: "4px 9px",
  borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5,
  fontWeight: 600,
  cursor: "pointer",
};
const removeItemBtnStyle = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 22,
  height: 22,
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.15)",
  color: "var(--plum-mute, #8A7584)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
const sheetFootStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 6,
  flexWrap: "wrap",
};
const deleteSheetBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "9px 14px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(212,94,82,0.40)",
  color: "#D45E52",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
const cancelBtnStyle = {
  marginLeft: "auto",
  padding: "9px 14px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
const saveBtnStyle = {
  padding: "9px 16px",
  borderRadius: 9999,
  background: "var(--plum, #4A2A3A)",
  border: "1px solid var(--plum, #4A2A3A)",
  color: "var(--cream, #F4EDDB)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 700,
};
