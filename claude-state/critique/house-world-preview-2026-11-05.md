# House World · optional touchable slice · 5 November 2026

## The bounded atom

Halli approved one optional test section reachable through app navigation, with the existing app intact. Inventory before edit: `/Today`, `/Lifestyle`, five-slot bottom nav, existing `/Ideas` founder desk, garden named bloom and chapters, Jess, Sky and reader/player remained. The new route is `/HouseWorldDemo`, entered from Menu or the sole Ideas catalogue. No existing route, record, function, schema, shared cast or content was retired.

The scene is an **illustrated interaction prototype**, not the full 3D builder described in [the research](../HOUSE_WORLD_RESEARCH_2026-11-05.md). It compares miniature, glasshouse and living folio architecture; pet choice, chair position and bloom tint change the scene and can be undone and kept on this device. Jess and pet have authored, non-invasive moments. Tappable book, window, garden and Jess lead to the real Read, Sky, Garden and Jess routes; direct Read/Sky/Listen/Planner shortcuts remain. The Moon label uses the app's existing `getMoonPhase(new Date())`. No saved book is impersonated: the book leads to Read because this preview does not query account reading position. No API writes or paid generation occur in the scene.

## Specific research carried in

- [Unpacking](https://www.unpackinggame.com/) grounds meaningful placed objects, but we do not invent personal memories for a prototype.
- [Tiny Glade](https://store.steampowered.com/app/2198150/Tiny_Glade/) motivates forgiving spatial choices and undo instead of a needs meter or thousands of items.
- [The Sims 4](https://www.ea.com/games/the-sims/the-sims-4) motivates a distinct build/explore mode and furnished first room; this test is not an equivalent builder.
- [Finch](https://finchcare.com/about-finch) demonstrates a pet/home link; FemWell's pet does not demand care or signal neglect.
- [NASA](https://science.nasa.gov/moon/moon-phases/) grounds the changing lunar cycle; the SVG sky remains art, and no local weather is claimed.
- [Kinder World's developer farewell](https://www.playkinderworld.com/news) cautions against assuming love of a visual world pays for its art and operation.

Brand conformance: §§5, 10.5.23, 10.5.89–92, 11, 17.3 and 19. The three variants deliberately share the same event for comparison, with genuinely different timber-house, glasshouse and living-folio architecture. A first 390px self-critique found the initial SVG room too flat. The same cycle replaced that visual with three purpose-made painterly architectural backdrops and separately switchable Jess, chair, pet and flower cutouts; all controls and routes remain. The assets are under `public/images/house-world/`. Built-in ImageGen prompts specified elevated isometric rooms, real plaster/wood/glass/paper materials, botanical edges, clear floor for the independently moved props, and a transparent six-item sprite sheet; no text/UI or stock flower stickers. The visual is still an early **2.5D interactive study**, not a full 3D/AI character pipeline. The user can turn off movement; OS reduced-motion preference also disables it.

## Adversarial proof

- Production Vite build passes. Scoped ESLint: zero errors; six pre-existing unused/warning notices outside the new page.
- Controlled Chrome mobile touch emulation at **360, 390 and 430px**: actual taps changed each world, entered Build, selected dog/chair/bloom, saved local choice, opened pet detail, tapped window → routed Sky, revisited and read back local choice, toggled motion, zero sampled horizontal overflow and page errors. At 390, actual bottom Menu → preview and preview → Ideas → preview card passed; book → Read, garden → Garden, Jess → Jess, direct Listen and Planner, and one-step Undo were also tapped and re-proved.
- P1 reproduced and fixed: a top-right Ideas link in the preview was blocked by the persistent calendar button. The preview now hides only its duplicate global calendar/Ideas controls and keeps its own accessible Ideas link; all normal app pages retain theirs. Rebuilt and re-proved.
- Fresh-session app-wide Morning Brief initially overlaid the scene. This is existing app behaviour, not House World state. Controlled proof marked the brief seen for the mock user; actual signed-in first-open flow still needs phone inspection.
- After deploy, the signed-in in-app browser reached `/HouseWorldDemo` from the research page. Its first navigation reused the already-open pre-deploy bundle and showed the generic route list; one reload fetched the new bundle and displayed the complete house, three tabs, objects, Build and direct routes. This stale open-tab transition is a carried P2 cache/reload issue, not a claim that every existing tab hot-swaps instantly.

## Cost and limits

House scene: SVG hotspot/prop composition, scoped CSS, existing font/astrology modules and local image assets; no new Base44 function, row, per-view AI or external provider unit. `localStorage` writes only on explicit Keep. The first room asset is **389,238 bytes**, the four initially visible cutouts total **134,670 bytes** (523,908 bytes of local WebP source files before browser transfer/caching); selecting Glasshouse or Folio requests a further **399,628** or **326,486** byte backdrop. Nine source assets total **1,318,646 bytes**; these are file sizes, not measured network transfer or operating cost. Shared app shell/auth, Ideas and opened destinations retain their existing requests. **Measured FPS, battery and native iPhone feel remain unknown.** A full dimensional house, object placement/drag, account saved book, actual garden data in-window, named custom pet, ambient audio and cross-device persistence are **future proposals**, not claims for this slice. Halli's iPhone judgement is needed before increasing art scope.

## Verdict and next coherent build

Scoped P0: none found. P1: blocked Ideas exit fixed. P2: stale pre-deploy open tab needs one reload; 2.5D art does not yet prove the high-end Sims-like world; native iPhone GPU/thermal/gesture proof, exact saved source and account persistence remain open. Next: compare this against one genuine dimensional/rendered treatment with actual source-backed object, instrument bytes/frame cost, and refine a selected art direction before any main-world or schema decision. Keep LC34 Lifestyle content work on its separate manual track; four-hour automation paused.
