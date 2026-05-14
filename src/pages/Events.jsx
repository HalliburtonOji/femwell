import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, MapPin } from "lucide-react";
import { toggleSavedItem } from "@/lib/savedItems";

const TAG_FILTERS = ["all", "social", "fitness", "networking", "culture", "food", "online", "wellness", "nightlife", "dating"];
const PRICE_FILTERS = ["all", "free", "paid"];
const PLATFORM_FILTERS = ["All", "Dice", "Fatsoma", "Meetup", "Time Out", "RA", "Fever"];

const TAG_COLORS = {
  social: "var(--rose-dust)",
  fitness: "var(--sage)",
  nightlife: "var(--plum)",
  culture: "#B89E6A",
  online: "#6B8AC4",
  default: "var(--mauve)",
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

function topTagColor(tags) {
  if (!Array.isArray(tags) || !tags.length) return TAG_COLORS.default;
  return TAG_COLORS[tags[0]] || TAG_COLORS.default;
}

function VerifiedBadge({ verified }) {
  if (verified === true) return (
    <span style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
      Verified
    </span>
  );
  if (verified === false) return (
    <span style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
      Link unverified
    </span>
  );
  return null;
}

function EventCard({ item, saved, onSave }) {
  const stripColor = topTagColor(item.tags);
  const tags = Array.isArray(item.tags) ? item.tags : [];
  return (
    <div style={{
      backgroundColor: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 20, overflow: "hidden", marginBottom: 12,
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Top colour strip */}
      <div style={{ height: 6, borderRadius: "20px 20px 0 0", backgroundColor: stripColor }} />

      {/* Card body */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {/* Left content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tags row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
              {tags.slice(0, 2).map(tag => (
                <span key={tag} style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{tag}</span>
              ))}
              {item.is_online && (
                <span style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Online</span>
              )}
            </div>

            {/* Title */}
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 8 }}>
              {item.title}
            </p>

            {/* Date + Location */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                <CalendarDays style={{ width: 12, height: 12 }} /> {item.date}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                <MapPin style={{ width: 12, height: 12 }} /> {item.is_online ? "Online" : (item.location || item.city || "TBC")}
              </span>
            </div>

            {/* Price row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{
                borderRadius: 9999, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                ...(item.is_free
                  ? { backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }
                  : { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }
                )
              }}>
                {item.is_free ? "Free" : (item.price || "Paid")}
              </span>
              {item.source_name && (
                <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{item.source_name}</span>
              )}
            </div>
          </div>

          {/* Right: verified + save */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <VerifiedBadge verified={item.verified} />
            <button
              onClick={() => onSave(item)}
              style={{
                borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                fontFamily: "'Inter', sans-serif", cursor: "pointer", border: "1px solid var(--border)",
                ...(saved
                  ? { backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", borderColor: "var(--rose-dust-light)" }
                  : { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }
                )
              }}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{item.ticket_platform || item.source_name || ""}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent((item.title || "") + " " + (item.link || ""))}`, "_blank")}
            style={{ backgroundColor: "#25D366", color: "white", borderRadius: 9999, padding: "6px 12px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
          >
            Share
          </button>
          <button
            onClick={() => item.link && window.open(item.link, "_blank")}
            style={{ backgroundColor: "var(--plum)", color: "white", borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
          >
            View event
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [items, setItems] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [events, user] = await Promise.all([
          base44.entities.EventsItems.list("date", 120),
          base44.auth.me(),
        ]);
        const saved = await base44.entities.SavedItems.filter({ user_id: user.id, item_type: "EVENT" }, "-created_at", 120);
        setSavedIds(new Set(saved.map((item) => item.item_id)));
        setItems(events);
      } catch { setItems([]); }
      setLoading(false);
    })();
  }, []);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const priceMatch = priceFilter === "all" || (priceFilter === "free" ? item.is_free : !item.is_free);
      const tagMatch = tagFilter === "all" || (Array.isArray(item.tags) && item.tags.includes(tagFilter));
      const onlineMatch = !onlineOnly || item.is_online === true;
      const platformStr = (item.ticket_platform || item.source_name || "").toLowerCase();
      const platformMatch = platformFilter === "All" || platformStr.includes(platformFilter.toLowerCase());
      return priceMatch && tagMatch && onlineMatch && platformMatch;
    });
  }, [items, priceFilter, tagFilter, onlineOnly]);

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

        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: 20, marginBottom: 16 }}>
          <p style={{ ...sLabel, marginBottom: 8 }}>Community</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fraunces', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
            Events
          </h1>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 6 }}>
            Events, socials, networking, wellness and more — across the UK and online.
          </p>
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: 16, marginBottom: 16 }}>
          <style>{`.ev-scroll::-webkit-scrollbar{display:none}`}</style>

          {/* Online toggle */}
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={() => setOnlineOnly(v => !v)}
              style={onlineOnly ? pillActive : { ...pillInactive, border: "1px solid var(--border)" }}
            >
              Online events only
            </button>
          </div>

          {/* Price filters */}
          <div className="ev-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
            {PRICE_FILTERS.map((f) => (
              <button key={f} onClick={() => setPriceFilter(f)} style={priceFilter === f ? pillActive : pillInactive}>{f}</button>
            ))}
          </div>

          {/* Platform filters */}
          <div className="ev-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 10, paddingBottom: 4, scrollbarWidth: "none" }}>
            {PLATFORM_FILTERS.map((p) => (
              <button key={p} onClick={() => setPlatformFilter(p)} style={platformFilter === p ? pillActive : pillInactive}>{p}</button>
            ))}
          </div>

          {/* Tag filters */}
          <div className="ev-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 10, paddingBottom: 4, scrollbarWidth: "none" }}>
            {TAG_FILTERS.map((t) => (
              <button key={t} onClick={() => setTagFilter(t)} style={tagFilter === t ? pillActive : pillInactive}>{t}</button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: "40px 20px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CalendarDays className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>No events found</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
              Try adjusting your filters or check back after the next refresh.
            </p>
          </div>
        ) : (
          <div>
            {visibleItems.map((item) => (
              <EventCard key={item.id} item={item} saved={savedIds.has(item.id)} onSave={handleSave} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}