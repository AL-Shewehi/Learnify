"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { instructorApi } from "@/features/instructor";

export const useCourseActions = () => {
  const queryClient = useQueryClient();

  const onSuccess = (course: { title: string; status: string }) => {
    queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    toast.success(
      course.status === "published"
        ? `"${course.title}" is now live`
        : `"${course.title}" moved back to draft`,
    );
  };

  const onError = (err: unknown) => {
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Action failed",
    );
  };

  return {
    publish: useMutation({
        mutationFn: instructorApi.publish,
        onSuccess,
        onError
    }),
    unpublish: useMutation({
        mutationFn: instructorApi.unpublish,
        onSuccess,
        onError
    })
  }
};
