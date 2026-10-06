import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { decodeSkyPairing, sanitiseSkyLetter, skyReadingKey, validSkyBirthday } from "./skyCompletion";
import useSkyCompletion from "./useSkyCompletion";
import useSelectedSkyChart from "./useSelectedSkyChart";

const mock=vi.hoisted(()=>({cycles:vi.fn(),plans:vi.fn(),letters:vi.fn(),moon:vi.fn(),me:vi.fn(),charts:vi.fn(),readings:vi.fn(),profiles:vi.fn(),subscribe:vi.fn(),unsubscribe:vi.fn(),invoke:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:mock.me},functions:{invoke:mock.invoke},entities:{CycleEvents:{filter:mock.cycles},Entitlements:{filter:mock.plans},AtelierLetters:{filter:mock.letters},AstroProfile:{filter:mock.charts},HoroscopeReading:{filter:mock.readings,subscribe:mock.subscribe},UserProfile:{filter:mock.profiles}}}}));
vi.mock("@/utils/astrology",()=>({getMoonPhase:mock.moon}));
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const published={id:"letter-a",user_id:"a",draft:false,month:"2026-10",body:"A real published letter"};
beforeEach(()=>{vi.resetAllMocks();mock.cycles.mockResolvedValue([]);mock.plans.mockResolvedValue([]);mock.letters.mockResolvedValue([]);mock.moon.mockReturnValue({key:"full"});mock.me.mockResolvedValue({id:"a"});mock.charts.mockResolvedValue([]);mock.readings.mockResolvedValue([]);mock.profiles.mockResolvedValue([]);mock.subscribe.mockReturnValue(mock.unsubscribe);});

describe("Sky completion exact input and source safety",()=>{
  it.each(["2026-02-29","2026-04-31","2026-13-01","2026-00-10","1899-10-01","2027-01-01","2026-10-07","06/10/2026"])("rejects impossible or future birthday %s",value=>{
    expect(validSkyBirthday(value,new Date(2026,9,6,12))).toBe(false);
  });
  it("accepts a true leap day and today's local calendar date",()=>{
    const today=new Date(2026,9,6,12);
    expect(validSkyBirthday("2000-02-29",today)).toBe(true);
    expect(validSkyBirthday("2026-10-06",today)).toBe(true);
  });
  it("reads Unicode names through a real encoded URL parameter without losing characters",()=>{
    const pair={name:"Zoë | ليلى",birthday:"1998-05-16"};
    const url=new URL("https://femwells.com/SkyWorldsDemo");url.searchParams.set("compat",JSON.stringify(pair));
    expect(decodeSkyPairing(new URL(url.href).searchParams.get("compat"))).toEqual(pair);
  });
  it("keeps an existing base64 pairing link readable",()=>{
    expect(decodeSkyPairing(btoa("Jess|1995-04-19"))).toEqual({name:"Jess",birthday:"1995-04-19"});
  });
  it.each([JSON.stringify({name:"A",birthday:"2099-01-01"}),JSON.stringify({name:"A",birthday:"2026-02-29"}),JSON.stringify({name:"a".repeat(101),birthday:"1995-04-19"}),"not valid base64"])("rejects malformed pairing %s",raw=>{
    expect(()=>decodeSkyPairing(raw)).toThrow();
  });
  it("retains substantive letter formatting while removing active content and dangerous URLs",()=>{
    const output=sanitiseSkyLetter('<section><h2 onclick="steal()">Your month</h2><p>A <em>real</em> letter.<img src="x" onerror="steal()"><script>steal()</script><iframe src="x"></iframe><svg><script>steal()</script></svg><a href="jav&#x61;script:steal()" onclick="steal()">Unsafe link</a><a href="https://example.com/read" style="position:fixed">A source</a></p></section>');
    const body=new DOMParser().parseFromString(output,"text/html").body;
    expect(body.querySelector("h2").textContent).toBe("Your month");
    expect(body.querySelector("em").textContent).toBe("real");
    expect(body.querySelector("script,iframe,svg,img,section,[onclick],[onerror],[style]")).toBeNull();
    expect(body.querySelectorAll("a")[0].hasAttribute("href")).toBe(false);
    expect(body.querySelectorAll("a")[1].getAttribute("href")).toBe("https://example.com/read");
    expect(body.querySelectorAll("a")[1].getAttribute("rel")).toBe("noopener noreferrer");
    expect(body.textContent).not.toContain("steal()");
  });
  it("requires an owner and a substantive dated reading before creating its local read reference",()=>{
    const reading={id:"reading-a",reading_date:"2026-10-06",narrative:"The actual authored reading."};
    const key=skyReadingKey("owner-private-id",reading);
    expect(key).toBeTruthy();expect(key).not.toContain("owner-private-id");
    expect(skyReadingKey(null,reading)).toBeNull();
    expect(skyReadingKey("a",{...reading,narrative:""})).toBeNull();
    expect(skyReadingKey("a",{...reading,id:null})).toBeNull();
    expect(skyReadingKey("a",{...reading,reading_date:null})).toBeNull();
  });
});

