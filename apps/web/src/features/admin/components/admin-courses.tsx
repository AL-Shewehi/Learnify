"use client";

import { useState } from "react";
import Link from "next/link";
import { useCourses } from "@/features/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui";
import type { CourseResponse, CourseStatus } from "@learnify/shared";
import { useAdminActions } from "../hooks/use-admin";

const STATUS_STYLE: Record<CourseStatus, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  suspended: "bg-rose-100 text-rose-800",
  archived: "bg-rose-100 text-rose-800",
};

const STATUS_FALLBACK = "bg-muted text-muted-foreground";

export function AdminCourses() {
  const { data, isLoading } = useCourses({ limit: 100 });

  const { suspendCourse, activateCourse } = useAdminActions();
  const [pendingCourse, setPendingCourse] =
    useState<CourseResponse | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <ol className="divide-y divide-border border-y border-border">
        {(data?.courses ?? []).map((course: CourseResponse, i: number) => (
          <li key={course._id} className="flex flex-wrap items-center gap-4 py-4">
            <span className="w-8 font-mono text-sm text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="min-w-0 flex-1">
              <Link
                href={`/courses/${course._id}`}
                className="block truncate font-medium hover:text-primary"
              >
                {course.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                {course.instructor.name} · {course.totalStudents} students
              </span>
            </span>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLE[course.status] ?? STATUS_FALLBACK}`}
            >
              {course.status}
            </span>

            {course.status === "archived" ? (
              <Button
                size="sm"
                onClick={() => activateCourse.mutate(course._id)}
                disabled={activateCourse.isPending}
              >
                Activate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-rose-300 text-rose-700"
                onClick={() => setPendingCourse(course)}
                disabled={suspendCourse.isPending}
              >
                Suspend
              </Button>
            )}
          </li>
        ))}
      </ol>

      <ConfirmDialog
        open={pendingCourse !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCourse(null);
        }}
        title={`Suspend "${pendingCourse?.title ?? ""}"?`}
        description="Students will lose access until you reactivate it. The instructor will need to republish after reactivation."
        confirmText={suspendCourse.isPending ? "Suspending…" : "Suspend"}
        isPending={suspendCourse.isPending}
        onConfirm={() => {
          if (!pendingCourse) return;
          suspendCourse.mutate(pendingCourse._id, {
            onSuccess: () => setPendingCourse(null),
          });
        }}
      />
    </>
  );
}
