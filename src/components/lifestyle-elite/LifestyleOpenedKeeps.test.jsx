import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
const api=vi.hoisted(()=>({filter:vi.fn(),me:vi.fn(),invoke:vi.fn(),subscribe:vi.fn(),update:vi.fn(),create:vi.fn(),delete:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:api.me},functions:{invoke:api.invoke},entities:new Proxy({},{get:(_,entity)=>({filter:(...args)=>api.filter(entity,...args),subscribe:api.subscribe,update:(...args)=>api.update(entity,...args),create:(...args)=>api.create(entity,...args),delete:(...args)=>api.delete(entity,...args)})})}}));
// Only decorative art and side-effecting Garden/cohort adapters are isolated.
// Actual shell, Books/Yours actions, route, parser and position writer run here.
vi.mock('@/components/lifestyle-elite/SelectedLifestyleHeader',()=>({default:({active})=><h1>{active.title}</h1>,SelectedRoomDetail:()=>null}));
vi.mock('@/components/community/readingActivity',()=>({readingDaySet:()=>new Set(),recordProgress:vi.fn(),recordPrediction:vi.fn(),recordClubReflection:vi.fn(),hasPredicted:()=>false,cohortReachedCount:async()=>null,predictionAggregate:async()=>[]}));
import Lifestyle from '@/pages/LifestyleElite';
import BookReader from '@/pages/BookReader';
function storage(){return Object.create({getItem(key){return this[key] ?? null;},setItem(key,value){this[key]=String(value);},removeItem(key){delete this[key];},get length(){return Object.keys(this).length;},key(index){return Object.keys(this)[index] ?? null;}});}
function KeptAlive(){const location=useLocation();const navigate=useNavigate();window.history.replaceState({},'',location.pathname+location.search);return <><div data-testid="kept-lifestyle" aria-hidden={location.pathname!=="/Lifestyle" ? true : undefined} style={{display:location.pathname==='/Lifestyle'?'block':'none'}}><Lifestyle/></div><Routes><Route path="/BookReader" element={<BookReader/>}/><Route path="/Lifestyle" element={null}/></Routes><output aria-label="Current route">{location.pathname}{location.search}</output><button onClick={()=>navigate(-1)}>Test browser back</button></>;}
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
async function openFictionDetails(){
 const fiction={id:'audit-fiction',title:'Actual fiction',summary:'Source opening.',body:'The entire actual fiction paragraph.',content_type:'FICTION',status:'PUBLISHED'};
 api.filter.mockImplementation(async(entity,query)=>entity==='UserProfile'? profileLookup() : entity==='LifestyleItems' && (!query.media_type || query.media_type==='FICTION') ? [fiction] : []);
 api.update.mockImplementation(async(entity,id,data)=>({id,user_id:'owner',...data}));api.create.mockImplementation(async(entity,data)=>({id:'created-profile',...data}));
 render(<MemoryRouter initialEntries={['/Lifestyle?section=books']}><KeptAlive/></MemoryRouter>);
 const main=screen.getByTestId('kept-lifestyle');await waitFor(()=>expect(main.querySelector('#book-library')).not.toBeNull());
 fireEvent.click(within(main.querySelector('#book-library')).getByRole('button',{name:'Details & tools ›'}));
 await screen.findAllByRole('button',{name:'Save',exact:true});
 return screen.getAllByRole('button',{name:'Save',exact:true})[0];
}
let profileLookup;
it('does not overwrite a newer existing keep through actual Books detail Save',async()=>{
 let fresh=false;profileLookup=()=>[{id:'profile',user_id:'owner',saved_item_ids:fresh?['earlier','newer']:['earlier']}];
 const save=await openFictionDetails();fresh=true;fireEvent.click(save);
 await waitFor(()=>expect(api.update).toHaveBeenCalled());
 expect(api.update.mock.calls.find(([entity])=>entity==='UserProfile')[2].saved_item_ids).toEqual(['earlier','newer','audit-fiction']);
});
it('does not create a duplicate profile after the initial lookup failed but a canonical profile exists',async()=>{
 let calls=0;profileLookup=()=>{if(++calls===1)throw Error('offline');return [{id:'canonical-profile',user_id:'owner',saved_item_ids:['existing']}];};
 const save=await openFictionDetails();fireEvent.click(save);
 await waitFor(()=>expect(api.create.mock.calls.length+api.update.mock.calls.length).toBeGreaterThan(0));
 expect(api.create).not.toHaveBeenCalled();
 expect(api.update).toHaveBeenCalledWith('UserProfile','canonical-profile',{saved_item_ids:['existing','audit-fiction']});
});
it('does not acknowledge a returned id with the wrong owner or saved array',async()=>{
 profileLookup=()=>[{id:'profile',user_id:'owner',saved_item_ids:['earlier']}];
 const save=await openFictionDetails();api.update.mockResolvedValue({id:'profile',user_id:'foreign',saved_item_ids:[]});fireEvent.click(save);
 await waitFor(()=>expect(api.update).toHaveBeenCalled());
 expect(screen.queryByText('Kept for later')).toBeNull();
 await waitFor(()=>expect(save).not.toBeDisabled());
 expect(save).toHaveAttribute('aria-pressed','false');
});

