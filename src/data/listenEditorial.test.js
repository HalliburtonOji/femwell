import { describe, expect, it } from "vitest";
import { LISTEN_EDITORIAL_CHOICES, orderListenEdition } from "./listenEditorial";

const episode = (id, extra = {}) => ({ id, audio_url: `https://publisher.example/${id}.mp3`, duration_seconds: 2700, ...extra });

describe("Ideas Listen edition", () => {
  it("uses only exact already-loaded playable episodes and keeps the editorial order by default", () => {
    const rows = [
      episode(LISTEN_EDITORIAL_CHOICES[2].id),
      episode(LISTEN_EDITORIAL_CHOICES[0].id),
      episode(LISTEN_EDITORIAL_CHOICES[1].id, { audio_url: "" }),
      episode("unrelated"),
    ];
    expect(orderListenEdition(rows).map(choice => choice.id)).toEqual([
      LISTEN_EDITORIAL_CHOICES[0].id,
      LISTEN_EDITORIAL_CHOICES[2].id,
    ]);
  });

  it("lets an explicitly followed category lead without fabricating another source", () => {
    const rows = LISTEN_EDITORIAL_CHOICES.map(({ id }) => episode(id));
    const edition = orderListenEdition(rows, ["culture"]);
    expect(edition.map(choice => choice.id)).toEqual([
      LISTEN_EDITORIAL_CHOICES[1].id,
      LISTEN_EDITORIAL_CHOICES[0].id,
      LISTEN_EDITORIAL_CHOICES[2].id,
    ]);
    expect(edition.filter(choice => choice.matchesFollowed).map(choice => choice.category)).toEqual(["Culture"]);
    expect(orderListenEdition(rows, "culture")[0].id).toBe(LISTEN_EDITORIAL_CHOICES[0].id);
  });

  it("does not choose a source-only show as an in-app episode", () => {
    expect(orderListenEdition([episode(LISTEN_EDITORIAL_CHOICES[0].id, { duration_seconds: 0 })])).toEqual([]);
  });
});
