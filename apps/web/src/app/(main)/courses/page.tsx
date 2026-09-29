// app/(main)/courses/page.tsx
import { Suspense } from "react";
import { CoursesBrowser } from "@/features/courses";

export const metadata = {
  title: "Browse Courses | Learnify",
  description: "The full Learnify catalog — filter by subject, level, and price.",
};

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-14">
          <p className="font-mono text-xs text-muted-foreground">Loading the catalog…</p>
        </div>
      }
    >
      <CoursesBrowser />
    </Suspense>
  );
}