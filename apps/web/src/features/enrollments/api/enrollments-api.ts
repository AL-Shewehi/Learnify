import { api } from "@/lib/api";
import type { EnrollmentResponse } from "@learnify/shared";

export const enrollmentsApi = {
  enroll: (courseId: string): Promise<EnrollmentResponse> =>
    api
      .post<{
        status: "success";
        data: { enrollment: EnrollmentResponse };
      }>(`/courses/${courseId}/enroll`, {})
      .then((r) => r.data.data.enrollment),
};
