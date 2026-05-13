# LC-1 — Listen Seed re-run: Podcasts + TikTok

> Paste everything below the rule into the base44 builder. Do NOT include this header.

---

## §1 Pre-flight (read first)

Read these files before editing:
- `src/components/lifestyle/listen/ListenTab.jsx`
- `src/components/lifestyle/listen/ListenFilterChips.jsx`
- `src/components/lifestyle/listen/TikTokRail.jsx`
- `src/components/lifestyle/listen/ListenGrid.jsx`
- `src/components/lifestyle/listen/SessionCard.jsx`
- `src/components/lifestyle/listen/PodcastCard.jsx`
- `base44/entities/LifestyleItems.jsonc`
- `base44/entities/LifestyleSources.jsonc`
- `base44/functions/ingestRSS/entry.ts`
- `base44/functions/ingestSocial/entry.ts`

Confirm schema state (do this BEFORE writing any code):
- `LifestyleItems.media_type` enum currently includes `ARTICLE`, `VIDEO`, `TIKTOK`, `INSTAGRAM`, `CLIP`, `PODCAST`. Verify by reading the file. **Already supports `PODCAST` and `TIKTOK` — no enum widening needed.**
- `LifestyleItems` has `image_url`, `audio_url`, `episode_url`, `duration_seconds`. **`audio_url` and `episode_url` are NOT present in the current schema and must be added** (see §5).
- `LifestyleItems.duration_seconds` exists already — verify.
- `LifestyleSources.source_type` enum currently includes `RSS`, `BLOG`, `NEWS`, `YOUTUBE_CHANNEL`, `TIKTOK`, `INSTAGRAM`, `MANUAL`. **It does NOT include `PODCAST`. Must be widened** (see §5).
- `LifestyleSources.feed_url` exists. Verify.

HEAD SHA expected: `dd5eec9` (heart codepoint swap). If repo HEAD differs by more than 3 commits, stop and ask.

Live state of the Listen tab on `femwells.com` per Ms Verify's diagnosis (2026-05-13):
- Videos shelf renders 24 items. OK.
- Podcasts chip empty (0 rows with `media_type='PODCAST'`).
- TikTok rail absent (0 rows with `media_type='TIKTOK' AND is_embeddable=true`).
- Sessions chip mixes 28 rows from `ContentItems`: 12 zodiac horoscopes + 5 news articles + 4 fiction episodes + 3 actual audio sessions. **LC-3 handles the Sessions chip cleanup; do NOT touch it in this MP.**

## §2 Goal (one sentence)

Seed ~12 curated UK women's-wellness podcasts into `LifestyleSources` + `LifestyleItems`, fix the TikTok ingest seed write so its rows land with `media_type='TIKTOK'` and `is_embeddable=true`, and add a "Podcasts" shelf above the Videos grid on the Listen tab so the page renders a non-empty Podcasts and TikTok experience.

## §3 Constraints (binding)

- UK English. £. en-GB dates ("14 Jun 1999", "13 May 2026"). No emoji codepoints anywhere.
- Lucide icons + SVG only. Fraunces (display) + Inter (UI). No Playfair, no purple `#C084FC`.
- Plum Night palette applies inside Horoscope only — Listen stays on the cream day-mode palette. Match the existing `TikTokRail.jsx` look for the new `PodcastRail.jsx`.
- Same 5-slot unified bottom nav at mobile + tablet + desktop. Do NOT width-substitute a sidebar at desktop.
- DO NOT touch the Sessions chip filter in this MP — LC-3 removes it entirely. If you accidentally edit `ListenFilterChips.jsx`, leave the Sessions chip alone.
- DO NOT modify `src/Layout.jsx`, `src/pages.config.js`, `src/components/ui/**`.
- No new npm dependencies — RSS parse + sanitisation can lean on the same regex helpers `ingestRSS/entry.ts` already inlines.
- Every podcast row written by the seed MUST have a populated `image_url` (RSS channel artwork or episode-level image). If neither is available, log to `IngestErrorLog` with stage `image_missing` and skip the row rather than write a blank.
- All copy is calm-but-substantive UK voice. New podcast row titles must not contain emoji — strip on write.

## §4 Diff plan (file-by-file)

