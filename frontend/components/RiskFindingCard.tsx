"use client";

import { useState } from "react";
import { RiskBadge } from "./StatusBadge";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskFinding } from "@/types";

interface RiskFindingCardProps {
  finding: RiskFinding;
  onAskAI?: (question: string) => void;
}

export function RiskFindingCard({ finding, onAskAI }: RiskFindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card border-l-4 border-l-risk-high">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <RiskBadge severity={finding.severity} />
            <span className="text-xs text-text-muted capitalize">
              {finding.category.replace(/_/g, " ")}
            </span>
          </div>
          <h3 className="text-card-title font-semibold text-text-primary">
            {finding.title}
          </h3>
          {(finding.source_section || finding.source_page) && (
            <p className="text-xs text-text-muted mt-1">
              {finding.source_section && `Section ${finding.source_section}`}
              {finding.source_section && finding.source_page && " · "}
              {finding.source_page && `Page ${finding.source_page}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <p className="text-sm text-text-secondary mt-2">{finding.explanation}</p>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {finding.potential_impact && (
            <div>
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                Potential Impact
              </h4>
              <p className="text-sm text-text-primary">{finding.potential_impact}</p>
            </div>
          )}

          {finding.evidence && (
            <div>
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                Evidence
              </h4>
              <div className="legal-text bg-surface-muted p-3 rounded-md text-sm">
                {finding.evidence}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {onAskAI && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onAskAI(`Tell me more about the risk: ${finding.title}`)
                }
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Ask AI
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
