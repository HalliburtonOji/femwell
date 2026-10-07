import React from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import useSelectedSkyChart from "./useSelectedSkyChart";
import useCurrentSkyDay from "./useCurrentSkyDay";
import DailySkyLesson from "./DailySkyLesson";
import { dailyLessonDeck, localSkyDay } from "./skyLessons";

const mock=vi.hoisted(()=>({me:vi.fn(),charts:vi.fn(),readings:vi.fn(),profiles:vi.fn(),subscribe:vi.fn(),invoke:vi.fn(),saves:vi.fn(),notes:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:mock.me},entities:{AstroProfile:{filter:mock.charts},HoroscopeReading:{filter:mock.readings,subscribe:mock.subscribe},UserProfile:{filter:mock.profiles},SavedItems:{filter:mock.saves},JournalEntries:{filter:mock.notes}},functions:{invoke:mock.invoke}}}));
vi.mock("@/lib/savedItems",()=>({saveItem:vi.fn(),removeSavedItem:vi.fn(),parseSavedMeta:row=>JSON.parse(row.meta_json || "{}")}));
const row=(id,date=new Date().toISOString().slice(0,10))=>({id,user_id:"owner",reading_date:date,narrative:`The complete ${id} reading.`});
const pending=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
beforeEach(()=>{vi.clearAllMocks();vi.useFakeTimers({toFake:["Date"]});vi.setSystemTime(new Date(2026,9,7,12));mock.me.mockResolvedValue({id:"owner"});mock.charts.mockResolvedValue([{id:"chart",user_id:"owner"}]);mock.profiles.mockResolvedValue([]);mock.readings.mockResolvedValue([row("initial")]);mock.subscribe.mockReturnValue(vi.fn());mock.invoke.mockResolvedValue({data:{reading:row("generated")}});mock.saves.mockResolvedValue([]);mock.notes.mockResolvedValue([]);window.history.replaceState({},"","/Lifestyle?section=sky");HTMLElement.prototype.scrollTo=vi.fn();});
afterEach(()=>vi.useRealTimers());

describe("reading recovery while the sky changes",()=>{
  it('keeps the newest of two batched subscriptions when a stale refresh snapshot settles',async()=>{
    mock.readings.mockResolvedValue([{...row('initial'),created_date:'2026-10-07T10:00:00Z'}]);
    const {result}=renderHook(()=>useSelectedSkyChart());await waitFor(()=>expect(result.current.reading?.id).toBe('initial'));
    const snapshot=pending();mock.readings.mockReturnValueOnce(snapshot.promise);act(()=>result.current.refresh());await waitFor(()=>expect(mock.readings).toHaveBeenCalledTimes(2));
    const callback=mock.subscribe.mock.calls.at(-1)[0];
    act(()=>{callback({type:'create',data:{...row('newest'),created_date:'2026-10-07T12:00:00Z'}});callback({type:'create',data:{...row('delayed'),created_date:'2026-10-07T11:00:00Z'}});});
    expect(result.current.reading.id).toBe('newest');
    await act(async()=>snapshot.resolve([{...row('initial'),created_date:'2026-10-07T10:00:00Z'}]));
    expect(result.current.reading.id).toBe('newest');
  });
  it.each(["empty","old"])("retains a subscription accepted during an explicit refresh when its %s snapshot arrives",async kind=>{
    const {result}=renderHook(()=>useSelectedSkyChart(undefined,null,true));await waitFor(()=>expect(result.current.reading?.id).toBe("initial"));
    const snapshot=pending();mock.readings.mockReturnValueOnce(snapshot.promise);act(()=>result.current.refresh());await waitFor(()=>expect(mock.readings).toHaveBeenCalledTimes(2));
    act(()=>mock.subscribe.mock.calls.at(-1)[0]({type:"create",data:row("live")}));expect(result.current.reading.id).toBe("live");
    await act(async()=>snapshot.resolve(kind==="empty" ? [] : [row("initial")]));await waitFor(()=>expect(result.current.refreshing).toBe(false));
    expect(result.current.reading?.id).toBe("live");expect(mock.invoke).not.toHaveBeenCalled();
  });
  it.each([null,{rows:[]},[null],[row("foreign")].map(item=>({...item,user_id:"other"})),[{...row("no-id"),id:null}]])("does not generate after an unconfirmed reading collection: %j",async value=>{
    mock.readings.mockResolvedValue(value);const {result}=renderHook(()=>useSelectedSkyChart(undefined,null,true));await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBe("");expect(mock.invoke).not.toHaveBeenCalled();
  });
  it('offers the producer’s new UTC day if generation crosses midnight, without replacing the open day',async()=>{
    const generation=pending();mock.readings.mockResolvedValue([]);mock.invoke.mockReturnValue(generation.promise);
    const {result}=renderHook(()=>useSelectedSkyChart(undefined,null,true));await waitFor(()=>expect(result.current.generatingReading).toBe(true));
    vi.setSystemTime(new Date(2026,9,8,12));await act(async()=>generation.resolve({data:{reading:row('tomorrow')}}));
    expect(result.current.checkedDay).toBe('2026-10-07');expect(result.current.reading).toBeNull();expect(result.current.newDay).toBe('2026-10-08');
    expect(result.current.error).toBe('');expect(result.current.generatingReading).toBe(false);
  });
  it("ignores a disposed previous-day subscription after a current-day refresh",async()=>{
    const {result}=renderHook(()=>useSelectedSkyChart());await waitFor(()=>expect(result.current.reading?.id).toBe("initial"));const oldCallback=mock.subscribe.mock.calls.at(-1)[0];
    vi.setSystemTime(new Date(2026,9,8,12));mock.readings.mockResolvedValue([row("next-day")]);act(()=>result.current.refresh());await waitFor(()=>expect(result.current.reading?.id).toBe("next-day"));
    act(()=>oldCallback({type:"update",data:row("initial","2026-10-07")}));expect(result.current.reading.id).toBe("next-day");
  });
  it("keeps an exact historical request safe from the disposed live subscription",async()=>{
    const {result,rerender}=renderHook(({id})=>useSelectedSkyChart(undefined,id),{initialProps:{id:null}});await waitFor(()=>expect(result.current.reading?.id).toBe("initial"));const oldCallback=mock.subscribe.mock.calls.at(-1)[0];
    mock.readings.mockResolvedValue([row("historical","2026-09-04")]);rerender({id:"historical"});await waitFor(()=>expect(result.current.reading?.id).toBe("historical"));
    act(()=>oldCallback({type:"update",data:row("initial")}));expect(result.current.reading.id).toBe("historical");expect(mock.invoke).not.toHaveBeenCalled();
  });
  it("retains the dated open reading through a midnight failure and recovers on retry",async()=>{
    const {result}=renderHook(()=>useSelectedSkyChart());await waitFor(()=>expect(result.current.reading?.id).toBe("initial"));vi.setSystemTime(new Date(2026,9,8,12));
    mock.readings.mockRejectedValueOnce(new Error("offline"));act(()=>result.current.refresh());await waitFor(()=>expect(result.current.error).not.toBe(""));
    expect(result.current.reading.reading_date).toBe("2026-10-07");mock.readings.mockResolvedValue([row("recovered")]);act(()=>result.current.refresh());await waitFor(()=>expect(result.current.reading?.id).toBe("recovered"));expect(result.current.error).toBe("");
  });
  it("clears a pending producer day when the clock returns to the open day",async()=>{
    const {result}=renderHook(()=>useSelectedSkyChart());await waitFor(()=>expect(result.current.loading).toBe(false));vi.setSystemTime(new Date(2026,9,8,12));fireEvent(document,new Event("visibilitychange"));expect(result.current.newDay).toBe("2026-10-08");
    vi.setSystemTime(new Date(2026,9,7,12));fireEvent(window,new Event("pageshow"));expect(result.current.newDay).toBeNull();
  });
});

