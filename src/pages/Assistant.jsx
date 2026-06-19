import { useMemo } from "react";
import JessDemoPanel from "@/components/assistant/JessDemoPanel";

// The /Assistant route is Jess's full-page home. It used to be a hollow
// stub that dispatched `fw_open_assistant` and relied on the global overlay
// opening — but on a direct load / hard navigation the page's mount effect
// fired BEFORE Layout attached its event listener (effects run child-first),
// so the event was missed and the user was stranded on the dead stub. We now
// render the real JessDemoPanel directly: Jess answers right on the page.
export default function Assistant() {
  // Pick up any pre-filled prompt an Ask-Jess surface stored before linking
  // here (e.g. a saved ADVICE item). Read+clear once at mount; if absent,
  // JessDemoPanel falls back to its phase-aware opener.
  const initialPrompt = useMemo(() => {
    let p = null;
    try {
      p = sessionStorage.getItem("jess_initial_prompt")
        || sessionStorage.getItem("jess_chat_prompt");
      sessionStorage.removeItem("jess_initial_prompt");
      sessionStorage.removeItem("jess_chat_prompt");
      sessionStorage.removeItem("jess_open_chat");
    } catch (_) { /* sessionStorage may throw in private mode */ }
    return p;
  }, []);

  return (
    // Fixed box above the bottom nav (~72px + safe area) gives the panel a
    // bounded height for its own internal scroll, and sidesteps the main
    // wrapper's bottom padding. z-index sits below the nav (z-40) so the
    // user can always navigate away.
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: "var(--fw-nav-h)",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--surface)",
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <JessDemoPanel initialPrompt={initialPrompt} />
      </div>
    </div>
  );
}
