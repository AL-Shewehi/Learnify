"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Check, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses";
import { useMyEnrollments, ProgressBar } from "@/features/enrollments";
import { cn } from "@/lib/utils";
import { getEmbedInfo } from "@/lib/video";
import type { LessonResponse } from "@learnify/shared";
import { useCourseLessons } from "../hooks/use-lessons";
import { useMarkComplete } from "../hooks/use-mark-complete";
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

  const enrollment = enrollments?.find((e) => {
    const c = e.course as { _id?: string };
    return (c._id ?? e.course) === courseId;
  });

  const lessons = (lessonsData?.lessons ?? []) as LessonResponse[];
  const completed = new Set(enrollment?.completedLessons ?? []);
  const current = lessons.find((l) => l._id === selectedId) ?? lessons[0];

  const currentIndex = lessons.findIndex((l) => l._id === current?._id);
  const next = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const isDone = current ? completed.has(current._id) : false;

  const selectLesson = (id: string) =>
    router.push(`/my-learning/${courseId}?lesson=${id}`);

  const completeAndContinue = () => {
    if (!current) return;
    markComplete.mutate(current._id, {
      onSuccess: () => {
        if (next) selectLesson(next._id);
      },
    });
  };

  if (isLoading || isEnrollmentsLoading) {
    return (
      <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-display text-2xl">You&apos;re not enrolled here</p>
        <Button asChild className="mt-6">
          <Link href={`/courses/${courseId}`}>View course page</Link>
        </Button>
      </div>
    );
  }

  const embed =
    current?.type === "video" ? getEmbedInfo(current.videoUrl) : null;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
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

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* ═══ Player ═══ */}
        <div>
          {current ? (
            <>
              {current.type === "video" && embed ? (
                embed.kind === "iframe" ? (
                  <div className="aspect-video overflow-hidden rounded-md border border-border">
                    <iframe
                      src={embed.src}
                      title={current.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={embed.src}
                    controls
                    className="aspect-video w-full rounded-md border border-border bg-black"
                  />
                )
              ) : current.type === "article" ? (
                <article className="whitespace-pre-line rounded-md border border-border bg-card p-6 leading-7">
                  {current.articleBody}
                </article>
              ) : (
                <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                  This lesson has no playable content yet.
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl">{current.title}</h2>
                  {current.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {current.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isDone ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </span>
                  ) : (
                    <Button
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
                    onClick={() => selectLesson(lesson._id)}
                    className={cn(
                      "flex w-full items-center gap-3 py-3 text-left text-sm transition-colors",
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
                        "min-w-0 flex-1 truncate",
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
    </div>
  );
}
