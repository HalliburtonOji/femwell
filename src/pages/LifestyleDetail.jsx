import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bookmark, BookmarkCheck, Heart, HeartOff, Loader2, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { getCategoryGradient, attachFallbackOverlay } from "@/utils/imageFallback";
import ContentActionBar from "@/components/common/ContentActionBar";
import ShareButton from "@/components/share/ShareButton";
import { readTimeLabel, countWords } from "@/components/brand/ReadingColumn";

// Map a content category to the best-fit whole-life Community room (default: the Lounge).
const CATEGORY_ROOM = {
  love: "love", relationships: "love", dating: "love", sex: "love",
  money: "money", career: "money", work: "money", finance: "money",
  style: "style", fashion: "style", beauty: "style",
  health: "health", wellness: "lounge", mind: "lounge", body: "lounge",
};
const roomForCategory = (cat) => CATEGORY_ROOM[String(cat || "").toLowerCase()] || "lounge";

const FEMWELL_GENERATED_PROVIDERS = new Set([
  "FEMWELL_AI",
  "FEMWELL_AI_USER_REQUEST",
  "FEMWELL_FICTION_WEEKLY",
  "FEMWELL_FICTION_PERSONAL",
]);

function stripHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 24) return "today";
  if (hours < 48) return "yesterday";
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  return format(d, "dd MMM yyyy");
}

// Strip residual markdown that ingest pipelines sometimes leak into bodies.
// Covers **bold**, *italic*, __bold__, _italic_, `code`, ~~strike~~.
// Does NOT touch heading prefixes (## / ###) — those are consumed by
// renderBodyBlocks before this runs.
function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/~~(.+?)~~/g, "$1");
}

