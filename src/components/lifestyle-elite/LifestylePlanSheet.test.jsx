import React from 'react';
import { act,render,screen,fireEvent,waitFor } from '@testing-library/react';
import { vi,it,expect,beforeEach } from 'vitest';
const api=vi.hoisted(()=>({me:vi.fn(),create:vi.fn(),filter:vi.fn()}));
vi.mock('@/api/base44Client',()=>({base44:{auth:{me:api.me},entities:{PlannerItems:{create:api.create,filter:api.filter}}}}));
import LifestylePlanSheet,{plannedRows} from './LifestylePlanSheet';
import {plannerItemToBlock} from '@/components/planner-v2/plannerItems';
beforeEach(()=>{vi.resetAllMocks();api.me.mockResolvedValue({id:'owner'});api.create.mockImplementation(async row=>({...row,id:'new-plan'}));api.filter.mockResolvedValue([]);});
it('keeps provenance, actual minutes and chosen checkpoint spacing',()=>{
  const rows=plannedRows({source:'books',club:{title:'Book',pick_key:'edition',checkpoints:[{label:'First'},{label:'Second'}]}},'2026-10-06','18:30',15,7);
  expect(rows.map(r=>r.date)).toEqual(['2026-10-06','2026-10-13']);
  expect(rows[1]).toMatchObject({time:'18:30',ref:'club:edition',notes:'d:15;Book · Second',is_completed:false});
});
it('keeps a failed chosen-time draft and never writes accepted checkpoint twice',async()=>{
  api.create.mockImplementationOnce(async row=>({...row,id:'one'})).mockRejectedValueOnce(new Error('offline')).mockImplementationOnce(async row=>({...row,id:'two'}));
  render(<LifestylePlanSheet ownerId="owner" request={{source:'books',club:{title:'Book',pick_key:'edition',checkpoints:[{label:'First'},{label:'Second'}]}}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Time').value).toBe('19:00');
  fireEvent.click(screen.getByRole('button',{name:'Retry remaining plans'}));
  await screen.findByRole('heading',{name:'It’s in your planner'});
  expect(api.create).toHaveBeenCalledTimes(3);
});
it('refuses a late account switch rather than writing another owner’s plan',async()=>{
  api.me.mockResolvedValue({id:'someone-else'});
  render(<LifestylePlanSheet ownerId="owner" request={{title:'Tea',ref:'joy:tea'}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  await waitFor(()=>expect(screen.getByRole('alert')).toBeTruthy());
  expect(api.create).not.toHaveBeenCalled();
});
it.each([5,15,30,60])('shows the chosen %i minutes after the real plan row reaches routed Planner',minutes=>{
  const row=plannedRows({source:'lifestyle',title:'Tea',ref:'joy:try-tea'},'2026-10-07','18:45',minutes,7)[0];
  expect(plannerItemToBlock(row).duration).toBe(minutes);
});
it('does not accept a returned record belonging to another owner',async()=>{
  api.create.mockResolvedValue({id:'foreign',user_id:'someone-else',source:'lifestyle',ref:'joy:tea'});
  render(<LifestylePlanSheet ownerId="owner" request={{title:'Tea',ref:'joy:tea'}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('heading',{name:'It’s in your planner'})).toBeNull();
});
it('does not accept an acknowledgement for a different planned source',async()=>{
  api.create.mockImplementation(async row=>({...row,id:'wrong-source',ref:'joy:different'}));
  render(<LifestylePlanSheet ownerId="owner" request={{title:'Tea',ref:'joy:tea'}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('heading',{name:'It’s in your planner'})).toBeNull();
});
it('rechecks an unconfirmed created id instead of creating a duplicate on Retry',async()=>{
  let payload;api.create.mockImplementation(async row=>{payload=row;return {id:'uncertain'};});
  api.filter.mockRejectedValueOnce(new Error('read-back offline')).mockImplementation(async()=>[{...payload,id:'uncertain'}]);
  render(<LifestylePlanSheet ownerId="owner" request={{title:'Tea',ref:'joy:tea'}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  await screen.findByRole('alert');expect(screen.getByLabelText('Time')).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Retry remaining plans'}));
  expect(await screen.findByRole('heading',{name:'It’s in your planner'})).toBeVisible();
  expect(api.create).toHaveBeenCalledTimes(1);expect(api.filter).toHaveBeenLastCalledWith({id:'uncertain',user_id:'owner'},undefined,1);
});
it('does not confirm a read-back record with the wrong created id',async()=>{
  let payload;api.create.mockImplementation(async row=>{payload=row;return {id:'created-id'};});
  api.filter.mockImplementation(async()=>[{...payload,id:'different-id'}]);
  render(<LifestylePlanSheet ownerId="owner" request={{title:'Tea',ref:'joy:tea'}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  expect(await screen.findByRole('alert')).toBeTruthy();expect(screen.queryByRole('heading',{name:'It’s in your planner'})).toBeNull();
});
it('stops a checkpoint batch when the authenticated account changes after the first accepted row',async()=>{
  api.me.mockResolvedValueOnce({id:'owner'}).mockResolvedValueOnce({id:'owner'}).mockResolvedValue({id:'other'});
  render(<LifestylePlanSheet ownerId="owner" request={{source:'books',club:{title:'Book',pick_key:'edition',checkpoints:[{label:'First'},{label:'Second'}]}}} onFinish={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save plan'}));await screen.findByRole('alert');
  expect(api.create).toHaveBeenCalledTimes(1);expect(screen.queryByRole('heading',{name:'It’s in your planner'})).toBeNull();
});
it('locks all chosen-time fields while the real create acknowledgement is pending',async()=>{
  let finish;api.create.mockImplementation(row=>new Promise(resolve=>{finish=()=>resolve({...row,id:'ack'});}));
  render(<LifestylePlanSheet ownerId="owner" request={{title:'Tea',ref:'joy:tea'}} onFinish={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Time'),{target:{value:'18:45'}});fireEvent.click(screen.getByRole('button',{name:'Save plan'}));
  await waitFor(()=>expect(finish).toBeTypeOf('function'));expect(screen.getByLabelText('Time')).toBeDisabled();expect(screen.getByRole('button',{name:'Close planning'})).toBeDisabled();
  await act(async()=>finish());expect(await screen.findByRole('heading',{name:'It’s in your planner'})).toBeVisible();
});
