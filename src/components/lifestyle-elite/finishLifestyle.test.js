import { describe, it, expect } from 'vitest';
import { authoredJoyId, timeFit, rankedReads, continuePositions, gutenbergReaderHref, newestOwnedReading } from './finishLifestyle';
describe('actual Lifestyle source contracts', () => {
  it('keeps a newer confirmed reading through late older/empty loads and isolates owner changes',()=>{
    const current={id:'new',user_id:'owner',reading_date:'2026-10-07'},old={id:'old',user_id:'owner',reading_date:'2026-10-06'};
    expect(newestOwnedReading(current,old,'owner')).toBe(current);
    expect(newestOwnedReading(current,null,'owner')).toBe(current);
    expect(newestOwnedReading(old,current,'owner')).toBe(current);
    expect(newestOwnedReading(current,null,'next-owner')).toBeNull();
    expect(newestOwnedReading(null,current,'next-owner')).toBeNull();
    expect(newestOwnedReading(current,{...current,id:'bad-date',reading_date:'2026-02-30'},'owner')).toBe(current);
    expect(newestOwnedReading(current,{...current,id:''},'owner')).toBe(current);
  });
  it.each([{gutenbergId:1342},{_gutenbergId:1342},{_raw:{gutenbergId:1342}},{_raw:{_gutenbergId:1342}}])('opens each supported exact classic-card identity %j',item=>{
    expect(gutenbergReaderHref(item)).toBe('/BookReader?gutenberg_id=1342');
  });
  it.each([{gutenbergId:0},{gutenbergId:'1342?redirect=other'},{gutenbergId:'javascript:alert(1)'},{}])('does not construct an invented/unsafe classic URL for %j',item=>{
    expect(gutenbergReaderHref(item)).toBeNull();
  });
  it('never calls an unknown or long item a five-minute choice', () => {
    const rows = [{id:'unknown'}, {id:'long',duration_seconds:301}, {id:'fits',duration_seconds:300}];
    expect(timeFit(rows,300)?.id).toBe('fits');
    expect(timeFit(rows.slice(0,2),300)).toBeNull();
  });
  it('preserves feed ranking and loaded reads without duplicate objects', () => {
    expect(rankedReads([{id:'b',title:'B'}],[{id:'a',title:'A'},{id:'b',title:'B'}]).map(r=>r.id)).toEqual(['b','a']);
  });
  it('keeps an authored activity identity across daily rotation', () => {
    const title = 'Tea, without multitasking';
    expect(authoredJoyId('try',title)).toBe(authoredJoyId('try',title));
    expect(authoredJoyId('day',title)).not.toBe(authoredJoyId('try',title));
    expect(authoredJoyId('try','A quiet walk')).not.toBe(authoredJoyId('try',title));
  });
  it('reads both real position formats without limiting before resolution', () => {
    const values = {'fw_reader_pos_daily_series':JSON.stringify({ts:8}), 'fw_reader_pos_realbook1234':JSON.stringify({ts:7,chapterIndex:2}), 'fw_article_pos_realarticle1234':'240','fw_article_pos_start':'0','fw_reader_pos_bad':'{'};
    const store = {...values, getItem:key=>values[key]};
    expect(continuePositions(store).map(p=>p.bookId)).toEqual(['daily_series','realbook1234','realarticle1234']);
  });
  it('keeps both time bands honest at the exact boundary and rejects unknown estimates',()=>{
    const rows=[{id:'negative',duration_seconds:-3},{id:'unknown',duration_seconds:null},{id:'long',duration_seconds:901},{id:'fifteen',duration_seconds:'900'}];
    expect(timeFit(rows,300)).toBeNull();
    expect(timeFit(rows,900)?.id).toBe('fifteen');
  });
  it('keeps the same authored joy identity when it moves between different daily deck positions',()=>{
    const title='Tea, without multitasking';
    const first=['A walk',title,'A quiet hour'].map(title=>({id:authoredJoyId('try',title),title}));
    const later=[title,'A quiet hour','A walk'].map(title=>({id:authoredJoyId('try',title),title}));
    expect(later.find(row=>row.id===first[1].id)?.title).toBe(title);
  });
});
