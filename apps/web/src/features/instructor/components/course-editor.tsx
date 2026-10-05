"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCourse } from "@/features/courses";
import { instructorApi } from "../api/instructor-api";
import { CourseForm } from "./course-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateCourseInput } from "@learnify/shared";

export function CourseEditor({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { data: course, isLoading, isError } = useCourse(courseId);
  const [isPending, setIsPending] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 container mx-auto max-w-2xl px-4 py-10 sm:py-14 ">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="rounded-md border border-border py-16 text-center">
        <p className="font-display text-xl">Couldn&apos;t load this course</p>
        <p className="mt-2 text-sm text-muted-foreground">
          It may not exist, or you don&apos;t have permission to edit it.
        </p>
      </div>
    );
  }

  const onSubmit = async (input: CreateCourseInput) => {
    setIsPending(true);
    try {
      await instructorApi.update(courseId, input);
      toast.success("Course updated");
      router.push("/instructor/courses");
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't update the course",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Instructor workspace · edit course
      </p>
      <h1 className="mt-2 font-display text-4xl">Edit course</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Changes apply immediately — drafts and published courses alike.
      </p>

      <div className="mt-10">
        <CourseForm
          initial={course}
          onSubmit={onSubmit}
          isPending={isPending}
          submitLabel="Save changes"
          onCancel={() => router.push("/instructor/courses")}
        />
      </div>
    </div>
  );
}
