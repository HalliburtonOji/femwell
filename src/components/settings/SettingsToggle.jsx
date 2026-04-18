export default function SettingsToggle({ label, description, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--plum)",
            fontFamily: "'Inter', sans-serif",
            margin: 0,
          }}
        >
          {label}
        </p>
        {description && (
          <p
            style={{
              fontSize: 11,
              color: "var(--mauve)",
              fontFamily: "'Inter', sans-serif",
              margin: "2px 0 0",
              lineHeight: 1.4,
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
          width: 42,
          height: 24,
          borderRadius: 9999,
          backgroundColor: checked ? "#F59E0B" : "#E5E7EB",
          position: "relative",
          transition: "background 0.18s",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "white",
            transition: "left 0.18s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    </label>
  );
}