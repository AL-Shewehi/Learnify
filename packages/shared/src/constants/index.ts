export const USER_ROLES = ["student", "instructor", "admin"] as const;
export const COURSE_STATUSES = ["published", "draft", "archived"] as const;
export const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const ENROLLMENT_STATUSES = ["active", "completed", "dropped"] as const;

export const COURSE_SUBJECTS = [
  "Programming",
  "Design",
  "Business",
  "Data",
  "Writing",
  "Marketing",
  "Photography",
  "Music",
  "Health",
  "Personal Development",
  "Education",
] as const;

export type CourseSubject = (typeof COURSE_SUBJECTS)[number];
