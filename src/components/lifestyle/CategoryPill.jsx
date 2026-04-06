const CATEGORY_STYLES = {
  "Womens Health":  { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Relationships":  { backgroundColor: "#FEF0F5", color: "#C4607A" },
  "Professional":   { backgroundColor: "#EEF4FF", color: "#3B5FC4" },
  "Beauty":         { backgroundColor: "#F5F0FF", color: "#7C4AC4" },
  "Lifestyle":      { backgroundColor: "#FFF8EE", color: "#A07830" },
  "Mental Health":  { backgroundColor: "var(--sage-subtle)", color: "var(--sage)" },
  "Nutrition":      { backgroundColor: "var(--sage-subtle)", color: "var(--sage)" },
  "Fitness":        { backgroundColor: "#FFF3EE", color: "#A05A2C" },
};

export default function CategoryPill({ category }) {
  const style = CATEGORY_STYLES[category] || { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide" style={style}>
      {category}
    </span>
  );
}