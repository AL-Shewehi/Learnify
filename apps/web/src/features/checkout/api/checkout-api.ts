import { api } from "@/lib/api";
import type {
  CheckoutInput,
  CheckoutReceipt,
  EnrollmentResponse,
} from "@learnify/shared";

export const checkoutApi = {
  pay: (
    courseId: string,
    input: CheckoutInput,
  ): Promise<{ enrollment: EnrollmentResponse; receipt: CheckoutReceipt }> =>
    api
      .post<{
        status: "success";
        data: { enrollment: EnrollmentResponse; receipt: CheckoutReceipt };
      }>(`/courses/${courseId}/checkout`, input)
      .then((r) => r.data.data),
};
