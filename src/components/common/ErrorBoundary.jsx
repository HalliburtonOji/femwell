import React from "react";

/**
 * ErrorBoundary — catches any React rendering error below it and shows
 * a friendly fallback instead of a white screen. Critical for mobile,
 * where transient storage/cookie failures can throw during render.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI ErrorBoundary caught:", error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "var(--ivory, #FAF8F5)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: "100%",
            backgroundColor: "var(--surface, white)",
            border: "1px solid var(--border, #EDE8E4)",
            borderRadius: 24,
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(42,32,53,0.08)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: "var(--rose-dust-subtle, #F5ECF0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
            }}
          >
            💛
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--plum, #2A2035)",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--mauve, #8A7E88)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            We're on it. A quick reload usually fixes it.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              aria-label="Reload the page"
              onClick={this.handleRefresh}
              style={{
                backgroundColor: "#E11D48",
                color: "white",
                borderRadius: 9999,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Reload
            </button>
            <button
              type="button"
              aria-label="Go to home page"
              onClick={this.handleGoHome}
              style={{
                backgroundColor: "transparent",
                color: "var(--plum, #2A2035)",
                border: "1.5px solid var(--border, #EDE8E4)",
                borderRadius: 9999,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}