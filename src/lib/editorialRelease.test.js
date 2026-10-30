import { expect, it } from 'vitest';
import { eligiblePublishedRead, isReviewedEditorial } from './editorialRelease';

const released = {
  id: 'stored-article', source_id: 'read-friendship-plans-v1', title: 'The plans you actually want to keep',
  provider: 'FEMWELL_EDITORIAL', status: 'PUBLISHED', lede: 'The complete article.',
  editor_name: 'Halli', editorial_reviewed_at: '2026-10-30T12:00:00Z',
  rights_basis: 'Original FemWell prose', rights_confirmed_at: '2026-10-30T12:00:00Z',
  published_at: '2026-10-30T12:00:00Z',
};

it('requires a complete human/rights/date receipt even when transport says published', () => {
  expect(isReviewedEditorial(released)).toBe(true);
  for (const field of ['source_id','editor_name','editorial_reviewed_at','rights_basis','rights_confirmed_at','published_at','lede']) {
    expect(eligiblePublishedRead({ ...released, [field]: '' })).toBe(false);
  }
  expect(eligiblePublishedRead({ ...released, status: 'NEEDS_REVIEW' })).toBe(false);
});

it('keeps the historical published archive reachable under its own provenance', () => {
  expect(eligiblePublishedRead({ id: 'old', title: 'Older full read', status: 'PUBLISHED', provider: 'FEMWELL_AI' })).toBe(true);
});
