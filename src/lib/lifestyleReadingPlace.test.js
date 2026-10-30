import { beforeEach, expect, it, vi } from 'vitest';
import { readOwnedPlace, readingRevision, recentOwnedPlaces, validOwnedPlace, writeOwnedPlace } from './lifestyleReadingPlace';

const api = vi.hoisted(() => ({ me: vi.fn(), filter: vi.fn(), update: vi.fn(), create: vi.fn() }));
vi.mock('@/api/base44Client', () => ({ base44: { auth: { me: api.me }, entities: { LifestyleReadingPlace: { filter: api.filter, update: api.update, create: api.create } } } }));
beforeEach(() => { vi.clearAllMocks(); api.me.mockResolvedValue({ id: 'reader' }); api.filter.mockResolvedValue([]); });

it('invalidates a changed article and ignores another owner', async () => {
  const revision = readingRevision('Original six paragraphs');
  expect(readingRevision('Original six paragraphs.')).not.toBe(revision);
  const row = { id: 'place', user_id: 'reader', item_id: 'article', paragraph_index: 2, content_revision: revision };
  api.filter.mockResolvedValue([ { ...row, user_id: 'other' }, row ]);
  expect(await readOwnedPlace('reader', 'article', revision)).toEqual(row);
  expect(validOwnedPlace(row, 'other', 'article', revision)).toBe(false);
  expect(await readOwnedPlace('reader', 'article', readingRevision('Revised'))).toBeNull();
});

it('reuses the existing private row after an edit and demands an owned acknowledgement', async () => {
  const old = { id: 'place', user_id: 'reader', item_id: 'article', paragraph_index: 2, content_revision: 'old' };
  api.filter.mockResolvedValue([old]);
  api.update.mockImplementation(async (id, payload) => ({ id, ...payload }));
  const saved = await writeOwnedPlace({ owner: 'reader', itemId: 'article', revision: 'new', paragraphIndex: 3 });
  expect(saved.id).toBe('place');
  expect(api.create).not.toHaveBeenCalled();
  expect(api.update).toHaveBeenCalledWith('place', expect.objectContaining({ user_id: 'reader', paragraph_index: 3 }));
  api.update.mockResolvedValue({ id: 'place', user_id: 'other', paragraph_index: 3 });
  await expect(writeOwnedPlace({ owner: 'reader', itemId: 'article', revision: 'new', paragraphIndex: 4, row: old })).rejects.toThrow('not confirmed');
});

it('never writes for a changed account and never accepts another owner in a recent list', async () => {
  api.me.mockResolvedValue({ id: 'other' });
  await expect(writeOwnedPlace({ owner: 'reader', itemId: 'article', revision: 'rev', paragraphIndex: 2 })).rejects.toThrow('Account changed');
  expect(api.create).not.toHaveBeenCalled();
  api.filter.mockResolvedValue([{ id: 'foreign', user_id: 'other', item_id: 'article', paragraph_index: 2, content_revision: 'rev' }, { id: 'mine', user_id: 'reader', item_id: 'article', paragraph_index: 1, content_revision: 'rev' }, { id: 'duplicate', user_id: 'reader', item_id: 'article', paragraph_index: 2, content_revision: 'rev' }]);
  expect(await recentOwnedPlaces('reader')).toEqual([{ id: 'mine', user_id: 'reader', item_id: 'article', paragraph_index: 1, content_revision: 'rev' }]);
});

it('converges two simultaneous first writes onto the server newest row on the next turn', async () => {
  const rows = [];
  let reads = 0;
  api.filter.mockImplementation(async () => ++reads <= 2 ? [] : [...rows].sort((a,b) => b.updated_date.localeCompare(a.updated_date)));
  api.create.mockImplementation(async payload => {
    const number = rows.length + 1;
    const row = { ...payload, id: `place-${number}`, updated_date: `2026-10-30T12:00:0${number}Z` };
    rows.push(row);
    return row;
  });
  api.update.mockImplementation(async (id, payload) => {
    const row = { ...payload, id, updated_date: '2026-10-30T12:00:03Z' };
    rows.splice(rows.findIndex(value => value.id === id), 1, row);
    return row;
  });
  await Promise.all([
    writeOwnedPlace({ owner: 'reader', itemId: 'article', revision: 'rev', paragraphIndex: 2 }),
    writeOwnedPlace({ owner: 'reader', itemId: 'article', revision: 'rev', paragraphIndex: 3 }),
  ]);
  expect(rows).toHaveLength(2); // Base44 has no documented composite uniqueness guarantee.
  expect((await recentOwnedPlaces('reader')).map(row => row.id)).toEqual(['place-2']);
  await writeOwnedPlace({ owner: 'reader', itemId: 'article', revision: 'rev', paragraphIndex: 4 });
  expect(api.update).toHaveBeenCalledWith('place-2', expect.objectContaining({ paragraph_index: 4 }));
  expect((await readOwnedPlace('reader', 'article', 'rev')).paragraph_index).toBe(4);
});
