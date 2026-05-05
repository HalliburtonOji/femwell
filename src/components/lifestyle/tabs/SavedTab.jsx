import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import LifestyleCardNew from "../LifestyleCardNew";

const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "ARTICLE", label: "Articles", match: (i) => i.content_type === "ARTICLE" },
  { id: "VIDEO", label: "Videos", match: (i) => ["VIDEO","TIKTOK","INSTAGRAM","CLIP"].includes(i.media_type) },
  { id: "STORY", label: "Stories", match: (i) => i.content_type === "STORY" || i.content_type === "FICTION" },
];

export default function SavedTab({ profile, onSave, onHide }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const ids = profile?.saved_item_ids || [];
      if (!ids.length) { setItems([]); setLoading(false); return; }
      const all = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500).catch(() => []);
      const ordered = ids
        .map(id => all.find(i => i.id === id))
        .filter(Boolean);
      setItems(ordered);
      setLoading(false);
    })();
  }, [profile?.saved_item_ids]);

  const filterFn = useMemo(() => FILTERS.find(f => f.id === filter)?.match || (() => true), [filter]);
  const visible = items.filter(filterFn);

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, scrollbarWidth: "none" }} className="fw-no-scrollbar">
        {FILTERS.map(f => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0, padding: "7px 16px", borderRadius: 99,
                border: "1px solid var(--ink-line)",
                backgroundColor: active ? "var(--cream)" : "transparent",
                color: "var(--plum-deep)",
                fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 14,
                cursor: "pointer",
                borderBottom: active ? "2px solid var(--rose)" : "1px solid var(--ink-line)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {!visible.length ? (
        <div style={{ backgroundColor: "var(--cream)", borderRadius: 18, padding: 32, textAlign: "center", border: "1px solid var(--ink-line)" }}>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "var(--plum-deep)", margin: 0, marginBottom: 6 }}>Your saved corner is empty</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "var(--plum-mute)", margin: 0 }}>Tap the heart on any card and it'll land here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map(item => (
            <LifestyleCardNew
              key={item.id}
              item={item}
              profile={profile}
              onSave={onSave}
              onHide={onHide}
              variant="row"
            />
          ))}
        </div>
      )}
    </div>
  );
}