"use client";

import { RiskBadge } from "./StatusBadge";
import type { ComparisonChange } from "@/types";

interface ComparisonViewProps {
  changes: ComparisonChange[];
}

const changeTypeLabels: Record<string, string> = {
  added_obligation: "Added Obligation",
  shifted_liability: "Liability Shift",
  omitted_protection: "Removed Protection",
  modified_clause: "Modified Clause",
  unchanged: "Unchanged",
};

const changeTypeColors: Record<string, string> = {
  added_obligation: "border-l-risk-medium",
  shifted_liability: "border-l-risk-high",
  omitted_protection: "border-l-risk-critical",
  modified_clause: "border-l-risk-info",
  unchanged: "border-l-risk-low",
};

export function ComparisonView({ changes }: ComparisonViewProps) {
  return (
    <div className="space-y-4">
      {changes.map((change) => (
        <div
          key={change.id}
          className={`card border-l-4 ${changeTypeColors[change.change_type] || "border-l-border"}`}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                {changeTypeLabels[change.change_type] || change.change_type}
              </span>
              {change.section && (
                <p className="text-xs text-text-muted mt-1">Section: {change.section}</p>
              )}
            </div>
            {change.severity && <RiskBadge severity={change.severity} />}
          </div>

          <p className="text-sm text-text-primary mb-4">{change.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {change.evidence_a && (
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                  Version A
                </h4>
                <div className="legal-text bg-surface-muted p-3 rounded-md text-sm">
                  {change.evidence_a}
                </div>
              </div>
            )}
            {change.evidence_b && (
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                  Version B
                </h4>
                <div className="legal-text bg-accent/10 p-3 rounded-md text-sm border border-accent/30">
                  {change.evidence_b}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
