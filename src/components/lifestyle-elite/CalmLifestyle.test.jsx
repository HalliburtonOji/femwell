import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ReadFocus from "./ReadFocus";
import ListenFocus from "./ListenFocus";
import GoodLifeFocus from "./GoodLifeFocus";
import YoursFocus from "./YoursFocus";
import { ExpandDetailCard } from "@/components/brand/expandCards";
import { CalmTaskDialog } from "./CalmLifestyle";
vi.mock("@/api/base44Client", () => ({ base44: { auth: { me: vi.fn() }, entities: {}, functions: { invoke: vi.fn() } } }));

describe("calmer lists preserve exact source tasks", () => {
  it("gives Ideas Yours the owned source first and keeps every wider-library row behind a truthful choice", () => {
    const saved={id:"owned-story",type:"daily_story",title:"Her kept story",sourceName:"FemWell Fiction",body:["Full kept story."]};
    const candidates=[0,1,2].map(index=>({id:`candidate-${index}`,type:"article",title:`Other find ${index}`,sourceName:"FemWell Fiction",body:[`Full source ${index}.`]}));
    const onOpen=vi.fn();
    const {container}=render(<YoursFocus calmLayout editorialPreview presentation="focused" savedCards={[saved]} phaseCards={candidates} onOpen={onOpen}/>);
    expect(screen.getByRole("heading",{name:"Stories"})).toBeVisible();
    const other=screen.getByText("Browse other finds · 3").closest("details");
    expect(other.open).toBe(false);
    fireEvent.click(screen.getByRole("button",{name:/Her kept story.*Read/}));
    expect(onOpen).toHaveBeenLastCalledWith(saved);
    fireEvent.click(other.querySelector("summary"));
    expect(other.open).toBe(true);
    expect(screen.getByText("From the wider library, not chosen from your keeps.")).toBeVisible();
    fireEvent.click(screen.getByText("More discoveries · 1").closest("summary"));
    expect(container.querySelectorAll(".fw-calm-find-primary")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button",{name:/Other find 2.*Open/}));
    expect(onOpen).toHaveBeenLastCalledWith(candidates[2]);
  });
  it("shows a save invitation before optional discoveries when Yours has no owned keep", () => {
    render(<YoursFocus calmLayout editorialPreview presentation="focused" phaseCards={[{id:"candidate",type:"article",title:"Other find"}]}/>);
    expect(screen.getByRole("heading",{name:"Keep what you love"})).toBeVisible();
    expect(screen.getByText("Browse other finds · 1").closest("details").open).toBe(false);
  });
  it("does not mistake a loading or failed owner read for an empty drawer", () => {
    const {rerender}=render(<YoursFocus calmLayout editorialPreview presentation="focused" ownedLoading/>);
    expect(screen.getByRole("status")).toHaveTextContent("Finding your keeps");
    expect(screen.queryByRole("heading",{name:"Keep what you love"})).not.toBeInTheDocument();
    rerender(<YoursFocus calmLayout editorialPreview presentation="focused" ownedError/>);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Keep what you love"})).not.toBeInTheDocument();
  });
  it("distinguishes different same-title discoveries with their own source words and preserves both exact actions", () => {
    const onOpen=vi.fn(),onDetails=vi.fn();
    const rows=[{id:"mara",type:"book",title:"Starting Over",summary:"Mara runs her mother's flower shop."},{id:"lena",type:"book",title:"Starting Over",summary:"Lena makes ceramics while caring for her mother."},{id:"unique",type:"article",title:"Other find",summary:"No repeated preview needed."}];
    render(<YoursFocus calmLayout presentation="focused" phaseCards={rows} onOpen={onOpen} onDetails={onDetails}/>);
    expect(screen.getByText(rows[0].summary)).toBeVisible();
    expect(screen.getByText(rows[1].summary)).not.toBeVisible();
    fireEvent.click(screen.getByText("More discoveries · 1"));
    expect(screen.getByText(rows[1].summary)).toBeVisible();
    expect(screen.queryByText(rows[2].summary)).not.toBeInTheDocument();
    const opens=screen.getAllByRole("button",{name:/^Starting Over.*Open$/});const details=screen.getAllByRole("button",{name:"Details & tools for Starting Over"});
    rows.slice(0,2).forEach((row,index)=>{fireEvent.click(opens[index]);expect(onOpen).toHaveBeenLastCalledWith(row);fireEvent.click(details[index]);expect(onDetails).toHaveBeenLastCalledWith(row);});
  });
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
  it("leads with a named saved place and contrasting story while every other exact read stays reachable", () => {
    const onOpen = vi.fn(), onDetails = vi.fn();
    const rows = Array.from({ length: 7 }, (_, i) => ({ id: `source-${i}`, title: `Complete source ${i}`, type: "article", body: [`Full unshortened source ${i}.`], _raw: { id: `raw-${i}` } }));
    rows[4]._raw.author_name="FemWell Fiction";
    const resume={id:"saved-place",title:"The Shape of Starting Over",type:"book",_continue:{id:"saved-place"}};
    render(<ReadFocus calmLayout editorialPreview presentation="focused" articleCards={rows.slice(0, 4)} storyCards={rows.slice(4)} continueCards={[resume]} onOpen={onOpen} onDetails={onDetails}/>);
    fireEvent.click(screen.getByRole("button",{name:"Continue The Shape of Starting Over"}));
    expect(onOpen).toHaveBeenLastCalledWith(resume);
    fireEvent.click(screen.getByRole("button",{name:"Read Complete source 0"}));
    expect(onOpen).toHaveBeenLastCalledWith(rows[0]);
    expect(screen.getByText(rows[3].title)).not.toBeVisible();
    expect(screen.getByText(rows[6].title)).not.toBeVisible();
    fireEvent.click(screen.getByText("Browse all reading · 6"));
    for (const row of rows.filter(row=>row!==rows[0])) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${row.title}.*Read$`) }));
      expect(onOpen).toHaveBeenLastCalledWith(row);
      fireEvent.click(screen.getByRole("button", { name: `Details & tools for ${row.title}` }));
      expect(onDetails).toHaveBeenLastCalledWith(row);
    }
    expect(onOpen).toHaveBeenCalledTimes(8);
  });

  it("offers a whole-life editorial draft beside a saved fiction place without hiding the story", () => {
    const onOpen=vi.fn();
    const saved={id:"saved",title:"The Shape of Starting Over",type:"book",_continue:{id:"saved"}};
    const essay={id:"essay",title:"The plans you actually want to keep",type:"article",_raw:{id:"essay",editorial_local:true},saveable:false};
    const story={id:"story",title:"The Tuesday Decision",type:"daily_story",_raw:{id:"story",author_name:"FemWell Fiction"}};
    render(<ReadFocus calmLayout editorialPreview presentation="focused" continueCards={[saved]} articleCards={[essay]} storyCards={[story]} onOpen={onOpen}/>);
    fireEvent.click(screen.getByRole("button",{name:"Read The plans you actually want to keep"}));
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(essay);
    fireEvent.click(screen.getByText("Browse all reading · 1"));
    expect(screen.getByRole("button",{name:/The Tuesday Decision.*Read/})).toBeVisible();
  });

  it("offers a compact sourced Read issue without hiding an older exact source or its tools", () => {
    const onOpen=vi.fn(),onDetails=vi.fn();
    const date=new Date(),today=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
    const resume={id:"saved",title:"The Shape of Starting Over",type:"book",_continue:{id:"saved"}};
    const feature={id:"feature",title:"The plans you actually want to keep",type:"article",_raw:{editorial_local:true,content_type:"ARTICLE"},saveable:false};
    const guide={id:"guide",title:"The payment you forgot about",type:"article",_raw:{editorial_local:true,content_type:"GUIDE",duration_label:"About 2 min read"},saveable:false};
    const news={id:"news",title:"The energy cap changed",type:"article",_raw:{editorial_local:true,content_type:"NEWS",published_at:today,expires_at:today,duration_label:"About 2 min read"},saveable:false};
    const older={id:"older",title:"The older full article",type:"article",_raw:{provider:"EDITORIAL"}};
    const {rerender}=render(<ReadFocus calmLayout editorialPreview presentation="focused" continueCards={[resume]} articleCards={[feature,guide,news,older]} onOpen={onOpen} onDetails={onDetails}/>);
    expect(screen.getByRole("heading",{name:"The plans you actually want to keep"})).toBeVisible();
    expect(screen.getByRole("button",{name:"Read The payment you forgot about"})).toBeVisible();
    expect(screen.getByRole("button",{name:"Read The energy cap changed"})).toBeVisible();
    expect(screen.getByText("The older full article")).not.toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:"Read The payment you forgot about"}));expect(onOpen).toHaveBeenLastCalledWith(guide);
    fireEvent.click(screen.getByRole("button",{name:"Details & tools for The payment you forgot about"}));expect(onDetails).toHaveBeenLastCalledWith(guide);
    fireEvent.click(screen.getByRole("button",{name:"Read The energy cap changed"}));expect(onOpen).toHaveBeenLastCalledWith(news);
    fireEvent.click(screen.getByText("Browse all reading · 1"));
    fireEvent.click(screen.getByRole("button",{name:/The older full article.*Read/}));expect(onOpen).toHaveBeenLastCalledWith(older);
    rerender(<ReadFocus calmLayout editorialPreview presentation="focused" continueCards={[resume]} articleCards={[feature,guide,{...news,_raw:{...news._raw,expires_at:today}},older]} onOpen={onOpen} onDetails={onDetails}/>);
    expect(within(screen.getByLabelText("Useful reads in this issue")).getByRole("button",{name:"Read The energy cap changed"})).toBeVisible();
    rerender(<ReadFocus calmLayout editorialPreview presentation="focused" continueCards={[resume]} articleCards={[feature,guide,{...news,_raw:{...news._raw,expires_at:"2026-01-01"}},older]} onOpen={onOpen} onDetails={onDetails}/>);
    expect(within(screen.getByLabelText("Useful reads in this issue")).queryByRole("button",{name:"Read The energy cap changed"})).not.toBeInTheDocument();
    expect(screen.getByText("Browse all reading · 2")).toBeVisible();
    const old=new Date(Date.now()-16*86400000).toISOString().slice(0,10),future=new Date(Date.now()+28*86400000).toISOString().slice(0,10);
    rerender(<ReadFocus calmLayout editorialPreview presentation="focused" continueCards={[resume]} articleCards={[feature,guide,{...news,_raw:{...news._raw,published_at:old,expires_at:future}},older]} onOpen={onOpen} onDetails={onDetails}/>);
    expect(within(screen.getByLabelText("Useful reads in this issue")).queryByRole("button",{name:"Read The energy cap changed"})).not.toBeInTheDocument();
    expect(screen.getByText("Browse all reading · 2")).toBeVisible();
  });

  it("keeps one direct watch alternative and the remaining exact media behind Browse", () => {
    const onOpen=vi.fn();
    const audio=[0,1,2].map(i=>({id:`audio-${i}`,type:"audio",title:`Episode ${i}`,audioSrc:`https://example.test/${i}.mp3`,duration:2400,meta:[["Clock","40 min"]],actions:[]}));
    const videos=[0,1].map(i=>({id:`video-${i}`,type:"video",title:`Film ${i}`,youtubeId:`film-${i}`,meta:[],actions:[]}));
    const {container}=render(<ListenFocus calmLayout presentation="focused" audioCards={audio} videoCards={videos} onOpen={onOpen}/>);
    fireEvent.click(screen.getByRole("button",{name:"Play Film 0"}));
    expect(container.querySelector('iframe[title="Film 0"]')).toBeInTheDocument();
    fireEvent.click(within(container.querySelector(".fw-calm-watch-choice")).getByRole("button",{name:"Details & tools"}));
    expect(onOpen).toHaveBeenLastCalledWith(videos[0]);
    expect(screen.getByText("Episode 2")).not.toBeVisible();
    fireEvent.click(screen.getByText("Browse all listens & watches · 3"));
    expect(screen.getByText("Episode 2")).toBeVisible();
    fireEvent.click(screen.getAllByRole("button",{name:/Film 1/}).at(-1));
    expect(onOpen).toHaveBeenLastCalledWith(videos[1]);
  });

  it("leads with the checked actual roundtable instead of an unrelated playable episode", () => {
    const unrelated={id:"other",type:"audio",title:"A lunch room for life",audioSrc:"https://example.test/other.mp3",sourceName:"Elsewhere",meta:[],actions:[]};
    const checked={id:"roundtable",type:"audio",title:"Mel Giedroyc and AJ Odudu on Body Confidence, Midlife Reinvention and Female Friendship",audioSrc:"https://example.test/roundtable.mp3",sourceName:"How To Fail With Elizabeth Day",meta:[],actions:[]};
    const watch={id:"watch",type:"video",title:"A different watch",youtubeId:"known-video",meta:[],actions:[]};
    render(<ListenFocus calmLayout presentation="focused" audioCards={[unrelated,checked]} videoCards={[watch]} onOpen={vi.fn()}/>);
    expect(screen.getByText("From the listening desk")).toBeVisible();
    expect(screen.getByText(/Mel, AJ and Elizabeth on friendship/)).toBeVisible();
    expect(screen.getByText(unrelated.title)).not.toBeVisible();
    fireEvent.click(screen.getByText("Browse all listens & watches · 1"));
    expect(screen.getByText(unrelated.title)).toBeVisible();
  });

  it("does not feature an external lecture when a watch is the only directly playable choice", () => {
    const onOpen=vi.fn();
    const external={id:"long-show",type:"audio",title:"Long external lecture",external:true,meta:[["Clock","2h 14min"]],actions:[]};
    const watch={id:"watch",type:"video",title:"A watch to open",youtubeId:"known-video",meta:[["Clock","20 min"]],actions:[]};
    render(<ListenFocus calmLayout presentation="focused" audioCards={[external]} videoCards={[watch]} onOpen={onOpen}/>);
    fireEvent.click(screen.getByRole("button",{name:"Play A watch to open"}));
    expect(screen.getByTitle("A watch to open")).toBeInTheDocument();
    expect(screen.queryByText("Long external lecture")).not.toBeVisible();
    fireEvent.click(screen.getByText("Browse all listens & watches · 1"));
    fireEvent.click(screen.getByRole("button",{name:/Long external lecture/}));
    expect(onOpen).toHaveBeenLastCalledWith(external);
  });

  it("names an external-only show honestly when there is nothing playable here", () => {
    const show={id:"show",type:"audio",title:"A source-only show",external:true,meta:[],actions:[]};
    render(<ListenFocus calmLayout presentation="focused" audioCards={[show]} videoCards={[]} onOpen={vi.fn()}/>);
    expect(screen.getByText("Listen elsewhere")).toBeVisible();
    expect(screen.getByText("Choose a show")).toBeVisible();
    expect(screen.queryByText("Press play")).not.toBeInTheDocument();
  });

  it("opens a show directory without a fictional episode body or a broken Save", () => {
    const openSource=vi.fn();
    render(<ExpandDetailCard presentation="focused" room="listen" active item={{id:"show-directory",type:"audio",title:"A show",external:true,showDirectory:true,saveable:false,summary:"Choose the current episode at its source.",body:[],meta:[["Headphones","Show directory"],["Clock","Episode lengths vary"]],actions:[{label:"Spotify",onClick:openSource}]}} onClose={vi.fn()}/>);
    expect(screen.getByText("Choose the current episode at its source.")).toBeVisible();
    expect(screen.queryByText(/Only a summary is published here/)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox",{name:"Save"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Spotify"}));
    expect(openSource).toHaveBeenCalledOnce();
  });

  it("keeps the complete joy collection and sends the chosen activity directly to its canonical planner", () => {
    const onPlan = vi.fn(), onSlip = vi.fn(), onOpenRooms = vi.fn();
    const joys = Array.from({ length: 12 }, (_, i) => ({ id: `joy-${i}`, type: "ritual", title: `Joy ${i}`, body: [`The complete activity ${i}.`] }));
    render(<GoodLifeFocus calmLayout presentation="focused" joys={joys} onPlan={onPlan} onSlip={onSlip} onOpenRooms={onOpenRooms}/>);
    expect(screen.queryByText("Joy 3")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Day-off ideas & permission" }));
    for (const joy of joys) expect(screen.getByText(joy.title)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /^Joy 11.*Plan a time$/ }));
    expect(onPlan).toHaveBeenCalledExactlyOnceWith(joys[11]);
    fireEvent.click(screen.getByRole("button", { name: "Details & tools for Joy 11" }));
    expect(onSlip).toHaveBeenCalledExactlyOnceWith(joys[11]);
    fireEvent.click(screen.getByRole("button", { name: "Show just three" }));
    expect(screen.queryByText("Joy 11")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore life’s rooms" }));
    expect(onOpenRooms).toHaveBeenCalledOnce();
  });

  it("keeps the Ideas joy's full source and Plan action while marking only its opened sheet for the new material", () => {
    const onPlan=vi.fn(),onSlip=vi.fn();
    const joys=Array.from({length:5},(_,i)=>({id:`joy-${i}`,title:`Joy ${i}`,body:[`Complete source ${i}.`]}));
    const {container}=render(<GoodLifeFocus calmLayout ideasEdition presentation="focused" timeLens={<button>Real time picker</button>} joys={joys} onPlan={onPlan} onSlip={onSlip} onOpenRooms={vi.fn()}/>);
    expect(container.querySelector(".fw-good-clearing")).toBeInTheDocument();
    expect(container.querySelector(".fw-selected-time .fw-folio-card")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Day-off ideas & permission"}));
    expect(screen.getByText("Joy 4")).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:/Joy 4.*Open this joy/}));
    expect(onSlip).toHaveBeenCalledWith({...joys[4],__goodIdeas:true});
    fireEvent.click(screen.getAllByRole("button",{name:/Plan a time/})[4]);
    expect(onPlan).toHaveBeenCalledWith(joys[4]);
  });
});
