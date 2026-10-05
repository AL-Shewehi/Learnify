"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
  Video,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses";
import type { LessonResponse } from "@learnify/shared";
import { useCourseLessons, useLessonMutations } from "../hooks/use-lessons";
import { LessonForm } from "./lesson-form";

interface Props {
  courseId: string;
}

export function LessonsManager({ courseId }: Props) {
  const { data: course } = useCourse(courseId);
  const { data, isLoading } = useCourseLessons(courseId);
  const { create, update, remove, reorder } = useLessonMutations(courseId);

  const [form, setForm] = useState<
    { mode: "create" } | { mode: "edit"; lesson: LessonResponse } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const lessons = data?.lessons ?? [];

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= lessons.length) return;
    const ids = lessons.map((l) => l._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  };

  const closeForm = () => {
    setForm(null);
  };

  return (
    <div className=" mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Instructor · curriculum
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            {course?.title ?? "…"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {lessons.length} lessons ·{" "}
            {Math.round((data?.totalDuration ?? 0) / 60)}h{" "}
            {(data?.totalDuration ?? 0) % 60}m total
          </p>
        </div>

        {!form && (
          <Button onClick={() => setForm({ mode: "create" })}>
            <Plus className="mr-2 h-4 w-4" />
            Add lesson
          </Button>
        )}
      </div>

      {/* Form */}
      {form && (
        <div className="mt-8">
          <LessonForm
            courseId={courseId}
            initial={form.mode === "edit" ? form.lesson : undefined}
            isPending={create.isPending || update.isPending}
            onCreate={(input) => create.mutate(input, { onSuccess: closeForm })}
            onUpdate={(input) =>
              form.mode === "edit" &&
              update.mutate(
                { id: form.lesson._id, input },
                { onSuccess: closeForm },
              )
            }
            onCancel={closeForm}
          />
        </div>
      )}

      {/* List */}
      <div className="mt-10">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-md border border-dashed border-border py-16 text-center">
            <p className="font-display text-xl">No lessons yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A course without lessons is a promise without delivery. Add the
              first one.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-border border-y border-border">
            {lessons.map((lesson, index) => (
              <li key={lesson._id} className="flex items-center gap-4 py-4">
                <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {lesson.title}
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {lesson.type === "video" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {lesson.type}
                    </span>
                    <span>{lesson.duration} min</span>
                    {lesson.isPreview && (
                      <span className="flex items-center gap-1 text-primary">
                        <Eye className="h-3 w-3" />
                        free preview
                      </span>
                    )}
                  </span>
                </span>

                {/* Actions */}
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reorder.isPending}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === lessons.length - 1 || reorder.isPending}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setForm({ mode: "edit", lesson })}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {confirmDelete === lesson._id ? (
                    <>
                      <button
                        onClick={() =>
                          remove.mutate(lesson._id, {
                            onSuccess: () => setConfirmDelete(null),
                          })
                        }
                        className="rounded px-2 py-1 text-xs font-semibold text-destructive underline underline-offset-4"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded px-2 py-1 text-xs text-muted-foreground"
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(lesson._id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
