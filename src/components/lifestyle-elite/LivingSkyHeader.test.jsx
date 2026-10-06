import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import LivingSkyHeader from "./LivingSkyHeader";

// Vitest disables CSS modules; inspect the source declaration separately from DOM behaviour.
const livingStyles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "LivingSkyHeader.css"), "utf8");

const active = { id: "sky", title: "The sky around you" };
const quarter = { name: "First quarter", position: .25, illumination: 50 };

describe("Living Sky header", () => {
  it("stops the opt-in breeze, replays once, and settles without changing measured Moon data",()=>{
    vi.useFakeTimers();
    try {
      const {container,unmount}=render(<LivingSkyHeader active={active} moon={quarter} breeze/>);
      const moon=screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML;
      fireEvent.click(screen.getByRole("button",{name:"Still the garden"}));
      expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
      fireEvent.click(screen.getByRole("button",{name:"Replay garden movement"}));
      act(()=>vi.advanceTimersByTime(6499));
      expect(container.querySelector("header")).toHaveAttribute("data-moving","true");
      act(()=>vi.advanceTimersByTime(1));
      expect(screen.getByRole("button",{name:"Replay garden movement"})).toBeVisible();
      expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML).toBe(moon);
      fireEvent.click(screen.getByRole("button",{name:"Replay garden movement"}));
      unmount();expect(vi.getTimerCount()).toBe(0);
    } finally {vi.useRealTimers();}
  });
  it("keeps the opt-in garden static when reduced motion is requested",()=>{
    const preference=vi.spyOn(window,"matchMedia").mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    try {
      const {container}=render(<LivingSkyHeader active={active} moon={quarter} breeze/>);
      expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
      fireEvent.click(screen.getByRole("button",{name:"Replay garden movement"}));
      expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    } finally {preference.mockRestore();}
  });
  let fetchSpy;
  beforeEach(() => { vi.stubGlobal("fetch", fetchSpy = vi.fn()); });
  afterEach(() => { expect(fetchSpy).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });

  it("should retain the full title and morning glory identity while the live Moon changes independently of its artwork", () => {
    const { container, rerender } = render(<LivingSkyHeader active={active} moon={quarter}/>);
    expect(screen.getByRole("heading", { level: 1, name: active.title })).toBeVisible();
    expect(screen.getByText("Morning glory", { exact: true })).toBeVisible();
    const artwork = container.querySelector("img.living-sky-growth");
    const quarterPath = screen.getByRole("img", { name: "First quarter, approximately 50% illuminated" }).querySelector("g[transform] > path[fill]").getAttribute("d");
    rerender(<LivingSkyHeader active={active} moon={{ name: "Full moon", position: .5, illumination: 100 }}/>);
    expect(container.querySelector("img.living-sky-growth")).toBe(artwork);
    expect(screen.queryByRole("img", { name: /First quarter/ })).not.toBeInTheDocument();
    const fullMoon = screen.getByRole("img", { name: "Full moon, approximately 100% illuminated" });
    expect(fullMoon.querySelector("g[transform] > path[fill]").getAttribute("d")).not.toBe(quarterPath);
    expect(screen.getByText("100% illuminated · above us")).toBeVisible();
    rerender(<LivingSkyHeader active={active}/>);
    expect(screen.queryByRole("img", { name: /illuminated/ })).not.toBeInTheDocument();
    expect(screen.getByText("A little wonder, rooted here.")).toBeVisible();
    expect(screen.getByRole("heading", { name: active.title })).toBeVisible();
  });

  it("should recover failed artwork through fresh retry URLs without losing the title, flower or calculated Moon", () => {
    const { container } = render(<LivingSkyHeader active={active} moon={quarter}/>);
    const art = () => container.querySelector("img.living-sky-growth");
    for (const attempt of [1, 2]) {
      fireEvent.error(art());
      expect(art()).toBeNull();
      expect(container.querySelector(".living-sky-fallback svg")).not.toBeNull();
      expect(screen.getByRole("heading", { name: active.title })).toBeVisible();
      expect(screen.getByText("Morning glory", { exact: true })).toBeVisible();
      expect(screen.getByRole("img", { name: "First quarter, approximately 50% illuminated" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Reload garden artwork" }));
      expect(art()).toHaveAttribute("src", `/images/flora-dream/living-growth-v1.webp?retry=${attempt}`);
      expect(screen.queryByRole("button", { name: "Reload garden artwork" })).not.toBeInTheDocument();
    }
  });

  it("should explain the distinction between calculated Moon and garden art, then close on Escape with focus restored", () => {
    render(<LivingSkyHeader active={active} moon={quarter}/>);
    const trigger = screen.getByRole("button", { name: "About the moon garden" });
    const meaning = document.getElementById(trigger.getAttribute("aria-controls"));
    expect(meaning).not.toBeVisible();
    trigger.focus();
    fireEvent.click(trigger, { detail: 0 });
    expect(meaning).toBeVisible();
    expect(meaning).toHaveTextContent("shape and illumination are calculated");
    expect(meaning).toHaveTextContent("an imagined garden");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(meaning).not.toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("should play a finite orbit arrival on request and preserve focus through stop, replay and completion", () => {
    const { container } = render(<LivingSkyHeader active={active} moon={quarter}/>);
    const orbit = () => container.querySelector(".living-sky-orbit");
    const artwork = container.querySelector("img.living-sky-growth");
    expect(orbit()).not.toHaveClass("is-moving");
    const button = screen.getByRole("button", { name: "Replay garden movement" });
    button.focus();
    fireEvent.click(button, { detail: 0 });
    expect(orbit()).toHaveClass("is-moving");
    expect(screen.getByRole("button", { name: "Still the garden" })).toBe(button);
    expect(button).toHaveFocus();
    fireEvent.click(button, { detail: 0 });
    expect(orbit()).not.toHaveClass("is-moving");
    fireEvent.click(button, { detail: 0 });
    const eventName = "AnimationEvent" in window ? "animationend" : "webkitAnimationEnd";
    fireEvent(orbit(), new Event(eventName, { bubbles: true }));
    expect(orbit()).not.toHaveClass("is-moving");
    expect(screen.getByRole("button", { name: "Replay garden movement" })).toBe(button);
    expect(button).toHaveFocus();
    expect(container.querySelector("img.living-sky-growth")).toBe(artwork);
    // A real finite CSS animation must be able to emit the completion event above.
    const animation = livingStyles.match(/\.living-sky-orbit\.is-moving\s*\{[^}]*animation:([^;]+)/)?.[1];
    expect(animation).toBeDefined();
    expect(animation).toMatch(/\b\d+(?:\.\d+)?m?s\b/);
    expect(animation).not.toMatch(/\binfinite\b/);
  });
});
