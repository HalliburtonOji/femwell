import React from "react";

// A small material seam between learning and its phase instrument, away from controls.
export default function SkyWorldDetails({ direction }) {
  const asset = {conservatory:"glass-note",petal:"petal-note",light:"light-note"}[direction];
  return <div className={`fw-world-detail fw-world-detail--${direction}`} aria-hidden="true">
    {asset ? <img src={`/images/sky-worlds/${asset}-v1.webp`} alt="" width="1536" height="1024" loading="lazy"/> : <svg viewBox="0 0 160 45" fill="none">
      {direction === "press" ? <><path d="M8 34c33-25 55 10 99-8M20 31c25-17 43 4 78-7"/><path d="M114 15v12m-6-6h12m-10-4 8 8m0-8-8 8M137 25v8m-4-4h8"/></> : <><path d="M14 13h125M14 16h125M31 12v16m30-16v11m30-11v16m30-16v11"/><path d="M122 14c13-12 21-9 25-1-12 4-20 3-25 1Z"/></>}
    </svg>}
  </div>;
}
