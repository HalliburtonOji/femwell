import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, MapPin } from "lucide-react";
import { toggleSavedItem } from "@/lib/savedItems";

const FILTERS = ["all", "free", "paid"];
const CATEGORIES = ["all", "women networking", "fitness/wellness", "talks & workshops", "relationship / therapy events", "general"];

export default function Events() {
  const [items, setItems] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [events, user] = await Promise.all([
        base44.entities.EventsItems.list("date", 200),
        base44.auth.me(),
      ]);
      const saved = await base44.entities.SavedItems.filter({ user_id: user.id, item_type: "EVENT" }, "-created_at", 200);
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
    return <div className="min-h-screen femwell-gradient flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" /></div>;
  }

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6">
        <div className="mb-5 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Events</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Free and paid events</h1>
          <p className="mt-2 text-sm text-gray-500">Find women-focused talks, workshops, networking, and wellness sessions.</p>
        </div>

        <div className="mb-4 rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map((item) => (
              <button key={item} onClick={() => setPriceFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${priceFilter === item ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${category === item ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-[28px] border border-rose-100 bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">📍</p>
            <p className="mt-3 text-base font-semibold text-gray-900">No events yet</p>
            <p className="mt-1 text-sm text-gray-500">Fresh listings will appear here after the daily refresh.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleItems.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{item.category}</p>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {item.date}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {item.location || item.city || "Online"}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-rose-600">{item.price || (item.is_free ? "Free" : "Paid")}</p>
                  </div>
                  <button onClick={() => handleSave(item)} className={`rounded-full px-3 py-2 text-xs font-semibold ${savedIds.has(item.id) ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600"}`}>
                    {savedIds.has(item.id) ? "Saved" : "Save"}
                  </button>
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white">
                  Open event
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}