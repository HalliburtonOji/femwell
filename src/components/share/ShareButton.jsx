// ShareButton — the reusable external-share affordance. Renders an on-brand share-card
// for a NON-personal artifact and shares it via the Web Share API, with graceful fallbacks
// (save image / copy link / WhatsApp) when Web Share isn't available. THE WALL is enforced
// in shareArtifact() (it throws on anything personal/anonymous) — this UI only ever surfaces
// on allowed artifacts. No emoji; Lucide only.

import { useState } from "react";
import { Share2, Download, Link2, MessageCircle } from "lucide-react";
import { shareArtifact, downloadBlob, whatsappHref, ShareBlockedError } from "@/lib/shareCard";

export default function ShareButton({ artifact, label = "Share", tone = "default" }) {
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState(null);   // { blob, shareText, url }
  const [copied, setCopied] = useState(false);
  const [blocked, setBlocked] = useState("");

  const light = tone === "light";
  const onShare = async () => {
    if (busy) return;
    setBusy(true); setBlocked("");
    try {
      const r = await shareArtifact(artifact);
      if (r.via === "fallback") setFallback(r);
    } catch (e) {
      if (e instanceof ShareBlockedError) setBlocked(e.message);
      else console.error("share failed:", e);
    } finally { setBusy(false); }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText([fallback?.shareText, fallback?.url].filter(Boolean).join(" ") || (fallback?.url || "")); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { /* ignore */ }
  };

  const pill = {
    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
    padding: "8px 13px", borderRadius: 9999,
    border: light ? "1px solid rgba(244,239,227,0.35)" : "1px solid var(--border, rgba(58,44,26,0.14))",
    background: light ? "rgba(244,239,227,0.10)" : "var(--surface, #FBF6E6)",
    color: light ? "#F4EFE3" : "var(--plum, #4A2A3A)",
    fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
    whiteSpace: "nowrap",
  };

  if (blocked) {
    return <span style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)", fontSize: 12, color: light ? "#E7C9CF" : "var(--rose-dust, #C4849A)" }}>{blocked}</span>;
  }

  if (fallback) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => downloadBlob(fallback.blob)} style={pill}><Download className="w-3.5 h-3.5" /> Save image</button>
        {(fallback.url || fallback.shareText) && <button onClick={copyLink} style={pill}><Link2 className="w-3.5 h-3.5" /> {copied ? "Copied" : "Copy link"}</button>}
        <a href={whatsappHref(fallback.shareText, fallback.url)} target="_blank" rel="noopener noreferrer" style={{ ...pill, textDecoration: "none" }}><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
      </div>
    );
  }

  return (
    <button onClick={onShare} disabled={busy} style={{ ...pill, opacity: busy ? 0.6 : 1 }}>
      <Share2 className="w-3.5 h-3.5" /> {busy ? "Preparing…" : label}
    </button>
  );
}
