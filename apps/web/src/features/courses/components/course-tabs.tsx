"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import type { CourseResponse, LessonResponse } from "@learnify/shared";
import { Lock, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseLessons } from "@/features/lessons";

type TabId = "overview" | "curriculum" | "instructor";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "instructor", label: "Instructor" },
];

const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function CourseTabs({
  course,
  onSelect,
}: {
  course: CourseResponse;
  onSelect?: (lesson: LessonResponse) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <section className="py-10 sm:py-14">
      {/* Tabs nav */}
      <div role="tablist" aria-label="Course sections" className="flex gap-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="mt-8 w-full max-w-3xl"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "overview" && <Overview course={course} />}
        {activeTab === "curriculum" && <Curriculum course={course} onSelect={onSelect} />}
        {activeTab === "instructor" && <Instructor course={course} />}
      </div>
    </section>
  );
}

function Overview({ course }: { course: CourseResponse }) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl">About this course</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {course.description ??
            "The instructor hasn't added a description yet. Check back soon."}
        </p>
      </div>

      {course.whatYouWillLearn.length > 0 && (
        <div>
          <h2 className="font-display text-2xl">What you&rsquo;ll learn</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {course.whatYouWillLearn.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="flex items-start gap-2 text-[15px] leading-6"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {course.prerequisites.length > 0 && (
        <div>
          <h2 className="font-display text-2xl">Prerequisites</h2>
          <ul className="mt-4 space-y-2">
            {course.prerequisites.map((item, i) => (
              <li key={`${item}-${i}`} className="text-[15px] text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Curriculum({
  course,
  onSelect,
}: {
  course: CourseResponse;
  onSelect?: (lesson: LessonResponse) => void;
}) {
  const { data, isLoading } = useCourseLessons(course._id);
  const lessons = data?.lessons ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <EmptyState
        title="Curriculum is being prepared"
        description="The instructor hasn't published the lesson list yet."
      />
    );
  }

  return (
    <div>
      <p className="font-mono text-xs text-muted-foreground">
        {plural(lessons.length, "lesson")} ·{" "}
        {formatDuration(data?.totalDuration ?? 0)}
        {!data?.hasAccess && " · previews only"}
      </p>

      <ol className="mt-6 divide-y divide-border border-y border-border">
        {lessons.map((lesson, index) => (
          <li key={lesson._id}>
            <button
              type="button"
              onClick={() => onSelect?.(lesson)}
              className={cn(
                "flex w-full items-start gap-3 py-4 text-left transition-colors sm:items-center sm:gap-4",
                lesson.locked
                  ? "cursor-pointer opacity-90 hover:opacity-100"
                  : "hover:text-primary",
              )}
            >
              <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-muted-foreground sm:w-8 sm:pt-0">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-start gap-2 font-medium">
                  {lesson.locked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span
                    className={cn(
                      "break-words",
                      lesson.locked ? "text-muted-foreground" : "",
                    )}
                  >
                    {lesson.title}
                  </span>
                </span>
                {!lesson.locked && lesson.description && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {lesson.description}
                  </span>
                )}
              </span>

              <span className="flex shrink-0 flex-col items-end gap-1 text-right text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                {!lesson.locked && lesson.isPreview && (
                  <span className="whitespace-nowrap font-medium text-primary">
                    free preview
                  </span>
                )}
                <span className="whitespace-nowrap">{lesson.duration} min</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {!data?.hasAccess && (
        <p className="mt-5 text-sm text-muted-foreground">
          Enroll to unlock all {plural(lessons.length, "lesson")} — previews
          above are free for everyone.
        </p>
      )}
    </div>
  );
}

function Instructor({ course }: { course: CourseResponse }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">Meet your instructor</h2>
      <div className="rounded-md border border-border p-6">
        <p className="font-display text-xl">{course.instructor.name}</p>
        <p className="text-sm text-muted-foreground">
          {course.instructor.email}
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Instructor bio coming soon.
        </p>
      </div>
    </div>
  );
}
