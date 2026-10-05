import React, { useState } from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import { LIVING_DIRECTIONS, isLivingDirection } from "@/components/lifestyle-elite/LivingDirections";

export default function LivingLifestyleDemo() {
  const [direction, setDirection] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("direction");
    return isLivingDirection(requested) ? requested : "letter";
  });
  const current = LIVING_DIRECTIONS.find(item => item.id === direction);
  const changeDirection = next => {
    setDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("direction", next);
    window.history.replaceState(window.history.state, "", url);
  };
  return <main className="fw-living-review">
    <style>{`.fw-living-review-nav{max-width:430px;margin:auto;padding:44px 16px 4px;color:#51444E;font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif}.fw-living-review-nav>div{display:flex;align-items:center;justify-content:space-between;gap:12px}.fw-living-review-nav a{color:inherit;min-height:44px;display:inline-flex;align-items:center}.fw-living-review-nav select{font:600 12px/1.4 ui-sans-serif,system-ui,sans-serif;color:#191510;border:0;border-bottom:1px solid #D9C79B;background:transparent;min-height:44px;width:62%;padding:0 6px}.fw-living-review-nav p{margin:3px 0 8px}.fw-living-review-notes{max-width:430px;margin:auto;padding:0 16px 120px;color:#51444E;font:500 12px/1.5 ui-sans-serif,system-ui,sans-serif}.fw-living-review-notes summary,.fw-living-review-notes a{min-height:44px;align-content:center;color:inherit}.fw-living-review-notes a{display:inline-flex;align-items:center;margin-right:16px}body:has(.fw-living-review) a[aria-label="Open Ideas (Design Lab — dev only)"]{position:relative!important;inset:auto!important;display:flex!important;width:fit-content;margin:0 auto 110px!important;transform:none!important}`}</style>
    <nav className="fw-living-review-nav" aria-label="Five design demos"><div><a href="/Ideas">Ideas · review</a><select aria-label="Design direction" value={direction} onChange={event=>changeDirection(event.target.value)}>{LIVING_DIRECTIONS.map((item,index)=><option key={item.id} value={item.id}>{index+1} · {item.name}</option>)}</select></div><p>{current.line}</p></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky firstFoldVariant={direction} dailySkyLessons />
    <aside className="fw-living-review-notes"><details><summary>Build notes &amp; the connected-life plan</summary><p>Five complete Lifestyle layouts, with the same working features and your account. Daily astronomy lessons, private lesson saves and notes are new. Main-page promotion awaits your go-ahead.</p><p>The wider Community and DM connections remain in the staged plan. These demos do not claim that every social journey has already been repaired.</p><a href="/connected-life/index.html">Research &amp; plan</a><a href="/FloralDreamDemo?section=sky&direction=living">Approved Living base</a><a href="/Ideas?section=brand">Brand Bible</a></details></aside>
  </main>;
}
