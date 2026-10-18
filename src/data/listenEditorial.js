// Ideas-only editorial notes for exact, already-published RSS episodes.
// These records do not create media, replace the publisher's description or
// claim a transcript. Missing/unplayable source IDs simply fall back to the
// existing room choice and every original source remains in the directory.
export const LISTEN_EDITORIAL_CHOICES = [
  {
    id: "6a59e948cceea7796379e6e5",
    category: "Lifestyle",
    reason: "Mel and AJ on friendship and reinvention. Includes Dove sponsorship.",
  },
  {
    id: "6a59e9466f970292f31ea4a9",
    category: "Culture",
    reason: "How a Tina Turner song became Australia's unofficial dance.",
  },
  {
    id: "6a59e943122f3e80c336153e",
    category: "Relationships",
    reason: "When one partner wants more room to breathe. Includes difficult history.",
  },
];

export function orderListenEdition(rows, followedCategories = []) {
  const byId = new Map((rows || []).filter(row => row?.audio_url && Number(row.duration_seconds) > 0).map(row => [row.id, row]));
  const followed = new Set((Array.isArray(followedCategories) ? followedCategories : []).map(value => String(value).toLowerCase()));
  return LISTEN_EDITORIAL_CHOICES
    .map((entry, index) => ({ ...entry, index, row: byId.get(entry.id), matchesFollowed: followed.has(entry.category.toLowerCase()) }))
    .filter(entry => entry.row)
    .sort((a, b) => Number(b.matchesFollowed) - Number(a.matchesFollowed) || a.index - b.index);
}
