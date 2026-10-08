import {it,expect,beforeEach,afterEach,vi} from 'vitest';
import {act,fireEvent,render,screen} from '@testing-library/react';
import DailyStoryReader from '@/components/lifestyle/DailyStoryReader';
vi.mock('@/api/base44Client',()=>({base44:{entities:{DailyStory:{filter:vi.fn()}}}}));
let stored, paragraphHeight, measurementReads, originalFonts;
const source={kind:'book',currentIndex:0,items:[{id:'geometry-one',heading:'A heading that uses height',body:Array.from({length:6},(_,i)=>`Actual paragraph ${i+1}, with its distinct complete words.`).join('\n\n'),chapter_context:{chapterIndex:1,chapterCount:1}}]};
beforeEach(()=>{
 paragraphHeight=220;measurementReads=0;originalFonts=Object.getOwnPropertyDescriptor(document,'fonts');stored=new Map();vi.stubGlobal('localStorage',{getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,String(value))});
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true})));vi.stubGlobal('innerHeight',600);vi.stubGlobal('innerWidth',390);
 const original=HTMLElement.prototype.getBoundingClientRect;
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(){
  if(this.classList.contains('ds-reader-stage'))return {top:0,bottom:window.innerHeight,height:window.innerHeight,width:350};
  if(this.classList.contains('ds-reader-body')){const top=this.closest('.ds-reader-page').querySelector(':scope > .ds-reader-h1')?200:100;return {top,bottom:600,height:600-top,width:350};}
  if(this.classList.contains('ds-reader-measure-heading'))return {top:0,bottom:100,height:100,width:350};
  if(this.classList.contains('ds-measure-p')){measurementReads++;const i=[...this.parentElement.children].indexOf(this);return {top:i*paragraphHeight,bottom:(i+1)*paragraphHeight,height:paragraphHeight,width:350};}
  return original.call(this);
 });
});
afterEach(()=>{if(originalFonts)Object.defineProperty(document,'fonts',originalFonts);else delete document.fonts;vi.restoreAllMocks();vi.unstubAllGlobals();});
const prose=()=>document.querySelector('.ds-reader-body').textContent;
it('retains the exact page and visible passage through unchanged cached suspension with a first-page heading',async()=>{
 const {rerender}=render(<DailyStoryReader active source={source} bookId='geometry' defaultImmersive/>);
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 const before=prose(),label=document.querySelector('.ds-reader-nav').textContent;
 expect(before).toContain('Actual paragraph 2');expect(before).not.toContain('Actual paragraph 1');
 rerender(<DailyStoryReader active={false} source={source} bookId='geometry' defaultImmersive/>);
 rerender(<DailyStoryReader active source={source} bookId='geometry' defaultImmersive/>);await act(async()=>{});
 expect(prose()).toBe(before);expect(document.querySelector('.ds-reader-nav').textContent).toBe(label);
});
it('reflows after a hidden viewport change while preserving the previously visible paragraph anchor',async()=>{
 const {rerender}=render(<DailyStoryReader active source={source} bookId='geometry' defaultImmersive/>);
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 const before=prose();expect(before).toContain('Actual paragraph 2');
 rerender(<DailyStoryReader active={false} source={source} bookId='geometry' defaultImmersive/>);
 vi.stubGlobal('innerHeight',800);fireEvent(window,new Event('resize'));
 rerender(<DailyStoryReader active source={source} bookId='geometry' defaultImmersive/>);await act(async()=>{});
 expect(prose()).toContain('Actual paragraph 2');expect(prose()).not.toBe(before);
});

const settleFrames=async()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,35));});
function fontSet(status,ready){const fonts={status,ready};Object.defineProperty(document,'fonts',{configurable:true,value:fonts});return fonts;}
it('reflows a complete hidden loaded-to-loaded font cycle using its new ready promise',async()=>{
 const fonts=fontSet('loaded',Promise.resolve());
 const {rerender}=render(<DailyStoryReader active source={source} bookId='fonts-cycle' defaultImmersive/>);await settleFrames();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));const before=prose();expect(before).toContain('Actual paragraph 2');expect(before).not.toContain('Actual paragraph 1');
 rerender(<DailyStoryReader active={false} source={source} bookId='fonts-cycle' defaultImmersive/>);
 paragraphHeight=160;fonts.ready=Promise.resolve(); // FontFaceSet replaces ready for a later loading cycle.
 rerender(<DailyStoryReader active source={source} bookId='fonts-cycle' defaultImmersive/>);await settleFrames();
 expect(prose()).toContain('Actual paragraph 2');expect(prose()).not.toBe(before);
});
it('cancels the old pending font measurement while hidden and reflows on return around the original anchor',async()=>{
 let resolveReady;const fonts=fontSet('loading',new Promise(resolve=>{resolveReady=resolve;}));
 const {rerender}=render(<DailyStoryReader active source={source} bookId='fonts-pending' defaultImmersive/>);
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));const before=prose();expect(before).toContain('Actual paragraph 2');
 rerender(<DailyStoryReader active={false} source={source} bookId='fonts-pending' defaultImmersive/>);
 const measurementsBefore=measurementReads;paragraphHeight=160;fonts.status='loaded';resolveReady();await settleFrames();
 expect(measurementReads).toBe(measurementsBefore);expect(prose()).toBe(before);expect(document.querySelector('.ds-reader-root')).not.toBeVisible();
 rerender(<DailyStoryReader active source={source} bookId='fonts-pending' defaultImmersive/>);await settleFrames();
 expect(measurementReads).toBeGreaterThan(measurementsBefore);expect(prose()).toContain('Actual paragraph 2');expect(prose()).not.toBe(before);
});

