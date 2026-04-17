import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StoryViewer from "./StoryViewer";

const todayStr = new Date().toISOString().split("T")[0];

const THEME_COLORS = {
  calm:          { bg: "linear-gradient(135deg, #F5ECF0, #E8D5E0)", dot: "#C4849A" },
  energy:        { bg: "linear-gradient(135deg, #FFF8E6, #FFE8A0)", dot: "#B89E6A" },
  relationships: { bg: "linear-gradient(135deg, #F0EBF5, #DDD0FF)", dot: "#9B7FCC" },
  nutrition:     { bg: "linear-gradient(135deg, #EBF2EF, #C5CEB0)", dot: "#7A9E8E" },
  cycle:         { bg: "linear-gradient(135deg, #F5ECF0, #E8C4D0)", dot: "#C4849A" },
  skin:          { bg: "linear-gradient(135deg, #FFF0F5, #FFD6E7)", dot: "#C4849A" },
  growth:        { bg: "linear-gradient(135deg, #E8F4FF, #C8DEFF)", dot: "#5B9BD5" },
  sleep:         { bg: "linear-gradient(135deg, #EBE8F5, #C8BEFF)", dot: "#7B6FCC" },
};

function StorySkeleton() {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div style={{
        width: 58, height: 58, borderRadius: "50%",
        background: "var(--ivory-dark)",
        border: "2px solid var(--border)",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
      <div style={{ width: 44, height: 8, borderRadius: 4, backgroundColor: "var(--ivory-dark)", marginTop: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );
}

export default function DailyStoriesStrip({ user }) {
  const [pack, setPack] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      const p = await base44.functions.invoke("ensureDailyStoryPack", { day_key: todayStr }).catch(() => null);
      if (!mounted) return;
      const packData = p?.data;
      if (!packData) { setLoading(false); return; }
      setPack(packData);

      if (packData.status === "READY") {
        const storyItems = await base44.entities.StoryItem.filter({ pack_id: packData.id }).catch(() => []);
        if (mounted) setItems(storyItems.sort((a, b) => a.slot_index - b.slot_index));
      } else {
        // Trigger generation of next item in the background
        base44.functions.invoke("generateNextStoryItem", { pack_id: packData.id })
          .then(() => base44.functions.invoke("finalizeStoryPack", { pack_id: packData.id }))
          .then(res => {
            if (res?.data?.status === "READY" && mounted) {
              return base44.entities.StoryItem.filter({ pack_id: packData.id });
            }
          })
          .then(si => { if (si && mounted) { setItems(si.sort((a, b) => a.slot_index - b.slot_index)); setPack(p => ({ ...p, status: "READY" })); } })
          .catch(() => {});
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const readyItems = items.filter(i => i.item_status === "DONE" && i.title);

  // Show nothing if no data at all or still loading with no pack
  if (!loading && readyItems.length === 0) return null;
  if (loading && !pack) return null;

  return (
    <div className="mx-[-16px] mt-3 mb-2">
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}.stories-scroll::-webkit-scrollbar{display:none;}`}</style>
      <div className="stories-scroll flex gap-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        {loading || (pack && pack.status === "PENDING" && readyItems.length === 0)
          ? [0,1,2,3,4].map(i => <StorySkeleton key={i} />)
          : readyItems.map((item, idx) => {
              const themeStyle = THEME_COLORS[item.theme] || THEME_COLORS.calm;
              return (
                <button
                  key={item.id}
                  onClick={() => setOpenIndex(idx)}
                  className="flex flex-col items-center flex-shrink-0"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <div style={{
                    width: 58, height: 58, borderRadius: "50%",
                    background: item.image_url ? `url(${item.image_url}) center/cover` : themeStyle.bg,
                    border: `2px solid ${themeStyle.dot}`,
                    overflow: "hidden",
                    boxShadow: `0 0 0 2px white, 0 0 0 3.5px ${themeStyle.dot}`,
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: 500, color: "var(--plum)",
                    fontFamily: "'Inter', sans-serif", marginTop: 5,
                    maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    textAlign: "center",
                  }}>
                    {item.title?.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
              );
            })
        }
      </div>

      {openIndex !== null && readyItems.length > 0 && (
        <StoryViewer
          items={readyItems}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}