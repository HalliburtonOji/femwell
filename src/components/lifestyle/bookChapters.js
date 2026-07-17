// Shared chapter-builder for the book reader — the EXACT ChapterLike shape
// DailyStoryReader expects (source={{ kind:"book", items }}). Used by both the
// /FictionReader route and the in-place Lifestyle reader so a book reads identically
// either way (one source of truth, no drift). The reader does the measured pagination.
export function buildBookChapters(item) {
  if (!item) return [];
  if (Array.isArray(item.chapters_json) && item.chapters_json.length > 0) {
    return item.chapters_json.map((chap, chIdx) => {
      const heading = chap?.title || `Chapter ${chIdx + 1}`;
      return {
        id: `${item.id}-ch${chIdx + 1}`,
        day_number: chIdx + 1,
        title: heading,
        heading,
        body: chap?.body || "",
        cliffhanger: "",
        series_title: item.title || "",
        chapter_context: {
          chapterIndex: chIdx + 1,
          chapterCount: item.chapters_json.length,
          chapterTitle: heading,
        },
      };
    });
  }
  // legacy single-chapter — wrap the whole body as one chapter
  const text = item.body || item.lede || item.summary || "";
  return [{
    id: `${item.id}-only`,
    day_number: 1,
    title: item.title || "",
    heading: item.title || "",
    body: text,
    cliffhanger: "",
    series_title: item.title || "",
  }];
}
