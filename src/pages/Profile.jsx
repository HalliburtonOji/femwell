import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LogOut, ChevronRight, Bell, Moon, Heart, Shield, Settings,
  Activity, Bookmark, Ticket, CalendarDays, Feather, Calendar, MapPin, Sparkles
} from "lucide-react";

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
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, prefs, allCheckins] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.UserPreferences.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id }),
      ]);
      if (profiles[0]) setProfile(profiles[0]);
      if (prefs[0]) setPreferences(prefs[0]);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      setCheckins(allCheckins.filter(c => c.date >= cutoffStr));
      setLoading(false);
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
    { id: "gentle",   label: "Gentle"       },
    { id: "straight", label: "Straight talk" },
    { id: "minimal",  label: "Minimal"      },
  ];

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
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div style={{ paddingTop: "40px", paddingBottom: "20px" }}>
          <p style={sLabel}>Your account</p>
          <h1 style={{
            fontSize: "26px", fontWeight: 700, lineHeight: 1.1,
            fontFamily: "'Playfair Display', serif",
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
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "white" }}>
                {user?.full_name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            <span style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 9999, padding: "4px 12px",
              fontSize: 11, fontWeight: 600, color: "white",
              fontFamily: "'Inter', sans-serif",
            }}>
              {profile?.plan ? `${profile.plan} Plan` : "Free Plan"}
            </span>
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
                { label: "Streak", value: `${checkinStreak}d` },
              ].map(chip => (
                <div key={chip.label} style={{
                  flex: 1, background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, padding: "10px 14px", textAlign: "center",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--rose-dust-light)", fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>{chip.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "white", fontFamily: "'Playfair Display', serif" }}>{chip.value}</p>
                </div>
              ))}
            </div>
          )}
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
        {profile?.goals?.length > 0 && (
          <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
            <p style={{ ...sLabel, marginBottom: "12px" }}>Goals</p>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((g) => (
                <span key={g} style={{
                  backgroundColor: "var(--ivory-dark)", color: "var(--plum)",
                  borderRadius: "9999px", padding: "4px 12px",
                  fontSize: "12px", fontWeight: 500,
                  fontFamily: "'Inter', sans-serif", textTransform: "capitalize"
                }}>
                  {g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            {profile?.skin_type && (
              <p style={{ ...mutedText, marginTop: "10px" }}>
                Skin type:{" "}
                <strong style={{ color: "var(--plum)" }}>{profile.skin_type}</strong>
              </p>
            )}
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
            <div style={{
              padding: "12px 16px",
              backgroundColor: "var(--ivory)",
              borderBottom: "1px solid var(--border-subtle)"
            }}>
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateTone(t.id)}
                  style={{
                    width: "100%", textAlign: "left",
                    borderRadius: "12px", padding: "10px 14px",
                    fontSize: "13px", border: "none", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    ...(
                      (preferences?.coach_tone || profile?.tone_preference) === t.id
                        ? { backgroundColor: "var(--plum)", color: "white", fontWeight: 600 }
                        : { backgroundColor: "transparent", color: "var(--mauve)", fontWeight: 500 }
                    )
                  }}
                >
                  {t.label}
                </button>
              ))}
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
          <button style={rowItem}>
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

        {/* Life Stage */}
        <a href={createPageUrl("LifeStageCare")}
           style={{ ...card, padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={iconBox("var(--ivory-dark)")}>
            <Heart className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </div>
          <div className="flex-1">
            <p style={{ ...bodyText, fontWeight: 600 }}>Pregnancy & Menopause Support</p>
            <p style={mutedText}>Daily tracking, setup, and personal guidance</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
        </a>

        {/* Pulse */}
        <a href={createPageUrl("Pulse")}
           style={{ ...card, padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={iconBox("var(--rose-dust-subtle)")}>
            <Activity className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
          </div>
          <div className="flex-1">
            <p style={{ ...bodyText, fontWeight: 600 }}>Pulse</p>
            <p style={mutedText}>Weekly summaries & pattern charts</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
        </a>

        {/* Skin & Hair */}
        <a
          href={createPageUrl("SkinHair")}
          style={{ ...card, padding: "16px", marginBottom: "16px", display: "block", textDecoration: "none" }}
        >
          <div className="flex items-center gap-3">
            <div style={iconBox("var(--rose-dust-subtle)")}>
              <Feather className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Skin & Hair</p>
              {daysLoggedSkin === 0 && (
                <p style={mutedText}>Phase patterns, breakouts & shedding trends</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
          </div>
          {daysLoggedSkin > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              <span style={{
                backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)",
                fontSize: "11px", fontWeight: 600, borderRadius: "9999px",
                padding: "3px 10px", fontFamily: "'Inter', sans-serif"
              }}>
                {daysLoggedSkin} days logged
              </span>
              {skinConditionMode && (
                <span style={{
                  backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)",
                  fontSize: "11px", fontWeight: 600, borderRadius: "9999px",
                  padding: "3px 10px", fontFamily: "'Inter', sans-serif"
                }}>
                  {skinConditionMode}
                </span>
              )}
              {profile?.skin_type && (
                <span style={{
                  backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)",
                  fontSize: "11px", fontWeight: 600, borderRadius: "9999px",
                  padding: "3px 10px", fontFamily: "'Inter', sans-serif"
                }}>
                  {profile.skin_type} skin
                </span>
              )}
            </div>
          )}
        </a>

        {/* Grid: Saved, Deals, Events */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <a href={createPageUrl("Saved")}
             style={{ ...card, padding: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={iconBox("var(--rose-dust-subtle)")}>
              <Bookmark className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Saved</p>
              <p style={mutedText}>Advice, content & programs</p>
            </div>
          </a>
          <a href={createPageUrl("Deals")}
             style={{ ...card, padding: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={iconBox("#FFF8EE")}>
              <Ticket className="w-4 h-4" style={{ color: "#B89E6A" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Deals</p>
              <p style={mutedText}>Coupon codes and offers</p>
            </div>
          </a>
          <a href={createPageUrl("Events")}
             style={{ ...card, padding: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={iconBox("var(--ivory-dark)")}>
              <CalendarDays className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>Events</p>
              <p style={mutedText}>Free and paid listings</p>
            </div>
          </a>
        </div>

        {/* Redo Onboarding */}
        <a href={createPageUrl("Onboarding")}
           style={{ ...card, padding: "16px", marginBottom: "16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={iconBox("var(--ivory-dark)")}>
            <Settings className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </div>
          <div className="flex-1">
            <p style={{ ...bodyText, fontWeight: 600 }}>Redo Onboarding</p>
            <p style={mutedText}>Update goals and preferences</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
        </a>

        {/* Sign out */}
        <button
          onClick={() => base44.auth.logout()}
          style={{ ...card, cursor: "pointer", border: "none", backgroundColor: "var(--surface)", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", width: "100%" }}
        >
          <div style={iconBox("#FFF0F0")}>
            <LogOut className="w-4 h-4" style={{ color: "#D94F4F" }} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#D94F4F", fontFamily: "'Inter', sans-serif" }}>
            Sign out
          </p>
        </button>

      </div>
    </div>
  );
}