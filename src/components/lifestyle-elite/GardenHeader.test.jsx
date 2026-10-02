import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import GardenHeader from "./GardenHeader";

describe("Little-garden header behaviour", () => {
  let fetchSpy;
  beforeEach(() => { vi.stubGlobal("fetch", fetchSpy = vi.fn()); });
  afterEach(() => { expect(fetchSpy).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });

  it("should retain section titles and flower identities with a calculated Moon only in Sky", () => {
    const sections = [
      ["read", "Read", "Something to read", "Iris", "read"],
      ["listen", "Listen", "Something to hear", "Bluebell", "listen"],
      ["books", "Books", "Your reading corner", "Jasmine", "books"],
      ["story", "Story", "A story for tonight", "Jasmine", "books"],
      ["sky", "Sky", "The sky around you", "Morning glory", "sky"],
      ["good", "Good life", "The good life", "Marigold", "good"],
    ];
    const moon = { name: "First quarter", position: .25, illumination: 50 };
    const { container, rerender } = render(<GardenHeader />);
    for (const [id, label, title, flower, scene] of sections) {
      rerender(<GardenHeader active={{ id, label, title }} moon={moon}/>);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getByRole("heading", { name: title })).toBeVisible();
      expect(screen.getByText(`Lifestyle / ${label}`)).toBeVisible();
      expect(screen.getByText(flower, { exact: true })).toBeVisible();
      expect(container.querySelector("img.little-garden-art")).toHaveAttribute("src", `/images/flora-dream/garden-${scene}-v4.webp`);
      if (id === "sky") {
        expect(screen.getByRole("img", { name: "First quarter, approximately 50% illuminated" })).toBeVisible();
        expect(screen.getByText("50% illuminated · above us")).toBeVisible();
      } else expect(screen.queryByRole("img", { name: /illuminated/ })).not.toBeInTheDocument();
    }
  });

  it("should update the live phase and illumination independently of the generated garden artwork", () => {
    const active = { id: "sky", title: "The sky around you" };
    const { container, rerender } = render(<GardenHeader active={active} moon={{ name: "First quarter", position: .25, illumination: 50 }}/>);
    const art = container.querySelector("img.little-garden-art");
    const initialMoonPath = screen.getByRole("img", { name: /First quarter/ }).querySelector("g[transform] > path[fill]").getAttribute("d");
    rerender(<GardenHeader active={active} moon={{ name: "Full moon", position: .5, illumination: 100 }}/>);
    expect(container.querySelector("img.little-garden-art")).toBe(art);
    expect(screen.queryByRole("img", { name: /First quarter/ })).not.toBeInTheDocument();
    const fullMoon = screen.getByRole("img", { name: "Full moon, approximately 100% illuminated" });
    expect(fullMoon.querySelector("g[transform] > path[fill]").getAttribute("d")).not.toBe(initialMoonPath);
    expect(screen.getByText("100% illuminated · above us")).toBeVisible();
    rerender(<GardenHeader active={active}/>);
    expect(screen.queryByRole("img", { name: /illuminated/ })).not.toBeInTheDocument();
    expect(screen.queryByText("100% illuminated · above us")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The sky around you" })).toBeVisible();
  });

  it("should preserve title, flower and live Moon through image failure and a fresh artwork retry", () => {
    const { container, rerender } = render(<GardenHeader active={{ id: "sky", title: "The sky around you" }} moon={{ name: "Full moon", position: .5, illumination: 100 }}/>);
    const art = () => container.querySelector("img.little-garden-art");
    fireEvent.error(art());
    expect(art()).toBeNull();
    expect(container.querySelector(".little-garden-fallback svg")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "The sky around you" })).toBeVisible();
    expect(screen.getByText("Morning glory", { exact: true })).toBeVisible();
    expect(screen.getByRole("img", { name: "Full moon, approximately 100% illuminated" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reload garden artwork" }));
    expect(art()).toHaveAttribute("src", "/images/flora-dream/garden-sky-v4.webp?retry=1");
    expect(screen.queryByRole("button", { name: "Reload garden artwork" })).not.toBeInTheDocument();
    fireEvent.error(art());
    rerender(<GardenHeader active={{ id: "books", title: "Your reading corner" }}/>);
    expect(art()).toHaveAttribute("src", "/images/flora-dream/garden-books-v4.webp");
    expect(screen.queryByRole("button", { name: "Reload garden artwork" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your reading corner" })).toBeVisible();
  });

  it("should reveal the scene meaning, reset it on a section change and close on Escape with focus restored", () => {
    const { rerender } = render(<GardenHeader active={{ id: "sky", title: "The sky around you" }}/>);
    const skyTrigger = screen.getByRole("button", { name: "About the moon garden" });
    const skyMeaning = document.getElementById(skyTrigger.getAttribute("aria-controls"));
    expect(skyMeaning).not.toBeVisible();
    fireEvent.click(skyTrigger);
    expect(skyMeaning).toBeVisible();
    expect(skyMeaning).toHaveTextContent("phase and illumination are calculated");
    expect(skyMeaning).toHaveTextContent("garden objects are decorative");
    rerender(<GardenHeader active={{ id: "books", title: "Your reading corner" }}/>);
    expect(skyMeaning).not.toBeInTheDocument();
    const bookTrigger = screen.getByRole("button", { name: "About the story garden" });
    const bookMeaning = document.getElementById(bookTrigger.getAttribute("aria-controls"));
    expect(bookTrigger).toHaveAttribute("aria-expanded", "false");
    expect(bookMeaning).not.toBeVisible();
    bookTrigger.focus();
    fireEvent.click(bookTrigger, { detail: 0 });
    expect(bookMeaning).toBeVisible();
    expect(bookMeaning).toHaveTextContent("Jasmine winds through a bookmark");
    fireEvent.keyDown(bookTrigger, { key: "Escape" });
    expect(bookMeaning).not.toBeVisible();
    expect(bookTrigger).toHaveAttribute("aria-expanded", "false");
    expect(bookTrigger).toHaveFocus();
  });
});
