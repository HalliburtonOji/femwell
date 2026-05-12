#!/usr/bin/env python3
"""
One-shot image_url backfill for FemWell LifestyleItems.

Reads a JSON file of rows {id, content_url, source_name, title}, fetches each
article with a real Chrome UA, parses og:image/twitter:image, and writes a
mapping JSON of {id: image_url} that we then push to base44 via the MCP
update_entities tool (out-of-band — this script just produces the patches).

Usage:
    python3 scripts/backfill_images.py rows.json out.json

`rows.json` shape:
    [{"id": "...", "content_url": "...", "source_name": "..."}]
"""
import json
import re
import sys
import time
import urllib.parse
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import ssl

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

OG_PATTERNS = [
    re.compile(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', re.I),
    re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', re.I),
    re.compile(r'<meta[^>]+property=["\']og:image:url["\'][^>]+content=["\']([^"\']+)["\']', re.I),
    re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image:url["\']', re.I),
    re.compile(r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']', re.I),
    re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image["\']', re.I),
    re.compile(r'<meta[^>]+name=["\']twitter:image:src["\'][^>]+content=["\']([^"\']+)["\']', re.I),
    re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image:src["\']', re.I),
]

def is_plausible(url):
    if not url or len(url) < 12: return False
    lo = url.lower()
    return not any(t in lo for t in ("1x1", "pixel", "blank", "transparent")) and not lo.endswith(".svg")

def fetch_html(url, timeout=10):
    """Fetch HTML with Chrome UA. Returns (final_url, html) or (None, None)."""
    # Decode HTML entities in URL (Refinery29 ships &#038; in feed URLs)
    url = unescape(url)
    req = Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
    })
    ctx = ssl.create_default_context()
    try:
        with urlopen(req, timeout=timeout, context=ctx) as r:
            final_url = r.geturl()
            html = r.read(400_000).decode(r.headers.get_content_charset() or "utf-8", errors="replace")
            return final_url, html
    except (HTTPError, URLError, TimeoutError, OSError, UnicodeDecodeError) as e:
        return None, f"ERR: {type(e).__name__}: {e}"

def parse_og(html, base_url):
    if not html or not isinstance(html, str): return None
    head = re.search(r"<head[\s\S]*?</head>", html, re.I)
    haystack = head.group(0) if head else html[:200_000]
    for pat in OG_PATTERNS:
        m = pat.search(haystack)
        if m:
            cand = m.group(1).strip()
            cand = unescape(cand)
            # Resolve relative URLs against base
            if not re.match(r"^https?://", cand, re.I):
                if cand.startswith("//"):
                    proto = urllib.parse.urlparse(base_url).scheme or "https"
                    cand = f"{proto}:{cand}"
                else:
                    cand = urllib.parse.urljoin(base_url, cand)
            if is_plausible(cand):
                return cand
    return None

def is_skip(row):
    """Skip rows that obviously can't be backfilled — fake TikTok URLs etc."""
    url = (row.get("content_url") or "").lower()
    # The fake seeded TikTok URLs all share these IDs
    if "tiktok.com" in url and any(seg in url for seg in [
        "7350000000000000001", "7350000000000000002",
        "7350000000000000003", "7350000000000000004",
    ]):
        return "seeded_placeholder_tiktok"
    if not url:
        return "no_url"
    return None

def main():
    rows = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    patches = {}
    misses = []
    skipped = []
    for i, row in enumerate(rows, 1):
        rid = row["id"]
        skip = is_skip(row)
        if skip:
            skipped.append({"id": rid, "reason": skip, "title": row.get("title", "")})
            continue
        final_url, html = fetch_html(row["content_url"])
        if not final_url:
            misses.append({"id": rid, "url": row["content_url"], "error": html, "source": row.get("source_name", "")})
            print(f"[{i:>3}/{len(rows)}] MISS {row.get('source_name','?')[:24]:24} {html[:80]}", flush=True)
            continue
        og = parse_og(html, final_url)
        if og:
            patches[rid] = og
            print(f"[{i:>3}/{len(rows)}] OK   {row.get('source_name','?')[:24]:24} → {og[:80]}", flush=True)
        else:
            misses.append({"id": rid, "url": row["content_url"], "error": "no og:image found", "source": row.get("source_name", "")})
            print(f"[{i:>3}/{len(rows)}] MISS {row.get('source_name','?')[:24]:24} (no og:image)", flush=True)
        # Be polite to publishers
        time.sleep(0.3)
    json.dump({
        "patches": patches,
        "misses": misses,
        "skipped": skipped,
        "stats": {
            "total": len(rows),
            "patched": len(patches),
            "missed": len(misses),
            "skipped": len(skipped),
        },
    }, open(out_path, "w"), indent=2)
    print(f"\n=== {len(patches)} patched, {len(misses)} missed, {len(skipped)} skipped → {out_path} ===")

if __name__ == "__main__":
    main()
