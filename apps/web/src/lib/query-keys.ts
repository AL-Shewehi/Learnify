import type { GetCoursesQuery, GetReviewsQueryInput } from "@learnify/shared";

export const qk = {
  courses: (filters: Partial<GetCoursesQuery>) => ["courses", filters] as const,
  course: (id: string) => ["course", id] as const,
  lessons: (courseId: string) => ["lessons", courseId] as const,
  myEnrollments: ["my-enrollments"] as const,
  reviews: (courseId: string, params?: Partial<GetReviewsQueryInput>) =>
    ["reviews", courseId, params] as const,
  myReview: (courseId: string) => ["my-review", courseId] as const,
} as const;
