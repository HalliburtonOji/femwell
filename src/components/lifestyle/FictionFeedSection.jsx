import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen } from "lucide-react";

const FICTION_GENRES = ["All", "Contemporary", "Romance", "Drama", "Literary", "Thriller", "Mystery", "Fantasy", "Historical", "Romantic Suspense"];
const MATURE_GENRES = ["Romance", "Romantic Suspense"];

function getMondayWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().split("T")[0];
}

function FictionCard({ item, onRead }) {
  const genre = item.tags?.find(t => t.startsWith("genre:"))?.replace("genre:", "") || "";
  const isMature = item.tags?.includes("18+");
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {genre && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "#5B7FC4", backgroundColor: "#E8F4FF", borderRadius: 9999, padding: "2px 9px", fontFamily: "'Inter', sans-serif" }}>
            {genre}
          </span>
        )}
        {isMature && (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#C4804A", backgroundColor: "#FFF0E8", borderRadius: 9999, padding: "2px 9px", fontFamily: "'Inter', sans-serif" }}>
            18+
          </span>
        )}
        {item.duration_label && (
          <span style={{ fontSize: 10, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "2px 9px", fontFamily: "'Inter', sans-serif" }}>
            {item.duration_label}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", lineHeight: 1.35, margin: "0 0 6px" }}>
        {item.title}
      </h3>
      {item.summary && (
        <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.summary}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--mauve)", opacity: 0.6, fontFamily: "'Inter', sans-serif" }}>
          {item.author_name}
        </span>
        <button
          onClick={() => onRead?.(item)}
          style={{ fontSize: 12, fontWeight: 700, color: "white", backgroundColor: "var(--rose-dust)", border: "none", borderRadius: 9999, padding: "6px 16px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          Read
        </button>
      </div>
    </div>
  );
}

export default function FictionFeedSection({ onRead }) {
  const weekStart = getMondayWeekStart();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [personalItems, setPersonalItems] = useState([]);
  const [globalItems, setGlobalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState("All");
  const [lengthFilter, setLengthFilter] = useState("All");
  const [matureEnabled, setMatureEnabled] = useState(false);
  const [matureAllowed, setMatureAllowed] = useState(false);
  const [showMatureConfirm, setShowMatureConfirm] = useState(false);
  const ensured = useRef(false);

  const loadItems = async (userId) => {
    const allItems = await base44.entities.LifestyleItems.list("-pub_date", 500);
    const personal = allItems.filter(i =>
      i.provider === "FEMWELL_FICTION_PERSONAL" &&
      Array.isArray(i.tags) &&
      i.tags.includes(`week:${weekStart}`) &&
      i.tags.includes(`user:${userId}`)
    );
    const global = allItems.filter(i =>
      i.provider === "FEMWELL_FICTION_WEEKLY" &&
      Array.isArray(i.tags) &&
      i.tags.includes(`week:${weekStart}`)
    );
    setPersonalItems(personal);
    setGlobalItems(global);
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        const p = profiles[0] || null;
        setProfile(p);
        if (p?.allow_mature_content) {
          setMatureAllowed(true);
          setMatureEnabled(true);
        }
        await loadItems(u.id);
        setLoading(false);

        // Only auto-generate if no stories exist yet for this week — avoids indefinite spinner on re-visits.
        if (!ensured.current) {
          ensured.current = true;
          const [gItems, pItems] = await Promise.all([
            base44.entities.LifestyleItems.filter({ provider: "FEMWELL_FICTION_WEEKLY" }).catch(() => []),
            base44.entities.LifestyleItems.filter({ provider: "FEMWELL_FICTION_PERSONAL" }).catch(() => []),
          ]);
          const weekGlobal = gItems.filter(i => Array.isArray(i.tags) && i.tags.includes(`week:${weekStart}`));
          const weekPersonal = pItems.filter(i => Array.isArray(i.tags) && i.tags.includes(`week:${weekStart}`) && i.tags.includes(`user:${u.id}`));
          if (weekGlobal.length === 0) {
            try { await base44.functions.invoke("generateFemwellFiction", { mode: "weekly_global" }); } catch {}
          }
          if (weekPersonal.length === 0) {
            try { await base44.functions.invoke("generateFemwellFiction", { mode: "personal_user" }); } catch {}
          }
          await loadItems(u.id);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const handleMatureToggle = (checked) => {
    if (checked) {
      if (matureAllowed) {
        setMatureEnabled(true);
      } else {
        setShowMatureConfirm(true);
        setMatureEnabled(true);
      }
    } else {
      setMatureEnabled(false);
      setShowMatureConfirm(false);
    }
  };

  const handleAgeConfirm = async () => {
    setMatureAllowed(true);
    setShowMatureConfirm(false);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        allow_mature_content: true,
        mature_confirmed_at: new Date().toISOString(),
      });
      setProfile(prev => ({ ...prev, allow_mature_content: true }));
    }
  };

  const applyFilters = (items) => {
    return items.filter(item => {
      if (genreFilter !== "All" && !item.tags?.includes(`genre:${genreFilter}`)) return false;
      if (lengthFilter === "Short" && !item.tags?.includes("length:short")) return false;
      if (lengthFilter === "One-hour" && !item.tags?.includes("length:long")) return false;
      if (item.tags?.includes("18+") && !(matureEnabled && matureAllowed)) return false;
      return true;
    });
  };

  const filteredPersonal = applyFilters(personalItems);
  const filteredGlobal = applyFilters(globalItems);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BookOpen style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--rose-dust)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            FemWell Fiction
          </span>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
          Original stories for you
        </h2>
        <p style={{ fontSize: 13, color: "var(--mauve)", margin: 0, fontFamily: "'Inter', sans-serif" }}>
          New original fiction every week — short reads and one-hour stories, written for women.
        </p>
      </div>

      {/* Genre filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 8, scrollbarWidth: "none" }}>
        {FICTION_GENRES.map(g => (
          <button key={g} onClick={() => setGenreFilter(g)}
            style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
              backgroundColor: genreFilter === g ? "var(--plum)" : "var(--ivory-dark)",
              color: genreFilter === g ? "white" : "var(--mauve)" }}>
            {g}
          </button>
        ))}
      </div>

      {/* Length + mature filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["All", "Short", "One-hour"].map(l => (
          <button key={l} onClick={() => setLengthFilter(l)}
            style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
              border: `1.5px solid ${lengthFilter === l ? "var(--plum)" : "var(--border)"}`,
              backgroundColor: lengthFilter === l ? "var(--plum)" : "transparent",
              color: lengthFilter === l ? "white" : "var(--mauve)" }}>
            {l}
          </button>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginLeft: "auto", userSelect: "none" }}>
          <input type="checkbox" checked={matureEnabled} onChange={e => handleMatureToggle(e.target.checked)}
            style={{ width: 14, height: 14, cursor: "pointer" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Show 18+</span>
        </label>
      </div>

      {/* Age confirmation prompt */}
      {showMatureConfirm && !matureAllowed && (
        <div style={{ backgroundColor: "#FFF8F0", border: "1px solid #E8C08060", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif", margin: "0 0 8px", lineHeight: 1.5 }}>
            Mature content includes adult themes and tasteful romantic scenes. All characters are adults aged 18 or older.
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" onChange={e => e.target.checked && handleAgeConfirm()} style={{ width: 14, height: 14, cursor: "pointer" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#C4804A", fontFamily: "'Inter', sans-serif" }}>
              I confirm I am 18 or older
            </span>
          </label>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ padding: "32px 0", textAlign: "center" }}>
          <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", margin: 0 }}>Loading your stories...</p>
        </div>
      ) : (
        <>
          {filteredPersonal.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>
                For You
              </p>
              {filteredPersonal.map(item => <FictionCard key={item.id} item={item} onRead={onRead} />)}
            </div>
          )}

          {filteredGlobal.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>
                This Week
              </p>
              {filteredGlobal.map(item => <FictionCard key={item.id} item={item} onRead={onRead} />)}
            </div>
          )}

          {filteredPersonal.length === 0 && filteredGlobal.length === 0 && (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {genreFilter !== "All" || lengthFilter !== "All"
                  ? "No stories match your current filters."
                  : "Stories are being generated. Check back shortly."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}