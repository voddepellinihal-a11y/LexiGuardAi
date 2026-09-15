"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  GitCompare,
  MessageSquare,
  FileCheck,
  Settings,
  Scale,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "AI Assistant", href: "/documents", icon: MessageSquare },
  { name: "Consultation", href: "/documents", icon: FileCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-surface-muted">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Scale className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-primary">LexiGuard AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "/documents" || pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary/15 text-primary"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-text-muted leading-relaxed">
          This platform provides legal information for assistance purposes only. It does not provide formal legal advice.
        </p>
      </div>
    </aside>
  );
}