it('retains the old paragraph through hidden viewport reflow plus the resolved-font second measure and another settings return',async()=>{
 fontSet('loaded',Promise.resolve());
 const {rerender}=render(<DailyStoryReader active source={source} bookId='two-measures' defaultImmersive/>);await settleFrames();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 expect(prose()).toContain('Actual paragraph 3');expect(prose()).not.toContain('Actual paragraph 2');
 rerender(<DailyStoryReader active={false} source={source} bookId='two-measures' defaultImmersive/>);
 vi.stubGlobal('innerHeight',850);fireEvent(window,new Event('resize'));
 rerender(<DailyStoryReader active source={source} bookId='two-measures' defaultImmersive/>);await settleFrames();
 expect(prose()).toContain('Actual paragraph 3');
 fireEvent.click(screen.getByRole('button',{name:'Reader settings'}));
 rerender(<DailyStoryReader active={false} source={source} bookId='two-measures' defaultImmersive/>);
 rerender(<DailyStoryReader active source={source} bookId='two-measures' defaultImmersive/>);await settleFrames();
 expect(prose()).toContain('Actual paragraph 3');expect(screen.getByRole('dialog',{name:'Reader settings'})).toBeVisible();
});

it('retains exact settled later-page prose and count through a redundant unchanged resize event',async()=>{
 fontSet('loaded',Promise.resolve());
 render(<DailyStoryReader active source={source} bookId='unchanged-resize' defaultImmersive/>);await settleFrames();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 const before=prose(),label=document.querySelector('.ds-reader-nav').textContent;
 expect(before).toContain('Actual paragraph 2');expect(before).not.toContain('Actual paragraph 1');
 fireEvent(window,new Event('resize'));await settleFrames();
 expect(prose()).toBe(before);expect(document.querySelector('.ds-reader-nav').textContent).toBe(label);
});
it('retains the original paragraph anchor through immediate fallback-font reflow and its later settled-font reflow',async()=>{
 const fonts=fontSet('loaded',Promise.resolve());
 const {rerender}=render(<DailyStoryReader active source={source} bookId='two-font-epochs' defaultImmersive/>);await settleFrames();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 expect(prose()).toContain('Actual paragraph 2');expect(prose()).not.toContain('Actual paragraph 1');
 rerender(<DailyStoryReader active={false} source={source} bookId='two-font-epochs' defaultImmersive/>);
 let resolveReady;fonts.status='loading';fonts.ready=new Promise(resolve=>{resolveReady=resolve;});paragraphHeight=160;
 rerender(<DailyStoryReader active source={source} bookId='two-font-epochs' defaultImmersive/>);await act(async()=>{});
 expect(prose()).toContain('Actual paragraph 2');
 paragraphHeight=220;fonts.status='loaded';resolveReady();await settleFrames();
 expect(prose()).toContain('Actual paragraph 2');
});

it('a deliberate next-page selection supersedes the earlier resume anchor during pending fonts',async()=>{
 const fonts=fontSet('loaded',Promise.resolve());
 const {rerender}=render(<DailyStoryReader active source={source} bookId='pending-intent' defaultImmersive/>);await settleFrames();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 expect(prose()).toContain('Actual paragraph 2');
 rerender(<DailyStoryReader active={false} source={source} bookId='pending-intent' defaultImmersive/>);
 let resolveReady;fonts.status='loading';fonts.ready=new Promise(resolve=>{resolveReady=resolve;});paragraphHeight=160;
 rerender(<DailyStoryReader active source={source} bookId='pending-intent' defaultImmersive/>);await act(async()=>{});
 expect(prose()).toContain('Actual paragraph 2');
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 expect(prose()).toContain('Actual paragraph 3');expect(prose()).not.toContain('Actual paragraph 2');
 paragraphHeight=220;fonts.status='loaded';resolveReady();await settleFrames();
 expect(prose()).toContain('Actual paragraph 3');expect(prose()).not.toContain('Actual paragraph 2');
});

it('a new loaded ready promise with identical glyphs and viewport preserves exact later-page prose and count',async()=>{
 const fonts=fontSet('loaded',Promise.resolve());
 const {rerender}=render(<DailyStoryReader active source={source} bookId='unchanged-font-generation' defaultImmersive/>);await settleFrames();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 const before=prose(),label=document.querySelector('.ds-reader-nav').textContent;
 expect(before).toContain('Actual paragraph 2');expect(before).not.toContain('Actual paragraph 1');
 rerender(<DailyStoryReader active={false} source={source} bookId='unchanged-font-generation' defaultImmersive/>);
 fonts.ready=Promise.resolve();
 rerender(<DailyStoryReader active source={source} bookId='unchanged-font-generation' defaultImmersive/>);await settleFrames();
 expect(prose()).toBe(before);expect(document.querySelector('.ds-reader-nav').textContent).toBe(label);
});
