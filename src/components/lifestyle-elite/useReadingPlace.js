import { useCallback, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { readOwnedPlace, readingRevision, writeOwnedPlace } from '@/lib/lifestyleReadingPlace';

// The same paragraph coordinate works in the in-place folio and routed reader.
// Device storage remains the offline fallback. No timer writes while idle.
export default function useReadingPlace({ itemId, content, active, containerRef, ownable = true, knownOwnerId = null }) {
  const saveRef = useRef(async () => false);
  useEffect(() => {
    if (!active || !itemId || !content) { saveRef.current = async () => false; return; }
    const revision = readingRevision(content);
    let key = null;
    const scroller = containerRef?.current || window;
    const root = containerRef?.current || document;
    const elements = () => [...root.querySelectorAll('[data-fw-reading-paragraph]')];
    const scrollTop = () => scroller === window ? window.scrollY : scroller.scrollTop;
    const viewportTop = () => scroller === window ? 0 : scroller.getBoundingClientRect().top;
    let suppressScrollUntil = 0;
    const goTo = (index, y = 0) => {
      suppressScrollUntil = Date.now() + 350;
      const target = elements().find(el => Number(el.dataset.fwReadingParagraph) === index);
      if (target) {
        const next = target.getBoundingClientRect().top - viewportTop() + scrollTop() - 78;
        if (scroller === window) window.scrollTo(0, Math.max(0, next)); else scroller.scrollTop = Math.max(0, next);
      } else if (y > 40) {
        if (scroller === window) window.scrollTo(0, y); else scroller.scrollTop = y;
      }
    };
    let local = null;
    let disposed = false, ready = false, moved = false, owner = null;
    let lastIndex = -1, writtenIndex = -1, localTimer = null, remoteTimer = null;
    let writeChain = Promise.resolve();
    let frame = null;
    const persistLocal = async () => {
      if (localTimer) clearTimeout(localTimer);
      localTimer = null;
      if (!key || lastIndex < 0 || scrollTop() <= 40) return;
      try {
        try { if ((await base44.auth.me())?.id !== owner) return; }
        catch { if (knownOwnerId !== owner) return; }
        localStorage.setItem(key, JSON.stringify({ paragraphIndex: lastIndex, revision, scrollY: Math.round(scrollTop()), ts: Date.now() }));
      }
      catch { /* device storage unavailable */ }
    };
    const persistRemote = () => {
      if (remoteTimer) clearTimeout(remoteTimer);
      remoteTimer = null;
      const next = lastIndex;
      if (!owner || next < 1 || next === writtenIndex || !ownable) return writeChain;
      writeChain = writeChain.catch(() => {}).then(async () => {
        const saved = await writeOwnedPlace({ owner, itemId, revision, paragraphIndex: next });
        if (saved) writtenIndex = next;
        return saved;
      }).catch(() => null);
      return writeChain;
    };
    const markUserGesture = () => { moved = true; };
    const onScroll = () => {
      if (!ready || Date.now() < suppressScrollUntil) return;
      const visible = elements().filter(el => el.getBoundingClientRect().top <= viewportTop() + 130);
      const index = Number(visible.at(-1)?.dataset.fwReadingParagraph);
      if (!Number.isSafeInteger(index) || index < 0 || index === lastIndex) return;
      lastIndex = index;
      if (localTimer) clearTimeout(localTimer);
      localTimer = setTimeout(persistLocal, 500);
      if (!remoteTimer) remoteTimer = setTimeout(persistRemote, 20000);
    };
    const flush = () => { persistLocal(); return persistRemote(); };
    // An in-app exit can await the actual owner write. A document unload cannot
    // reliably await fetch, so it still gets the owner-scoped device fallback.
    saveRef.current = async () => {
      await persistLocal();
      return !!(await persistRemote());
    };
    const onHidden = () => { if (document.visibilityState === 'hidden') flush(); };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    for (const event of ['pointerdown','touchstart','wheel','keydown']) scroller.addEventListener(event, markUserGesture, { passive: true });
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHidden);
    (async () => {
      try {
        let current = null;
        try { current = await base44.auth.me(); }
        catch { if (knownOwnerId) current = { id: knownOwnerId }; }
        if (disposed || !current?.id) return;
        owner = current.id;
        key = `fw_article_pos_v2_${encodeURIComponent(owner)}__${encodeURIComponent(itemId)}`;
        try { local = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* damaged owner-scoped coordinate */ }
        await new Promise(resolve => { frame = requestAnimationFrame(() => {
          if (!disposed && !moved) goTo(local?.revision === revision ? Number(local.paragraphIndex) : -1, Number(local?.scrollY) || 0);
          ready = true; resolve();
        });
        });
        if (disposed) return;
        if (!ownable || (await base44.auth.me().catch(() => null))?.id !== owner) return;
        const remote = await readOwnedPlace(owner, itemId, revision);
        if (disposed || !remote) return;
        writtenIndex = remote.paragraph_index;
        const localTime = Number(local?.ts) || 0;
        if (!moved && Date.parse(remote.updated_at || '') > localTime) {
          goTo(remote.paragraph_index);
          lastIndex = remote.paragraph_index;
        }
      } catch { /* offline/account read failure: keep device coordinate */ }
    })();
    return () => {
      saveRef.current = async () => false;
      disposed = true; flush();
      if (frame != null) cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
      for (const event of ['pointerdown','touchstart','wheel','keydown']) scroller.removeEventListener(event, markUserGesture);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [itemId, content, active, containerRef, ownable, knownOwnerId]);
  return useCallback(() => saveRef.current(), []);
}
