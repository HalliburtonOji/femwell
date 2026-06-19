// ─────────────────────────────────────────────────────────────────────────────
// cardDemoKit.jsx — shared chrome for the CARD-SYSTEM DEMOS (preview-only).
//
// Every /XxxCardsDemo wraps its seeded content in <CardDemoPage> so they all share
// the exact signature top (BRAND_IDENTITY §6.8): PAPER_BG page → a small "demo"
// ribbon with a way back to Ideas → FwFloraHero → the page's rich cards below.
// Keeps each demo file focused on its page-specific content + seed data.
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, PAPER_BG, UI } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";

export function DemoRibbon({ label }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
      <button onClick={() => navigate(createPageUrl("Ideas"))} aria-label="Back to Ideas"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>
        <ArrowLeft size={13} /> Ideas
      </button>
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold }}>
        {label}
      </span>
    </div>
  );
}

// The signature demo shell — PAPER_BG + ribbon + flora hero + content.
export function CardDemoPage({ label, hero, children }) {
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 96, position: "relative", overflowX: "clip" }}>
      <DemoRibbon label={label} />
      <FwFloraHero {...hero} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// A centred container for the single summary card (matches the demos' summary slot).
export function DemoSummary({ children }) {
  return <div style={{ maxWidth: 600, margin: "18px auto 0", padding: "0 16px" }}>{children}</div>;
}
