import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_key, voice_script_key, voice_id, dynamic_text, voice_profile_key: dynamic_profile_key } = await req.json();
    if (!voice_script_key && !dynamic_text) return Response.json({ error: 'voice_script_key or dynamic_text required' }, { status: 400 });

    // Map ElevenLabs voice IDs to OpenAI voices (fallback)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const openaiVoice = 'nova'; // calm, warm female voice — closest to ElevenLabs Bella

    let scriptText = dynamic_text || null;
    let scriptProfileKey = dynamic_profile_key || null;

    if (voice_script_key && !scriptText) {
      const scripts = await base44.asServiceRole.entities.VoiceScripts.filter({ voice_script_key });
      if (!scripts.length) return Response.json({ error: 'Script not found' }, { status: 404 });
      const script = scripts[0];

      if (script.audio_data) {
        return Response.json({ audio_data_url: script.audio_data, cached: true });
      }

      scriptText = script.text;
      scriptProfileKey = script.voice_profile_key || scriptProfileKey;
    }

    let speed = 0.9;
    if (scriptProfileKey) {
      const profiles = await base44.asServiceRole.entities.VoiceProfiles.filter({ profile_key: scriptProfileKey });
      if (profiles.length && profiles[0].speed) speed = Math.min(Math.max(profiles[0].speed, 0.25), 4.0);
    }

    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: scriptText,
        voice: openaiVoice,
        speed,
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return Response.json({ error: `OpenAI TTS error: ${err}` }, { status: 500 });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audio_data_url = `data:audio/mpeg;base64,${base64}`;

    return Response.json({ audio_data_url, cached: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});