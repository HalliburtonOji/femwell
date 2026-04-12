import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled worker: runs every 10 minutes.
// Advances one step per pending FictionWork per run (keeps execution short).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const sb = base44.asServiceRole;

    // Fetch up to 5 non-published works to process
    const allWorks = await sb.entities.FictionWork.list('-created_at', 20);
    const pending = allWorks.filter(w => ['OUTLINE_PENDING', 'CHAPTERS_PENDING', 'ASSEMBLING'].includes(w.status)).slice(0, 5);

    const results = [];
    for (const work of pending) {
      let res;
      if (work.status === 'OUTLINE_PENDING') {
        res = await sb.functions.invoke('generateFictionOutline', { work_id: work.id }).catch(e => ({ error: e.message }));
      } else if (work.status === 'CHAPTERS_PENDING') {
        res = await sb.functions.invoke('generateNextChapter', { work_id: work.id }).catch(e => ({ error: e.message }));
      } else if (work.status === 'ASSEMBLING') {
        res = await sb.functions.invoke('assembleFictionWork', { work_id: work.id }).catch(e => ({ error: e.message }));
      }
      results.push({ work_id: work.id, status: work.status, result: res });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});