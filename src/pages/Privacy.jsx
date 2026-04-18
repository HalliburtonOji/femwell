export default function Privacy() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <a href="/Settings?section=about" style={{ fontSize: 12, color: "#E11D48", fontFamily: "'Inter', sans-serif", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Settings
        </a>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", marginTop: 12, marginBottom: 6 }}>
          Privacy Policy
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
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>1. What we collect</h2>
          <p style={{ margin: "0 0 16px" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. We collect information you give us directly — such as your email, display name, cycle data, and any check-in entries you choose to log — and some usage analytics to improve the app.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>2. How we use your data</h2>
          <p style={{ margin: "0 0 16px" }}>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Your health data is used solely to personalise your experience in FemWell — predictions, recommendations, and insights. We never sell your data.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>3. Who can see your data</h2>
          <p style={{ margin: "0 0 16px" }}>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Only you. Community posts are public by default unless you toggle "anonymous" — your name is never attached to your cycle logs.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>4. Your rights</h2>
          <p style={{ margin: "0 0 16px" }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. You can export your data at any time from Settings → Data, and request full deletion via support@femwells.com.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>5. Data security</h2>
          <p style={{ margin: "0 0 16px" }}>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. We use industry-standard encryption in transit and at rest, and restrict employee access to your data on a need-to-know basis.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>6. Contact us</h2>
          <p style={{ margin: 0 }}>
            Questions about privacy? Email <a href="mailto:support@femwells.com" style={{ color: "#E11D48", fontWeight: 600 }}>support@femwells.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}