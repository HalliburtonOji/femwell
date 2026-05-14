export default function Terms() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <a href="/Settings?section=about" style={{ fontSize: 12, color: "#E11D48", fontFamily: "'Inter', sans-serif", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Settings
        </a>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fraunces', serif", color: "var(--plum)", marginTop: 12, marginBottom: 6 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 22 }}>
          Last updated: April 2026
        </p>

        <div
          style={{
            backgroundColor: "#FFF1F2",
            border: "1px solid #FECACA",
            borderRadius: 16,
            padding: 22,
            fontSize: 14,
            color: "var(--plum)",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.7,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>1. Acceptance of terms</h2>
          <p style={{ margin: "0 0 16px" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. By accessing or using FemWell, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
          </p>

          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>2. Not medical advice</h2>
          <p style={{ margin: "0 0 16px" }}>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Content in FemWell is for educational and informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.
          </p>

          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>3. Your account</h2>
          <p style={{ margin: "0 0 16px" }}>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
          </p>

          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>4. Community conduct</h2>
          <p style={{ margin: "0 0 16px" }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. FemWell is a safe, supportive space. Harassment, hate speech, and sharing of unverified medical claims are not permitted.
          </p>

          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>5. Limitation of liability</h2>
          <p style={{ margin: "0 0 16px" }}>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. FemWell is provided "as is" without warranties of any kind.
          </p>

          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>6. Changes to these terms</h2>
          <p style={{ margin: 0 }}>
            We may update these terms from time to time. We will notify you of material changes via email or in-app notification.
          </p>
        </div>
      </div>
    </div>
  );
}