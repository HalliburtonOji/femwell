// ─────────────────────────────────────────────────────────────────────────────
// Card.jsx — THE canonical FemWell card family (BRAND_IDENTITY §6.7).
//
// Cards are a FIRST-CLASS brand-language pillar, not decoration. EVERY content
// surface in the app imports from here instead of hand-rolling a <div>. The shell
// is the TODAY "across your day" per-section card, VERBATIM (TodayOption2 TodayCard):
// CARD_W 365 · minHeight 488 · gradient + 4px accent rim · 4-corner sprig frame ·
// ICON_DISC + eyebrow + meaning-bloom header · SERIF hook (3-line) + SERIF line
// (4-line) · inline action area · deep-link "open full-screen" link.
//
// RULES (enforced by the §0 pre-build checklist):
//   • A card is NEVER an empty container. It always carries something at a glance
//     (hook + line, a real snippet, or an inline player) AND an action.
//   • Inline actions: play media IN the card; log/check/answer in place; deep-link
//     to the EXACT item full-screen — never to a parent list page.
//   • Brand-lush: one accent, the sprig corners, a meaning-bloom, Cormorant copy.
//
// Reuses flora.jsx + the Editorial tokens. No new backend; inline media uses the
// item's existing video_url / audio_url and the native player.
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { ChevronRight, ChevronDown, ChevronLeft, Play, Pause, BookOpen, Headphones, Film, Feather, Moon, Sparkles, Book } from "lucide-react";
import { T, UI, SERIF, Eyebrow } from "@/components/journal/Editorial";
import { CardCorner, FlowerGlyph } from "@/components/brand/flora";

// The Today reference dimensions — the ONE card family standardises on these.
export const FW_CARD_W = 365;
export const FW_CARD_MINH = 488;
// The deep-red script heading colour (bible §2 oxblood) — used by hero/rail eyebrows.
export const FW_OXBLOOD = "#7A1A12";

const clamp = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });

// The §4.2 corner element in all four corners — the framed look (Journal/Today hub cards).
function Frame4({ color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant="sprig" color={color} corner={c} size={size} opacity={opacity} />)}</>;
}
// The §6.1 icon disc — a 32px wax disc framing the section icon.
function IconDisc({ Icon, accent }) {
  return (
    <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
      <Icon size={16} strokeWidth={1.7} color={accent} />
    </span>
  );
}

// Full-width accent CTA — the Today btnStyle (primary inline action).
export function FwCardCTA({ accent = T.gold, onClick, href, children, icon: Icon }) {
  const style = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none" };
  if (href) return <a href={href} style={style}>{Icon && <Icon size={15} />}{children}</a>;
  return <button onClick={onClick} style={style}>{Icon && <Icon size={15} />}{children}</button>;
}

