// Terms & Conditions — Sprint 12 batch 1
//
// Full T&Cs at /terms (and the capitalised alias /Terms).
// Mounted OUTSIDE AuthenticatedApp in App.jsx so a prospective
// user can read it before signing up.

import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  gold:     "#D4AF37",
};

const TERMS_SECTIONS = [
  {
    title: "What FemWell is",
    body: [
      "FemWell is a wellness companion app for women — a place to track your health, see your patterns, and have a supportive conversation with Jess, our in-app AI assistant.",
      "FemWell is NOT a medical device, not a substitute for clinical care, and not a diagnostic tool. We do not provide medical advice, diagnoses, or treatment.",
      "For any medical concern, contact your GP, NHS 111, or A&E. In an emergency call 999.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "Use FemWell only for its intended personal-wellness purposes.",
      "Do not attempt to reverse-engineer, scrape at scale, or interfere with the platform.",
      "Do not use FemWell to harass, threaten, or harm others.",
      "Do not impersonate another person when creating an account.",
      "We may suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "AI disclaimer — Jess is not a doctor",
    body: [
      "Jess is an AI wellness companion. She does not have medical credentials. Her suggestions are for informational and supportive purposes only.",
      "Jess is trained to escalate to professional support (Samaritans 116 123, A&E) when she detects signs of crisis. She will never replace a real clinician.",
      "Do not rely on Jess for diagnosis, treatment recommendations, medication advice, or emergency response.",
      "FemWell, our staff, and our service providers are not liable for any decision you make in reliance on Jess's output.",
    ],
  },
  {
    title: "Age requirements",
    body: [
      "FemWell is for users aged 13 and over. Users under 13 are not permitted.",
      "Users aged 13–17 must have parental or guardian consent before using FemWell.",
      "By using FemWell you confirm that you meet these age requirements (or have the required parental consent).",
      "Extra data protections apply to under-18 accounts — see our Privacy Policy.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "FemWell is provided \"as is\" and \"as available\". To the maximum extent permitted by law, we exclude all warranties beyond those that cannot be excluded under English consumer law.",
      "We are not liable for any indirect, consequential, or incidental losses — including but not limited to lost data, lost opportunity, or any health outcome — arising from your use of FemWell.",
      "Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of England and Wales.",
      "Any disputes are subject to the exclusive jurisdiction of the courts of England and Wales.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "We may update these terms from time to time. Material changes will be communicated in-app at least 14 days before they take effect.",
      "Continued use after a change constitutes acceptance of the new terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these terms? Contact us at privacy@femwells.com.",
    ],
  },
];

export default function Terms() {
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
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>FemWell</p>
          <h1 style={{
            margin: "6px 0 4px", fontSize: 30, fontWeight: 600,
            color: C.espressoDk,
            letterSpacing: -0.4, lineHeight: 1.1,
          }}>Terms &amp; Conditions</h1>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Last updated: May 2026</p>
        </header>

        <p style={{ margin: "0 0 18px", fontSize: 14.5, color: C.espresso, lineHeight: 1.65 }}>
          These terms govern your use of FemWell. By creating an account or using
          the app, you agree to them. They&apos;re written to be clear — if anything
          is confusing, email us.
        </p>

        {TERMS_SECTIONS.map((sec, i) => (
          <section key={i} style={{
            background: C.paperHi, border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${C.gold}`, borderRadius: 14,
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
          See also <Link to="/Privacy" style={{ color: C.espresso, textDecoration: "underline" }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
