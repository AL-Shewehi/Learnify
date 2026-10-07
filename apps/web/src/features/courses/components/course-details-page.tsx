"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { useCourse } from "../hooks/use-course";
import { CourseHero } from "./course-hero";
import { CourseTabs } from "./course-tabs";
import { useCourseLessons } from "@/features/lessons";
import type { LessonResponse } from "@learnify/shared";
import { toast } from "sonner";

export function CourseDetailsPage({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLessonId = searchParams.get("lesson");

  const { data: course, isLoading, isError, error } = useCourse(courseId);
  const { data: lessonsData } = useCourseLessons(courseId);

  const lessons = lessonsData?.lessons ?? [];
  const selected = lessons.find((l) => l._id === selectedLessonId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="aspect-16/10 animate-pulse rounded-md bg-muted" />
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-12 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    const isNotFound =
      (error as { response?: { status?: number } })?.response?.status === 404;

    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {isNotFound ? "Not found" : "Something went wrong"}
        </p>
        <h1 className="mt-3 font-display text-3xl">
          {isNotFound
            ? "This course doesn't exist"
            : "Couldn't load this course"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isNotFound
            ? "It may have been removed, or the URL is wrong."
            : "Please try again in a moment."}
        </p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => router.push("/courses")}
        >
          Back to the catalog
        </Button>
      </div>
    );
  }

  const previewLesson =
    selected && !selected.locked && !course.isEnrolled ? selected : undefined;

  const handleSelect = (lesson: LessonResponse) => {
    if (course.isEnrolled) {
      router.push(`/my-learning/${courseId}?lesson=${lesson._id}`);
      return;
    }
    if (lesson.locked) {
      toast.info("This lesson unlocks with enrollment");
      return;
    }
    router.push(`/courses/${courseId}?lesson=${lesson._id}`);
  };

  return (
    <>
      <CourseHero course={course} previewLesson={previewLesson} />
      <CourseTabs course={course} onSelect={handleSelect} />
    </>
  );
}
