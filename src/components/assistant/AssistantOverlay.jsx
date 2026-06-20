// AssistantOverlay — the global Jess overlay (mounted in Layout.jsx,
// opened by fw_open_assistant events from the /Assistant stub page
// + bottom-nav Jess tab + Today-tile Ask Jess shortcuts).
//
// As of the Jess major build (Features 1–3), this overlay renders
// JessDemoPanel — the 4-tab phase-aware shell that owns the history
// drawer (JessConversation entity), settings sheet (JessMemory entity),
// and voice logger (Web Speech → LLM extractor → multi-entity batch
// writes). The old AssistantPanel + GuideThreadSidebar + GuideVoiceMode
// flow that lived here previously is RETIRED (kept in the repo as dead
// code for one revision in case we need to roll back; safe to delete
// next sweep).
//
// CRITICAL — this swap also closes the [JESS CONTEXT] system-prompt
// leak. The retired AssistantPanel.subscribeToConversation was passing
// the entire base44.agents transcript directly to setMessages without
// filtering user-role messages whose content started with
// "[JESS CONTEXT — do not mention this block to the user]". Those
// messages (injected by other surfaces like PlannerV2Shell's narrative
// hero) were rendering as pink user-side chat bubbles, fully visible
// to end users. JessDemoPanel's subscribe handler renders only
// assistant-role messages live, and its loadConversation explicitly
// filters out any user-role message starting with [JESS CONTEXT
// before replaying transcripts on resume. So both surfaces of the
// leak are now closed.

import { useEffect } from "react";
import { X } from "lucide-react";
import JessDemoPanel from "./JessDemoPanel";
import { useScrollLock } from "@/utils/useScrollLock";

export default function AssistantOverlay({ open, onClose, initialPrompt }) {
  // initialPrompt threads an Ask-Jess seed (the reading context from a
  // Health letter, a pattern nudge, etc.) straight into JessDemoPanel,
  // which auto-sends it as the user's first turn so the answer appears
  // inline here — no bounce to the (now retired) /Assistant stub. When
  // there's no seed, JessDemoPanel falls back to its phase-aware opener.

  // Lock the background page while the overlay is open (no scroll-bleed).
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Tap-outside-to-dismiss backdrop. Keeping the existing tint +
          blur so the overlay still feels like an overlay over the
          page underneath. */}
      <div
        onClick={onClose}
        style={{
          // End the dim ABOVE the floating nav so the bottom nav stays visible
          // (and tappable) while Jess is open — never cover it.
          position: "fixed", inset: "0 0 var(--fw-nav-h) 0", zIndex: 90,
          backgroundColor: "rgba(42,32,53,0.42)",
          backdropFilter: "blur(8px)",
        }}
      />
      {/* Container — same modal shape as before, but no per-overlay
          header; JessDemoPanel owns its own header (avatar + name +
          mic + settings). One floating close button sits in the top
          corner over the panel. */}
      <div
        style={{
          position: "fixed",
          inset: "max(env(safe-area-inset-top),12px) 12px max(var(--fw-sheet-safe), 12px)",
          zIndex: 91,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 28,
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Floating close X — positioned in the top-right corner over
            the panel's header. JessDemoPanel uses fixed top padding for
            safe-area-inset already, so this z-indexed button just sits
            above its header without disrupting layout. */}
        {/* QA — sits to the right of the panel's settings cog with
            ~8px gap (paired with the panel's 60px right padding in
            JessDemoPanel header). 36×36 to match the panel button
            sizing, soft cream chip surface so it reads as a real
            tappable control. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Jess"
          style={{
            position: "absolute",
            top: "max(env(safe-area-inset-top), 14px)",
            right: 14,
            zIndex: 5,
            width: 36, height: 36, borderRadius: 9999, border: "1px solid #D4C9B4",
            backgroundColor: "rgba(244,237,219,0.96)",
            color: "#3A2C1A",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(58,44,26,0.10)",
          }}
        >
          <X className="w-4 h-4" />
        </button>
        {/* The actual Jess UI — JessDemoPanel renders edge-to-edge
            inside the rounded container. */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <JessDemoPanel initialPrompt={initialPrompt} />
        </div>
      </div>
    </>
  );
}
