import { describe, expect, it } from "vitest";
import { isCurrentEditorialNews, LIFESTYLE_EDITORIAL_DRAFTS } from "./lifestyleEditorialDrafts";

describe("Ideas news source window", () => {
  it("uses the checked Ofgem edition only within its dated review window", () => {
    const article = LIFESTYLE_EDITORIAL_DRAFTS.find(row => row.id === "ideas-read-october-energy-cap");
    expect(article.status).toBe("NEEDS_REVIEW");
    expect(article.editorial_source_checked_at).toBe("2026-11-03");
    expect(isCurrentEditorialNews(article, Date.parse("2026-11-03T12:00:00Z"))).toBe(true);
    expect(isCurrentEditorialNews(article, Date.parse("2026-11-18T12:00:00Z"))).toBe(false);
    expect(isCurrentEditorialNews({...article,editorial_source_checked_at:undefined,revalidated_at:"2026-11-03"},Date.parse("2026-11-03T12:00:00Z"))).toBe(false);
  });
});