| Path | Action | One-line description |
|---|---|---|
| `base44/entities/LifestyleSources.jsonc` | EDIT | Widen `source_type` enum to add `PODCAST`; update `type` enum to mirror. |
| `base44/entities/LifestyleItems.jsonc` | EDIT | Add `audio_url`, `episode_url` string fields. |
| `base44/functions/seedPodcasts/entry.ts` | NEW | Seeds 12 podcast `LifestyleSources` rows then ingests ~5 most-recent episodes per source into `LifestyleItems`. |
| `base44/functions/ingestSocial/entry.ts` | EDIT | Remove the hard-skip on `source_type === 'TIKTOK'` (lines 50-60 + 74); route TikTok sources through the social-post write path with `media_type='TIKTOK'`, `is_embeddable=true`, `provider='TIKTOK'`. |
| `src/components/lifestyle/listen/PodcastRail.jsx` | NEW | Mirrors `TikTokRail.jsx`. Renders ~12 podcast cards with artwork + title + duration chip. Tap opens a sheet with in-app mini-player when `audio_url` exists, else deep-link to `episode_url`. |
| `src/components/lifestyle/listen/ListenTab.jsx` | EDIT | Add a `useEffect` to fetch podcast items (12, `-published_at`), pass into a new `<PodcastRail/>` rendered ABOVE the existing `<TikTokRail/>`. |

### §4a New file: `base44/functions/seedPodcasts/entry.ts`

