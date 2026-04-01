import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { LogOut, ChevronRight, Bell, Moon, Heart, Shield, Settings, TrendingUp, Bookmark, Ticket, CalendarDays, Feather } from "lucide-react";

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

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

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

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-3xl mx-auto px-4">
        <div className="pt-12 pb-6">
          <h1 className="text-2xl font-bold text-rose-900">Profile</h1>
        </div>

        {/* Avatar + name */}
        <div className="card-glass rounded-2xl p-5 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-bold text-gray-800">{user?.full_name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-600 capitalize">
              {profile?.plan || "Free"} Plan
            </span>
          </div>
        </div>

        {/* Goals */}
        {profile?.goals?.length > 0 && (
          <div className="card-glass rounded-2xl p-4 mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Your Goals</p>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((g) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100 capitalize">
                  {g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            {profile?.skin_type && (
              <p style={{
                fontSize: "12px", color: "var(--mauve)",
                fontFamily: "'Inter', sans-serif", marginTop: "10px"
              }}>
                Skin type:{" "}
                <strong style={{ color: "var(--plum)" }}>{profile.skin_type}</strong>
              </p>
            )}
          </div>
        )}

        {/* Settings List */}
        <div className="card-glass rounded-2xl overflow-hidden mb-4">
          {/* Tone */}
          <button
            onClick={() => setEditTone(!editTone)}
            className="w-full flex items-center gap-3 p-4 hover:bg-rose-50/50 transition-colors border-b border-rose-50"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">Guidance Tone</p>
              <p className="text-xs text-gray-400">{currentTone.label}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {editTone && (
            <div className="p-4 bg-rose-50/30 border-b border-rose-50 space-y-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateTone(t.id)}
                  className={`w-full text-left p-3 rounded-xl text-sm flex items-center gap-3 transition-all ${
                    (preferences?.coach_tone || profile?.tone_preference) === t.id ? "bg-rose-100 text-rose-700 font-medium" : "bg-white/60 text-gray-600 hover:bg-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Cycle Settings */}
          <a
            href={createPageUrl("CycleSettings")}
            className="w-full flex items-center gap-3 p-4 hover:bg-rose-50/50 transition-colors border-b border-rose-50"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <Moon className="w-4 h-4 text-pink-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">Cycle Settings</p>
              <p className="text-xs text-gray-400">
                {profile?.cycle_avg_length ? `${profile.cycle_avg_length}-day cycle` : "Not configured"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </a>

          {/* Reminders */}
          <button className="w-full flex items-center gap-3 p-4 hover:bg-rose-50/50 transition-colors border-b border-rose-50">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">Reminders</p>
              <p className="text-xs text-gray-400">Check-in & meditation alerts</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* Privacy */}
          <button className="w-full flex items-center gap-3 p-4 hover:bg-rose-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center" style={{ background: "#d4e5e0" }}>
              <Shield className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">Privacy & Data</p>
              <p className="text-xs text-gray-400">Export or delete your data</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <a
          href={createPageUrl("LifeStageCare")}
          className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors block"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--mauve-subtle)" }}>
            <Heart className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Pregnancy & Menopause Support</p>
            <p className="text-xs text-gray-400">Daily tracking, setup, and personal guidance</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </a>

        {/* Trends */}
        <a
          href={createPageUrl("Pulse")}
          className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors block"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Pulse</p>
            <p className="text-xs text-gray-400">Weekly summaries & pattern charts</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </a>

        <a
          href={createPageUrl("SkinHair")}
          className="card-glass rounded-2xl p-4 mb-4 block"
          style={{ textDecoration: "none" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
              <Feather className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium"
                 style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                Skin & Hair
              </p>
              {daysLoggedSkin === 0 && (
                <p className="text-xs"
                   style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  Phase patterns, breakouts & shedding trends
                </p>
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

        <div className="grid gap-4 md:grid-cols-3">
          <a
            href={createPageUrl("Saved")}
            className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Saved</p>
              <p className="text-xs text-gray-400">Advice, content, and programs</p>
            </div>
          </a>

          <a
            href={createPageUrl("Deals")}
            className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Deals</p>
              <p className="text-xs text-gray-400">Coupon codes and offers</p>
            </div>
          </a>

          <a
            href={createPageUrl("Events")}
            className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors block"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Events</p>
              <p className="text-xs text-gray-400">Free and paid listings</p>
            </div>
          </a>
        </div>

        <div className="h-4" />

        {/* Onboarding redo */}
        <a
          href={createPageUrl("Onboarding")}
          className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors block"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Redo Onboarding</p>
            <p className="text-xs text-gray-400">Update your goals and preferences</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </a>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout()}
          className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-sm font-medium text-red-400">Sign Out</p>
        </button>
      </div>
    </div>
  );
}