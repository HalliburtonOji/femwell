import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const data = vi.hoisted(() => ({ birth: null, filter: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), invoke: vi.fn(), progress: vi.fn() }));
vi.mock("@/components/horoscope/hooks/useBirthChart", () => ({ useBirthChart: () => data.birth }));
vi.mock("@/components/horoscope/hooks/useProfections", () => ({ default: () => ({
  profection: { age: 29, house: 4, house_label: "Fourth house", time_lord: "Moon", theme: "Room for home and belonging." },
  saturn: { started: "2026-01-01", ends: "2026-12-31" },
}) }));
vi.mock("@/components/horoscope/hooks/useAsteroids", () => ({ default: () => ({ ceres: "Virgo", pallas: "Aries" }) }));
vi.mock("@/api/base44Client", () => ({ base44: {
  entities: new Proxy({}, { get: () => ({ filter: data.filter, create: data.create, update: data.update }) }),
  functions: { invoke: data.invoke },
} }));
vi.mock("@/components/community/readingActivity", () => ({ recordProgress: data.progress }));

// Test the real connected Sky and its movements, not a mocked rendering of the old sample.
// Lifestyle shell routing and visual layout remain browser-level coverage.
import SkyFocus from "@/components/lifestyle-elite/SkyFocus";
import FocusedSectionActions from "@/components/lifestyle-elite/FocusedSectionActions";
import { CelestialHeader, MoonDisc, MoonLesson } from "@/components/lifestyle-elite/sky/CelestialSky";
import { getMoonPhase } from "@/utils/astrology";
import ObservedSkyDiary from "@/components/lifestyle-elite/sky/ObservedSkyDiary";

// Measure the area enclosed by the emitted semicircular/elliptical SVG arcs.
// This checks rendered geometry against known illumination, not a path snapshot.
function illuminatedFraction(svg) {
  const path = svg.querySelector("g[transform] > path[fill]");
  expect(path).not.toBeNull();
  const arcs = [...path.getAttribute("d").matchAll(/A\s*([^A-Z]+)/g)]
    .map(match => match[1].trim().split(/\s+/).map(Number));
  expect(arcs).toHaveLength(2);
  const [outer, terminator] = arcs;
  const outerArea = outer[0] * outer[1];
  const innerArea = terminator[0] * terminator[1] * (terminator[4] ? 1 : -1);
  return (outerArea + innerArea) / (2 * outerArea);
}

function ActionHarness() {
  const [request, setRequest] = useState(null);
  return <>
    <button onClick={() => setRequest({ type: "reading" })}>Read from the summary</button>
    <nav aria-label="Focused Sky actions"><FocusedSectionActions plum="#8E6E8E" actions={[
      { label: "Ask the sky", run: () => setRequest({ type: "ask" }) },
      { label: "Edit your chart", run: () => setRequest({ type: "chart" }) },
    ]} /></nav>
    <SkyFocus continuous portalChart actionRequest={request} onActionHandled={setRequest} />
  </>;
}

