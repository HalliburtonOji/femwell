import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { createPageUrl } from "@/utils";
import PhasePill from "./PhasePill";
import { getCategoryGradient, attachFallbackOverlay } from "@/utils/imageFallback";

const FALLBACK_GRADIENT = "linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)";

export default function SavedRail({ items, currentPhase, savedPhases, onUntagOrUnsave }) {
  const navigate = useNavigate();
  if (!items?.length) return null;

  return (
    <section style={{ marginTop: 20 }} aria-label="Recently saved">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "0 16px",
          marginBottom: 10,
        }}
      >
        <h3
          style={{
            font: "italic 400 18px/1 'Fraunces', serif",
            color: "var(--plum-deep)",
            margin: 0,
          }}
        >
          Saved · last 3
        </h3>
        <button
          type="button"
          onClick={() => navigate(createPageUrl("Saved?tab=CONTENT"))}
          style={{
            font: "500 13px/1 'Inter', sans-serif",
            color: "var(--rose-primary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            minHeight: 44,
            padding: "10px 0",
          }}
        >
          See all →
        </button>
      </div>

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
          const phase = savedPhases?.[item.id];
          const matched = !!currentPhase && Array.isArray(item.phase_tags) && item.phase_tags.includes(currentPhase);
          return (
            <div
              key={item.id}
              onClick={() => navigate(createPageUrl(`LifestyleDetail?id=${item.id}`))}
              style={{
                flexShrink: 0,
                width: 140,
                height: 180,
                scrollSnapAlign: "start",
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                background: "var(--cream)",
                boxShadow: "var(--shadow-card)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: 110,
                  width: "100%",
                  background: item.image_gradient || getCategoryGradient(item.category),
                  position: "relative",
                }}
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => attachFallbackOverlay(e, item.category)}
                  />
                )}
              </div>
              <div style={{ padding: "8px 10px" }}>
                <p
                  style={{
                    font: "400 13px/1.3 'Fraunces', serif",
                    color: "var(--plum-deep)",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.title}
                </p>
              </div>
              {(matched || phase) && (
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <PhasePill phase={phase || currentPhase} fallbackPhase={currentPhase} />
                </div>
              )}
              <button
                type="button"
                aria-label="Saved — tap to retag or remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onUntagOrUnsave?.(item.id, e.currentTarget.getBoundingClientRect());
                }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 28,
                  height: 28,
                  minWidth: 44,
                  minHeight: 44,
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                }}
              >
                <Heart size={14} strokeWidth={1.75} fill="var(--rose-primary)" color="var(--rose-primary)" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}