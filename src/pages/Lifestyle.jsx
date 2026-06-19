import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ExternalLink, X, Bookmark, SlidersHorizontal, Check, Sparkles, BookOpen, Headphones, Feather, Moon, Play, Book } from "lucide-react";
import { T, UI, PAPER_BG } from "@/components/journal/Editorial";
import { VineMotifV2, floraKeyframes } from "@/components/brand/flora";
import { FwFloraHero } from "@/components/brand/PageTop";
import { FwCardRow, SummaryCard, ArticleCard, StoryCard, VideoCard, AudioCard, BookCard, DailyStoryCard, HoroscopeCard } from "@/components/brand/Card";
import { CONTENT_CATEGORIES, categoryLabel } from "@/utils/contentCategory";
import BrowseTab from "@/components/lifestyle/browse/BrowseTab";
import ListenTab from "@/components/lifestyle/listen/ListenTab";
import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";
import ContentActionBar from "@/components/common/ContentActionBar";
import HoroscopeTabImpl from "@/components/horoscope/HoroscopeTab";
import JumpToButton from "@/components/layout/JumpToButton";
import LifestyleHubSheet from "@/components/lifestyle/LifestyleHubSheet";
import { useScrollLock } from "@/utils/useScrollLock";

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const PRIMARY = "var(--plum)";
const PRIMARY_LIGHT = "var(--surface)";

// ── Shared spinner ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${PRIMARY_LIGHT}`, borderTopColor: PRIMARY, borderRadius: "50%", animation: "lf-spin 0.7s linear infinite" }} />
    </div>
  );
}

// ── Category pill ─────────────────────────────────────────────────────────────
function Pill({ label, color = PRIMARY, bg = PRIMARY_LIGHT }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color, backgroundColor: bg, borderRadius: 9999, padding: "2px 9px", display: "inline-block", flexShrink: 0 }}>
      {label}
    </span>
  );
}

