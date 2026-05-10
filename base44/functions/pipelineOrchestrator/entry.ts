import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// -- Inlined helper: structured ingest error log (matches Phase 1+2 pattern) --
async function logIngestError(base44, function_name, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name,
      stage,
      source_identifier: ctx.source_identifier || '',
      item_id: ctx.item_id || '',
      error_message: e?.message || String(err),
      error_stack: e?.stack || '',
      raw_payload: ctx.raw_payload ? JSON.stringify(ctx.raw_payload).slice(0, 4000) : '',
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch (logErr) {
    console.error(`[ingest-error-log-failed] ${function_name} ${stage}`, logErr?.message);
  }
  console.error(`[ingest-error] ${function_name} ${stage}`, err?.message || err);
}

async function runPhase(base44, name, fnName, body) {
  const startedAt = new Date().toISOString();
  try {
    const result = await base44.asServiceRole.functions.invoke(fnName, body || {});
    await logIngestError(base44, 'pipelineOrchestrator', `phase:${name}:ok`,
      { source_identifier: fnName, raw_payload: { startedAt, result: result?.data || result } },
      new Error(`phase ok: ${name}`));
    return { ok: true, result };
  } catch (err) {
    await logIngestError(base44, 'pipelineOrchestrator', `phase:${name}:fail`,
      { source_identifier: fnName, raw_payload: { startedAt } }, err);
    return { ok: false, err: err?.message || String(err) };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  // Allow service-role / scheduler invocations + admin manual runs:
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const startedAt = new Date().toISOString();
  const phases = [];

  // Phase 1: ingestRSS
  phases.push({ name: 'ingestRSS', ...(await runPhase(base44, 'ingestRSS', 'ingestRSS')) });

  // Phase 2: ingestYouTubeChannels
  phases.push({ name: 'ingestYouTubeChannels', ...(await runPhase(base44, 'ingestYouTubeChannels', 'ingestYouTubeChannels')) });

  // Phase 3: summarizeLifestyleItem (drain the queue)
  phases.push({ name: 'summarizeLifestyleItem', ...(await runPhase(base44, 'summarizeLifestyleItem', 'summarizeLifestyleItem', { batch_size: 50 })) });

  const finishedAt = new Date().toISOString();
  return Response.json({
    started_at: startedAt,
    finished_at: finishedAt,
    phases,
    ok: phases.every(p => p.ok),
  });
});