it('keeps a failed authority read retryable without creating or changing a profile',async()=>{
 let fail=false;profileLookup=()=>{if(fail)throw Error('offline');return [{id:'profile',user_id:'owner',saved_item_ids:['existing']}];};
 const save=await openFictionDetails();fail=true;fireEvent.click(save);
 await screen.findByText("Couldn't update your keeps — try again");
 expect(api.update).not.toHaveBeenCalled();expect(api.create).not.toHaveBeenCalled();
 await waitFor(()=>expect(save).not.toBeDisabled());fail=false;fireEvent.click(save);
 await screen.findByText('Kept for later');
 expect(api.update).toHaveBeenCalledExactlyOnceWith('UserProfile','profile',{saved_item_ids:['existing','audit-fiction']});
});

it('stops mutation when the account changes during the exact source authority read',async()=>{
 profileLookup=()=>[{id:'profile',user_id:'owner',saved_item_ids:['existing']}];
 const save=await openFictionDetails(), original=api.filter.getMockImplementation();
 api.filter.mockImplementation(async(entity,...args)=>{if(entity==='SavedItems' && args[0]?.item_id==='audit-fiction')api.me.mockResolvedValue({id:'other-owner'});return original(entity,...args);});
 fireEvent.click(save);await screen.findByText("Couldn't update your keeps — try again");
 expect(api.update).not.toHaveBeenCalled();expect(api.create).not.toHaveBeenCalled();expect(api.delete).not.toHaveBeenCalled();
 expect(save).toHaveAttribute('aria-pressed','false');
});

it('accepts a minimal write response only after its exact owned read-back',async()=>{
 let written=false;profileLookup=()=>[{id:'profile',user_id:'owner',saved_item_ids:written?['existing','audit-fiction']:['existing']}];
 const save=await openFictionDetails();
 api.update.mockImplementation(async()=>{written=true;return {id:'profile'};});
 fireEvent.click(save);await screen.findByText('Kept for later');
 expect(api.filter.mock.calls.some(([entity,query])=>entity==='UserProfile' && query.id==='profile' && query.user_id==='owner')).toBe(true);
 expect(save).toHaveAttribute('aria-pressed','true');
});

const physicalRows = () => ['owned-one','owned-two'].map(id => ({id,user_id:'owner',item_type:'ADVICE',item_id:'advice-one',title:'An actual kept advice',preview_text:'Actual words kept.',meta_json:JSON.stringify({route:'/Assistant'})}));
async function openPhysicalDetails(rows) {
 api.filter.mockImplementation(async(entity,query)=>entity==='UserProfile'?[{id:'profile',user_id:'owner',saved_item_ids:[]}]:entity==='SavedItems' && (!query.item_type || (query.item_type==='ADVICE' && query.item_id==='advice-one'))?rows():[]);
 render(<MemoryRouter initialEntries={['/Lifestyle?section=yours']}><KeptAlive/></MemoryRouter>);
 const main=screen.getByTestId('kept-lifestyle');
 fireEvent.click(await within(main).findByRole('button',{name:'Details & tools'},{timeout:10000}));
 return (await screen.findAllByRole('button',{name:'Remove from saved',exact:true}))[0];
}
it('stops duplicate physical removal when auth changes after the first deletion',async()=>{
 const rows=physicalRows(), remove=await openPhysicalDetails(()=>rows);
 api.delete.mockImplementation(async()=>{api.me.mockResolvedValue({id:'other-owner'});return {success:true};});
 fireEvent.click(remove);await waitFor(()=>expect(api.delete).toHaveBeenCalled());await waitFor(()=>expect(remove).not.toBeDisabled());
 expect(api.delete.mock.calls.map(([,id])=>id)).toEqual(['owned-one']);expect(screen.queryByText('Removed from your keeps')).toBeNull();
});
it('keeps the removal pending when records still exist after a minimal response',async()=>{
 const rows=physicalRows(), remove=await openPhysicalDetails(()=>rows);
 api.delete.mockResolvedValue(undefined);fireEvent.click(remove);
 await screen.findByText('Couldn’t update your keeps — try again');
 expect(screen.queryByText('Removed from your keeps')).toBeNull();expect(remove).toHaveAttribute('aria-pressed','true');
});
it('retries only remaining duplicates and publishes all acknowledged removal receipts',async()=>{
 let rows=physicalRows(), fail=true;const remove=await openPhysicalDetails(()=>rows);
 const events=[];const onAck=event=>events.push(event.detail);window.addEventListener('fw_sky_lesson_saved',onAck);
 try {
  api.delete.mockImplementation(async(_entity,id)=>{if(id==='owned-two' && fail)throw Error('offline');rows=rows.filter(row=>row.id!==id);return {success:true};});
  fireEvent.click(remove);await screen.findByText('Couldn’t update your keeps — try again');await waitFor(()=>expect(remove).not.toBeDisabled());
  fail=false;fireEvent.click(remove);await screen.findByText('Removed from your keeps');
  expect(api.delete.mock.calls.map(([,id])=>id)).toEqual(['owned-one','owned-two','owned-two']);
  expect(events).toContainEqual({ownerId:'owner',itemId:'advice-one',removedSavedRecordIds:['owned-one','owned-two']});
  expect(screen.queryByRole('button',{name:'Remove from saved',exact:true})).toBeNull();
  expect(screen.getByTestId('kept-lifestyle')).toBeVisible();
 } finally {window.removeEventListener('fw_sky_lesson_saved',onAck);}
});

