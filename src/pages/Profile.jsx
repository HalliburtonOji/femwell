import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  ChevronRight, Bell, Moon, Heart, Shield, Settings,
  Calendar, MapPin, Sparkles, Camera
} from "lucide-react";
import ConditionHealthProfile from "../components/conditions/ConditionHealthProfile";
import ProfileNavLinks from "../components/profile/ProfileNavLinks";
import ProfileDataModals from "../components/profile/ProfileDataModals";

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
    await base44.entities.UserProfile.update(profile.id, { tone_preference: tone });
    setProfile((p) => ({ ...p, tone_preference: tone }));
    if (preferences) {
      await base44.entities.UserPreferences.update(preferences.id, { coach_tone: tone });
      setPreferences((current) => ({ ...current, coach_tone: tone }));
    }
    setSaving(false);
    setEditTone(false);
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
    await base44.entities.UserProfile.update(profile.id, { life_stage: stage });
    setProfile(p => ({ ...p, life_stage: stage }));
    setEditLifeStage(false);
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
    fontFamily: "'Inter', sans-serif",
  };
  const bodyText = {
    fontSize: "14px", color: "var(--plum)",
    fontFamily: "'Inter', sans-serif",
  };
  const mutedText = {
    fontSize: "12px", color: "var(--mauve)",
    fontFamily: "'Inter', sans-serif",
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
          <h1 style={{
            fontSize: "26px", fontWeight: 700, lineHeight: 1.1,
            fontFamily: "'Fraunces', serif",
            color: "var(--plum)", letterSpacing: "-0.02em", marginTop: "4px"
          }}>Profile</h1>
        </div>

        {/* Hero card */}
        <div style={{
          background: "linear-gradient(135deg, var(--plum) 0%, var(--plum-light) 100%)",
          borderRadius: 24, padding: 24, marginBottom: 16,
          boxShadow: "var(--shadow-md)",
        }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <label style={{ cursor: uploadingPhoto ? "wait" : "pointer", position: "relative", display: "inline-block" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.35)",
                backgroundColor: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: "white" }}>
                    {user?.full_name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div style={{
                position: "absolute", bottom: 0, right: 0, width: 22, height: 22,
                borderRadius: "50%", backgroundColor: "var(--rose-dust)",
                border: "2px solid #2A2035",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera style={{ width: 10, height: 10, color: "white" }} />
              </div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
            <a href={createPageUrl("Upgrade")} style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 9999, padding: "4px 12px",
              fontSize: 11, fontWeight: 600, color: "white",
              fontFamily: "'Inter', sans-serif", textDecoration: "none",
            }}>
              {profile?.plan ? `${profile.plan} Plan` : "Free Plan"}
            </a>
          </div>
          {/* Name row */}
          <p style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>
            {user?.full_name}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", marginBottom: 0 }}>
            {user?.email}
          </p>
          {/* Phase chips */}
          {cycleInfo && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16, marginTop: 16, display: "flex", gap: 8 }}>
              {[
                { label: "Phase", value: PHASE_LABELS_P[cycleInfo.phase] || cycleInfo.phase },
                { label: "Cycle day", value: `Day ${cycleInfo.day}` },
                ...(daysToNextPeriod != null ? [{ label: "Next period", value: `${daysToNextPeriod}d` }] : [{ label: "Streak", value: `${checkinStreak}d` }]),
              ].map(chip => (
                <div key={chip.label} style={{
                  flex: 1, background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, padding: "10px 14px", textAlign: "center",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--rose-dust-light)", fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>{chip.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "white", fontFamily: "'Fraunces', serif" }}>{chip.value}</p>
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
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>{s.value}</p>
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
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>This week</p>
                {checkinStreak > 0 && <p style={{ fontSize: 12, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{checkinStreak}-day streak</p>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {last7.map(dateStr => {
                  const hasCheckin = checkinSet.has(dateStr);
                  const dayLabel = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3);
                  return (
                    <div key={dateStr} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 9999, backgroundColor: hasCheckin ? "var(--rose-dust)" : "var(--ivory-dark)", border: hasCheckin ? "none" : "1px solid var(--border)" }} />
                      <span style={{ fontSize: 9, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{dayLabel}</span>
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
            <button onClick={() => setEditGoals(v => !v)} style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              {editGoals ? "Done" : "Edit"}
            </button>
          </div>
          {editGoals ? (
            <div className="flex flex-wrap gap-2">
              {ALL_GOALS.map(g => {
                const active = (profile?.goals || []).includes(g);
                return (
                  <button key={g} onClick={() => toggleGoal(g)}
                    style={{ borderRadius: 9999, padding: "5px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1.5px solid", textTransform: "capitalize",
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
                <span key={g} style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)", borderRadius: 9999, padding: "4px 12px", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
                  {g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Health Profile (conditions + life stage) */}
        {profile && (
          <ConditionHealthProfile
            profile={profile}
            onProfileUpdate={(updates) => setProfile(p => ({ ...p, ...updates }))}
          />
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
                      style={{ textAlign: "left", borderRadius: 12, padding: "10px 12px", fontSize: 13, border: "1.5px solid", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                        backgroundColor: active ? "var(--plum)" : "var(--surface)",
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
              ? <span style={{ fontSize: 11, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>Saved</span>
              : <p style={{ ...mutedText, flexShrink: 0 }}>{profile?.ai_assistant_name || 'Guide'}</p>
            }
          </button>
          {editAssistantName && (
            <div style={{ padding: "8px 16px 12px", backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
              <input
                value={newAssistantName}
                onChange={e => setNewAssistantName(e.target.value)}
                placeholder="e.g. Luna, Sage, Guide..."
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--surface)", outline: "none" }}
              />
              <button onClick={() => saveProfileField('ai_assistant_name', newAssistantName, setEditAssistantName)}
                style={{ background: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer" }}>
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
              ? <span style={{ fontSize: 11, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>Saved</span>
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
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--surface)", outline: "none" }}
              />
              <button onClick={() => saveProfileField('birthday', newBirthday, setEditBirthday)}
                style={{ background: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer" }}>
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
              ? <span style={{ fontSize: 11, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>Saved</span>
              : <p style={{ ...mutedText, flexShrink: 0 }}>{profile?.location_city || 'Not set'}</p>
            }
          </button>
          {editCity && (
            <div style={{ padding: "8px 16px 12px", backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
              <input
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                placeholder="e.g. London, Manchester..."
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--surface)", outline: "none" }}
              />
              <button onClick={() => saveProfileField('location_city', newCity, setEditCity)}
                style={{ background: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer" }}>
                Save
              </button>
            </div>
          )}

          <div style={divider} />

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

          {/* Reminders */}
          <button style={rowItem}>
            <div style={iconBox("#FFF8EE")}>
              <Bell className="w-4 h-4" style={{ color: "#B89E6A" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Reminders</p>
              <p style={mutedText}>Check-in & session alerts</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </button>

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
              <p style={{ fontSize: "14px", color: "#D94F4F", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Delete my data</p>
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