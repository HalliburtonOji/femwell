import { useLayoutEffect, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import { resolveCard } from "@/components/brand/expandCards";
import "./CalmLifestyle.css";

// Title-led secondary finds. Exact actions and full details remain with their owner.
export function CalmFindRow({ item: raw, onOpen, onDetails, label = "Read", context }) {
  const item = resolveCard(raw);
  const meta = item.sourceName || item.author || item.meta?.find(([, value]) => value)?.[1];
  return <div className="fw-calm-find">
    <button className="fw-calm-find-primary" onClick={() => onOpen?.(raw)}>
      <span><strong>{item.title}</strong>{meta && <small>{meta}</small>}{context && <small className="fw-calm-find-context">{context}</small>}</span>
      <span className="fw-calm-find-action">{label}<ArrowRight size={14}/></span>
    </button>
    {onDetails && <button className="fw-calm-find-details" aria-label={`Details & tools for ${item.title}`} onClick={() => onDetails(raw)}>Details</button>}
  </div>;
}

export function CalmOptional({ enabled, title, children }) {
  return enabled ? <details className="fw-calm-depth"><summary>{title}</summary>{children}</details> : children;
}

// Native modal retains its mounted children's drafts/results after first use.
// Closed dialogs are inaccessible; hidden route owners close without stealing focus.
export function CalmTaskDialog({ open, active = true, title, eyebrow = "Your sky", motif, onClose, children }) {
  const dialog = useRef(null), heading = useRef(null), opener = useRef(null), wasOpen = useRef(false);
  useLayoutEffect(() => {
    const element = dialog.current;
    if (open && active) {
      if (!element.open) {
        opener.current = document.activeElement;
        element.showModal();
        heading.current?.focus({ preventScroll: true });
      }
      wasOpen.current = true;
    } else if (element.open) {
      const outsideFocus = !active && !element.contains(document.activeElement) ? document.activeElement : null;
      element.close();
      if (active && wasOpen.current && opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      else if (outsideFocus?.isConnected) outsideFocus.focus({ preventScroll: true });
      wasOpen.current = false;
    }
  }, [open, active]);
  useLayoutEffect(() => () => { if (dialog.current?.open) dialog.current.close(); }, []);
  return <dialog ref={dialog} className="fw-calm-dialog fw-clean fw-sheet-safe" data-motif={motif} aria-label={title}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,[tabindex]')]
        .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length && !element.closest('[inert]'));
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); heading.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><div><p>{eyebrow}</p><h2 ref={heading} tabIndex={-1}>{title}</h2></div><button aria-label="Close" onClick={onClose}><X size={20}/></button></header>
    <div className="fw-calm-dialog-body">{children}</div>
  </dialog>;
}
