// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { describe, expect, it, vi } from 'vitest';

// Exercise the actual Deno handler; only replace its runtime SDK import.
const source = readFileSync('base44/functions/generateHoroscopeReading/entry.ts', 'utf8')
  .replace(/^import \{ createClientFromRequest \} from 'npm:@base44\/sdk@[^']+';\r?\n/m, '');
const code = transformSync(source, { loader: 'ts', format: 'cjs' }).code;
const astro = { id: 'chart', birth_time: '12:00', sun_sign: 'Libra',
  moon_sign: 'Taurus', rising_sign: 'Cancer', mercury_sign: 'Libra' };

function harness({ profiles = [astro], readings = [], profileError, readingError } = {}) {
  const entity = (value, error) => ({
    filter: error ? vi.fn().mockRejectedValue(error) : vi.fn().mockResolvedValue(value),
    create: vi.fn().mockImplementation(async (row) => ({ id: 'new-reading', ...row })),
    update: vi.fn().mockImplementation(async (id, row) => ({ id, ...row })),
  });
  const entities = {
    AstroProfile: entity(profiles, profileError),
    HoroscopeReading: entity(readings, readingError),
    UserProfile: entity([]), UserPreferences: entity([]),
  };
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
    choices: [{ message: { content: '{"headline":"Mock reading","narrative":"Mock only"}' } }],
  }) });
  let handler;
  runInNewContext(code, {
    createClientFromRequest: () => ({ auth: { me: async () => ({ id: 'owner' }) }, asServiceRole: { entities } }),
    Deno: { serve: (callback) => { handler = callback; }, env: { get: () => 'mock-key' } },
    Response, fetch, AbortSignal, setTimeout, clearTimeout,
  });
  const request = (body = { user_id: 'owner' }) => handler(new Request('https://mock.invalid', {
    method: 'POST', body: JSON.stringify(body),
  }));
  const noGenerationOrWrites = () => {
    expect(fetch).not.toHaveBeenCalled();
    for (const value of Object.values(entities)) {
      expect(value.create).not.toHaveBeenCalled();
      expect(value.update).not.toHaveBeenCalled();
    }
  };
  return { request, entities, noGenerationOrWrites };
}

describe('actual Sky producer lookup recovery', () => {
  it.each([
    ['rejected daily reading lookup', { readingError: new Error('read unavailable') }],
    ['malformed daily reading lookup', { readings: {} }],
    ['rejected chart lookup', { profileError: new Error('chart unavailable') }],
    ['malformed chart lookup', { profiles: null }],
  ])('should return retryable 503 before generation or writes after a %s', async (_name, setup) => {
    const run = harness(setup);
    const response = await run.request();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ retryable: true });
    run.noGenerationOrWrites();
  });

  it('should return the exact cached row when the existing chart is complete', async () => {
    const row = { id: 'existing-edition', user_id: 'owner', narrative: 'Preserved original text' };
    const run = harness({ readings: [row] });
    const response = await run.request();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, cached: true, reading: row });
    run.noGenerationOrWrites();
  });

  it('should retain onboarding 422 when chart absence is confirmed', async () => {
    const run = harness({ profiles: [] });
    const response = await run.request();
    expect(response.status).toBe(422);
    expect(run.entities.HoroscopeReading.filter).not.toHaveBeenCalled();
    run.noGenerationOrWrites();
  });
});
