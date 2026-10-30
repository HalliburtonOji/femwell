
import {it,expect,vi,beforeEach} from 'vitest';
import {render,screen,fireEvent,waitFor,act} from '@testing-library/react';
import {FocusedCardContents,ExpandDetailCard} from '@/components/brand/expandCards';
import FocusedLifestyleRooms from '@/components/lifestyle-elite/FocusedLifestyleRooms';
const sdk=vi.hoisted(()=>({auth:{me:vi.fn()},entities:{LifestyleItems:{filter:vi.fn()},Goal:{filter:vi.fn(),create:vi.fn()}}}));
vi.mock('@/api/base44Client',()=>({base44:sdk}));vi.mock('@/hooks/usePodcastPlayer',()=>({usePodcastPlayer:()=>null}));
beforeEach(()=>{vi.clearAllMocks();sdk.entities.LifestyleItems.filter.mockResolvedValue([]);sdk.auth.me.mockResolvedValue({id:'owner-a'});sdk.entities.Goal.create.mockResolvedValue({id:'new-goal'});});
const base={id:'real-piece',type:'article',title:'Real confidence source',body:[],summary:'Source opening',meta:[],actions:[]};
const roomsProps={active:true,onClose:vi.fn(),user:{id:'owner-a'},profile:{},shellItems:[],toCard:r=>({...base,...r}),isSaved:()=>false,onSave:vi.fn(),onStory:vi.fn(),onSky:vi.fn()};
it('cleans decorative publisher title marks without changing the source row',async()=>{
 const row={id:'emoji-source',title:'Real confidence source 🌅',category:'Lifestyle'};
 sdk.entities.LifestyleItems.filter.mockResolvedValue([row]);render(<FocusedLifestyleRooms {...roomsProps}/>);
 expect(await screen.findByRole('button',{name:/Real confidence source/})).toBeVisible();
 expect(row.title).toBe('Real confidence source 🌅');
});
it('preserves the existing structured quote and attribution in focused detail',()=>{
 expect(()=>render(<FocusedCardContents item={{...base,type:'quote',quote:{text:'Take a quiet hour',attrib:'FemWell'}}}/>)).not.toThrow();
 expect(screen.getByText('Take a quiet hour')).toBeVisible();expect(screen.getByText('FemWell')).toBeVisible();
});
it('gives an Ideas article a dated folio, complete body and its original fact source',()=>{
 const article={...base,title:'The energy cap changed',sourceName:'FemWell · Ideas draft',body:['The entire article remains readable.'],_raw:{id:'ideas-energy',editorial_local:true,content_type:'NEWS',provider:'NEWS',published_at:'2026-10-18',lede:'The entire article remains readable.',source_links:[{label:'Ofgem · price cap',url:'https://www.ofgem.gov.uk/example'}]}};
 render(<FocusedCardContents room='read-ideas' item={article}/>);
 expect(screen.getByText('Ideas draft · News · unreviewed')).toBeVisible();
 expect(screen.getByText('The entire article remains readable.')).toBeVisible();
 expect(screen.getByRole('heading',{name:'Sources for this draft'})).toBeVisible();
 expect(screen.queryByText('Sources checked for this draft')).not.toBeInTheDocument();
 expect(screen.getByRole('link',{name:/Ofgem · price cap/})).toHaveAttribute('href','https://www.ofgem.gov.uk/example');
 expect(screen.queryByText(/18 October 2026/)).not.toBeInTheDocument();
});
it('marks a retained past news edition at the opened source without hiding its full text',()=>{
 const article={...base,title:'An older energy note',body:['The complete historical explanation remains here.'],_raw:{id:'old-news',editorial_local:true,content_type:'NEWS',published_at:'2026-01-01',expires_at:'2026-01-31',lede:'The complete historical explanation remains here.'}};
 render(<FocusedCardContents room='read-ideas' item={article}/>);
 expect(screen.getByText(/Past edition · source recheck needed/)).toBeVisible();
 expect(screen.getByText('The complete historical explanation remains here.')).toBeVisible();
});
it('keeps the full book blurb reachable while the first view stays brief',()=>{
 const blurb='A family meets a stranger. First impressions go badly. The rest of the novel changes everything.';
 render(<FocusedCardContents room='books' item={{...base,type:'book',summary:blurb}}/>);
 const more=screen.getByText('The whole blurb').closest('details');
 expect(more).not.toHaveAttribute('open');expect(more).toHaveTextContent(blurb);
 fireEvent.click(screen.getByText('The whole blurb'));expect(more).toHaveAttribute('open');
});
it('keeps research sources but does not link a complete FemWell folio back to itself',()=>{
 const article={...base,id:'own-essay',body:['The complete first paragraph.','The second paragraph.'],_raw:{id:'own-essay',provider:'FEMWELL_EDITORIAL',status:'PUBLISHED',content_url:'https://femwells.com/LifestyleDetail?id=own-essay',source_links:[{label:'Original research',url:'https://research.example/paper'}]}};
 render(<FocusedCardContents room='read-ideas' item={article}/>);
 expect(screen.getByRole('link',{name:/Original research/})).toHaveAttribute('href','https://research.example/paper');
 expect(screen.queryByRole('link',{name:/Read at FemWell/})).not.toBeInTheDocument();
});
it('retains full external article access when the inline lede is only an opening',()=>{
 const open=vi.fn();render(<ExpandDetailCard presentation='focused' item={{...base,_raw:{lede:'An opening from this article.',content_url:'https://example.com/full-article'},actions:[{label:'Read this',onClick:open}]}} onClose={()=>{}} saved={false} onSave={()=>{}}/>);
 expect(screen.getByRole('link',{name:/Read at/})).toHaveAttribute('href','https://example.com/full-article');
});
it('retains the existing recipe ingredients shape and method in focused detail',()=>{
 render(<FocusedCardContents item={{...base,type:'recipe',ingredients:{serves:'2',time:'10 minutes',items:['One lemon','Two apples']},steps:['Mix and eat']}}/>);
 expect(screen.getByText('One lemon')).toBeVisible();expect(screen.getByText('Two apples')).toBeVisible();expect(screen.getByText('Mix and eat')).toBeVisible();
});
it('keeps the real read action available from a room item that carries no full inline source',async()=>{
 const open=vi.fn();sdk.entities.LifestyleItems.filter.mockResolvedValue([{id:'source-item',title:'Real confidence source',summary:'An actual source opening',category:'Lifestyle'}]);
 render(<FocusedLifestyleRooms {...roomsProps} toCard={r=>({...base,...r,actions:[{label:'Read this',onClick:open}]})}/>);
 fireEvent.click(await screen.findByRole('button',{name:/Real confidence source/}));
 fireEvent.click(screen.getByRole('button',{name:'Read this'}));expect(open).toHaveBeenCalledTimes(1);
});
it('stops Money intention creation when the owner changes during the duplicate lookup',async()=>{
 let resolveLookup;sdk.entities.Goal.filter.mockReturnValueOnce(new Promise(resolve=>resolveLookup=resolve)).mockResolvedValue([{id:'old-goal',user_id:'owner-a',domain:'Money',title:'Build a tiny buffer — a little, whenever I can. A cushion, not a fortune.'}]);
 const {rerender}=render(<FocusedLifestyleRooms {...roomsProps}/>);fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Money'}});
 fireEvent.click(screen.getByRole('button',{name:'Keep this intention'}));await waitFor(()=>expect(sdk.entities.Goal.filter).toHaveBeenCalledTimes(1));
 rerender(<FocusedLifestyleRooms {...roomsProps} user={{id:'owner-b'}}/>);await act(async()=>resolveLookup([]));
 expect(sdk.entities.Goal.create).not.toHaveBeenCalled();
});

