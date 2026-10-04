"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  COURSE_LEVELS,
  COURSE_SUBJECTS,
  createCourseSchema,
  type CourseResponse,
  type CreateCourseInput,
} from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";

const LEVEL_OPTIONS = COURSE_LEVELS.map((l) => ({
  value: l,
  label: l.charAt(0).toUpperCase() + l.slice(1),
}));

const SUBJECT_OPTIONS = COURSE_SUBJECTS.map((s) => ({ value: s, label: s }));

interface Props {
  initial?: CourseResponse;
  onSubmit: (input: CreateCourseInput) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

export function CourseForm({
  initial,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: initial
      ? {
          title: initial.title,
          description: initial.description,
          coverImage: initial.coverImage,
          subject: initial.subject,
          level: initial.level,
          price: initial.price,
        }
      : { level: "beginner", subject: COURSE_SUBJECTS[0], price: 0 },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-md border border-border bg-card p-6"
    >
      <FormField<CreateCourseInput>
        name="title"
        label="Title"
        placeholder="e.g. Modern JavaScript: From Fundamentals to Async"
        register={register}
        errors={errors}
        required
      />

      <FormField<CreateCourseInput>
        name="description"
        label="Description"
        type="textarea"
        placeholder="What's this course about?"
        register={register}
        errors={errors}
      />

      <FormField<CreateCourseInput>
        name="coverImage"
        label="Cover image URL (optional)"
        type="url"
        placeholder="https://…"
        register={register}
        errors={errors}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField<CreateCourseInput>
          name="subject"
          label="Subject"
          type="select"
          options={SUBJECT_OPTIONS}
          register={register}
          control={control}
          errors={errors}
          required
        />
        <FormField<CreateCourseInput>
          name="level"
          label="Level"
          type="select"
          options={LEVEL_OPTIONS}
          register={register}
          control={control}
          errors={errors}
          required
        />
      </div>

      <FormField<CreateCourseInput>
        name="price"
        label="Price (USD)"
        type="number"
        placeholder="0 for free"
        register={register}
        errors={errors}
        required
      />

      <div className="flex gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}