import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check, Star } from "lucide-react";

const DIFFICULTY_COLORS = {
  Beginner:     { color: "#059669", bg: "#D1FAE5" },
  Intermediate: { color: "#B45309", bg: "#FEF3C7" },
  Advanced:     { color: "#DC2626", bg: "#FEE2E2" },
};

export default function SessionDetailDialog({ session, profile, user, onClose, onProfileChange }) {
  const [busy, setBusy] = useState(null);

  if (!session) return null;

  const completed = Array.isArray(profile?.completed_sessions)
    && profile.completed_sessions.includes(session.id);
  const favorited = Array.isArray(profile?.favorite_sessions)
    && profile.favorite_sessions.includes(session.id);

  const diff = DIFFICULTY_COLORS[session.difficulty] || DIFFICULTY_COLORS.Beginner;

  const ensureProfile = async () => {
    if (profile?.id) return profile;
    if (!user) return null;
    const created = await base44.entities.UserProfile.create({
      user_id: user.id,
      user_email: user.email,
      completed_sessions: [],
      favorite_sessions: [],
      completed_sessions_count: 0,
    });
    return created;
  };

  const markComplete = async () => {
    setBusy("complete");
    const p = await ensureProfile();
    if (!p) { setBusy(null); return; }
    const current = Array.isArray(p.completed_sessions) ? p.completed_sessions : [];
    if (current.includes(session.id)) { setBusy(null); return; }
    const next = [...current, session.id];
    const updated = await base44.entities.UserProfile.update(p.id, {
      completed_sessions: next,
      completed_sessions_count: (p.completed_sessions_count || 0) + 1,
    });
    onProfileChange && onProfileChange({ ...p, ...updated, completed_sessions: next, completed_sessions_count: (p.completed_sessions_count || 0) + 1 });
    setBusy(null);
  };

  const toggleFavorite = async () => {
    setBusy("fav");
    const p = await ensureProfile();
    if (!p) { setBusy(null); return; }
    const current = Array.isArray(p.favorite_sessions) ? p.favorite_sessions : [];
    const next = current.includes(session.id)
      ? current.filter(x => x !== session.id)
      : [...current, session.id];
    await base44.entities.UserProfile.update(p.id, { favorite_sessions: next });
    onProfileChange && onProfileChange({ ...p, favorite_sessions: next });
    setBusy(null);
  };

  const benefits = Array.isArray(session.benefits) ? session.benefits : [];
  const equipment = Array.isArray(session.equipment_needed) ? session.equipment_needed : [];

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(5px)" }}
      />
      <div
        role="dialog"
        aria-label={session.title}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: "white", borderRadius: "24px 24px 0 0",
          padding: "18px 20px 36px", maxHeight: "92vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.14em", color: "#E11D48",
            fontFamily: "'Inter', sans-serif",
          }}>
            Start a session
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "#FFF1F2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X className="w-4 h-4" style={{ color: "#E11D48" }} />
          </button>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 700,
          color: "var(--plum)", lineHeight: 1.25,
          marginBottom: 8,
        }}>
          {session.title}
        </h2>

        {/* Meta chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, backgroundColor: "#FFF1F2", color: "#E11D48", fontFamily: "'Inter', sans-serif" }}>
            {session.duration_minutes || 0} min
          </span>
          {session.difficulty && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, backgroundColor: diff.bg, color: diff.color, fontFamily: "'Inter', sans-serif" }}>
              {session.difficulty}
            </span>
          )}
          {session.category && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, backgroundColor: "#FEF3C7", color: "#B45309", fontFamily: "'Inter', sans-serif" }}>
              {session.category}
            </span>
          )}
        </div>

        {/* Description */}
        {session.description && (
          <p style={{ fontSize: 14, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 16 }}>
            {session.description}
          </p>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
              Benefits
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {benefits.map((b, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 4 }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment */}
        {equipment.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
              Equipment needed
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {equipment.map((e, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 9999, backgroundColor: "#FEF3C7", color: "#B45309", fontFamily: "'Inter', sans-serif" }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={markComplete}
            disabled={completed || busy === "complete"}
            style={{
              flex: 1, height: 48, borderRadius: 9999,
              backgroundColor: completed ? "#059669" : "#E11D48",
              color: "white", fontSize: 13, fontWeight: 700,
              border: "none", cursor: completed ? "default" : "pointer",
              fontFamily: "'Inter', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              opacity: busy === "complete" ? 0.7 : 1,
            }}
          >
            <Check className="w-4 h-4" />
            {completed ? "Completed" : (busy === "complete" ? "Saving…" : "Mark Complete")}
          </button>
          <button
            onClick={toggleFavorite}
            disabled={busy === "fav"}
            style={{
              flex: 1, height: 48, borderRadius: 9999,
              backgroundColor: favorited ? "#FEF3C7" : "white",
              color: favorited ? "#B45309" : "var(--plum)",
              fontSize: 13, fontWeight: 700,
              border: "1.5px solid " + (favorited ? "#F59E0B" : "var(--border)"),
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Star className="w-4 h-4" style={{ fill: favorited ? "#F59E0B" : "none" }} />
            {favorited ? "Favorited" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </>
  );
}