import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, ShieldCheck } from "lucide-react";

const CATEGORIES = ["All", "Supplements", "Period care", "Skincare", "Fitness", "Books"];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

const CAT_COLORS = {
  Supplements: { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Period care": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  Skincare: { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
  Fitness: { bg: "var(--sage-subtle)", color: "var(--sage)" },
  Books: { bg: "#FFF8EE", color: "#B89E6A" },
};

export default function Deals() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const deals = await base44.entities.Deals.filter({ is_active: true }, "-created_date", 60).catch(() => []);
        setItems(deals);
      } catch (err) {
        console.error("Deals page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleItems = useMemo(() => {
    if (category === "All") return items;
    return items.filter(i => i.category === category);
  }, [items, category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="mx-auto max-w-2xl px-4 pt-12 md:px-6">

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={sLabel}>Member perks</p>
          <h1 className="fw-display" style={{ marginTop: 4 }}>
            Wellbeing picks
          </h1>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 6 }}>
            Products our community loves
          </p>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
          <style>{`.deals-scroll::-webkit-scrollbar{display:none}`}</style>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="deals-scroll"
              style={{
                borderRadius: 9999, padding: "6px 16px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif",
                border: "none", flexShrink: 0,
                backgroundColor: category === cat ? "var(--plum)" : "var(--surface)",
                color: category === cat ? "white" : "var(--mauve)",
                boxShadow: category === cat ? "var(--shadow-sm)" : "none",
                outline: category !== cat ? "1px solid var(--border)" : "none",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Deals grid */}
        {visibleItems.length === 0 ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>No deals in this category yet</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Check back soon — new deals added regularly.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleItems.map(item => {
              const catStyle = CAT_COLORS[item.category] || { bg: "var(--ivory-dark)", color: "var(--mauve)" };
              return (
                <div key={item.id} style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {/* Image */}
                  {item.image_url && (
                    <div style={{ height: 140, overflow: "hidden", backgroundColor: "var(--ivory-dark)" }}>
                      <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  )}

                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Category + verified */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: catStyle.color, backgroundColor: catStyle.bg, borderRadius: 9999, padding: "2px 9px", fontFamily: "'Inter', sans-serif" }}>
                        {item.category}
                      </span>
                      {item.is_verified && (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
                          <ShieldCheck style={{ width: 12, height: 12 }} /> FemWell verified
                        </span>
                      )}
                    </div>

                    {/* Brand + title */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>{item.brand}</p>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.35, marginBottom: 6 }}>{item.title}</h3>

                    {item.description && (
                      <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.55, marginBottom: 10, flex: 1 }}>{item.description}</p>
                    )}

                    {/* Discount badge */}
                    {item.discount_text && (
                      <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>{item.discount_text}</p>
                      </div>
                    )}

                    {/* CTA */}
                    {item.external_url && (
                      <a href={item.external_url} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                        Shop now <ExternalLink style={{ width: 13, height: 13 }} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}