"use client";

import { cn } from "@/lib/utils";
import { LEGAL_DISCLAIMER_TEXT } from "@/lib/legal";

export function LegalDisclaimer({ className }: { className?: string }) {
  return (
    <p role="note" aria-label="Legal disclaimer" className={cn("text-xs text-text-muted leading-relaxed", className)}>
      {LEGAL_DISCLAIMER_TEXT}
    </p>
  );
}
