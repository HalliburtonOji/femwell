import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// -- Inlined helper: structured ingest error log (matches Phase 1+2 pattern) --
async function logIngestError(base44, function_name, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name,
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
    console.error(`[ingest-error-log-failed] ${function_name} ${stage}`, logErr?.message);
  }
  console.error(`[ingest-error] ${function_name} ${stage}`, err?.message || err);
}

async function runPhase(base44, name, fnName, body) {
  const startedAt = new Date().toISOString();
  try {
    const result = await base44.asServiceRole.functions.invoke(fnName, body || {});
    await logIngestError(base44, 'pipelineOrchestrator', `phase:${name}:ok`,
      { source_identifier: fnName, raw_payload: { startedAt, result: result?.data || result } },
      new Error(`phase ok: ${name}`));
    return { ok: true, result };
  } catch (err) {
    await logIngestError(base44, 'pipelineOrchestrator', `phase:${name}:fail`,
      { source_identifier: fnName, raw_payload: { startedAt } }, err);
    return { ok: false, err: err?.message || String(err) };
  }
}

// ── Inlined og:image extraction (mirrors extractOgImage util + ingestRSS inline pattern) ──
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function isPlausibleImageUrl(url) {
  if (!url || url.length < 12) return false;
  const lower = url.toLowerCase();
  if (lower.includes('1x1')) return false;
  if (lower.includes('pixel')) return false;
  if (lower.includes('blank')) return false;
  if (lower.includes('transparent')) return false;
  if (lower.endsWith('.svg')) return false;
  return true;
}

