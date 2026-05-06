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

Title: ${ctx.title}
Duration: ${ctx.duration}
Description: ${(ctx.description || '').slice(0, 800)}
Captions (excerpt): ${ctx.captions ? ctx.captions.slice(0, 2000) : '(no captions available)'}

Return JSON: { summary: string }`;
  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: { summary: { type: 'string' } },
    },
  });
  return res?.summary || '';
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
  try {
    summary = await invokeLLMForVideoSummary(base44, {
      title: meta.title || item.title,
      description: meta.description,
      captions: captionText,
      duration: durationLabel,
    });
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
- tags: comma-separated keywords (max 5 tags)`;

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
        },
      },
    });

    const tagsArr = result.tags
      ? result.tags.split(',').map(t => t.trim()).filter(Boolean)
      : (Array.isArray(item.tags) ? item.tags : []);
    await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
      summary: result.summary || item.summary,
      takeaways: [result.takeaway_1, result.takeaway_2, result.takeaway_3].filter(Boolean),
      why_it_matters: result.why_it_matters || '',
      category: result.category === 'Womens Health' ? "Women's Health" : (result.category || item.category),
      tags: tagsArr,
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