import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Leaf } from "lucide-react";
import "./FocusedLifestyle.css";

// One real modal, with the same focus/exit contract for all preview journeys.
// The clean surface replaces the material here; no inherited PAPER_BG layer.
export default function FocusedLifestyleSheet({ title, eyebrow, children, onClose, active = true, footer, contentRef }) {
  const opener = useRef(document.activeElement);
  return <Dialog.Root open={active} onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fw-focused-scrim"/>
      <Dialog.Content ref={contentRef} className="fw-focused-sheet fw-sheet-safe" aria-describedby={undefined}
        onCloseAutoFocus={event => { event.preventDefault(); if (active && opener.current?.isConnected) opener.current.focus({preventScroll:true}); }}>
        <header className="fw-focused-sheet-head">
          <div><p className="fw-focused-eyebrow"><Leaf size={12} aria-hidden="true"/>{eyebrow}</p><Dialog.Title className="fw-focused-title">{title}</Dialog.Title></div>
          <Dialog.Close className="fw-focused-icon" aria-label="Close"><X size={20}/></Dialog.Close>
        </header>
        <div className="fw-focused-sheet-body">{children}</div>
        {footer && <footer className="fw-focused-sheet-foot">{footer}</footer>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export function FocusedText({ text }) {
  // The existing horoscope authoring contract uses *emphasis*. Render text,
  // never HTML or literal markers; no rewrite/generation of a stored reading.
  return String(text || "").replace(/<[^>]*>/g, "").split(/(\*[^*]+\*)/g).map((part, i) => part.startsWith("*") && part.endsWith("*") ? <em key={i}>{part.slice(1,-1)}</em> : part);
}

export function firstSentences(text, count = 2) {
  const value = String(text || "").replace(/<[^>]*>/g, "").trim();
  if (typeof Intl.Segmenter === "function") return [...new Intl.Segmenter("en-GB", { granularity: "sentence" }).segment(value)].slice(0,count).map(entry => entry.segment).join("").trim();
  return (value.match(/[^.!?]+[.!?]*(?:\s|$)/g) || [value]).slice(0,count).join("").trim();
}