```ts
// seedPodcasts — operator-invoked, one-shot. Seeds 12 curated UK women's-
// wellness-adjacent podcast LifestyleSources rows + ingests ~5 most-recent
// episodes per source into LifestyleItems. Idempotent — re-running skips
// rows whose feed_url + episode guid hash already exists.
//
// Body (admin-only):
//   POST {} — runs the full seed.
//   POST { only_source_name: string } — re-seeds episodes for one source.
// Returns: { ok: true, sources_created, sources_existing, episodes_ingested, episodes_skipped, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Curated list — UK women's-wellness-adjacent. All feeds verified by the operator
// before commit. If a feed 404s at run time the source row stays inactive.
const SEED_PODCASTS = [
  { name: 'Maintenance Phase',                          feed_url: 'https://feeds.buzzsprout.com/1411126.rss',                          category: 'Lifestyle' },
  { name: 'Adam Buxton',                                feed_url: 'https://feeds.acast.com/public/shows/adam-buxton',                  category: 'Culture' },
  { name: 'This Is Dating',                             feed_url: 'https://feeds.simplecast.com/8C7CExJP',                              category: 'Relationships' },
  { name: 'Modern Love',                                feed_url: 'https://feeds.simplecast.com/9LNwlcLU',                              category: 'Relationships' },
  { name: 'Sentimental Garbage',                        feed_url: 'https://feeds.acast.com/public/shows/sentimental-garbage',          category: 'Culture' },
  { name: "You're Wrong About",                         feed_url: 'https://feeds.buzzsprout.com/1112270.rss',                          category: 'Culture' },
  { name: 'Where Should We Begin? with Esther Perel',   feed_url: 'https://feeds.simplecast.com/RZeyV7Lr',                              category: 'Relationships' },
  { name: 'The Hilarious World of Depression',          feed_url: 'https://feeds.megaphone.fm/APMG6873489274',                         category: 'Mental Wellness' },
  { name: 'On Being with Krista Tippett',               feed_url: 'https://onbeing.org/series/podcast/feed/',                          category: 'Mindfulness' },
  { name: 'The High Low',                               feed_url: 'https://feeds.acast.com/public/shows/the-high-low',                 category: 'Culture' },
  { name: 'Slow Burn',                                  feed_url: 'https://feeds.megaphone.fm/slowburn',                               category: 'Culture' },
  { name: 'How To Fail With Elizabeth Day',             feed_url: 'https://feeds.acast.com/public/shows/howtofail',                    category: 'Lifestyle' },
];

// ── Helper: structured ingest error log ────────────────────────────────────
async function logIngestError(base44, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name: 'seedPodcasts',
      stage,
      source_identifier: ctx.source_identifier || '',
      item_id: ctx.item_id || '',
      error_message: e?.message || String(err),
      error_stack: e?.stack || '',
      raw_payload: ctx.raw_payload ? JSON.stringify(ctx.raw_payload).slice(0, 4000) : '',
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch (logErr) {
    console.error('[seedPodcasts log-failed]', logErr?.message);
  }
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function stripHtml(html: string): string {
  return String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Emoji-codepoint scrubber — same regex as feedback_no_emoji_in_femwell.md.
function stripEmoji(s: string): string {
  if (!s) return '';
  return String(s).replace(
    /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
    '',
  ).replace(/\s+/g, ' ').trim();
}

// Pull the first iTunes image / channel image / og:image for a podcast feed.
function parseChannelImage(xml: string): string {
  const itunes = xml.match(/<itunes:image[^>]*href=["']([^"']+)["']/i);
  if (itunes?.[1]) return itunes[1];
  const ch = xml.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i);
  if (ch?.[1]) return ch[1].trim();
  return '';
}

// Parse podcast items — title, description, enclosure (mp3), link, pubDate, image.
function parsePodcastItems(xml: string): Array<any> {
  const items: Array<any> = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '').trim();
    const desc = (block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '').trim();
    const enclosure = block.match(/<enclosure[^>]*url=["']([^"']+)["']/i)?.[1] || '';
    const itunesImage = block.match(/<itunes:image[^>]*href=["']([^"']+)["']/i)?.[1] || '';
    const itunesDuration = (block.match(/<itunes:duration>([\s\S]*?)<\/itunes:duration>/i)?.[1] || '').trim();
    const guid = (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] || link || title).trim();
    if (!title || !link) continue;
    items.push({ title, link, desc, pubDate, enclosure, image: itunesImage, durationLabel: itunesDuration, guid });
  }
  return items;
}

// Parse "HH:MM:SS" or "MM:SS" or seconds-as-string into seconds.
function durationToSeconds(label: string): number {
  if (!label) return 0;
  if (/^\d+$/.test(label)) return parseInt(label, 10);
  const parts = label.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const onlySource: string | undefined = body?.only_source_name;

    const sb = base44.asServiceRole;
    const now = new Date().toISOString();
    let sourcesCreated = 0;
    let sourcesExisting = 0;
    let episodesIngested = 0;
    let episodesSkipped = 0;
    const errors: any[] = [];

    for (const seed of SEED_PODCASTS) {
      if (onlySource && seed.name !== onlySource) continue;

      // 1. Upsert the LifestyleSources row.
      const existing = await sb.entities.LifestyleSources.filter(
        { name: seed.name }, undefined, 1,
      ).catch(() => []);
      let sourceRow = existing[0];
      if (!sourceRow) {
        try {
          sourceRow = await sb.entities.LifestyleSources.create({
            name: seed.name,
            type: 'RSS',
            source_type: 'PODCAST',
            feed_url: seed.feed_url,
            url: seed.feed_url,
            category: seed.category,
            is_active: true,
            enabled: true,
            priority: 5,
            daily_item_cap: 5,
            tags: ['podcast'],
            language: 'en',
            created_at: now,
          });
          sourcesCreated += 1;
        } catch (err) {
          await logIngestError(base44, 'source_create',
            { source_identifier: seed.name, raw_payload: seed }, err);
          errors.push({ source: seed.name, error: 'source_create' });
          continue;
        }
      } else {
        sourcesExisting += 1;
        // If existing row had source_type='RSS' or similar, normalise to PODCAST.
        if (sourceRow.source_type !== 'PODCAST') {
          try {
            await sb.entities.LifestyleSources.update(sourceRow.id, {
              source_type: 'PODCAST',
              tags: Array.from(new Set([...(sourceRow.tags || []), 'podcast'])),
              updated_at: now,
            });
          } catch { /* non-fatal */ }
        }
      }

      // 2. Fetch the feed.
      let xml = '';
      try {
        const res = await fetch(seed.feed_url, {
          headers: { 'User-Agent': 'FemWell/1.0 (+https://femwells.com)' },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        xml = await res.text();
      } catch (err) {
        await logIngestError(base44, 'feed_fetch',
          { source_identifier: seed.name, raw_payload: { feed_url: seed.feed_url } }, err);
        errors.push({ source: seed.name, error: 'feed_fetch' });
        continue;
      }

      const channelImage = parseChannelImage(xml);
      const items = parsePodcastItems(xml).slice(0, 5);

      for (const ep of items) {
        try {
          const hash = simpleHash(ep.guid);
          const dupe = await sb.entities.LifestyleItems.filter(
            { content_url_hash: hash }, undefined, 1,
          ).catch(() => []);
          if (dupe.length > 0) { episodesSkipped += 1; continue; }

          const image = ep.image || channelImage;
          if (!image) {
            await logIngestError(base44, 'image_missing',
              { source_identifier: seed.name, item_id: ep.guid, raw_payload: { title: ep.title } },
              new Error('No image_url for episode and no channel artwork'));
            episodesSkipped += 1;
            continue;
          }

          const seconds = durationToSeconds(ep.durationLabel);

          await sb.entities.LifestyleItems.create({
            source_id: sourceRow.id,
            source_name: seed.name,
            title: stripEmoji(ep.title).slice(0, 220),
            content_url: ep.link,
            content_url_hash: hash,
            summary: stripEmoji(stripHtml(ep.desc)).slice(0, 600),
            image_url: image,
            audio_url: ep.enclosure || '',
            episode_url: ep.link,
            duration_seconds: seconds,
            duration_label: ep.durationLabel || '',
            published_at: (() => { try { return new Date(ep.pubDate).toISOString(); } catch { return now; } })(),
            ingested_at: now,
            category: seed.category,
            media_type: 'PODCAST',
            provider: 'RSS',
            status: 'PUBLISHED',
            tags: ['podcast'],
            created_at: now,
          });
          episodesIngested += 1;
        } catch (err) {
          await logIngestError(base44, 'episode_create',
            { source_identifier: seed.name, item_id: ep.guid, raw_payload: ep }, err);
          errors.push({ source: seed.name, item: ep.title?.slice(0, 60), error: 'episode_create' });
        }
      }
    }

    return Response.json({
      ok: true,
      sources_created: sourcesCreated,
      sources_existing: sourcesExisting,
      episodes_ingested: episodesIngested,
      episodes_skipped: episodesSkipped,
      errors: errors.slice(0, 20),
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});
```

