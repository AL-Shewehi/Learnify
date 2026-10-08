import type { LessonResponse } from "./lesson.js";

export interface SectionResponse {
  _id: string;
  course: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionWithLessons extends SectionResponse {
  lessons: LessonResponse[];
}
