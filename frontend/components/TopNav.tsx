"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-surface-muted flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-primary">LexiGuard AI</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={signOut} className="text-risk-high">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
