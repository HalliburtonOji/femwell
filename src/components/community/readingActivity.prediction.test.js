import { afterEach, beforeEach, expect, it, vi } from "vitest";
const api=vi.hoisted(()=>({me:vi.fn(),invoke:vi.fn(),hash:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:api.me},functions:{invoke:api.invoke}}}));
vi.mock("@/components/community/communityAnon",()=>({communityHash:api.hash}));
import { recordPrediction, hasPredicted } from "./readingActivity";
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();api.me.mockResolvedValue({id:"owner"});api.hash.mockResolvedValue("anonymous-test-hash");api.invoke.mockResolvedValue({data:{ok:true}});});
afterEach(()=>vi.useRealTimers());
it("only confirmed prediction marks its exact local flag; progress/history and reflection stay unchanged",async()=>{
  localStorage.setItem("fw_read_514_2","2026-10-01"); localStorage.setItem("fw_read_reflect_514_2","Own local words");
  expect(await recordPrediction("514",2,"My hunch","owner")).toEqual({ok:true}); expect(hasPredicted("514",2)).toBe(true);
  expect(api.invoke).toHaveBeenCalledExactlyOnceWith("createCommunityPost",{action:"readingActivity.record",user_id:"owner",author_hash:"anonymous-test-hash",book_id:"514",chapter_index:2,kind:"prediction",body:"My hunch"});
  expect(localStorage.getItem("fw_read_514_2")).toBe("2026-10-01"); expect(localStorage.getItem("fw_read_reflect_514_2")).toBe("Own local words");
});
it("signed out, missing hash and changed owner never send or mark a hunch",async()=>{
  await expect(recordPrediction("514",2,"Draft",null)).rejects.toThrow(/Sign in/); expect(api.me).not.toHaveBeenCalled();
  api.me.mockResolvedValueOnce({id:"different"}); await expect(recordPrediction("514",2,"Draft","owner")).rejects.toThrow(/changed/);
  api.hash.mockResolvedValueOnce(null); await expect(recordPrediction("514",2,"Draft","owner")).rejects.toThrow(/identify/);
  expect(api.invoke).not.toHaveBeenCalled(); expect(hasPredicted("514",2)).toBe(false);
});
it.each([{data:{}},{data:{ok:false}},{data:{ok:true,error:"Write failed"}},null])("unconfirmed response %j keeps retry possible",async response=>{
  api.invoke.mockResolvedValue(response); await expect(recordPrediction("514",2,"Draft","owner")).rejects.toThrow(/confirm/); expect(hasPredicted("514",2)).toBe(false);
});
it("write rejection leaves no sent flag, then explicit retry confirms once",async()=>{
  api.invoke.mockRejectedValueOnce(new Error("offline")); await expect(recordPrediction("514",2,"Draft","owner")).rejects.toThrow("offline");
  expect(hasPredicted("514",2)).toBe(false); await recordPrediction("514",2,"Draft","owner"); expect(hasPredicted("514",2)).toBe(true); expect(api.invoke).toHaveBeenCalledTimes(2);
});
it("changed account after acknowledgement never marks the new account's local session as sent",async()=>{
  api.me.mockResolvedValueOnce({id:"owner"}).mockResolvedValueOnce({id:"owner"}).mockResolvedValueOnce({id:"other"});
  await expect(recordPrediction("514",2,"Draft","owner")).rejects.toThrow(/changed/); expect(hasPredicted("514",2)).toBe(false);
});
it("an account change during asynchronous hash creation stops before the authenticated write",async()=>{
  let finish; api.hash.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  const result=recordPrediction("514",2,"A's draft","owner").catch(error=>error);
  await vi.waitFor(()=>expect(finish).toBeTypeOf("function"));
  api.me.mockResolvedValue({id:"other"}); finish("hash-owner");
  expect((await result).message).toMatch(/changed/); expect(api.invoke).not.toHaveBeenCalled(); expect(hasPredicted("514",2)).toBe(false);
});
it("pending write has an eight-second confirmation deadline with no automatic retry or local sent flag",async()=>{
  vi.useFakeTimers(); api.invoke.mockReturnValue(new Promise(()=>{}));
  const result=recordPrediction("514",2,"Draft","owner").catch(error=>error);
  await vi.advanceTimersByTimeAsync(8000); expect((await result).message).toMatch(/timed out/); expect(api.invoke).toHaveBeenCalledTimes(1); expect(hasPredicted("514",2)).toBe(false);
});
it("an unresolved session hash has a bounded deadline and never writes",async()=>{
  vi.useFakeTimers(); api.hash.mockReturnValue(new Promise(()=>{}));
  const result=recordPrediction("514",2,"Draft","owner").catch(error=>error);
  await vi.advanceTimersByTimeAsync(6000); expect((await result).message).toMatch(/timed out/);
  expect(api.invoke).not.toHaveBeenCalled(); expect(hasPredicted("514",2)).toBe(false);
});
