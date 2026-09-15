"use client";

import { RiskBadge } from "./StatusBadge";

interface RiskScoreCardProps {
  score: number;
  classification: string;
  factors?: Record<string, number>;
}

function getScoreColor(score: number): string {
  if (score <= 20) return "text-risk-low";
  if (score <= 40) return "text-risk-low";
  if (score <= 60) return "text-risk-medium";
  if (score <= 80) return "text-risk-high";
  return "text-risk-critical";
}

function getScoreRingColor(score: number): string {
  if (score <= 20) return "stroke-risk-low";
  if (score <= 40) return "stroke-risk-low";
  if (score <= 60) return "stroke-risk-medium";
  if (score <= 80) return "stroke-risk-high";
  return "stroke-risk-critical";
}

export function RiskScoreCard({ score, classification, factors }: RiskScoreCardProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card">
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#263241"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={getScoreRingColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <RiskBadge severity={classification.toLowerCase()} />
          <p className="text-sm text-text-secondary mt-2">
            Risk Classification
          </p>
        </div>
      </div>

      {factors && Object.keys(factors).length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-text-primary">Risk Factors</h4>
          {Object.entries(factors).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-text-primary font-medium">{value}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    value > 60
                      ? "bg-risk-high"
                      : value > 40
                      ? "bg-risk-medium"
                      : "bg-risk-low"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
