import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FICTION_GENRES = ['Romance', 'Romantic Suspense', 'Thriller', 'Mystery', 'Fantasy', 'Contemporary', 'Historical', 'Literary', 'Drama'];
const PERSONAL_GENRES = ['Contemporary', 'Romance', 'Drama', 'Literary', 'Thriller', 'Fantasy', 'Romantic Suspense', 'Mystery', 'Historical'];
const MATURE_GENRES = ['Romance', 'Romantic Suspense'];

function getMondayWeekStart() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().split('T')[0];
}

async function generateFiction(base44, { genre, weekStart, isLong, userContext, mature, userId }) {
  const wordCount = isLong ? '2800-3500' : '1400-1800';
  const structure = isLong
    ? 'Divide the story into 4 chapters with plain text headings "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4". No markdown, no asterisks, no bold, no bullet points.'
    : 'Divide the story into 3 scenes with plain text headings "Scene 1", "Scene 2", "Scene 3". No markdown, no asterisks, no bullet points.';

  const matureNote = mature
    ? 'This is adult fiction (18+). Romance and intimacy may be depicted with tasteful, emotionally rich detail. Sex acts should use a fade-to-black approach. No explicit anatomical language. All characters are adults aged 18 or older.'
    : 'Keep content for a general adult audience. Romance may include kissing and emotional closeness but nothing sexually explicit.';

  const contextNote = userContext
    ? `Tailor themes lightly to this reader context: ${userContext}`
    : 'Write for a modern woman reader interested in connection, ambition, healing and self-discovery.';

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude_sonnet_4_6',
    prompt: `You are a fiction editor for FemWell, a women's wellness and lifestyle platform. Write original ${genre} fiction for women readers.

Genre: ${genre}
Length: ${wordCount} words
${structure}
${matureNote}
${contextNote}

The story must feature a female protagonist. Themes should connect to women's lived experience: relationships, identity, ambition, healing, connection, or growth. Write compelling, publishable fiction with a strong voice, real emotional stakes, and a satisfying arc. The writing should feel like quality literary fiction, not generic romance.

Return JSON with these exact keys:
- title: compelling story title (max 70 characters, no trailing punctuation)
- summary: 2 to 3 sentence synopsis of the story (max 280 characters)
- body: the complete story text (${wordCount} words). Plain text only. Chapter or scene headings as plain text lines. Absolutely no markdown formatting.
- duration_label: estimated reading time as a string, for example "18 min read" or "55 min read"
- emotional_tag: one of exactly these values: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        body: { type: 'string' },
        duration_label: { type: 'string' },
        emotional_tag: { type: 'string' },
      },
    },
  });

  const tags = [
    'femwell_fiction',
    `genre:${genre}`,
    isLong ? 'length:long' : 'length:short',
    `week:${weekStart}`,
  ];
  if (mature) tags.push('18+');
  if (userId) {
    tags.push('personal');
    tags.push(`user:${userId}`);
  }

  const now = new Date().toISOString();
  const saved = await base44.asServiceRole.entities.LifestyleItems.create({
    title: result.title,
    summary: result.summary,
    lede: result.body,
    duration_label: result.duration_label,
    emotional_tag: result.emotional_tag || '',
    author_name: 'FemWell Fiction',
    content_type: 'FICTION',
    media_type: 'ARTICLE',
    provider: userId ? 'FEMWELL_FICTION_PERSONAL' : 'FEMWELL_FICTION_WEEKLY',
    status: 'PUBLISHED',
    category: 'Lifestyle',
    pub_date: now,
    published_at: now,
    ingested_at: now,
    content_url: '',
    tags,
    phase_tags: [],
  });
  return { id: saved.id, title: result.title, genre };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { mode, mature } = body;

    const weekStart = getMondayWeekStart();

    if (mode === 'weekly_global') {
      const existing = await base44.asServiceRole.entities.LifestyleItems.filter(
        { provider: 'FEMWELL_FICTION_WEEKLY', status: 'PUBLISHED' }, '-pub_date', 50
      );
      const thisWeek = existing.filter(i =>
        Array.isArray(i.tags) && i.tags.includes(`week:${weekStart}`) && i.tags.includes('length:long')
      );

      if (thisWeek.length >= 5) {
        return Response.json({ success: true, message: 'Already generated', week_start: weekStart, generated: 0 });
      }

      // Generate ONE story per invocation to avoid timeout — automation runs daily Mon-Fri
      const usedGenres = thisWeek.map(i => (i.tags || []).find(t => t.startsWith('genre:'))?.replace('genre:', '') || '').filter(Boolean);
      const available = FICTION_GENRES.filter(g => !usedGenres.includes(g));
      const genre = available[0] || FICTION_GENRES[thisWeek.length % FICTION_GENRES.length];

      const generated = [];
      try {
        const r = await generateFiction(base44, { genre, weekStart, isLong: true, mature: false });
        generated.push(r);
        console.log(`Generated weekly fiction: ${r.title} (${genre})`);
      } catch (e) {
        console.error(`Failed to generate ${genre}:`, e.message);
      }

      return Response.json({ success: true, week_start: weekStart, generated: generated.length, items: generated });
    }

    if (mode === 'personal_user') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const existing = await base44.asServiceRole.entities.LifestyleItems.filter(
        { provider: 'FEMWELL_FICTION_PERSONAL', status: 'PUBLISHED' }, '-pub_date', 100
      );
      const thisWeek = existing.filter(i =>
        Array.isArray(i.tags) &&
        i.tags.includes(`week:${weekStart}`) &&
        i.tags.includes('length:short') &&
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
      const genresToUse = available.slice(0, Math.max(needed, 2));

      const useMature = mature && allowMature;
      const generated = [];
      for (let i = 0; i < needed; i++) {
        const genre = genresToUse[i] || PERSONAL_GENRES[i % PERSONAL_GENRES.length];
        const isMature = useMature && MATURE_GENRES.includes(genre);
        try {
          const r = await generateFiction(base44, { genre, weekStart, isLong: false, userContext, mature: isMature, userId: user.id });
          generated.push(r);
          console.log(`Generated personal fiction for ${user.id}: ${r.title} (${genre})`);
        } catch (e) {
          console.error(`Failed to generate personal ${genre}:`, e.message);
        }
      }

      return Response.json({ success: true, week_start: weekStart, generated: generated.length, items: generated });
    }

    return Response.json({ error: 'Invalid mode. Use weekly_global or personal_user.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});