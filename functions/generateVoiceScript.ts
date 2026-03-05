import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

const TYPE_PROMPTS = {
  BREATHWORK: `You are a calm, warm breathwork guide. Write a short guided breathwork script (60-90 seconds when read aloud at a slow pace).
The script should:
- Open with a warm, grounding welcome that names the specific exercise (2-3 sentences)
- Briefly explain the breathing technique and its benefit for women's health
- Guide the listener through 1-2 rounds with gentle, specific cues matching the pattern
- Close with an encouraging, grounding outro
Tone: calm, warm, reassuring. No filler words. Speak directly to the listener using "you".`,

  MEDITATION: `You are a serene meditation guide. Write a short guided meditation script (90-120 seconds when read aloud).
The script should:
- Open with a grounding invitation specific to this meditation's theme
- Guide the listener to relax their body and breath
- Offer a simple mindfulness anchor or visualization directly relevant to this specific topic
- Close gently, inviting the listener back
Tone: slow, peaceful, warm. Use "you" throughout. Make it unique to this specific meditation — not generic.`,

  GUIDE: `You are a supportive wellness coach. Write a short educational voice guide (60-90 seconds when read aloud).
The script should:
- Open with a clear, engaging intro that references the specific topic
- Share 2-3 key insights or guidance points directly relevant to this content
- Close with a practical takeaway or encouragement
Tone: clear, warm, informative. Use "you" throughout.`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_key, content_id } = await req.json();
    if (!content_key && !content_id) return Response.json({ error: 'content_key or content_id required' }, { status: 400 });

    // Fetch the content item
    let items = [];
    if (content_key) {
      items = await base44.asServiceRole.entities.ContentItems.filter({ content_key });
    } else {
      items = await base44.asServiceRole.entities.ContentItems.filter({ id: content_id });
    }
    if (!items.length) return Response.json({ error: 'Content item not found' }, { status: 404 });
    const item = items[0];

    // Check if this content already has its own unique generated script (starts with "gen_")
    if (item.voice_script_key && item.voice_script_key.startsWith('gen_')) {
      const existing = await base44.asServiceRole.entities.VoiceScripts.filter({ voice_script_key: item.voice_script_key });
      if (existing.length) {
        return Response.json({ voice_script_key: item.voice_script_key, text: existing[0].text, already_existed: true });
      }
    }

    // Build the AI prompt — be specific to THIS content item
    const systemPrompt = TYPE_PROMPTS[item.content_type] || TYPE_PROMPTS.GUIDE;
    const userPrompt = `Content title: "${item.title}"
Content type: ${item.content_type}
${item.level ? `Level: ${item.level}` : ''}
${item.summary ? `Summary: ${item.summary}` : ''}
${item.tags ? `Tags: ${item.tags}` : ''}
${item.guided_config ? `Breathing pattern config (JSON): ${item.guided_config}` : ''}
${item.modifications ? `Modifications: ${item.modifications}` : ''}

Generate a unique, personalized voice script SPECIFICALLY for this content titled "${item.title}". 
The script must reference this specific practice by name and feel tailored to it — not generic.
Output ONLY the script text — no titles, no labels, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 600,
    });

    const scriptText = completion.choices[0].message.content.trim();

    // Generate a unique script key tied to this specific content item
    const scriptKey = `gen_${item.content_key || item.id}_${Date.now()}`;

    // Save the generated script
    await base44.asServiceRole.entities.VoiceScripts.create({
      voice_script_key: scriptKey,
      title: `Auto-generated: ${item.title}`,
      voice_profile_key: item.voice_profile_key || 'vp_calm_coach',
      text: scriptText,
    });

    // Update the ContentItem to link to its own unique script
    await base44.asServiceRole.entities.ContentItems.update(item.id, {
      voice_script_key: scriptKey,
    });

    return Response.json({ voice_script_key: scriptKey, text: scriptText, already_existed: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});