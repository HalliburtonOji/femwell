import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { safeNavigate } from "@/lib/routeRegistry";
import { toast } from "sonner";

const THEME_GRADIENTS = {
  calm:          "linear-gradient(160deg, #3D2A35 0%, #2A2035 100%)",
  energy:        "linear-gradient(160deg, #3D3020 0%, #2A2035 100%)",
  relationships: "linear-gradient(160deg, #2A2050 0%, #2A2035 100%)",
  nutrition:     "linear-gradient(160deg, #1A3028 0%, #2A2035 100%)",
  cycle:         "linear-gradient(160deg, #3D1A2A 0%, #2A2035 100%)",
  skin:          "linear-gradient(160deg, #3D2030 0%, #2A2035 100%)",
  growth:        "linear-gradient(160deg, #1A2840 0%, #2A2035 100%)",
  sleep:         "linear-gradient(160deg, #1A1838 0%, #2A2035 100%)",
};

export default function StoryViewer({ items: rawItems, initialIndex, onClose }) {
  // Filter out FAILED items — only show DONE items
  const items = rawItems.filter(i => i.item_status !== 'FAILED');
  const [idx, setIdx] = useState(Math.min(initialIndex || 0, items.length - 1));
  const timerRef = useRef(null);

  const item = items[idx];
  const bg = item?.image_url ? `url(${item.image_url}) center/cover no-repeat` : THEME_GRADIENTS[item?.theme] || THEME_GRADIENTS.calm;

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (idx < items.length - 1) setIdx(i => i + 1);
      else onClose();
    }, 7000);
    return () => clearTimeout(timerRef.current);
  }, [idx]);

  const goNext = () => { clearTimeout(timerRef.current); if (idx < items.length - 1) setIdx(i => i + 1); else onClose(); };
  const goPrev = () => { clearTimeout(timerRef.current); if (idx > 0) setIdx(i => i - 1); };

  if (!item) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000" }}>
      <style>{`@keyframes kb-story{0%{transform:scale(1.0)}100%{transform:scale(1.08)}} @keyframes prog{from{width:0%}to{width:100%}}`}</style>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: bg, animation: "kb-story 7s linear forwards" }} />
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.3) 100%)" }} />

      {/* Progress bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", gap: 4, padding: "16px 16px 0" }}>
        {items.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
            <div style={{
              height: "100%", backgroundColor: "var(--surface)", borderRadius: 2,
              width: i < idx ? "100%" : i === idx ? undefined : "0%",
              animation: i === idx ? `prog 7s linear forwards` : undefined,
            }} />
          </div>
        ))}
      </div>

      {/* Close */}
      <button onClick={onClose} style={{ position: "absolute", top: 28, right: 16, width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <X className="w-4 h-4" style={{ color: "white" }} />
      </button>

      {/* Tap zones */}
      <div style={{ position: "absolute", inset: "60px 50% 0 0", zIndex: 1 }} onClick={goPrev} />
      <div style={{ position: "absolute", inset: "60px 0 0 50%", zIndex: 1 }} onClick={goNext} />

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 52px", zIndex: 2 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
          {item.theme}
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 12 }}>
          {item.title}
        </h2>
        {item.body_line_1 && (
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, marginBottom: item.body_line_2 ? 4 : 0 }}>
            {item.body_line_1}
          </p>
        )}
        {item.body_line_2 && (
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, marginBottom: 20 }}>
            {item.body_line_2}
          </p>
        )}
        {item.cta_label && item.route_key && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              safeNavigate(item.route_key, (msg) => toast.error(msg));
            }}
            style={{ backgroundColor: "var(--surface)", color: "var(--plum)", borderRadius: 9999, padding: "12px 24px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", }}
          >
            {item.cta_label}
          </button>
        )}
      </div>
    </div>
  );
}