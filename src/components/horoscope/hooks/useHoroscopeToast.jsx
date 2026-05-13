import { useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useHoroscopeToast — simple toast state manager for the horoscope tab.
//
// Usage:
//   const { toast, showToast, dismissToast } = useHoroscopeToast();
//   showToast("Reading the sky...", "info");
//   showToast("Chart saved.", "success");
//   showToast("Couldn't reach the sky.", "error");
//
// Pass `toast` + `dismissToast` to <HoroscopeToast />.
// ─────────────────────────────────────────────────────────────────────────────

export default function useHoroscopeToast() {
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast({ message: "", type: "info" });
  }, []);

  return { toast, showToast, dismissToast };
}