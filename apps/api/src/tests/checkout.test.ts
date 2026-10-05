import { expect, describe, it } from "vitest";
import { BASE, session, signup } from "./helpers";

const makePaidCourse = async (instructor: ReturnType<typeof session>) => {
  const res = await instructor.post(`${BASE}/courses`).send({
    title: "Paid Course",
    price: 100,
    level: "beginner",
    subject: "Programming",
  });
  await instructor.patch(`${BASE}/courses/${res.body.data.course._id}/publish`);
  return res.body.data.course._id as string;
};

describe("Checkout", () => {
  it("rejects direct enroll on a paid course", async () => {
    const instructor = session();
    await signup(instructor, { role: "instructor" });
    const courseId = await makePaidCourse(instructor);

    const student = session();
    await signup(student);

    const res = await student.post(`${BASE}/courses/${courseId}/enroll`);
    expect(res.status).toBe(402);
  });

  it("rejects a non-test card", async () => {
    const instructor = session();
    await signup(instructor, { role: "instructor" });
    const courseId = await makePaidCourse(instructor);

    const student = session();
    await signup(student);

    const res = await student
      .post(`${BASE}/courses/${courseId}/checkout`)
      .send({
        cardNumber: "1234 1234 1234 1234",
        cardHolder: "Test User",
        expirationDate: "12/30",
        cvc: "123",
      });
    expect(res.status).toBe(400);
  });

  it("completes a purchase with a test card", async () => {
    const instructor = session();
    await signup(instructor, { role: "instructor" });
    const courseId = await makePaidCourse(instructor);

    const student = session();
    await signup(student);

    const res = await student
      .post(`${BASE}/courses/${courseId}/checkout`)
      .send({
        cardNumber: "4242 4242 4242 4242",
        cardHolder: "Test User",
        expirationDate: "12/30",
        cvc: "123",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.receipt.status).toBe("succeeded");
    expect(res.body.data.receipt.amount).toBe(100);
  });
});
