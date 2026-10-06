import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { parseJournalEntryRequest, useExactJournalEntry } from "./lifestyleReturns";

function ExactNote({ userId, entity, search }) {
  const [entry, setEntry] = useState(null);
  const state = useExactJournalEntry({ entity, userId, authLoading: false, search, onOpen: setEntry });
  return <div><span>{state.status}</span>{entry && <p>{entry.text}</p>}</div>;
}
describe("exact journal request transitions", () => {
  it("ignores a late previous-owner response even if the backend returns it", async () => {
    const pending = {};
    const entity = { filter: vi.fn(({ user_id }) => new Promise(resolve => { pending[user_id] = resolve; })) };
    const search = "?entry=note&content_key=sky-lesson%3Aearthshine%3Av1";
    const mounted = render(<ExactNote userId="first" entity={entity} search={search} />);
    await waitFor(() => expect(pending.first).toBeTypeOf("function"));
    mounted.rerender(<ExactNote userId="second" entity={entity} search={search} />);
    await waitFor(() => expect(pending.second).toBeTypeOf("function"));
    await act(async () => pending.first([{ id: "note", user_id: "first", content_key: "sky-lesson:earthshine:v1", text: "The previous owner’s words" }]));
    expect(screen.queryByText("The previous owner’s words")).not.toBeInTheDocument();
    await act(async () => pending.second([]));
    expect(screen.getByText("missing")).toBeVisible();
  });
  it("cancels the earlier exact content request when the URL changes", async () => {
    let first;
    const entity = { filter: vi.fn(({ content_key }) => content_key === "sky-lesson:earthshine:v1" ? new Promise(resolve => { first = resolve; }) : Promise.resolve([{ id: "note", user_id: "owner", content_key, text: "The exact revised note" }])) };
    const mounted = render(<ExactNote userId="owner" entity={entity} search="?entry=note&content_key=sky-lesson%3Aearthshine%3Av1" />);
    await waitFor(() => expect(first).toBeTypeOf("function"));
    mounted.rerender(<ExactNote userId="owner" entity={entity} search="?entry=note&content_key=sky-lesson%3Aearthshine%3Av2" />);
    expect(await screen.findByText("The exact revised note")).toBeVisible();
    await act(async () => first([{ id: "note", user_id: "owner", content_key: "sky-lesson:earthshine:v1", text: "The earlier note" }]));
    expect(screen.queryByText("The earlier note")).not.toBeInTheDocument();
  });
  it.each(["?entry=", "?entry=../other", "?entry=note&content_key=", "?entry=note&content_key=%00oops"])("rejects malformed requests without broadening %s", search => expect(parseJournalEntryRequest(search)?.valid).toBe(false));
});
