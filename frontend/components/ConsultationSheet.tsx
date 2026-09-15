"use client";

import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConsultationSheet as ConsultationSheetType } from "@/types";

interface ConsultationSheetProps {
  sheet: ConsultationSheetType;
}

export function ConsultationSheet({ sheet }: ConsultationSheetProps) {
  const [copied, setCopied] = useState(false);
  const content = sheet.content;

  const formatSheet = (): string => {
    let text = `LEGAL CONSULTATION PREP SHEET\n\n`;
    text += `Document: ${content.document_name}\n`;
    text += `Contract Type: ${content.contract_type || "Not specified"}\n`;
    text += `User Role: ${content.user_role}\n\n`;

    text += `TOP RISKS\n`;
    content.top_risks.forEach((risk, i) => {
      text += `${i + 1}. ${risk}\n`;
    });

    text += `\nIMPORTANT OBLIGATIONS\n`;
    content.important_obligations.forEach((obl, i) => {
      text += `${i + 1}. ${obl}\n`;
    });

    text += `\nIMPORTANT DEADLINES\n`;
    content.important_deadlines.forEach((dl, i) => {
      text += `${i + 1}. ${dl}\n`;
    });

    text += `\nAMBIGUOUS CLAUSES\n`;
    content.ambiguous_clauses.forEach((ac, i) => {
      text += `${i + 1}. ${ac}\n`;
    });

    text += `\nQUESTIONS FOR LAWYER\n`;
    content.questions_for_lawyer.forEach((q, i) => {
      text += `${i + 1}. ${q}\n`;
    });

    text += `\nCLAUSES REQUIRING REVIEW\n`;
    content.clauses_requiring_review.forEach((cr, i) => {
      text += `${i + 1}. ${cr}\n`;
    });

    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatSheet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSheet = () => {
    const blob = new Blob([formatSheet()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultation-sheet-${content.document_name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-section-title font-semibold text-primary">
          Legal Consultation Prep Sheet
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSheet}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Document:</span>{" "}
            <span className="font-medium text-text-primary">{content.document_name}</span>
          </div>
          <div>
            <span className="text-text-muted">Type:</span>{" "}
            <span className="font-medium text-text-primary">{content.contract_type || "N/A"}</span>
          </div>
          <div>
            <span className="text-text-muted">Role:</span>{" "}
            <span className="font-medium text-text-primary">{content.user_role}</span>
          </div>
        </div>

        <Section title="Top Risks" items={content.top_risks} color="risk-high" />
        <Section title="Important Obligations" items={content.important_obligations} color="risk-medium" />
        <Section title="Important Deadlines" items={content.important_deadlines} color="risk-info" />
        <Section title="Ambiguous Clauses" items={content.ambiguous_clauses} color="risk-medium" />
        <Section title="Questions for Lawyer" items={content.questions_for_lawyer} color="primary" />
        <Section title="Clauses Requiring Review" items={content.clauses_requiring_review} color="risk-high" />
      </div>
    </div>
  );
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className={`text-sm font-semibold text-${color} uppercase tracking-wide mb-2`}>
        {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-text-primary flex gap-2">
            <span className="text-text-muted font-medium">{i + 1}.</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
