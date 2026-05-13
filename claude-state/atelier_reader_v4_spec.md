# FemWell Reader v4 — Atelier spec

Ms Atelier · 2026-05-12 · spec only.
Principle: the reader IS the page; the page IS the screen. No card. Fraunces + Inter, rose `#D45E52`, Lucide, no emoji.

---

## 1. Theme palette (3 themes, persisted as `fw_reader_theme`)

| Token | Cream (default) | Honey (sepia) | Plum Night (dark) |
|---|---|---|---|
| `--paper` | `#FFFAF5` | `#F5E6CD` | `#2B1E26` |
| `--ink` | `#2A2035` | `#3A2818` | `#F5E6D3` |
| `--ink-mute` | `#8A7E88` | `#7A6048` | `#C9B8B0` |
| `--accent` | `#D45E52` | `#B68A3C` | `#E89289` |
| `--rule` | `rgba(74,42,58,0.10)` | `rgba(58,40,24,0.14)` | `rgba(245,230,211,0.14)` |
| `--fade-from` | `#FFFAF5` | `#F5E6CD` | `#2B1E26` |
| `--fade-to` | `rgba(255,250,245,0)` | `rgba(245,230,211,0)` | `rgba(43,30,38,0)` |

Page bg = `--paper`. No surface layer.

---

## 2. Typography (5 size steps, absolute, no `clamp()`)

Body Fraunces 400. h1 Fraunces 500. Drop cap Fraunces 400 in `--accent`. UI labels Inter 600, 10–11px, `0.10em` tracked, uppercase.

| Step | Body | Line-ht | Para gap | Drop cap |
|---|---|---|---|---|
| xs | 15px | 1.65 | 14px | 3.4em |
| s  | 16px | 1.70 | 16px | 3.8em |
| m  | 18px | 1.75 | 18px | 4.2em |
| l  | 20px | 1.80 | 20px | 4.6em |
| xl | 23px | 1.84 | 22px | 5.0em |

h1: `1.55em` of body, centred, line-ht 1.25, margin `0 0 8px`. Ornament `· · ·` under h1 in `--accent`, 14px, `0.35em` tracked, margin `0 0 28px`. Drop cap floats left, `line-ht 0.80`, `margin: 4px 10px -2px 0`, first paragraph of first page only.

---

## 3. Page layout — desktop (≥ 768px)

- No card. No `border-radius`. No `box-shadow`. No bg on stage. No border.
- Reading column: `max-width: 580px`, `margin-inline: auto`.
- Side gutters: equal `--paper`, min 32px each; expand naturally on wider viewports — column stays 580.
- Top inside column: `64px` first page of chapter, `32px` continuation. Bottom: `56px`.
- No divider between column and gutter.

## 4. Page layout — mobile (< 768px)

- Side gutters: 24px. Column: `max-width: 100%` minus gutters.
- Top: `56px` first page, `24px` continuation. Bottom: `40px`.

Tap zones span the viewport between the two bars; centre 20% horizontal band is chrome-toggle, not flip.

---

## 5. Chrome — floating, auto-hiding

Two `fixed` bars; page text flows under them. §3–4 padding keeps text clear.

**Top bar** — `top:0; height:48px;` bg = vertical gradient `--fade-from → --fade-to`. No border, no shadow.
- Left (44×44): Lucide `ArrowLeft` 20px, `--ink`.
- Right (44×44 each): Lucide `Bookmark` 20px, then `Aa` glyph (Fraunces 500, 16px).
- Centre: silent. No title.

**Bottom bar** — `bottom:0; height:40px;` mirrored gradient. One centred line, Inter 500, 11px, `0.08em` tracked, `--ink-mute`, uppercase: `CHAPTER 4 · PAGE 2 OF 7 · 38%`. No buttons. No dots.

**Auto-hide** — visible 3s after mount or chapter change. Any input resets timer. After 3s idle, fade 200ms to opacity 0 + `pointer-events: none`. Centre-screen tap toggles. Sheet open ⇒ stay visible. `prefers-reduced-motion`: instant show/hide.

---

## 6. Settings sheet (Aa drawer)

