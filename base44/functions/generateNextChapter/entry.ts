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
    if (work.status !== 'CHAPTERS_PENDING') return Response.json({ skipped: true, status: work.status });

    const chapters = await sb.entities.FictionChapter.filter({ work_id: work.id });
    const pending = chapters.sort((a, b) => a.chapter_index - b.chapter_index).find(c => c.status === 'PENDING');
    if (!pending) {
      // All done — set assembling
      await sb.entities.FictionWork.update(work.id, { status: 'ASSEMBLING', updated_at: new Date().toISOString() });
      return Response.json({ done: true });
    }

    const outline = work.outline_json ? JSON.parse(work.outline_json) : {};
    const chapterBeat = outline.chapters?.find(c => c.index === pending.chapter_index)?.beat || '';
    const doneChapters = chapters.filter(c => c.status === 'DONE').sort((a, b) => a.chapter_index - b.chapter_index);
    const prevText = doneChapters.slice(-1)[0]?.text?.slice(-400) || '';

    const chapterText = await sb.integrations.Core.InvokeLLM({
      prompt: `You are writing chapter ${pending.chapter_index} of "${work.title}" (${work.genre}).
Chapter title: "${pending.title}"
Story beat: ${chapterBeat}
Synopsis: ${work.synopsis}
${prevText ? `End of previous chapter for continuity:\n"...${prevText}"` : ''}

Write only the chapter text. No chapter heading, no title, no notes.
Length: 600-900 words. Style: literary, immersive, women's fiction voice.
Mature content allowed: ${work.mature_allowed ? 'yes' : 'no'}.
No emoji.`,
    });

    await sb.entities.FictionChapter.update(pending.id, {
      text: chapterText,
      status: 'DONE',
    });

    // Check if all chapters are done
    const updatedChapters = await sb.entities.FictionChapter.filter({ work_id: work.id });
    if (updatedChapters.every(c => c.status === 'DONE' || c.id === pending.id)) {
      await sb.entities.FictionWork.update(work.id, { status: 'ASSEMBLING', updated_at: new Date().toISOString() });
    }

    return Response.json({ ok: true, chapter: pending.chapter_index });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});