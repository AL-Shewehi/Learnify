"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user?.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleBadgeColors: Record<string, string> = {
    student: "bg-role-student-bg text-role-student-foreground",
    instructor: "bg-role-instructor-bg text-role-instructor-foreground",
    admin: "bg-role-admin-bg text-role-admin-foreground",
  };
  const roleBadgeColor = roleBadgeColors[user.role];

  const handleLogout = async () => {
    await logout.mutateAsync();
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </div>
        <span className="hidden text-sm font-medium text-foreground md:block">
          {user.name}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg border border-border bg-background py-2 shadow-lg">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColor}`}
            >
              {user.role}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-background"
            >
              <User size={16} />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-background"
            >
              <Settings size={16} />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 rounded-none text-sm text-destructive hover:bg-destructive/5 hover:text-destructive  disabled:opacity-50"
            >
              <LogOut size={16} />
              {logout.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
