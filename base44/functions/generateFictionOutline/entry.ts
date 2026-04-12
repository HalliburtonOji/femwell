import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { work_id } = body;
    if (!work_id) return Response.json({ error: 'work_id required' }, { status: 400 });

    // Use service role for global works
    const sb = base44.asServiceRole;
    const works = await sb.entities.FictionWork.filter({ id: work_id }).catch(() => []);
    const work = works[0];
    if (!work) return Response.json({ error: 'Work not found' }, { status: 404 });
    if (work.status !== 'OUTLINE_PENDING') return Response.json({ skipped: true, status: work.status });

    const outline = await sb.integrations.Core.InvokeLLM({
      prompt: `You are a literary author creating an outline for a short women's fiction work.
Genre: ${work.genre}
Target chapters: ${work.target_chapters}
Audience: Adult women. Themes: identity, relationships, growth, everyday life.
Mature content allowed: ${work.mature_allowed ? 'yes' : 'no'}.
No emoji in any field.

Return JSON only:
{
  "title": "story title",
  "synopsis": "2-sentence synopsis",
  "chapters": [
    { "index": 1, "title": "chapter title", "beat": "one-sentence summary of what happens" }
  ]
}
Provide exactly ${work.target_chapters} chapters.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          synopsis: { type: 'string' },
          chapters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                index: { type: 'number' },
                title: { type: 'string' },
                beat: { type: 'string' },
              },
            },
          },
        },
        required: ['title', 'synopsis', 'chapters'],
      },
    });

    // Save outline
    await sb.entities.FictionWork.update(work.id, {
      title: outline.title,
      synopsis: outline.synopsis,
      outline_json: JSON.stringify(outline),
      status: 'CHAPTERS_PENDING',
      updated_at: new Date().toISOString(),
    });

    // Create chapter rows
    for (const ch of outline.chapters) {
      await sb.entities.FictionChapter.create({
        work_id: work.id,
        chapter_index: ch.index,
        title: ch.title,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      });
    }

    return Response.json({ ok: true, title: outline.title, chapters: outline.chapters.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});