function resolveUrl(candidate, baseUrl) {
  try {
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (/^\/\//.test(candidate)) {
      const proto = new URL(baseUrl).protocol;
      return `${proto}${candidate}`;
    }
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseOgImageFromHtml(html, baseUrl) {
  if (!html || typeof html !== 'string') return null;
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const haystack = headMatch ? headMatch[0] : html.slice(0, 200000);
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:url["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image:src["']/i,
  ];
  for (const re of patterns) {
    const m = haystack.match(re);
    if (m && m[1]) {
      const candidate = m[1].trim();
      const resolved = resolveUrl(candidate, baseUrl);
      if (resolved && isPlausibleImageUrl(resolved)) return resolved;
    }
  }
  return null;
}

async function fetchOgImage(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return parseOgImageFromHtml(html, res.url || url);
  } catch {
    return null;
  }
}

function needsOgBackfill(item) {
  if (!item?.content_url) return false;
  const img = (item.image_url || '').toLowerCase();
  if (!img) return true;
  if (img.includes('images.unsplash.com')) return true;
  if (img.includes('source.unsplash.com')) return true;
  return false;
}

// ── Inlined free-image finder (mirrors findFreeImage/entry.ts) ─────────────
// Inlined rather than sub-invoked, matching the og:image backfill pattern
// above. Targets FemWell-generated items (content_url empty) which can't be
// served by og:image extraction.
function isQualityImageUrl(url) {
  if (!url || typeof url !== 'string' || url.length < 12) return false;
  const lower = url.toLowerCase();
  if (lower.includes('1x1')) return false;
  if (lower.includes('pixel')) return false;
  if (lower.includes('blank')) return false;
  if (lower.includes('placeholder')) return false;
  if (lower.includes('default')) return false;
  if (lower.includes('transparent')) return false;
  if (lower.includes('_alpha')) return false;
  if (lower.endsWith('.svg')) return false;
  if (lower.endsWith('.svg.png')) return false;
  if (/\/(icon|symbol|logo|flag|coat[_-]of[_-]arms)/i.test(url)) return false;
  return true;
}

function buildTopicCandidates(input) {
  const out = [];
  const seen = new Set();
  const add = (raw) => {
    if (!raw || typeof raw !== 'string') return;
    const cleaned = raw.trim();
    if (!cleaned) return;
    if (seen.has(cleaned.toLowerCase())) return;
    seen.add(cleaned.toLowerCase());
    out.push(cleaned);
  };
  const phaseMap = {
    menstrual: 'Menstrual cycle',
    follicular: 'Follicular phase',
    ovulatory: 'Ovulation',
    luteal: 'Luteal phase',
  };
  if (Array.isArray(input.phase_tags)) {
    for (const p of input.phase_tags) {
      const mapped = phaseMap[(p || '').toLowerCase()];
      if (mapped) add(mapped);
    }
  }
  if (input.emotional_tag) add(String(input.emotional_tag).replace(/-/g, ' '));
  if (input.category) {
    add(String(input.category).replace(/&.*$/, '').trim());
    add(input.category);
  }
  if (input.title) {
    const words = String(input.title).split(/\s+/).filter(Boolean);
    const caps = words.filter((w) => /^[A-Z][a-z]{2,}/.test(w));
    if (caps.length > 0) {
      add(caps.slice(-3).join(' '));
      add(caps.slice(-2).join(' '));
      add(caps.slice(-1).join(' '));
    }
  }
  return out;
}

async function fetchWikipediaImage(topic) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': CHROME_UA, 'Accept': 'application/json' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const original = data?.originalimage;
    const thumb = data?.thumbnail;
    if (original?.source && typeof original.source === 'string') {
      const w = Number(original.width || 0);
      if ((w === 0 || w >= 200) && isQualityImageUrl(original.source)) return original.source;
    }
    if (thumb?.source && typeof thumb.source === 'string') {
      const w = Number(thumb.width || 0);
      if ((w === 0 || w >= 200) && isQualityImageUrl(thumb.source)) return thumb.source;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWikimediaCommonsImage(query) {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query,
    )}&srnamespace=6&format=json&srlimit=5`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': CHROME_UA, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hits = searchData?.query?.search;
    if (!Array.isArray(hits) || hits.length === 0) return null;
    for (const hit of hits) {
      const fileTitle = hit?.title;
      if (!fileTitle || typeof fileTitle !== 'string') continue;
      if (/(svg|icon|logo|symbol|flag|coat[_-]of[_-]arms)/i.test(fileTitle)) continue;
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        fileTitle,
      )}&prop=imageinfo&iiprop=url|size&format=json`;
      const infoRes = await fetch(infoUrl, {
        headers: { 'User-Agent': CHROME_UA, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!infoRes.ok) continue;
      const infoData = await infoRes.json();
      const pages = infoData?.query?.pages;
      if (!pages || typeof pages !== 'object') continue;
      const firstKey = Object.keys(pages)[0];
      const info = pages[firstKey]?.imageinfo?.[0];
      const candidate = info?.url;
      const width = Number(info?.width || 0);
      if (!candidate || typeof candidate !== 'string') continue;
      if (width && width < 200) continue;
      if (!isQualityImageUrl(candidate)) continue;
      return candidate;
    }
    return null;
  } catch {
    return null;
  }
}

async function pickFreeImage(input) {
  const candidates = buildTopicCandidates(input);
  if (candidates.length === 0) return null;
  for (const topic of candidates) {
    const hit = await fetchWikipediaImage(topic);
    if (hit) return hit;
  }
  for (const topic of candidates) {
    const hit = await fetchWikimediaCommonsImage(topic);
    if (hit) return hit;
  }
  return null;
}

function needsFreeImageBackfill(item) {
  // FemWell-generated items have no content_url, so og:image can't help them.
  // Only target those rows here — external articles are handled by Phase 4.
  if (item?.content_url) return false;
  const img = (item.image_url || '').toLowerCase();
  if (!img) return true;
  if (img.includes('images.unsplash.com')) return true;
  if (img.includes('source.unsplash.com')) return true;
  return false;
}

