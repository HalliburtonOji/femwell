import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, afterEach, describe, it, expect, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import LifestyleDetail from './LifestyleDetail';
import {continuePositions} from '@/components/lifestyle-elite/finishLifestyle';

const api=vi.hoisted(()=>({items:vi.fn(),expand:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:async()=>({id:'reader'})},functions:{invoke:api.expand},entities:{LifestyleItems:{filter:api.items},UserProfile:{filter:async()=>[]},SavedItems:{filter:async()=>[]}}}}));
vi.mock('@/components/common/ContentActionBar',()=>({default:()=> <div>Journal, Community and Jess tools</div>}));
vi.mock('@/components/share/ShareButton',()=>({default:()=> <button>Share this read</button>}));
const article={id:'article',title:'A proper reading',provider:'FEMWELL_AI',category:'Culture',lede:`First paragraph. ${'Actual source words. '.repeat(20)}\n\n## A heading\nThe second paragraph stays separate.\n\nThird paragraph &amp; its full ending.`};
const open=()=>render(<MemoryRouter initialEntries={['/LifestyleDetail?id=article']}><LifestyleDetail/></MemoryRouter>);
beforeEach(()=>{window.history.replaceState({},'', '/LifestyleDetail?id=article');localStorage.clear();api.items.mockImplementation(async q=>q.id ? [article] : []);api.expand.mockResolvedValue({data:{body:article.lede}});vi.spyOn(window,'scrollTo').mockImplementation(()=>{});Object.defineProperty(window,'scrollY',{configurable:true,value:0});});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();});

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
