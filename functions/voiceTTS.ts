import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_key, voice_script_key, voice_id, dynamic_text, voice_profile_key: dynamic_profile_key } = await req.json();
    if (!voice_script_key && !dynamic_text) return Response.json({ error: 'voice_script_key or dynamic_text required' }, { status: 400 });

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const DEFAULT_VOICE_ID = voice_id || 'EXAVITQu4vr4xnSDxMaL';

    let scriptText = dynamic_text || null;
    let scriptProfileKey = dynamic_profile_key || null;

    // Fetch voice script if key provided
    if (voice_script_key && !scriptText) {
      const scripts = await base44.asServiceRole.entities.VoiceScripts.filter({ voice_script_key });
      if (!scripts.length) return Response.json({ error: 'Script not found' }, { status: 404 });
      const script = scripts[0];
      scriptText = script.text;
      scriptProfileKey = script.voice_profile_key || scriptProfileKey;
    }

    // Fetch voice profile
    let profile = { speed: 0.85, stability: 0.85, similarity_boost: 0.85, style: 0, use_speaker_boost: true };
    if (scriptProfileKey) {
      const profiles = await base44.asServiceRole.entities.VoiceProfiles.filter({ profile_key: scriptProfileKey });
      if (profiles.length) profile = { ...profile, ...profiles[0] };
    }

    // Call ElevenLabs TTS
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: scriptText,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: profile.stability || 0.85,
          similarity_boost: profile.similarity_boost || 0.85,
          style: profile.style || 0,
          use_speaker_boost: profile.use_speaker_boost !== false,
          speed: profile.speed || 0.85,
        },
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return Response.json({ error: `ElevenLabs error: ${err}` }, { status: 500 });
    }

    // Stream audio back directly to the client — no caching in DB to avoid size limits
    const audioBuffer = await ttsRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audio_data_url = `data:audio/mpeg;base64,${base64}`;

    return Response.json({ audio_data_url, cached: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});