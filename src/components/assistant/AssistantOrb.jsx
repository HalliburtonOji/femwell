import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X } from "lucide-react";
import { safeNavigate, ROUTES } from "@/lib/routeRegistry";

// ── Cooldown helpers ────────────────────────────────────────────────────────
const COOLDOWN_ANY_MS = 10 * 60 * 1000;   // 10 min between any suggestion
const COOLDOWN_LOG_MS = 60 * 60 * 1000;    // 1 hr if user closed a "log" suggestion
const POLL_INTERVAL_MS = 12 * 60 * 1000;   // poll every 12 min

function getCooldowns() {
  try { return JSON.parse(localStorage.getItem("fw_sugg_cd") || "{}"); } catch { return {}; }
}

function recordDismiss(category) {
  const cd = getCooldowns();
  const now = Date.now();
  cd._any = now + COOLDOWN_ANY_MS;
  if (category === "log") cd.log = now + COOLDOWN_LOG_MS;
  else if (category) cd[category] = now + COOLDOWN_ANY_MS;
  localStorage.setItem("fw_sugg_cd", JSON.stringify(cd));
}

function isOnCooldown(category) {
  const cd = getCooldowns();
  const now = Date.now();
  if (cd._any && now < cd._any) return true;
  if (category && cd[category] && now < cd[category]) return true;
  return false;
}

function getStoredPosition() {
  try {
    const raw = localStorage.getItem("fw_orb_pos");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function AssistantOrb({ currentPageName }) {
  const defaultPos = () => ({ x: window.innerWidth - 84, y: window.innerHeight - 180 });
  const [position, setPosition] = useState(() => getStoredPosition() || defaultPos());
  const [dragging, setDragging] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const dragRef = useRef({ offsetX: 0, offsetY: 0, moved: false });
  const timerRef = useRef(null);
  const authedRef = useRef(false);

  useEffect(() => {
    base44.auth.me().then(() => { authedRef.current = true; fetchSuggestion(); }).catch(() => {});
    timerRef.current = setInterval(() => { if (authedRef.current) fetchSuggestion(); }, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [currentPageName]);

  const fetchSuggestion = async () => {
    if (isOnCooldown(null)) return;
    const res = await base44.functions.invoke("generateAssistantSuggestion", { currentPage: currentPageName }).catch(() => null);
    if (!res?.data) return;
    const cat = res.data.category || "general";
    if (isOnCooldown(cat)) return;
    setSuggestion({ ...res.data, category: cat });
  };

  const dismiss = () => {
    if (suggestion) recordDismiss(suggestion.category || "general");
    setSuggestion(null);
  };

  const tap = () => {
    if (dragRef.current.moved) return;
    const prompt = suggestion?.type === "question" ? suggestion.prompt : null;
    if (suggestion) dismiss();
    window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { prompt } }));
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = { offsetX: clientX - position.x, offsetY: clientY - position.y, moved: false };
    setDragging(true);
  };
  const moveDrag = (clientX, clientY) => {
    if (!dragging) return;
    dragRef.current.moved = true;
    setPosition({
      x: Math.min(window.innerWidth - 64, Math.max(8, clientX - dragRef.current.offsetX)),
      y: Math.min(window.innerHeight - 80, Math.max(8, clientY - dragRef.current.offsetY)),
    });
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    localStorage.setItem("fw_orb_pos", JSON.stringify(position));
    if (!dragRef.current.moved) tap();
  };

  const bubbleLeft = position.x > window.innerWidth / 2
    ? Math.max(8, position.x - 226)
    : position.x + 68;

  return (
    <>
      <style>{`@keyframes orb-pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.4);opacity:.1}}`}</style>

      {suggestion && (
        <div style={{ position: "fixed", zIndex: 78, left: bubbleLeft, top: Math.max(8, position.y - 4), maxWidth: 218, pointerEvents: "auto" }}>
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", borderRadius: 16, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>
                  {suggestion.type === "question" ? "Guide" : "Suggestion"}
                </p>
                <button onClick={() => {
                  if (suggestion.action_route && suggestion.type !== "question") {
                    dismiss();
                    const key = suggestion.action_route;
                    if (ROUTES.hasOwnProperty(key)) { safeNavigate(key); }
                    else if (key.startsWith("http")) window.open(key, "_blank");
                    else window.location.href = key;
                  } else {
                    const p = suggestion.prompt;
                    dismiss();
                    window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { prompt: p } }));
                  }
                }} style={{ border: "none", background: "none", padding: 0, textAlign: "left", cursor: "pointer" }}>
                  <p style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.4, fontFamily: "'Inter', sans-serif", fontWeight: 500, margin: 0 }}>
                    {suggestion.prompt}
                  </p>
                </button>
              </div>
              <button onClick={dismiss} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--mauve)", padding: 0, flexShrink: 0, marginTop: 1 }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => { if (dragging) moveDrag(e.clientX, e.clientY); }}
        onMouseUp={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => { if (dragging) { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); } }}
        onTouchEnd={endDrag}
        style={{
          position: "fixed", zIndex: 79, left: position.x, top: position.y,
          width: 54, height: 54, borderRadius: 9999,
          border: "1px solid var(--rose-dust-light)",
          backgroundColor: "var(--surface)",
          boxShadow: dragging ? "var(--shadow-lg)" : "var(--shadow-md)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: dragging ? "grabbing" : "pointer",
          touchAction: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", backgroundColor: "var(--rose-dust)", animation: "orb-pulse 2.4s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 38% 32%, rgba(232,196,208,0.95) 0%, var(--rose-dust) 58%, #8A3858 100%)", boxShadow: "0 0 12px rgba(196,132,154,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: "white" }} />
        </div>
      </button>


    </>
  );
}