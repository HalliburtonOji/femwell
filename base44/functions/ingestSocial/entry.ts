import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// ── Instagram: fetch oEmbed preview for a post URL ────────────────────────
async function fetchInstagramPreview(postUrl) {
  try {
    const oembed = await fetch(
      `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&fields=thumbnail_url,author_name,title&access_token=client_credentials`
    );
    if (oembed.ok) {
      const data = await oembed.json();
      return { thumbnail_url: data.thumbnail_url || '', author_name: data.author_name || '' };
    }
  } catch (_) { /* fall through */ }
  // Fallback: extract username from URL for display
  const match = postUrl.match(/instagram\.com\/([^/]+)\//);
  return { thumbnail_url: '', author_name: match ? `@${match[1]}` : 'Instagram' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sourceType = body.source_type || 'INSTAGRAM'; // 'INSTAGRAM' | 'TIKTOK'

    const sources = await base44.asServiceRole.entities.LifestyleSources.filter({
      is_active: true,
      source_type: sourceType,
    });

    let ingested = 0;
    let skipped = 0;
    const errors = [];

    for (const source of sources) {
      // feed_url stores a comma-separated list of post URLs for manual social sources
      const postUrls = (source.feed_url || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      for (const postUrl of postUrls) {
        if (!postUrl) continue;
        const hash = simpleHash(postUrl);

        const existing = await base44.asServiceRole.entities.LifestyleItems.filter({ content_url_hash: hash });
        if (existing.length > 0) { skipped++; continue; }

        let image_url = '';
        let title = source.name;
        let media_type = sourceType === 'TIKTOK' ? 'TIKTOK' : 'INSTAGRAM';

        if (sourceType === 'INSTAGRAM') {
          const preview = await fetchInstagramPreview(postUrl);
          image_url = preview.thumbnail_url;
          if (preview.author_name) title = `${source.name} – ${preview.author_name}`;
        } else if (sourceType === 'TIKTOK') {
          // TikTok oEmbed (no auth required for public videos)
          try {
            const oembed = await fetch(
              `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`
            );
            if (oembed.ok) {
              const data = await oembed.json();
              image_url = data.thumbnail_url || '';
              title = data.title || source.name;
            }
          } catch (e) {
            errors.push(`TikTok oEmbed failed for ${postUrl}: ${e.message}`);
          }
        }

        await base44.asServiceRole.entities.LifestyleItems.create({
          source_id: source.id,
          source_name: source.name,
          source_logo_url: source.logo_url || '',
          title: title.slice(0, 200),
          content_url: postUrl,
          embed_url: postUrl,
          content_url_hash: hash,
          image_url,
          category: source.category || 'Lifestyle',
          summary: `View this ${sourceType === 'TIKTOK' ? 'TikTok' : 'Instagram post'} from ${source.name}`,
          pub_date: new Date().toISOString(),
          ingested_at: new Date().toISOString(),
          status: 'NEEDS_REVIEW',
          media_type,
          tags: source.category || 'Lifestyle',
        });
        ingested++;
      }
    }

    return Response.json({ ingested, skipped, sources: sources.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});