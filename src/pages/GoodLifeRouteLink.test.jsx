import React from "react";
import { expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GoodLifeRouteLink } from "./GoodLifeRoomParts";

it("uses the app router for an exact Good life return", () => {
  render(<MemoryRouter initialEntries={["/Mirror"]}><Routes>
    <Route path="/Mirror" element={<GoodLifeRouteLink href="/Lifestyle?section=good">Back to Good life</GoodLifeRouteLink>}/>
    <Route path="/Lifestyle" element={<p>Good life arrived</p>}/>
  </Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole("link", { name: "Back to Good life" }));
  expect(screen.getByText("Good life arrived")).toBeVisible();
});

it("keeps a real external source as a normal anchor", () => {
  render(<MemoryRouter><GoodLifeRouteLink href="https://publisher.example/essay">Read at source</GoodLifeRouteLink></MemoryRouter>);
  expect(screen.getByRole("link", { name: "Read at source" })).toHaveAttribute("href", "https://publisher.example/essay");
});
