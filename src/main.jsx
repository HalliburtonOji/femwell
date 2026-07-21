import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ── SW-free "you're on an old build" guard ───────────────────────────────────
// There is no service worker. index.html is served fresh (Cloudflare DYNAMIC) and the
// bundles are content-hashed, so a stale client only needs to NOTICE a newer bundle and
// reload once. Installed PWAs otherwise cling to the cached start page across deploys.
// This re-fetches index.html (no-store) on load and whenever a backgrounded PWA returns
// to the foreground; if it references a different bundle than the one running, it reloads
// ONCE per session (sessionStorage-guarded → can never loop).
;(function liveBuildGuard() {
  try {
    const running = ([...document.querySelectorAll('script[src]')]
      .map((x) => x.src).find((x) => /\/assets\/index-[A-Za-z0-9_-]+\.js/.test(x)) || '')
      .match(/index-[A-Za-z0-9_-]+\.js/)?.[0];
    if (!running) return; // dev (unhashed entry) — nothing to guard
    const check = async () => {
      try {
        const html = await fetch('/', { cache: 'no-store' }).then((r) => (r.ok ? r.text() : ''));
        const latest = html.match(/index-[A-Za-z0-9_-]+\.js/)?.[0];
        // Guard PER-HASH, not once-per-session: two deploys in one session each get picked up,
        // and we can never loop because after reloading for `latest`, running === latest.
        const already = sessionStorage.getItem('fw_build_reloaded_hash');
        if (latest && latest !== running && already !== latest) {
          sessionStorage.setItem('fw_build_reloaded_hash', latest);
          // NOT a plain location.reload() — that re-reads index.html from the browser's
          // heuristic cache (it ships with NO Cache-Control) and can serve the SAME stale
          // HTML → the old bundle again → stuck forever (the exact "nothing changes" bug).
          // A per-build query param gives the document a fresh cache key, forcing a real
          // network fetch of the new index.html. It self-replaces each deploy (never
          // accumulates) and `replace` adds no history entry.
          const hash = latest.match(/index-([A-Za-z0-9_-]+)\.js/)?.[1] || String(Date.now());
          try {
            const u = new URL(location.href);
            u.searchParams.set('b', hash);
            location.replace(u.toString());
          } catch { location.reload(); }
        }
      } catch { /* offline — ignore */ }
    };
    setTimeout(check, 4000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  } catch { /* never let the guard break boot */ }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
