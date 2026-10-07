"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCourse } from "@/features/courses";
import { instructorApi } from "../api/instructor-api";
import { CourseForm } from "./course-form";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, SectionEyebrow } from "@/components/ui";
import { qk } from "@/lib/query-keys";
import type { CreateCourseInput } from "@learnify/shared";

export function CourseEditor({ courseId }: { courseId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: course, isLoading, isError } = useCourse(courseId);
  const update = useMutation({
    mutationFn: (input: CreateCourseInput) =>
      instructorApi.update(courseId, input),
    onSuccess: () => {
      toast.success("Course updated");
      queryClient.invalidateQueries({ queryKey: qk.course(courseId) });
      queryClient.invalidateQueries({ queryKey: qk.courses({}) });
      router.push("/instructor/courses");
    },
    onError: (err) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't update the course",
      );
    },
  });

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
      <EmptyState
        title="Couldn't load this course"
        description="It may not exist, or you don't have permission to edit it."
      />
    );
  }

  const onSubmit = (input: CreateCourseInput) => update.mutate(input);

  return (
    <div className="container mx-auto max-w-2xl">
      <SectionEyebrow>Instructor workspace · edit course</SectionEyebrow>
      <h1 className="mt-2 font-display text-4xl">Edit course</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Changes apply immediately — drafts and published courses alike.
      </p>

      <div className="mt-10">
        <CourseForm
          initial={course}
          onSubmit={onSubmit}
          isPending={update.isPending}
          submitLabel="Save changes"
          onCancel={() => router.push("/instructor/courses")}
        />
      </div>
    </div>
  );
}
