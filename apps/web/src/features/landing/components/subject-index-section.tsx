"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Camera,
  Code2,
  Heart,
  Megaphone,
  Music,
  Palette,
  PenTool,
  User,
} from "lucide-react";
import { COURSE_SUBJECTS, type CourseSubject } from "@learnify/shared";
import { useCourses } from "@/features/courses";

const SUBJECT_VISUALS: Record<
  CourseSubject,
  { icon: LucideIcon; iconClass: string; surfaceClass: string }
> = {
  Programming: {
    icon: Code2,
    iconClass: "text-primary",
    surfaceClass: "bg-secondary",
  },
  Design: {
    icon: Palette,
    iconClass: "text-amber-700",
    surfaceClass: "bg-amber-100",
  },
  Data: {
    icon: BarChart3,
    iconClass: "text-sky-700",
    surfaceClass: "bg-sky-100",
  },
  Business: {
    icon: Briefcase,
    iconClass: "text-emerald-700",
    surfaceClass: "bg-emerald-100",
  },
  Writing: {
    icon: PenTool,
    iconClass: "text-lime-700",
    surfaceClass: "bg-lime-100",
  },
  Marketing: {
    icon: Megaphone,
    iconClass: "text-violet-700",
    surfaceClass: "bg-violet-100",
  },
  Photography: {
    icon: Camera,
    iconClass: "text-rose-700",
    surfaceClass: "bg-rose-100",
  },
    Music: {
    icon: Music,
    iconClass: "text-fuchsia-700",
    surfaceClass: "bg-fuchsia-100",
  },
  Health: {
    icon: Heart,
    iconClass: "text-red-700",
    surfaceClass: "bg-red-100",
  },
  "Personal Development": {
    icon: User,
    iconClass: "text-indigo-700",
    surfaceClass: "bg-indigo-100",
  },
  Education: {
    icon: BookOpen,
    iconClass: "text-teal-700",
    surfaceClass: "bg-teal-100",
  },
};



export function SubjectIndexSection() {
  const { data } = useCourses({ limit: 100 });

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of data?.courses ?? []) {
      const key = c.subject || "General";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [data]);

  const subjects = COURSE_SUBJECTS.filter((s) => (counts.get(s) ?? 0) > 0);

  if (subjects.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Table of contents
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">
          Browse by subject
        </h2>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const visual = SUBJECT_VISUALS[subject];
            const Icon = visual.icon;
            const count = counts.get(subject) ?? 0;

            return (
              <li key={subject}>
                <Link
                  href={`/courses?subject=${encodeURIComponent(subject)}`}
                  className="group flex min-h-32 items-end justify-between rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[4px_4px_0_0_var(--color-primary)]"
                >
                  <span className="flex flex-col gap-5">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${visual.surfaceClass}`}
                    >
                      <Icon className={`h-5 w-5 ${visual.iconClass}`} />
                    </span>
                    <span className="text-base font-semibold transition-colors group-hover:text-primary">
                      {subject}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(count).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