### §4b New file: `src/components/lifestyle/listen/PodcastRail.jsx`

```jsx
import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ExternalLink } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import { getCategoryGradient, attachFallbackOverlay } from '@/utils/imageFallback';

export default function PodcastRail({ items, savedSet, savedPhases, onSave, onUntag }) {
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    if (!openItem) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpenItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openItem]);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        padding: '0 16px',
        marginBottom: 10,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: 'var(--plum-mute)',
        fontFamily: "'Inter', sans-serif",
      }}>
        PODCASTS WE'RE LISTENING TO
      </p>

      <div
        className="lf-scroll"
        style={{
          display: 'flex',
          gap: 12,
          padding: '0 16px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map(item => (
          <PodcastCard
            key={item.id}
            item={item}
            saved={savedSet?.has(item.id)}
            hasPhaseTag={!!(savedPhases?.[item.id])}
            onOpen={() => setOpenItem(item)}
            onSave={onSave}
            onUntag={onUntag}
          />
        ))}
      </div>

      {openItem && (
        <PodcastSheet item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return '';
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}

function PodcastCard({ item, saved, hasPhaseTag, onOpen, onSave, onUntag }) {
  const fallbackBg = getCategoryGradient(item.category);
  const durLabel = formatDuration(item.duration_seconds);
  return (
    <div
      role="article"
      aria-label={`Podcast: ${item.title || ''}`}
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 168,
        height: 220,
        borderRadius: 14,
        boxShadow: 'var(--shadow-card)',
        background: 'var(--cream)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: fallbackBg }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => attachFallbackOverlay(e, item.category)}
          />
        ) : null}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
          color: 'var(--cream)', background: 'rgba(0,0,0,0.45)',
          padding: '3px 6px', borderRadius: 4,
          fontFamily: "'Inter', sans-serif",
        }}>
          PODCAST
        </div>
        <div
          style={{ position: 'absolute', top: 6, right: 6 }}
          onClick={e => e.stopPropagation()}
        >
          <SaveHeartButton
            itemId={item.id}
            size={34}
            iconSize={18}
            saved={saved}
            hasPhaseTag={hasPhaseTag}
            onSave={onSave}
            onUntag={onUntag}
          />
        </div>
        {durLabel && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 10, fontWeight: 600,
            color: 'var(--cream)', background: 'rgba(0,0,0,0.55)',
            padding: '3px 7px', borderRadius: 9999,
            fontFamily: "'Inter', sans-serif",
          }}>
            {durLabel}
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <p style={{
          fontSize: 12.5, fontWeight: 500, color: 'var(--plum-deep)',
          fontFamily: "'Inter', sans-serif",
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.title || ''}
        </p>
        <p style={{
          fontSize: 10.5, color: 'var(--plum-mute)',
          fontFamily: "'Inter', sans-serif",
          margin: '4px 0 0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.source_name || ''}
        </p>
      </div>
    </div>
  );
}

function PodcastSheet({ item, onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'Podcast episode'}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,16,32,0.78)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div style={{
        position: 'relative', width: '100%', maxWidth: 560,
        background: 'var(--cream)', borderRadius: '14px 14px 0 0',
        padding: '20px 20px 24px',
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: 9999,
            background: 'rgba(0,0,0,0.08)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.6px', color: 'var(--plum-mute)', margin: 0,
            }}>
              {item.source_name || 'Podcast'}
            </p>
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 18, fontWeight: 500, color: 'var(--plum-deep)',
              margin: '4px 0 0', lineHeight: 1.3,
            }}>
              {item.title || ''}
            </h3>
          </div>
        </div>
        {item.summary && (
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13.5, lineHeight: 1.55, color: 'var(--plum-mute)',
            margin: '0 0 14px',
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.summary}
          </p>
        )}
        {item.audio_url ? (
          <>
            <button
              type="button"
              onClick={toggle}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', minHeight: 48, borderRadius: 9999,
                background: 'var(--rose-primary)', color: 'white',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
              <span>{playing ? 'Pause' : 'Play episode'}</span>
            </button>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={audioRef} src={item.audio_url} style={{ width: '100%', marginTop: 12 }} controls />
          </>
        ) : item.episode_url ? (
          <a
            href={item.episode_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', minHeight: 48, borderRadius: 9999,
              background: 'var(--rose-primary)', color: 'white',
              textDecoration: 'none',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
            }}
          >
            <ExternalLink size={18} />
            <span>Open episode</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
```

