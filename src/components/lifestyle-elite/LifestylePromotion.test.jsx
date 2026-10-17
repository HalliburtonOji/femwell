import React from 'react';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import Lifestyle from '@/pages/LifestyleElite';
import BooksStoryFocus from './BooksStoryFocus';
const mock=vi.hoisted(()=>({empty:vi.fn(),chapters:vi.fn(),readings:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:async()=>({id:'owner'})},functions:{invoke:async()=>({data:{items:[]}})},entities:new Proxy({},{get:(_,name)=>({filter:name==='DailyStory' ? mock.chapters : name==='HoroscopeReading' ? mock.readings : mock.empty,subscribe:()=>()=>{}})})}}));
vi.mock('@/components/lifestyle/DailyStoryReader',()=>({default:({goToChapter,onExit})=><div role="dialog" aria-label="Actual chapter reader"><p>Chapter index: {goToChapter}</p><button onClick={onExit}>Exit chapter reader</button></div>}));
vi.mock('./SelectedLifestyleHeader',()=>({default:({active})=><h1>{active.title}</h1>,SelectedRoomDetail:()=>null}));
beforeEach(()=>{mock.empty.mockResolvedValue([]);mock.chapters.mockResolvedValue([]);mock.readings.mockResolvedValue([]);vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[]})});window.history.replaceState({},'', '/Lifestyle');});
describe('approved main Lifestyle parity',()=>{
  it('names the exact joy action as planning and opens the existing time choice',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=good&joy=try-11gq3zo');render(<Lifestyle/>);
    const joy=await screen.findByRole('dialog',{name:/Read one poem, out loud, to no one/});
    expect(joy).toHaveTextContent('Read one poem, out loud, to no one');
    expect(within(joy).getByRole('button',{name:'Close'})).toBeVisible();
    fireEvent.click(within(joy).getByRole('button',{name:'Plan a time',exact:true}));
    expect(await screen.findByRole('dialog',{name:'Plan a time',exact:true})).toHaveTextContent('Read one poem, out loud, to no one');
  });
  it('reconciles a settled new Sky reading back into the same owner’s glance',async()=>{
    const today=new Date().toISOString().slice(0,10),previous=new Date(Date.now()-86400000).toISOString().slice(0,10);
    mock.readings.mockImplementation(async filter=>[{id:filter.reading_date ? 'new' : 'old',user_id:'owner',reading_date:filter.reading_date ? today : previous,headline:filter.reading_date ? 'The newly produced reading' : 'The previous reading'}]);
    window.history.replaceState({},'', '/Lifestyle?section=sky');render(<Lifestyle/>);
    await waitFor(()=>expect(mock.readings.mock.calls.map(([filter])=>filter)).toContainEqual({user_id:'owner',reading_date:today}));
    await waitFor(()=>expect(screen.getAllByRole('button').filter(button=>button.textContent.includes('Your sky')).map(button=>button.textContent).join(' | ')).toContain('The newly produced reading'));
    expect(mock.readings).toHaveBeenCalledWith({user_id:'owner',reading_date:today},'-created_date',1);
    expect(screen.queryByRole('button',{name:/Your sky\s*The previous reading/})).not.toBeInTheDocument();
  });
  it('keeps the active room’s exact source URL instead of silently changing its identity',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=sky&reading=old-reading');render(<Lifestyle/>);
    const nav=await screen.findByRole('navigation',{name:'Lifestyle sections'});
    await waitFor(()=>expect(within(nav).getByRole('button',{name:'Sky',exact:true})).toHaveAttribute('aria-pressed','true'));
    fireEvent.click(within(nav).getByRole('button',{name:'Sky',exact:true}));
    expect(window.location.search).toBe('?section=sky&reading=old-reading');
  });
  it('resets manual chapter choice only when she asks for Today’s chapter, preserving the original notes sheet',async()=>{
    const today=new Date().toISOString().slice(0,10);
    mock.chapters.mockResolvedValue([{id:'first',series_key:'real-run',day_number:1,segment_text:'First chapter',published_date:'2020-01-01'},{id:'today',series_key:'real-run',day_number:2,segment_text:'Today’s actual text',published_date:today}]);
    window.history.replaceState({},'', '/Lifestyle?section=books');render(<Lifestyle/>);
    fireEvent.click(await screen.findByText('Chapters & short reads'));
    fireEvent.click(await screen.findByRole('button',{name:'Read straight through from chapter 1 ›'}));
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 0');
    fireEvent.click(screen.getByRole('button',{name:'Exit chapter reader'}));
    const chapterIndex=screen.getByText('Chapters & short reads').closest('details');
    if(!chapterIndex.open)fireEvent.click(screen.getByText('Chapters & short reads'));
    fireEvent.click(screen.getByRole('button',{name:/Today.s open chapter/}));
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 1');
    fireEvent.click(screen.getByRole('button',{name:'Exit chapter reader'}));
    fireEvent.click(screen.getByRole('button',{name:/Notes & reflection/}));
    expect(screen.getByRole('button',{name:/Mark.*read/})).toBeVisible();
    expect(screen.getByRole('button',{name:/Reflect/})).toBeVisible();
  });
  it('opens complete chapter notes in the clean Lifestyle sheet and keeps all three actions',async()=>{
    mock.chapters.mockResolvedValue([{id:'chapter-one',series_key:'real-run',day_number:1,segment_text:'## Chapter 1 — Arrival\n\nThe actual first paragraph.\n\nThe actual second paragraph.',published_date:'2020-01-01'}]);
    window.history.replaceState({},'', '/Lifestyle?section=books');render(<Lifestyle/>);
    fireEvent.click(await screen.findByRole('button',{name:/Notes & reflection/}));
    const sheet=screen.getByRole('dialog',{name:/real-run|chapter/i});
    expect(sheet).toHaveClass('fw-focused-sheet');
    expect(sheet).toHaveAttribute('data-room','books');
    expect(within(sheet).getByText(/The actual first paragraph/)).toBeVisible();
    expect(within(sheet).getByText(/The actual second paragraph/)).toBeVisible();
    expect(sheet).not.toHaveTextContent('Tomorrow: chapter 1 of 1');
    expect(within(sheet).getByRole('button',{name:'Mark as read'})).toBeVisible();
    expect(within(sheet).getByRole('button',{name:'Read straight through'})).toBeVisible();
    expect(within(sheet).getByRole('button',{name:'Reflect on it'})).toBeVisible();
    fireEvent.click(within(sheet).getByRole('button',{name:'Read straight through'}));
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 0');
  });
  it('keeps the chapter detail open and tells the truth when local reading cannot be kept',async()=>{
    mock.chapters.mockResolvedValue([{id:'storage-test-chapter',series_key:'real-run',day_number:1,segment_text:'The full chapter remains here.',published_date:'2020-01-01'}]);
    window.history.replaceState({},'', '/Lifestyle?section=books');render(<Lifestyle/>);
    fireEvent.click(await screen.findByRole('button',{name:/Notes & reflection/}));
    const sheet=screen.getByRole('dialog',{name:/real-run|chapter/i});
    vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{throw new Error('storage denied');}});
    try {
      fireEvent.click(within(sheet).getByRole('button',{name:'Mark as read'}));
      expect(sheet).toBeVisible();
      expect(screen.getByText(/Couldn't keep that reading on this device/)).toBeVisible();
    } finally {vi.unstubAllGlobals();}
  });
  it('opens the clean room picker, selects the exact room and restores focus after close',async()=>{
    render(<Lifestyle/>);
    const trigger=await screen.findByRole('button',{name:'Jump to an area'});
    fireEvent.click(trigger);
    const picker=screen.getByRole('dialog',{name:'Choose a room'});
    expect(picker).toHaveClass('fw-focused-sheet');
    expect(within(picker).getAllByRole('button')).toHaveLength(7);
    fireEvent.click(within(picker).getByRole('button',{name:'Close'}));
    await waitFor(()=>expect(trigger).toHaveFocus());
    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByRole('dialog',{name:'Choose a room'})).getByRole('button',{name:/Sky/}));
    const nav=screen.getByRole('navigation',{name:'Lifestyle sections'});
    expect(within(nav).getByRole('button',{name:'Sky',exact:true})).toHaveAttribute('aria-pressed','true');
  });
  it('opens a real section by default, keeps all six controls and all eleven whole-life doors',async()=>{
    render(<Lifestyle/>);
    const nav=await screen.findByRole('navigation',{name:'Lifestyle sections'});
    expect(within(nav).getAllByRole('button')).toHaveLength(6);
    await waitFor(()=>expect(within(nav).getByRole('button',{name:'Read',exact:true})).toHaveAttribute('aria-pressed','true'));
    expect(screen.getByRole('button',{name:'Everything',exact:true})).toBeVisible();
    fireEvent.click(within(nav).getByRole('button',{name:'Good life',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:/Explore life’s rooms/}));
    const room=screen.getByRole('combobox',{name:'Room'});
    for(const name of ['Mirror','Move','Kindred','Curious','Delight','Nest','Tonight','Becoming','Outside','Make','Money'])expect(within(room).getByRole('option',{name})).toBeVisible();
  });
  it('keeps Everything through remount and clears foreign content identity when changing rooms',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=read&reading=old&lesson=old#daily-sky-lesson');
    const view=render(<Lifestyle/>);
    fireEvent.click(await screen.findByRole('button',{name:'Everything',exact:true}));
    expect(window.location.search).toBe('?section=all');
    expect(screen.getByRole('heading',{name:'Your life, in bloom'})).toBeVisible();
    view.unmount();render(<Lifestyle/>);
    const nav=await screen.findByRole('navigation',{name:'Lifestyle sections'});
    await waitFor(()=>expect(within(nav).getAllByRole('button').every(button=>button.getAttribute('aria-pressed')==='false')).toBe(true));
    expect(screen.getByRole('region',{name:'For you today'})).toBeVisible();
    fireEvent.click(within(nav).getByRole('button',{name:'Listen',exact:true}));
    expect(window.location.search).toBe('?section=listen');
    expect(within(nav).getByRole('button',{name:'Listen',exact:true})).toHaveAttribute('aria-pressed','true');
  });
  it('still honours Today’s existing daily_story alias rather than dropping her onto Read',async()=>{
    window.history.replaceState({},'', '/Lifestyle?tab=daily_story');render(<Lifestyle/>);
    const nav=await screen.findByRole('navigation',{name:'Lifestyle sections'});
    await waitFor(()=>expect(within(nav).getByRole('button',{name:'Books',exact:true})).toHaveAttribute('aria-pressed','true'));
    expect(screen.getAllByRole('button',{name:"Today's chapter",exact:true}).every(button=>button.textContent.includes("Today's chapter"))).toBe(true);
  });
  it('keeps actual fiction and classics reachable from the Books body with their distinct tools',()=>{
    const open=vi.fn(),details=vi.fn(),notes=vi.fn();
    const fiction={id:'real-fiction',title:'The exact fiction',subtitle:'Her own shelf'};
    const classic={id:'gut-1342',gutenbergId:1342,title:'The exact classic'};
    render(<BooksStoryFocus artDirection="reading-room" shelfBookCards={[fiction]} classicCards={[classic]} onOpenBook={open} onBookDetails={details} onChapterDetails={notes}/>);
    fireEvent.click(screen.getByRole('button',{name:/The exact fiction/}));expect(open).toHaveBeenLastCalledWith(fiction);
    fireEvent.click(screen.getByRole('button',{name:/The exact classic/}));expect(open).toHaveBeenLastCalledWith(classic);
    const library=document.getElementById('book-library');
    fireEvent.click(within(library).getAllByRole('button',{name:/Details & tools/})[1]);expect(details).toHaveBeenCalledWith(classic);
    fireEvent.click(screen.getByRole('button',{name:/Today’s chapter · notes/}));expect(notes).toHaveBeenCalledTimes(1);
  });
  it('opens the full shelf disclosure with its own cue in one tap on main',()=>{
    render(<BooksStoryFocus calmLayout artDirection="reading-room" shelfBookCards={[{id:'owned-book',title:'My own book'}]} />);
    const library=document.getElementById('book-library');
    const disclosure=library.closest('details');
    expect(disclosure.open).toBe(false);
    fireEvent.click(screen.getByRole('button',{name:/Open your shelf & free classics/}));
    expect(disclosure.open).toBe(true);
    expect(within(disclosure).getByRole('button',{name:/My own book/})).toBeVisible();
  });
});
