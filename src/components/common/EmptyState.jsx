import { Sparkles } from "lucide-react";

/**
 * EmptyState — friendly placeholder for empty lists.
 *
 * Usage:
 *   <EmptyState
 *     icon={BookOpen}              // a Lucide component (emoji are banned brand-wide)
 *     message="Your reading list is empty."
 *     actionLabel="Explore the library"
 *     onAction={() => navigate('/Lifestyle?tab=books')}
 *   />
 */
export default function EmptyState({
  icon: Icon = Sparkles,
  emoji, // legacy/no-op — kept only so old callers don't break; pass `icon` instead
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
        }}
    >
      <Icon
        aria-hidden="true"
        size={34}
        style={{
          color: "var(--rose-dust, #C4849A)",
          marginBottom: 12,
        }}
      />
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
  textDecoration: "none",
};