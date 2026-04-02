import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { RefreshCw } from "lucide-react";
import LifestyleCard from "../components/lifestyle/LifestyleCard";
import FeedSkeleton from "../components/lifestyle/FeedSkeleton";
import TrendingStrip from "../components/lifestyle/TrendingStrip";
import DailyPulseStrip from "../components/lifestyle/DailyPulseStrip";

const MODES = [
  { id: "for_you", label: "For You" },
  { id: "saved", label: "Saved" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "clips", label: "Clips" },
];

export default function Lifestyle() {
  const [mode, setMode] = useState("for_you");
  const [items, setItems] = useState([]);
  const [editorPick, setEditorPick] = useState(null);
  const [trendingItems, setTrendingItems] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [likedIds, setLikedIds] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState("All");
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [contentCategories, setContentCategories] = useState(["All"]);
  const loaderRef = useRef(null);

  useEffect(() => {
    (async () => {
      const currentUser = await base44.auth.me();
      const [profiles, preferences, contentSources, interactions] = await Promise.all([
        base44.entities.LifestyleProfile.filter({ user_id: currentUser.id }),
        base44.entities.UserPreferences.filter({ user_id: currentUser.id }),
        base44.entities.LifestyleSources.list('priority', 200),
        base44.entities.LifestyleInteractions.filter({ user_id: currentUser.id }, '-acted_at', 500)
      ]);

      const nextLifestyleProfile = profiles[0] || await base44.entities.LifestyleProfile.create({ user_id: currentUser.id });
      const savedFromProfile = String(nextLifestyleProfile.saved_item_ids || '').split(',').map((item) => item.trim()).filter(Boolean);
      const likedFromInteractions = interactions.filter((item) => item.action === 'like').map((item) => item.item_id);
      setLifestyleProfile(nextLifestyleProfile);
      setInterests(preferences[0]?.lifestyle_interests || []);
      setSavedIds(new Set(savedFromProfile));
      setLikedIds(new Set(likedFromInteractions));
      setContentCategories(["All", ...new Set(contentSources.map((item) => item.category).filter(Boolean))]);
    })();
  }, []);

  const loadFeed = useCallback(async (newMode, newPage = 0, refresh = false) => {
    if (newPage === 0) {
      refresh ? setRefreshing(true) : setLoading(true);
      setItems([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const allItems = await base44.entities.LifestyleItems.list("-pub_date", 200);
      const blockedSourceIds = Array.isArray(lifestyleProfile?.blocked_sources) ? lifestyleProfile.blocked_sources : [];
      const savedList = String(lifestyleProfile?.saved_item_ids || '').split(',').map((item) => item.trim()).filter(Boolean);
      const followed = interests.length > 0 ? new Set(interests) : new Set();
      let filteredItems = allItems.filter((item) => (item.status === "PUBLISHED" || item.status === "NEEDS_REVIEW") && !blockedSourceIds.includes(item.source_id));
      if (newMode === "saved") {
        filteredItems = filteredItems.filter((item) => savedList.includes(item.id));
      } else if (newMode === "following") {
        filteredItems = filteredItems.filter((item) => followed.has(item.category));
      }
      if (newMode === "for_you") {
        filteredItems = [...filteredItems].sort((a, b) => {
          const aFollowed = followed.has(a.category) ? 1 : 0;
          const bFollowed = followed.has(b.category) ? 1 : 0;
          if (aFollowed !== bFollowed) return bFollowed - aFollowed;
          return new Date(b.pub_date || 0) - new Date(a.pub_date || 0);
        });
      }

      if (newPage === 0) {
        setItems(filteredItems.slice(0, 15));
        setEditorPick(filteredItems.find((item) => item.is_editor_pick) || null);
      } else {
        const start = newPage * 15;
        setItems((prev) => [...prev, ...filteredItems.slice(start, start + 15)]);
      }

      setHasMore(filteredItems.length > (newPage + 1) * 15);
      setPage(newPage);

      if (newPage === 0 && newMode === "for_you") {
        setTrendingItems(filteredItems.filter((item) => item.is_trending).slice(0, 6));
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    loadFeed(mode, 0);
  }, [mode, loadFeed]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadFeed(mode, page + 1);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, mode, loadFeed]);

  const displayedItems = filterCategory === "All" ? items : items.filter((item) => item.category === filterCategory);

  const handleHide = (id) => setItems((prev) => prev.filter((item) => item.id !== id));
  const handleSave = (id, nextSaved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nextSaved) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const handleLike = (id, nextLiked) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const handleMuteSource = async (sourceId) => {
    try {
      const profiles = await base44.entities.LifestyleProfile.filter({ user_id: (await base44.auth.me()).id });
      const profile = profiles[0];
      if (!profile) return;
      const blocked = Array.isArray(profile.blocked_sources) ? profile.blocked_sources : [];
      if (blocked.includes(sourceId)) return;
      await base44.entities.LifestyleProfile.update(profile.id, { blocked_sources: [...blocked, sourceId] });
      setLifestyleProfile((prev) => prev ? { ...prev, blocked_sources: [...blocked, sourceId] } : prev);
      setItems((prev) => prev.filter((item) => item.source_id !== sourceId));
    } catch {
      // do nothing
    }
  };
  const handleCategorySelect = (category) => {
    setFilterCategory(category);
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4">
        <div className="pt-12 pb-4 flex items-center justify-between gap-3">
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>Your feed</p>
            <h1 style={{ fontSize: "24px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>Lifestyle</h1>
          </div>
          <button
            onClick={() => loadFeed(mode, 0, true)}
            disabled={refreshing}
            style={{ width: "36px", height: "36px", borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} style={{ color: "var(--rose-dust)" }} />
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {MODES.map((tab) => (
            <button key={tab.id} onClick={() => { setMode(tab.id); setFilterCategory("All"); }}
              style={{
                padding: "7px 16px", borderRadius: "9999px",
                fontSize: "12px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                border: mode === tab.id ? "none" : "1px solid var(--border)",
                backgroundColor: mode === tab.id ? "var(--plum)" : "var(--surface)",
                color: mode === tab.id ? "white" : "var(--mauve)",
                whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.15s"
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {interests.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {interests.map((interest) => (
              <button key={interest} onClick={() => setFilterCategory(interest)}
                style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "none", borderRadius: "9999px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
                {interest}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {contentCategories.map((cat) => (
            <button key={cat} onClick={() => handleCategorySelect(cat)}
              style={{
                flexShrink: 0, borderRadius: "9999px", padding: "6px 12px",
                fontSize: "11px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                border: filterCategory === cat ? "none" : "1px solid var(--border)",
                backgroundColor: filterCategory === cat ? "var(--plum)" : "var(--surface)",
                color: filterCategory === cat ? "white" : "var(--mauve)"
              }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "16px", marginBottom: "16px", boxShadow: "var(--shadow-sm)" }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: "8px" }}>Automated feed</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: "6px" }}>Fresh stories, clips, and social finds</p>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>New items roll in automatically from trusted sources, then the feed learns from your saves, likes, hides, and interests.</p>
        </div>

        {!loading && mode === "for_you" && items.length > 0 && <DailyPulseStrip items={items} />}

        {loading ? (
          <FeedSkeleton />
        ) : (
          <>
            {mode === "for_you" && trendingItems.length > 0 && <TrendingStrip items={trendingItems} />}

            {editorPick && mode === "for_you" && (
              <div className="mb-4">
                <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: "8px", paddingLeft: "4px" }}>Editor's pick today</p>
                <LifestyleCard
                  item={{ ...editorPick, is_editor_pick: true }}
                  onHide={handleHide}
                  onSave={handleSave}
                  onLike={handleLike}
                  onMuteSource={handleMuteSource}
                  saved={savedIds.has(editorPick.id)}
                  liked={likedIds.has(editorPick.id)}
                />
              </div>
            )}

            {displayedItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-semibold text-gray-700">{mode === "saved" ? "Articles you save will appear here" : "No content yet"}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {mode === "following"
                    ? "Follow more topics to build this stream."
                    : mode === "clips"
                      ? "Clips will appear here as new video finds are ranked."
                      : mode === "saved"
                        ? ""
                        : "Your feed is waking up — fresh stories publish automatically as they’re processed."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedItems.map((item) => (
                  <LifestyleCard
                    key={item.id}
                    item={item}
                    onHide={handleHide}
                    onSave={handleSave}
                    onLike={handleLike}
                    onMuteSource={handleMuteSource}
                    saved={savedIds.has(item.id)}
                    liked={likedIds.has(item.id)}
                  />
                ))}
              </div>
            )}

            <div ref={loaderRef} className="py-6 text-center">
              {loadingMore && (
                <div className="flex justify-center">
                  <div style={{ width: "24px", height: "24px", borderRadius: "9999px", border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} />
                </div>
              )}
              {!hasMore && items.length > 0 && (
                <p style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>You're all caught up</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}