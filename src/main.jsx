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
      if (sessionStorage.getItem('fw_build_reloaded') === '1') return;
      try {
        const html = await fetch('/', { cache: 'no-store' }).then((r) => (r.ok ? r.text() : ''));
        const latest = html.match(/index-[A-Za-z0-9_-]+\.js/)?.[0];
        if (latest && latest !== running) {
          sessionStorage.setItem('fw_build_reloaded', '1');
          location.reload();
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
