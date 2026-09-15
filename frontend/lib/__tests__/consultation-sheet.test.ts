import { describe, it, expect } from "vitest";
import { formatConsultationSheet, LEGAL_DISCLAIMER_TEXT } from "@/lib/legal";
import type { ConsultationSheet } from "@/types";

const content: ConsultationSheet["content"] = {
  document_name: "saas.pdf",
  contract_type: "SaaS Agreement",
  user_role: "Customer",
  top_risks: ["Unlimited liability"],
  important_obligations: ["Pay within 30 days"],
  important_deadlines: ["Renewal: Jan 1"],
  ambiguous_clauses: ["Reasonable efforts"],
  questions_for_lawyer: ["Is the cap mutual?"],
  clauses_requiring_review: ["Section 11.2"],
};

describe("LEGAL_DISCLAIMER_TEXT", () => {
  it("states non-advice, no lawyer replacement, no attorney-client relationship", () => {
    expect(LEGAL_DISCLAIMER_TEXT).toContain("does not provide formal legal advice");
    expect(LEGAL_DISCLAIMER_TEXT).toContain("does not replace a qualified legal professional");
    expect(LEGAL_DISCLAIMER_TEXT).toContain("does not create an attorney-client relationship");
  });
});

describe("formatConsultationSheet", () => {
  it("includes every PRD-required section", () => {
    const text = formatConsultationSheet(content);
    for (const section of [
      "TOP RISKS", "IMPORTANT OBLIGATIONS", "IMPORTANT DEADLINES",
      "AMBIGUOUS CLAUSES", "QUESTIONS FOR LAWYER", "CLAUSES REQUIRING REVIEW",
    ]) {
      expect(text).toContain(section);
    }
    expect(text).toContain("Document: saas.pdf");
    expect(text).toContain("User Role: Customer");
    expect(text).toContain("1. Unlimited liability");
  });

  it("always appends the legal disclaimer to the export", () => {
    const text = formatConsultationSheet(content);
    expect(text).toContain("DISCLAIMER");
    expect(text).toContain(LEGAL_DISCLAIMER_TEXT);
  });

  it("prefers a server-provided disclaimer when present", () => {
    const text = formatConsultationSheet({ ...content, disclaimer: "Custom server disclaimer." });
    expect(text).toContain("Custom server disclaimer.");
  });
});
