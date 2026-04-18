/**
 * EmptyState — friendly placeholder for empty lists.
 *
 * Usage:
 *   <EmptyState
 *     emoji="📚"
 *     message="Your reading list is empty."
 *     actionLabel="Explore the library"
 *     onAction={() => navigate('/Lifestyle?tab=books')}
 *   />
 */
export default function EmptyState({
  emoji = "✨",
  message = "Nothing here yet.",
  actionLabel,
  onAction,
  actionHref,
}) {
  return (
    <div
      role="status"
      style={{
        textAlign: "center",
        padding: "40px 24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontSize: 40,
          marginBottom: 12,
          lineHeight: 1,
        }}
      >
        {emoji}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--mauve)",
          marginBottom: actionLabel ? 16 : 0,
          lineHeight: 1.55,
        }}
      >
        {message}
      </p>
      {actionLabel &&
        (actionHref ? (
          <a
            href={actionHref}
            style={actionBtnStyle}
          >
            {actionLabel} →
          </a>
        ) : onAction ? (
          <button
            type="button"
            onClick={onAction}
            style={actionBtnStyle}
          >
            {actionLabel} →
          </button>
        ) : null)}
    </div>
  );
}

const actionBtnStyle = {
  display: "inline-block",
  padding: "9px 18px",
  borderRadius: 9999,
  backgroundColor: "#E11D48",
  color: "white",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  textDecoration: "none",
};