### §4c Edit: `src/components/lifestyle/listen/ListenTab.jsx`

1. Add import at the top, next to existing imports:
   ```js
   import PodcastRail from './PodcastRail';
   ```
2. Add a `useState` near the other state declarations (around the `tikTokItems` declaration, ~line 63):
   ```js
   const [podcastItems, setPodcastItems] = useState([]);
   ```
3. In the existing "On mount: fetch TikTok rail + initial grid in parallel" useEffect (~lines 98-111), expand the Promise.all to also fetch podcasts:
   ```js
   useEffect(() => {
     let cancelled = false;
     (async () => {
       const [tiktoks, podcasts] = await Promise.all([
         base44.entities.LifestyleItems.filter(
           { media_type: 'TIKTOK', is_embeddable: true, status: 'PUBLISHED' },
           '-published_at', 12,
         ).catch(() => []),
         base44.entities.LifestyleItems.filter(
           { media_type: 'PODCAST', status: 'PUBLISHED' },
           '-published_at', 12,
         ).catch(() => []),
       ]);
       if (!cancelled) {
         setTikTokItems(tiktoks || []);
         setPodcastItems(podcasts || []);
       }
     })();
     return () => { cancelled = true; };
   }, []);
   ```
4. In the JSX `return`, render `<PodcastRail/>` ABOVE `<TikTokRail/>`:
   ```jsx
   <div style={{ marginTop: 16 }}>
     <PodcastRail
       items={podcastItems}
       savedSet={savedSet}
       savedPhases={savedPhases}
       onSave={handleSave}
       onUntag={handleUntag}
     />

     <TikTokRail
       items={tikTokItems}
       savedSet={savedSet}
       savedPhases={savedPhases}
       onSave={handleSave}
       onUntag={handleUntag}
     />

     <ListenGrid ... />
   </div>
   ```

### §4d Edit: `base44/functions/ingestSocial/entry.ts`

Locate the TikTok hard-skip block (lines 50-60) and the per-source skip (line 74). Replace the hard-skip block with a TikTok-write-path branch:

Replace lines 50-60:
```ts
// MP-Phase1+2: TikTok deferred to Listen MP (portrait UI). Instagram permanently
// dropped (Meta oembed deprecated April 2025). Existing items stay in DB.
if (sourceType === 'TIKTOK' || sourceType === 'INSTAGRAM') {
  return Response.json({
    ingested: 0,
    skipped: 0,
    sources: 0,
    deferred: true,
    reason: sourceType === 'TIKTOK'
      ? 'TikTok ingest deferred to Listen MP'
      : 'Instagram ingest permanently disabled (Meta oembed deprecated)',
  });
}
```
With:
```ts
// LC-1: TikTok seed is now active. Instagram remains permanently disabled.
if (sourceType === 'INSTAGRAM') {
  return Response.json({
    ingested: 0,
    skipped: 0,
    sources: 0,
    deferred: true,
    reason: 'Instagram ingest permanently disabled (Meta oembed deprecated)',
  });
}
```

