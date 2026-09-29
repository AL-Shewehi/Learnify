import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CourseResponse } from "@learnify/shared";
import { CourseCover } from "./course-cover";

export function CourseCard({ course }: { course: CourseResponse }) {
  return (
    <Card className="group overflow-hidden transition-colors hover:border-primary/50">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <CourseCover course={course} />
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 capitalize"
        >
          {course.level}
        </Badge>
      </div>
      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
          <Link href={`/courses/${course._id}`}>{course.title}</Link>
        </h3>

        <p className="text-sm text-muted-foreground">
          {course.instructor.name}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {course.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.totalStudents.toLocaleString()}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="text-lg font-semibold text-foreground">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {course.subject ?? "General"}
          </span>
        </div>
      </div>
    </Card>
  );
}
