#!/usr/bin/env node
// scripts/base44-cli.mjs
//
// Tiny CLI wrapper around the @base44/sdk client so Code-Claude can read
// entities + invoke admin functions against the live femwell app without
// needing Halli to do it from a browser.
//
// Credentials come from .env.local (gitignored). Never commit a real key.
//
// Usage:
//   node scripts/base44-cli.mjs ping
//   node scripts/base44-cli.mjs count LifestyleItems media_type=PODCAST
//   node scripts/base44-cli.mjs list LifestyleItems media_type=PODCAST --limit 5
//   node scripts/base44-cli.mjs logs seedPodcasts --limit 50
//   node scripts/base44-cli.mjs orchestrator-phases
//   node scripts/base44-cli.mjs invoke pipelineOrchestrator --run_phase=seedPodcasts
//   node scripts/base44-cli.mjs invoke migrateSessionsToPractice
//   node scripts/base44-cli.mjs invoke backfillTikTokEmoji --dry_run

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Minimal .env.local loader ──────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ENV_PATH = join(__dirname, '..', '.env.local');
try {
  const raw = readFileSync(ENV_PATH, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch (err) {
  console.error('Could not load .env.local:', err.message);
  process.exit(1);
}

const APP_ID = process.env.BASE44_APP_ID;
const API_KEY = process.env.BASE44_API_KEY;
if (!APP_ID || !API_KEY) {
  console.error('Missing BASE44_APP_ID or BASE44_API_KEY in .env.local');
  process.exit(1);
}

// ── SDK client ─────────────────────────────────────────────────────────────
const { createClient } = await import('@base44/sdk');
// Auth shape: api_key header only. Entity reads + auth.me() work.
// Function invocation does NOT (base44 returns 500 "must be logged in"
// for function endpoints — they require a different auth audience).
// For function invokes, use `npx base44 exec` after one `base44 login`.
// Do NOT auto-load ~/.base44/auth/auth.json as `token` — that platform-
// scoped JWT is rejected at entity endpoints, breaking the reads this
// script exists for.
const base44 = createClient({
  appId: APP_ID,
  headers: { api_key: API_KEY },
});

// ── Helpers ────────────────────────────────────────────────────────────────
function parseKvPairs(args) {
  const filter = {};
  const flags = {};
  for (const a of args) {
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq < 0) { flags[a.slice(2)] = true; continue; }
      const k = a.slice(2, eq);
      const v = a.slice(eq + 1);
      flags[k] = /^\d+$/.test(v) ? Number(v) : (v === 'true' ? true : v === 'false' ? false : v);
      continue;
    }
    const eq = a.indexOf('=');
    if (eq < 0) continue;
    const k = a.slice(0, eq);
    const v = a.slice(eq + 1);
    filter[k] = /^\d+$/.test(v) ? Number(v) : v;
  }
  return { filter, flags };
}

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// ── Commands ───────────────────────────────────────────────────────────────
const [, , cmd, ...rest] = process.argv;

try {
  if (cmd === 'whoami') {
    const me = await base44.auth.me().catch(e => ({ _err: e.message, _resp: e.response?.data }));
    out({ me });
  } else if (cmd === 'ping') {
    // Smallest possible read — fetch 1 row of any entity to confirm auth + connection
    const rows = await base44.entities.LifestyleItems.list('-created_date', 1);
    out({ ok: true, sample_count: Array.isArray(rows) ? rows.length : 0, sample_first_keys: rows?.[0] ? Object.keys(rows[0]).slice(0, 8) : null });
  } else if (cmd === 'count') {
    const [entityName, ...rest2] = rest;
    if (!entityName) throw new Error('Usage: count <Entity> [key=value ...]');
    const { filter } = parseKvPairs(rest2);
    const rows = await base44.entities[entityName].filter(filter, '-created_date', 1000);
    out({ entity: entityName, filter, count: rows.length });
  } else if (cmd === 'list') {
    const [entityName, ...rest2] = rest;
    if (!entityName) throw new Error('Usage: list <Entity> [key=value ...] [--limit N]');
    const { filter, flags } = parseKvPairs(rest2);
    const limit = flags.limit || 10;
    const rows = await base44.entities[entityName].filter(filter, flags.order || '-created_date', limit);
    out({ entity: entityName, filter, returned: rows.length, rows });
  } else if (cmd === 'logs') {
    const [funcName, ...rest2] = rest;
    if (!funcName) throw new Error('Usage: logs <function_name> [--limit N]');
    const { flags } = parseKvPairs(rest2);
    const rows = await base44.entities.IngestErrorLog.filter(
      { function_name: funcName }, '-logged_at', flags.limit || 50,
    );
    const byStage = {};
    for (const r of rows) byStage[r.stage] = (byStage[r.stage] || 0) + 1;
    out({ function_name: funcName, returned: rows.length, by_stage: byStage, recent: rows.slice(0, 10).map(r => ({ stage: r.stage, at: r.logged_at, msg: (r.error_message || '').slice(0, 120) })) });
  } else if (cmd === 'orchestrator-phases') {
    const rows = await base44.entities.IngestErrorLog.filter(
      { function_name: 'pipelineOrchestrator' }, '-logged_at', 100,
    );
    const seen = {};
    for (const r of rows) {
      const s = r.stage || '';
      if (!s.startsWith('phase:')) continue;
      if (!seen[s]) seen[s] = { stage: s, last_at: r.logged_at, count: 0 };
      seen[s].count += 1;
    }
    out({ total: rows.length, phases: Object.values(seen) });
  } else if (cmd === 'invoke') {
    const [funcName, ...rest2] = rest;
    if (!funcName) throw new Error('Usage: invoke <function_name> [--key=value ...]');
    const { flags } = parseKvPairs(rest2);
    if (funcName === 'pipelineOrchestrator' && flags.run_phase) {
      const res = await base44.functions.invoke(funcName, { run_phase: flags.run_phase });
      out({ invoked: funcName, run_phase: flags.run_phase, response: res });
    } else {
      const body = { ...flags };
      delete body.limit;
      const res = await base44.functions.invoke(funcName, body);
      out({ invoked: funcName, body, response: res });
    }
  } else if (cmd === 'fetch-fn') {
    const [funcName, ...rest2] = rest;
    if (!funcName) throw new Error('Usage: fetch-fn <function_name> [--key=value ...] [--query-key=value ...]');
    const { flags } = parseKvPairs(rest2);
    const body = { ...flags };
    const queryParts = [];
    for (const [k, v] of Object.entries(body)) {
      if (k.startsWith('q_')) {
        queryParts.push(`${k.slice(2)}=${encodeURIComponent(v)}`);
        delete body[k];
      }
    }
    const path = queryParts.length ? `${funcName}?${queryParts.join('&')}` : funcName;
    const resp = await base44.functions.fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', api_key: API_KEY },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
    out({ invoked: funcName, status: resp.status, body, response: parsed });
  } else {
    console.error([
      'Usage:',
      '  node scripts/base44-cli.mjs ping',
      '  node scripts/base44-cli.mjs count <Entity> [key=value ...]',
      '  node scripts/base44-cli.mjs list <Entity> [key=value ...] [--limit N]',
      '  node scripts/base44-cli.mjs logs <function_name> [--limit N]',
      '  node scripts/base44-cli.mjs orchestrator-phases',
      '  node scripts/base44-cli.mjs invoke <function_name> [--key=value ...]',
    ].join('\n'));
    process.exit(2);
  }
} catch (err) {
  console.error('ERROR:', err.message || err);
  if (err.response?.data) console.error('Response data:', err.response.data);
  if (err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
  process.exit(1);
}
