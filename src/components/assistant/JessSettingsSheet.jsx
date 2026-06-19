// JessSettingsSheet — slide-up modal triggered by the gear icon on the
// Jess home base. Lets the user rename their companion, pick a character
// preset, dial proactivity, manage Jess's memory, and set privacy toggles.
//
// All preferences persist to UserProfile fields:
//   jess_name        (string)
//   jess_character   ("nurturing" | "coach" | "clinical" | "friend")
//   jess_proactivity (json: { enabled, level })
//   jess_privacy     (json: { read_journal, reference_past, share_anon })
//
// Memory delete + Clear all are local UI for now — real wiring lands in a
// follow-up when the JessMemory entity exists.

import { useEffect, useState, useCallback } from "react";
import { X, Check, Trash2, AlertTriangle, Pencil, Plus, Leaf, Zap, FlaskConical, Sun } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  loadTopMemories,
  deactivateMemory,
  deactivateAllMemories,
  createUserMemory,
  updateMemoryContent,
  memoryTypeBadge,
} from "@/services/jessMemoryService";
import { useScrollLock } from "@/utils/useScrollLock";

// FemWell design tokens — locked to spec.
const C = {
  cream:        "#F4EDDB",
  creamDark:    "#EDE6D5",
  paper:        "#FBF6E6",
  paperHi:      "#EDE6D5", // was pure white — now spec card surface
  espresso:     "#3A2C1A",
  espressoDeep: "#2A1E0E",
  blush:        "#E8B4B8",
  sage:         "#8FAF8F",
  muted:        "#9B8B7A",
  mutedText:    "#9B8B7A", // alias for muted per spec
  gold:         "#D4AF37",
  border:       "#D4C9B4",
};

const CHARACTERS = [
  { id: "nurturing", Icon: Leaf,         label: "Nurturing", desc: "Warm, supportive, checks in on how you're feeling" },
  { id: "coach",     Icon: Zap,          label: "Coach",     desc: "Direct, motivational, focuses on habits and goals" },
  { id: "clinical",  Icon: FlaskConical, label: "Clinical",  desc: "Factual, precise, minimal emotional framing" },
  { id: "friend",    Icon: Sun,          label: "Friend",    desc: "Casual, playful, uses humour" },
];

const PROACTIVITY_LEVELS = [
  { value: 1, label: "Gentle nudges" },
  { value: 2, label: "Regular check-ins" },
  { value: 3, label: "Active coaching" },
];

// Memory rows now come from base44.entities.JessMemory via
// jessMemoryService.loadTopMemories(). Feature 2 — Jess Memory System.

