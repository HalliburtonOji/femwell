import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
const api=vi.hoisted(()=>({filter:vi.fn(),me:vi.fn(),invoke:vi.fn(),subscribe:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:api.me},functions:{invoke:api.invoke},entities:new Proxy({},{get:(_,entity)=>({filter:(...args)=>api.filter(entity,...args),subscribe:api.subscribe})})}}));
// Only decorative art and side-effecting Garden/cohort adapters are isolated.
// Actual shell, Books/Yours actions, route, parser and position writer run here.
vi.mock('./SelectedLifestyleHeader',()=>({default:({active})=><h1>{active.title}</h1>,SelectedRoomDetail:()=>null}));
vi.mock('@/components/community/readingActivity',()=>({readingDaySet:()=>new Set(),recordProgress:vi.fn(),recordPrediction:vi.fn(),recordClubReflection:vi.fn(),hasPredicted:()=>false,cohortReachedCount:async()=>null,predictionAggregate:async()=>[]}));
import Lifestyle from '@/pages/LifestyleElite';
import BookReader from '@/pages/BookReader';
function storage(){return Object.create({getItem(key){return this[key] ?? null;},setItem(key,value){this[key]=String(value);},removeItem(key){delete this[key];},get length(){return Object.keys(this).length;},key(index){return Object.keys(this)[index] ?? null;}});}
function KeptAlive(){const location=useLocation();const navigate=useNavigate();window.history.replaceState({},'',location.pathname+location.search);return <><div data-testid="kept-lifestyle" style={{display:location.pathname==='/Lifestyle'?'block':'none'}}><Lifestyle/></div><Routes><Route path="/BookReader" element={<BookReader/>}/><Route path="/Lifestyle" element={null}/></Routes><output aria-label="Current route">{location.pathname}{location.search}</output><button onClick={()=>navigate(-1)}>Test browser back</button></>;}
beforeEach(()=>{
  vi.clearAllMocks();vi.stubGlobal('localStorage',storage());window.history.replaceState({},'', '/Lifestyle?section=books');
  api.me.mockResolvedValue({id:'owner'});api.filter.mockResolvedValue([]);api.subscribe.mockReturnValue(()=>{});
  api.invoke.mockImplementation(async(name)=>({data:name==='fetchGutenbergBook'?{title:'Pride and Prejudice',author:'Jane Austen',text:'CHAPTER I\nFirst actual paragraph.\n\nSecond actual paragraph.\n\nThird actual paragraph.\n\nCHAPTER II\nNext chapter in full.',source_url:'https://www.gutenberg.org/ebooks/1342'}:{items:[]}}));
  vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[]})});
  vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
  vi.spyOn(window,'matchMedia').mockReturnValue({matches:true,addListener(){},removeListener(){}});
  const rect=HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(){
    if(this.classList.contains('ds-reader-stage'))return {top:0,bottom:600,height:600};
    if(this.classList.contains('ds-reader-body'))return {top:100,bottom:600,height:500};
    if(this.classList.contains('ds-measure-p')){const i=[...this.parentElement.children].indexOf(this);return {top:i*300,bottom:(i+1)*300,height:300};}
    return rect.call(this);
  });
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
it('opens an exact numeric classic from actual Books and refreshes Yours after the real reader writes and same-document Back',async()=>{
  localStorage.setItem('fw_reader_pos_1342',JSON.stringify({chapterIndex:0,paragraphIndex:1,pageInChapter:1,ts:1}));
  const view=render(<MemoryRouter initialEntries={['/Lifestyle?section=books']} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><KeptAlive/></MemoryRouter>);
  const main=screen.getByTestId('kept-lifestyle');
  const resume=await within(main).findByRole('button',{name:/Something you already know/});
  await waitFor(()=>expect(resume).toHaveTextContent('Project Gutenberg book 1342'));
  expect(main).toHaveTextContent('Project Gutenberg book 1342');
  fireEvent.click(resume);
  expect(await screen.findByRole('heading',{name:'Pride and Prejudice'})).toBeVisible();
  expect(screen.getByLabelText('Current route')).toHaveTextContent('/BookReader?gutenberg_id=1342');
  await waitFor(()=>expect(document.querySelector('.ds-reader-body')).toHaveTextContent('Second actual paragraph.'));
  fireEvent.click(within(document.querySelector('.ds-reader-nav')).getByRole('button',{name:'Next page'}));
  await waitFor(()=>expect(JSON.parse(localStorage.getItem('fw_reader_pos_1342'))).toMatchObject({chapterIndex:0,paragraphIndex:2,pageInChapter:2}));
  fireEvent.click(screen.getByRole('button',{name:'Test browser back'}));
  await waitFor(()=>expect(main).toBeVisible());
  const nav=within(main).getByRole('navigation',{name:'Lifestyle sections'});
  fireEvent.click(within(nav).getByRole('button',{name:'Yours',exact:true}));
  fireEvent.click(within(main).getByRole('button',{name:'Continue reading',exact:true}));
  const chooser=await screen.findByRole('dialog',{name:'Continue reading'});
  fireEvent.click(within(chooser).getByRole('button',{name:'Project Gutenberg book 1342'}));
  await screen.findByRole('heading',{name:'Pride and Prejudice'});
  await waitFor(()=>expect(document.querySelector('.ds-reader-body')).toHaveTextContent('Third actual paragraph.'));
  expect(api.filter.mock.calls.filter(([entity,query])=>entity==='LifestyleItems' && query.id)).toHaveLength(0);
  expect(api.invoke.mock.calls.filter(([name])=>name==='getLifestyleFeed')).toHaveLength(1);
  expect(api.filter.mock.calls.filter(([entity])=>entity==='UserProfile')).toHaveLength(1);
  expect(api.subscribe).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(1);
  view.unmount();
});
it('uses late exact-edition catalogue metadata in actual Yours without reinitialising shell or resolving numeric IDs as Lifestyle rows',async()=>{
  window.history.replaceState({},'', '/Lifestyle?section=yours');
  localStorage.setItem('fw_reader_pos_37106',JSON.stringify({chapterIndex:1,pageInChapter:2,ts:8}));
  let release;fetch.mockReturnValue(new Promise(resolve=>{release=resolve;}));
  render(<MemoryRouter initialEntries={['/Lifestyle?section=yours']} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><KeptAlive/></MemoryRouter>);
  const main=screen.getByTestId('kept-lifestyle');
  fireEvent.click(await within(main).findByRole('button',{name:'Continue reading',exact:true}));
  const chooser=await screen.findByRole('dialog',{name:'Continue reading'});
  await within(chooser).findByRole('button',{name:'Project Gutenberg book 37106'});
  await act(async()=>release({ok:true,json:async()=>({results:[{id:514,title:'Little Women'},{id:37106,title:'Little Women, illustrated',authors:[{name:'Louisa May Alcott'}]}]})}));
  expect(within(chooser).getByRole('button',{name:'Little Women, illustrated'})).toBeVisible();
  expect(within(chooser).queryByRole('button',{name:'Little Women',exact:true})).toBeNull();
  expect(api.filter.mock.calls.filter(([entity,query])=>entity==='LifestyleItems' && query.id)).toHaveLength(0);
  expect(api.me).toHaveBeenCalledTimes(1);expect(api.subscribe).toHaveBeenCalledTimes(1);expect(fetch).toHaveBeenCalledTimes(1);
});
