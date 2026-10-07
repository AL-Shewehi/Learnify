import { CourseDetailsPage } from "@/features/courses";
import { Suspense } from "react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  try {
    const base =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";
    const res = await fetch(`${base}/api/v1/courses/${courseId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("not found");
    const json = await res.json();
    const course = json?.data?.course;
    if (!course?.title) throw new Error("no title");
    const description: string =
      course.description?.slice(0, 160) ?? "Course details on Learnify.";
    return {
      title: `${course.title}`,
      description,
      openGraph: {
        title: `${course.title} | Learnify`,
        description,
        images: course.coverImage ? [{ url: course.coverImage }] : undefined,
      },
    };
  } catch {
    return {
      title: `Course | Learnify`,
      description: "Course details on Learnify.",
    };
  }
}

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetails({ params }: Props) {
  const { courseId } = await params;
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="aspect-16/10 animate-pulse rounded-md bg-muted" />
            <div className="space-y-4">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-12 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      }
    >
      <CourseDetailsPage courseId={courseId} />
    </Suspense>
  );
}
