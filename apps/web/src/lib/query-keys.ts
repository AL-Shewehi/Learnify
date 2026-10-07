import type { GetCoursesQuery } from "@learnify/shared";

export const qk = {
  courses: (filters: Partial<GetCoursesQuery>) => ["courses", filters] as const,
  course: (id: string) => ["course", id] as const,
  lessons: (courseId: string) => ["lessons", courseId] as const,
  myEnrollments: ["my-enrollments"] as const,
} as const;
