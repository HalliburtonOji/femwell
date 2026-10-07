import { describe, it, expect } from 'vitest';
import { authoredJoyId, timeFit, rankedReads, continuePositions, gutenbergReaderHref, newestOwnedReading, classicContinuation, isLifestylePosition } from './finishLifestyle';
describe('actual Lifestyle source contracts', () => {
  it('sorts missing and damaged timestamps last without losing otherwise valid legacy places', () => {
    const values={
      fw_reader_pos_37106:'{"chapterIndex":1,"pageInChapter":2,"ts":1e400}',
      fw_reader_pos_514:JSON.stringify({chapterIndex:2,ts:-10}),
      fw_reader_pos_105:JSON.stringify({chapterIndex:3,ts:'9999999999999'}),
      fw_reader_pos_158:JSON.stringify({chapterIndex:4}),
      fw_article_pos_article_source_1:'{"scrollY":240,"ts":1e400}',
      fw_article_pos_article_source_2:JSON.stringify({scrollY:300,ts:'99999'}),
      fw_reader_pos_1342:JSON.stringify({chapterIndex:5,paragraphIndex:7,ts:100}),
      fw_article_pos_article_source_3:JSON.stringify({scrollY:350,ts:200}),
    };
    const rows=continuePositions({...values,getItem:key=>values[key]});
    expect(rows.map(row=>row.bookId)).toEqual(['article_source_3','1342','37106','514','105','158','article_source_1','article_source_2']);
    expect(rows.slice(2).every(row=>row.ts===0)).toBe(true);
    expect(rows.find(row=>row.bookId==='37106')).toMatchObject({chapterIndex:1,pageInChapter:2});
    expect(values.fw_reader_pos_37106).toContain('1e400'); // reads never migrate stored marks
  });
  it('keeps valid numeric legacy anchors and pages but refuses invalid coordinates and unsafe editions', () => {
    const values = {
      fw_reader_pos_37106: JSON.stringify({chapterIndex:1,pageInChapter:2,ts:8}),
      fw_reader_pos_1342: JSON.stringify({chapterIndex:2,paragraphIndex:5,pageInChapter:0,ts:9}),
      fw_reader_pos_514: JSON.stringify({chapterIndex:-1}),
      fw_reader_pos_105: JSON.stringify({chapterIndex:1,pageInChapter:1.5}),
      fw_reader_pos_1260: JSON.stringify({chapterIndex:0,paragraphIndex:'3'}),
      fw_reader_pos_0: JSON.stringify({chapterIndex:0}),
      fw_reader_pos_01342: JSON.stringify({chapterIndex:0}),
      fw_reader_pos_9007199254740993: JSON.stringify({chapterIndex:0}),
      fw_reader_pos_158: 'null', fw_reader_pos_768: '[]', fw_reader_pos_174: '{',
    };
    const positions=continuePositions({...values,getItem:key=>values[key]});
    expect(positions.map(pos=>pos.bookId)).toEqual(['1342','37106']);
    expect(positions[1]).toMatchObject({chapterIndex:1,pageInChapter:2});
  });
  it('names only exact catalogue editions and never substitutes a familiar title for an unknown edition', () => {
    const pos={kind:'book',bookId:'37106',chapterIndex:1};
    const catalogue=[{_gutenbergId:514,title:'Little Women'},{_gutenbergId:37106,title:'Little Women, illustrated',author:'Louisa May Alcott'}];
    expect(classicContinuation(pos,catalogue).item).toMatchObject({title:'Little Women, illustrated',_gutenbergId:'37106',content_type:'FICTION'});
    expect(classicContinuation(pos,catalogue.slice(0,1)).item.title).toBe('Project Gutenberg book 37106');
    expect(classicContinuation({kind:'article',bookId:'37106'},catalogue)).toBeNull();
    expect(gutenbergReaderHref({_gutenbergId:'9007199254740993'})).toBeNull();
  });
  it.each(['9007199254740993','-1234567890123','+1234567890123','123456789012e3','1342?redirect=another','daily_a_real_series'])('never resolves classic or unsafe identity %s in LifestyleItems', id=>{
    expect(isLifestylePosition(id)).toBe(false);
  });
  it('keeps the newest same-day record and newest update to that record through late loads',()=>{
    const fresh={id:'fresh',user_id:'owner',reading_date:'2026-10-07',created_date:'2026-10-07T10:00:00Z',updated_date:'2026-10-07T11:00:00Z'};
    const older={...fresh,id:'older',created_date:'2026-10-07T09:00:00Z',updated_date:'2026-10-07T12:00:00Z'};
    expect(newestOwnedReading(fresh,older,'owner')).toBe(fresh);
    expect(newestOwnedReading(older,fresh,'owner')).toBe(fresh);
    expect(newestOwnedReading(fresh,{...fresh,updated_date:'2026-10-07T10:30:00Z'},'owner')).toBe(fresh);
    const updated={...fresh,updated_date:'2026-10-07T12:30:00Z'};
    expect(newestOwnedReading(fresh,updated,'owner')).toBe(updated);
  });
  it('protects a confirmed live reading when a snapshot has no comparable timestamps',()=>{
    const live={id:'live',user_id:'owner',reading_date:'2026-10-07'};
    const snapshot={id:'snapshot',user_id:'owner',reading_date:'2026-10-07'};
    expect(newestOwnedReading(live,snapshot,'owner',true)).toBe(live);
    expect(newestOwnedReading(live,snapshot,'owner')).toBe(snapshot);
  });
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
