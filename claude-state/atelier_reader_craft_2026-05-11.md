# Atelier — LifestyleDetail Reader Craft Spec
**For:** Mr Lucha (base44 build)
**From:** Ms Atelier
**Date:** 2026-05-11
**Ship target:** 30–60 min, one push.
**File:** `src/pages/LifestyleDetail.jsx` (full rewrite of the inner card; routing + data-fetch stays as-is).
**Reference visual:** `src/components/today/TodayDailyChapterCard.jsx` — match its editorial weight inside the reader.
**Reminder:** NO emoji anywhere. Lucide icons + Fraunces glyphs only.

---

## 1 — Hero zone at top of card

Replace the current bare title with a hero block at the top of the card (above phase tags).

**If `item.image_url` exists:**
- Container: 16:9 aspect (`paddingBottom: "56.25%"`), full-bleed within the card (negate the card's 32px padding with negative margins: `margin: "-32px -32px 20px"`; on mobile `-24px -24px 18px`).
- `<img>` absolute-fills container, `objectFit: cover`.
- Gradient scrim overlay: `linear-gradient(to top, rgba(43,28,46,0.78) 0%, rgba(43,28,46,0.15) 55%, rgba(0,0,0,0) 100%)`.
- Eyebrow + title overlaid bottom-left, 24px inset, color `var(--cream)`.

**If no `image_url`:**
- Same container, but `background: item.image_gradient || "linear-gradient(135deg, var(--plum-deep) 0%, var(--rose-primary) 100%)"`.
- Title aspect: 4:3 (`paddingBottom: "75%"`) so the gradient gets generous vertical room. Title overlaid same as above.

**Eyebrow strip (inside hero, above title):**
- Inter 11px, weight 700, uppercase, `letterSpacing: "0.14em"`, color `rgba(247,240,230,0.85)`.
- Format: `{SOURCE_NAME} · {RELATIVE_DATE} · {CATEGORY}` (e.g. `BBC GOOD FOOD · 3 DAYS AGO · NUTRITION`).
- Relative date helper: <24h "today", <48h "yesterday", <7d "N days ago", else `dd MMM yyyy`.

**Title (inside hero):**
- Fraunces serif, weight 400, color `var(--cream)`.
- Mobile: 38px / line-height 1.08 / letter-spacing -0.015em.
- Desktop (md+): 56px / line-height 1.05 / letter-spacing -0.02em.
- Max 3 lines, no truncation (let it wrap; hero auto-grows).

---

## 2 — Body typography

Below hero, inside the same card.

- Drop cap: first paragraph's first letter wrapped in `<span class="fw-dropcap">`. Fraunces serif, 64px desktop / 52px mobile, color `var(--rose-primary)`, `float: left`, `line-height: 0.85`, `padding: 4px 10px 0 0`, weight 500.
- Body paragraphs: Inter 16px (mobile) / 17px (desktop), line-height 1.78, color `var(--plum)`, weight 400.
- Paragraph spacing: 18px between (margin-bottom 18px, last child 0).
- Section break ornament every ~400 words (after every 4th paragraph): a centered three-dot row in `var(--rose-primary)`, 28px tall, font-size 18px, letter-spacing 12px — `· · ·`. Margin 28px top/bottom.

---

## 3 — Pull quote from `why_it_matters`

Remove the existing thin-border treatment near the top. Inject after the 3rd body paragraph (or at midpoint if <6 paragraphs).

- Container: margin 32px 0, padding 24px 0, text-align center, max-width 560px, mx auto.
- Thin rules top + bottom: `border-top: 1px solid var(--rose-primary); border-bottom: 1px solid var(--rose-primary);` (these are the only rules — no left border).
- Quote text: Fraunces italic, weight 400, 26px (mobile 22px), line-height 1.4, color `var(--plum-deep)`.
- No quotation marks — typography carries it.

---

## 4 — Markdown handling inside body

The body string may contain `##` and `###` lines. Render inline (split body into blocks).

- Line starting `## ` → Fraunces 24px (desktop) / 22px (mobile), weight 500, color `var(--plum-deep)`, margin: 28px 0 12px, line-height 1.25.
- Line starting `### ` → Inter 11px uppercase, weight 700, letterSpacing 0.14em, color `var(--rose-primary)`, margin: 22px 0 8px.
- Strip the `#` chars before render.
- Implementation: split `fullBody` on `\n\n`, map each block: if starts `## ` render as `<h2>`, if starts `### ` render as eyebrow `<p>`, else paragraph. Drop cap only on the FIRST paragraph block.

---

## 5 — HTML entity decoding

Add helper at top of file:

```js
function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
}
```

Apply to: `item.title`, `item.why_it_matters`, `fullBody`, each `takeaway`, and source/author strings.

---

## 6 — Takeaways block

Keep position (below body, above Read-full button).

- Card: `background: var(--cream-2)`, `border: 1px solid var(--rose-dust-light)`, `borderRadius: 18`, `padding: 24px 22px`.
- Header eyebrow: Fraunces italic 14px, weight 400, color `var(--plum-deep)` — "Key takeaways". Margin-bottom 14px. No uppercase. (Replaces the current Inter uppercase eyebrow.)
- Each takeaway row: flex, gap 14, padding 12px 0, border-bottom `1px solid var(--rose-dust-light)`. Last row no border.
- Number badge: 28×28 circle, `background: var(--rose-primary)`, color `var(--cream)`, Fraunces serif, 16px, weight 500, line-height 1, flex-center.
- Takeaway text: Inter 15px, line-height 1.55, color `var(--plum)`, margin 0, flex 1.

---

## 7 — "More like this" rail

New section, append after Takeaways (or after Read-full button if present).

**Data fetch (add to existing `useEffect` after main item fetch):**
```js
const related = await base44.entities.LifestyleItems
  .filter({ category: fetched.category })
  .catch(() => []);
const filtered = (related || [])
  .filter(r => r.id !== fetched.id)
  .slice(0, 6);
setRelated(filtered);
```

**Render (only if related.length >= 2):**
- Section margin-top 40px.
- Header: Fraunces italic 22px, weight 400, color `var(--plum-deep)`, "More like this", margin-bottom 16px.
- Rail: horizontal scroll, `scroll-snap-type: x mandatory`, gap 14, padding-bottom 8, `-webkit-overflow-scrolling: touch`.
- Card (each): width 240, flex-shrink 0, scroll-snap-align start, cursor pointer, navigates to `/LifestyleDetail?id={r.id}`.
  - Image: 240×140, `objectFit: cover`, `borderRadius: 14`. Fallback gradient if no `image_url`.
  - Title: Fraunces 16px, weight 500, color `var(--plum)`, line-height 1.25, 2-line clamp, margin-top 10.
  - Meta: Inter 11px, weight 600, uppercase, letterSpacing 0.1em, color `var(--mauve)`, format `{SOURCE} · {RELATIVE_DATE}`, margin-top 6.

---

## 8 — YouTube embed treatment

Wrap existing iframe.

- WATCH eyebrow ABOVE: Inter 11px, weight 700, uppercase, letterSpacing 0.14em, color `var(--rose-primary)`, margin-bottom 10. Text: "WATCH".
- iframe container: keep 16:9, but add `border: 1px solid var(--ink-line)`, `borderRadius: 14`, `boxShadow: var(--shadow-card)`. Drop the black bg (image fills it).
- BELOW the embed: small byline row, Inter 12px, color `var(--mauve)`. Format: `{item.author_name || item.source_name}` · channel link if `item.author_url` exists.
- When YouTube embed is present, the hero zone (section 1) is REPLACED by the embed — don't show both. Title renders below the embed as Fraunces 32px mobile / 44px desktop, color `var(--plum-deep)`, weight 400.

---

## 9 — Background canvas + card chrome

- Page background: stays `var(--ivory)`. Unchanged.
- Card chrome upgrade:
  - `padding: 32px` desktop / `24px` mobile (currently `p-6 md:p-8` = 24/32, keep).
  - `borderRadius: 24` (up from 24/3xl — match the editorial weight).
  - Border: `1px solid var(--ink-line)`.
  - Shadow: `var(--shadow-card)` (slightly heavier than `--shadow-md`).
  - Max-width: bump container from `max-w-3xl` (768) to `max-w-2xl` (672) — tighter measure, better reading rhythm. Body line-length stays ~65ch.

---

## 10 — Mr Lucha implementation checklist

Single file: `src/pages/LifestyleDetail.jsx`. One push, no schema changes.

1. **Add helpers** at top: `decodeHtmlEntities`, `formatRelativeDate`, `renderBodyBlocks(body)` (splits on `\n\n`, returns array of `{kind: 'h2'|'eyebrow'|'p', text}`).
2. **Add state**: `const [related, setRelated] = useState([]);`
3. **Extend `useEffect`**: after item fetch, query `LifestyleItems.filter({ category })`, filter out self, slice 6, `setRelated`.
4. **Decode entities** at every text-render site listed in §5.
5. **Replace top-of-card structure** (the `<div className="rounded-3xl ...">` block):
   - If YouTube → embed block per §8, then title block.
   - Else → hero block per §1 (full-bleed within card via negative margin).
6. **Move phase tags** to BELOW the hero (between hero and body), keep current styling.
7. **Replace the single `<p>` body render** with `renderBodyBlocks(decodeHtmlEntities(fullBody)).map(...)`. First `p` gets drop cap via CSS class. Inject `· · ·` ornament every 4 blocks. Inject pull quote after block index 2 (or midpoint).
8. **Remove** the current top-positioned `why_it_matters` block.
9. **Upgrade takeaways block** per §6.
10. **Append "More like this"** rail per §7.
11. **Inline style block** at top of return: drop cap CSS, ornament CSS, scroll-snap rail CSS, paragraph spacing.

**Acceptance:**
- Reader visually matches Daily Chapter card editorial weight.
- Title is Fraunces 38–56px with eyebrow + relative date over hero image or gradient.
- First paragraph has a rose-primary Fraunces drop cap.
- Pull quote breaks the body at ~1/3 with thin rose rules above/below.
- `##` and `###` render as section headers, not raw markdown.
- "Vitamin D & Fat Loss" displays correctly (no `&amp;`).
- YouTube videos embed with WATCH eyebrow + bordered frame.
- "More like this" rail at bottom shows 3+ same-category items.
- Zero emoji. Inter + Fraunces + Lucide only.

Ship it.
