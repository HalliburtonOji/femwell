// SectionHeader — the per-section Lifestyle header. When a section chip (Read/Listen/Books/Story/Sky/
// Good life) is active, the header shows THAT section's museum-quality artful floral STILL + a short
// "flower profile" (name + a line of meaning tied to the section). Tapping a chip swaps the image
// (a soft crossfade). Until an approved image exists for a section, the header falls back to the
// flora/video FwFloraHero — so live is unchanged until the image set drops in.
//
// ── DROP-IN CONTRACT (Dispatch delivers via Higgsfield) ──────────────────────────────────────────
// Dispatch hands over: (a) the image files → place under `public/media/lifestyle-headers/`;
// (b) the flower-profile copy → `flower: { name, note }`; (c) the section→flower mapping → the keys
// below. To go live for a section, fill its row:
//   image:  "/media/lifestyle-headers/<flower>-1280.jpg"   (the full still)
//   poster: "/media/lifestyle-headers/<flower>-blur.jpg"    (tiny blurred placeholder, instant)
//   srcSet: "/…-640.jpg 640w, /…-960.jpg 960w, /…-1280.jpg 1280w"  (responsive / low-data)
//   alt:    a plain description   ·   flower: { name: "Iris", note: "the courage to begin a page" }
// Optimisation (poster-first / lazy / §14.3 discipline — simpler for stills than the video):
// the ACTIVE section's image loads eager + fades in over its poster; nothing else is fetched until
// its chip is tapped. Keep each still ≤~180KB at 1280w (mozjpeg/AVIF), poster ≤2KB.
import React from "react";
import { T, SERIF, UI, Heart } from "@/components/journal/Editorial";
import { C, CLEAN_SHADOW } from "@/components/brand/cleanTokens";
import { SectionStill, SECTION_STILL } from "@/components/lifestyle-elite/sectionStills";

// key = HERO_CARDS section id.  flower/image/etc. are null until Dispatch's approved set is wired in.
export const SECTION_HEADER = {
  read:   { flower: null, image: null, poster: null, srcSet: null, sizes: null, alt: "" },
  listen: { flower: null, image: null, poster: null, srcSet: null, sizes: null, alt: "" },
  books:  { flower: null, image: null, poster: null, srcSet: null, sizes: null, alt: "" },
  story:  { flower: null, image: null, poster: null, srcSet: null, sizes: null, alt: "" },
  sky:    { flower: null, image: null, poster: null, srcSet: null, sizes: null, alt: "" },
  good:   { flower: null, image: null, poster: null, srcSet: null, sizes: null, alt: "" },
  // filled example: read: { flower:{name:"Iris",note:"the courage to begin a page"},
  //   image:"/media/lifestyle-headers/iris-1280.jpg", poster:"/media/lifestyle-headers/iris-blur.jpg",
  //   srcSet:"/media/lifestyle-headers/iris-640.jpg 640w, /…-960.jpg 960w, /…-1280.jpg 1280w",
  //   sizes:"(max-width:640px) 100vw, 620px", alt:"A single iris in dramatic side-light" }
};

const RADIUS = 20;

// `active` = the current HERO_CARDS entry ({ key, title, cw, line, … }); `fallback` = the FwFloraHero
// element to show when this section has no still yet. `data` lets a demo pass a test map.
export default function SectionHeader({ active, title, data = SECTION_HEADER, fallback = null, clean = false }) {
  const key = active?.key ?? active?.id;   // HERO_CARDS uses `id`; some callers use `key`
  const cfg = (key && data[key]) || null;
  // CLEAN (§2.7 / the whole-page redesign): the header is ALWAYS the section still — the real one
  // when its config is filled, else the rendered placeholder — with a quiet title band beneath
  // (title · the ONE carved heart · the flower profile). Never the video hero, never a 2nd flower.
  if (clean && (!cfg || !cfg.image)) return <CleanStillHeader sectionKey={key} title={title || active?.title || ""} />;
  // No approved still for this section → keep the flora/video hero (default + fallback).
  if (!cfg || !cfg.image) return fallback;

  const flower = cfg.flower || null;
  const heading = title || active?.title || "";
  return (
    <div style={{ position: "relative", borderRadius: RADIUS, overflow: "hidden", aspectRatio: "16 / 11", background: T.paperDeep || "#D8CFBC", boxShadow: "0 10px 30px rgba(58,44,26,.16), 0 2px 6px rgba(58,44,26,.08)" }}>
      {/* poster-first: the blurred placeholder sits underneath and is covered as the still loads */}
      {cfg.poster ? <img aria-hidden src={cfg.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(12px)", transform: "scale(1.06)" }} /> : null}
      {/* the still — keyed by section so each swap crossfades in when its chip is tapped */}
      <img
        key={key}
        src={cfg.image}
        srcSet={cfg.srcSet || undefined}
        sizes={cfg.sizes || "(max-width: 640px) 100vw, 620px"}
        alt={cfg.alt || (flower ? `${flower.name} — ${heading}` : heading)}
        loading="eager" decoding="async"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", animation: "fwHeaderFade .5s ease" }}
      />
      <style>{`@keyframes fwHeaderFade{from{opacity:0}to{opacity:1}}`}</style>
      {/* legibility scrim + the section title and its flower profile */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "44px 18px 15px", background: "linear-gradient(180deg, rgba(20,12,7,0) 0%, rgba(20,12,7,.5) 58%, rgba(20,12,7,.74) 100%)" }}>
        {heading ? <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: "#fff", lineHeight: 1.1, letterSpacing: -0.2, textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{heading}</div> : null}
        {flower ? (
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginTop: 5 }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, fontWeight: 600, color: "#F4EFE3" }}>{flower.name}</span>
            <span style={{ fontFamily: UI, fontSize: 12.5, color: "rgba(244,239,227,.85)", lineHeight: 1.35 }}>— {flower.note}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── the clean header (whole-page redesign 2026-09-22): still + title band ──────────────────────
// The still (placeholder or real) sits in a soft-radius panel; beneath it, the title in Cormorant
// ink, the ONE carved heart, and the flower profile (name — meaning) — the botanical identity placed
// once, at the top of the page, instead of three stacked hero moments.
export function CleanStillHeader({ sectionKey, title }) {
  const still = SECTION_STILL[sectionKey] || SECTION_STILL.read;
  return (
    <div>
      <div style={{ position: "relative", borderRadius: RADIUS, overflow: "hidden", aspectRatio: "16 / 10", background: still.tint, boxShadow: CLEAN_SHADOW }}>
        <SectionStill key={sectionKey} sectionKey={sectionKey} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 4px 0" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 26, letterSpacing: -0.3, color: C.ink, lineHeight: 1.1, display: "flex", alignItems: "center", gap: 9, textShadow: "none" }}>{title} <Heart size={15} /></div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: C.slate, textAlign: "right", lineHeight: 1.3, maxWidth: "12em" }}>{still.flower.name} — {still.flower.note}</div>
      </div>
    </div>
  );
}
