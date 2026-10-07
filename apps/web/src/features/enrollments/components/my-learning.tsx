"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionEyebrow } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCover } from "@/features/courses";
import type { CourseResponse } from "@learnify/shared";
import { useMyEnrollments } from "../hooks/use-my-enrollments";
import { ProgressBar } from "./progress-bar";

const STATUS_LABEL: Record<string, string> = {
  active: "In progress",
  completed: "Completed",
  dropped: "Dropped",
};

export function MyLearning() {
  const { data: enrollments, isLoading } = useMyEnrollments();

  return (
    <div className="mx-auto max-w-4xl">
      <SectionEyebrow>Your shelf</SectionEyebrow>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">My learning</h1>

      <div className="mt-10">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (enrollments?.length ?? 0) === 0 ? (
          <EmptyState
            title="Your shelf is empty"
            description="Enroll in a course and it'll live here — progress and all."
            action={
              <Button asChild>
                <Link href="/courses">
                  Browse the catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />
        ) : (
          <ol className="space-y-4">
            {enrollments!.map((enrollment) => {
              const course = enrollment.course as CourseResponse;
              return (
                <li key={enrollment._id}>
                  <Link
                    href={`/my-learning/${course._id}`}
                    className="flex min-w-0 gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/50 sm:gap-4 sm:p-4"
                  >
                    <span className="h-20 w-32 shrink-0 overflow-hidden rounded relative">
                      <CourseCover course={course} />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col justify-between py-1">
                      <span>
                        <span className="block break-words font-display text-lg font-semibold">
                          {course.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {STATUS_LABEL[enrollment.status]} ·{" "}
                          {enrollment.completedLessons.length} lessons done
                        </span>
                      </span>

                      <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <ProgressBar
                          value={enrollment.progress}
                          className="flex-1"
                        />
                        <span className="w-9 shrink-0 text-right font-mono text-xs text-muted-foreground sm:w-10">
                          {enrollment.progress}%
                        </span>
                      </span>
                    </span>

                    <span className="hidden shrink-0 items-center sm:flex">
                      <span className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm font-medium">
                        {enrollment.status === "completed"
                          ? "Review"
                          : "Continue"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}