// ─────────────────────────────────────────────────────────────────────────────
// ExternalPodcastsRail — curated women's health / wellness podcasts that
// link OUT to Apple Podcasts, Spotify, YouTube, and Pocket Casts.
//
// 2026-05-18 — added alongside the existing PodcastRail (which keeps its
// in-app player behaviour, unchanged). These cards are visually distinct so
// users know they're being handed off to another app: small "Listen externally"
// badge top-right, and a row of platform icon buttons in the card body.
//
// Platform availability is per-podcast. We only ever render buttons for
// platforms the show is actually on AND that work on the current device:
//
//   apple       → iOS only. Hidden on Android and web (Apple Podcasts
//                 has no web player and no Android app).
//   spotify     → all devices (native apps + web player).
//   youtube     → all devices.
//   pocketcasts → all devices (iOS app, Android app, web player at pca.st).
//
// If after device filtering a card has zero working platforms (e.g. an
// Apple-only show viewed on Android), we skip the card entirely rather
// than rendering a dead end.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

// Inline platform glyphs (no emoji per brand rule).
function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
function SpotifyGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12C24 5.4 18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.36 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
function YouTubeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
function PocketCastsGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.2A7.2 7.2 0 0 1 4.8 12h2.4A4.8 4.8 0 1 0 12 7.2V4.8A7.2 7.2 0 0 1 12 19.2z"/>
    </svg>
  );
}

const PLATFORM_META = {
  apple:       { colour: '#9933CC', label: 'Apple Podcasts', Glyph: AppleGlyph,       devices: ['ios'] },
  spotify:     { colour: '#1DB954', label: 'Spotify',        Glyph: SpotifyGlyph,     devices: ['ios', 'android', 'web'] },
  youtube:     { colour: '#FF0000', label: 'YouTube',        Glyph: YouTubeGlyph,     devices: ['ios', 'android', 'web'] },
  pocketcasts: { colour: '#F43E37', label: 'Pocket Casts',   Glyph: PocketCastsGlyph, devices: ['ios', 'android', 'web'] },
};

// Curated for FemWell's UK women's-wellness audience. The `platforms`
// object lists only the platforms each show is actually on. If a platform
// isn't listed, no button is rendered for it.
const EXTERNAL_PODCASTS = [
  {
    id: 'ext-huberman-hormones',
    show: 'Huberman Lab',
    title: 'Female reproductive health, cycle hormones, and longevity',
    summary:
      'Stanford neuroscientist Andrew Huberman breaks down menstrual cycle hormones, peri-menopause, perimenopausal sleep, and protocols to support long-term hormonal health.',
    artwork: 'https://images.unsplash.com/photo-1559717865-a99cac1c95d8?w=400',
    duration: '2h 14min',
    platforms: {
      apple:       'https://podcasts.apple.com/gb/podcast/huberman-lab/id1545953110',
      spotify:     'https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Oy0P',
      youtube:     'https://www.youtube.com/@hubermanlab',
      pocketcasts: 'https://pca.st/podcast/4cd76b00-d4b2-013a-da0d-0acc26574db2',
    },
  },
  {
    id: 'ext-foundmyfitness',
    show: 'FoundMyFitness',
    title: 'Cycle health, micronutrients, and women-specific longevity',
    summary:
      'Dr Rhonda Patrick on omega-3s, magnesium, micronutrient gaps women miss, and how lifestyle factors interact with menstrual and reproductive health.',
    artwork: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
    duration: '1h 50min',
    platforms: {
      apple:       'https://podcasts.apple.com/gb/podcast/the-foundmyfitness-podcast/id818198322',
      spotify:     'https://open.spotify.com/show/2pHM2KQjm0g8tZyJOlrZbS',
      youtube:     'https://www.youtube.com/@FoundMyFitness',
      pocketcasts: 'https://pca.st/podcast/foundmyfitness',
    },
  },
  {
    id: 'ext-melrobbins',
    show: 'The Mel Robbins Podcast',
    title: 'Perimenopause, brain fog, and what no one tells women in their 40s',
    summary:
      'Mel Robbins interviews leading women\'s health experts on perimenopause symptoms, HRT, the science of female brain changes, and reclaiming energy mid-life.',
    artwork: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400',
    duration: '1h 20min',
    platforms: {
      apple:       'https://podcasts.apple.com/gb/podcast/the-mel-robbins-podcast/id1646101002',
      spotify:     'https://open.spotify.com/show/3oCM3Zg0VeIefVZBxxbI4l',
      youtube:     'https://www.youtube.com/@melrobbins',
      pocketcasts: 'https://pca.st/podcast/the-mel-robbins-podcast',
    },
  },
  {
    id: 'ext-doctorsfarmacy-women',
    show: "The Doctor's Farmacy",
    title: 'Hormone balance, gut-brain axis, and functional medicine for women',
    summary:
      'Dr Mark Hyman on root-cause approaches to women\'s health — thyroid, PCOS, fertility, peri-menopause and the gut-hormone connection.',
    artwork: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    duration: '1h 35min',
    platforms: {
      apple:       'https://podcasts.apple.com/gb/podcast/the-doctors-farmacy-with-mark-hyman-m-d/id1382804627',
      spotify:     'https://open.spotify.com/show/3SwoCeJrjMnXKwY9bjVNgI',
      youtube:     'https://www.youtube.com/@drmarkhyman',
      pocketcasts: 'https://pca.st/podcast/the-doctors-farmacy',
    },
  },
  {
    id: 'ext-model-health',
    show: 'The Model Health Show',
    title: 'Cycle nutrition, women\'s strength training, and sleep across the month',
    summary:
      'Shawn Stevenson dives into how women\'s nutrient needs and training intensity should shift through each cycle phase, with practical protocols.',
    artwork: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    duration: '1h 12min',
    platforms: {
      apple:       'https://podcasts.apple.com/gb/podcast/the-model-health-show/id640246578',
      spotify:     'https://open.spotify.com/show/0wYvONNeIpYDg6myDh3DOH',
      youtube:     'https://www.youtube.com/@ShawnModel',
      pocketcasts: 'https://pca.st/podcast/the-model-health-show',
    },
  },
  {
    id: 'ext-hormone-solution',
    show: 'The Dr. Mary Claire Podcast',
    title: 'The new menopause: HRT, body composition, and brain health',
    summary:
      'Dr Mary Claire Haver — author of The New Menopause — on what every woman should know about hormonal change starting in her 30s, written for the long game.',
    artwork: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400',
    duration: '55 min',
    // Only the platforms with confirmed direct show URLs. Previously had
    // Spotify and Pocket Casts pointing at search pages — removed to avoid
    // dead-feeling links.
    platforms: {
      apple:   'https://podcasts.apple.com/gb/podcast/the-dr-mary-claire-podcast/id1719829834',
      youtube: 'https://www.youtube.com/@DrMaryClaireHaver',
    },
  },
];

