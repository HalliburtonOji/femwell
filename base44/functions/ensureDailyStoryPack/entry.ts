import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
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

    const body = await req.json().catch(() => ({}));
    const dayKey = body.day_key || new Date().toISOString().split('T')[0];

    // Check for existing pack
    const existing = await withTimeout(base44.entities.StoryPack.filter({ user_id: user.id, day_key: dayKey }), 2500, 'read').catch(() => []);
    if (existing[0]) return Response.json(existing[0]);

    // Create pack
    const now = new Date().toISOString();
    const pack = await withTimeout(base44.entities.StoryPack.create({
      user_id: user.id,
      day_key: dayKey,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    }), 6000, 'write');

    // Create 5 empty StoryItem rows
    for (let i = 1; i <= 5; i++) {
      await withTimeout(base44.entities.StoryItem.create({
        pack_id: pack.id,
        slot_index: i,
        item_status: 'PENDING',
      }), 6000, 'write').catch(() => null);
    }

    return Response.json(pack);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});