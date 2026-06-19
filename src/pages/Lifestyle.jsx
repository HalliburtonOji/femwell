import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ExternalLink, X, Bookmark, SlidersHorizontal, Check, Sparkles, BookOpen, Headphones, Feather, Moon, ArrowRight, ChevronRight, Play, Book } from "lucide-react";
import { T, UI, SERIF, SCRIPT, Eyebrow, PAPER_BG, Heart as BrandHeart } from "@/components/journal/Editorial";
import { VineMotifV2, FlowerGlyph, CardCorner, RichBloomV2, SwayBloom, Butterfly, floraKeyframes, cwOf } from "@/components/brand/flora";
import CardStack from "@/components/planner-v2/CardStack";
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
        const [items, story, horo] = await Promise.all([
          base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 60).catch(() => []),
          base44.entities.DailyStory.filter({}, "-created_date", 1).catch(() => []),
          base44.entities.HoroscopeReading.filter({}, "-reading_date", 1).catch(() => []),
        ]);
        if (cancelled) return;
        const arr = (Array.isArray(items) ? items : []).filter((i) => i && i.title);
        const typeOf = (i) => String(i?.media_type || i?.content_type || "").toUpperCase();
        const read = arr.find((i) => /ARTICLE|READ|ESSAY/.test(typeOf(i))) || arr.find((i) => !/PODCAST|AUDIO|VIDEO/.test(typeOf(i)));
        const listen = arr.find((i) => /PODCAST|AUDIO|VIDEO/.test(typeOf(i)));
        setLanding({
          all: arr,                       // full set, grouped into per-type rows below
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

        {/* HERO — illustrated top section (echoes Today's hero, in Lifestyle's own style):
            a large daisy bloom (radiance/joy — NOT the cycle/companion bloom) in a purely
            DECORATIVE botanical ring (no cycle phase), soft glow + a resting butterfly, then the
            carved heart + Ephesis script title + a short supportive line. */}
        <LifestyleHero />

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
        <>
          {/* Today-style landing: summary recommendations + a per-section card slider */}
          <LifestyleLanding landing={landing} onJump={setTab} navigate={navigate} />
          {/* Content restructured into per-TYPE horizontal sliding rows (replaces the old
              mixed "More to explore" feed): Articles · Stories · Videos · Podcasts · Books · Guides,
              each a CardStack whose cards deep-link straight to the item full-screen. */}
          <LifestyleTypeRows items={landing?.all} navigate={navigate} />
        </>
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

// ── HERO — illustrated top section (Today's hero CONCEPT, Lifestyle's own style) ──────────────
// A large daisy bloom (radiance/joy — NOT the cycle/companion bloom) inside a purely DECORATIVE
// botanical ring (no cycle-phase encoding), soft glow + a resting butterfly, then the carved
// heart + Ephesis script title + a short supportive line. Lifestyle page-character = gold.
function LifestyleHero() {
  const cw = cwOf("gold");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
        {/* soft coloured glow */}
        <div aria-hidden style={{ position: "absolute", top: "48%", left: "50%", width: 296, height: 296, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${cw.petal}38 0%, ${T.sage}1F 44%, transparent 70%)`, animation: "fwcGlow 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        {/* resting butterfly */}
        <div style={{ position: "absolute", top: 6, right: 42, zIndex: 2, pointerEvents: "none" }}><Butterfly size={40} color={cw.petal} color2={cw.tip} pattern="bands" animate idx="lf-bf" /></div>
        {/* DECORATIVE ring (dashed gold + thin sage — no phase markers) + the bloom */}
        <div style={{ position: "relative", zIndex: 1, width: 244, height: 244, display: "grid", placeItems: "center" }}>
          <svg width="244" height="244" viewBox="0 0 244 244" aria-hidden style={{ position: "absolute", inset: 0 }}>
            <circle cx="122" cy="122" r="114" fill="none" stroke={T.gold} strokeWidth="1.5" opacity="0.5" strokeDasharray="2 9" strokeLinecap="round" />
            <circle cx="122" cy="122" r="102" fill="none" stroke={T.sage} strokeWidth="1" opacity="0.4" />
          </svg>
          <SwayBloom animate idx={3}>
            <RichBloomV2 form="daisy" color={cw.petal} color2={cw.tip} accent={T.gold} size={170} animate soft idx="lf-hero" />
          </SwayBloom>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: -2, flexWrap: "wrap", justifyContent: "center" }}>
        <FlowerGlyph variant="iris" size={22} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx="lf-hf-l" />
        <BrandHeart size={16} />
        <div style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 44, lineHeight: 1.05, color: T.ink }}>Lifestyle</div>
        <FlowerGlyph variant="sunflower" size={22} color={cwOf("gold").petal} color2={cwOf("gold").tip} idx="lf-hf-r" />
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>
        A few good things to read, hear and feel today — whenever you have a moment.
      </div>
    </div>
  );
}

// ── LANDING — a "what to dip into today" summary card + a per-section CardStack slider ────────
// Reuses the shared CardStack (Journal/Planner geometry). Each section card carries a hook + a
// real recommendation (graceful curated fallback — never hollow) + an action into that section.
function LifestyleLanding({ landing, onJump, navigate }) {
  const L = landing || {};
  // Deep-link a specific item full-screen when we have one; else fall back to the section.
  const openRec = (item, tab) => {
    if (item?.id) { navigate(createPageUrl(`LifestyleDetail?id=${item.id}`)); return; }
    onJump(tab);
  };
  const recs = [];
  if (L.read?.title) recs.push({ icon: BookOpen, label: "Read", text: L.read.title, tab: "read", item: L.read });
  if (L.listen?.title) recs.push({ icon: Headphones, label: "Listen", text: L.listen.title, tab: "listen", item: L.listen });
  if (L.story?.title) recs.push({ icon: Feather, label: "Daily story", text: L.story.title, tab: "daily_story", item: null });
  if (recs.length < 2) {
    if (!recs.find((r) => r.tab === "read")) recs.push({ icon: BookOpen, label: "Read", text: "A fresh essay to sink into.", tab: "read", item: null });
    if (!recs.find((r) => r.tab === "listen")) recs.push({ icon: Headphones, label: "Listen", text: "A calm listen for the in-between moments.", tab: "listen", item: null });
  }
  const top2 = recs.slice(0, 3);

  const SECTIONS = [
    { key: "for_you", section: "For You", Icon: Sparkles, accent: T.gold, flower: "sunflower",
      hook: "Picked for your day", line: L.foryou?.title ? `Today: ${L.foryou.title}` : "A small, curated handful — tuned to where you are.", cta: "See your picks", tab: "for_you" },
    { key: "read", section: "Read", Icon: BookOpen, accent: "#8E6E8E", flower: "iris",
      hook: "A read for today", line: L.read?.title || "Essays and long reads, gathered for you.", cta: L.read?.id ? "Read this" : "Open Read", tab: "read", item: L.read },
    { key: "listen", section: "Listen", Icon: Headphones, accent: T.sage, flower: "bluebell",
      hook: "Something to listen to", line: L.listen?.title || "A podcast or two, for the in-between moments.", cta: L.listen?.id ? "Listen now" : "Open Listen", tab: "listen", item: L.listen },
    { key: "daily_story", section: "Daily Story", Icon: Feather, accent: T.crimson, flower: "poppy",
      hook: "Today's chapter", line: L.story?.title ? `“${L.story.title}”` : "Pick today's chapter back up where you left it.", cta: "Read today's chapter", tab: "daily_story" },
    { key: "horoscope", section: "Horoscope", Icon: Moon, accent: "#5F7E8E", flower: "violet",
      hook: "Your sky today", line: L.horoscope?.headline || (typeof L.horoscope?.narrative === "string" ? L.horoscope.narrative.slice(0, 90) : "Read your sky, or set up your chart."), cta: "Open Horoscope", tab: "horoscope" },
  ];

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* SUMMARY CARD — recommendations / "what to do" today */}
      <div style={{ maxWidth: 600, margin: "18px auto 0", padding: "0 16px" }}>
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #FBF4E1 0%, #F4E7C4 100%)", border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 18, padding: "16px 18px", boxShadow: "0 8px 28px rgba(58,44,26,0.14), 0 2px 6px rgba(58,44,26,0.08)" }}>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>A few good things today</div>
          {top2.map((r, i) => (
            <button key={i} onClick={() => openRec(r.item, r.tab)} style={{ display: "flex", alignItems: "flex-start", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0" }}>
              <r.icon size={16} style={{ color: T.gold, marginTop: 3, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>{r.label}</span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4, display: "block" }}>{r.text}</span>
              </span>
              <ArrowRight size={15} style={{ color: T.muted, flexShrink: 0, marginTop: 4 }} />
            </button>
          ))}
        </div>
      </div>

      {/* SECTION CARDS — shared CardStack slider; one engaging card per Lifestyle section */}
      <div style={{ maxWidth: 600, margin: "14px auto 0", padding: "0 4px" }}>
        <CardStack label="Explore">
          {SECTIONS.map((s) => (
            <article key={s.key} style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${s.accent}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${s.accent}`, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", minHeight: 250, boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><s.Icon size={16} style={{ color: s.accent }} /></span>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: s.accent }}>{s.section}</span>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={s.flower} size={28} color={s.accent} idx={`lf-mb-${s.key}`} /></span>
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3 }}>{s.hook}</h3>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{s.line}</p>
              <div style={{ marginTop: "auto" }}>
                <button onClick={() => openRec(s.item, s.tab)} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: s.accent, color: T.paper, border: "none", borderRadius: 12, padding: "11px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {s.cta} <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </CardStack>
      </div>
    </div>
  );
}
// ── PER-TYPE SLIDING ROWS — Lifestyle content restructured by content TYPE ───────────────────
// Replaces the old mixed "More to explore" feed. Each content type gets its own labelled horizontal
// scroll-snap row. The CARD is the TODAY page's per-section card VERBATIM (TodayOption2 TodayCard):
// same CARD_W (365), minHeight (488), gradient + 4px accent rim + 4-corner sprig frame, ICON_DISC,
// Eyebrow, meaning-bloom, SERIF hook (CLAMP 3) + SERIF line (CLAMP 4), full-width accent CTA.
// Every card DEEP-LINKS straight to the item full-screen (LifestyleDetail for reads/video/audio;
// FictionReader for FemWell books).
const LF_CARD_W = 365;   // verbatim from TodayOption2
const LF_GAP = 14;
const LF_CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });
const LF_ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function LfFrame4({ color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant="sprig" color={color} corner={c} size={size} opacity={opacity} />)}</>;
}
function lfTypeOf(i) {
  const m = String(i?.media_type || "").toUpperCase();
  const c = String(i?.content_type || "").toUpperCase();
  if (/PODCAST|AUDIO/.test(m)) return "podcasts";
  if (/VIDEO|CLIP|TIKTOK|INSTAGRAM|REEL/.test(m)) return "videos";
  if (c === "FICTION") return "books";
  if (c === "STORY") return "stories";
  if (c === "GUIDE") return "guides";
  return "articles"; // ARTICLE + default
}
const LF_ROWS = [
  { key: "articles", label: "Articles", accent: "#8E6E8E", Icon: BookOpen,   flower: "iris",      cta: "Read this" },
  { key: "stories",  label: "Stories",  accent: T.crimson, Icon: Feather,    flower: "poppy",     cta: "Read this" },
  { key: "videos",   label: "Watch",    accent: T.gold,    Icon: Play,       flower: "sunflower", cta: "Watch now" },
  { key: "podcasts", label: "Listen",   accent: T.sage,    Icon: Headphones, flower: "bluebell",  cta: "Listen now" },
  { key: "books",    label: "Books",    accent: "#5F7E8E", Icon: Book,       flower: "camellia",  cta: "Open this book" },
  { key: "guides",   label: "Guides",   accent: "#A8893F", Icon: Sparkles,   flower: "primrose",  cta: "Read this" },
];

