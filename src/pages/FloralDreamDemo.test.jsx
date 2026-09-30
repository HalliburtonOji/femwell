import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

const backend = vi.hoisted(() => ({ call: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: {
  entities: new Proxy({}, { get: () => new Proxy({}, { get: () => backend.call }) }),
  functions: { invoke: backend.call }, auth: { me: backend.call, updateMe: backend.call },
} }));
vi.mock("@/components/lifestyle-elite/LifestyleEliteShell", () => ({ default: () => <main aria-label="Connected Lifestyle shell" /> }));
import FloralDreamDemoPage, { FloralArtStudy as FloralDreamDemo } from "./FloralDreamDemo";

describe("Floral garden concept interactions", () => {
  let fetchSpy;
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/FloralDreamDemo");
    vi.stubGlobal("fetch", fetchSpy = vi.fn());
  });
  afterEach(() => {
    expect(backend.call).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("should switch the scene, description and selected atmosphere together without changing the lifecycle", () => {
    render(<FloralDreamDemo />);
    const atmosphere = within(screen.getByRole("group", { name: "Garden atmosphere" }));
    const scenes = [
      ["Dawn", "dawn", /violet iris growing through/i, "It grew around the clock. Quite right, too."],
      ["After hours", "night", /violet evening light/i, "The garden has put the day down."],
      ["Rest", "rest", /closed iris bud/i, "Nothing to prove. Plenty still becoming."],
    ];
    for (const [label, id, description, line] of scenes) {
      const button = atmosphere.getByRole("button", { name: label, exact: true });
      fireEvent.click(button);
      expect(atmosphere.getAllByRole("button", { pressed: true })).toEqual([button]);
      expect(screen.getByRole("img", { name: description })).toHaveAttribute("src", `/images/flora-dream/observatory-${id}.webp`);
      expect(screen.getByText(line)).toBeVisible();
      expect(screen.getByRole("img", { name: "Bloom lifecycle illustration" })).toBeVisible();
    }
  });

  it("should carry the lifecycle through seed and rest into return without resetting the chosen atmosphere", () => {
    render(<FloralDreamDemo />);
    fireEvent.click(within(screen.getByRole("group", { name: "Garden atmosphere" })).getByRole("button", { name: "After hours" }));
    const lifecycle = within(screen.getByRole("group", { name: "Lifecycle preview" }));
    for (const stage of ["Bud", "Bloom", "Seed", "Rest", "Return"]) {
      const button = lifecycle.getByRole("button", { name: stage, exact: true });
      fireEvent.click(button);
      expect(lifecycle.getAllByRole("button", { pressed: true })).toEqual([button]);
      expect(screen.getByRole("img", { name: `${stage} lifecycle illustration` })).toBeVisible();
      expect(screen.getByRole("img", { name: /violet evening light/i })).toBeVisible();
    }
    expect(screen.getByText("A familiar place. A new beginning.")).toBeVisible();
  });

  it("should preview and release a visitor while retaining the selected garden", () => {
    render(<FloralDreamDemo />);
    const visitor = screen.getByRole("button", { name: "Preview a visitor" });
    expect(visitor).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("img", { name: "Preview moth resting on the glass" })).not.toBeInTheDocument();
    fireEvent.click(visitor);
    expect(visitor).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "Preview moth resting on the glass" })).toBeVisible();
    fireEvent.click(within(screen.getByRole("group", { name: "Garden atmosphere" })).getByRole("button", { name: "After hours" }));
    expect(screen.getByRole("img", { name: "Preview moth resting on the glass" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Let the visitor go" }));
    expect(visitor).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("img", { name: "Preview moth resting on the glass" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /violet evening light/i })).toBeVisible();
  });

  it("should reveal the garden meaning and close it with Escape while preserving trigger focus", () => {
    render(<FloralDreamDemo />);
    const trigger = screen.getByRole("button", { name: "About this garden" });
    const explanation = document.getElementById(trigger.getAttribute("aria-controls"));
    expect(explanation).not.toBeVisible();
    trigger.focus();
    fireEvent.click(trigger, { detail: 0 });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(explanation).toBeVisible();
    expect(explanation).toHaveTextContent("not a sky measurement");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(explanation).not.toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("should keep motion optional and preserve button focus through replay, still and completion", () => {
    render(<FloralDreamDemo />);
    const art = () => screen.getByRole("img", { name: /violet iris growing through/i });
    const initialArt = art();
    expect(initialArt).not.toHaveClass("dream-moving");
    const motion = screen.getByRole("button", { name: "Replay garden movement" });
    motion.focus();
    fireEvent.click(motion, { detail: 0 });
    expect(art()).not.toBe(initialArt);
    expect(art()).toHaveClass("dream-moving");
    expect(screen.getByRole("button", { name: "Still the garden" })).toBe(motion);
    expect(motion).toHaveFocus();
    fireEvent.click(motion, { detail: 0 });
    expect(art()).not.toHaveClass("dream-moving");
    expect(motion).toHaveFocus();
    fireEvent.click(motion, { detail: 0 });
    const eventName = "AnimationEvent" in window ? "animationend" : "webkitAnimationEnd";
    fireEvent(art(), new Event(eventName, { bubbles: true }));
    expect(art()).not.toHaveClass("dream-moving");
    expect(screen.getByRole("button", { name: "Replay garden movement" })).toBe(motion);
    expect(motion).toHaveFocus();
  });

  it("should recover failed artwork with a fresh image request and allow another scene after a second failure", () => {
    render(<FloralDreamDemo />);
    fireEvent.error(screen.getByRole("img", { name: /violet iris growing through/i }));
    expect(screen.getByRole("status")).toHaveTextContent("The artwork couldn't load.");
    fireEvent.click(screen.getByRole("button", { name: "Reload artwork" }));
    const reloaded = screen.getByRole("img", { name: /violet iris growing through/i });
    expect(reloaded).toHaveAttribute("src", "/images/flora-dream/observatory-dawn.webp?retry=1");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.error(reloaded);
    fireEvent.click(within(screen.getByRole("group", { name: "Garden atmosphere" })).getByRole("button", { name: "After hours" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /violet evening light/i })).toHaveAttribute("src", "/images/flora-dream/observatory-night.webp?retry=1");
  });

  it("should keep room previews independent and expose the connected Sky destination only for Sky", () => {
    render(<FloralDreamDemo />);
    const rooms = within(screen.getByRole("group", { name: "Surface preview" }));
    fireEvent.click(rooms.getByRole("button", { name: "Read", exact: true }));
    expect(screen.getByRole("heading", { name: "A world between the pages." })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Open the connected Sky preview" })).not.toBeInTheDocument();
    fireEvent.click(rooms.getByRole("button", { name: "Sky", exact: true }));
    expect(screen.getByRole("link", { name: "Open the connected Sky preview" })).toHaveAttribute("href", "/SkyConceptDemo");
    expect(rooms.getAllByRole("button", { pressed: true })).toEqual([rooms.getByRole("button", { name: "Sky", exact: true })]);
    expect(screen.getByRole("img", { name: /violet iris growing through/i })).toBeVisible();
  });

  it("should open the connected preview by default while keeping the earlier interactive art study reachable", () => {
    const { unmount } = render(<FloralDreamDemoPage />);
    expect(screen.getByRole("main", { name: "Connected Lifestyle shell" })).toBeInTheDocument();
    expect(screen.getByText("Connected Lifestyle preview · actions use your account.")).toBeVisible();
    expect(screen.queryByRole("group", { name: "Garden atmosphere" })).not.toBeInTheDocument();
    const studyHref = screen.getByRole("link", { name: "Earlier art study" }).getAttribute("href");
    expect(studyHref).toBe("/FloralDreamDemo?study=art");
    unmount();
    window.history.replaceState({}, "", studyHref);
    render(<FloralDreamDemoPage />);
    expect(screen.queryByRole("main", { name: "Connected Lifestyle shell" })).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Garden atmosphere" })).toBeVisible();
    fireEvent.click(within(screen.getByRole("group", { name: "Garden atmosphere" })).getByRole("button", { name: "After hours" }));
    expect(screen.getByRole("img", { name: /violet evening light/i })).toBeVisible();
  });
});
