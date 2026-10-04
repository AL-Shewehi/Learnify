import { api } from "@/lib/api";
import type {
  CourseResponse,
  CreateCourseInput,
  CourseStudentsResponse,
  PaginatedSuccess,
  UpdateCourseInput,
} from "@learnify/shared";

export const instructorApi = {
  myCourses: (): Promise<CourseResponse[]> =>
    api
      .get<PaginatedSuccess<{ courses: CourseResponse[] }>>("/courses", {
        params: { mine: true, limit: 100 },
      })
      .then((r) => r.data.data.courses),
  create: (input: CreateCourseInput): Promise<CourseResponse> =>
    api
      .post<{
        status: "success";
        data: { course: CourseResponse };
      }>("/courses", input)
      .then((r) => r.data.data.course),
  publish: (id: string): Promise<CourseResponse> =>
    api
      .patch<{
        status: "success";
        data: { course: CourseResponse };
      }>(`/courses/${id}/publish`)
      .then((r) => r.data.data.course),

  unpublish: (id: string): Promise<CourseResponse> =>
    api
      .patch<{
        status: "success";
        data: { course: CourseResponse };
      }>(`/courses/${id}/unpublish`)
      .then((r) => r.data.data.course),
  update: (id: string, input: UpdateCourseInput): Promise<CourseResponse> =>
    api
      .patch<{
        status: "success";
        data: { course: CourseResponse };
      }>(`/courses/${id}`, input)
      .then((r) => r.data.data.course),

  students: (courseId: string): Promise<CourseStudentsResponse> =>
  api
    .get<{
      status: "success";
      results: number;
      stats: CourseStudentsResponse["stats"];
      data: { enrollments: CourseStudentsResponse["enrollments"] };
    }>(
      `/courses/${courseId}/enrollments`,
    )
    .then((r) => ({
      enrollments: r.data.data.enrollments,
      stats: r.data.stats,
      result: r.data.results,
    })),
};
