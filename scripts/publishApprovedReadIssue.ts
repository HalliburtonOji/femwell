// Run manually with: Get-Content scripts/publishApprovedReadIssue.ts -Raw | npx base44 exec
// Exact, idempotent LC33 publication. Never call this from the app or a schedule.
const { LIFESTYLE_EDITORIAL_DRAFTS } = await import("file:///" + process.cwd().replaceAll("\\", "/") + "/src/data/lifestyleEditorialDrafts.js");
const approved = [
  ["ideas-read-day-off", "femwell-read-day-off-v1", "Lifestyle", "ARTICLE", []],
  ["ideas-read-subscription-check", "femwell-read-subscription-check-v1", "Career & Money", "GUIDE", ["Money"]],
  ["ideas-read-meeting-after-meeting", "femwell-read-meeting-after-meeting-v1", "Career & Money", "ARTICLE", ["Work"]],
  ["ideas-read-small-curiosity", "femwell-read-small-curiosity-v1", "Culture", "ARTICLE", []],
  ["ideas-read-the-long-way-home-v1", "femwell-read-the-long-way-home-v1", "Culture", "STORY", ["Fiction"]],
  ["ideas-read-october-energy-cap", "femwell-read-october-energy-cap-v1", "Career & Money", "ARTICLE", ["Money", "News"]],
];
const approvalAt = "2026-11-05T18:13:00Z";
const newsReady = process.env.FEMWELL_LC33_NEWS_READY === "1";
for (const [draftId, sourceId, category, type, tags] of approved) {
  if (tags.includes("News") && !newsReady) { console.log(`${sourceId}: held until schema, classifier and site deploy`); continue; }
  const draft = LIFESTYLE_EDITORIAL_DRAFTS.find(row => row.id === draftId);
  if (!draft || !draft.lede || draft.lede.length < 800) throw new Error(`Incomplete source: ${sourceId}`);
  const found = await base44.entities.LifestyleItems.filter({ source_id: sourceId }, "-created_date", 3);
  if (found.length > 1) throw new Error(`Duplicate source identity: ${sourceId}`);
  if (found[0]?.status === "PUBLISHED") {
    if (found[0].lede !== draft.lede) throw new Error(`Published text mismatch: ${sourceId}`);
    if (tags.includes("News") && (found[0].editorial_source_checked_at !== "2026-11-05T18:10:00Z" || found[0].expires_at !== draft.expires_at || !found[0].tags?.includes("News"))) throw new Error(`Published news metadata mismatch: ${sourceId}`);
    console.log(`${sourceId}: already published (${found[0].id})`);
    continue;
  }
  const row = found[0] || await base44.entities.LifestyleItems.create({
    source_id: sourceId, status: "NEEDS_REVIEW", title: draft.title,
    content_url: "https://femwells.com/LifestyleDetail", // replaced with its exact ID before publication
  });
  const before = await base44.entities.LifestyleItems.filter({ id: row.id }, "-created_date", 1);
  if (before.length !== 1 || before[0].source_id !== sourceId) throw new Error(`Pre-publication read-back failed: ${sourceId}`);
  const now = new Date().toISOString();
  const patch = {
    source_name: "FemWell editorial", title: draft.title, summary: draft.summary, lede: draft.lede,
    media_type: "ARTICLE", content_type: type, category, tags,
    provider: "FEMWELL_EDITORIAL", author_name: type === "STORY" ? "FemWell fiction" : "FemWell editorial",
    editor_name: "Halli", editorial_reviewed_at: approvalAt,
    rights_basis: "Original FemWell prose in repository; no third-party text, image or audio included",
    rights_confirmed_at: approvalAt, source_links: draft.source_links || [],
    content_url: `https://femwells.com/LifestyleDetail?id=${row.id}`,
    duration_label: draft.duration_label, published_at: now,
    ...(tags.includes("News") ? { editorial_source_checked_at: "2026-11-05T18:10:00Z", expires_at: draft.expires_at } : {}),
    status: "PUBLISHED",
  };
  await base44.entities.LifestyleItems.update(row.id, patch);
  const after = await base44.entities.LifestyleItems.filter({ id: row.id }, "-created_date", 1);
  if (after.length !== 1 || after[0].status !== "PUBLISHED" || after[0].lede !== draft.lede || after[0].content_url !== patch.content_url || after[0].provider !== "FEMWELL_EDITORIAL" || (tags.includes("News") && (after[0].editorial_source_checked_at !== patch.editorial_source_checked_at || after[0].expires_at !== patch.expires_at || !after[0].tags?.includes("News")))) throw new Error(`Published read-back failed: ${sourceId}`);
  console.log(`${sourceId}: published (${row.id}), ${draft.lede.length} characters`);
}
