import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  ChevronRight, Bell, Moon, Heart, Shield,
  Calendar, MapPin, Sparkles, Camera, Users
} from "lucide-react";
import ConditionHealthProfile from "../components/conditions/ConditionHealthProfile";
import ProfileNavLinks from "../components/profile/ProfileNavLinks";
import ProfileDataModals from "../components/profile/ProfileDataModals";
import FirstLaunchStagePicker from "../components/planner/FirstLaunchStagePicker";
import { writeDevStageOverride } from "../components/planner/DevStageSwitcher";

// Friendly labels for the 12 supported life_stage enum values — used by the
// prominent "Your Femwell stage" card below to read the current stage.
const STAGE_LABEL = {
  none:             { label: "Not set",                hint: "Tap Change stage to choose how Femwell should shape itself for you." },
  teen:             { label: "Teen",                   hint: "Soft copy. Parent Bridge optional. No fertility content by default." },
  reproductive:     { label: "Reproductive years",     hint: "Standard menstrual cycle is the lens — phases, predictions, the full Planner." },
  "pre-ttc":        { label: "Pre-TTC",                hint: "Three months of better data before the TTC switch — folic acid, AMH conversations." },
  ttc:              { label: "Trying to conceive",     hint: "Cycle becomes a clinical tool. BBT, OPK, fertile-window confidence-honest." },
  "pregnant-t1":    { label: "Pregnant · Trimester I", hint: "Cycle tracking is paused. Trimester week ribbon takes over." },
  "pregnant-t2":    { label: "Pregnant · Trimester II",hint: "Cycle tracking is paused. 20-week anomaly scan is the landmark." },
  "pregnant-t3":    { label: "Pregnant · Trimester III",hint: "Cycle tracking is paused. Kick counter + birth plan from here on." },
  pregnancy:        { label: "Pregnant",               hint: "Cycle tracking is paused. Trimester ribbon is the frame." },
  postpartum:       { label: "Postpartum",             hint: "Period may not have returned — that's expected. Recovery is the frame." },
  perimenopause:    { label: "Perimenopause",          hint: "Symptom-pattern ribbon replaces phase prediction. HRT log appears on Patterns." },
  menopause:        { label: "Menopause",              hint: "Symptom-pattern frame. GSM screen + HRT log. No cycle prediction." },
  "post-menopause": { label: "Post-menopause",         hint: "Annual health rhythm — DEXA, smear, mammogram. No cycle frame." },
};

