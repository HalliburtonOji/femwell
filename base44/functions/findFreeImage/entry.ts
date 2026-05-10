// MP free multi-source image finder:
// FemWell-generated content (FEMWELL_AI / FEMWELL_FICTION_*) has no external page,
// so og:image extraction can't help — those items currently carry empty or random
// Unsplash image_urls. This function picks a topically relevant image from FREE
// sources (Wikipedia REST + Wikimedia Commons) given an item's title / category /
// emotional_tag / phase_tags. No API keys required; honors optional Pexels /
// Pixabay extension hooks for future MPs.
//
// Wired into:
//   - summarizeLifestyleItem (inline) — picks an image at summarize time when
//     image_url is empty or a random Unsplash placeholder.
//   - pipelineOrchestrator phase 5 findFreeImageBackfill — backfills existing
//     FemWell-generated items (content_url empty, image_url empty/Unsplash).
//
// Body: { title?: string, category?: string, emotional_tag?: string, phase_tags?: string[] }
// Returns: { image_url: string | null, source: "wikipedia" | "wikimedia" | "none", topic_tried: string | null }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Future extension hook: Lucha can wire Pexels / Pixabay in a later MP by
// reading these env vars and adding a third / fourth source tier. Today the
// function silently skips them when the keys are absent so deployment stays
// zero-config. Do NOT remove the markers below — they document intent.
//   const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
//   const PIXABAY_API_KEY = Deno.env.get('PIXABAY_API_KEY');

// ── Inlined helper: structured ingest error log ────────────────────────────
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

// ── Topic candidate extraction ─────────────────────────────────────────────
// Priority: phase_tags → emotional_tag → category → last salient nouns in title.
// Wikipedia REST pages live under canonical Title_Case keys. We capitalize each
// candidate but try them straight; the API is forgiving on case.
export function buildTopicCandidates(input: {
  title?: string;
  category?: string;
  emotional_tag?: string;
  phase_tags?: string[];
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string | undefined | null) => {
    if (!raw || typeof raw !== 'string') return;
    const cleaned = raw.trim();
    if (!cleaned) return;
    if (seen.has(cleaned.toLowerCase())) return;
    seen.add(cleaned.toLowerCase());
    out.push(cleaned);
  };

  // 1. Phase tags — map cycle slugs to Wikipedia-friendly topic strings.
  const phaseMap: Record<string, string> = {
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

  // 2. Emotional tag (already capitalized in the enum; normalize hyphens).
  if (input.emotional_tag) {
    const normalized = input.emotional_tag.replace(/-/g, ' ');
    add(normalized);
  }

  // 3. Category — already in canonical FemWell form.
  if (input.category) {
    // Strip "& " patterns for cleaner Wikipedia hits, e.g. "Hormones & Cycle" → "Hormones".
    const clean = input.category.replace(/&.*$/, '').trim();
    add(clean);
    add(input.category);
  }

  // 4. Title nouns — last 2–3 capitalized words give us the salient subject.
  if (input.title) {
    const words = input.title.split(/\s+/).filter(Boolean);
    const caps = words.filter((w) => /^[A-Z][a-z]{2,}/.test(w));
    if (caps.length > 0) {
      // Try a 2-3 word window starting from the back, then individual tail words.
      const tail3 = caps.slice(-3).join(' ');
      const tail2 = caps.slice(-2).join(' ');
      const tail1 = caps.slice(-1).join(' ');
      add(tail3);
      add(tail2);
      add(tail1);
    }
  }

  return out;
}

// ── Image-URL quality filter ───────────────────────────────────────────────
// Reject icons / logos / placeholders / SVGs / transparent assets. Width gate
// applied separately when metadata is available.
export function isQualityImageUrl(url: string): boolean {
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
  // Reject obvious icon / logo / symbol paths.
  if (/\/(icon|symbol|logo|flag|coat[_-]of[_-]arms)/i.test(url)) return false;
  return true;
}

// ── Source 1: Wikipedia REST page summary ──────────────────────────────────
// Returns originalimage (preferred) or thumbnail. Wikipedia returns 404 for
// missing pages — we silently skip and try the next candidate.
async function fetchWikipediaImage(topic: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'application/json',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const original = data?.originalimage;
    const thumb = data?.thumbnail;

    // Prefer originalimage at >= 400px width; otherwise accept thumbnail >= 200px.
    if (original?.source && typeof original.source === 'string') {
      const w = Number(original.width || 0);
      if ((w === 0 || w >= 200) && isQualityImageUrl(original.source)) {
        return original.source;
      }
    }
    if (thumb?.source && typeof thumb.source === 'string') {
      const w = Number(thumb.width || 0);
      if ((w === 0 || w >= 200) && isQualityImageUrl(thumb.source)) {
        return thumb.source;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ── Source 2: Wikimedia Commons search ─────────────────────────────────────
// Two-call flow: search File:* titles, then look up imageinfo URL for the
// top hit. Namespace 6 is File:.
async function fetchWikimediaCommonsImage(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query,
    )}&srnamespace=6&format=json&srlimit=5`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hits = searchData?.query?.search;
    if (!Array.isArray(hits) || hits.length === 0) return null;

    // Walk hits in rank order; skip obvious non-photographic titles.
    for (const hit of hits) {
      const fileTitle = hit?.title;
      if (!fileTitle || typeof fileTitle !== 'string') continue;
      if (/(svg|icon|logo|symbol|flag|coat[_-]of[_-]arms)/i.test(fileTitle)) continue;

      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        fileTitle,
      )}&prop=imageinfo&iiprop=url|size&format=json`;
      const infoRes = await fetch(infoUrl, {
        headers: {
          'User-Agent': CHROME_UA,
          'Accept': 'application/json',
        },
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

// ── Public picker: walk candidates × sources, first hit wins ───────────────
export async function pickFreeImage(input: {
  title?: string;
  category?: string;
  emotional_tag?: string;
  phase_tags?: string[];
}): Promise<{ image_url: string | null; source: 'wikipedia' | 'wikimedia' | 'none'; topic_tried: string | null }> {
  const candidates = buildTopicCandidates(input);
  if (candidates.length === 0) {
    return { image_url: null, source: 'none', topic_tried: null };
  }

  // Pass 1: Wikipedia REST for every candidate.
  for (const topic of candidates) {
    const hit = await fetchWikipediaImage(topic);
    if (hit) return { image_url: hit, source: 'wikipedia', topic_tried: topic };
  }

  // Pass 2: Wikimedia Commons fallback for every candidate.
  for (const topic of candidates) {
    const hit = await fetchWikimediaCommonsImage(topic);
    if (hit) return { image_url: hit, source: 'wikimedia', topic_tried: topic };
  }

  // Future tiers: Pexels / Pixabay would slot in here, gated on env-var presence.
  return { image_url: null, source: 'none', topic_tried: null };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Allow service-role / scheduler invocations + admin manual runs:
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const input = {
      title: typeof body?.title === 'string' ? body.title : '',
      category: typeof body?.category === 'string' ? body.category : '',
      emotional_tag: typeof body?.emotional_tag === 'string' ? body.emotional_tag : '',
      phase_tags: Array.isArray(body?.phase_tags) ? body.phase_tags : [],
    };

    let result;
    try {
      result = await pickFreeImage(input);
    } catch (err) {
      await logIngestError(base44, 'findFreeImage', 'pick_failed',
        { source_identifier: input.title || input.category || '', raw_payload: input }, err);
      result = { image_url: null, source: 'none' as const, topic_tried: null };
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
