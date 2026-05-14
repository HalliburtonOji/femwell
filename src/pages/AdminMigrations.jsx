import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { mapLegacyCategory } from "@/utils/contentCategory";

// ── Shared migration runner ────────────────────────────────────────────────
function MigrationCard({ title, description, buttonLabel, onRun }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  const run = async () => {
    setRunning(true);
    setError(null);
    setCount(0);
    setLog([]);
    try {
      await onRun({
        tick: (n) => setCount(n),
        append: (line) => setLog(prev => [...prev.slice(-20), line]),
      });
      setDone(true);
    } catch (err) {
      setError(err?.message || "Unknown error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{title}</h2>
      <p className="text-sm mb-5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{description}</p>
      <button
        onClick={run}
        disabled={running || done}
        aria-label={`Run migration: ${title}`}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{
          backgroundColor: done ? "var(--sage)" : "var(--plum)",
          color: "white",
          opacity: running || done ? 0.7 : 1,
          cursor: running || done ? "not-allowed" : "pointer",
          fontFamily: "'Inter', sans-serif",
          minHeight: 44,
        }}
      >
        {running ? `Running… (${count})` : done ? "✓ Done" : buttonLabel}
      </button>
      {done && (
        <p className="mt-4 text-sm font-medium" style={{ color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
          ✓ Updated {count} record{count !== 1 ? "s" : ""}.
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm" style={{ color: "var(--destructive, #e05252)", fontFamily: "'Inter', sans-serif" }}>
          Error: {error}
        </p>
      )}
      {log.length > 0 && (
        <details className="mt-3">
          <summary style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
            Log ({log.length})
          </summary>
          <pre style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "monospace", backgroundColor: "var(--ivory)", padding: 10, borderRadius: 8, marginTop: 8, maxHeight: 200, overflow: "auto" }}>
            {log.join("\n")}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function AdminMigrations() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }} role="status" aria-label="Loading">
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <p style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Access denied. Admins only.</p>
    </div>
  );

  // ── Migration implementations ────────────────────────────────────────────

  // 1) Legacy category string fix (kept from before)
  const runLegacyCategoryFix = async ({ tick, append }) => {
    const items = await base44.entities.LifestyleItems.filter({ category: "Womens Health" });
    let n = 0;
    for (const item of items) {
      await base44.entities.LifestyleItems.update(item.id, { category: "Women's Health" });
      n++; tick(n);
    }
    append(`Updated ${n} LifestyleItems.`);
  };

  // 2) PanicLog → PanicSessions consolidation
  const runPanicConsolidation = async ({ tick, append }) => {
    const logs = await base44.entities.PanicLog.list("-created_date", 500).catch(() => []);
    let n = 0;
    for (const log of logs) {
      try {
        // Idempotent guard: skip if we've already migrated this one.
        const existing = await base44.entities.PanicSessions.filter({
          user_id: log.user_id,
          migrated_from: "PanicLog",
        }).catch(() => []);
        const already = existing.some(s => s.logged_at === log.timestamp);
        if (already) { append(`Skip ${log.id} (already migrated)`); continue; }

        const logged = log.timestamp || new Date().toISOString();
        const dayKey = logged.split("T")[0];
        await base44.entities.PanicSessions.create({
          user_id: log.user_id,
          day_key: dayKey,
          logged_at: logged,
          started_at: logged,
          feeling_type: log.feeling_type || "anxiety",
          intensity: log.intensity ?? 3,
          trigger_tags: log.trigger ? [log.trigger] : [],
          techniques_used: Array.isArray(log.actions_taken) ? log.actions_taken : [],
          resolved_rating: log.resolved_rating,
          post_session_rating: log.resolved_rating,
          migrated_from: "PanicLog",
        });
        await base44.entities.MigrationLog.create({
          entity_name: "PanicLog",
          record_id: log.id,
          migration_name: "panic_log_to_sessions_v1",
          before_value: JSON.stringify({ feeling_type: log.feeling_type, intensity: log.intensity }),
          after_value: "PanicSessions.created",
          created_date: new Date().toISOString(),
        }).catch(() => {});
        n++; tick(n);
      } catch (e) {
        append(`Error on ${log.id}: ${e.message}`);
      }
    }
    append(`Migrated ${n} of ${logs.length} PanicLog rows.`);
  };

  // 3) ContentItems.category normalization
  const runContentCategoryNormalization = async ({ tick, append }) => {
    const items = await base44.entities.ContentItems.list("-created_date", 500).catch(() => []);
    let n = 0;
    for (const item of items) {
      const before = item.category || null;
      // Already normalized? skip.
      if (before && ["nutrition","movement","mindfulness","cycle_education","mental_health","sleep","relationships","hormones","self_care","other"].includes(before)) {
        continue;
      }
      const raw = before || (item.tags || []).join(" ") || item.content_type || "";
      const mapped = mapLegacyCategory(raw) || "other";
      try {
        await base44.entities.ContentItems.update(item.id, { category: mapped });
        await base44.entities.MigrationLog.create({
          entity_name: "ContentItems",
          record_id: item.id,
          migration_name: "content_category_normalize_v1",
          before_value: String(before || ""),
          after_value: mapped,
          note: mapped === "other" ? "no confident match" : "mapped",
          created_date: new Date().toISOString(),
        }).catch(() => {});
        n++; tick(n);
      } catch (e) {
        append(`Error on ${item.id}: ${e.message}`);
      }
    }
    append(`Normalized ${n} ContentItems categories.`);
  };

  return (
    <div className="min-h-screen px-6 py-16" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fraunces', serif", color: "var(--plum)" }}>Admin · Data Migrations</h1>
        <p className="text-sm mb-10" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>One-time data fixes. Run carefully — each is idempotent.</p>

        <MigrationCard
          title="Fix legacy category labels"
          description="Updates LifestyleItems where category='Womens Health' → 'Women's Health'."
          buttonLabel="Run"
          onRun={runLegacyCategoryFix}
        />

        <MigrationCard
          title="Consolidate PanicLog → PanicSessions"
          description="Copies all PanicLog rows into PanicSessions (marked migrated_from='PanicLog'). Safe to re-run — skips already-migrated rows."
          buttonLabel="Run consolidation"
          onRun={runPanicConsolidation}
        />

        <MigrationCard
          title="Normalize ContentItems.category"
          description="Maps legacy/free-form category strings to the new enum (nutrition, movement, mindfulness…). Unmapped → 'other'. All changes logged to MigrationLog."
          buttonLabel="Run normalization"
          onRun={runContentCategoryNormalization}
        />
      </div>
    </div>
  );
}