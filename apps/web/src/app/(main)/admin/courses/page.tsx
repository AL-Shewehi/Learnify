import { AdminCourses } from "@/features/admin";

export const metadata = { title: "Manage Courses | Learnify" };

export default function AdminCoursesPage() {
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Admin · catalog moderation
      </p>
      <h1 className="mt-2 mb-8 font-display text-4xl">Courses</h1>
      <AdminCourses />
    </>
  );
}