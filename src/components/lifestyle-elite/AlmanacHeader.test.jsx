import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AlmanacHeader from "./AlmanacHeader";

describe("Almanac botanical header", () => {
  let fetchSpy;
  beforeEach(() => { vi.stubGlobal("fetch", fetchSpy = vi.fn()); });
  afterEach(() => { expect(fetchSpy).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });

  it("should preserve each section's title and species when changing section and composition", () => {
    const sections = [
      ["read", "Read", "Something to read", "Iris", "iris"],
      ["listen", "Listen", "Something to hear", "Bluebell", "bluebell"],
      ["books", "Books", "Your reading corner", "Jasmine", "jasmine"],
      ["story", "Story", "A story for tonight", "Jasmine", "jasmine"],
      ["sky", "Sky", "The sky around you", "Morning glory", "morning-glory"],
      ["good", "Good life", "The good life", "Marigold", "marigold"],
      ["yours", "Yours", "What you keep", "Forget-me-not", "forget-me-not"],
    ];
    const moon = { name: "Full moon", position: .5, illumination: 100 };
    const { container, rerender } = render(<AlmanacHeader />);
    for (const variant of ["almanac", "canopy"]) for (const [id, label, title, flower, species] of sections) {
      rerender(<AlmanacHeader active={{ id, label, title }} moon={moon} variant={variant}/>);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getByRole("heading", { name: title })).toBeVisible();
      expect(screen.getByText(`Lifestyle / ${label}`)).toBeVisible();
      expect(screen.getByText(flower, { exact: true })).toBeVisible();
      expect(container.querySelector(".almanac-specimen img")).toHaveAttribute("src", `/images/flora-dream/specimen-${species}-v2.webp`);
      if (id === "sky") {
        expect(screen.getByRole("img", { name: "Full moon, approximately 100% illuminated" })).toBeVisible();
        expect(screen.getByText("100% illuminated · above us")).toBeVisible();
      } else expect(screen.queryByRole("img", { name: /illuminated/ })).not.toBeInTheDocument();
    }
  });

  it("should preserve identity after an image failure, retry a fresh URL and reset failures for a different species", () => {
    const { container, rerender } = render(<AlmanacHeader active={{ id: "read", title: "Something to read" }}/>);
    const art = () => container.querySelector(".almanac-specimen img");
    fireEvent.error(art());
    expect(art()).toBeNull();
    expect(container.querySelector(".almanac-specimen svg")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Something to read" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reload artwork" }));
    expect(art()).toHaveAttribute("src", "/images/flora-dream/specimen-iris-v2.webp?retry=1");
    fireEvent.error(art());
    rerender(<AlmanacHeader active={{ id: "books", title: "Your reading corner" }}/>);
    expect(screen.queryByRole("button", { name: "Reload artwork" })).not.toBeInTheDocument();
    expect(art()).toHaveAttribute("src", "/images/flora-dream/specimen-jasmine-v2.webp");
    expect(screen.queryByText("Iris", { exact: true })).not.toBeInTheDocument();
  });

  it("should explain the current section's meaning and return focus on Escape", () => {
    render(<AlmanacHeader active={{ id: "books", title: "Your reading corner" }}/>);
    const trigger = screen.getByRole("button", { name: "About jasmine symbolism" });
    const explanation = document.getElementById(trigger.getAttribute("aria-controls"));
    expect(explanation).not.toBeVisible();
    trigger.focus();
    fireEvent.click(trigger, { detail: 0 });
    expect(explanation).toBeVisible();
    expect(explanation).toHaveTextContent("Jasmine is this section's flower");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(explanation).not.toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("should start still and keep focus on its motion control through replay, stop and completion", () => {
    const { container } = render(<AlmanacHeader active={{ id: "read", title: "Something to read" }}/>);
    const art = () => container.querySelector(".almanac-specimen img");
    expect(art()).not.toHaveClass("almanac-growing");
    const button = screen.getByRole("button", { name: "Replay botanical movement" });
    button.focus();
    fireEvent.click(button, { detail: 0 });
    expect(art()).toHaveClass("almanac-growing");
    expect(screen.getByRole("button", { name: "Still the botanical artwork" })).toBe(button);
    expect(button).toHaveFocus();
    fireEvent.click(button, { detail: 0 });
    expect(art()).not.toHaveClass("almanac-growing");
    fireEvent.click(button, { detail: 0 });
    const eventName = "AnimationEvent" in window ? "animationend" : "webkitAnimationEnd";
    fireEvent(art(), new Event(eventName, { bubbles: true }));
    expect(art()).not.toHaveClass("almanac-growing");
    expect(screen.getByRole("button", { name: "Replay botanical movement" })).toBe(button);
    expect(button).toHaveFocus();
  });
});
