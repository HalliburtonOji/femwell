// podcastLinks — derive deep-link URLs to the three target podcast apps for a
// given show + episode. Used by PodcastListenSheet (Phase 1) and later by
// the "open in your app" affordance inside PodcastPlayer (Phase 2).
//
// Returns an object with up to three URL strings + a `primary` / `fallback`
// pair derived from localStorage preference. Any field can be null if we
// don't have the data needed to build it.

let Buffer;
try {
  Buffer = require('buffer').Buffer;
} catch {
  // Browser environment — Buffer undefined is handled in base64UrlSafe
}

const STORAGE_KEY = 'fw_podcast_preferred_app';
const VALID_PREFS = ['spotify', 'apple', 'pocketCasts'];

// Base64URL-safe encoder for pod.link IDs.
//   - Standard base64, then strip padding + swap +/= for -_ (web-safe).
//   - pod.link supports both forms but the safe form survives URL builders.
function base64UrlSafe(input) {
  if (typeof input !== 'string' || !input) return '';
  // btoa handles ASCII; podcast feed URLs are ASCII so this is safe.
  // Fallback for non-browser (SSR) environments via Buffer.
  const b64 = typeof btoa === 'function'
    ? btoa(input)
    : (typeof Buffer !== 'undefined' ? Buffer.from(input, 'utf8').toString('base64') : '');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function spotifyUrl(feedUrl) {
  if (!feedUrl) return null;
  const id = base64UrlSafe(feedUrl);
  if (!id) return null;
  // pod.link's /spotify suffix sends users straight to the show in Spotify
  // (web or app via Universal Link) if it's available there; otherwise it
  // shows pod.link's own picker as a graceful fallback. No Spotify dev app
  // registration required — revisit when we register (Halli decision 2).
  return `https://pod.link/${id}/spotify`;
}

function appleUrl(applePodcastsCollectionId) {
  const id = String(applePodcastsCollectionId || '').trim();
  if (!id) return null;
  // gb locale matches our UK-first audience. The locale segment is optional
  // — Apple redirects to user's region — but stating gb avoids a redirect.
  return `https://podcasts.apple.com/gb/podcast/id${id}`;
}

function pocketCastsUrl(feedUrl, { native = true } = {}) {
  if (!feedUrl) return null;
  if (native) {
    // pktc:// scheme opens the Pocket Casts app if installed. Strip protocol
    // per Pocket Casts subscribe spec (https://support.pocketcasts.com).
    return `pktc://subscribe/${feedUrl.replace(/^https?:\/\//, '')}`;
  }
  // Web fallback — pca.st handles import via query param.
  return `https://pca.st/import/${encodeURIComponent(feedUrl)}`;
}

/**
 * Build all three target URLs.
 *
 * @param {Object}  opts
 * @param {string}  opts.feedUrl                 RSS feed URL. Required for Spotify (via pod.link) + Pocket Casts.
 * @param {string=} opts.applePodcastsCollectionId  iTunes collectionId. Required for Apple Podcasts link.
 * @returns {{ spotify: string|null, apple: string|null, pocketCasts: string|null, pocketCastsWeb: string|null }}
 */
export function derivePodcastLinks({ feedUrl, applePodcastsCollectionId } = {}) {
  return {
    spotify: spotifyUrl(feedUrl),
    apple: appleUrl(applePodcastsCollectionId),
    pocketCasts: pocketCastsUrl(feedUrl, { native: true }),
    pocketCastsWeb: pocketCastsUrl(feedUrl, { native: false }),
  };
}

/** Read the user's last-chosen app, if any. Returns null when no preference. */
export function getPreferredPodcastApp() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const v = localStorage.getItem(STORAGE_KEY);
    return VALID_PREFS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

/** Persist the user's choice. Silently no-ops on invalid input or storage failure. */
export function setPreferredPodcastApp(app) {
  if (!VALID_PREFS.includes(app)) return;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, app);
  } catch { /* ignore */ }
}

/** Forget the persisted preference (used by the "change app" affordance). */
export function clearPreferredPodcastApp() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}