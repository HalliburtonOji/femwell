import { useState } from "react";
import { createPageUrl } from "@/utils";

export default function ProfileDataModals({ showExport, showDelete, onCloseExport, onCloseDelete }) {
  const [dataDeletionRequested, setDataDeletionRequested] = useState(false);

  return (
    <>
      {showExport && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end" }}>
          <div onClick={onCloseExport} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "relative", width: "100%", backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: 24, zIndex: 1 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "var(--plum)", fontWeight: 600, marginBottom: 10 }}>Data export</h3>
            <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 16 }}>
              Your full data export will be available in a future update. For now, you can use Doctor Export to download a health summary.
            </p>
            <a href={createPageUrl("DoctorExport")} onClick={onCloseExport}
              style={{ display: "block", width: "100%", textAlign: "center", padding: "13px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: 10 }}>
              Open Doctor Export
            </a>
            <button onClick={onCloseExport}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", fontSize: 14, fontWeight: 600, color: "var(--plum)", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end" }}>
          <div onClick={onCloseDelete} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "relative", width: "100%", backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: 24, zIndex: 1 }}>
            {dataDeletionRequested ? (
              <>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "var(--plum)", fontWeight: 600, marginBottom: 10 }}>Request received</h3>
                <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 20 }}>
                  Your deletion request has been received. We will process it within 7 days and notify you by email.
                </p>
                <button onClick={() => { onCloseDelete(); setDataDeletionRequested(false); }}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#D94F4F", fontWeight: 600, marginBottom: 10 }}>Delete my data</h3>
                <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, marginBottom: 20 }}>
                  This will permanently delete all your tracked data. This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={onCloseDelete}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", fontSize: 14, fontWeight: 600, color: "var(--plum)", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    Cancel
                  </button>
                  <button onClick={() => setDataDeletionRequested(true)}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", backgroundColor: "#D94F4F", fontSize: 14, fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    Confirm Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}