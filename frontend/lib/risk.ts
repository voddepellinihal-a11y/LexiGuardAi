/** ContractIQ risk band helpers (0-100). Pure: safe to unit-test. */
export function getScoreColor(score: number): string {
  if (score <= 20) return "text-risk-low";
  if (score <= 40) return "text-risk-low";
  if (score <= 60) return "text-risk-medium";
  if (score <= 80) return "text-risk-high";
  return "text-risk-critical";
}

export function getScoreRingColor(score: number): string {
  if (score <= 20) return "stroke-risk-low";
  if (score <= 40) return "stroke-risk-low";
  if (score <= 60) return "stroke-risk-medium";
  if (score <= 80) return "stroke-risk-high";
  return "stroke-risk-critical";
}
