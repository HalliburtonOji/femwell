// Privacy Policy — Sprint 12 batch 1
//
// Full UK GDPR Privacy Policy at /privacy (and the capitalised
// alias /Privacy). Mounted OUTSIDE AuthenticatedApp in App.jsx so
// a prospective user can read it before signing up.

import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  blush:    "#E8B4B8",
};

const PRIVACY_SECTIONS = [
  {
    title: "What we collect",
    body: [
      "Account basics: your email address (for authentication only) and an optional display name.",
      "Health data you log: mood, energy, sleep, symptoms, hydration, meals, medications, supplements, habits, journal entries, period and cycle data, life-stage indicators.",
      "Conversations with Jess: messages you send and Jess's replies are stored so the conversation can resume across sessions.",
      "Usage data: only if you have opted in to anonymous analytics under Settings → \"Help improve FemWell\".",
    ],
  },
  {
    title: "Why we collect it",
    body: [
      "To personalise your experience — phase-aware suggestions, longitudinal patterns, and Jess's memory of what matters to you.",
      "To run the wellness companion features (Jess) that depend on knowing your context to be useful.",
      "To meet legal obligations where applicable (record-keeping required by law).",
    ],
  },
  {
    title: "How we use it (Jess AI context)",
    body: [
      "Your health data is included in the context window sent to Jess (the in-app assistant) so she can respond with awareness of your patterns. We do not train any third-party model on your data.",
      "We do not use your data for advertising. FemWell does not show ads.",
    ],
  },
  {
    title: "Who we share it with",
    body: [
      "We share your data with nobody. Base44 acts as our data processor and hosts the database that stores your account — under contract — but does not access individual rows for any purpose other than running the platform.",
      "We do not sell, rent, or trade your data.",
    ],
  },
  {
    title: "Data retention",
    body: [
      "We keep your data for as long as your account is active. Delete your account from Settings and we hard-delete all your rows within 30 days.",
      "Some legally-required records (e.g. payment receipts) may be retained for as long as the law requires.",
    ],
  },
  {
    title: "Your rights under UK GDPR",
    body: [
      "Access — request a copy of everything we hold on you. Use Settings → \"Download my data\" to export a full JSON.",
      "Rectification — correct anything wrong, in-app (most things) or by email.",
      "Erasure — \"delete my account\" in Settings is a hard delete with cascade.",
      "Portability — the JSON export from Settings is machine-readable.",
      "Restriction — pause our use of your data; email us.",
      "Objection — object to specific uses; email us.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions, concerns, or rights requests? Contact us at privacy@femwells.com.",
      "We respond within 30 days as required by UK GDPR.",
    ],
  },
  {
    title: "Law enforcement policy",
    body: [
      "We require a court order or its legal equivalent before disclosing user data to law enforcement. We do not voluntarily disclose user records in response to informal requests.",
      "Per the UK police guidance issued December 2024, we treat health-tracking data (period, cycle, life stage) as sensitive special-category data and apply the strictest legal threshold before disclosure.",
      "If we are compelled to disclose, we notify the affected user unless legally prohibited.",
    ],
  },
];

export default function Privacy() {
  return (
    <div style={{
      minHeight: "100vh", background: C.cream, color: C.espresso,
      paddingBottom: 80,
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 22px 32px" }}>
        <Link to="/" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          color: C.muted, textDecoration: "none", fontSize: 13, padding: "6px 0",
        }}>
          <ChevronLeft size={16} /> Home
        </Link>
        <header style={{ margin: "12px 0 18px" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.blush }}>FemWell</p>
          <h1 className="fw-display" style={{ margin: "6px 0 4px" }}>Privacy</h1>
          <h2 className="fw-heading" style={{ margin: "0 0 4px" }}>Privacy Policy</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Last updated: May 2026</p>
        </header>

        <p style={{ margin: "0 0 18px", fontSize: 14.5, color: C.espresso, lineHeight: 1.65 }}>
          FemWell is a UK-based women&apos;s wellness companion. We take privacy seriously
          because the things you log here — your cycle, your moods, your symptoms —
          are some of the most sensitive data you&apos;ll ever share with a piece of
          software. This policy tells you exactly what happens to that data.
        </p>

        {PRIVACY_SECTIONS.map((sec, i) => (
          <section key={i} style={{
            background: C.paperHi, border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${C.blush}`, borderRadius: 14,
            padding: "14px 16px", margin: "0 0 12px",
          }}>
            <h2 style={{
              margin: "0 0 8px", fontSize: 17, fontWeight: 600,
              color: C.espressoDk,
            }}>{sec.title}</h2>
            <ul style={{ margin: 0, padding: "0 0 0 18px", color: C.espresso, fontSize: 14, lineHeight: 1.6 }}>
              {sec.body.map((line, j) => <li key={j} style={{ marginBottom: 6 }}>{line}</li>)}
            </ul>
          </section>
        ))}

        <p style={{
          margin: "18px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.55,
          textAlign: "center",
        }}>
          Questions? Contact us at <strong style={{ color: C.espresso }}>privacy@femwells.com</strong>.
          <br />
          See also <Link to="/Terms" style={{ color: C.espresso, textDecoration: "underline" }}>Terms &amp; Conditions</Link>.
        </p>
      </div>
    </div>
  );
}
