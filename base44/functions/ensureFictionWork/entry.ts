import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GENRES = ['Literary fiction', 'Romantic drama', 'Psychological thriller', 'Contemporary coming-of-age', 'Quiet domestic fiction', 'Magical realism'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { scope, week_start } = body;
    const wk = week_start || getMonday();

    if (scope === 'WEEKLY_GLOBAL') {
      const existing = await base44.asServiceRole.entities.FictionWork.filter({ scope: 'WEEKLY_GLOBAL', week_start: wk });
      const needed = Math.max(0, 5 - existing.length);
      const created = [];
      for (let i = 0; i < needed; i++) {
        const genre = GENRES[(existing.length + i) % GENRES.length];
        const w = await base44.asServiceRole.entities.FictionWork.create({
          scope: 'WEEKLY_GLOBAL',
          week_start: wk,
          genre,
          target_chapters: 6,
          status: 'OUTLINE_PENDING',
          mature_allowed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        created.push(w);
      }
      return Response.json({ existing: existing.length, created: created.length });
    }

    // PERSONAL_USER
    if (!user.id) return Response.json({ error: 'user required' }, { status: 400 });
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
    const profile = profiles[0] || {};
    const existing = await base44.entities.FictionWork.filter({ scope: 'PERSONAL_USER', user_id: user.id, week_start: wk });
    const needed = Math.max(0, 3 - existing.length);
    const created = [];
    for (let i = 0; i < needed; i++) {
      const genre = GENRES[(existing.length + i) % GENRES.length];
      const w = await base44.entities.FictionWork.create({
        scope: 'PERSONAL_USER',
        user_id: user.id,
        week_start: wk,
        genre,
        target_chapters: 4,
        status: 'OUTLINE_PENDING',
        mature_allowed: profile.allow_mature_content || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      created.push(w);
    }
    return Response.json({ existing: existing.length, created: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}