export default function JessSettingsSheet({ open, onClose, user, profile, onProfileChange }) {
  useScrollLock(open);   // lock the background page while the settings sheet is open
  const [jessName, setJessName] = useState("");
  const [character, setCharacter] = useState("nurturing");
  const [proEnabled, setProEnabled] = useState(true);
  const [proLevel, setProLevel] = useState(2);
  const [privacy, setPrivacy] = useState({ read_journal: false, reference_past: true, share_anon: false });
  // Feature 2 — JessMemory rows for this user, sorted by importance.
  // [] = no rows yet (either no schema or no extractions). Updated on
  // every settings sheet open + after each delete / clear action.
  const [memories, setMemories] = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // J2-5 — inline edit + add. editId tracks which row is in edit mode;
  // editDraft holds the unsaved text. addDraft is the new-memory input.
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [addDraft, setAddDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const reloadMemories = useCallback(async () => {
    if (!user?.id) { setMemories([]); return; }
    setMemoriesLoading(true);
    try {
      const rows = await loadTopMemories(user.id, 10);
      setMemories(Array.isArray(rows) ? rows : []);
    } finally { setMemoriesLoading(false); }
  }, [user?.id]);

  // J2-5 — create a user-authored memory from the add-input.
  const addMemoryNow = useCallback(async () => {
    if (!user?.id) return;
    const draft = addDraft.trim();
    if (draft.length < 4 || adding) return;
    setAdding(true);
    try {
      const row = await createUserMemory(user.id, draft);
      if (row) {
        // Prepend optimistically — newest user-added memory at the top.
        setMemories((prev) => [row, ...prev]);
        setAddDraft("");
      }
    } finally { setAdding(false); }
  }, [user?.id, addDraft, adding]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync local state from profile when opening.
  useEffect(() => {
    if (!open) return;
    setJessName(profile?.jess_name || "Jess");
    setCharacter(profile?.jess_character || "nurturing");
    const pro = typeof profile?.jess_proactivity === "string"
      ? safeParse(profile.jess_proactivity)
      : profile?.jess_proactivity;
    setProEnabled(pro?.enabled ?? true);
    setProLevel(pro?.level ?? 2);
    const priv = typeof profile?.jess_privacy === "string"
      ? safeParse(profile.jess_privacy)
      : profile?.jess_privacy;
    setPrivacy({
      read_journal:   priv?.read_journal   ?? false,
      reference_past: priv?.reference_past ?? true,
      share_anon:     priv?.share_anon     ?? false,
    });
    setShowClearConfirm(false);
    setSaved(false);
    // J2-5 — reset transient edit + add state every time the sheet opens.
    setEditId(null);
    setEditDraft("");
    setAddDraft("");
    setAdding(false);
    // Feature 2 — pull fresh JessMemory rows when the sheet opens.
    reloadMemories();
  }, [open, profile?.id, reloadMemories]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSave() {
    if (!user || saving) return;
    setSaving(true);
    const payload = {
      jess_name:        jessName.trim() || "Jess",
      jess_character:   character,
      jess_proactivity: { enabled: proEnabled, level: proLevel },
      jess_privacy:     privacy,
    };
    try {
      let updated;
      if (profile?.id) {
        updated = await base44.entities.UserProfile.update(profile.id, payload);
      } else {
        updated = await base44.entities.UserProfile.create({
          user_id: user.id,
          user_email: user.email,
          ...payload,
        });
      }
      onProfileChange?.({ ...(profile || {}), ...updated, ...payload });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose?.();
      }, 700);
    } catch { /* silent */ }
    setSaving(false);
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes jess-sheet-slide {
          from { transform: translateY(8%); opacity: 0.6; }
          to   { transform: translateY(0);  opacity: 1; }
        }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(42,30,14,0.45)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        role="dialog"
        aria-label="Jess settings"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          left: "50%", bottom: 0,
          transform: "translateX(-50%)",
          width: "min(100vw, 460px)",
          maxHeight: "92vh",
          background: C.cream,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -12px 36px rgba(58,44,26,0.20)",
          zIndex: 201,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "jess-sheet-slide 260ms cubic-bezier(0.22,1,0.36,1)",
          paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 4 }}>
          <span aria-hidden style={{
            width: 36, height: 4, borderRadius: 9999, background: C.border,
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: "8px 18px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10,
        }}>
          <h2 style={{
            margin: 0, fontSize: 22, fontWeight: 600, color: C.espresso, letterSpacing: "-0.01em",
          }}>Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{
              width: 36, height: 36, borderRadius: 9999, border: "none",
              background: C.paper, color: C.espresso,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          ><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "0 18px 16px",
          display: "flex", flexDirection: "column", gap: 18,
        }}>
          {/* Rename */}
          <Section title="Rename Jess">
            <input
              type="text"
              value={jessName}
              onChange={(e) => setJessName(e.target.value)}
              placeholder="What would you like to call your companion?"
              maxLength={24}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 14px", minHeight: 44, borderRadius: 12,
                border: `1px solid ${C.border}`, background: C.paperHi,
                fontSize: 14,
                color: C.espresso, outline: "none",
              }}
            />
            <p style={{
              margin: "8px 0 0", fontSize: 12, color: C.mutedText,
              fontStyle: "italic",
            }}>Hi {(jessName || "Jess").trim()}, I'm here for you.</p>
          </Section>

          {/* Character preset */}
          <Section title="Character preset" hint="Character affects Jess's tone and how she frames insights.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {CHARACTERS.map((c) => {
                const active = character === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCharacter(c.id)}
                    style={{
                      textAlign: "left",
                      background: active ? C.paperHi : C.paper,
                      border: active ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                      borderRadius: 14, padding: "12px 12px",
                      minHeight: 88, cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}
                  >
                    <c.Icon size={18} style={{ color: C.gold }} aria-hidden />
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.espresso }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.4 }}>{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Proactivity */}
          <Section title="Proactivity">
            <ToggleRow
              label="Jess checks in proactively"
              checked={proEnabled}
              onChange={() => setProEnabled((v) => !v)}
            />
            <div style={{ opacity: proEnabled ? 1 : 0.45, pointerEvents: proEnabled ? "auto" : "none", marginTop: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {PROACTIVITY_LEVELS.map((lvl) => {
                  const active = proLevel === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setProLevel(lvl.value)}
                      style={{
                        flex: 1, minHeight: 44,
                        background: active ? C.espresso : C.paperHi,
                        color: active ? C.cream : C.espresso,
                        border: active ? "1px solid " + C.espresso : `1px solid ${C.border}`,
                        borderRadius: 12, cursor: "pointer",
                        fontSize: 12, fontWeight: 700, padding: "6px 8px",
                      }}
                    >{lvl.label}</button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* WHAT JESS KNOWS — J2-5 (editable, addable memory cards) */}
          <Section title="What Jess knows" hint="Edit, remove, or add things you want Jess to remember.">
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {memories.map((m) => {
                const badge = memoryTypeBadge(m.memory_type);
                const isEditing = editId === m.id;
                return (
                  <li key={m.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    background: C.creamDark, border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{
                        alignSelf: "flex-start",
                        display: "inline-flex", alignItems: "center",
                        padding: "2px 8px", borderRadius: 9999,
                        background: badge.bg, color: badge.fg,
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}>{badge.label}</span>
                      {isEditing ? (
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          rows={2}
                          autoFocus
                          style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "8px 10px", borderRadius: 8,
                            border: `1px solid ${C.border}`, background: C.paperHi,
                            fontSize: 13,
                            color: C.espresso, outline: "none", resize: "vertical",
                            lineHeight: 1.45,
                          }}
                        />
                      ) : (
                        <span style={{
                          fontSize: 13, lineHeight: 1.45, color: C.espresso,
                          }}>{m.content}</span>
                      )}
                      {isEditing && (
                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={async () => {
                              const draft = editDraft.trim();
                              if (draft.length < 4) { setEditId(null); return; }
                              // Optimistic
                              setMemories((prev) => prev.map((row) =>
                                row.id === m.id ? { ...row, content: draft } : row,
                              ));
                              setEditId(null);
                              await updateMemoryContent(m.id, draft);
                            }}
                            style={{
                              padding: "6px 12px", minHeight: 32,
                              background: C.espresso, color: C.cream, border: "none",
                              borderRadius: 9999, cursor: "pointer",
                              fontSize: 12, fontWeight: 700,
                            }}
                          >Save</button>
                          <button
                            type="button"
                            onClick={() => { setEditId(null); setEditDraft(""); }}
                            style={{
                              padding: "6px 12px", minHeight: 32,
                              background: "transparent", color: C.muted,
                              border: `1px solid ${C.border}`,
                              borderRadius: 9999, cursor: "pointer",
                              fontSize: 12, fontWeight: 600,
                            }}
                          >Cancel</button>
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <>
                        <button
                          type="button"
                          aria-label={`Edit: ${m.content}`}
                          onClick={() => { setEditId(m.id); setEditDraft(m.content || ""); }}
                          style={{
                            width: 32, height: 32, borderRadius: 9999, border: "none",
                            background: "transparent", color: C.muted, cursor: "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        ><Pencil size={13} /></button>
                        <button
                          type="button"
                          aria-label={`Forget: ${m.content}`}
                          onClick={async () => {
                            // Optimistic — drop locally, then soft-delete.
                            setMemories((prev) => prev.filter((row) => row.id !== m.id));
                            await deactivateMemory(m.id);
                          }}
                          style={{
                            width: 32, height: 32, borderRadius: 9999, border: "none",
                            background: "transparent", color: C.muted, cursor: "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        ><X size={14} /></button>
                      </>
                    )}
                  </li>
                );
              })}
              {!memoriesLoading && memories.length === 0 && (
                <li style={{
                  padding: "12px 14px", borderRadius: 12,
                  background: C.paper, border: `1px dashed ${C.border}`,
                  fontSize: 12, color: C.mutedText, fontStyle: "italic",
                  textAlign: "center",
                }}>Jess hasn't formed memories yet — keep chatting, or add one below.</li>
              )}
              {memoriesLoading && (
                <li style={{
                  padding: "12px 14px", borderRadius: 12,
                  background: C.paper, border: `1px dashed ${C.border}`,
                  fontSize: 12, color: C.mutedText, textAlign: "center",
                }}>Loading memories…</li>
              )}
            </ul>

            {/* J2-5 — add-a-memory input. Saves as user-authored. */}
            <div style={{
              display: "flex", gap: 8, marginTop: 10,
              alignItems: "stretch",
            }}>
              <input
                type="text"
                value={addDraft}
                onChange={(e) => setAddDraft(e.target.value)}
                placeholder="Add something for Jess to remember…"
                maxLength={240}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addDraft.trim().length >= 4 && !adding) {
                    e.preventDefault();
                    addMemoryNow();
                  }
                }}
                style={{
                  flex: 1, boxSizing: "border-box",
                  padding: "10px 12px", minHeight: 40, borderRadius: 12,
                  border: `1px solid ${C.border}`, background: C.paperHi,
                  fontSize: 13,
                  color: C.espresso, outline: "none",
                }}
              />
              <button
                type="button"
                onClick={addMemoryNow}
                disabled={adding || addDraft.trim().length < 4}
                aria-label="Add memory"
                style={{
                  minWidth: 44, minHeight: 40, borderRadius: 12,
                  background: C.espresso, color: C.cream, border: "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
                  cursor: (adding || addDraft.trim().length < 4) ? "not-allowed" : "pointer",
                  opacity: (adding || addDraft.trim().length < 4) ? 0.45 : 1,
                  fontSize: 13, fontWeight: 700,
                  padding: "0 12px",
                }}
              ><Plus size={14} /> Add</button>
            </div>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={memories.length === 0}
              style={{
                marginTop: 10, padding: "10px 14px", minHeight: 44,
                background: "white", color: "#B91C1C",
                border: "1.5px solid #FCA5A5", borderRadius: 9999,
                display: "inline-flex", alignItems: "center", gap: 6,
                cursor: memories.length === 0 ? "not-allowed" : "pointer",
                opacity: memories.length === 0 ? 0.5 : 1,
                fontSize: 13, fontWeight: 700,
              }}
            ><Trash2 size={14} /> Clear all memory</button>
            {showClearConfirm && (
              <div style={{
                marginTop: 10, padding: 12, borderRadius: 12,
                background: "#FFF1F2", border: "1px solid #FCA5A5",
                }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={16} style={{ color: "#B91C1C", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#7A1B1B", lineHeight: 1.5 }}>
                    Clear everything Jess has remembered about you? She'll start fresh next time.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      // Optimistic local clear, then soft-delete every
                      // active JessMemory row server-side.
                      setMemories([]);
                      setShowClearConfirm(false);
                      if (user?.id) await deactivateAllMemories(user.id);
                    }}
                    style={{
                      flex: 1, minHeight: 40, padding: "8px 14px",
                      background: "#B91C1C", color: "white", border: "none",
                      borderRadius: 9999, cursor: "pointer",
                      fontSize: 13, fontWeight: 700,
                    }}
                  >Yes, clear memory</button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    style={{
                      flex: 1, minHeight: 40, padding: "8px 14px",
                      background: "white", color: "var(--plum, #3A2C1A)",
                      border: `1px solid ${C.border}`, borderRadius: 9999, cursor: "pointer",
                      fontSize: 13, fontWeight: 600,
                    }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </Section>

          {/* Privacy */}
          <Section title="Privacy">
            <ToggleRow
              label="Allow Jess to read my journal entries"
              checked={privacy.read_journal}
              onChange={() => setPrivacy((p) => ({ ...p, read_journal: !p.read_journal }))}
            />
            <ToggleRow
              label="Allow Jess to reference past conversations"
              checked={privacy.reference_past}
              onChange={() => setPrivacy((p) => ({ ...p, reference_past: !p.reference_past }))}
            />
            <ToggleRow
              label="Share anonymised patterns to improve Jess"
              checked={privacy.share_anon}
              onChange={() => setPrivacy((p) => ({ ...p, share_anon: !p.share_anon }))}
            />
          </Section>
        </div>

        {/* Save footer */}
        <div style={{
          padding: "12px 18px var(--fw-sheet-safe)",
          borderTop: `1px solid ${C.border}`,
          background: C.cream,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {saved && (
            <span style={{
              fontSize: 12, color: "#3D6B3D",
              display: "inline-flex", alignItems: "center", gap: 4,
              fontWeight: 600,
            }}><Check size={14} /> Saved</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, minHeight: 48,
              padding: "12px 18px", borderRadius: 14,
              background: C.espresso, color: C.cream, border: "none",
              fontSize: 14, fontWeight: 700,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >{saving ? "Saving…" : "Save preferences"}</button>
        </div>
      </div>
    </>
  );
}

function Section({ title, hint, children }) {
  return (
    <section>
      <h3 style={{
        margin: "0 0 8px",
        fontSize: 11, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.muted,
      }}>{title}</h3>
      {hint && (
        <p style={{
          margin: "0 0 8px", fontSize: 12, color: C.mutedText,
          lineHeight: 1.5,
        }}>{hint}</p>
      )}
      {children}
    </section>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "10px 0",
    }}>
      <span style={{
        flex: 1, fontSize: 13, color: C.espresso, fontWeight: 600,
        }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
        onClick={onChange}
        style={{
          flexShrink: 0,
          width: 44, height: 24, borderRadius: 9999,
          background: checked ? C.sage : "#E5E7EB",
          border: "none", cursor: "pointer",
          position: "relative",
          transition: "background 180ms ease",
        }}
      >
        <span aria-hidden style={{
          position: "absolute", top: 2,
          left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: 9999,
          background: "white",
          transition: "left 180ms ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
