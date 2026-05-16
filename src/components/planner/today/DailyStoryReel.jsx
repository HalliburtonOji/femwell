import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// DailyStoryReel — Today-A T-A3 (MP-Today-A).
//
// Horizontal swipe carousel below the Pillars Deck on /Today. Surfaces
// (i) today's Daily Story segment (DailyStory entity, today's day_number)
// when one is available, and (ii) up to 5 phase-tagged LifestyleItems the
// user hasn't read yet — 4 minimum, 6 maximum per spec default #6.
//
// Card shape: 300×420 (mobile) / wider on tablet+ via responsive max-width.
// Cover image area at top with the `image_url` from the row, falling back
// to a phase-tinted gradient when image is missing. Body section under the
// image carries the eyebrow + Fraunces title + meta line.
//
// Reads = phase tag uses cycleInfo.phase when known; falls back to "any"
// when the user hasn't logged a period yet. localStorage keys named
// `fw_read_chapter_<id>` (per spec) and `fw_read_lifestyle_<id>` track
// what's been opened on this device.
//
// Spec ref: claude-state/base44_mps/2026-05-15_today_redesign_A/spec.md §T-A3.
// ─────────────────────────────────────────────────────────────────────────────

// Le Menu × Phase Sun — saturated phase gradients (applied 2026-05-16).
const PHASE_GRADIENTS = {
  menstrual:  "linear-gradient(135deg, #9A2845AA 0%, #4A2868AA 100%)",
  follicular: "linear-gradient(135deg, #D4745AAA 0%, #9A2845AA 100%)",
  ovulatory:  "linear-gradient(135deg, #C8A040AA 0%, #D4745AAA 100%)",
  luteal:     "linear-gradient(135deg, #7B5E9AAA 0%, #4A2868AA 100%)",
  none:       "linear-gradient(135deg, #C8A040AA 0%, #7B5E9AAA 100%)",
};

// Roman course numerals — match the Le Menu chapter eyebrow style.
const PHASE_ROMAN = {
  menstrual:  "I",
  follicular: "II",
  ovulatory:  "III",
  luteal:     "IV",
};

function toDateISO(d) {
  return d.toISOString().split("T")[0];
}

function isRead(key) {
  try { return localStorage.getItem(key) === "1"; } catch { return false; }
}

function markRead(key) {
  try { localStorage.setItem(key, "1"); } catch { /* noop */ }
}

