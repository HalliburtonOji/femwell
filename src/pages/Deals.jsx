import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Search } from "lucide-react";

const CATEGORIES = ["all", "wellness", "skincare", "fitness", "food", "supplements", "general"];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function Deals() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const deals = await base44.entities.DealsItems.list("-created_date", 120);
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
          <p style={{ ...sLabel, marginBottom: "8px" }}>Member perks</p>
          <h1 style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
            Deals
          </h1>
          <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
            Search stores and copy the best codes in one tap.
          </p>
        </div>

        <div style={{ ...card, padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "14px", padding: "10px 14px", backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--mauve)", flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Boots, ASOS, Sephora..."
              style={{ background: "transparent", outline: "none", fontSize: "13px", color: "var(--plum)", fontFamily: "'Inter', sans-serif", width: "100%" }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ marginTop: "12px" }}>
            {CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)}
                style={{
                  borderRadius: "9999px", padding: "5px 12px",
                  fontSize: "11px", fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif",
                  textTransform: "capitalize", border: "none",
                  backgroundColor: category === item ? "var(--plum)" : "var(--ivory-dark)",
                  color: category === item ? "white" : "var(--mauve)"
                }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>No deals found yet</p>
            <p style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>
              Fresh codes will appear here after the next refresh.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {activeItems.map((item) => (
                <div key={item.id} style={{ ...card, padding: "16px" }}>
                  <p style={{ ...sLabel, marginBottom: "6px" }}>{item.category}</p>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{item.store_name}</h3>
                  {item.terms && <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>{item.terms}</p>}
                  {item.expiry && (
                    <span style={{ display: "inline-block", marginTop: "8px", borderRadius: "9999px", padding: "3px 10px", fontSize: "11px", fontWeight: 600, backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                      {item.expiry}
                    </span>
                  )}
                  <div style={{ borderRadius: "14px", padding: "12px 14px", marginTop: "12px", backgroundColor: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{item.code}</p>
                    <button onClick={() => copyCode(item.code)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "9999px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--plum)", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                      <Copy className="h-3.5 w-3.5" />
                      {copied === item.code ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", borderRadius: "12px", padding: "10px 16px", fontSize: "13px", fontWeight: 600, textDecoration: "none", backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", marginTop: "12px" }}>
                    Open store
                  </a>
                </div>
              ))}
            </div>

            {expiredItems.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <p style={{ ...sLabel, margin: "24px 0 12px" }}>Recently expired</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {expiredItems.map((item) => (
                    <div key={item.id} style={{ ...card, padding: "16px", opacity: 0.45 }}>
                      <p style={{ ...sLabel, marginBottom: "6px" }}>{item.category}</p>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{item.store_name}</h3>
                      {item.terms && <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>{item.terms}</p>}
                      {item.expiry && (
                        <span style={{ display: "inline-block", marginTop: "8px", borderRadius: "9999px", padding: "3px 10px", fontSize: "11px", fontWeight: 600, backgroundColor: "var(--ivory-dark)", color: "#D94F4F", fontFamily: "'Inter', sans-serif" }}>
                          {item.expiry}
                        </span>
                      )}
                      <div style={{ borderRadius: "14px", padding: "12px 14px", marginTop: "12px", backgroundColor: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: "line-through" }}>{item.code}</p>
                        <button onClick={() => copyCode(item.code)}
                          style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "9999px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--plum)", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                          <Copy className="h-3.5 w-3.5" />
                          {copied === item.code ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <a href={item.link} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", borderRadius: "12px", padding: "10px 16px", fontSize: "13px", fontWeight: 600, textDecoration: "none", backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", marginTop: "12px" }}>
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