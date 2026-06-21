# HANDOFF → FoundersOS reorg session: link these 11 demo routes into the IDEAS hub

**Why:** these are preview-only standalone routes. A demo is NOT "done" until it's reachable from
the FoundersOS page via the IDEAS pill (Halli can't reach `/XxxDemo` from his nav). Please add all 11
as `kind:"route"` entries under the **Previews & Demos** category (a "Page redesigns" sub-group would be
ideal). Each is live now (live bundle as of handoff: `index-F2pyRXwn.js`). Mark them **NEW**.

All are distinct-layout redesign demos — page-appropriate form, brand-constant (type scale, flora,
carved heart, lush, sticky Jump-to where multi-section, specific deep-links). Live pages untouched.

| label | route | one-line description |
|---|---|---|
| Health redesign | `/HealthDemo` | Vertical editorial "letters" page — inline cycle-ring masthead, Today panels, numbered letter index, care rows |
| Profile redesign | `/ProfileDemo` | Membership identity card + flora-fingerprint banner + intentions + 2-col bento tile grid |
| Doctor Export redesign | `/DoctorExportDemo` | Live document builder — real-count category checklist assembling a paper "one-page summary" |
| Programs redesign | `/ProgramsDemo` | Streaming gallery — featured card + category shelves; every tile → the exact programme |
| Garden redesign | `/GardenDemo` | Immersive illustrated garden scene (companion bloom + life-area plants) + ritual panels |
| Pulse redesign | `/PulseDemo` | Insight dashboard — mood/energy sparklines, pattern mini-bars, consistency dots, phase tile |
| Planner redesign | `/PlannerDemo` | Week-strip + agenda timeline (inline check-off + add); fresh concept, live Planner untouched |
| Explore redesign | `/ExploreDemo` | Search-first discovery masonry spanning all life domains |
| Saved redesign | `/SavedDemo` | Collections library — per-type cards with spine-stacks + filtered list |
| Deals redesign | `/DealsDemo` | Voucher wallet — perforated ticket cards (real partner deals) |
| Events redesign | `/EventsDemo` | Date-grouped agenda / poster feed (online/in-person/free filters) |

**Deploy note:** these routes only resolve live when deployed via `npx base44 site deploy -y` (local
dist upload). The bare POST `/deploy` regenerates `pages.config.js` server-side and drops repo-only
routes → 404. (Memory: `femwell-preview-route-deploy-method.md`.)

---

## ADD (2026-06-21) — Today Ritual Builder demo → please wire under the **Current** group

| label | route | one-line description |
|---|---|---|
| Today — Ritual Builder (Clipboard slider) ★ NEW | `/TodayRitualDemo` | The live Today (Demo6) with the "Your day" to-do turned into a §6.10 **Clipboard Stack Slider** — slide LEFT to reveal the **ritual builder**: a clipboard holding 4 ritual cards, each a §6.7.6 quick-action popup (do it in place → ticks) tied to garden growth (waters the companion; a pollinator visits after a few). Everything else on Today (hero, day-paragraph, Your-Day list, calendar, sections) is unchanged — additive. For Halli's approval before it goes live on real Today. |

**Group:** please put this in the **Current** group (it's an active in-context Today proposal awaiting Halli's sign-off), `kind:"route"`, marked **NEW**.
**Deploy:** shipped via `npx base44 site deploy -y` (local dist) as required for repo-only routes.

---

## ADD (2026-06-21) — Journal Clipboard rebuild → wired into CATALOG (Current) directly

| label | route | one-line description |
|---|---|---|
| Journal — Clipboard rebuild (compact ~2 screens) ★ NEW | `/JournalClipboardDemo` | The live Journal (Hub) rebuilt to the v4 bible + made COMPACT (slide sideways, ~2 screens): flora-hero + ONE summary card, then a §6.10 Clipboard Stack Slider (Write & reflect / Your circle / Keep & see) of uniform 365×488 tiles. EVERY feature preserved (write·echo·witness·twin·threads·sealed letters·mirror·on-this-day·insights·tonight — each tile opens the full real surface) + a §6.7.6 quick-line popup. Live Journal untouched. |

**Status:** I added the CATALOG entry myself (group `CAT.CURRENT`, status "new") since FoundersOS uses a data-driven CATALOG and the standing rule is "not done until it opens from the IDEAS pill". If you reorganise, keep it under Current.
