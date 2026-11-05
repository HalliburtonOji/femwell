import { describe, expect, it } from "vitest";
import { eligibleCurrentRead, isNewsSource, isStaleNews } from "./editorialNews";

const edition = { content_type: "ARTICLE", provider: "FEMWELL_EDITORIAL", tags: ["Money", "News"],
  published_at: "2026-11-05T18:00:00Z", editorial_source_checked_at: "2026-11-05T17:00:00Z", expires_at: "2026-12-31" };

describe("stored editorial news", () => {
  it("recognises a schema-compatible news tag", () => expect(isNewsSource(edition)).toBe(true));
  it("uses the separate fact-check date, never URL liveness or publication", () => {
    expect(isStaleNews(edition, Date.parse("2026-11-05T19:00:00Z"))).toBe(false);
    expect(isStaleNews({...edition, editorial_source_checked_at: undefined, revalidated_at: "2026-11-05T19:00:00Z"}, Date.parse("2026-11-05T19:00:00Z"))).toBe(true);
    expect(isStaleNews({...edition, editorial_source_checked_at: "2026-10-01", revalidated_at: "2026-11-05"}, Date.parse("2026-11-05T19:00:00Z"))).toBe(true);
    expect(isStaleNews({...edition, editorial_source_checked_at: "2026-11-06"}, Date.parse("2026-11-05T19:00:00Z"))).toBe(true);
  });
  it("keeps the historical article but removes its current-news eligibility after expiry", () => {
    expect(isStaleNews({...edition, editorial_source_checked_at: "2027-01-01T08:00:00Z"}, Date.parse("2027-01-01T12:00:00Z"))).toBe(true);
  });
  it("keeps a stale published story in history while Today excludes it", () => {
    const reviewed = {...edition,id:"stored",source_id:"read-news",status:"PUBLISHED",title:"A dated edition",lede:"Complete body",editor_name:"Halli",rights_basis:"Original prose",editorial_reviewed_at:"2026-11-05",rights_confirmed_at:"2026-11-05",editorial_source_checked_at:"2026-01-01"};
    expect(eligibleCurrentRead(reviewed)).toBe(false);
    expect(eligibleCurrentRead({...reviewed,tags:[],editorial_source_checked_at:undefined})).toBe(true);
  });
});
