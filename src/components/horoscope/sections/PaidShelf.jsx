import { useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// PaidShelf — Section 7.5. Three one-shot product cards in a horizontal
// snap-x scrollable row. Each card has the same Plum Night shell, a corner
// price ribbon, Fraunces title, italic sub-line, four-line specimen, and a
// CTA pill that calls createOneShotCheckout with the matching product key.
//
// Products:
//   - year_ahead    £19 / 1900p
//   - chart_atelier £29 / 2900p
//   - choose_the_day £55 / 5500p
//
// Attribution rule (D2): every card reads "Backed by Astra Cole, MA, FAS".
// Never "Backed by Skyfield" — real ephemeris is H3 territory.
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const PRODUCTS = [
  {
    key: "year_ahead",
    priceLabel: "£19",
    ribbon: "Year Ahead PDF",
    title: "Your Year Ahead, mapped.",
    sub: "12-page PDF · sent to your inbox in 24 hours · signed by Astra.",
    specimen:
      `The first half of ${CURRENT_YEAR} sits under Saturn-trine-Venus — slower yes, `
      + "but a slow you'll like. June reframes a partnership question. "
      + "The blank season is October-November. November opens a door that closed in 2022.",
    ctaLabel: "Get my Year Ahead · £19",
  },
  {
    key: "chart_atelier",
    priceLabel: "£29",
    ribbon: "Birth Chart Atelier",
    title: "Your full natal chart, hand-read.",
    sub: "20-page PDF · sent in 48 hours · signed by Astra Cole, MA, FAS.",
    specimen:
      "We start at the rising — what the room feels when you walk in. "
      + "Then the moon, your most intimate weather. The Sun is least surprising. "
      + "We finish at the asteroids; few astrologers go this deep, which is exactly why we do.",
    ctaLabel: "Read my chart · £29",
  },
  {
    key: "choose_the_day",
    priceLabel: "£55",
    ribbon: "Choose The Day",
    title: "Choose The Day.",
    sub: "Electional astrology · we pick the date for your wedding, surgery, or big launch · 7-day turnaround.",
    specimen:
      "You tell us the question; we walk it through the 3 best windows in the next 12 months. "
      + "Each window gets a one-page write-up — what's good, what to watch, what to avoid.",
    ctaLabel: "Choose my day · £55",
  },
];

export default function PaidShelf() {
  const [busyKey, setBusyKey] = useState(null);

  const handleBuy = async (key) => {
    if (busyKey) return;
    setBusyKey(key);
    try {
      const res = await base44.functions.invoke("createOneShotCheckout", {
        product: key,
      });
      const payload = res?.data || res || {};
      if (payload.simulated) {
        // Env price ID missing — operator has been logged. Route the user
        // to the simulated thank-you page so they get a clear UX state.
        console.warn(
          `[PaidShelf] ${key} simulated=true — env STRIPE price ID missing. `
            + "Interest logged to OneShotPurchases.",
        );
        const url = payload.thank_you_url
          || `/OneShotThankYou?product=${encodeURIComponent(key)}&simulated=1`;
        window.location.assign(url);
        return;
      }
      if (payload.checkout_url) {
        window.location.href = payload.checkout_url;
        return;
      }
      console.warn(`[PaidShelf] ${key} — unexpected response shape`, payload);
      alert("Something went wrong. Please try again.");
    } catch (err) {
      console.warn(`[PaidShelf] ${key} checkout error:`, err?.message || err);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section style={sectionStyle} aria-label="Paid Shelf">
      <h3 style={sectionTitleStyle}>From the Atelier</h3>
      <p style={sectionSubStyle}>
        Three commissions, signed by Astra. Pay once, keep forever.
      </p>
      <div style={shelfStyle}>
        {PRODUCTS.map((p) => (
          <article key={p.key} style={cardStyle}>
            <div style={ribbonRowStyle}>
              <span style={ribbonLabelStyle}>One-shot &middot; {p.ribbon}</span>
              <span style={priceChipStyle}>{p.priceLabel}</span>
            </div>
            <h4 style={cardTitleStyle}>{p.title}</h4>
            <p style={cardSubStyle}>{p.sub}</p>
            <p style={cardSpecimenStyle}>&ldquo;{p.specimen}&rdquo;</p>
            <div style={cardFooterStyle}>
              <span style={attributionStyle}>Backed by Astra Cole, MA, FAS</span>
              <button
                type="button"
                onClick={() => handleBuy(p.key)}
                disabled={busyKey === p.key}
                style={{ ...ctaStyle, opacity: busyKey === p.key ? 0.65 : 1 }}
              >
                {p.ctaLabel}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles — Plum Night palette, horizontal snap-x scroll on mobile, wraps on
// larger viewports. Matches the rest of the Horoscope tab.
// ─────────────────────────────────────────────────────────────────────────────
const sectionStyle = {
  marginTop: 22,
};
const sectionTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 17,
  fontWeight: 400,
  color: "var(--plum-deep, #2b1e16)",
  margin: "0 0 4px",
};
const sectionSubStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12.5,
  lineHeight: 1.5,
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 14px",
};
const shelfStyle = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  paddingBottom: 8,
  WebkitOverflowScrolling: "touch",
};
const cardStyle = {
  flex: "0 0 86%",
  maxWidth: 340,
  scrollSnapAlign: "start",
  position: "relative",
  overflow: "hidden",
  borderRadius: 18,
  padding: "16px 16px 14px",
  color: "var(--cream, #FAF4EA)",
  background: "radial-gradient(circle at 30% 20%, #3a2a4c 0%, #221a2e 60%, #15101e 100%)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 10px 24px rgba(43,30,22,0.18)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const ribbonRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};
const ribbonLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.62)",
};
const priceChipStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 15,
  color: "rgba(232,196,208,0.95)",
  background: "rgba(232,196,208,0.10)",
  border: "1px solid rgba(232,196,208,0.28)",
  borderRadius: 9999,
  padding: "2px 10px",
};
const cardTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 17,
  lineHeight: 1.25,
  color: "var(--cream, #FAF4EA)",
  margin: "2px 0 0",
};
const cardSubStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(247,239,225,0.76)",
  margin: 0,
};
const cardSpecimenStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(247,239,225,0.62)",
  margin: 0,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(245,230,211,0.04)",
  border: "1px dashed rgba(245,230,211,0.14)",
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const cardFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap",
  marginTop: "auto",
  paddingTop: 4,
};
const attributionStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.55)",
};
const ctaStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 12.5,
  color: "var(--plum-deep, #2b1e16)",
  background: "rgba(232,196,208,0.92)",
  border: "none",
  borderRadius: 9999,
  padding: "9px 16px",
  cursor: "pointer",
  minHeight: 36,
  boxShadow: "0 2px 6px rgba(232,196,208,0.20)",
};
