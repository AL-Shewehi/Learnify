import { api } from "@/lib/api";
import type {
  CourseResponse,
  GetCoursesQuery,
  PaginatedSuccess,
} from "@learnify/shared";

export interface CoursesPage {
  courses: CourseResponse[];
  pagination: { total: number; page: number; limit: number; pages: number };
}
export const coursesApi = {
  list: (params?: Partial<GetCoursesQuery>): Promise<CoursesPage> =>
    api
      .get<
        PaginatedSuccess<{ courses: CourseResponse[] }>
      >("/courses", { params })
      .then((r) => ({
        courses: r.data.data.courses,
        pagination: r.data.pagination,
      })),
};
