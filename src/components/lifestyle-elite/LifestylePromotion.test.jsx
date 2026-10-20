import React from 'react';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import Lifestyle from '@/pages/LifestyleElite';
import CalmLifestyleDemo from '@/pages/CalmLifestyleDemo';
import BooksStoryFocus from './BooksStoryFocus';
import YoursFocus from './YoursFocus';
const mock=vi.hoisted(()=>({empty:vi.fn(),articles:vi.fn(),chapters:vi.fn(),readings:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:async()=>({id:'owner'})},functions:{invoke:async()=>({data:{items:[]}})},entities:new Proxy({},{get:(_,name)=>({filter:name==='DailyStory' ? mock.chapters : name==='HoroscopeReading' ? mock.readings : name==='LifestyleItems' ? mock.articles : mock.empty,subscribe:()=>()=>{}})})}}));
vi.mock('@/components/lifestyle/DailyStoryReader',()=>({default:({goToChapter,onExit})=><div role="dialog" aria-label="Actual chapter reader"><p>Chapter index: {goToChapter}</p><button onClick={onExit}>Exit chapter reader</button></div>}));
vi.mock('./SelectedLifestyleHeader',()=>({default:({active})=><h1>{active.title}</h1>,SelectedRoomDetail:()=>null}));
beforeEach(()=>{mock.empty.mockResolvedValue([]);mock.articles.mockResolvedValue([]);mock.chapters.mockResolvedValue([]);mock.readings.mockResolvedValue([]);vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[]})});window.history.replaceState({},'', '/Lifestyle');});
describe('approved main Lifestyle parity',()=>{
  it('keeps generated health prose out of the first Good life time pick while retaining its archive',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=good');
    const title='The Cycle-Synced Workweek: How to Plan 28 Days Around Your Hormones';
    mock.articles.mockResolvedValue([{id:'unchecked-cycle',title,summary:'An unchecked claim.',lede:'A long but unreviewed body. '.repeat(70),category:"Women's Health",provider:'FEMWELL_AI',content_type:'ARTICLE',media_type:'ARTICLE',status:'PUBLISHED'}]);
    const {container}=render(<Lifestyle/>);
    await screen.findByRole('button',{name:/Explore life’s rooms/});
    await waitFor(()=>expect(mock.articles).toHaveBeenCalled());
    const choices=container.querySelector('.fw-good-time-results');
    expect(choices).toBeInTheDocument();
    expect(within(choices).queryByText(title)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Explore life’s rooms/}));
    const room=screen.getByRole('dialog',{name:'Becoming'});
    fireEvent.click(within(room).getByText('Browse the wider library'));
    await waitFor(()=>expect(mock.articles.mock.calls.some(([, , limit])=>limit===500)).toBe(true));
  });
  it('times the complete source, then chooses a different full read for fifteen minutes',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=good');
    mock.articles.mockResolvedValue([
      {id:'long',title:'A proper longer read',lede:'A complete paragraph with a clear thought. '.repeat(300),provider:'EDITORIAL',content_type:'ARTICLE',media_type:'ARTICLE',category:'Lifestyle',status:'PUBLISHED'},
      {id:'short',title:'A proper short read',lede:'A complete paragraph with a clear thought. '.repeat(70),provider:'EDITORIAL',content_type:'ARTICLE',media_type:'ARTICLE',category:'Lifestyle',status:'PUBLISHED'},
    ]);
    const {container}=render(<Lifestyle/>);
    await screen.findByRole('button',{name:/Explore life’s rooms/});
    const choices=container.querySelector('.fw-good-time-results');
    await waitFor(()=>expect(within(choices).getByRole('button',{name:'A proper short read'})).toBeVisible());
    expect(within(choices).queryByText('A proper longer read')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Fifteen minutes/}));
    expect(within(choices).getByRole('button',{name:'A proper longer read'})).toBeVisible();
  });
  it('keeps generated fiction in Read Browse without making it the first unsaved page',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=read');
    mock.articles.mockResolvedValue([{id:'old-story',title:'An archived story',summary:'A whole fictional scene.',lede:'The complete fictional scene. '.repeat(60),category:'Fiction',provider:'FEMWELL_AI',content_type:'STORY',media_type:'ARTICLE',status:'PUBLISHED'}]);
    render(<Lifestyle/>);
    expect(await screen.findByText('No new read just now. Try Books next door.')).toBeVisible();
    fireEvent.click(screen.getByText('Browse all reading · 1'));
    expect(screen.getByRole('button',{name:/An archived story.*Read/})).toBeVisible();
  });
  it('puts one exact Read source before the glance without duplicating it below',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=read');
    mock.articles.mockResolvedValue([{id:'reviewed-read',title:'An actual full article',summary:'A short, useful opening.',lede:'A complete original article. '.repeat(55),category:'Relationships',provider:'EDITORIAL',content_type:'ARTICLE',media_type:'ARTICLE',status:'PUBLISHED',author_name:'FemWell Editorial'},{id:'second-read',title:'Another complete read',summary:'A different subject.',lede:'A second complete article. '.repeat(55),category:'Lifestyle',provider:'EDITORIAL',content_type:'ARTICLE',media_type:'ARTICLE',status:'PUBLISHED'}]);
    const {container}=render(<Lifestyle/>);
    const glance=await screen.findByRole('region',{name:"Your glance and Jess's read"});
    const lead=container.querySelector('.fw-selected-read-lead');
    const rest=container.querySelector('.fw-selected-reading-rest');
    expect(lead).toBeInTheDocument();
    expect(lead.compareDocumentPosition(glance)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(lead).getByRole('button',{name:'Read An actual full article'})).toBeVisible();
    expect(within(lead).getAllByText('An actual full article')).toHaveLength(1);
    expect(rest).toBeInTheDocument();
    expect(rest.compareDocumentPosition(glance)&Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(within(rest).queryByText('An actual full article')).not.toBeInTheDocument();
    expect(within(glance).getByRole('button',{name:'Jess’s read'})).toBeVisible();
  });
  it('does not promote unreviewed Ideas drafts as published reading on main',async()=>{
    render(<Lifestyle/>);
    const glance=await screen.findByRole('region',{name:"Your glance and Jess's read"});
    expect(within(glance).getByText('No reads here just now.')).toBeVisible();
    expect(screen.queryByText('The plans you actually want to keep')).not.toBeInTheDocument();
    expect(await screen.findByText('Fresh reads land here')).toBeVisible();
  });
  it('keeps the Ideas Read Guide source and unreviewed status through both Read and Details',async()=>{
    window.history.replaceState({},'', '/CalmLifestyleDemo?section=read');
    render(<CalmLifestyleDemo/>);
    fireEvent.click(await screen.findByRole('button',{name:'Details & tools for The payment you forgot about'}));
    let sheet=screen.getByRole('dialog',{name:'The payment you forgot about'});
    expect(within(sheet).getByText('Ideas draft · Guide · unreviewed')).toBeVisible();
    expect(within(sheet).getByRole('link',{name:/MoneyHelper · regular payments and cancellation/})).toBeVisible();
    expect(within(sheet).queryByRole('button',{name:'Save',exact:true})).not.toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button',{name:'Close'}));
    expect(window.location.pathname+window.location.search).toBe('/CalmLifestyleDemo?section=read');
    fireEvent.click(screen.getByRole('button',{name:'Read The payment you forgot about'}));
    sheet=screen.getByRole('dialog',{name:'The payment you forgot about'});
    expect(within(sheet).getByText('Ideas draft · Guide · unreviewed')).toBeVisible();
    expect(within(sheet).getByRole('link',{name:/MoneyHelper · regular payments and cancellation/})).toBeVisible();
  });
  it('keeps later fetched articles in Browse instead of ending the room at six',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=read');
    mock.articles.mockResolvedValue(Array.from({length:8},(_,i)=>({id:`read-${i}`,title:`Complete article ${i}`,summary:'A distinct article.',lede:'An actual full article. '.repeat(55),category:'Lifestyle',provider:'EDITORIAL',content_type:'ARTICLE',media_type:'ARTICLE',status:'PUBLISHED'})));
    render(<Lifestyle/>);
    const browse=await screen.findByText('Browse all reading · 7');
    fireEvent.click(browse);
    expect(screen.getByRole('button',{name:/Complete article 7.*Read/})).toBeVisible();
  });
  it('keeps expired news in the archive without calling it a current lead',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=read');
    mock.articles.mockResolvedValue([{id:'old-news',title:'An old price-cap story',summary:'Historical news.',lede:'The entire dated source. '.repeat(55),category:'Money',provider:'RSS',content_type:'NEWS',media_type:'ARTICLE',status:'PUBLISHED',published_at:'2024-01-01'}]);
    render(<Lifestyle/>);
    expect(await screen.findByText('No new read just now. Try Books next door.')).toBeVisible();
    const browse=screen.getByText('Browse all reading · 1');
    fireEvent.click(browse);
    expect(screen.getByRole('button',{name:/An old price-cap story.*Read/})).toBeVisible();
    expect(screen.getByText('News archive · date check pending')).toBeVisible();
  });
  it('keeps future published or revalidated news in archive while a current dated source can lead',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=read');
    const future=`${new Date().getFullYear()+4}-01-01`,today=new Date().toISOString().slice(0,10);
    mock.articles.mockResolvedValue([
      {id:'future-published',title:'Future publication',lede:'A complete article. '.repeat(55),category:'Money',provider:'RSS',content_type:'NEWS',media_type:'ARTICLE',status:'PUBLISHED',published_at:future,revalidated_at:'2024-01-01'},
      {id:'future-checked',title:'Future source check',lede:'Another complete article. '.repeat(55),category:'Money',provider:'RSS',content_type:'NEWS',media_type:'ARTICLE',status:'PUBLISHED',published_at:today,revalidated_at:future},
      {id:'current-news',title:'Current checked news',lede:'A present complete article. '.repeat(55),category:'Money',provider:'RSS',content_type:'NEWS',media_type:'ARTICLE',status:'PUBLISHED',published_at:today},
    ]);
    render(<Lifestyle/>);
    expect(await screen.findByRole('button',{name:'Read Current checked news'})).toBeVisible();
    fireEvent.click(screen.getByText('Browse all reading · 2'));
    expect(screen.getByRole('button',{name:/Future publication.*Read/})).toBeVisible();
    expect(screen.getByRole('button',{name:/Future source check.*Read/})).toBeVisible();
    expect(screen.getAllByText('News archive · date check pending')).toHaveLength(2);
  });
  it('keeps the Everything Sky detail honest and opens the selected Sky room',async()=>{
    render(<Lifestyle/>);
    const nav=await screen.findByRole('navigation',{name:'Lifestyle sections'});
    fireEvent.click(screen.getByRole('button',{name:'Everything',exact:true}));
    const overview=await screen.findByRole('region',{name:'For you today'});
    const skyEntry=within(overview).getByText('Your sky',{exact:true}).closest('.fw-selected-overview__entries > div');
    fireEvent.click(within(skyEntry).getByRole('button',{name:'Details & tools'}));
    const sheet=screen.getByRole('dialog',{name:/sky|moon/i});
    expect(within(sheet).queryByRole('button',{name:'Save',exact:true})).not.toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button',{name:'Set up your sky'}));
    await waitFor(()=>expect(within(nav).getByRole('button',{name:'Sky',exact:true})).toHaveAttribute('aria-pressed','true'));
    expect(window.location.search).toContain('section=sky');
    expect(screen.queryByText('This source has no saveable item yet')).not.toBeInTheDocument();
  });
  it('names the exact joy action as planning and opens the existing time choice',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=good&joy=try-11gq3zo');render(<Lifestyle/>);
    const joy=await screen.findByRole('dialog',{name:/Read one poem, out loud, to no one/});
    expect(joy).toHaveAttribute('data-room','good-ideas');
    expect(joy).toHaveTextContent('Read one poem, out loud, to no one');
    expect(within(joy).getByRole('button',{name:'Close'})).toBeVisible();
    fireEvent.click(within(joy).getByRole('button',{name:'Plan a time',exact:true}));
    expect(await screen.findByRole('dialog',{name:'Plan a time',exact:true})).toHaveTextContent('Read one poem, out loud, to no one');
  });
  it('uses the approved Good life folio on main without admitting local Ideas drafts',async()=>{
    window.history.replaceState({},'', '/Lifestyle?section=good');render(<Lifestyle/>);
    fireEvent.click(await screen.findByRole('button',{name:/Explore life’s rooms/}));
    const room=screen.getByRole('dialog',{name:'Becoming'});
    expect(room.querySelector('.fw-life-preview')).toBeInTheDocument();
    expect(within(room).getByRole('combobox',{name:'Room'})).toBeVisible();
    expect(within(room).queryByText('Ideas draft · unreviewed')).not.toBeInTheDocument();
  });
  it('keeps Sky-only owned content ahead of optional discoveries',()=>{
    const view=render(<YoursFocus calmLayout presentation editorialPreview savedCards={[]} skySavedCount={2} skyKeepsakes={<div data-testid="owned-sky">Two exact Sky keeps</div>} phaseCards={[{id:'other-read',type:'article',title:'A wider read',summary:'An actual other read.'}]}/>);
    const owned=screen.getByTestId('owned-sky');
    const disclosure=screen.getByText('Other finds · 1').closest('details');
    expect(disclosure).toBeInTheDocument();
    expect(disclosure).not.toHaveAttribute('open');
    expect(owned.compareDocumentPosition(disclosure)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    view.unmount();
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
  it('resets manual chapter choice only when she asks for another open chapter, preserving the original notes sheet',async()=>{
    const today=new Date().toISOString().slice(0,10);
    mock.chapters.mockResolvedValue([{id:'first',series_key:'real-run',day_number:1,segment_text:'First chapter',published_date:'2020-01-01'},{id:'today',series_key:'real-run',day_number:2,segment_text:'Today’s actual text',published_date:today}]);
    window.history.replaceState({},'', '/Lifestyle?section=books');render(<Lifestyle/>);
    fireEvent.click(await screen.findByText('Chapters & short reads'));
    fireEvent.click(await screen.findByRole('button',{name:'Read straight through from chapter 1 ›'}));
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 0');
    fireEvent.click(screen.getByRole('button',{name:'Exit chapter reader'}));
    const chapterIndex=screen.getByText('Chapters & short reads').closest('details');
    if(!chapterIndex.open)fireEvent.click(screen.getByText('Chapters & short reads'));
    fireEvent.click(screen.getByRole('button',{name:/Another available chapter/}));
    expect(screen.getByRole('dialog',{name:'Actual chapter reader'})).toHaveTextContent('Chapter index: 1');
    fireEvent.click(screen.getByRole('button',{name:'Exit chapter reader'}));
    fireEvent.click(screen.getByRole('button',{name:/Notes & reflection/}));
    expect(screen.getByRole('button',{name:/Mark.*read/})).toBeVisible();
    expect(screen.getByRole('button',{name:/Reflect/})).toBeVisible();
  }, 12000);
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
    expect(screen.getAllByRole('button',{name:"Your chapter",exact:true}).every(button=>button.textContent.includes("Your chapter"))).toBe(true);
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
    fireEvent.click(screen.getByRole('button',{name:/Your chapter · notes/}));expect(notes).toHaveBeenCalledTimes(1);
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
