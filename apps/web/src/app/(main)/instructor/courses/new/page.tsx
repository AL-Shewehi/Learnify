"use client";

import { useRouter } from "next/navigation";
import type { CreateCourseInput } from "@learnify/shared";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseForm, instructorApi } from "@/features/instructor";
import { SectionEyebrow } from "@/components/ui";
import { qk } from "@/lib/query-keys";

export default function NewCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (input: CreateCourseInput) => instructorApi.create(input),
    onSuccess: (course) => {
      toast.success(`"${course.title}" created as draft`);
      queryClient.invalidateQueries({ queryKey: qk.courses({}) });
      router.push(`/instructor/courses/${course._id}/lessons`);
    },
    onError: (err) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't create the course",
      );
    },
  });

  const onSubmit = (input: CreateCourseInput) => create.mutate(input);

  return (
    <div className=" mx-auto max-w-2xl">
      <SectionEyebrow>Instructor workspace · new course</SectionEyebrow>
      <h1 className="mt-2 font-display text-4xl">Start a new course</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Fill in the essentials — you can edit everything later, and add lessons
        on the next step.
      </p>

      <div className="mt-10">
        <CourseForm
          onSubmit={onSubmit}
          isPending={create.isPending}
          submitLabel="Create as draft"
          onCancel={() => router.push("/instructor/courses")}
        />
      </div>
    </div>
  );
}
