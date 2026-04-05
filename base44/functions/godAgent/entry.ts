import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getCyclePhase(lastPeriodDate, cycleLen = 28, periodLen = 5) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = new Date(lastPeriodDate);
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const cycleDay = (diff % cycleLen) + 1;
  if (cycleDay <= periodLen) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulatory';
  return 'luteal';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }

  const base44 = createClientFromRequest(req);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const result = {
    content_qa: { broken_found: 0, deleted: 0 },
    events: { expired_deleted: 0, verified: 0, failed_verification: 0, refreshed: false },
    ai_content: { stories_created: 0, articles_created: 0 },
    for_you: { users_updated: 0 },
    tips_created: 0,
  };

  // ── Step 1: Content QA ───────────────────────────────────────────────────
  try {
    const allItems = await base44.asServiceRole.entities.LifestyleItems.list('-created_date', 2000);
    const published = allItems.filter(i => i.status === 'PUBLISHED');
    const broken = allItems.filter(i => i.status === 'BROKEN');

    // Delete BROKEN items older than 24h
    const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    for (const item of broken) {
      const updatedAt = new Date(item.updated_date || item.created_date);
      if (updatedAt < cutoff24h) {
        await base44.asServiceRole.entities.LifestyleItems.delete(item.id);
        result.content_qa.deleted++;
        await sleep(80);
      }
    }

    // Check published items
    for (const item of published) {
      try {
        // Fix HTML entities in title
        if (item.title && /&amp;|&lt;|&gt;|&nbsp;/.test(item.title)) {
          const cleanTitle = item.title
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
          await base44.asServiceRole.entities.LifestyleItems.update(item.id, { title: cleanTitle });
          await sleep(80);
        }

        // Short summary — send back to review
        if (!item.summary || item.summary.length < 50) {
          await base44.asServiceRole.entities.LifestyleItems.update(item.id, { status: 'NEEDS_REVIEW' });
          await sleep(80);
          continue;
        }

        // HEAD check for articles (skip videos and FEMWELL_AI)
        if (item.content_url && item.provider !== 'FEMWELL_AI' && item.media_type !== 'VIDEO') {
          try {
            const res = await fetch(item.content_url, {
              method: 'HEAD',
              signal: AbortSignal.timeout(5000),
              redirect: 'follow',
            });
            if (res.status >= 400) {
              await base44.asServiceRole.entities.LifestyleItems.update(item.id, { status: 'BROKEN' });
              result.content_qa.broken_found++;
              await sleep(80);
            }
          } catch {
            // network error — leave as is
          }
        }
      } catch (e) {
        console.error('Content QA item error:', e.message);
      }
    }
  } catch (e) {
    console.error('Step 1 error:', e.message);
  }

  // ── Step 2: Events cleanup ───────────────────────────────────────────────
  try {
    const events = await base44.asServiceRole.entities.EventsItems.list('-created_date', 500);

    for (const ev of events) {
      if (ev.date && ev.date < today) {
        await base44.asServiceRole.entities.EventsItems.delete(ev.id);
        result.events.expired_deleted++;
        await sleep(80);
      }
    }

    const remaining = events.filter(ev => ev.date >= today);

    for (const ev of remaining) {
      if (!ev.link) continue;
      try {
        const res = await fetch(ev.link, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
          redirect: 'follow',
        });
        if (res.status >= 400) {
          await base44.asServiceRole.entities.EventsItems.update(ev.id, { verified: false });
          result.events.failed_verification++;
        } else {
          await base44.asServiceRole.entities.EventsItems.update(ev.id, { verified: true, verified_at: now.toISOString() });
          result.events.verified++;
        }
      } catch {
        await base44.asServiceRole.entities.EventsItems.update(ev.id, { verified: false });
        result.events.failed_verification++;
      }
      await sleep(120);
    }

    if (result.events.verified < 15) {
      try {
        await base44.asServiceRole.functions.invoke('refreshEvents', {
          broader: true,
          prompt_hint: 'Include: women-focused events, social meetups, parties, club nights, networking, fitness socials, culture events, food socials, online events, dating events. Source from Eventbrite, Dice, Meetup, Fatsoma, Time Out, RA.',
        });
        result.events.refreshed = true;
      } catch (e) {
        console.error('refreshEvents error:', e.message);
      }
    }
  } catch (e) {
    console.error('Step 2 error:', e.message);
  }

  // ── Step 3: AI content generation ────────────────────────────────────────
  try {
    const storyThemes = ['romantic fiction', 'relationship drama', 'sexual empowerment', 'personal growth', 'friendship', 'career ambition'];
    const weekNum = Math.floor(now.getTime() / (7 * 24 * 3600 * 1000));
    const storyTheme = storyThemes[weekNum % storyThemes.length];

    const storyResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate a compelling short story between 600 and 800 words for women on the theme: "${storyTheme}". Make it literary, emotionally resonant, and written in first person. Return JSON with: title (string), body (string — the full story text), theme (string — one of: romance, relationships, sexuality, growth, friendship, career), phase_tags (array — the cycle phases this mood suits, e.g. ["ovulatory", "follicular"]), emotional_tags (array — e.g. ["desire", "confidence", "longing"]).`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          theme: { type: 'string' },
          phase_tags: { type: 'array', items: { type: 'string' } },
          emotional_tags: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    await base44.asServiceRole.entities.LifestyleItems.create({
      title: storyResult.title,
      summary: (storyResult.body || '').slice(0, 200),
      content_url: '',
      media_type: 'ARTICLE',
      content_type: 'STORY',
      provider: 'FEMWELL_AI',
      status: 'PUBLISHED',
      category: 'Culture',
      phase_tags: storyResult.phase_tags || [],
      tags: storyResult.emotional_tags || [],
      pub_date: today,
      published_at: now.toISOString(),
      ingested_at: now.toISOString(),
      engagement_score: 15,
    });
    result.ai_content.stories_created++;
  } catch (e) {
    console.error('Step 3 story error:', e.message);
  }

  try {
    const articleTopics = ['sexual health', 'cycle nutrition', 'hormones and mood', 'career and identity', 'relationships and communication', 'body confidence'];
    const dayNum = Math.floor(now.getTime() / (24 * 3600 * 1000));
    const topic = articleTopics[dayNum % articleTopics.length];

    const articleResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write an expert women's health and lifestyle article of 450-600 words on the topic: "${topic}". Include a clear headline, 3-4 paragraphs, and a closing insight. Use an informed, warm tone — not clinical. Return JSON with: title (string), body (string), category (string — one of: Sexual Health, Hormones, Nutrition, Career, Relationships, Body), phase_tags (array), takeaways (array of 3 short strings).`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          category: { type: 'string' },
          phase_tags: { type: 'array', items: { type: 'string' } },
          takeaways: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    const [t1, t2, t3] = articleResult.takeaways || [];
    await base44.asServiceRole.entities.LifestyleItems.create({
      title: articleResult.title,
      summary: (articleResult.body || '').slice(0, 200),
      content_url: '',
      media_type: 'ARTICLE',
      content_type: 'ARTICLE',
      provider: 'FEMWELL_AI',
      status: 'PUBLISHED',
      category: articleResult.category || 'Womens Health',
      phase_tags: articleResult.phase_tags || [],
      takeaway_1: t1 || '',
      takeaway_2: t2 || '',
      takeaway_3: t3 || '',
      pub_date: today,
      published_at: now.toISOString(),
      ingested_at: now.toISOString(),
      engagement_score: 15,
    });
    result.ai_content.articles_created++;
  } catch (e) {
    console.error('Step 3 article error:', e.message);
  }

  // ── Step 4: For You feed pre-build ────────────────────────────────────────
  try {
    const [allPublished, allUsers] = await Promise.all([
      base44.asServiceRole.entities.LifestyleItems.list('-pub_date', 500),
      base44.asServiceRole.entities.UserProfile.list('-created_date', 500),
    ]);

    const published = allPublished.filter(i => i.status === 'PUBLISHED');
    const now48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const now7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const profile of allUsers) {
      try {
        const phase = getCyclePhase(
          profile.last_period_start_date,
          profile.cycle_avg_length || 28,
          profile.period_length || 5
        );

        const scored = published.map(item => {
          let score = 0;
          if (phase && Array.isArray(item.phase_tags) && item.phase_tags.includes(phase)) score += 25;
          if (item.content_type === 'STORY') score += 10;
          if (item.provider === 'FEMWELL_AI') score += 15;
          const pubDate = item.pub_date ? new Date(item.pub_date) : null;
          if (pubDate && pubDate > now48h) score += 8;
          else if (pubDate && pubDate > now7d) score += 5;
          score += Math.min(item.engagement_score || 0, 20);
          return { id: item.id, score };
        });

        scored.sort((a, b) => b.score - a.score);
        const topIds = scored.slice(0, 10).map(s => s.id);

        await base44.asServiceRole.entities.UserProfile.update(profile.id, { for_you_item_ids: topIds });
        result.for_you.users_updated++;
        await sleep(100);
      } catch (e) {
        console.error('For You user error:', e.message);
      }
    }
  } catch (e) {
    console.error('Step 4 error:', e.message);
  }

  // ── Step 5: Daily skin and hair tip ───────────────────────────────────────
  try {
    // Delete old SKIN_TIP cards
    const oldTips = await base44.asServiceRole.entities.InsightCards.list('-created_date', 100);
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    for (const tip of oldTips.filter(t => t.type === 'SKIN_TIP')) {
      const createdAt = new Date(tip.created_date);
      if (createdAt < cutoff) {
        await base44.asServiceRole.entities.InsightCards.delete(tip.id);
        await sleep(80);
      }
    }

    // Determine most common phase
    const users = await base44.asServiceRole.entities.UserProfile.list('-created_date', 200);
    const phaseCounts = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
    for (const u of users) {
      const p = getCyclePhase(u.last_period_start_date, u.cycle_avg_length || 28, u.period_length || 5);
      if (p && phaseCounts[p] !== undefined) phaseCounts[p]++;
    }
    const globalPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'follicular';

    const tipResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a women's skincare and haircare expert. Today's menstrual cycle phase for most users is "${globalPhase}". Generate a skincare tip and a haircare tip appropriate for this phase. The tips should be specific, actionable, and reference real ingredients or techniques. Return JSON with: skin_tip (string, 1-2 sentences), hair_tip (string, 1-2 sentences), phase (string).`,
      response_json_schema: {
        type: 'object',
        properties: {
          skin_tip: { type: 'string' },
          hair_tip: { type: 'string' },
          phase: { type: 'string' },
        },
      },
    });

    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    await base44.asServiceRole.entities.InsightCards.create({
      type: 'SKIN_TIP',
      content: JSON.stringify({ skin_tip: tipResult.skin_tip, hair_tip: tipResult.hair_tip }),
      phase: tipResult.phase || globalPhase,
      expires_at: expiresAt,
      user_id: 'global',
      source: 'god_agent',
      insight_date: today,
      title: `Skin & Hair — ${tipResult.phase || globalPhase} phase`,
      insight_text: tipResult.skin_tip,
    });
    result.tips_created = 1;
  } catch (e) {
    console.error('Step 5 error:', e.message);
  }

  return Response.json(result);
});