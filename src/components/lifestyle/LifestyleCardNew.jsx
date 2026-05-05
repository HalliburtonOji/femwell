import { Heart, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Minimal card used by For-you bento, Watch grid, and Saved list.
// Variants: "tile" (default), "wide" (16:9 video), "row" (saved list)
export default function LifestyleCardNew({ item, profile, onSave, onHide, onOpen, variant = "tile" }) {
  const saved = (profile?.saved_item_ids || []).includes(item.id);

  const handleClick = () => {
    onOpen?.(item);
    window.location.href = createPageUrl(`LifestyleDetail?id=${item.id}`);
  };

  const stop = (e) => e.stopPropagation();
  const handleSave = (e) => { stop(e); onSave?.(item); };
  const handleHide = (e) => { stop(e); onHide?.(item); };

  if (variant === "row") {
    return (
      <div
        onClick={handleClick}
        style={{
          display: "flex", gap: 12, padding: 12,
          backgroundColor: "var(--card, #fff)",
          border: "1px solid var(--ink-line, rgba(74,42,58,0.14))",
          borderRadius: 18, cursor: "pointer",
          boxShadow: "0 8px 22px -12px rgba(74,42,58,0.18)",
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", backgroundColor: "var(--cream, #f7f0e6)", flexShrink: 0 }}>
          {item.image_url && <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--plum-mute, #8a7768)", fontFamily: "Inter, sans-serif", margin: 0, marginBottom: 4 }}>{item.category}</p>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--plum-deep, #2b1e16)", fontFamily: "Fraunces, serif", lineHeight: 1.3, margin: 0, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.title}
          </p>
          {item.summary && (
            <p style={{ fontSize: 12, color: "var(--plum-mute, #8a7768)", fontFamily: "Inter, sans-serif", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.summary}
            </p>
          )}
        </div>
        <button onClick={handleSave} aria-label={saved ? "Unsave" : "Save"} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--rose, #D45E52)", flexShrink: 0 }}>
          <Heart size={18} fill={saved ? "var(--rose, #D45E52)" : "none"} />
        </button>
      </div>
    );
  }

  const isWide = variant === "wide";
  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: "var(--card, #fff)",
        border: "1px solid var(--ink-line, rgba(74,42,58,0.14))",
        borderRadius: 18, overflow: "hidden", cursor: "pointer",
        boxShadow: "0 8px 22px -12px rgba(74,42,58,0.18)",
        display: "flex", flexDirection: "column", height: "100%",
        transition: "box-shadow 0.18s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 20px 40px -16px rgba(74,42,58,0.28)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 22px -12px rgba(74,42,58,0.18)"}
    >
      <div style={{ position: "relative", aspectRatio: isWide ? "16 / 9" : "4 / 3", backgroundColor: "var(--cream, #f7f0e6)", overflow: "hidden", flexShrink: 0 }}>
        {item.image_url && <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        {item.duration_label && (
          <span style={{ position: "absolute", right: 8, bottom: 8, padding: "2px 8px", borderRadius: 99, backgroundColor: "rgba(43,30,22,0.78)", color: "white", fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
            {item.duration_label}
          </span>
        )}
        <button onClick={handleSave} aria-label={saved ? "Unsave" : "Save"}
          style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 99, border: "none", backgroundColor: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--rose, #D45E52)" }}>
          <Heart size={16} fill={saved ? "var(--rose, #D45E52)" : "none"} />
        </button>
      </div>
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--plum-mute, #8a7768)", fontFamily: "Inter, sans-serif", margin: 0, marginBottom: 4 }}>{item.category}</p>
        <p style={{ fontSize: 16, fontWeight: 500, color: "var(--plum-deep, #2b1e16)", fontFamily: "Fraunces, serif", lineHeight: 1.3, margin: 0, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </p>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--plum-mute, #8a7768)", fontFamily: "Inter, sans-serif" }}>{item.source_name || "FemWell"}</span>
          {onHide && (
            <button onClick={handleHide} aria-label="Hide" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--plum-mute, #8a7768)" }}>
              <EyeOff size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}