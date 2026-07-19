// V3 sprint Task 4 — full-screen search across the user's logs.
// Debounced 300ms client-side filter over JournalEntries, SymptomLogs,
// MealLog, and PersonalTasks. Read-only; tap a row to navigate to the
// relevant page. Empty / no-query states are explicit.

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, BookOpen, Stethoscope, Utensils, ListChecks } from "lucide-react";
import { base44 } from "@/api/base44Client";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#F4EFE3",
  espresso: "#3A2C1A",
  muted:    "#6B5B4E",
  gold:     "#D4AF37",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
};

const SECTION_META = {
  journal:  { label: "Journal",  Icon: BookOpen,     route: "/Journal" },
  symptoms: { label: "Symptoms", Icon: Stethoscope,  route: "/Track" },
  meals:    { label: "Meals",    Icon: Utensils,     route: "/Nutrition" },
  tasks:    { label: "Tasks",    Icon: ListChecks,   route: "/Planner" },
};

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).split("T")[0];
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function excerpt(text, max = 140) {
  if (!text) return "";
  const t = String(text).trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    journal: [], symptoms: [], meals: [], tasks: [],
  });
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // 300ms debounce.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Load all once when first non-empty query arrives. Filter happens
  // client-side because the entity APIs don't support full-text search.
  const [raw, setRaw] = useState(null);
  useEffect(() => {
    if (!debounced || raw) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!me?.id) { setRaw({}); setLoading(false); return; }
        const [journal, symptoms, meals, tasks] = await Promise.all([
          base44.entities.JournalEntries.filter({ user_id: me.id }, "-session_date", 400).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: me.id }, "-date", 400).catch(() => []),
          base44.entities.MealLog.filter({ user_id: me.id }, "-day_key", 400).catch(() => []),
          base44.entities.PersonalTasks.filter({ user_id: me.id }, "-date", 400).catch(() => []),
        ]);
        if (cancelled) return;
        setRaw({ journal, symptoms, meals, tasks });
      } catch { /* silent */ }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [debounced, raw]);

  // Filter the loaded slices on every debounced query change.
  useEffect(() => {
    if (!debounced || !raw) {
      setData({ journal: [], symptoms: [], meals: [], tasks: [] });
      return;
    }
    const q = debounced;
    const has = (s) => s && String(s).toLowerCase().includes(q);
    setData({
      journal:  (raw.journal  || []).filter((r) => has(r?.text) || has(r?.content) || has(r?.prompt)).slice(0, 20),
      symptoms: (raw.symptoms || []).filter((r) => has(r?.symptom_type) || has(r?.symptom_name) || has(r?.notes)).slice(0, 20),
      meals:    (raw.meals    || []).filter((r) => has(r?.raw_text) || has(r?.description) || has(r?.meal_type)).slice(0, 20),
      tasks:    (raw.tasks    || []).filter((r) => has(r?.title) || has(r?.notes)).slice(0, 20),
    });
  }, [debounced, raw]);

  const totalResults = data.journal.length + data.symptoms.length + data.meals.length + data.tasks.length;
  const showEmpty = debounced && !loading && totalResults === 0;
  const showIntro = !debounced;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, paddingBottom: 96 }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#3A2C1A",
      }}>
        {/* Row 1 — espresso bar */}
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            style={{
              width: 36, height: 36, borderRadius: 9999, border: "none",
              background: "rgba(244,237,219,0.12)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#F4EDDB", flexShrink: 0,
            }}
          ><ArrowLeft size={18} /></button>
          <div>
            <div style={{ fontSize: 10, color: "rgba(244,237,219,0.5)", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 1 }}>Your logs</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F4EDDB" }}>Search</div>
          </div>
        </div>
        {/* Row 2 — search input */}
        <div style={{ padding: "0 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(244,237,219,0.10)", border: "1px solid rgba(244,237,219,0.18)" }}>
            <SearchIcon size={16} style={{ color: "rgba(244,237,219,0.6)" }} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journal, symptoms, meals, tasks…"
              aria-label="Search query"
              style={{
                flex: 1, padding: 0,
                background: "transparent", border: "none", outline: "none",
                fontSize: 15, color: "#F4EDDB",
              }}
            />
          </div>
        </div>
      </header>

      <main style={{ padding: "16px 16px 0" }}>
        {showIntro && (
          <p style={{ color: C.muted, fontSize: 14, fontStyle: "italic", lineHeight: 1.5 }}>
            Start typing to search across your journal, symptoms, meals, and tasks.
          </p>
        )}

        {loading && (
          <p style={{ color: C.muted, fontSize: 13 }}>Searching…</p>
        )}

        {showEmpty && (
          <p style={{ color: C.muted, fontSize: 14, fontStyle: "italic", lineHeight: 1.5 }}>
            Nothing found — your logs are private and safe.
          </p>
        )}

        {Object.entries(SECTION_META).map(([key, meta]) => {
          const list = data[key];
          if (!list || list.length === 0) return null;
          const Icon = meta.Icon;
          return (
            <section key={key} aria-label={meta.label} style={{ marginTop: 14 }}>
              <h2 style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: C.muted,
                margin: "0 0 6px", display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Icon size={11} aria-hidden />
                {meta.label} ({list.length})
              </h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {list.map((row) => {
                  const date = row?.date || row?.session_date || row?.day_key || row?.created_date;
                  const title = key === "journal" ? (row.text || row.prompt || "Journal entry")
                              : key === "symptoms" ? (row.symptom_type || row.symptom_name || "Symptom")
                              : key === "meals" ? (row.raw_text || row.description || "Meal")
                              : (row.title || "Task");
                  return (
                    <li key={`${key}-${row.id}`}>
                      <button
                        type="button"
                        onClick={() => navigate(meta.route)}
                        aria-label={`Open ${meta.label}: ${excerpt(title, 60)}`}
                        style={{
                          width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
                          padding: "10px 12px", borderRadius: 12,
                          background: C.paperHi, border: "1px solid rgba(58,44,26,0.08)",
                          textAlign: "left", cursor: "pointer", minHeight: 44,
                        }}
                      >
                        <span style={{
                          flexShrink: 0, fontSize: 11, color: C.muted,
                          paddingTop: 1, minWidth: 50,
                        }}>{fmtDate(date)}</span>
                        <span style={{
                          flex: 1, fontSize: 13, color: C.espresso, lineHeight: 1.4,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>{excerpt(title)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}