# HANDOFF → Community session: swap the sprout chip for the veiled PresenceBloom

**Why:** Bloomprint Phase 1 is live on Profile/Today/Garden. The last piece is her **veiled
presence bloom** in the Talk rooms — replacing the generic gold sprout icon on each post with a
small bloom seeded from the post's `author_hash`. The flora session did NOT edit `Community.jsx`
because it was mid-edit in your session (avoiding a clobber). The component is **built + committed
+ live-ready** (`src/components/brand/PresenceBloom.jsx`). You own Talk-rooms anonymity, so please
apply (or confirm) this 2-edit swap.

**Anonymity is preserved — this is presentation only.** `PresenceBloom` seeds the bloom from the
**anonymous `author_hash`** (never `userId`), shows **species + colour only** (never her growth or
activity), and namespaces its SVG gradients per instance (`useId`) so a feed of many blooms never
collides. It's veiled-by-default: it's the same anonymous identity you already render, just given a
face instead of a sprout. My-flower/Named tiers (a visitable patch) are a later phase.

## The 2 edits (in `src/pages/Community.jsx`)

**1. Import** — next to the other `@/components/brand` imports (near the `FwFloraHero` import):
```js
import PresenceBloom from "@/components/brand/PresenceBloom";
```

**2. Swap the post-author chip icon** — in `PostCard`, the `enhanced && post.author_hash` block.
Replace the sprout span:
```jsx
<span style={{ width: 22, height: 22, borderRadius: 999, background: `${T.gold}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><Sprout size={12} color={T.gold} /></span>
```
with:
```jsx
<PresenceBloom hash={post.author_hash} size={22} />
```
(The alias name beside it — `botanicalAlias(post.author_hash)` / "You" — stays exactly as is.)

**Optional (nice-to-have, same idea) — the comment author chip** in the `enhanced && c.author_hash`
block: prepend `<PresenceBloom hash={c.author_hash} size={16} />` before the alias name so a woman's
bloom is her face on comments too. Keep it small.

## Notes
- `PostCard` renders with `enhanced` (redesign variant is live), so this shows in the live rooms.
- `Sprout` may become an unused import after the swap — remove it if your linter flags it (it's used
  elsewhere too, so check first).
- Reversible: revert the one span to bring back the sprout icon.
- After applying: build + `npx base44 site deploy -y`; the bloom appears on every post's author chip.
