"use client";

import { cn } from "@/lib/utils";
import { getEmbedInfo } from "@/lib/video";
import type { LessonResponse } from "@learnify/shared";

export function LessonMedia({
  lesson,
  bare = false,
}: {
  lesson: LessonResponse;
  /** Render without its own border/rounding when nested in an already-framed container. */
  bare?: boolean;
}) {
  const isArticle =
    lesson.type === "article" ||
    (!lesson.videoUrl && Boolean(lesson.articleBody?.trim()));

  if (isArticle) {
    if (!lesson.articleBody?.trim()) {
      return (
        <div
          className={cn(
            "flex aspect-video items-center justify-center text-sm text-muted-foreground",
            !bare && "rounded-md border border-dashed border-border",
          )}
        >
          No playable content yet
        </div>
      );
    }
    return (
      <article
        className={cn(
          "max-h-[60vh] overflow-y-auto whitespace-pre-line bg-card p-6 leading-7",
          !bare && "rounded-md border border-border",
        )}
      >
        {lesson.articleBody}
      </article>
    );
  }

  const embed = getEmbedInfo(lesson.videoUrl);
  if (!embed) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center text-sm text-muted-foreground",
          !bare && "rounded-md border border-dashed border-border",
        )}
      >
        No playable content yet
      </div>
    );
  }

  if (embed.kind === "file") {
    return (
      <video
        src={embed.src}
        controls
        className={cn(
          "aspect-video w-full bg-black",
          !bare && "rounded-md border border-border",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "aspect-video overflow-hidden",
        !bare && "rounded-md border border-border",
      )}
    >
      <iframe
        src={embed.src}
        title={lesson.title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}