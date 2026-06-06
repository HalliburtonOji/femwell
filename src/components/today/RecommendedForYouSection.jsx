import { createPageUrl } from "@/utils";

const CHIP = { backgroundColor: "rgba(168,137,63,0.12)", color: "var(--gold)" };
const recommendationTypeStyles = {
  BREATHWORK: { ...CHIP, label: "Audio" },
  MEDITATION: { ...CHIP, label: "Audio" },
  PROGRAMME:  { ...CHIP, label: "Programme" },
  NUTRITION:  { ...CHIP, label: "Nutrition" },
  BOOK:       { ...CHIP, label: "Story" },
  LIFESTYLE:  { ...CHIP, label: "Article" },
  EVENT:      { ...CHIP, label: "Event" },
  READ:       { ...CHIP, label: "Article" },
  default:    { ...CHIP, label: "Article" },
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
        <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, }}>{typeMeta.label}</span>
      </div>
      <p style={{ color: "var(--plum)", fontSize: 14, fontWeight: 600, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 10 }}>
        {item.title}
      </p>
      <p style={{ color: "var(--mauve)", fontSize: 12, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 4, flex: 1 }}>
        {item.reason}
      </p>
      <p style={{ color: "var(--rose-dust)", fontSize: 11, fontWeight: 600, marginTop: 10 }}>View</p>
    </a>
  );
}

export default function RecommendedForYouSection({ loading, items, onTap }) {
  return (
    <div className="mt-6 mb-4">
      <style>{`.recommended-scroll::-webkit-scrollbar{display:none;}`}</style>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: "var(--plum)", fontSize: "16px", fontWeight: 700, }}>For you today</p>
        <a href={createPageUrl("Lifestyle")} style={{ color: "var(--rose-dust)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>See all</a>
      </div>
      <div className="recommended-scroll flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}>
        {loading
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          : items.map((item) => <RecommendationCard key={item.id} item={item} onTap={onTap} />)}
      </div>
    </div>
  );
}