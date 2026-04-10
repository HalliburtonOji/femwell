import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Chunked generation: each automation call generates ONE chapter (~550 words).
// Automation runs Mon–Thu so a 4-chapter story builds across the week.
// Draft tracking via tags: in_progress / complete, chapters_done:N

const FICTION_GENRES = ['Romance', 'Romantic Suspense', 'Thriller', 'Mystery', 'Fantasy', 'Contemporary', 'Historical', 'Literary', 'Drama'];
const PERSONAL_GENRES = ['Contemporary', 'Romance', 'Drama', 'Literary', 'Thriller', 'Fantasy', 'Romantic Suspense', 'Mystery', 'Historical'];
const MATURE_GENRES = ['Romance', 'Romantic Suspense'];
const TOTAL_CHAPTERS = 4;

function getMondayWeekStart() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().split('T')[0];
}

function getChaptersDone(tags) {
  const tag = (tags || []).find(t => t.startsWith('chapters_done:'));
  return tag ? parseInt(tag.split(':')[1], 10) : 0;
}

function replaceTag(tags, prefix, newValue) {
  const filtered = (tags || []).filter(t => t !== prefix && !t.startsWith(prefix + ':') && t !== prefix.replace(':', ''));
  return newValue ? [...filtered, newValue] : filtered;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { mode, mature } = body;
    const weekStart = getMondayWeekStart();

    // ── WEEKLY GLOBAL (chunked) ─────────────────────────────────────────────
    if (mode === 'weekly_global') {
      const allThisWeek = await base44.asServiceRole.entities.LifestyleItems.filter(
        { provider: 'FEMWELL_FICTION_WEEKLY' }, '-pub_date', 60
      );

      const inProgress = allThisWeek.find(i =>
        Array.isArray(i.tags) && i.tags.includes(`week:${weekStart}`) && i.tags.includes('in_progress')
      );
      const completed = allThisWeek.filter(i =>
        Array.isArray(i.tags) && i.tags.includes(`week:${weekStart}`) && i.tags.includes('complete')
      );

      if (completed.length >= 1 && !inProgress) {
        return Response.json({ success: true, message: 'Weekly story already complete', week_start: weekStart });
      }

      if (inProgress) {
        const chaptersDone = getChaptersDone(inProgress.tags);
        const nextChapter = chaptersDone + 1;

        if (chaptersDone >= TOTAL_CHAPTERS) {
          // Edge case: already done, just publish
          let tags = replaceTag(inProgress.tags, 'in_progress', 'complete');
          await base44.asServiceRole.entities.LifestyleItems.update(inProgress.id, {
            status: 'PUBLISHED', tags, duration_label: '22 min read',
          });
          return Response.json({ success: true, message: `Published: ${inProgress.title}` });
        }

        const genre = (inProgress.tags || []).find(t => t.startsWith('genre:'))?.replace('genre:', '') || 'Contemporary';

        // Generate next chapter (~550 words) — single fast call with gpt_5
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: 'gpt_5',
          prompt: `You are continuing a ${genre} fiction story titled "${inProgress.title}" for FemWell, a women's wellness platform.

Here is the story so far (last portion):
${(inProgress.lede || '').slice(-2000)}

Write Chapter ${nextChapter} of ${TOTAL_CHAPTERS}. Approximately 500-600 words. Continue the narrative naturally. ${nextChapter === TOTAL_CHAPTERS ? 'This is the final chapter — bring the story to a satisfying, emotionally resonant conclusion.' : 'Develop the central conflict or relationship further and end with a compelling moment that makes the reader want to continue.'}

Plain text only. No markdown. No asterisks. Start with "Chapter ${nextChapter}" as a plain text heading on its own line.

Return JSON: { "chapter_text": "the full chapter text starting with Chapter ${nextChapter}" }`,
          response_json_schema: {
            type: 'object',
            properties: { chapter_text: { type: 'string' } },
          },
        });

        const newBody = (inProgress.lede || '') + '\n\n' + result.chapter_text;
        let tags = replaceTag(inProgress.tags, 'chapters_done:', `chapters_done:${nextChapter}`);

        if (nextChapter >= TOTAL_CHAPTERS) {
          tags = replaceTag(tags, 'in_progress', 'complete');
          await base44.asServiceRole.entities.LifestyleItems.update(inProgress.id, {
            lede: newBody, tags, status: 'PUBLISHED', duration_label: '22 min read',
          });
          console.log(`Story complete & published: ${inProgress.title}`);
        } else {
          await base44.asServiceRole.entities.LifestyleItems.update(inProgress.id, { lede: newBody, tags });
          console.log(`Chapter ${nextChapter} added to: ${inProgress.title}`);
        }

        return Response.json({ success: true, chapter: nextChapter, total: TOTAL_CHAPTERS, title: inProgress.title });
      }

      // Start a brand new story (Chapter 1)
      const usedGenres = allThisWeek
        .filter(i => Array.isArray(i.tags) && i.tags.includes(`week:${weekStart}`))
        .map(i => (i.tags || []).find(t => t.startsWith('genre:'))?.replace('genre:', '') || '');
      const available = FICTION_GENRES.filter(g => !usedGenres.includes(g));
      const genre = available[0] || FICTION_GENRES[0];

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'gpt_5',
        prompt: `You are a fiction editor for FemWell, a women's wellness and lifestyle platform. Begin a new ${genre} story for women readers.

The story must feature a female protagonist. Themes: relationships, identity, ambition, healing, connection, or growth. Write quality literary fiction with a strong voice, real emotional stakes, and vivid detail.

This is Chapter 1 of 4, approximately 550-650 words. Establish the protagonist, the world, and the central desire or conflict. End on a moment that hooks the reader.

Plain text only. No markdown. No asterisks. Start with "Chapter 1" as a plain text heading on its own line.

Return JSON:
- title: compelling story title (max 70 chars, no trailing punctuation)
- summary: 2-3 sentence synopsis (max 280 chars)
- emotional_tag: one of: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief
- chapter_text: the full Chapter 1 text starting with "Chapter 1"`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            summary: { type: 'string' },
            emotional_tag: { type: 'string' },
            chapter_text: { type: 'string' },
          },
        },
      });

      const tags = [
        'femwell_fiction', `genre:${genre}`, `week:${weekStart}`,
        'length:long', 'in_progress', 'chapters_done:1',
      ];
      const now = new Date().toISOString();
      const saved = await base44.asServiceRole.entities.LifestyleItems.create({
        title: result.title,
        summary: result.summary,
        lede: result.chapter_text,
        emotional_tag: result.emotional_tag || '',
        author_name: 'FemWell Fiction',
        content_type: 'FICTION',
        media_type: 'ARTICLE',
        provider: 'FEMWELL_FICTION_WEEKLY',
        status: 'NEEDS_REVIEW', // draft — becomes PUBLISHED when chapter 4 is written
        category: 'Lifestyle',
        pub_date: now, published_at: now, ingested_at: now,
        content_url: '', tags, phase_tags: [],
      });

      console.log(`Started new story: ${result.title} (${genre}), Chapter 1/${TOTAL_CHAPTERS}`);
      return Response.json({ success: true, started: result.title, genre, chapter: 1, total: TOTAL_CHAPTERS });
    }

    // ── PERSONAL USER (short stories — still single invocation, gpt_5) ─────
    if (mode === 'personal_user') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const existing = await base44.asServiceRole.entities.LifestyleItems.filter(
        { provider: 'FEMWELL_FICTION_PERSONAL', status: 'PUBLISHED' }, '-pub_date', 100
      );
      const thisWeek = existing.filter(i =>
        Array.isArray(i.tags) &&
        i.tags.includes(`week:${weekStart}`) &&
        i.tags.includes(`user:${user.id}`)
      );

      if (thisWeek.length >= 3) {
        return Response.json({ success: true, message: 'Already generated', week_start: weekStart, generated: 0 });
      }

      const needed = 3 - thisWeek.length;
      let userContext = '';
      let allowMature = false;
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
        const profile = profiles[0];
        if (profile) {
          allowMature = !!profile.allow_mature_content;
          const parts = [];
          if (profile.goals?.length) parts.push(`Goals: ${profile.goals.join(', ')}`);
          if (profile.condition_flags?.length) parts.push(`Health context: ${profile.condition_flags.join(', ')}`);
          if (profile.followed_categories?.length) parts.push(`Interests: ${profile.followed_categories.join(', ')}`);
          userContext = parts.join('. ');
        }
      } catch {}

      const usedGenres = thisWeek.map(i => (i.tags || []).find(t => t.startsWith('genre:'))?.replace('genre:', '') || '').filter(Boolean);
      const available = PERSONAL_GENRES.filter(g => !usedGenres.includes(g));
      const useMature = mature && allowMature;

      const generated = [];
      // Generate only 1 per invocation to avoid timeout
      const genre = available[0] || PERSONAL_GENRES[generated.length % PERSONAL_GENRES.length];
      const isMature = useMature && MATURE_GENRES.includes(genre);
      const matureNote = isMature
        ? 'Adult fiction (18+). Romance and intimacy depicted with tasteful detail. Fade-to-black for sex acts. All characters are adults 18+.'
        : 'General adult audience. Romance may include emotional closeness but nothing sexually explicit.';
      const contextNote = userContext
        ? `Tailor themes lightly to this reader context: ${userContext}`
        : 'Write for a modern woman reader interested in connection, ambition, healing and self-discovery.';

      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: 'gpt_5',
          prompt: `Write original ${genre} short fiction for women readers. 700-900 words. Female protagonist. ${matureNote} ${contextNote}
Divide into 3 scenes with plain text headings "Scene 1", "Scene 2", "Scene 3". No markdown. No asterisks.
Return JSON: title (max 70 chars), summary (2-3 sentences, max 280 chars), body (full story), duration_label (e.g. "8 min read"), emotional_tag (one of: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief)`,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' }, summary: { type: 'string' }, body: { type: 'string' },
              duration_label: { type: 'string' }, emotional_tag: { type: 'string' },
            },
          },
        });

        const tags = ['femwell_fiction', `genre:${genre}`, `week:${weekStart}`, 'length:short', 'personal', `user:${user.id}`, 'complete'];
        if (isMature) tags.push('18+');
        const now = new Date().toISOString();
        const saved = await base44.asServiceRole.entities.LifestyleItems.create({
          title: result.title, summary: result.summary, lede: result.body,
          duration_label: result.duration_label, emotional_tag: result.emotional_tag || '',
          author_name: 'FemWell Fiction', content_type: 'FICTION', media_type: 'ARTICLE',
          provider: 'FEMWELL_FICTION_PERSONAL', status: 'PUBLISHED', category: 'Lifestyle',
          pub_date: now, published_at: now, ingested_at: now, content_url: '', tags, phase_tags: [],
        });
        generated.push({ id: saved.id, title: result.title, genre });
        console.log(`Generated personal fiction for ${user.id}: ${result.title} (${genre})`);
      } catch (e) {
        console.error(`Failed personal fiction (${genre}):`, e.message);
      }

      return Response.json({ success: true, week_start: weekStart, generated: generated.length, items: generated });
    }

    return Response.json({ error: 'Invalid mode. Use weekly_global or personal_user.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});