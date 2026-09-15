import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  uploaded: "bg-risk-info/15 text-risk-info",
  processing: "bg-risk-medium/15 text-risk-medium",
  ready: "bg-risk-low/15 text-risk-low",
  failed: "bg-risk-high/15 text-risk-high",
  pending: "bg-risk-info/15 text-risk-info",
  completed: "bg-risk-low/15 text-risk-low",
  active: "bg-risk-low/15 text-risk-low",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status] || "bg-surface-muted text-text-secondary",
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface RiskBadgeProps {
  severity: string;
  className?: string;
}

const severityStyles: Record<string, string> = {
  critical: "bg-risk-critical/15 text-risk-critical",
  high: "bg-risk-high/15 text-risk-high",
  medium: "bg-risk-medium/15 text-risk-medium",
  low: "bg-risk-low/15 text-risk-low",
  info: "bg-risk-info/15 text-risk-info",
};

export function RiskBadge({ severity, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
        severityStyles[severity] || "bg-surface-muted text-text-secondary",
        className
      )}
    >
      {severity}
    </span>
  );
}
