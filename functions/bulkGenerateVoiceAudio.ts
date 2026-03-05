import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella — calm, warm female voice

const TYPE_PROMPTS = {
  BREATHWORK: `You are a warm, soothing breathwork guide for women's wellness. Write an engaging guided breathwork script (90-120 seconds when read slowly).
Structure:
- Warm personal welcome referencing this specific exercise by name (2-3 sentences)
- Explain the benefit of this specific breathing technique for the body and mind
- Walk through the breathing pattern with specific, gentle timing cues
- Encourage the listener with warmth as they complete the practice
- Close with a grounding, uplifting outro
Tone: calm, intimate, reassuring. Use "you". Make every word count — this should feel like a trusted guide.`,

  MEDITATION: `You are a serene, compassionate meditation teacher for women. Write an immersive guided meditation script (2-3 minutes when read slowly).
Structure:
- Begin with a grounding arrival — invite the listener to settle in, unique to this meditation's theme
- Guide a gentle body relaxation or breath focus
- Lead a vivid, calming visualization or mindfulness anchor specific to this meditation's title and purpose
- Gently bring the listener back, feeling refreshed
- Close with warmth and encouragement
Tone: slow, dreamy, peaceful. Use "you". Make it feel deeply personal and specific — not generic.`,

  GUIDE: `You are a warm, knowledgeable wellness coach for women. Write an engaging educational voice guide (90-120 seconds when read at a natural pace).
Structure:
- Hook the listener with a relatable opening tied to this specific topic
- Share 2-3 genuinely useful, specific insights or guidance points about this practice
- Include one practical tip they can use immediately
- Close with encouragement and a memorable takeaway
Tone: conversational, warm, clear. Use "you". Be informative but never clinical.`,

  WORKOUT: `You are an energetic, encouraging fitness coach for women. Write a motivating workout intro script (60-90 seconds when read at pace).
Structure:
- Energize the listener with a warm, pumped-up opening referencing this specific workout
- Briefly explain what muscles or goals this workout targets and why it matters
- Give 1-2 tips for getting the most from this session
- End with a confident, motivating send-off
Tone: upbeat, supportive, empowering. Use "you".`,

  MOBILITY: `You are a gentle, supportive movement and mobility coach. Write an inviting mobility session intro (60-90 seconds when read slowly).
Structure:
- Welcome the listener warmly, acknowledging how their body might feel today
- Explain what this specific mobility session will release or open up
- Encourage them to move at their own pace, honour their body
- Set a gentle, permission-giving tone for the session ahead
Tone: soft, encouraging, body-positive. Use "you".`,
};

async function generateScript(item) {
  const systemPrompt = TYPE_PROMPTS[item.content_type] || TYPE_PROMPTS.GUIDE;
  const userPrompt = `Content title: "${item.title}"
Content type: ${item.content_type}
Duration: ${item.duration_minutes ? item.duration_minutes + ' minutes' : 'unknown'}
${item.level ? `Level: ${item.level}` : ''}
${item.summary ? `Summary: ${item.summary}` : ''}
${item.tags ? `Tags: ${item.tags}` : ''}
${item.guided_config ? `Breathing config: ${item.guided_config}` : ''}

Write a unique, engaging voice script SPECIFICALLY for "${item.title}". Reference the title and any specific technique by name. Make it feel personal and tailored.
Output ONLY the spoken script text — no titles, labels, or stage directions.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 700,
  });

  return completion.choices[0].message.content.trim();
}

async function generateAudio(scriptText) {
  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: scriptText,
      model_id: 'eleven_turbo_v2',
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.85,
        style: 0.1,
        use_speaker_boost: true,
        speed: 0.82,
      },
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    throw new Error(`ElevenLabs error: ${err}`);
  }

  return await ttsRes.arrayBuffer();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { dry_run = false, content_types = ['BREATHWORK', 'MEDITATION', 'GUIDE', 'WORKOUT', 'MOBILITY'] } = body;

    // Fetch all content items that are GUIDED (not VIDEO) or have no embed_url
    const allItems = await base44.asServiceRole.entities.ContentItems.list('-created_date', 200);
    
    // Filter to only non-video guided content items
    const targets = allItems.filter(item => {
      if (item.play_mode === 'VIDEO') return false;
      if (item.embed_url && !item.guided_config) return false; // pure video, skip
      if (!content_types.includes(item.content_type)) return false;
      return true;
    });

    if (dry_run) {
      return Response.json({ 
        dry_run: true, 
        total: targets.length, 
        items: targets.map(i => ({ id: i.id, title: i.title, type: i.content_type, has_audio: !!i.audio_file_url }))
      });
    }

    const results = [];
    const errors = [];

    for (const item of targets) {
      try {
        // 1. Clear old voice script key (but keep video embed_url intact)
        await base44.asServiceRole.entities.ContentItems.update(item.id, {
          voice_script_key: null,
          audio_file_url: null,
        });

        // 2. Delete old VoiceScript if it existed
        if (item.voice_script_key) {
          const oldScripts = await base44.asServiceRole.entities.VoiceScripts.filter({ voice_script_key: item.voice_script_key });
          for (const s of oldScripts) {
            await base44.asServiceRole.entities.VoiceScripts.delete(s.id);
          }
        }

        // 3. Generate new GPT script
        const scriptText = await generateScript(item);

        // 4. Save new VoiceScript record
        const scriptKey = `gen_${item.content_key || item.id}_${Date.now()}`;
        await base44.asServiceRole.entities.VoiceScripts.create({
          voice_script_key: scriptKey,
          title: `Audio: ${item.title}`,
          voice_profile_key: 'vp_calm_coach',
          text: scriptText,
        });

        // 5. Generate ElevenLabs audio
        const audioBuffer = await generateAudio(scriptText);

        // 6. Upload via Base44 UploadFile integration (pass Blob directly)
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioBlob });
        const audioUrl = uploadResult?.file_url;

        if (!audioUrl) throw new Error('Failed to generate audio URL');

        // 7. Update ContentItem with audio URL and script key
        await base44.asServiceRole.entities.ContentItems.update(item.id, {
          voice_script_key: scriptKey,
          audio_file_url: audioUrl,
        });

        results.push({ id: item.id, title: item.title, audio_file_url: audioUrl });
        console.log(`✓ Done: ${item.title}`);

      } catch (err) {
        console.error(`✗ Failed: ${item.title} — ${err.message}`);
        errors.push({ id: item.id, title: item.title, error: err.message });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      results,
      errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});