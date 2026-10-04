export type LessonType = "video" | "article";

export interface LessonResponse {
  _id: string;
  course: string;
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
  totalDuration: number;
  hasAccess: boolean;
}