Bottom drawer. `fixed; bottom:0;` height `60vh`, max-width `560px` centred. Bg `--paper`. `border-radius: 24px 24px 0 0`. `box-shadow: 0 -8px 32px rgba(74,42,58,0.15)`. Top handle: 36px tall, 36×4 pill in `--rule`. Scrim `rgba(74,42,58,0.30)`, 180ms fade. Closes on scrim, swipe-down, Escape.

Each section: Fraunces italic 13px label in `--ink-mute`, 10px gap, then control. 20px between sections.

1. **Text size** — existing 5-step slider, full width, `A` end marks (Fraunces).
2. **Theme** — 3 tiles, 88px, equal-flex. Each = paper swatch with "Aa" in theme `--ink`, 1px `--rule` border. Selected: 2px `--accent` outline. Inter 11px labels `Cream`, `Honey`, `Plum Night`.
3. **Typeface** — 2 tiles, 64px each, "Aa" Fraunces vs Inter. Stored `fw_reader_font`. Inter mode keeps Fraunces only for h1 + drop cap.
4. **Line spacing** — 3 steps: Tight 1.55× / Default 1.75× / Relaxed 1.95× (multiplies §2). Stored `fw_reader_line`.
5. **Margins** — 3 steps: Narrow 480 / Default 580 / Wide 680px column max-width. Stored `fw_reader_margins`.

Slider tracks 3px `--rule`. Thumbs: 18px circle, `--accent` fill, 2px `--paper` ring, `0 1px 3px rgba(0,0,0,0.18)` shadow.

---

## 7. Page-flip — soft slide-fade

FemWell's own. Not Kindle curl, not Apple lift.

- 280ms, easing `cubic-bezier(0.32, 0.72, 0.24, 1)`.
- Forward: outgoing → `-16px` + opacity 0 over first 180ms. Incoming starts `+16px` + opacity 0, lands `0` + 1 over last 220ms. ~120ms overlap.
- Backward: mirrored (out → `+16px`, in starts `-16px`).
- Chapter boundary: 380ms; outgoing fades faster (140ms) — heavier turn.
- `prefers-reduced-motion`: pure 180ms cross-fade, no translate.
- Delete v3 `perspective` / `rotateY` keyframes — no card, nothing to rotate.

---

## 8. Delete

- `.ds-reader-stage` `background`, `border`, `border-radius`, `box-shadow`, `min/max-height`. Keep only `position: relative; overflow: hidden;`.
- `.ds-reader-controls` row above stage → replaced by floating top bar.
- `.ds-reader-immersive-bar` — top bar IS the immersive bar.
- `.ds-reader-nav` chevron row → tap zones + keyboard.
- `.ds-reader-chapter-strip` current placement → bottom bar.
- `.ds-reader-dots` → `38%` in bottom bar.
- `.ds-reader-series-label` inline — series title lives on the chapter-list screen, not inside the reader.
- `@keyframes ds-flip-fwd` / `ds-flip-back` (3D) → §7.
- `.ds-reader-ctrl-fullscreen` (`⤢`) — fullscreen is the only mode.

## 9. Keep

- `ChapterPage` measured pagination (`useLayoutEffect` + hidden mirror). Change `reserved` to `144` (48 top + 40 bottom + 56 col-bottom); first-page variant reserves +32px for heading+ornament.
- 5-level text size constants.
- `localStorage.fw_reader_text_size`; add `_theme`, `_font`, `_line`, `_margins` on the same pattern.
- Portal-to-`body`. Always portalled in v4 — reader is always a full-page surface; Lifestyle → Daily Story opens it via route push, never inline.
- Keyboard (Arrow / Escape) and touch swipe.
- `prefers-reduced-motion` check.
- Locked-cliffhanger for daily-story. Restyle: drop dark gradient + page-curl, use `--paper` + `--ink` so the lock feels like the same book paused. Keep countdown, teaser, Lock icon.

---

## Acceptance

At 1000px: edge-to-edge `--paper`. 580px column centred, ~210px cream each side. No card, line, or shadow. Title Fraunces ~28px centred, rose `· · ·` beneath, first paragraph opens with a 4.2em rose drop cap. Bottom shows faint Inter `CHAPTER 4 · PAGE 2 OF 7 · 38%`. After 3s of stillness, chrome fades — only paper and ink remain.
