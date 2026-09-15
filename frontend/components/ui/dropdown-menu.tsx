"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const toggle = React.useCallback(() => setOpen(!open), [open, setOpen]);

  // asChild: clone the single child to attach a11y props (avoids nested focus stops)
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: unknown) => void; onKeyDown?: (e: React.KeyboardEvent) => void }>;
    return React.cloneElement(child, {
      "aria-haspopup": "menu",
      "aria-expanded": open,
      onClick: (e: unknown) => {
        child.props.onClick?.(e);
        toggle();
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        child.props.onKeyDown?.(e);
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        } else if (e.key === "Escape") {
          setOpen(false);
        }
      },
    } as Record<string, unknown>);
  }

  return (
    <div
      ref={triggerRef}
      role="button"
      tabIndex={0}
      aria-haspopup="menu"
      aria-expanded={open}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        } else if (e.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    // focus first menuitem on open
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 shadow-md",
        align === "end" ? "right-0" : "left-0",
        "mt-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <button
      role="menuitem"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-surface-muted focus:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent text-text-primary",
        className
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.currentTarget.blur();
          setOpen(false);
        }
      }}
    >
      {children}
    </button>
  );
}
