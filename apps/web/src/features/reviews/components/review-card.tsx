"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui";
import { formatDate, getInitials } from "@/lib/format";
import type { ReviewResponse } from "@learnify/shared";
import { Stars } from "./stars";

function studentName(review: ReviewResponse): string {
  return typeof review.student === "string"
    ? "Student"
    : (review.student.name ?? "Student");
}

export function ReviewCard({
  review,
  canDelete,
  isPending,
  onDelete,
  isMine,
}: {
  review: ReviewResponse;
  canDelete: boolean;
  isPending?: boolean;
  onDelete: () => void;
  isMine?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = studentName(review);

  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold">{name}</p>
            {isMine && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Your review
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <Stars value={review.rating} className="mt-1.5" />
          {review.comment && (
            <p className="mt-2 break-words text-sm leading-6">{review.comment}</p>
          )}
        </div>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this review?"
        description="This can't be undone. The course rating will be recalculated."
        confirmText={isPending ? "Deleting…" : "Delete"}
        isPending={isPending}
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
      />
    </li>
  );
}
