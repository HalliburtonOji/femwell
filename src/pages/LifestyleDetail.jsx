import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bookmark, BookmarkCheck, Heart, HeartOff, Loader2 } from "lucide-react";
import { format } from "date-fns";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 style={{ width: 20, height: 20, color: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} />
          <span style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Loading…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Genuine not-found, only after fetch settled.
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "var(--ivory)", padding: 24 }}>
        <p style={{ fontSize: 18, color: "var(--plum)", fontFamily: "'Fraunces', serif", fontWeight: 500, marginBottom: 8 }}>
          That article isn't here.
        </p>
        <p style={{ fontSize: 14, color: "var(--mauve)", marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
          It may have been removed or the link is out of date.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "var(--rose-dust)",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  const isFemwell = FEMWELL_GENERATED_PROVIDERS.has(item.provider);
  const isYouTubeVideo = item.media_type === "VIDEO" && (item.provider === "YOUTUBE" || !!item.video_id || (item.embed_url || "").includes("youtube"));
  const youtubeEmbedUrl = isYouTubeVideo
    ? (item.embed_url || (item.video_id ? `https://www.youtube.com/embed/${item.video_id}` : null))
    : null;
  // Read button hidden for FemWell-generated content, and hidden when we've embedded the video in-app.
  const showReadFullButton = !isFemwell && !youtubeEmbedUrl && !!item.content_url;
  const takeaways = Array.isArray(item.takeaways) ? item.takeaways : [];

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-3xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--plum)" }} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleLiked} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
              {liked ? <Heart className="w-4 h-4" style={{ color: "var(--rose-dust)", fill: "var(--rose-dust)" }} /> : <HeartOff className="w-4 h-4" style={{ color: "var(--mauve)" }} />}
            </button>
            <button onClick={toggleSaved} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
              {saved ? <BookmarkCheck className="w-4 h-4" style={{ color: "#A07830" }} /> : <Bookmark className="w-4 h-4" style={{ color: "var(--mauve)" }} />}
            </button>
          </div>
        </div>

        <div className="rounded-3xl p-6 md:p-8" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
          {/* In-app YouTube embed for VIDEO items — no need to bounce users to youtube.com */}
          {youtubeEmbedUrl && (
            <div style={{
              position: "relative",
              width: "100%",
              paddingBottom: "56.25%", /* 16:9 */
              marginBottom: 20,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: "#000",
            }}>
              <iframe
                src={youtubeEmbedUrl}
                title={item.title || "Video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          )}

          {/* Phase tags */}
          {item.phase_tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {item.phase_tags.map(pt => (
                <span key={pt} style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "3px 10px", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>
                  {pt} phase
                </span>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, color: "var(--plum)", lineHeight: 1.2, marginBottom: 10 }}>
            {item.title}
          </h1>

          <p className="mt-3 text-sm" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            {item.author_name || item.source_name}
            {item.published_at ? ` · ${format(new Date(item.published_at), "dd MMM yyyy")}` : ""}
          </p>

          {/* Why it matters — only for items that have it */}
          {item.why_it_matters && (
            <div style={{ borderLeft: "3px solid var(--rose-dust)", paddingLeft: 14, marginTop: 22, marginBottom: 22 }}>
              <p style={{ fontSize: 14, color: "var(--plum)", fontStyle: "italic", lineHeight: 1.65, margin: 0, fontFamily: "'Fraunces', serif" }}>
                {item.why_it_matters}
              </p>
            </div>
          )}

          {/* Body — full inline content */}
          {bodyLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0" }}>
              <Loader2 style={{ width: 18, height: 18, color: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Loading the rest…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <p style={{ marginTop: 22, fontSize: 15, color: "var(--plum)", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-line" }}>
              {fullBody || item.summary || ""}
            </p>
          )}

          {/* Takeaways */}
          {takeaways.length > 0 && (
            <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: "16px 18px", marginTop: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>
                Key takeaways
              </p>
              {takeaways.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "var(--rose-dust)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.55, margin: 0, fontFamily: "'Inter', sans-serif" }}>{t}</p>
                </div>
              ))}
            </div>
          )}

          {/* Read full article — ONLY for external articles with a real URL */}
          {showReadFullButton && (
            <button
              onClick={handleReadFull}
              style={{
                marginTop: 24,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: "var(--rose-dust)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Read the full article
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
