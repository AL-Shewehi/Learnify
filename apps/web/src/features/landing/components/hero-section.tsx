"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCourses } from "@/features/courses";
import { paletteFor } from "@/features/courses/components/course-cover";

export function HeroSection() {
  const { session, isLoading } = useAuth();
  const { data } = useCourses({ limit: 3, sort: "-createdAt" });

  return (
    <section className="border-b border-border">
      <div >
        <div className="grid gap-12 pb-16 sm:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          {/* ═══ اليسار: الكلام ═══ */}
          <div className="flex flex-col justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Learnify · an online school · est. 2026
            </p>

            <h1 className="mt-7 font-display text-5xl leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Courses worth
              <br />
              your evenings.
            </h1>

            <p className="mt-7 max-w-md text-[15px] leading-7 text-muted-foreground">
              Syllabi built by people who do this work for a living. No filler
              lectures, no forty-hour introductions — the skills, in the order
              they actually build on each other.
            </p>

            <div className="mt-11 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/courses">
                  Browse the catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {!isLoading && !session && (
                <Link
                  href="/signup"
                  className="text-sm font-medium underline underline-offset-[6px] transition-colors hover:text-primary"
                >
                  Create a free account
                </Link>
              )}
            </div>
          </div>
          <aside className="flex flex-col justify-center">
            <div className="border border-border bg-card p-6 shadow-[6px_6px_0_0_var(--color-border)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                The catalog, right now
              </p>

              <p className="mt-5 font-display text-7xl leading-none">
                {data?.pagination.total ?? 0}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                courses live on the platform
              </p>

              <ul className="mt-6 divide-y divide-border border-t border-border">
                {(data?.courses ?? []).map((c) => {
                  const p = paletteFor(c.subject ?? c.title);
                  return (
                    <li key={c._id} className="flex items-center gap-3 py-3">
                      <span
                        className="h-9 w-6 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: p.bg }}
                      />
                      <span className="line-clamp-1 text-sm">{c.title}</span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-5 text-xs leading-5 text-muted-foreground">
                Live numbers, straight from the database — no rounded marketing
                figures.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
