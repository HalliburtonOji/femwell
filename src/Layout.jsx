import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FloatingSidebar from "./components/layout/FloatingSidebar";
import AssistantOverlay from "./components/assistant/AssistantOverlay";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import CheckinModal from "./components/today/CheckinModal";
import AssistantOrb from "./components/assistant/AssistantOrb";
import NotificationBellButton from "./components/notifications/NotificationBellButton";
import { MilestoneEventListener } from "./components/programs/MilestoneCelebrationModal";

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
  const [layoutUserId, setLayoutUserId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.id) setLayoutUserId(u.id); }).catch(() => {});
  }, []);

  const openQuickLog = (tabId = "cycle") => {
    setQuickLogTab(tabId);
    setShowQuickLog(true);
    if (!quickLogUserId) {
      base44.auth.me().then(u => { if (u?.id) setQuickLogUserId(u.id); }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>
      {/* Notification bell — top right floating */}
      {showNav && layoutUserId && (
        <div className="fixed z-40 no-print" style={{ top: "max(env(safe-area-inset-top), 12px)", right: 16 }}>
          <NotificationBellButton userId={layoutUserId} />
        </div>
      )}
      {showNav && <FloatingSidebar currentPageName={currentPageName} mode={navMode} openQuickLog={openQuickLog} />}
      <div className={showNav ? "pb-24" : ""}>
        {children}
      </div>
      {showNav && <MobileBottomNav currentPageName={currentPageName} />}
      {showNav && <AssistantOrb currentPageName={currentPageName} />}
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
    </div>
  );
}