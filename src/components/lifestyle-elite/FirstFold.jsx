import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { MeaningRosette, cwOf } from "@/components/brand/flora";
import { C } from "@/components/brand/cleanTokens";
import { JessSheet } from "@/components/brand/GlanceJessRow";
import "./FirstFold.css";

// Review-only composition. Data, navigation and writes remain owned by the shell.
export function FirstFoldNavigation({ cards, activeIndex, onSelect, phaseLine, focusLabel, onClear }) {
  return <>
    <nav className="fw-ff-sections" aria-label="Lifestyle sections">
      {cards.map((card, index) => {
        const selected = index === activeIndex;
        return <button key={card.id} type="button" aria-pressed={selected} onClick={() => onSelect(card, index)}>
          <span className="fw-ff-section-icon" aria-hidden="true">{selected ? <MeaningRosette color={cwOf(card.cw).petal} centre={C.gold} size={12}/> : <card.Icon size={16} strokeWidth={1.7}/>}</span>
          <span>{card.label}</span>
        </button>;
      })}
    </nav>
    <div className="fw-ff-status">
      <span>{phaseLine}{focusLabel ? <><span aria-hidden="true"> · </span>{focusLabel}</> : null}</span>
      {focusLabel && <button type="button" onClick={onClear}><X size={13} aria-hidden="true"/> Everything</button>}
    </div>
  </>;
}

export function FirstFoldSummary({ orderedGlance, jess, sheetSections, jessOpen, onJessOpen, onJessClose }) {
  const track = useRef(null);
  const jessButton = useRef(null);
  const sheet = useRef(null);
  const [index, setIndex] = useState(0);
  useEffect(() => { if (jessOpen) sheet.current?.querySelector("button")?.focus({ preventScroll: true }); }, [jessOpen]);
  const go = (next) => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    setIndex(next);
  };
  const closeJess = () => { onJessClose(); jessButton.current?.focus({ preventScroll: true }); };
  return <section className="fw-ff-summary" aria-label="Your glance and Jess's read">
    <div className="fw-ff-summary-nav" aria-label="Summary panels">
      <button type="button" aria-pressed={index === 0} onClick={() => go(0)}>At a glance</button>
      <button type="button" aria-pressed={index === 1} onClick={() => go(1)}>Jess’s read <ChevronRight size={13} aria-hidden="true"/></button>
    </div>
    <div className="fw-ff-summary-track" ref={track} onScroll={() => {
      const el = track.current;
      if (el) setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    }}>
      <div className="fw-ff-summary-panel" aria-label="Today at a glance" inert={index !== 0 ? "" : undefined}>
        {orderedGlance.map(({ Icon, label, text, onClick }) => <button className="fw-ff-glance-row" type="button" key={label} onClick={onClick}>
          <Icon size={17} aria-hidden="true"/>
          <span><span className="fw-ff-row-label">{label}</span><span className="fw-ff-row-text">{text}</span></span>
          <ChevronRight size={15} aria-hidden="true"/>
        </button>)}
      </div>
      <div className="fw-ff-summary-panel fw-ff-jess" aria-label="Jess's read" inert={index !== 1 ? "" : undefined}>
        <p className="fw-ff-jess-eyebrow">{jess.eyebrow}</p>
        <p className="fw-ff-jess-body">{jess.body}</p>
        <button ref={jessButton} className="fw-ff-jess-open" type="button" onClick={onJessOpen}>Open Jess’s full read <ChevronRight size={15} aria-hidden="true"/></button>
        <div ref={sheet} className="fw-ff-jess-sheet" onKeyDown={event => { if (event.key === "Escape" && jessOpen) { event.stopPropagation(); closeJess(); } }}>
          <JessSheet open={jessOpen} onClose={closeJess} accent={C.ink} sections={sheetSections}/>
        </div>
      </div>
    </div>
    <p className="fw-ff-swipe-hint">{index === 0 ? "Swipe for Jess’s read" : "Swipe back to your glance"}</p>
  </section>;
}
