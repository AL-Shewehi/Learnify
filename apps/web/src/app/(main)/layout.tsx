import type { ReactNode } from "react";
import { Navbar } from "@/components/layout";

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          {children}
        </div>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Learnify. All rights reserved.
      </footer>
    </div>
  );
}