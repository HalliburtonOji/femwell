import React, {useState} from 'react';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {act,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import ReadFocus from './ReadFocus';
import ListenFocus from './ListenFocus';
import GoodLifeFocus from './GoodLifeFocus';
import YoursFocus from './YoursFocus';
import {ExpandDetailCard} from '@/components/brand/expandCards';
import {mergeSavedCollections} from '@/lib/savedCollections';
import LifestyleEliteShell from './LifestyleEliteShell';

const mock=vi.hoisted(()=>({player:null,profiles:vi.fn(),updateProfile:vi.fn(),empty:vi.fn(),remove:vi.fn()}));
vi.mock('@/hooks/usePodcastPlayer',()=>({usePodcastPlayer:()=>mock.player}));
vi.mock('@/api/base44Client',()=>({base44:{
  auth:{me:async()=>({id:'owner'})},functions:{invoke:async()=>({data:{items:[]}})},
  entities:new Proxy({},{get:(_,name)=>name==='UserProfile'
    ? {filter:mock.profiles,update:mock.updateProfile}
    : {filter:mock.empty,delete:mock.remove,subscribe:()=>()=>{}}}),
}}));
vi.mock('./SelectedLifestyleHeader',()=>({default:()=>null,SelectedRoomDetail:()=>null}));
beforeEach(()=>{mock.player=null;mock.profiles.mockResolvedValue([]);mock.empty.mockResolvedValue([]);mock.remove.mockResolvedValue({});});
const read={id:'read-exact',type:'article',title:'A very good rabbit hole',summary:'A short, authored hook.',meta:[],body:['Actual source words.'],actions:[]};

describe('selected Lifestyle body actions',()=>{
  it('removes an unavailable profile-only keep from the actual owning shell and profile',async()=>{
    const profile={id:'profile',user_id:'owner',saved_item_ids:['missing-source']};mock.profiles.mockResolvedValue([profile]);
    mock.updateProfile.mockImplementation(async(id,patch)=>({...profile,...patch,id}));
    const fetchSpy=vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[]})});
    window.history.replaceState({},'', '/SkyWorldsDemo?direction=petal-press&section=yours');
    render(<LifestyleEliteShell enableFocus layout="living" artDirection="sky-worlds" skyWorld="petal-press" initialSection="yours"/>);
    await waitFor(()=>expect(mock.profiles).toHaveBeenCalledWith({user_id:'owner'}));
    fireEvent.click(await screen.findByRole('button',{name:'Details & tools'}, {timeout:5000}));
    fireEvent.click(screen.getAllByRole('button',{name:'Remove from saved',exact:true})[0]);
    await waitFor(()=>expect(mock.updateProfile).toHaveBeenCalledWith('profile',{saved_item_ids:[]}));
    expect(mock.remove).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
  it('opens the exact Read directly while preserving a separate full Details action',()=>{
    const open=vi.fn(),details=vi.fn();
    render(<ReadFocus presentation="folio" articleCards={[read]} onOpen={open} onDetails={details}/>);
    fireEvent.click(screen.getByText(read.title).closest('button'));
    expect(open).toHaveBeenCalledWith(read);expect(details).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Details & tools'}));
    expect(details).toHaveBeenCalledWith(read);expect(open).toHaveBeenCalledTimes(1);
  });
  it('keeps the in-progress global episode in front of new feed picks and uses the same player',()=>{
    const current={id:'active-exact',title:'Already in your headphones',audio_url:'https://example.test/current.mp3',duration_seconds:420};
    const toggle=vi.fn();mock.player={currentEpisode:current,isPlaying:false,position:111,duration:420,togglePlay:toggle};
    render(<ListenFocus presentation="folio" audioCards={[{id:'new',type:'audio',title:'A new feed episode',audioSrc:'https://example.test/new.mp3',meta:[],actions:[],body:[]}]} onOpen={vi.fn()}/>);
    const lead=screen.getByText('Pick up your listen').closest('.fw-selected-now');
    expect(lead).toHaveTextContent(current.title);
    expect(lead).not.toHaveTextContent('A new feed episode');
    fireEvent.click(within(lead).getByRole('button',{name:'Play',exact:true}));expect(toggle).toHaveBeenCalledTimes(1);
  });
  it('keeps the joy source and planning action distinct, alongside every existing whole-life room',()=>{
    const joy={id:'try-stable',type:'ritual',title:'Tea without multitasking',doable:{title:'Tea without multitasking',kind:'try'},body:[],meta:[],actions:[]};
    const plan=vi.fn(),slip=vi.fn();
    render(<GoodLifeFocus presentation="folio" joys={[joy]} onPlan={plan} onSlip={slip}/>);
    fireEvent.click(screen.getByText(joy.title).closest('button'));expect(plan).toHaveBeenCalledWith(joy);expect(slip).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Details & tools'}));expect(slip).toHaveBeenCalledWith(joy);
    expect(screen.getAllByRole('link')).toHaveLength(11);
  });
  it('retains a physical-only archive source, its exact URL and full tools',()=>{
    const source={id:'old-outside-feed',content_type:'ARTICLE',title:'Kept years ago'};
    const keeps=mergeSavedCollections([{id:'saved',user_id:'owner',item_type:'LIFESTYLE',item_id:source.id,title:source.title}],{id:'profile',user_id:'owner',saved_item_ids:[]},new Map([[source.id,{item:source}]]));
    const card={...read,id:source.id,title:source.title,_keep:keeps[0]};const open=vi.fn(),details=vi.fn();
    render(<YoursFocus presentation="folio" savedCards={[card]} onOpen={open} onDetails={details}/>);
    fireEvent.click(screen.getByText(source.title).closest('button'));expect(open).toHaveBeenCalledWith(card);
    expect(keeps[0]._href).toBe('/LifestyleDetail?id=old-outside-feed');
    fireEvent.click(screen.getByRole('button',{name:'Details & tools'}));expect(details).toHaveBeenCalledWith(card);
  });
  it('reconciles both stores without losing any physical owner record or the profile reference',()=>{
    const rows=[{id:'first',user_id:'owner',item_type:'LIFESTYLE',item_id:read.id,title:read.title},{id:'duplicate',user_id:'owner',item_type:'LIFESTYLE',item_id:read.id,title:read.title}];
    const result=mergeSavedCollections(rows,{id:'profile',user_id:'owner',saved_item_ids:[read.id]},new Map([[read.id,{item:{id:read.id,title:read.title,content_type:'ARTICLE'}}]]));
    expect(result).toHaveLength(1);expect(result[0]._savedRecords.map(row=>row.id)).toEqual(['first','duplicate']);expect(result[0]._profileId).toBe('profile');
  });
  it('does not turn a failed expanded save into a saved acknowledgement',async()=>{
    let finish;const save=vi.fn(()=>new Promise(resolve=>{finish=resolve;}));
    function Detail(){const [saved,setSaved]=useState(false);return <ExpandDetailCard presentation="folio" item={read} saved={saved} onClose={vi.fn()} onSave={async()=>{const accepted=await save();if(accepted)setSaved(true);return accepted;}}/>;}
    render(<Detail/>);fireEvent.click(screen.getAllByRole('button',{name:'Save',exact:true})[0]);
    await waitFor(()=>expect(screen.getAllByRole('button',{name:'Saving',exact:true})[0]).toBeDisabled());
    await act(async()=>finish(false));expect(screen.queryByText('Saved',{exact:true})).toBeNull();
    fireEvent.click(screen.getAllByRole('button',{name:'Save',exact:true})[0]);await act(async()=>finish(true));
    expect(await screen.findByText('Saved',{exact:true})).toBeVisible();
    expect(screen.getAllByRole('button',{name:'Remove from saved',exact:true})[0]).toHaveAttribute('aria-pressed','true');
  });
});
