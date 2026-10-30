const dated = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

// PUBLISHED is a transport state, not evidence of human editorial approval.
export function isReviewedEditorial(row) {
  return !!(row?.provider === 'FEMWELL_EDITORIAL' && row.status === 'PUBLISHED' && row.id &&
    row.source_id && row.editor_name && row.rights_basis && row.lede &&
    dated(row.published_at) && dated(row.editorial_reviewed_at) && dated(row.rights_confirmed_at));
}

export function eligiblePublishedRead(row) {
  return !!(row?.id && row.title && row.status === 'PUBLISHED' &&
    (row.provider !== 'FEMWELL_EDITORIAL' || isReviewedEditorial(row)));
}

// The stored route is an identity for Save/Continue, not an external publisher.
export function isOwnLifestyleDetailUrl(value, itemId) {
  if (!value || !itemId) return false;
  try {
    const url = new URL(value, 'https://femwells.com');
    return ['femwells.com', 'www.femwells.com'].includes(url.hostname.toLowerCase()) &&
      url.pathname.replace(/\/$/, '').toLowerCase() === '/lifestyledetail' &&
      url.searchParams.get('id') === String(itemId);
  } catch { return false; }
}
