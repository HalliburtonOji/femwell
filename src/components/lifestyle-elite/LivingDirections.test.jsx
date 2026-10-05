import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LivingDirectionHeader, { LIVING_DIRECTIONS } from "./LivingDirections";
import { SECTION_STILL } from "./sectionStills";

describe("complete Living direction headers",()=>{
  it.each(LIVING_DIRECTIONS)("preserves the full section language in $name",direction=>{
    const active={id:"sky",label:"Sky",title:"The sky around you"};const {container}=render(<LivingDirectionHeader active={active} direction={direction.id} moon={{name:"Full moon",position:.5,illumination:100}}/>);
    expect(screen.getByRole("heading",{name:active.title})).toBeVisible();expect(screen.getByText(SECTION_STILL.sky.flower.note)).toBeVisible();expect(screen.getByRole("img",{name:/Full moon/})).toBeVisible();expect(container.querySelector("img")).toHaveAttribute("src","/images/flora-dream/living-growth-v1.webp");
    fireEvent.click(screen.getByRole("button",{name:"About sky garden"}));expect(screen.getByText(/are calculated/)).toBeVisible();
  });
  it.each(["read","listen","books","good","yours"])("keeps the right species and complete words for %s after artwork failure",section=>{
    const active={id:section,label:section,title:"A complete title with personality"};const {container}=render(<LivingDirectionHeader active={active} direction="field"/>);const img=container.querySelector("img");expect(img).toHaveAttribute("src",`/images/flora-dream/specimen-${SECTION_STILL[section].species}-v2.webp`);fireEvent.error(img);expect(screen.getByRole("heading",{name:active.title})).toBeVisible();expect(screen.getByText(SECTION_STILL[section].flower.note)).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Reload artwork"}));expect(container.querySelector("img")).toHaveAttribute("src",expect.stringContaining("?retry=1"));
  });
});
