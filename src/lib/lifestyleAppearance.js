// Presentation-only route handoff. Keep the exact source ID, edition and fragment.
export function calmLifestyleDestination(href, { returnToMain = false, savedTab = null, originSection = null } = {}) {
  if (!href || href === "#") return href;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return href;
    if (["/LifestyleDetail", "/FictionReader"].includes(url.pathname)) {
      url.searchParams.set("appearance", "calm");
      if (returnToMain) url.searchParams.set("from", "lifestyle-main");
    }
    if (returnToMain && ["/BookReader", "/ReaderMarginDemo"].includes(url.pathname)) {
      url.pathname = "/BookReader";
      url.searchParams.set("appearance", "calm");
      url.searchParams.set("from", "lifestyle-main");
      if (["ADVICE", "LIFESTYLE", "CONTENT", "PROGRAM", "JOURNAL", "EVENT"].includes(savedTab)) {
        url.searchParams.set("via", "saved");
        url.searchParams.set("saved_tab", savedTab);
      } else if (originSection === "yours") url.searchParams.set("return_section", "yours");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return href; }
}
