// @vitest-environment node
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import { describe, expect, it, vi } from "vitest";

function handlerWith(client) {
  const source = readFileSync(new URL("../../../base44/functions/generateFemwellContent/entry.ts", import.meta.url), "utf8")
    .replace(/^import[^\n]+\r?\n/, "");
  const compiled = transformSync(source, { loader: "ts", format: "iife", target: "es2022" }).code;
  let handler;
  new Function("Deno", "createClientFromRequest", "Response", "console", compiled)(
    { serve: callback => { handler = callback; } }, () => client, Response, console,
  );
  return handler;
}

function clientWith(role = "admin") {
  const client = {
    auth: { me: vi.fn(async () => ({ id: "editor-id", email: "editor@example.test", role })) },
    asServiceRole: {
      integrations: { Core: { InvokeLLM: vi.fn(async () => ({
        title: "Review candidate", body: "A complete candidate for editorial review.", summary: "An overview.",
        key_lessons: [], author_name: "FemWell Editorial",
      })) } },
      entities: { LifestyleItems: {
        create: vi.fn(async () => ({ id: "candidate-id" })),
        filter: vi.fn(async () => []),
        update: vi.fn(async () => ({})),
      } },
    },
  };
  return client;
}

describe("scheduled editorial containment", () => {
  it("returns without AI generation or publication on the existing scheduled invocation", async () => {
    const client = clientWith();
    const response = await handlerWith(client)({ json: async () => ({}) });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ generated: 0, editorial_review_required: true });
    expect(client.asServiceRole.integrations.Core.InvokeLLM).not.toHaveBeenCalled();
    expect(client.asServiceRole.entities.LifestyleItems.create).not.toHaveBeenCalled();
  });

  it("requires an admin for manual generation and saves its output for review", async () => {
    const other = clientWith("user");
    const rejected = await handlerWith(other)({ json: async () => ({ force_run: true }) });
    expect(rejected.status).toBe(403);
    expect(other.asServiceRole.integrations.Core.InvokeLLM).not.toHaveBeenCalled();

    const editor = clientWith();
    const accepted = await handlerWith(editor)({ json: async () => ({ force_run: true }) });
    expect(accepted.status).toBe(200);
    expect(editor.asServiceRole.entities.LifestyleItems.create).toHaveBeenCalledWith(expect.objectContaining({ status: "NEEDS_REVIEW" }));
    expect(editor.asServiceRole.entities.LifestyleItems.create.mock.calls[0][0]).not.toHaveProperty("published_at");
  });

  it("preserves the existing explicit custom-request path", async () => {
    const client = clientWith();
    const response = await handlerWith(client)({ json: async () => ({ custom_topic: "My requested read" }) });
    expect(response.status).toBe(200);
    expect(client.asServiceRole.entities.LifestyleItems.create).toHaveBeenCalledWith(expect.objectContaining({ status: "NEEDS_REVIEW" }));
    expect(client.asServiceRole.entities.LifestyleItems.update).toHaveBeenCalledWith("candidate-id", expect.objectContaining({
      provider: "FEMWELL_AI_USER_REQUEST", author_name: "Generated for you", status: "PUBLISHED",
    }));
  });

  it("labels a requested first-person story as fiction rather than testimony", async () => {
    const client = clientWith();
    const response = await handlerWith(client)({ json: async () => ({ custom_topic: "A turning point", content_type: "story" }) });
    expect(response.status).toBe(200);
    expect(client.asServiceRole.entities.LifestyleItems.create).toHaveBeenCalledWith(expect.objectContaining({ author_name: "FemWell Fiction", content_type: "STORY", status: "NEEDS_REVIEW" }));
    expect(client.asServiceRole.entities.LifestyleItems.update).toHaveBeenCalledWith("candidate-id", expect.objectContaining({
      provider: "FEMWELL_AI_USER_REQUEST", author_name: "FemWell Fiction · generated for you", status: "PUBLISHED",
    }));
  });

  it("does not spend a custom generation call without a signed-in owner or a limit read", async () => {
    const client = clientWith();
    client.auth.me.mockResolvedValueOnce(null);
    expect((await handlerWith(client)({ json: async () => ({ custom_topic: "A read" }) })).status).toBe(401);
    client.asServiceRole.entities.LifestyleItems.filter.mockRejectedValueOnce(new Error("read unavailable"));
    expect((await handlerWith(client)({ json: async () => ({ custom_topic: "A read" }) })).status).toBe(503);
    expect(client.asServiceRole.integrations.Core.InvokeLLM).not.toHaveBeenCalled();
  });
});
