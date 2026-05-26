import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FloatingSidebar from "./components/layout/FloatingSidebar";
import AssistantOverlay from "./components/assistant/AssistantOverlay";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import CheckinModal from "./components/today/CheckinModal";
import ErrorBoundary from "./components/common/ErrorBoundary";

import { MilestoneEventListener } from "./components/programs/MilestoneCelebrationModal";
import { PodcastPlayerProvider } from "./components/lifestyle/listen/PodcastPlayerProvider";
import MiniPlayer from "./components/lifestyle/listen/MiniPlayer";
import ExpandedPlayer from "./components/lifestyle/listen/ExpandedPlayer";

const HIDE_NAV = ["Onboarding", "ContentPlayer", "CycleSettings"];
const LITE_NAV = ["ProgramDay", "ProgramDetail"];

const todayStr = new Date().toISOString().split("T")[0];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV.includes(currentPageName) || LITE_NAV.includes(currentPageName);
  const navMode = LITE_NAV.includes(currentPageName) ? "lite" : "full";

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogTab, setQuickLogTab] = useState("cycle");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState(null);

  useEffect(() => {
    const openHandler = (e) => {
      setAssistantPrompt(e.detail?.prompt || null);
      setAssistantOpen(true);
    };
    const closeHandler = () => setAssistantOpen(false);
    window.addEventListener("fw_open_assistant", openHandler);
    window.addEventListener("fw_close_assistant", closeHandler);
    return () => {
      window.removeEventListener("fw_open_assistant", openHandler);
      window.removeEventListener("fw_close_assistant", closeHandler);
    };
  }, []);
  const [quickLogUserId, setQuickLogUserId] = useState(null);

  const openQuickLog = (tabId = "cycle") => {
    setQuickLogTab(tabId);
    setShowQuickLog(true);
    if (!quickLogUserId) {
      base44.auth.me().then(u => { if (u?.id) setQuickLogUserId(u.id); }).catch(() => {});
    }
  };

  return (
    <PodcastPlayerProvider>
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>
      {showNav && <FloatingSidebar currentPageName={currentPageName} mode={navMode} openQuickLog={openQuickLog} />}
      <main
        id="main-content"
        role="main"
        className={showNav ? "pb-36" : ""}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      {showNav && currentPageName !== "Today" && (
        <footer
          role="contentinfo"
          className={showNav ? "pb-24 no-print" : "no-print"}
          style={{
            textAlign: "center",
            padding: "16px",
            fontSize: 11,
            color: "var(--mauve)",
            fontFamily: "'Inter', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            width: "100%",
          }}
        >
          Made with
          <Heart aria-hidden="true" className="w-3 h-3" style={{ color: "#E11D48", fill: "#E11D48" }} />
          <span className="sr-only">love</span> in 2026
          <span aria-hidden style={{ margin: "0 6px", color: "#9B8B7A" }}>·</span>
          {/* Sprint 12 batch 1 — small muted legal links on every page footer. */}
          <a href="/Privacy" style={{ color: "#9B8B7A", textDecoration: "none", fontSize: 11 }}>Privacy</a>
          <span aria-hidden style={{ margin: "0 4px", color: "#9B8B7A" }}>·</span>
          <a href="/Terms" style={{ color: "#9B8B7A", textDecoration: "none", fontSize: 11 }}>Terms</a>
        </footer>
      )}
      {showNav && currentPageName !== "Ideas" && (
        <Link
          to="/Ideas"
          aria-label="Open Ideas (Design Lab — dev only)"
          style={{
            position: "fixed",
            right: 14,
            bottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
            zIndex: 60,
            padding: "8px 14px",
            background: "#3A2C1A",
            color: "#F4EDDB",
            borderRadius: 9999,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
            border: "1px solid rgba(244,237,219,0.18)",
          }}
        >
          Ideas · dev
        </Link>
      )}
      {showNav && <MobileBottomNav currentPageName={currentPageName} />}
      <AssistantOverlay
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        initialPrompt={assistantPrompt}
      />
      <MilestoneEventListener />
      {showQuickLog && (
        <CheckinModal
          existing={null}
          onClose={() => setShowQuickLog(false)}
          onSave={async () => { setShowQuickLog(false); }}
          userId={quickLogUserId}
          dateStr={todayStr}
          initialTab={quickLogTab}
        />
      )}
      <MiniPlayer />
      <ExpandedPlayer />
    </div>
    </PodcastPlayerProvider>
  );
}