describe("Selected Sky completion owner and partial-read lifecycle",()=>{
  it("ignores a late former-owner response after the current owner's letter has loaded",async()=>{
    const old=deferred();mock.letters.mockImplementation(({user_id})=>user_id==="a" ? old.promise : Promise.resolve([{...published,id:"letter-b",user_id:"b"}]));
    const {result,rerender}=renderHook(({user})=>useSkyCompletion(user,true),{initialProps:{user:{id:"a"}}});
    rerender({user:{id:"b"}});
    await waitFor(()=>expect(result.current.letter?.id).toBe("letter-b"));
    await act(async()=>old.resolve([published]));
    expect(result.current.letter.id).toBe("letter-b");
    expect(mock.letters).toHaveBeenCalledWith({user_id:"b",draft:false},"-month",24);
  });
  it("clears account data immediately on sign-out and ignores pending private reads",async()=>{
    const pending=deferred();mock.letters.mockReturnValue(pending.promise);
    const {result,rerender}=renderHook(({user})=>useSkyCompletion(user,true),{initialProps:{user:{id:"a"}}});
    rerender({user:null});expect(result.current.letter).toBeNull();expect(result.current.rw).toBeNull();expect(result.current.loading).toBe(false);
    await act(async()=>pending.resolve([published]));expect(result.current.letter).toBeNull();expect(result.current.unlocked).toBe(false);
  });
  it.each(["cycles","plans","letters"])("preserves successful data when %s fails, and retries that read honestly",async source=>{
    mock.cycles.mockResolvedValue([{user_id:"a",type:"PeriodStart",date:"2026-09-04"}]);
    mock.letters.mockResolvedValue([published]);mock[source].mockRejectedValueOnce(new Error("offline"));
    const {result}=renderHook(()=>useSkyCompletion({id:"a"},true));
    await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(source==="cycles" ? result.current.cycleError : result.current.letterError).toContain("Try again?");
    if(source!=="letters") expect(result.current.letter).toEqual(published);
    if(source!=="cycles") expect(result.current.rw.bleeds_at_phases).toEqual(["full"]);
    act(()=>result.current.retry());
    await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(result.current.cycleError).toBe("");expect(result.current.letterError).toBe("");
    expect(result.current.letter).toEqual(published);expect(mock[source]).toHaveBeenCalledTimes(2);
  });
  it("uses only the owner's published letters and unique real period starts, with one consistent noon phase",async()=>{
    mock.letters.mockResolvedValue([{...published,id:"foreign",user_id:"b"},{...published,id:"draft",draft:true},published]);
    mock.cycles.mockResolvedValue([
      {user_id:"a",type:"PeriodStart",date:"2026-09-04"},{user_id:"a",type:"period_start",date:"2026-09-04"},
      {user_id:"a",type:"period_start",date:"2026-08-07"},{user_id:"a",type:"period_start",date:"2026-07-10"},
      {user_id:"b",type:"period_start",date:"2026-10-01"},{user_id:"a",type:"symptom",date:"2026-10-02"},
      {user_id:"a",type:"period_start",date:"2026-02-30"},{user_id:"a",type:"period_start",date:"2099-01-01"},
    ]);
    const {result}=renderHook(()=>useSkyCompletion({id:"a"},true));
    await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(result.current.letter).toEqual(published);
    expect(result.current.rw.bleeds_at_phases).toEqual(["full","full","full"]);
    expect(result.current.rw.archetype).toBe("white_moon");expect(result.current.rw.confidence).toBe(1);
    expect(mock.moon.mock.calls.every(([date])=>date.getHours()===12)).toBe(true);
    expect(mock.cycles).toHaveBeenCalledWith({user_id:"a"},"-date",100);
  });
  it("does not read private entities while the selected completion feature is disabled",()=>{
    const {result}=renderHook(()=>useSkyCompletion({id:"a"},false));
    expect(result.current.loading).toBe(false);expect(result.current.letter).toBeNull();
    expect(mock.cycles).not.toHaveBeenCalled();expect(mock.letters).not.toHaveBeenCalled();expect(mock.plans).not.toHaveBeenCalled();
  });
});