// ── The canonical card shell ────────────────────────────────────────────────
// Every typed variant below is a thin wrapper over this. `media` renders above the
// hook (inline player / cover). `action` is the primary inline action; `onOpen`
// adds the "open full-screen" deep-link beneath it.
export function FwCard({
  accent = T.gold, Icon, eyebrow, flower = "camellia", title, line, media, inset,
  children, action, onOpen, openLabel = "Open full-screen", onClick, corner,
  width = FW_CARD_W, minHeight = FW_CARD_MINH, snap = true, idx = "fw",
}) {
  return (
    <section
      onClick={onClick}
      style={{
        ...(snap ? { scrollSnapAlign: "center", flex: `0 0 ${width}px`, width } : { width: "100%" }),
        position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default",
        background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}14 100%)`,
        border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 20,
        padding: 20, display: "flex", flexDirection: "column", minHeight,
        boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
      }}
    >
      <Frame4 color={accent} />
      {corner && <div style={{ position: "absolute", top: 12, right: 14, zIndex: 2, pointerEvents: "none" }}>{corner}</div>}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {(Icon || eyebrow || flower) && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            {Icon && <IconDisc Icon={Icon} accent={accent} />}
            {eyebrow && <Eyebrow color={accent}>{eyebrow}</Eyebrow>}
            {flower && <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={flower} size={30} color={accent} idx={idx} /></span>}
          </div>
        )}
        {media}
        {title && <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...clamp(3) }}>{title}</h3>}
        {line && <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...clamp(4) }}>{line}</p>}
        {inset && (
          <div style={{ marginBottom: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px" }}>
            {inset.eyebrow && <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 3 }}>{inset.eyebrow}</div>}
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4, ...clamp(3) }}>{inset.text}</p>
          </div>
        )}
        {children}
        {(action || onOpen) && (
          <div style={{ marginTop: "auto", paddingTop: 6 }}>
            {action}
            {onOpen && (
              <button onClick={(e) => { e.stopPropagation(); onOpen(); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: action ? 12 : 0, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted }}>
                {openLabel} <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Inline media players (play IN the card — no navigation) ──────────────────
export function InlineVideo({ src, poster, accent = T.gold }) {
  if (!src) return null;
  return (
    <video
      src={src} poster={poster} controls preload="metadata" playsInline
      style={{ width: "100%", maxHeight: 200, borderRadius: 12, marginBottom: 12, background: `${accent}14`, display: "block" }}
    />
  );
}
export function InlineAudio({ src, accent = T.sage }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  if (!src) return null;
  const toggle = (e) => {
    e.stopPropagation();
    const a = ref.current; if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px" }}>
      <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{ width: 38, height: 38, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted }}>{playing ? "Playing…" : "Tap to play"}</span>
      <audio ref={ref} src={src} preload="none" onEnded={() => setPlaying(false)} />
    </div>
  );
}

// ── TYPED VARIANTS ───────────────────────────────────────────────────────────
// Each takes a content item + the deep-link opener. Accents/flowers per §5.3.
const ACCENT = { article: "#8E6E8E", story: T.crimson, video: T.gold, audio: T.sage, book: "#5F7E8E", daily_story: T.crimson, horoscope: "#5F7E8E", guide: T.gold, summary: T.gold, recommendation: T.gold, log: T.sage };

export function ArticleCard({ item, onOpen, ...rest }) {
  return <FwCard accent={ACCENT.article} Icon={BookOpen} eyebrow="Article" flower="iris" title={item.title}
    line={item.summary || item.lede || item.source_name} idx={`a-${item.id}`}
    action={<FwCardCTA accent={ACCENT.article} onClick={onOpen}>Read this</FwCardCTA>} onOpen={onOpen} {...rest} />;
}
export function StoryCard({ item, onOpen, ...rest }) {
  return <FwCard accent={ACCENT.story} Icon={Feather} eyebrow="Story" flower="poppy" title={item.title}
    line={item.summary || item.lede} idx={`s-${item.id}`}
    action={<FwCardCTA accent={ACCENT.story} onClick={onOpen}>Read this</FwCardCTA>} onOpen={onOpen} {...rest} />;
}
// VIDEO — plays inline in the card; "open full-screen" deep-links the item.
export function VideoCard({ item, onOpen, ...rest }) {
  return <FwCard accent={ACCENT.video} Icon={Film} eyebrow="Watch" flower="sunflower" title={item.title}
    line={item.summary || item.channel_name} idx={`v-${item.id}`}
    media={<InlineVideo src={item.video_url || item.media_url} poster={item.image_url} accent={ACCENT.video} />}
    onOpen={onOpen} openLabel="Open full-screen" {...rest} />;
}
// AUDIO/podcast — plays inline in the card; deep-links the episode.
export function AudioCard({ item, onOpen, ...rest }) {
  return <FwCard accent={ACCENT.audio} Icon={Headphones} eyebrow="Listen" flower="bluebell" title={item.title}
    line={item.summary || item.channel_name || item.source_name} idx={`au-${item.id}`}
    media={<InlineAudio src={item.audio_url || item.media_url} accent={ACCENT.audio} />}
    action={<FwCardCTA accent={ACCENT.audio} onClick={onOpen} icon={Headphones}>Open episode</FwCardCTA>} onOpen={onOpen} {...rest} />;
}
// BOOK — a paragraph hook + "open into the reader" deep-linking to THAT book.
export function BookCard({ item, onOpen, ...rest }) {
  return <FwCard accent={ACCENT.book} Icon={Book} eyebrow="Book" flower="camellia" title={item.title}
    line={item.summary || item.blurb || item.author_name} idx={`b-${item.id}`}
    action={<FwCardCTA accent={ACCENT.book} onClick={onOpen} icon={Book}>Open this book</FwCardCTA>} onOpen={onOpen} openLabel="Open the reader" {...rest} />;
}
// DAILY STORY — today's chapter, a real opening line + open into the reader.
export function DailyStoryCard({ item, onOpen, ...rest }) {
  return <FwCard accent={ACCENT.daily_story} Icon={Feather} eyebrow="Daily Story" flower="poppy" title={item.title || "Today's chapter"}
    line={item.opening_line || item.summary} idx={`ds-${item.id || "today"}`}
    inset={item.excerpt ? { eyebrow: "From today's chapter", text: item.excerpt } : null}
    action={<FwCardCTA accent={ACCENT.daily_story} onClick={onOpen}>Read today's chapter</FwCardCTA>} onOpen={onOpen} {...rest} />;
}
// HOROSCOPE — a REAL snippet ("what the moon is saying"), not just a label.
export function HoroscopeCard({ reading, onOpen, ...rest }) {
  const snippet = reading?.headline || (typeof reading?.narrative === "string" ? reading.narrative.slice(0, 160) : null);
  return <FwCard accent={ACCENT.horoscope} Icon={Moon} eyebrow="Your sky today" flower="violet"
    title={reading?.moon_phase ? `The moon is ${reading.moon_phase}` : "What the moon is saying"}
    line={snippet || "Set up your sky and a daily reading appears here."} idx="horo"
    action={<FwCardCTA accent={ACCENT.horoscope} onClick={onOpen}>{reading ? "Read your reading" : "Set up your sky"}</FwCardCTA>} onOpen={onOpen} {...rest} />;
}
// SUMMARY — the page's "what to do today", signal-driven recommendations.
export function SummaryCard({ eyebrow = "A few good things today", rows = [], accent = ACCENT.summary, width, minHeight = 0, snap = false }) {
  return (
    <FwCard accent={accent} eyebrow={eyebrow} flower={null} snap={snap} width={width} minHeight={minHeight} idx="summary">
      {rows.map((r, i) => (
        <button key={i} onClick={r.onClick} style={{ display: "flex", alignItems: "flex-start", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0" }}>
          {r.Icon && <r.Icon size={16} style={{ color: accent, marginTop: 3, flexShrink: 0 }} />}
          <span style={{ flex: 1, minWidth: 0 }}>
            {r.label && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>{r.label}</span>}
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4, display: "block", ...clamp(2) }}>{r.text}</span>
          </span>
          <ChevronRight size={15} style={{ color: T.muted, flexShrink: 0, marginTop: 4 }} />
        </button>
      ))}
    </FwCard>
  );
}
// RECOMMENDATION — a single signal-driven "for you" pick (hook + why + open).
export function RecommendationCard({ item, eyebrow = "Recommended for you", reason, accent = ACCENT.recommendation, flower = "primrose", onOpen, ...rest }) {
  return <FwCard accent={accent} Icon={Sparkles} eyebrow={eyebrow} flower={flower} title={item.title}
    line={reason || item.summary} idx={`rec-${item.id}`}
    action={<FwCardCTA accent={accent} onClick={onOpen}>Open this</FwCardCTA>} onOpen={onOpen} {...rest} />;
}
// LOG / ACTION — an in-place action (log/check/answer) handled by the parent.
export function LogActionCard({ Icon = Sparkles, eyebrow = "Today", flower = "snowdrop", title, line, accent = ACCENT.log, children, ...rest }) {
  return <FwCard accent={accent} Icon={Icon} eyebrow={eyebrow} flower={flower} title={title} line={line} idx="log" {...rest}>{children}</FwCard>;
}

// ── NEVER-EMPTY fallback — a warm full card (not a blank box) for a row whose
// type currently has no items. Always carries a hook/line AND an action. §6.7.
export function EmptyStateCard({ Icon = Sparkles, eyebrow = "For you", flower = "primrose", accent = T.gold, title, line, ctaLabel = "Explore", onClick }) {
  return <FwCard accent={accent} Icon={Icon} eyebrow={eyebrow} flower={flower} title={title} line={line} idx="empty"
    action={<FwCardCTA accent={accent} onClick={onClick}>{ctaLabel}</FwCardCTA>} />;
}

// ── A labelled per-type/per-section ROW — the scroll-snap track (Today geometry) ──
// items + render(item) → a horizontal slider of FwCards. label sits above.
// `fallback` (a node) renders when there are no items so the row is NEVER empty
// and ALWAYS present (per-type rows + never-empty rule, §6.7). Only a row with no
// items AND no fallback collapses.
export function FwCardRow({ label, Icon, accent = T.gold, items = [], render, fallback = null }) {
  if (!items.length && !fallback) return null;
  return (
    <div style={{ marginTop: 22 }}>
      <style>{`.fw-card-row{scrollbar-width:none}.fw-card-row::-webkit-scrollbar{display:none}`}</style>
      {label && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 18px 8px" }}>
          {Icon && <Icon size={15} color={accent} strokeWidth={1.8} />}
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>{label}</span>
        </div>
      )}
      <div className="fw-card-row" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
        {items.length ? items.map((it, i) => render(it, i)) : fallback}
        <div style={{ flex: "0 0 4px" }} aria-hidden />
      </div>
    </div>
  );
}

// ── EXPANDABLE CARD (§6.7.0) — progressive disclosure: summary first, detail on tap ──
// A canonical FwCard that reveals `detail` in place (never a route). Caret rotates on open.
// Props: accent, Icon, eyebrow, flower, title, line, detail (node revealed), defaultOpen,
//        media/inset/action pass through, idx. Snap/width/minHeight forwarded to FwCard.
export function ExpandableCard({
  accent = T.gold, Icon, eyebrow, flower = "camellia", title, line, detail,
  defaultOpen = false, idx = "exp", snap = false, minHeight = 0, action, media, inset, ...rest
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <FwCard
      accent={accent} Icon={Icon} eyebrow={eyebrow} flower={flower} title={title} line={line}
      media={media} inset={inset} action={action} idx={idx} snap={snap} minHeight={minHeight}
      onClick={() => setOpen((o) => !o)}
      corner={<ChevronDown size={20} color={T.muted} style={{ transition: "transform .25s ease", transform: open ? "rotate(180deg)" : "none" }} />}
      {...rest}
    >
      {detail != null && (
        <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .3s cubic-bezier(.32,.72,.24,1)" }}>
          <div style={{ overflow: "hidden", minHeight: 0 }}>
            <div style={{ paddingTop: 10, marginTop: 10, borderTop: `1px dashed ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55 }}>
              {detail}
            </div>
          </div>
        </div>
      )}
    </FwCard>
  );
}

