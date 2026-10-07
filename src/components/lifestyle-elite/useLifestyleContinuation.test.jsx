import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import useLifestyleContinuation from './useLifestyleContinuation';
const api=vi.hoisted(()=>({filter:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{entities:{LifestyleItems:{filter:api.filter}}}}));
function store(values={}) { return Object.assign(Object.create({getItem(key){return this[key] ?? null;},setItem(key,value){this[key]=String(value);}}),values); }
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('localStorage',store());api.filter.mockResolvedValue([]);});
afterEach(()=>vi.unstubAllGlobals());
it('keeps three actually recent classics ahead of a valid place with a nonfinite timestamp',async()=>{
  localStorage.setItem('fw_reader_pos_37106','{"chapterIndex":1,"pageInChapter":2,"ts":1e400}');
  for(const [id,ts] of [['1342',30],['514',20],['105',10]])localStorage.setItem(`fw_reader_pos_${id}`,JSON.stringify({chapterIndex:0,ts}));
  const {result}=renderHook(()=>useLifestyleContinuation({enabled:true,active:true,routePathname:'/Lifestyle',catalogue:[]}));
  await waitFor(()=>expect(result.current.items.map(row=>row.pos.bookId)).toEqual(['1342','514','105']));
  expect(api.filter).not.toHaveBeenCalled();
  delete localStorage.fw_reader_pos_105;
  await act(()=>result.current.refresh());
  expect(result.current.items[2]).toMatchObject({pos:{bookId:'37106',chapterIndex:1,pageInChapter:2,ts:0}});
});
it('enriches local classics on late metadata without refetching, fetching text, or changing the three-item limit',async()=>{
  for(const [id,ts] of [['1342',10],['37106',9],['514',8],['105',7]])localStorage.setItem(`fw_reader_pos_${id}`,JSON.stringify({chapterIndex:0,ts}));
  const {result,rerender}=renderHook(props=>useLifestyleContinuation(props),{initialProps:{enabled:true,active:true,routePathname:'/Lifestyle',catalogue:[]}});
  await waitFor(()=>expect(result.current.items).toHaveLength(3));
  expect(result.current.items[0].item.title).toBe('Project Gutenberg book 1342');
  rerender({enabled:true,active:true,routePathname:'/Lifestyle',catalogue:[{_gutenbergId:1342,title:'Pride and Prejudice'}]});
  expect(result.current.items[0].item.title).toBe('Pride and Prejudice');
  expect(api.filter).not.toHaveBeenCalled();
});
it('returns to the same mounted route with fresh positions, retaining exact fiction/article resolution without catalogue-triggered queries',async()=>{
  localStorage.setItem('fw_reader_pos_fiction_source_1',JSON.stringify({chapterIndex:2,ts:9}));
  localStorage.setItem('fw_article_pos_article_source_1',JSON.stringify({scrollY:320,ts:8}));
  api.filter.mockImplementation(async({id})=>[{id,title:id,content_type:id.startsWith('fiction')?'FICTION':'ARTICLE'}]);
  const props={enabled:true,active:true,routePathname:'/Lifestyle',catalogue:[]};
  const {result,rerender}=renderHook(p=>useLifestyleContinuation(p),{initialProps:props});
  await waitFor(()=>expect(result.current.items).toHaveLength(2));
  expect(api.filter).toHaveBeenCalledTimes(2);
  rerender({...props,catalogue:[{_gutenbergId:514,title:'Little Women'}]});
  expect(api.filter).toHaveBeenCalledTimes(2);
  rerender({...props,active:false,routePathname:'/BookReader'});
  localStorage.setItem('fw_reader_pos_1342',JSON.stringify({chapterIndex:1,paragraphIndex:3,ts:10}));
  rerender(props);
  await waitFor(()=>expect(result.current.items[0].item._gutenbergId).toBe('1342'));
  await waitFor(()=>expect(api.filter).toHaveBeenCalledTimes(4));
  expect(api.filter.mock.calls.every(([filter])=>!/^\d+$/.test(filter.id))).toBe(true);
});
it('rejects a superseded or unmounted lookup and distinguishes failed reads from successful absence',async()=>{
  localStorage.setItem('fw_reader_pos_fiction_source_1',JSON.stringify({chapterIndex:2,ts:9}));
  api.filter.mockResolvedValue([{id:'fiction_source_1',title:'Original book'}]);
  const props={enabled:true,active:true,routePathname:'/Lifestyle',catalogue:[]};
  const {result,rerender,unmount}=renderHook(p=>useLifestyleContinuation(p),{initialProps:props});
  await waitFor(()=>expect(result.current.items[0]?.item.title).toBe('Original book'));
  api.filter.mockRejectedValueOnce(new Error('Offline'));
  await act(()=>result.current.refresh());
  expect(result.current.items[0].item.title).toBe('Original book');
  const stale=deferred();api.filter.mockReturnValueOnce(stale.promise);
  let pending;act(()=>{pending=result.current.refresh();});
  rerender({...props,active:false,routePathname:'/BookReader'});
  api.filter.mockResolvedValue([]);rerender(props);
  await waitFor(()=>expect(result.current.items).toHaveLength(0));
  await act(async()=>{stale.resolve([{id:'fiction_source_1',title:'Late obsolete book'}]);await pending;});
  expect(result.current.items).toHaveLength(0);
  const final=deferred();api.filter.mockReturnValueOnce(final.promise);act(()=>{pending=result.current.refresh();});unmount();
  await act(async()=>{final.resolve([{id:'fiction_source_1',title:'After exit'}]);await pending;});
});
it('removes an absent old fiction immediately while a different current source is still loading',async()=>{
  localStorage.setItem('fw_reader_pos_fiction_source_1',JSON.stringify({chapterIndex:2,ts:9}));
  api.filter.mockResolvedValue([{id:'fiction_source_1',title:'Previous device source'}]);
  const props={enabled:true,active:true,routePathname:'/Lifestyle',catalogue:[]};
  const {result}=renderHook(p=>useLifestyleContinuation(p),{initialProps:props});
  await waitFor(()=>expect(result.current.items).toHaveLength(1));
  delete localStorage.fw_reader_pos_fiction_source_1;
  localStorage.setItem('fw_reader_pos_fiction_source_2',JSON.stringify({chapterIndex:3,ts:10}));
  const next=deferred();api.filter.mockReturnValueOnce(next.promise);let pending;
  act(()=>{pending=result.current.refresh();});
  expect(result.current.items).toHaveLength(0);
  await act(async()=>{next.resolve([{id:'fiction_source_2',title:'Current device source'}]);await pending;});
  expect(result.current.items[0]).toMatchObject({item:{id:'fiction_source_2'},pos:{chapterIndex:3}});
});
