"use client";

import { useCourse } from "@/features/courses";
import { useCourseStudents } from "../hooks/use-course-students";
import { EmptyState, SectionEyebrow } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/format";
import type { UserResponse } from "@learnify/shared";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  completed: "bg-blue-100 text-blue-800",
  dropped: "bg-rose-100 text-rose-800",
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function CourseStudents({ courseId }: { courseId: string }) {
  const { data: course } = useCourse(courseId);
  const { data: students, isLoading } = useCourseStudents(courseId);
  const list = students?.enrollments ?? [];
  const stats= students?.stats


  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <SectionEyebrow>Instructor · students</SectionEyebrow>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">
        {course?.title ?? "…"}
      </h1>

      {/* Stats strip */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-5">
        {[
          ["Enrolled", String(students?.result || 0)],
          ["Active", String(stats?.active || 0)],
          ["Completed", String(stats?.completed || 0)],
          ["Dropped", String(stats?.dropped || 0)],
          ["Avg. progress", `${stats?.averageProgress || 0}%`],
        ].map(([label, value]) => (
          <div key={label} className="bg-card px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 font-display text-2xl">{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="mt-10">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            title="No students yet"
            description="Publish the course and share the link — they'll show up here."
          />
        ) : (
          <ol className="divide-y divide-border border-y border-border">
            {list.map((enrollment) => {
              const student = enrollment.student as UserResponse;
              const initials = getInitials(student.name ?? "?");

              return (
                <li key={enrollment._id} className="flex items-center gap-4 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {initials}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {student.email} · enrolled{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </span>

                  {/* Progress bar */}
                  <span className="hidden items-center gap-2 sm:flex">
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </span>
                    <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                      {enrollment.progress}%
                    </span>
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[enrollment.status]}`}
                  >
                    {enrollment.status}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {!isLoading && list.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            {plural(Number(stats?.active), "student")} still working through the material.
          </p>
        )}
      </div>
    </div>
  );
}