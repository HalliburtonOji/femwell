import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LifestyleCardNew from "../LifestyleCardNew";
import { rankKey, logInteraction } from "../lifestyleHelpers";

export default function ForYouTab({ profile, setProfile, onSave, onHide, currentPhase }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 200).catch(() => []);
      setItems(all);
      setLoading(false);
    })();
  }, []);

  const hidden = new Set(profile?.hidden_item_ids || []);
  const blockedCats = new Set(profile?.blocked_categories || []);
  const followedTopics = profile?.followed_topics || [];

  const visible = useMemo(() => {
    return items
      .filter(i => !hidden.has(i.id) && !blockedCats.has(i.category))
      .map(i => ({ ...i, _rank: rankKey(i, profile, currentPhase) }))
      .sort((a, b) => b._rank - a._rank);
  }, [items, profile, currentPhase]);

  // Hero = top editor pick
  const hero = useMemo(() => visible.find(i => i.is_editor_pick) || visible[0], [visible]);

  // Saved last 3
  const savedIds = profile?.saved_item_ids || [];
  const savedRecent = savedIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean)
    .slice(0, 3);

  // Try this
  const tryThisItems = useMemo(() => {
    return visible.filter(i => i.try_this_content_key).slice(0, 4);
  }, [visible]);

  // Bento
  const bento = useMemo(() => {
    let list = visible.filter(i => i !== hero);
    if (activeChip) list = list.filter(i => i.category === activeChip);
    return list.slice(0, 24);
  }, [visible, hero, activeChip]);

  const handleChip = async (cat) => {
    setActiveChip(activeChip === cat ? null : cat);
    if (profile && profile.id) {
      const weights = { ...(profile.category_weights || {}) };
      weights[cat] = (weights[cat] || 0) + 0.05;
      const updated = await base44.entities.LifestyleProfile.update(profile.id, { category_weights: weights }).catch(() => null);
      if (updated) setProfile(p => ({ ...p, ...updated, category_weights: weights }));
    }
  };

  const handleHero = () => { if (hero) logInteraction(profile, hero, "open"); };
  const handleTryThis = (item) => { logInteraction(profile, item, "try_this"); };

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>Loading…</div>;
  if (!visible.length) return <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>Nothing here yet.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Editorial hero */}
      {hero && (
        <Link
          to={`/LifestyleDetail?id=${hero.id}`}
          onClick={handleHero}
          style={{
            display: "block", textDecoration: "none",
            backgroundColor: "var(--cream)", borderRadius: 18, overflow: "hidden",
            border: "1px solid var(--ink-line)", position: "relative",
          }}
        >
          {hero.image_url && (
            <div style={{ aspectRatio: "16 / 9", overflow: "hidden", backgroundColor: "var(--cream)" }}>
              <img src={hero.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(hero); }}
            aria-label="Save"
            style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 99, border: "none", backgroundColor: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--rose)" }}
          >
            <Heart size={16} fill={(profile?.saved_item_ids || []).includes(hero.id) ? "var(--rose)" : "none"} />
          </button>
          <div style={{ padding: "20px 22px 22px" }}>
            {hero.category && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--plum-mute)", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {hero.category}
              </span>
            )}
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 32, color: "var(--plum-deep)", lineHeight: 1.15, margin: "6px 0 8px" }}>
              {hero.title}
            </h2>
            {hero.summary && (
              <p style={{ fontSize: 14, color: "var(--plum-mute)", fontFamily: "Inter, sans-serif", lineHeight: 1.55, margin: 0 }}>
                {hero.summary}
              </p>
            )}
          </div>
        </Link>
      )}

      {/* Followed-topic chips */}
      {followedTopics.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }} className="fw-no-scrollbar">
          {followedTopics.map(topic => {
            const active = activeChip === topic;
            return (
              <button
                key={topic}
                onClick={() => handleChip(topic)}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 99,
                  border: "1px solid var(--ink-line)",
                  backgroundColor: active ? "var(--cream)" : "transparent",
                  color: "var(--plum-deep)",
                  fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 14,
                  cursor: "pointer", whiteSpace: "nowrap",
                  borderBottom: active ? "2px solid var(--rose)" : "1px solid var(--ink-line)",
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}

      {/* Saved last 3 rail */}
      {savedRecent.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 18, color: "var(--plum-deep)", margin: 0 }}>Saved · last 3</h3>
            <Link to="/Lifestyle?tab=saved" style={{ fontSize: 12, color: "var(--rose)", fontFamily: "Inter, sans-serif", textDecoration: "none", fontWeight: 500 }}>
              See all →
            </Link>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" }} className="fw-no-scrollbar">
            {savedRecent.map(item => (
              <Link key={item.id} to={`/LifestyleDetail?id=${item.id}`}
                style={{ flexShrink: 0, width: 140, height: 180, borderRadius: 14, overflow: "hidden", backgroundColor: "var(--cream)", border: "1px solid var(--ink-line)", display: "block" }}>
                {item.image_url
                  ? <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--plum-mute)", fontSize: 11, fontFamily: "Inter", padding: 8, textAlign: "center" }}>{item.title}</div>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Try this */}
      {tryThisItems.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 400, fontSize: 22, color: "var(--plum-deep)", margin: "0 0 12px" }}>Try this.</h3>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" }} className="fw-no-scrollbar">
            {tryThisItems.map(item => (
              <Link key={item.id} to={`/LifestyleDetail?id=${item.id}`} onClick={() => handleTryThis(item)}
                style={{ flexShrink: 0, width: 220, height: 140, borderRadius: 14, overflow: "hidden", backgroundColor: "var(--cream)", border: "1px solid var(--ink-line)", display: "block", position: "relative", textDecoration: "none" }}>
                {item.image_url && <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(43,30,22,0.7), transparent 60%)", padding: 12, display: "flex", alignItems: "flex-end" }}>
                  <p style={{ color: "white", fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 14, margin: 0, lineHeight: 1.3 }}>
                    {item.try_this_label || item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bento */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {bento.map(item => (
          <LifestyleCardNew
            key={item.id}
            item={item}
            profile={profile}
            onSave={onSave}
            onHide={onHide}
            onOpen={(it) => logInteraction(profile, it, "open")}
            variant={item.media_type === "VIDEO" || item.media_type === "TIKTOK" ? "wide" : "tile"}
          />
        ))}
      </div>
    </div>
  );
}