// Phase 5: free-image backfill for FemWell-generated content. Idempotent: the
// candidate filter (no content_url AND image_url empty/Unsplash) naturally
// shrinks as rows get patched. Self-caps at 200/run to fit base44 timeout.
async function runFreeImageBackfillPhase(base44) {
  const startedAt = new Date().toISOString();
  const BATCH_CAP = 200;
  const counts = {
    scanned: 0,
    eligible: 0,
    picked: 0,
    updated: 0,
    skipped_external: 0,
    skipped_has_image: 0,
    skipped_no_match: 0,
    errors: 0,
  };

  try {
    const sb = base44.asServiceRole;

    // Over-fetch PUBLISHED rows, newest first, then filter client-side because
    // base44 filters don't support OR / substring matching.
    const scanWindow = BATCH_CAP * 4;
    const items = await sb.entities.LifestyleItems.filter(
      { status: 'PUBLISHED' },
      '-created_date',
      scanWindow,
    );

    const candidates = [];
    for (const item of items) {
      counts.scanned += 1;
      if (item?.content_url) {
        counts.skipped_external += 1;
        continue;
      }
      if (!needsFreeImageBackfill(item)) {
        counts.skipped_has_image += 1;
        continue;
      }
      candidates.push(item);
      if (candidates.length >= BATCH_CAP) break;
    }

    counts.eligible = candidates.length;

    for (const item of candidates) {
      let picked = null;
      try {
        picked = await pickFreeImage({
          title: item.title,
          category: item.category,
          emotional_tag: item.emotional_tag,
          phase_tags: item.phase_tags,
        });
      } catch {
        counts.errors += 1;
        continue;
      }
      if (!picked) {
        counts.skipped_no_match += 1;
        continue;
      }
      counts.picked += 1;
      try {
        await sb.entities.LifestyleItems.update(item.id, { image_url: picked });
        counts.updated += 1;
      } catch {
        counts.errors += 1;
      }
    }

    await logIngestError(
      base44,
      'pipelineOrchestrator',
      'free_image_backfill:result',
      {
        source_identifier: 'free_image_backfill',
        raw_payload: { startedAt, batch_cap: BATCH_CAP, scan_window: scanWindow, counts },
      },
      new Error('free_image_backfill ok'),
    );
    return { ok: true, result: { counts } };
  } catch (err) {
    await logIngestError(
      base44,
      'pipelineOrchestrator',
      'free_image_backfill:fail',
      { source_identifier: 'free_image_backfill', raw_payload: { startedAt, counts } },
      err,
    );
    return { ok: false, err: err?.message || String(err) };
  }
}

// Phase 4: og:image backfill. Idempotent — the candidate filter (missing image_url
// OR Unsplash placeholder) naturally shrinks as items get patched, so re-running
// daily is safe. Caps at 200/run to stay under base44 function timeout; the
// backlog clears over 3-5 daily runs given the current LifestyleItems volume.
async function runOgBackfillPhase(base44) {
  const startedAt = new Date().toISOString();
  const BATCH_CAP = 200;
  const counts = {
    scanned: 0,
    eligible: 0,
    extracted: 0,
    updated: 0,
    skipped_has_image: 0,
    skipped_no_og: 0,
    errors: 0,
  };

  try {
    const sb = base44.asServiceRole;

    // Pull a window of PUBLISHED items, newest first. We over-fetch then filter
    // client-side because base44 filters don't support OR / substring matching.
    // Cap the scan window at 4x the batch cap so we don't burn the function
    // timeout reading rows we'd skip anyway.
    const scanWindow = BATCH_CAP * 4;
    const items = await sb.entities.LifestyleItems.filter(
      { status: 'PUBLISHED' },
      '-created_date',
      scanWindow,
    );

    const candidates = [];
    for (const item of items) {
      counts.scanned += 1;
      if (!needsOgBackfill(item)) {
        counts.skipped_has_image += 1;
        continue;
      }
      candidates.push(item);
      if (candidates.length >= BATCH_CAP) break;
    }

    counts.eligible = candidates.length;

    for (const item of candidates) {
      let og = null;
      try {
        og = await fetchOgImage(item.content_url);
      } catch {
        counts.errors += 1;
        continue;
      }
      if (!og) {
        counts.skipped_no_og += 1;
        continue;
      }
      counts.extracted += 1;
      try {
        await sb.entities.LifestyleItems.update(item.id, { image_url: og });
        counts.updated += 1;
      } catch {
        counts.errors += 1;
      }
    }

    await logIngestError(
      base44,
      'pipelineOrchestrator',
      'og_backfill:result',
      {
        source_identifier: 'og_backfill',
        raw_payload: { startedAt, batch_cap: BATCH_CAP, scan_window: scanWindow, counts },
      },
      new Error('og_backfill ok'),
    );
    return { ok: true, result: { counts } };
  } catch (err) {
    await logIngestError(
      base44,
      'pipelineOrchestrator',
      'og_backfill:fail',
      { source_identifier: 'og_backfill', raw_payload: { startedAt, counts } },
      err,
    );
    return { ok: false, err: err?.message || String(err) };
  }
}

