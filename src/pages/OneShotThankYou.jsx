import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// OneShotThankYou — landing page after Paid Shelf checkout.
//
// Two states (driven by the `simulated` query param):
//   - simulated=1  → "Thanks for the interest" (env price ID missing,
//                     OneShotPurchases row status=simulated)
//   - paid path     → "Payment confirmed" (real Stripe checkout completed)
//
// Reads `product` query param to label the message (year_ahead, chart_atelier,
// choose_the_day).
//
// Linked from PaidShelf.jsx via createOneShotCheckout's thank_you_url +
// Stripe's success_url. See H2d-2 in mnt/femwell/base44_mps/2026-05-13_h2/.
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_LABEL = {
  year_ahead: "Year Ahead PDF",
  chart_atelier: "Birth Chart Atelier",
  choose_the_day: "Choose The Day reading",
};

const PRODUCT_TURNAROUND = {
  year_ahead: "24 hours",
  chart_atelier: "48 hours",
  choose_the_day: "7 days",
};

function readQuery() {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    product: sp.get("product") || "",
    simulated: sp.get("simulated") === "1",
    sessionId: sp.get("session_id") || "",
  };
}

export default function OneShotThankYou() {
  const [{ product, simulated, sessionId }] = useState(readQuery);
  const [email, setEmail] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.email) setEmail(u.email);
    }).catch(() => { /* anonymous OK */ });
  }, []);

  const label = PRODUCT_LABEL[product] || "commission";
  const turnaround = PRODUCT_TURNAROUND[product] || "shortly";

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Horoscope")}
          style={backBtnStyle}
          aria-label="Back"
        >
          <ArrowLeft size={16} style={{ color: "var(--plum, #4a2e3b)" }} />
        </button>

        <div style={iconBubbleStyle}>
          <Check size={22} style={{ color: "var(--rose-dust, #b65b66)" }} aria-hidden="true" />
        </div>

        {simulated ? (
          <>
            <h1 style={titleStyle}>Thanks for the interest.</h1>
            <p style={bodyStyle}>
              Astra will email you when the {label} opens. Your spot is logged.
            </p>
            {email && (
              <p style={metaStyle}>
                We&rsquo;ll write to <strong>{email}</strong>.
              </p>
            )}
          </>
        ) : (
          <>
            <h1 style={titleStyle}>Payment confirmed.</h1>
            <p style={bodyStyle}>
              Astra will send your {label} {email ? (
                <>to <strong>{email}</strong> </>
              ) : null}within {turnaround}.
            </p>
            {sessionId && (
              <p style={metaStyle}>Reference: {sessionId.slice(-12)}</p>
            )}
          </>
        )}

        <a href="/Horoscope" style={returnLinkStyle}>
          Return to the sky
        </a>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "var(--ivory, #faf6ef)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
};
const containerStyle = {
  width: "100%",
  maxWidth: 480,
  background: "var(--surface, #ffffff)",
  borderRadius: 22,
  padding: "28px 26px 24px",
  position: "relative",
  boxShadow: "0 2px 4px rgba(43,30,22,0.06), 0 12px 32px rgba(43,30,22,0.10)",
};
const backBtnStyle = {
  position: "absolute",
  top: 14,
  left: 14,
  width: 36,
  height: 36,
  borderRadius: 9999,
  border: "1px solid var(--border, #e3d8c8)",
  background: "var(--ivory, #faf6ef)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
const iconBubbleStyle = {
  width: 56,
  height: 56,
  borderRadius: 18,
  background: "var(--rose-dust-subtle, rgba(182,91,102,0.10))",
  border: "1px solid var(--rose-dust-light, rgba(182,91,102,0.22))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "20px auto 18px",
};
const titleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 26,
  letterSpacing: "-0.005em",
  color: "var(--plum, #4a2e3b)",
  textAlign: "center",
  margin: "0 0 10px",
};
const bodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--mauve, #7a5d6a)",
  textAlign: "center",
  margin: "0 0 12px",
};
const metaStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "var(--mauve, #7a5d6a)",
  textAlign: "center",
  margin: "0 0 18px",
};
const returnLinkStyle = {
  display: "block",
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--rose-dust, #b65b66)",
  textDecoration: "none",
  padding: "10px 0",
  marginTop: 12,
};
