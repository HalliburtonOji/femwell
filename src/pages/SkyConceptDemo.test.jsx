import React from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

vi.mock("@/components/lifestyle-elite/SectionHeader", () => ({ default: () => <header>Your sky preview</header> }));
// Importing account services in an isolated specimen is a regression, even without a request.
vi.mock("@/api/base44Client", () => { throw new Error("Sky concept must not import the account client"); });
import SkyConceptDemo from "./SkyConceptDemo";

const tap = (name, scope = screen) => fireEvent.click(scope.getByRole("button", { name, exact: true }));
const chapter = (name) => tap(name, within(screen.getByRole("navigation", { name: "Sky chapters" })));
const showScenarios = () => fireEvent.click(screen.getByText("Try a different state"));
const closePanel = async () => {
  tap("Close preview panel");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
};
const openPanel = async (name, title = name) => {
  tap(name);
  return within(await screen.findByRole("dialog", { name: title }));
};

describe("SkyConceptDemo — isolated review state", () => {
  let requests;
  beforeEach(() => {
    requests = vi.fn(() => Promise.reject(new Error("No network is allowed in the sample preview")));
    vi.stubGlobal("fetch", requests);
  });
  afterEach(() => {
    expect(requests).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("should keep a newly authored note visible in sparse history and revisit, even when its text matches a sample", async () => {
    render(<SkyConceptDemo />);
    showScenarios();
    tap("Little history");
    chapter("Your patterns");
    expect(screen.getByText("A beginning is enough.")).toBeInTheDocument();
    let panel = await openPanel("Revisit your notes", "Your sky notes");
    expect(panel.getByText("No notes in this example yet. A first line is enough.")).toBeInTheDocument();
    tap("Add a note", panel);
    panel = within(screen.getByRole("dialog", { name: "Leave a sky note" }));
    const note = "Said yes to dinner with an old friend. Glad I went.";
    fireEvent.change(panel.getByLabelText("Your preview note"), { target: { value: note } });
    tap("Keep note in this preview", panel);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText(note)).toBeInTheDocument();
    expect(screen.getByText("This preview · your preview note")).toBeInTheDocument();
    expect(screen.queryByText("24 September · sample")).not.toBeInTheDocument();

    panel = await openPanel("Revisit your notes", "Your sky notes");
    expect(panel.getAllByText(note)).toHaveLength(1);
    expect(panel.getByText("This preview · your preview note")).toBeInTheDocument();
    expect(panel.queryByText(/authored sample/)).not.toBeInTheDocument();
  });

  it("should keep Planner and Community drafts independent when each is revisited", async () => {
    render(<SkyConceptDemo />);
    let panel = await openPanel("Bring it to your day");
    fireEvent.change(panel.getByLabelText("Your example intention"), { target: { value: "A walk with Jo" } });
    tap("Try the planner handoff", panel);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("A walk with Jo. Nothing added to your real planner.");

    panel = await openPanel("Start a conversation");
    expect(panel.getByLabelText("Your example draft")).toHaveValue("");
    fireEvent.change(panel.getByLabelText("Your example draft"), { target: { value: "Making room for friendship" } });
    tap("Keep draft", panel);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    panel = await openPanel("Bring it to your day");
    expect(panel.getByLabelText("Your example intention")).toHaveValue("A walk with Jo");
    await closePanel();
    panel = await openPanel("Start a conversation");
    expect(panel.getByLabelText("Your example draft")).toHaveValue("Making room for friendship");
  });

  it.each(["Little history", "Reading unavailable"])("should retain %s when unknown birth time is saved and withhold time-dependent placements", async (scenario) => {
    render(<SkyConceptDemo />);
    showScenarios();
    tap(scenario);
    const panel = await openPanel("Edit your chart");
    fireEvent.click(panel.getByRole("checkbox", { name: "I know the birth time" }));
    expect(panel.queryByLabelText("Birth time")).not.toBeInTheDocument();
    tap("Use these example details", panel);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: scenario })).toHaveAttribute("aria-pressed", "true");
    if (scenario === "Reading unavailable") expect(screen.getByText("A little patience with the sky.")).toBeInTheDocument();
    chapter("Your chart");
    expect(screen.getByRole("button", { name: /Rising\s*Time needed/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Moon\s*Uncertain/ })).toBeInTheDocument();
    expect(screen.queryByText("Virgo")).not.toBeInTheDocument();
    if (scenario === "Little history") {
      chapter("Your patterns");
      expect(screen.getByText("A beginning is enough.")).toBeInTheDocument();
      expect(screen.queryByText("24 September · sample")).not.toBeInTheDocument();
    }
  });

  it("should change the actual reading and transit note with preferences, then restore defaults on reset", async () => {
    render(<SkyConceptDemo />);
    const initialReading = screen.getByText(/Not every good thing begins with a big decision/).textContent;
    let panel = await openPanel("Your way", "Your sky, your way");
    fireEvent.click(panel.getByRole("switch", { name: "Quiet mode" }));
    fireEvent.click(panel.getByRole("switch", { name: "Soft sky" }));
    expect(panel.getByRole("switch", { name: "Quiet mode" })).toHaveAttribute("aria-checked", "true");
    expect(panel.getByRole("switch", { name: "Soft sky" })).toHaveAttribute("aria-checked", "true");
    await closePanel();
    expect(screen.getByText("A little less to carry.")).toBeInTheDocument();
    expect(screen.getByText(/There is no grand instruction for today/)).toBeInTheDocument();
    expect(screen.queryByText(initialReading)).not.toBeInTheDocument();
    expect(screen.queryByText("A little friction? Hold it lightly.")).not.toBeInTheDocument();
    tap("Mark this reading read");
    expect(screen.getByRole("button", { name: "Read today · undo" })).toBeInTheDocument();
    showScenarios();
    tap("Reset sample changes");
    expect(screen.getByText(initialReading)).toBeInTheDocument();
    expect(screen.getByText("A little friction? Hold it lightly.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark this reading read" })).toBeInTheDocument();
    panel = await openPanel("Your way", "Your sky, your way");
    expect(panel.getByRole("switch", { name: "Quiet mode" })).toHaveAttribute("aria-checked", "false");
    expect(panel.getByRole("switch", { name: "Soft sky" })).toHaveAttribute("aria-checked", "false");
  });

  it("should import no backend services and label results as sample content", () => {
    const source = readFileSync(path.resolve("src/pages/SkyConceptDemo.jsx"), "utf8");
    const imports = source.match(/(?:from\s+|import\s*\(\s*)["'][^"']+["']/g) || [];
    expect(imports.join("\n")).not.toMatch(/@base44|api\/|integrations\/|entities\//);
    render(<SkyConceptDemo />);
    expect(screen.getByText("Sample preview")).toBeInTheDocument();
    expect(screen.getByText("Try the proposed design. All content and results are examples.")).toBeInTheDocument();
  });
});
