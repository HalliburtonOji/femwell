import React from 'react';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,within} from '@testing-library/react';
import {MemoryRouter,useLocation} from 'react-router-dom';
import Lifestyle from '@/pages/LifestyleElite';
const api=vi.hoisted(()=>({rows:vi.fn(),empty:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:async()=>({id:'owner'})},functions:{invoke:async()=>({data:{items:[]}})},entities:new Proxy({},{get:(_,name)=>({filter:name==='LifestyleItems' ? api.rows : api.empty,subscribe:()=>()=>{}})})}}));
vi.mock('./SelectedLifestyleHeader',()=>({default:()=>null,SelectedRoomDetail:()=>null}));
function Destination(){const location=useLocation();return <output aria-label="Actual destination">{location.pathname}{location.search}</output>;}
beforeEach(()=>{api.empty.mockResolvedValue([]);api.rows.mockImplementation(async query=>(query.media_type && query.media_type !== 'ARTICLE') || (query.content_type && query.content_type !== 'ARTICLE') ? [] : [{id:'exact-read',title:'A complete source',summary:'The actual source hook.',lede:'Source words.',provider:'FEMWELL_AI',content_type:'ARTICLE',media_type:'ARTICLE',status:'PUBLISHED'}]);vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[]})});window.history.replaceState({},'', '/Lifestyle?section=read');});
describe('read navigation within the existing app document',()=>{
  it('opens the exact article through Router instead of document assignment',async()=>{
    render(<MemoryRouter initialEntries={['/Lifestyle?section=read']}><Lifestyle/><Destination/></MemoryRouter>);
    const desk=await screen.findByRole('heading',{name:"Today's read"}, {timeout:5000});
    fireEvent.click(within(desk.closest('.fw-selected-lead')).getByRole('button',{name:/A complete source/}));
    expect(screen.getByLabelText('Actual destination')).toHaveTextContent('/LifestyleDetail?id=exact-read');
  });
});
