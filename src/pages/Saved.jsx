import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import SavedItemCard from "@/components/saved/SavedItemCard";

const BASE_TABS = [
  { id: "ADVICE", label: "Advice" },
  { id: "LIFESTYLE", label: "Lifestyle" },
  { id: "CONTENT", label: "Sessions" },
  { id: "PROGRAM", label: "Programs" },
  { id: "JOURNAL", label: "Journal" },
];

export default function Saved() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("ADVICE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const saved = await base44.entities.SavedItems.filter({ user_id: currentUser.id }, "-created_at", 150);
      setItems(saved);
      setLoading(false);
    })();
  }, []);

  const tabs = useMemo(() => {
    const extra = items.some((item) => item.item_type === "EVENT") ? [{ id: "EVENT", label: "Events" }] : [];
    return [...BASE_TABS, ...extra];
  }, [items]);

  const visibleItems = items.filter((item) => item.item_type === tab);

  const removeItem = async (item) => {
    await base44.entities.SavedItems.delete(item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6">
        <div className="mb-5 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Saved</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Everything you wanted to keep</h1>
          <p className="mt-2 text-sm text-gray-500">Advice, lifestyle finds, sessions, and programs live here in one place.</p>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${tab === item.id ? "bg-rose-500 text-white" : "bg-white text-gray-500"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-[28px] border border-rose-100 bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">🌸</p>
            <p className="mt-3 text-base font-semibold text-gray-900">Nothing saved here yet</p>
            <p className="mt-1 text-sm text-gray-500">When you save something around the app, it will show up here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleItems.map((item) => (
              <SavedItemCard key={item.id} item={item} onRemove={removeItem} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}