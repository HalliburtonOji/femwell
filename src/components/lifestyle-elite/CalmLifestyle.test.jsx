import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ReadFocus from "./ReadFocus";
import GoodLifeFocus from "./GoodLifeFocus";
import YoursFocus from "./YoursFocus";
import { CalmTaskDialog } from "./CalmLifestyle";
vi.mock("@/api/base44Client", () => ({ base44: { auth: { me: vi.fn() }, entities: {}, functions: { invoke: vi.fn() } } }));

describe("calmer lists preserve exact source tasks", () => {
  it("wraps the modal keyboard boundary in both directions while keeping the opener return", () => {
    const previousModal=Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype,"showModal"),previousClose=Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype,"close");
    Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:vi.fn(function(){this.setAttribute("open","");})});
    Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:vi.fn(function(){this.removeAttribute("open");})});
    function Harness(){const [open,setOpen]=React.useState(false);return <><button onClick={()=>setOpen(true)}>Open task</button><CalmTaskDialog title="Task" open={open} onClose={()=>setOpen(false)}><textarea aria-label="Draft"/><button>Last action</button><fieldset disabled><button>Disabled inherited last</button></fieldset><button disabled tabIndex={0}>Explicit disabled last</button></CalmTaskDialog></>;}
    render(<Harness/>);
    const opener=screen.getByRole("button",{name:"Open task"});opener.focus();fireEvent.click(opener);
    const dialog=screen.getByRole("dialog",{name:"Task"});
    const controls=[...dialog.querySelectorAll("button,textarea")];
    controls.forEach(element=>vi.spyOn(element,"getClientRects").mockReturnValue([{width:44,height:44}]));
    const first=screen.getByRole("button",{name:"Close"}),last=screen.getByRole("button",{name:"Last action"});
    first.focus();fireEvent.keyDown(first,{key:"Tab",shiftKey:true});expect(last).toHaveFocus();
    fireEvent.keyDown(last,{key:"Tab"});expect(first).toHaveFocus();
    fireEvent.click(first);expect(opener).toHaveFocus();
    if(previousModal)Object.defineProperty(HTMLDialogElement.prototype,"showModal",previousModal);else delete HTMLDialogElement.prototype.showModal;
    if(previousClose)Object.defineProperty(HTMLDialogElement.prototype,"close",previousClose);else delete HTMLDialogElement.prototype.close;
    vi.restoreAllMocks();
  });
  it("preserves every discovery and its complete source without printing full summaries in the list", () => {
    const onOpen=vi.fn(), onDetails=vi.fn();
    const phaseCards=Array.from({length:6},(_,i)=>({id:`discovery-${i}`,title:`Discovery ${i}`,type:"article",summary:`Complete optional summary ${i}.`,body:[`Full source ${i}.`]}));
    render(<YoursFocus calmLayout presentation="focused" phaseCards={phaseCards} onOpen={onOpen} onDetails={onDetails}/>);
    for(const item of phaseCards){
      expect(screen.queryByText(item.summary)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button",{name:new RegExp(`^${item.title}.*Open$`)}));
      expect(onOpen).toHaveBeenLastCalledWith(item);
      fireEvent.click(screen.getByRole("button",{name:`Details & tools for ${item.title}`}));
      expect(onDetails).toHaveBeenLastCalledWith(item);
    }
  });
  it("keeps all secondary articles and stories, with direct reads and separate full details", () => {
    const onOpen = vi.fn(), onDetails = vi.fn();
    const rows = Array.from({ length: 7 }, (_, i) => ({ id: `source-${i}`, title: `Complete source ${i}`, type: "article", body: [`Full unshortened source ${i}.`], _raw: { id: `raw-${i}` } }));
    render(<ReadFocus calmLayout presentation="focused" articleCards={rows.slice(0, 4)} storyCards={rows.slice(4)} continueCards={[]} onOpen={onOpen} onDetails={onDetails}/>);
    for (const row of rows.slice(1)) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${row.title}.*Read$`) }));
      expect(onOpen).toHaveBeenLastCalledWith(row);
      fireEvent.click(screen.getByRole("button", { name: `Details & tools for ${row.title}` }));
      expect(onDetails).toHaveBeenLastCalledWith(row);
    }
    expect(onOpen).toHaveBeenCalledTimes(6);
  });

  it("keeps the complete joy collection and sends the chosen activity directly to its canonical planner", () => {
    const onPlan = vi.fn(), onSlip = vi.fn(), onOpenRooms = vi.fn();
    const joys = Array.from({ length: 12 }, (_, i) => ({ id: `joy-${i}`, type: "ritual", title: `Joy ${i}`, body: [`The complete activity ${i}.`] }));
    render(<GoodLifeFocus calmLayout presentation="focused" joys={joys} onPlan={onPlan} onSlip={onSlip} onOpenRooms={onOpenRooms}/>);
    expect(screen.queryByText("Joy 3")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "More small joys" }));
    for (const joy of joys) expect(screen.getByText(joy.title)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /^Joy 11.*Plan a time$/ }));
    expect(onPlan).toHaveBeenCalledExactlyOnceWith(joys[11]);
    fireEvent.click(screen.getByRole("button", { name: "Details & tools for Joy 11" }));
    expect(onSlip).toHaveBeenCalledExactlyOnceWith(joys[11]);
    fireEvent.click(screen.getByRole("button", { name: "A few is plenty" }));
    expect(screen.queryByText("Joy 11")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore life’s rooms" }));
    expect(onOpenRooms).toHaveBeenCalledOnce();
  });
});
