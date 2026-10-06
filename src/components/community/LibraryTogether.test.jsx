import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
vi.mock("@/api/base44Client",()=>({base44:{entities:{}}}));
vi.mock("@/components/community/bookClubConfig",()=>({loadBookClubPick:vi.fn(),clubReached:()=>-1}));
import { AddBookSheet } from "./LibraryTogether";
beforeEach(()=>{vi.clearAllMocks();});
it("waits for actual add acknowledgement before closing and preserves the exact draft on failure",async()=>{
  let reject; const gate=new Promise((_resolve,r)=>{reject=r;}); const add=vi.fn().mockReturnValueOnce(gate).mockResolvedValue(true),close=vi.fn();
  render(<AddBookSheet userId="alice" onAdded={add} onClose={close}/>);
  fireEvent.change(screen.getByPlaceholderText("Title"),{target:{value:"My chosen book"}});
  fireEvent.change(screen.getByPlaceholderText("Author (optional)"),{target:{value:"An Author"}});
  fireEvent.click(screen.getByRole("button",{name:"Set aside"}));
  fireEvent.click(screen.getByRole("button",{name:"Add to my shelf"}));
  expect(close).not.toHaveBeenCalled(); expect(screen.getByRole("button",{name:"Adding…"})).toBeDisabled();
  reject(new Error("offline")); await screen.findByRole("alert");
  expect(screen.getByPlaceholderText("Title")).toHaveValue("My chosen book"); expect(screen.getByRole("button",{name:"Set aside"})).toHaveAttribute("aria-pressed","true");
  fireEvent.click(screen.getByRole("button",{name:"Add to my shelf"})); await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));
  expect(add).toHaveBeenLastCalledWith({title:"My chosen book",author:"An Author",status:"set_aside"});
});
it("keeps the sheet open when its parent reports an unconfirmed change",async()=>{
  const close=vi.fn(); render(<AddBookSheet onAdded={vi.fn().mockResolvedValue(false)} onClose={close}/>);
  fireEvent.click(screen.getByRole("button",{name:/Little Women/})); await screen.findByRole("alert"); expect(close).not.toHaveBeenCalled();
});
