import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FICTION_PROVIDERS = new Set([
  'FEMWELL_FICTION_WEEKLY',
  'FEMWELL_FICTION_PERSONAL',
]);

const SYSTEM_PROMPT = `You are continuing a short novella for FemWell, a UK women's wellness app.
Voice: warm, literary, present-tense or past-tense (match what came before), 500-700 words per chapter, no Markdown, no Chapter heading inside the body.
Themes: relationships, returning home, midlife thresholds, grief, motherhood.
UK setting. No emoji. Year-9 reading level for the action; literary cadence in description.
Each chapter ends on a small, quiet cliffhanger — not a melodramatic one.
The final chapter ends with resolution.`;

function chapterContext(ch) {
  const words = (ch.body || '').split(/\s+/);
  const first = words.slice(0, 400).join(' ');
  const last  = words.slice(-300).join(' ');
  return `--- ${ch.title} ---\n${first}${words.length > 700 ? '\n...\n' + last : ''}`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const { item_id, target_chapters = 5 } = payload || {};
  if (!item_id) return Response.json({ error: 'item_id required' }, { status: 400 });

  const sb = base44.asServiceRole;

  // Load the record
  const rows = await sb.entities.LifestyleItems.filter({ id: item_id }, undefined, 1).catch(() => []);
  const item = rows[0];
  if (!item) return Response.json({ error: 'Item not found' }, { status: 404 });
  if (item.content_type !== 'FICTION' && !FICTION_PROVIDERS.has(item.provider)) {
    return Response.json({ error: 'Not a fiction item' }, { status: 422 });
  }

  // Seed chapters_json from lede if not yet present
  let chapters = Array.isArray(item.chapters_json) && item.chapters_json.length > 0
    ? [...item.chapters_json]
    : [{ title: 'Chapter 1', body: item.lede || item.summary || '' }];

  const target = Math.max(1, Math.min(Number(target_chapters) || 5, 12));
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return Response.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });

  while (chapters.length < target) {
    const n = chapters.length + 1;
    const storyContext = chapters.map(chapterContext).join('\n\n');
    const userPrompt = `Story so far:\n${storyContext}\n\nSynopsis: ${item.summary || ''}\nWhy it matters: ${item.why_it_matters || ''}\n\nWrite only Chapter ${n}. This is${n === target ? ' the final chapter — end with resolution' : ' not the final chapter — end on a quiet cliffhanger'}.\nOutput JSON: { "title": "Chapter ${n} — <subtitle>", "body": "<text>" }`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text().catch(() => aiRes.status);
      return Response.json({ error: `OpenAI error: ${err}` }, { status: 502 });
    }

    const aiData = await aiRes.json();
    const raw = aiData?.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json({ error: 'Could not parse OpenAI JSON' }, { status: 502 });
    }

    const newChapter = {
      title: parsed.title || `Chapter ${n}`,
      body: parsed.body || '',
    };

    chapters.push(newChapter);

    // Save after each chapter so a timeout doesn't lose prior work
    await sb.entities.LifestyleItems.update(item_id, { chapters_json: chapters });
  }

  return Response.json({ ok: true, chapters_count: chapters.length });
});