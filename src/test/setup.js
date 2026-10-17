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
  // Node 25 can shadow jsdom with an incomplete localStorage object. Keep a
  // per-worker browser-shaped store so storage tests exercise the real API.
  if (typeof window.localStorage?.clear !== "function") {
    const values = new Map();
    const storage = {};
    Object.defineProperties(storage, {
      length: { get: () => values.size },
      key: { value: index => [...values.keys()][index] ?? null },
      getItem: { value: key => values.get(String(key)) ?? null },
      setItem: { value: (key, value) => {
        values.set(String(key), String(value));
        Object.defineProperty(storage, String(key), { configurable: true, enumerable: true, writable: true, value: String(value) });
      } },
      removeItem: { value: key => { values.delete(String(key)); delete storage[String(key)]; } },
      clear: { value: () => { values.clear(); for (const key of Object.keys(storage)) delete storage[key]; } },
    });
    Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  }
  if (!window.HTMLElement.prototype.scrollTo) {
    window.HTMLElement.prototype.scrollTo = () => {};
  }
  // innerHeight matters for the reader's available-height calc.
  Object.defineProperty(window, "innerHeight", { writable: true, value: 800 });
  Object.defineProperty(window, "innerWidth", { writable: true, value: 420 });
}
