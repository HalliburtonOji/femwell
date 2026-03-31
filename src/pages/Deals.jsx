import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Search } from "lucide-react";

const CATEGORIES = ["all", "wellness", "skincare", "fitness", "food", "supplements", "general"];

export default function Deals() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const deals = await base44.entities.DealsItems.list("-created_date", 200);
      setItems(deals);
      setLoading(false);
    })();
  }, []);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search.trim() || item.store_name?.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const activeItems = visibleItems.filter((item) => item.is_active !== false);
  const expiredItems = visibleItems.filter((item) => item.is_active === false);

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 1500);
  };

  if (loading) {
    return <div className="min-h-screen femwell-gradient flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" /></div>;
  }

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6">
        <div className="mb-5 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Deals</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Coupon finder</h1>
          <p className="mt-2 text-sm text-gray-500">Search stores and copy the best codes in one tap.</p>
        </div>

        <div className="mb-4 rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 px-4 py-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Boots, ASOS, Sephora..." className="w-full bg-transparent text-sm text-gray-700 outline-none" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${category === item ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-[28px] border border-rose-100 bg-white p-10 text-center shadow-sm">
            <p className="mt-3 text-base font-semibold text-gray-900">No deals found yet</p>
            <p className="mt-1 text-sm text-gray-500">Fresh codes will appear here after the next refresh.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {activeItems.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{item.category}</p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.store_name}</h3>
                      {item.terms && <p className="mt-2 text-sm text-gray-500">{item.terms}</p>}
                    </div>
                    {item.expiry && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">{item.expiry}</span>}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
                    <p className="text-base font-bold tracking-[0.2em] text-rose-700">{item.code}</p>
                    <button onClick={() => copyCode(item.code)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700">
                      <Copy className="h-3.5 w-3.5" /> {copied === item.code ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white">
                    Open store
                  </a>
                </div>
              ))}
            </div>

            {expiredItems.length > 0 && (
              <div className="mt-6">
                <p className="mb-3" style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Recently expired</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {expiredItems.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm" style={{ opacity: 0.5 }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{item.category}</p>
                          <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.store_name}</h3>
                          {item.terms && <p className="mt-2 text-sm text-gray-500">{item.terms}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span style={{ fontSize: "11px", color: "#E05C7A", fontFamily: "'Inter', sans-serif" }}>Expired</span>
                          {item.expiry && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">{item.expiry}</span>}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
                        <p className="text-base font-bold tracking-[0.2em] text-rose-700" style={{ textDecorationLine: 'line-through' }}>{item.code}</p>
                        <button onClick={() => copyCode(item.code)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700">
                          <Copy className="h-3.5 w-3.5" /> {copied === item.code ? "Copied" : "Copy code"}
                        </button>
                      </div>
                      <a href={item.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white">
                        Open store
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}