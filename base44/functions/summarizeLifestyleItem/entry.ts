// MP-Pipeline Phase 1+2:
// - Adds VIDEO branch: ONE YouTube Data API call (videos.list with status,contentDetails,snippet)
// - Embed gate: REJECT_EMBED for non-embeddable / private / GB-blocked / age-gated
// - Duration rules: HIDDEN for shorts <60s and >60min
// - Embeddable videos get embed_url, duration_seconds, duration_label, summary, lede → PUBLISHED
// - Article branch unchanged (still summarizes via InvokeLLM, then PUBLISHED)
// - Replaces silent catches with IngestErrorLog rows

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

// ── Inlined helper: validate try_this_content_key against ContentItems ──
// Returns the key as-is if a ContentItems row with that content_key exists.
// Returns "" otherwise. Fail-safe: empty rather than orphaned.
async function validateContentKey(base44, proposedKey) {
  if (!proposedKey || typeof proposedKey !== 'string' || !proposedKey.trim()) {
    return '';
  }
  const trimmed = proposedKey.trim();
  try {
    const matches = await base44.asServiceRole.entities.ContentItems.filter(
      { content_key: trimmed },
      null,
      1
    );
    return Array.isArray(matches) && matches.length > 0 ? trimmed : '';
  } catch {
    return '';
  }
}

// ── Inlined helper: YouTube Data API ───────────────────────────────────────
const YT_KEY = Deno.env.get('YOUTUBE_API_KEY');
const UK_REGION = 'GB';

function parseIsoDuration(iso) {
  if (!iso) return 0;
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!m) return 0;
  return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0');
}

