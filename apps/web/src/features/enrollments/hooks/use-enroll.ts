"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { enrollmentsApi } from "../api/enrollments-api";

export function useEnroll(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => enrollmentsApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Enrollment successful");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Something went wrong. Please try again.";

      if (message.includes("already enrolled")) {
        toast.info("You're already enrolled in this course");
        queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      } else {
        toast.error(message);
      }
    },
  });
}
