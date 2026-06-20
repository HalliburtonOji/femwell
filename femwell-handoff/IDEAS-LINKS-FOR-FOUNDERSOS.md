# IDEAS LINKS — plan/brainstorm docs to keep wired into FoundersOS (IDEAS pill)

> Per CLAUDE.md Standing Rule #1: every plan/brainstorm ships as a phone-readable styled-HTML doc to `C:\Users\Halli\femwell-handoff\` **and** is linked into the FoundersOS "Ideas" page so Halli reaches it via the floating IDEAS pill (never a dead route).
> Mechanism (established): copy the HTML into `src/components/founders/brandDocs/<slug>.html`, `import …?raw` in `FoundersOS.jsx`, add a `{ kind:"doc", key:"…" }` CATALOG entry, and a `{tab === "…" && <BrandDocFrame html={…} title="…" />}` render branch. Then build + `npx base44 site deploy -y`.

## Wired (in-app, reachable via IDEAS pill)
| Doc (phone HTML in femwell-handoff/) | in-app brandDocs slug | FoundersOS key | group |
|---|---|---|---|
| BRAND-BIBLE.html | brand-bible.html | "Brand Bible" | Brand identity & plans |
| LIVING-ECOSYSTEM-BRAINSTORM.html | living-ecosystem.html | "Living Ecosystem" | Brand identity & plans |
| INTENTIONS-GOALS-BRAINSTORM.html | intentions-goals.html | "Intentions & Goals" | Specs & Plans |

## Notes for the FoundersOS session
- If I (a brand/feature session) add a new plan doc, I copy it into `brandDocs/` and wire it myself when `FoundersOS.jsx` is clean; if you hold the file, wire from this list.
- Keep the in-app `brandDocs/*.html` copies in sync with the latest femwell-handoff/ version when the content session updates a doc (the content session owns the HTML; you own the catalog wiring).
