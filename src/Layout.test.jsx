import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";

vi.mock("@/api/base44Client", () => ({ base44: { auth: { me: vi.fn() } } }));
vi.mock("./components/layout/FloatingSidebar", () => ({ default: () => null }));
vi.mock("./components/layout/MobileBottomNav", () => ({ default: () => null }));
vi.mock("./components/today/CheckinModal", () => ({ default: () => null }));
vi.mock("./components/programs/MilestoneCelebrationModal", () => ({ MilestoneEventListener: () => null }));
vi.mock("./components/lifestyle/listen/PodcastPlayerProvider", () => ({ PodcastPlayerProvider: ({ children }) => children }));
vi.mock("./components/lifestyle/listen/MiniPlayer", () => ({ default: () => null }));
vi.mock("./components/lifestyle/listen/ExpandedPlayer", () => ({ default: () => null }));
vi.mock("./components/journal/Editorial", () => ({ PAPER_BG: { backgroundColor: "#ece7da" }, InkFilter: () => null, Heart: () => null }));
vi.mock("./components/brand/cleanTokens", () => ({ CLEAN_BG: { backgroundColor: "#f5f4f1" } }));
vi.mock("./components/common/ErrorBoundary", () => ({ default: ({ children }) => children }));
vi.mock("./components/assistant/AssistantOverlay", () => ({ default: ({ open, initialPrompt, initialDraft }) => open ? <output data-testid="jess-handoff">{JSON.stringify({ initialPrompt, initialDraft })}</output> : null }));

describe("Lifestyle article shell and Jess handoff", () => {
  it("puts a clean base under direct article links without an appearance flag", () => {
    const { container } = render(<MemoryRouter><Layout currentPageName="LifestyleDetail"><p>Article</p></Layout></MemoryRouter>);
    expect(container.querySelector(".min-h-screen")).toHaveStyle({ backgroundColor: "#f5f4f1" });
  });
  it("prefills article context without converting it to an auto-sent prompt", () => {
    render(<MemoryRouter><Layout currentPageName="LifestyleDetail"><p>Article</p></Layout></MemoryRouter>);
    fireEvent(window, new CustomEvent("fw_open_assistant", { detail: { context: "A place to begin again" } }));
    expect(JSON.parse(screen.getByTestId("jess-handoff").textContent)).toEqual({ initialPrompt: null, initialDraft: "Can we talk about “A place to begin again”?" });
  });
  it("keeps intentional initialPrompt requests as prompts, without a stale context draft", () => {
    render(<MemoryRouter><Layout currentPageName="LifestyleDetail"><p>Article</p></Layout></MemoryRouter>);
    fireEvent(window, new CustomEvent("fw_open_assistant", { detail: { context: "A place to begin again" } }));
    fireEvent(window, new CustomEvent("fw_open_assistant", { detail: { initialPrompt: "A chosen question" } }));
    expect(JSON.parse(screen.getByTestId("jess-handoff").textContent)).toEqual({ initialPrompt: "A chosen question", initialDraft: null });
  });
});
