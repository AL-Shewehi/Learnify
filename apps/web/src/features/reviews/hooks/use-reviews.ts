"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import type {
  CreateReviewInput,
  GetReviewsQueryInput,
  UpdateReviewInput,
} from "@learnify/shared";
import { reviewsApi } from "../api/reviews-api";

export function useReviews(
  courseId: string,
  params?: Partial<GetReviewsQueryInput>,
) {
  return useQuery({
    queryKey: qk.reviews(courseId, params),
    queryFn: () => reviewsApi.list(courseId, params),
  });
}

// A 404 here just means "no review yet" — don't retry it.
export function useMyReview(courseId: string, enabled = true) {
  return useQuery({
    queryKey: qk.myReview(courseId),
    queryFn: () => reviewsApi.myReview(courseId),
    enabled,
    retry: false,
  });
}

export function useReviewMutations(courseId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.reviews(courseId) });
    queryClient.invalidateQueries({ queryKey: qk.myReview(courseId) });
    queryClient.invalidateQueries({ queryKey: qk.course(courseId) });
  };

  const create = useMutation({
    mutationFn: (input: CreateReviewInput) =>
      reviewsApi.create(courseId, input),
    onSuccess: () => {
      invalidate();
      toast.success("Review published");
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't publish the review",
      );
    },
  });

  const update = useMutation({
    mutationFn: ({
      reviewId,
      input,
    }: {
      reviewId: string;
      input: UpdateReviewInput;
    }) => reviewsApi.update(reviewId, input),
    onSuccess: () => {
      invalidate();
      toast.success("Review updated");
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't update the review",
      );
    },
  });

  const remove = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.remove(reviewId),
    onSuccess: () => {
      invalidate();
      toast.success("Review deleted");
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Couldn't delete the review",
      );
    },
  });

  return { create, update, remove };
}