// Phase 6: extend FemWell fiction items to multi-chapter (up to 5 chapters).
// Capped at 3 records per orchestrator run. Oldest first so the backlog fills in.
async function runExtendFictionPhase(base44) {
  const startedAt = new Date().toISOString();
  const TARGET_CHAPTERS = 5;
  const RUN_CAP = 3;
  const sb = base44.asServiceRole;
  const results = [];

  try {
    // Fetch published fiction from both providers. Two queries because base44
    // doesn't reliably support $in on provider in the same filter.
    const [weekly, personal] = await Promise.all([
      sb.entities.LifestyleItems.filter(
        { provider: 'FEMWELL_FICTION_WEEKLY', status: 'PUBLISHED' }, 'published_at', 50
      ).catch(() => []),
      sb.entities.LifestyleItems.filter(
        { provider: 'FEMWELL_FICTION_PERSONAL', status: 'PUBLISHED' }, 'published_at', 50
      ).catch(() => []),
    ]);

    const all = [...(weekly || []), ...(personal || [])]
      .sort((a, b) => String(a.published_at || '').localeCompare(String(b.published_at || '')));

    // Pick records that need more chapters
    const candidates = all
      .filter(item => {
        const ch = Array.isArray(item.chapters_json) ? item.chapters_json : [];
        return ch.length < TARGET_CHAPTERS;
      })
      .slice(0, RUN_CAP);

    for (const item of candidates) {
      try {
        const res = await sb.functions.invoke('extendFiction', {
          item_id: item.id,
          target_chapters: TARGET_CHAPTERS,
        });
        const data = res?.data || res || {};
        results.push({ item_id: item.id, title: item.title, ok: !!data.ok, chapters_count: data.chapters_count });
      } catch (err) {
        results.push({ item_id: item.id, title: item.title, ok: false, error: err?.message });
      }
    }

    await logIngestError(
      base44, 'pipelineOrchestrator', 'extendFictionDaily:result',
      { source_identifier: 'extendFictionDaily', raw_payload: { startedAt, results } },
      new Error('extendFictionDaily ok'),
    );
    return { ok: true, result: { processed: results.length, results } };
  } catch (err) {
    await logIngestError(
      base44, 'pipelineOrchestrator', 'extendFictionDaily:fail',
      { source_identifier: 'extendFictionDaily', raw_payload: { startedAt } }, err,
    );
    return { ok: false, err: err?.message || String(err) };
  }
}

// Phase 7: generate today's HoroscopeReading for every onboarded user
// (anyone with an AstroProfile row). Capped at 200 users per run. Idempotent:
// generateHoroscopeReading skips users who already have today's row.
async function runDailyHoroscopesPhase(base44) {
  const startedAt = new Date().toISOString();
  const RUN_CAP = 200;
  const sb = base44.asServiceRole;
  const results = [];
  const today = new Date().toISOString().split('T')[0];

  try {
    const profiles = await sb.entities.AstroProfile.filter({}, '-updated_date', RUN_CAP).catch(() => []);
    let skipped = 0;
    let generated = 0;
    let failed = 0;

    for (const ap of profiles) {
      if (!ap?.user_id) continue;
      try {
        // Cheap pre-check — skip the function call if today's row exists.
        const existing = await sb.entities.HoroscopeReading.filter(
          { user_id: ap.user_id, reading_date: today }, undefined, 1
        ).catch(() => []);
        if (existing.length > 0) { skipped++; continue; }

        const res = await sb.functions.invoke('generateHoroscopeReading', { user_id: ap.user_id });
        const data = res?.data || res || {};
        if (data.ok) { generated++; }
        else { failed++; results.push({ user_id: ap.user_id, error: data.error }); }
      } catch (err) {
        failed++;
        results.push({ user_id: ap.user_id, error: err?.message });
      }
    }

    await logIngestError(
      base44, 'pipelineOrchestrator', 'generateDailyHoroscopes:result',
      { source_identifier: 'generateDailyHoroscopes', raw_payload: { startedAt, generated, skipped, failed, errors: results.slice(0, 10) } },
      new Error('generateDailyHoroscopes ok'),
    );
    return { ok: true, result: { processed: profiles.length, generated, skipped, failed } };
  } catch (err) {
    await logIngestError(
      base44, 'pipelineOrchestrator', 'generateDailyHoroscopes:fail',
      { source_identifier: 'generateDailyHoroscopes', raw_payload: { startedAt } }, err,
    );
    return { ok: false, err: err?.message || String(err) };
  }
}

