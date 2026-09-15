import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { getScoreColor, getScoreRingColor } from "@/lib/risk";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("score band boundaries", () => {
  it.each([
    [0, "risk-low"], [20, "risk-low"], [21, "risk-low"], [40, "risk-low"],
    [41, "risk-medium"], [60, "risk-medium"],
    [61, "risk-high"], [80, "risk-high"],
    [81, "risk-critical"], [100, "risk-critical"],
  ])("score %i maps to %s", (score, band) => {
    expect(getScoreColor(score)).toBe(`text-${band}`);
    expect(getScoreRingColor(score)).toBe(`stroke-${band}`);
  });
});
