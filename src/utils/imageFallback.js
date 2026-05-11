// FemWell — category-tied gradients + onError fallback helper.
// All card components share this so a missing/broken image renders a
// branded panel instead of the browser's default broken-image icon
// (the blue "?" glyph) or a flat pale rectangle.
//
// Usage on any <img>:
//   onError={(e) => attachFallbackOverlay(e, item.category, "More like this")}
//
// The handler hides the broken <img>, sets the parent's background to
// the category gradient, and injects a Fraunces italic text overlay.

const CATEGORY_GRADIENTS = {
  "mental wellness":   "linear-gradient(135deg, #2B1E16 0%, #6B4A56 100%)",
  "mental_wellness":   "linear-gradient(135deg, #2B1E16 0%, #6B4A56 100%)",
  "hormones & cycle":  "linear-gradient(135deg, #D45E52 0%, #8a5e7a 100%)",
  "hormones_cycle":    "linear-gradient(135deg, #D45E52 0%, #8a5e7a 100%)",
  "cycle":             "linear-gradient(135deg, #D45E52 0%, #8a5e7a 100%)",
  "hormones":          "linear-gradient(135deg, #D45E52 0%, #8a5e7a 100%)",
  "sleep":             "linear-gradient(135deg, #1a1d3a 0%, #4a4a6a 100%)",
  "nutrition":         "linear-gradient(135deg, #6e5e3b 0%, #d4b06a 100%)",
  "fitness":           "linear-gradient(135deg, #c84c40 0%, #f0c8a0 100%)",
  "movement":          "linear-gradient(135deg, #c84c40 0%, #f0c8a0 100%)",
  "menopause":         "linear-gradient(135deg, #4a3050 0%, #a06080 100%)",
  "perimenopause":     "linear-gradient(135deg, #4a3050 0%, #a06080 100%)",
};

const DEFAULT_GRADIENT =
  "linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)";

export function getCategoryGradient(category) {
  if (!category) return DEFAULT_GRADIENT;
  const key = String(category).toLowerCase().trim();
  return CATEGORY_GRADIENTS[key] || DEFAULT_GRADIENT;
}

// Pretty label for the overlay text. Falls back to "More like this".
function prettyCategory(category) {
  if (!category) return "More like this";
  const raw = String(category).trim();
  if (!raw) return "More like this";
  return raw
    .replace(/_/g, " ")
    .replace(/&/g, "&")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Attach a branded fallback overlay to the parent of a failed <img>.
// Idempotent: re-running on the same parent won't duplicate the overlay.
export function attachFallbackOverlay(e, category, overlayLabel) {
  try {
    if (e && e.target) e.target.style.display = "none";
    const parent = e?.target?.parentElement;
    if (!parent) return;
    parent.style.background = getCategoryGradient(category);
    if (parent.dataset.fwFallback === "1") return;
    parent.dataset.fwFallback = "1";

    const overlay = document.createElement("span");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "12px";
    overlay.style.textAlign = "center";
    overlay.style.fontFamily = "'Fraunces', serif";
    overlay.style.fontStyle = "italic";
    overlay.style.fontWeight = "400";
    overlay.style.fontSize = "18px";
    overlay.style.lineHeight = "1.2";
    overlay.style.color = "var(--cream)";
    overlay.style.opacity = "0.7";
    overlay.style.pointerEvents = "none";
    overlay.style.letterSpacing = "0.01em";
    overlay.textContent = overlayLabel || prettyCategory(category);

    // Ensure parent can host an absolutely-positioned overlay.
    const computedPos = getComputedStyle(parent).position;
    if (computedPos === "static" || !computedPos) {
      parent.style.position = "relative";
    }
    parent.appendChild(overlay);
  } catch {
    // Swallow — fallback failures must never break the page.
  }
}

// Convenience: render-time inline style. Use when a card needs a
// pre-emptive gradient even before image load is attempted.
export function categoryFallbackStyle(category) {
  return { background: getCategoryGradient(category) };
}
