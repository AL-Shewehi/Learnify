import { describe, expect, it } from "vitest";
import { BASE, guest, session, signup } from "./helpers";

describe("reviews smoke", () => {
  it("enroll -> review -> duplicate 409 -> list -> update -> delete", async () => {
    const instructor = session();
    await signup(instructor, { role: "instructor" });
    const course = await instructor.post(`${BASE}/courses`).send({
      title: "Reviewable Course",
      price: 0,
      level: "beginner",
      subject: "Programming",
    });
    expect(course.status).toBe(201);
    const courseId = course.body.data.course._id;

    await instructor.patch(`${BASE}/courses/${courseId}/publish`);

    const student = session();
    await signup(student);
    const enrolled = await student.post(`${BASE}/courses/${courseId}/enroll`);
    expect(enrolled.status).toBe(201);

    // non-enrolled user cannot review
    const outsider = session();
    await signup(outsider);
    const forbidden = await outsider
      .post(`${BASE}/courses/${courseId}/reviews`)
      .send({ rating: 5 });
    expect(forbidden.status).toBe(403);

    const created = await student
      .post(`${BASE}/courses/${courseId}/reviews`)
      .send({ rating: 5, comment: "Excellent course" });
    expect(created.status).toBe(201);
    const reviewId = created.body.data.review._id;

    const dup = await student
      .post(`${BASE}/courses/${courseId}/reviews`)
      .send({ rating: 4 });
    expect(dup.status).toBe(409);

    const list = await guest().get(`${BASE}/courses/${courseId}/reviews`);
    expect(list.status).toBe(200);
    expect(list.body.data.reviews.length).toBe(1);
    expect(list.body.data.averageRating).toBe(5);
    expect(list.body.data.ratingsCount).toBe(1);

    const updated = await student
      .patch(`${BASE}/reviews/${reviewId}`)
      .send({ rating: 4 });
    expect(updated.status).toBe(200);

    const list2 = await guest().get(`${BASE}/courses/${courseId}/reviews`);
    expect(list2.body.data.averageRating).toBe(4);

    const mine = await student.get(`${BASE}/courses/${courseId}/my-review`);
    expect(mine.status).toBe(200);

    const del = await student.delete(`${BASE}/reviews/${reviewId}`);
    expect(del.status).toBe(200);

    const list3 = await guest().get(`${BASE}/courses/${courseId}/reviews`);
    expect(list3.body.data.ratingsCount).toBe(0);
    expect(list3.body.data.averageRating).toBe(0);
  });
});
