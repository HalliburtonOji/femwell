import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { T } from "@/components/journal/Editorial";
import { CardFrame } from "@/components/brand/flora";

const FALLBACK_GRADIENT = "linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)";

export default function TryThisRail({ items, contentByKey, userId }) {
  const navigate = useNavigate();
  if (!items?.length) return null;

  const handleTap = async (item) => {
    if (userId) {
      base44.entities.LifestyleInteractions.create({
        user_id: userId,
        item_id: item.id,
        action: "try_this",
      }).catch(() => {});
    }
    navigate(createPageUrl(`ContentPlayer?key=${item.try_this_content_key}`));
  };

  return (
    <section style={{ marginTop: 20 }} aria-label="Try this — cross-library sessions">
      <h3
        style={{
          font: "italic 300 22px/1 'Fraunces', serif",
          color: "var(--plum-deep)",
          margin: "0 0 8px 16px",
        }}
      >
        Try this.
      </h3>

      <div
        className="fy-scroll"
        style={{
          display: "flex",
          gap: 12,
          padding: "0 16px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
        }}
      >
        {items.map((item) => {
          const ci = contentByKey[item.try_this_content_key] || {};
          const eyebrowParts = [];
          if (ci.content_type) eyebrowParts.push(String(ci.content_type).toUpperCase());
          if (ci.duration_minutes) eyebrowParts.push(`${ci.duration_minutes} MIN`);
          const title = item.try_this_label || ci.title || "Try a session";
          const summary = ci.summary || ci.primary_mode_note || "";
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleTap(item)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTap(item); }}
              style={{
                flexShrink: 0,
                width: 220,
                height: 140,
                scrollSnapAlign: "start",
                position: "relative",
                // lush botanical card frame (BRAND_IDENTITY §4.2/§6.1) — gold-led.
                background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}14 100%)`,
                border: `1px solid ${T.paperDeep}`,
                borderLeft: `4px solid ${T.gold}`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
              }}
            >
              <CardFrame variant="sprig" color={T.gold} size={40} opacity={0.55} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", height: "100%" }}>
              <div
                style={{
                  position: "relative",
                  width: 100,
                  flexShrink: 0,
                  background: ci.thumbnail_url ? "transparent" : FALLBACK_GRADIENT,
                }}
              >
                {ci.thumbnail_url && (
                  <img
                    src={ci.thumbnail_url}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    background: "rgba(255,255,255,0.9)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={14} color="var(--gold)" strokeWidth={1.75} />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0, padding: 12, display: "flex", flexDirection: "column" }}>
                {eyebrowParts.length > 0 && (
                  <span
                    style={{
                      font: "600 11px/1 'Inter', sans-serif",
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                      color: "var(--plum-mute)",
                    }}
                  >
                    {eyebrowParts.join(" · ")}
                  </span>
                )}
                <p
                  style={{
                    font: "400 15px/1.3 'Fraunces', serif",
                    color: "var(--plum-deep)",
                    margin: "4px 0 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {title}
                </p>
                {summary && (
                  <p
                    style={{
                      font: "400 12px/1.4 'Inter', sans-serif",
                      color: "var(--plum-mute)",
                      margin: "4px 0 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {summary}
                  </p>
                )}
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}