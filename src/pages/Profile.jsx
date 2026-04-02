import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LogOut, ChevronRight, Bell, Moon, Heart, Shield, Settings,
  Activity, Bookmark, Ticket, CalendarDays, Feather
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [editTone, setEditTone] = useState(false);

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

        {/* Avatar card */}
        <div style={{ ...card, padding: "20px", marginBottom: "16px" }}
             className="flex items-center gap-4">
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            backgroundColor: "var(--rose-dust-subtle)",
            border: "1px solid var(--rose-dust-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: "22px", fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              color: "var(--rose-dust)"
            }}>
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {user?.full_name}
            </p>
            <p style={mutedText}>{user?.email}</p>
            <span style={{
              display: "inline-block", marginTop: "6px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", borderRadius: "9999px",
              padding: "3px 10px",
              backgroundColor: "var(--rose-dust-subtle)",
              color: "var(--rose-dust)",
              fontFamily: "'Inter', sans-serif"
            }}>
              {profile?.plan || "Free"} Plan
            </span>
          </div>
        </div>

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