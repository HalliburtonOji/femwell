// Presentation-only route handoff. Keep the exact source ID, edition and fragment.
export function calmLifestyleDestination(href, { returnToMain = false } = {}) {
  if (!href || href === "#") return href;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return href;
    if (["/LifestyleDetail", "/FictionReader"].includes(url.pathname)) {
      url.searchParams.set("appearance", "calm");
      if (returnToMain) url.searchParams.set("from", "lifestyle-main");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return href; }
}
