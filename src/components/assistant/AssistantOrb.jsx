import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X } from "lucide-react";
import { createPageUrl } from "@/utils";
import AssistantOverlay from "./AssistantOverlay";

function getStoredPosition() {
  try {
    const raw = localStorage.getItem("fw_assistant_orb_pos");
    return raw ? JSON.parse(raw) : { x: window.innerWidth - 92, y: window.innerHeight - 180 };
  } catch {
    return { x: window.innerWidth - 92, y: window.innerHeight - 180 };
  }
}

export default function AssistantOrb({ currentPageName }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const dragRef = useRef({ offsetX: 0, offsetY: 0, moved: false });
  const timerRef = useRef(null);

  useEffect(() => {
    setPosition(getStoredPosition());
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
      setProfile(profiles[0] || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const loadSuggestion = async () => {
      const response = await base44.functions.invoke("generateAssistantSuggestion", { currentPage: currentPageName }).catch(() => null);
      if (response?.data) setSuggestion(response.data);
    };
    loadSuggestion();
    timerRef.current = setInterval(loadSuggestion, 30000);
    return () => clearInterval(timerRef.current);
  }, [user?.id, currentPageName]);

  const bubbleStyle = useMemo(() => ({ left: Math.max(14, position.x - 250), top: Math.max(14, position.y - 12) }), [position]);

  const openSuggestion = () => {
    if (!suggestion) {
      setOverlayOpen(true);
      return;
    }
    if (suggestion.type === "suggestion") {
      handleNavigate(suggestion);
      return;
    }
    setOverlayOpen(true);
  };

  const handleNavigate = (item) => {
    setOverlayOpen(false);
    if (!item?.action_route) return;
    if (item.action_route.startsWith("http")) {
      window.open(item.action_route, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = item.action_route.startsWith("/") ? item.action_route : createPageUrl(item.action_route);
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = { offsetX: clientX - position.x, offsetY: clientY - position.y, moved: false };
    setDragging(true);
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragging) return;
    dragRef.current.moved = true;
    const next = {
      x: Math.min(window.innerWidth - 70, Math.max(10, clientX - dragRef.current.offsetX)),
      y: Math.min(window.innerHeight - 90, Math.max(10, clientY - dragRef.current.offsetY)),
    };
    setPosition(next);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    localStorage.setItem("fw_assistant_orb_pos", JSON.stringify(position));
  };

  return (
    <>
      <style>{`@keyframes orb-pulse{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.35);opacity:.12}} @keyframes orb-core{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}`}</style>
      {suggestion && !overlayOpen && (
        <div style={{ position: "fixed", zIndex: 78, ...bubbleStyle, maxWidth: 230 }}>
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", borderRadius: 20, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{suggestion.type === "question" ? "Question" : "Suggestion"}</p>
                <button onClick={openSuggestion} style={{ border: "none", background: "none", padding: 0, textAlign: "left", cursor: "pointer" }}>
                  <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.45, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{suggestion.prompt}</p>
                </button>
              </div>
              <button onClick={() => setSuggestion(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--mauve)", padding: 0 }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={endDrag}
        onClick={() => { if (!dragRef.current.moved) setOverlayOpen(true); }}
        style={{ position: "fixed", zIndex: 79, left: position.x, top: position.y, width: 58, height: 58, borderRadius: 9999, border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--surface)", boxShadow: dragging ? "var(--shadow-lg)" : "var(--shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", cursor: dragging ? "grabbing" : "grab" }}
      >
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", backgroundColor: "var(--rose-dust)", animation: "orb-pulse 2.2s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "relative", width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle at 38% 32%, rgba(232,196,208,0.95) 0%, var(--rose-dust) 58%, #8A3858 100%)", animation: "orb-core 2.2s ease-in-out infinite", boxShadow: "0 0 14px rgba(196,132,154,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles className="w-4 h-4" style={{ color: "white" }} />
        </div>
      </button>
      <AssistantOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        initialPrompt={suggestion?.type === "question" ? suggestion.prompt : `Hi ${profile?.ai_assistant_name || "Guide"}, I need help.`}
        suggestion={suggestion}
        onNavigate={handleNavigate}
      />
    </>
  );
}