describe("deliberate daily lesson recovery",()=>{
  it('refreshes present-day lunar facts on page restoration while an open lesson and draft retain their date',async()=>{
    const {result}=renderHook(()=>useCurrentSkyDay());
    render(<DailySkyLesson userId="owner"/>);await waitFor(()=>expect(screen.getByRole('button',{name:'Keep this'})).toBeEnabled());
    const original=screen.getByRole('group',{name:'1 of 5'}).textContent;
    fireEvent.click(screen.getByRole('button',{name:'A private note'}));fireEvent.change(screen.getByLabelText('What caught your eye?'),{target:{value:'An unfinished thought'}});
    vi.setSystemTime(new Date(2026,9,8,12));fireEvent(window,new Event('pageshow'));
    expect(result.current).toBe('2026-10-08');expect(screen.getByRole('group',{name:'1 of 5'})).toHaveTextContent(original);expect(screen.getByLabelText('What caught your eye?')).toHaveValue('An unfinished thought');
    vi.setSystemTime(new Date(2026,9,7,12));fireEvent(window,new Event('pageshow'));expect(result.current).toBe('2026-10-07');
    expect(screen.queryByRole('button',{name:'Read today’s new lesson'})).toBeNull();
  });
  it("clears a stale lesson-day invitation after a clock correction without changing the open card",async()=>{
    render(<DailySkyLesson userId="owner"/>);await waitFor(()=>expect(screen.getByRole("button",{name:"Keep this"})).toBeEnabled());const original=screen.getByRole("group",{name:"1 of 5"}).textContent;
    vi.setSystemTime(new Date(2026,9,8,12));fireEvent(document,new Event("visibilitychange"));expect(screen.getByRole("button",{name:"Read today’s new lesson"})).toBeEnabled();
    vi.setSystemTime(new Date(2026,9,7,12));fireEvent(window,new Event("pageshow"));expect(screen.queryByRole("button",{name:"Read today’s new lesson"})).toBeNull();expect(screen.getByRole("group",{name:"1 of 5"})).toHaveTextContent(original);
  });
  it("checks the actual local day at acceptance rather than using yesterday’s pending invitation",async()=>{
    render(<DailySkyLesson userId="owner"/>);await waitFor(()=>expect(screen.getByRole("button",{name:"Keep this"})).toBeEnabled());vi.setSystemTime(new Date(2026,9,8,12));fireEvent(document,new Event("visibilitychange"));
    vi.setSystemTime(new Date(2026,9,9,12));fireEvent.click(screen.getByRole("button",{name:"Read today’s new lesson"}));expect(screen.getByRole("group",{name:"1 of 5"})).toHaveTextContent(dailyLessonDeck(localSkyDay())[0].title);
  });
});
