import Link from "next/link";
import { Star, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { CourseCover } from "./course-cover";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useEnroll } from "@/features/enrollments";
import type { CourseResponse } from "@learnify/shared";

export function CourseHero({ course }: { course: CourseResponse }) {
  const { session, isLoading: authLoading } = useAuth();
  const enroll = useEnroll(course._id);

  const isOwner = session?._id === course.instructor._id;

  const isEnrolled =
    session?.role === "student" &&
    (course as CourseResponse & { isEnrolled?: boolean }).isEnrolled === true;

  const formatPrice = (p: number) =>
    p === 0 ? "Free" : `$${p.toLocaleString()}`;

  const publishedAt = new Date(course.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Cover */}
          <div className="overflow-hidden rounded-md border border-border shadow-[6px_6px_0_0_var(--color-border)]">
            <div className="relative aspect-16/10">
              <CourseCover course={course} />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {course.subject ?? "General"} · {course.level}
            </p>

            <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              {course.title}
            </h1>

            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              By
              <span className="font-medium text-foreground">
                {course.instructor.name}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {publishedAt}
              </span>
            </p>

            <div className="mt-5 flex items-center gap-5 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">
                  {course.rating.toFixed(1)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                {course.totalStudents.toLocaleString()} enrolled
              </span>
            </div>

            {/* Action block */}
            <div className="mt-8 border-t border-border pt-8">
              <p className="font-display text-3xl">
                {formatPrice(course.price)}
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {authLoading ? (
                  <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
                ) : !session ? (
                  <Button size="lg" asChild>
                    <Link href={`/signup?from=/courses/${course._id}`}>
                      Create an account to enroll
                    </Link>
                  </Button>
                ) : isOwner ? (
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/instructor/courses/${course._id}/edit`}>
                        Edit course
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/instructor/courses/${course._id}/students`}>
                        View students
                      </Link>
                    </Button>
                  </div>
                ) : isEnrolled ? (
                  <Button size="lg" asChild>
                    <Link href={`/my-learning/${course._id}`}>
                      Continue learning <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </Button>
                ) : session.role === "student" ? (
                  <Button
                    size="lg"
                    onClick={() => enroll.mutate()}
                    disabled={enroll.isPending}
                  >
                    {enroll.isPending
                      ? "Enrolling…"
                      : `Enroll in this course · ${formatPrice(course.price)}`}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Instructor accounts can&Apos;t enroll as students.
                  </p>
                )}

                {!session && (
                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href={`/login?from=/courses/${course._id}`}
                      className="font-medium underline underline-offset-4 hover:text-primary"
                    >
                      Log in
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
