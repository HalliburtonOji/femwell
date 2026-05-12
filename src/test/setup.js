import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup the DOM after every test.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia by default — the reader uses it to
// detect prefers-reduced-motion. Stub it to "no preference."
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Layout APIs jsdom doesn't implement that the reader's measured pagination
// depends on. We pin them so a paragraph "renders" at a known height. With
// these, the slicing logic walks paragraphs deterministically.
if (typeof window !== "undefined") {
  if (!window.HTMLElement.prototype.scrollTo) {
    window.HTMLElement.prototype.scrollTo = () => {};
  }
  // innerHeight matters for the reader's available-height calc.
  Object.defineProperty(window, "innerHeight", { writable: true, value: 800 });
  Object.defineProperty(window, "innerWidth", { writable: true, value: 420 });
}
