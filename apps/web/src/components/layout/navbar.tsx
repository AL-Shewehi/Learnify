"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Plus } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/use-logout";

interface NavLinkItem {
  href: string;
  label: string;
  icon?: boolean;
}

const getNavLinks = (role?: string): NavLinkItem[] => {
  const publicLinks: NavLinkItem[] = [
    { href: "/courses", label: "Browse Courses" },
  ];

  if (!role) return publicLinks;

  const studentLinks: NavLinkItem[] = [
    { href: "/my-learning", label: "My Learning" },
    { href: "/courses", label: "Browse Courses" },
  ];

  const instructorLinks: NavLinkItem[] = [
    { href: "/instructor/courses", label: "My Courses" },
    { href: "/instructor/courses/new", label: "Create Course", icon: true },
    { href: "/courses", label: "Browse" },
  ];

  const adminLinks: NavLinkItem[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/courses", label: "Courses" },
  ];

  const linksByRole = {
    student: studentLinks,
    instructor: instructorLinks,
    admin: adminLinks,
  };

  return linksByRole[role as keyof typeof linksByRole] ?? publicLinks;
};

export function Navbar() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = getNavLinks(user?.role);
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <nav className="sticky top-0 z-40 border-b-4 border-double border-border bg-background/95 backdrop-blur">
      {" "}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Logo />

            {/* Desktop nav */}
            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  exact={link.href === "/"}
                >
                  <span className="flex items-center gap-1.5">
                    {link.icon && <Plus size={14} />}
                    {link.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right: Auth actions */}
          <div className="flex items-center gap-3">
            {!isInitialized ? (
              <div
                className="h-9 w-28 animate-pulse rounded-lg bg-muted"
                aria-hidden
              />
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              !isAuthPage && (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="hidden sm:inline-flex"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md text-foreground hover:bg-accent md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {link.icon && <Plus size={14} />}
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await logout.mutateAsync();
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="mt-2 w-full justify-start rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </Button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
