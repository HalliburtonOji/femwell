import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import LifestyleCardNew from "../LifestyleCardNew";
import { VIDEO_MEDIA_TYPES, logInteraction } from "../lifestyleHelpers";

export default function WatchTab({ profile, onSave, onHide }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 200).catch(() => []);
      const vids = all.filter(i => VIDEO_MEDIA_TYPES.includes(i.media_type));
      setItems(vids);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>Loading…</div>;
  if (!items.length) {
    return (
      <div style={{ backgroundColor: "var(--cream)", borderRadius: 18, padding: 32, textAlign: "center", border: "1px solid var(--ink-line)" }}>
        <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "var(--plum-deep)", margin: 0, marginBottom: 6 }}>Nothing in your watch list yet</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "var(--plum-mute)", margin: 0 }}>Follow a few sources or try a category to start.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
      {items.map(item => (
        <LifestyleCardNew
          key={item.id}
          item={item}
          profile={profile}
          onSave={onSave}
          onHide={onHide}
          onOpen={(it) => logInteraction(profile, it, "open")}
          variant="wide"
        />
      ))}
    </div>
  );
}