import { api } from "@/lib/api";
import type {
  CreateSectionInput,
  SectionResponse,
  UpdateSectionInput,
} from "@learnify/shared";

export const sectionsApi = {
  create: (
    courseId: string,
    input: CreateSectionInput,
  ): Promise<SectionResponse> =>
    api
      .post<{
        status: "success";
        data: { section: SectionResponse };
      }>(`/courses/${courseId}/sections`, input)
      .then((r) => r.data.data.section),

  update: (
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<SectionResponse> =>
    api
      .patch<{
        status: "success";
        data: { section: SectionResponse };
      }>(`/sections/${sectionId}`, input)
      .then((r) => r.data.data.section),

  remove: (sectionId: string): Promise<string> =>
    api
      .delete<{ status: "success"; message: string }>(`/sections/${sectionId}`)
      .then((r) => r.data.message),

  reorder: (
    courseId: string,
    sectionIds: string[],
  ): Promise<SectionResponse[]> =>
    api
      .patch<{
        status: "success";
        data: { sections: SectionResponse[] };
      }>(`/courses/${courseId}/sections/reorder`, { sectionIds })
      .then((r) => r.data.data.sections),
};