describe("Sky review restoration — one connected continuous section", () => {
  let scroll;
  let fetchSpy;
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/SkyConceptDemo");
    data.birth = {
      user: { id: "test-user", has_atelier: false },
      astro: { id: "chart-1", birth_date: "1997-06-17", sun_sign: "Gemini", moon_sign: "Libra", rising_sign: "Virgo" },
      reading: {
        headline: "A little room for the life you want.",
        narrative: "Take the gentler opening. There is time for a conversation.\n\nA small idea can have a place in your day.",
        weather_energy: "steady", weather_mood: "open", triad_sun_desc: "A curious way of meeting the day.", goddess_read: "Care and creativity can sit beside each other.",
      },
      userProfile: { last_period_start_date: "2026-09-20", cycle_avg_length: 28 },
      loading: false, generatingReading: false, setAstro: vi.fn(),
    };
    scroll = vi.fn();
    vi.stubGlobal("fetch", fetchSpy = vi.fn());
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scroll });
  });
  afterEach(() => {
    // Reading, opening and cancelling must not generate, purchase or save anything.
    [data.create, data.update, data.invoke, data.progress, fetchSpy].forEach(spy => expect(spy).not.toHaveBeenCalled());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete HTMLElement.prototype.scrollIntoView;
  });

  it("should expose every existing Sky movement inline without chapter gates or a second navigation strip", async () => {
    const { container } = render(<SkyFocus continuous />);
    ["Today's weather", "Sun, moon & rising", "Your goddess bench", "Red & white moon", "Your two tides", "The house your year is in", "Your Saturn return", "The last twelve cycles", "Put a question to it", "How you two run", "A letter each month, in her hand", "How much you want to hear"].forEach(text => expect(screen.getByText(text)).toBeVisible());
    expect(screen.getByText("A small idea can have a place in your day.")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Your question for the sky" })).toBeVisible();
    ["Reflect", "Discuss", "Ask Jess", "Mark read"].forEach(name => expect(screen.getByRole("button", { name, exact: true })).toBeVisible());
    expect(screen.getByRole("link", { name: "A sound for today" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Share today's sky" })).toBeVisible();
    expect(container.querySelector(".fw-sky-jump")).toBeNull();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit your chart", exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(data.filter).toHaveBeenCalledWith({ user_id: "test-user", topic: "horoscope" }, "-created_date", 5));
  });

  it("should focus reading and Ask in place, and preserve a typed question when chart editing is cancelled", async () => {
    render(<ActionHarness />);
    const reading = screen.getByText("Today's weather").closest("section");
    const question = screen.getByRole("textbox", { name: "Your question for the sky" });
    fireEvent.click(screen.getByRole("button", { name: "Read from the summary" }));
    await waitFor(() => expect(reading).toHaveFocus());
    expect(scroll).toHaveBeenLastCalledWith({ block: "start", behavior: "auto" });
    const actions = within(screen.getByRole("navigation", { name: "Focused Sky actions" }));
    fireEvent.click(actions.getByRole("button", { name: "Ask the sky" }));
    await waitFor(() => expect(question).toHaveFocus());
    expect(scroll).toHaveBeenLastCalledWith({ block: "center", behavior: "auto" });
    fireEvent.change(question, { target: { value: "What would make room for friendship?" } });
    expect(screen.getByText("The house your year is in")).toBeVisible();
    expect(screen.getByText("How much you want to hear")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(actions.getByRole("button", { name: "Edit your chart" }));
    const sheet = await screen.findByRole("dialog", { name: "Set your birth details" });
    fireEvent.click(within(sheet).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(question).toHaveValue("What would make room for friendship?");
    expect(screen.getByText("Your two tides")).toBeVisible();
  });

  it("should preserve the original navigation and chart editing when continuous mode is not requested", async () => {
    const { container } = render(<SkyFocus />);
    const navigation = container.querySelector(".fw-sky-jump");
    expect(navigation).not.toBeNull();
    expect(within(navigation).getAllByRole("button")).toHaveLength(7);
    fireEvent.click(within(navigation).getByRole("button", { name: "Ask", exact: true }));
    expect(scroll).toHaveBeenLastCalledWith({ behavior: "smooth", block: "start" });
    expect(screen.getByRole("textbox", { name: "Your question for the sky" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Edit your chart", exact: true }));
    const sheet = await screen.findByRole("dialog", { name: "Set your birth details" });
    fireEvent.click(within(sheet).getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Your two tides")).toBeVisible();
  });

  it("should wait for loading before consuming a reading request and avoid replaying it on rerender", async () => {
    data.birth.loading = true;
    const handled = vi.fn();
    const props = { continuous: true, actionRequest: { type: "reading" }, onActionHandled: handled };
    const { rerender } = render(<SkyFocus {...props} />);
    expect(screen.getByText("Reading the sky…")).toBeVisible();
    expect(handled).not.toHaveBeenCalled();
    data.birth.loading = false;
    rerender(<SkyFocus {...props} />);
    await waitFor(() => expect(screen.getByText("Today's weather").closest("section")).toHaveFocus());
    expect(handled).toHaveBeenCalledExactlyOnceWith(null);
    const question = screen.getByRole("textbox", { name: "Your question for the sky" });
    question.focus();
    rerender(<SkyFocus {...props} />);
    expect(question).toHaveFocus();
    expect(handled).toHaveBeenCalledTimes(1);
  });

  it("should keep the real birth setup reachable when no chart exists", async () => {
    data.birth.astro = null;
    data.birth.reading = null;
    render(<SkyFocus continuous portalChart />);
    expect(screen.getByText("A daily reading from your own chart")).toBeVisible();
    expect(screen.queryByRole("textbox", { name: "Your question for the sky" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set up your sky" }));
    const sheet = await screen.findByRole("dialog", { name: "Set your birth details" });
    expect(within(sheet).getByRole("button", { name: "Tell us when" })).toBeDisabled();
    fireEvent.click(within(sheet).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should teach all eight phases inline while keeping Today attached to the current phase", () => {
    const { container } = render(<MoonLesson moon={{ key: "first_quarter", position: .25 }} />);
    const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
    const todayButton = screen.getByRole("button", { name: "Learn about first quarter" });
    const facts = new Set();
    expect(screen.getAllByRole("button")).toHaveLength(8);
    for (const name of names) {
      const button = screen.getByRole("button", { name: `Learn about ${name.toLowerCase()}` });
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(screen.getAllByRole("button", { pressed: true })).toEqual([button]);
      const fact = container.querySelector('[aria-live="polite"]');
      expect(fact).toHaveTextContent(`${name}.`);
      expect(fact.textContent.length).toBeGreaterThan(40);
      facts.add(fact.textContent);
      expect(screen.getByText("Today").closest("button")).toBe(todayButton);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
    expect(facts.size).toBe(8);
  });

  it("should agree with the calculated phase at a bucket boundary instead of rounding Today into the next phase", () => {
    const moon = getMoonPhase(new Date("2000-01-12T18:14:00Z"));
    expect(moon.key).toBe("waxing_crescent");
    render(<><CelestialHeader moon={moon} /><MoonLesson moon={moon} /></>);
    const image = screen.getByRole("img", { name: `${moon.name}, approximately ${moon.illumination}% illuminated` });
    expect(illuminatedFraction(image) * 100).toBeCloseTo(moon.illumination, 0);
    expect(screen.getByText("Today").closest("button")).toBe(screen.getByRole("button", { name: "Learn about waxing crescent" }));
  });

  it("should draw new, crescent, quarter, gibbous and full discs with the correct lit areas and waning orientation", () => {
    const fractions = [0, .1464466, .5, .8535534, 1, .8535534, .5, .1464466];
    const { rerender } = render(<MoonDisc position={0} label="Phase under test" />);
    fractions.forEach((fraction, index) => {
      rerender(<MoonDisc position={index / 8} label="Phase under test" />);
      const image = screen.getByRole("img", { name: "Phase under test" });
      expect(image).not.toHaveAttribute("aria-hidden", "true");
      expect(illuminatedFraction(image)).toBeCloseTo(fraction, 3);
      const orientation = image.querySelector("g[transform]").getAttribute("transform");
      expect(orientation).toBe(index > 4 ? "scale(-1 1)" : "scale(1 1)");
    });
    rerender(<MoonDisc position={1.5} label="Wrapped full moon" />);
    expect(illuminatedFraction(screen.getByRole("img", { name: "Wrapped full moon" }))).toBeCloseTo(1, 3);
  });

  it("should keep a long reading complete in the celestial preview and leave default callers unchanged", async () => {
    const paragraphs = ["Begin with the conversation.", "Make room for friendship.", "Give an idea some time.", "The fourth paragraph must remain available.", "The fifth paragraph closes the complete reading."];
    data.birth.reading.narrative = paragraphs.join("\n\n");
    const { rerender } = render(<SkyFocus continuous celestial />);
    const reading = screen.getByText("Today's weather").closest("section");
    paragraphs.forEach(text => expect(reading).toHaveTextContent(text));
    ["Your sense of self", "Your inner weather", "How you meet the world"].forEach(text => expect(screen.getByText(text)).toBeVisible());
    expect(await screen.findByText("No cycle dates loaded. Nothing filled in on your behalf.")).toBeVisible();
    expect(screen.queryByText("The last twelve cycles")).not.toBeInTheDocument();
    rerender(<SkyFocus continuous />);
    expect(screen.queryByText(paragraphs[3])).not.toBeInTheDocument();
    expect(screen.queryByText("Your sense of self")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Learn about full moon" })).not.toBeInTheDocument();
    expect(screen.getByText("The last twelve cycles")).toBeVisible();
  });

  it("should expand chart readings below the whole preview row independently while preserving the default columns", async () => {
    const sunDescription = data.birth.reading.triad_sun_desc;
    const moonDescription = "A little space for your private inner weather.";
    data.birth.reading.triad_moon_desc = moonDescription;
    const { rerender } = render(<SkyFocus continuous celestial />);
    const sun = screen.getByRole("button", { name: /Sun.*Gemini/ });
    const moon = screen.getByRole("button", { name: /Moon.*Libra/ });
    const row = sun.parentElement.parentElement;
    fireEvent.click(sun);
    fireEvent.click(moon);
    expect(sun).toHaveAttribute("aria-expanded", "true");
    expect(moon).toHaveAttribute("aria-expanded", "true");
    const sunReading = screen.getByText(sunDescription);
    const moonReading = screen.getByText(moonDescription);
    expect(sunReading).toBeVisible();
    expect(moonReading).toBeVisible();
    // Readings must escape the narrow third-width columns and follow the row.
    expect(row).not.toContainElement(sunReading);
    expect(row).not.toContainElement(moonReading);
    expect(row.nextElementSibling).toBe(sunReading.parentElement);
    expect(sunReading.parentElement.nextElementSibling).toBe(moonReading.parentElement);
    fireEvent.click(sun);
    expect(sun).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(sunDescription)).not.toBeInTheDocument();
    expect(moon).toHaveAttribute("aria-expanded", "true");
    expect(moonReading).toBeVisible();
    expect(row.nextElementSibling).toBe(moonReading.parentElement);
    await screen.findByText("No cycle dates loaded. Nothing filled in on your behalf.");

    rerender(<SkyFocus continuous />);
    const defaultSun = screen.getByRole("button", { name: /Sun.*Gemini/ });
    expect(defaultSun).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(moonDescription)).not.toBeInTheDocument();
    fireEvent.click(defaultSun);
    expect(defaultSun).toHaveAttribute("aria-expanded", "true");
    expect(defaultSun.parentElement).toContainElement(screen.getByText(sunDescription));
  });

  it("should let a celestial Ask suggestion prefill an editable question without sending it", async () => {
    render(<SkyFocus continuous celestial />);
    const question = screen.getByRole("textbox", { name: "Your question for the sky" });
    const suggestion = "What should I put my energy into this week?";
    fireEvent.click(screen.getByRole("button", { name: suggestion, exact: true }));
    expect(question).toHaveValue(suggestion);
    expect(question).toHaveFocus();
    fireEvent.change(question, { target: { value: "What could make room for friendship?" } });
    expect(question).toHaveValue("What could make room for friendship?");
    expect(data.invoke).not.toHaveBeenCalled();
    expect(screen.queryByText("The sky says")).not.toBeInTheDocument();
    await screen.findByText("No past readings loaded yet. A blank page is a perfectly good beginning.");
  });

  it("should show each logged calendar day once and open the complete reading without raw markup", async () => {
    data.filter.mockResolvedValueOnce([
      { id: "start-1", type: "period_start", date: "2026-09-04T09:00:00" },
      { id: "start-duplicate", type: "period_start", date: "2026-09-04T16:30:00" },
      { id: "next-start", type: "period_start", date: "2026-09-20T10:00:00" },
    ]).mockResolvedValueOnce([{
      id: "reading-1", reading_date: "2026-09-28",
      headline: "Room for **friendship** and *rest*.",
      narrative: "<p>**First** thought.</p>\n\n*A second* invitation.\n\nThird paragraph stays.\n\n**Fourth paragraph** closes the whole reading.",
    }]);
    render(<ObservedSkyDiary userId="test-user" />);
    const reading = await screen.findByRole("button", { name: /Room for friendship and rest\./ });
    const dates = screen.getAllByRole("listitem");
    expect(dates).toHaveLength(2);
    expect(dates[0]).toHaveTextContent(/4 Sept? 2026/);
    expect(dates[1]).toHaveTextContent(/20 Sept? 2026/);
    expect(reading).not.toHaveTextContent("*");
    expect(reading).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(reading);
    expect(reading).toHaveAttribute("aria-expanded", "true");
    const narrative = screen.getByText(/First thought\./);
    expect(narrative.textContent).toBe("First thought.\n\nA second invitation.\n\nThird paragraph stays.\n\nFourth paragraph closes the whole reading.");
    expect(narrative).not.toHaveTextContent("*");
    expect(narrative).not.toHaveTextContent("<p>");
  });
});
