import { describe, expect, it } from "vitest";
import { getDemoChatAnswer } from "@/lib/demo-answers";

describe("getDemoChatAnswer", () => {
  it("routes termination questions to the termination answer", () => {
    const a = getDemoChatAnswer("demo-svc-v1", "What is the termination notice period?");
    expect(a).toContain("30 days written notice");
    expect(a).toContain("Section 2.2");
  });

  it("routes financial questions to the financial answer", () => {
    const a = getDemoChatAnswer("demo-svc-v1", "What are the fees and late penalties?");
    expect(a).toContain("Non-Refundable Fees");
  });

  it("routes indemnification questions correctly", () => {
    const a = getDemoChatAnswer("demo-svc-v1", "How does indemnification work?");
    expect(a).toContain("Section 4.1");
  });

  it("routes non-compete questions for employment docs", () => {
    const a = getDemoChatAnswer("demo-emp", "What restrictions apply after I leave?");
    expect(a).toContain("non-compete");
  });

  it("falls back to the document overview for unmatched questions", () => {
    const a = getDemoChatAnswer("demo-nda", "Who wrote this?");
    expect(a).toContain("Key NDA terms");
  });

  it("returns the generic fallback for unknown documents", () => {
    const a = getDemoChatAnswer("demo-unknown", "Anything?");
    expect(a).toContain("demo response");
  });

  it("is case-insensitive", () => {
    const a = getDemoChatAnswer("demo-saas", "CAN I CANCEL EARLY?");
    expect(a).toContain("Auto-Renewal");
  });
});
