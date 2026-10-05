import { describe, expect, it } from "vitest";
import { BASE, guest, session, signup } from "./helpers";

describe("Course lifecycle", () => {
  it("runs the full loop : create, lesson, publish, enroll, complete", async () => {
    // Create an instructor and a course
    const instructor = session();
    await signup(instructor, { role: "instructor" });

    const course = await instructor.post(`${BASE}/courses`).send({
      title: "Test Course",
      price: 0,
      level: "beginner",
      subject: "Programming",
    });

    expect(course.status).toBe(201);
    const courseId = course.body.data.course._id;

    // Add a lesson to the course
    const lesson = await instructor
      .post(`${BASE}/courses/${courseId}/lessons`)
      .send({
        title: "Test Lesson",
        type: "video",
        videoUrl: "https://youtube.com/watch?v=test123",
        duration: 5,
      });
    expect(lesson.status).toBe(201);
    const lessonId = lesson.body.data.lesson._id;

    // Publish the course
    const publish = await instructor.patch(
      `${BASE}/courses/${courseId}/publish`,
    );
    expect(publish.status).toBe(200);

    // guest can view the course and lesson but has no access
    const guestLessons = await guest().get(
      `${BASE}/courses/${courseId}/lessons`,
    );
    expect(guestLessons.status).toBe(200);
    expect(guestLessons.body.data.hasAccess).toBe(false);

    // Enroll a student and complete the lesson
    const student = session();
    await signup(student);

    const enrolled = await student.post(`${BASE}/courses/${courseId}/enroll`);
    expect(enrolled.status).toBe(201);

    const complete = await student.post(`${BASE}/lessons/${lessonId}/complete`);
    expect(complete.status).toBe(200);
    expect(complete.body.data.progress).toBe(100);
    expect(complete.body.data.status).toBe("completed");
  });

  it("blocks a students from managing courses", async () => {
    const student = session();
    await signup(student);

    const res = await student.post(`${BASE}/courses/someid/lessons`).send({
      title: "Hack lesson",
      duration: 1,
      type: "article",
      articleBody: "x",
    });
    expect(res.status).toBe(403);
  });
});
