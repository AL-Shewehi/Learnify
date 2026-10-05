"use client";

import Link from "next/link";
import { useCourses } from "@/features/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { CourseResponse } from "@learnify/shared";
import { useAdminActions } from "../hooks/use-admin";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  suspended: "bg-rose-100 text-rose-800",
  archived: "bg-muted text-muted-foreground",
};

export function AdminCourses() {
  const { data, isLoading } = useCourses({ limit: 100 });

  const { suspendCourse, activateCourse } = useAdminActions();

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
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLE[course.status]}`}
          >
            {course.status}
          </span>

          {course.status === "suspended" ? (
            <Button
              size="sm"
              onClick={() => activateCourse.mutate(course._id)}
              disabled={activateCourse.isPending}
            >
              Activate
            </Button>
          ) : course.status !== "archived" ? (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-300 text-rose-700"
              onClick={() => suspendCourse.mutate(course._id)}
              disabled={suspendCourse.isPending}
            >
              Suspend
            </Button>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
