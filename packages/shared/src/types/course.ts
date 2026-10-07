import { COURSE_LEVELS, COURSE_STATUSES, type CourseSubject } from "../constants/index.js";

export type CourseStatus = (typeof COURSE_STATUSES)[number];
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export interface InstructorPreview {
  _id: string;
  name: string;
  email: string;
}

export interface CourseResponse {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  price: number;
  subject?: CourseSubject;
  status: CourseStatus;
  level: CourseLevel;
  language: string;
  duration: number;
  whatYouWillLearn: string[];
  prerequisites: string[];
  totalStudents: number;
  rating: number;
  ratingsCount: number;
  instructor: InstructorPreview;
  isEnrolled?: boolean;
  createdAt: string;
  updatedAt: string;
}

