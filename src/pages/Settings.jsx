import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  User as UserIcon, Bell, Lock, Database, Info,
  Download, FileText, Trash2, ChevronRight, Heart, Check, X,
} from "lucide-react";
import SettingsCard from "../components/settings/SettingsCard";
import SettingsToggle from "../components/settings/SettingsToggle";
import {
  downloadBlob, todayStamp, toCsv, cycleDayFor, withinLastMonths,
} from "@/lib/settingsExport";

const APP_VERSION = "1.9.0";

const SECTIONS = [
  { id: "account",       label: "Account",       icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy",       label: "Privacy",       icon: Lock },
  { id: "data",          label: "Data",          icon: Database },
  { id: "about",         label: "About",         icon: Info },
];

const DEFAULT_NOTIFS = {
  daily_checkin_reminder:      true,
  cycle_prediction_alerts:     true,
  educational_content_weekly:  true,
  community_replies:           true,
  marketing_emails:            false,
};

// ── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  fontSize: 14,
  color: "var(--plum)",
  backgroundColor: "var(--surface)",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mauve)",
  marginBottom: 6,
};
const primaryBtn = {
  padding: "9px 18px",
  borderRadius: 9999,
  backgroundColor: "var(--rose-dust)",
  color: "white",
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};
const secondaryBtn = {
  ...primaryBtn,
  backgroundColor: "var(--surface)",
  color: "var(--rose-dust)",
  border: "1.5px solid var(--border)",
};

// ── Nav sidebar ──────────────────────────────────────────────────────────────
function SettingsSidebar({ active, onSelect }) {
  return (
    <nav
      aria-label="Settings sections"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 8,
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 90,
      }}
    >
      {SECTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              marginBottom: 2,
              backgroundColor: isActive ? "var(--plum)" : "transparent",
              color: isActive ? "var(--ivory)" : "var(--plum)",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "left",
            }}
          >
            <Icon className="w-4 h-4" />
            <span style={{ flex: 1 }}>{label}</span>
            {!isActive && <ChevronRight className="w-3.5 h-3.5" style={{ opacity: 0.4 }} />}
          </button>
        );
      })}
    </nav>
  );
}

