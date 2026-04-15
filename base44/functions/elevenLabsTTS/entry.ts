import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Replaced ElevenLabs with OpenAI TTS — same interface preserved
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, voice_id = 'nova' } = await req.json();
  if (!text) return Response.json({ error: 'text required' }, { status: 400 });

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  // Map common ElevenLabs voice names to OpenAI equivalents
  const voiceMap = {
    'Rachel': 'nova',
    'Bella': 'nova',
    'EXAVITQu4vr4xnSDxMaL': 'nova',
    'alloy': 'alloy', 'echo': 'echo', 'fable': 'fable',
    'onyx': 'onyx', 'nova': 'nova', 'shimmer': 'shimmer',
  };
  const openaiVoice = voiceMap[voice_id] || 'nova';

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice: openaiVoice, speed: 1.0 }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  return new Response(audioBuffer, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' } });
});