function lfHrefFor(item, type) {
  // Deep-link straight to the SPECIFIC item, full-screen.
  if (type === "books") return createPageUrl(`FictionReader?id=${item.id}`);
  return createPageUrl(`LifestyleDetail?id=${item.id}`);
}

// One card — the TODAY per-section card, verbatim treatment.
function LifestyleRowCard({ item, row, navigate }) {
  const a = row.accent;
  const go = () => navigate(lfHrefFor(item, row.key));
  const line = item.summary || item.lede || item.source_name || item.author_name || "";
  return (
    <section onClick={go} style={{
      scrollSnapAlign: "center", flex: `0 0 ${LF_CARD_W}px`, width: LF_CARD_W,
      position: "relative", overflow: "hidden", cursor: "pointer",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 488,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <LfFrame4 color={a} size={46} opacity={0.6} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* header — icon disc · type eyebrow · meaning-bloom */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          {LF_ICON_DISC(row.Icon, a)}
          <Eyebrow color={a}>{row.label}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={row.flower} size={30} color={a} idx={`lf-mb-${item.id}`} /></span>
        </div>
        {/* optional cover image */}
        {item.image_url ? (
          <div style={{ height: 150, borderRadius: 12, overflow: "hidden", marginBottom: 12, background: `linear-gradient(135deg, ${a}33, ${a}14)` }}>
            <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.parentElement.style.display = "none"; }} />
          </div>
        ) : null}
        {/* hook + line — SERIF, same sizes/clamps as Today */}
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...LF_CLAMP(3) }}>{item.title}</h3>
        {line ? <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...LF_CLAMP(4) }}>{line}</p> : null}
        {/* INLINE ACTION — full-width accent CTA (Today btnStyle) + open link, deep-linking the item */}
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); go(); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: a, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {row.cta}
          </button>
          <a href={lfHrefFor(item, row.key)} onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            Open full-screen <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function LifestyleTypeRows({ items, navigate }) {
  const arr = Array.isArray(items) ? items : [];
  if (!arr.length) return null;
  const buckets = {};
  arr.forEach((i) => { const t = lfTypeOf(i); (buckets[t] = buckets[t] || []).push(i); });
  const rows = LF_ROWS.filter((r) => (buckets[r.key] || []).length > 0);
  if (!rows.length) return null;

  return (
    <div style={{ position: "relative", zIndex: 1, marginTop: 6 }}>
      <style>{`.lf-row-track{scrollbar-width:none}.lf-row-track::-webkit-scrollbar{display:none}`}</style>
      {rows.map((r) => {
        const list = (buckets[r.key] || []).slice(0, 10);
        return (
          <div key={r.key} style={{ marginTop: 22 }}>
            {/* row label */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 18px 8px" }}>
              <r.Icon size={15} color={r.accent} strokeWidth={1.8} />
              <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: r.accent }}>{r.label}</span>
            </div>
            {/* the slider — Today's track geometry (CARD_W 365 · GAP 14 · scroll-snap · peek) */}
            <div className="lf-row-track" style={{ display: "flex", gap: LF_GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
              {list.map((item) => (
                <LifestyleRowCard key={item.id} item={item} row={r} navigate={navigate} />
              ))}
              <div style={{ flex: `0 0 4px` }} aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}
