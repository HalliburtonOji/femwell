import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function AdminMigrations() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [fixed, setFixed] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).finally(() => setLoading(false));
  }, []);

  const runMigration = async () => {
    setRunning(true);
    setError(null);
    setFixed(0);
    try {
      const items = await base44.entities.LifestyleItems.filter({ category: "Womens Health" });
      let count = 0;
      for (const item of items) {
        await base44.entities.LifestyleItems.update(item.id, { category: "Women's Health" });
        count++;
        setFixed(count);
      }
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <p style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Access denied. Admins only.</p>
    </div>
  );

  return (
    <div className="min-h-screen px-6 py-16" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)" }}>Admin · Data Migrations</h1>
        <p className="text-sm mb-10" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>One-time data fixes. Run carefully.</p>

        <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <h2 className="text-base font-semibold mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Fix legacy category labels</h2>
          <p className="text-sm mb-5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Updates all <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--ivory-dark)" }}>LifestyleItems</code> where{" "}
            <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--ivory-dark)" }}>category = "Womens Health"</code>{" "}
            → <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--ivory-dark)" }}>"Women's Health"</code>.
          </p>

          <button
            onClick={runMigration}
            disabled={running || done}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: done ? "var(--sage)" : "var(--plum)",
              color: "white",
              opacity: running || done ? 0.7 : 1,
              cursor: running || done ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {running ? `Fixing… (${fixed} updated)` : done ? "✓ Done" : "Fix legacy category labels"}
          </button>

          {done && (
            <p className="mt-4 text-sm font-medium" style={{ color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
              ✓ Successfully updated {fixed} record{fixed !== 1 ? "s" : ""}.
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm" style={{ color: "var(--destructive, #e05252)", fontFamily: "'Inter', sans-serif" }}>
              Error: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}