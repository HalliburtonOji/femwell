import { createPageUrl } from "@/utils";

const recommendationTypeStyles = {
  BREATHWORK: { backgroundColor: "#EEE6FF", color: "#9B7FCC", label: "Audio" },
  MEDITATION: { backgroundColor: "#FFE6F2", color: "#C96B9E", label: "Audio" },
  PROGRAMME:  { backgroundColor: "#E6FFF8", color: "#4ABFA3", label: "Programme" },
  NUTRITION:  { backgroundColor: "#FFF8E6", color: "#E8B84B", label: "Nutrition" },
  BOOK:       { backgroundColor: "#FFF0E8", color: "#C4804A", label: "Story" },
  LIFESTYLE:  { backgroundColor: "#F5ECF0", color: "#C4849A", label: "Article" },
  EVENT:      { backgroundColor: "#E8F0FF", color: "#6B8AC4", label: "Event" },
  READ:       { backgroundColor: "#F5ECF0", color: "#C4849A", label: "Article" },
  default:    { backgroundColor: "#F0F0F8", color: "#8888A8", label: "Article" },
};

function getTypeMeta(type) {
  return recommendationTypeStyles[type] || recommendationTypeStyles.default;
}

function SkeletonCard() {
  return (
    <div style={{
      minWidth: "220px", maxWidth: "220px", height: "110px", flexShrink: 0,
      borderRadius: "16px", backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)",
    }} />
  );
}

function RecommendationCard({ item, onTap }) {
  const typeMeta = getTypeMeta(item.type);
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onTap(item); }}
      style={{
        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 16, minWidth: 220, maxWidth: 220, flexShrink: 0,
        scrollSnapAlign: "start", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-sm)", textDecoration: "none", cursor: "pointer",
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: typeMeta.backgroundColor, color: typeMeta.color, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{typeMeta.label}</span>
      </div>
      <p style={{ color: "var(--plum)", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 10 }}>
        {item.title}
      </p>
      <p style={{ color: "var(--mauve)", fontSize: 12, lineHeight: 1.4, fontFamily: "'Inter', sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 4, flex: 1 }}>
        {item.reason}
      </p>
      <p style={{ color: "var(--rose-dust)", fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif", marginTop: 10 }}>View</p>
    </a>
  );
}

export default function RecommendedForYouSection({ loading, items, onTap }) {
  return (
    <div className="mt-6 mb-4">
      <style>{`.recommended-scroll::-webkit-scrollbar{display:none;}`}</style>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: "var(--plum)", fontSize: "16px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>For you today</p>
        <a href={createPageUrl("Lifestyle")} style={{ color: "var(--rose-dust)", fontSize: "12px", fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none" }}>See all</a>
      </div>
      <div className="recommended-scroll flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}>
        {loading
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          : items.map((item) => <RecommendationCard key={item.id} item={item} onTap={onTap} />)}
      </div>
    </div>
  );
}