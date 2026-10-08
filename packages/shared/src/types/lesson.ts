export type LessonType = "video" | "article";

import type { SectionWithLessons } from "./section.js";

export interface LessonResponse {
  _id: string;
  course: string;
  section?: string | null;
  title: string;
  description?: string;
  type: LessonType;
  videoUrl?: string;
  articleBody?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  locked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLessonsResponse {
  lessons: LessonResponse[];
  sections: SectionWithLessons[];
  totalDuration: number;
  hasAccess: boolean;
}