it('an inactive focused detail does not consume another route Escape or discard its retained state',async()=>{
 const onClose=vi.fn();render(<ExpandDetailCard active={false} presentation='focused' item={base} onClose={onClose} saved={false} onSave={()=>{}}/>);
 fireEvent.keyDown(window,{key:'Escape'});await act(async()=>await new Promise(resolve=>setTimeout(resolve,320)));
 expect(onClose).not.toHaveBeenCalled();
});
it('Mirror All reads includes skin and body-neutral pieces as well as fashion',async()=>{
 sdk.entities.LifestyleItems.filter.mockResolvedValue([{id:'fashion',title:'Fashion wardrobe',category:'Fashion'},{id:'skin',title:'A skincare guide',category:'Beauty'},{id:'body',title:'Body confidence',category:'Body Image'}]);
 render(<FocusedLifestyleRooms {...roomsProps}/>);await screen.findByRole('button',{name:/Body confidence/});
 fireEvent.change(screen.getByLabelText('Room'),{target:{value:'Mirror'}});fireEvent.change(screen.getByLabelText('What do you fancy?'),{target:{value:'all'}});
 expect(screen.getByRole('button',{name:/Fashion wardrobe/})).toBeVisible();expect(screen.getByRole('button',{name:/A skincare guide/})).toBeVisible();expect(screen.getByRole('button',{name:/Body confidence/})).toBeVisible();
});
