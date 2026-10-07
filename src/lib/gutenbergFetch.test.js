// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { afterEach, expect, it, vi } from "vitest";

const source=readFileSync("base44/functions/fetchGutenbergBook/entry.ts","utf8").replace(/^import \{ createClientFromRequest \} from 'npm:@base44\/sdk@[^']+';\r?\n/m,"");
const code=transformSync(source,{loader:"ts",format:"cjs"}).code;
function harness(fetch,user={id:"test-owner"}) {
  let handler;
  runInNewContext(code,{createClientFromRequest:()=>({auth:{me:async()=>user}}),Deno:{serve:fn=>{handler=fn;}},fetch,AbortController,setTimeout,clearTimeout,Response,console});
  return body=>handler(new Request("https://test.invalid/fetchGutenbergBook",{method:"POST",body:JSON.stringify(body)}));
}
afterEach(()=>vi.useRealTimers());
const raw="Title: Actual edition\nAuthor: Actual author\n*** START OF THE PROJECT GUTENBERG EBOOK Example ***\n"+"Whole author paragraph.\n\n".repeat(20)+"*** END OF THE PROJECT GUTENBERG EBOOK Example ***";
it("keeps all URL fallbacks, metadata and complete stripped prose with no leftover deadline timers",async()=>{
  vi.useFakeTimers(); const fetch=vi.fn().mockResolvedValueOnce({ok:false}).mockResolvedValueOnce({ok:false}).mockResolvedValueOnce({ok:true,text:async()=>raw});
  const response=await harness(fetch)({gutenberg_id:105}); const result=await response.json();
  expect(response.status).toBe(200); expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls.map(([url])=>url)).toEqual(["https://www.gutenberg.org/cache/epub/105/pg105.txt","https://www.gutenberg.org/files/105/105-0.txt","https://www.gutenberg.org/files/105/105.txt"]);
  expect(result).toEqual({text:"Whole author paragraph.\n\n".repeat(20).trim(),title:"Actual edition",author:"Actual author",source_url:"https://www.gutenberg.org/ebooks/105"});
  expect(vi.getTimerCount()).toBe(0);
});
it.each(["headers","body"])("eight-second deadline cancels stalled %s before trying next variant, never overlapping downloads",async phase=>{
  vi.useFakeTimers(); let active=0,max=0; const signals=[];
  const fetch=vi.fn((_,{signal})=>{
    active++; max=Math.max(max,active); signals.push(signal);
    const pending=new Promise((_,reject)=>signal.addEventListener("abort",()=>{active--;reject(new Error("aborted"));},{once:true}));
    return phase==="headers"?pending:Promise.resolve({ok:true,text:()=>pending});
  });
  const result=harness(fetch)({gutenberg_id:105});
  await vi.advanceTimersByTimeAsync(8000); expect(fetch).toHaveBeenCalledTimes(2); expect(signals[0].aborted).toBe(true);
  await vi.advanceTimersByTimeAsync(16000); const response=await result;
  expect(response.status).toBe(502); expect(fetch).toHaveBeenCalledTimes(3); expect(signals.every(signal=>signal.aborted)).toBe(true);
  expect(max).toBe(1); expect(active).toBe(0); expect(vi.getTimerCount()).toBe(0);
});
it("cancels an unread HTTP error body before starting the next fallback",async()=>{
  vi.useFakeTimers(); let openBodies=0,maxBodies=0;
  const cancel=vi.fn(()=>{openBodies--;});
  const fetch=vi.fn((_,{signal})=>{
    if(fetch.mock.calls.length===1) {
      openBodies++; maxBodies=Math.max(maxBodies,openBodies);
      return Promise.resolve(new Response(new ReadableStream({cancel}),{status:404}));
    }
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(openBodies).toBe(0); expect(signal.aborted).toBe(false);
    openBodies++; maxBodies=Math.max(maxBodies,openBodies);
    return Promise.resolve({ok:true,text:async()=>{openBodies--;return raw;}});
  });
  const response=await harness(fetch)({gutenberg_id:105});
  expect(response.status).toBe(200); expect(fetch).toHaveBeenCalledTimes(2);
  expect(cancel).toHaveBeenCalledTimes(1); expect(maxBodies).toBe(1);
  expect(openBodies).toBe(0); expect(vi.getTimerCount()).toBe(0);
});
it("unauthorised and invalid edition requests never call Gutenberg",async()=>{
  const fetch=vi.fn(); expect((await harness(fetch,null)({gutenberg_id:105})).status).toBe(401);
  const call=harness(fetch); for(const id of [0,-1,1.5,"oops",9007199254740992]) expect((await call({gutenberg_id:id})).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it("short/unavailable source stays a truthful error rather than a fabricated or truncated book",async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,text:async()=>"Title: Missing\nTiny"});
  expect((await harness(fetch)({gutenberg_id:105})).status).toBe(502);
});