Replace the per-source guard at line 74:
```ts
const t = source.source_type || source.type;
if (t === 'TIKTOK' || t === 'INSTAGRAM') continue;
```
With:
```ts
const t = source.source_type || source.type;
if (t === 'INSTAGRAM') continue;
```

Inside the per-post write at ~line 96, when `t === 'TIKTOK'`, pass `media_type: 'TIKTOK'`, `provider: 'TIKTOK'`, `is_embeddable: true`. Specifically, edit the `LifestyleItems.create({...})` call to use a media_type expression instead of the (missing) hardcoded value:

```ts
await base44.asServiceRole.entities.LifestyleItems.create({
  source_id: source.id,
  source_name: source.name,
  source_logo_url: source.logo_url || '',
  title: stripEmoji((source.name || 'Post')).slice(0, 200), // LC-1: emoji strip
  content_url: postUrl,
  content_url_hash: hash,
  image_url: '', // operator can backfill via og:image later
  category: source.category || 'Lifestyle',
  media_type: t === 'TIKTOK' ? 'TIKTOK' : 'ARTICLE',
  provider: t === 'TIKTOK' ? 'TIKTOK' : 'BLOG',
  is_embeddable: t === 'TIKTOK',
  status: 'PUBLISHED',
  tags: Array.isArray(source.tags) ? source.tags : [],
  published_at: new Date().toISOString(),
  ingested_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
});
```

Add a top-of-file helper (after `simpleHash`):
```ts
function stripEmoji(s) {
  if (!s) return '';
  return String(s).replace(
    /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu,
    '',
  ).replace(/\s+/g, ' ').trim();
}
```

After the source loop, return:
```ts
return Response.json({ ingested, skipped, sources: sources.length, errors: errors.slice(0, 10) });
```

## §5 Schema changes

### `base44/entities/LifestyleSources.jsonc`

Add `PODCAST` to BOTH `type` and `source_type` enums:

```jsonc
"type": {
  "type": "string",
  "enum": [
    "RSS",
    "BLOG",
    "NEWS",
    "YOUTUBE_CHANNEL",
    "TIKTOK",
    "INSTAGRAM",
    "PODCAST"
  ],
  "default": "RSS"
},
...
"source_type": {
  "type": "string",
  "enum": [
    "RSS",
    "BLOG",
    "NEWS",
    "YOUTUBE_CHANNEL",
    "TIKTOK",
    "INSTAGRAM",
    "PODCAST",
    "MANUAL"
  ],
  "default": "RSS"
},
```

### `base44/entities/LifestyleItems.jsonc`

Add two new optional string fields, AFTER the existing `image_url` field, BEFORE `category`:

```jsonc
"audio_url": {
  "type": "string",
  "description": "Direct media URL for podcast/audio playback (RSS <enclosure>). Optional."
},
"episode_url": {
  "type": "string",
  "description": "Canonical web URL for the episode (podcast item <link>). Optional."
},
```

No required-array changes. No RLS changes.

## §6 LLM prompt changes

None. This MP touches no LLM-using function.

## §7 Visual acceptance test (per viewport)

Operator must switch device toggle to each preset and walk femwells.com/Lifestyle?tab=listen.

- **Mobile (toggle → Mobile, ~380px):** Listen tab renders, eyebrow `PODCASTS WE'RE LISTENING TO` visible, ≥10 podcast cards in a horizontally-scrolling rail above `TRENDING ON TIKTOK`. Each podcast card shows artwork (square), `PODCAST` pill top-left, save heart top-right, duration chip bottom-right (when known), title (2 lines max) + source name underneath. Tap a card — bottom sheet opens with artwork + source + title + summary + a Play button or external link. TikTok rail renders below podcasts with ≥6 cards.
- **Tablet (toggle → Tablet, ~768px):** Same content, rail width-constrained to ~600-720px wrapper, no horizontal page scroll. Bottom nav remains the 5-slot mobile pattern.
- **Desktop (toggle → Desktop, ~1280px):** Same — width-constrained centred column, NO sidebar substitution. Cards stay 168px wide; rail scroll-snap works with mouse drag.