// ── Account section ──────────────────────────────────────────────────────────
function AccountSection({ user, profile, onProfileChange }) {
  const [form, setForm] = useState({
    display_name:   profile?.display_name || "",
    birthday:       profile?.birthday || "",
    location_city:  profile?.location_city || "",
    bio:            profile?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    setForm({
      display_name:   profile?.display_name || "",
      birthday:       profile?.birthday || "",
      location_city:  profile?.location_city || "",
      bio:            profile?.bio || "",
    });
  }, [profile?.id]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...form };
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
    onProfileChange({ ...(profile || {}), ...updated, ...payload });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SettingsCard
      title="Account"
      description="Your basic profile information."
      footer={
        <>
          {saved && (
            <span style={{ fontSize: 12, color: "#059669", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button onClick={save} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle} htmlFor="st-display">Display name</label>
          <input
            id="st-display"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder="How should we call you?"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="st-email">Email (read-only)</label>
          <input
            id="st-email"
            value={user?.email || ""}
            readOnly
            style={{ ...inputStyle, backgroundColor: "var(--surface)", color: "var(--mauve)", cursor: "not-allowed" }}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="st-bday">Birthday</label>
          <input
            id="st-bday"
            type="date"
            value={form.birthday}
            onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="st-city">Location</label>
          <input
            id="st-city"
            value={form.location_city}
            onChange={(e) => setForm((f) => ({ ...f, location_city: e.target.value }))}
            placeholder="City"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="st-bio">Bio</label>
          <textarea
            id="st-bio"
            value={form.bio}
            onChange={(e) => e.target.value.length <= 200 && setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            placeholder="A short bio (max 200 chars)"
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <p style={{ fontSize: 11, color: "var(--mauve)", textAlign: "right", marginTop: 4 }}>
            {form.bio.length}/200
          </p>
        </div>
      </div>
    </SettingsCard>
  );
}

// ── Notifications section ────────────────────────────────────────────────────
function NotificationsSection({ user, profile, onProfileChange }) {
  const existing = profile?.notification_preferences || {};
  const [prefs, setPrefs] = useState({ ...DEFAULT_NOTIFS, ...existing });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    setPrefs({ ...DEFAULT_NOTIFS, ...(profile?.notification_preferences || {}) });
  }, [profile?.id]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { notification_preferences: prefs };
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
    onProfileChange({ ...(profile || {}), ...updated, notification_preferences: prefs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggles = [
    ["daily_checkin_reminder",     "Daily check-in reminder",   "A gentle ping each morning to log how you're feeling."],
    ["cycle_prediction_alerts",    "Cycle prediction alerts",   "Heads-up before your period or fertile window."],
    ["educational_content_weekly", "Weekly educational content", "New articles and programs matched to your phase."],
    ["community_replies",          "Community replies",         "Get notified when someone replies to your posts."],
    ["marketing_emails",           "Marketing emails",          "Occasional product news and offers."],
  ];

  return (
    <SettingsCard
      title="Notifications"
      description="Choose what you want to hear from us."
      footer={
        <>
          {saved && (
            <span style={{ fontSize: 12, color: "#059669", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button onClick={save} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {toggles.map(([key, label, desc]) => (
          <SettingsToggle
            key={key}
            label={label}
            description={desc}
            checked={prefs[key] ?? DEFAULT_NOTIFS[key]}
            onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
          />
        ))}
      </div>
    </SettingsCard>
  );
}

// ── Privacy section ──────────────────────────────────────────────────────────
// Sprint C C2 + C4 — consent settings card and real cascade-deletion
// component plug into this section directly.
import ConsentSettingsCard from "@/components/compliance/ConsentSettingsCard";
import AccountDeletionCard from "@/components/compliance/AccountDeletionCard";
import DataExportCard from "@/components/DataExportCard";
import RemindersCard from "@/components/RemindersCard";
import AnalyticsConsentCard from "@/components/compliance/AnalyticsConsentCard";

function PrivacySection({ user, profile, onProfileChange, onDownloadData }) {
  const [prefs, setPrefs] = useState({
    profile_is_public:               !!profile?.profile_is_public,
    allow_anonymous_community_posts: profile?.allow_anonymous_community_posts ?? true,
    show_in_circle_finder:           !!profile?.show_in_circle_finder,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    setPrefs({
      profile_is_public:               !!profile?.profile_is_public,
      allow_anonymous_community_posts: profile?.allow_anonymous_community_posts ?? true,
      show_in_circle_finder:           !!profile?.show_in_circle_finder,
    });
  }, [profile?.id]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    let updated;
    if (profile?.id) {
      updated = await base44.entities.UserProfile.update(profile.id, prefs);
    } else {
      updated = await base44.entities.UserProfile.create({
        user_id: user.id,
        user_email: user.email,
        ...prefs,
      });
    }
    onProfileChange({ ...(profile || {}), ...updated, ...prefs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SettingsCard
        title="Privacy"
        description="Control what others can see and how your data is used."
        footer={
          <>
            {saved && (
              <span style={{ fontSize: 12, color: "#059669", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button onClick={save} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SettingsToggle
            label="Public profile"
            description="Allow other members to see your display name and bio."
            checked={prefs.profile_is_public}
            onChange={(v) => setPrefs((p) => ({ ...p, profile_is_public: v }))}
          />
          <SettingsToggle
            label="Anonymous community posts"
            description="Keep your name hidden when you post anonymously."
            checked={prefs.allow_anonymous_community_posts}
            onChange={(v) => setPrefs((p) => ({ ...p, allow_anonymous_community_posts: v }))}
          />
          <SettingsToggle
            label="Show in Circle Finder"
            description="Appear as a match suggestion for support circles."
            checked={prefs.show_in_circle_finder}
            onChange={(v) => setPrefs((p) => ({ ...p, show_in_circle_finder: v }))}
          />
        </div>
      </SettingsCard>

      {/* Sprint 12 batch 1 — analytics opt-out + privacy contact line. */}
      <AnalyticsConsentCard user={user} profile={profile} onProfileChange={onProfileChange} />

      {/* Sprint C C2 — six GDPR consent toggles, persisted to UserProfile. */}
      <ConsentSettingsCard user={user} profile={profile} onChange={onProfileChange} />

      {/* V3 sprint Task 7 — notification preferences + scheduling. */}
      <RemindersCard user={user} profile={profile} onProfileChange={onProfileChange} />

      {/* V3 sprint Task 5 — full GDPR data export (replaces legacy single-
          button download). Emits a JSON + an HTML summary in one click. */}
      <DataExportCard user={user} />

      {/* Sprint C C4 — real cascade-deletion: type DELETE, removes every
          personal-data row, deletes UserProfile, signs out, redirects. */}
      <AccountDeletionCard user={user} profile={profile} />
    </>
  );
}

// ── Data section ─────────────────────────────────────────────────────────────
function DataSection({ user, profile }) {
  const [busy, setBusy] = useState(null);

  const exportJson = async () => {
    if (!user) return;
    setBusy("json");
    const [cycles, dailyCheckins, symptomLogs, habitLogs, medLogs] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: user.id }).catch(() => []),
      base44.entities.DailyCheckins.filter({ user_id: user.id }).catch(() => []),
      base44.entities.SymptomLogs.filter({ user_id: user.id }).catch(() => []),
      base44.entities.HabitLogs.filter({ user_id: user.id }).catch(() => []),
      base44.entities.MedicationLogs.filter({ user_id: user.id }).catch(() => []),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      app_version: APP_VERSION,
      user: {
        id:    user.id,
        email: user.email,
        display_name: profile?.display_name || null,
      },
      profile: profile || null,
      cycles,
      daily_checkins: dailyCheckins,
      symptom_logs:   symptomLogs,
      habit_logs:     habitLogs,
      medication_logs: medLogs,
      completed_sessions: profile?.completed_sessions || [],
      favorite_sessions:  profile?.favorite_sessions  || [],
    };

    downloadBlob(
      JSON.stringify(payload, null, 2),
      `femwell-data-${todayStamp()}.json`,
      "application/json",
    );
    setBusy(null);
  };

  const exportCsv = async () => {
    if (!user) return;
    setBusy("csv");
    const [cycles, checkins, symptomLogs] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: user.id }).catch(() => []),
      base44.entities.DailyCheckins.filter({ user_id: user.id }).catch(() => []),
      base44.entities.SymptomLogs.filter({ user_id: user.id }).catch(() => []),
    ]);

    const recentCheckins  = withinLastMonths(checkins, 12, "date");
    const recentCycles    = withinLastMonths(cycles, 12, "date");
    const recentSymptoms  = withinLastMonths(symptomLogs, 12, "date");

    // Build an index: date -> { flow, mood, energy, symptoms[] }
    const byDate = {};
    const upsert = (date) => {
      if (!byDate[date]) byDate[date] = { date, cycle_day: "", flow: "", mood: "", energy: "", symptoms: "" };
      return byDate[date];
    };

    recentCycles.forEach((c) => {
      const row = upsert(c.date);
      if (c.flow_level) row.flow = c.flow_level;
    });
    recentCheckins.forEach((c) => {
      const row = upsert(c.date);
      if (c.mood   != null) row.mood   = c.mood;
      if (c.energy != null) row.energy = c.energy;
    });
    const symptomsByDate = {};
    recentSymptoms.forEach((s) => {
      if (!symptomsByDate[s.date]) symptomsByDate[s.date] = [];
      symptomsByDate[s.date].push(s.symptom_type);
    });
    Object.entries(symptomsByDate).forEach(([date, list]) => {
      const row = upsert(date);
      row.symptoms = list.join("; ");
    });

    // Fill cycle_day
    const cycleLen = profile?.cycle_avg_length || 28;
    const lastPeriod = profile?.last_period_start_date || null;
    Object.values(byDate).forEach((r) => {
      const day = cycleDayFor(r.date, lastPeriod, cycleLen);
      if (day != null) r.cycle_day = day;
    });

    const rows = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    const csv = toCsv(rows, ["date", "cycle_day", "flow", "mood", "energy", "symptoms"]);
    downloadBlob(csv, `femwell-logs-${todayStamp()}.csv`, "text/csv");
    setBusy(null);
  };

  return (
    <SettingsCard
      title="Data"
      description="Export a complete copy of your FemWell data."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={exportJson} disabled={busy === "json"} style={{ ...primaryBtn, justifyContent: "center", width: "100%", opacity: busy === "json" ? 0.6 : 1 }}>
          <Download className="w-4 h-4" /> {busy === "json" ? "Preparing…" : "Export to JSON"}
        </button>
        <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: -2, marginBottom: 4 }}>
          Everything: profile, cycles, check-ins, symptoms, habits, meds, sessions.
        </p>

        <button onClick={exportCsv} disabled={busy === "csv"} style={{ ...secondaryBtn, justifyContent: "center", width: "100%", opacity: busy === "csv" ? 0.6 : 1 }}>
          <FileText className="w-4 h-4" /> {busy === "csv" ? "Preparing…" : "Export to CSV"}
        </button>
        <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: -2 }}>
          Last 12 months — date, cycle day, flow, mood, energy, symptoms.
        </p>
      </div>
    </SettingsCard>
  );
}

// ── About section ────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <SettingsCard title="About" description="App information and legal.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--plum)", fontWeight: 600 }}>App version</span>
          <span style={{ fontSize: 12, color: "var(--mauve)", }}>{APP_VERSION}</span>
        </div>

        <a href="/terms"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, backgroundColor: "var(--surface)", border: "1px solid var(--border)", textDecoration: "none" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", }}>Terms of Service</span>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
        </a>

        <a href="/privacy"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, backgroundColor: "var(--surface)", border: "1px solid var(--border)", textDecoration: "none" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", }}>Privacy Policy</span>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
        </a>

        <p style={{ fontSize: 12, color: "var(--mauve)", textAlign: "center", marginTop: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          Made with <Heart className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)", fill: "var(--rose-dust)" }} /> for women everywhere
        </p>
      </div>
    </SettingsCard>
  );
}

// ── Main Settings page ───────────────────────────────────────────────────────
export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initial = new URLSearchParams(window.location.search).get("section");
  const [active, setActive] = useState(
    SECTIONS.some((s) => s.id === initial) ? initial : "account"
  );

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
        setProfile(profiles[0] || null);
      }
      setLoading(false);
    })();
  }, []);

  // "Download My Data" from Privacy section delegates to Data.exportJson logic,
  // but we implement it inline here so Privacy doesn't need Data as a sibling.
  const downloadFromPrivacy = async () => {
    if (!user) return;
    const [cycles, dailyCheckins, symptomLogs, habitLogs, medLogs] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: user.id }).catch(() => []),
      base44.entities.DailyCheckins.filter({ user_id: user.id }).catch(() => []),
      base44.entities.SymptomLogs.filter({ user_id: user.id }).catch(() => []),
      base44.entities.HabitLogs.filter({ user_id: user.id }).catch(() => []),
      base44.entities.MedicationLogs.filter({ user_id: user.id }).catch(() => []),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      app_version: APP_VERSION,
      user: { id: user.id, email: user.email, display_name: profile?.display_name || null },
      profile: profile || null,
      cycles, daily_checkins: dailyCheckins, symptom_logs: symptomLogs,
      habit_logs: habitLogs, medication_logs: medLogs,
      completed_sessions: profile?.completed_sessions || [],
      favorite_sessions:  profile?.favorite_sessions  || [],
    };
    downloadBlob(JSON.stringify(payload, null, 2), `femwell-data-${todayStamp()}.json`, "application/json");
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto">
          <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--rose-dust)", }}>
            Your account
          </p>
          <h1 className="fw-display" style={{ marginTop: 2 }}>
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--rose-dust)" }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-4">
            {/* Mobile section selector */}
            <div className="md:hidden" style={{ marginBottom: 8 }}>
              <SettingsSidebar active={active} onSelect={setActive} />
            </div>
            <div className="hidden md:block">
              <SettingsSidebar active={active} onSelect={setActive} />
            </div>

            {/* Content pane */}
            <div>
              {active === "account" && (
                <AccountSection user={user} profile={profile} onProfileChange={setProfile} />
              )}
              {active === "notifications" && (
                <NotificationsSection user={user} profile={profile} onProfileChange={setProfile} />
              )}
              {active === "privacy" && (
                <PrivacySection
                  user={user}
                  profile={profile}
                  onProfileChange={setProfile}
                  onDownloadData={downloadFromPrivacy}
                />
              )}
              {active === "data" && (
                <DataSection user={user} profile={profile} />
              )}
              {active === "about" && <AboutSection />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}