describe("Selected preview chart reads without generation",()=>{
  it("uses only the signed-in owner's actual chart, reading and supplied profile without invoking a generator",async()=>{
    const ownChart={id:"chart-a",user_id:"a",sun_sign:"Taurus"};
    const ownReading={id:"reading-a",user_id:"a",reading_date:new Date().toISOString().slice(0,10),narrative:"Your existing reading."};
    const ownProfile={user_id:"a",life_stage:"reproductive"};
    mock.charts.mockResolvedValue([{...ownChart,id:"foreign",user_id:"b"},ownChart]);mock.readings.mockResolvedValue([ownReading]);
    const {result}=renderHook(()=>useSelectedSkyChart(ownProfile));
    await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(result.current.astro).toEqual(ownChart);expect(result.current.reading).toEqual(ownReading);expect(result.current.userProfile).toEqual(ownProfile);
    expect(mock.profiles).not.toHaveBeenCalled();expect(mock.invoke).not.toHaveBeenCalled();expect(result.current.generatingReading).toBe(false);
  });
  it("keeps an absent reading empty rather than generating or inventing one",async()=>{
    const {result}=renderHook(()=>useSelectedSkyChart());
    await waitFor(()=>expect(result.current.loading).toBe(false));
    expect(result.current.reading).toBeNull();expect(result.current.astro).toBeNull();expect(mock.invoke).not.toHaveBeenCalled();
  });
  it("reads the true owner's profile when a supplied profile belongs to somebody else",async()=>{
    const profile={user_id:"a",life_stage:"menopause"};mock.profiles.mockResolvedValue([profile]);
    const {result}=renderHook(()=>useSelectedSkyChart({user_id:"b",life_stage:"reproductive"}));
    await waitFor(()=>expect(result.current.loading).toBe(false));expect(result.current.userProfile).toEqual(profile);
    expect(mock.profiles).toHaveBeenCalledWith({user_id:"a"},"-updated_at",1);
  });
  it("ignores old chart reads after the selected preview changes owner",async()=>{
    const old=deferred();mock.me.mockResolvedValueOnce({id:"a"}).mockResolvedValue({id:"b"});
    mock.charts.mockImplementation(({user_id})=>user_id==="a" ? old.promise : Promise.resolve([{user_id:"b",id:"chart-b"}]));
    const {result,rerender}=renderHook(({profile})=>useSelectedSkyChart(profile),{initialProps:{profile:{user_id:"a"}}});
    await waitFor(()=>expect(mock.charts).toHaveBeenCalledTimes(1));rerender({profile:{user_id:"b"}});
    await waitFor(()=>expect(result.current.astro?.id).toBe("chart-b"));
    await act(async()=>old.resolve([{user_id:"a",id:"chart-a"}]));expect(result.current.user.id).toBe("b");expect(result.current.astro.id).toBe("chart-b");
  });
  it("accepts only today's owner subscription updates and unsubscribes on unmount",async()=>{
    const {result,unmount}=renderHook(()=>useSelectedSkyChart());
    await waitFor(()=>expect(mock.subscribe).toHaveBeenCalled());const handler=mock.subscribe.mock.calls[0][0];
    const today=new Date().toISOString().slice(0,10);
    act(()=>{handler({type:"create",data:{id:"foreign",user_id:"b",reading_date:today}});handler({type:"update",data:{id:"old",user_id:"a",reading_date:"1990-01-01"}});});
    expect(result.current.reading).toBeNull();
    act(()=>handler({type:"update",data:{id:"today",user_id:"a",reading_date:today,narrative:"Actual new answer."}}));
    expect(result.current.reading.id).toBe("today");unmount();expect(mock.unsubscribe).toHaveBeenCalledTimes(1);
  });
  it("ends with an honest sign-in state after authentication fails and reads no private entities",async()=>{
    mock.me.mockRejectedValue(new Error("signed out"));const {result}=renderHook(()=>useSelectedSkyChart());
    await waitFor(()=>expect(result.current.loading).toBe(false));expect(result.current.error).toContain("Sign in");
    expect(mock.charts).not.toHaveBeenCalled();expect(mock.readings).not.toHaveBeenCalled();expect(mock.invoke).not.toHaveBeenCalled();
  });
});