// Splits a body string into typed blocks for editorial rendering.
// Supported block kinds:
//   h2       — `## Heading` (paragraph-start OR mid-paragraph on its own line)
//   eyebrow  — `### Heading` (same rules)
//   chapter  — `Chapter N` at the start of a paragraph (its own line)
//   p        — everything else (plain paragraph, with markdown stripped)
function renderBodyBlocks(body) {
  if (!body) return [];
  const decoded = decodeHtmlEntities(body);
  const rawBlocks = decoded.split(/\n\n+/);
  const blocks = [];

  // Push a paragraph after splitting any embedded headings AND extracting
  // a leading "Chapter N" line into its own chapter block.
  const pushParagraph = (paragraph) => {
    if (!paragraph) return;
    // Split on embedded heading lines so `Foo\n## Bar` becomes two blocks.
    const segments = paragraph
      .split(/\n(?=#{2,3}\s)/g)
      .map((s) => s.trim())
      .filter(Boolean);

    segments.forEach((seg) => {
      if (seg.startsWith("### ")) {
        blocks.push({ kind: "eyebrow", text: stripMarkdown(seg.slice(4).trim()) });
        return;
      }
      if (seg.startsWith("## ")) {
        blocks.push({ kind: "h2", text: stripMarkdown(seg.slice(3).trim()) });
        return;
      }
      // Detect leading "Chapter N" — extract it into its own block so it
      // never runs together with the body text that follows.
      const chapterMatch = seg.match(/^(Chapter\s+\d+\b[^\n.]*)([\s\S]*)$/i);
      if (chapterMatch) {
        const chapterLine = chapterMatch[1].trim();
        const rest = (chapterMatch[2] || "").replace(/^[\s.:—-]+/, "").trim();
        blocks.push({ kind: "chapter", text: stripMarkdown(chapterLine) });
        if (rest) blocks.push({ kind: "p", text: stripMarkdown(rest) });
        return;
      }
      blocks.push({ kind: "p", text: stripMarkdown(seg) });
    });
  };

  rawBlocks.forEach((raw) => pushParagraph(raw.trim()));
  return blocks;
}

export default function LifestyleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullBody, setFullBody] = useState("");
  const [bodyLoading, setBodyLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [related, setRelated] = useState([]);
  const [videoFailed, setVideoFailed] = useState(false);

  // YouTube embed errors (153, 101, 150) don't fire iframe.onError — they're
  // surfaced via postMessage from the IFrame Player API. Listen for those and
  // flip videoFailed so the fallback gradient card renders instead.
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.origin || !/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
      let data = e.data;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (data && data.event === "onError") {
        const code = Number(data.info);
        if ([101, 150, 153].includes(code)) setVideoFailed(true);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // §6.7.8 — SILENT auto-resume. She comes back to where she was, with no ceremony and no
  // "continue reading?" prompt. (Precedent: Pocket/Instapaper restore position; there's no
  // measured benefit in the literature, so we ship it quietly and claim nothing.)
  useEffect(() => {
    if (!id || !fullBody) return;
    const key = `fw_article_pos_${id}`;
    try {
      const y = parseInt(localStorage.getItem(key) || "0", 10);
      if (y > 40) window.requestAnimationFrame(() => window.scrollTo(0, y));
    } catch { /* ignore */ }
    let t = null;
    const onScroll = () => {
      if (t) return;
      t = window.setTimeout(() => { t = null; try { localStorage.setItem(key, String(Math.round(window.scrollY))); } catch { /* ignore */ } }, 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (t) window.clearTimeout(t); };
  }, [id, fullBody]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setVideoFailed(false);
      try {
        const user = await base44.auth.me();
        const [items, profiles] = await Promise.all([
          base44.entities.LifestyleItems.filter({ id }).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []),
        ]);
        if (cancelled) return;
        const fetched = items[0] || null;
        const nextProfile = profiles[0] || null;
        setItem(fetched);
        setProfile(nextProfile);
        setProfileId(nextProfile?.id || null);
        setLiked((nextProfile?.liked_item_ids || []).includes(id));
        setSaved((nextProfile?.saved_item_ids || []).includes(id));

        // For FemWell-generated content, the full body lives in `lede` or needs `expandContent`.
        // For external articles, `summary` is the body.
        if (fetched) {
          const isFemwell = FEMWELL_GENERATED_PROVIDERS.has(fetched.provider);
          const lede = fetched.lede || "";
          if (isFemwell) {
            if (lede.length >= 300) {
              if (!cancelled) setFullBody(stripHtml(lede));
            } else {
              if (!cancelled) setBodyLoading(true);
              try {
                const res = await base44.functions.invoke("expandContent", {
                  item_id: fetched.id,
                  title: fetched.title,
                  summary: fetched.summary || lede,
                  content_type: fetched.content_type,
                });
                if (!cancelled) {
                  setFullBody(stripHtml(res?.data?.body || fetched.summary || lede || ""));
                }
              } catch {
                if (!cancelled) setFullBody(stripHtml(fetched.summary || lede || ""));
              } finally {
                if (!cancelled) setBodyLoading(false);
              }
            }
          } else {
            // External article: use summary as inline body
            if (!cancelled) setFullBody(stripHtml(fetched.summary || lede || ""));
          }

          // Related items — same category, exclude self.
          try {
            const relatedRows = await base44.entities.LifestyleItems
              .filter({ category: fetched.category })
              .catch(() => []);
            if (!cancelled) {
              const filtered = (relatedRows || [])
                .filter((r) => r.id !== fetched.id)
                .slice(0, 6);
              setRelated(filtered);
            }
          } catch {
            if (!cancelled) setRelated([]);
          }
        }
      } catch (err) {
        console.error("LifestyleDetail init failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const updateProfileField = async (field, value) => {
    if (!profileId) return;
    await base44.entities.UserProfile.update(profileId, { [field]: value });
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const toggleLiked = async () => {
    const current = profile?.liked_item_ids || [];
    const next = liked ? current.filter((itemId) => itemId !== id) : [...current, id];
    setLiked(!liked);
    await updateProfileField("liked_item_ids", next);
  };

  const toggleSaved = async () => {
    const current = profile?.saved_item_ids || [];
    const next = saved ? current.filter((itemId) => itemId !== id) : [...current, id];
    setSaved(!saved);
    await updateProfileField("saved_item_ids", next);
  };

  const handleReadFull = () => {
    try {
      if (!item?.content_url) return;
      window.open(item.content_url, "_blank", "noopener,noreferrer");
    } catch {
      // do nothing
    }
  };

  // Loading state — never flash "Article not found" while fetching.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#ECE7DA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 style={{ width: 20, height: 20, color: "#E8B4B8", animation: "spin 0.7s linear infinite" }} />
          <span style={{ fontSize: 14, color: "#2E261B", }}>Loading…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Genuine not-found, only after fetch settled.
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#ECE7DA", padding: 24 }}>
        <p style={{ fontSize: 18, color: "#0B0805", fontWeight: 500, marginBottom: 8 }}>
          That article isn't here.
        </p>
        <p style={{ fontSize: 14, color: "#2E261B", marginBottom: 20, }}>
          It may have been removed or the link is out of date.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "#E8B4B8",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            }}
        >
          Go back
        </button>
      </div>
    );
  }

  const isFemwell = FEMWELL_GENERATED_PROVIDERS.has(item.provider);
  const isYouTubeVideo = item.media_type === "VIDEO" && (item.provider === "YOUTUBE" || !!item.video_id || (item.embed_url || "").includes("youtube"));
  // Append enablejsapi=1 so YouTube emits onError postMessages back to us when
  // an embed is blocked (Error 153 / 101 / 150). Without this flag the iframe
  // just renders YouTube's in-frame error UI and our fallback never triggers.
  const youtubeEmbedUrl = isYouTubeVideo
    ? (() => {
        const base = item.embed_url || (item.video_id ? `https://www.youtube.com/embed/${item.video_id}` : null);
        if (!base) return null;
        const sep = base.includes("?") ? "&" : "?";
        const origin = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
        return `${base}${sep}enablejsapi=1&origin=${origin}`;
      })()
    : null;
  // Read button hidden for FemWell-generated content, and hidden when we've embedded the video in-app.
  const showReadFullButton = !isFemwell && !youtubeEmbedUrl && !!item.content_url;
  const takeaways = Array.isArray(item.takeaways) ? item.takeaways : [];

  // Decoded text for render.
  const decodedTitle = decodeHtmlEntities(item.title || "");
  const decodedWhy = decodeHtmlEntities(item.why_it_matters || "");
  const decodedAuthor = decodeHtmlEntities(item.author_name || "");
  const decodedSource = decodeHtmlEntities(item.source_name || "");
  const byline = decodedAuthor || decodedSource;
  const eyebrowSource = (decodedSource || decodedAuthor || "").toUpperCase();
  const eyebrowDate = formatRelativeDate(item.published_at).toUpperCase();
  const eyebrowCategory = (item.category || "").toString().toUpperCase();
  const eyebrowBits = [eyebrowSource, eyebrowDate, eyebrowCategory].filter(Boolean);

  // Build editorial body blocks.
  const blocks = renderBodyBlocks(fullBody);
  // Pull quote injects after block index 2 (or midpoint if <6 blocks).
  const pullQuoteIndex = blocks.length >= 6 ? 2 : Math.max(0, Math.floor(blocks.length / 2) - 1);
  // Track whether the first paragraph block has rendered yet so the drop cap only attaches once.
  let firstParagraphSeen = false;

  // Decide hero treatment: YouTube embed replaces the hero entirely.
  const useYouTubeHero = !!youtubeEmbedUrl;
  const youTubeEmbeddable = item.is_embeddable !== false && !videoFailed;

  // Hero shape — image vs gradient — when not using YouTube.
  const hasImage = !!item.image_url;
  const heroAspect = hasImage ? "56.25%" : "75%";
  // Sit the image on a category-tied gradient so even a transparent or
  // partial-loaded image reads as a branded panel rather than flat black.
  const heroBg = hasImage
    ? getCategoryGradient(item.category)
    : (item.image_gradient || getCategoryGradient(item.category));

  // Related-rail filter — only render the section if we have at least 2 items.
  const relatedDecorated = (related || []).map((r) => ({
    id: r.id,
    title: decodeHtmlEntities(r.title || ""),
    image_url: r.image_url,
    image_gradient: r.image_gradient,
    source: decodeHtmlEntities(r.source_name || r.author_name || ""),
    rel: formatRelativeDate(r.published_at),
  }));

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "#ECE7DA" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .fw-reader-card .fw-dropcap {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          color: #BC2E27;
          float: left;
          line-height: 0.85;
          padding: 4px 10px 0 0;
          font-size: 52px;
        }
        @media (min-width: 768px) {
          .fw-reader-card .fw-dropcap { font-size: 64px; }
        }
        .fw-reader-card .fw-ornament {
          text-align: center;
          color: #BC2E27;
          letter-spacing: 12px;
          font-size: 18px;
          line-height: 28px;
          margin: 28px 0;
          font-family: 'Fraunces', serif;
        }
        /* §6.7.8 READING CRAFT — this body used 'Inter' 16px, but src/index.css remaps BOTH
           'Inter' and 'Fraunces' to Cormorant at size-adjust:150%, so it actually rendered at
           ~24px → ~29 characters per line (the ~45-75 target's floor is 45; the honest mobile
           accept is 38-42). The fix is the UN-ADJUSTED Cormorant stack, where a size means what
           it says. Article variant = spaced paragraphs, NO indent (indent XOR space, Butterick). */
        .fw-reader-card .fw-body-p {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 17px;
          line-height: 1.62;
          color: #0B0805;
          font-weight: 400;
          margin: 0 0 16px;
          text-indent: 0;
        }
        @media (min-width: 768px) {
          .fw-reader-card .fw-body-p { font-size: 18px; }
        }
        .fw-reader-card .fw-body-p:last-child { margin-bottom: 0; }
        .fw-reader-card .fw-h2 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 22px;
          color: #7A1A12;
          line-height: 1.25;
          margin: 28px 0 12px;
        }
        @media (min-width: 768px) {
          .fw-reader-card .fw-h2 { font-size: 24px; }
        }
        .fw-reader-card .fw-eyebrow-h {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #BC2E27;
          margin: 22px 0 8px;
        }
        .fw-reader-card .fw-chapter {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 22px;
          color: #7A1A12;
          letter-spacing: -0.005em;
          line-height: 1.25;
          margin: 32px 0 18px;
          display: block;
        }
        @media (min-width: 768px) {
          .fw-reader-card .fw-chapter { font-size: 24px; margin: 36px 0 20px; }
        }
        .fw-related-rail {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }
        .fw-related-rail::-webkit-scrollbar { height: 6px; }
        .fw-related-rail::-webkit-scrollbar-thumb { background: #E8B4B8; border-radius: 999px; }
        .fw-related-card {
          width: 240px;
          flex-shrink: 0;
          scroll-snap-align: start;
          cursor: pointer;
          text-decoration: none;
        }
        .fw-related-title-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(244,239,227,0.9)", border: "1px solid #D8CFBC" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "#0B0805" }} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleLiked} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(244,239,227,0.9)", border: "1px solid #D8CFBC" }}>
              {liked ? <Heart className="w-4 h-4" style={{ color: "#E8B4B8", fill: "#E8B4B8" }} /> : <HeartOff className="w-4 h-4" style={{ color: "#2E261B" }} />}
            </button>
            <button onClick={toggleSaved} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(244,239,227,0.9)", border: "1px solid #D8CFBC" }}>
              {saved ? <BookmarkCheck className="w-4 h-4" style={{ color: "#A8893F" }} /> : <Bookmark className="w-4 h-4" style={{ color: "#2E261B" }} />}
            </button>
          </div>
        </div>

        <h1 className="fw-display" style={{ margin: "0 0 16px" }}>Lifestyle</h1>

        {/* §6.7.8 — ONE padding owner. At 390px the max-width never binds: PADDING *IS* MEASURE.
            The page gutter (px-4) + a 24px card pad double-framed the text to ~310px. The card
            keeps a slim mobile gutter so the column can breathe (~334px ≈ 39 CPL at 17px —
            inside the honest 38-42 mobile accept; we do NOT shrink type to buy characters). */}
        <div
          className="fw-reader-card px-3 py-6 md:p-10"
          style={{
            backgroundColor: "#F4EFE3",
            border: "1px solid #D8CFBC",
            boxShadow: "var(--shadow-card)",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {useYouTubeHero ? (
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#BC2E27",
                marginBottom: 10,
                marginTop: 0,
              }}>
                Watch
              </p>

              {youTubeEmbeddable ? (
                <div style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%", /* 16:9 */
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid #D8CFBC",
                  boxShadow: "var(--shadow-card)",
                }}>
                  <iframe
                    src={youtubeEmbedUrl}
                    title={decodedTitle || "Video"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={() => setVideoFailed(true)}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: "16/9",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #7A1A12 0%, #E8B4B8 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    padding: 24,
                    cursor: "pointer",
                    border: "1px solid #D8CFBC",
                    boxShadow: "var(--shadow-card)",
                  }}
                  onClick={() => item.content_url && window.open(item.content_url, "_blank", "noopener,noreferrer")}
                >
                  <PlayCircle size={56} color="#ECE7DA" strokeWidth={1.5} />
                  <p style={{ font: "italic 400 18px/1.3 'Fraunces', serif", color: "#ECE7DA", margin: 0, textAlign: "center", maxWidth: 320 }}>
                    {decodedTitle}
                  </p>
                  <p style={{ font: "600 12px/1 'Inter', sans-serif", color: "rgba(247,240,230,0.8)", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Watch on YouTube
                  </p>
                </div>
              )}

              {/* §6.7.8 — read-time is PERMISSION when the number is small, a DETERRENT when
                  it's large (stating a 10-min cost made fewer people finish). readTimeLabel
                  returns null past the threshold — better silence than an off-putting number.
                  No top progress bar: zero evidence they help, and they backfire on long reads. */}
              {(() => {
                const label = readTimeLabel(countWords(fullBody || item.summary || ""));
                return label ? (
                  <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, fontWeight: 600, color: "#A8893F" }}>{label}</p>
                ) : null;
              })()}
              {byline && (
                <p style={{
                  marginTop: 12,
                  marginBottom: 0,
                  fontSize: 12,
                  color: "#2E261B",
                }}>
                  {byline}
                  {item.author_url ? (
                    <>
                      {" · "}
                      <a
                        href={item.author_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#BC2E27", textDecoration: "none", fontWeight: 600 }}
                      >
                        Channel
                      </a>
                    </>
                  ) : null}
                </p>
              )}

              <h1 className="fw-heading" style={{
                marginTop: 20,
                marginBottom: 0,
              }}>
                {decodedTitle}
              </h1>
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: heroAspect,
                margin: "-24px -24px 20px",
                background: heroBg,
                overflow: "hidden",
              }}
              className="fw-reader-hero"
            >
              {hasImage && (
                <img
                  src={item.image_url}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => attachFallbackOverlay(e, item.category)}
                />
              )}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(43,28,46,0.78) 0%, rgba(43,28,46,0.15) 55%, rgba(0,0,0,0) 100%)",
              }} />
              <div style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 24,
                color: "#ECE7DA",
              }}>
                {eyebrowBits.length > 0 && (
                  <p style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "rgba(247,240,230,0.85)",
                    marginBottom: 10,
                    marginTop: 0,
                  }}>
                    {eyebrowBits.join(" · ")}
                  </p>
                )}
                <h1 style={{
                  color: "#ECE7DA",
                  lineHeight: 1.08,
                  margin: 0,
                  // Clamp long titles to 3 lines so they never push out of the
                  // visible hero area. Combined with a hero min-height below,
                  // 3-line titles stay legible without breaking the layout.
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                }} className="fw-heading fw-reader-title">
                  {decodedTitle}
                </h1>
              </div>
              <style>{`
                /* Make sure the hero is tall enough to fit a 3-line title at
                   any breakpoint. Default heroAspect math gives ~56% / 75% of
                   width; that's tight for long titles, so we set a floor. */
                .fw-reader-hero { min-height: 280px; }
                @media (min-width: 768px) {
                  .fw-reader-hero { margin: -40px -40px 24px !important; min-height: 360px; }
                  .fw-reader-title { font-size: 56px !important; line-height: 1.05 !important; letter-spacing: -0.02em !important; }
                }
              `}</style>
            </div>
          )}

          {/* Phase tags — below hero, above body */}
          {item.phase_tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {item.phase_tags.map((pt) => (
                <span key={pt} style={{ fontSize: 10, fontWeight: 600, color: "#2E261B", backgroundColor: "#D8CFBC", borderRadius: 9999, padding: "3px 10px", textTransform: "capitalize", }}>
                  {pt} phase
                </span>
              ))}
            </div>
          )}

          {/* Body — editorial blocks */}
          {bodyLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0" }}>
              <Loader2 style={{ width: 18, height: 18, color: "#E8B4B8", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#2E261B", }}>Loading the rest…</span>
            </div>
          ) : (
            <div>
              {blocks.length === 0 && (
                <p className="fw-body-p" style={{ fontSize: 16, lineHeight: 1.78, color: "#0B0805" }}>
                  {stripMarkdown(decodeHtmlEntities(item.summary || ""))}
                </p>
              )}
              {blocks.map((b, idx) => {
                const rendered = [];

                if (b.kind === "h2") {
                  rendered.push(
                    <h2 key={`h2-${idx}`} className="fw-h2">
                      {b.text}
                    </h2>
                  );
                } else if (b.kind === "eyebrow") {
                  rendered.push(
                    <p key={`eb-${idx}`} className="fw-eyebrow-h">
                      {b.text}
                    </p>
                  );
                } else if (b.kind === "chapter") {
                  rendered.push(
                    <p key={`ch-${idx}`} className="fw-chapter">
                      {b.text}
                    </p>
                  );
                } else {
                  const isFirstP = !firstParagraphSeen;
                  if (isFirstP) firstParagraphSeen = true;
                  const text = b.text;
                  if (isFirstP && text && text.length > 1) {
                    const firstChar = text.charAt(0);
                    const rest = text.slice(1);
                    rendered.push(
                      <p key={`p-${idx}`} className="fw-body-p">
                        <span className="fw-dropcap">{firstChar}</span>
                        {rest}
                      </p>
                    );
                  } else {
                    rendered.push(
                      <p key={`p-${idx}`} className="fw-body-p">
                        {text}
                      </p>
                    );
                  }
                }

                // Pull quote injection after the chosen block index.
                if (decodedWhy && idx === pullQuoteIndex) {
                  rendered.push(
                    <div
                      key={`pq-${idx}`}
                      style={{
                        margin: "32px auto",
                        padding: "24px 0",
                        textAlign: "center",
                        maxWidth: 560,
                        borderTop: "1px solid #BC2E27",
                        borderBottom: "1px solid #BC2E27",
                      }}
                    >
                      <p style={{
                        fontStyle: "italic",
                        fontWeight: 400,
                        fontSize: 22,
                        lineHeight: 1.4,
                        color: "#7A1A12",
                        margin: 0,
                      }} className="fw-pullquote">
                        {decodedWhy}
                      </p>
                      <style>{`
                        @media (min-width: 768px) {
                          .fw-pullquote { font-size: 26px !important; }
                        }
                      `}</style>
                    </div>
                  );
                }

                // Ornament every 4 blocks (not as the very last element).
                const isOrnamentSlot = (idx + 1) % 4 === 0 && idx !== blocks.length - 1;
                if (isOrnamentSlot) {
                  rendered.push(
                    <div key={`orn-${idx}`} className="fw-ornament" aria-hidden="true">
                      · · ·
                    </div>
                  );
                }

                return rendered;
              })}
            </div>
          )}

          {/* Takeaways */}
          {takeaways.length > 0 && (
            <div style={{
              backgroundColor: "#D8CFBC",
              border: "1px solid #E8B4B8",
              borderRadius: 18,
              padding: "24px 22px",
              marginTop: 32,
            }}>
              <p style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 14,
                color: "#7A1A12",
                marginTop: 0,
                marginBottom: 14,
              }}>
                Key takeaways
              </p>
              {takeaways.map((t, i) => {
                const isLast = i === takeaways.length - 1;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: "12px 0",
                      borderBottom: isLast ? "none" : "1px solid #E8B4B8",
                    }}
                  >
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "#BC2E27",
                      color: "#ECE7DA",
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <p style={{
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: "#0B0805",
                      margin: 0,
                      flex: 1,
                    }}>
                      {decodeHtmlEntities(t)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Read full article — ONLY for external articles with a real URL */}
          {showReadFullButton && (
            <button
              onClick={handleReadFull}
              style={{
                marginTop: 28,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: "#BC2E27",
                color: "#ECE7DA",
                border: "none",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Read the full article
            </button>
          )}
        </div>

        {/* Connectivity keystone — thread this read into the doing-surfaces */}
        <ContentActionBar
          reflect={{ seed: `On reading "${decodedTitle}" — `, type: "reflection" }}
          discuss={{ room: roomForCategory(item.category), seed: `Been reading about ${decodedTitle.toLowerCase()} — has anyone else?` }}
          jess={decodedTitle}
        />

        {/* "This resonated" — an external share-card of the (non-personal) read title */}
        {decodedTitle && (
          <div style={{ marginTop: 4 }}>
            <ShareButton label="This resonated — share it" artifact={{
              kind: "resonated", source: "resonated", line: decodedTitle, footer: "This resonated",
              url: "https://femwells.com", shareText: "This resonated with me — on FemWell.",
            }} />
          </div>
        )}

        {/* More like this rail */}
        {relatedDecorated.length >= 2 && (
          <div style={{ marginTop: 40 }}>
            <p style={{
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 22,
              color: "#7A1A12",
              margin: "0 0 16px",
            }}>
              More like this
            </p>
            <div className="fw-related-rail">
              {relatedDecorated.map((r) => {
                const cardBg = r.image_gradient || getCategoryGradient(item.category);
                const metaBits = [r.source ? r.source.toUpperCase() : "", r.rel ? r.rel.toUpperCase() : ""].filter(Boolean);
                return (
                  <a
                    key={r.id}
                    href={`/LifestyleDetail?id=${encodeURIComponent(r.id)}`}
                    className="fw-related-card"
                  >
                    <div style={{
                      width: 240,
                      height: 140,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: cardBg,
                      position: "relative",
                    }}>
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => attachFallbackOverlay(e, item.category)}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 12, textAlign: "center",
                            fontStyle: "italic", fontWeight: 400, fontSize: 18,
                            color: "#ECE7DA", opacity: 0.7,
                            pointerEvents: "none",
                          }}
                        >
                          {item.category || "More like this"}
                        </span>
                      )}
                    </div>
                    <p
                      className="fw-related-title-clamp"
                      style={{
                        fontWeight: 500,
                        fontSize: 16,
                        lineHeight: 1.25,
                        color: "#0B0805",
                        margin: "10px 0 0",
                      }}
                    >
                      {r.title}
                    </p>
                    {metaBits.length > 0 && (
                      <p style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#2E261B",
                        margin: "6px 0 0",
                      }}>
                        {metaBits.join(" · ")}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
