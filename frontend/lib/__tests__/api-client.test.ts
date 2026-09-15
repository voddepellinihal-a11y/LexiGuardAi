import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";

const jsonOk = (data: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) });

describe("api client", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends Authorization header when a session token exists", async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonOk({ docs: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await api.documents.list();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock.mock.calls[0][0]).toContain("/documents");
    expect(init.headers).toMatchObject({});
  });

  it("throws a readable error on non-OK responses", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: { detail: "Not here" } }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(api.documents.get("x")).rejects.toThrow("Not here");
  });

  it("throws a generic error when the error body is empty", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({ ok: false, status: 500, json: () => Promise.reject(new Error("no json")) })
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(api.documents.list()).rejects.toThrow("API error: 500");
  });

  it("builds comparison payload with snake_case keys", async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonOk({ status: "completed" }));
    vi.stubGlobal("fetch", fetchMock);
    await api.comparisons.create("a", "b");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ document_a_id: "a", document_b_id: "b" });
  });

  it("builds analysis payload with role and stance", async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonOk({}));
    vi.stubGlobal("fetch", fetchMock);
    await api.analysis.run("doc1", "Buyer", "Balanced");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ role: "Buyer", negotiation_stance: "Balanced" });
  });

  it("posts chat questions to the document chat endpoint", async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonOk({ answer: "hi" }));
    vi.stubGlobal("fetch", fetchMock);
    await api.chat.ask("doc1", "What?");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/documents/doc1/chat");
    expect(JSON.parse(init.body as string)).toEqual({ question: "What?" });
  });
});