Brand checks:
- No emoji codepoints anywhere on the rendered cards (Listen tab DOM grep returns 0 hits in the `[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}…]` range).
- No Playfair font. No `#C084FC`. Fraunces used only for sheet title; Inter for chip + body.
- Save heart wires through the same `handleSave` as the rest of the tab — saved state persists after refresh.

## §8 Success criteria (falsifiable)

- After invoking `seedPodcasts` once, response shape `{ ok: true, sources_created: 12, sources_existing: 0, episodes_ingested: >= 30, episodes_skipped: 0, errors: [] }` — or, on second invocation, `sources_existing: 12, episodes_skipped: >= 30`.
- `LifestyleSources.filter({ source_type: 'PODCAST' })` returns 12 rows.
- `LifestyleItems.filter({ media_type: 'PODCAST', status: 'PUBLISHED' })` returns ≥ 30 rows.
- Every podcast row has a non-empty `image_url` and `published_at` (otherwise it was rejected at `image_missing` log).
- After invoking `ingestSocial` with body `{ source_type: 'TIKTOK' }` (provided TikTok LifestyleSources rows exist), at least 1 new `LifestyleItems` row with `media_type='TIKTOK', is_embeddable=true, provider='TIKTOK'` lands.
- `PodcastRail` returns null when `podcastItems.length === 0` (graceful empty state, no broken eyebrow).

## §9 Risks + mitigations

1. **Feed URLs in §4a may 404 or redirect at run time.** Mitigation: each fetch is wrapped in try/catch + writes `feed_fetch` to `IngestErrorLog`; the next 11 sources still seed. Operator can re-run with `{ only_source_name: '...' }` after fixing a URL.
2. **Some podcasts may not provide an `<enclosure>` mp3 url.** Mitigation: `audio_url` is optional. When absent, the sheet falls through to `<a href={episode_url}>` deep-link — never a dead button.
3. **TikTok source rows in `LifestyleSources` may already have `media_type` written as something other than `TIKTOK`** at the row level. Mitigation: per-create branch reads `source.source_type` at write time; we don't trust stale per-row `media_type`.
4. **Adding new `LifestyleItems` columns (`audio_url`, `episode_url`) means existing rows have them undefined.** Mitigation: both fields are optional + read with `||` fallback in the UI; legacy podcast rows (none exist as of LC-1 because seeding is fresh) won't render the player but will deep-link.
5. **`feed_url` field has comma-split semantics in `ingestSocial/entry.ts` line 76** (`source.feed_url.split(',')`). Mitigation: when seeding podcast sources we write a single URL per row — `split(',')` returns a 1-element array, no harm. Documented for the next maintainer.

## §10 Rollback

If the seed produces broken rows: in Dashboard → Data → `LifestyleItems`, filter `media_type=PODCAST AND created_at >= <seed timestamp>`, select all, Delete. Then in `LifestyleSources` filter `source_type=PODCAST AND created_at >= <seed timestamp>` and delete. If the function itself misbehaves, click `Revert` on the assistant message in the chat panel — this reverts the four code edits + schema additions in one snapshot. To rollback schema only: in `base44/entities/LifestyleSources.jsonc` remove `PODCAST` from both enums and in `base44/entities/LifestyleItems.jsonc` remove the two new fields; commit + sync. Existing rows keep the extra fields harmlessly.

## §11 Sequence

LC-1 is the first MP in the 2026-05-13 Lifestyle closeout series. Run order:
1. **LC-1 (this MP)** — Podcast + TikTok seed + Listen UI.
2. **LC-2** — Atelier AI-final auto-publish (independent; can run in parallel).
3. **LC-3** — Remove Sessions chip + migrate audio rows to a Practice shelf below the Podcasts shelf this MP creates.
4. **LC-4** — Strip emoji from existing TikTok rows (depends on LC-1 having seeded the rows that will be cleaned).
5. **LC-5** — Closeout sweep (Spotify URLs + image_url backfill + Verify walks). Sections A and C are direct-operator work, Section B is the only base44 paste.

Done signal for LC-1: open `femwells.com/Lifestyle?tab=listen` on mobile + tablet + desktop. Both Podcasts and TikTok rails non-empty; tap a podcast card → sheet opens with a Play button or external link. Take three screenshots (one per viewport) to `workspace/walk_lc1_20260513/`.
