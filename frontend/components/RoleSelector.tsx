"use client";

import type { UserRole, NegotiationStance } from "@/types";

interface RoleSelectorProps {
  role: UserRole;
  stance: NegotiationStance;
  onRoleChange: (role: UserRole) => void;
  onStanceChange: (stance: NegotiationStance) => void;
  disabled?: boolean;
}

const ROLES: UserRole[] = [
  "Buyer",
  "Supplier",
  "Customer",
  "Service Provider",
  "Tenant",
  "Landlord",
  "Employee",
  "Employer",
  "Contractor",
  "Freelancer",
  "General Party",
];

const STANCES: NegotiationStance[] = ["Aggressive", "Balanced", "Flexible"];

const stanceDescriptions: Record<NegotiationStance, string> = {
  Aggressive: "Prioritize maximum user protection",
  Balanced: "Identify significant risks while considering practical negotiation",
  Flexible: "Prioritize commercially reasonable compromises",
};

export function RoleSelector({
  role,
  stance,
  onRoleChange,
  onStanceChange,
  disabled,
}: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label mb-2 block">Your Role</label>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          disabled={disabled}
          className="input-field"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label mb-2 block">Negotiation Stance</label>
        <div className="grid grid-cols-3 gap-2">
          {STANCES.map((s) => (
            <button
              key={s}
              onClick={() => onStanceChange(s)}
              disabled={disabled}
              className={`p-3 rounded-md text-sm font-medium border transition-colors ${
                stance === s
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-2">
          {stanceDescriptions[stance]}
        </p>
      </div>
    </div>
  );
}
