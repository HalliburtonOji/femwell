const CATEGORY_STYLES = {
  "Womens Health": "bg-rose-100 text-rose-600",
  "Relationships": "bg-pink-100 text-pink-600",
  "Professional": "bg-indigo-100 text-indigo-600",
  "Beauty": "bg-purple-100 text-purple-600",
  "Lifestyle": "bg-amber-100 text-amber-600",
  "Mental Health": "bg-teal-100 text-teal-600",
  "Nutrition": "bg-emerald-100 text-emerald-600",
  "Fitness": "bg-orange-100 text-orange-600",
};

export default function CategoryPill({ category }) {
  const cls = CATEGORY_STYLES[category] || "bg-gray-100 text-gray-500";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${cls}`}>
      {category}
    </span>
  );
}