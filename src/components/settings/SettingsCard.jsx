export default function SettingsCard({ title, description, children, footer }) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(58,44,26,0.12)",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(58,44,26,0.06)",
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      <header
        style={{
          padding: "18px 22px 14px",
          borderBottom: "1px solid rgba(58,44,26,0.08)",
          background: "rgba(58,44,26,0.03)",
        }}
      >
        <h2
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#3A2C1A",
            margin: 0,
            letterSpacing: 0,
            textShadow: "0 1px 0 rgba(255,254,250,0.95), 0 -1px 1px rgba(18,12,6,0.5), 0 2px 3px rgba(40,30,18,0.18)",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 15,
              fontStyle: "italic",
              color: "#9B8B7A",
              marginTop: 4,
              marginBottom: 0,
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
      </header>

      <div style={{ padding: "18px 22px" }}>
        {children}
      </div>

      {footer && (
        <footer
          style={{
            padding: "12px 22px",
            borderTop: "1px solid rgba(58,44,26,0.08)",
            background: "rgba(58,44,26,0.02)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
          }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}