import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import SavedItemCard from "@/components/saved/SavedItemCard";
import { Bookmark } from "lucide-react";

const BASE_TABS = [
  { id: "ADVICE",    label: "Advice"    },
  { id: "LIFESTYLE", label: "Lifestyle" },
  { id: "CONTENT",   label: "Sessions"  },
  { id: "PROGRAM",   label: "Programs"  },
  { id: "JOURNAL",   label: "Journal"   },
];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function Saved() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("ADVICE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const saved = await base44.entities.SavedItems.filter({ user_id: currentUser.id }, "-created_at", 150).catch(() => []);
        setItems(saved);
      } catch (err) {
        console.error("Saved page init failed:", err);
      } finally {
        setLoading(false);
      }
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
          <p style={{ ...sLabel, marginBottom: "8px" }}>Your library</p>
          <h1 style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Saved
          </h1>
          <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
            Advice, lifestyle finds, sessions, and programs.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ marginBottom: "16px" }}>
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{
                borderRadius: "9999px", padding: "7px 16px",
                fontSize: "12px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap", cursor: "pointer",
                border: tab === item.id ? "none" : "1px solid var(--border)",
                backgroundColor: tab === item.id ? "var(--plum)" : "var(--surface)",
                color: tab === item.id ? "white" : "var(--mauve)"
              }}>
              {item.label}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center", marginTop: "8px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              backgroundColor: "var(--rose-dust-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Bookmark className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Nothing saved here yet</p>
            <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>
              {tab === "LIFESTYLE"
                ? "📚 Nothing saved yet — tap the bookmark icon on any article to save it here."
                : "When you save something around the app, it appears here."}
            </p>
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