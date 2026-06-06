export default function SettingsCard({ title, description, children, footer }) {
  return (
    <section
      style={{
        backgroundColor: "#FFF1F2",
        border: "1px solid #FECACA",
        borderRadius: 16,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <header
        style={{
          padding: "18px 20px 12px",
          borderBottom: "1px solid #FECACA",
        }}
      >
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--plum)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: 12,
              color: "var(--mauve)",
              fontFamily: "'Inter', sans-serif",
              marginTop: 3,
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        )}
      </header>

      <div style={{ padding: "16px 20px", backgroundColor: "var(--surface)" }}>
        {children}
      </div>

      {footer && (
        <footer
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #FECACA",
            backgroundColor: "#FFF1F2",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}