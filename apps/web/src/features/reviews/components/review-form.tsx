"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import {
  createReviewSchema,
  type CreateReviewInput,
  type ReviewResponse,
} from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";
import { cn } from "@/lib/utils";
import { useReviewMutations } from "../hooks/use-reviews";

type FormInput = CreateReviewInput;

export function ReviewForm({
  courseId,
  existing,
}: {
  courseId: string;
  existing?: ReviewResponse | null;
}) {
  const { create, update } = useReviewMutations(courseId);
  const isEdit = Boolean(existing);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: existing?.rating ?? 0,
      comment: existing?.comment ?? "",
    },
  });

  const rating = useWatch({ control, name: "rating" }) ?? 0;

  const onSubmit = handleSubmit((input) => {
    if (isEdit && existing) {
      update.mutate({ reviewId: existing._id, input });
    } else {
      create.mutate({ rating: input.rating, comment: input.comment });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-border bg-card p-5"
    >
      <p className="font-display text-lg">
        {isEdit ? "Your review" : "Write a review"}
      </p>

      <div className="mt-4">
        <span
          id="review-rating-label"
          className="text-sm font-medium"
        >
          Rating
        </span>
        <div
          role="radiogroup"
          aria-labelledby="review-rating-label"
          className="mt-2 flex items-center gap-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setValue("rating", n, { shouldValidate: true })}
              className="rounded p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  n <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted",
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating?.message && (
          <p role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.rating.message}
          </p>
        )}
      </div>

      <div className="mt-4">
        <FormField<FormInput>
          name="comment"
          label="Comment (optional)"
          type="textarea"
          placeholder="What did you think of this course?"
          register={register}
          errors={errors}
        />
      </div>

      <Button type="submit" disabled={pending} className="mt-4">
        {pending
          ? isEdit
            ? "Saving…"
            : "Publishing…"
          : isEdit
            ? "Save changes"
            : "Publish review"}
      </Button>
    </form>
  );
}
