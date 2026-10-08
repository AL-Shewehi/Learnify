"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { createSectionSchema } from "@learnify/shared";
import { useCourseLessons } from "../hooks/use-lessons";
import { useSectionMutations } from "../hooks/use-sections";

export function SectionsManager({ courseId }: { courseId: string }) {
  const { data, isLoading } = useCourseLessons(courseId);
  const { create, update, remove, reorder } = useSectionMutations(courseId);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sections = data?.sections ?? [];
  const lessons = data?.lessons ?? [];
  const pending = create.isPending || update.isPending || remove.isPending;

  const countFor = (sectionId: string) =>
    lessons.filter(
      (l) => typeof l.section === "string" && l.section === sectionId,
    ).length;

  const submitCreate = () => {
    const parsed = createSectionSchema.safeParse({ title: title.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid title");
      return;
    }
    setError(null);
    create.mutate(parsed.data, {
      onSuccess: () => {
        setTitle("");
        setAdding(false);
      },
    });
  };

  const submitRename = (id: string) => {
    const parsed = createSectionSchema.safeParse({ title: title.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid title");
      return;
    }
    setError(null);
    update.mutate(
      { id, input: parsed.data },
      {
        onSuccess: () => {
          setTitle("");
          setEditingId(null);
        },
      },
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const ids = sections.map((s) => s._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setTitle(currentTitle);
    setError(null);
    setAdding(false);
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setTitle("");
    setError(null);
  };

  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Instructor · sections
          </p>
          <h2 className="mt-2 font-display text-2xl">Sections</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Group lessons into modules. Deleting a section keeps its lessons.
          </p>
        </div>

        {!adding && !editingId && (
          <Button
            variant="outline"
            onClick={() => {
              setAdding(true);
              setTitle("");
              setError(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add section
          </Button>
        )}
      </div>

      {(adding || editingId) && (
        <div className="mt-4 rounded-md border border-border bg-card p-4">
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Getting started"
              aria-label={editingId ? "Section title" : "New section title"}
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (editingId) submitRename(editingId);
                  else submitCreate();
                }
              }}
            />
            <Button
              disabled={pending}
              onClick={() => {
                if (editingId) submitRename(editingId);
                else submitCreate();
              }}
            >
              {editingId ? "Save" : "Add"}
            </Button>
            <Button variant="ghost" size="icon" onClick={cancel} aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sections.length === 0 && !adding ? (
          <div className="rounded-md border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No sections yet — lessons live directly under the course until
              you add one.
            </p>
          </div>
        ) : (
          sections.length > 0 && (
            <ol className="divide-y divide-border border-y border-border">
              {sections.map((section, index) => (
                <li key={section._id} className="flex items-center gap-3 py-3">
                  <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {section.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {countFor(section._id)}{" "}
                      {countFor(section._id) === 1 ? "lesson" : "lessons"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || reorder.isPending}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                      aria-label="Move section up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={
                        index === sections.length - 1 || reorder.isPending
                      }
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                      aria-label="Move section down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => startEditing(section._id, section.title)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Rename section"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {confirmDelete === section._id ? (
                      <>
                        <button
                          onClick={() =>
                            remove.mutate(section._id, {
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
                        onClick={() => setConfirmDelete(section._id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )
        )}
      </div>
    </div>
  );
}