// ── HERO + TAP-TO-PROMOTE RAIL (§6.7.0 · the "image-gallery / thumbnail-to-hero" pattern) ──
// The pattern Halli chose as the lead. One big HERO card (the active item) over a horizontal
// RAIL of peer thumbnails; TAP a thumb → it cross-fades (~220ms) into the hero and becomes it.
// Props:
//   items: [{ id, eyebrow, title, line, accent?, flower?, cover?, thumb?, ctaLabel?, onOpen? }]
//   initialIndex, railLabel, onSeeAll, accent (rail/fallback), width, minHeight, flower (fallback)
// `cover`/`thumb` are optional nodes (an <img>, a gradient block); default = a meaning-bloom.
export function HeroPromoteRail({
  items = [], initialIndex = 0, railLabel = "More to explore", onSeeAll,
  accent = T.gold, flower = "poppy", minHeight = 0,
}) {
  const [active, setActive] = useState(Math.min(initialIndex, Math.max(0, items.length - 1)));
  const [fading, setFading] = useState(false);
  const timer = useRef(null);
  if (!items.length) return null;
  const promote = (i) => {
    if (i === active || fading) return;
    setFading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setActive(i); setFading(false); }, 200);
  };
  const hero = items[active] || {};
  const hAccent = hero.accent || accent;
  return (
    <div style={{ width: "100%" }}>
      <style>{`.fw-hpr-rail{scrollbar-width:none}.fw-hpr-rail::-webkit-scrollbar{display:none}`}</style>
      {/* HERO — cross-fades on promote */}
      <div style={{ transition: "opacity .22s ease", opacity: fading ? 0 : 1 }}>
        <FwCard
          snap={false} minHeight={minHeight} accent={hAccent}
          eyebrow={hero.eyebrow} flower={hero.flower || flower} title={hero.title} line={hero.line}
          media={hero.cover}
          action={hero.onOpen ? <FwCardCTA accent={hAccent} onClick={() => hero.onOpen(hero)}>{hero.ctaLabel || "Open"}</FwCardCTA> : null}
          idx={`hpr-${hero.id ?? active}`}
        />
      </div>
      {/* RAIL header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 2px 8px" }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 18, color: FW_OXBLOOD }}>{railLabel}</span>
        {onSeeAll && (
          <button onClick={onSeeAll} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.gold, display: "inline-flex", alignItems: "center", gap: 3 }}>
            See all <ChevronRight size={14} />
          </button>
        )}
      </div>
      {/* RAIL of thumbnails */}
      <div className="fw-hpr-rail" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 2px 6px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
        {items.map((it, i) => {
          const on = i === active;
          const c = it.accent || accent;
          return (
            <button
              key={it.id ?? i} onClick={() => promote(i)} aria-label={`Show ${it.title}`} aria-pressed={on}
              style={{
                flex: "0 0 96px", scrollSnapAlign: "start", borderRadius: 12, cursor: "pointer",
                background: `linear-gradient(160deg, ${T.paperHi} 0%, ${c}12 100%)`,
                border: `1px solid ${on ? c : T.paperDeep}`, boxShadow: on ? `0 0 0 1px ${c}, 0 2px 8px ${c}30` : "0 1px 3px rgba(58,44,26,0.08)",
                padding: 7, transition: "border-color .15s, box-shadow .15s, transform .15s", transform: on ? "translateY(-1px)" : "none",
              }}
            >
              <span style={{ height: 42, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 8 }}>
                {it.thumb || <FlowerGlyph variant={it.flower || flower} size={30} color={c} idx={`hprt-${it.id ?? i}`} />}
              </span>
              <span style={{ display: "block", fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: on ? c : T.muted, marginTop: 4, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.eyebrow || it.title}</span>
            </button>
          );
        })}
        <span style={{ flex: "0 0 2px" }} aria-hidden />
      </div>
      {/* dots + prev/next */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 2 }}>
        <button onClick={() => promote(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous" style={{ background: "transparent", border: "none", cursor: active === 0 ? "default" : "pointer", opacity: active === 0 ? 0.4 : 0.7, color: T.muted, display: "grid", placeItems: "center" }}><ChevronLeft size={16} /></button>
        <div style={{ display: "flex", gap: 5 }}>
          {items.map((_, i) => <span key={i} onClick={() => promote(i)} style={{ width: i === active ? 15 : 6, height: 6, borderRadius: 999, background: i === active ? hAccent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />)}
        </div>
        <button onClick={() => promote(Math.min(items.length - 1, active + 1))} disabled={active === items.length - 1} aria-label="Next" style={{ background: "transparent", border: "none", cursor: active === items.length - 1 ? "default" : "pointer", opacity: active === items.length - 1 ? 0.4 : 0.7, color: T.muted, display: "grid", placeItems: "center" }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

// Classify a LifestyleItems-style row into a card type (shared by every page).
export function fwTypeOf(i) {
  const m = String(i?.media_type || "").toUpperCase();
  const c = String(i?.content_type || "").toUpperCase();
  if (/PODCAST|AUDIO/.test(m)) return "audio";
  if (/VIDEO|CLIP|TIKTOK|INSTAGRAM|REEL/.test(m)) return "video";
  if (c === "FICTION") return "book";
  if (c === "STORY") return "story";
  if (c === "GUIDE") return "guide";
  return "article";
}
