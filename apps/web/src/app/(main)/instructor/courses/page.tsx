"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Users,
  Star,
  Eye,
  Archive,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCourses } from "@/features/instructor";
import { Badge } from "@/components/ui/badge";
import type { CourseStatus } from "@learnify/shared";
import { useCourseActions } from "@/features/instructor";

const STATUS_BADGE: Record<CourseStatus, { label: string; className: string }> =
  {
    published: {
      label: "Published",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    draft: {
      label: "Draft",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    archived: {
      label: "Archived",
      className: "bg-rose-100 text-rose-800 border-rose-200",
    },
  };

export default function MyCoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading } = useMyCourses();
  const { publish, unpublish } = useCourseActions();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Instructor workspace
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">My courses</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage lessons, publish, and track your students.
          </p>
        </div>

        <Button onClick={() => router.push("/instructor/courses/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New course
        </Button>
      </div>

      {/* Content */}
      <div className="mt-10">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (courses?.length ?? 0) === 0 ? (
          <div className="rounded-md border border-dashed border-border py-16 text-center">
            <p className="font-display text-xl">No courses yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your first course is a few clicks away.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/instructor/courses/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first course
            </Button>
          </div>
        ) : (
          <ol className="divide-y divide-border border-y border-border">
            {courses!.map((course, index) => {
              const status = STATUS_BADGE[course.status];
              const statusIcon =
                course.status === "published" ? (
                  <Eye className="h-3 w-3" />
                ) : course.status === "archived" ? (
                  <Archive className="h-3 w-3" />
                ) : (
                  <BookOpen className="h-3 w-3" />
                );

              return (
                <li key={course._id} className="flex items-center gap-4 py-4">
                  <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/instructor/courses/${course._id}/lessons`}
                      className="block"
                    >
                      <p className="truncate font-display text-lg font-semibold transition-colors hover:text-primary">
                        {course.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={`gap-1 ${status.className}`}
                        >
                          {statusIcon}
                          {status.label}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.totalStudents} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {course.rating.toFixed(1)}
                        </span>
                        <span>
                          {course.price === 0
                            ? "Free"
                            : `$${course.price.toLocaleString()}`}
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${course._id}`}>View</Link>
                    </Button>

                    {course.status === "published" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unpublish.mutate(course._id)}
                        disabled={unpublish.isPending}
                      >
                        Unpublish
                      </Button>
                    ) : course.status === "draft" ? (
                      <Button
                        size="sm"
                        onClick={() => publish.mutate(course._id)}
                        disabled={publish.isPending}
                      >
                        Publish
                      </Button>
                    ) : null}

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Edit course"
                      >
                        <Link href={`/instructor/courses/${course._id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Students"
                      >
                        <Link
                          href={`/instructor/courses/${course._id}/students`}
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/instructor/courses/${course._id}/lessons`}
                        >
                          Manage lessons
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
