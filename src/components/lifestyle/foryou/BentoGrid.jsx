import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SaveHeartButton from "./SaveHeartButton";
import PhasePill from "./PhasePill";
import { getCategoryGradient, attachFallbackOverlay } from "@/utils/imageFallback";

const FALLBACK_GRADIENT = "linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)";

function cardSpan(item) {
  const isVideo = item.media_type === "VIDEO" || item.media_type === "TIKTOK" ||
                  item.media_type === "INSTAGRAM" || item.media_type === "CLIP";
  const isStory = item.content_type === "STORY";
  if (isVideo) return { gridColumn: "span 2" };
  if (isStory) return { gridRow: "span 2" };
  return {};
}

function BentoCard({ item, idx, currentPhase, savedSet, savedPhases, onSave, onUntag }) {
  const navigate = useNavigate();
  const isSaved = savedSet.has(item.id);
  const hasPhaseTag = !!savedPhases?.[item.id];
  const matched = !!currentPhase && Array.isArray(item.phase_tags) && item.phase_tags.includes(currentPhase);
  const isStory = item.content_type === "STORY";
  const pullQuote = isStory
    ? (Array.isArray(item.takeaways) && item.takeaways[0]) || (item.summary || "").slice(0, 80)
    : null;

  return (
    <div
      onClick={(e) => {
        if (e?.target?.closest?.('[data-no-nav="true"]')) return;
        navigate(createPageUrl(`LifestyleDetail?id=${item.id}`));
      }}
      className="fy-bento-card"
      style={{
        ...cardSpan(item),
        position: "relative",
        background: "var(--cream)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        // Layered 3D shadow stack
        boxShadow:
          "0 1px 2px rgba(43,30,22,0.04), 0 4px 12px rgba(43,30,22,0.06), 0 12px 32px rgba(43,30,22,0.04)",
        transition: "transform 240ms ease-out, box-shadow 240ms ease-out",
        animationDelay: `${Math.min(idx, 12) * 50}ms`,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          // When no image_gradient is set, fall back to a category-tied gradient
          // so empty cards render a branded panel instead of a flat pale rectangle.
          background: item.image_gradient || getCategoryGradient(item.category),
          position: "relative",
        }}
      >
        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => attachFallbackOverlay(e, item.category)}
          />
        )}
        {item.category && (
          <span
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(0,0,0,0.35)",
              color: "var(--cream)",
              padding: "4px 10px",
              borderRadius: 9999,
              font: "600 11px/1 'Inter', sans-serif",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            {item.category}
          </span>
        )}
        {matched && (
          <div style={{ position: "absolute", top: 16 + 22 + 4, left: 16 }}>
            <PhasePill phase={currentPhase} fallbackPhase={currentPhase} />
          </div>
        )}
        <div data-no-nav="true" style={{ position: "absolute", top: 12, right: 12 }}>
          <SaveHeartButton
            itemId={item.id}
            size={32}
            iconSize={18}
            saved={isSaved}
            hasPhaseTag={hasPhaseTag}
            onSave={onSave}
            onUnsave={() => {}}
            onUntag={onUntag}
          />
        </div>
      </div>
      <div style={{ padding: 16 }}>
        {isStory && pullQuote ? (
          <p
            style={{
              font: "italic 300 18px/1.4 'Fraunces', serif",
              color: "var(--plum-deep)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            “{pullQuote}”
          </p>
        ) : (
          <h3
            style={{
              font: "400 22px/1.25 'Fraunces', serif",
              color: "var(--plum-deep)",
              margin: 0,
              letterSpacing: "-0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </h3>
        )}
        {item.summary && !isStory && (
          <p
            style={{
              font: "400 14px/1.55 'Inter', sans-serif",
              color: "var(--plum-accent)",
              margin: "6px 0 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.summary}
          </p>
        )}
        {(item.author_name || item.source_name) && (
          <span
            style={{
              display: "block",
              font: "500 12px/1 'Inter', sans-serif",
              color: "var(--plum-mute)",
              marginTop: 8,
            }}
          >
            {item.author_name || item.source_name}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BentoGrid({ items, currentPhase, savedSet, savedPhases, onSave, onUntag }) {
  // Return null instead of an empty-state block — the rails above (PhaseInbox, Saved, TryThis)
  // and the hero handle their own emptiness. A dedicated "Nothing more to explore" line
  // reads as broken on a freshly-loaded page when the fetch is briefly intermittent.
  // True dataset-empty cases on this app are vanishingly rare (200+ PUBLISHED items exist).
  if (!items?.length) return null;
  return (
    <section style={{ marginTop: 24, padding: "0 16px" }}>
      <p
        style={{
          font: "600 12px/1 'Inter', sans-serif",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "var(--plum-mute)",
          margin: "0 0 12px",
        }}
      >
        More to explore
      </p>
      <div className="fy-bento">
        {items.map((item, idx) => (
          <BentoCard
            key={item.id}
            item={item}
            idx={idx}
            currentPhase={currentPhase}
            savedSet={savedSet}
            savedPhases={savedPhases}
            onSave={onSave}
            onUntag={onUntag}
          />
        ))}
      </div>
    </section>
  );
}