import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

// Expose the selected drawing identity while exercising the real SectionStill mapping.
vi.mock("@/components/brand/floraLibrary", () => ({ SpeciesBloom: ({ name }) => <svg data-species={name} aria-hidden="true" /> }));
import BotanicalSceneHeader from "./BotanicalSceneHeader";

describe("Connected botanical section header", () => {
  let fetchSpy;
  beforeEach(() => { vi.stubGlobal("fetch", fetchSpy = vi.fn()); });
  afterEach(() => { expect(fetchSpy).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });

  it("should keep the supplied Sky title, flower profile and changing calculated phase together", () => {
    const { rerender, container } = render(<BotanicalSceneHeader active={{ id: "sky", title: "The sky, around you" }} moon={{ key: "first_quarter", name: "First quarter", position: .25, illumination: 50 }} />);
    expect(screen.getByRole("heading", { level: 1, name: "The sky, around you" })).toBeVisible();
    expect(screen.getByText("Morning glory — the day's turning — the sky's flower")).toBeVisible();
    expect(screen.getByRole("img", { name: "First quarter, approximately 50% illuminated" })).toBeVisible();
    expect(container.querySelector('img[src*="observatory-dawn"]')).toBeNull();
    expect(screen.queryByText(/Iris —/)).not.toBeInTheDocument();
    rerender(<BotanicalSceneHeader active={{ id: "sky", title: "The sky, around you" }} moon={{ key: "full", name: "Full moon", position: .5, illumination: 100 }} />);
    expect(screen.queryByRole("img", { name: /First quarter/ })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Full moon, approximately 100% illuminated" })).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("should change Read to Books with its own title and jasmine drawings without retaining iris art or meaning", () => {
    const { container, rerender } = render(<BotanicalSceneHeader active={{ id: "read", title: "Something to read" }} />);
    expect(screen.getByRole("heading", { name: "Something to read" })).toBeVisible();
    expect(screen.getByText("Iris — the courage to begin a page")).toBeVisible();
    expect(container.querySelector('img[src*="observatory-dawn"]')).not.toBeNull();
    rerender(<BotanicalSceneHeader active={{ id: "books", title: "Your reading corner" }} />);
    expect(screen.getByRole("heading", { name: "Your reading corner" })).toBeVisible();
    expect(screen.getByText("Jasmine — devoted — the story that keeps")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Something to read" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Iris —/)).not.toBeInTheDocument();
    expect(container.querySelector('img[src*="observatory-dawn"]')).toBeNull();
    const drawings = [...container.querySelectorAll("svg[data-species]")];
    expect(drawings.length).toBeGreaterThan(0);
    drawings.forEach(drawing => expect(drawing).toHaveAttribute("data-species", "jasmine"));
  });

  it("should retain the Read identity through artwork failure, show botanical fallback and retry with a fresh URL", () => {
    const { container, rerender } = render(<BotanicalSceneHeader active={{ id: "read", title: "Something to read" }} />);
    fireEvent.error(container.querySelector('img[src*="observatory-dawn"]'));
    expect(container.querySelector('img[src*="observatory-dawn"]')).toBeNull();
    expect(container.querySelectorAll('svg[data-species="iris"]').length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Something to read" })).toBeVisible();
    expect(screen.getByText("Iris — the courage to begin a page")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reload iris artwork" }));
    const retried = container.querySelector('img[src*="observatory-dawn"]');
    expect(retried).toHaveAttribute("src", "/images/flora-dream/observatory-dawn.webp?retry=1");
    expect(screen.queryByRole("button", { name: "Reload iris artwork" })).not.toBeInTheDocument();
    fireEvent.error(retried);
    rerender(<BotanicalSceneHeader active={{ id: "books", title: "Your reading corner" }} />);
    expect(screen.queryByRole("button", { name: "Reload iris artwork" })).not.toBeInTheDocument();
    expect(container.querySelector('svg[data-species="iris"]')).toBeNull();
    expect(screen.getByText("Jasmine — devoted — the story that keeps")).toBeVisible();
  });
});
