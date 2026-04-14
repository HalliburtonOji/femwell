import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    const existing = await base44.entities.ContentHistory.filter({
      user_id: user.id,
      session_date: todayStr,
      is_deleted: false,
      ...(content_id ? { content_id } : { content_key }),
    });

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
      result = await base44.entities.ContentHistory.update(existing[0].id, record);
    } else {
      result = await base44.entities.ContentHistory.create(record);
    }

    return Response.json({ success: true, record: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});