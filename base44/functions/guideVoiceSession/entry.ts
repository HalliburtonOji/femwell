import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { instructions, voice = 'shimmer', turn_detection_mode = 'server_vad' } = body;

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return Response.json({ error: 'Voice not configured.' }, { status: 500 });

    const sessionRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice,
        instructions: instructions || 'You are a warm, intelligent, action-oriented wellness guide.',
        modalities: ['text', 'audio'],
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: turn_detection_mode === 'semantic' ? 1200 : 700,
        },
      }),
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      console.error('OpenAI session error:', errText);
      return Response.json({ error: 'Could not start voice session. Please try again.' }, { status: 502 });
    }

    const session = await sessionRes.json();
    return Response.json({
      client_secret: session.client_secret,
      session_id: session.id,
      expires_at: session.expires_at,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});