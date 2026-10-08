import { describe, expect, it } from "vitest";
import { BASE, guest, session, signup } from "./helpers";

describe("Curriculum sections", () => {
  it("groups lessons, moves them, and preserves them on section delete", async () => {
    const instructor = session();
    await signup(instructor, { role: "instructor" });

    const course = await instructor.post(`${BASE}/courses`).send({
      title: "Sectioned Course",
      price: 0,
      level: "beginner",
      subject: "Programming",
    });
    expect(course.status).toBe(201);
    const courseId = course.body.data.course._id;

    // Two sections
    const s1 = await instructor
      .post(`${BASE}/courses/${courseId}/sections`)
      .send({ title: "Basics" });
    expect(s1.status).toBe(201);
    const s2 = await instructor
      .post(`${BASE}/courses/${courseId}/sections`)
      .send({ title: "Advanced" });
    expect(s2.status).toBe(201);
    expect(s2.body.data.section.order).toBe(2);

    // One lesson per section + one unsectioned
    const lessonBody = {
      type: "article",
      articleBody: "content here",
      duration: 5,
    };
    const l1 = await instructor
      .post(`${BASE}/courses/${courseId}/lessons`)
      .send({ ...lessonBody, title: "Lesson One", sectionId: s1.body.data.section._id });
    expect(l1.status).toBe(201);
    const l2 = await instructor
      .post(`${BASE}/courses/${courseId}/lessons`)
      .send({ ...lessonBody, title: "Lesson Two", sectionId: s2.body.data.section._id });
    expect(l2.status).toBe(201);
    const l3 = await instructor
      .post(`${BASE}/courses/${courseId}/lessons`)
      .send({ ...lessonBody, title: "Lesson Three" });
    expect(l3.status).toBe(201);

    await instructor.patch(`${BASE}/courses/${courseId}/publish`);

    // Grouped read keeps the flat list intact
    const curriculum = await guest().get(`${BASE}/courses/${courseId}/lessons`);
    expect(curriculum.status).toBe(200);
    expect(curriculum.body.data.lessons.length).toBe(3);
    expect(curriculum.body.data.sections.length).toBe(2);
    expect(curriculum.body.data.sections[0].lessons.length).toBe(1);
    expect(curriculum.body.data.sections[1].lessons[0].title).toBe("Lesson Two");

    // Standalone sections endpoint mirrors the grouped data
    const sectionList = await guest().get(
      `${BASE}/courses/${courseId}/sections`,
    );
    expect(sectionList.status).toBe(200);
    expect(sectionList.body.data.sections.length).toBe(2);
    expect(sectionList.body.data.sections[0].title).toBe("Basics");

    // Move a lesson across sections
    const moved = await instructor
      .patch(`${BASE}/lessons/${l1.body.data.lesson._id}`)
      .send({ sectionId: s2.body.data.section._id });
    expect(moved.status).toBe(200);

    const regrouped = await guest().get(`${BASE}/courses/${courseId}/lessons`);
    expect(regrouped.body.data.sections[0].lessons.length).toBe(0);
    expect(regrouped.body.data.sections[1].lessons.length).toBe(2);

    // Cross-course section is rejected
    const other = await instructor.post(`${BASE}/courses`).send({
      title: "Other Course",
      price: 0,
      level: "beginner",
      subject: "Programming",
    });
    const otherCourseId = other.body.data.course._id;
    // Same-course moves are accepted...
    const sameCourseMove = await instructor
      .patch(`${BASE}/lessons/${l2.body.data.lesson._id}`)
      .send({ sectionId: s1.body.data.section._id });
    expect(sameCourseMove.status).toBe(200);
    // ...but a section from another course is rejected
    const crossCourse = await instructor
      .post(`${BASE}/courses/${otherCourseId}/lessons`)
      .send({
        ...lessonBody,
        title: "Cross Lesson",
        sectionId: s1.body.data.section._id,
      });
    expect(crossCourse.status).toBe(400);

    // Deleting a section preserves its lessons as unsectioned
    const del = await instructor.delete(
      `${BASE}/sections/${s2.body.data.section._id}`,
    );
    expect(del.status).toBe(200);

    const afterDelete = await guest().get(
      `${BASE}/courses/${courseId}/lessons`,
    );
    expect(afterDelete.body.data.lessons.length).toBe(3);
    expect(afterDelete.body.data.sections.length).toBe(1);
  });

  it("reorders sections and blocks non-owners", async () => {
    const instructor = session();
    await signup(instructor, { role: "instructor" });

    const course = await instructor.post(`${BASE}/courses`).send({
      title: "Reorder Course",
      price: 0,
      level: "beginner",
      subject: "Programming",
    });
    const courseId = course.body.data.course._id;

    const a = await instructor
      .post(`${BASE}/courses/${courseId}/sections`)
      .send({ title: "Alpha" });
    const b = await instructor
      .post(`${BASE}/courses/${courseId}/sections`)
      .send({ title: "Beta" });

    const reorder = await instructor
      .patch(`${BASE}/courses/${courseId}/sections/reorder`)
      .send({
        sectionIds: [b.body.data.section._id, a.body.data.section._id],
      });
    expect(reorder.status).toBe(200);
    expect(reorder.body.data.sections[0].title).toBe("Beta");

    const student = session();
    await signup(student);
    const forbidden = await student
      .post(`${BASE}/courses/${courseId}/sections`)
      .send({ title: "Hack Section" });
    expect(forbidden.status).toBe(403);
  });
});
