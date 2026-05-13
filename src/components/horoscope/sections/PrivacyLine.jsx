// ─────────────────────────────────────────────────────────────────────────────
// PrivacyLine — Section 12. Two-line 10px Inter footer. Sale-readiness
// safeguard — birth-time and cycle data privacy + Stripe PCI-DSS L1 billing.
// ─────────────────────────────────────────────────────────────────────────────

export default function PrivacyLine() {
  return (
    <div style={shellStyle}>
      <p style={lineStyle}>Your birth time and cycle data never leave your device unencrypted.</p>
      <p style={lineStyle}>FemWell Plus billing handled by Stripe (PCI-DSS L1).</p>
    </div>
  );
}

const shellStyle = {
  margin: "8px 0 16px",
  padding: "8px 12px",
  textAlign: "center",
};
const lineStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  lineHeight: 1.5,
  color: "var(--plum-mute, rgba(107,74,86,0.74))",
  margin: 0,
};