// ── On-demand phase dispatch ──────────────────────────────────────────────
// Query params:
//   ?run_phase=<name>   run ONLY that phase (default: all phases in order)
//                       valid: ingestRSS | ingestYouTubeChannels |
//                              summarizeLifestyleItem | backfillOgImages |
//                              findFreeImageBackfill
//   ?force=true         bypass any future cooldown guards (no-op today —
//                       orchestrator currently has no guards — but reserved
//                       so callers can pass it safely)
//
// Auth: admin user OR service-role (scheduler). Unauthenticated requests
// reach this point only via service-role from the daily 04:30 UTC cron.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  // Allow service-role / scheduler invocations + admin manual runs:
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const url = new URL(req.url);
  const runPhaseParam = (url.searchParams.get('run_phase') || '').trim();
  // force is reserved for future cooldown guards; we accept and echo it.
  const force = url.searchParams.get('force') === 'true';

  const startedAt = new Date().toISOString();
  const phases = [];

  const wantsPhase = (name) => !runPhaseParam || runPhaseParam === name;

  // Phase 1: ingestRSS
  if (wantsPhase('ingestRSS')) {
    phases.push({ name: 'ingestRSS', ...(await runPhase(base44, 'ingestRSS', 'ingestRSS')) });
  }

  // Phase 2: ingestYouTubeChannels
  if (wantsPhase('ingestYouTubeChannels')) {
    phases.push({ name: 'ingestYouTubeChannels', ...(await runPhase(base44, 'ingestYouTubeChannels', 'ingestYouTubeChannels')) });
  }

  // Phase 3: summarizeLifestyleItem (drain the queue)
  if (wantsPhase('summarizeLifestyleItem')) {
    phases.push({ name: 'summarizeLifestyleItem', ...(await runPhase(base44, 'summarizeLifestyleItem', 'summarizeLifestyleItem', { batch_size: 50 })) });
  }

  // Phase 4: backfillOgImages (idempotent — self-clears backlog)
  if (wantsPhase('backfillOgImages')) {
    phases.push({ name: 'backfillOgImages', ...(await runOgBackfillPhase(base44)) });
  }

  // Phase 5: free-image backfill for FemWell-generated content (no content_url,
  // so og:image can't help). Idempotent + batch-capped + self-clearing.
  if (wantsPhase('findFreeImageBackfill')) {
    phases.push({ name: 'findFreeImageBackfill', ...(await runFreeImageBackfillPhase(base44)) });
  }

  // Phase 6: extend FemWell fiction to multi-chapter (target 5 chapters each).
  // Capped at 3 records per run (~15 LLM calls/day worst case). Self-clears as
  // records reach target_chapters. Oldest published_at first so backlog fills in.
  if (wantsPhase('extendFictionDaily')) {
    phases.push({ name: 'extendFictionDaily', ...(await runExtendFictionPhase(base44)) });
  }

  // Phase 7: generate today's HoroscopeReading row per onboarded user. Capped
  // at 200 users per run. Skips users who already have today's row.
  // ~$0.001 / user / day via gpt-4o-mini.
  if (wantsPhase('generateDailyHoroscopes')) {
    phases.push({ name: 'generateDailyHoroscopes', ...(await runDailyHoroscopesPhase(base44)) });
  }

  const finishedAt = new Date().toISOString();
  return Response.json({
    started_at: startedAt,
    finished_at: finishedAt,
    run_phase: runPhaseParam || 'all',
    force,
    phases,
    ok: phases.length > 0 && phases.every(p => p.ok),
  });
});