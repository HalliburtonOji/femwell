// useScrollLock — shared body-scroll-lock for overlays / bottom-sheets / modals.
//
// THE BUG it fixes: when a sheet is open and you scroll its content, the BACKGROUND
// page scrolled instead (scroll-bleed) and the overlay text "stayed behind". Locking
// the body while any overlay is open stops the page behind from moving; pair this with
// `overscroll-behavior: contain` + `overflow-y:auto` on the sheet's own scroll area so
// scrolling the sheet never bleeds to the background, and touch scroll works on mobile.
//
// Ref-counted at module scope so NESTED overlays (a sheet that opens another sheet) and
// multiple simultaneous overlays don't unlock the body prematurely — the body unlocks
// only when the LAST overlay closes. Uses the position:fixed technique (the robust one
// for iOS Safari, which ignores body{overflow:hidden}) and restores the scroll position
// exactly on release. SSR/no-document safe.
import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;
let savedStyles = null;

function applyLock() {
  if (typeof document === "undefined") return;
  const body = document.body;
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  savedStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

function releaseLock() {
  if (typeof document === "undefined" || !savedStyles) return;
  const body = document.body;
  body.style.position = savedStyles.position;
  body.style.top = savedStyles.top;
  body.style.left = savedStyles.left;
  body.style.right = savedStyles.right;
  body.style.width = savedStyles.width;
  body.style.overflow = savedStyles.overflow;
  savedStyles = null;
  // restore the exact scroll position the page was at before locking
  window.scrollTo(0, savedScrollY);
}

/**
 * Lock background scroll while `active` is true. Safe to use in many overlays at once.
 * @param {boolean} active - whether this overlay is currently open (default true).
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    if (lockCount === 1) applyLock();
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}

export default useScrollLock;
