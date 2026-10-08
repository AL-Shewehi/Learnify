"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateSectionInput,
  UpdateSectionInput,
} from "@learnify/shared";
import { sectionsApi } from "../api/sections-api";
import { qk } from "@/lib/query-keys";

export function useSectionMutations(courseId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.lessons(courseId) });
    queryClient.invalidateQueries({ queryKey: qk.course(courseId) });
  };

  const create = useMutation({
    mutationFn: (input: CreateSectionInput) =>
      sectionsApi.create(courseId, input),
    onSuccess: (section) => {
      invalidate();
      toast.success(`Section "${section.title}" added`);
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't add the section",
      ),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSectionInput }) =>
      sectionsApi.update(id, input),
    onSuccess: (section) => {
      invalidate();
      toast.success(`Section "${section.title}" updated`);
    },
    onError: () => toast.error("Couldn't update the section"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => sectionsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Section deleted — its lessons are now unsectioned");
    },
    onError: () => toast.error("Couldn't delete the section"),
  });

  const reorder = useMutation({
    mutationFn: (sectionIds: string[]) =>
      sectionsApi.reorder(courseId, sectionIds),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Couldn't reorder the sections"),
  });

  return { create, update, remove, reorder };
}
