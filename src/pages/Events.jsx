import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, MapPin } from "lucide-react";
import { toggleSavedItem } from "@/lib/savedItems";

const FILTERS = ["all", "free", "paid"];
const CATEGORIES = ["all", "women networking", "fitness/wellness", "talks & workshops", "relationship / therapy events", "general"];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

const pillActive = {
  borderRadius: "9999px", padding: "5px 12px", fontSize: "11px",
  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
  border: "none", backgroundColor: "var(--plum)", color: "white"
};
const pillInactive = {
  borderRadius: "9999px", padding: "5px 12px", fontSize: "11px",
  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
  border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)"
};

export default function Events() {
  const [items, setItems] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [events, user] = await Promise.all([
        base44.entities.EventsItems.list("date", 120),
        base44.auth.me(),
      ]);
      const saved = await base44.entities.SavedItems.filter({ user_id: user.id, item_type: "EVENT" }, "-created_at", 120);
      setSavedIds(new Set(saved.map((item) => item.item_id)));
      setItems(events);
      setLoading(false);
    })();
  }, []);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const priceMatch = priceFilter === "all" || (priceFilter === "free" ? item.is_free : !item.is_free);
      const categoryMatch = category === "all" || item.category === category;
      return priceMatch && categoryMatch;
    });
  }, [items, priceFilter, category]);

  const handleSave = async (item) => {
    const result = await toggleSavedItem({
      itemType: "EVENT",
      itemId: item.id,
      title: item.title,
      previewText: `${item.location || "Online"} · ${item.price || (item.is_free ? "Free" : "Paid")}`,
      meta: { url: item.link },
    });
    setSavedIds((current) => {
      const next = new Set(current);
      if (result.saved) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
  };

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
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6">

        <div style={{ ...card, padding: "20px", marginBottom: "16px" }}>
          <p style={{ ...sLabel, marginBottom: "8px" }}>Community</p>
          <h1 style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
            Events
          </h1>
          <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
            Women-focused talks, workshops, networking, and wellness sessions.
          </p>
        </div>

        <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map((item) => (
              <button key={item} onClick={() => setPriceFilter(item)}
                style={priceFilter === item ? pillActive : pillInactive}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto" style={{ marginTop: "10px" }}>
            {CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)}
                style={category === item ? pillActive : pillInactive}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              backgroundColor: "var(--rose-dust-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <CalendarDays className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>No events yet</p>
            <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>
              Fresh listings appear after the daily refresh.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleItems.map((item) => (
              <div key={item.id} style={{ ...card, padding: "16px" }}>
                <p style={{ ...sLabel, marginBottom: "6px" }}>{item.category}</p>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>{item.title}</h3>
                <div className="flex flex-wrap gap-3" style={{ marginTop: "10px", fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {item.date}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {item.location || item.city || "Online"}</span>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
                  {item.price || (item.is_free ? "Free" : "Paid")}
                </p>
                <div className="flex items-center justify-between" style={{ marginTop: "12px" }}>
                  <a href={item.link} target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", borderRadius: "12px", padding: "10px 16px", fontSize: "13px", fontWeight: 600, textDecoration: "none", backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
                    Open event
                  </a>
                  <button onClick={() => handleSave(item)}
                    style={{
                      borderRadius: "9999px", padding: "8px 16px", fontSize: "12px",
                      fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer",
                      ...(savedIds.has(item.id)
                        ? { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" }
                        : { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "1px solid var(--border)" }
                      )
                    }}>
                    {savedIds.has(item.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}