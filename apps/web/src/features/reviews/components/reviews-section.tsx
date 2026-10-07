"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  CourseResponse,
  GetReviewsQueryInput,
  ReviewResponse,
} from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/features/courses";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useMyReview,
  useReviewMutations,
  useReviews,
} from "../hooks/use-reviews";
import { RatingSummary } from "./rating-summary";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";

type SortOption = GetReviewsQueryInput["sort"];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

function studentIdOf(review: ReviewResponse): string {
  return typeof review.student === "string"
    ? review.student
    : review.student._id;
}

export function ReviewsSection({ course }: { course: CourseResponse }) {
  const { session } = useAuth();
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const canReview =
    session?.role === "student" && course.isEnrolled === true;
  const myReviewQuery = useMyReview(course._id, canReview);
  const existing = myReviewQuery.data ?? null;

  const { data, isLoading, isError, refetch } = useReviews(course._id, {
    page,
    sort,
  });
  const { remove } = useReviewMutations(course._id);

  const reviews = data?.reviews ?? [];
  const average = data?.averageRating ?? course.rating;
  const count = data?.ratingsCount ?? course.ratingsCount;
  const totalPages = data?.pagination.totalPages ?? 0;

  const changeSort = (value: string) => {
    setSort(value as SortOption);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <RatingSummary average={average} count={count} />

      {canReview ? (
        myReviewQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ReviewForm
            key={existing?._id ?? "new"}
            courseId={course._id}
            existing={existing}
          />
        )
      ) : !session ? (
        <div className="rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Enroll in this course to share your review.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/login?from=/courses/${course._id}`}>Log in</Link>
          </Button>
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-xl">
            {count === 0 ? "Reviews" : `${count} review${count === 1 ? "" : "s"}`}
          </h3>
          <Select value={sort} onValueChange={changeSort}>
            <SelectTrigger aria-label="Sort reviews" className="w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-5">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Couldn't load reviews"
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          ) : reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Be the first enrolled student to share what you think."
            />
          ) : (
            <>
              <ol className="divide-y divide-border border-y border-border">
                {reviews.map((review) => {
                  const mine =
                    session?._id !== undefined &&
                    studentIdOf(review) === session._id;
                  return (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      isMine={mine}
                      canDelete={mine || session?.role === "admin"}
                      isPending={remove.isPending}
                      onDelete={() => remove.mutate(review._id)}
                    />
                  );
                })}
              </ol>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
