// JournalSearch — full-text search across the writer's own entries (Phase 2).
//
// Searches title-less JournalEntries by their body text, tags, type label and
// (for todo / gratitude) their items — all on real data already in memory, so
// there is no extra fetch and nothing leaves the device. Results render in the
// same editorial Ledger; tapping opens the Reader. Calls onSearchingChange so
// the page can collapse the rest of the feed while a query is active.

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { T, UI, Hand, Eyebrow } from "./Editorial";
import JournalLedger from "./JournalLedger";

function haystack(e) {
  const parts = [e.text || ""];
  if (Array.isArray(e.tags)) parts.push(e.tags.join(" "));
  if (e.card_type) parts.push(e.card_type);
  if (Array.isArray(e.todo_items)) parts.push(e.todo_items.map((it) => it?.text || "").join(" "));
  return parts.join(" ").toLowerCase();
}

export default function JournalSearch({ entries, onTap, onThread, onSearchingChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const searching = open && query.length > 0;

  useEffect(() => { onSearchingChange?.(searching); }, [searching, onSearchingChange]);

  const results = useMemo(() => {
    if (!query) return [];
    const tokens = query.split(/\s+/).filter(Boolean);
    const matched = (entries || []).filter((e) => {
      const h = haystack(e);
      return tokens.every((t) => h.includes(t));
    });
    return [...matched.filter((e) => e.is_pinned), ...matched.filter((e) => !e.is_pinned)];
  }, [entries, query]);

  const close = () => { setOpen(false); setQ(""); };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Search your journal" style={{
        display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 18, cursor: "pointer",
        background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 14px",
        fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.muted, letterSpacing: 0.3,
      }}>
        <Search size={13} /> Search your journal
      </button>
    );
  }

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "10px 14px", marginBottom: 14 }}>
        <Search size={15} style={{ color: T.muted, flexShrink: 0 }} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search your words, threads, moments…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: UI, fontSize: 14, color: T.ink }} />
        <button onClick={close} aria-label="Close search" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "inline-flex", padding: 0 }}>
          <X size={16} />
        </button>
      </div>

      {searching && (
        <>
          <Eyebrow mb={12}>
            {results.length === 0 ? "Nothing found" : `${results.length} ${results.length === 1 ? "entry" : "entries"}`}
          </Eyebrow>
          {results.length === 0 ? (
            <Hand size={19} color={T.inkSoft} style={{ display: "block", marginBottom: 8 }}>
              No entries match “{q.trim()}”. Try another word.
            </Hand>
          ) : (
            <JournalLedger entries={results} onTap={onTap} onThread={onThread} />
          )}
        </>
      )}
    </section>
  );
}
