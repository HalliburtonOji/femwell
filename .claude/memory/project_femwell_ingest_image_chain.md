---
name: FemWell ingestRSS image chain
description: Image extraction order in ingestRSS/entry.ts. Reference when image_url issues recur or when adding a new ingest path.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
`base44/functions/ingestRSS/entry.ts` extracts image_url in this order:
1. **Feed-supplied image** — `extractImageFromItemBlock()` scans the raw RSS `<item>` block for media:content, media:thumbnail, enclosure with image MIME, or first `<img>` inside content:encoded/description/summary CDATA. Survives CDN bot-blocks because we never hit the article origin.
2. **og:image** — `fetchOgImage(item.link)` hits the article URL with Chrome UA and parses og:image / og:image:url / twitter:image / twitter:image:src meta tags.
3. **Empty string** + an `IngestErrorLog` row with `stage='image_missing'`.

**Why:** original chain was og:image only. Most UK publishers (RCM, Refinery29 UK, Longreads, mindbodygreen, Healthline, Narratively, Psychology Today) sit behind Cloudflare/Fastly and 403/429 Deno-edge IPs even with Chrome UA, so og:image fell through to `''` silently.

**How to apply:**
- When adding a new RSS source, check it serves at least one of {media:content, media:thumbnail, enclosure, content:encoded with img}.
- New ingest paths (ingestVideo, ingestPodcast) should mirror this chain so we don't regress.
- TikTok via ingestSocial still hard-codes image_url=''; if that path gets re-enabled, fix it the same way (probably needs oEmbed lookup).
- `findFreeImage/entry.ts` exists as a last-resort tier — wire it in if image_missing logs spike for a specific source.

Fixed in commit ed0a97f (2026-05-12).
