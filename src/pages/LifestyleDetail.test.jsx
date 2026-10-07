import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, afterEach, describe, it, expect, vi} from 'vitest';
import {MemoryRouter, useNavigate} from 'react-router-dom';
import LifestyleDetail from './LifestyleDetail';
import {continuePositions} from '@/components/lifestyle-elite/finishLifestyle';

const api=vi.hoisted(()=>({items:vi.fn(),expand:vi.fn(),me:vi.fn(),profiles:vi.fn(),update:vi.fn(),create:vi.fn(),physical:vi.fn(),remove:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:api.me},functions:{invoke:api.expand},entities:{LifestyleItems:{filter:api.items},UserProfile:{filter:api.profiles,update:api.update,create:api.create},SavedItems:{filter:api.physical,delete:api.remove}}}}));
vi.mock('@/components/common/ContentActionBar',()=>({default:()=> <div>Journal, Community and Jess tools</div>}));
vi.mock('@/components/share/ShareButton',()=>({default:()=> <button>Share this read</button>}));
const article={id:'article',title:'A proper reading',provider:'FEMWELL_AI',category:'Culture',lede:`First paragraph. ${'Actual source words. '.repeat(20)}\n\n## A heading\nThe second paragraph stays separate.\n\nThird paragraph &amp; its full ending.`};
const open=()=>render(<MemoryRouter initialEntries={['/LifestyleDetail?id=article']}><LifestyleDetail/></MemoryRouter>);
beforeEach(()=>{window.history.replaceState({},'', '/LifestyleDetail?id=article');localStorage.clear();api.items.mockImplementation(async q=>q.id ? [article] : []);api.expand.mockResolvedValue({data:{body:article.lede}});vi.spyOn(window,'scrollTo').mockImplementation(()=>{});Object.defineProperty(window,'scrollY',{configurable:true,value:0});});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();});
beforeEach(()=>{vi.clearAllMocks();api.me.mockResolvedValue({id:'reader'});api.profiles.mockResolvedValue([]);api.physical.mockResolvedValue([]);api.update.mockImplementation(async(id,fields)=>({id,user_id:'reader',...fields}));api.create.mockImplementation(async fields=>({id:'new-profile',...fields}));api.remove.mockResolvedValue({});});

const owned=(extra={})=>({id:'profile',user_id:'reader',saved_item_ids:[],liked_item_ids:[],...extra});
const keep={id:'keep',user_id:'reader',item_type:'LIFESTYLE',item_id:'article'};
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
function savedEvents(){const events=[];const listen=event=>events.push(event.detail);window.addEventListener('fw_sky_lesson_saved',listen);return {events,stop:()=>window.removeEventListener('fw_sky_lesson_saved',listen)};}
async function ready(label='Keep this find'){await screen.findByRole('heading',{name:article.title});await waitFor(()=>expect(screen.getByRole('button',{name:label})).toBeEnabled());}

