"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses";
import { useMyEnrollments, ProgressBar } from "@/features/enrollments";
import { cn } from "@/lib/utils";
import type { LessonResponse } from "@learnify/shared";
import { useCourseLessons } from "../hooks/use-lessons";
import { useMarkComplete } from "../hooks/use-mark-complete";
import { LessonMedia } from "./lesson-media";
import Link from "next/link";

export function LearningPage({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("lesson");

  const { data: course } = useCourse(courseId);
  const { data: lessonsData, isLoading } = useCourseLessons(courseId);
  const { data: enrollments, isLoading: isEnrollmentsLoading } =
    useMyEnrollments();
  const markComplete = useMarkComplete(courseId);

  const enrollment = useMemo(
    () =>
      enrollments?.find((e) => {
        const c = e.course as { _id?: string };
        return (c._id ?? e.course) === courseId;
      }),
    [enrollments, courseId],
  );

  const lessons = useMemo(
    () => (lessonsData?.lessons ?? []) as LessonResponse[],
    [lessonsData],
  );
  const completed = useMemo(
    () => new Set(enrollment?.completedLessons ?? []),
    [enrollment?.completedLessons],
  );
  const current = useMemo(
    () => lessons.find((l) => l._id === selectedId) ?? lessons[0],
    [lessons, selectedId],
  );

  const currentIndex = useMemo(
    () => lessons.findIndex((l) => l._id === current?._id),
    [lessons, current?._id],
  );
  const next = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const isDone = current ? completed.has(current._id) : false;

  const preview = useMemo(
    () =>
      !enrollment
        ? lessons.find((l) => l._id === selectedId && !l.locked)
        : undefined,
    [enrollment, lessons, selectedId],
  );

  useEffect(() => {
    if (preview) {
      router.replace(`/courses/${courseId}?lesson=${preview._id}`);
    }
  }, [preview, courseId, router]);

  const selectLesson = useCallback(
    (id: string) => router.push(`/my-learning/${courseId}?lesson=${id}`),
    [router, courseId],
  );

  const completeAndContinue = useCallback(() => {
    if (!current) return;
    markComplete.mutate(current._id, {
      onSuccess: () => {
        if (next) selectLesson(next._id);
      },
    });
  }, [current, next, markComplete, selectLesson]);

  if (isLoading || isEnrollmentsLoading) {
    return (
      <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!enrollment) {
    if (preview) {
      return (
        <div className="py-20 text-center font-mono text-xs text-muted-foreground">
          Opening the free preview…
        </div>
      );
    }

    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl">You&apos;re not enrolled here</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Free previews play on the course page — enrollment unlocks everything.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/courses/${courseId}`}>View course page</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Progress header */}
      <div className="mb-8 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Now learning
          </p>
          <h1 className="mt-1 truncate font-display text-2xl sm:text-3xl">
            {course?.title}
          </h1>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-64">
          <ProgressBar value={enrollment.progress} />
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {enrollment.progress}%
          </span>
        </div>
      </div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        {/* ═══ Player ═══ */}
        <div>
          {current ? (
            <>
              <LessonMedia lesson={current} />

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-2xl">{current.title}</h2>
                  {current.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {current.description}
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                  {isDone ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </span>
                  ) : (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={completeAndContinue}
                      disabled={markComplete.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {next ? "Complete & continue" : "Complete course"}
                    </Button>
                  )}

                  {isDone && next && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => selectLesson(next._id)}
                    >
                      Next lesson →
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-border py-16 text-center">
              <p className="font-display text-xl">No lessons yet</p>
            </div>
          )}
        </div>

        {/* ═══ Sidebar ═══ */}
        <aside>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Curriculum · {completed.size}/{lessons.length} done
          </p>
          <ol className="mt-4 divide-y divide-border border-y border-border">
            {lessons.map((lesson, index) => {
              const done = completed.has(lesson._id);
              const active = lesson._id === current?._id;

              return (
                <li key={lesson._id}>
                  <button
                    type="button"
                    onClick={() => selectLesson(lesson._id)}
                    className={cn(
                      "flex w-full min-w-0 items-center gap-3 py-3 text-left text-sm transition-colors",
                      active ? "text-primary" : "hover:text-primary",
                    )}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : active ? (
                      <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 break-words",
                        active && "font-semibold",
                      )}
                    >
                      {lesson.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {lesson.duration}m
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </>
  );
}