// ── Full-screen article reader sheet ─────────────────────────────────────────
function ArticleSheet({ item, onClose }) {
  const [saved, setSaved] = useState(false);
  const paragraphs = (item.lede || item.summary || "").split(/\n\n+/).filter(Boolean);
  const takeaways = Array.isArray(item.takeaways) ? item.takeaways : [];

  // Read back the user's current saved state on open. ContentBookmarks is the
  // legacy entity (only stores user_id + content_id, no item_type) so we
  // resolve "saved" through UserProfile.saved_item_ids instead — that's the
  // same source the heart icon uses on cards.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u || cancelled) return;
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, undefined, 1).catch(() => []);
        const ids = Array.isArray(profiles?.[0]?.saved_item_ids) ? profiles[0].saved_item_ids : [];
        if (!cancelled) setSaved(ids.includes(item.id));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [item.id]);

  // Body scroll lock while the sheet is open (shared, ref-counted hook —
  // replaces the old ad-hoc document.body.style.overflow lock). This component
  // only mounts when open, so the lock is always active here.
  useScrollLock(true);

  const handleSave = async () => {
    // Optimistic toggle. Wire through UserProfile.saved_item_ids — the same
    // place every other Lifestyle save touches. Avoids ContentBookmarks, which
    // doesn't have item_type and was silently dropping our saves.
    const next = !saved;
    setSaved(next);
    try {
      const u = await base44.auth.me().catch(() => null);
      if (!u) return;
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, undefined, 1).catch(() => []);
      const row = profiles[0];
      const current = Array.isArray(row?.saved_item_ids) ? row.saved_item_ids : [];
      const nextIds = next
        ? Array.from(new Set([...current, item.id]))
        : current.filter((id) => id !== item.id);
      if (!row?.id) {
        await base44.entities.UserProfile.create({
          user_id: u.id,
          user_email: u.email,
          saved_item_ids: nextIds,
        });
      } else {
        await base44.entities.UserProfile.update(row.id, { saved_item_ids: nextIds });
      }
    } catch {
      // Revert on failure so the UI is honest
      setSaved((v) => !v);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(11,8,5,0.55)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61, backgroundColor: "var(--surface)", borderRadius: "24px 24px 0 0", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 10px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </button>
          <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: saved ? PRIMARY_LIGHT : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: saved ? PRIMARY : "var(--mauve)", }}>
            <Bookmark className="w-3.5 h-3.5" style={{ fill: saved ? PRIMARY : "none" }} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "0 20px 48px" }}>
          {/* Hero image */}
          {item.image_url && (
            <div style={{ height: 220, borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
              <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
            </div>
          )}
          {/* Pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {item.category && <Pill label={item.category} />}
            {item.emotional_tag && <Pill label={item.emotional_tag} color="var(--plum)" bg="var(--surface)" />}
          </div>
          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", lineHeight: 1.3, marginBottom: 10 }}>{item.title}</h2>
          {/* Meta */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {item.author_name && <span style={{ fontSize: 12, color: "var(--mauve)", }}>{item.author_name}</span>}
            {item.published_at && <span style={{ fontSize: 12, color: "var(--mauve)", opacity: 0.7 }}>· {fmtDate(item.published_at)}</span>}
            {item.source_name && <span style={{ fontSize: 12, color: "var(--mauve)", opacity: 0.7 }}>· {item.source_name}</span>}
          </div>
          {/* Body paragraphs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: 15, color: "var(--plum)", lineHeight: 1.75, margin: 0 }}>{stripHtml(para)}</p>
            ))}
          </div>
          {/* Why it matters */}
          {item.why_it_matters && (
            <p style={{ fontSize: 13, color: "var(--mauve)", fontStyle: "italic", lineHeight: 1.65, marginBottom: 20 }}>{item.why_it_matters}</p>
          )}
          {/* Takeaways */}
          {takeaways.length > 0 && (
            <div style={{ backgroundColor: PRIMARY_LIGHT, borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Key takeaways</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {takeaways.map((t, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.65, marginBottom: 6 }}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {/* External link fallback */}
          {item.content_url && (
            <a href={item.content_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
              Read on {item.source_name || "source"} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}

// ── Category gradient placeholders ───────────────────────────────────────────
// Keys mirror the actual `category` values written by ingestRSS /
// summarizeLifestyleItem (see entity samples — "Women's Health",
// "Mental Wellness", etc.). Match-by-keyword so a sub-category like
// "Gut Health" still resolves cleanly.
// On-brand only: every placeholder is a warm cream→palette-tint wash drawn from
// the locked palette (sage / blush / gold / paper). No generic blues, greens,
// or violets — categories are differentiated by which palette accent they lean
// into (sage for health/movement, blush for cycle/skin/relationships, gold for
// nutrition/gut/culture), all over the editorial paper cream.
const CAT_GRADIENTS = {
  "Women's Health":  `linear-gradient(135deg, ${T.paperHi} 0%, ${T.sage} 100%)`,
  "Mental Wellness": `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Gut Health":      `linear-gradient(135deg, ${T.paperHi} 0%, ${T.gold} 100%)`,
  "Nutrition":       `linear-gradient(135deg, ${T.paperHi} 0%, ${T.gold} 100%)`,
  "Movement":        `linear-gradient(135deg, ${T.paperHi} 0%, ${T.sage} 100%)`,
  "Fitness":         `linear-gradient(135deg, ${T.paperHi} 0%, ${T.sage} 100%)`,
  "Cycle":           `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Hormones":        `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Menopause":       `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Skin":            `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Skin & Hair":     `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Sleep":           `linear-gradient(135deg, ${T.paperHi} 0%, ${T.paperDeep} 100%)`,
  "Relationships":   `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Self Care":       `linear-gradient(135deg, ${T.paperHi} 0%, ${T.blush} 100%)`,
  "Lifestyle":       `linear-gradient(135deg, ${T.paperHi} 0%, ${T.gold} 100%)`,
  "Culture":         `linear-gradient(135deg, ${T.paperHi} 0%, ${T.gold} 100%)`,
  "default":         "linear-gradient(135deg, var(--surface) 0%, var(--cream-2) 100%)",
};

function getCatGradient(category) {
  if (!category) return CAT_GRADIENTS.default;
  if (CAT_GRADIENTS[category]) return CAT_GRADIENTS[category];
  // Loose keyword fallback so unrecognised sub-categories still get colour.
  const lower = String(category).toLowerCase();
  if (lower.includes("mental") || lower.includes("psych"))  return CAT_GRADIENTS["Mental Wellness"];
  if (lower.includes("gut") || lower.includes("digest"))    return CAT_GRADIENTS["Gut Health"];
  if (lower.includes("health"))                              return CAT_GRADIENTS["Women's Health"];
  if (lower.includes("nutrition") || lower.includes("food")) return CAT_GRADIENTS["Nutrition"];
  if (lower.includes("move") || lower.includes("fitness"))   return CAT_GRADIENTS["Movement"];
  if (lower.includes("cycle") || lower.includes("hormone"))  return CAT_GRADIENTS["Hormones"];
  if (lower.includes("menopause"))                           return CAT_GRADIENTS["Menopause"];
  if (lower.includes("skin") || lower.includes("hair"))      return CAT_GRADIENTS["Skin & Hair"];
  if (lower.includes("sleep"))                               return CAT_GRADIENTS["Sleep"];
  if (lower.includes("relation") || lower.includes("love"))  return CAT_GRADIENTS["Relationships"];
  if (lower.includes("self") || lower.includes("care"))      return CAT_GRADIENTS["Self Care"];
  if (lower.includes("culture") || lower.includes("art"))    return CAT_GRADIENTS["Culture"];
  return CAT_GRADIENTS.default;
}

// ── Tappable item card (opens sheet or new tab) ───────────────────────────────
function ContentCard({ item, compact = false }) {
  const [open, setOpen] = useState(false);
  const isRealExternal = !!item.content_url && !item.content_url.includes("femwell") && !item.content_url.startsWith("/");
  const hasInternalContent = !isRealExternal || item.lede || item.provider === "FEMWELL_AI";
  const sourceName = item.source_name || "FemWell Editorial";
  const hasExternalLink = isRealExternal && !item.lede && item.provider !== "FEMWELL_AI";

  const handleClick = () => {
    if (hasExternalLink) {
      window.open(item.content_url, "_blank", "noopener,noreferrer");
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {compact ? (
        <div onClick={handleClick} style={{ display: "flex", gap: 12, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 90, flexShrink: 0, overflow: "hidden" }}>
            {item.image_url
              ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = getCatGradient(item.category); }} />
              : <div style={{ width: "100%", height: "100%", minHeight: 80, background: getCatGradient(item.category) }} />
            }
          </div>
          <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
            {item.category && <Pill label={item.category} />}
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", lineHeight: 1.35, margin: "6px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "var(--mauve)", }}>{sourceName}</span>
              {item.published_at && <span style={{ fontSize: 12, color: "var(--mauve)", opacity: 0.6 }}>· {fmtDate(item.published_at)}</span>}
              {hasExternalLink && <ExternalLink style={{ width: 10, height: 10, color: "var(--mauve)", opacity: 0.5, flexShrink: 0 }} />}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "block", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ height: 180, overflow: "hidden" }} onClick={handleClick}>
            {item.image_url
              ? <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = getCatGradient(item.category); }} />
              : <div style={{ width: "100%", height: "100%", background: getCatGradient(item.category) }} />
            }
          </div>
          <div style={{ padding: "14px 16px 16px" }} onClick={handleClick}>
            {item.category && <Pill label={item.category} />}
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", lineHeight: 1.4, margin: "8px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</p>
            {item.summary && <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>{stripHtml(item.summary)}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 12, color: "var(--mauve)", }}>{sourceName}</span>
                {hasExternalLink && <ExternalLink style={{ width: 10, height: 10, color: "var(--mauve)", opacity: 0.5 }} />}
              </div>
              {hasExternalLink && (
                <a href={item.content_url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  Read more <ExternalLink style={{ width: 10, height: 10 }} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      {open && <ArticleSheet item={item} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── FOR YOU tab ───────────────────────────────────────────────────────────────
// Implementation moved to components/lifestyle/foryou/ForYouTab.jsx

// ── DAILY STORY tab ───────────────────────────────────────────────────────────
// DailyStoryReader internally pulls the active arc + chapter count from the
// DailyStory entity, so the page indicator stays honest if the arc length
// changes. Series fallback is "Daily Story" inside the reader itself.
function DailyStoryTab() {
  return (
    <>
      <DailyStoryReader />
      <div style={{ padding: "0 16px 20px" }}>
        <ContentActionBar
          label="Stay with it"
          reflect={{ seed: "What today's story stirred in me — ", type: "reflection" }}
          discuss={{ room: "lounge", seed: "Anyone else reading the daily story? What did it stir?" }}
        />
      </div>
    </>
  );
}


// ── HOROSCOPE tab ─────────────────────────────────────────────────────────────
// HoroscopeTab is now the dedicated personalised reader living in
// components/lifestyle/horoscope/. The 12-button zodiac picker stub was
// replaced 2026-05-12 with the full MP-Horo-A rebuild: hero · triad ·
// today's weather · cycle × moon · transits. Birth data captured via
// BirthDataSheet, readings generated daily by `generateHoroscopeReading`.
function HoroscopeTab({ userProfile, lifestyleProfile }) {
  return (
    <HoroscopeTabImpl
      userProfile={userProfile}
      lifestyleProfile={lifestyleProfile}
    />
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <p style={{ fontSize: 14, color: "var(--mauve)", }}>{text}</p>
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
// 2026-05-14: renamed "Browse" → "Read" per Halli. ID also changed to "read"
// so URLs reflect the new label. Old ?tab=browse URLs auto-redirect to ?tab=read
// via the resolveTab helper below.
const TABS = [
  { id: "for_you",     label: "For You" },
  { id: "read",        label: "Read" },
  { id: "listen",      label: "Listen" },
  { id: "books",       label: "Books" },
  { id: "daily_story", label: "Daily Story" },
  { id: "horoscope",   label: "Horoscope" },
];

// Map legacy tab IDs from old URLs to current ones. Keep stable forever — users
// have bookmarks + emails with old links.
const LEGACY_TAB_REDIRECTS = { browse: "read" };

// Content-type chips per tab. Read tab = Articles / Stories / Books / Guides;
// Listen tab = Videos / Podcasts. (Practice removed 2026-05-14 — feature was
// stale, no destination to play migrated practice rows.)
const TAB_CHIPS = {
  read: [
    { id: "all",      label: "All" },
    { id: "articles", label: "Articles" },
    { id: "stories",  label: "Stories" },
    { id: "books",    label: "Books" },
    { id: "guides",   label: "Guides" },
  ],
  listen: [
    { id: "all",      label: "All" },
    { id: "videos",   label: "Videos" },
    { id: "podcasts", label: "Podcasts" },
  ],
};

// Horizontal-scroll chip row that lives in the Lifestyle sticky header on the
// same line as the Filter dropdown. Highlights the active chip, scrolls it to
// view-centre on tap. Tab-aware via the `tab` prop.
function InlineChipRow({ tab, activeChip, onChange }) {
  const ref = useRef(null);
  const chips = TAB_CHIPS[tab] || [];
  if (chips.length === 0) return null;
  const handle = (id) => {
    onChange(id);
    const btn = ref.current?.querySelector(`[data-chip="${id}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };
  return (
    <div
      ref={ref}
      role="group"
      aria-label={`${tab === "read" ? "Read" : "Listen"} content filters`}
      className="lf-scroll"
      style={{
        display: "flex",
        gap: 6,
        flex: 1,
        minWidth: 0,
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`.lf-scroll::-webkit-scrollbar{display:none}`}</style>
      {chips.map(chip => {
        const active = chip.id === activeChip;
        return (
          <button
            key={chip.id}
            data-chip={chip.id}
            type="button"
            onClick={() => handle(chip.id)}
            aria-pressed={active}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              border: active ? "1px solid var(--plum)" : "1px solid var(--border)",
              whiteSpace: "nowrap",
              minHeight: 36,
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: active ? "var(--plum)" : "var(--cream)",
              color: active ? "white" : "var(--plum-deep)",
              transition: "all 0.15s",
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Category filter dropdown — Option B from Atelier review ───────────────────
// Single right-aligned filter-icon button. Click opens a popover with category
// checkboxes (multi-select). Active count appears as a badge on the icon.
// `selected` is an array of category slugs (empty = "all").
function CategoryFilterDropdown({ selected, onChange, followedCategories = [], inline = false }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const followedSet = new Set(
    (Array.isArray(followedCategories) ? followedCategories : []).map((c) => String(c).toLowerCase())
  );
  const selectedSet = new Set((selected || []).map((c) => String(c).toLowerCase()));
  const count = selectedSet.size;

  // Click-outside + Escape to close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (cat) => {
    const slug = String(cat).toLowerCase();
    const next = new Set(selectedSet);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange(Array.from(next));
  };
  const clear = () => onChange([]);

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "flex-end", marginTop: inline ? 0 : 8, flexShrink: 0 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={count ? `Filter — ${count} selected` : "Filter by category"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: inline ? "8px 12px" : "8px 14px",
          borderRadius: 9999,
          fontSize: 12, fontWeight: 600,
          minHeight: 36, cursor: "pointer",
          border: "1px solid var(--border)",
          background: count ? "var(--surface)" : "var(--cream)",
          color: count ? "var(--plum)" : "var(--plum-deep)",
          position: "relative",
        }}
      >
        <SlidersHorizontal style={{ width: 14, height: 14 }} />
        {!inline && <span>Filter</span>}
        {count > 0 && (
          <span
            aria-hidden="true"
            style={{
              marginLeft: 2, minWidth: 18, height: 18, padding: "0 5px",
              borderRadius: 9999,
              background: "var(--plum)", color: "white",
              font: "700 10px/18px 'Inter', sans-serif",
              textAlign: "center",
            }}
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Filter by category"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0,
            width: 260, zIndex: 40,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow:
              "0 2px 4px rgba(43,30,22,0.06), 0 10px 24px rgba(43,30,22,0.10), 0 24px 56px rgba(43,30,22,0.08)",
            padding: 12,
            }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ font: "700 11px/1 'Inter', sans-serif", color: "var(--plum-mute)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              Categories
            </p>
            <button
              type="button" onClick={clear} disabled={count === 0}
              style={{
                background: "none", border: "none",
                color: count ? "var(--plum)" : "var(--plum-mute)",
                opacity: count ? 1 : 0.5,
                cursor: count ? "pointer" : "default",
                font: "500 11px/1 'Inter', sans-serif",
                padding: 0,
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxHeight: 320, overflowY: "auto" }}>
            {CONTENT_CATEGORIES.map((cat) => {
              const slug = String(cat).toLowerCase();
              const isActive = selectedSet.has(slug);
              const isFollowed = followedSet.has(slug);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggle(cat)}
                  aria-pressed={isActive}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "8px 6px", border: "none",
                    background: "none", cursor: "pointer", textAlign: "left",
                    borderRadius: 8,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 18, height: 18, borderRadius: 5,
                      border: isActive ? "1px solid var(--plum)" : "1px solid var(--border)",
                      background: isActive ? "var(--plum)" : "transparent",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {isActive && <Check style={{ width: 12, height: 12 }} />}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--plum-deep)" }}>
                    {categoryLabel(cat)}
                  </span>
                  {isFollowed && (
                    <span
                      aria-label="Followed"
                      style={{
                        width: 6, height: 6, borderRadius: 9999,
                        background: "var(--rose-soft)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Resolve a URL tab param to a canonical tab ID. Honours LEGACY_TAB_REDIRECTS
// so old `?tab=browse` URLs (bookmarks, emails) redirect to the new id.
function resolveTabId(raw) {
  if (!raw) return "for_you";
  const redirected = LEGACY_TAB_REDIRECTS[raw] || raw;
  return TABS.some(t => t.id === redirected) ? redirected : "for_you";
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Lifestyle() {
  const [tab, setTabState] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    const resolved = resolveTabId(p);
    // If the URL had a legacy id (`?tab=browse`), repair it on first paint so
    // share + bookmark behaviour matches the current ID forever.
    if (p && p !== resolved) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", resolved);
        window.history.replaceState({}, "", url.toString());
      } catch { /* silent */ }
    }
    return resolved;
  });
  // setTab also writes ?tab=... to the URL so the browser back-stack remembers
  // which tab the user was on when they opened a reader. Without this, hitting
  // ← inside FictionReader / BookReader pops back to /Lifestyle with no tab
  // param, which falls through to the For-You default.
  const setTab = (next) => {
    setTabState(next);
    try {
      const url = new URL(window.location.href);
      if (next === "for_you") url.searchParams.delete("tab");
      else url.searchParams.set("tab", next);
      // pushState (not replace) so back returns to the previous tab too.
      window.history.pushState({}, "", url.toString());
    } catch { /* silent — URL sync is non-critical */ }
  };

  // Brand-P2: central "Jump to" switcher (app-wide rule for multi-layer pages).
  const [hubOpen, setHubOpen] = useState(false);
  // Brand-P2: Today-style header — the filter panel opens from the top-right square
  // control (mirrors Today's calendar square), keeping the masthead clean.
  const [showFilters, setShowFilters] = useState(false);
  // Brand-P2: real signals for the hero/summary/section cards (graceful, never hollow).
  const [landing, setLanding] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, story, horo, gutenberg] = await Promise.all([
          base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 60).catch(() => []),
          base44.entities.DailyStory.filter({}, "-created_date", 1).catch(() => []),
          base44.entities.HoroscopeReading.filter({}, "-reading_date", 1).catch(() => []),
          // Public-domain books (gutendex) so the Books row has MORE than the FemWell fiction —
          // each opens in /BookReader on THAT book. Guarded + timeboxed; empty on failure.
          (async () => {
            try {
              const r = await fetch("https://gutendex.com/books?topic=women&languages=en&page_size=12", { signal: AbortSignal.timeout(8000) });
              if (!r.ok) return [];
              const d = await r.json();
              return (Array.isArray(d?.results) ? d.results : []).map((b) => ({
                id: `gut-${b.id}`, _gutenbergId: b.id, _book: "gutenberg",
                title: b.title || "", author_name: (b.authors?.[0]?.name) || "Public domain",
                summary: `A free, public-domain read${b.authors?.[0]?.name ? ` by ${b.authors[0].name}` : ""}.`,
                image_url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`,
              }));
            } catch { return []; }
          })(),
        ]);
        if (cancelled) return;
        const arr = (Array.isArray(items) ? items : []).filter((i) => i && i.title);
        const typeOf = (i) => String(i?.media_type || i?.content_type || "").toUpperCase();
        const read = arr.find((i) => /ARTICLE|READ|ESSAY/.test(typeOf(i))) || arr.find((i) => !/PODCAST|AUDIO|VIDEO/.test(typeOf(i)));
        const listen = arr.find((i) => /PODCAST|AUDIO|VIDEO/.test(typeOf(i)));
        setLanding({
          all: arr,                       // full set, grouped into per-type rows below
          gutenberg: Array.isArray(gutenberg) ? gutenberg : [],
          read: read || null,
          listen: listen || null,
          foryou: arr[0] || null,
          story: (Array.isArray(story) ? story[0] : null) || null,
          horoscope: (Array.isArray(horo) ? horo[0] : null) || null,
        });
      } catch { if (!cancelled) setLanding({}); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Honour browser back/forward between tabs (with legacy redirect).
  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get("tab");
      setTabState(resolveTabId(p));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Active filter chip — shared across Read + Listen tabs. URL-synced via
  // ?filter=. Each tab body honours the chip independently; we just live the
  // state up so the chips can render in the sticky header alongside the
  // category filter button.
  const [activeChip, setActiveChipState] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("filter");
    return p || "all";
  });
  const setActiveChip = (next) => {
    setActiveChipState(next);
    try {
      const url = new URL(window.location.href);
      if (next === "all") url.searchParams.delete("filter");
      else url.searchParams.set("filter", next);
      window.history.replaceState({}, "", url.toString());
    } catch { /* silent */ }
  };
  // Whenever the tab changes, reset chip to "all" — Read and Listen have
  // different chip sets, so a Listen `practice` choice shouldn't leak to Read.
  useEffect(() => { setActiveChipState("all"); }, [tab]);

  // Option B (Atelier review): multi-select category filter as array of slugs.
  // Empty array = "all". Downstream tabs accept array OR legacy single string.
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [followedCategories, setFollowedCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (u?.id) {
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
          const followed = profiles?.[0]?.followed_categories;
          if (Array.isArray(followed)) setFollowedCategories(followed);
        }
      } catch { /* silent */ }
    })();
  }, []);

  const isForYou = tab === "for_you";

  return (
    <div className="min-h-screen pb-28" style={{ ...PAPER_BG, position: "relative", overflowX: "clip" }}>
      <style>{`.lf-scroll::-webkit-scrollbar{display:none}.lf-scroll{-ms-overflow-style:none;scrollbar-width:none}@keyframes lf-spin{to{transform:rotate(360deg)}}.space-y-3>*+*{margin-top:12px}.space-y-4>*+*{margin-top:16px}.space-y-2>*+*{margin-top:8px}`}</style>

      {/* botanical page texture — one low-opacity vine per fold (Lifestyle char = gold/blush), clipped, behind content */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <style>{floraKeyframes}</style>
        <div style={{ position: "absolute", top: 240, right: -26 }}><VineMotifV2 color={T.gold} color2={T.blush} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 820, left: -28 }}><VineMotifV2 color={T.blush} color2={T.gold} opacity={0.08} w={140} flip /></div>
        <div style={{ position: "absolute", top: 1420, right: -24 }}><VineMotifV2 color={T.gold} color2={T.blush} opacity={0.08} w={140} /></div>
      </div>

      {/* Header — TODAY-page template, adapted "lifestyle style" (Brand-P2): a clean masthead
          on the page paper (NO boxed/sticky band, no bottom-rule) — a centered top strip with the
          Jump-to control pinned left, a centered icon+label, and a square control pinned right
          (Today's calendar square → here the Filter panel), flowing straight into the centered
          masthead + the tab pill row. Reads as a sibling of the Today/Journal headers. */}
      {/* Pinned "Jump to" — follows the scroll (fixed, top-left), always reachable. */}
      <JumpToButton pinned onClick={() => setHubOpen(true)} />
      <header style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 0", position: "relative", zIndex: 1 }}>
        {/* top strip — (pinned jump-to floats top-left) · centered label · square Filter control (right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 6, position: "relative", minHeight: 34 }}>
          <Sparkles size={14} color={T.muted} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>Discover</span>
          {tab !== "daily_story" && tab !== "horoscope" && (
            <button onClick={() => setShowFilters(v => !v)} aria-label="Filters" aria-pressed={showFilters} title="Filters"
              style={{ position: "absolute", right: 0, top: -2, width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: showFilters ? T.gold : T.paperHi, display: "grid", placeItems: "center", cursor: "pointer" }}>
              <SlidersHorizontal size={18} color={showFilters ? T.ink : T.muted} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* HERO — the canonical signature flora hero (BRAND_IDENTITY §6.8 · brand/PageTop). */}
        <FwFloraHero title="Lifestyle" bloom="daisy" colorway="gold" flankL="iris" flankR="sunflower"
          line="A few good things to read, hear and feel today — whenever you have a moment." />

        {/* tabs — a clean scrollable pill row flowing under the masthead (no boxed band) */}
        <div className="lf-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, marginTop: 16 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              aria-label={`Switch to ${t.label} tab`}
              aria-pressed={tab === t.id}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", minHeight: 34,
                fontFamily: UI,
                border: tab === t.id ? "none" : `1px solid ${T.paperDeep}`,
                backgroundColor: tab === t.id ? T.gold : "transparent",
                color: tab === t.id ? T.ink : T.muted }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter panel — opens from the top-right square (Today's calendar-square pattern). */}
        {showFilters && (tab === "read" || tab === "listen") ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <InlineChipRow
              tab={tab}
              activeChip={activeChip}
              onChange={setActiveChip}
            />
            <CategoryFilterDropdown
              selected={categoryFilter}
              onChange={setCategoryFilter}
              followedCategories={followedCategories}
              inline
            />
          </div>
        ) : showFilters && tab !== "daily_story" && tab !== "horoscope" ? (
          <div style={{ marginTop: 10 }}>
            <CategoryFilterDropdown
              selected={categoryFilter}
              onChange={setCategoryFilter}
              followedCategories={followedCategories}
            />
          </div>
        ) : null}
      </header>

      {/* Content — different widths per tab.
          - For-You bento: wide (1200px) so the grid breathes.
          - Horoscope: medium (820px) so the Plum Night section cards have
            air on desktop without becoming uncomfortable to read; mobile
            still gets the full viewport width.
          - Browse / Listen / Daily Story: tight 576px column (mobile-frame
            magazine feel — unchanged). */}
      {isForYou ? (
        <LifestyleForYou landing={landing} navigate={navigate} onJump={setTab} />
      ) : tab === "horoscope" ? (
        <div className="mx-auto pt-5" style={{ maxWidth: 820, position: "relative", zIndex: 1 }}>
          <HoroscopeTab />
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-4 pt-5" style={{ position: "relative", zIndex: 1 }}>
          {tab === "read"        && <BrowseTab categoryFilter={categoryFilter} activeChip={activeChip} />}
          {tab === "listen"      && <ListenTab categoryFilter={categoryFilter} activeChip={activeChip} />}
          {tab === "books"       && <BrowseTab categoryFilter={categoryFilter} activeChip="books" />}
          {tab === "daily_story" && <DailyStoryTab />}
        </div>
      )}

      {/* Brand-P2: central "Jump to" switcher sheet (app-wide multi-layer-page rule). */}
      <LifestyleHubSheet open={hubOpen} onClose={() => setHubOpen(false)} onSelect={(id) => setTab(id)} />
    </div>
  );
}

// ── FOR-YOU LANDING — the canonical signature content (BRAND_IDENTITY §6.7/§6.8) ──────────────
// ONE summary card → per-TYPE sliding rows of the §6.7 brand cards (brand/Card.jsx). Every card
// deep-links the EXACT item full-screen; video/audio play IN the card. The Books row leads with
// today's Daily Story, then FemWell fiction + public-domain books (more than two).
function lfTypeOf(i) {
  const m = String(i?.media_type || "").toUpperCase();
  const c = String(i?.content_type || "").toUpperCase();
  if (/PODCAST|AUDIO/.test(m)) return "audio";
  if (/VIDEO|CLIP|TIKTOK|INSTAGRAM|REEL/.test(m)) return "video";
  if (c === "FICTION") return "book";
  if (c === "STORY") return "story";
  if (c === "GUIDE") return "guide";
  return "article";
}
function LifestyleForYou({ landing, navigate, onJump }) {
  const L = landing || {};
  const arr = Array.isArray(L.all) ? L.all : [];
  const by = {};
  arr.forEach((i) => { const t = lfTypeOf(i); (by[t] = by[t] || []).push(i); });

  const detail = (id) => navigate(createPageUrl(`LifestyleDetail?id=${id}`));
  const openItem = (it) => detail(it.id);
  const openBook = (it) => {
    if (it._book === "gutenberg") navigate(createPageUrl(`BookReader?gutenberg_id=${it._gutenbergId}`));
    else navigate(createPageUrl(`FictionReader?id=${it.id}`));
  };

  // SUMMARY recs — signal-driven, graceful fallback, deep-linking the specific item.
  const recs = [];
  if (L.read?.id) recs.push({ Icon: BookOpen, label: "Read", text: L.read.title, onClick: () => detail(L.read.id) });
  if (L.listen?.id) recs.push({ Icon: Headphones, label: "Listen", text: L.listen.title, onClick: () => detail(L.listen.id) });
  if (L.story?.title) recs.push({ Icon: Feather, label: "Daily story", text: L.story.title, onClick: () => onJump("daily_story") });
  if (recs.length < 2) {
    if (!recs.find((r) => r.label === "Read")) recs.push({ Icon: BookOpen, label: "Read", text: "A fresh essay to sink into.", onClick: () => onJump("read") });
    if (!recs.find((r) => r.label === "Listen")) recs.push({ Icon: Headphones, label: "Listen", text: "A calm listen for later.", onClick: () => onJump("listen") });
  }

  const fiction = by.book || [];
  const gutenberg = Array.isArray(L.gutenberg) ? L.gutenberg : [];
  const booksRow = [...(L.story ? [{ __kind: "daily" }] : []), ...fiction, ...gutenberg].slice(0, 14);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 600, margin: "18px auto 0", padding: "0 16px" }}>
        <SummaryCard rows={recs.slice(0, 3)} />
      </div>

      <FwCardRow label="Articles" Icon={BookOpen} accent="#8E6E8E" items={(by.article || []).slice(0, 10)}
        render={(it) => <ArticleCard key={it.id} item={it} onOpen={() => openItem(it)} />} />

      <FwCardRow label="Books" Icon={Book} accent="#5F7E8E" items={booksRow}
        render={(it) => it.__kind === "daily"
          ? <DailyStoryCard key="daily" item={L.story || {}} onOpen={() => onJump("daily_story")} />
          : <BookCard key={it.id} item={it} onOpen={() => openBook(it)} />} />

      <FwCardRow label="Watch" Icon={Play} accent={T.gold} items={(by.video || []).slice(0, 10)}
        render={(it) => <VideoCard key={it.id} item={it} onOpen={() => openItem(it)} />} />

      <FwCardRow label="Listen" Icon={Headphones} accent={T.sage} items={(by.audio || []).slice(0, 10)}
        render={(it) => <AudioCard key={it.id} item={it} onOpen={() => openItem(it)} />} />

      <FwCardRow label="Stories" Icon={Feather} accent={T.crimson} items={(by.story || []).slice(0, 10)}
        render={(it) => <StoryCard key={it.id} item={it} onOpen={() => openItem(it)} />} />

      {/* Horoscope — a REAL snippet, as its own row */}
      <FwCardRow label="Your sky" Icon={Moon} accent="#5F7E8E" items={[{ __kind: "horo" }]}
        render={() => <HoroscopeCard key="horo" reading={L.horoscope} onOpen={() => onJump("horoscope")} />} />
    </div>
  );
}