describe('owned keeps and likes authority',()=>{
  it('publishes only the acknowledged complete keep array and identity to existing mounted consumers',async()=>{
    const channel=savedEvents();api.profiles.mockResolvedValue([owned({saved_item_ids:['older'],private_note:'never publish this'})]);
    const pending=deferred();api.update.mockReturnValue(pending.promise);open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(api.update).toHaveBeenCalledTimes(1));expect(channel.events).toEqual([]);
    await act(async()=>pending.resolve(owned({saved_item_ids:['older','article'],private_note:'never publish this'})));
    expect(channel.events).toEqual([{ownerId:'reader',itemId:'article',profile:{id:'profile',user_id:'reader',saved_item_ids:['older','article']},removedSavedRecordIds:[]}]);channel.stop();
  });
  it('publishes confirmed new-profile identity only after exact partial-ack readback',async()=>{
    const channel=savedEvents();api.create.mockResolvedValue({id:'new-profile'});api.profiles.mockImplementation(async q=>q.id ? [owned({id:'new-profile',saved_item_ids:['article']})] : []);open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(channel.events).toHaveLength(1));expect(channel.events[0].profile).toEqual({id:'new-profile',user_id:'reader',saved_item_ids:['article']});channel.stop();
  });
  it('publishes actual removed physical IDs with confirmed no-profile absence',async()=>{
    const channel=savedEvents();api.physical.mockResolvedValue([keep,{...keep,id:'duplicate'}]);api.remove.mockImplementation(async()=>{api.physical.mockResolvedValue([]);return {};});open();await ready('Remove from keeps');fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await waitFor(()=>expect(channel.events).toHaveLength(1));expect(channel.events[0]).toEqual({ownerId:'reader',itemId:'article',profile:{id:null,user_id:'reader',saved_item_ids:[]},removedSavedRecordIds:['keep','duplicate']});expect(api.create).not.toHaveBeenCalled();channel.stop();
  });
  it('does not publish a keep event for a successful like or failed keep',async()=>{
    const channel=savedEvents();api.profiles.mockResolvedValue([owned()]);open();await ready();fireEvent.click(screen.getByRole('button',{name:'Like this find'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Unlike this find'})).toBeEnabled());expect(channel.events).toEqual([]);api.update.mockRejectedValueOnce(new Error('offline'));fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await screen.findByRole('alert');expect(channel.events).toEqual([]);channel.stop();
  });
  it('does not publish a late write acknowledgement after the reader unmounts',async()=>{
    const channel=savedEvents();api.profiles.mockResolvedValue([owned()]);const pending=deferred();api.update.mockReturnValue(pending.promise);const view=open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(api.update).toHaveBeenCalledTimes(1));view.unmount();await act(async()=>pending.resolve(owned({saved_item_ids:['article']})));expect(channel.events).toEqual([]);channel.stop();
  });
  it('does not publish successful partial deletion until the complete retry is acknowledged',async()=>{
    const channel=savedEvents();api.profiles.mockResolvedValue([owned({saved_item_ids:['article','older']})]);api.physical.mockResolvedValue([keep]);api.remove.mockImplementation(async()=>{api.physical.mockResolvedValue([]);return {};});api.update.mockRejectedValueOnce(new Error('offline'));open();await ready('Remove from keeps');fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await screen.findByRole('alert');expect(channel.events).toEqual([]);fireEvent.click(screen.getByRole('button',{name:'Retry keeps and likes'}));await waitFor(()=>expect(channel.events).toHaveLength(1));expect(channel.events[0].profile.saved_item_ids).toEqual(['older']);expect(channel.events[0].removedSavedRecordIds).toEqual(['keep']);channel.stop();
  });
  it.each(['profiles','physical'])('does not block prose or guess absence after failed %s read; retry is independent',async kind=>{
    api[kind].mockRejectedValue(new Error('offline'));open();await screen.findByRole('heading',{name:article.title});
    expect(await screen.findByRole('alert')).toHaveTextContent('couldn’t load');expect(screen.getByRole('button',{name:'Keep this find'})).toBeDisabled();
    expect(api.create).not.toHaveBeenCalled();api[kind].mockResolvedValue([]);fireEvent.click(screen.getByRole('button',{name:'Retry keeps and likes'}));await ready();
    expect(api.items).toHaveBeenCalledTimes(2);expect(api.expand).not.toHaveBeenCalled();
  });
  it.each([['profiles',null],['profiles',[owned({saved_item_ids:'invalid'})]],['profiles',[{...owned(),user_id:'other'}]],['physical',{}],['physical',[{...keep,item_id:'another'}]]])('rejects malformed/foreign authority %s %#',async(kind,value)=>{
    api[kind].mockResolvedValue(value);open();await screen.findByRole('heading',{name:article.title});await screen.findByRole('alert');expect(api.create).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Like this find'})).toBeDisabled();
  });
  it('keeps controls pending while physical authority is unresolved but shows all prose',async()=>{
    const pending=deferred();api.physical.mockReturnValue(pending.promise);open();await screen.findByRole('heading',{name:article.title});expect(screen.getByRole('button',{name:'Keep this find'})).toBeDisabled();
    expect(screen.getByText('Third paragraph & its full ending.')).toBeVisible();await act(async()=>pending.resolve([keep]));await ready('Remove from keeps');
  });
  it('keeps controls pending during profile lookup without blocking the full article',async()=>{
    const pending=deferred();api.profiles.mockReturnValue(pending.promise);open();await screen.findByRole('heading',{name:article.title});expect(screen.getByRole('button',{name:'Like this find'})).toBeDisabled();expect(screen.getByText('Third paragraph & its full ending.')).toBeVisible();await act(async()=>pending.resolve([owned()]));await ready();
  });
  it('rejects a fresh physical read failure before mutating either authority',async()=>{
    api.profiles.mockResolvedValue([owned()]);open();await ready();api.physical.mockRejectedValueOnce(new Error('offline'));fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await screen.findByRole('alert');expect(api.update).not.toHaveBeenCalled();expect(api.create).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Retry keeps and likes'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Remove from keeps'})).toBeEnabled());
  });
  it.each([['Keep this find','saved_item_ids'],['Like this find','liked_item_ids']])('fresh failed profile lookup on %s cannot create and retry preserves latest complete array',async(label,field)=>{
    api.profiles.mockResolvedValue([owned()]);open();await ready();api.profiles.mockRejectedValueOnce(new Error('offline'));fireEvent.click(screen.getByRole('button',{name:label}));await screen.findByRole('alert');
    expect(api.create).not.toHaveBeenCalled();expect(api.update).not.toHaveBeenCalled();api.profiles.mockResolvedValue([owned({[field]:['elsewhere','older']})]);fireEvent.click(screen.getByRole('button',{name:'Retry keeps and likes'}));
    await waitFor(()=>expect(api.update).toHaveBeenCalledWith('profile',{[field]:['elsewhere','older','article']}));expect(api.create).not.toHaveBeenCalled();
  });
  it('creates only after successful empty authority and confirms exact returned fields',async()=>{
    open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Remove from keeps'})).toBeEnabled());expect(api.create).toHaveBeenCalledTimes(1);
  });
  it('prevents removal after account changes before the action',async()=>{
    api.physical.mockImplementation(async q=>[{...keep,user_id:q.user_id,id:q.user_id==='reader' ? 'keep' : 'other-owner-keep'}]);open();await ready('Remove from keeps');api.me.mockResolvedValue({id:'other'});fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await screen.findByRole('alert');expect(api.remove).not.toHaveBeenCalled();expect(api.update).not.toHaveBeenCalled();expect(api.create).not.toHaveBeenCalled();
  });
  it('prevents removal after account changes during authority reads',async()=>{
    api.physical.mockResolvedValue([keep]);open();await ready('Remove from keeps');const pending=deferred();api.profiles.mockReturnValue(pending.promise);fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await act(async()=>{});api.me.mockResolvedValue({id:'other'});await act(async()=>pending.resolve([owned()]));await screen.findByRole('alert');expect(api.remove).not.toHaveBeenCalled();expect(api.update).not.toHaveBeenCalled();
  });
  it('retains removal intent after physical deletion and failed profile update',async()=>{
    api.profiles.mockResolvedValue([owned({saved_item_ids:['article','other-keep']})]);api.physical.mockResolvedValue([keep]);api.remove.mockImplementation(async()=>{api.physical.mockResolvedValue([]);return {};});api.update.mockRejectedValueOnce(new Error('offline'));
    open();await ready('Remove from keeps');fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await screen.findByRole('alert');expect(api.create).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Remove from keeps'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button',{name:'Retry keeps and likes'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Keep this find'})).toBeEnabled());expect(api.remove).toHaveBeenCalledTimes(1);expect(api.update).toHaveBeenLastCalledWith('profile',{saved_item_ids:['other-keep']});
  });
  it('removes a physical-only keep without creating an empty profile',async()=>{
    api.physical.mockResolvedValue([keep]);api.remove.mockImplementation(async()=>{api.physical.mockResolvedValue([]);return {};});open();await ready('Remove from keeps');fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Keep this find'})).toBeEnabled());expect(api.create).not.toHaveBeenCalled();
  });
  it('retains unremoved duplicate physical rows for retry, never writes profile after failed deletion',async()=>{
    api.profiles.mockResolvedValue([owned({saved_item_ids:['article','other']})]);let rows=[keep,{...keep,id:'second'}];api.physical.mockImplementation(async()=>rows);api.remove.mockImplementation(async id=>{if(id==='second')throw new Error('offline');rows=rows.filter(row=>row.id!==id);});open();await ready('Remove from keeps');fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await screen.findByRole('alert');expect(api.update).not.toHaveBeenCalled();api.remove.mockImplementation(async id=>{rows=rows.filter(row=>row.id!==id);});fireEvent.click(screen.getByRole('button',{name:'Retry keeps and likes'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Keep this find'})).toBeEnabled());expect(api.remove.mock.calls.map(args=>args[0])).toEqual(['keep','second','second']);
  });
  it('coalesces repeated taps and stops after unmount during authority lookup',async()=>{
    api.profiles.mockResolvedValue([owned()]);const view=open();await ready();const pending=deferred();api.profiles.mockReturnValue(pending.promise);fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await act(async()=>{});expect(api.profiles).toHaveBeenCalledTimes(2);view.unmount();await act(async()=>pending.resolve([owned()]));expect(api.update).not.toHaveBeenCalled();expect(api.create).not.toHaveBeenCalled();
  });
  it.each([{id:'wrong',user_id:'reader',saved_item_ids:['article']},{id:'profile',user_id:'other',saved_item_ids:['article']},{id:'profile',user_id:'reader',saved_item_ids:[]}])('does not accept mismatched acknowledgement %j',async ack=>{
    api.profiles.mockResolvedValue([owned()]);api.update.mockResolvedValue(ack);open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await screen.findByRole('alert');expect(screen.getByRole('button',{name:'Keep this find'})).toBeEnabled();
  });
  it('accepts partial acknowledgement only after exact owned read-back',async()=>{
    api.profiles.mockImplementation(async q=>q.id ? [owned({saved_item_ids:['article']})] : [owned()]);api.update.mockResolvedValue({id:'profile'});open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Remove from keeps'})).toBeEnabled());expect(api.profiles).toHaveBeenCalledWith({user_id:'reader',id:'profile'});
  });
  it('selects the canonical owned profile beyond the first page and preserves its complete array',async()=>{
    const first=Array.from({length:100},(_,i)=>owned({id:`empty-${i}`}));const rich=owned({id:'canonical',last_period_start_date:'2026-10-01',saved_item_ids:['older','another-device']});
    api.profiles.mockImplementation(async(_q,_order,_limit,skip)=>skip===100 ? [rich] : first);open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Remove from keeps'})).toBeEnabled());expect(api.update).toHaveBeenCalledWith('canonical',{saved_item_ids:['older','another-device','article']});expect(api.create).not.toHaveBeenCalled();
  });
  it('withholds success when the owner changes while the write acknowledgement is pending',async()=>{
    const channel=savedEvents();api.profiles.mockResolvedValue([owned()]);const pending=deferred();api.update.mockReturnValue(pending.promise);open();await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(api.update).toHaveBeenCalledTimes(1));api.me.mockResolvedValue({id:'other'});await act(async()=>pending.resolve(owned({saved_item_ids:['article']})));await screen.findByRole('alert');expect(screen.getByRole('button',{name:'Keep this find'})).toBeEnabled();expect(channel.events).toEqual([]);channel.stop();
  });
  it('blocks profile write when owner changes after a physical deletion',async()=>{
    api.physical.mockResolvedValue([keep]);api.profiles.mockResolvedValue([owned({saved_item_ids:['article']})]);api.remove.mockImplementation(async()=>{api.me.mockResolvedValue({id:'other'});return {};});open();await ready('Remove from keeps');fireEvent.click(screen.getByRole('button',{name:'Remove from keeps'}));await screen.findByRole('alert');expect(api.update).not.toHaveBeenCalled();
  });
  it('ignores late item completion after navigation and leaves the new item usable',async()=>{
    const channel=savedEvents();
    function Harness(){const navigate=useNavigate();return <><button onClick={()=>navigate('/LifestyleDetail?id=next')}>Next source</button><LifestyleDetail/></>;}
    api.items.mockImplementation(async q=>q.id ? [{...article,id:q.id}] : []);api.profiles.mockResolvedValue([owned()]);const pending=deferred();api.update.mockReturnValueOnce(pending.promise);
    render(<MemoryRouter initialEntries={['/LifestyleDetail?id=article']}><Harness/></MemoryRouter>);await ready();fireEvent.click(screen.getByRole('button',{name:'Keep this find'}));await waitFor(()=>expect(api.update).toHaveBeenCalledTimes(1));fireEvent.click(screen.getByRole('button',{name:'Next source'}));await ready();await act(async()=>pending.resolve(owned({saved_item_ids:['article']})));expect(screen.getByRole('button',{name:'Keep this find'})).toBeEnabled();expect(screen.queryByRole('alert')).not.toBeInTheDocument();expect(channel.events).toEqual([]);channel.stop();
  });
});

describe('complete article and last-place recovery',()=>{
  it('preserves full paragraphs and a heading on its own line',async()=>{
    const {container}=open();await screen.findByRole('heading',{name:article.title});
    expect(container.querySelectorAll('.fw-body-p')).toHaveLength(3);
    expect(screen.getByRole('heading',{name:'A heading'})).toBeVisible();
    expect(container.querySelectorAll('.fw-body-p')[1]).toHaveTextContent('The second paragraph stays separate.');
    expect(container.querySelectorAll('.fw-body-p')[2]).toHaveTextContent('Third paragraph & its full ending.');
    expect(screen.getByText('Journal, Community and Jess tools')).toBeVisible();
  });
  it('preserves HTML paragraphs, a heading and list text without rendering executable markup',async()=>{
    api.items.mockImplementation(async q=>q.id ? [{...article,lede:`<p>First paragraph ${'whole source '.repeat(26)}</p><h2>Real heading</h2><p>Second &amp; final words.</p><ul><li>One useful point.</li><li>Another useful point.</li></ul><script>throw new Error('bad')</script>`}] : []);
    const {container}=open();await screen.findByRole('heading',{name:'Real heading'});
    expect(container.querySelectorAll('.fw-body-p')).toHaveLength(4);
    expect(container).toHaveTextContent('Second & final words.');expect(container).toHaveTextContent('One useful point.');expect(container).toHaveTextContent('Another useful point.');
    expect(container.textContent).not.toContain("throw new Error('bad')");expect(container.querySelector('script')).toBeNull();
  });
  it('keeps encoded markup literal rather than executing it',async()=>{
    api.items.mockImplementation(async q=>q.id ? [{...article,lede:`${'Source words '.repeat(27)}\n\n&lt;img src=x onerror=alert(1)&gt;`}] : []);
    const {container}=open();await screen.findByRole('heading',{name:article.title});
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');expect(container.querySelector('img[src="x"]')).toBeNull();
  });
  it('offers same-source retry after a rejected read rather than calling the source removed',async()=>{
    api.items.mockRejectedValueOnce(new Error('offline'));open();
    fireEvent.click(await screen.findByRole('button',{name:'Retry article'}));
    expect(await screen.findByRole('heading',{name:article.title})).toBeVisible();
    expect(screen.queryByText("That article isn't here.")).not.toBeInTheDocument();
  });
  it('keeps confirmed absence distinct from a failed or malformed source read',async()=>{
    api.items.mockResolvedValue([]);open();expect(await screen.findByText("That article isn't here.")).toBeVisible();
    expect(screen.queryByRole('button',{name:'Retry article'})).not.toBeInTheDocument();
  });
  it('flushes the last observed scroll before a route exit inside the debounce',async()=>{
    const view=open();await screen.findByRole('heading',{name:article.title});await act(async()=>new Promise(window.requestAnimationFrame));vi.useFakeTimers();
    Object.defineProperty(window,'scrollY',{configurable:true,value:690});fireEvent.scroll(window);
    // Router destination resetting scroll must not be read by the delayed writer.
    Object.defineProperty(window,'scrollY',{configurable:true,value:0});view.unmount();
    const saved=JSON.parse(localStorage.getItem('fw_article_pos_article'));
    expect(saved.scrollY).toBe(690);expect(saved.ts).toBeGreaterThan(0);
    expect(continuePositions(localStorage)[0]).toMatchObject({bookId:'article',kind:'article',scrollY:690});
  });
  it('restores only after the full article replaces the short loading view',async()=>{
    let finishRelated;
    const related=new Promise(resolve=>{finishRelated=resolve;});
    api.items.mockImplementation(async q=>q.id ? [article] : related);
    localStorage.setItem('fw_article_pos_article',JSON.stringify({scrollY:833,ts:10}));
    open();await act(async()=>{});await act(async()=>new Promise(window.requestAnimationFrame));
    expect(screen.queryByRole('heading',{name:article.title})).not.toBeInTheDocument();
    expect(window.scrollTo).not.toHaveBeenCalled();
    await act(async()=>finishRelated([]));await screen.findByRole('heading',{name:article.title});
    await act(async()=>new Promise(window.requestAnimationFrame));
    expect(window.scrollTo).toHaveBeenCalledWith(0,833);
  });
  it('preserves legacy numeric places and sorts new article places by actual recency',()=>{
    localStorage.setItem('fw_article_pos_legacy','120');
    localStorage.setItem('fw_reader_pos_book',JSON.stringify({ts:1000,page:2}));
    localStorage.setItem('fw_article_pos_recent',JSON.stringify({scrollY:230,ts:2000}));
    expect(continuePositions(localStorage).map(p=>p.bookId)).toEqual(['recent','book','legacy']);
  });
});
