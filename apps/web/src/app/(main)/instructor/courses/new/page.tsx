"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateCourseInput } from "@learnify/shared";
import { toast } from "sonner";
import { CourseForm, instructorApi } from "@/features/instructor";

export default function NewCoursePage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (input: CreateCourseInput) => {
    setIsPending(true);
    try {
      const course = await instructorApi.create(input);
      toast.success(`"${input.title}" created as draft`);
      router.push(`/instructor/courses/${course._id}/lessons`);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't create the course",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Instructor workspace · new course
      </p>
      <h1 className="mt-2 font-display text-4xl">Start a new course</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Fill in the essentials — you can edit everything later, and add lessons
        on the next step.
      </p>

      <div className="mt-10">
        <CourseForm
          onSubmit={onSubmit}
          isPending={isPending}
          submitLabel="Create as draft"
          onCancel={() => router.push("/instructor/courses")}
        />
      </div>
    </div>
  );
}