function getCyclePhase(lastPeriodDate, cycleLen = 28, periodLen = 5) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = new Date(lastPeriodDate);
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const cycleDay = (diff % cycleLen) + 1;
  let phase;
  if (cycleDay <= periodLen) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulatory';
  else phase = 'luteal';
  return { phase, day: cycleDay };
}
const PHASE_LABELS_P = { menstrual: 'Menstrual', follicular: 'Follicular', ovulatory: 'Ovulatory', luteal: 'Luteal' };

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [editTone, setEditTone] = useState(false);
  const [editAssistantName, setEditAssistantName] = useState(false);
  const [editBirthday, setEditBirthday] = useState(false);
  const [editCity, setEditCity] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newCity, setNewCity] = useState('');
  const [savedField, setSavedField] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showDataDeleteModal, setShowDataDeleteModal] = useState(false);
  // Stage picker modal — lifts FirstLaunchStagePicker into a Profile edit
  // surface so the user can change life_stage without scrolling to the
  // legacy inline picker further down the page.
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageToast, setStageToast] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      setProfile(p => ({ ...p, avatar_url: file_url }));
    } catch (_) {}
    setUploadingPhoto(false);
  };

  const saveProfileField = async (field, value, setEdit) => {
    if (!profile) return;
    await base44.entities.UserProfile.update(profile.id, { [field]: value });
    setProfile(p => ({ ...p, [field]: value }));
    setSavedField(field);
    setEdit(false);
    setTimeout(() => setSavedField(null), 2000);
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, prefs, allCheckins] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.UserPreferences.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
        ]);
        if (profiles[0]) setProfile(profiles[0]);
        if (prefs[0]) setPreferences(prefs[0]);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = cutoff.toISOString().split("T")[0];
        setCheckins(allCheckins.filter(c => c.date >= cutoffStr));
      } catch (err) {
        console.error("Profile page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateTone = async (tone) => {
    if (!profile) return;
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { tone_preference: tone });
      setProfile((p) => ({ ...p, tone_preference: tone }));
      if (preferences) {
        await base44.entities.UserPreferences.update(preferences.id, { coach_tone: tone });
        setPreferences((current) => ({ ...current, coach_tone: tone }));
      }
      setEditTone(false);
    } catch (err) {
      // Keep the tone editor open on failure rather than leaving the
      // row stuck in a "Saving…" state (UI audit — clear busy flag).
      console.error("Tone update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const tones = [
    { id: "warm",         label: "Warm",         desc: "Nurturing and encouraging" },
    { id: "clinical",     label: "Clinical",      desc: "Factual and precise" },
    { id: "motivational", label: "Motivational",  desc: "Energising and positive" },
    { id: "gentle",       label: "Gentle",        desc: "Soft and reassuring" },
    { id: "straight",     label: "Straight talk", desc: "Direct and no-nonsense" },
    { id: "minimal",      label: "Minimal",       desc: "Short, calm, to the point" },
  ];

  const ALL_GOALS = ["calm", "sleep", "energy", "fitness", "nutrition", "hormone_support", "relationships", "confidence", "mindfulness", "cycle_awareness", "stress_reduction", "better_sleep"];
  const ALL_CONDITIONS = ["pcos", "endometriosis", "pmdd", "perimenopause", "fibroids", "adenomyosis", "thyroid", "prefer_not"];

  const [editGoals, setEditGoals] = useState(false);
  const [editConditions, setEditConditions] = useState(false);
  const [editLifeStage, setEditLifeStage] = useState(false);

  const toggleGoal = async (g) => {
    if (!profile) return;
    const current = profile.goals || [];
    const next = current.includes(g) ? current.filter(x => x !== g) : [...current, g];
    await base44.entities.UserProfile.update(profile.id, { goals: next });
    setProfile(p => ({ ...p, goals: next }));
  };

  const toggleCondition = async (c) => {
    if (!profile) return;
    const current = profile.condition_flags || [];
    let next;
    if (c === "None") {
      next = current.includes("None") ? [] : ["None"];
    } else {
      const withoutNone = current.filter(x => x !== "None");
      next = withoutNone.includes(c) ? withoutNone.filter(x => x !== c) : [...withoutNone, c];
    }
    await base44.entities.UserProfile.update(profile.id, { condition_flags: next });
    setProfile(p => ({ ...p, condition_flags: next }));
  };

  const updateLifeStage = async (stage) => {
    if (!profile) return;
    // Sprint C C3 — set is_under_18 alongside life_stage so any future
    // consumer can read it without inferring from life_stage.
    const isUnder18 = stage === "teen";
    await base44.entities.UserProfile.update(profile.id, {
      life_stage: stage,
      is_under_18: isUnder18,
    });
    setProfile(p => ({ ...p, life_stage: stage, is_under_18: isUnder18 }));
    setEditLifeStage(false);
    // Notify any other tab/route (esp. /Planner) that the profile changed
    // so they re-fetch and reshape stage-gated cards immediately rather
    // than waiting for focus / 6s poll.
    try { window.dispatchEvent(new Event("femwell:profile-updated")); } catch { /* SSR-safe */ }
  };

  const currentTone = tones.find((t) => t.id === (preferences?.coach_tone || profile?.tone_preference)) || tones[0];

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;

  const checkinStreak = (() => {
    if (!checkins.length) return 0;
    let count = 0;
    const dates = new Set(checkins.map(c => c.date));
    const d = new Date();
    while (count <= 365) {
      if (!dates.has(d.toISOString().split('T')[0])) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const avgMood = (() => {
    const moodLogs = checkins.filter(c => c.mood);
    if (!moodLogs.length) return null;
    return Math.round(moodLogs.reduce((s, c) => s + c.mood, 0) / moodLogs.length * 10) / 10;
  })();

  const daysToNextPeriod = (() => {
    if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
    const lastPeriod = new Date(profile.last_period_start_date);
    const today = new Date();
    const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    return profile.cycle_avg_length - (daysSince % profile.cycle_avg_length);
  })();

  const skinCheckins = checkins.filter(c => c.skin_condition);
  const daysLoggedSkin = skinCheckins.length;
  const skinConditionMode = daysLoggedSkin
    ? Object.entries(
        skinCheckins.reduce((acc, c) => {
          acc[c.skin_condition] = (acc[c.skin_condition] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  // ── Shared styles ──
  const card = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    boxShadow: "var(--shadow-sm)",
  };
  const sLabel = {
    fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.12em", color: "var(--mauve)",
    };
  const bodyText = {
    fontSize: "14px", color: "var(--plum)",
    };
  const mutedText = {
    fontSize: "12px", color: "var(--mauve)",
    };
  const rowItem = {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 16px", width: "100%", textAlign: "left",
    backgroundColor: "transparent", border: "none", cursor: "pointer",
    textDecoration: "none",
  };
  const iconBox = (bg) => ({
    width: "34px", height: "34px", borderRadius: "10px",
    backgroundColor: bg, display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  });
  const divider = {
    height: "1px", backgroundColor: "var(--border-subtle)",
    margin: "0 16px",
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-3xl lg:max-w-5xl mx-auto px-4">

        {/* Header */}
        <div style={{ paddingTop: "40px", paddingBottom: "20px" }}>
          <p style={sLabel}>Your account</p>
          <h1 className="fw-display" style={{ marginTop: "4px" }}>Profile</h1>
        </div>

        {/* Hero card */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24, padding: 24, marginBottom: 16,
          boxShadow: "var(--shadow-md)",
        }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <label style={{ cursor: uploadingPhoto ? "wait" : "pointer", position: "relative", display: "inline-block" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                border: "2px solid var(--border)",
                backgroundColor: "var(--ivory)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 700, color: "var(--plum)" }}>
                    {user?.full_name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div style={{
                position: "absolute", bottom: 0, right: 0, width: 22, height: 22,
                borderRadius: "50%", backgroundColor: "var(--rose-dust)",
                border: "2px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera style={{ width: 10, height: 10, color: "white" }} />
              </div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
            <a href={createPageUrl("Upgrade")} style={{
              background: "var(--ivory)",
              border: "1px solid var(--border)",
              borderRadius: 9999, padding: "4px 12px",
              fontSize: 11, fontWeight: 600, color: "var(--plum)",
              textDecoration: "none",
            }}>
              {profile?.plan ? `${profile.plan} Plan` : "Free Plan"}
            </a>
          </div>
          {/* Name row */}
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", marginBottom: 2 }}>
            {user?.full_name}
          </p>
          <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 0 }}>
            {user?.email}
          </p>
          {/* Phase chips */}
          {cycleInfo && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16, display: "flex", gap: 8 }}>
              {[
                { label: "Phase", value: PHASE_LABELS_P[cycleInfo.phase] || cycleInfo.phase },
                { label: "Cycle day", value: `Day ${cycleInfo.day}` },
                ...(daysToNextPeriod != null ? [{ label: "Next period", value: `${daysToNextPeriod}d` }] : [{ label: "Streak", value: `${checkinStreak}d` }]),
              ].map(chip => (
                <div key={chip.label} style={{
                  flex: 1, background: "var(--ivory)",
                  border: "1px solid var(--border)",
                  borderRadius: 12, padding: "10px 14px", textAlign: "center",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--rose-dust)", marginBottom: 3 }}>{chip.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", }}>{chip.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stat strip */}
        <div style={{ display: "flex", gap: 10, marginBottom: "16px" }}>
          {[
            { label: "Check-ins", value: checkins.length },
            { label: "Avg mood", value: avgMood ? `${avgMood}/5` : "—" },
            { label: "Streak", value: `${checkinStreak}d` },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, ...card, padding: "12px 8px", textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", }}>{s.value}</p>
              <p style={{ ...sLabel, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* This week activity */}
        {(() => {
          const last7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });
          const checkinSet = new Set(checkins.map(c => c.date));
          return (
            <div style={{ ...card, padding: "16px 20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", }}>This week</p>
                {checkinStreak > 0 && <p style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 500 }}>{checkinStreak}-day streak</p>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {last7.map(dateStr => {
                  const hasCheckin = checkinSet.has(dateStr);
                  const dayLabel = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3);
                  return (
                    <div key={dateStr} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 9999, backgroundColor: hasCheckin ? "var(--rose-dust)" : "var(--ivory-dark)", border: hasCheckin ? "none" : "1px solid var(--border)" }} />
                      <span style={{ fontSize: 9, color: "var(--mauve)", }}>{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Goals card */}
        <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={sLabel}>Goals</p>
            <button onClick={() => setEditGoals(v => !v)} style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", }}>
              {editGoals ? "Done" : "Edit"}
            </button>
          </div>
          {editGoals ? (
            <div className="flex flex-wrap gap-2">
              {ALL_GOALS.map(g => {
                const active = (profile?.goals || []).includes(g);
                return (
                  <button key={g} onClick={() => toggleGoal(g)}
                    style={{ borderRadius: 9999, padding: "5px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1.5px solid", textTransform: "capitalize",
                      backgroundColor: active ? "var(--plum)" : "transparent",
                      borderColor: active ? "var(--plum)" : "var(--border)",
                      color: active ? "white" : "var(--mauve)" }}>
                    {g.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile?.goals || []).length === 0 && <p style={{ ...mutedText }}>No goals set. Tap Edit to add some.</p>}
              {(profile?.goals || []).map(g => (
                <span key={g} style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)", borderRadius: 9999, padding: "4px 12px", fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>
                  {g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Prominent stage card — the real personalisation lever.
            Sits above the legacy Health Profile section so it's the first
            thing the user sees about how Femwell will shape itself. Tap
            "Change stage" → scrolls down to the existing 12-pill picker
            inside ConditionHealthProfile.
            Spec ref: live-walk drift report 2026-05-16 + claude-state/
            product-research/femwell-complete-life-planner-2026-05-16.md. */}
        {profile && (() => {
          const stageKey = profile.life_stage || "none";
          const stage = STAGE_LABEL[stageKey] || STAGE_LABEL.none;
          const conds = profile.conditions || profile.condition_flags || [];
          const condCount = conds.filter(c => c && c !== "prefer_not").length;
          return (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--gold)",
              borderRadius: 20,
              padding: "18px 18px 20px",
              marginBottom: 16,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: "#A6862B",
                textTransform: "uppercase",
              }}>Your Femwell stage</div>
              <div style={{
                fontSize: 22,
                fontWeight: 500,
                fontStyle: "italic",
                color: "var(--plum, #4A2A3A)",
                margin: "6px 0 8px",
                lineHeight: 1.2,
              }}>{stage.label}</div>
              <p style={{
                fontSize: 12.5,
                color: "var(--plum-2, #6B4559)",
                lineHeight: 1.5,
                margin: "0 0 10px",
              }}>{stage.hint}</p>
              <p style={{
                fontStyle: "italic",
                fontSize: 11.5,
                color: "var(--plum-mute, #8A7584)",
                lineHeight: 1.5,
                margin: "0 0 12px",
              }}>
                This shapes every Planner surface, Jess message, and content card
                {condCount > 0 ? ` · ${condCount} condition${condCount === 1 ? "" : "s"} also active.` : "."}
              </p>
              <button
                type="button"
                onClick={() => setShowStageModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  background: "#3A2C1A",
                  color: "#F4EDDB",
                  border: "none",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  minHeight: 36,
                }}
              >Change stage →</button>
              {stageToast && (
                <p style={{
                  marginTop: 10,
                  padding: "6px 12px",
                  background: "rgba(107,143,90,0.18)",
                  border: "1px solid rgba(107,143,90,0.45)",
                  borderRadius: 9999,
                  fontSize: 11.5,
                  color: "#2D4E1A",
                  display: "inline-block",
                }} role="status">{stageToast}</p>
              )}
            </div>
          );
        })()}

        {/* Stage edit modal — the 11-stage picker lifted from
            FirstLaunchStagePicker, in 'edit' mode (different copy). On save,
            updates the profile state (so the gold card refreshes) AND mirrors
            the value into localStorage.femwell_dev_life_stage so the next
            Planner mount picks it up before the backend round-trip finishes. */}
        {showStageModal && profile && (
          <FirstLaunchStagePicker
            profile={profile}
            editMode
            onSaved={(stage) => {
              setProfile((p) => p ? { ...p, life_stage: stage } : p);
              try { writeDevStageOverride(stage); } catch { /* silent */ }
              // Fire the same custom event Planner listens for so the
              // shows* flags re-evaluate without a focus/poll wait.
              try { window.dispatchEvent(new Event("femwell:profile-updated")); } catch { /* silent */ }
              setShowStageModal(false);
              setStageToast("Stage updated — your planner will refresh");
              window.setTimeout(() => setStageToast(null), 3500);
            }}
            onSkip={() => setShowStageModal(false)}
          />
        )}

        {/* Health Profile (conditions + life stage) — anchor for the
            "Change stage" button on the prominent card above. */}
        {profile && (
          <div id="profile-stage-picker">
            <ConditionHealthProfile
              profile={profile}
              onProfileUpdate={(updates) => setProfile(p => ({ ...p, ...updates }))}
            />
          </div>
        )}

        {/* Settings card */}
        <div style={{ ...card, overflow: "hidden", marginBottom: "16px" }}>

          {/* Guidance Tone */}
          <button onClick={() => setEditTone(!editTone)} style={rowItem}>
            <div style={iconBox("var(--rose-dust-subtle)")}>
              <Heart className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Guidance Tone</p>
              <p style={mutedText}>{currentTone.label}</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </button>

          {editTone && (
            <div style={{ padding: "12px 16px", backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((t) => {
                  const active = (preferences?.coach_tone || profile?.tone_preference) === t.id;
                  return (
                    <button key={t.id} onClick={() => updateTone(t.id)}
                      style={{ textAlign: "left", borderRadius: 12, padding: "10px 12px", fontSize: 13, border: "1.5px solid", cursor: "pointer", backgroundColor: active ? "var(--plum)" : "var(--surface)",
                        borderColor: active ? "var(--plum)" : "var(--border)",
                        color: active ? "white" : "var(--plum)", fontWeight: active ? 700 : 500 }}>
                      <p>{t.label}</p>
                      <p style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.7)" : "var(--mauve)", marginTop: 2 }}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assistant name */}
          <button onClick={() => { setEditAssistantName(!editAssistantName); setNewAssistantName(profile?.ai_assistant_name || ''); }} style={rowItem}>
            <div style={iconBox("var(--rose-dust-subtle)")}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Assistant name</p>
              <p style={mutedText}>How you want to call your AI guide</p>
            </div>
            {savedField === 'ai_assistant_name'
              ? <span style={{ fontSize: 11, color: "var(--sage)", }}>Saved</span>
              : <p style={{ ...mutedText, flexShrink: 0 }}>{profile?.ai_assistant_name || 'Guide'}</p>
            }
          </button>
          {editAssistantName && (
            <div style={{ padding: "8px 16px 12px", backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
              <input
                value={newAssistantName}
                onChange={e => setNewAssistantName(e.target.value)}
                placeholder="e.g. Luna, Sage, Guide..."
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--plum)", background: "var(--surface)", outline: "none" }}
              />
              <button onClick={() => saveProfileField('ai_assistant_name', newAssistantName, setEditAssistantName)}
                style={{ background: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, border: "none", cursor: "pointer" }}>
                Save
              </button>
            </div>
          )}

          <div style={divider} />

          {/* Birthday */}
          <button onClick={() => { setEditBirthday(!editBirthday); setNewBirthday(profile?.birthday || ''); }} style={rowItem}>
            <div style={iconBox("var(--sage-subtle)")}>
              <Calendar className="w-4 h-4" style={{ color: "var(--sage)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Birthday</p>
              <p style={mutedText}>Used for cycle insights and personalisation</p>
            </div>
            {savedField === 'birthday'
              ? <span style={{ fontSize: 11, color: "var(--sage)", }}>Saved</span>
              : <p style={{ ...mutedText, flexShrink: 0 }}>
                  {profile?.birthday ? new Date(profile.birthday + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}
                </p>
            }
          </button>
          {editBirthday && (
            <div style={{ padding: "8px 16px 12px", backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
              <input
                type="date"
                value={newBirthday}
                onChange={e => setNewBirthday(e.target.value)}
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--plum)", background: "var(--surface)", outline: "none" }}
              />
              <button onClick={() => saveProfileField('birthday', newBirthday, setEditBirthday)}
                style={{ background: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, border: "none", cursor: "pointer" }}>
                Save
              </button>
            </div>
          )}

          <div style={divider} />

          {/* City */}
          <button onClick={() => { setEditCity(!editCity); setNewCity(profile?.location_city || ''); }} style={rowItem}>
            <div style={iconBox("var(--ivory-dark)")}>
              <MapPin className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Your city</p>
              <p style={mutedText}>For personalised events and recommendations</p>
            </div>
            {savedField === 'location_city'
              ? <span style={{ fontSize: 11, color: "var(--sage)", }}>Saved</span>
              : <p style={{ ...mutedText, flexShrink: 0 }}>{profile?.location_city || 'Not set'}</p>
            }
          </button>
          {editCity && (
            <div style={{ padding: "8px 16px 12px", backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
              <input
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                placeholder="e.g. London, Manchester..."
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--plum)", background: "var(--surface)", outline: "none" }}
              />
              <button onClick={() => saveProfileField('location_city', newCity, setEditCity)}
                style={{ background: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, border: "none", cursor: "pointer" }}>
                Save
              </button>
            </div>
          )}

          <div style={divider} />

          <div style={divider} />

          {/* W5 — Community link (a door from Profile into the peer space) */}
          <a href={createPageUrl("Community")} style={rowItem}>
            <div style={iconBox("var(--rose-dust-subtle)")}>
              <Users className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Community</p>
              <p style={mutedText}>Anonymous, 18+ — a room everyone&apos;s in</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </a>

          <div style={divider} />

          {/* Cycle Settings */}
          <a href={createPageUrl("CycleSettings")} style={rowItem}>
            <div style={iconBox("var(--sage-subtle)")}>
              <Moon className="w-4 h-4" style={{ color: "var(--sage)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Cycle Settings</p>
              <p style={mutedText}>
                {profile?.cycle_avg_length ? `${profile.cycle_avg_length}-day cycle` : "Not configured"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </a>

          <div style={divider} />

          {/* Reminders — deep-links to the Settings > Notifications section
              where check-in / session reminder prefs actually live. Was a
              dead <button> with no onClick (UI audit fix). */}
          <a href={`${createPageUrl("Settings")}?section=notifications`} style={rowItem}>
            <div style={iconBox("#FFF8EE")}>
              <Bell className="w-4 h-4" style={{ color: "#B89E6A" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Reminders</p>
              <p style={mutedText}>Check-in & session alerts</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </a>

          <div style={divider} />

          {/* Privacy */}
          <button onClick={() => setShowDataExportModal(true)} style={rowItem}>
            <div style={iconBox("var(--sage-subtle)")}>
              <Shield className="w-4 h-4" style={{ color: "var(--sage)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Privacy & Data</p>
              <p style={mutedText}>Export or delete your data</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </button>
        </div>

        {/* Privacy section */}
        <div style={{ ...card, overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ padding: "14px 16px 10px" }}>
            <p style={sLabel}>Privacy</p>
          </div>

          {/* Your data row */}
          <div style={{ ...rowItem, cursor: "default" }}>
            <div style={iconBox("var(--sage-subtle)")}>
              <Shield className="w-4 h-4" style={{ color: "var(--sage)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Your data</p>
              <p style={mutedText}>{checkins.length} check-ins stored</p>
            </div>
          </div>

          <div style={divider} />

          {/* Anonymous mode */}
          <div style={{ ...rowItem, cursor: "default" }}>
            <div style={iconBox("var(--mauve-subtle)")}>
              <Shield className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Anonymous mode</p>
              <p style={mutedText}>Your data stays yours. Not linked to analytics.</p>
            </div>
            <div
              onClick={async () => {
                if (!profile) return;
                const next = !profile.anonymous_mode;
                await base44.entities.UserProfile.update(profile.id, { anonymous_mode: next });
                setProfile(p => ({ ...p, anonymous_mode: next }));
              }}
              style={{ width: 40, height: 22, borderRadius: 9999, position: "relative", backgroundColor: profile?.anonymous_mode ? "var(--plum)" : "var(--border)", transition: "background 0.2s", cursor: "pointer", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: profile?.anonymous_mode ? 20 : 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s" }} />
            </div>
          </div>

          <div style={divider} />

          {/* Data export */}
          <button onClick={() => setShowDataExportModal(true)} style={rowItem}>
            <div style={iconBox("var(--ivory-dark)")}>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Data export</p>
              <p style={mutedText}>Download your health data</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </button>

          <div style={divider} />

          {/* Delete my data */}
          <button onClick={() => setShowDataDeleteModal(true)} style={{ ...rowItem }}>
            <div style={iconBox("#FFF0F0")}>
              <Shield className="w-4 h-4" style={{ color: "#D94F4F" }} />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: "14px", color: "#D94F4F", fontWeight: 600 }}>Delete my data</p>
              <p style={mutedText}>Request permanent deletion</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </button>
        </div>

        <ProfileDataModals
          showExport={showDataExportModal}
          showDelete={showDataDeleteModal}
          onCloseExport={() => setShowDataExportModal(false)}
          onCloseDelete={() => setShowDataDeleteModal(false)}
        />

        <ProfileNavLinks
          profile={profile}
          daysLoggedSkin={daysLoggedSkin}
          skinConditionMode={skinConditionMode}
        />

      </div>
    </div>
  );
}