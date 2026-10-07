import React from 'react';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import Lifestyle from '@/pages/LifestyleElite';
import BooksStoryFocus from './BooksStoryFocus';
const mock=vi.hoisted(()=>({empty:vi.fn(),chapters:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:async()=>({id:'owner'})},functions:{invoke:async()=>({data:{items:[]}})},entities:new Proxy({},{get:(_,name)=>({filter:name==='DailyStory' ? mock.chapters : mock.empty,subscribe:()=>()=>{}})})}}));
vi.mock('@/components/lifestyle/DailyStoryReader',()=>({default:({goToChapter,onExit})=><div role="dialog" aria-label="Actual chapter reader"><p>Chapter index: {goToChapter}</p><button onClick={onExit}>Exit chapter reader</button></div>}));
vi.mock('./SelectedLifestyleHeader',()=>({default:({active})=><h1>{active.title}</h1>,SelectedRoomDetail:()=>null}));
beforeEach(()=>{mock.empty.mockResolvedValue([]);mock.chapters.mockResolvedValue([]);vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[]})});window.history.replaceState({},'', '/Lifestyle');});
describe('approved main Lifestyle parity',()=>{
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
    fireEvent.click(await screen.findByRole('button',{name:'Read straight through from chapter 1 ›'}));
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 0');
    fireEvent.click(screen.getByRole('button',{name:'Exit chapter reader'}));
    fireEvent.click(screen.getAllByRole('button',{name:"Today's chapter",exact:true})[0]);
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 1');
    fireEvent.click(screen.getByRole('button',{name:'Exit chapter reader'}));
    fireEvent.click(screen.getByRole('button',{name:/Today’s chapter · notes/}));
    expect(screen.getByRole('button',{name:/Mark.*read/})).toBeVisible();
    expect(screen.getByRole('button',{name:/Reflect/})).toBeVisible();
  });
  it('opens a real section by default, keeps all six controls and all eleven whole-life doors',async()=>{
    render(<Lifestyle/>);
    const nav=await screen.findByRole('navigation',{name:'Lifestyle sections'});
    expect(within(nav).getAllByRole('button')).toHaveLength(6);
    await waitFor(()=>expect(within(nav).getByRole('button',{name:'Read',exact:true})).toHaveAttribute('aria-pressed','true'));
    for(const name of ['The Mirror','Move','Kindred','Curious','Delight','Nest','Tonight','Becoming','Outside','Make','Money'])expect(screen.getAllByRole('button',{name,exact:true}).length).toBeGreaterThan(0);
    expect(screen.getByRole('button',{name:'Everything',exact:true})).toBeVisible();
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
});