function fmtRelativeDate(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function DailyStoryReel({ profile, cycleInfo }) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const phase = cycleInfo?.phase || null;

  const [dailyStory, setDailyStory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch today's DailyStory segment + a window of phase-tagged Lifestyle
  // items in parallel. Both are cheap reads; we filter unread client-side.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const todayISO = toDateISO(today);
        const [stories, allItems] = await Promise.all([
          base44.entities.DailyStory.filter({ is_active: true }, "-published_date", 40).catch(() => []),
          base44.entities.LifestyleItems.filter({}, "-published_at", 40).catch(() => []),
        ]);
        if (cancelled) return;

        const visibleStory = (stories || []).find(s => s?.published_date && s.published_date <= todayISO);
        setDailyStory(visibleStory || null);

        // Phase-match (when known) + exclude already-read locally.
        const phaseFilter = phase
          ? (it) => Array.isArray(it.phase_tags) && it.phase_tags.includes(phase)
          : () => true;
        const candidates = (allItems || [])
          .filter(it => it?.id && it.title)
          .filter(phaseFilter)
          .filter(it => !isRead(`fw_read_lifestyle_${it.id}`))
          .slice(0, 6);
        setItems(candidates);
      } catch {
        if (!cancelled) { setDailyStory(null); setItems([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [today, phase]);

  // Build the final card list: Daily Story first (when present), then up
  // to 5 lifestyle items. 4 minimum / 6 maximum per spec default #6.
  const cards = useMemo(() => {
    const out = [];
    if (dailyStory) {
      out.push({
        kind: "daily-story",
        id: dailyStory.id,
        title: dailyStory.series_title || "Today's chapter",
        eyebrow: `DAILY STORY · DAY ${dailyStory.day_number}`,
        meta: "100-word read",
        gradient: dailyStory.image_gradient || PHASE_GRADIENTS[phase || "none"],
        image: null,
        body: dailyStory.segment_text || "",
      });
    }
    const room = Math.max(0, 6 - out.length);
    for (const it of items.slice(0, room)) {
      out.push({
        kind: "lifestyle",
        id: it.id,
        title: it.title,
        eyebrow: (it.media_type || "ARTICLE").toString().toUpperCase(),
        meta: [it.source_name, fmtRelativeDate(it.published_at)].filter(Boolean).join(" · "),
        gradient: PHASE_GRADIENTS[phase || "none"],
        image: it.image_url || null,
        body: "",
        mediaType: it.media_type,
      });
    }
    return out;
  }, [dailyStory, items, phase]);

  const handleTap = (card) => {
    if (card.kind === "daily-story") {
      markRead(`fw_read_chapter_${card.id}`);
      // DailyStoriesStrip handles the segment-reader on Today; route there
      // for the deep-link until the chapter reader gets its own route.
      navigate(`/Lifestyle?tab=daily_story&open=${card.id}`);
      return;
    }
    markRead(`fw_read_lifestyle_${card.id}`);
    // Fiction chapter rows route to FictionReader; everything else opens
    // in Lifestyle For You.
    if ((card.mediaType || "").toString().toUpperCase() === "FICTION_CHAPTER") {
      navigate(`/FictionReader?id=${card.id}`);
    } else {
      navigate(`/Lifestyle?tab=for_you&open=${card.id}`);
    }
  };

  if (loading) {
    // Reserve vertical room so the page doesn't reflow when cards arrive.
    return <div style={{ minHeight: 140 }} aria-hidden="true" />;
  }

  // Empty state — when no daily story and no unread lifestyle items, render
  // a single "All caught up" card that links to Lifestyle.
  if (cards.length === 0) {
    return (
      <section aria-label="Daily reading reel" style={reelStyle}>
        <button type="button" onClick={() => navigate("/Lifestyle?tab=for_you")} style={cardStyle("emptyCaughtUp", PHASE_GRADIENTS.none, null)}>
          <div style={coverStyle(PHASE_GRADIENTS.none, null)}>
            <span style={badgeStyle}>ALL CAUGHT UP</span>
          </div>
          <div style={cardBodyStyle}>
            <p style={eyebrowStyle}>WELL DONE</p>
            <h3 style={titleStyle}>You're up to date</h3>
            <p style={metaStyle}>Head to Lifestyle for more →</p>
          </div>
        </button>
      </section>
    );
  }

  // Le Menu × Phase Sun — course prefix on the section header
  const roman = phase ? PHASE_ROMAN[phase] : null;
  const reelHead = roman ? `${roman} · For you today` : "For you today";

  return (
    <section aria-label="Daily reading reel" style={reelStyle}>
      <p style={reelHeadStyle}>{reelHead}</p>
      <div style={scrollRowStyle} className="fw-no-scrollbar">
        {cards.map(card => (
          <button
            key={`${card.kind}-${card.id}`}
            type="button"
            onClick={() => handleTap(card)}
            aria-label={`${card.kind === "daily-story" ? "Daily Story" : "Article"}: ${card.title}`}
            style={cardStyle(card.id, card.gradient, card.image)}
          >
            <div style={coverStyle(card.gradient, card.image)}>
              {card.kind === "daily-story" && <span style={badgeStyle}>DAILY STORY</span>}
            </div>
            <div style={cardBodyStyle}>
              <p style={eyebrowStyle}>
                {roman ? <span style={{ color: "#7B5E9A", fontWeight: 700 }}>{roman} · </span> : null}
                {card.eyebrow}
              </p>
              <h3 style={titleStyle}>{card.title}</h3>
              <p style={metaStyle}>{card.meta || (card.kind === "daily-story" ? "100-word read" : "")}</p>
            </div>
          </button>
        ))}
      </div>
      <style>{`.fw-no-scrollbar::-webkit-scrollbar{display:none}.fw-no-scrollbar{scrollbar-width:none}`}</style>
    </section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const reelStyle = {
  marginBottom: 14,
};
// Le Menu × Phase Sun — italic gold-deep section header, course-prefixed.
const reelHeadStyle = {
  fontSize: 11,
  fontStyle: "italic",
  fontWeight: 600,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#A6862B",
  fontFamily: "'Fraunces', Georgia, serif",
  margin: "0 0 8px",
};
const scrollRowStyle = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
  paddingBottom: 4,
};
// Le Menu × Phase Sun — cream paper cards with espresso ink (applied 2026-05-16).
function cardStyle(_id, gradient, image) {
  return {
    flex: "0 0 240px",
    height: 320,
    borderRadius: 16,
    border: "1px solid rgba(58,44,26,0.10)",
    overflow: "hidden",
    background: image ? "#FBF6E6" : gradient,
    boxShadow: "0 2px 6px rgba(58,44,26,0.06)",
    cursor: "pointer",
    scrollSnapAlign: "start",
    display: "flex",
    flexDirection: "column",
    padding: 0,
    textAlign: "left",
  };
}
function coverStyle(gradient, image) {
  return {
    position: "relative",
    width: "100%",
    height: 168,
    background: image ? `center / cover no-repeat url(${image})` : gradient,
    flexShrink: 0,
  };
}
const badgeStyle = {
  position: "absolute",
  top: 10,
  left: 10,
  padding: "4px 10px",
  borderRadius: 9999,
  background: "rgba(20,16,32,0.55)",
  color: "var(--cream, #FFFAF5)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
};
// Le Menu × Phase Sun — cream card body, espresso ink, gold-deep eyebrow.
const cardBodyStyle = {
  padding: "12px 14px 14px",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  background: "#FBF6E6",
};
const eyebrowStyle = {
  fontSize: 9.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "#A6862B",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const titleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  fontStyle: "italic",
  lineHeight: 1.25,
  color: "#3A2C1A",
  letterSpacing: "-0.012em",
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const metaStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "#8A7458",
  margin: "auto 0 0",
};