// Detect device class once on mount. Falls back to "web" for desktop
// browsers and anything that doesn't match iOS or Android. Run inside
// useEffect so SSR-style early renders don't crash on missing
// `navigator`.
function detectOS() {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'web';
}

// Returns the subset of `platforms` keys that (a) are in the
// PLATFORM_META allowlist and (b) include `os` in their devices list.
function visiblePlatformKeys(platforms, os) {
  if (!platforms) return [];
  return Object.keys(platforms).filter((key) => {
    const meta = PLATFORM_META[key];
    if (!meta) return false;
    if (!platforms[key]) return false;
    return meta.devices.includes(os);
  });
}

function PlatformButton({ platform, url }) {
  const meta = PLATFORM_META[platform];
  if (!meta) return null;
  const { colour, label, Glyph } = meta;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={`Open in ${label}`}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 9999,
        background: `${colour}14`,
        color: colour,
        border: `1px solid ${colour}55`,
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'transform 0.15s ease, background 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = `${colour}22`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.background = `${colour}14`; }}
      onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.94)'; }}
      onTouchEnd={(e)   => { e.currentTarget.style.transform = 'scale(1)';    }}
    >
      <Glyph />
    </a>
  );
}

function ExternalPodcastCard({ ep, os }) {
  const keys = visiblePlatformKeys(ep.platforms, os);
  // Guard: if zero compatible platforms after device filtering, skip the
  // card entirely (handled by the parent).
  if (keys.length === 0) return null;
  return (
    <article style={{
      flex: '0 0 320px',
      scrollSnapAlign: 'start',
      background: 'var(--cream, #F4EDDB)',
      borderRadius: 14,
      boxShadow: 'var(--shadow-card, 0 2px 8px rgba(58,44,26,0.10))',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Artwork */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(58,44,26,0.08)' }}>
        {ep.artwork && (
          <img
            src={ep.artwork}
            alt=""
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div style={{
          position: 'absolute',
          top: 8, right: 8,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 9999,
          background: 'rgba(20,16,32,0.78)', color: 'var(--cream, #F4EDDB)',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <ExternalLink size={10} />
          Listen externally
        </div>
        <div style={{
          position: 'absolute',
          bottom: 8, left: 8,
          padding: '3px 9px', borderRadius: 9999,
          background: 'rgba(20,16,32,0.55)', color: 'var(--cream, #F4EDDB)',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>
          PODCAST · {ep.duration}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--plum-mute, #8a7768)', margin: 0,
        }}>{ep.show}</p>
        <h3 style={{
          fontSize: 17, fontWeight: 500, color: 'var(--plum-deep, #3A2C1A)',
          lineHeight: 1.25, margin: 0,
        }}>{ep.title}</h3>
        <p style={{
          fontSize: 12.5, color: 'var(--plum, #4A2A3A)',
          lineHeight: 1.5, margin: 0,
        }}>{ep.summary}</p>

        {/* Platform icon row — icon-only buttons, no text labels */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 8,
        }}>
          {keys.map((key) => (
            <PlatformButton key={key} platform={key} url={ep.platforms[key]} />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ExternalPodcastsRail() {
  const [os, setOs] = useState('web');
  useEffect(() => { setOs(detectOS()); }, []);

  // Apply device filtering once per render: cards with zero compatible
  // platforms (e.g. an Apple-only show on Android) are hidden entirely
  // rather than rendered with no working buttons.
  const visible = EXTERNAL_PODCASTS.filter((ep) => visiblePlatformKeys(ep.platforms, os).length > 0);
  if (visible.length === 0) return null;

  return (
    <section style={{ marginTop: 24, marginBottom: 24 }} aria-label="External podcasts">
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--plum-mute, #8a7768)', margin: 0,
        }}>EXTERNAL PODCASTS · LISTEN IN YOUR APP</p>
        <p style={{
          fontSize: 22, fontWeight: 500, color: 'var(--plum-deep, #3A2C1A)',
          letterSpacing: '-0.01em', margin: '4px 0 4px',
        }}>Women&apos;s health shows we love</p>
        <p style={{
          fontSize: 12.5, color: 'var(--plum-mute, #8a7768)',
          margin: 0,
        }}>Tap a platform icon to open the show in your app.</p>
      </div>
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        padding: '4px 16px 8px',
      }}>
        {visible.map((ep) => (
          <ExternalPodcastCard key={ep.id} ep={ep} os={os} />
        ))}
      </div>
    </section>
  );
}
