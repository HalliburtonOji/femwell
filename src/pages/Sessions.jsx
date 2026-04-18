import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, Play, Star } from "lucide-react";
import SessionDetailDialog from "../components/sessions/SessionDetailDialog";

const CATEGORIES   = ["All", "Yoga", "Meditation", "Pilates", "Cardio"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const DURATIONS = [
  { id: "all",  label: "Any duration", test: () => true },
  { id: "u10",  label: "<10 min",      test: d => d < 10 },
  { id: "10_20", label: "10–20 min",   test: d => d >= 10 && d <= 20 },
  { id: "20_30", label: "20–30 min",   test: d => d > 20 && d <= 30 },
  { id: "30p",   label: "30+ min",     test: d => d > 30 },
];

const DIFF_META = {
  Beginner:     { color: "#059669", bg: "#D1FAE5" },
  Intermediate: { color: "#B45309", bg: "#FEF3C7" },
  Advanced:     { color: "#DC2626", bg: "#FEE2E2" },
};

export default function Sessions() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const [duration, setDuration] = useState("all");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      const [all, profiles] = await Promise.all([
        base44.entities.WellnessSessions.list("-created_date", 100).catch(() => []),
        u ? base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []) : Promise.resolve([]),
      ]);
      setSessions(all);
      setProfile(profiles[0] || null);
      setLoading(false);
    })();
  }, []);

  const durationDef = DURATIONS.find(d => d.id === duration) || DURATIONS[0];

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (category !== "All" && s.category !== category) return false;
      if (difficulty !== "All" && s.difficulty !== difficulty) return false;
      if (!durationDef.test(s.duration_minutes || 0)) return false;
      return true;
    });
  }, [sessions, category, difficulty, durationDef]);

  const isFavorited = (id) =>
    Array.isArray(profile?.favorite_sessions) && profile.favorite_sessions.includes(id);
  const isCompleted = (id) =>
    Array.isArray(profile?.completed_sessions) && profile.completed_sessions.includes(id);

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`.sess-scroll::-webkit-scrollbar{display:none}.sess-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto">
          <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#E11D48", fontFamily: "'Inter', sans-serif" }}>
            Movement & calm
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em", marginTop: 2, marginBottom: 10 }}>
            Sessions
          </h1>

          {/* Filter bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Duration dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label htmlFor="sess-duration" style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                Duration
              </label>
              <select
                id="sess-duration"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                style={{
                  flex: 1, padding: "7px 10px", borderRadius: 10,
                  border: "1.5px solid #FECACA", backgroundColor: "white",
                  fontSize: 12, fontWeight: 600, color: "var(--plum)",
                  fontFamily: "'Inter', sans-serif", outline: "none",
                }}
              >
                {DURATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>

            {/* Category pills */}
            <div className="sess-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {CATEGORIES.map(cat => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      flexShrink: 0, padding: "6px 14px", borderRadius: 9999,
                      fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                      fontFamily: "'Inter', sans-serif",
                      backgroundColor: active ? "#E11D48" : "#FFF1F2",
                      color: active ? "white" : "#9F1239",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Difficulty pills */}
            <div className="sess-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {DIFFICULTIES.map(diff => {
                const active = difficulty === diff;
                const meta = DIFF_META[diff];
                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    style={{
                      flexShrink: 0, padding: "5px 12px", borderRadius: 9999,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      border: "1.5px solid " + (active ? (meta?.color || "var(--plum)") : "var(--border)"),
                      backgroundColor: active ? (meta?.bg || "var(--plum)") : "transparent",
                      color: active ? (meta?.color || "white") : "var(--mauve)",
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            {/* Result count */}
            <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              {loading ? "Loading…" : `${filtered.length} session${filtered.length === 1 ? "" : "s"} found`}
            </p>
          </div>
        </div>
      </div>

      {/* Sessions grid */}
      <div className="max-w-2xl mx-auto px-4 pt-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#FECACA", borderTopColor: "#E11D48" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              No sessions match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(session => {
              const diff = DIFF_META[session.difficulty] || DIFF_META.Beginner;
              const completed = isCompleted(session.id);
              const favorited = isFavorited(session.id);
              return (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: "#FFF1F2",
                    border: "1px solid #FECACA",
                    borderRadius: 20,
                    padding: 16,
                    boxShadow: "var(--shadow-sm)",
                    display: "flex", flexDirection: "column", gap: 10,
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 16, fontWeight: 700, color: "var(--plum)",
                        lineHeight: 1.3, marginBottom: 4,
                      }}>
                        {session.title}
                      </h3>
                      {session.description && (
                        <p style={{
                          fontSize: 12, color: "var(--mauve)",
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.5,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {session.description}
                        </p>
                      )}
                    </div>
                    {favorited && (
                      <Star className="w-4 h-4" style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Meta chips */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      fontSize: 10, fontWeight: 600, padding: "3px 9px",
                      borderRadius: 9999, backgroundColor: "white",
                      color: "#E11D48", fontFamily: "'Inter', sans-serif",
                      border: "1px solid #FECACA",
                    }}>
                      <Clock className="w-3 h-3" />
                      {session.duration_minutes || 0} min
                    </span>
                    {session.difficulty && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 9px",
                        borderRadius: 9999, backgroundColor: diff.bg, color: diff.color,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {session.difficulty}
                      </span>
                    )}
                    {session.category && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 9px",
                        borderRadius: 9999, backgroundColor: "#FEF3C7", color: "#B45309",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {session.category}
                      </span>
                    )}
                    {completed && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 9px",
                        borderRadius: 9999, backgroundColor: "#D1FAE5", color: "#059669",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  {/* Start button */}
                  <button
                    onClick={() => setSelectedSession(session)}
                    style={{
                      marginTop: 4,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      height: 40, borderRadius: 9999,
                      backgroundColor: "#E11D48", color: "white",
                      fontSize: 13, fontWeight: 700, border: "none",
                      cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Start Session
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionDetailDialog
          session={selectedSession}
          profile={profile}
          user={user}
          onClose={() => setSelectedSession(null)}
          onProfileChange={setProfile}
        />
      )}
    </div>
  );
}