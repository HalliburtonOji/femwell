import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SaveHeartButton from "./SaveHeartButton";

const FALLBACK_GRADIENT = "linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)";

export default function EditorialHero({ item, savedSet, savedPhases, onSave, onUntag }) {
  const navigate = useNavigate();

  if (!item) {
    return (
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto 20px",
          padding: "32px 24px",
          textAlign: "center",
          background: "var(--cream)",
          border: "1px solid var(--ink-line)",
          borderRadius: 22,
          color: "var(--plum-accent)",
          font: "400 16px 'Inter', sans-serif",
        }}
      >
        Quiet on the shelf today. Check back soon.
      </div>
    );
  }

  const isSaved = savedSet.has(item.id);
  const hasPhaseTag = !!savedPhases?.[item.id];
  const bg = item.image_url
    ? undefined
    : (item.image_gradient || FALLBACK_GRADIENT);

  const goToDetail = (e) => {
    if (e?.target?.closest?.('[data-no-nav="true"]')) return;
    navigate(createPageUrl(`LifestyleDetail?id=${item.id}`));
  };

  return (
    <div
      onClick={goToDetail}
      style={{
        position: "relative",
        margin: "0 auto 20px",
        borderRadius: 22,
        overflow: "hidden",
        cursor: "pointer",
        animation: "fy-fade 240ms ease-out",
        background: bg,
        boxShadow: "var(--shadow-card)",
      }}
      className="fy-hero"
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt=""
          loading="eager"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      {/* Bottom scrim */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)",
        }}
      />

      {/* Top-left: category meta pill */}
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

      {/* Top-right: save heart */}
      <div data-no-nav="true" style={{ position: "absolute", top: 16, right: 16 }}>
        <SaveHeartButton
          itemId={item.id}
          saved={isSaved}
          hasPhaseTag={hasPhaseTag}
          onSave={onSave}
          onUnsave={() => {}}
          onUntag={onUntag}
        />
      </div>

      {/* Bottom inset */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          color: "var(--cream)",
        }}
        className="fy-hero-text"
      >
        <h2
          style={{
            font: "300 32px/1.15 'Playfair Display', serif",
            letterSpacing: "-0.02em",
            color: "var(--cream)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </h2>
        {(item.summary || item.lede) && (
          <p
            style={{
              font: "400 14px/1.5 'Inter', sans-serif",
              color: "rgba(247,240,230,0.85)",
              margin: "8px 0 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.lede || item.summary}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          {(item.author_name || item.source_name) && (
            <span
              style={{
                font: "500 12px/1 'Inter', sans-serif",
                color: "rgba(247,240,230,0.7)",
                letterSpacing: "0.4px",
              }}
            >
              {item.author_name || item.source_name}
            </span>
          )}
          <span
            data-no-nav="true"
            onClick={(e) => { e.stopPropagation(); navigate(createPageUrl(`LifestyleDetail?id=${item.id}`)); }}
            style={{
              font: "600 13px/1 'Inter', sans-serif",
              color: "var(--rose-primary)",
              cursor: "pointer",
              padding: "10px 14px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.92)",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Read this →
          </span>
        </div>
      </div>
    </div>
  );
}