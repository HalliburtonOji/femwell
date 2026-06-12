import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Timeout guard — an awaited platform read/write that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_key, content_id, duration_seconds, target_seconds, completion_source, notes } = await req.json();

    if (!content_id && !content_key) {
      return Response.json({ error: 'content_id or content_key required' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Anti-duplicate: check for existing record today
    const existing = await withTimeout(base44.entities.ContentHistory.filter({
      user_id: user.id,
      session_date: todayStr,
      is_deleted: false,
      ...(content_id ? { content_id } : { content_key }),
    }), 2500, 'filter').catch(() => []);

    const record = {
      user_id: user.id,
      content_id: content_id || '',
      content_key: content_key || '',
      completed_at: new Date().toISOString(),
      session_date: todayStr,
      duration_seconds: duration_seconds || 0,
      target_seconds: target_seconds || 0,
      completion_method: 'MANUAL',
      completion_source: completion_source || 'CONTENT_PLAYER',
      notes: notes || '',
      is_deleted: false,
    };

    let result;
    if (existing.length > 0 && !existing[0].is_deleted) {
      // Update existing
      result = await withTimeout(base44.entities.ContentHistory.update(existing[0].id, record), 6000, 'update');
    } else {
      result = await withTimeout(base44.entities.ContentHistory.create(record), 6000, 'create');
    }

    return Response.json({ success: true, record: result });
  } catch (error: any) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});