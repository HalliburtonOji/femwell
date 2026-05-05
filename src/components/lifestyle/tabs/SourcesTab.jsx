import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toggleFollowSource } from "../lifestyleHelpers";

export default function SourcesTab({ profile, setProfile }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await base44.entities.LifestyleSources.filter({ is_active: true }, "name", 500).catch(() => []);
      setSources(all);
      setLoading(false);
    })();
  }, []);

  const followed = profile?.followed_sources || [];

  const grouped = useMemo(() => {
    if (sources.length <= 12) return null;
    const map = {};
    sources.forEach(s => {
      const cat = s.category || "Lifestyle";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [sources]);

  const handleToggle = async (sourceId) => {
    const next = await toggleFollowSource(profile, sourceId);
    setProfile(next);
  };

  const handleResetSuggested = async () => {
    if (!profile?.id) return;
    const suggested = sources.filter(s => (s.priority || 0) >= 7).map(s => s.id);
    const updated = await base44.entities.LifestyleProfile.update(profile.id, { followed_sources: suggested });
    setProfile(p => ({ ...p, ...updated, followed_sources: suggested }));
  };

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>Loading…</div>;

  const renderRow = (s) => {
    const isFollowed = followed.includes(s.id);
    return (
      <div key={s.id} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", backgroundColor: "var(--card)",
        border: "1px solid var(--ink-line)", borderRadius: 14,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", backgroundColor: "var(--cream)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {s.logo_url
            ? <img src={s.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "var(--plum-deep)" }}>{(s.name || "?").charAt(0)}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 16, color: "var(--plum-deep)", margin: 0, marginBottom: 2 }}>{s.name}</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "var(--plum-mute)", margin: 0 }}>{s.category}</p>
        </div>
        <button
          onClick={() => handleToggle(s.id)}
          style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            border: "1px solid var(--ink-line)",
            backgroundColor: isFollowed ? "var(--plum-deep)" : "transparent",
            color: isFollowed ? "white" : "var(--plum-deep)",
            cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}
        >
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "var(--cream)", borderRadius: 14, marginBottom: 16 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "var(--plum-deep)", margin: 0 }}>
          Following <strong>{followed.length}</strong> of {sources.length} sources
        </p>
        <button onClick={handleResetSuggested} style={{ background: "none", border: "none", color: "var(--rose)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
          Reset to suggested
        </button>
      </div>

      {grouped ? (
        Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "var(--plum-deep)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>{cat}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map(renderRow)}
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sources.map(renderRow)}
        </div>
      )}
    </div>
  );
}