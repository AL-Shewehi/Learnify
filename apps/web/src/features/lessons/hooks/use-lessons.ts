"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateLessonInput, UpdateLessonInput } from "@learnify/shared";
import { lessonsApi } from "../api/lessons-api";
import { qk } from "@/lib/query-keys";

export function useCourseLessons(courseId: string) {
  return useQuery({
    queryKey: qk.lessons(courseId),
    queryFn: () => lessonsApi.listForCourse(courseId),
  });
}

export function useLessonMutations(courseId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.lessons(courseId) });
    queryClient.invalidateQueries({ queryKey: qk.course(courseId) });
  };

  const create = useMutation({
    mutationFn: (input: CreateLessonInput) => lessonsApi.create(courseId, input),
    onSuccess: (lesson) => {
      invalidate();
      toast.success(`Lesson "${lesson.title}" added`);
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't add the lesson",
      ),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLessonInput }) =>
      lessonsApi.update(id, input),
    onSuccess: (lesson) => {
      invalidate();
      toast.success(`Lesson "${lesson.title}" updated`);
    },
    onError: () => toast.error("Couldn't update the lesson"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => lessonsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Lesson deleted");
    },
    onError: () => toast.error("Couldn't delete the lesson"),
  });

  const reorder = useMutation({
    mutationFn: (lessonIds: string[]) => lessonsApi.reorder(courseId, lessonIds),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Couldn't reorder the lessons"),
  });

  return { create, update, remove, reorder };
}
