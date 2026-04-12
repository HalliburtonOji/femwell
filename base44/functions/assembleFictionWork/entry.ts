import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { work_id } = body;
    if (!work_id) return Response.json({ error: 'work_id required' }, { status: 400 });

    const sb = base44.asServiceRole;
    const works = await sb.entities.FictionWork.filter({ id: work_id }).catch(() => []);
    const work = works[0];
    if (!work) return Response.json({ error: 'Work not found' }, { status: 404 });
    if (work.status !== 'ASSEMBLING') return Response.json({ skipped: true, status: work.status });

    const chapters = await sb.entities.FictionChapter.filter({ work_id: work.id });
    const ordered = chapters.sort((a, b) => a.chapter_index - b.chapter_index);
    const fullText = ordered.map(c => `${c.title}\n\n${c.text || ''}`).join('\n\n---\n\n');

    // Tags
    const tags = ['fiction', work.genre?.toLowerCase().replace(/\s+/g, '-'), work.week_start, 'length:long'];
    if (work.mature_allowed) tags.push('18+');
    if (work.scope === 'PERSONAL_USER') tags.push('personal');

    const provider = work.scope === 'PERSONAL_USER' ? 'FEMWELL_FICTION_PERSONAL' : 'FEMWELL_FICTION_WEEKLY';

    let lifestyleItem;
    if (work.lifestyle_item_id) {
      await sb.entities.LifestyleItems.update(work.lifestyle_item_id, {
        title: work.title,
        lede: fullText,
        status: 'PUBLISHED',
        pub_date: new Date().toISOString().split('T')[0],
        tags,
      });
      lifestyleItem = { id: work.lifestyle_item_id };
    } else {
      lifestyleItem = await sb.entities.LifestyleItems.create({
        title: work.title,
        summary: work.synopsis,
        lede: fullText,
        content_type: 'FICTION',
        provider,
        status: 'PUBLISHED',
        pub_date: new Date().toISOString().split('T')[0],
        tags,
        content_url: `internal://fiction/${work.id}`,
      });
    }

    await sb.entities.FictionWork.update(work.id, {
      status: 'PUBLISHED',
      lifestyle_item_id: lifestyleItem.id,
      updated_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, lifestyle_item_id: lifestyleItem.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});