import React, { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Feather, Sparkles, X, BookOpen, Bookmark, Headphones, Film, Clock, Heart, Moon, Settings } from "lucide-react";
import { C } from "@/components/brand/cleanTokens";
import { SERIF, UI } from "@/components/journal/Editorial";

// Preview-only action pair. Each action owns a real handler or a real-content chooser.
const SECTION_ICONS = { sky: [Moon, Settings], read: [BookOpen, Bookmark], listen: [Headphones, Film], books: [Feather, BookOpen], story: [Feather, BookOpen], good: [Clock, Heart], yours: [Bookmark, BookOpen] };
export default function FocusedSectionActions({ actions, plum, section }) {
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);
  const opener = useRef(null);
  const current = active === null ? null : actions[active];
  const afterClose = (run, item) => { setSelected({ run, item }); setActive(null); };
  return <>
    <div aria-label="Section actions" style={{ display: "flex", gap: 10, marginTop: 14 }}>
      {actions.map((action, i) => {
        const Icon = (SECTION_ICONS[section] || [Feather, Sparkles])[i];
        return <button key={action.label} type="button" className="fw-elite-press" disabled={action.disabled}
          onClick={(event) => { opener.current = event.currentTarget; action.run ? action.run() : setActive(i); }}
          style={{ flex: 1, minWidth: 0, minHeight: 58, borderRadius: 999, border: 0, padding: "12px 15px", background: i === 0 ? plum : C.gold, color: "white", fontFamily: UI, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: action.disabled ? .6 : 1 }}>
          <Icon aria-hidden="true" size={17} style={{ flexShrink: 0 }} /><span>{action.label}</span>
        </button>;
      })}
    </div>
    <Dialog.Root open={active !== null} onOpenChange={(open) => { if (!open) setActive(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(25,20,28,.3)", zIndex: 10000 }} />
        <Dialog.Content className="fw-dialog-cap" onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
          if (selected) { const next = selected; setSelected(null); next.run(next.item); }
        }} style={{ position: "fixed", zIndex: 10001, left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(480px, calc(100vw - 24px))", maxHeight: "calc(100dvh - var(--fw-sheet-safe, 100px) - 24px)", overflowY: "auto", background: C.surface, color: C.ink, borderRadius: 24, padding: "26px 20px", fontFamily: UI }}>
          <Dialog.Title style={{ fontFamily: SERIF, fontSize: 26, paddingRight: 40 }}>{current?.label}</Dialog.Title>
          <Dialog.Description style={{ fontSize: 14, lineHeight: 1.5, color: C.slate, margin: "10px 0 18px" }}>{current?.description || "Choose something to open here."}</Dialog.Description>
          <Dialog.Close aria-label="Close section actions" style={{ position: "absolute", right: 10, top: 10, width: 44, height: 44, display: "grid", placeItems: "center", border: 0, background: "transparent" }}><X size={20} /></Dialog.Close>
          {(typeof current?.content === "function" ? current.content(afterClose) : current?.content) || (current?.items?.length ? <div style={{ display: "grid", gap: 8 }}>
            {current.items.map((item, i) => <button key={item.id || i} type="button" onClick={() => afterClose(current.open, item)}
              style={{ textAlign: "left", padding: "15px 14px", minHeight: 48, background: "white", border: `1px solid ${C.hair}`, borderRadius: 14, fontSize: 15, lineHeight: 1.4 }}>{item.title || item.name || "Open item"}</button>)}
          </div> : <p role="status" style={{ lineHeight: 1.6 }}>{current?.empty || "There is nothing here yet. Try another section while your collection grows."}</p>)}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