function formatDuration(secs) {
  if (!secs) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function fetchYouTubeMeta(videoId) {
  if (!YT_KEY) throw new Error('YOUTUBE_API_KEY not set');
  // ONE API call returns snippet + status + contentDetails (duration, region, age rating).
  const url = `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails,snippet&id=${videoId}&key=${YT_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  const v = data.items?.[0];
  if (!v) return null;
  const region = v.contentDetails?.regionRestriction;
  return {
    title: v.snippet?.title || '',
    description: v.snippet?.description || '',
    duration_iso: v.contentDetails?.duration || '',
    duration_seconds: parseIsoDuration(v.contentDetails?.duration || ''),
    embeddable: v.status?.embeddable === true,
    privacyStatus: v.status?.privacyStatus,
    regionBlockedForGB:
      (region?.blocked && region.blocked.includes(UK_REGION)) ||
      (region?.allowed && !region.allowed.includes(UK_REGION)),
    ageRestricted: v.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted',
  };
}

async function fetchArticleText(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
  } catch {
    return '';
  }
}

// ── Video branch helpers ───────────────────────────────────────────────────
async function applyHide(base44, item, reason) {
  await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
    status: 'HIDDEN',
    rejection_reason: reason,
    updated_at: new Date().toISOString(),
  });
  await logIngestError(base44, 'summarizeLifestyleItem', 'enrichment',
    { item_id: item.id, source_identifier: item.source_name || '' },
    new Error(`auto-hidden: ${reason}`));
}

async function applyRejectEmbed(base44, item, reason) {
  await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
    status: 'REJECTED_EMBED',
    is_embeddable: false,
    embed_check_reason: reason,
    rejection_reason: reason,
    updated_at: new Date().toISOString(),
  });
  await logIngestError(base44, 'summarizeLifestyleItem', 'enrichment',
    { item_id: item.id, source_identifier: item.source_name || '' },
    new Error(`embed rejected: ${reason}`));
}

// Captions stub — wire timedtext API in a later MP if needed. For now LLM grounds in title + description.
async function fetchYouTubeCaptions(_videoId) {
  return null;
}

async function invokeLLMForVideoSummary(base44, ctx) {
  const prompt = `You are FemWell's content editor. Summarize this video for a UK women's wellness audience in 2 sentences max. Ground the summary in the actual video content (use captions if provided), not the channel description. Keep tone warm, considered, no emoji.

Also infer which menstrual cycle phase(s) this content speaks to most. Most content is general-purpose — only return phase tags when the content is genuinely more relevant during a specific phase (e.g. an article about luteal-week cravings should tag ["luteal"]; an article about general nutrition should return []). Available phases: "menstrual", "follicular", "ovulatory", "luteal". Return at most 2 phases.

You may also suggest a try_this_content_key — a short kebab-case key linking to a related FemWell ContentItem (meditation / breathwork / guided session). Real keys you can suggest include: "sleep-wind-down", "body-scan-reset", "anxiety-reset", "pms-kindness", "menopause-calm", "self-compassion", "3-minute-breathing-space", "box-breathing", "4-7-8-breathing", "energising-breath", "downshift-breathing", "alternate-nostril-breathing", "coherent-breathing", "progressive-muscle-relaxation", "grounding-calm", "focus-sprint". If none of these clearly fits the video's content, return empty string. Don't invent new keys; suggest only from this list or leave empty.

Title: ${ctx.title}
Duration: ${ctx.duration}
Description: ${(ctx.description || '').slice(0, 800)}
Captions (excerpt): ${ctx.captions ? ctx.captions.slice(0, 2000) : '(no captions available)'}

Return JSON: { summary: string, phase_tags: string[], try_this_content_key: string }`;
  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        phase_tags: {
          type: 'array',
          items: { type: 'string', enum: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
          maxItems: 2,
          default: [],
        },
        try_this_content_key: { type: 'string', default: '' },
      },
    },
  });
  return {
    summary: res?.summary || '',
    phase_tags: Array.isArray(res?.phase_tags) ? res.phase_tags : [],
    try_this_content_key: typeof res?.try_this_content_key === 'string' ? res.try_this_content_key : '',
  };
}

async function processVideoItem(base44, item) {
  // Step A: ONE YouTube API call returns everything we need
  let meta;
  try {
    meta = await fetchYouTubeMeta(item.video_id);
  } catch (err) {
    await logIngestError(base44, 'summarizeLifestyleItem', 'enrichment',
      { item_id: item.id, source_identifier: item.source_name || '' }, err);
    return { outcome: 'retry' };
  }
  if (!meta) {
    await logIngestError(base44, 'summarizeLifestyleItem', 'enrichment',
      { item_id: item.id, source_identifier: item.source_name || '' },
      new Error('YouTube meta fetch returned no item'));
    return { outcome: 'retry' };
  }

  // Step B: embeddability gate
  if (!meta.embeddable)                    { await applyRejectEmbed(base44, item, 'creator_disabled'); return { outcome: 'rejected_embed' }; }
  if (meta.privacyStatus !== 'public')     { await applyRejectEmbed(base44, item, 'private');          return { outcome: 'rejected_embed' }; }
  if (meta.regionBlockedForGB)             { await applyRejectEmbed(base44, item, 'region_blocked');   return { outcome: 'rejected_embed' }; }
  if (meta.ageRestricted)                  { await applyRejectEmbed(base44, item, 'age_gated');        return { outcome: 'rejected_embed' }; }

  // Step C: duration rules
  if (meta.duration_seconds < 60)          { await applyHide(base44, item, 'shorts_under_60s');        return { outcome: 'hidden' }; }
  if (meta.duration_seconds > 3600)        { await applyHide(base44, item, 'over_60_minutes');         return { outcome: 'hidden' }; }

  // Step D: write embed_url for in-app player
  const embedUrl = `https://www.youtube.com/embed/${item.video_id}`;
  const durationLabel = formatDuration(meta.duration_seconds);

  // Step E: summary grounded in actual content
  const captionText = await fetchYouTubeCaptions(item.video_id).catch(() => null);
  let summary = '';
  let inferredPhaseTags = [];
  let validatedTryThisKey = '';
  try {
    const llmRes = await invokeLLMForVideoSummary(base44, {
      title: meta.title || item.title,
      description: meta.description,
      captions: captionText,
      duration: durationLabel,
    });
    summary = llmRes.summary;
    inferredPhaseTags = llmRes.phase_tags;
    validatedTryThisKey = await validateContentKey(base44, llmRes.try_this_content_key);
  } catch (err) {
    await logIngestError(base44, 'summarizeLifestyleItem', 'summarization',
      { item_id: item.id, source_identifier: item.source_name || '' }, err);
    return { outcome: 'retry' };
  }

  const lede = (summary || '').slice(0, 140) + (summary && summary.length > 140 ? '…' : '');

  // Step F: validate required fields, publish
  if (!summary || !durationLabel || !embedUrl) {
    await logIngestError(base44, 'summarizeLifestyleItem', 'summarization',
      { item_id: item.id, source_identifier: item.source_name || '' },
      new Error('Missing required fields after enrichment'));
    return { outcome: 'retry' };
  }

  await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
    summary,
    lede,
    duration_seconds: meta.duration_seconds,
    duration_label: durationLabel,
    is_embeddable: true,
    embed_url: embedUrl,
    phase_tags: inferredPhaseTags,
    try_this_content_key: validatedTryThisKey,
    status: 'PUBLISHED',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return { outcome: 'published' };
}

async function processArticleItem(base44, item) {
  try {
    const articleText = await fetchArticleText(item.content_url);
    const textToUse = articleText || item.summary || item.title;

    const prompt = `You are a women's wellness content editor. Summarise this article for a health-conscious female audience.

Title: ${item.title}
Content: ${textToUse}

Return JSON with:
- summary: 2-3 engaging sentences (max 180 chars)
- takeaway_1: first key takeaway (max 90 chars)
- takeaway_2: second key takeaway (max 90 chars)
- takeaway_3: third key takeaway (max 90 chars, or empty string if not needed)
- why_it_matters: one-line statement on why this matters (max 80 chars)
- category: one of [Womens Health, Relationships, Professional, Beauty, Lifestyle, Mental Health, Nutrition, Fitness]
- tags: comma-separated keywords (max 5 tags)
- phase_tags: array of menstrual cycle phases this article is most relevant during. Available: "menstrual", "follicular", "ovulatory", "luteal". Most articles are general-purpose — return [] for general content. Only tag phases when content is genuinely more relevant in that phase. Max 2 phases.
- try_this_content_key: optional kebab-case key linking to a related FemWell ContentItem (meditation / breathwork / guided session). Suggest ONLY from this list of real keys: "sleep-wind-down", "body-scan-reset", "anxiety-reset", "pms-kindness", "menopause-calm", "self-compassion", "3-minute-breathing-space", "box-breathing", "4-7-8-breathing", "energising-breath", "downshift-breathing", "alternate-nostril-breathing", "coherent-breathing", "progressive-muscle-relaxation", "grounding-calm", "focus-sprint". If none clearly fits, return empty string.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          takeaway_1: { type: 'string' },
          takeaway_2: { type: 'string' },
          takeaway_3: { type: 'string' },
          why_it_matters: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'string' },
          phase_tags: {
            type: 'array',
            items: { type: 'string', enum: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
            maxItems: 2,
            default: [],
          },
          try_this_content_key: { type: 'string', default: '' },
        },
      },
    });

    const tagsArr = result.tags
      ? result.tags.split(',').map(t => t.trim()).filter(Boolean)
      : (Array.isArray(item.tags) ? item.tags : []);
    const phaseTagsArr = Array.isArray(result.phase_tags) ? result.phase_tags : [];
    const validatedTryThisKey = await validateContentKey(base44, result.try_this_content_key);
    await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
      summary: result.summary || item.summary,
      takeaways: [result.takeaway_1, result.takeaway_2, result.takeaway_3].filter(Boolean),
      why_it_matters: result.why_it_matters || '',
      category: result.category === 'Womens Health' ? "Women's Health" : (result.category || item.category),
      tags: tagsArr,
      phase_tags: phaseTagsArr,
      try_this_content_key: validatedTryThisKey,
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return { outcome: 'published' };
  } catch (err) {
    await logIngestError(base44, 'summarizeLifestyleItem', 'summarization',
      { item_id: item.id, source_identifier: item.source_name || '' }, err);
    return { outcome: 'retry' };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { item_id, batch_size = 5 } = body;

    let items;
    if (item_id) {
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ id: item_id });
    } else {
      items = await base44.asServiceRole.entities.LifestyleItems.filter({ status: 'NEEDS_REVIEW' }, '-ingested_at', batch_size);
    }

    const counts = { published: 0, rejected_embed: 0, hidden: 0, retry: 0, total: items.length };

    for (const item of items) {
      let result;
      try {
        if (item.media_type === 'VIDEO' && item.video_id) {
          result = await processVideoItem(base44, item);
        } else {
          result = await processArticleItem(base44, item);
        }
      } catch (err) {
        await logIngestError(base44, 'summarizeLifestyleItem', 'enrichment',
          { item_id: item.id, source_identifier: item.source_name || '' }, err);
        result = { outcome: 'retry' };
      }
      counts[result.outcome] = (counts[result.outcome] || 0) + 1;
    }

    return Response.json({ ...counts, summarized: counts.published });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});