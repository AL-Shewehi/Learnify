"use client";

import Link from "next/link";
import { CourseCard, CourseCardSkeleton, useCourses } from "@/features/courses";

export function FeaturedCoursesSection() {
  const { data, isLoading } = useCourses({ limit: 6, sort: "-createdAt" });

  return (
    <section className="border-b border-border">
      <div>
        {/* Header بالـ editorial style */}
        <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              01 — New this week
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              Fresh in the catalog
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-sm font-medium underline underline-offset-[6px] hover:text-primary"
          >
            View the full catalog
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))
            : (data?.courses ?? []).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
        </div>

        {!isLoading && (data?.courses.length ?? 0) === 0 && (
          <div className="rounded-md border border-border py-16 text-center">
            <p className="font-display text-xl">No courses yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first instructor to publish a course.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
