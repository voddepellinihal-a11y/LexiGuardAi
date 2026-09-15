import { describe, expect, it } from "vitest";
import { getScoreColor, getScoreRingColor } from "@/lib/risk";

describe("risk score bands", () => {
  it.each([
    [0, "text-risk-low"],
    [20, "text-risk-low"],
    [21, "text-risk-low"],
    [41, "text-risk-medium"],
    [60, "text-risk-medium"],
    [61, "text-risk-high"],
    [80, "text-risk-high"],
    [81, "text-risk-critical"],
    [100, "text-risk-critical"],
  ])("score %i maps to %s", (score, expected) => {
    expect(getScoreColor(score)).toBe(expected);
  });

  it("ring color tracks the same bands", () => {
    expect(getScoreRingColor(10)).toBe("stroke-risk-low");
    expect(getScoreRingColor(50)).toBe("stroke-risk-medium");
    expect(getScoreRingColor(70)).toBe("stroke-risk-high");
    expect(getScoreRingColor(95)).toBe("stroke-risk-critical");
  });
});
