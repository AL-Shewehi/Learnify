"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface CompleteResult {
  progress: number;
  status: string;
}

export function useMarkComplete(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string): Promise<CompleteResult> =>
      api
        .post<{
          status: "success";
          data: CompleteResult;
        }>(`/lessons/${lessonId}/complete`)
        .then((r) => r.data.data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });

      if (result.progress >= 100) {
        toast.success("Course completed — certificate unlocked");
      } else {
        toast.success(`Progress: ${result.progress}%`);
      }
    },
    onError: () => toast.error("Couldn't mark the lesson complete"),
  });
}
