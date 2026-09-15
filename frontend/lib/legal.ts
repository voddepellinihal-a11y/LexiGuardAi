import type { ConsultationSheet } from "@/types";

/** Canonical non-advice disclaimer. Pure: safe to unit-test. */
export const LEGAL_DISCLAIMER_TEXT =
  "This platform provides legal information and document analysis for assistance " +
  "and educational purposes. It does not provide formal legal advice, does not " +
  "replace a qualified legal professional, and does not create an attorney-client relationship.";

type SheetContent = ConsultationSheet["content"];

/** Render a consultation sheet as plain text for copy/download export. Pure. */
export function formatConsultationSheet(content: SheetContent): string {
  const section = (title: string, items: string[]): string => {
    let text = `\n${title}\n`;
    items.forEach((item, i) => {
      text += `${i + 1}. ${item}\n`;
    });
    return text;
  };

  let text = `LEGAL CONSULTATION PREP SHEET\n\n`;
  text += `Document: ${content.document_name}\n`;
  text += `Contract Type: ${content.contract_type || "Not specified"}\n`;
  text += `User Role: ${content.user_role}\n`;
  text += section("TOP RISKS", content.top_risks);
  text += section("IMPORTANT OBLIGATIONS", content.important_obligations);
  text += section("IMPORTANT DEADLINES", content.important_deadlines);
  text += section("AMBIGUOUS CLAUSES", content.ambiguous_clauses);
  text += section("QUESTIONS FOR LAWYER", content.questions_for_lawyer);
  text += section("CLAUSES REQUIRING REVIEW", content.clauses_requiring_review);
  text += `\nDISCLAIMER\n${content.disclaimer || LEGAL_DISCLAIMER_TEXT}\n`;

  return text;
}
