import { api } from "@/lib/api";
import type {
  CreateReviewInput,
  GetReviewsQueryInput,
  PaginatedSuccess,
  ReviewResponse,
  UpdateReviewInput,
} from "@learnify/shared";

export interface ReviewsPage {
  reviews: ReviewResponse[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  averageRating: number;
  ratingsCount: number;
}

export const reviewsApi = {
  list: (
    courseId: string,
    params?: Partial<GetReviewsQueryInput>,
  ): Promise<ReviewsPage> =>
    api
      .get<
        PaginatedSuccess<{
          reviews: ReviewResponse[];
          averageRating: number;
          ratingsCount: number;
        }>
      >(`/courses/${courseId}/reviews`, { params })
      .then((r) => ({
        reviews: r.data.data.reviews,
        pagination: r.data.pagination,
        averageRating: r.data.data.averageRating,
        ratingsCount: r.data.data.ratingsCount,
      })),

  myReview: (courseId: string): Promise<ReviewResponse> =>
    api
      .get<{
        status: "success";
        data: { review: ReviewResponse };
      }>(`/courses/${courseId}/my-review`)
      .then((r) => r.data.data.review),

  create: (courseId: string, input: CreateReviewInput) =>
    api
      .post<{ status: "success"; data: { review: ReviewResponse } }>(
        `/courses/${courseId}/reviews`,
        input,
      )
      .then((r) => r.data.data.review),

  update: (reviewId: string, input: UpdateReviewInput) =>
    api
      .patch<{ status: "success"; data: { review: ReviewResponse } }>(
        `/reviews/${reviewId}`,
        input,
      )
      .then((r) => r.data.data.review),

  remove: (reviewId: string) =>
    api
      .delete<{ status: "success"; message: string }>(`/reviews/${reviewId}`)
      .then((r) => r.data),
};
