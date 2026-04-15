/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice = 'nova', speed = 0.9, cacheKey } = await req.json();
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) return Response.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });

    // Call OpenAI TTS
    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice,
        speed,
        response_format: 'mp3',
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return Response.json({ error: `OpenAI TTS error: ${err}` }, { status: 500 });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const uint8 = new Uint8Array(audioBuffer);
    const base64 = btoa(String.fromCharCode(...uint8));
    const audioDataUrl = `data:audio/mpeg;base64,${base64}`;

    // Upload to storage via base44 integrations
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    let audio_url = null;
    try {
      const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
      audio_url = uploadResult.file_url;
    } catch {
      // fallback: return data URL
      audio_url = audioDataUrl;
    }

    return Response.json({ audio_url, cache_key: cacheKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});