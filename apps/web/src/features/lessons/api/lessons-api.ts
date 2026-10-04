import { api } from "@/lib/api";
import {
  CourseLessonsResponse,
  CreateLessonInput,
  LessonResponse,
  UpdateLessonInput,
} from "@learnify/shared";

export const lessonsApi = {
  listForCourse: (courseId: string): Promise<CourseLessonsResponse> =>
    api
      .get<{
        status: "success";
        data: CourseLessonsResponse;
      }>(`/courses/${courseId}/lessons`)
      .then((r) => r.data.data),
  create: (
    courseId: string,
    input: CreateLessonInput,
  ): Promise<LessonResponse> =>
    api
      .post<{
        status: "success";
        data: { lesson: LessonResponse };
      }>(`/courses/${courseId}/lessons`, input)
      .then((r) => r.data.data.lesson),
  update: (
    lessonId: string,
    input: UpdateLessonInput,
  ): Promise<LessonResponse> =>
    api
      .patch<{
        status: "success";
        data: { lesson: LessonResponse };
      }>(`/lessons/${lessonId}`, input)
      .then((r) => r.data.data.lesson),
    remove: (lessonId: string): Promise<void> =>
      api
        .delete<{ status: "success" }>(`/lessons/${lessonId}`)
        .then(() => undefined),
    reorder: (courseId: string, lessonIds: string[]): Promise<LessonResponse[]> =>
      api
        .patch<{
          status: "success";
          data: { lessons: LessonResponse[] };
        }>(`/courses/${courseId}/lessons/reorder`, { lessonIds })
        .then((r) => r.data.data.lessons),
};