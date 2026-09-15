"use client";

import { RiskBadge } from "./StatusBadge";

interface ClauseViewerProps {
  sectionNumber?: string;
  title?: string;
  content: string;
  explanation?: string;
  risk?: string;
  potentialImpact?: string;
  evidence?: string;
  alternativeDraft?: string;
}

export function ClauseViewer({
  sectionNumber,
  title,
  content,
  explanation,
  risk,
  potentialImpact,
  evidence,
  alternativeDraft,
}: ClauseViewerProps) {
  return (
    <div className="space-y-6">
      {(sectionNumber || title) && (
        <div>
          {sectionNumber && (
            <p className="text-xs text-text-muted uppercase tracking-wide">
              Section {sectionNumber}
            </p>
          )}
          {title && (
            <h3 className="text-card-title font-semibold text-text-primary mt-1">
              {title}
            </h3>
          )}
        </div>
      )}

      <div>
        <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
          Original Clause
        </h4>
        <div className="legal-text bg-surface-muted p-4 rounded-md border border-border">
          {content}
        </div>
      </div>

      {explanation && (
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Plain-English Explanation
          </h4>
          <p className="text-sm text-text-primary leading-relaxed">{explanation}</p>
        </div>
      )}

      {risk && (
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Risk Level
          </h4>
          <RiskBadge severity={risk.toLowerCase()} />
        </div>
      )}

      {potentialImpact && (
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Why It Matters
          </h4>
          <p className="text-sm text-text-primary leading-relaxed">{potentialImpact}</p>
        </div>
      )}

      {evidence && (
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Evidence
          </h4>
          <div className="legal-text bg-surface-muted p-3 rounded-md text-sm border border-border">
            {evidence}
          </div>
        </div>
      )}

      {alternativeDraft && (
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Suggested Alternative
          </h4>
          <div className="legal-text bg-accent/10 p-4 rounded-md border border-accent/30">
            <p className="text-sm">{alternativeDraft}</p>
            <p className="text-xs text-text-muted mt-2 italic">
              AI-generated drafting suggestion for discussion/review. Not legal advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
