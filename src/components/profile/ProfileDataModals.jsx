import { useEffect, useRef } from "react";
import { createPageUrl } from "@/utils";
import { UI, useEscape } from "@/components/journal/Editorial";

const backdrop = {
  position: "fixed", inset: 0, zIndex: 130,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  background: "rgba(39,31,42,.32)", backdropFilter: "blur(5px)",
};
const sheet = {
  width: "100%", maxWidth: 480,
  maxHeight: "calc(100dvh - 16px)", overflowY: "auto",
  background: "linear-gradient(160deg, #FFFFFF 0%, #FBFAF8 72%, #F7FAF7 100%)",
  border: "1px solid rgba(168,137,63,.22)", borderBottom: 0,
  borderRadius: "28px 28px 0 0",
  padding: "22px 20px calc(22px + env(safe-area-inset-bottom, 0px))",
  boxShadow: "0 -12px 38px rgba(43,34,44,.16)",
};
const mainLink = {
  display: "block", width: "100%", textAlign: "center", padding: "13px 16px",
  minHeight: 46, borderRadius: 999, background: "#504252", color: "#FFFFFF",
  fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none",
};
const closeButton = {
  width: "100%", padding: "12px 16px", minHeight: 44, borderRadius: 999,
  border: "1px solid rgba(80,66,82,.24)", background: "#FFFFFF",
  color: "#504252", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
};

export default function ProfileDataModals({ showExport, showDelete, onCloseExport, onCloseDelete }) {
  useEscape(showExport ? onCloseExport : showDelete ? onCloseDelete : null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!showExport && !showDelete) return;
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, [showExport, showDelete]);
  const keepFocusInside = (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href]')];
    if (!focusable.length) return;
    if (event.shiftKey && (document.activeElement === focusable[0] || document.activeElement === dialogRef.current)) { event.preventDefault(); focusable.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
  };

  return (
    <>
      {showExport && (
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="profile-export-title" onKeyDown={keepFocusInside} style={backdrop} onClick={onCloseExport}>
          <div className="fw-sheet-safe" style={sheet} onClick={event => event.stopPropagation()}>
            <h3 id="profile-export-title" style={{ fontSize: 27, fontFamily: "Cormorant Garamond, Georgia, serif", color: "#504252", fontWeight: 600, margin: "0 0 6px" }}>Your data, yours to take</h3>
            <p style={{ fontFamily: UI, fontSize: 14, color: "#5C515D", lineHeight: 1.55, margin: "0 0 16px" }}>
              Settings can prepare a data file. Doctor Export makes a separate health summary.
            </p>
            <a href={`${createPageUrl("Settings")}?section=privacy`} onClick={onCloseExport} style={{ ...mainLink, marginBottom: 9 }}>Open data controls</a>
            <a href={createPageUrl("DoctorExport")} onClick={onCloseExport} style={{ display: "block", textAlign: "center", fontFamily: UI, color: "#504252", padding: "9px 12px", marginBottom: 8, textDecoration: "underline", textUnderlineOffset: 3 }}>Open Doctor Export</a>
            <button type="button" onClick={onCloseExport} style={closeButton}>Close</button>
          </div>
        </div>
      )}

      {showDelete && (
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="profile-delete-title" onKeyDown={keepFocusInside} style={backdrop} onClick={onCloseDelete}>
          <div className="fw-sheet-safe" style={sheet} onClick={event => event.stopPropagation()}>
            <h3 id="profile-delete-title" style={{ fontSize: 27, fontFamily: "Cormorant Garamond, Georgia, serif", color: "#8D303B", fontWeight: 600, margin: "0 0 6px" }}>Delete my data</h3>
            <p style={{ fontFamily: UI, fontSize: 14, color: "#5C515D", lineHeight: 1.55, margin: "0 0 16px" }}>
              To ask for permanent deletion, write to FemWell support. This panel has not sent a request or deleted anything.
            </p>
            <a href="mailto:support@femwells.com?subject=FemWell%20data%20deletion%20request" style={{ ...mainLink, background: "#8D303B", marginBottom: 10 }}>Write to support</a>
            <button type="button" onClick={onCloseDelete} style={closeButton}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
