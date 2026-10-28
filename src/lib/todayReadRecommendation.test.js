// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { expect, it, vi } from "vitest";

const source = readFileSync("base44/functions/generateTodayRecommendations/entry.ts", "utf8")
  .replace(/^import \{ createClientFromRequest \} from 'npm:@base44\/sdk@[^']+';\r?\n/m, "");
const code = transformSync(source, { loader: "ts", format: "cjs" }).code;

function dailyRun({ lifestyleFailure = false } = {}) {
  let handler;
  const created = [];
  const lifestyleList = vi.fn(async () => {
    if (lifestyleFailure) throw new Error("source unavailable");
    return [{ id: "read/one", provider: "FEMWELL_AI", status: "PUBLISHED", title: "A real archive item" }];
  });
  const entities = {
    UserProfile: { list: async () => [{ user_id: "one" }, { user_id: "two" }] },
    ContentItems: { list: async () => [{ id: "content-one", title: "A practice", cycle_phases: ["all"] }] },
    Programs: { list: async () => [] },
    LifestyleItems: { list: lifestyleList },
    WeeklyBookPick: { filter: async () => [] },
    EventsItems: { list: async () => [] },
    TodayRecommendations: { filter: async () => [], delete: vi.fn(), create: async row => { created.push(row); } },
  };
  runInNewContext(code, {
    createClientFromRequest: () => ({ asServiceRole: { entities } }),
    Deno: { serve: fn => { handler = fn; } },
    Date, Response, console, encodeURIComponent,
  });
  return { invoke: () => handler(new Request("https://test.invalid/daily")), created, lifestyleList };
}

it("reuses one published Read lookup and opens the exact archive item for every profile", async () => {
  const run = dailyRun();
  expect((await (await run.invoke()).json()).processed).toBe(2);
  expect(run.lifestyleList).toHaveBeenCalledTimes(1);
  expect(run.lifestyleList).toHaveBeenCalledWith("-published_at", 5);
  expect(run.created.filter(row => row.type === "LIFESTYLE")).toEqual([
    expect.objectContaining({ user_id: "one", reason: "From the FemWell AI archive", action_route: "/LifestyleDetail?id=read%2Fone" }),
    expect.objectContaining({ user_id: "two", reason: "From the FemWell AI archive", action_route: "/LifestyleDetail?id=read%2Fone" }),
  ]);
  expect(run.created.filter(row => row.type === "content")).toHaveLength(2);
});

it("keeps other daily recommendations when the archive source fails", async () => {
  const run = dailyRun({ lifestyleFailure: true });
  expect((await (await run.invoke()).json()).processed).toBe(2);
  expect(run.lifestyleList).toHaveBeenCalledTimes(1);
  expect(run.created.filter(row => row.type === "LIFESTYLE")).toHaveLength(0);
  expect(run.created.filter(row => row.type === "content")).toHaveLength(2);
});
