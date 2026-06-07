export default function SettingsToggle({ label, description, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 0",
        cursor: "pointer",
        borderBottom: "1px solid rgba(58,44,26,0.06)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 17,
            fontWeight: 600,
            color: "#3A2C1A",
            margin: 0,
          }}
        >
          {label}
        </p>
        {description && (
          <p
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 14,
              fontStyle: "italic",
              color: "#9B8B7A",
              margin: "3px 0 0",
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        style={{
          width: 44,
          height: 26,
          borderRadius: 9999,
          backgroundColor: checked ? "#3A2C1A" : "rgba(58,44,26,0.15)",
          border: checked ? "1px solid #D4AF37" : "1px solid rgba(58,44,26,0.2)",
          position: "relative",
          transition: "background 0.18s, border-color 0.18s",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 19 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: checked ? "#D4AF37" : "#F4EDDB",
            transition: "left 0.18s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        />
      </div>
    </label>
  );
}