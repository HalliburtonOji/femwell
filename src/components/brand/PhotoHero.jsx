// FwPhotoBand — the photoreal looping garden band that can stand in for the SVG flora
// stage at the top of a page (opt-in via `photo` on FwFloraHero; absent → nothing changes).
//
// WHY A BAND, NOT THE SQUARE: a photoreal square sitting on cream reads as "a photo card
// dropped on paper" — it fights the page instead of being it. A shallow band that runs to
// the page edges, with a cream scrim top and bottom, dissolves into the paper and leaves the
// Ephesis title below it as the loudest thing on screen. It also matches the garden rule we
// already follow — grow in WIDTH, never in height.
//
// WHY ONE <video loop>, NOT TWO STACKED ONES: the loop crossfade is baked INTO the file
// (the tail is blended over the head at encode time), so the native `loop` attribute loops
// invisibly. Half the decode, half the memory, no rAF/timeupdate timing to drift, and the
// seam cannot desync. See scripts/encode-garden-video.md for the exact ffmpeg graph.
//
// The source clip's butterfly flies out through the TOP of the original square, which the
// band crop excludes — so at the seam it has already left frame and fades back in perched.
import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";

// ── time-of-day variant key ─────────────────────────────────────────────────────
// Only DUSK has been generated. The key is architected now so day/night can be dropped in
// as files later WITHOUT touching call sites — do not hardcode "dusk" at the call site.
export function timeOfDayKey(d = new Date()) {
  const h = d.getHours();
  if (h >= 6 && h < 17) return "day";
  if (h >= 17 && h < 21) return "dusk";
  return "night";
}

const GARDEN_MEDIA = {
  lifestyle: {
    // every slot resolves to the dusk asset until day/night exist — deliberate, not a typo
    day: "/media/garden/lifestyle-dusk-720",
    dusk: "/media/garden/lifestyle-dusk-720",
    night: "/media/garden/lifestyle-dusk-720",
    alt: "A dusk garden of dahlias, cosmos and lavender in low golden light",
  },
};

// ── capability gate ─────────────────────────────────────────────────────────────
// Returns "video" | "poster" | "svg".
//   svg    → prefers-reduced-motion. She gets the ORIGINAL interactive SVG bloom, which is
//            the richer experience (it responds to the hero chips), not a downgrade.
//   poster → Save-Data, 2g/3g, low deviceMemory. Still photoreal, ~21KB instead of ~250KB.
//   video  → everything else.
export function heroMediaMode() {
  if (typeof window === "undefined") return "poster"; // SSR/smoke: never autoplay
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return "svg";
    const c = navigator.connection || {};
    if (c.saveData) return "poster";
    if (/(^|-)2g$/.test(String(c.effectiveType || ""))) return "poster";
    if (c.effectiveType === "3g") return "poster";
    if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory > 0 && navigator.deviceMemory < 2) return "poster";
  } catch { return "poster"; }
  return "video";
}

export function FwPhotoBand({ garden = "lifestyle", colorway = "gold", radius = 20 }) {
  const media = GARDEN_MEDIA[garden];
  const base = media ? media[timeOfDayKey()] || media.dusk : null;
  // resolved ONCE per mount: re-evaluating on every render would let a transient
  // connection blip swap the band out mid-view.
  const [mode, setMode] = useState(() => heroMediaMode());
  const [playable, setPlayable] = useState(false);
  const wrapRef = useRef(null);
  const vidRef = useRef(null);
  const cw = useMemo(() => cwOf(colorway), [colorway]);

  // play only while actually on screen — a header that keeps decoding after she has
  // scrolled to the boards is pure battery burn.
  useEffect(() => {
    if (mode !== "video") return;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      const v = vidRef.current;
      if (!v) return;
      if (e.isIntersecting) { const p = v.play(); if (p?.catch) p.catch(() => {}); }
      else v.pause();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (!base) return null;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", aspectRatio: "720 / 450", borderRadius: radius, overflow: "hidden", background: T.paperDeep }}>
      {/* the poster paints IMMEDIATELY — the band is never an empty box waiting on a decode */}
      <picture>
        <source srcSet={`${base}.webp`} type="image/webp" />
        <img src={`${base}.jpg`} alt={media.alt} width={720} height={450} decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </picture>

      {mode === "video" && (
        <video ref={vidRef} muted loop playsInline preload="none" aria-hidden tabIndex={-1}
          onCanPlay={() => setPlayable(true)}
          onError={() => setMode("poster")}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: playable ? 1 : 0, transition: "opacity .6s ease" }}>
          <source src={`${base}.mp4`} type="video/mp4" />
        </video>
      )}

      {/* COLOURWAY — the hero chips still mean something here: each one warms the whole
          band toward its own hue. A tint, never a wash; the photograph stays the subject. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(120% 90% at 62% 30%, ${cw.petal}00 34%, ${cw.petal}24 78%, ${cw.tip}33 100%)`, mixBlendMode: "soft-light", transition: "background .5s ease" }} />

      {/* CREAM SCRIM — top and bottom melt into the paper so the band has no hard edge
          against the page. This is what stops it reading as a pasted-in photo. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(to bottom, ${T.paper} 0%, ${T.paper}00 17%, ${T.paper}00 66%, ${T.paper}D9 93%, ${T.paper} 100%)` }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(to right, ${T.paper}B3 0%, ${T.paper}00 13%, ${T.paper}00 87%, ${T.paper}B3 100%)` }} />
      {/* the soft inner vignette that gives the band its depth */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: `inset 0 0 44px ${T.paper}55, inset 0 0 0 1px ${T.gold}22`, borderRadius: radius }} />
    </div>
  );
}
